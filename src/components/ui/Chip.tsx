import type { ReactNode } from 'react'

interface ChipProps {
  children: ReactNode
  variant?: 'silver' | 'muted' | 'priority-high'
  className?: string
}

export function Chip({ children, variant = 'muted', className = '' }: ChipProps) {
  const styles = {
    silver: 'silver-gradient text-[#0B0B0C]',
    muted: 'bg-white/8 text-[#C7C7CC] border border-white/10',
    'priority-high': 'bg-white/12 text-[#F2F2F3] border border-white/15',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${styles[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
