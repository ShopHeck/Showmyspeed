// Speed test implementation using Cloudflare's public speed test endpoints
// Download: https://speed.cloudflare.com/__down?bytes=N
// Upload:   https://speed.cloudflare.com/__up

const CF_BASE = 'https://speed.cloudflare.com'

/** Measure single RTT to Cloudflare (ms) */
async function measureRtt(): Promise<number> {
  const start = performance.now()
  await fetch(`${CF_BASE}/__down?bytes=0`, { cache: 'no-store' })
  return performance.now() - start
}

/** Measure ping (median RTT) and jitter (std dev) over N samples */
export async function measurePing(
  samples = 10,
  onProgress?: (ping: number, jitter: number) => void
): Promise<{ ping: number; jitter: number }> {
  const rtts: number[] = []

  for (let i = 0; i < samples; i++) {
    const rtt = await measureRtt()
    rtts.push(rtt)
    const sorted = [...rtts].sort((a, b) => a - b)
    const median = sorted[Math.floor(sorted.length / 2)]
    const mean = rtts.reduce((s, v) => s + v, 0) / rtts.length
    const jitter =
      rtts.length > 1
        ? Math.sqrt(rtts.reduce((s, v) => s + (v - mean) ** 2, 0) / rtts.length)
        : 0
    onProgress?.(Math.round(median), Math.round(jitter))
  }

  const sorted = [...rtts].sort((a, b) => a - b)
  const median = sorted[Math.floor(sorted.length / 2)]
  const mean = rtts.reduce((s, v) => s + v, 0) / rtts.length
  const jitter = Math.sqrt(rtts.reduce((s, v) => s + (v - mean) ** 2, 0) / rtts.length)

  return { ping: Math.round(median), jitter: Math.round(jitter) }
}

/** Download a chunk of N bytes and return measured throughput in Mbps */
async function downloadChunk(bytes: number): Promise<number> {
  const url = `${CF_BASE}/__down?bytes=${bytes}`
  const start = performance.now()
  const res = await fetch(url, { cache: 'no-store' })
  const buffer = await res.arrayBuffer()
  const elapsed = (performance.now() - start) / 1000 // seconds
  const bits = buffer.byteLength * 8
  return bits / elapsed / 1_000_000 // Mbps
}

/**
 * Multi-stage download test with real-time progress.
 * Stages: warm-up → 1 MB × 3 → 10 MB × 3 → 25 MB × 2
 */
export async function measureDownload(
  onProgress: (mbps: number) => void,
  signal?: AbortSignal
): Promise<number> {
  const stages: Array<{ bytes: number; runs: number }> = [
    { bytes: 100_000, runs: 2 },  // warm-up
    { bytes: 1_000_000, runs: 3 },
    { bytes: 10_000_000, runs: 3 },
    { bytes: 25_000_000, runs: 2 },
  ]

  const samples: number[] = []

  for (const stage of stages) {
    if (signal?.aborted) break
    for (let i = 0; i < stage.runs; i++) {
      if (signal?.aborted) break
      const mbps = await downloadChunk(stage.bytes)
      // Ignore warm-up samples (first stage)
      if (stage.bytes > 100_000) {
        samples.push(mbps)
        const avg = samples.reduce((s, v) => s + v, 0) / samples.length
        onProgress(Math.round(avg * 10) / 10)
      }
    }
  }

  if (samples.length === 0) return 0
  // Return 90th percentile to discard outliers
  const sorted = [...samples].sort((a, b) => a - b)
  const idx = Math.floor(sorted.length * 0.9)
  return Math.round(sorted[idx] * 10) / 10
}

/** Upload a blob and measure throughput in Mbps via XHR (supports progress) */
function uploadChunk(bytes: number, onProgress: (mbps: number) => void): Promise<number> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([new Uint8Array(bytes)])
    const xhr = new XMLHttpRequest()
    const start = performance.now()
    let lastLoaded = 0
    let lastTime = start

    xhr.upload.onprogress = (e) => {
      const now = performance.now()
      const dt = (now - lastTime) / 1000
      const dl = e.loaded - lastLoaded
      if (dt > 0.1 && dl > 0) {
        const mbps = (dl * 8) / dt / 1_000_000
        onProgress(Math.round(mbps * 10) / 10)
        lastLoaded = e.loaded
        lastTime = now
      }
    }

    xhr.onload = () => {
      const elapsed = (performance.now() - start) / 1000
      const mbps = (bytes * 8) / elapsed / 1_000_000
      resolve(Math.round(mbps * 10) / 10)
    }

    xhr.onerror = () => reject(new Error('Upload failed'))

    xhr.open('POST', `${CF_BASE}/__up`)
    xhr.setRequestHeader('Content-Type', 'application/octet-stream')
    xhr.send(blob)
  })
}

/**
 * Multi-stage upload test.
 * Stages: warm-up → 1 MB × 3 → 10 MB × 2
 */
export async function measureUpload(
  onProgress: (mbps: number) => void,
  signal?: AbortSignal
): Promise<number> {
  const stages: Array<{ bytes: number; runs: number }> = [
    { bytes: 100_000, runs: 1 },  // warm-up
    { bytes: 1_000_000, runs: 3 },
    { bytes: 5_000_000, runs: 2 },
  ]

  const samples: number[] = []

  for (const stage of stages) {
    if (signal?.aborted) break
    for (let i = 0; i < stage.runs; i++) {
      if (signal?.aborted) break
      const mbps = await uploadChunk(stage.bytes, onProgress)
      if (stage.bytes > 100_000) {
        samples.push(mbps)
        const avg = samples.reduce((s, v) => s + v, 0) / samples.length
        onProgress(Math.round(avg * 10) / 10)
      }
    }
  }

  if (samples.length === 0) return 0
  const sorted = [...samples].sort((a, b) => a - b)
  const idx = Math.floor(sorted.length * 0.9)
  return Math.round(sorted[idx] * 10) / 10
}

/** Fetch IP info from ip-api.com */
export async function fetchIpInfo() {
  try {
    const res = await fetch('https://ip-api.com/json/?fields=status,city,country,isp,org,query', {
      cache: 'no-store',
    })
    const data = await res.json()
    if (data.status === 'success') {
      return {
        ip: data.query as string,
        isp: (data.isp || data.org || 'Unknown') as string,
        city: data.city as string,
        country: data.country as string,
        org: data.org as string,
      }
    }
  } catch {
    // silently ignore
  }
  return null
}
