import { motion } from 'framer-motion'
import { useSyncStore } from '../../store/useSyncStore'

const TOOLTIP = {
  synced: 'Synced',
  syncing: 'Syncing',
  offline: 'Offline',
  'local-only': 'Offline',
} as const

const DOT = {
  synced: 'bg-[#9A9AA0]',
  syncing: 'bg-[#C7C7CC]',
  offline: 'bg-[#5A5A60]',
  'local-only': 'bg-[#5A5A60]',
} as const

export function SyncIndicator() {
  const status = useSyncStore((s) => (s.syncStatus === 'local-only' ? 'offline' : s.syncStatus))
  const displayStatus = useSyncStore((s) => s.syncStatus)
  const spin = displayStatus === 'syncing'

  return (
    <span className="group relative inline-flex h-2 w-2 shrink-0" role="status" aria-label={TOOLTIP[displayStatus]}>
      <motion.span
        className={`inline-block h-2 w-2 rounded-full ${DOT[status]}`}
        animate={spin ? { opacity: [1, 0.35, 1] } : { opacity: 1 }}
        transition={{ repeat: spin ? Infinity : 0, duration: 1.2, ease: 'easeInOut' }}
      />
      <span
        className="pointer-events-none absolute -bottom-8 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-md border border-white/10 bg-[#141416] px-2 py-1 text-[10px] text-[#C7C7CC] opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
        role="tooltip"
      >
        {TOOLTIP[displayStatus]}
      </span>
    </span>
  )
}
