/**
 * Regression: Upcoming shows every future-dated open task (not only the next 7 days).
 */
import assert from 'node:assert'

const IST = 'Asia/Kolkata'

function istTodayYmd() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: IST,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

function istAddDaysFromToday(days) {
  const [y, m, d] = istTodayYmd().split('-').map(Number)
  const utc = Date.UTC(y, m - 1, d + days)
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: IST,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(utc))
}

function filterUpcoming(tasks) {
  const today = istTodayYmd()
  return tasks.filter((t) => !t.completed && t.dueDate && t.dueDate > today)
}

function filterTodayOpen(tasks) {
  const today = istTodayYmd()
  return tasks.filter((t) => {
    if (t.completed) return false
    if (!t.dueDate) return true
    return t.dueDate <= today
  })
}

const today = istTodayYmd()
const in21 = istAddDaysFromToday(21)
const threeWeeks = istAddDaysFromToday(20)

const tasks = [
  {
    id: 'a',
    title: 'project_visualizer',
    completed: false,
    dueDate: threeWeeks,
    listId: 'work',
    priority: 'medium',
  },
  {
    id: 'b',
    title: 'near',
    completed: false,
    dueDate: in21,
    listId: 'personal',
    priority: 'none',
  },
  {
    id: 'c',
    title: 'now',
    completed: false,
    dueDate: today,
    listId: 'study',
    priority: 'none',
  },
  {
    id: 'd',
    title: 'inbox style',
    completed: false,
    listId: 'work',
    priority: 'none',
  },
]

const upcoming = filterUpcoming(tasks)
assert.ok(
  upcoming.some((t) => t.id === 'a'),
  `Upcoming must include task due ${threeWeeks} (~3 weeks out)`,
)
assert.ok(upcoming.some((t) => t.id === 'b'), 'Upcoming must include task due in 21 days')
assert.equal(upcoming.filter((t) => t.id === 'c').length, 0, 'Today-due tasks belong on Today')
assert.equal(upcoming.filter((t) => t.id === 'd').length, 0, 'Undated tasks belong on Today')

const todayOpen = filterTodayOpen(tasks)
assert.ok(todayOpen.some((t) => t.id === 'c'), 'Today includes due-today')
assert.ok(todayOpen.some((t) => t.id === 'd'), 'Today includes undated tasks')

console.log('upcoming filter tests passed')
