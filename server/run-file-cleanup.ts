import { documentFromClient } from '../shared/sync-merge'
import type { SyncDocument } from '../shared/sync-types'
import { pruneExpiredFiles } from './file-expiry'
import { loadRemoteState, redisConfigured, saveRemoteState } from './redis'

export async function runFileExpiryCleanup(): Promise<{ document: SyncDocument; removed: number }> {
  const stored = documentFromClient((await loadRemoteState()) as Partial<SyncDocument> | null)
  const result = await pruneExpiredFiles(stored)
  if (result.removed > 0 && redisConfigured()) {
    await saveRemoteState(result.document)
  }
  return result
}
