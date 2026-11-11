import type { IncomingMessage, ServerResponse } from 'http'
import { documentFromClient, mergeDocuments } from '../shared/sync-merge'
import type { SyncDocument } from '../shared/sync-types'
import { assertAuthorized } from './auth'
import { loadPrunedRemoteState } from './load-pruned-state'
import { pruneExpiredFiles } from './file-expiry'
import { redisConfigured, saveRemoteState } from './redis'

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

export async function handleSyncApi(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-app-secret, Authorization')
    res.statusCode = 204
    res.end()
    return
  }

  if (!redisConfigured()) {
    if (req.method === 'GET') {
      sendJson(res, 200, { localOnly: true, document: null })
      return
    }
    sendJson(res, 503, { localOnly: true, error: 'Sync storage not configured' })
    return
  }

  const auth = assertAuthorized(req.headers)
  if (!auth.ok) {
    sendJson(res, auth.status, auth.body)
    return
  }

  try {
    if (req.method === 'GET') {
      const document = await loadPrunedRemoteState()
      sendJson(res, 200, { localOnly: false, document })
      return
    }

    if (req.method === 'POST') {
      const raw = await readBody(req)
      const payload = JSON.parse(raw || '{}') as { document?: Partial<SyncDocument> }
      const clientDoc = documentFromClient(payload.document)
      const stored = await loadPrunedRemoteState()
      const merged = mergeDocuments(stored, clientDoc)
      const { document: pruned } = await pruneExpiredFiles(merged)
      await saveRemoteState(pruned)
      sendJson(res, 200, { localOnly: false, document: pruned })
      return
    }

    sendJson(res, 405, { error: 'Method not allowed' })
  } catch (err) {
    console.error('sync api error', err)
    sendJson(res, 500, { error: 'Sync failed' })
  }
}
