import { motion, AnimatePresence } from 'framer-motion'
import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useGraphiteStore } from '../../store/useGraphiteStore'

export function CommandPalette() {
  const open = useGraphiteStore((s) => s.commandPaletteOpen)
  const setOpen = useGraphiteStore((s) => s.setCommandPaletteOpen)
  const tasks = useGraphiteStore((s) => s.tasks)
  const lists = useGraphiteStore((s) => s.lists)
  const setActiveListId = useGraphiteStore((s) => s.setActiveListId)
  const setSelectedTaskId = useGraphiteStore((s) => s.setSelectedTaskId)
  const setExpandedTaskId = useGraphiteStore((s) => s.setExpandedTaskId)
  const setTaskModalOpen = useGraphiteStore((s) => s.setTaskModalOpen)
  const setFocusMode = useGraphiteStore((s) => s.setFocusMode)

  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    const q = query.toLowerCase().trim()
    const taskHits = tasks
      .filter((t) => !t.completed && (!q || t.title.toLowerCase().includes(q)))
      .slice(0, 6)
      .map((t) => ({ type: 'task' as const, id: t.id, label: t.title }))
    const listHits = lists
      .filter((l) => !q || l.name.toLowerCase().includes(q))
      .map((l) => ({ type: 'list' as const, id: l.id, label: l.name }))
    const actions = [
      { type: 'action' as const, id: 'new', label: 'New task' },
      { type: 'action' as const, id: 'focus', label: 'Enter focus mode' },
    ].filter((a) => !q || a.label.toLowerCase().includes(q))
    return [...actions, ...listHits, ...taskHits]
  }, [query, tasks, lists])

  const run = (item: (typeof results)[number]) => {
    if (item.type === 'task') {
      setSelectedTaskId(item.id)
      setExpandedTaskId(item.id)
    }
    if (item.type === 'list') setActiveListId(item.id)
    if (item.type === 'action' && item.id === 'new') setTaskModalOpen(true, null)
    if (item.type === 'action' && item.id === 'focus') setFocusMode(true)
    setOpen(false)
    setQuery('')
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Close palette"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.div
            role="dialog"
            aria-label="Command palette"
            className="glass-panel relative z-[1] w-full max-w-xl overflow-hidden"
            initial={{ scale: 0.96, y: -8 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: -8 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          >
            <div className="flex items-center gap-2 border-b border-lavender/15 px-4 py-3">
              <Search className="h-4 w-4 text-muted" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tasks, lists, actions…"
                className="flex-1 bg-transparent text-sm text-heading outline-none placeholder:text-faint"
              />
            </div>
            <ul className="max-h-80 overflow-y-auto p-2">
              {results.length === 0 ? (
                <li className="px-3 py-6 text-center text-sm text-muted">No results</li>
              ) : (
                results.map((item) => (
                  <li key={`${item.type}-${item.id}`}>
                    <button
                      type="button"
                      className="focus-ring flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-sm text-body hover:bg-lavender-soft"
                      onClick={() => run(item)}
                    >
                      <span>{item.label}</span>
                      <span className="text-[10px] uppercase tracking-wide text-faint">{item.type}</span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
