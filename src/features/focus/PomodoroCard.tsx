import { motion } from 'framer-motion'
import { Pause, Play, RotateCcw } from 'lucide-react'
import { useEffect } from 'react'
import { useGraphiteStore } from '../../store/useGraphiteStore'
import { GlassCard } from '../../components/ui/GlassCard'
import { Button } from '../../components/ui/Button'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function PomodoroCard() {
  const pomodoro = useGraphiteStore((s) => s.pomodoro)
  const tasks = useGraphiteStore((s) => s.tasks)
  const tickPomodoro = useGraphiteStore((s) => s.tickPomodoro)
  const startPomodoro = useGraphiteStore((s) => s.startPomodoro)
  const pausePomodoro = useGraphiteStore((s) => s.pausePomodoro)
  const resetPomodoro = useGraphiteStore((s) => s.resetPomodoro)
  const selectedTaskId = useGraphiteStore((s) => s.selectedTaskId)

  const total = pomodoro.phase === 'work' ? pomodoro.workSeconds : pomodoro.breakSeconds
  const progress = 1 - pomodoro.remaining / total
  const circumference = 2 * Math.PI * 54
  const focusTask = tasks.find(
    (t) => t.id === (pomodoro.focusTaskId ?? selectedTaskId),
  )

  useEffect(() => {
    if (!pomodoro.running) return
    const id = window.setInterval(() => tickPomodoro(), 1000)
    return () => clearInterval(id)
  }, [pomodoro.running, tickPomodoro])

  return (
    <GlassCard className="p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[#F2F2F3]">Focus</h2>
        <span className="text-[11px] uppercase tracking-wide text-[#5A5A60]">
          {pomodoro.phase === 'work' ? '25 / 5' : 'Break'}
        </span>
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="relative h-36 w-36">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120" aria-hidden>
            <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
            <motion.circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="url(#silverRing)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              animate={{ strokeDashoffset: circumference * (1 - progress) }}
              transition={{ duration: 0.4 }}
            />
            <defs>
              <linearGradient id="silverRing" x1="0" y1="0" x2="1" y2="1">
                <stop stopColor="#E6E6E8" />
                <stop offset="1" stopColor="#9A9AA0" />
              </linearGradient>
            </defs>
          </svg>
          <motion.div
            key={pomodoro.remaining}
            initial={{ opacity: 0.5 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            <span className="text-3xl font-semibold tabular-nums text-[#F2F2F3]">
              {formatTime(pomodoro.remaining)}
            </span>
          </motion.div>
        </div>

        <p className="line-clamp-2 text-center text-xs text-[#8A8A8F]">
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
