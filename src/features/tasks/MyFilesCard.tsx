import { File as FileIcon, FileText, Image as ImageIcon, Loader2, Trash2, Upload } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type DragEvent } from 'react'
import { formatFileSize, formatUploadedAgo, fileIconKind } from '../../lib/file-format'
import { deleteRemoteFile, fetchBlobStatus, openStoredFile, uploadFile } from '../../lib/files-api'
import { useGraphiteStore } from '../../store/useGraphiteStore'
import { useSyncStore } from '../../store/useSyncStore'
import { Button } from '../../components/ui/Button'
import { GlassCard } from '../../components/ui/GlassCard'

const MAX_BYTES = 25 * 1024 * 1024

function KindIcon({ kind }: { kind: ReturnType<typeof fileIconKind> }) {
  if (kind === 'image') return <ImageIcon className="h-4 w-4 text-[#8A8A8F]" />
  if (kind === 'pdf' || kind === 'doc') return <FileText className="h-4 w-4 text-[#8A8A8F]" />
  return <FileIcon className="h-4 w-4 text-[#8A8A8F]" />
}

export function MyFilesCard() {
  const files = useGraphiteStore((s) => s.files)
  const addFile = useGraphiteStore((s) => s.addFile)
  const removeFile = useGraphiteStore((s) => s.removeFile)
  const accessKey = useSyncStore((s) => s.accessKey)

  const [blobReady, setBlobReady] = useState<boolean | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    void fetchBlobStatus().then(setBlobReady)
  }, [])

  const processFiles = useCallback(
    async (list: FileList | File[]) => {
      if (!blobReady || !accessKey) return
      const picked = Array.from(list)
      const file = picked[0]
      if (!file) return
      if (file.size > MAX_BYTES) {
        alert('Files must be 25 MB or smaller.')
        return
      }
      setUploading(true)
      setProgress(8)
      try {
        const stored = await uploadFile(file, accessKey, setProgress)
        addFile(stored)
      } catch (err) {
        console.error(err)
        alert('Upload failed. Check your connection and access key.')
      } finally {
        setUploading(false)
        setProgress(0)
      }
    },
    [accessKey, addFile, blobReady],
  )

  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    if (!blobReady) return
    void processFiles(e.dataTransfer.files)
  }

  const disabled = blobReady === false

  return (
    <GlassCard className="p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-[#F2F2F3]">My files</h2>
        <Button
          variant="ghost"
          className="!px-2 !py-1 text-xs"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          Upload
        </Button>
      </div>

      <input
        ref={inputRef}
        type="file"
        className="sr-only"
        disabled={disabled || uploading}
        onChange={(e) => e.target.files && void processFiles(e.target.files)}
      />

      <div
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`mb-3 rounded-2xl border border-dashed px-3 py-4 text-center text-xs transition-colors ${
          disabled
            ? 'cursor-not-allowed border-white/5 text-[#5A5A60]'
            : dragOver
              ? 'border-white/25 bg-white/[0.06] text-[#C7C7CC]'
              : 'border-white/10 text-[#8A8A8F]'
        }`}
      >
        {disabled ? (
          'Uploads unlock when BLOB_READ_WRITE_TOKEN is set on the server.'
        ) : uploading ? (
          <span className="flex flex-col items-center gap-2">
            <span>Uploading… {Math.round(progress)}%</span>
            <span className="h-1 w-full overflow-hidden rounded-full bg-white/10">
              <span className="block h-full silver-gradient transition-all" style={{ width: `${progress}%` }} />
            </span>
          </span>
        ) : (
          'Drop a file here or use Upload (25 MB max)'
        )}
      </div>

      {files.length === 0 ? (
        <p className="text-xs text-[#5A5A60]">No files yet.</p>
      ) : (
        <ul className="max-h-56 space-y-2 overflow-y-auto">
          {files.map((f) => (
            <li
              key={f.id}
              className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 text-sm"
            >
              <KindIcon kind={fileIconKind(f.contentType, f.name)} />
              <button
                type="button"
                className="min-w-0 flex-1 text-left"
                onClick={() => accessKey && void openStoredFile(f, accessKey).catch(() => {})}
              >
                <p className="truncate text-[#C7C7CC]">{f.name}</p>
                <p className="text-[10px] text-[#5A5A60]">
                  {formatFileSize(f.size)}
                  {formatUploadedAgo(f.uploadedAt) ? ` · ${formatUploadedAgo(f.uploadedAt)}` : ''}
                </p>
              </button>
              <button
                type="button"
                aria-label={`Delete ${f.name}`}
                className="focus-ring rounded-lg p-1 text-[#8A8A8F] hover:text-[#F2F2F3]"
                onClick={() => {
                  removeFile(f.id)
                  if (accessKey && !f.pathname.startsWith('mock/')) {
                    void deleteRemoteFile(f.pathname, f.id, accessKey)
                  }
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </GlassCard>
  )
}
