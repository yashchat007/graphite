import { motion } from 'framer-motion'
import { useReducedMotion } from '../../hooks/useReducedMotion'

export function Background() {
  const reduced = useReducedMotion()

  return (
    <div className="mesh-backdrop pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <svg className="grain-overlay absolute inset-0 h-full w-full opacity-[0.03]" aria-hidden>
        <filter id="noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>

      {!reduced && (
        <>
          <motion.div
            className="drift-glow absolute -left-24 top-16 h-[520px] w-[520px] rounded-full blur-3xl"
            style={{
              background: `radial-gradient(circle, var(--aurora-blob-1) 0%, transparent 68%)`,
            }}
            animate={{ x: [0, 50, 0], y: [0, 35, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 48, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="drift-glow absolute -right-16 top-1/4 h-[560px] w-[560px] rounded-full blur-3xl"
            style={{
              background: `radial-gradient(circle, var(--aurora-blob-2) 0%, transparent 65%)`,
            }}
            animate={{ x: [0, -45, 0], y: [0, 50, 0], scale: [1, 1.08, 1] }}
            transition={{ duration: 52, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="drift-glow absolute bottom-0 left-1/4 h-[480px] w-[480px] rounded-full blur-3xl"
            style={{
              background: `radial-gradient(circle, var(--aurora-blob-3) 0%, transparent 70%)`,
            }}
            animate={{ x: [0, 35, 0], y: [0, -30, 0] }}
            transition={{ duration: 44, repeat: Infinity, ease: 'easeInOut' }}
          />
        </>
      )}
    </div>
  )
}
