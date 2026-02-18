'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'accent' | 'subtle'
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
    default: 'bg-pulse-surface/60 backdrop-blur-xl',
    elevated: 'bg-pulse-elevated/70 backdrop-blur-2xl shadow-xl',
    accent: 'bg-pulse-accent/5 backdrop-blur-xl',
    subtle: 'bg-pulse-surface/40 backdrop-blur-lg',
  }

  const borderStyles = border ? 'border border-white/[0.08]' : ''

  return (
    <div
      className={cn(
        'relative rounded-2xl overflow-hidden transition-[border-color,box-shadow,transform] duration-200',
        variantStyles[variant],
        borderStyles,
        interactive && [
          'cursor-pointer',
          'hover:-translate-y-1',
          'hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.4)]',
          'hover:border-pulse-accent/20',
          'active:border-pulse-accent/20',
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
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    </div>
  )
}

// Glass card sections
export function GlassCardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-4 sm:p-6 pb-3 sm:pb-4', className)} {...props}>
      {children}
    </div>
  )
}

export function GlassCardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('px-4 sm:px-6 pb-4 sm:pb-6', className)} {...props}>
      {children}
    </div>
  )
}

export function GlassCardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('px-6 py-4 border-t border-white/[0.04] bg-white/[0.02]', className)}
      {...props}
    >
      {children}
    </div>
  )
}
