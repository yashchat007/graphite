import type { SyncDocument, SyncFile, SyncList, SyncTask, Tombstone } from '../../shared/sync-types'
import { normalizeTask } from './normalize-task'
import type { StoredFile, Task, TaskList } from './types'
import { defaultExpiresAt, normalizeStoredFile } from './file-expiry'

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
  const { updatedAt, tags: _tags, subtasks: _subtasks, ...rest } = task
  return normalizeTask({ ...rest, updatedAt })
}

export function syncToList(list: SyncList): TaskList & { updatedAt: string } {
  const { updatedAt, ...rest } = list
  return { ...rest, updatedAt }
}

export function fileToSync(file: StoredFile): SyncFile {
  const n = normalizeStoredFile(file)
  return {
    ...n,
    updatedAt: n.updatedAt ?? n.uploadedAt,
    expiresAt: n.expiresAt ?? defaultExpiresAt(n.uploadedAt),
  }
}

export function syncToFile(file: SyncFile): StoredFile {
  return { ...file }
}

export function buildSyncDocument(state: {
  tasks: (Task & { updatedAt?: string })[]
  lists: (TaskList & { updatedAt?: string })[]
  files: StoredFile[]
  todayNote: string
  todayNoteUpdatedAt?: string
  tombstones: Tombstone[]
}): SyncDocument {
  return {
    tasks: state.tasks.map(taskToSync),
    lists: state.lists.map(listToSync),
    files: state.files.map(fileToSync),
    todayNote: state.todayNote,
    todayNoteUpdatedAt: state.todayNoteUpdatedAt ?? nowIso(),
    tombstones: state.tombstones,
  }
}
