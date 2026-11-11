import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Check,
  Copy,
  MoreHorizontal,
  Pencil,
  Star,
  Trash2,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { USE_AMBER_ACCENT } from '../../lib/constants'
import { parseDisplayTimeRange } from '../../lib/nlp-parser'
import { dueLabel, subtaskProgress } from '../../lib/task-utils'
import type { Task } from '../../lib/types'
import { useVisibleTasks } from '../../hooks/useVisibleTasks'
import { useGraphiteStore } from '../../store/useGraphiteStore'
import { Chip } from '../ui/Chip'
import { GlassCard } from '../ui/GlassCard'
import { ProgressBar } from '../ui/ProgressBar'

const PARTICIPANT_COLORS = ['#E6E6E8', '#B0B0B5', '#8A8A8F']

function StatusDot({ task }: { task: Task }) {
  const isToday = dueLabel(task) === 'Today'
  const high = task.priority === 'high'
  const color =
    USE_AMBER_ACCENT && (isToday || high)
      ? '#D9A35B'
      : isToday
        ? '#C7C7CC'
        : '#5A5A60'
  return (
    <span
      className="inline-block h-2 w-2 shrink-0 rounded-full"
      style={{ backgroundColor: color }}
      aria-hidden
    />
  )
}

interface TaskCardProps {
  task: Task
  index: number
}

function SortableTaskCard({ task, index }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const expandedTaskId = useGraphiteStore((s) => s.expandedTaskId)
  const selectedTaskId = useGraphiteStore((s) => s.selectedTaskId)
  const setExpanded = useGraphiteStore((s) => s.setExpandedTaskId)
  const setSelected = useGraphiteStore((s) => s.setSelectedTaskId)
  const completeTask = useGraphiteStore((s) => s.completeTask)
  const toggleStar = useGraphiteStore((s) => s.toggleStar)
  const toggleSubtask = useGraphiteStore((s) => s.toggleSubtask)
  const duplicateTask = useGraphiteStore((s) => s.duplicateTask)
  const deleteTask = useGraphiteStore((s) => s.deleteTask)
  const setTaskModalOpen = useGraphiteStore((s) => s.setTaskModalOpen)
  const updateTask = useGraphiteStore((s) => s.updateTask)
  const lists = useGraphiteStore((s) => s.lists)

  const expanded = expandedTaskId === task.id
  const selected = selectedTaskId === task.id
  const [menuOpen, setMenuOpen] = useState(false)
  const [completing, setCompleting] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const progress = subtaskProgress(task)
  const listName = lists.find((l) => l.id === task.listId)?.name ?? task.listId

  const handleComplete = () => {
    if (task.completed) return
    setCompleting(true)
    window.setTimeout(() => {
      completeTask(task.id)
      setCompleting(false)
    }, 600)
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : 1,
    zIndex: isDragging ? 20 : undefined,
  }

  const priorityChip =
    task.priority === 'high'
      ? USE_AMBER_ACCENT
        ? 'priority-high'
        : 'silver'
      : task.priority !== 'none'
        ? 'muted'
        : null

  return (
    <motion.div
      ref={setNodeRef}
      layout
      style={style}
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: completing ? 0.6 : 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -40, transition: { duration: 0.25 } }}
      transition={{ delay: index * 0.04, type: 'spring', stiffness: 260, damping: 26 }}
      {...attributes}
      {...listeners}
    >
      <GlassCard
        hoverLift
        cursorGlow
        className={`group cursor-grab active:cursor-grabbing p-4 md:p-5 ${
          selected ? 'ring-1 ring-white/20' : ''
        }`}
        onClick={() => {
          setSelected(task.id)
          setExpanded(expanded ? null : task.id)
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            setSelected(task.id)
            setExpanded(expanded ? null : task.id)
          }
        }}
        aria-expanded={expanded}
      >
        <motion.div layout="position">
          <div className="flex items-start gap-3">
            <button
              type="button"
              aria-label={task.completed ? 'Completed' : 'Mark complete'}
              onClick={(e) => {
                e.stopPropagation()
                handleComplete()
              }}
              className="focus-ring relative mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/5"
            >
              {completing && (
                <motion.span
                  className="absolute inset-0 rounded-full silver-gradient opacity-30"
                  initial={{ scale: 0.5, opacity: 0.5 }}
                  animate={{ scale: 2.2, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                />
              )}
              {completing && <Check className="h-3.5 w-3.5 text-[#0B0B0C]" strokeWidth={3} />}
            </button>

            <div className="min-w-0 flex-1">
              <div className="mb-1 flex flex-wrap items-center gap-2">
                <StatusDot task={task} />
                <span className="text-[11px] font-medium uppercase tracking-wide text-[#8A8A8F]">
                  {dueLabel(task)}
                </span>
                {task.dueTime && (
                  <span className="text-[11px] text-[#5A5A60]">
                    {parseDisplayTimeRange(task.dueTime, task.endTime)}
                  </span>
                )}
              </div>

              <h3
                className={`text-base font-semibold text-[#F2F2F3] ${!expanded ? 'line-clamp-1' : ''} ${
                  completing ? 'line-through decoration-white/40' : ''
                }`}
              >
                {task.title}
              </h3>

              <p
                className={`mt-1 text-sm text-[#8A8A8F] ${expanded ? '' : 'line-clamp-2'}`}
              >
                {task.description || 'No description yet.'}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <div className="flex -space-x-1.5" aria-hidden>
                  {PARTICIPANT_COLORS.map((c, i) => (
                    <span
                      key={i}
                      className="inline-block h-6 w-6 rounded-full border border-[#0B0B0C]"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
                <Chip variant="muted">{listName}</Chip>
                {task.tags.slice(0, expanded ? 10 : 2).map((tag) => (
                  <Chip key={tag} variant={priorityChip === 'silver' ? 'silver' : 'muted'}>
                    {tag}
                  </Chip>
                ))}
                {priorityChip && task.priority === 'high' && (
                  <Chip variant={priorityChip}>{task.priority}</Chip>
                )}
              </div>

              <div className="mt-4">
                <ProgressBar value={progress} />
              </div>

              <AnimatePresence initial={false}>
                {expanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 space-y-2 border-t border-white/8 pt-4"
                  >
                    {task.subtasks.length === 0 ? (
                      <p className="text-xs text-[#5A5A60]">No subtasks</p>
                    ) : (
                      task.subtasks.map((st) => (
                        <label
                          key={st.id}
                          className="flex cursor-pointer items-center gap-2 text-sm text-[#C7C7CC]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={st.completed}
                            onChange={() => toggleSubtask(task.id, st.id)}
                            className="accent-[#9A9AA0]"
                          />
                          <span className={st.completed ? 'line-through opacity-60' : ''}>
                            {st.title}
                          </span>
                        </label>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex shrink-0 flex-col items-center gap-1">
              <button
                type="button"
                aria-label={task.starred ? 'Unstar' : 'Star'}
                onClick={(e) => {
                  e.stopPropagation()
                  toggleStar(task.id)
                }}
                className="focus-ring rounded-lg p-1 text-[#8A8A8F] hover:text-[#F2F2F3]"
              >
                <Star className={`h-4 w-4 ${task.starred ? 'fill-[#E6E6E8] text-[#E6E6E8]' : ''}`} />
              </button>
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  aria-label="Task menu"
                  aria-expanded={menuOpen}
                  onClick={(e) => {
                    e.stopPropagation()
                    setMenuOpen((o) => !o)
                  }}
                  className="focus-ring rounded-lg p-1 text-[#8A8A8F] hover:bg-white/5"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
                {menuOpen && (
                  <div
                    className="glass-panel absolute right-0 z-30 min-w-[160px] p-1 text-sm shadow-xl"
                    role="menu"
                  >
                    {[
                      { icon: Pencil, label: 'Edit', action: () => setTaskModalOpen(true, task.id) },
                      { icon: Copy, label: 'Duplicate', action: () => duplicateTask(task.id) },
                      {
                        icon: Copy,
                        label: 'Move to Work',
                        action: () => updateTask(task.id, { listId: 'work' }),
                      },
                      { icon: Trash2, label: 'Delete', action: () => deleteTask(task.id) },
                    ].map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        role="menuitem"
                        className="focus-ring flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-[#C7C7CC] hover:bg-white/8"
                        onClick={(e) => {
                          e.stopPropagation()
                          item.action()
                          setMenuOpen(false)
                        }}
                      >
                        <item.icon className="h-3.5 w-3.5" />
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </GlassCard>
    </motion.div>
  )
}

export function TaskList() {
  const tasks = useVisibleTasks()
  const reorderTasks = useGraphiteStore((s) => s.reorderTasks)
  const activeListId = useGraphiteStore((s) => s.activeListId)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const ids = tasks.map((t) => t.id)
    const oldIndex = ids.indexOf(String(active.id))
    const newIndex = ids.indexOf(String(over.id))
    reorderTasks(arrayMove(ids, oldIndex, newIndex))
  }

  if (tasks.length === 0) {
    return (
      <GlassCard className="flex flex-col items-center justify-center gap-2 p-12 text-center">
        <p className="text-lg font-medium text-[#F2F2F3]">Nothing here yet</p>
        <p className="max-w-sm text-sm text-[#8A8A8F]">
          Add a task with the quick-add bar or press <kbd className="rounded border border-white/15 px-1">N</kbd>.
          You are viewing <span className="text-[#C7C7CC]">{activeListId}</span>.
        </p>
      </GlassCard>
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {tasks.map((task, i) => (
              <SortableTaskCard key={task.id} task={task} index={i} />
            ))}
          </AnimatePresence>
        </div>
      </SortableContext>
    </DndContext>
  )
}
