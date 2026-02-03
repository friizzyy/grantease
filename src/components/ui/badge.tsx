'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default:
          'bg-pulse-surface border border-pulse-border text-pulse-text-secondary',
        accent:
          'bg-pulse-accent/10 border border-pulse-accent/20 text-pulse-accent',
        success:
          'bg-pulse-success/10 border border-pulse-success/20 text-pulse-success',
        warning:
          'bg-pulse-warning/10 border border-pulse-warning/20 text-pulse-warning',
        error:
          'bg-pulse-error/10 border border-pulse-error/20 text-pulse-error',
        outline:
          'border border-pulse-border text-pulse-text-secondary hover:border-pulse-accent/30 hover:text-pulse-accent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  pulse?: boolean
}

function Badge({ className, variant, pulse = false, children, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        badgeVariants({ variant }),
        pulse && 'animate-pulse',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Badge, badgeVariants }
