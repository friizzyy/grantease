'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from './button'

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
  className?: string
}

/**
 * Consistent empty state used across all dashboard list/grid views.
 * Shows a muted icon, message, and optional CTA button.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('py-12 text-center', className)}>
      <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
        <Icon className="w-6 h-6 text-pulse-text-tertiary/50" />
      </div>
      <h3 className="text-heading-sm text-pulse-text mb-1">{title}</h3>
      <p className="text-body-sm text-pulse-text-tertiary max-w-sm mx-auto">{description}</p>
      {actionLabel && (actionHref || onAction) && (
        <div className="mt-5">
          {actionHref ? (
            <Button size="sm" variant="outline" asChild>
              <Link href={actionHref}>{actionLabel}</Link>
            </Button>
          ) : (
            <Button size="sm" variant="outline" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
