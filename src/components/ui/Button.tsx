import { motion } from 'framer-motion'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'ghost' | 'subtle'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  children: ReactNode
  className?: string
}

export function Button({ variant = 'ghost', children, className = '', ...props }: ButtonProps) {
  const base =
    'focus-ring inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors disabled:opacity-40'
  const styles: Record<Variant, string> = {
    primary:
      'lavender-gradient text-white shadow-md shadow-[color-mix(in_srgb,var(--theme-accent)_35%,transparent)] hover:brightness-105 relative overflow-hidden',
    ghost: 'text-body hover:surface-soft border border-transparent hover:border-glass',
    subtle: 'text-muted hover:text-heading hover:surface-soft',
  }

  return (
    <motion.button
      type="button"
      className={`${base} ${styles[variant]} ${className}`}
      whileTap={{ scale: 0.97 }}
      {...(props as object)}
    >
      {variant === 'primary' && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
        />
      )}
      <span className="relative z-[1] flex items-center gap-2">{children}</span>
    </motion.button>
  )
}
