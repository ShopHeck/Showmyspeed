import { motion } from 'framer-motion'

interface GaugeProps {
  value: number
  maxValue: number
  label: string
  unit?: string
  size?: number
  color?: string
  active?: boolean
}

export function Gauge({
  value,
  maxValue,
  label,
  unit = 'Mbps',
  size = 280,
  color = '#22d3ee',
  active = false,
}: GaugeProps) {
  const cx = size / 2
  const cy = size / 2
  const radius = (size / 2) * 0.78
  const strokeWidth = size * 0.055

  // Arc: 225° → 315° clockwise (270° sweep, open at bottom)
  const startAngle = 225
  const totalSweep = 270

  const pct = Math.min(Math.max(value / maxValue, 0), 1)

  function polarToCart(angleDeg: number, r: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  }

  function describeArc(start: number, sweep: number, r: number) {
    const end = start + sweep
    const p1 = polarToCart(start, r)
    const p2 = polarToCart(end, r)
    const large = sweep > 180 ? 1 : 0
    return `M ${p1.x} ${p1.y} A ${r} ${r} 0 ${large} 1 ${p2.x} ${p2.y}`
  }

  const circumference = 2 * Math.PI * radius
  const totalArcLen = circumference * (totalSweep / 360)
  const fillArcLen = totalArcLen * pct
  const dashOffset = totalArcLen - fillArcLen

  // Needle
  const needleAngle = startAngle + pct * totalSweep
  const needleTip = polarToCart(needleAngle, radius * 0.72)
  const needleBase1 = polarToCart(needleAngle - 90, size * 0.025)
  const needleBase2 = polarToCart(needleAngle + 90, size * 0.025)

  // Ticks
  const ticks = Array.from({ length: 11 }, (_, i) => {
    const t = i / 10
    const angle = startAngle + t * totalSweep
    const inner = polarToCart(angle, radius - strokeWidth / 2 - 6)
    const outer = polarToCart(angle, radius + strokeWidth / 2 + 3)
    return { inner, outer, major: i % 2 === 0 }
  })

  const gradId = `grad-${label.replace(/\s/g, '')}`

  return (
    <div className="flex flex-col items-center select-none" style={{ width: size }}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="overflow-visible">
          <defs>
            <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color} stopOpacity="0.5" />
              <stop offset="100%" stopColor={color} />
            </linearGradient>
            <filter id={`glow-${label}`} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Track */}
          <path
            d={describeArc(startAngle, totalSweep, radius)}
            fill="none"
            stroke="rgba(255,255,255,0.07)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Ticks */}
          {ticks.map((t, i) => (
            <line
              key={i}
              x1={t.inner.x} y1={t.inner.y}
              x2={t.outer.x} y2={t.outer.y}
              stroke={`rgba(255,255,255,${t.major ? 0.2 : 0.07})`}
              strokeWidth={t.major ? 2 : 1}
            />
          ))}

          {/* Fill arc */}
          <motion.path
            d={describeArc(startAngle, totalSweep, radius)}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            filter={active ? `url(#glow-${label})` : undefined}
            strokeDasharray={totalArcLen}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ type: 'spring', stiffness: 60, damping: 18, mass: 0.8 }}
            initial={{ strokeDashoffset: totalArcLen }}
          />

          {/* Needle */}
          <motion.polygon
            points={`${needleTip.x},${needleTip.y} ${needleBase1.x},${needleBase1.y} ${needleBase2.x},${needleBase2.y}`}
            fill={active ? color : 'rgba(255,255,255,0.5)'}
            filter={active ? `url(#glow-${label})` : undefined}
            animate={{
              points: `${needleTip.x},${needleTip.y} ${needleBase1.x},${needleBase1.y} ${needleBase2.x},${needleBase2.y}`
            }}
            transition={{ type: 'spring', stiffness: 60, damping: 18, mass: 0.8 }}
          />

          {/* Center cap */}
          <circle cx={cx} cy={cy} r={size * 0.07} fill="#0a1628" />
          <circle
            cx={cx} cy={cy} r={size * 0.04}
            fill={active ? color : 'rgba(255,255,255,0.2)'}
            style={{ filter: active ? `drop-shadow(0 0 6px ${color})` : 'none' }}
          />
        </svg>

        {/* Readout */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          style={{ paddingBottom: size * 0.05 }}
        >
          <motion.span
            className="font-mono font-bold leading-none tabular-nums"
            style={{
              fontSize: value >= 1000 ? size * 0.13 : size * 0.17,
              color: active ? color : 'white',
              textShadow: active ? `0 0 20px ${color}80` : 'none',
            }}
            key={Math.round(value)}
            initial={{ opacity: 0.7 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1 }}
          >
            {value >= 1000
              ? (value / 1000).toFixed(2)
              : value >= 100
              ? Math.round(value).toString()
              : value.toFixed(1)}
          </motion.span>
          <span
            className="font-mono uppercase tracking-widest mt-1"
            style={{ color: 'rgba(255,255,255,0.35)', fontSize: size * 0.044 }}
          >
            {value >= 1000 ? 'Gbps' : unit}
          </span>
        </div>
      </div>

      <span
        className="font-mono font-semibold tracking-widest uppercase mt-1"
        style={{ color: active ? color : 'rgba(255,255,255,0.4)', fontSize: size * 0.05 }}
      >
        {label}
      </span>
    </div>
  )
}
