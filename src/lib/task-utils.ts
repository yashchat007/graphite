import { format, parseISO } from 'date-fns'
import { istTodayYmd, istTomorrowYmd } from './ist-time'
import type { Task } from './types'

export function isDueToday(task: Task): boolean {
  if (!task.dueDate) return false
  return task.dueDate === istTodayYmd()
}

/** Incomplete tasks with a due date strictly after IST today (yyyy-MM-dd compare). */
export function isDueAfterToday(task: Task): boolean {
  if (!task.dueDate) return false
  return task.dueDate > istTodayYmd()
}

/** Sidebar smart list where this task appears among open tasks. */
export function resolveActiveListForTask(task: Task): string {
  if (task.completed) return 'completed'
  if (task.starred) return 'starred'
  if (isDueAfterToday(task)) return 'upcoming'
  return 'today'
}

function matchesTodayOpen(task: Task): boolean {
  if (task.completed) return false
  if (!task.dueDate) return true
  return task.dueDate <= istTodayYmd()
}

function matchesUpcomingOpen(task: Task): boolean {
  return !task.completed && isDueAfterToday(task)
}

export function isDueTomorrow(task: Task): boolean {
  if (!task.dueDate) return false
  return task.dueDate === istTomorrowYmd()
}

export function dueLabel(task: Task): string {
  if (!task.dueDate) return 'No date'
  if (isDueToday(task)) return 'Today'
  if (isDueTomorrow(task)) return 'Tomorrow'
  return format(parseISO(task.dueDate), 'MMM d')
}

export function filterTasksForSmartList(tasks: Task[], listId: string): Task[] {
  switch (listId) {
    case 'inbox':
      return tasks.filter((t) => !t.completed && t.listId === 'inbox')
    case 'today':
      return tasks.filter(matchesTodayOpen)
    case 'upcoming':
      return tasks.filter(matchesUpcomingOpen)
    case 'starred':
      return tasks.filter((t) => !t.completed && t.starred)
    case 'completed':
      return tasks.filter((t) => t.completed)
    default:
      return tasks.filter((t) => !t.completed && t.listId === listId)
  }
}

export function filterCompletedForSmartList(tasks: Task[], listId: string): Task[] {
  if (listId === 'completed') return []

  switch (listId) {
    case 'today':
      return tasks.filter(
        (t) => t.completed && (!t.dueDate || t.dueDate <= istTodayYmd()),
      )
    case 'upcoming':
      return tasks.filter((t) => t.completed && isDueAfterToday(t))
    case 'starred':
      return tasks.filter((t) => t.completed && t.starred)
    case 'inbox':
      return tasks.filter((t) => t.completed && t.listId === 'inbox')
    default:
      return tasks.filter((t) => t.completed && t.listId === listId)
  }
}

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}
