import { motion } from 'framer-motion'
import type { TestResult } from '../types'

interface Tip {
  icon: string
  title: string
  description: string
  impact: 'High' | 'Medium' | 'Low'
  difficulty: 'Easy' | 'Medium' | 'Advanced'
  /** Return true when this tip is especially relevant to the user's result */
  relevant: (r: TestResult) => boolean
}

const ALL_TIPS: Tip[] = [
  // ── Easy wins ──────────────────────────────────────────────────────────────
  {
    icon: '🔌',
    title: 'Switch to a wired (Ethernet) connection',
    description:
      'A direct Ethernet cable eliminates WiFi interference and can double real-world speeds while cutting ping and jitter dramatically. Most routers have a free port on the back.',
    impact: 'High',
    difficulty: 'Easy',
    relevant: (r) => r.jitter > 10 || r.ping > 30 || r.download < 200,
  },
  {
    icon: '🔄',
    title: 'Restart your router & modem',
    description:
      'Power-cycling your router clears its memory and refreshes the connection to your ISP. Unplug for 30 seconds, then plug back in. Do this monthly for best results.',
    impact: 'Medium',
    difficulty: 'Easy',
    relevant: () => true,
  },
  {
    icon: '📱',
    title: 'Close background apps and tabs',
    description:
      'Streaming services, cloud backup, OS updates, and video calls all consume bandwidth even when minimised. Close unused applications before running tasks that need speed.',
    impact: 'Medium',
    difficulty: 'Easy',
    relevant: (r) => r.download < 100,
  },
  {
    icon: '📶',
    title: 'Move to the 5 GHz WiFi band',
    description:
      '5 GHz is faster and less congested than 2.4 GHz, though its range is shorter. Look for a network name ending in "_5G" or "_5GHz" in your device\'s WiFi list.',
    impact: 'High',
    difficulty: 'Easy',
    relevant: (r) => r.download < 300 || r.jitter > 10,
  },
  {
    icon: '📍',
    title: 'Reposition your router',
    description:
      'Place your router centrally in your home, off the floor, away from walls and other electronics. Each wall a WiFi signal passes through cuts signal strength by 20–40%.',
    impact: 'High',
    difficulty: 'Easy',
    relevant: (r) => r.download < 200 || r.ping > 30,
  },
  // ── Medium effort ──────────────────────────────────────────────────────────
  {
    icon: '📡',
    title: "Update your router's firmware",
    description:
      "Router firmware updates fix bugs, improve stability, and sometimes unlock better speeds. Check your router brand's app or admin panel (usually at 192.168.1.1) for updates.",
    impact: 'Medium',
    difficulty: 'Medium',
    relevant: (r) => r.jitter > 15 || r.ping > 40,
  },
  {
    icon: '📻',
    title: 'Change your WiFi channel',
    description:
      'If neighbours\' routers use the same channel, they cause interference. Log into your router admin panel and switch to a less crowded channel — apps like "WiFi Analyzer" show which channels are busiest near you.',
    impact: 'Medium',
    difficulty: 'Medium',
    relevant: (r) => r.jitter > 12 || r.download < 150,
  },
  {
    icon: '🏠',
    title: 'Add a WiFi mesh or range extender',
    description:
      "If you're far from your router, a WiFi mesh system (TP-Link Deco, Eero, Orbi) creates seamless coverage across the whole home. Avoid cheap repeaters — they halve your speed.",
    impact: 'High',
    difficulty: 'Medium',
    relevant: (r) => r.download < 100 || r.ping > 50,
  },
  {
    icon: '⚙️',
    title: 'Enable QoS (Quality of Service)',
    description:
      'QoS lets your router prioritise traffic for gaming or video calls over background downloads. Look for "QoS" or "Traffic Priority" in your router\'s admin settings.',
    impact: 'Medium',
    difficulty: 'Medium',
    relevant: (r) => r.jitter > 10 || r.ping > 30,
  },
  {
    icon: '🛡️',
    title: 'Scan for malware and unwanted programs',
    description:
      'Malware can silently consume bandwidth by uploading data. Run a full scan with Windows Defender or Malwarebytes, and check your router for unknown connected devices.',
    impact: 'High',
    difficulty: 'Medium',
    relevant: (r) => r.upload < 5,
  },
  // ── Advanced ───────────────────────────────────────────────────────────────
  {
    icon: '📦',
    title: 'Upgrade your modem',
    description:
      "ISP-provided modems are often outdated. An owned DOCSIS 3.1 modem (ARRIS, Motorola) removes the $15/mo rental fee and supports multi-Gbps speeds. Compatible models are listed on your ISP's website.",
    impact: 'High',
    difficulty: 'Advanced',
    relevant: (r) => r.download < 400,
  },
  {
    icon: '🌐',
    title: 'Switch your DNS to Cloudflare (1.1.1.1) or Google (8.8.8.8)',
    description:
      'Slow DNS makes every page load feel laggy. Changing to 1.1.1.1 (Cloudflare) or 8.8.8.8 (Google) speeds up domain lookups. Set this in your router admin panel to cover all devices at once.',
    impact: 'Medium',
    difficulty: 'Advanced',
    relevant: (r) => r.ping > 40,
  },
  {
    icon: '🚀',
    title: 'Consider upgrading to a faster internet plan',
    description:
      "If your speeds consistently underperform for your household's needs, it may be time to upgrade. Compare fiber plans near you — fiber delivers symmetrical upload and download at lower latency than cable.",
    impact: 'High',
    difficulty: 'Advanced',
    relevant: (r) => r.download < 100,
  },
]

const IMPACT_COLOR: Record<string, string> = {
  High: '#34d399',
  Medium: '#fbbf24',
  Low: '#818cf8',
}


function diagnose(r: TestResult): { headline: string; sub: string; color: string } {
  if (r.download >= 400 && r.ping < 20 && r.jitter < 10) {
    return { headline: 'Your connection is excellent', sub: "Minor tweaks may still help, but you're in great shape.", color: '#34d399' }
  }
  if (r.ping > 100 || r.jitter > 40) {
    return { headline: 'High latency detected', sub: 'Your speeds are acceptable but lag may hurt gaming and video calls.', color: '#fbbf24' }
  }
  if (r.download < 25) {
    return { headline: 'Speeds are below average', sub: 'Multiple devices or 4K streaming may struggle on this connection.', color: '#f87171' }
  }
  if (r.upload < 10) {
    return { headline: 'Upload speed is limiting you', sub: 'Video calls, file sharing, and remote work may feel sluggish.', color: '#fbbf24' }
  }
  return { headline: 'Decent connection with room to improve', sub: 'The tips below can close the gap between good and great.', color: '#22d3ee' }
}

interface SpeedTipsProps {
  result: TestResult
  onCompare: () => void
  onRetest: () => void
}

export function SpeedTips({ result, onCompare, onRetest }: SpeedTipsProps) {
  const { headline, sub, color } = diagnose(result)

  // Sort: relevant tips first, then by impact High → Medium → Low
  const impactRank: Record<string, number> = { High: 0, Medium: 1, Low: 2 }
  const tips = [...ALL_TIPS].sort((a, b) => {
    const aRel = a.relevant(result) ? 0 : 1
    const bRel = b.relevant(result) ? 0 : 1
    if (aRel !== bRel) return aRel - bRel
    return impactRank[a.impact] - impactRank[b.impact]
  })

  // Group by difficulty
  const groups: Array<{ label: string; tips: Tip[] }> = [
    { label: 'Easy Wins', tips: tips.filter(t => t.difficulty === 'Easy') },
    { label: 'More Effort', tips: tips.filter(t => t.difficulty === 'Medium') },
    { label: 'Advanced', tips: tips.filter(t => t.difficulty === 'Advanced') },
  ]

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto space-y-8"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Diagnosis banner */}
      <div
        className="rounded-2xl p-5"
        style={{ background: `${color}10`, border: `1px solid ${color}30` }}
      >
        <p className="font-bold text-lg" style={{ color }}>{headline}</p>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{sub}</p>

        {/* Mini stats */}
        <div className="grid grid-cols-4 gap-2 mt-4">
          {[
            { label: 'Download', value: result.download >= 100 ? Math.round(result.download) : result.download.toFixed(1), unit: 'Mbps', c: '#22d3ee' },
            { label: 'Upload',   value: result.upload >= 100   ? Math.round(result.upload)   : result.upload.toFixed(1),   unit: 'Mbps', c: '#818cf8' },
            { label: 'Ping',     value: Math.round(result.ping),   unit: 'ms', c: '#34d399' },
            { label: 'Jitter',   value: Math.round(result.jitter), unit: 'ms', c: '#fbbf24' },
          ].map(({ label, value, unit, c }) => (
            <div key={label} className="text-center">
              <p className="font-mono font-bold text-xl" style={{ color: c }}>{value}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{unit}</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tips grouped by difficulty */}
      {groups.map((group, gi) => (
        <div key={group.label}>
          <h2
            className="text-xs font-mono uppercase tracking-widest mb-3 flex items-center gap-3"
            style={{ color: 'rgba(255,255,255,0.3)' }}
          >
            {group.label}
            <span className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />
          </h2>
          <div className="space-y-3">
            {group.tips.map((tip, ti) => {
              const isRelevant = tip.relevant(result)
              return (
                <motion.div
                  key={tip.title}
                  className="rounded-2xl p-4 flex gap-4"
                  style={{
                    background: isRelevant ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.025)',
                    border: isRelevant
                      ? '1px solid rgba(255,255,255,0.1)'
                      : '1px solid rgba(255,255,255,0.05)',
                  }}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: gi * 0.05 + ti * 0.04 }}
                >
                  <span className="text-2xl shrink-0 mt-0.5">{tip.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-semibold text-sm text-white leading-snug">{tip.title}</p>
                      <div className="flex items-center gap-1.5 shrink-0">
                        {isRelevant && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={{ background: 'rgba(34,211,238,0.12)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.2)' }}
                          >
                            Recommended
                          </span>
                        )}
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{
                            background: `${IMPACT_COLOR[tip.impact]}15`,
                            color: IMPACT_COLOR[tip.impact],
                          }}
                        >
                          {tip.impact} impact
                        </span>
                      </div>
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                      {tip.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      ))}

      {/* ISP upgrade CTA */}
      <div
        className="rounded-2xl p-5 flex items-start gap-4"
        style={{ background: 'rgba(34,211,238,0.05)', border: '1px solid rgba(34,211,238,0.15)' }}
      >
        <span className="text-3xl shrink-0">📋</span>
        <div className="flex-1">
          <p className="font-bold text-white mb-1">Still not fast enough?</p>
          <p className="text-sm mb-3" style={{ color: 'rgba(255,255,255,0.45)' }}>
            If you've tried these fixes and speeds are still slow, your plan may be the bottleneck.
            Compare fiber and cable options available near you.
          </p>
          <button
            onClick={onCompare}
            className="text-sm font-semibold px-4 py-2 rounded-xl transition-all"
            style={{ background: '#22d3ee', color: '#050d1a' }}
          >
            Compare providers →
          </button>
        </div>
      </div>

      {/* Bottom actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={onRetest}
          className="flex-1 py-3.5 rounded-2xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 .49-4.95" />
          </svg>
          Run Another Test
        </button>
        <button
          onClick={onCompare}
          className="flex-1 py-3.5 rounded-2xl font-semibold text-sm transition-all"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
        >
          Compare ISPs →
        </button>
      </div>
    </motion.div>
  )
}
