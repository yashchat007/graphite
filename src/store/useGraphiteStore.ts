import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { format } from 'date-fns'
import { STORAGE_KEY } from '../lib/constants'
import { createSeedTasks, SEED_LISTS } from '../lib/seed'
import { buildTaskFromQuickAdd } from '../lib/nlp-parser'
import { filterTasksForSmartList, generateId } from '../lib/task-utils'
import type {
  FilterStatus,
  NavView,
  PomodoroState,
  Priority,
  Task,
  TaskList,
  Tombstone,
  UndoAction,
} from '../lib/types'
import { nowIso } from '../lib/sync-document'

export interface GraphiteState {
  hydrated: boolean
  seeded: boolean
  tasks: Task[]
  lists: TaskList[]
  activeNav: NavView
  activeListId: string
  filterStatus: FilterStatus
  filterListId: string | 'all'
  filterPriority: Priority | 'all'
  expandedTaskId: string | null
  selectedTaskId: string | null
  todayNote: string
  todayNoteUpdatedAt: string
  tombstones: Tombstone[]
  sidebarCollapsed: boolean
  commandPaletteOpen: boolean
  shortcutsOpen: boolean
  searchOpen: boolean
  taskModalOpen: boolean
  editingTaskId: string | null
  focusMode: boolean
  focusTaskId: string | null
  pomodoro: PomodoroState
  undoQueue: UndoAction[]
  pickerDate: string
  quickAddDraft: string

  setHydrated: (v: boolean) => void
  setActiveNav: (v: NavView) => void
  setActiveListId: (id: string) => void
  setFilters: (f: Partial<Pick<GraphiteState, 'filterStatus' | 'filterListId' | 'filterPriority'>>) => void
  setExpandedTaskId: (id: string | null) => void
  setSelectedTaskId: (id: string | null) => void
  setTodayNote: (note: string) => void
  toggleSidebar: () => void
  setCommandPaletteOpen: (v: boolean) => void
  setShortcutsOpen: (v: boolean) => void
  setSearchOpen: (v: boolean) => void
  setTaskModalOpen: (v: boolean, editingId?: string | null) => void
  setFocusMode: (on: boolean, taskId?: string | null) => void
  setPickerDate: (d: string) => void
  setQuickAddDraft: (d: string) => void

  addTaskFromQuickAdd: (input: string) => string
  addTask: (partial: Partial<Task> & { title: string }) => string
  updateTask: (id: string, patch: Partial<Task>) => void
  completeTask: (id: string) => void
  uncompleteTask: (id: string) => void
  deleteTask: (id: string) => void
  duplicateTask: (id: string) => void
  toggleStar: (id: string) => void
  reorderTasks: (orderedIds: string[]) => void
  toggleSubtask: (taskId: string, subtaskId: string) => void

  createList: (name: string) => string
  renameList: (id: string, name: string) => void
  deleteList: (id: string) => void

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

export function applyTaskFilters(tasks: Task[], state: Pick<GraphiteState, 'activeListId' | 'filterStatus' | 'filterListId' | 'filterPriority'>): Task[] {
  let list = filterTasksForSmartList(tasks, state.activeListId)
  if (state.filterStatus === 'todo') list = list.filter((t) => !t.completed)
  if (state.filterStatus === 'done') list = list.filter((t) => t.completed)
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
      activeNav: 'dashboard',
      activeListId: 'today',
      filterStatus: 'todo',
      filterListId: 'all',
      filterPriority: 'all',
      expandedTaskId: null,
      selectedTaskId: null,
      todayNote: 'Capture ideas before they slip away.',
      todayNoteUpdatedAt: nowIso(),
      tombstones: [],
      sidebarCollapsed: false,
      commandPaletteOpen: false,
      shortcutsOpen: false,
      searchOpen: false,
      taskModalOpen: false,
      editingTaskId: null,
      focusMode: false,
      focusTaskId: null,
      pomodoro: { ...defaultPomodoro },
      undoQueue: [],
      pickerDate: format(new Date(), 'yyyy-MM-dd'),
      quickAddDraft: '',

      setHydrated: (v) => set({ hydrated: v }),
      setActiveNav: (v) => set({ activeNav: v }),
      setActiveListId: (id) => set({ activeListId: id }),
      setFilters: (f) => set(f),
      setExpandedTaskId: (id) => set({ expandedTaskId: id }),
      setSelectedTaskId: (id) => set({ selectedTaskId: id }),
      setTodayNote: (note) => set({ todayNote: note, todayNoteUpdatedAt: nowIso() }),
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setCommandPaletteOpen: (v) => set({ commandPaletteOpen: v }),
      setShortcutsOpen: (v) => set({ shortcutsOpen: v }),
      setSearchOpen: (v) => set({ searchOpen: v }),
      setTaskModalOpen: (v, editingId = null) =>
        set({ taskModalOpen: v, editingTaskId: editingId }),
      setFocusMode: (on, taskId = null) =>
        set({ focusMode: on, focusTaskId: on ? taskId ?? get().selectedTaskId : null }),
      setPickerDate: (d) => set({ pickerDate: d }),
      setQuickAddDraft: (d) => set({ quickAddDraft: d }),

      addTaskFromQuickAdd: (input) => {
        const parsed = buildTaskFromQuickAdd(input)
        const listId =
          parsed.listId && get().lists.some((l) => l.id === parsed.listId)
            ? parsed.listId
            : get().activeListId === 'completed' || get().activeListId === 'starred'
              ? 'work'
              : get().activeListId === 'today' || get().activeListId === 'upcoming'
                ? 'work'
                : get().activeListId
        return get().addTask({
          title: parsed.title,
          dueDate: parsed.dueDate,
          dueTime: parsed.dueTime,
          priority: parsed.priority,
          listId: listId === 'today' || listId === 'upcoming' || listId === 'starred' ? 'work' : listId,
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
          tags: partial.tags ?? [],
          subtasks: partial.subtasks ?? [],
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
          subtasks: src.subtasks.map((st) => ({ ...st, id: generateId() })),
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

      toggleSubtask: (taskId, subtaskId) =>
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  updatedAt: nowIso(),
                  subtasks: t.subtasks.map((st) =>
                    st.id === subtaskId ? { ...st, completed: !st.completed } : st,
                  ),
                }
              : t,
          ),
        })),

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
        sidebarCollapsed: s.sidebarCollapsed,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && (!state.seeded || state.tasks.length === 0)) {
          useGraphiteStore.setState({ tasks: createSeedTasks(), seeded: true })
        }
      },
    },
  ),
)
