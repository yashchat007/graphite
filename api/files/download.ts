import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleFilesDownload } from '../../server/files-handler.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const proto = req.headers['x-forwarded-proto'] ?? 'https'
  const host = req.headers.host ?? 'localhost'
  const fullUrl = `${proto}://${host}${req.url ?? ''}`
  await handleFilesDownload(req, res, new URL(fullUrl))
}
