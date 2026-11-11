import { Redis } from '@upstash/redis'

const STATE_KEY = 'graphite:sync:v1'

export function redisConfigured(): boolean {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN
  return Boolean(url && token)
}

export function getRedis(): Redis | null {
  if (!redisConfigured()) return null
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL!
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN!
  return new Redis({ url, token })
}

export async function loadRemoteState(): Promise<unknown | null> {
  const redis = getRedis()
  if (!redis) return null
  return redis.get(STATE_KEY)
}

export async function saveRemoteState(value: unknown): Promise<void> {
  const redis = getRedis()
  if (!redis) throw new Error('Redis not configured')
  await redis.set(STATE_KEY, value)
}
