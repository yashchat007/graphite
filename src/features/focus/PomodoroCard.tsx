import { motion } from 'framer-motion'
import { Pause, Play, RotateCcw } from 'lucide-react'
import { useGraphiteStore } from '../../store/useGraphiteStore'
import { pomodoroProgress, pomodoroRemainingSeconds } from '../../lib/pomodoro'
import { GlassCard } from '../../components/ui/GlassCard'
import { Button } from '../../components/ui/Button'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function PomodoroCard() {
  const pomodoro = useGraphiteStore((s) => s.pomodoro)
  const pomodoroClockMs = useGraphiteStore((s) => s.pomodoroClockMs)
  const tasks = useGraphiteStore((s) => s.tasks)
  const startPomodoro = useGraphiteStore((s) => s.startPomodoro)
  const pausePomodoro = useGraphiteStore((s) => s.pausePomodoro)
  const resetPomodoro = useGraphiteStore((s) => s.resetPomodoro)
  const selectedTaskId = useGraphiteStore((s) => s.selectedTaskId)

  const displayNow = pomodoro.running ? pomodoroClockMs : 0
  const remaining = pomodoroRemainingSeconds(pomodoro, displayNow)
  const progress = pomodoroProgress(pomodoro, displayNow)
  const circumference = 2 * Math.PI * 54
  const focusTask = tasks.find((t) => t.id === (pomodoro.focusTaskId ?? selectedTaskId))

  return (
    <GlassCard className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-heading">Focus</h2>
        <span className="text-[11px] uppercase tracking-wide text-faint">
          {pomodoro.phase === 'work' ? '25 / 5' : 'Break'}
        </span>
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
              animate={{ strokeDashoffset: circumference * (1 - progress) }}
              transition={{ duration: 0.4 }}
            />
            <defs>
              <linearGradient id="focusRingGradient" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="var(--aurora-timer-ring)" />
                <stop offset="1" stopColor="var(--aurora-accent)" />
              </linearGradient>
            </defs>
          </svg>
          <motion.div
            key={remaining}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            <span className="text-3xl font-semibold tabular-nums text-heading">
              {formatTime(remaining)}
            </span>
          </motion.div>
        </div>

        <p className="line-clamp-2 text-center text-xs text-muted">
          {focusTask ? focusTask.title : 'Select a task to focus'}
        </p>

        <div className="flex flex-wrap justify-center gap-2">
          <Button
            variant="primary"
            onClick={() => (pomodoro.running ? pausePomodoro() : startPomodoro(selectedTaskId ?? undefined))}
          >
            {pomodoro.running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {pomodoro.running ? 'Pause' : 'Start'}
          </Button>
          <Button variant="ghost" onClick={resetPomodoro}>
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>
    </GlassCard>
  )
}
