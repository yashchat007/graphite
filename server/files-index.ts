import { documentFromClient, mergeDocuments } from '../shared/sync-merge.js'
import type { SyncFile } from '../shared/sync-types.js'
import { loadRemoteState, redisConfigured, saveRemoteState } from './redis.js'

export async function upsertFileInIndex(file: SyncFile): Promise<void> {
  if (!redisConfigured()) return
  const stored = documentFromClient((await loadRemoteState()) as Partial<import('../shared/sync-types').SyncDocument> | null)
  const clientSlice = documentFromClient({ files: [file] })
  const merged = mergeDocuments(stored, clientSlice)
  await saveRemoteState(merged)
}

export async function removeFileFromIndex(fileId: string, deletedAt: string): Promise<void> {
  if (!redisConfigured()) return
  const stored = documentFromClient((await loadRemoteState()) as Partial<import('../shared/sync-types').SyncDocument> | null)
  const clientSlice = documentFromClient({
    files: [],
    tombstones: [{ id: fileId, kind: 'file', deletedAt }],
  })
  const merged = mergeDocuments(stored, clientSlice)
  await saveRemoteState(merged)
}
