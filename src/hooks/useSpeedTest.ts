import { useState, useRef, useCallback } from 'react'
import type { TestPhase, TestResult, LiveMetrics, IpInfo } from '../types'
import { measurePing, measureDownload, measureUpload, fetchIpInfo } from '../utils/speedTest'
import { saveResult } from '../utils/storage'

const initialMetrics: LiveMetrics = {
  ping: 0,
  jitter: 0,
  download: 0,
  upload: 0,
}

export type LiveSample = { t: number; mbps: number; phase: 'download' | 'upload' }

export function useSpeedTest() {
  const [phase, setPhase] = useState<TestPhase>('idle')
  const [metrics, setMetrics] = useState<LiveMetrics>(initialMetrics)
  const [ipInfo, setIpInfo] = useState<IpInfo | null>(null)
  const [result, setResult] = useState<TestResult | null>(null)
  const [liveChartData, setLiveChartData] = useState<LiveSample[]>([])
  const abortRef = useRef<AbortController | null>(null)

  const start = useCallback(async () => {
    if (phase !== 'idle' && phase !== 'complete' && phase !== 'error') return

    // Reset state
    setMetrics(initialMetrics)
    setResult(null)
    setLiveChartData([])
    abortRef.current = new AbortController()
    const signal = abortRef.current.signal

    try {
      // Fetch IP info in parallel with ping
      const ipPromise = fetchIpInfo()

      // --- Phase: ping ---
      setPhase('ping')
      const { ping, jitter, rtts } = await measurePing(10, (p, j) => {
        setMetrics(m => ({ ...m, ping: p, jitter: j }))
      }, signal)
      setMetrics(m => ({ ...m, ping, jitter }))

      if (signal.aborted) return

      // --- Phase: download ---
      setPhase('download')
      const dlResult = await measureDownload(
        (mbps) => setMetrics(m => ({ ...m, download: mbps })),
        signal,
        (sample) => setLiveChartData(d => [...d, { ...sample, phase: 'download' }]),
      )
      setMetrics(m => ({ ...m, download: dlResult.mbps }))

      if (signal.aborted) return

      // --- Phase: upload ---
      // Non-fatal: if the upload endpoint is unreachable, complete with upload = 0
      setPhase('upload')
      let ulResult: { mbps: number; samples: Array<{ t: number; mbps: number }> } = { mbps: 0, samples: [] }
      try {
        ulResult = await measureUpload(
          (mbps) => setMetrics(m => ({ ...m, upload: mbps })),
          signal,
          (sample) => setLiveChartData(d => [...d, { ...sample, phase: 'upload' }]),
        )
      } catch (err) {
        console.warn('Upload test failed, continuing without upload data:', err)
      }
      setMetrics(m => ({ ...m, upload: ulResult.mbps }))

      // Resolve IP info
      const info = await ipPromise
      if (info) setIpInfo(info)

      // --- Complete ---
      const testResult: TestResult = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        download: dlResult.mbps,
        upload: ulResult.mbps,
        ping,
        jitter,
        isp: info?.isp,
        ip: info?.ip,
        city: info?.city,
        country: info?.country,
        downloadSamples: dlResult.samples,
        uploadSamples: ulResult.samples,
        pingRtts: rtts,
        loadedPing: dlResult.loadedPing,
      }

      setResult(testResult)
      saveResult(testResult)
      setPhase('complete')
    } catch (err) {
      if (signal.aborted) return
      console.error('Speed test error:', err)
      setPhase('error')
    }
  }, [phase])

  const stop = useCallback(() => {
    abortRef.current?.abort()
    setPhase('idle')
    setMetrics(initialMetrics)
  }, [])

  const reset = useCallback(() => {
    abortRef.current?.abort()
    setPhase('idle')
    setMetrics(initialMetrics)
    setResult(null)
    setLiveChartData([])
  }, [])

  return { phase, metrics, ipInfo, result, liveChartData, start, stop, reset }
}
