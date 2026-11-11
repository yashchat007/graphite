import { motion } from 'framer-motion'
import { useReducedMotion } from '../../hooks/useReducedMotion'

export function Background() {
  const reduced = useReducedMotion()

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-bg">
      <svg className="grain-overlay absolute inset-0 h-full w-full opacity-[0.03]" aria-hidden>
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>

      {!reduced && (
        <>
          <motion.div
            className="drift-glow absolute -left-32 top-20 h-[480px] w-[480px] rounded-full opacity-70"
            style={{
              background: 'radial-gradient(circle, rgba(184, 174, 234, 0.35) 0%, transparent 70%)',
            }}
            animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
            transition={{ duration: 50, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="drift-glow absolute right-0 top-1/3 h-[520px] w-[520px] rounded-full opacity-60"
            style={{
              background: 'radial-gradient(circle, rgba(232, 180, 160, 0.22) 0%, transparent 68%)',
            }}
            animate={{ x: [0, -50, 0], y: [0, 40, 0] }}
            transition={{ duration: 55, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="drift-glow absolute bottom-0 left-1/3 h-[400px] w-[400px] rounded-full opacity-50"
            style={{
              background: 'radial-gradient(circle, rgba(139, 127, 214, 0.2) 0%, transparent 70%)',
            }}
            animate={{ x: [0, 30, 0], y: [0, -25, 0] }}
            transition={{ duration: 45, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      )}
    </div>
  )
}
