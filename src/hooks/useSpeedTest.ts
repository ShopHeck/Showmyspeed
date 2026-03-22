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

export function useSpeedTest() {
  const [phase, setPhase] = useState<TestPhase>('idle')
  const [metrics, setMetrics] = useState<LiveMetrics>(initialMetrics)
  const [ipInfo, setIpInfo] = useState<IpInfo | null>(null)
  const [result, setResult] = useState<TestResult | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const start = useCallback(async () => {
    if (phase !== 'idle' && phase !== 'complete' && phase !== 'error') return

    // Reset state
    setMetrics(initialMetrics)
    setResult(null)
    abortRef.current = new AbortController()
    const signal = abortRef.current.signal

    try {
      // Fetch IP info in parallel with ping
      const ipPromise = fetchIpInfo()

      // --- Phase: ping ---
      setPhase('ping')
      const { ping, jitter } = await measurePing(10, (p, j) => {
        setMetrics(m => ({ ...m, ping: p, jitter: j }))
      })
      setMetrics(m => ({ ...m, ping, jitter }))

      if (signal.aborted) return

      // --- Phase: download ---
      setPhase('download')
      const download = await measureDownload(
        (mbps) => setMetrics(m => ({ ...m, download: mbps })),
        signal
      )
      setMetrics(m => ({ ...m, download }))

      if (signal.aborted) return

      // --- Phase: upload ---
      setPhase('upload')
      const upload = await measureUpload(
        (mbps) => setMetrics(m => ({ ...m, upload: mbps })),
        signal
      )
      setMetrics(m => ({ ...m, upload }))

      // Resolve IP info
      const info = await ipPromise
      if (info) setIpInfo(info)

      // --- Complete ---
      const testResult: TestResult = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        download,
        upload,
        ping,
        jitter,
        isp: info?.isp,
        ip: info?.ip,
        city: info?.city,
        country: info?.country,
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
  }, [])

  return { phase, metrics, ipInfo, result, start, stop, reset }
}
