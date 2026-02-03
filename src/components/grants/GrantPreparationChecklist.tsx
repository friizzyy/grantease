'use client'

/**
 * GRANT PREPARATION CHECKLIST
 * ---------------------------
 * Interactive checklist for common grant application requirements
 * Helps users understand what they need before applying
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  Circle,
  FileText,
  DollarSign,
  Building2,
  Users,
  Calendar,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
} from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { Button } from '@/components/ui/button'

interface ChecklistItem {
  id: string
  label: string
  description: string
  category: 'documents' | 'financial' | 'organizational' | 'timeline'
  required: boolean
  estimatedTime?: string
}

// Common checklist items for most grants
const DEFAULT_CHECKLIST: ChecklistItem[] = [
  {
    id: 'ein',
    label: 'Tax ID / EIN Number',
    description: 'Your organization\'s Employer Identification Number',
    category: 'organizational',
    required: true,
  },
  {
    id: 'duns',
    label: 'DUNS / UEI Number',
    description: 'Unique Entity Identifier required for federal grants',
    category: 'organizational',
    required: true,
  },
  {
    id: 'sam',
    label: 'SAM.gov Registration',
    description: 'Active registration in System for Award Management',
    category: 'organizational',
    required: true,
    estimatedTime: '2-4 weeks if not registered',
  },
  {
    id: 'budget',
    label: 'Project Budget',
    description: 'Detailed breakdown of how funds will be used',
    category: 'financial',
    required: true,
    estimatedTime: '2-4 hours',
  },
  {
    id: 'narrative',
    label: 'Project Narrative',
    description: 'Description of your project, goals, and methodology',
    category: 'documents',
    required: true,
    estimatedTime: '4-8 hours',
  },
  {
    id: 'financials',
    label: 'Financial Statements',
    description: 'Recent audit or financial statements',
    category: 'financial',
    required: true,
  },
  {
    id: 'board',
    label: 'Board of Directors List',
    description: 'Names and affiliations of board members',
    category: 'organizational',
    required: false,
  },
  {
    id: 'letters',
    label: 'Letters of Support',
    description: 'Letters from partners or community stakeholders',
    category: 'documents',
    required: false,
    estimatedTime: '1-2 weeks to collect',
  },
  {
    id: 'timeline',
    label: 'Project Timeline',
    description: 'Milestones and deliverables schedule',
    category: 'timeline',
    required: true,
    estimatedTime: '1-2 hours',
  },
  {
    id: 'eval',
    label: 'Evaluation Plan',
    description: 'How you will measure project success',
    category: 'documents',
    required: false,
    estimatedTime: '2-3 hours',
  },
]

const CATEGORY_INFO = {
  documents: {
    label: 'Documents',
    icon: <FileText className="w-4 h-4" />,
    color: 'text-blue-400',
  },
  financial: {
    label: 'Financial',
    icon: <DollarSign className="w-4 h-4" />,
    color: 'text-green-400',
  },
  organizational: {
    label: 'Organizational',
    icon: <Building2 className="w-4 h-4" />,
    color: 'text-purple-400',
  },
  timeline: {
    label: 'Timeline',
    icon: <Calendar className="w-4 h-4" />,
    color: 'text-orange-400',
  },
}

interface GrantPreparationChecklistProps {
  grantTitle?: string
  customItems?: ChecklistItem[]
  compact?: boolean
  onReadinessChange?: (readiness: number) => void
}

export function GrantPreparationChecklist({
  grantTitle,
  customItems,
  compact = false,
  onReadinessChange,
}: GrantPreparationChecklistProps) {
  const items = customItems || DEFAULT_CHECKLIST
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set())
  const [isExpanded, setIsExpanded] = useState(!compact)

  const toggleItem = (id: string) => {
    const newChecked = new Set(checkedItems)
    if (newChecked.has(id)) {
      newChecked.delete(id)
    } else {
      newChecked.add(id)
    }
    setCheckedItems(newChecked)

    // Calculate readiness
    const requiredItems = items.filter((item) => item.required)
    const checkedRequired = requiredItems.filter((item) => newChecked.has(item.id))
    const readiness = Math.round((checkedRequired.length / requiredItems.length) * 100)
    onReadinessChange?.(readiness)
  }

  const requiredItems = items.filter((item) => item.required)
  const optionalItems = items.filter((item) => !item.required)
  const checkedRequired = requiredItems.filter((item) => checkedItems.has(item.id))
  const readinessPercent = Math.round((checkedRequired.length / requiredItems.length) * 100)

  const getReadinessColor = () => {
    if (readinessPercent >= 80) return 'text-green-400'
    if (readinessPercent >= 50) return 'text-yellow-400'
    return 'text-orange-400'
  }

  const getReadinessBgColor = () => {
    if (readinessPercent >= 80) return 'bg-green-400'
    if (readinessPercent >= 50) return 'bg-yellow-400'
    return 'bg-orange-400'
  }

  // Group items by category
  const groupedItems = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, ChecklistItem[]>)

  return (
    <GlassCard className="p-5">
      {/* Header */}
      <div
        className={`flex items-center justify-between ${compact ? 'cursor-pointer' : ''}`}
        onClick={() => compact && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-pulse-accent/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-pulse-accent" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-pulse-text">
              Application Readiness
            </h3>
            {grantTitle && (
              <p className="text-xs text-pulse-text-tertiary line-clamp-1">
                {grantTitle}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`text-lg font-bold ${getReadinessColor()}`}>
            {readinessPercent}%
          </div>
          {compact && (
            <button className="p-1 rounded-lg hover:bg-pulse-surface">
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-pulse-text-tertiary" />
              ) : (
                <ChevronDown className="w-5 h-5 text-pulse-text-tertiary" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4 mb-4">
        <div className="h-2 bg-pulse-border rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${getReadinessBgColor()}`}
            initial={{ width: 0 }}
            animate={{ width: `${readinessPercent}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        <div className="flex items-center justify-between mt-2 text-xs text-pulse-text-tertiary">
          <span>
            {checkedRequired.length} of {requiredItems.length} required items ready
          </span>
          <span>
            {checkedItems.size} of {items.length} total
          </span>
        </div>
      </div>

      {/* Checklist Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {/* Required Items */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-orange-400" />
                <span className="text-xs font-medium text-pulse-text-secondary uppercase tracking-wider">
                  Required ({requiredItems.length})
                </span>
              </div>
              <div className="space-y-2">
                {Object.entries(groupedItems).map(([category, categoryItems]) => {
                  const requiredInCategory = categoryItems.filter((i) => i.required)
                  if (requiredInCategory.length === 0) return null

                  const catInfo = CATEGORY_INFO[category as keyof typeof CATEGORY_INFO]
                  return (
                    <div key={category} className="space-y-1">
                      {requiredInCategory.map((item) => (
                        <ChecklistItemRow
                          key={item.id}
                          item={item}
                          isChecked={checkedItems.has(item.id)}
                          onToggle={() => toggleItem(item.id)}
                          categoryInfo={catInfo}
                        />
                      ))}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Optional Items */}
            {optionalItems.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-pulse-text-tertiary" />
                  <span className="text-xs font-medium text-pulse-text-secondary uppercase tracking-wider">
                    Optional ({optionalItems.length})
                  </span>
                </div>
                <div className="space-y-1">
                  {optionalItems.map((item) => {
                    const catInfo = CATEGORY_INFO[item.category]
                    return (
                      <ChecklistItemRow
                        key={item.id}
                        item={item}
                        isChecked={checkedItems.has(item.id)}
                        onToggle={() => toggleItem(item.id)}
                        categoryInfo={catInfo}
                      />
                    )
                  })}
                </div>
              </div>
            )}

            {/* Tip */}
            {readinessPercent < 100 && (
              <div className="mt-4 p-3 rounded-lg bg-pulse-surface/50 border border-pulse-border">
                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-pulse-accent shrink-0 mt-0.5" />
                  <div className="text-sm text-pulse-text-secondary">
                    <strong className="text-pulse-text">Pro tip:</strong> Start gathering
                    documents early. Some items like SAM.gov registration can take weeks.
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  )
}

function ChecklistItemRow({
  item,
  isChecked,
  onToggle,
  categoryInfo,
}: {
  item: ChecklistItem
  isChecked: boolean
  onToggle: () => void
  categoryInfo: { label: string; icon: React.ReactNode; color: string }
}) {
  return (
    <div
      role="checkbox"
      aria-checked={isChecked}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onToggle()
        }
      }}
      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
        isChecked
          ? 'bg-pulse-accent/5 border-pulse-accent/30'
          : 'bg-pulse-surface/30 border-pulse-border hover:border-pulse-accent/20'
      }`}
      onClick={onToggle}
    >
      <span className="shrink-0 mt-0.5" aria-hidden="true">
        {isChecked ? (
          <CheckCircle2 className="w-5 h-5 text-pulse-accent" />
        ) : (
          <Circle className="w-5 h-5 text-pulse-text-tertiary" />
        )}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={`text-sm font-medium ${
              isChecked ? 'text-pulse-text-tertiary line-through' : 'text-pulse-text'
            }`}
          >
            {item.label}
          </span>
          <span className={`${categoryInfo.color}`}>{categoryInfo.icon}</span>
        </div>
        <p className="text-xs text-pulse-text-tertiary mt-0.5">{item.description}</p>
        {item.estimatedTime && (
          <div className="flex items-center gap-1 mt-1 text-xs text-pulse-text-tertiary">
            <Clock className="w-3 h-3" />
            <span>{item.estimatedTime}</span>
          </div>
        )}
      </div>
    </div>
  )
}
