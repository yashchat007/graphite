/**
 * Regression: completed tasks appear in the Completed section when filterStatus is 'todo' (default).
 */
import assert from 'node:assert'

function completedSectionCount({ activeListId, filterStatus, tasks }) {
  if (activeListId === 'completed') return 0
  void filterStatus
  return tasks.filter((t) => t.completed).length
}

assert.equal(
  completedSectionCount({
    activeListId: 'today',
    filterStatus: 'todo',
    tasks: [{ completed: true }, { completed: false }],
  }),
  1,
  'default todo filter must still show completed section tasks',
)

assert.equal(
  completedSectionCount({ activeListId: 'completed', filterStatus: 'all', tasks: [{ completed: true }] }),
  0,
  'completed smart list uses main list, not inline section',
)

console.log('completed-section tests passed')
