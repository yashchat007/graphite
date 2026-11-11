import { Plus } from 'lucide-react'
import { useState } from 'react'
import type { FilterStatus, Priority } from '../../lib/types'
import { useGraphiteStore } from '../../store/useGraphiteStore'
import { Button } from '../ui/Button'
import { Pill } from '../ui/Pill'

export function FilterRow() {
  const filterStatus = useGraphiteStore((s) => s.filterStatus)
  const filterListId = useGraphiteStore((s) => s.filterListId)
  const filterPriority = useGraphiteStore((s) => s.filterPriority)
  const lists = useGraphiteStore((s) => s.lists)
  const setFilters = useGraphiteStore((s) => s.setFilters)
  const setTaskModalOpen = useGraphiteStore((s) => s.setTaskModalOpen)

  const [open, setOpen] = useState<'status' | 'list' | 'priority' | null>(null)

  const statusLabel = filterStatus === 'all' ? 'Status' : filterStatus === 'todo' ? 'To do' : 'Done'
  const listLabel =
    filterListId === 'all' ? 'List' : (lists.find((l) => l.id === filterListId)?.name ?? filterListId)
  const priorityLabel = filterPriority === 'all' ? 'Priority' : filterPriority

  const close = () => setOpen(null)

  return (
    <div className="relative flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Pill
            label={statusLabel}
            active={filterStatus !== 'all'}
            onClick={() => setOpen(open === 'status' ? null : 'status')}
          />
          {open === 'status' && (
            <Dropdown
              options={[
                { value: 'all', label: 'All' },
                { value: 'todo', label: 'To do' },
                { value: 'done', label: 'Done' },
              ]}
              onPick={(v) => {
                setFilters({ filterStatus: v as FilterStatus })
                close()
              }}
            />
          )}
        </div>
        <div className="relative">
          <Pill
            label={listLabel}
            active={filterListId !== 'all'}
            onClick={() => setOpen(open === 'list' ? null : 'list')}
          />
          {open === 'list' && (
            <Dropdown
              options={[{ value: 'all', label: 'All lists' }, ...lists.map((l) => ({ value: l.id, label: l.name }))]}
              onPick={(v) => {
                setFilters({ filterListId: v })
                close()
              }}
            />
          )}
        </div>
        <div className="relative">
          <Pill
            label={priorityLabel}
            active={filterPriority !== 'all'}
            onClick={() => setOpen(open === 'priority' ? null : 'priority')}
          />
          {open === 'priority' && (
            <Dropdown
              options={[
                { value: 'all', label: 'Any' },
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' },
              ]}
              onPick={(v) => {
                setFilters({ filterPriority: v as Priority | 'all' })
                close()
              }}
            />
          )}
        </div>
      </div>
      <Button variant="primary" className="group" onClick={() => setTaskModalOpen(true, null)}>
        <Plus className="h-4 w-4" />
        New task
      </Button>
    </div>
  )
}

function Dropdown({
  options,
  onPick,
}: {
  options: { value: string; label: string }[]
  onPick: (value: string) => void
}) {
  return (
    <div className="glass-panel absolute left-0 top-full z-40 mt-2 min-w-[140px] p-1 shadow-xl">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className="focus-ring w-full rounded-xl px-3 py-2 text-left text-xs text-[#C7C7CC] hover:bg-white/8"
          onClick={() => onPick(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
