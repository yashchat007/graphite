import type { SyncDocument } from '../shared/sync-types.js'
import { runFileExpiryCleanup } from './run-file-cleanup.js'

/** Load Redis sync doc and eagerly drop expired (non-pinned) files from the index + Blob. */
export async function loadPrunedRemoteState(): Promise<SyncDocument> {
  const { document } = await runFileExpiryCleanup()
  return document
}
