import { Focus, Search } from 'lucide-react'
import { useGraphiteStore } from '../../store/useGraphiteStore'
import { SyncIndicator } from './SyncIndicator'
import { IstClock } from './IstClock'

export function TopBar() {
  const setCommandPaletteOpen = useGraphiteStore((s) => s.setCommandPaletteOpen)
  const setFocusMode = useGraphiteStore((s) => s.setFocusMode)
  const selectedTaskId = useGraphiteStore((s) => s.selectedTaskId)
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
      <div className="flex min-w-0 flex-wrap items-center gap-4">
        <h2 className="text-sm font-medium text-body">{viewLabel}</h2>
        <IstClock className="hidden sm:block" />
      </div>

      <div className="flex items-center gap-3">
        <IstClock className="sm:hidden" />
        <button
          type="button"
          onClick={() => setFocusMode(true, selectedTaskId)}
          className="focus-ring flex items-center gap-1.5 rounded-full border border-lavender/20 bg-white/70 px-3 py-1.5 text-xs font-medium text-body hover:bg-lavender-soft lg:hidden"
        >
          <Focus className="h-3.5 w-3.5" />
          Focus
        </button>
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
