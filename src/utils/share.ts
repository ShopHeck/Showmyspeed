import type { TestResult } from '../types'

/** Generate a shareable PNG card for the test result using Canvas API */
export async function generateShareCard(result: TestResult): Promise<string> {
  const W = 800
  const H = 420

  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#050d1a')
  bg.addColorStop(1, '#0a1628')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Grid pattern (faint dots)
  ctx.fillStyle = 'rgba(34,211,238,0.04)'
  for (let x = 0; x < W; x += 40) {
    for (let y = 0; y < H; y += 40) {
      ctx.beginPath()
      ctx.arc(x, y, 1, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Border glow
  ctx.strokeStyle = 'rgba(34,211,238,0.3)'
  ctx.lineWidth = 2
  roundRect(ctx, 1, 1, W - 2, H - 2, 16)
  ctx.stroke()

  // Header
  ctx.font = '700 32px Inter, sans-serif'
  ctx.fillStyle = '#22d3ee'
  ctx.fillText('ShowMySpeed.com', 48, 64)

  ctx.font = '400 16px Inter, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  const date = new Date(result.timestamp).toLocaleString()
  ctx.fillText(date, 48, 90)

  if (result.isp) {
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.fillText(`${result.isp}${result.city ? ` · ${result.city}` : ''}`, 48, 112)
  }

  // Divider
  ctx.strokeStyle = 'rgba(34,211,238,0.15)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(48, 130)
  ctx.lineTo(W - 48, 130)
  ctx.stroke()

  // Metric blocks
  const metrics = [
    { label: 'DOWNLOAD', value: fmt(result.download), unit: 'Mbps', color: '#22d3ee' },
    { label: 'UPLOAD', value: fmt(result.upload), unit: 'Mbps', color: '#818cf8' },
    { label: 'PING', value: String(result.ping), unit: 'ms', color: '#34d399' },
    { label: 'JITTER', value: String(result.jitter), unit: 'ms', color: '#fbbf24' },
  ]

  const colW = (W - 96) / 4
  metrics.forEach((m, i) => {
    const x = 48 + i * colW
    const centerX = x + colW / 2

    // Card background
    ctx.fillStyle = 'rgba(255,255,255,0.04)'
    roundRect(ctx, x + 8, 148, colW - 16, 160, 12)
    ctx.fill()

    // Label
    ctx.font = '600 11px JetBrains Mono, monospace'
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.textAlign = 'center'
    ctx.fillText(m.label, centerX, 178)

    // Value
    ctx.font = `700 ${m.value.length > 5 ? '36' : '44'}px JetBrains Mono, monospace`
    ctx.fillStyle = m.color
    ctx.fillText(m.value, centerX, 252)

    // Unit
    ctx.font = '400 14px Inter, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.fillText(m.unit, centerX, 280)
  })

  ctx.textAlign = 'left'

  // Footer
  ctx.font = '400 13px Inter, sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,0.2)'
  ctx.fillText('showmyspeed.com — Beautiful, accurate internet speed test', 48, H - 28)

  return canvas.toDataURL('image/png')
}

function fmt(mbps: number): string {
  if (mbps >= 1000) return (mbps / 1000).toFixed(1) + 'G'
  return mbps >= 100 ? Math.round(mbps).toString() : mbps.toFixed(1)
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}
