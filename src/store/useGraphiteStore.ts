import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { STORAGE_KEY } from '../lib/constants'
import { istTodayYmd } from '../lib/ist-time'
import { graphitePersistStorage } from '../lib/persist-storage'
import { createSeedTasks, SEED_LISTS } from '../lib/seed'
import { buildTaskFromQuickAdd } from '../lib/nlp-parser'
import { normalizeTask } from '../lib/normalize-task'
import { filterTasksForSmartList, generateId } from '../lib/task-utils'
import type {
  StopwatchState,
  Priority,
  Task,
  StoredFile,
  TaskList,
  Tombstone,
  UndoAction,
} from '../lib/types'
import { nowIso } from '../lib/sync-document'
import { stopwatchPause, stopwatchReset, stopwatchStart } from '../lib/stopwatch'

export interface GraphiteState {
  hydrated: boolean
  seeded: boolean
  tasks: Task[]
  lists: TaskList[]
  activeListId: string
  filterListId: string | 'all'
  filterPriority: Priority | 'all'
  expandedTaskId: string | null
  selectedTaskId: string | null
  todayNote: string
  todayNoteUpdatedAt: string
  tombstones: Tombstone[]
  files: StoredFile[]
  sidebarCollapsed: boolean
  commandPaletteOpen: boolean
  shortcutsOpen: boolean
  taskModalOpen: boolean
  focusMode: boolean
  focusTaskId: string | null
  stopwatch: StopwatchState
  /** Bumped by the app-level stopwatch clock so timer UIs re-render without local intervals. */
  stopwatchClockMs: number
  undoQueue: UndoAction[]
  quickAddDraft: string

  setHydrated: (v: boolean) => void
  setActiveListId: (id: string) => void
  setFilters: (f: Partial<Pick<GraphiteState, 'filterListId' | 'filterPriority'>>) => void
  setExpandedTaskId: (id: string | null) => void
  setSelectedTaskId: (id: string | null) => void
  setTodayNote: (note: string) => void
  toggleSidebar: () => void
  setCommandPaletteOpen: (v: boolean) => void
  setShortcutsOpen: (v: boolean) => void
  setTaskModalOpen: (v: boolean) => void
  setFocusMode: (on: boolean, taskId?: string | null) => void
  setQuickAddDraft: (d: string) => void

  addTaskFromQuickAdd: (input: string) => string
  addTask: (partial: Partial<Task> & { title: string }) => string
  updateTask: (id: string, patch: Partial<Task>) => void
  completeTask: (id: string) => void
  uncompleteTask: (id: string) => void
  deleteTask: (id: string) => void
  deleteAllCompleted: () => void
  duplicateTask: (id: string) => void
  toggleStar: (id: string) => void
  reorderTasks: (orderedIds: string[]) => void
  createList: (name: string) => string
  renameList: (id: string, name: string) => void
  deleteList: (id: string) => void

  addFile: (file: StoredFile) => void
  removeFile: (id: string) => void
  toggleFileKeep: (id: string) => void

  pushUndo: (action: Omit<UndoAction, 'id' | 'expiresAt'>) => void
  popUndo: (id: string) => void

  syncStopwatch: (now?: number) => void
  startStopwatch: (taskId?: string) => void
  pauseStopwatch: () => void
  resetStopwatch: () => void
  setStopwatchFocusTask: (taskId: string | null) => void

}

const defaultStopwatch: StopwatchState = {
  running: false,
  accumulatedMs: 0,
  startedAt: null,
}

export function applyTaskFilters(
  tasks: Task[],
  state: Pick<GraphiteState, 'activeListId' | 'filterListId' | 'filterPriority'>,
): Task[] {
  let list = filterTasksForSmartList(tasks, state.activeListId)
  if (state.filterListId !== 'all') list = list.filter((t) => t.listId === state.filterListId)
  if (state.filterPriority !== 'all') list = list.filter((t) => t.priority === state.filterPriority)
  const sorted = [...list]
  if (state.activeListId === 'upcoming') {
    sorted.sort((a, b) => {
      const ad = a.dueDate ?? ''
      const bd = b.dueDate ?? ''
      if (ad !== bd) return ad.localeCompare(bd)
      return a.order - b.order
    })
  } else {
    sorted.sort((a, b) => a.order - b.order)
  }
  return sorted
}

export const useGraphiteStore = create<GraphiteState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      seeded: false,
      tasks: [],
      lists: [...SEED_LISTS],
      activeListId: 'today',
      filterListId: 'all',
      filterPriority: 'all',
      expandedTaskId: null,
      selectedTaskId: null,
      todayNote: 'Capture ideas before they slip away.',
      todayNoteUpdatedAt: nowIso(),
      tombstones: [],
      files: [],
      sidebarCollapsed: false,
      commandPaletteOpen: false,
      shortcutsOpen: false,
      taskModalOpen: false,
      focusMode: false,
      focusTaskId: null,
      stopwatch: { ...defaultStopwatch },
      stopwatchClockMs: 0,
      undoQueue: [],
      quickAddDraft: '',

      setHydrated: (v) => set({ hydrated: v }),
      setActiveListId: (id) => set({ activeListId: id }),
      setFilters: (f) => set(f),
      setExpandedTaskId: (id) => set({ expandedTaskId: id }),
      setSelectedTaskId: (id) => set({ selectedTaskId: id }),
      setTodayNote: (note) => set({ todayNote: note, todayNoteUpdatedAt: nowIso() }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setCommandPaletteOpen: (v) => set({ commandPaletteOpen: v }),
      setShortcutsOpen: (v) => set({ shortcutsOpen: v }),
      setTaskModalOpen: (v) => set({ taskModalOpen: v }),
      setFocusMode: (on, taskId = null) =>
        set({ focusMode: on, focusTaskId: on ? taskId ?? get().selectedTaskId : null }),
      setQuickAddDraft: (d) => set({ quickAddDraft: d }),

      addTaskFromQuickAdd: (input) => {
        const parsed = buildTaskFromQuickAdd(input)
        const active = get().activeListId
        const listId =
          active === 'completed' ||
          active === 'starred' ||
          active === 'today' ||
          active === 'upcoming' ||
          active === 'inbox'
            ? 'work'
            : active
        let dueDate = parsed.dueDate
        if (!dueDate && active === 'today') dueDate = istTodayYmd()
        if (!dueDate && active === 'upcoming') dueDate = istTodayYmd()
        return get().addTask({
          title: parsed.title,
          dueDate,
          dueTime: parsed.dueTime,
          priority: parsed.priority,
          listId,
        })
      },

      addTask: (partial) => {
        const id = generateId()
        const order = get().tasks.length
        const ts = nowIso()
        const task: Task = {
          id,
          title: partial.title,
          description: partial.description ?? '',
          dueDate: partial.dueDate,
          dueTime: partial.dueTime,
          endTime: partial.endTime,
          priority: partial.priority ?? 'none',
          listId: partial.listId ?? 'work',
          completed: false,
          starred: partial.starred ?? false,
          order,
          createdAt: ts,
          updatedAt: ts,
        }
        set((s) => ({ tasks: [...s.tasks, task], expandedTaskId: id }))
        return id
      },

      updateTask: (id, patch) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, ...patch, updatedAt: nowIso() } : t,
          ),
        })),

      completeTask: (id) => {
        const prev = get().tasks.find((t) => t.id === id)
        if (!prev) return
        const ts = nowIso()
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, completed: true, completedAt: ts, updatedAt: ts } : t,
          ),
          expandedTaskId: s.expandedTaskId === id ? null : s.expandedTaskId,
        }))
        get().pushUndo({
          label: `Completed “${prev.title}”`,
          undo: () => get().uncompleteTask(id),
        })
      },

      uncompleteTask: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? { ...t, completed: false, completedAt: undefined, updatedAt: nowIso() }
              : t,
          ),
        })),

      deleteAllCompleted: () => {
        const completed = get().tasks.filter((t) => t.completed)
        if (completed.length === 0) return
        const deletedAt = nowIso()
        set((s) => ({
          tasks: s.tasks.filter((t) => !t.completed),
          tombstones: [
            ...s.tombstones.filter(
              (t) => !completed.some((c) => c.id === t.id && t.kind === 'task'),
            ),
            ...completed.map((t) => ({
              id: t.id,
              kind: 'task' as const,
              deletedAt,
            })),
          ],
        }))
      },

      deleteTask: (id) => {
        const prev = get().tasks.find((t) => t.id === id)
        if (!prev) return
        const deletedAt = nowIso()
        set((s) => ({
          tasks: s.tasks.filter((t) => t.id !== id),
          tombstones: [
            ...s.tombstones.filter((t) => !(t.kind === 'task' && t.id === id)),
            { id, kind: 'task', deletedAt },
          ],
          expandedTaskId: s.expandedTaskId === id ? null : s.expandedTaskId,
        }))
        get().pushUndo({
          label: `Deleted “${prev.title}”`,
          undo: () =>
            set((s) => ({
              tasks: [...s.tasks, { ...prev, updatedAt: nowIso() }].sort((a, b) => a.order - b.order),
              tombstones: s.tombstones.filter((t) => !(t.kind === 'task' && t.id === id)),
            })),
        })
      },

      duplicateTask: (id) => {
        const src = get().tasks.find((t) => t.id === id)
        if (!src) return
        const newId = generateId()
        const ts = nowIso()
        const copy: Task = {
          ...src,
          id: newId,
          title: `${src.title} (copy)`,
          completed: false,
          completedAt: undefined,
          order: get().tasks.length,
          createdAt: ts,
          updatedAt: ts,
        }
        set((s) => ({ tasks: [...s.tasks, copy] }))
      },

      toggleStar: (id) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id ? { ...t, starred: !t.starred, updatedAt: nowIso() } : t,
          ),
        })),

      reorderTasks: (orderedIds) =>
        set((s) => {
          const orderMap = new Map(orderedIds.map((id, i) => [id, i]))
          const ts = nowIso()
          return {
            tasks: s.tasks.map((t) =>
              orderMap.has(t.id) ? { ...t, order: orderMap.get(t.id)!, updatedAt: ts } : t,
            ),
          }
        }),

      createList: (name) => {
        const id = name.toLowerCase().replace(/\s+/g, '-')
        const ts = nowIso()
        set((s) => ({ lists: [...s.lists, { id, name, updatedAt: ts }] }))
        return id
      },

      renameList: (id, name) =>
        set((s) => ({
          lists: s.lists.map((l) => (l.id === id ? { ...l, name, updatedAt: nowIso() } : l)),
        })),

      deleteList: (id) =>
        set((s) => {
          const deletedAt = nowIso()
          return {
            lists: s.lists.filter((l) => l.id !== id),
            tasks: s.tasks.map((t) =>
              t.listId === id ? { ...t, listId: 'work', updatedAt: nowIso() } : t,
            ),
            tombstones: [
              ...s.tombstones.filter((t) => !(t.kind === 'list' && t.id === id)),
              { id, kind: 'list', deletedAt },
            ],
          }
        }),

      addFile: (file) =>
        set((s) => ({
          files: [file, ...s.files.filter((f) => f.id !== file.id)],
        })),

      removeFile: (id) => {
        const removed = get().files.find((f) => f.id === id)
        if (!removed) return
        const deletedAt = nowIso()
        set((s) => ({
          files: s.files.filter((f) => f.id !== id),
          tombstones: [
            ...s.tombstones.filter((t) => !(t.kind === 'file' && t.id === id)),
            { id, kind: 'file', deletedAt },
          ],
        }))
      },

      toggleFileKeep: (id) =>
        set((s) => ({
          files: s.files.map((f) =>
            f.id === id ? { ...f, keepPinned: !f.keepPinned, updatedAt: nowIso() } : f,
          ),
        })),

      pushUndo: (action) => {
        const id = generateId()
        const expiresAt = Date.now() + 5000
        set((s) => ({ undoQueue: [...s.undoQueue, { ...action, id, expiresAt }] }))
        setTimeout(() => get().popUndo(id), 5000)
      },

      popUndo: (id) => set((s) => ({ undoQueue: s.undoQueue.filter((u) => u.id !== id) })),

      syncStopwatch: (now = Date.now()) => {
        set({ stopwatchClockMs: now })
      },

      startStopwatch: (taskId) =>
        set((s) => {
          const now = Date.now()
          const stopwatch = stopwatchStart(
            {
              ...s.stopwatch,
              focusTaskId:
                taskId ?? s.stopwatch.focusTaskId ?? s.selectedTaskId ?? undefined,
            },
            now,
          )
          return { stopwatch, stopwatchClockMs: now }
        }),

      pauseStopwatch: () =>
        set((s) => {
          const now = Date.now()
          return {
            stopwatch: stopwatchPause(s.stopwatch, now),
            stopwatchClockMs: now,
          }
        }),

      resetStopwatch: () =>
        set((s) => ({
          stopwatch: stopwatchReset(s.stopwatch),
          stopwatchClockMs: Date.now(),
        })),

      setStopwatchFocusTask: (taskId) =>
        set((s) => ({
          stopwatch: { ...s.stopwatch, focusTaskId: taskId ?? undefined },
        })),

    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => graphitePersistStorage),
      partialize: (s) => ({
        seeded: s.seeded,
        tasks: s.tasks,
        lists: s.lists,
        todayNote: s.todayNote,
        todayNoteUpdatedAt: s.todayNoteUpdatedAt,
        tombstones: s.tombstones,
        files: s.files,
        sidebarCollapsed: s.sidebarCollapsed,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return
        if (state.tasks?.length) {
          useGraphiteStore.setState({
            tasks: state.tasks.map((t) => normalizeTask(t as Task & { tags?: unknown; subtasks?: unknown })),
          })
        }
        if (!state.seeded || state.tasks.length === 0) {
          useGraphiteStore.setState({ tasks: createSeedTasks(), seeded: true })
        }
      },
    },
  ),
)
