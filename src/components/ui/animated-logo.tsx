'use client'

import { cn } from '@/lib/utils'

interface AnimatedLogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function AnimatedLogo({ className, size = 'md' }: AnimatedLogoProps) {
  const sizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  }

  return (
    <div
      className={cn(
        sizes[size],
        'relative border border-current rounded-lg flex items-center justify-center overflow-hidden',
        className
      )}
    >
      {/* Scanning line that moves vertically */}
      <span className="absolute w-full h-0.5 bg-current animate-scan-line" />
    </div>
  )
}
