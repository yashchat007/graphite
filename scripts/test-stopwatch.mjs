/**
 * Regression: focus stopwatch must advance at wall-clock rate (no double intervals).
 */
import assert from 'node:assert'
import {
  pomodoroPause,
  pomodoroRemainingSeconds,
  pomodoroStart,
  pomodoroSyncRunning,
} from '../src/lib/pomodoro.ts'

const base = {
  workSeconds: 25 * 60,
  breakSeconds: 5 * 60,
  remaining: 120,
  phase: 'work',
  running: false,
  runningStartedAt: null,
  runningRemainingStart: 120,
}

const t0 = 1_700_000_000_000
let state = pomodoroStart(base, t0)
assert.equal(pomodoroRemainingSeconds(state, t0), 120)
assert.equal(pomodoroRemainingSeconds(state, t0 + 1000), 119)
assert.equal(pomodoroRemainingSeconds(state, t0 + 2500), 118)

// Simulating two 1s tick callbacks must not happen: wall clock is the source of truth.
assert.equal(pomodoroRemainingSeconds(state, t0 + 10_000), 110)

state = pomodoroPause(state, t0 + 5_000)
assert.equal(state.remaining, 115)
assert.equal(pomodoroRemainingSeconds(state, t0 + 20_000), 115, 'paused timer stays fixed')

state = pomodoroStart(state, t0 + 30_000)
assert.equal(pomodoroRemainingSeconds(state, t0 + 31_000), 114)

const atEnd = {
  ...state,
  runningRemainingStart: 1,
  runningStartedAt: t0,
  remaining: 1,
  running: true,
}
const rolled = pomodoroSyncRunning(atEnd, t0 + 1500)
assert.equal(rolled.phase, 'break')
assert.equal(rolled.running, true)
assert.equal(rolled.remaining, 5 * 60)

console.log('stopwatch tests passed')
