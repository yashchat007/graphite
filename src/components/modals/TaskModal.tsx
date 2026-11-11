import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import type { Priority } from '../../lib/types'
import { useGraphiteStore } from '../../store/useGraphiteStore'
import { Button } from '../ui/Button'

const fieldClass =
  'focus-ring w-full rounded-xl border border-lavender/20 bg-white/70 px-3 py-2 text-sm text-body outline-none'

export function TaskModal() {
  const open = useGraphiteStore((s) => s.taskModalOpen)
  const editingId = useGraphiteStore((s) => s.editingTaskId)
  const tasks = useGraphiteStore((s) => s.tasks)
  const lists = useGraphiteStore((s) => s.lists)
  const setTaskModalOpen = useGraphiteStore((s) => s.setTaskModalOpen)
  const addTask = useGraphiteStore((s) => s.addTask)
  const updateTask = useGraphiteStore((s) => s.updateTask)

  const existing = editingId ? tasks.find((t) => t.id === editingId) : undefined

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [dueTime, setDueTime] = useState('')
  const [priority, setPriority] = useState<Priority>('none')
  const [listId, setListId] = useState('work')

  useEffect(() => {
    if (!open) return
    if (existing) {
      setTitle(existing.title)
      setDescription(existing.description)
      setDueDate(existing.dueDate ?? '')
      setDueTime(existing.dueTime ?? '')
      setPriority(existing.priority)
      setListId(existing.listId)
    } else {
      setTitle('')
      setDescription('')
      setDueDate('')
      setDueTime('')
      setPriority('none')
      setListId('work')
    }
  }, [open, existing])

  const save = () => {
    if (!title.trim()) return
    const payload = {
      title: title.trim(),
      description,
      dueDate: dueDate || undefined,
      dueTime: dueTime || undefined,
      priority,
      listId,
    }
    if (existing) updateTask(existing.id, payload)
    else addTask(payload)
    setTaskModalOpen(false, null)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Close modal"
            className="absolute inset-0 bg-heading/25 backdrop-blur-md"
            onClick={() => setTaskModalOpen(false, null)}
          />
          <motion.div
            role="dialog"
            aria-modal
            aria-labelledby="task-modal-title"
            className="glass-panel relative z-[1] max-h-[90vh] w-full max-w-lg overflow-y-auto p-6"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 id="task-modal-title" className="text-lg font-semibold text-heading">
                {existing ? 'Edit task' : 'New task'}
              </h2>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setTaskModalOpen(false, null)}
                className="focus-ring rounded-lg p-1 text-muted hover:bg-lavender-soft"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <TaskFormFields
              title={title}
              setTitle={setTitle}
              description={description}
              setDescription={setDescription}
              dueDate={dueDate}
              setDueDate={setDueDate}
              dueTime={dueTime}
              setDueTime={setDueTime}
              priority={priority}
              setPriority={setPriority}
              listId={listId}
              setListId={setListId}
              lists={lists}
            />

            <div className="mt-6 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setTaskModalOpen(false, null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={save}>
                Save
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-xs text-muted">
      {label}
      <motion.div className="mt-1">{children}</motion.div>
    </label>
  )
}

function TaskFormFields(props: {
  title: string
  setTitle: (v: string) => void
  description: string
  setDescription: (v: string) => void
  dueDate: string
  setDueDate: (v: string) => void
  dueTime: string
  setDueTime: (v: string) => void
  priority: Priority
  setPriority: (v: Priority) => void
  listId: string
  setListId: (v: string) => void
  lists: { id: string; name: string }[]
}) {
  return (
    <motion.div className="space-y-4">
      <Field label="Title">
        <input className={fieldClass} value={props.title} onChange={(e) => props.setTitle(e.target.value)} />
      </Field>
      <Field label="Description">
        <textarea
          className={`min-h-[80px] ${fieldClass}`}
          value={props.description}
          onChange={(e) => props.setDescription(e.target.value)}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Due date">
          <input
            type="date"
            className={fieldClass}
            value={props.dueDate}
            onChange={(e) => props.setDueDate(e.target.value)}
          />
        </Field>
        <Field label="Time">
          <input
            type="time"
            className={fieldClass}
            value={props.dueTime}
            onChange={(e) => props.setDueTime(e.target.value)}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Priority">
          <select
            className={fieldClass}
            value={props.priority}
            onChange={(e) => props.setPriority(e.target.value as Priority)}
          >
            <option value="none">None</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </Field>
        <Field label="List">
          <select className={fieldClass} value={props.listId} onChange={(e) => props.setListId(e.target.value)}>
            {props.lists.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </Field>
      </div>
    </motion.div>
  )
}
