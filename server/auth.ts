import type { IncomingHttpHeaders } from 'http'
import { redisConfigured } from './redis.js'

export function readAppSecret(headers: IncomingHttpHeaders): string | undefined {
  const raw = headers['x-app-secret']
  if (typeof raw === 'string') return raw
  if (Array.isArray(raw)) return raw[0]
  const auth = headers.authorization
  if (typeof auth === 'string' && auth.toLowerCase().startsWith('bearer ')) {
    return auth.slice(7).trim()
  }
  return undefined
}

export function assertAuthorized(headers: IncomingHttpHeaders): { ok: true } | { ok: false; status: number; body: object } {
  if (!redisConfigured()) {
    return { ok: true }
  }
  const expected = process.env.APP_SECRET
  if (!expected) {
    return {
      ok: false,
      status: 503,
      body: { error: 'Server missing APP_SECRET', localOnly: true },
    }
  }
  const provided = readAppSecret(headers)
  if (provided !== expected) {
    return { ok: false, status: 401, body: { error: 'Invalid access key' } }
  }
  return { ok: true }
}
