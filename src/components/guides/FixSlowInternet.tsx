import { useState } from 'react'

interface Props {
  onTestSpeed: () => void
  onCompare: () => void
}

function StepCard({ n, title, description, impact, detail }: {
  n: number; title: string; description: string; impact: 'High' | 'Medium' | 'Low'; detail: string
}) {
  const [open, setOpen] = useState(false)
  const impactColor = { High: '#34d399', Medium: '#fbbf24', Low: '#818cf8' }[impact]
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <button className="w-full flex items-start gap-4 p-5 text-left" onClick={() => setOpen(!open)}>
        <span className="flex items-center justify-center rounded-xl shrink-0 font-bold text-sm"
          style={{ width: 32, height: 32, background: 'rgba(34,211,238,0.12)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.2)' }}>
          {n}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <p className="font-semibold text-white text-sm">{title}</p>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `${impactColor}15`, color: impactColor }}>
              {impact} impact
            </span>
          </div>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>{description}</p>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" className="shrink-0 mt-1"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-5 pt-0">
          <div className="rounded-xl p-4" style={{ background: 'rgba(34,211,238,0.04)', borderLeft: '3px solid rgba(34,211,238,0.3)' }}>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{detail}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function DiagCard({ icon, label, good, warn, bad }: { icon: string; label: string; good: string; warn: string; bad: string }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="text-xl mb-2">{icon}</div>
      <p className="text-xs font-semibold text-white mb-2">{label}</p>
      <div className="space-y-1.5 text-xs">
        <div className="flex items-center gap-2"><span style={{ color: '#34d399' }}>●</span><span style={{ color: 'rgba(255,255,255,0.55)' }}>{good}</span></div>
        <div className="flex items-center gap-2"><span style={{ color: '#fbbf24' }}>●</span><span style={{ color: 'rgba(255,255,255,0.55)' }}>{warn}</span></div>
        <div className="flex items-center gap-2"><span style={{ color: '#f87171' }}>●</span><span style={{ color: 'rgba(255,255,255,0.55)' }}>{bad}</span></div>
      </div>
    </div>
  )
}

const STEPS = [
  {
    title: 'Restart your router and modem',
    description: 'The single most effective free fix — resolves ~40% of slow internet complaints.',
    impact: 'High' as const,
    detail: 'Unplug your modem and router from power (they\'re different devices — the modem connects to the ISP, the router creates your Wi-Fi). Wait a full 30 seconds, then plug the modem in first. Wait for it to fully connect (solid lights, ~60 seconds), then plug the router back in. This flushes memory leaks, refreshes the DHCP lease, and re-establishes a clean connection to your ISP.',
  },
  {
    title: 'Switch from Wi-Fi to Ethernet',
    description: 'A wired connection eliminates wireless interference instantly.',
    impact: 'High' as const,
    detail: 'Wi-Fi signals degrade through walls, suffer from interference from neighboring networks, and introduce variable latency. A Cat5e or Cat6 Ethernet cable plugged directly from your router to your device will typically deliver 20–40% faster real-world speeds and cut ping by 5–15ms. If running a permanent cable isn\'t practical, a powerline adapter (TP-Link AV1000 or similar, ~$30) sends internet over your home\'s electrical wiring — a useful middle ground.',
  },
  {
    title: 'Switch to the 5 GHz Wi-Fi band',
    description: 'Faster and less congested than 2.4 GHz for devices within range.',
    impact: 'High' as const,
    detail: 'Most routers broadcast on both 2.4 GHz and 5 GHz. The 2.4 GHz band is shared by neighboring networks, microwaves, and Bluetooth devices — causing significant interference in apartments and dense neighborhoods. Look in your device\'s Wi-Fi list for a network name ending in "_5G" or "_5GHz." The trade-off: 5 GHz has shorter range and struggles more through walls, so it\'s best for devices within 30 feet of the router.',
  },
  {
    title: 'Reposition your router',
    description: 'Router placement has an outsized effect on Wi-Fi speed throughout your home.',
    impact: 'High' as const,
    detail: 'Every wall a Wi-Fi signal passes through reduces strength by 20–40%. Floors and ceilings reduce it by up to 50%. Ideal placement: centrally located in your home, elevated (shelf or wall-mount), away from other electronics, in the open — not inside a cabinet or closet. Keep it away from cordless phones, baby monitors, and microwaves. The antenna orientation matters too: vertical antennas work better for single-floor setups; horizontal helps with multi-story.',
  },
  {
    title: 'Close background apps and auto-updates',
    description: 'Hidden bandwidth consumers silently drain your connection.',
    impact: 'Medium' as const,
    detail: 'Windows Update, iCloud backups, Dropbox sync, and streaming services running in the background can each consume 10–50+ Mbps without any obvious sign. On Windows, open Task Manager → Performance → Open Resource Monitor → Network to see which processes are using bandwidth. On Mac, use Activity Monitor → Network. Pause cloud sync services before video calls or downloads. Check your router admin panel for any unknown devices consuming bandwidth.',
  },
  {
    title: 'Update your router firmware',
    description: 'Outdated firmware causes security vulnerabilities and known performance bugs.',
    impact: 'Medium' as const,
    detail: 'Router manufacturers regularly release firmware updates that fix connection stability issues, improve throughput, and patch security vulnerabilities. Log into your router admin panel — usually accessible at 192.168.1.1 or 192.168.0.1 in your browser (check the sticker on your router). Look for "Firmware Update" or "Software Update." If you\'re using your ISP-provided router, they often push updates automatically, but manual checks are still worthwhile.',
  },
  {
    title: 'Change your Wi-Fi channel',
    description: 'Neighboring networks on the same channel cause interference and packet collisions.',
    impact: 'Medium' as const,
    detail: 'On 2.4 GHz, only channels 1, 6, and 11 are non-overlapping — use one of these. On 5 GHz, there are many more non-overlapping channels. Download "Wi-Fi Analyzer" (Android) or "WiFi Explorer" (Mac) to see which channels are most congested in your area. Then log into your router admin panel and manually set the channel to the least crowded option. This is especially impactful in apartments where dozens of networks overlap.',
  },
  {
    title: 'Change your DNS server',
    description: 'Slow DNS makes every page load lag, even if your connection is fast.',
    impact: 'Medium' as const,
    detail: 'DNS (Domain Name System) translates website names to IP addresses. Every page load starts with a DNS lookup — if your ISP\'s DNS is slow, everything feels sluggish. Switch to Cloudflare\'s 1.1.1.1 (the fastest public DNS resolver) or Google\'s 8.8.8.8. Set this in your router admin panel under "DNS Settings" to apply it to all devices at once. You\'ll typically see a noticeable improvement in page load times within seconds of making the change.',
  },
  {
    title: 'Scan for malware',
    description: 'Malware can silently consume your upload bandwidth with no visible signs.',
    impact: 'Medium' as const,
    detail: 'Botnets, cryptominers, and adware all use your internet connection in the background. Symptoms include: upload speed dramatically slower than download, router running hot, internet slower at night. Run a full scan with Windows Defender (free, built into Windows 10/11) or Malwarebytes (free tier available). Also log into your router admin panel and check "Connected Devices" — any unfamiliar devices using your Wi-Fi should be blocked and your password changed.',
  },
  {
    title: 'Upgrade your modem',
    description: 'Renting an outdated modem from your ISP caps your speeds and costs money.',
    impact: 'High' as const,
    detail: 'If you\'re paying $15/month to rent a modem from your ISP, you\'re spending $180/year on hardware that often limits your speeds. An owned DOCSIS 3.1 modem (ARRIS SURFboard SB8200, Motorola MB8600 — both ~$90–120) eliminates the rental fee and supports multi-gigabit speeds. Check your ISP\'s website for a list of compatible modems. One purchase pays for itself in 6–8 months. Note: DOCSIS modems are for cable internet (Xfinity, Spectrum, Cox) only — fiber ISPs provide their own equipment.',
  },
  {
    title: 'Compare faster internet plans',
    description: 'If you\'ve tried everything above, your plan may genuinely be the bottleneck.',
    impact: 'High' as const,
    detail: 'Run a speed test first to confirm your current plan\'s real-world delivery. If you\'re getting the speeds you\'re paying for but they\'re still not enough for your household\'s needs, it\'s time to upgrade — either to a faster tier with your current ISP or to a different provider entirely. Fiber internet (AT&T, Google Fiber, Verizon Fios) delivers symmetrical gigabit speeds at the same price as many cable plans, with no data caps and lower latency.',
  },
]

export function FixSlowInternet({ onTestSpeed, onCompare }: Props) {
  return (
    <div className="max-w-2xl mx-auto px-4 pb-20">
      {/* Badge */}
      <div className="flex justify-center mt-8 mb-6">
        <span className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full"
          style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.2)', color: '#22d3ee' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" />
          </svg>
          Troubleshooting Guide — Updated 2026
        </span>
      </div>

      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-white mb-3">How to Fix Slow<br />Internet (2026 Guide)</h1>
        <p className="text-base max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
          11 proven fixes, ordered from easiest to most involved. Most people solve their problem in the first 3 steps — start there before spending money.
        </p>
      </div>

      {/* Quick test CTA */}
      <div className="rounded-2xl p-5 mb-10 flex items-center gap-4"
        style={{ background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.2)' }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="shrink-0">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" stroke="#22d3ee" strokeWidth="2" />
          <polyline points="17 6 23 6 23 12" stroke="#22d3ee" strokeWidth="2" />
        </svg>
        <div className="flex-1">
          <p className="font-semibold text-white text-sm mb-0.5">First: measure what you actually have</p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Run a speed test before and after each fix to see exactly what's helping. Takes 30 seconds.
          </p>
        </div>
        <button onClick={onTestSpeed}
          className="shrink-0 px-4 py-2 rounded-xl font-semibold text-sm"
          style={{ background: '#22d3ee', color: '#050d1a' }}>
          Test Now
        </button>
      </div>

      {/* Diagnostic reference */}
      <h2 className="text-xl font-bold text-white mb-4">What do your numbers mean?</h2>
      <div className="grid grid-cols-2 gap-3 mb-10">
        <DiagCard icon="⬇️" label="Download Speed"
          good="100+ Mbps — excellent for most households"
          warn="25–100 Mbps — adequate, may struggle with 4K or 5+ devices"
          bad="Under 25 Mbps — bottleneck for modern usage" />
        <DiagCard icon="⬆️" label="Upload Speed"
          good="20+ Mbps — video calls and file sharing work great"
          warn="5–20 Mbps — video calls may pixelate under load"
          bad="Under 5 Mbps — severe upload bottleneck" />
        <DiagCard icon="⚡" label="Ping (Latency)"
          good="Under 20ms — excellent for gaming and calls"
          warn="20–60ms — fine for streaming, borderline for gaming"
          bad="Over 100ms — noticeable lag in all real-time uses" />
        <DiagCard icon="〰️" label="Jitter"
          good="Under 5ms — rock-solid connection"
          warn="5–20ms — slight call quality degradation"
          bad="Over 20ms — choppy video calls and unstable gaming" />
      </div>

      {/* Steps */}
      <h2 className="text-xl font-bold text-white mb-4">Step-by-Step Fixes</h2>
      <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
        Click any step to expand detailed instructions. Work through them in order — the early ones are free and take under 2 minutes.
      </p>
      <div className="space-y-3 mb-14">
        {STEPS.map((step, i) => (
          <StepCard key={step.title} n={i + 1} {...step} />
        ))}
      </div>

      {/* ISP section */}
      <div className="rounded-2xl p-5 mb-10" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <h2 className="text-base font-bold text-white mb-2">Signs your ISP is the problem (not your equipment)</h2>
        <div className="space-y-2.5 mt-4">
          {[
            { icon: '🕐', text: 'Speeds drop at the same time every day — classic congestion on a shared node during peak hours (7–10 PM).' },
            { icon: '📺', text: 'Netflix or YouTube buffer but speed tests look fine — your ISP may be throttling specific streaming services.' },
            { icon: '📍', text: 'Neighbors with the same ISP also report slow speeds — the problem is upstream, not in your home.' },
            { icon: '📉', text: 'Speeds are consistently 30–50% below your advertised plan during peak hours — your node is over-subscribed.' },
            { icon: '🔁', text: 'Packet loss appearing in ping tests — this is almost always the ISP\'s infrastructure, not your router.' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-start gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
              <span className="text-base shrink-0 mt-0.5">{icon}</span>
              <span style={{ lineHeight: 1.55 }}>{text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTAs */}
      <div className="space-y-3">
        <button onClick={onTestSpeed}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm"
          style={{ background: '#22d3ee', color: '#050d1a' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#050d1a" strokeWidth="2.5">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
          </svg>
          Run a Speed Test
        </button>
        <button onClick={onCompare}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
          Compare Faster ISPs in Your Area →
        </button>
      </div>
    </div>
  )
}
