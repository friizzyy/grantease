'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface SectionProps {
  children: React.ReactNode
  className?: string
  containerClassName?: string
  id?: string
}

// Base section with consistent padding
export function Section({ children, className, containerClassName, id }: SectionProps) {
  return (
    <section id={id} className={cn('py-24 px-4 sm:px-6 lg:px-8 relative', className)}>
      <div className={cn('max-w-7xl mx-auto', containerClassName)}>
        {children}
      </div>
    </section>
  )
}

// Section header component
interface SectionHeaderProps {
  eyebrow?: string
  title: string
  description?: string
  align?: 'left' | 'center'
  className?: string
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'mb-16',
        align === 'center' && 'text-center max-w-3xl mx-auto',
        align === 'left' && 'max-w-2xl',
        className
      )}
    >
      {eyebrow && (
        <span className="text-label text-pulse-accent mb-4 inline-block">
          {eyebrow}
        </span>
      )}
      <h2 className="text-display-section text-pulse-text mb-4">
        {title}
      </h2>
      {description && (
        <p className="text-body-lg text-pulse-text-secondary">
          {description}
        </p>
      )}
    </div>
  )
}

// Divider with gradient
export function SectionDivider({ className }: { className?: string }) {
  return (
    <div className={cn('relative py-12', className)}>
      <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-pulse-border to-transparent" />
    </div>
  )
}

// Accent divider with glow
export function AccentDivider({ className }: { className?: string }) {
  return (
    <div className={cn('relative py-16', className)}>
      <div className="absolute inset-x-0 h-px">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pulse-accent/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pulse-accent/30 to-transparent blur-sm" />
      </div>
    </div>
  )
}

// Grid layouts
interface GridProps {
  children: React.ReactNode
  className?: string
  cols?: 2 | 3 | 4
  gap?: 'sm' | 'md' | 'lg'
}

export function Grid({ children, className, cols = 3, gap = 'md' }: GridProps) {
  const colsClasses = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  }

  const gapClasses = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
  }

  return (
    <div className={cn('grid', colsClasses[cols], gapClasses[gap], className)}>
      {children}
    </div>
  )
}

// Bento grid for asymmetric layouts
export function BentoGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('grid md:grid-cols-3 gap-6 auto-rows-[minmax(200px,auto)]', className)}>
      {children}
    </div>
  )
}

// Container variants
interface ContainerProps {
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export function Container({ children, className, size = 'lg' }: ContainerProps) {
  const sizeClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full',
  }

  return (
    <div className={cn('mx-auto px-4 sm:px-6 lg:px-8', sizeClasses[size], className)}>
      {children}
    </div>
  )
}
