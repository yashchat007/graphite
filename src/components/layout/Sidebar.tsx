import { motion } from 'framer-motion'
import { Calendar, ChevronLeft, LayoutDashboard, ListTodo, Triangle } from 'lucide-react'
import { useGraphiteStore } from '../../store/useGraphiteStore'
import type { NavView } from '../../lib/types'

const NAV: { id: NavView; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
]

const SMART_NAV = [
  { id: 'today', label: 'Today' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'starred', label: 'Starred' },
  { id: 'completed', label: 'Completed' },
]

export function Sidebar({ mobile = false }: { mobile?: boolean }) {
  const collapsed = useGraphiteStore((s) => s.sidebarCollapsed)
  const activeNav = useGraphiteStore((s) => s.activeNav)
  const activeListId = useGraphiteStore((s) => s.activeListId)
  const setActiveNav = useGraphiteStore((s) => s.setActiveNav)
  const setActiveListId = useGraphiteStore((s) => s.setActiveListId)
  const toggleSidebar = useGraphiteStore((s) => s.toggleSidebar)

  if (mobile) {
    return (
      <nav
        className="glass-panel fixed bottom-3 left-3 right-3 z-40 flex items-center justify-around px-2 py-2 lg:hidden"
        aria-label="Primary"
      >
        {NAV.map((item) => {
          const Icon = item.icon
          const active = activeNav === item.id
          return (
            <button
              key={item.id}
              type="button"
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              onClick={() => setActiveNav(item.id)}
              className={`focus-ring rounded-xl p-2 ${active ? 'silver-gradient text-[#0B0B0C]' : 'text-[#8A8A8F]'}`}
            >
              <Icon className="h-5 w-5" />
            </button>
          )
        })}
      </nav>
    )
  }

  return (
    <aside
      className={`hidden shrink-0 flex-col gap-6 p-4 lg:flex ${collapsed ? 'w-[88px]' : 'w-[240px]'}`}
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

      <div className="flex flex-col gap-1">
        {NAV.map((item) => {
          const Icon = item.icon
          const active = activeNav === item.id
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveNav(item.id)}
              className={`focus-ring group relative flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition-colors ${
                active ? 'text-[#0B0B0C]' : 'text-[#8A8A8F] hover:bg-white/5 hover:text-[#C7C7CC]'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="nav-pill"
                  className="silver-gradient absolute inset-0 rounded-2xl"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              <Icon className="relative z-[1] h-[18px] w-[18px]" />
              {!collapsed && <span className="relative z-[1] font-medium">{item.label}</span>}
            </button>
          )
        })}
      </div>

      {!collapsed && (
        <motion.div layout className="mt-2 flex flex-col gap-1 border-t border-white/8 pt-4">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-[#5A5A60]">
            Smart lists
          </p>
          {SMART_NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveListId(item.id)
                setActiveNav('tasks')
              }}
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
