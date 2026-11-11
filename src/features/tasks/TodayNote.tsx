import { StickyNote } from 'lucide-react'
import { useGraphiteStore } from '../../store/useGraphiteStore'
import { GlassCard } from '../../components/ui/GlassCard'

export function TodayNote() {
  const note = useGraphiteStore((s) => s.todayNote)
  const setTodayNote = useGraphiteStore((s) => s.setTodayNote)

  return (
    <GlassCard className="p-5">
      <div className="mb-3 flex items-center gap-2">
        <StickyNote className="h-4 w-4 text-muted" />
        <h2 className="text-sm font-semibold text-heading">Today note</h2>
      </div>
      <label className="sr-only" htmlFor="today-note">
        Today note
      </label>
      <textarea
        id="today-note"
        value={note}
        onChange={(e) => setTodayNote(e.target.value)}
        rows={5}
        className="focus-ring w-full resize-none rounded-2xl border border-lavender/15 bg-white/70 p-3 text-sm text-body placeholder:text-faint outline-none"
        placeholder="Jot down thoughts for today…"
      />
    </GlassCard>
  )
}
