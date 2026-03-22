import { useState } from 'react'

type Page = 'test' | 'compare' | 'history'

interface HeaderProps {
  activePage: Page
  onNavigate: (page: Page) => void
}

export function Header({ activePage, onNavigate }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <header
        className="w-full flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Logo */}
        <button
          onClick={() => { onNavigate('test'); setMenuOpen(false) }}
          className="flex items-center gap-2.5"
        >
          <div
            className="flex items-center justify-center rounded-lg"
            style={{ width: 36, height: 36, background: 'rgba(34,211,238,0.15)', border: '1px solid rgba(34,211,238,0.3)' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L4.5 13.5H11L10 22L20.5 9.5H14L13 2Z" fill="#22d3ee" stroke="#22d3ee" strokeWidth="1" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-tight">
            <span className="text-white">show</span>
            <span style={{ color: '#22d3ee' }}>myspeed</span>
          </span>
        </button>

        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex flex-col gap-1.5 p-1"
          aria-label="Menu"
        >
          <span
            className="block w-5 h-0.5 transition-all"
            style={{
              background: 'rgba(255,255,255,0.6)',
              transform: menuOpen ? 'translateY(8px) rotate(45deg)' : 'none',
            }}
          />
          <span
            className="block w-5 h-0.5 transition-all"
            style={{
              background: 'rgba(255,255,255,0.6)',
              opacity: menuOpen ? 0 : 1,
            }}
          />
          <span
            className="block w-5 h-0.5 transition-all"
            style={{
              background: 'rgba(255,255,255,0.6)',
              transform: menuOpen ? 'translateY(-8px) rotate(-45deg)' : 'none',
            }}
          />
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col"
          style={{ background: '#050d1a' }}
        >
          {/* Menu Header */}
          <div
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="flex items-center justify-center rounded-lg"
                style={{ width: 36, height: 36, background: 'rgba(34,211,238,0.15)', border: '1px solid rgba(34,211,238,0.3)' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M13 2L4.5 13.5H11L10 22L20.5 9.5H14L13 2Z" fill="#22d3ee" stroke="#22d3ee" strokeWidth="1" strokeLinejoin="round" />
                </svg>
              </div>
              <span className="text-lg font-bold tracking-tight">
                <span className="text-white">show</span>
                <span style={{ color: '#22d3ee' }}>myspeed</span>
              </span>
            </div>
            <button onClick={() => setMenuOpen(false)} className="p-1">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8">
            {/* Description */}
            <p style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>
              The fastest way to test your internet speed and discover better plans in your area. Free, accurate, no signup required.
            </p>

            {/* Tools */}
            <div>
              <p className="text-sm font-semibold text-white mb-3">Tools</p>
              <div className="space-y-1">
                {[
                  { label: 'Speed Test', page: 'test' as Page },
                  { label: 'Compare ISPs', page: 'compare' as Page },
                  { label: 'History', page: 'history' as Page },
                ].map(({ label, page }) => (
                  <button
                    key={page}
                    onClick={() => { onNavigate(page); setMenuOpen(false) }}
                    className="block w-full text-left py-2.5 text-sm transition-colors"
                    style={{
                      color: activePage === page ? '#22d3ee' : 'rgba(255,255,255,0.45)',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Guides */}
            <div>
              <p className="text-sm font-semibold text-white mb-3">Popular Guides</p>
              <div className="space-y-1">
                {['Fix Slow Internet', 'Best Routers 2025', 'Is My ISP Throttling?', 'Wi-Fi vs Ethernet'].map((guide) => (
                  <button
                    key={guide}
                    className="block w-full text-left py-2.5 text-sm"
                    style={{ color: 'rgba(255,255,255,0.45)' }}
                  >
                    {guide}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
              © 2026 ShowMySpeed.com — Internet speed testing made simple.
            </p>
          </div>
        </div>
      )}
    </>
  )
}
