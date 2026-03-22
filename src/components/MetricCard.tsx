import { motion } from 'framer-motion'

interface MetricCardProps {
  label: string
  value: number | string
  unit: string
  color?: string
  icon?: string
  subtitle?: string
  animate?: boolean
}

export function MetricCard({
  label,
  value,
  unit,
  color = '#22d3ee',
  icon,
  subtitle,
  animate = false,
}: MetricCardProps) {
  return (
    <motion.div
      className="rounded-xl border px-5 py-4 flex flex-col gap-1"
      style={{
        background: 'rgba(255,255,255,0.03)',
        borderColor: 'rgba(255,255,255,0.07)',
      }}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center gap-2 mb-1">
        {icon && <span className="text-base leading-none">{icon}</span>}
        <span
          className="text-xs font-mono font-semibold tracking-widest uppercase"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          {label}
        </span>
      </div>

      <div className="flex items-baseline gap-1.5">
        <motion.span
          className="font-mono font-bold text-3xl tabular-nums leading-none"
          style={{ color, textShadow: animate ? `0 0 20px ${color}60` : 'none' }}
          key={String(value)}
          initial={{ opacity: 0.6, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {value}
        </motion.span>
        <span className="font-mono text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {unit}
        </span>
      </div>

      {subtitle && (
        <span className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
          {subtitle}
        </span>
      )}
    </motion.div>
  )
}
