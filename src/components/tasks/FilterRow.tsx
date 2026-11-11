import { Plus } from 'lucide-react'
import { useRef, useState } from 'react'
import type { Priority } from '../../lib/types'
import { useGraphiteStore } from '../../store/useGraphiteStore'
import { Button } from '../ui/Button'
import { FloatingMenu, MenuItem } from '../ui/FloatingMenu'
import { Pill } from '../ui/Pill'

export function FilterRow() {
  const filterListId = useGraphiteStore((s) => s.filterListId)
  const filterPriority = useGraphiteStore((s) => s.filterPriority)
  const lists = useGraphiteStore((s) => s.lists)
  const setFilters = useGraphiteStore((s) => s.setFilters)
  const setTaskModalOpen = useGraphiteStore((s) => s.setTaskModalOpen)

  const [open, setOpen] = useState<'list' | 'priority' | null>(null)
  const listAnchor = useRef<HTMLButtonElement>(null)
  const priorityAnchor = useRef<HTMLButtonElement>(null)

  const listLabel =
    filterListId === 'all' ? 'List' : (lists.find((l) => l.id === filterListId)?.name ?? filterListId)
  const priorityLabel = filterPriority === 'all' ? 'Priority' : filterPriority

  const close = () => setOpen(null)

  return (
    <div className="relative z-20 flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <Pill
          ref={listAnchor}
          label={listLabel}
          active={filterListId !== 'all'}
          onClick={() => setOpen(open === 'list' ? null : 'list')}
        />
        <FloatingMenu
          open={open === 'list'}
          onClose={close}
          anchorRef={listAnchor}
          minWidth={160}
        >
          {[{ value: 'all', label: 'All lists' }, ...lists.map((l) => ({ value: l.id, label: l.name }))].map(
            (o) => (
              <MenuItem
                key={o.value}
                onClick={() => {
                  setFilters({ filterListId: o.value })
                  close()
                }}
              >
                {o.label}
              </MenuItem>
            ),
          )}
        </FloatingMenu>

        <Pill
          ref={priorityAnchor}
          label={priorityLabel}
          active={filterPriority !== 'all'}
          onClick={() => setOpen(open === 'priority' ? null : 'priority')}
        />
        <FloatingMenu
          open={open === 'priority'}
          onClose={close}
          anchorRef={priorityAnchor}
          minWidth={140}
        >
          {[
            { value: 'all', label: 'Any' },
            { value: 'high', label: 'High' },
            { value: 'medium', label: 'Medium' },
            { value: 'low', label: 'Low' },
          ].map((o) => (
            <MenuItem
              key={o.value}
              onClick={() => {
                setFilters({ filterPriority: o.value as Priority | 'all' })
                close()
              }}
            >
              {o.label}
            </MenuItem>
          ))}
        </FloatingMenu>
      </div>
      <Button variant="primary" className="group" onClick={() => setTaskModalOpen(true)}>
        <Plus className="h-4 w-4" />
        New task
      </Button>
    </div>
  )
}
