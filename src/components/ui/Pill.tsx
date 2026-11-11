import { ChevronDown } from 'lucide-react'
import type { ReactNode } from 'react'

interface PillProps {
  label: string
  children?: ReactNode
  onClick?: () => void
  active?: boolean
}

export function Pill({ label, children, onClick, active }: PillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`focus-ring inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? 'border-white/20 bg-white/10 text-[#F2F2F3]'
          : 'border-white/8 bg-white/5 text-[#8A8A8F] hover:border-white/15 hover:text-[#C7C7CC]'
      }`}
    >
      <span>{label}</span>
      {children ?? <ChevronDown className="h-3.5 w-3.5 opacity-60" />}
    </button>
  )
}
