import { useState } from 'react'

interface Props {
  onTestSpeed: () => void
  onCompare: () => void
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <button className="w-full flex items-center justify-between px-5 py-4 text-left" onClick={() => setOpen(!open)}>
        <span className="text-sm font-semibold text-white pr-4">{q}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2" className="shrink-0"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-4">
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>{a}</p>
        </div>
      )}
    </div>
  )
}

const SIGNS = [
  { icon: '🕐', title: 'Slowdowns at peak hours', desc: 'Speeds drop 50%+ between 7–10 PM every night. ISPs oversell capacity on shared nodes; when everyone streams after dinner, your speeds get throttled to manage congestion.' },
  { icon: '📺', title: 'Streaming is slow, speed tests look fine', desc: 'Netflix, YouTube, or Twitch buffers constantly, but a speed test shows your full plan speed. This is the most common sign of service-specific throttling — your ISP is deprioritising video streaming traffic.' },
  { icon: '🎮', title: 'Gaming lag despite fast speeds', desc: 'High ping in games even when download tests are fast. ISPs may throttle gaming servers or use traffic shaping that adds latency to UDP game traffic while leaving TCP speed tests unaffected.' },
  { icon: '📡', title: 'VPN fixes it', desc: 'If connecting a VPN suddenly makes Netflix fast or gaming lag-free, your ISP was targeting that specific traffic. A VPN encrypts traffic so the ISP can\'t identify and throttle by type.' },
  { icon: '📉', title: 'Consistent speeds below advertised plan', desc: 'If you\'re paying for 300 Mbps but always measure 80–120 Mbps regardless of time of day, your ISP may be throttling based on data usage (often after an unpublished soft cap).' },
  { icon: '🔀', title: 'Upload is disproportionately slow', desc: 'Upload throttling is less regulated and often targets users who upload frequently — content creators, remote workers, P2P users. If upload is 1–2 Mbps on a cable plan that should deliver 10–20 Mbps, this is a red flag.' },
]

const DETECTION_STEPS = [
  {
    n: 1,
    title: 'Run a baseline speed test',
    desc: 'Test at multiple times of day — early morning (6 AM), midday, and peak evening (8 PM). Real throttling shows a consistent pattern, not random variation.',
  },
  {
    n: 2,
    title: 'Test at different hours',
    desc: 'Congestion-based throttling peaks 7–10 PM. If your evening speeds are consistently 40–60% lower than morning speeds, your node is over-subscribed or your traffic is being prioritised lower during peak times.',
  },
  {
    n: 3,
    title: 'Test with a VPN enabled',
    desc: 'Install a reputable VPN (Mullvad, ProtonVPN, or ExpressVPN all have free trials). Connect it and run the same speed test. If speeds are significantly faster with VPN, your ISP is inspecting and throttling traffic by type. If speeds are slower with VPN, it\'s normal overhead — not throttling.',
  },
  {
    n: 4,
    title: 'Use the M-Lab Wehe test',
    desc: 'The Wehe app (by Northeastern University and M-Lab) specifically tests whether your ISP treats YouTube, Netflix, Skype, and other services differently from a generic connection. It\'s the most reliable independent throttling detector available. Available at wehe.meddle.mobi.',
  },
  {
    n: 5,
    title: 'Check for packet loss',
    desc: 'Run "ping -n 100 8.8.8.8" (Windows) or "ping -c 100 8.8.8.8" (Mac/Linux). Any packet loss above 1% indicates network problems. Sustained packet loss of 5%+ is a strong indicator of infrastructure issues or deliberate traffic shaping.',
  },
]

const WHAT_TO_DO = [
  { title: 'Contact your ISP', desc: 'Call and specifically ask: "Is my account subject to any speed restrictions or traffic management policies?" Document the conversation. Ask if you\'re near a data limit or if there are any throttling conditions in your service agreement.' },
  { title: 'File an FCC complaint', desc: 'File at consumercomplaints.fcc.gov. While the FCC\'s enforcement authority on ISP throttling has varied with administrations, documented complaints create a public record and trigger ISP responses in ~30 days. Include your speed test results with timestamps.' },
  { title: 'File an FTC complaint', desc: 'If your ISP is throttling you but advertising "unlimited" service, this may constitute deceptive advertising. File at reportfraud.ftc.gov. Aggregate complaints from multiple users in an area carry more regulatory weight.' },
  { title: 'Switch providers', desc: 'If throttling is a persistent problem and alternatives exist, voting with your wallet is the most effective signal. Fiber ISPs (Google Fiber, AT&T Fiber, Verizon Fios) have historically been far less aggressive about throttling, partly because fiber has more capacity headroom.' },
  { title: 'Use a VPN long-term', desc: 'A VPN encrypts traffic so your ISP can\'t identify the type and throttle by service. This works for service-specific throttling (Netflix, gaming) but won\'t help with blanket peak-hour congestion throttling that slows all traffic equally.' },
]

const FAQS = [
  {
    q: 'Is throttling legal?',
    a: 'In the US: mostly yes, unfortunately. The FCC\'s 2015 Open Internet Order (net neutrality) prohibited throttling, but it was repealed in 2017. The FCC voted to restore net neutrality rules in 2024, but these remain in legal flux. ISPs are required to disclose throttling in their service agreements (broadband labels), but disclosure doesn\'t mean prohibition. Some states have their own net neutrality laws (California, Oregon, Vermont).',
  },
  {
    q: 'Does my ISP throttle Netflix specifically?',
    a: 'Some have, historically. Comcast/Xfinity, AT&T, and Verizon were all documented throttling Netflix and YouTube in studies from 2018–2020. After widespread coverage, most ISPs reduced service-specific throttling. Today, "throttling" is more often implemented as congestion management during peak hours rather than targeting specific services — though the practical effect is the same.',
  },
  {
    q: 'What is "data deprioritisation" vs throttling?',
    a: 'Deprioritisation (common on T-Mobile Home Internet and Starlink) means your speeds are slowed only when the network is congested and after you\'ve used a certain amount of data — not a hard cap, but you join the back of the queue. True throttling sets a hard maximum speed regardless of network conditions. Deprioritisation is generally disclosed; throttling is often not.',
  },
  {
    q: 'Will a VPN always fix throttling?',
    a: 'Only for service-specific throttling. A VPN hides your traffic from the ISP so they can\'t identify it as Netflix, gaming, etc. But if your ISP is applying blanket congestion management that slows all traffic during peak hours, a VPN won\'t help — and adds 10–30% overhead that actually makes speeds worse. Use the VPN test described above to determine which type you\'re experiencing.',
  },
]

export function IspThrottling({ onTestSpeed, onCompare }: Props) {
  return (
    <div className="max-w-2xl mx-auto px-4 pb-20">
      {/* Badge */}
      <div className="flex justify-center mt-8 mb-6">
        <span className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full"
          style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', color: '#fbbf24' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          ISP Guide — Updated 2026
        </span>
      </div>

      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-white mb-3">Is Your ISP<br />Throttling You?</h1>
        <p className="text-base max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
          How to detect bandwidth throttling, what causes it, and what you can actually do about it — with data, not guesswork.
        </p>
      </div>

      {/* What is throttling */}
      <div className="rounded-2xl p-5 mb-10" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <h2 className="text-base font-bold text-white mb-3">What is bandwidth throttling?</h2>
        <p className="text-sm leading-relaxed mb-3" style={{ color: 'rgba(255,255,255,0.55)' }}>
          Throttling is when your ISP intentionally slows your connection — either below your plan's advertised speed, or selectively for specific services or traffic types. ISPs use deep packet inspection (DPI) to identify what kind of traffic you're sending, then apply different speed limits to different categories.
        </p>
        <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
          The most common forms: <strong style={{ color: 'rgba(255,255,255,0.8)' }}>peak-hour congestion management</strong> (slowing all traffic when the network node is at capacity), <strong style={{ color: 'rgba(255,255,255,0.8)' }}>service-specific throttling</strong> (slowing Netflix, YouTube, or gaming servers), and <strong style={{ color: 'rgba(255,255,255,0.8)' }}>data cap throttling</strong> (reducing speeds after you exceed a monthly limit).
        </p>
      </div>

      {/* Warning signs */}
      <h2 className="text-xl font-bold text-white mb-4">6 Warning Signs Your ISP Is Throttling</h2>
      <div className="space-y-3 mb-12">
        {SIGNS.map(({ icon, title, desc }) => (
          <div key={title} className="rounded-2xl p-4 flex gap-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span className="text-2xl shrink-0">{icon}</span>
            <div>
              <p className="font-semibold text-white text-sm mb-1">{title}</p>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Detection */}
      <h2 className="text-xl font-bold text-white mb-2">How to Detect Throttling (Step by Step)</h2>
      <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>Work through these in order. Each step either confirms or rules out throttling as the cause.</p>

      {/* Speed test CTA */}
      <div className="rounded-2xl p-4 mb-6 flex items-center gap-4"
        style={{ background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.2)' }}>
        <div className="flex-1">
          <p className="font-semibold text-white text-sm">Start with a speed test</p>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>Measure now, then again at 8 PM, then with VPN. Document each result.</p>
        </div>
        <button onClick={onTestSpeed}
          className="shrink-0 px-4 py-2 rounded-xl font-semibold text-sm"
          style={{ background: '#22d3ee', color: '#050d1a' }}>
          Run Test
        </button>
      </div>

      <div className="space-y-3 mb-12">
        {DETECTION_STEPS.map(({ n, title, desc }) => (
          <div key={n} className="rounded-2xl p-4 flex gap-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <span className="flex items-center justify-center rounded-xl shrink-0 font-bold text-sm"
              style={{ width: 32, height: 32, background: 'rgba(34,211,238,0.12)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.2)' }}>
              {n}
            </span>
            <div>
              <p className="font-semibold text-white text-sm mb-1">{title}</p>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* What to do */}
      <h2 className="text-xl font-bold text-white mb-4">What to Do If You're Being Throttled</h2>
      <div className="space-y-3 mb-12">
        {WHAT_TO_DO.map(({ title, desc }) => (
          <div key={title} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="font-semibold text-white text-sm mb-1">{title}</p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{desc}</p>
          </div>
        ))}
      </div>

      {/* Net neutrality timeline */}
      <div className="rounded-2xl p-5 mb-12" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <h2 className="text-base font-bold text-white mb-4">Net Neutrality Timeline</h2>
        <div className="space-y-3">
          {[
            { year: '2015', event: 'FCC passes Open Internet Order — ISPs classified as common carriers, throttling prohibited.' },
            { year: '2017', event: 'FCC under Ajit Pai repeals net neutrality. ISPs free to throttle, block, or create fast lanes.' },
            { year: '2018–20', event: 'Academic studies document Comcast, AT&T, and Verizon throttling Netflix and YouTube.' },
            { year: '2024', event: 'FCC votes to restore net neutrality. Legal challenges ongoing as of 2026.' },
            { year: '2026', event: 'Regulatory status remains contested. California, Oregon, and Vermont maintain state-level net neutrality protections.' },
          ].map(({ year, event }) => (
            <div key={year} className="flex gap-4">
              <span className="text-xs font-bold shrink-0 mt-0.5 w-10" style={{ color: '#22d3ee' }}>{year}</span>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.55 }}>{event}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <h2 className="text-xl font-bold text-white mb-5">Common Questions</h2>
      <div className="space-y-2 mb-12">
        {FAQS.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
      </div>

      {/* CTAs */}
      <div className="space-y-3">
        <button onClick={onTestSpeed}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm"
          style={{ background: '#22d3ee', color: '#050d1a' }}>
          Run a Speed Test Now
        </button>
        <button onClick={onCompare}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
          Compare ISPs That Don't Throttle →
        </button>
      </div>
    </div>
  )
}
