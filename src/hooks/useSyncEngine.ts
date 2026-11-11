import { useEffect, useRef } from 'react'
import { fetchSync, getLocalSyncDocument, applySyncDocument, pushSync } from '../lib/sync-client'
import { useGraphiteStore } from '../store/useGraphiteStore'
import { useSyncStore } from '../store/useSyncStore'

const PUSH_DEBOUNCE_MS = 700
const PULL_INTERVAL_MS = 15_000

let pushTimer: ReturnType<typeof setTimeout> | null = null
let pushInFlight = false
let pendingPush = false

export function scheduleSyncPush() {
  pendingPush = true
  if (pushTimer) clearTimeout(pushTimer)
  pushTimer = setTimeout(() => {
    void flushSyncPush()
  }, PUSH_DEBOUNCE_MS)
}

async function flushSyncPush() {
  if (pushInFlight) {
    pendingPush = true
    return
  }
  const { accessKey, setSyncStatus, setLastSyncedAt, setSyncError } = useSyncStore.getState()
  if (!accessKey) return

  if (!navigator.onLine) {
    setSyncStatus('offline')
    return
  }

  pushInFlight = true
  pendingPush = false
  setSyncStatus('syncing')
  setSyncError(null)

  try {
    const doc = getLocalSyncDocument()
    const result = await pushSync(accessKey, doc)
    if (result.status === 401) {
      setSyncStatus('offline')
      setSyncError('Access key rejected. Re-enter your key.')
      useSyncStore.getState().clearAccessKey()
      return
    }
    if (result.localOnly) {
      setSyncStatus('local-only')
      setLastSyncedAt(new Date().toISOString())
      return
    }
    if (result.document) applySyncDocument(result.document)
    setSyncStatus('synced')
    setLastSyncedAt(new Date().toISOString())
  } catch {
    setSyncStatus('offline')
    setSyncError('Could not reach sync server. Changes stay on this device.')
  } finally {
    pushInFlight = false
    if (pendingPush) scheduleSyncPush()
  }
}

export async function pullRemoteState() {
  const { accessKey, setSyncStatus, setLastSyncedAt, setSyncError } = useSyncStore.getState()
  if (!accessKey) return

  if (!navigator.onLine) {
    setSyncStatus('offline')
    return
  }

  setSyncStatus('syncing')
  try {
    const result = await fetchSync(accessKey)
    if (result.status === 401) {
      setSyncStatus('offline')
      setSyncError('Access key rejected. Re-enter your key.')
      useSyncStore.getState().clearAccessKey()
      return
    }
    if (result.localOnly) {
      setSyncStatus('local-only')
      setLastSyncedAt(new Date().toISOString())
      return
    }
    if (result.document) {
      const remote = result.document
      const hasRemoteData =
        remote.tasks.length > 0 || remote.lists.length > 0 || remote.todayNote.length > 0
      const local = useGraphiteStore.getState()
      const hasLocal = local.tasks.length > 0
      if (hasRemoteData || !hasLocal) applySyncDocument(remote)
    }
    setSyncStatus('synced')
    setLastSyncedAt(new Date().toISOString())
    setSyncError(null)
  } catch {
    setSyncStatus('offline')
  }
}

export function useSyncEngine() {
  const unlocked = useSyncStore((s) => s.unlocked)
  const subscribed = useRef(false)

  useEffect(() => {
    if (!unlocked) return

    void pullRemoteState()

    const onVis = () => {
      if (document.visibilityState === 'visible') void pullRemoteState()
    }
    const onOnline = () => {
      void pullRemoteState()
      scheduleSyncPush()
    }
    const onOffline = () => useSyncStore.getState().setSyncStatus('offline')

    document.addEventListener('visibilitychange', onVis)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)

    const interval = window.setInterval(() => void pullRemoteState(), PULL_INTERVAL_MS)

    return () => {
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
      clearInterval(interval)
    }
  }, [unlocked])

  useEffect(() => {
    if (!unlocked || subscribed.current) return
    subscribed.current = true
    return useGraphiteStore.subscribe((state, prev) => {
      const syncFieldsChanged =
        state.tasks !== prev.tasks ||
        state.lists !== prev.lists ||
        state.files !== prev.files ||
        state.todayNote !== prev.todayNote ||
        state.tombstones !== prev.tombstones
      if (syncFieldsChanged) scheduleSyncPush()
    })
  }, [unlocked])
}
