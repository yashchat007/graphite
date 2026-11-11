import { useMemo } from 'react'
import { useGraphiteStore } from '../store/useGraphiteStore'
import { filterCompletedForSmartList } from '../lib/task-utils'

export function useCompletedSectionTasks() {
  const tasks = useGraphiteStore((s) => s.tasks)
  const activeListId = useGraphiteStore((s) => s.activeListId)
  const filterListId = useGraphiteStore((s) => s.filterListId)
  const filterPriority = useGraphiteStore((s) => s.filterPriority)
  return useMemo(() => {
    if (activeListId === 'completed') return []
    let list = filterCompletedForSmartList(tasks, activeListId)
    if (filterListId !== 'all') list = list.filter((t) => t.listId === filterListId)
    if (filterPriority !== 'all') list = list.filter((t) => t.priority === filterPriority)
    return [...list].sort((a, b) => a.order - b.order)
  }, [tasks, activeListId, filterListId, filterPriority])
}
