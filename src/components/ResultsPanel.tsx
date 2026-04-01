import { useState } from 'react'
import { motion } from 'framer-motion'
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts'
import type { TestResult, UseCaseGrade } from '../types'
import { getSpeedScore, estimatePercentile, getBufferbloatGrade } from '../utils/speedTest'
import { providers } from '../data/providers'
import { AdBanner } from './AdBanner'

interface ResultsPanelProps {
  result: TestResult
  onRetest: () => void
  onCompare: () => void
}

function fmt(n: number) {
  return n >= 100 ? Math.round(n) : Number(n.toFixed(1))
}

function calcStats(samples: Array<{ t: number; mbps: number }>) {
  const sorted = [...samples].sort((a, b) => a.mbps - b.mbps)
  const n = sorted.length
  const min = sorted[0].mbps
  const max = sorted[n - 1].mbps
  const median = n % 2 === 0
    ? (sorted[n / 2 - 1].mbps + sorted[n / 2].mbps) / 2
    : sorted[Math.floor(n / 2)].mbps
  const p90 = sorted[Math.floor(n * 0.9)].mbps
  return { min, median, p90, max }
}

function gradeUseCases(result: TestResult): UseCaseGrade[] {
  const { download, upload, ping, jitter } = result
  const dl = fmt(download)
  const ul = fmt(upload)
  return [
    {
      label: '4K Streaming',
      icon: '📺',
      // Netflix 4K: 25 Mbps min; 4K HDR: 50 Mbps recommended
      pass: download >= 25,
      reason: download >= 50
        ? `${dl} Mbps — excellent for 4K HDR on multiple screens`
        : download >= 25
        ? `${dl} Mbps — sufficient for 4K (50+ Mbps for HDR/multiple screens)`
        : `Need ≥25 Mbps for 4K; got ${dl} Mbps`,
    },
    {
      label: 'Online Gaming',
      icon: '🎮',
      // Industry standard: ping ≤50ms, jitter ≤20ms, download ≥3 Mbps
      pass: ping <= 50 && jitter <= 20 && download >= 3,
      reason: ping <= 50 && jitter <= 20
        ? `${ping}ms ping, ${jitter}ms jitter — low lag for online gaming`
        : ping > 50
        ? `Ping ${ping}ms is above the ≤50ms threshold for smooth gaming`
        : `Jitter ${jitter}ms is above the ≤20ms threshold — may cause lag spikes`,
    },
    {
      label: 'HD Video Calls',
      icon: '📹',
      // Zoom HD: 3.8 Mbps up/down; Teams HD: 4 Mbps up/down
      pass: download >= 4 && upload >= 3.8 && jitter <= 30,
      reason: download >= 4 && upload >= 3.8
        ? `${dl}↓ / ${ul}↑ Mbps — supports HD calls (Zoom, Teams, Meet)`
        : upload < 3.8
        ? `Upload ${ul} Mbps is low; HD calls need ≥3.8 Mbps up`
        : `Need ≥4↓ / ≥3.8↑ Mbps for HD calls; got ${dl}↓ / ${ul}↑`,
    },
    {
      label: 'Remote Work',
      icon: '💼',
      // Cloud apps, file sync, occasional large uploads
      pass: download >= 25 && upload >= 10,
      reason: download >= 25 && upload >= 10
        ? `${dl}↓ / ${ul}↑ Mbps — solid for cloud apps and large file uploads`
        : upload < 10
        ? `Upload ${ul} Mbps is limiting; WFH benefits from ≥10 Mbps up`
        : `Need ≥25↓ / ≥10↑ Mbps for full WFH productivity; got ${dl}↓ / ${ul}↑`,
    },
    {
      label: 'Smart Home (10+ devices)',
      icon: '🏠',
      // Each smart device uses ~2–5 Mbps; 10 devices = ~50 Mbps buffer
      pass: download >= 50,
      reason: download >= 100
        ? `${dl} Mbps comfortably handles 10+ simultaneous devices`
        : download >= 50
        ? `${dl} Mbps — sufficient for typical smart home usage`
        : `${dl} Mbps may struggle when many devices are active simultaneously`,
    },
  ]
}

function getTip(result: TestResult): string {
  const { download, upload, ping, jitter } = result
  if (jitter > 30) return '⚡ High jitter detected. Try connecting via Ethernet cable for a more stable connection.'
  if (ping > 100) return '🌐 High latency. You may be far from your ISP\'s nearest server, or router congestion is present.'
  if (upload < 5) return '📤 Low upload speed. If you\'re on fiber or cable, try restarting your router/modem.'
  if (download < 25) return '📶 Speeds look low. Check if other devices are using bandwidth, or try moving closer to your router.'
  if (download >= 500) return '🚀 Blazing fast connection! You\'re in the top tier globally.'
  return '✅ Your connection looks healthy for everyday use.'
}

function ImprovementCard({ provider, userDownload, userUpload, userPing }: {
  provider: typeof providers[0]
  userDownload: number
  userUpload: number
  userPing: number
}) {
  const effectiveDl = Math.round(provider.download * 0.8)
  const effectiveUl = Math.round(provider.upload * 0.8)

  const dlGain = effectiveDl - userDownload
  const ulGain = effectiveUl - userUpload
  const pingGain = userPing - provider.ping

  const dlPct = Math.round((dlGain / userDownload) * 100)
  const ulPct = Math.round((ulGain / userUpload) * 100)
  const pingPct = Math.round((pingGain / userPing) * 100)

  const hasDlImprovement = dlGain > 0
  const hasUlImprovement = ulGain > 0
  const hasPingImprovement = pingGain > 0

  function fmt(n: number): string {
    if (Math.abs(n) >= 1000) return `${(n / 1000).toFixed(1)}G`
    return String(Math.abs(Math.round(n)))
  }

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="mb-3">
        <p className="font-bold text-white">{provider.name}</p>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{provider.tagline}</p>
      </div>

      {/* Live speed numbers */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div>
          <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Download</p>
          <p className="font-semibold text-sm">
            <span style={{ color: '#22d3ee' }}>{effectiveDl >= 1000 ? (effectiveDl / 1000).toFixed(1) : effectiveDl}</span>
            <span className="text-xs ml-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{effectiveDl >= 1000 ? 'G' : 'M'}</span>
          </p>
        </div>
        <div>
          <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Upload</p>
          <p className="font-semibold text-sm">
            <span style={{ color: '#34d399' }}>{effectiveUl}</span>
            <span className="text-xs ml-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>M</span>
          </p>
        </div>
        <div>
          <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Ping</p>
          <p className="font-semibold text-sm">
            <span style={{ color: '#fbbf24' }}>{provider.ping}</span>
            <span className="text-xs ml-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>ms</span>
          </p>
        </div>
      </div>

      {/* Estimated improvements */}
      <div
        className="rounded-xl p-3 mb-4"
        style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)' }}
      >
        <p className="text-xs font-bold mb-2 flex items-center gap-1.5" style={{ color: '#34d399' }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
          ESTIMATED IMPROVEMENTS
        </p>
        <div className="grid grid-cols-3 gap-2 mb-2">
          <div>
            {hasDlImprovement ? (
              <>
                <p className="text-sm font-bold" style={{ color: '#34d399' }}>+{dlPct}%</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{fmt(dlGain)} Mbps</p>
              </>
            ) : (
              <p className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.25)' }}>—</p>
            )}
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Download</p>
          </div>
          <div>
            {hasUlImprovement ? (
              <>
                <p className="text-sm font-bold" style={{ color: '#34d399' }}>+{ulPct}%</p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{fmt(ulGain)} Mbps</p>
              </>
            ) : (
              <p className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.25)' }}>—</p>
            )}
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Upload</p>
          </div>
          <div>
            {hasPingImprovement ? (
              <>
                <p className="text-sm font-bold flex items-center gap-0.5" style={{ color: '#34d399' }}>
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2.5">
                    <polyline points="17 11 12 6 7 11" /><line x1="12" y1="18" x2="12" y2="6" />
                  </svg>
                  -{pingPct}%
                </p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{pingGain} ms</p>
              </>
            ) : (
              <p className="text-sm font-bold" style={{ color: 'rgba(255,255,255,0.25)' }}>—</p>
            )}
            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Ping</p>
          </div>
        </div>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)', lineHeight: 1.4 }}>
          Based on 80% of advertised speeds vs. your {userDownload} Mbps result.
        </p>
      </div>

      {/* Pros */}
      <div className="space-y-1.5 mb-4">
        {provider.pros.map((pro) => (
          <div key={pro} className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#34d399" strokeWidth="1.5" />
              <path d="M8 12l3 3 5-5" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {pro}
          </div>
        ))}
      </div>

      {/* Price + CTA */}
      <a
        href={provider.affiliateUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="flex items-center justify-between"
      >
        <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.45)' }}>
          from <span className="text-white">${provider.price}</span>/mo
        </span>
        <span className="flex items-center gap-1 text-sm font-semibold" style={{ color: '#22d3ee' }}>
          View Deal
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
          </svg>
        </span>
      </a>
    </div>
  )
}

export function ResultsPanel({ result, onRetest, onCompare }: ResultsPanelProps) {
  const grades = gradeUseCases(result)
  const tip = getTip(result)
  const passed = grades.filter(g => g.pass).length
  const scoreData = getSpeedScore(result)
  const [copied, setCopied] = useState(false)

  // Filter providers where at least download OR upload improves
  const fasterProviders = providers.filter(p =>
    p.download * 0.8 > result.download || p.upload * 0.8 > result.upload
  ).slice(0, 3)

  async function handleShare() {
    const text =
      `My internet speed:\n` +
      `⬇ Download: ${fmt(result.download)} Mbps\n` +
      `⬆ Upload: ${fmt(result.upload)} Mbps\n` +
      `⏱ Ping: ${result.ping} ms\n` +
      `📊 Speed Score: ${scoreData.score}/100 (${scoreData.label})\n\n` +
      `Test yours at showmyspeed.com`

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: 'My Speed Test Results', text })
        return
      } catch { /* user cancelled — fall through to clipboard */ }
    }
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Speed Score */}
      <motion.div
        className="flex flex-col items-center gap-3"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="relative" style={{ width: 112, height: 112 }}>
          <svg width="112" height="112" viewBox="0 0 112 112">
            <circle cx="56" cy="56" r="46" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="9" />
            <circle
              cx="56" cy="56" r="46"
              fill="none"
              stroke={scoreData.color}
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 46}`}
              strokeDashoffset={`${2 * Math.PI * 46 * (1 - scoreData.score / 100)}`}
              transform="rotate(-90 56 56)"
              style={{ filter: `drop-shadow(0 0 8px ${scoreData.color}80)` }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono font-bold" style={{ fontSize: 28, color: scoreData.color, lineHeight: 1 }}>
              {scoreData.score}
            </span>
          </div>
        </div>
        <div className="text-center">
          <p className="font-bold text-lg leading-none" style={{ color: scoreData.color }}>{scoreData.label}</p>
          <p className="text-xs mt-1 font-mono uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>Connection Score</p>
        </div>
      </motion.div>

      {/* Hero speed numbers */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {[
          { label: 'Download', value: result.download, unit: 'Mbps', color: '#22d3ee', pct: estimatePercentile(result.download, 'download') },
          { label: 'Upload',   value: result.upload,   unit: 'Mbps', color: '#818cf8', pct: estimatePercentile(result.upload,   'upload')   },
          { label: 'Ping',     value: result.ping,     unit: 'ms',   color: '#34d399', pct: null },
          { label: 'Jitter',   value: result.jitter,   unit: 'ms',   color: '#fbbf24', pct: null },
        ].map(({ label, value, unit, color, pct }) => (
          <div
            key={label}
            className="rounded-2xl p-4 flex flex-col items-center justify-center gap-1"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <p className="text-xs font-mono uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {label}
            </p>
            <p className="font-mono font-bold leading-none tabular-nums" style={{ fontSize: 32, color }}>
              {value >= 100 ? Math.round(value) : value.toFixed(1)}
            </p>
            <p className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>{unit}</p>
            {pct !== null && (
              <p className="text-xs mt-0.5" style={{ color: 'rgba(34,211,238,0.5)' }}>
                Top {100 - pct}%
              </p>
            )}
          </div>
        ))}
      </motion.div>

      {/* Score header */}
      <div className="text-center">
        <p className="text-sm font-mono uppercase tracking-widest text-white/30 mb-1">Use-case score</p>
        <p className="font-mono font-bold text-4xl text-white">
          {passed}<span className="text-white/30 font-normal">/{grades.length}</span>
        </p>
      </div>

      {/* Use-case grades */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {grades.map((g, i) => (
          <motion.div
            key={g.label}
            className="rounded-xl border p-4 flex items-start gap-3"
            style={{
              background: g.pass ? 'rgba(52,211,153,0.05)' : 'rgba(239,68,68,0.05)',
              borderColor: g.pass ? 'rgba(52,211,153,0.2)' : 'rgba(239,68,68,0.15)',
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <span className="text-xl leading-none mt-0.5">{g.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-sm text-white">{g.label}</span>
                <span className="text-xs font-mono font-bold shrink-0" style={{ color: g.pass ? '#34d399' : '#f87171' }}>
                  {g.pass ? 'PASS' : 'FAIL'}
                </span>
              </div>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{g.reason}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Connection Analysis */}
      {(result.downloadSamples && result.downloadSamples.length >= 2) && (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <h3 className="font-bold text-white">Connection Analysis</h3>

          {/* Speed Stability Chart */}
          <div
            className="rounded-2xl p-4"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <p className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Speed Over Time
            </p>
            <div style={{ height: 120 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="dl-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="ul-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <YAxis hide domain={[0, 'auto']} />
                  <Area
                    data={result.downloadSamples}
                    type="monotone"
                    dataKey="mbps"
                    name="Download"
                    stroke="#22d3ee"
                    strokeWidth={1.5}
                    fill="url(#dl-grad)"
                    dot={false}
                    isAnimationActive={false}
                  />
                  {result.uploadSamples && result.uploadSamples.length >= 2 && (
                    <Area
                      data={result.uploadSamples}
                      type="monotone"
                      dataKey="mbps"
                      name="Upload"
                      stroke="#818cf8"
                      strokeWidth={1.5}
                      fill="url(#ul-grad)"
                      dot={false}
                      isAnimationActive={false}
                    />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 mt-2">
              <span className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                <span className="inline-block w-3 h-0.5 rounded" style={{ background: '#22d3ee' }} />
                Download
              </span>
              {result.uploadSamples && result.uploadSamples.length >= 2 && (
                <span className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  <span className="inline-block w-3 h-0.5 rounded" style={{ background: '#818cf8' }} />
                  Upload
                </span>
              )}
            </div>
          </div>

          {/* Statistics Row */}
          {result.downloadSamples.length >= 4 && (() => {
            const { min, median, p90, max } = calcStats(result.downloadSamples!)
            return (
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Min', value: min, note: 'Lowest burst' },
                  { label: 'Median', value: median, note: 'P50' },
                  { label: 'P90', value: p90, note: 'Typical max' },
                  { label: 'Max', value: max, note: 'Peak burst' },
                ].map(({ label, value, note }) => (
                  <div
                    key={label}
                    className="rounded-xl p-3 flex flex-col items-center gap-0.5"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    <p className="text-xs font-mono uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>{label}</p>
                    <p className="font-mono font-bold tabular-nums" style={{ fontSize: 18, color: '#22d3ee' }}>
                      {fmt(value)}
                    </p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>{note}</p>
                  </div>
                ))}
              </div>
            )
          })()}

          {/* Bufferbloat Grade */}
          {result.loadedPing != null && (() => {
            const { grade, color, label } = getBufferbloatGrade(result.ping, result.loadedPing!)
            const increase = Math.round(result.loadedPing! - result.ping)
            return (
              <div
                className="rounded-2xl p-4"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <p className="text-xs font-mono uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Bufferbloat
                </p>
                <div className="flex items-center gap-4">
                  <div
                    className="rounded-xl flex items-center justify-center font-mono font-bold shrink-0"
                    style={{ width: 56, height: 56, fontSize: 28, background: `${color}18`, border: `1px solid ${color}40`, color }}
                  >
                    {grade}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold" style={{ color }}>{label}</p>
                    <div className="flex gap-3 mt-1 text-xs font-mono flex-wrap" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      <span>Idle: {result.ping} ms</span>
                      <span>Under load: {Math.round(result.loadedPing!)} ms</span>
                      <span>Increase: +{increase} ms</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs mt-3" style={{ color: 'rgba(255,255,255,0.3)', lineHeight: 1.5 }}>
                  Low bufferbloat means your connection stays responsive even while uploading or downloading.
                </p>
              </div>
            )
          })()}
        </motion.div>
      )}

      {/* Ad slot between analysis and faster plans */}
      <AdBanner size="leaderboard" />

      {/* Tip */}
      <motion.div
        className="rounded-xl border p-4"
        style={{ background: 'rgba(34,211,238,0.04)', borderColor: 'rgba(34,211,238,0.15)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.6)' }}>{tip}</p>
      </motion.div>

      {/* ISP info */}
      {(result.isp || result.ip) && (
        <div className="flex flex-wrap gap-4 text-xs font-mono" style={{ color: 'rgba(255,255,255,0.25)' }}>
          {result.ip && <span>IP: {result.ip}</span>}
          {result.isp && <span>ISP: {result.isp}</span>}
          {result.city && <span>{result.city}{result.country ? `, ${result.country}` : ''}</span>}
        </div>
      )}

      {/* Faster plans section */}
      {fasterProviders.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-white">Faster Plans Available Near You</h2>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Compare top providers. Click any card to see current deals.
              </p>
            </div>
            <button
              onClick={onCompare}
              className="text-sm shrink-0 ml-4"
              style={{ color: '#22d3ee' }}
            >
              Full comparison →
            </button>
          </div>

          <div className="space-y-4">
            {fasterProviders.map((provider) => (
              <ImprovementCard
                key={provider.id}
                provider={provider}
                userDownload={result.download}
                userUpload={result.upload}
                userPing={result.ping}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col gap-3 pt-2">
        <button
          onClick={onRetest}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm transition-all"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 .49-4.95" />
          </svg>
          Run Another Test
        </button>
        <button
          onClick={handleShare}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-sm transition-all"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: copied ? '#34d399' : 'rgba(255,255,255,0.5)' }}
        >
          {copied ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Copied to clipboard!
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
              </svg>
              Share Results
            </>
          )}
        </button>
        <button
          onClick={onCompare}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all"
          style={{ background: '#22d3ee', color: '#050d1a' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#050d1a" strokeWidth="2.5">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
          Speed Up My Connection
        </button>
      </div>
    </motion.div>
  )
}
