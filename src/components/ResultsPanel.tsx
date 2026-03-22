import { motion } from 'framer-motion'
import type { TestResult, UseCaseGrade } from '../types'
import { generateShareCard } from '../utils/share'
import { providers } from '../data/providers'

interface ResultsPanelProps {
  result: TestResult
  onRetest: () => void
  onCompare: () => void
}

function gradeUseCases(result: TestResult): UseCaseGrade[] {
  const { download, upload, ping, jitter } = result
  return [
    {
      label: '4K Streaming',
      icon: '📺',
      pass: download >= 25,
      reason: download >= 25 ? `${download} Mbps download — plenty for 4K` : `Need ≥25 Mbps, got ${download} Mbps`,
    },
    {
      label: 'Online Gaming',
      icon: '🎮',
      pass: ping <= 50 && jitter <= 15 && download >= 10,
      reason: ping <= 50 && jitter <= 15 ? `${ping}ms ping, ${jitter}ms jitter — great` : `Ping: ${ping}ms, Jitter: ${jitter}ms (want ≤50ms / ≤15ms)`,
    },
    {
      label: 'Video Calls',
      icon: '📹',
      pass: download >= 10 && upload >= 3 && jitter <= 30,
      reason: download >= 10 && upload >= 3 ? `${download}↓ / ${upload}↑ Mbps — good for HD calls` : `Need ≥10 down / ≥3 up, got ${download}↓ / ${upload}↑`,
    },
    {
      label: 'Remote Work',
      icon: '💼',
      pass: download >= 25 && upload >= 10,
      reason: download >= 25 && upload >= 10 ? `${download}↓ / ${upload}↑ Mbps — solid for WFH` : `Need ≥25↓ / ≥10↑, got ${download}↓ / ${upload}↑`,
    },
    {
      label: 'Smart Home',
      icon: '🏠',
      pass: download >= 50,
      reason: download >= 50 ? `${download} Mbps handles multiple devices` : `Tight for many connected devices`,
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

  // Filter providers where at least download OR upload improves
  const fasterProviders = providers.filter(p =>
    p.download * 0.8 > result.download || p.upload * 0.8 > result.upload
  ).slice(0, 3)

  async function handleShare() {
    const dataUrl = await generateShareCard(result)
    const link = document.createElement('a')
    link.download = `showmyspeed-${Date.now()}.png`
    link.href = dataUrl
    link.click()
  }

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
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
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          Sign up to save this result →
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
