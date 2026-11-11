import type { PomodoroState } from './types'

/** Seconds remaining in the current phase at `now` (wall clock). */
export function pomodoroRemainingSeconds(state: PomodoroState, now = Date.now()): number {
  if (!state.running || state.runningStartedAt == null) {
    return state.remaining
  }
  const elapsedSec = Math.floor((now - state.runningStartedAt) / 1000)
  return Math.max(0, state.runningRemainingStart - elapsedSec)
}

export function pomodoroPhaseTotalSeconds(state: PomodoroState): number {
  return state.phase === 'work' ? state.workSeconds : state.breakSeconds
}

export function pomodoroProgress(state: PomodoroState, now = Date.now()): number {
  const total = pomodoroPhaseTotalSeconds(state)
  if (total <= 0) return 0
  const remaining = pomodoroRemainingSeconds(state, now)
  return 1 - remaining / total
}

/** After a run segment ends, move to the next phase or stop at zero. */
export function pomodoroAdvancePhase(state: PomodoroState, now = Date.now()): PomodoroState {
  const nextPhase = state.phase === 'work' ? 'break' : 'work'
  const nextRemaining = nextPhase === 'work' ? state.workSeconds : state.breakSeconds
  if (state.running) {
    return {
      ...state,
      phase: nextPhase,
      remaining: nextRemaining,
      runningRemainingStart: nextRemaining,
      runningStartedAt: now,
    }
  }
  return {
    ...state,
    phase: nextPhase,
    remaining: nextRemaining,
    runningStartedAt: null,
    runningRemainingStart: nextRemaining,
  }
}

/**
 * Apply phase rollovers when the countdown hits zero while running.
 * Returns the same reference if nothing changed.
 */
export function pomodoroSyncRunning(state: PomodoroState, now = Date.now()): PomodoroState {
  if (!state.running) return state
  const remaining = pomodoroRemainingSeconds(state, now)
  if (remaining > 0) return state
  let next = state
  while (pomodoroRemainingSeconds(next, now) <= 0 && next.running) {
    next = pomodoroAdvancePhase(next, now)
  }
  return next
}

export function pomodoroPause(state: PomodoroState, now = Date.now()): PomodoroState {
  if (!state.running) return state
  return {
    ...state,
    running: false,
    remaining: pomodoroRemainingSeconds(state, now),
    runningStartedAt: null,
  }
}

export function pomodoroStart(state: PomodoroState, now = Date.now()): PomodoroState {
  if (state.running) return state
  return {
    ...state,
    running: true,
    runningRemainingStart: state.remaining,
    runningStartedAt: now,
  }
}
