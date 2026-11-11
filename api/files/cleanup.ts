import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleFilesCleanup } from '../../server/files-handler.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await handleFilesCleanup(req, res)
}
