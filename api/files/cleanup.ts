import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleFilesCleanup } from '../../server/files-handler.ts'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await handleFilesCleanup(req, res)
}
