import { Search } from 'lucide-react'
import { useGraphiteStore } from '../../store/useGraphiteStore'
import { SyncIndicator } from './SyncIndicator'

export function TopBar() {
  const setCommandPaletteOpen = useGraphiteStore((s) => s.setCommandPaletteOpen)
  const activeListId = useGraphiteStore((s) => s.activeListId)

  const viewLabel =
    activeListId === 'today'
      ? 'Today'
      : activeListId === 'upcoming'
        ? 'Upcoming'
        : activeListId === 'starred'
          ? 'Starred'
          : activeListId === 'completed'
            ? 'Completed'
            : 'Dashboard'

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 pb-2">
      <h2 className="text-sm font-medium text-body">{viewLabel}</h2>

      <div className="flex items-center gap-3">
        <SyncIndicator />
        <button
          type="button"
          aria-label="Open command palette"
          onClick={() => setCommandPaletteOpen(true)}
          className="focus-ring flex items-center gap-2 rounded-full border border-lavender/20 bg-white/70 px-3 py-1.5 text-xs text-muted hover:border-lavender/30"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Search</span>
          <kbd className="hidden rounded border border-lavender/20 px-1.5 py-0.5 text-[10px] sm:inline">
            ⌘K
          </kbd>
        </button>
      </div>
    </header>
  )
}
