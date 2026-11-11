import { motion } from 'framer-motion'
import { Pause, Play, RotateCcw } from 'lucide-react'
import { useGraphiteStore } from '../../store/useGraphiteStore'
import {
  formatStopwatch,
  stopwatchElapsedMs,
  stopwatchMinuteSweep,
} from '../../lib/stopwatch'
import { GlassCard } from '../../components/ui/GlassCard'
import { Button } from '../../components/ui/Button'

export function PomodoroCard() {
  const focusStopwatch = useGraphiteStore((s) => s.focusStopwatch)
  const focusStopwatchClockMs = useGraphiteStore((s) => s.focusStopwatchClockMs)
  const tasks = useGraphiteStore((s) => s.tasks)
  const startFocusStopwatch = useGraphiteStore((s) => s.startFocusStopwatch)
  const pauseFocusStopwatch = useGraphiteStore((s) => s.pauseFocusStopwatch)
  const resetFocusStopwatch = useGraphiteStore((s) => s.resetFocusStopwatch)
  const selectedTaskId = useGraphiteStore((s) => s.selectedTaskId)

  const displayNow = focusStopwatch.running ? focusStopwatchClockMs : 0
  const elapsedMs = stopwatchElapsedMs(focusStopwatch, displayNow)
  const sweep = stopwatchMinuteSweep(focusStopwatch, displayNow)
  const circumference = 2 * Math.PI * 54
  const focusTask = tasks.find(
    (t) => t.id === (focusStopwatch.focusTaskId ?? selectedTaskId),
  )
  const display = formatStopwatch(elapsedMs)

  return (
    <GlassCard className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-heading">Focus</h2>
        <span className="text-[11px] uppercase tracking-wide text-faint">Stopwatch</span>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="relative h-36 w-36">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120" aria-hidden>
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="var(--aurora-timer-track)"
              strokeWidth="8"
            />
            <motion.circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="url(#focusRingGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset: circumference * (1 - sweep) }}
              transition={{ duration: 0.25, ease: 'linear' }}
            />
            <defs>
              <linearGradient id="focusRingGradient" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="var(--aurora-timer-ring)" />
                <stop offset="1" stopColor="var(--aurora-accent)" />
              </linearGradient>
            </defs>
          </svg>
          <motion.div
            key={display}
            initial={{ opacity: 0.85 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            <span className="text-3xl font-semibold tabular-nums text-heading">{display}</span>
          </motion.div>
        </div>

        <p className="line-clamp-2 text-center text-xs text-muted">
          {focusTask ? focusTask.title : 'Select a task to focus'}
        </p>

        <div className="flex flex-wrap justify-center gap-2">
          <Button
            variant="primary"
            onClick={() =>
              focusStopwatch.running
                ? pauseFocusStopwatch()
                : startFocusStopwatch(selectedTaskId ?? undefined)
            }
          >
            {focusStopwatch.running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {focusStopwatch.running ? 'Pause' : 'Start'}
          </Button>
          <Button variant="ghost" onClick={resetFocusStopwatch}>
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>
    </GlassCard>
  )
}
