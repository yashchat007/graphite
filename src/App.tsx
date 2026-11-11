import { motion } from 'framer-motion'
import { useEffect } from 'react'
import { Background } from './components/layout/Background'
import { Sidebar } from './components/layout/Sidebar'
import { TopBar } from './components/layout/TopBar'
import { FilterRow } from './components/tasks/FilterRow'
import { Hero } from './components/tasks/Hero'
import { QuickAdd } from './components/tasks/QuickAdd'
import { TaskList } from './components/tasks/TaskCard'
import { CommandPalette } from './components/modals/CommandPalette'
import { ShortcutsSheet } from './components/modals/ShortcutsSheet'
import { TaskModal } from './components/modals/TaskModal'
import { UndoToast } from './components/feedback/UndoToast'
import { FocusOverlay } from './components/focus/FocusOverlay'
import { TodayNote } from './features/tasks/TodayNote'
import { MyFilesCard } from './features/tasks/MyFilesCard'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import { defaultExpiresAt, normalizeStoredFile, pruneStoredFiles } from './lib/file-expiry'
import { nowIso } from './lib/sync-document'
import { createSeedTasks } from './lib/seed'
import { AccessKeyGate } from './components/auth/AccessKeyGate'
import { useSyncEngine } from './hooks/useSyncEngine'
import { useGraphiteStore } from './store/useGraphiteStore'

export default function App() {
  const hydrated = useGraphiteStore((s) => s.hydrated)
  const setHydrated = useGraphiteStore((s) => s.setHydrated)
  useKeyboardShortcuts()
  useSyncEngine()

  useEffect(() => {
    const finish = () => {
      const state = useGraphiteStore.getState()
      const ts = nowIso()
      useGraphiteStore.setState({
        tasks: state.tasks.map((t) => ({
          ...t,
          updatedAt: t.updatedAt ?? t.createdAt ?? ts,
        })),
        lists: state.lists.map((l) => ({
          ...l,
          updatedAt: l.updatedAt ?? ts,
        })),
        todayNoteUpdatedAt: state.todayNoteUpdatedAt ?? ts,
        tombstones: state.tombstones ?? [],
        files: pruneStoredFiles(
          (state.files ?? []).map((f) =>
            normalizeStoredFile({
              ...f,
              expiresAt: f.expiresAt ?? defaultExpiresAt(f.uploadedAt ?? ts),
            }),
          ),
        ),
      })
      const next = useGraphiteStore.getState()
      if (!next.seeded || next.tasks.length === 0) {
        useGraphiteStore.setState({ tasks: createSeedTasks(), seeded: true })
      }
      setHydrated(true)
    }
    finish()
    const unsub = useGraphiteStore.persist.onFinishHydration(finish)
    return unsub
  }, [setHydrated])

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0B0B0C] text-sm text-[#8A8A8F]">
        Loading Graphite…
      </div>
    )
  }

  return (
    <AccessKeyGate>
      <Background />
      <motion.main
        className="mx-3 my-3 min-h-[calc(100vh-1.5rem)] lg:mx-6 lg:my-6"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
      >
        <motion.div className="glass-panel flex min-h-[calc(100vh-1.5rem)] flex-col overflow-hidden lg:min-h-[calc(100vh-3rem)] lg:flex-row">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col lg:flex-row">
            <div className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto p-4 pb-24 lg:p-6 lg:pb-6">
              <TopBar />
              <Hero />
              <FilterRow />
              <QuickAdd />
              <TaskList />
            </div>
            <aside className="flex w-full shrink-0 flex-col gap-4 border-t border-white/5 p-4 lg:w-[300px] lg:border-l lg:border-t-0 lg:overflow-y-auto">
              <TodayNote />
              <MyFilesCard />
            </aside>
          </div>
        </motion.div>
      </motion.main>
      <CommandPalette />
      <ShortcutsSheet />
      <TaskModal />
      <FocusOverlay />
      <UndoToast />
    </AccessKeyGate>
  )
}
