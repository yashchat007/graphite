import type { ReactNode } from 'react'

interface ChipProps {
  children: ReactNode
  variant?: 'silver' | 'muted' | 'priority-high'
  className?: string
}

export function Chip({ children, variant = 'muted', className = '' }: ChipProps) {
  const styles = {
    silver: 'lavender-gradient text-white',
    muted: 'bg-lavender-soft text-body border border-lavender/15',
    'priority-high': 'bg-lavender/15 text-heading border border-lavender/25',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
