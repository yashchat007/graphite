import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { useGraphiteStore } from '../../store/useGraphiteStore'
import { GlassCard } from '../ui/GlassCard'
import { StopwatchCard } from '../../features/focus/StopwatchCard'
import { IstClock } from '../layout/IstClock'
import { Button } from '../ui/Button'

export function FocusOverlay() {
  const focusMode = useGraphiteStore((s) => s.focusMode)
  const focusTaskId = useGraphiteStore((s) => s.focusTaskId)
  const tasks = useGraphiteStore((s) => s.tasks)
  const setFocusMode = useGraphiteStore((s) => s.setFocusMode)

  const task = tasks.find((t) => t.id === focusTaskId)

  return (
    <AnimatePresence>
      {focusMode && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div className="absolute inset-0 bg-black/50 backdrop-blur-xl" aria-hidden />
          <motion.div
            className="glass-panel relative z-[1] flex w-full max-w-xl flex-col gap-6 p-6 md:p-8"
            initial={{ scale: 0.97, y: 12 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.97, y: 12 }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-faint">Focus mode</p>
                <h2 className="mt-1 text-xl font-semibold text-heading">
                  {task ? task.title : 'Pick a task'}
                </h2>
              </div>
              <Button variant="ghost" onClick={() => setFocusMode(false)} aria-label="Exit focus mode">
                <X className="h-5 w-5" />
                Exit
              </Button>
            </div>

            <div className="flex flex-col items-center gap-2 rounded-2xl border border-lavender/15 bg-white/40 px-6 py-5 text-center">
              <IstClock large />
            </div>

            {task && (
              <GlassCard className="p-4 text-center">
                <p className="text-sm text-muted">{task.description || 'No description'}</p>
              </GlassCard>
            )}

            <StopwatchCard />

            <p className="text-center text-xs text-faint">Press Esc to exit focus</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
