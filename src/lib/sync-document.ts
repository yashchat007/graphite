import type { SyncDocument, SyncList, SyncTask, Tombstone } from '../../shared/sync-types'
import type { Task, TaskList } from './types'

export type { SyncDocument, Tombstone }

export function nowIso(): string {
  return new Date().toISOString()
}

export function taskToSync(task: Task & { updatedAt?: string }): SyncTask {
  return {
    ...task,
    updatedAt: task.updatedAt ?? task.createdAt ?? nowIso(),
  }
}

export function listToSync(list: TaskList & { updatedAt?: string }): SyncList {
  return {
    id: list.id,
    name: list.name,
    updatedAt: list.updatedAt ?? nowIso(),
  }
}

export function syncToTask(task: SyncTask): Task & { updatedAt: string } {
  const { updatedAt, ...rest } = task
  return { ...rest, updatedAt }
}

export function syncToList(list: SyncList): TaskList & { updatedAt: string } {
  const { updatedAt, ...rest } = list
  return { ...rest, updatedAt }
}

export function buildSyncDocument(state: {
  tasks: (Task & { updatedAt?: string })[]
  lists: (TaskList & { updatedAt?: string })[]
  todayNote: string
  todayNoteUpdatedAt?: string
  tombstones: Tombstone[]
}): SyncDocument {
  return {
    tasks: state.tasks.map(taskToSync),
    lists: state.lists.map(listToSync),
    todayNote: state.todayNote,
    todayNoteUpdatedAt: state.todayNoteUpdatedAt ?? nowIso(),
    tombstones: state.tombstones,
  }
}
