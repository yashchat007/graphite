import type { StateStorage } from 'zustand/middleware'
import { normalizeTask } from './normalize-task'
import type { Task } from './types'

const LEGACY_V1_KEY = 'graphite-store-v1'

function normalizePersistedTasks(tasks: unknown[]): Task[] {
  return tasks.map((t) => normalizeTask(t as Task & { tags?: unknown; subtasks?: unknown }))
}

/** Prefer v2; migrate v1 tasks (strip tags/subtasks) when v2 is absent. */
export const graphitePersistStorage: StateStorage = {
  getItem: (name) => {
    const v2 = localStorage.getItem(name)
    if (v2) return v2

    const v1 = localStorage.getItem(LEGACY_V1_KEY)
    if (!v1) return null

    try {
      const parsed = JSON.parse(v1) as { state?: { tasks?: unknown[] }; version?: number }
      if (parsed.state?.tasks?.length) {
        parsed.state.tasks = normalizePersistedTasks(parsed.state.tasks)
      }
      const migrated = JSON.stringify(parsed)
      localStorage.setItem(name, migrated)
      return migrated
    } catch {
      return null
    }
  },
  setItem: (name, value) => {
    localStorage.setItem(name, value)
  },
  removeItem: (name) => {
    localStorage.removeItem(name)
  },
}
