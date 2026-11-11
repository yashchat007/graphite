import { useEffect } from 'react'
import { useGraphiteStore } from '../store/useGraphiteStore'

/**
 * Single app-level clock: one interval bumps UI ticks so duplicate
 * Focus cards never register more than one stopwatch interval.
 */
export function useFocusStopwatchClock() {
  const running = useGraphiteStore((s) => s.focusStopwatch.running)
  const syncFocusStopwatch = useGraphiteStore((s) => s.syncFocusStopwatch)

  useEffect(() => {
    if (!running) return
    const tick = () => syncFocusStopwatch()
    tick()
    const id = window.setInterval(tick, 250)
    return () => clearInterval(id)
  }, [running, syncFocusStopwatch])
}
