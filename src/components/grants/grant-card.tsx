'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, DollarSign, MapPin, Bookmark, ExternalLink, Check } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn, formatCurrency, formatRelativeDate, truncate, parseJSON } from '@/lib/utils'
import type { Grant } from '@/types'
import { useState } from 'react'

interface GrantCardProps {
  grant: Grant
  saved?: boolean
  onSave?: () => void
  onUnsave?: () => void
  index?: number
}

/** Compute days until deadline */
function getDaysUntilDeadline(deadlineDate?: Date | null): number | null {
  if (!deadlineDate) return null
  const now = new Date()
  const deadline = new Date(deadlineDate)
  const diffMs = deadline.getTime() - now.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}

export function GrantCard({ grant, saved, onSave, onUnsave, index = 0 }: GrantCardProps) {
  const categories = parseJSON<string[]>(grant.categories, [])
  const eligibility = parseJSON<{ types: string[] }>(grant.eligibility, { types: [] })
  const [showSaveConfirm, setShowSaveConfirm] = useState(false)
  const daysUntilDeadline = getDaysUntilDeadline(grant.deadlineDate)
  const isUrgent = daysUntilDeadline !== null && daysUntilDeadline >= 0 && daysUntilDeadline < 7

  const statusVariant = {
    open: 'success',
    closed: 'error',
    unknown: 'warning',
  }[grant.status] as 'success' | 'error' | 'warning'

  const handleSave = () => {
    if (saved) {
      onUnsave?.()
    } else {
      onSave?.()
      setShowSaveConfirm(true)
      setTimeout(() => setShowSaveConfirm(false), 1500)
    }
  }

  return (
    <div className="p-6 group rounded-xl border border-white/[0.05] bg-white/[0.02] hover:border-white/[0.1] transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <motion.span
          className="text-label text-pulse-accent"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          {grant.sponsor}
        </motion.span>
        <Badge
          variant={statusVariant}
          pulse={isUrgent && grant.status === 'open'}
          className="capitalize shrink-0"
        >
          {isUrgent && grant.status === 'open' ? 'Closing Soon' : grant.status}
        </Badge>
      </div>

      {/* Title */}
      <Link href={`/app/grants/${grant.id}`} className="block group/link">
        <motion.h3
          className="text-heading-sm text-pulse-text group-hover/link:text-pulse-accent transition-colors mb-2 line-clamp-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.3 }}
        >
          {grant.title}
        </motion.h3>
      </Link>

      {/* Summary */}
      <motion.p
        className="text-body-sm text-pulse-text-secondary mb-4 line-clamp-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        {truncate(grant.summary, 180)}
      </motion.p>

      {/* Categories */}
      <motion.div
        className="flex flex-wrap gap-1.5 mb-4"
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.3 }}
      >
        {categories.slice(0, 3).map((cat) => (
          <span
            key={cat}
            className="px-2 py-0.5 rounded-full text-label-sm bg-white/[0.04] border border-white/[0.06] text-pulse-text-tertiary"
          >
            {cat}
          </span>
        ))}
        {categories.length > 3 && (
          <span className="px-2 py-0.5 rounded-full text-label-sm bg-white/[0.04] border border-white/[0.06] text-pulse-text-tertiary">
            +{categories.length - 3}
          </span>
        )}
      </motion.div>

      {/* Meta Info */}
      <motion.div
        className="flex flex-wrap items-center gap-4 text-body-sm text-pulse-text-tertiary mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      >
        {(grant.amountMin || grant.amountMax) && (
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-4 h-4" />
            <span>
              {grant.amountMin && grant.amountMax
                ? `${formatCurrency(grant.amountMin)} - ${formatCurrency(grant.amountMax)}`
                : grant.amountMin
                ? `From ${formatCurrency(grant.amountMin)}`
                : grant.amountMax
                ? `Up to ${formatCurrency(grant.amountMax)}`
                : grant.amountText}
            </span>
          </div>
        )}

        {grant.deadlineDate && (
          <div className={cn(
            'flex items-center gap-1.5',
            isUrgent && 'text-orange-400 font-medium'
          )}>
            <Calendar className="w-4 h-4" />
            <span>{isUrgent ? `${daysUntilDeadline}d left` : formatRelativeDate(grant.deadlineDate)}</span>
          </div>
        )}
      </motion.div>

      {/* Actions */}
      <motion.div
        className="flex items-center justify-between pt-4 border-t border-white/[0.05]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.3 }}
      >
        <div className="flex items-center gap-2">
          <motion.div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className={saved ? 'text-pulse-accent' : ''}
            >
              <AnimatePresence mode="wait">
                {showSaveConfirm ? (
                  <motion.div
                    key="check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="flex items-center gap-1"
                  >
                    <Check className="w-4 h-4 text-pulse-accent" />
                    <span className="text-pulse-accent">Saved!</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="bookmark"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="flex items-center gap-1"
                  >
                    <Bookmark className={`w-4 h-4 ${saved ? 'fill-current' : ''}`} />
                    <span>{saved ? 'Saved' : 'Save'}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </motion.div>

          {grant.url && (
            <Button variant="ghost" size="sm" asChild>
              <a href={grant.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
                Source
              </a>
            </Button>
          )}
        </div>

        <Button variant="secondary" size="sm" asChild>
          <Link href={`/app/grants/${grant.id}`}>
            View Details
          </Link>
        </Button>
      </motion.div>
    </div>
  )
}

// Animated grid wrapper for staggered entrance
export function GrantCardGrid({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      className="grid gap-4"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.08,
            delayChildren: 0.1,
          }
        }
      }}
    >
      {children}
    </motion.div>
  )
}

// Wrapper for individual cards in the grid
export function GrantCardItem({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={{
        hidden: {
          opacity: 0,
          y: 20,
          scale: 0.95,
        },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: {
            type: 'spring',
            stiffness: 300,
            damping: 24,
          }
        }
      }}
    >
      {children}
    </motion.div>
  )
}
