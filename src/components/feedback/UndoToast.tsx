import { AnimatePresence, motion } from 'framer-motion'
import { useGraphiteStore } from '../../store/useGraphiteStore'
import { Button } from '../ui/Button'

export function UndoToast() {
  const queue = useGraphiteStore((s) => s.undoQueue)
  const popUndo = useGraphiteStore((s) => s.popUndo)

  return (
    <div className="pointer-events-none fixed bottom-24 left-1/2 z-[70] flex -translate-x-1/2 flex-col gap-2 lg:bottom-8">
      <AnimatePresence>
        {queue.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="pointer-events-auto glass-panel flex items-center gap-3 px-4 py-3 text-sm text-body"
          >
            <span>{item.label}</span>
            <Button
              variant="ghost"
              className="!px-2 !py-1 text-xs"
              onClick={() => {
                item.undo()
                popUndo(item.id)
              }}
            >
              Undo
            </Button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
