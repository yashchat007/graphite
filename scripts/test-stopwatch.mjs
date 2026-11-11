/**
 * Regression: focus stopwatch counts up at wall-clock rate (no double intervals).
 */
import assert from 'node:assert'
import {
  formatStopwatch,
  stopwatchElapsedMs,
  stopwatchPause,
  stopwatchStart,
} from '../src/lib/stopwatch.ts'

const base = {
  running: false,
  accumulatedMs: 0,
  startedAt: null,
}

const t0 = 1_700_000_000_000
let state = stopwatchStart(base, t0)
assert.equal(stopwatchElapsedMs(state, t0), 0)
assert.equal(formatStopwatch(stopwatchElapsedMs(state, t0)), '0:00')
assert.equal(stopwatchElapsedMs(state, t0 + 1000), 1000)
assert.equal(formatStopwatch(stopwatchElapsedMs(state, t0 + 5000)), '0:05')
assert.equal(stopwatchElapsedMs(state, t0 + 10_000), 10_000)

// Two mounted views would each call sync at the same `now`; elapsed is derived, not ticked.
const atFive = t0 + 5000
for (let i = 0; i < 4; i++) {
  assert.equal(
    stopwatchElapsedMs(state, atFive),
    5000,
    `duplicate UI tick ${i} must not advance elapsed`,
  )
}

state = stopwatchPause(state, t0 + 5_000)
assert.equal(state.accumulatedMs, 5000)
assert.equal(stopwatchElapsedMs(state, t0 + 60_000), 5000, 'paused stopwatch stays fixed')

state = stopwatchStart(state, t0 + 60_000)
assert.equal(stopwatchElapsedMs(state, t0 + 61_000), 6000)

const long = stopwatchStart({ ...base }, 0)
assert.equal(formatStopwatch(stopwatchElapsedMs(long, 3_661_000)), '1:01:01')

console.log('stopwatch tests passed')
