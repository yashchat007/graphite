import { useMemo } from 'react'
import { applyTaskFilters, useGraphiteStore } from '../store/useGraphiteStore'

export function useVisibleTasks() {
  const tasks = useGraphiteStore((s) => s.tasks)
  const activeListId = useGraphiteStore((s) => s.activeListId)
  const filterStatus = useGraphiteStore((s) => s.filterStatus)
  const filterListId = useGraphiteStore((s) => s.filterListId)
  const filterPriority = useGraphiteStore((s) => s.filterPriority)

  return useMemo(
    () => applyTaskFilters(tasks, { activeListId, filterStatus, filterListId, filterPriority }),
    [tasks, activeListId, filterStatus, filterListId, filterPriority],
  )
}
