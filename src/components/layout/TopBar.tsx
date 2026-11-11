import { format, parseISO } from 'date-fns'
import { ChevronRight, Search } from 'lucide-react'
import { useGraphiteStore } from '../../store/useGraphiteStore'
import { SyncIndicator } from './SyncIndicator'

export function TopBar() {
  const pickerDate = useGraphiteStore((s) => s.pickerDate)
  const setPickerDate = useGraphiteStore((s) => s.setPickerDate)
  const setCommandPaletteOpen = useGraphiteStore((s) => s.setCommandPaletteOpen)

  const displayDate = format(parseISO(pickerDate), 'EEEE, MMM d')

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 pb-2">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-[#8A8A8F]">
        <span>Home</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-[#C7C7CC]">Dashboard</span>
        <ChevronRight className="h-3.5 w-3.5" />
        <label className="flex items-center gap-2">
          <span className="sr-only">Selected date</span>
          <input
            type="date"
            value={pickerDate}
            onChange={(e) => setPickerDate(e.target.value)}
            className="focus-ring cursor-pointer rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-[#C7C7CC]"
          />
        </label>
        <span className="hidden text-[#5A5A60] sm:inline">{displayDate}</span>
      </nav>

      <div className="flex items-center gap-3">
        <SyncIndicator />
        <button
          type="button"
          aria-label="Open command palette"
          onClick={() => setCommandPaletteOpen(true)}
          className="focus-ring flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-[#8A8A8F] hover:border-white/20"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden rounded border border-white/15 px-1.5 py-0.5 text-[10px] sm:inline">
            ⌘K
          </kbd>
        </button>
      </div>
    </header>
  )
}
