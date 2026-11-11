/** When true, amber (#D9A35B) is used for Today dots and high-priority tags only. */
export const USE_AMBER_ACCENT = false

export const STORAGE_KEY = 'graphite-store-v1'
export const ACCESS_KEY_STORAGE = 'graphite-access-key'

export const SMART_LIST_IDS = {
  inbox: 'inbox',
  today: 'today',
  upcoming: 'upcoming',
  starred: 'starred',
  completed: 'completed',
} as const

export type SmartListId = keyof typeof SMART_LIST_IDS

export const DEFAULT_LISTS = [
  { id: 'work', name: 'Work' },
  { id: 'personal', name: 'Personal' },
  { id: 'study', name: 'Study' },
] as const
