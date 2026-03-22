import { motion } from 'framer-motion'
import type { TestResult, UseCaseGrade } from '../types'
import { generateShareCard } from '../utils/share'

interface ResultsPanelProps {
  result: TestResult
  onRetest: () => void
}

function gradeUseCases(result: TestResult): UseCaseGrade[] {
  const { download, upload, ping, jitter } = result
  return [
    {
      label: '4K Streaming',
      icon: '📺',
      pass: download >= 25,
      reason: download >= 25
        ? `${download} Mbps download — plenty for 4K`
        : `Need ≥25 Mbps, got ${download} Mbps`,
    },
    {
      label: 'Online Gaming',
      icon: '🎮',
      pass: ping <= 50 && jitter <= 15 && download >= 10,
      reason:
        ping <= 50 && jitter <= 15
          ? `${ping}ms ping, ${jitter}ms jitter — great`
          : `Ping: ${ping}ms, Jitter: ${jitter}ms (want ≤50ms / ≤15ms)`,
    },
    {
      label: 'Video Calls',
      icon: '📹',
      pass: download >= 10 && upload >= 3 && jitter <= 30,
      reason:
        download >= 10 && upload >= 3
          ? `${download}↓ / ${upload}↑ Mbps — good for HD calls`
          : `Need ≥10 down / ≥3 up, got ${download}↓ / ${upload}↑`,
    },
    {
      label: 'Remote Work',
      icon: '💼',
      pass: download >= 25 && upload >= 10,
      reason:
        download >= 25 && upload >= 10
          ? `${download}↓ / ${upload}↑ Mbps — solid for WFH`
          : `Need ≥25↓ / ≥10↑, got ${download}↓ / ${upload}↑`,
    },
    {
      label: 'Smart Home',
      icon: '🏠',
      pass: download >= 50,
      reason:
        download >= 50
          ? `${download} Mbps handles multiple devices`
          : `Tight for many connected devices`,
    },
  ]
}

function getTip(result: TestResult): string {
  const { download, upload, ping, jitter } = result
  if (jitter > 30)
    return '⚡ High jitter detected. Try connecting via Ethernet cable for a more stable connection.'
  if (ping > 100)
    return '🌐 High latency. You may be far from your ISP\'s nearest server, or router congestion is present.'
  if (upload < 5)
    return '📤 Low upload speed. If you\'re on fiber or cable, try restarting your router/modem.'
  if (download < 25)
    return '📶 Speeds look low. Check if other devices are using bandwidth, or try moving closer to your router.'
  if (download >= 500)
    return '🚀 Blazing fast connection! You\'re in the top tier globally.'
  return '✅ Your connection looks healthy for everyday use.'
}

export function ResultsPanel({ result, onRetest }: ResultsPanelProps) {
  const grades = gradeUseCases(result)
  const tip = getTip(result)
  const passed = grades.filter(g => g.pass).length

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
        <p className="text-sm font-mono uppercase tracking-widest text-white/30 mb-1">
          Use-case score
        </p>
        <p className="font-mono font-bold text-4xl text-white">
          {passed}
          <span className="text-white/30 font-normal">/{grades.length}</span>
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
                <span
                  className="text-xs font-mono font-bold shrink-0"
                  style={{ color: g.pass ? '#34d399' : '#f87171' }}
                >
                  {g.pass ? 'PASS' : 'FAIL'}
                </span>
              </div>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {g.reason}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tip */}
      <motion.div
        className="rounded-xl border p-4"
        style={{
          background: 'rgba(34,211,238,0.04)',
          borderColor: 'rgba(34,211,238,0.15)',
        }}
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

      {/* Actions */}
      <div className="flex gap-3 justify-center pt-2">
        <button
          onClick={onRetest}
          className="px-8 py-3 rounded-full font-semibold text-sm transition-all"
          style={{
            background: 'rgba(34,211,238,0.12)',
            border: '1px solid rgba(34,211,238,0.3)',
            color: '#22d3ee',
          }}
          onMouseEnter={e => {
            ;(e.target as HTMLElement).style.background = 'rgba(34,211,238,0.2)'
          }}
          onMouseLeave={e => {
            ;(e.target as HTMLElement).style.background = 'rgba(34,211,238,0.12)'
          }}
        >
          Test Again
        </button>
        <button
          onClick={handleShare}
          className="px-8 py-3 rounded-full font-semibold text-sm transition-all"
          style={{
            background: 'rgba(129,140,248,0.12)',
            border: '1px solid rgba(129,140,248,0.3)',
            color: '#818cf8',
          }}
          onMouseEnter={e => {
            ;(e.target as HTMLElement).style.background = 'rgba(129,140,248,0.2)'
          }}
          onMouseLeave={e => {
            ;(e.target as HTMLElement).style.background = 'rgba(129,140,248,0.12)'
          }}
        >
          Save as Image
        </button>
      </div>
    </motion.div>
  )
}
