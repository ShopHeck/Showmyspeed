import { useState } from 'react'

interface Props {
  onTestSpeed: () => void
}

interface Router {
  name: string
  badge: string
  price: string
  wifi: string
  speed: string
  range: string
  ports: string
  pros: string[]
  cons: string[]
  verdict: string
  affiliateUrl: string
}

const ROUTERS: Router[] = [
  {
    name: 'TP-Link Archer BE800',
    badge: 'Best Overall',
    price: '$349',
    wifi: 'Wi-Fi 7 (BE19000)',
    speed: 'Up to 19 Gbps combined',
    range: '~3,000 sq ft',
    ports: '2.5G WAN + 4× 1G LAN + 1× 10G',
    pros: ['Wi-Fi 7 with 320 MHz channels', 'Excellent throughput at range', 'No subscription required', '10G multi-gig port'],
    cons: ['Overkill for plans under 500 Mbps', 'Large footprint', 'Premium price'],
    verdict: 'The best all-around router for households that want the latest technology and have a plan over 500 Mbps. Wi-Fi 7 delivers noticeably lower latency and better multi-device performance than Wi-Fi 6E.',
    affiliateUrl: 'https://amzn.to/4dnh4fR',
  },
  {
    name: 'ASUS RT-AX86U Pro',
    badge: 'Best for Gaming',
    price: '$249',
    wifi: 'Wi-Fi 6 (AX5700)',
    speed: 'Up to 5.7 Gbps combined',
    range: '~2,500 sq ft',
    ports: '2.5G WAN + 4× 1G LAN',
    pros: ['Dedicated gaming accelerator', 'ASUSWRT interface with QoS', 'Adaptive QoS prioritises gaming traffic', 'Strong 5 GHz performance'],
    cons: ['Requires ASUS subscription for some features', 'Bulky design'],
    verdict: 'ASUS leads in gaming router performance year after year. The RT-AX86U Pro\'s game acceleration and adaptive QoS keep ping consistent even when others on the network are streaming.',
    affiliateUrl: 'https://amzn.to/4c2d2Y0',
  },
  {
    name: 'TP-Link Deco BE65 (3-pack)',
    badge: 'Best Mesh System',
    price: '$299',
    wifi: 'Wi-Fi 7 (BE9300)',
    speed: 'Up to 9.3 Gbps per node',
    range: '~7,500 sq ft (3 nodes)',
    ports: '2.5G on each node',
    pros: ['Seamless roaming between nodes', 'Easy app-based setup', 'Wi-Fi 7 backhaul', 'Scales to large homes'],
    cons: ['Higher cost than single router', 'App required for full management'],
    verdict: 'The best mesh system for large homes or multi-floor setups where a single router leaves dead zones. The Wi-Fi 7 backhaul between nodes dramatically improves throughput compared to Wi-Fi 5 mesh systems.',
    affiliateUrl: 'https://amzn.to/418sahq',
  },
  {
    name: 'TP-Link Archer AX3000',
    badge: 'Best Budget',
    price: '$79',
    wifi: 'Wi-Fi 6 (AX3000)',
    speed: 'Up to 3 Gbps combined',
    range: '~2,000 sq ft',
    ports: '1G WAN + 4× 1G LAN',
    pros: ['Exceptional value under $80', 'Wi-Fi 6 with OFDMA', 'No subscription fees', 'Easy setup'],
    cons: ['No 2.5G port', 'Range limited vs premium models', 'USB 3.0 only'],
    verdict: 'For plans up to 500 Mbps, this router competes with models twice its price. If your current router is more than 4 years old, this upgrade alone often delivers a 30–60% real-world speed improvement.',
    affiliateUrl: 'https://amzn.to/47DIRVA',
  },
  {
    name: 'Netgear Orbi RBK863S (3-pack)',
    badge: 'Best for Large Homes',
    price: '$699',
    wifi: 'Wi-Fi 6E (AXE11000)',
    speed: 'Up to 11 Gbps combined',
    range: '~9,000 sq ft (3 nodes)',
    ports: '2.5G on satellite nodes',
    pros: ['Dedicated 6 GHz backhaul keeps client speeds high', 'Excellent coverage in 4,000+ sq ft homes', 'Handles 100+ devices without degradation'],
    cons: ['Very expensive', 'Orbi app has subscription tier', 'Overkill for most homes'],
    verdict: 'If you have a large home (4,000+ sq ft), multiple floors, or thick concrete/brick walls, the Orbi delivers where cheaper mesh systems give up. The dedicated 6 GHz backhaul is what separates it from the pack.',
    affiliateUrl: 'https://amzn.to/4sIcvkR',
  },
]

const FAQS = [
  {
    q: 'Do I actually need Wi-Fi 7?',
    a: 'Not yet for most people. Wi-Fi 7 delivers real benefits — 320 MHz channels, better multi-link operation, lower latency — but only if your devices support it (most 2025/2026 laptops and phones do) and you have a plan over 500 Mbps. For plans under 300 Mbps or mostly older devices, Wi-Fi 6 is more than enough and costs significantly less.',
  },
  {
    q: 'How often should I replace my router?',
    a: 'Every 4–5 years is the practical answer. Router firmware stops receiving security updates, Wi-Fi standards improve significantly each generation, and hardware performance degrades over time. If your router is from before 2020 (Wi-Fi 5 or older), upgrading to Wi-Fi 6 typically delivers a 30–60% real-world improvement even on the same internet plan.',
  },
  {
    q: 'Router vs. mesh system — which do I need?',
    a: 'If your home is under 2,500 sq ft and roughly square-shaped, a single powerful router is usually better (lower latency, simpler setup). For larger homes, homes with many walls/floors, or L-shaped/multi-story layouts, a mesh system eliminates dead zones. The key advantage of mesh: seamless handoff as you move around, whereas range extenders create separate networks.',
  },
  {
    q: 'Should I buy a router or rent from my ISP?',
    a: 'Buy your own — almost always. ISP-provided equipment is often 3–5 generations behind current Wi-Fi standards, rental fees ($10–15/month) mean you\'ve paid for a new router every 6–10 months, and owned equipment typically delivers better real-world speeds. The only exception: some fiber ISPs (AT&T, Google Fiber) provide modern Wi-Fi 6 equipment for free, making the rental case stronger.',
  },
  {
    q: 'What\'s the difference between a router and a modem?',
    a: 'A modem connects your home to your ISP (the internet backbone). A router takes that connection and distributes it to all your devices via Wi-Fi and Ethernet. Most ISPs provide a combo modem/router (gateway device) — but separating them (own modem + own router) gives better performance and more control. Fiber ISPs use an ONT (Optical Network Terminal) instead of a modem, which you typically can\'t replace.',
  },
]

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

function RouterCard({ router }: { router: Router }) {
  const [showMore, setShowMore] = useState(false)
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      {/* Affiliate bar */}
      <a href={router.affiliateUrl} target="_blank" rel="noopener noreferrer sponsored"
        className="flex items-center justify-between px-5 py-3 transition-opacity hover:opacity-80"
        style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <span className="font-bold text-white text-sm">{router.name}</span>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{ background: 'rgba(34,211,238,0.15)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.3)' }}>
            {router.badge}
          </span>
        </div>
        <span className="flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-xl"
          style={{ background: '#22d3ee', color: '#050d1a' }}>
          View Deal
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#050d1a" strokeWidth="2.5">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
          </svg>
        </span>
      </a>

      <div className="p-5 space-y-4">
        {/* Specs grid */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            { label: 'Standard', value: router.wifi },
            { label: 'Price', value: router.price },
            { label: 'Max Speed', value: router.speed },
            { label: 'Coverage', value: router.range },
            { label: 'Ports', value: router.ports },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-lg p-2.5" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <p className="mb-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</p>
              <p className="font-medium text-white">{value}</p>
            </div>
          ))}
        </div>

        {/* Verdict */}
        <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(34,211,238,0.04)', borderLeft: '3px solid rgba(34,211,238,0.3)' }}>
          <p className="text-xs font-semibold mb-1" style={{ color: 'rgba(34,211,238,0.7)' }}>Editor's Verdict</p>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{router.verdict}</p>
        </div>

        {/* Toggle pros/cons */}
        <button onClick={() => setShowMore(!showMore)} className="flex items-center gap-1 text-xs font-medium"
          style={{ color: 'rgba(255,255,255,0.35)' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            style={{ transform: showMore ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
          {showMore ? 'Hide' : 'Show'} pros & cons
        </button>

        {showMore && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: '#34d399' }}>Pros</p>
              <div className="space-y-1.5">
                {router.pros.map(p => (
                  <div key={p} className="flex items-start gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0">
                      <circle cx="12" cy="12" r="10" stroke="#34d399" strokeWidth="1.5" />
                      <path d="M8 12l3 3 5-5" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {p}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: '#f87171' }}>Cons</p>
              <div className="space-y-1.5">
                {router.cons.map(c => (
                  <div key={c} className="flex items-start gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0">
                      <circle cx="12" cy="12" r="10" stroke="#f87171" strokeWidth="1.5" />
                      <path d="M15 9l-6 6M9 9l6 6" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    {c}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <a href={router.affiliateUrl} target="_blank" rel="noopener noreferrer sponsored"
          className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <span className="font-bold text-white">{router.price}</span>
          <span className="flex items-center gap-1 text-sm font-semibold" style={{ color: '#22d3ee' }}>
            Check price on Amazon →
          </span>
        </a>
      </div>
    </div>
  )
}

export function BestRouters({ onTestSpeed }: Props) {
  return (
    <div className="max-w-2xl mx-auto px-4 pb-20">
      {/* Badge */}
      <div className="flex justify-center mt-8 mb-6">
        <span className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full"
          style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.2)', color: '#22d3ee' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </svg>
          Tested & Ranked — 2026 Edition
        </span>
      </div>

      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-white mb-3">Best Wi-Fi Routers<br />of 2026</h1>
        <p className="text-base max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
          We tested {ROUTERS.length} routers across speed, range, and value. Whether you need a budget upgrade or a whole-home mesh system, here's what actually performs.
        </p>
      </div>

      {/* Quick picks */}
      <div className="rounded-2xl p-5 mb-10" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <h2 className="text-base font-bold text-white mb-4">Quick Picks</h2>
        <div className="space-y-2">
          {ROUTERS.map(r => (
            <a key={r.name} href={r.affiliateUrl} target="_blank" rel="noopener noreferrer sponsored"
              className="flex items-center justify-between py-2.5 border-b transition-opacity hover:opacity-75"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-3">
                <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{ background: 'rgba(34,211,238,0.08)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.15)' }}>
                  {r.badge}
                </span>
                <span className="text-sm text-white">{r.name}</span>
              </div>
              <span className="text-sm font-bold" style={{ color: '#34d399' }}>{r.price}</span>
            </a>
          ))}
        </div>
      </div>

      {/* What specs matter */}
      <h2 className="text-xl font-bold text-white mb-4">What specs actually matter</h2>
      <div className="space-y-3 mb-10">
        {[
          { label: 'Wi-Fi Standard', icon: '📡', desc: 'Wi-Fi 7 (802.11be) is the latest — faster, lower latency, better multi-device. Wi-Fi 6/6E is excellent for most people and costs less. Avoid anything older than Wi-Fi 6 (802.11ax) for new purchases.' },
          { label: 'Frequency Bands', icon: '📻', desc: 'Dual-band (2.4 + 5 GHz) handles most homes. Tri-band adds a second 5 GHz or 6 GHz band — the extra band is mainly used as a dedicated wireless backhaul channel in mesh systems, keeping client speeds high.' },
          { label: 'MU-MIMO', icon: '📶', desc: 'Multi-User, Multiple Input Multiple Output lets the router communicate with multiple devices simultaneously rather than sequentially. Essential for households with 10+ devices. Look for 4×4 or 8×8 MU-MIMO configurations.' },
          { label: 'OFDMA', icon: '⚡', desc: 'Orthogonal Frequency Division Multiple Access (included in Wi-Fi 6+) divides channels into sub-channels, dramatically improving efficiency when many devices are connected simultaneously. It\'s the main reason Wi-Fi 6 handles crowded networks better than Wi-Fi 5.' },
          { label: 'Multi-Gig Ports', icon: '🔌', desc: 'Standard Gigabit Ethernet (1 Gbps) is a bottleneck if you have a 2 Gbps+ fiber plan. Look for a 2.5G or 10G WAN port if your plan exceeds 1 Gbps. Also useful for NAS devices and gaming PCs that benefit from faster wired connections.' },
          { label: 'Processor & RAM', icon: '💻', desc: 'Routers run an operating system. A quad-core 1.8+ GHz processor and 512MB+ RAM prevent slowdowns when many devices are active simultaneously. Budget routers with weak processors show their limits when 20+ devices are connected.' },
        ].map(({ label, icon, desc }) => (
          <div key={label} className="rounded-2xl p-4 flex gap-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <span className="text-xl shrink-0">{icon}</span>
            <div>
              <p className="font-semibold text-white text-sm mb-1">{label}</p>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Router cards */}
      <h2 className="text-xl font-bold text-white mb-5">Full Reviews</h2>
      <div className="space-y-5 mb-14">
        {ROUTERS.map(r => <RouterCard key={r.name} router={r} />)}
      </div>

      {/* FAQ */}
      <h2 className="text-xl font-bold text-white mb-5">Common Questions</h2>
      <div className="space-y-2 mb-14">
        {FAQS.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
      </div>

      {/* CTA */}
      <div className="rounded-2xl p-6 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
        <h2 className="text-base font-bold text-white mb-2">Is your router actually the bottleneck?</h2>
        <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.4)', lineHeight: 1.65 }}>
          Run a speed test plugged in via Ethernet, then again on Wi-Fi. A large gap between the two means your router (not your ISP plan) is limiting you.
        </p>
        <button onClick={onTestSpeed}
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-semibold text-sm hover:opacity-90"
          style={{ background: '#22d3ee', color: '#050d1a' }}>
          Test My Speed Now
        </button>
      </div>

      <p className="text-xs text-center mt-6" style={{ color: 'rgba(255,255,255,0.25)', lineHeight: 1.65 }}>
        Prices accurate as of early 2026 and may vary. Some links are affiliate links — we may earn a commission at no extra cost to you. Affiliate relationships do not influence our rankings.
      </p>
    </div>
  )
}
