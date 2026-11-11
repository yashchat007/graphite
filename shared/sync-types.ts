export type Priority = 'high' | 'medium' | 'low' | 'none'

export interface SyncSubtask {
  id: string
  title: string
  completed: boolean
}

export interface SyncTask {
  id: string
  title: string
  description: string
  dueDate?: string
  dueTime?: string
  endTime?: string
  priority: Priority
  listId: string
  tags: string[]
  subtasks: SyncSubtask[]
  completed: boolean
  starred: boolean
  order: number
  createdAt: string
  completedAt?: string
  updatedAt: string
}

export interface SyncList {
  id: string
  name: string
  updatedAt: string
}

export type TombstoneKind = 'task' | 'list' | 'file'

export interface SyncFile {
  id: string
  name: string
  size: number
  contentType: string
  pathname: string
  uploadedAt: string
  updatedAt: string
}

export interface Tombstone {
  id: string
  kind: TombstoneKind
  deletedAt: string
}

export interface SyncDocument {
  tasks: SyncTask[]
  lists: SyncList[]
  files: SyncFile[]
  todayNote: string
  todayNoteUpdatedAt: string
  tombstones: Tombstone[]
}

export const EMPTY_SYNC_DOC: SyncDocument = {
  tasks: [],
  lists: [],
  files: [],
  todayNote: '',
  todayNoteUpdatedAt: new Date(0).toISOString(),
  tombstones: [],
}
