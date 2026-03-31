import { useState, useEffect, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from './components/Header'
import { Gauge } from './components/Gauge'
import { MetricCard } from './components/MetricCard'
import { ResultsPanel } from './components/ResultsPanel'
import { CompareISPs } from './components/CompareISPs'
import { SpeedTips } from './components/SpeedTips'
import { Footer } from './components/Footer'
import { useSpeedTest } from './hooks/useSpeedTest'
import { fetchIpInfo } from './utils/speedTest'
import { FixSlowInternet } from './components/guides/FixSlowInternet'
import { BestRouters } from './components/guides/BestRouters'
import { IspThrottling } from './components/guides/IspThrottling'
import { WifiVsEthernet } from './components/guides/WifiVsEthernet'

const HistoryChart = lazy(() =>
  import('./components/HistoryChart').then(m => ({ default: m.HistoryChart }))
)
import { loadHistory } from './utils/storage'
import type { TestResult } from './types'

type Page = 'test' | 'compare' | 'tips' | 'history'
  | 'fix-slow-internet' | 'best-routers' | 'isp-throttling' | 'wifi-vs-ethernet'

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
  const [idleIpInfo, setIdleIpInfo] = useState<{ isp?: string; city?: string; country?: string } | null>(null)
  const [lastResult, setLastResult] = useState<TestResult | null>(null)
  const [showTips, setShowTips] = useState(false)
  const { phase, metrics, ipInfo, result, start, reset } = useSpeedTest()

  useEffect(() => {
    setHistory(loadHistory())
    fetchIpInfo().then(info => { if (info) setIdleIpInfo(info) })
  }, [])

  useEffect(() => {
    if (phase === 'complete' && result) {
      setLastResult(result)
      setHistory(loadHistory())
    }
    if (phase === 'idle') {
      setShowTips(false)
    }
  }, [phase, result])


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
      {/* Animated background orbs */}
      <div className="orb orb-cyan" aria-hidden="true" />
      <div className="orb orb-indigo" aria-hidden="true" />

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
              exit={{ opacity: 0, transition: { duration: 0 } }}
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

              {phase === 'complete' && result && !showTips && (
                <ResultsPanel
                  result={result}
                  onRetest={() => reset()}
                  onCompare={() => {
                    setLastResult(result)
                    setShowTips(true)
                  }}
                />
              )}

              {phase === 'complete' && showTips && lastResult && (
                <SpeedTips
                  result={lastResult}
                  onCompare={() => handleNavigate('compare')}
                  onRetest={() => { setShowTips(false); reset() }}
                />
              )}

              {phase === 'idle' && (
                <motion.div
                  className="flex flex-col items-center gap-5 w-full max-w-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {/* ISP detection card */}
                  <AnimatePresence>
                    {idleIpInfo && (
                      <motion.div
                        className="flex items-center gap-3 px-5 py-2.5 rounded-full"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#34d399', boxShadow: '0 0 6px #34d399' }} />
                        <span className="text-sm">
                          <span style={{ color: 'rgba(255,255,255,0.85)' }}>{idleIpInfo.isp}</span>
                          {idleIpInfo.city && (
                            <span style={{ color: 'rgba(255,255,255,0.35)' }}> · {idleIpInfo.city}, {idleIpInfo.country}</span>
                          )}
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Feature pills */}
                  <div className="flex flex-wrap justify-center gap-2">
                    {['No account required', 'No ads ever', 'Data stays on device'].map(pill => (
                      <span
                        key={pill}
                        className="text-xs px-3 py-1 rounded-full"
                        style={{
                          background: 'rgba(34,211,238,0.06)',
                          border: '1px solid rgba(34,211,238,0.14)',
                          color: 'rgba(34,211,238,0.65)',
                        }}
                      >
                        ✓ {pill}
                      </span>
                    ))}
                  </div>

                  {/* How it works: 3 steps */}
                  <div className="flex items-center gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.18)' }}>
                    {[
                      { icon: '⚡', label: 'Measure ping' },
                      { icon: '⬇', label: 'Download test' },
                      { icon: '⬆', label: 'Upload test' },
                    ].map((step, i, arr) => (
                      <span key={step.label} className="flex items-center gap-1.5">
                        <span>{step.icon}</span>
                        <span>{step.label}</span>
                        {i < arr.length - 1 && <span className="ml-1" style={{ color: 'rgba(255,255,255,0.1)' }}>→</span>}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => handleNavigate('compare')}
                    className="text-sm transition-colors"
                    style={{ color: 'rgba(34,211,238,0.55)' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#22d3ee' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(34,211,238,0.55)' }}
                  >
                    Compare Internet Providers →
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}


          {page === 'compare' && (
            <motion.div
              key="compare"
              className="w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0 } }}
              transition={{ duration: 0.3 }}
            >
              <CompareISPs onTestSpeed={() => { handleNavigate('test') }} />
            </motion.div>
          )}

          {page === 'fix-slow-internet' && (
            <motion.div key="fix-slow-internet" className="w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0 } }} transition={{ duration: 0.3 }}>
              <FixSlowInternet onTestSpeed={() => handleNavigate('test')} onCompare={() => handleNavigate('compare')} />
            </motion.div>
          )}

          {page === 'best-routers' && (
            <motion.div key="best-routers" className="w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0 } }} transition={{ duration: 0.3 }}>
              <BestRouters onTestSpeed={() => handleNavigate('test')} />
            </motion.div>
          )}

          {page === 'isp-throttling' && (
            <motion.div key="isp-throttling" className="w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0 } }} transition={{ duration: 0.3 }}>
              <IspThrottling onTestSpeed={() => handleNavigate('test')} onCompare={() => handleNavigate('compare')} />
            </motion.div>
          )}

          {page === 'wifi-vs-ethernet' && (
            <motion.div key="wifi-vs-ethernet" className="w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: 0 } }} transition={{ duration: 0.3 }}>
              <WifiVsEthernet onTestSpeed={() => handleNavigate('test')} />
            </motion.div>
          )}

          {page === 'history' && (
            <motion.div
              key="history"
              className="w-full max-w-3xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0 } }}
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

      <Footer />
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
