import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { useMemo } from 'react'
import { tokenizeQuickAdd } from '../../lib/nlp-parser'
import { useGraphiteStore } from '../../store/useGraphiteStore'
import { Chip } from '../ui/Chip'

export function QuickAdd() {
  const draft = useGraphiteStore((s) => s.quickAddDraft)
  const setDraft = useGraphiteStore((s) => s.setQuickAddDraft)
  const addTaskFromQuickAdd = useGraphiteStore((s) => s.addTaskFromQuickAdd)

  const tokens = useMemo(() => tokenizeQuickAdd(draft), [draft])
  const recognized = tokens.filter((t) => t.type !== 'text')

  const submit = () => {
    const trimmed = draft.trim()
    if (!trimmed) return
    addTaskFromQuickAdd(trimmed)
    setDraft('')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel relative z-10 flex flex-col gap-2 p-3 sm:flex-row sm:items-center"
    >
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
        <Plus className="h-4 w-4 shrink-0 text-muted" aria-hidden />
        {recognized.map((t, i) => (
          <Chip key={`${t.start}-${i}`} variant="silver">
            {t.raw}
          </Chip>
        ))}
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit()
          }}
          placeholder='Quick add — try "Review deck tomorrow 7pm !high"'
          aria-label="Quick add task"
          className="min-w-[120px] flex-1 bg-transparent text-sm text-heading placeholder:text-faint outline-none"
        />
      </div>
      <button
        type="button"
        onClick={submit}
        className="focus-ring shrink-0 rounded-full border border-lavender/20 bg-white/70 px-3 py-1.5 text-xs font-medium text-body hover:bg-lavender-soft"
      >
        Add
      </button>
    </motion.div>
  )
}
