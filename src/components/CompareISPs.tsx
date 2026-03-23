import { useState } from 'react'
import { providers, useCaseRecommendations, faqItems, type Provider, type ProviderType } from '../data/providers'

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg key={star} width="12" height="12" viewBox="0 0 24 24" fill={star <= Math.round(rating) ? '#fbbf24' : 'rgba(255,255,255,0.15)'}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <span className="text-xs ml-1" style={{ color: 'rgba(255,255,255,0.45)' }}>{rating.toFixed(1)}</span>
    </div>
  )
}

function ProviderCard({ provider, rank }: { provider: Provider; rank: number }) {
  const [showMore, setShowMore] = useState(false)

  const typeColor: Record<ProviderType, string> = {
    Fiber: '#22d3ee',
    Cable: '#818cf8',
    '5G Home': '#34d399',
    Satellite: '#fbbf24',
    DSL: '#f87171',
  }
  const color = typeColor[provider.type]

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: provider.badge ? '1px solid rgba(34,211,238,0.25)' : '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Top affiliate bar */}
      <a
        href={provider.affiliateUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="flex items-center justify-between px-5 py-3 transition-opacity hover:opacity-80"
        style={{ background: provider.badge ? 'rgba(34,211,238,0.07)' : 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold" style={{ color: 'rgba(255,255,255,0.25)' }}>#{rank}</span>
          <span className="text-sm font-bold text-white">{provider.name}</span>
          {provider.badge && (
            <span
              className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: 'rgba(34,211,238,0.15)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.3)' }}
            >
              {provider.badge}
            </span>
          )}
        </div>
        <span
          className="flex items-center gap-1.5 text-sm font-bold px-3 py-1.5 rounded-xl"
          style={{ background: '#22d3ee', color: '#050d1a' }}
        >
          View Deal
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#050d1a" strokeWidth="2.5">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
          </svg>
        </span>
      </a>

      <div className="p-5 flex flex-col gap-4">
        {/* Type + tagline + price row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.06)', color }}>
              {provider.type}
            </span>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{provider.tagline}</span>
          </div>
          <div className="text-right shrink-0">
            <p className="font-bold text-white">
              from <span className="text-lg">${provider.price}</span>
              <span className="text-sm font-normal" style={{ color: 'rgba(255,255,255,0.4)' }}>/mo</span>
            </p>
            <StarRating rating={provider.rating} />
          </div>
        </div>

        {/* Speed stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(34,211,238,0.05)', border: '1px solid rgba(34,211,238,0.1)' }}>
            <p className="text-xs mb-1 font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Download</p>
            <p className="font-bold text-sm" style={{ color: '#22d3ee' }}>
              {provider.download >= 1000 ? provider.download / 1000 : provider.download}
              <span className="text-xs font-normal ml-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {provider.download >= 1000 ? 'Gbps' : 'Mbps'}
              </span>
            </p>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.1)' }}>
            <p className="text-xs mb-1 font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Upload</p>
            <p className="font-bold text-sm" style={{ color: '#34d399' }}>
              {provider.upload >= 1000 ? provider.upload / 1000 : provider.upload}
              <span className="text-xs font-normal ml-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                {provider.upload >= 1000 ? 'Gbps' : 'Mbps'}
              </span>
            </p>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.1)' }}>
            <p className="text-xs mb-1 font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Ping</p>
            <p className="font-bold text-sm" style={{ color: '#fbbf24' }}>
              {provider.ping}
              <span className="text-xs font-normal ml-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>ms</span>
            </p>
          </div>
        </div>

        {/* Expert review */}
        <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.03)', borderLeft: '3px solid rgba(34,211,238,0.4)' }}>
          <p className="text-xs font-semibold mb-1" style={{ color: 'rgba(34,211,238,0.7)' }}>Editor's Take</p>
          <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{provider.review}</p>
        </div>

        {/* Quick specs */}
        <div className="grid grid-cols-2 gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
          <div className="flex items-center gap-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
            </svg>
            {provider.availability}
          </div>
          <div className="flex items-center gap-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
            </svg>
            {provider.equipment}
          </div>
          <div className="flex items-center gap-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
            {provider.contract}
          </div>
          <div className="flex items-center gap-2">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
            Data: {provider.data}
          </div>
        </div>

        {/* Expandable pros/cons */}
        <button
          onClick={() => setShowMore(!showMore)}
          className="flex items-center gap-1 text-xs font-medium transition-colors"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            style={{ transform: showMore ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
          {showMore ? 'Hide' : 'Show'} pros & cons
        </button>

        {showMore && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: '#34d399' }}>Pros</p>
              <div className="space-y-1.5">
                {provider.pros.map((pro) => (
                  <div key={pro} className="flex items-start gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0">
                      <circle cx="12" cy="12" r="10" stroke="#34d399" strokeWidth="1.5" />
                      <path d="M8 12l3 3 5-5" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {pro}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold mb-2" style={{ color: '#f87171' }}>Cons</p>
              <div className="space-y-1.5">
                {provider.cons.map((con) => (
                  <div key={con} className="flex items-start gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0">
                      <circle cx="12" cy="12" r="10" stroke="#f87171" strokeWidth="1.5" />
                      <path d="M15 9l-6 6M9 9l6 6" stroke="#f87171" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    {con}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <a
          href={provider.affiliateUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="flex items-center justify-between pt-2 border-t"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <div>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Available in {provider.coverageStates.split(',').length > 5 ? provider.coverageStates.split(',').length + ' states' : provider.coverageStates}</span>
          </div>
          <span className="flex items-center gap-1 text-sm font-semibold" style={{ color: '#22d3ee' }}>
            Check availability
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </span>
        </a>
      </div>
    </div>
  )
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <button
        className="w-full flex items-center justify-between px-5 py-4 text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="text-sm font-semibold text-white pr-4">{q}</span>
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="2"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}
        >
          <polyline points="6 9 12 15 18 9"/>
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

const ALL_TYPES: ProviderType[] = ['Fiber', 'Cable', '5G Home', 'Satellite']

export function CompareISPs({ onTestSpeed }: { onTestSpeed: () => void }) {
  const [filter, setFilter] = useState<'All' | ProviderType>('All')

  const filtered = filter === 'All' ? providers : providers.filter(p => p.type === filter)

  // Hero stats
  const fastestDownload = Math.max(...providers.map(p => p.download))
  const fastestDownloadProvider = providers.find(p => p.download === fastestDownload)!
  const lowestPing = Math.min(...providers.map(p => p.ping))
  const lowestPingProvider = providers.find(p => p.ping === lowestPing)!
  const fiberProviders = providers.filter(p => p.type === 'Fiber')
  const avgFiberUpload = Math.round(fiberProviders.reduce((s, p) => s + p.upload, 0) / fiberProviders.length)
  const bestValue = providers.reduce((a, b) => (a.price < b.price ? a : b))

  const counts: Record<string, number> = { All: providers.length }
  ALL_TYPES.forEach(t => { counts[t] = providers.filter(p => p.type === t).length })

  return (
    <div className="max-w-2xl mx-auto px-4 pb-20">

      {/* Badge */}
      <div className="flex justify-center mt-8 mb-6">
        <span
          className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full"
          style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.2)', color: '#22d3ee' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
          US Internet Provider Guide 2025 — Independently Tested
        </span>
      </div>

      {/* Hero */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-3">Best Internet Providers<br />in the US — 2025</h1>
        <p className="text-base max-w-lg mx-auto" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>
          We tested{' '}<strong style={{ color: 'rgba(255,255,255,0.8)' }}>{providers.length} major ISPs</strong>{' '}across speed, reliability, value, and customer experience.
          Here's who actually delivers — and who doesn't.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 mb-10">
        <StatCard
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>}
          value={fastestDownload >= 1000 ? `${fastestDownload / 1000}G` : `${fastestDownload}`}
          unit="bps"
          label="Fastest Available"
          sub={fastestDownloadProvider.name}
        />
        <StatCard
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
          value={String(lowestPing)}
          unit="ms"
          label="Lowest Ping"
          sub={lowestPingProvider.name}
        />
        <StatCard
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>}
          value={String(avgFiberUpload)}
          unit="Mbps"
          label="Avg Fiber Upload"
          sub={`across ${fiberProviders.length} fiber plans`}
        />
        <StatCard
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="2"><path d="M13 2L4.5 13.5H11L10 22L20.5 9.5H14L13 2Z"/></svg>}
          value={`$${bestValue.price}`}
          unit="/mo"
          label="Best Value"
          sub={bestValue.name}
        />
      </div>

      {/* How we rate */}
      <div
        className="rounded-2xl p-5 mb-10"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <h2 className="text-base font-bold text-white mb-3 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
          </svg>
          How We Rate ISPs
        </h2>
        <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}>
          Our editorial team runs speed tests across multiple geographic areas using the same methodology as this tool — measuring real download, upload, and ping at different times of day. We cross-reference results with FCC Broadband Data, J.D. Power satisfaction studies, and ACSI scores.
        </p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Speed & Reliability', weight: '40%', color: '#22d3ee' },
            { label: 'Value for Money', weight: '25%', color: '#34d399' },
            { label: 'Customer Satisfaction', weight: '20%', color: '#fbbf24' },
            { label: 'Contract Transparency', weight: '15%', color: '#818cf8' },
          ].map(({ label, weight, color }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold" style={{ background: `${color}18`, color }}>
                {weight}
              </div>
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter tabs */}
      <h2 className="text-xl font-bold text-white mb-4">Provider Rankings</h2>
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {(['All', ...ALL_TYPES] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className="shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all"
            style={
              filter === type
                ? { background: '#22d3ee', color: '#050d1a' }
                : { background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }
            }
          >
            {type} ({counts[type] ?? 0})
          </button>
        ))}
      </div>

      {/* Provider cards */}
      <div className="space-y-5 mb-14">
        {filtered.map((provider, i) => (
          <ProviderCard key={provider.id} provider={provider} rank={i + 1} />
        ))}
      </div>

      {/* Speed-to-task quick table */}
      <div className="mb-14">
        <h2 className="text-xl font-bold text-white mb-2">Minimum Speeds by Task</h2>
        <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Every provider above easily handles these — but knowing the minimums helps you avoid overpaying.
        </p>
        <div
          className="rounded-2xl overflow-hidden"
          style={{ border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {[
            { task: 'Email & web browsing', min: '5 Mbps', rec: '25 Mbps', icon: '🌐' },
            { task: 'SD video streaming', min: '3 Mbps', rec: '10 Mbps', icon: '📺' },
            { task: '4K streaming (per screen)', min: '25 Mbps', rec: '50 Mbps', icon: '🎬' },
            { task: 'Video calls (HD)', min: '10 Mbps up', rec: '25 Mbps up', icon: '📹' },
            { task: 'Online gaming', min: '10 Mbps / <50ms', rec: '100 Mbps / <20ms', icon: '🎮' },
            { task: 'Working from home', min: '25 Mbps', rec: '100 Mbps sym.', icon: '💼' },
            { task: 'Smart home (10+ devices)', min: '100 Mbps', rec: '500 Mbps', icon: '🏠' },
          ].map(({ task, min, rec, icon }, idx, arr) => (
            <div
              key={task}
              className="flex items-center gap-3 px-5 py-3.5"
              style={{
                background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                borderBottom: idx < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
              }}
            >
              <span className="text-lg shrink-0">{icon}</span>
              <span className="text-sm flex-1 text-white">{task}</span>
              <div className="text-right shrink-0">
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>min: <span style={{ color: 'rgba(255,255,255,0.6)' }}>{min}</span></p>
                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>rec: <span style={{ color: '#22d3ee' }}>{rec}</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Use case section */}
      <div className="mb-14">
        <h2 className="text-xl font-bold text-white mb-2">Best ISP by Use Case</h2>
        <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.4)' }}>Not all households need the same thing. Find your scenario below.</p>
        <div className="space-y-3">
          {useCaseRecommendations.map((uc) => {
            const recommended = providers.filter(p => uc.providers.includes(p.id))
            return (
              <div
                key={uc.title}
                className="rounded-2xl p-4"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl shrink-0">{uc.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-sm mb-1">{uc.title}</p>
                    <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{uc.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {recommended.map((p) => (
                        <a
                          key={p.id}
                          href={p.affiliateUrl}
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                          className="text-xs px-2.5 py-1 rounded-full transition-opacity hover:opacity-75"
                          style={{ background: 'rgba(34,211,238,0.08)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.15)' }}
                        >
                          {p.name} →
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* FAQ */}
      <div className="mb-14">
        <h2 className="text-xl font-bold text-white mb-2">Common Questions</h2>
        <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.4)' }}>Answers to the most important questions about choosing an ISP.</p>
        <div className="space-y-2">
          {faqItems.map((item) => (
            <FaqItem key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </div>

      {/* Fiber vs Cable comparison callout */}
      <div
        className="rounded-2xl p-5 mb-14"
        style={{ background: 'rgba(34,211,238,0.05)', border: '1px solid rgba(34,211,238,0.15)' }}
      >
        <h2 className="text-base font-bold text-white mb-3">Fiber vs. Cable — The Short Version</h2>
        <div className="space-y-3">
          {[
            { label: 'Download speed', fiber: 'Up to 5 Gbps', cable: 'Up to 1.2 Gbps' },
            { label: 'Upload speed', fiber: 'Matches download', cable: '15–50 Mbps (far slower)' },
            { label: 'Ping / latency', fiber: '5–15 ms', cable: '15–40 ms' },
            { label: 'Data caps', fiber: 'Almost never', cable: 'Common (1–1.25 TB)' },
            { label: 'Availability', fiber: 'Limited metros', cable: 'Nationwide coverage' },
            { label: 'Price', fiber: '$70–$160/mo', cable: '$70–$80/mo' },
          ].map(({ label, fiber, cable }) => (
            <div key={label} className="grid grid-cols-3 gap-2 text-xs items-center">
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</span>
              <span className="font-medium" style={{ color: '#22d3ee' }}>{fiber}</span>
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>{cable}</span>
            </div>
          ))}
          <div className="grid grid-cols-3 gap-2 text-xs font-bold pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '10px' }}>
            <span style={{ color: 'rgba(255,255,255,0.4)' }}></span>
            <span style={{ color: '#22d3ee' }}>Fiber</span>
            <span style={{ color: '#818cf8' }}>Cable</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div
        className="rounded-2xl p-6 text-center mb-8"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <h2 className="text-lg font-bold text-white mb-2">Not sure which is faster at your address?</h2>
        <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.4)', lineHeight: 1.65 }}>
          Run a speed test now and compare your current ISP's performance against what competitors are advertising in your area.
        </p>
        <button
          onClick={onTestSpeed}
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-semibold text-sm transition-all hover:opacity-90"
          style={{ background: '#22d3ee', color: '#050d1a' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#050d1a" strokeWidth="2.5">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
          Test My Current Speed
        </button>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-center" style={{ color: 'rgba(255,255,255,0.25)', lineHeight: 1.65 }}>
        Speeds and prices reflect best-advertised plans as of early 2025. Actual speeds vary by location, infrastructure, and time of day.{' '}
        Some links on this page are affiliate links — we may earn a commission if you sign up through them, at no extra cost to you.{' '}
        Affiliate relationships do not influence our editorial ratings or recommendations.
      </p>
    </div>
  )
}

function StatCard({
  icon, value, unit, label, sub,
}: {
  icon: React.ReactNode
  value: string
  unit: string
  label: string
  sub: string
}) {
  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-1"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="mb-1">{icon}</div>
      <p className="text-2xl font-bold text-white leading-none">
        {value}<span className="text-base font-normal ml-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{unit}</span>
      </p>
      <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.55)' }}>{label}</p>
      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{sub}</p>
    </div>
  )
}
