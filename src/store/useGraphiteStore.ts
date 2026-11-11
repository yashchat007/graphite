import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEY } from '../lib/constants'
import { createSeedTasks, SEED_LISTS } from '../lib/seed'
import { buildTaskFromQuickAdd } from '../lib/nlp-parser'
import { normalizeTask } from '../lib/normalize-task'
import { filterTasksForSmartList, generateId } from '../lib/task-utils'
import type {
  PomodoroState,
  Priority,
  Task,
  StoredFile,
  TaskList,
  Tombstone,
  UndoAction,
} from '../lib/types'
import { nowIso } from '../lib/sync-document'
import { DEFAULT_UI_THEME, type UiTheme } from '../lib/themes'

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
  editingTaskId: string | null
  focusMode: boolean
  focusTaskId: string | null
  pomodoro: PomodoroState
  undoQueue: UndoAction[]
  quickAddDraft: string
  uiTheme: UiTheme

  setHydrated: (v: boolean) => void
  setActiveListId: (id: string) => void
  setFilters: (f: Partial<Pick<GraphiteState, 'filterListId' | 'filterPriority'>>) => void
  setExpandedTaskId: (id: string | null) => void
  setSelectedTaskId: (id: string | null) => void
  setTodayNote: (note: string) => void
  toggleSidebar: () => void
  setCommandPaletteOpen: (v: boolean) => void
  setShortcutsOpen: (v: boolean) => void
  setTaskModalOpen: (v: boolean, editingId?: string | null) => void
  setFocusMode: (on: boolean, taskId?: string | null) => void
  setQuickAddDraft: (d: string) => void
  setUiTheme: (theme: UiTheme) => void

  addTaskFromQuickAdd: (input: string) => string
  addTask: (partial: Partial<Task> & { title: string }) => string
  updateTask: (id: string, patch: Partial<Task>) => void
  completeTask: (id: string) => void
  uncompleteTask: (id: string) => void
  deleteTask: (id: string) => void
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

  tickPomodoro: () => void
  startPomodoro: (taskId?: string) => void
  pausePomodoro: () => void
  resetPomodoro: () => void
  setPomodoroFocusTask: (taskId: string | null) => void

}

const defaultPomodoro: PomodoroState = {
  workSeconds: 25 * 60,
  breakSeconds: 5 * 60,
  remaining: 25 * 60,
  phase: 'work',
  running: false,
}

export function applyTaskFilters(
  tasks: Task[],
  state: Pick<GraphiteState, 'activeListId' | 'filterListId' | 'filterPriority'>,
): Task[] {
  let list = filterTasksForSmartList(tasks, state.activeListId)
  if (state.filterListId !== 'all') list = list.filter((t) => t.listId === state.filterListId)
  if (state.filterPriority !== 'all') list = list.filter((t) => t.priority === state.filterPriority)
  return [...list].sort((a, b) => a.order - b.order)
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
      editingTaskId: null,
      focusMode: false,
      focusTaskId: null,
      pomodoro: { ...defaultPomodoro },
      undoQueue: [],
      quickAddDraft: '',
      uiTheme: DEFAULT_UI_THEME,

      setHydrated: (v) => set({ hydrated: v }),
      setActiveListId: (id) => set({ activeListId: id }),
      setFilters: (f) => set(f),
      setExpandedTaskId: (id) => set({ expandedTaskId: id }),
      setSelectedTaskId: (id) => set({ selectedTaskId: id }),
      setTodayNote: (note) => set({ todayNote: note, todayNoteUpdatedAt: nowIso() }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setCommandPaletteOpen: (v) => set({ commandPaletteOpen: v }),
      setShortcutsOpen: (v) => set({ shortcutsOpen: v }),
      setTaskModalOpen: (v, editingId = null) =>
        set({ taskModalOpen: v, editingTaskId: editingId }),
      setFocusMode: (on, taskId = null) =>
        set({ focusMode: on, focusTaskId: on ? taskId ?? get().selectedTaskId : null }),
      setQuickAddDraft: (d) => set({ quickAddDraft: d }),
      setUiTheme: (uiTheme) => set({ uiTheme }),

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
        return get().addTask({
          title: parsed.title,
          dueDate: parsed.dueDate,
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

      tickPomodoro: () => {
        const p = get().pomodoro
        if (!p.running) return
        if (p.remaining <= 1) {
          const nextPhase = p.phase === 'work' ? 'break' : 'work'
          const nextRemaining = nextPhase === 'work' ? p.workSeconds : p.breakSeconds
          set({ pomodoro: { ...p, phase: nextPhase, remaining: nextRemaining } })
        } else {
          set({ pomodoro: { ...p, remaining: p.remaining - 1 } })
        }
      },

      startPomodoro: (taskId) =>
        set((s) => ({
          pomodoro: {
            ...s.pomodoro,
            running: true,
            focusTaskId: taskId ?? s.pomodoro.focusTaskId ?? s.selectedTaskId ?? undefined,
          },
        })),

      pausePomodoro: () => set((s) => ({ pomodoro: { ...s.pomodoro, running: false } })),

      resetPomodoro: () =>
        set((s) => ({
          pomodoro: {
            ...s.pomodoro,
            running: false,
            phase: 'work',
            remaining: s.pomodoro.workSeconds,
          },
        })),

      setPomodoroFocusTask: (taskId) =>
        set((s) => ({ pomodoro: { ...s.pomodoro, focusTaskId: taskId ?? undefined } })),

    }),
    {
      name: STORAGE_KEY,
      partialize: (s) => ({
        seeded: s.seeded,
        tasks: s.tasks,
        lists: s.lists,
        todayNote: s.todayNote,
        todayNoteUpdatedAt: s.todayNoteUpdatedAt,
        tombstones: s.tombstones,
        files: s.files,
        sidebarCollapsed: s.sidebarCollapsed,
        uiTheme: s.uiTheme,
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
        if (!state.uiTheme) {
          useGraphiteStore.setState({ uiTheme: DEFAULT_UI_THEME })
        }
      },
    },
  ),
)
