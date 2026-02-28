'use client'

/**
 * OPTION CARD - SPLIT SCREEN IMMERSIVE STYLE
 * ------------------------------------------
 * Premium cards with:
 * - Gradient-bordered icons
 * - Hover glow effects
 * - Clean selection states
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import * as LucideIcons from 'lucide-react'

// Type-safe icon lookup from lucide-react namespace
const LucideIconMap = LucideIcons as unknown as Record<string, LucideIcon>

// Color mappings standardized to pulse-accent / emerald / teal family
const GRADIENT_COLORS: Record<string, string> = {
  // Entity types -- all within the brand palette
  individual: 'from-pulse-accent to-emerald-500',
  nonprofit: 'from-emerald-400 to-teal-500',
  small_business: 'from-teal-400 to-emerald-500',
  for_profit: 'from-pulse-accent to-teal-500',
  educational: 'from-emerald-500 to-teal-600',
  government: 'from-teal-500 to-emerald-600',
  tribal: 'from-emerald-500 to-pulse-accent',
  // Default
  default: 'from-pulse-accent to-emerald-500',
}

interface OptionCardProps {
  label: string
  description?: string
  icon?: string
  isSelected: boolean
  onClick: () => void
  size?: 'default' | 'compact'
  disabled?: boolean
  id?: string // Used for gradient color lookup
}

export function OptionCard({
  label,
  description,
  icon,
  isSelected,
  onClick,
  size = 'default',
  disabled = false,
  id,
}: OptionCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const IconComponent = icon ? LucideIconMap[icon] : null
  const gradientColor = id ? (GRADIENT_COLORS[id] || GRADIENT_COLORS.default) : GRADIENT_COLORS.default

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-pressed={isSelected}
      className={cn(
        'relative w-full text-left rounded-2xl border-2 transition-all duration-300',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-pulse-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-pulse-bg',
        size === 'default' ? 'p-5' : 'p-4',
        isSelected
          ? 'border-pulse-accent bg-transparent'
          : 'border-white/[0.08] hover:border-white/[0.15] bg-white/[0.02] hover:bg-white/[0.04]',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      {/* Gradient glow on hover/selected */}
      <AnimatePresence>
        {(isHovered || isSelected) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              'absolute inset-0 rounded-2xl bg-gradient-to-br pointer-events-none',
              isSelected ? 'opacity-[0.08]' : 'opacity-[0.04]',
              gradientColor
            )}
          />
        )}
      </AnimatePresence>

      {/* Selection indicator */}
      <div
        className={cn(
          'absolute top-4 right-4 w-6 h-6 rounded-full flex items-center justify-center transition-all',
          isSelected
            ? 'bg-pulse-accent scale-100'
            : 'bg-white/[0.06] scale-90 opacity-50'
        )}
      >
        {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
      </div>

      <div className="relative flex items-start gap-4 pr-10">
        {/* Gradient-bordered icon */}
        {IconComponent && (
          <div
            className={cn(
              'shrink-0 rounded-xl bg-gradient-to-br p-[1px]',
              size === 'default' ? 'w-12 h-12' : 'w-10 h-10',
              gradientColor
            )}
          >
            <div className="w-full h-full rounded-xl bg-pulse-bg flex items-center justify-center">
              <IconComponent
                className={cn(
                  'transition-colors',
                  size === 'default' ? 'w-5 h-5' : 'w-4 h-4',
                  isSelected ? 'text-pulse-accent' : 'text-pulse-text-secondary'
                )}
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4
            className={cn(
              'font-semibold transition-colors',
              size === 'default' ? 'text-base mb-1' : 'text-sm',
              isSelected ? 'text-pulse-text' : 'text-pulse-text-secondary'
            )}
          >
            {label}
          </h4>
          {description && (
            <p
              className={cn(
                'leading-relaxed text-pulse-text-tertiary',
                size === 'default' ? 'text-sm' : 'text-xs'
              )}
            >
              {description}
            </p>
          )}
        </div>
      </div>
    </button>
  )
}

// Multi-select chip variant
interface OptionChipProps {
  label: string
  icon?: string
  isSelected: boolean
  onClick: () => void
  disabled?: boolean
}

export function OptionChip({
  label,
  icon,
  isSelected,
  onClick,
  disabled = false,
}: OptionChipProps) {
  const IconComponent = icon ? LucideIconMap[icon] : null

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={isSelected}
      className={cn(
        'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all duration-200',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-pulse-accent/50',
        isSelected
          ? 'bg-pulse-accent/[0.1] border-pulse-accent/40 text-pulse-text'
          : 'bg-white/[0.02] border-white/[0.08] text-pulse-text-secondary hover:border-white/[0.15] hover:bg-white/[0.04]',
        disabled && 'opacity-40 cursor-not-allowed'
      )}
    >
      {IconComponent && (
        <IconComponent
          className={cn(
            'w-4 h-4 transition-colors',
            isSelected ? 'text-pulse-accent' : 'text-pulse-text-tertiary'
          )}
        />
      )}
      <span className="text-sm font-medium">{label}</span>
    </button>
  )
}
