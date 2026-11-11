import type { FocusStopwatchState } from './types'

export function stopwatchElapsedMs(state: FocusStopwatchState, now = Date.now()): number {
  if (!state.running || state.startedAt == null) {
    return state.accumulatedMs
  }
  return state.accumulatedMs + (now - state.startedAt)
}

/** 0–1 sweep within the current minute (for the focus ring). */
export function stopwatchMinuteSweep(state: FocusStopwatchState, now = Date.now()): number {
  const elapsed = stopwatchElapsedMs(state, now)
  return (elapsed % 60_000) / 60_000
}

export function stopwatchPause(state: FocusStopwatchState, now = Date.now()): FocusStopwatchState {
  if (!state.running) return state
  return {
    ...state,
    running: false,
    accumulatedMs: stopwatchElapsedMs(state, now),
    startedAt: null,
  }
}

export function stopwatchStart(state: FocusStopwatchState, now = Date.now()): FocusStopwatchState {
  if (state.running) return state
  return {
    ...state,
    running: true,
    startedAt: now,
  }
}

export function stopwatchReset(state: FocusStopwatchState): FocusStopwatchState {
  return {
    ...state,
    running: false,
    accumulatedMs: 0,
    startedAt: null,
  }
}

export function formatStopwatch(elapsedMs: number): string {
  const totalSec = Math.floor(elapsedMs / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${m}:${String(s).padStart(2, '0')}`
}
