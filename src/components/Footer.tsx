export function Footer() {
  return (
    <footer
      className="mt-auto px-6 pb-12 pt-10"
      style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
    >
      <div className="max-w-4xl mx-auto">
        {/* How we test */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10">
          <div>
            <h3 className="font-semibold text-sm mb-3" style={{ color: 'rgba(255,255,255,0.7)' }}>
              How We Test
            </h3>
            <ol className="space-y-2.5">
              {[
                { n: '1', title: 'Ping & Jitter', desc: 'Six HEAD requests to a local file measure round-trip time and stability.' },
                { n: '2', title: 'Download Speed', desc: 'We fetch 1 MB and 10 MB binary files served from this site and measure throughput.' },
                { n: '3', title: 'Upload Speed', desc: 'Random data is POSTed to a CORS-enabled endpoint; we measure transfer rate.' },
              ].map(step => (
                <li key={step.n} className="flex gap-3">
                  <span
                    className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-mono font-bold mt-0.5"
                    style={{ background: 'rgba(34,211,238,0.12)', color: '#22d3ee' }}
                  >
                    {step.n}
                  </span>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.55)' }}>{step.title}</p>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.25)' }}>{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Privacy
            </h3>
            <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.3)' }}>
              Your IP address and speed results are <strong style={{ color: 'rgba(255,255,255,0.5)' }}>never sent to our servers</strong>.
              Test history is saved only in your browser&apos;s <code className="font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>localStorage</code> and
              can be cleared at any time from the History page.
            </p>
            <p className="text-xs mt-3 leading-relaxed" style={{ color: 'rgba(255,255,255,0.2)' }}>
              Your public IP is fetched from <span className="font-mono">ip-api.com</span> solely to display your ISP and location.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3" style={{ color: 'rgba(255,255,255,0.7)' }}>
              Open Source
            </h3>
            <p className="text-xs leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
              ShowMySpeed is fully open source. Inspect the code, suggest improvements, or self-host it.
            </p>
            <a
              href="https://github.com/ShopHeck/Showmyspeed"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-semibold transition-opacity hover:opacity-80"
              style={{ color: '#22d3ee' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
              </svg>
              View on GitHub
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
        >
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.12)' }}>
            © 2026 ShowMySpeed.com — Internet speed testing made simple.
          </p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.08)' }}>
            Speed Score and percentile data based on Ookla Q4 2024 global averages.
          </p>
        </div>
      </div>
    </footer>
  )
}
