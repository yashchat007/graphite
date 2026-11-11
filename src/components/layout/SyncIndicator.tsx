import { motion } from 'framer-motion'
import { Cloud, CloudOff, Loader2 } from 'lucide-react'
import { useSyncStore } from '../../store/useSyncStore'

const LABELS = {
  synced: 'Synced',
  syncing: 'Syncing…',
  offline: 'Offline',
  'local-only': 'Local only',
} as const

export function SyncIndicator() {
  const status = useSyncStore((s) => s.syncStatus)

  const Icon = status === 'offline' ? CloudOff : status === 'syncing' ? Loader2 : Cloud
  const spin = status === 'syncing'

  return (
    <div
      className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-[#8A8A8F]"
      role="status"
      aria-live="polite"
      aria-label={`Sync status: ${LABELS[status]}`}
    >
      <motion.span animate={spin ? { rotate: 360 } : { rotate: 0 }} transition={{ repeat: spin ? Infinity : 0, duration: 1, ease: 'linear' }}>
        <Icon className="h-3.5 w-3.5" />
      </motion.span>
      <span className="hidden sm:inline">{LABELS[status]}</span>
    </div>
  )
}
