'use client'

import { cn } from '@/lib/utils'

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  showIcon?: boolean
}

const sizeClasses = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-xl',
  xl: 'text-2xl',
}

/**
 * Brand logo text component with consistent styling
 * "Grants" in bold + "by AI" in lighter accent style
 */
export function BrandLogo({ size = 'md', className }: BrandLogoProps) {
  return (
    <span className={cn('font-sans tracking-tight', sizeClasses[size], className)}>
      <span className="font-semibold text-pulse-text">Grants</span>
      <span className="font-normal text-pulse-text-secondary"> by </span>
      <span className="font-medium text-pulse-accent">AI</span>
    </span>
  )
}

/**
 * Full brand display with animated logo icon
 */
export function BrandWithIcon({
  size = 'md',
  className,
  iconClassName,
}: BrandLogoProps & { iconClassName?: string }) {
  // Import AnimatedLogo dynamically to avoid circular deps
  const { AnimatedLogo } = require('./animated-logo')

  const iconSizes = {
    sm: 'sm' as const,
    md: 'md' as const,
    lg: 'lg' as const,
    xl: 'lg' as const,
  }

  return (
    <span className={cn('flex items-center gap-2', className)}>
      <AnimatedLogo size={iconSizes[size]} className={iconClassName} />
      <BrandLogo size={size} />
    </span>
  )
}
