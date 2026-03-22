import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

interface GaugeProps {
  value: number      // current speed in Mbps
  maxValue: number   // max for the gauge arc
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

  // Arc spans from 225° to 315° (270° sweep — bottom open)
  const startAngle = 225
  const endAngle = 315
  const totalSweep = 360 - (endAngle - startAngle) // 270°

  const pct = Math.min(value / maxValue, 1)
  const fillSweep = pct * totalSweep

  const circumference = 2 * Math.PI * radius
  const arcRatio = totalSweep / 360
  const totalArcLen = circumference * arcRatio
  const fillArcLen = totalArcLen * pct

  // Convert angle to SVG coords
  function polarToCart(angleDeg: number, r: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    }
  }

  function describeArc(start: number, sweep: number, r: number) {
    const end = start + sweep
    const p1 = polarToCart(start, r)
    const p2 = polarToCart(end, r)
    const large = sweep > 180 ? 1 : 0
    return `M ${p1.x} ${p1.y} A ${r} ${r} 0 ${large} 1 ${p2.x} ${p2.y}`
  }

  const trackPath = describeArc(startAngle, totalSweep, radius)

  // Animated fill length
  const motionVal = useMotionValue(0)
  const spring = useSpring(motionVal, { stiffness: 80, damping: 20 })
  const fillLenRef = useRef(0)

  useEffect(() => {
    motionVal.set(fillArcLen)
  }, [fillArcLen, motionVal])

  useEffect(() => {
    return spring.on('change', (v) => {
      fillLenRef.current = v
    })
  }, [spring])

  // Needle angle
  const needleAngle = startAngle + fillSweep
  const needleSpring = useSpring(useMotionValue(startAngle), { stiffness: 80, damping: 20 })
  useEffect(() => {
    needleSpring.set(needleAngle)
  }, [needleAngle, needleSpring])

  // Tick marks
  const ticks = Array.from({ length: 11 }, (_, i) => {
    const t = i / 10
    const angle = startAngle + t * totalSweep
    const inner = polarToCart(angle, radius - strokeWidth / 2 - 8)
    const outer = polarToCart(angle, radius + strokeWidth / 2 + 4)
    const isMajor = i % 2 === 0
    return { inner, outer, isMajor, t }
  })

  return (
    <div className="flex flex-col items-center select-none" style={{ width: size }}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="overflow-visible">
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <linearGradient id={`gauge-grad-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={color} stopOpacity="0.6" />
              <stop offset="100%" stopColor={color} />
            </linearGradient>
          </defs>

          {/* Outer ring (very subtle) */}
          <circle
            cx={cx} cy={cy} r={radius + strokeWidth / 2 + 12}
            fill="none"
            stroke="rgba(255,255,255,0.03)"
            strokeWidth={1}
          />

          {/* Track arc */}
          <path
            d={trackPath}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Tick marks */}
          {ticks.map((tick, i) => (
            <line
              key={i}
              x1={tick.inner.x} y1={tick.inner.y}
              x2={tick.outer.x} y2={tick.outer.y}
              stroke={`rgba(255,255,255,${tick.isMajor ? 0.2 : 0.08})`}
              strokeWidth={tick.isMajor ? 2 : 1}
            />
          ))}

          {/* Fill arc — animated via motion */}
          <motion.path
            d={describeArc(startAngle, totalSweep, radius)}
            fill="none"
            stroke={`url(#gauge-grad-${label})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            filter="url(#glow)"
            strokeDasharray={`${totalArcLen}`}
            style={{
              strokeDashoffset: spring.get() === 0
                ? totalArcLen
                : totalArcLen - spring.get(),
            }}
            initial={{ strokeDashoffset: totalArcLen }}
            animate={{ strokeDashoffset: totalArcLen - fillArcLen }}
            transition={{ type: 'spring', stiffness: 60, damping: 20 }}
          />

          {/* Needle */}
          <motion.g
            style={{
              transformOrigin: `${cx}px ${cy}px`,
            }}
            animate={{ rotate: needleAngle - startAngle - totalSweep / 2 + totalSweep / 2 }}
            // Simpler approach:
          >
          </motion.g>

          {/* Center circle */}
          <circle cx={cx} cy={cy} r={size * 0.08} fill="#0a1628" />
          <circle cx={cx} cy={cy} r={size * 0.045} fill={active ? color : 'rgba(255,255,255,0.15)'}
            style={{ filter: active ? `drop-shadow(0 0 8px ${color})` : 'none' }}
          />
        </svg>

        {/* Center readout */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          style={{ paddingBottom: size * 0.06 }}
        >
          <motion.span
            className="font-mono font-bold leading-none tabular-nums"
            style={{
              fontSize: value >= 1000 ? size * 0.13 : size * 0.17,
              color: active ? color : 'white',
              textShadow: active ? `0 0 20px ${color}80` : 'none',
            }}
            key={Math.round(value)}
            initial={{ scale: 0.95, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.15 }}
          >
            {value >= 1000
              ? (value / 1000).toFixed(2)
              : value >= 100
              ? Math.round(value).toString()
              : value.toFixed(1)}
          </motion.span>
          <span
            className="font-mono text-xs mt-1 tracking-widest uppercase"
            style={{ color: 'rgba(255,255,255,0.35)', fontSize: size * 0.045 }}
          >
            {value >= 1000 ? 'Gbps' : unit}
          </span>
        </div>
      </div>

      {/* Label below gauge */}
      <span
        className="font-mono font-semibold tracking-widest uppercase mt-1"
        style={{ color: active ? color : 'rgba(255,255,255,0.4)', fontSize: size * 0.052 }}
      >
        {label}
      </span>
    </div>
  )
}
