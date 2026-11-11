export type Priority = 'high' | 'medium' | 'low' | 'none'

export interface Task {
  id: string
  title: string
  description: string
  dueDate?: string
  dueTime?: string
  endTime?: string
  priority: Priority
  listId: string
  completed: boolean
  starred: boolean
  order: number
  createdAt: string
  completedAt?: string
  updatedAt: string
}

export interface TaskList {
  id: string
  name: string
  updatedAt: string
}

export interface Tombstone {
  id: string
  kind: 'task' | 'list' | 'file'
  deletedAt: string
}

export interface StoredFile {
  id: string
  name: string
  size: number
  contentType: string
  pathname: string
  uploadedAt: string
  updatedAt: string
  expiresAt: string
  keepPinned?: boolean
}

export interface UndoAction {
  id: string
  label: string
  undo: () => void
  expiresAt: number
}

export interface FocusStopwatchState {
  running: boolean
  /** Total elapsed ms from completed run segments. */
  accumulatedMs: number
  /** Wall-clock ms when the current run segment started; null while paused. */
  startedAt: number | null
  focusTaskId?: string
}
