import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleFilesDelete } from '../../server/files-handler.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await handleFilesDelete(req, res)
}
