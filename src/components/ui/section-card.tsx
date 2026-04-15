'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface SectionCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Optional card title displayed in the header */
  title?: string
  /** Optional right-aligned header content (links, badges, etc.) */
  headerAction?: React.ReactNode
  /** Remove default padding (useful for tables/lists that fill the card edge-to-edge) */
  noPadding?: boolean
}

/**
 * Consistent section container used across dashboard pages.
 * Provides a unified card style with optional header row.
 */
const SectionCard = React.forwardRef<HTMLDivElement, SectionCardProps>(
  ({ className, title, headerAction, noPadding, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl border border-white/[0.06] bg-white/[0.02]',
          className
        )}
        {...props}
      >
        {(title || headerAction) && (
          <div className="flex items-center justify-between px-5 pt-5 pb-0">
            {title && <h2 className="text-heading-sm text-pulse-text">{title}</h2>}
            {headerAction}
          </div>
        )}
        <div className={cn(noPadding ? '' : 'p-5', title ? 'pt-4' : '')}>
          {children}
        </div>
      </div>
    )
  }
)
SectionCard.displayName = 'SectionCard'

export { SectionCard }
