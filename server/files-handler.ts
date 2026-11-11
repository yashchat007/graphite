import type { IncomingMessage, ServerResponse } from 'http'
import { del, head } from '@vercel/blob'
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import type { SyncFile } from '../shared/sync-types'
import { readAppSecret } from './auth'
import { blobConfigured } from './blob'
import { removeFileFromIndex, upsertFileInIndex } from './files-index'
import { redisConfigured } from './redis'
function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

const MAX_BYTES = 25 * 1024 * 1024

async function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (c) => chunks.push(Buffer.from(c)))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

function assertSecret(headers: IncomingMessage['headers']): boolean {
  if (!process.env.APP_SECRET) return !redisConfigured()
  return readAppSecret(headers) === process.env.APP_SECRET
}

export async function handleFilesStatus(_req: IncomingMessage, res: ServerResponse) {
  sendJson(res, 200, {
    blob: blobConfigured(),
    redis: redisConfigured(),
  })
}

export async function handleFilesUpload(req: IncomingMessage, res: ServerResponse) {
  if (!blobConfigured()) {
    sendJson(res, 503, { error: 'Blob storage not configured' })
    return
  }
  try {
    const raw = await readBody(req)
    const body = JSON.parse(raw) as HandleUploadBody
    const jsonResponse = await handleUpload({
      body,
      request: req as unknown as Request,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        let parsed: {
          secret?: string
          id?: string
          name?: string
          contentType?: string
          size?: number
        } = {}
        if (clientPayload) {
          try {
            parsed = JSON.parse(clientPayload)
          } catch {
            /* ignore */
          }
        }
        if (redisConfigured() && process.env.APP_SECRET && parsed.secret !== process.env.APP_SECRET) {
          throw new Error('Unauthorized')
        }
        return {
          maximumSizeInBytes: MAX_BYTES,
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({
            id: parsed.id,
            name: parsed.name,
            contentType: parsed.contentType,
            size: parsed.size,
          }),
        }
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        let meta: { id?: string; name?: string; contentType?: string; size?: number } = {}
        if (tokenPayload) {
          try {
            meta = JSON.parse(tokenPayload)
          } catch {
            /* ignore */
          }
        }
        const ts = new Date().toISOString()
        const file: SyncFile = {
          id: meta.id ?? generateId(),
          name: meta.name ?? blob.pathname.split('/').pop() ?? 'file',
          size: meta.size ?? 0,
          contentType: meta.contentType ?? 'application/octet-stream',
          pathname: blob.pathname,
          uploadedAt: ts,
          updatedAt: ts,
        }
        await upsertFileInIndex(file)
      },
    })
    sendJson(res, 200, jsonResponse)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed'
    const status = message === 'Unauthorized' ? 401 : 500
    sendJson(res, status, { error: message })
  }
}

export async function handleFilesDownload(req: IncomingMessage, res: ServerResponse, url: URL) {
  if (!blobConfigured()) {
    sendJson(res, 503, { error: 'Blob storage not configured' })
    return
  }
  if (!assertSecret(req.headers)) {
    sendJson(res, 401, { error: 'Invalid access key' })
    return
  }
  const pathname = url.searchParams.get('pathname')
  if (!pathname) {
    sendJson(res, 400, { error: 'Missing pathname' })
    return
  }
  try {
    const meta = await head(pathname)
    res.statusCode = 302
    res.setHeader('Location', meta.downloadUrl)
    res.end()
  } catch (err) {
    console.error('download error', err)
    sendJson(res, 404, { error: 'File not found' })
  }
}

export async function handleFilesDelete(req: IncomingMessage, res: ServerResponse) {
  if (!blobConfigured()) {
    sendJson(res, 503, { error: 'Blob storage not configured' })
    return
  }
  if (!assertSecret(req.headers)) {
    sendJson(res, 401, { error: 'Invalid access key' })
    return
  }
  try {
    const raw = await readBody(req)
    const { pathname, id } = JSON.parse(raw || '{}') as { pathname?: string; id?: string }
    if (!pathname || !id) {
      sendJson(res, 400, { error: 'Missing pathname or id' })
      return
    }
    await del(pathname)
    await removeFileFromIndex(id, new Date().toISOString())
    sendJson(res, 200, { ok: true })
  } catch (err) {
    console.error('delete error', err)
    sendJson(res, 500, { error: 'Delete failed' })
  }
}

export async function routeFilesApi(req: IncomingMessage, res: ServerResponse, urlPath: string, fullUrl: string) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-app-secret, Authorization')
    res.statusCode = 204
    res.end()
    return
  }
  if (urlPath === '/api/files/status') {
    await handleFilesStatus(req, res)
    return
  }
  if (urlPath === '/api/files/upload' && req.method === 'POST') {
    await handleFilesUpload(req, res)
    return
  }
  if (urlPath === '/api/files/download' && req.method === 'GET') {
    const url = new URL(fullUrl, 'http://localhost')
    await handleFilesDownload(req, res, url)
    return
  }
  if (urlPath === '/api/files/delete' && req.method === 'POST') {
    await handleFilesDelete(req, res)
    return
  }
  sendJson(res, 404, { error: 'Not found' })
}
