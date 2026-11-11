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
import { Check, ChevronDown, Copy, MoreHorizontal, Pencil, Star, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { useCompletedSectionTasks } from '../../hooks/useCompletedTasks'
import { useVisibleTasks } from '../../hooks/useVisibleTasks'
import { parseDisplayTimeRange } from '../../lib/nlp-parser'
import { priorityColor, VAR_COMPLETE, VAR_STARRED } from '../../lib/theme-states'
import { dueLabel } from '../../lib/task-utils'
import type { Task } from '../../lib/types'
import { useGraphiteStore } from '../../store/useGraphiteStore'
import { Chip } from '../ui/Chip'
import { FloatingMenu, MenuItem } from '../ui/FloatingMenu'
import { GlassCard } from '../ui/GlassCard'

function PriorityDot({ task }: { task: Task }) {
  const isToday = dueLabel(task) === 'Today'
  const color = isToday ? 'var(--theme-sage)' : priorityColor(task.priority)
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
  sortable?: boolean
}

function TaskCheckbox({
  task,
  completing,
  onComplete,
}: {
  task: Task
  completing: boolean
  onComplete: () => void
}) {
  const done = task.completed || completing

  return (
    <button
      type="button"
      aria-label={task.completed ? 'Completed' : 'Mark complete'}
      onClick={(e) => {
        e.stopPropagation()
        onComplete()
      }}
      className={`focus-ring relative mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors ${
        done ? '' : 'border border-glass bg-[var(--theme-input-bg)]'
      }`}
      style={done ? { backgroundColor: VAR_COMPLETE } : undefined}
    >
      {completing && (
        <motion.span
          className="absolute inset-0 rounded-full opacity-40"
          style={{ backgroundColor: VAR_COMPLETE }}
          initial={{ scale: 0.5, opacity: 0.5 }}
          animate={{ scale: 2.2, opacity: 0 }}
          transition={{ duration: 0.5 }}
        />
      )}
      {(done || completing) && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
    </button>
  )
}

function TaskCardBody({ task, index, sortable = true }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, disabled: !sortable || task.completed })

  const expandedTaskId = useGraphiteStore((s) => s.expandedTaskId)
  const selectedTaskId = useGraphiteStore((s) => s.selectedTaskId)
  const setExpanded = useGraphiteStore((s) => s.setExpandedTaskId)
  const setSelected = useGraphiteStore((s) => s.setSelectedTaskId)
  const completeTask = useGraphiteStore((s) => s.completeTask)
  const uncompleteTask = useGraphiteStore((s) => s.uncompleteTask)
  const toggleStar = useGraphiteStore((s) => s.toggleStar)
  const duplicateTask = useGraphiteStore((s) => s.duplicateTask)
  const deleteTask = useGraphiteStore((s) => s.deleteTask)
  const setTaskModalOpen = useGraphiteStore((s) => s.setTaskModalOpen)
  const updateTask = useGraphiteStore((s) => s.updateTask)
  const lists = useGraphiteStore((s) => s.lists)

  const expanded = expandedTaskId === task.id
  const selected = selectedTaskId === task.id
  const [menuOpen, setMenuOpen] = useState(false)
  const [completing, setCompleting] = useState(false)
  const menuAnchor = useRef<HTMLButtonElement>(null)

  const listName = lists.find((l) => l.id === task.listId)?.name ?? task.listId
  const isDone = task.completed
  const isStarred = task.starred && !isDone

  const handleComplete = () => {
    if (task.completed) {
      uncompleteTask(task.id)
      return
    }
    setCompleting(true)
    window.setTimeout(() => {
      completeTask(task.id)
      setCompleting(false)
    }, 600)
  }

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.85 : isDone ? 0.55 : 1,
    zIndex: isDragging ? 20 : undefined,
  }

  const cardShell = (
    <GlassCard
      hoverLift={!isDone}
      cursorGlow={!isDone}
      className={`group p-4 md:p-5 ${sortable ? 'cursor-grab active:cursor-grabbing' : ''} ${
        selected ? 'ring-1 ring-[color-mix(in_srgb,var(--theme-accent)_45%,transparent)]' : ''
      } ${isStarred ? 'border-l-2 pl-[calc(1rem-2px)] md:pl-[calc(1.25rem-2px)]' : ''}`}
      style={
        isStarred
          ? {
              borderLeftColor: VAR_STARRED,
              boxShadow: 'inset 4px 0 24px color-mix(in srgb, var(--theme-starred) 28%, transparent)',
            }
          : undefined
      }
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
          <TaskCheckbox task={task} completing={completing} onComplete={handleComplete} />

          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <PriorityDot task={task} />
              <span className="text-[11px] font-medium uppercase tracking-wide text-muted">
                {dueLabel(task)}
              </span>
              {task.dueTime && (
                <span className="text-[11px] text-faint">
                  {parseDisplayTimeRange(task.dueTime, task.endTime)}
                </span>
              )}
            </div>

            <h3
              className={`text-base font-semibold text-heading ${!expanded ? 'line-clamp-1' : ''} ${
                isDone || completing ? 'line-through decoration-muted/80' : ''
              }`}
            >
              {task.title}
            </h3>

            <p className={`mt-1 text-sm text-muted ${expanded ? '' : 'line-clamp-2'}`}>
              {task.description || 'No description yet.'}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Chip variant="muted">{listName}</Chip>
              {task.priority !== 'none' && (
                <Chip variant="muted" className="capitalize">
                  {task.priority}
                </Chip>
              )}
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-center gap-1">
            {!isDone && (
              <button
                type="button"
                aria-label={task.starred ? 'Unstar' : 'Star'}
                onClick={(e) => {
                  e.stopPropagation()
                  toggleStar(task.id)
                }}
                className="focus-ring rounded-lg p-1 text-muted hover:text-heading"
              >
                <Star
                  className="h-4 w-4"
                  style={task.starred ? { fill: VAR_STARRED, color: VAR_STARRED } : undefined}
                />
              </button>
            )}
            <button
              ref={menuAnchor}
              type="button"
              aria-label="Task menu"
              aria-expanded={menuOpen}
              onClick={(e) => {
                e.stopPropagation()
                setMenuOpen((o) => !o)
              }}
              className="focus-ring rounded-lg p-1 text-muted hover:bg-lavender-soft"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            <FloatingMenu
              open={menuOpen}
              onClose={() => setMenuOpen(false)}
              anchorRef={menuAnchor}
              align="right"
              minWidth={168}
            >
              {[
                { icon: Pencil, label: 'Edit', action: () => setTaskModalOpen(true, task.id) },
                { icon: Copy, label: 'Duplicate', action: () => duplicateTask(task.id) },
                { icon: Copy, label: 'Move to Work', action: () => updateTask(task.id, { listId: 'work' }) },
                { icon: Trash2, label: 'Delete', action: () => deleteTask(task.id) },
              ].map((item) => (
                <MenuItem
                  key={item.label}
                  onClick={() => {
                    item.action()
                    setMenuOpen(false)
                  }}
                >
                  <item.icon className="h-3.5 w-3.5 shrink-0 text-muted" />
                  {item.label}
                </MenuItem>
              ))}
            </FloatingMenu>
          </div>
        </div>
      </motion.div>
    </GlassCard>
  )

  if (!sortable) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        animate={{ opacity: isDone ? 0.55 : 1, y: 0, scale: 1 }}
        transition={{ delay: index * 0.04, type: 'spring', stiffness: 260, damping: 26 }}
      >
        {cardShell}
      </motion.div>
    )
  }

  return (
    <motion.div
      ref={setNodeRef}
      layout
      style={style}
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: isDragging ? 0.85 : isDone ? 0.55 : 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: -40, transition: { duration: 0.25 } }}
      transition={{ delay: index * 0.04, type: 'spring', stiffness: 260, damping: 26 }}
      {...attributes}
      {...listeners}
    >
      {cardShell}
    </motion.div>
  )
}

function SortableTaskCard(props: TaskCardProps) {
  return <TaskCardBody {...props} sortable />
}

export function TaskList() {
  const tasks = useVisibleTasks()
  const completedExtra = useCompletedSectionTasks()
  const activeListId = useGraphiteStore((s) => s.activeListId)
  const reorderTasks = useGraphiteStore((s) => s.reorderTasks)

  const [completedOpen, setCompletedOpen] = useState(true)

  const isCompletedView = activeListId === 'completed'
  const openTasks = isCompletedView ? [] : tasks.filter((t) => !t.completed)
  const inlineCompleted = isCompletedView ? tasks : completedExtra
  const showCompletedSection = !isCompletedView && inlineCompleted.length > 0

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const ids = openTasks.map((t) => t.id)
    const oldIndex = ids.indexOf(String(active.id))
    const newIndex = ids.indexOf(String(over.id))
    if (oldIndex < 0 || newIndex < 0) return
    reorderTasks(arrayMove(ids, oldIndex, newIndex))
  }

  const totalVisible =
    openTasks.length + (showCompletedSection || isCompletedView ? inlineCompleted.length : 0)

  if (totalVisible === 0) {
    return (
      <GlassCard className="flex flex-col items-center justify-center gap-2 p-12 text-center">
        <p className="text-lg font-medium text-heading">Nothing here yet</p>
        <p className="max-w-sm text-sm text-muted">
          Add a task with the quick-add bar or press{' '}
          <kbd className="rounded border border-lavender/20 bg-lavender-soft px-1">N</kbd>.
        </p>
      </GlassCard>
    )
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={openTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="relative z-0 flex flex-col gap-3">
          <AnimatePresence mode="popLayout">
            {openTasks.map((task, i) => (
              <SortableTaskCard key={task.id} task={task} index={i} />
            ))}
          </AnimatePresence>

          {showCompletedSection && (
            <div className="mt-2 border-t border-lavender/15 pt-3">
              <button
                type="button"
                className="focus-ring mb-2 flex w-full items-center gap-2 text-left text-xs font-medium uppercase tracking-wide text-muted"
                onClick={() => setCompletedOpen((o) => !o)}
              >
                <ChevronDown className={`h-4 w-4 transition-transform ${completedOpen ? '' : '-rotate-90'}`} />
                Completed ({inlineCompleted.length})
              </button>
              {completedOpen && (
                <div className="flex flex-col gap-3">
                  {inlineCompleted.map((task, i) => (
                    <TaskCardBody key={task.id} task={task} index={i + openTasks.length} sortable={false} />
                  ))}
                </div>
              )}
            </div>
          )}

          {isCompletedView && (
            <div className="flex flex-col gap-3">
              {inlineCompleted.map((task, i) => (
                <TaskCardBody key={task.id} task={task} index={i} sortable={false} />
              ))}
            </div>
          )}
        </div>
      </SortableContext>
    </DndContext>
  )
}
