import { documentFromClient } from '../shared/sync-merge.js'
import type { SyncDocument } from '../shared/sync-types.js'
import { pruneExpiredFiles } from './file-expiry.js'
import { loadRemoteState, redisConfigured, saveRemoteState } from './redis.js'

export async function runFileExpiryCleanup(): Promise<{ document: SyncDocument; removed: number }> {
  const stored = documentFromClient((await loadRemoteState()) as Partial<SyncDocument> | null)
  const result = await pruneExpiredFiles(stored)
  if (result.removed > 0 && redisConfigured()) {
    await saveRemoteState(result.document)
  }
  return result
}
