'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
  className?: string
}

/**
 * Consistent page header used across all dashboard pages.
 * Renders title, optional description, and a right-aligned action slot.
 */
export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <motion.div
      className={cn('flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8', className)}
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="min-w-0">
        <h1 className="text-heading-lg text-pulse-text">{title}</h1>
        {description && (
          <p className="text-body-sm text-pulse-text-tertiary mt-1">{description}</p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {children}
        </div>
      )}
    </motion.div>
  )
}
