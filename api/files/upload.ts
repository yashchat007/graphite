import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleFilesUpload } from '../../server/files-handler.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await handleFilesUpload(req, res)
}
