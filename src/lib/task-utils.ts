import { addDays, format, parseISO } from 'date-fns'
import { istStartOfToday, istTodayYmd, istTomorrowYmd } from './ist-time'
import type { Task } from './types'

export function isDueToday(task: Task): boolean {
  if (!task.dueDate) return false
  return task.dueDate === istTodayYmd()
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
  const now = istStartOfToday()
  const in7 = addDays(now, 7)

  switch (listId) {
    case 'inbox':
      return tasks.filter((t) => !t.completed && t.listId === 'inbox')
    case 'today':
      return tasks.filter((t) => !t.completed && t.dueDate && t.dueDate === istTodayYmd())
    case 'upcoming':
      return tasks.filter((t) => {
        if (t.completed || !t.dueDate) return false
        const d = parseISO(t.dueDate)
        return d >= now && d <= in7
      })
    case 'starred':
      return tasks.filter((t) => !t.completed && t.starred)
    case 'completed':
      return tasks.filter((t) => t.completed)
    default:
      return tasks.filter((t) => !t.completed && t.listId === listId)
  }
}

export function filterCompletedForSmartList(tasks: Task[], listId: string): Task[] {
  const now = istStartOfToday()
  const in7 = addDays(now, 7)

  if (listId === 'completed') return []

  switch (listId) {
    case 'today':
      return tasks.filter((t) => t.completed && t.dueDate && t.dueDate === istTodayYmd())
    case 'upcoming':
      return tasks.filter((t) => {
        if (!t.completed || !t.dueDate) return false
        const d = parseISO(t.dueDate)
        return d >= now && d <= in7
      })
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
