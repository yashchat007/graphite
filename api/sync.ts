import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleSyncApi } from '../server/handler'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await handleSyncApi(req, res)
}
