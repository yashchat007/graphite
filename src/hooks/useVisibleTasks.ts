import { useMemo } from 'react'
import { applyTaskFilters, useGraphiteStore } from '../store/useGraphiteStore'

export function useVisibleTasks() {
  const tasks = useGraphiteStore((s) => s.tasks)
  const activeListId = useGraphiteStore((s) => s.activeListId)
  const filterListId = useGraphiteStore((s) => s.filterListId)
  const filterPriority = useGraphiteStore((s) => s.filterPriority)

  return useMemo(
    () => applyTaskFilters(tasks, { activeListId, filterListId, filterPriority }),
    [tasks, activeListId, filterListId, filterPriority],
  )
}
