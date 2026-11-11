import { create } from 'zustand'
import { ACCESS_KEY_STORAGE } from '../lib/constants'

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'local-only'

interface SyncUiState {
  accessKey: string | null
  unlocked: boolean
  syncStatus: SyncStatus
  lastSyncedAt: string | null
  syncError: string | null
  setAccessKey: (key: string) => void
  clearAccessKey: () => void
  setUnlocked: (v: boolean) => void
  setSyncStatus: (s: SyncStatus) => void
  setLastSyncedAt: (iso: string | null) => void
  setSyncError: (msg: string | null) => void
}

export const useSyncStore = create<SyncUiState>((set) => ({
  accessKey: typeof localStorage !== 'undefined' ? localStorage.getItem(ACCESS_KEY_STORAGE) : null,
  unlocked: Boolean(
    typeof localStorage !== 'undefined' ? localStorage.getItem(ACCESS_KEY_STORAGE) : null,
  ),
  syncStatus: 'local-only',
  lastSyncedAt: null,
  syncError: null,
  setAccessKey: (key) => {
    localStorage.setItem(ACCESS_KEY_STORAGE, key)
    set({ accessKey: key, unlocked: true, syncError: null })
  },
  clearAccessKey: () => {
    localStorage.removeItem(ACCESS_KEY_STORAGE)
    set({ accessKey: null, unlocked: false })
  },
  setUnlocked: (v) => set({ unlocked: v }),
  setSyncStatus: (syncStatus) => set({ syncStatus }),
  setLastSyncedAt: (lastSyncedAt) => set({ lastSyncedAt }),
  setSyncError: (syncError) => set({ syncError }),
}))
