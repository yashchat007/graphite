import { useEffect } from 'react'
import { useGraphiteStore } from '../store/useGraphiteStore'

/**
 * Single app-level clock: one interval drives pomodoro sync and UI ticks,
 * so duplicate PomodoroCard instances never double-speed the timer.
 */
export function usePomodoroClock() {
  const running = useGraphiteStore((s) => s.pomodoro.running)
  const syncPomodoro = useGraphiteStore((s) => s.syncPomodoro)

  useEffect(() => {
    if (!running) return
    const tick = () => syncPomodoro()
    tick()
    const id = window.setInterval(tick, 250)
    return () => clearInterval(id)
  }, [running, syncPomodoro])
}
