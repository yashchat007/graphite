import type { IncomingHttpHeaders } from 'http'

export function assertCronAuthorized(
  headers: IncomingHttpHeaders,
): { ok: true } | { ok: false; status: number; body: object } {
  const expected = process.env.CRON_SECRET
  if (!expected) {
    return { ok: false, status: 503, body: { error: 'CRON_SECRET not configured' } }
  }
  const auth = headers.authorization
  if (!auth?.startsWith('Bearer ') || auth.slice(7) !== expected) {
    return { ok: false, status: 401, body: { error: 'Unauthorized' } }
  }
  return { ok: true }
}
