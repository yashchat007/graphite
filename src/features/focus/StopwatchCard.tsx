import { motion } from 'framer-motion'
import { Pause, Play, RotateCcw } from 'lucide-react'
import { useEffect } from 'react'
import { useGraphiteStore } from '../../store/useGraphiteStore'
import { GlassCard } from '../../components/ui/GlassCard'
import { Button } from '../../components/ui/Button'

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${m}:${String(s).padStart(2, '0')}`
}

export function StopwatchCard({ compact = false }: { compact?: boolean }) {
  const stopwatch = useGraphiteStore((s) => s.stopwatch)
  const tasks = useGraphiteStore((s) => s.tasks)
  const tickStopwatch = useGraphiteStore((s) => s.tickStopwatch)
  const startStopwatch = useGraphiteStore((s) => s.startStopwatch)
  const pauseStopwatch = useGraphiteStore((s) => s.pauseStopwatch)
  const resetStopwatch = useGraphiteStore((s) => s.resetStopwatch)
  const selectedTaskId = useGraphiteStore((s) => s.selectedTaskId)

  const focusTask = tasks.find((t) => t.id === (stopwatch.focusTaskId ?? selectedTaskId))

  useEffect(() => {
    if (!stopwatch.running) return
    const id = window.setInterval(() => tickStopwatch(), 1000)
    return () => clearInterval(id)
  }, [stopwatch.running, tickStopwatch])

  return (
    <GlassCard className={compact ? 'p-4' : 'p-5'}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-heading">Focus timer</h2>
        <span className="text-[11px] uppercase tracking-wide text-faint">Stopwatch</span>
      </div>

      <div className="flex flex-col items-center gap-3">
        <motion.span
          key={stopwatch.elapsedSeconds}
          initial={{ opacity: 0.85 }}
          animate={{ opacity: 1 }}
          className={
            compact
              ? 'text-2xl font-semibold tabular-nums text-heading'
              : 'text-4xl font-semibold tabular-nums text-heading'
          }
        >
          {formatElapsed(stopwatch.elapsedSeconds)}
        </motion.span>

        <p className="line-clamp-2 text-center text-xs text-muted">
          {focusTask ? focusTask.title : 'Select a task to focus'}
        </p>

        <motion.div className="flex flex-wrap justify-center gap-2">
          <Button
            variant="primary"
            onClick={() =>
              stopwatch.running ? pauseStopwatch() : startStopwatch(selectedTaskId ?? undefined)
            }
          >
            {stopwatch.running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {stopwatch.running ? 'Pause' : 'Start'}
          </Button>
          <Button variant="ghost" onClick={resetStopwatch}>
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </motion.div>
      </div>
    </GlassCard>
  )
}
