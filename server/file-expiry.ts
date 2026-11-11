import { addDays, parseISO } from 'date-fns'
import { del } from '@vercel/blob'
import type { SyncDocument, SyncFile } from '../shared/sync-types'
import { blobConfigured } from './blob'
export const FILE_RETENTION_DAYS = 7

export function defaultExpiresAt(uploadedAt: string): string {
  return addDays(parseISO(uploadedAt), FILE_RETENTION_DAYS).toISOString()
}

export function normalizeSyncFile(file: SyncFile): SyncFile {
  const uploadedAt = file.uploadedAt
  return {
    ...file,
    expiresAt: file.expiresAt ?? defaultExpiresAt(uploadedAt),
    keepPinned: file.keepPinned ?? false,
  }
}

export function isFileExpired(file: SyncFile, at = new Date()): boolean {
  const f = normalizeSyncFile(file)
  if (f.keepPinned) return false
  return parseISO(f.expiresAt).getTime() <= at.getTime()
}

export async function pruneExpiredFiles(document: SyncDocument): Promise<{
  document: SyncDocument
  removed: number
}> {
  const now = new Date()
  const deletedAt = new Date().toISOString()
  const kept: SyncFile[] = []
  let removed = 0
  const tombstones = [...document.tombstones]

  for (const raw of document.files) {
    const file = normalizeSyncFile(raw)
    if (!isFileExpired(file, now)) {
      kept.push(file)
      continue
    }
    removed += 1
    if (blobConfigured() && !file.pathname.startsWith('mock/')) {
      try {
        await del(file.pathname)
      } catch (err) {
        console.error('blob del failed', file.pathname, err)
      }
    }
    tombstones.push({ id: file.id, kind: 'file', deletedAt })
  }

  return {
    document: { ...document, files: kept, tombstones },
    removed,
  }
}
