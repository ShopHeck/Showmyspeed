import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import type { TestResult } from '../types'
import { clearHistory } from '../utils/storage'

interface HistoryChartProps {
  history: TestResult[]
  onClear: () => void
}

function fmt(v: number) {
  return v >= 100 ? Math.round(v).toString() : v.toFixed(1)
}

function shortDate(ts: number) {
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div
      className="rounded-xl p-3 text-xs font-mono space-y-1"
      style={{
        background: '#0a1628',
        border: '1px solid rgba(34,211,238,0.2)',
        color: 'rgba(255,255,255,0.7)',
      }}
    >
      <p className="text-white/40 mb-1">{label}</p>
      {payload.map((p: { color: string; name: string; value: number }) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {fmt(p.value)} Mbps
        </p>
      ))}
    </div>
  )
}

export function HistoryChart({ history, onClear }: HistoryChartProps) {
  const [confirmClear, setConfirmClear] = useState(false)

  if (history.length === 0) {
    return (
      <div className="text-center py-16" style={{ color: 'rgba(255,255,255,0.2)' }}>
        <p className="text-5xl mb-4">📊</p>
        <p className="font-mono text-sm">No test history yet.</p>
        <p className="text-xs mt-1">Run a speed test to start tracking.</p>
      </div>
    )
  }

  const chartData = [...history]
    .reverse()
    .slice(-20)
    .map(r => ({
      label: shortDate(r.timestamp),
      Download: r.download,
      Upload: r.upload,
    }))

  function handleClear() {
    if (!confirmClear) {
      setConfirmClear(true)
      setTimeout(() => setConfirmClear(false), 3000)
      return
    }
    clearHistory()
    onClear()
    setConfirmClear(false)
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Chart */}
      <div
        className="rounded-2xl p-6"
        style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
      >
        <p className="text-xs font-mono uppercase tracking-widest mb-6" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Speed over time (last 20 tests)
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 4, left: -16 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="4 4" />
            <XAxis
              dataKey="label"
              tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: 'rgba(255,255,255,0.2)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              tickLine={false}
              axisLine={false}
              unit=" M"
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="Download"
              stroke="#22d3ee"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#22d3ee' }}
            />
            <Line
              type="monotone"
              dataKey="Upload"
              stroke="#818cf8"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#818cf8' }}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex gap-6 mt-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-0.5 rounded-full inline-block" style={{ background: '#22d3ee' }} />
            <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>Download</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-0.5 rounded-full inline-block" style={{ background: '#818cf8' }} />
            <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>Upload</span>
          </div>
        </div>
      </div>

      {/* History list */}
      <div className="space-y-2">
        {history.slice(0, 10).map((r) => (
          <div
            key={r.id}
            className="rounded-xl px-4 py-3 flex items-center justify-between gap-4"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
          >
            <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.2)', minWidth: 100 }}>
              {shortDate(r.timestamp)}
            </span>
            <div className="flex gap-6 flex-wrap">
              <span className="text-sm font-mono font-bold" style={{ color: '#22d3ee' }}>
                ↓ {fmt(r.download)}
              </span>
              <span className="text-sm font-mono font-bold" style={{ color: '#818cf8' }}>
                ↑ {fmt(r.upload)}
              </span>
              <span className="text-sm font-mono" style={{ color: '#34d399' }}>
                {r.ping}ms
              </span>
              <span className="text-sm font-mono" style={{ color: '#fbbf24' }}>
                ±{r.jitter}ms
              </span>
            </div>
            {r.isp && (
              <span className="text-xs hidden md:block truncate max-w-[140px]" style={{ color: 'rgba(255,255,255,0.15)' }}>
                {r.isp}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Clear button */}
      <div className="text-center pt-2">
        <button
          onClick={handleClear}
          className="text-xs font-mono px-4 py-2 rounded-lg transition-all"
          style={{
            color: confirmClear ? '#f87171' : 'rgba(255,255,255,0.2)',
            border: `1px solid ${confirmClear ? 'rgba(248,113,113,0.3)' : 'rgba(255,255,255,0.08)'}`,
            background: 'transparent',
          }}
        >
          {confirmClear ? 'Click again to confirm delete' : 'Clear history'}
        </button>
      </div>
    </motion.div>
  )
}
