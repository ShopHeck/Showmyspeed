import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts'
import type { LiveSample } from '../hooks/useSpeedTest'

interface Props {
  data: LiveSample[]
  activePhase: 'download' | 'upload'
  maxMbps: number
}

export function LiveSpeedChart({ data, activePhase, maxMbps }: Props) {
  const color = activePhase === 'download' ? '#22d3ee' : '#818cf8'
  const gradientId = `live-${activePhase}`

  // Only show current phase samples
  const chartData = data.filter(s => s.phase === activePhase)
  if (chartData.length < 2) return null

  return (
    <div className="w-full max-w-2xl" style={{ height: 72 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.25} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <YAxis domain={[0, maxMbps]} hide />
          <Area
            type="monotone"
            dataKey="mbps"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#${gradientId})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
