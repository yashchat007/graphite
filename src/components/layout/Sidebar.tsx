import { motion } from 'framer-motion'
import { ChevronLeft, Focus, Triangle } from 'lucide-react'
import { StopwatchCard } from '../../features/focus/StopwatchCard'
import { useGraphiteStore } from '../../store/useGraphiteStore'

const SMART_NAV = [
  { id: 'today', label: 'Today' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'starred', label: 'Starred' },
  { id: 'completed', label: 'Completed' },
]

export function Sidebar() {
  const collapsed = useGraphiteStore((s) => s.sidebarCollapsed)
  const activeListId = useGraphiteStore((s) => s.activeListId)
  const setActiveListId = useGraphiteStore((s) => s.setActiveListId)
  const toggleSidebar = useGraphiteStore((s) => s.toggleSidebar)
  const setFocusMode = useGraphiteStore((s) => s.setFocusMode)
  const selectedTaskId = useGraphiteStore((s) => s.selectedTaskId)

  return (
    <aside
      className={`hidden shrink-0 flex-col gap-6 p-4 lg:flex ${collapsed ? 'w-[88px]' : 'w-[260px]'}`}
      aria-label="Sidebar"
    >
      <div className="flex items-center gap-3 px-2">
        <motion.div
          layout
          className="glass-panel flex h-10 w-10 items-center justify-center rounded-xl !p-0 shadow-none"
        >
          <Triangle className="h-4 w-4 text-lavender" strokeWidth={1.5} />
        </motion.div>
        {!collapsed && (
          <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-sm font-semibold tracking-wide text-heading">Graphite</p>
            <p className="text-[11px] text-faint">Task studio</p>
          </motion.div>
        )}
      </div>

      {!collapsed && (
        <motion.div layout className="flex flex-col gap-1">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-faint">
            Smart lists
          </p>
          {SMART_NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveListId(item.id)}
              className={`focus-ring rounded-xl px-3 py-2 text-left text-sm ${
                activeListId === item.id
                  ? 'surface-soft text-heading'
                  : 'text-muted hover:surface-soft'
              }`}
            >
              {item.label}
            </button>
          ))}
        </motion.div>
      )}

      {!collapsed && (
        <motion.div layout className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setFocusMode(true, selectedTaskId)}
            className="focus-ring flex items-center justify-center gap-2 rounded-xl border border-lavender/25 bg-white/60 px-3 py-2.5 text-sm font-medium text-heading hover:bg-lavender-soft"
          >
            <Focus className="h-4 w-4 text-lavender" />
            Open Focus
          </button>
          <StopwatchCard compact />
        </motion.div>
      )}

      <div className="mt-auto">
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="focus-ring flex w-full items-center justify-center rounded-xl border border-glass py-2 text-muted hover:surface-soft"
        >
          <ChevronLeft className={`h-4 w-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </aside>
  )
}
