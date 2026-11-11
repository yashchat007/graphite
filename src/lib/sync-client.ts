import { mergeDocuments } from '../../shared/sync-merge'
import type { SyncDocument } from '../../shared/sync-types'
import { buildSyncDocument } from './sync-document'
import { useGraphiteStore } from '../store/useGraphiteStore'
import { pruneStoredFiles } from './file-expiry'
import { syncToFile, syncToList, syncToTask } from './sync-document'

const SYNC_URL = '/api/sync'

export async function fetchSync(secret: string): Promise<{
  localOnly: boolean
  document: SyncDocument | null
  status: number
}> {
  const res = await fetch(SYNC_URL, {
    method: 'GET',
    headers: { 'x-app-secret': secret },
  })
  const data = (await res.json().catch(() => ({}))) as {
    localOnly?: boolean
    document?: SyncDocument | null
    error?: string
  }
  return {
    localOnly: Boolean(data.localOnly),
    document: data.document ?? null,
    status: res.status,
  }
}

export async function pushSync(secret: string, document: SyncDocument): Promise<{
  localOnly: boolean
  document: SyncDocument | null
  status: number
}> {
  const res = await fetch(SYNC_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-app-secret': secret,
    },
    body: JSON.stringify({ document }),
  })
  const data = (await res.json().catch(() => ({}))) as {
    localOnly?: boolean
    document?: SyncDocument | null
    error?: string
  }
  return {
    localOnly: Boolean(data.localOnly),
    document: data.document ?? null,
    status: res.status,
  }
}

export function applySyncDocument(doc: SyncDocument) {
  const state = useGraphiteStore.getState()
  const local = buildSyncDocument({
    tasks: state.tasks,
    lists: state.lists,
    files: state.files,
    todayNote: state.todayNote,
    todayNoteUpdatedAt: state.todayNoteUpdatedAt,
    tombstones: state.tombstones,
  })
  const merged = mergeDocuments(local, doc)
  useGraphiteStore.setState({
    tasks: merged.tasks.map(syncToTask),
    lists: merged.lists.map(syncToList),
    files: pruneStoredFiles(merged.files.map(syncToFile)),
    todayNote: merged.todayNote,
    todayNoteUpdatedAt: merged.todayNoteUpdatedAt,
    tombstones: merged.tombstones,
    seeded: true,
  })
}

export function getLocalSyncDocument(): SyncDocument {
  const state = useGraphiteStore.getState()
  return buildSyncDocument({
    tasks: state.tasks,
    lists: state.lists,
    files: state.files,
    todayNote: state.todayNote,
    todayNoteUpdatedAt: state.todayNoteUpdatedAt,
    tombstones: state.tombstones,
  })
}
