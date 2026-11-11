import type { Priority } from './types'

export function priorityColor(priority: Priority): string {
  const map: Record<Priority, string> = {
    high: 'var(--theme-priority-high)',
    medium: 'var(--theme-priority-medium)',
    low: 'var(--theme-priority-low)',
    none: 'var(--theme-priority-none)',
  }
  return map[priority]
}

export const VAR_STARRED = 'var(--theme-starred)'
export const VAR_COMPLETE = 'var(--theme-complete)'
