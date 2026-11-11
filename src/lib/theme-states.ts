import type { Priority } from './types'

export function priorityColor(priority: Priority): string {
  const map: Record<Priority, string> = {
    high: 'var(--aurora-priority-high)',
    medium: 'var(--aurora-priority-medium)',
    low: 'var(--aurora-priority-low)',
    none: 'var(--aurora-priority-none)',
  }
  return map[priority]
}

export const VAR_STARRED = 'var(--aurora-starred)'
export const VAR_COMPLETE = 'var(--aurora-complete)'
