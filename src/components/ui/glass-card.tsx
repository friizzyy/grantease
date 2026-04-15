'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'accent' | 'subtle' | 'glow'
  interactive?: boolean
  border?: boolean
  children: React.ReactNode
}

export function GlassCard({
  className,
  variant = 'default',
  interactive = false,
  border = true,
  children,
  ...props
}: GlassCardProps) {
  const variantStyles = {
    default: 'bg-pulse-surface/60',
    elevated: 'bg-pulse-elevated/70 shadow-xl',
    accent: 'bg-gradient-to-br from-pulse-accent/5 via-pulse-surface to-pulse-surface',
    glow: 'bg-pulse-surface/60 shadow-[0_0_20px_rgba(64,255,170,0.1)]',
    subtle: 'bg-pulse-surface/40',
  }

  const borderStyles = border ? 'border border-pulse-border/40' : ''

  return (
    <div
      className={cn(
        'relative rounded-xl overflow-hidden transition-all duration-200',
        variantStyles[variant],
        borderStyles,
        interactive && [
          'cursor-pointer',
          'hover:-translate-y-1',
          'hover:border-pulse-accent/30',
          'hover:shadow-[0_8px_30px_rgba(0,0,0,0.3),0_0_20px_rgba(64,255,170,0.08)]',
          'hover:scale-[1.01]',
        ],
        className
      )}
      {...props}
    >
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Bottom edge highlight */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-pulse-border/40 to-transparent" />
    </div>
  )
}
