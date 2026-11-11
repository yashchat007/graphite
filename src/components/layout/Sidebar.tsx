import { motion } from 'framer-motion'
import { ChevronLeft, Triangle } from 'lucide-react'
import { PomodoroCard } from '../../features/focus/PomodoroCard'
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

  return (
    <aside
      className={`hidden shrink-0 flex-col gap-6 p-4 lg:flex ${collapsed ? 'w-[88px]' : 'w-[260px]'}`}
      aria-label="Sidebar"
    >
      <div className="flex items-center gap-3 px-2">
        <motion.div
          layout
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5"
        >
          <Triangle className="h-4 w-4 text-[#E6E6E8]" strokeWidth={1.5} />
        </motion.div>
        {!collapsed && (
          <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <p className="text-sm font-semibold tracking-wide text-[#F2F2F3]">Graphite</p>
            <p className="text-[11px] text-[#5A5A60]">Task studio</p>
          </motion.div>
        )}
      </div>

      {!collapsed && (
        <motion.div layout className="flex flex-col gap-1">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-[#5A5A60]">
            Smart lists
          </p>
          {SMART_NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveListId(item.id)}
              className={`focus-ring rounded-xl px-3 py-2 text-left text-sm ${
                activeListId === item.id
                  ? 'bg-white/10 text-[#F2F2F3]'
                  : 'text-[#8A8A8F] hover:bg-white/5'
              }`}
            >
              {item.label}
            </button>
          ))}
        </motion.div>
      )}

      {!collapsed && (
        <motion.div layout className="min-h-0">
          <PomodoroCard />
        </motion.div>
      )}

      <div className="mt-auto">
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="focus-ring flex w-full items-center justify-center rounded-xl border border-white/8 py-2 text-[#8A8A8F] hover:bg-white/5"
        >
          <ChevronLeft className={`h-4 w-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </aside>
  )
}
