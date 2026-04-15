'use client'

/**
 * Inline field help — small "?" icon that reveals a brief explanation on hover/tap.
 * Use next to labels for unfamiliar terms (UEI, DUNS, EIN, indirect cost, etc).
 */

import { useState, useRef, useEffect } from 'react'
import { HelpCircle } from 'lucide-react'

interface FieldHelpProps {
  /** Short label (sr-only) used as aria-label. Defaults to "What's this?". */
  label?: string
  /** Explanation shown in the tooltip. Keep it short — 1-2 sentences. */
  children: React.ReactNode
  /** Optional external URL for "Learn more". */
  learnMore?: { href: string; label?: string }
}

export function FieldHelp({ label = "What's this?", children, learnMore }: FieldHelpProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', esc)
    }
  }, [open])

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        onMouseEnter={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        aria-label={label}
        aria-expanded={open}
        className="p-0.5 rounded-full text-pulse-text-tertiary hover:text-pulse-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pulse-accent/50 transition-colors"
      >
        <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
      </button>
      {open && (
        <div
          role="tooltip"
          className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 w-64 z-50 px-3 py-2 rounded-lg bg-pulse-elevated border border-pulse-border shadow-lg text-xs text-pulse-text-secondary leading-relaxed"
          onMouseLeave={() => setOpen(false)}
        >
          {children}
          {learnMore && (
            <a
              href={learnMore.href}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-1.5 text-pulse-accent hover:underline"
            >
              {learnMore.label || 'Learn more →'}
            </a>
          )}
          {/* Arrow */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 border-r border-b border-pulse-border bg-pulse-elevated rotate-45 -mt-1" />
        </div>
      )}
    </div>
  )
}
