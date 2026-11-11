import { useEffect } from 'react'
import { useGraphiteStore } from '../store/useGraphiteStore'

/**
 * Single app-level clock: one interval bumps UI ticks so duplicate
 * StopwatchCard instances never register more than one stopwatch interval.
 */
export function useFocusStopwatchClock() {
  const running = useGraphiteStore((s) => s.stopwatch.running)
  const syncStopwatch = useGraphiteStore((s) => s.syncStopwatch)

  useEffect(() => {
    if (!running) return
    const tick = () => syncStopwatch()
    tick()
    const id = window.setInterval(tick, 250)
    return () => clearInterval(id)
  }, [running, syncStopwatch])
}
