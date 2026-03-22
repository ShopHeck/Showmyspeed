import { useState, useEffect, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from './components/Header'
import { Gauge } from './components/Gauge'
import { MetricCard } from './components/MetricCard'
import { ResultsPanel } from './components/ResultsPanel'
import { CompareISPs } from './components/CompareISPs'
import { SpeedTips } from './components/SpeedTips'
import { useSpeedTest } from './hooks/useSpeedTest'

const HistoryChart = lazy(() =>
  import('./components/HistoryChart').then(m => ({ default: m.HistoryChart }))
)
import { loadHistory } from './utils/storage'
import type { TestResult } from './types'

type Page = 'test' | 'compare' | 'tips' | 'history'

const DL_MAX = 1000
const UL_MAX = 500

function phaseLabel(phase: string): string {
  switch (phase) {
    case 'ping': return 'Measuring latency...'
    case 'download': return 'Testing download speed...'
    case 'upload': return 'Testing upload speed...'
    case 'complete': return 'Test complete'
    case 'error': return 'Test failed — try again'
    default: return ''
  }
}

export default function App() {
  const [page, setPage] = useState<Page>('test')
  const [history, setHistory] = useState<TestResult[]>([])
  const { phase, metrics, ipInfo, result, start, reset } = useSpeedTest()

  useEffect(() => {
    setHistory(loadHistory())
  }, [])

  useEffect(() => {
    if (phase === 'complete') {
      setHistory(loadHistory())
    }
  }, [phase])

  const isRunning = phase === 'ping' || phase === 'download' || phase === 'upload'
  const activeGauge = phase === 'download' ? 'download' : phase === 'upload' ? 'upload' : null

  function handleNavigate(p: Page) {
    setPage(p)
  }

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{ background: 'radial-gradient(ellipse at 50% 0%, #0a1628 0%, #050d1a 60%)' }}
    >
      {/* Grid overlay */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%2322d3ee' fill-opacity='0.02'%3E%3Crect x='29' y='0' width='2' height='60'/%3E%3Crect x='0' y='29' width='60' height='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px',
        }}
      />

      <Header activePage={page} onNavigate={handleNavigate} />

      <main className="flex-1 flex flex-col items-center px-4 pb-16 pt-4 relative">
        <AnimatePresence mode="wait">
          {page === 'test' && (
            <motion.div
              key="test"
              className="w-full max-w-4xl flex flex-col items-center gap-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AnimatePresence mode="wait">
                {(isRunning || phase === 'complete' || phase === 'error') && (
                  <motion.p
                    key={phase}
                    className="text-sm font-mono tracking-wide"
                    style={{ color: phase === 'error' ? '#f87171' : 'rgba(255,255,255,0.4)' }}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.3 }}
                  >
                    {phaseLabel(phase)}
                  </motion.p>
                )}
              </AnimatePresence>

              {phase !== 'complete' && (
                <motion.div className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12" layout>
                  <Gauge value={metrics.download} maxValue={DL_MAX} label="Download" color="#22d3ee" size={260} active={activeGauge === 'download'} />
                  <Gauge value={metrics.upload} maxValue={UL_MAX} label="Upload" color="#818cf8" size={260} active={activeGauge === 'upload'} />
                </motion.div>
              )}

              {phase !== 'idle' && phase !== 'complete' && (
                <motion.div
                  className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <MetricCard label="Ping" value={metrics.ping} unit="ms" color="#34d399" icon="⚡" animate={phase === 'ping'} />
                  <MetricCard label="Jitter" value={metrics.jitter} unit="ms" color="#fbbf24" icon="〰️" animate={phase === 'ping'} />
                  <MetricCard label="ISP" value={ipInfo?.isp ?? '—'} unit="" color="rgba(255,255,255,0.6)" icon="🌐" subtitle={ipInfo?.city ?? ''} />
                  <MetricCard label="Location" value={ipInfo?.country ?? '—'} unit="" color="rgba(255,255,255,0.6)" icon="📍" subtitle={ipInfo?.ip ?? ''} />
                </motion.div>
              )}

              {phase !== 'complete' && (
                <StartButton phase={phase} onStart={start} onStop={reset} />
              )}

              {phase === 'complete' && result && (
                <ResultsPanel
                  result={result}
                  onRetest={() => reset()}
                  onCompare={() => handleNavigate('tips')}
                />
              )}

              {phase === 'idle' && (
                <motion.div
                  className="flex flex-col items-center gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <p className="text-center text-sm max-w-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    Measures download, upload, ping & jitter using Cloudflare's global network. No signup. No ads. Nothing stored on servers.
                  </p>
                  <button
                    onClick={() => handleNavigate('compare')}
                    className="text-sm transition-colors"
                    style={{ color: '#22d3ee' }}
                  >
                    Compare Internet Providers →
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {page === 'tips' && result && (
            <motion.div
              key="tips"
              className="w-full max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <SpeedTips
                result={result}
                onCompare={() => handleNavigate('compare')}
                onRetest={() => { reset(); handleNavigate('test') }}
              />
            </motion.div>
          )}

          {page === 'compare' && (
            <motion.div
              key="compare"
              className="w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <CompareISPs onTestSpeed={() => { handleNavigate('test') }} />
            </motion.div>
          )}

          {page === 'history' && (
            <motion.div
              key="history"
              className="w-full max-w-3xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="font-mono text-sm uppercase tracking-widest mb-8 text-center" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Test History
              </h2>
              <Suspense fallback={
                <div className="text-center py-16" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  <p className="font-mono text-sm animate-pulse">Loading...</p>
                </div>
              }>
                <HistoryChart history={history} onClear={() => setHistory([])} />
              </Suspense>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer
        className="text-center pb-8 px-4 mt-auto"
        style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
      >
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.12)' }}>
          © 2026 ShowMySpeed.com — Internet speed testing made simple.
        </p>
      </footer>
    </div>
  )
}

function StartButton({ phase, onStart, onStop }: { phase: string; onStart: () => void; onStop: () => void }) {
  const isRunning = phase === 'ping' || phase === 'download' || phase === 'upload'
  const isError = phase === 'error'

  return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2, duration: 0.4 }}>
      {isRunning ? (
        <button
          onClick={onStop}
          className="group relative w-32 h-32 rounded-full flex items-center justify-center transition-all"
          style={{ background: 'rgba(239,68,68,0.08)', border: '2px solid rgba(239,68,68,0.3)' }}
        >
          <span className="font-mono font-semibold text-sm" style={{ color: '#f87171' }}>STOP</span>
          <svg className="absolute inset-0 w-full h-full animate-spin" style={{ animationDuration: '3s' }} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="none" stroke="#22d3ee" strokeWidth="2" strokeDasharray="60 230" strokeLinecap="round" />
          </svg>
        </button>
      ) : (
        <button
          onClick={onStart}
          className="group relative w-36 h-36 rounded-full flex flex-col items-center justify-center transition-all duration-300"
          style={{
            background: isError
              ? 'rgba(239,68,68,0.1)'
              : 'radial-gradient(circle at 40% 35%, rgba(34,211,238,0.2) 0%, rgba(34,211,238,0.05) 100%)',
            border: `2px solid ${isError ? 'rgba(239,68,68,0.4)' : 'rgba(34,211,238,0.4)'}`,
            boxShadow: isError ? 'none' : '0 0 40px rgba(34,211,238,0.1), inset 0 0 40px rgba(34,211,238,0.05)',
          }}
          onMouseEnter={e => {
            if (!isError) {
              ;(e.currentTarget as HTMLElement).style.boxShadow = '0 0 60px rgba(34,211,238,0.25), inset 0 0 40px rgba(34,211,238,0.1)'
              ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(34,211,238,0.7)'
            }
          }}
          onMouseLeave={e => {
            if (!isError) {
              ;(e.currentTarget as HTMLElement).style.boxShadow = '0 0 40px rgba(34,211,238,0.1), inset 0 0 40px rgba(34,211,238,0.05)'
              ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(34,211,238,0.4)'
            }
          }}
        >
          <span className="font-mono font-bold text-lg tracking-widest" style={{ color: isError ? '#f87171' : '#22d3ee' }}>
            {isError ? 'RETRY' : 'GO'}
          </span>
          <span className="font-mono text-xs mt-1 tracking-wide" style={{ color: isError ? 'rgba(248,113,113,0.6)' : 'rgba(34,211,238,0.5)' }}>
            {isError ? 'try again' : 'start test'}
          </span>
        </button>
      )}
    </motion.div>
  )
}
