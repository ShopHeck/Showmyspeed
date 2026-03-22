import { useState } from 'react'
import { providers, useCaseRecommendations, type Provider, type ProviderType } from '../data/providers'

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

function ProviderCard({ provider }: { provider: Provider }) {
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
      className="rounded-2xl p-5 flex flex-col gap-4"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-white text-base">{provider.name}</h3>
            {provider.badge && (
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: 'rgba(34,211,238,0.12)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.2)' }}
              >
                {provider.badge}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.06)', color }}>
              {provider.type}
            </span>
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{provider.tagline}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="font-bold text-white text-lg">${provider.price}<span className="text-sm font-normal" style={{ color: 'rgba(255,255,255,0.4)' }}>/mo</span></p>
          <StarRating rating={provider.rating} />
        </div>
      </div>

      {/* Speed stats */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Download</p>
          <p className="font-semibold text-sm">
            <span style={{ color: '#22d3ee' }}>{provider.download >= 1000 ? provider.download / 1000 : provider.download}</span>
            <span className="text-xs ml-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{provider.download >= 1000 ? 'Gbps' : 'Mbps'}</span>
          </p>
        </div>
        <div>
          <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Upload</p>
          <p className="font-semibold text-sm">
            <span style={{ color: '#34d399' }}>{provider.upload >= 1000 ? provider.upload / 1000 : provider.upload}</span>
            <span className="text-xs ml-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{provider.upload >= 1000 ? 'Gbps' : 'Mbps'}</span>
          </p>
        </div>
        <div>
          <p className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Ping</p>
          <p className="font-semibold text-sm">
            <span style={{ color: '#fbbf24' }}>{provider.ping}</span>
            <span className="text-xs ml-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>ms</span>
          </p>
        </div>
      </div>

      {/* Data & availability */}
      <div className="flex items-center justify-between text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
        <span>Data: <span className="text-white">{provider.data}</span></span>
        <span>{provider.availability}</span>
      </div>

      {/* Pros */}
      <div className="space-y-1.5">
        {provider.pros.map((pro) => (
          <div key={pro} className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="#34d399" strokeWidth="1.5" />
              <path d="M8 12l3 3 5-5" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {pro}
          </div>
        ))}
      </div>

      {/* View Deal */}
      <a
        href={provider.affiliateUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="flex items-center justify-between mt-1"
      >
        <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.5)' }}>
          from <span className="text-white">${provider.price}</span>/mo
        </span>
        <span className="flex items-center gap-1 text-sm font-semibold" style={{ color: '#22d3ee' }}>
          View Deal
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2">
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" />
          </svg>
        </span>
      </a>
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
    <div className="max-w-2xl mx-auto px-4 pb-16">
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
          US Internet Provider Guide 2025
        </span>
      </div>

      {/* Hero */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-3">Compare Internet<br />Providers</h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
          Side-by-side data on speeds, pricing, reliability,<br />and value. Updated monthly with real-world averages.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        <StatCard
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>}
          value={fastestDownload >= 1000 ? `${fastestDownload / 1000}G` : `${fastestDownload}`}
          unit="Mbps"
          label="Fastest Download"
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
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>}
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

      {/* Filter tabs */}
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
      <div className="space-y-4 mb-12">
        {filtered.map((provider) => (
          <ProviderCard key={provider.id} provider={provider} />
        ))}
      </div>

      {/* Use case section */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-white mb-5">Which provider is best for your needs?</h2>
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
                    <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{uc.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {recommended.map((p) => (
                        <span
                          key={p.id}
                          className="text-xs px-2.5 py-1 rounded-full"
                          style={{ background: 'rgba(34,211,238,0.08)', color: '#22d3ee', border: '1px solid rgba(34,211,238,0.15)' }}
                        >
                          {p.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Speeds and prices reflect best-advertised plans as of early 2025. Actual speeds vary by location, infrastructure, and time of day. Some outbound links are affiliate partnerships — these help keep this site free.
        </p>
        <button
          onClick={onTestSpeed}
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl font-semibold text-sm transition-all"
          style={{ background: '#22d3ee', color: '#050d1a' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#050d1a" strokeWidth="2.5">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
          Test My Current Speed
        </button>
      </div>
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
