import { formatDistanceToNow, parseISO } from 'date-fns'

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10_240 ? 1 : 0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function formatUploadedAgo(iso: string): string {
  try {
    return formatDistanceToNow(parseISO(iso), { addSuffix: true })
  } catch {
    return ''
  }
}

export function fileIconKind(contentType: string, name: string): 'image' | 'pdf' | 'doc' | 'other' {
  if (contentType.startsWith('image/')) return 'image'
  if (contentType === 'application/pdf' || name.endsWith('.pdf')) return 'pdf'
  if (contentType.includes('word') || name.endsWith('.doc') || name.endsWith('.docx')) return 'doc'
  return 'other'
}
