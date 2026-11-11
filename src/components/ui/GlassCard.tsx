import { motion, type HTMLMotionProps } from 'framer-motion'
import { useReducedMotion } from '../../hooks/useReducedMotion'
import type { CSSProperties, ReactNode } from 'react'

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode
  className?: string
  hoverLift?: boolean
  cursorGlow?: boolean
}

export function GlassCard({
  children,
  className = '',
  hoverLift = false,
  cursorGlow = false,
  ...props
}: GlassCardProps) {
  const reduced = useReducedMotion()

  return (
    <motion.div
      className={`glass-panel relative overflow-visible ${className}`}
      whileHover={
        hoverLift && !reduced
          ? { y: -2, boxShadow: '0 12px 40px rgba(139, 127, 214, 0.12)' }
          : undefined
      }
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      onMouseMove={
        cursorGlow
          ? (e) => {
              const rect = e.currentTarget.getBoundingClientRect()
              const x = ((e.clientX - rect.left) / rect.width) * 100
              const y = ((e.clientY - rect.top) / rect.height) * 100
              e.currentTarget.style.setProperty('--mx', `${x}%`)
              e.currentTarget.style.setProperty('--my', `${y}%`)
            }
          : undefined
      }
      style={
        cursorGlow
          ? ({
              ['--mx' as string]: '50%',
              ['--my' as string]: '50%',
            } as CSSProperties)
          : undefined
      }
      {...props}
    >
      {cursorGlow && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: `radial-gradient(600px circle at var(--mx) var(--my), rgba(184, 174, 234, 0.18), transparent 40%)`,
          }}
        />
      )}
      <div className="relative z-[1]">{children}</div>
    </motion.div>
  )
}
