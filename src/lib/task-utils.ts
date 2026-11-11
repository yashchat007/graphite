import { addDays, format, isSameDay, parseISO, startOfDay } from 'date-fns'
import type { Task } from './types'

export function subtaskProgress(task: Task): number {
  if (task.subtasks.length === 0) return task.completed ? 100 : 0
  const done = task.subtasks.filter((s) => s.completed).length
  return Math.round((done / task.subtasks.length) * 100)
}

export function isDueToday(task: Task): boolean {
  if (!task.dueDate) return false
  return isSameDay(parseISO(task.dueDate), new Date())
}

export function isDueTomorrow(task: Task): boolean {
  if (!task.dueDate) return false
  return isSameDay(parseISO(task.dueDate), addDays(new Date(), 1))
}

export function dueLabel(task: Task): string {
  if (!task.dueDate) return 'No date'
  if (isDueToday(task)) return 'Today'
  if (isDueTomorrow(task)) return 'Tomorrow'
  return format(parseISO(task.dueDate), 'MMM d')
}

export function filterTasksForSmartList(tasks: Task[], listId: string): Task[] {
  const now = startOfDay(new Date())
  const in7 = addDays(now, 7)

  switch (listId) {
    case 'inbox':
      return tasks.filter((t) => !t.completed && t.listId === 'inbox')
    case 'today':
      return tasks.filter((t) => !t.completed && t.dueDate && isSameDay(parseISO(t.dueDate), now))
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

export function activityLast7Days(tasks: Task[]): { date: string; label: string; count: number }[] {
  const days: { date: string; label: string; count: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = addDays(new Date(), -i)
    const key = format(d, 'yyyy-MM-dd')
    const count = tasks.filter((t) => t.completedAt && isSameDay(parseISO(t.completedAt), d)).length
    days.push({ date: key, label: format(d, 'EEE'), count })
  }
  return days
}

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}
