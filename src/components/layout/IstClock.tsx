import { useEffect, useState } from 'react'
import { formatIstClock } from '../../lib/ist-time'

export function IstClock({ className = '', large = false }: { className?: string; large?: boolean }) {
  const [tick, setTick] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setTick(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const { time, date } = formatIstClock(tick)

  return (
    <div className={className} aria-live="polite" aria-label={`India time ${time}, ${date}`}>
      <p className={large ? 'text-4xl font-semibold tabular-nums text-heading' : 'text-sm font-medium tabular-nums text-heading'}>
        {time}
      </p>
      <p className={large ? 'mt-1 text-sm text-muted' : 'text-[11px] text-faint'}>{date}</p>
    </div>
  )
}
