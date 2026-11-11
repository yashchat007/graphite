import { useEffect } from 'react'
import { applyTaskFilters, useGraphiteStore } from '../store/useGraphiteStore'

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      const typing =
        target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable

      const store = useGraphiteStore.getState()

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        store.setCommandPaletteOpen(true)
        return
      }

      if (e.key === 'Escape') {
        store.setFocusMode(false)
        store.setCommandPaletteOpen(false)
        store.setShortcutsOpen(false)
        store.setTaskModalOpen(false, null)
        return
      }

      if (typing) return

      if (e.key === '?') {
        store.setShortcutsOpen(true)
        return
      }
      if (e.key === 'n' || e.key === 'N') {
        store.setTaskModalOpen(true, null)
        return
      }
      if (e.key === '/') {
        e.preventDefault()
        store.setCommandPaletteOpen(true)
        return
      }
      if (e.key === 'f' || e.key === 'F') {
        store.setFocusMode(true, store.selectedTaskId)
        return
      }
      if (e.key === 'e' || e.key === 'E') {
        if (store.selectedTaskId) store.setTaskModalOpen(true, store.selectedTaskId)
        return
      }
      if (e.key === 'x' || e.key === 'X') {
        if (store.selectedTaskId) store.completeTask(store.selectedTaskId)
        return
      }
      if (e.key === 'Delete' && store.selectedTaskId) {
        store.deleteTask(store.selectedTaskId)
        return
      }

      const tasks = applyTaskFilters(store.tasks, store)
      const idx = tasks.findIndex((t) => t.id === store.selectedTaskId)
      if (e.key === 'j' || e.key === 'J') {
        const next = tasks[Math.min(tasks.length - 1, idx + 1)]
        if (next) store.setSelectedTaskId(next.id)
      }
      if (e.key === 'k' || e.key === 'K') {
        const prev = tasks[Math.max(0, idx - 1)]
        if (prev) store.setSelectedTaskId(prev.id)
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])
}
