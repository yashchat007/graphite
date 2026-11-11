import { StickyNote } from 'lucide-react'
import { useGraphiteStore } from '../../store/useGraphiteStore'
import { GlassCard } from '../../components/ui/GlassCard'

export function TodayNote() {
  const note = useGraphiteStore((s) => s.todayNote)
  const setTodayNote = useGraphiteStore((s) => s.setTodayNote)

  return (
    <GlassCard className="p-5">
      <div className="mb-3 flex items-center gap-2">
        <StickyNote className="h-4 w-4 text-[#8A8A8F]" />
        <h2 className="text-sm font-semibold text-[#F2F2F3]">Today note</h2>
      </div>
      <label className="sr-only" htmlFor="today-note">
        Today note
      </label>
      <textarea
        id="today-note"
        value={note}
        onChange={(e) => setTodayNote(e.target.value)}
        rows={5}
        className="focus-ring w-full resize-none rounded-2xl border border-white/8 bg-white/5 p-3 text-sm text-[#C7C7CC] placeholder:text-[#5A5A60] outline-none"
        placeholder="Jot down thoughts for today…"
      />
    </GlassCard>
  )
}
