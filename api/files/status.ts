import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleFilesStatus } from '../../server/files-handler.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await handleFilesStatus(req, res)
}
