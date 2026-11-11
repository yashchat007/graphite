import type { Task } from './types'

/** Strip legacy tag/subtask fields from persisted or synced payloads. */
export function normalizeTask(task: Task & { tags?: unknown; subtasks?: unknown }): Task {
  const { tags: _tags, subtasks: _subtasks, ...rest } = task
  return rest
}
