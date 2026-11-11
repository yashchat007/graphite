import { addDays, format } from 'date-fns'
import type { Task, TaskList } from './types'

const seedTime = new Date().toISOString()

export const SEED_LISTS: TaskList[] = [
  { id: 'work', name: 'Work', updatedAt: seedTime },
  { id: 'personal', name: 'Personal', updatedAt: seedTime },
  { id: 'study', name: 'Study', updatedAt: seedTime },
]

export function createSeedTasks(): Task[] {
  const today = format(new Date(), 'yyyy-MM-dd')
  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd')

  return [
    {
      id: 'seed-1',
      title: 'Ship quarterly roadmap review',
      description:
        'Consolidate team inputs, align on Q1 priorities, and prepare slides for the leadership sync. Include risk register updates.',
      dueDate: today,
      dueTime: '10:00',
      endTime: '11:30',
      priority: 'high',
      listId: 'work',
      completed: false,
      starred: true,
      order: 0,
      createdAt: seedTime,
      updatedAt: seedTime,
    },
    {
      id: 'seed-2',
      title: 'Design system audit',
      description: 'Walk through components and document spacing tokens for the Graphite refresh.',
      dueDate: today,
      dueTime: '14:00',
      endTime: '15:00',
      priority: 'medium',
      listId: 'work',
      completed: true,
      completedAt: seedTime,
      starred: false,
      order: 1,
      createdAt: seedTime,
      updatedAt: seedTime,
    },
    {
      id: 'seed-3',
      title: 'Grocery run',
      description: 'Pick up produce and pantry staples for the week.',
      dueDate: tomorrow,
      dueTime: '18:30',
      priority: 'low',
      listId: 'personal',
      completed: false,
      starred: false,
      order: 2,
      createdAt: seedTime,
      updatedAt: seedTime,
    },
    {
      id: 'seed-4',
      title: 'Read chapter 4 — distributed systems',
      description: 'Focus on consensus algorithms and raft implementation notes.',
      dueDate: format(addDays(new Date(), 3), 'yyyy-MM-dd'),
      priority: 'medium',
      listId: 'study',
      completed: false,
      starred: false,
      order: 3,
      createdAt: seedTime,
      updatedAt: seedTime,
    },
    {
      id: 'seed-5',
      title: 'Inbox zero Friday',
      description: 'Clear pending threads and archive stale labels.',
      dueDate: format(addDays(new Date(), 4), 'yyyy-MM-dd'),
      priority: 'none',
      listId: 'work',
      completed: false,
      starred: false,
      order: 4,
      createdAt: seedTime,
      updatedAt: seedTime,
    },
  ]
}
