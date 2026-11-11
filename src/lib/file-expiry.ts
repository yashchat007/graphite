import { addDays, parseISO } from 'date-fns'
import type { StoredFile } from './types'

export const FILE_RETENTION_DAYS = 7

export function defaultExpiresAt(uploadedAt: string): string {
  return addDays(parseISO(uploadedAt), FILE_RETENTION_DAYS).toISOString()
}

export function normalizeStoredFile(file: StoredFile): StoredFile {
  return {
    ...file,
    expiresAt: file.expiresAt ?? defaultExpiresAt(file.uploadedAt),
    keepPinned: file.keepPinned ?? false,
  }
}

export function isStoredFileExpired(file: StoredFile, at = new Date()): boolean {
  const f = normalizeStoredFile(file)
  if (f.keepPinned) return false
  return parseISO(f.expiresAt).getTime() <= at.getTime()
}

export function pruneStoredFiles(files: StoredFile[]): StoredFile[] {
  const now = new Date()
  return files.filter((f) => !isStoredFileExpired(f, now)).map(normalizeStoredFile)
}
