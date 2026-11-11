import { useLayoutEffect, useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface FloatingMenuProps {
  open: boolean
  onClose: () => void
  anchorRef: React.RefObject<HTMLElement | null>
  align?: 'left' | 'right'
  minWidth?: number
  children: ReactNode
  className?: string
}

export function FloatingMenu({
  open,
  onClose,
  anchorRef,
  align = 'left',
  minWidth = 140,
  children,
  className = '',
}: FloatingMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [style, setStyle] = useState<{ top: number; left: number }>({ top: 0, left: 0 })

  const position = () => {
    const el = anchorRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const menuW = menuRef.current?.offsetWidth ?? minWidth
    const left = align === 'right' ? rect.right - menuW : rect.left
    setStyle({ top: rect.bottom + 8, left: Math.max(8, left) })
  }

  useLayoutEffect(() => {
    if (!open) return
    position()
  }, [open, align, minWidth, anchorRef])

  useEffect(() => {
    if (!open) return
    const onScroll = () => position()
    const onResize = () => position()
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onResize)
    }
  }, [open, align, minWidth, anchorRef])

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node
      if (menuRef.current?.contains(target)) return
      if (anchorRef.current?.contains(target)) return
      onClose()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose, anchorRef])

  if (!open) return null

  return createPortal(
  <div
      ref={menuRef}
      className={`glass-panel fixed z-[500] p-1 shadow-xl ${className}`}
      style={{ top: style.top, left: style.left, minWidth }}
      role="menu"
    >
      {children}
    </div>,
    document.body,
  )
}

export function MenuItem({
  onClick,
  children,
}: {
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      role="menuitem"
      className="focus-ring flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-xs text-body hover:bg-lavender-soft/80"
      onClick={onClick}
    >
      {children}
    </button>
  )
}
