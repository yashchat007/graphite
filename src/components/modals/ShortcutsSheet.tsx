import { AnimatePresence, motion } from 'framer-motion'
import { useGraphiteStore } from '../../store/useGraphiteStore'

const SHORTCUTS = [
  ['N', 'New task'],
  ['/', 'Search / command palette'],
  ['⌘K / Ctrl+K', 'Command palette'],
  ['J / K', 'Move selection'],
  ['X', 'Complete task'],
  ['Del', 'Delete task'],
  ['F', 'Focus mode'],
  ['Esc', 'Exit focus / close overlays'],
  ['?', 'Shortcuts'],
]

export function ShortcutsSheet() {
  const open = useGraphiteStore((s) => s.shortcutsOpen)
  const setOpen = useGraphiteStore((s) => s.setShortcutsOpen)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[55] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Close shortcuts"
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.div
            className="glass-panel relative z-[1] w-full max-w-md p-6"
            initial={{ scale: 0.96 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.96 }}
          >
            <h2 className="mb-4 text-lg font-semibold text-heading">Keyboard shortcuts</h2>
            <dl className="space-y-2">
              {SHORTCUTS.map(([key, desc]) => (
                <div key={key} className="flex items-center justify-between gap-4 text-sm">
                  <dt className="text-muted">{desc}</dt>
                  <dd>
                    <kbd className="rounded-lg border border-lavender/20 bg-white/70 px-2 py-0.5 text-xs text-heading">
                      {key}
                    </kbd>
                  </dd>
                </div>
              ))}
            </dl>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
