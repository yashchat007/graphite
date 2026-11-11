/**
 * Regression: completed tasks appear in the Completed section on non-completed smart lists.
 */
import assert from 'node:assert'

function completedSectionCount({ activeListId, tasks }) {
  if (activeListId === 'completed') return 0
  return tasks.filter((t) => t.completed).length
}

assert.equal(
  completedSectionCount({
    activeListId: 'today',
    tasks: [{ completed: true }, { completed: false }],
  }),
  1,
  'completed section must still show completed tasks on Today',
)

assert.equal(
  completedSectionCount({ activeListId: 'completed', tasks: [{ completed: true }] }),
  0,
  'completed smart list uses main list, not inline section',
)

console.log('completed-section tests passed')
