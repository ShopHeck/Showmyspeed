interface HeaderProps {
  activeTab: 'test' | 'history'
  onTabChange: (tab: 'test' | 'history') => void
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  return (
    <header className="w-full flex items-center justify-between px-6 py-4 max-w-4xl mx-auto">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <svg width="28" height="28" viewBox="0 0 100 100" className="shrink-0">
          <circle cx="50" cy="50" r="45" fill="#0a1628" stroke="#22d3ee" strokeWidth="4" />
          <path d="M 20 65 A 35 35 0 0 1 80 65" fill="none" stroke="#1e3a5f" strokeWidth="8" strokeLinecap="round" />
          <path d="M 20 65 A 35 35 0 0 1 62 32" fill="none" stroke="#22d3ee" strokeWidth="8" strokeLinecap="round" />
          <line x1="50" y1="65" x2="62" y2="33" stroke="#22d3ee" strokeWidth="3" strokeLinecap="round" />
          <circle cx="50" cy="65" r="5" fill="#22d3ee" />
        </svg>
        <div>
          <span className="font-bold text-white text-lg leading-none tracking-tight">
            Show<span style={{ color: '#22d3ee' }}>My</span>Speed
          </span>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
            .com
          </p>
        </div>
      </div>

      {/* Tabs */}
      <nav
        className="flex rounded-xl overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {(['test', 'history'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className="px-5 py-2 text-sm font-medium capitalize transition-all"
            style={{
              color: activeTab === tab ? '#22d3ee' : 'rgba(255,255,255,0.35)',
              background: activeTab === tab ? 'rgba(34,211,238,0.1)' : 'transparent',
              borderRight: tab === 'test' ? '1px solid rgba(255,255,255,0.08)' : 'none',
            }}
          >
            {tab === 'test' ? 'Speed Test' : 'History'}
          </button>
        ))}
      </nav>
    </header>
  )
}
