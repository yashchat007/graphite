import { motion } from 'framer-motion'
import { useReducedMotion } from '../../hooks/useReducedMotion'

interface ProgressBarProps {
  value: number
  striped?: boolean
  className?: string
}

export function ProgressBar({ value, striped = true, className = '' }: ProgressBarProps) {
  const reduced = useReducedMotion()
  return (
    <div
      className={`h-2 w-full overflow-hidden rounded-full bg-white/5 ${className}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className={`silver-gradient h-full rounded-full ${striped && !reduced ? 'progress-shimmer' : ''}`}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ type: 'spring', stiffness: 120, damping: 20 }}
      />
    </div>
  )
}
