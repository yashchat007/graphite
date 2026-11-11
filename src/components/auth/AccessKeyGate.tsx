import { motion } from 'framer-motion'
import { KeyRound, Triangle } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { fetchSync } from '../../lib/sync-client'
import { useSyncStore } from '../../store/useSyncStore'
import { Button } from '../ui/Button'
import { GlassCard } from '../ui/GlassCard'
import { Background } from '../layout/Background'

export function AccessKeyGate({ children }: { children: ReactNode }) {
  const unlocked = useSyncStore((s) => s.unlocked)
  const setAccessKey = useSyncStore((s) => s.setAccessKey)
  const setSyncStatus = useSyncStore((s) => s.setSyncStatus)

  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (unlocked) return <>{children}</>

  const submit = async () => {
    const key = value.trim()
    if (!key) {
      setError('Enter your access key to continue.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const result = await fetchSync(key)
      if (result.status === 401) {
        setError('That key doesn’t match. Double-check and try again.')
        return
      }
      setAccessKey(key)
      if (result.localOnly) setSyncStatus('local-only')
      else setSyncStatus('synced')
    } catch {
      setError('Could not reach the server. You can retry, or continue if sync isn’t configured yet.')
      setAccessKey(key)
      setSyncStatus('local-only')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Background />
      <div className="flex min-h-screen items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <GlassCard className="p-8">
            <div className="mb-6 flex items-center gap-3">
              <motion.div
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-lavender/20 bg-white/70"
                aria-hidden
              >
                <Triangle className="h-4 w-4 text-lavender-light" strokeWidth={1.5} />
              </motion.div>
              <motion.div>
                <h1 className="text-xl font-semibold text-heading">Graphite</h1>
                <p className="text-sm text-muted">Enter access key</p>
              </motion.div>
            </div>

            <p className="mb-4 text-sm text-muted">
              Use the same secret on your laptop and phone so tasks stay in sync.
            </p>

            <label className="mb-2 flex items-center gap-2 text-xs font-medium text-body" htmlFor="access-key">
              <KeyRound className="h-3.5 w-3.5 text-muted" />
              Access key
            </label>
            <input
              id="access-key"
              type="password"
              autoComplete="off"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && void submit()}
              className="focus-ring mb-2 w-full rounded-2xl border border-lavender/20 bg-white/70 px-4 py-3 text-sm text-heading outline-none placeholder:text-faint"
              placeholder="Your access key"
            />
            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-3 text-sm text-body"
                role="alert"
              >
                {error}
              </motion.p>
            )}
            <Button variant="primary" className="w-full justify-center" onClick={() => void submit()} disabled={loading}>
              {loading ? 'Checking…' : 'Continue'}
            </Button>
          </GlassCard>
        </motion.div>
      </div>
    </>
  )
}
