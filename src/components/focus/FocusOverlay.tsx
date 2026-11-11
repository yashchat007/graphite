import { AnimatePresence, motion } from 'framer-motion'
import { useGraphiteStore } from '../../store/useGraphiteStore'
import { GlassCard } from '../ui/GlassCard'
import { PomodoroCard } from '../../features/focus/PomodoroCard'

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
          className="fixed inset-0 z-[45]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-xl"
            aria-hidden
            onClick={() => setFocusMode(false)}
          />
          <motion.div
            className="relative z-[1] mx-auto flex h-full max-w-lg flex-col items-center justify-center gap-6 p-6"
            initial={{ scale: 0.98 }}
            animate={{ scale: 1 }}
          >
            {task ? (
              <GlassCard className="w-full p-6 text-center">
                <p className="text-xs uppercase tracking-wider text-[#5A5A60]">Focus</p>
                <h2 className="mt-2 text-2xl font-semibold text-[#F2F2F3]">{task.title}</h2>
                <p className="mt-3 text-sm text-[#8A8A8F]">{task.description}</p>
              </GlassCard>
            ) : (
              <GlassCard className="w-full p-6 text-center text-sm text-[#8A8A8F]">
                Select a task and press F to focus.
              </GlassCard>
            )}
            <motion.div className="w-full max-w-sm">
              <PomodoroCard />
            </motion.div>
            <p className="text-xs text-[#5A5A60]">Press Esc to exit</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
