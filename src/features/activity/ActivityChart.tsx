import { useMemo, useState } from 'react'
import { activityLast7Days } from '../../lib/task-utils'
import { useGraphiteStore } from '../../store/useGraphiteStore'
import { GlassCard } from '../../components/ui/GlassCard'

export function ActivityChart() {
  const tasks = useGraphiteStore((s) => s.tasks)
  const data = useMemo(() => activityLast7Days(tasks), [tasks])
  const [hover, setHover] = useState<number | null>(null)

  const max = Math.max(1, ...data.map((d) => d.count))
  const weeklyTotal = data.reduce((a, d) => a + d.count, 0)
  const w = 280
  const h = 120
  const pad = 8
  const step = (w - pad * 2) / (data.length - 1)

  const points = data.map((d, i) => {
    const x = pad + i * step
    const y = h - pad - (d.count / max) * (h - pad * 2)
    return { x, y, ...d }
  })

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${h - pad} L ${points[0].x} ${h - pad} Z`

  return (
    <GlassCard className="p-5">
      <div className="mb-4 flex items-end justify-between">
        <ActivityHeader weeklyTotal={weeklyTotal} />
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full" role="img" aria-label="Tasks completed per day, last 7 days">
        <defs>
          <linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(230,230,232,0.35)" />
            <stop offset="100%" stopColor="rgba(230,230,232,0)" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#activityFill)" />
        <path d={linePath} fill="none" stroke="#C7C7CC" strokeWidth="2" strokeLinecap="round" />
        {points.map((p, i) => (
          <g key={p.date}>
            <circle
              cx={p.x}
              cy={p.y}
              r={hover === i ? 6 : 4}
              fill="#E6E6E8"
              className="cursor-pointer"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
            <text x={p.x} y={h - 2} textAnchor="middle" fill="#5A5A60" fontSize="9">
              {p.label}
            </text>
          </g>
        ))}
      </svg>
      {hover !== null && (
        <p className="mt-2 text-center text-xs text-[#8A8A8F]">
          {data[hover].count} completed on {data[hover].label}
        </p>
      )}
    </GlassCard>
  )
}

function ActivityHeader({ weeklyTotal }: { weeklyTotal: number }) {
  return (
    <>
      <div>
        <h2 className="text-sm font-semibold text-[#F2F2F3]">Activity</h2>
        <p className="text-xs text-[#5A5A60]">Completed tasks</p>
      </div>
      <p className="text-2xl font-semibold tabular-nums text-[#F2F2F3]">{weeklyTotal}</p>
    </>
  )
}
