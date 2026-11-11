import { ChevronDown } from 'lucide-react'
import { forwardRef, type ReactNode } from 'react'

interface PillProps {
  label: string
  children?: ReactNode
  onClick?: () => void
  active?: boolean
}

export const Pill = forwardRef<HTMLButtonElement, PillProps>(function Pill(
  { label, children, onClick, active },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className={`focus-ring inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
        active
          ? 'border-lavender/35 bg-lavender-soft text-heading'
          : 'border-lavender/15 bg-white/60 text-muted hover:border-lavender/30 hover:text-body'
      }`}
    >
      <span>{label}</span>
      {children ?? <ChevronDown className="h-3.5 w-3.5 opacity-60" />}
    </button>
  )
})
