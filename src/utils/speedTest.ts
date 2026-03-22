// Speed test using Cloudflare's public speed test endpoints
const CF_BASE = 'https://speed.cloudflare.com'

/** Measure a single RTT; returns null on failure */
async function measureRtt(signal?: AbortSignal): Promise<number | null> {
  try {
    const start = performance.now()
    const res = await fetch(`${CF_BASE}/__down?bytes=0`, {
      cache: 'no-store',
      signal,
    })
    if (!res.ok) return null
    await res.arrayBuffer()
    return performance.now() - start
  } catch {
    return null
  }
}

/** Measure ping + jitter over N samples, skip failed requests */
export async function measurePing(
  samples = 6,
  onProgress?: (ping: number, jitter: number) => void,
  signal?: AbortSignal
): Promise<{ ping: number; jitter: number }> {
  const rtts: number[] = []

  for (let i = 0; i < samples; i++) {
    if (signal?.aborted) break
    const rtt = await measureRtt(signal)
    if (rtt == null) continue
    rtts.push(rtt)

    const sorted = [...rtts].sort((a, b) => a - b)
    const median = sorted[Math.floor(sorted.length / 2)]
    const mean = rtts.reduce((s, v) => s + v, 0) / rtts.length
    const jitter = rtts.length > 1
      ? Math.sqrt(rtts.reduce((s, v) => s + (v - mean) ** 2, 0) / rtts.length)
      : 0
    onProgress?.(Math.round(median), Math.round(jitter))
  }

  if (rtts.length === 0) throw new Error('Ping failed — cannot reach speed test server')

  const sorted = [...rtts].sort((a, b) => a - b)
  const median = sorted[Math.floor(sorted.length / 2)]
  const mean = rtts.reduce((s, v) => s + v, 0) / rtts.length
  const jitter = rtts.length > 1
    ? Math.sqrt(rtts.reduce((s, v) => s + (v - mean) ** 2, 0) / rtts.length)
    : 0

  return { ping: Math.round(median), jitter: Math.round(jitter) }
}

/** Download N bytes and return Mbps; returns null on failure */
async function downloadChunk(bytes: number, signal?: AbortSignal): Promise<number | null> {
  try {
    const url = `${CF_BASE}/__down?bytes=${bytes}`
    const start = performance.now()
    const res = await fetch(url, { cache: 'no-store', signal })
    if (!res.ok) return null
    const buffer = await res.arrayBuffer()
    const elapsed = (performance.now() - start) / 1000
    if (elapsed === 0) return null
    return (buffer.byteLength * 8) / elapsed / 1_000_000
  } catch {
    return null
  }
}

export async function measureDownload(
  onProgress: (mbps: number) => void,
  signal?: AbortSignal
): Promise<number> {
  const stages: Array<{ bytes: number; runs: number }> = [
    { bytes: 100_000, runs: 2 },   // warm-up
    { bytes: 1_000_000, runs: 3 },
    { bytes: 10_000_000, runs: 3 },
    { bytes: 25_000_000, runs: 2 },
  ]

  const samples: number[] = []

  for (const stage of stages) {
    if (signal?.aborted) break
    for (let i = 0; i < stage.runs; i++) {
      if (signal?.aborted) break
      const mbps = await downloadChunk(stage.bytes, signal)
      if (mbps == null) continue
      if (stage.bytes > 100_000) {
        samples.push(mbps)
        const avg = samples.reduce((s, v) => s + v, 0) / samples.length
        onProgress(Math.round(avg * 10) / 10)
      }
    }
  }

  if (samples.length === 0) throw new Error('Download test failed')
  const sorted = [...samples].sort((a, b) => a - b)
  return Math.round(sorted[Math.floor(sorted.length * 0.9)] * 10) / 10
}

/** Upload bytes and return Mbps; returns null on failure */
function uploadChunk(
  bytes: number,
  onProgress: (mbps: number) => void,
  signal?: AbortSignal
): Promise<number | null> {
  return new Promise((resolve) => {
    const blob = new Blob([new Uint8Array(bytes)])
    const xhr = new XMLHttpRequest()
    const start = performance.now()
    let lastLoaded = 0
    let lastTime = start

    // Abort support
    const onAbort = () => { xhr.abort(); resolve(null) }
    signal?.addEventListener('abort', onAbort, { once: true })

    xhr.upload.onprogress = (e) => {
      const now = performance.now()
      const dt = (now - lastTime) / 1000
      const dl = e.loaded - lastLoaded
      if (dt > 0.1 && dl > 0) {
        onProgress(Math.round((dl * 8) / dt / 1_000_000 * 10) / 10)
        lastLoaded = e.loaded
        lastTime = now
      }
    }

    xhr.onload = () => {
      signal?.removeEventListener('abort', onAbort)
      const elapsed = (performance.now() - start) / 1000
      resolve(elapsed > 0 ? Math.round((bytes * 8) / elapsed / 1_000_000 * 10) / 10 : null)
    }

    xhr.onerror = () => {
      signal?.removeEventListener('abort', onAbort)
      resolve(null)
    }

    xhr.ontimeout = () => {
      signal?.removeEventListener('abort', onAbort)
      resolve(null)
    }

    xhr.timeout = 30_000
    xhr.open('POST', `${CF_BASE}/__up`)
    xhr.setRequestHeader('Content-Type', 'application/octet-stream')
    xhr.send(blob)
  })
}

export async function measureUpload(
  onProgress: (mbps: number) => void,
  signal?: AbortSignal
): Promise<number> {
  const stages: Array<{ bytes: number; runs: number }> = [
    { bytes: 100_000, runs: 1 },
    { bytes: 1_000_000, runs: 3 },
    { bytes: 5_000_000, runs: 2 },
  ]

  const samples: number[] = []

  for (const stage of stages) {
    if (signal?.aborted) break
    for (let i = 0; i < stage.runs; i++) {
      if (signal?.aborted) break
      const mbps = await uploadChunk(stage.bytes, onProgress, signal)
      if (mbps == null) continue
      if (stage.bytes > 100_000) {
        samples.push(mbps)
        const avg = samples.reduce((s, v) => s + v, 0) / samples.length
        onProgress(Math.round(avg * 10) / 10)
      }
    }
  }

  if (samples.length === 0) throw new Error('Upload test failed')
  const sorted = [...samples].sort((a, b) => a - b)
  return Math.round(sorted[Math.floor(sorted.length * 0.9)] * 10) / 10
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
