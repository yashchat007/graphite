import { upload } from '@vercel/blob/client'
import type { StoredFile } from './types'
import { generateId } from './task-utils'
import { nowIso } from './sync-document'

export async function fetchBlobStatus(): Promise<boolean> {
  try {
    const res = await fetch('/api/files/status')
    const data = (await res.json()) as { blob?: boolean }
    return Boolean(data.blob)
  } catch {
    return false
  }
}

export async function uploadFile(
  file: File,
  secret: string,
  onProgress?: (pct: number) => void,
): Promise<StoredFile> {
  const id = generateId()
  const started = Date.now()
  const interval = onProgress
    ? window.setInterval(() => {
        const fake = Math.min(92, ((Date.now() - started) / 1200) * 90)
        onProgress(fake)
      }, 120)
    : null

  try {
    const blob = await upload(file.name, file, {
      access: 'private',
      handleUploadUrl: '/api/files/upload',
      clientPayload: JSON.stringify({
        secret,
        id,
        name: file.name,
        contentType: file.type || 'application/octet-stream',
        size: file.size,
      }),
    })
    onProgress?.(100)
    const ts = nowIso()
    return {
      id,
      name: file.name,
      size: file.size,
      contentType: file.type || 'application/octet-stream',
      pathname: blob.pathname,
      uploadedAt: ts,
      updatedAt: ts,
    }
  } finally {
    if (interval) clearInterval(interval)
  }
}

export async function deleteRemoteFile(pathname: string, id: string, secret: string): Promise<void> {
  await fetch('/api/files/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-app-secret': secret,
    },
    body: JSON.stringify({ pathname, id }),
  })
}

export async function openStoredFile(file: StoredFile, secret: string): Promise<void> {
  const res = await fetch(`/api/files/download?pathname=${encodeURIComponent(file.pathname)}`, {
    headers: { 'x-app-secret': secret },
  })
  if (!res.ok) throw new Error('Download failed')
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = file.name
  anchor.rel = 'noopener'
  anchor.click()
  URL.revokeObjectURL(url)
}
