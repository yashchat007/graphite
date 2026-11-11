import type { ReactNode } from 'react'

interface ChipProps {
  children: ReactNode
  variant?: 'silver' | 'muted' | 'priority-high'
  className?: string
}

export function Chip({ children, variant = 'muted', className = '' }: ChipProps) {
  const styles = {
    silver: 'lavender-gradient text-white',
    muted: 'surface-soft text-body border border-glass',
    'priority-high': 'bg-[color-mix(in_srgb,var(--aurora-accent)_14%,transparent)] text-heading border border-glass',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
