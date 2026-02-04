'use client'

/**
 * PROFILE COMPLETENESS BANNER
 * ---------------------------
 * Shows users how complete their profile is and what's missing
 * Displayed on the Discover page to encourage profile completion
 */

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertCircle,
  ChevronRight,
  X,
  User,
  MapPin,
  Target,
  Building2,
  DollarSign,
  Sparkles,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'

interface ProfileData {
  entityType?: string | null
  state?: string | null
  industryTags?: string[]
  sizeBand?: string | null
  annualBudget?: string | null
  confidenceScore?: number
  onboardingCompleted?: boolean
}

interface ProfileCompletenessBannerProps {
  profile: ProfileData | null
  onDismiss?: () => void
  compact?: boolean
}

interface MissingField {
  key: string
  label: string
  icon: React.ReactNode
  impact: 'high' | 'medium' | 'low'
  description: string
  settingsField?: string // The field name to highlight in settings
}

function getMissingFields(profile: ProfileData | null): MissingField[] {
  const missing: MissingField[] = []

  if (!profile) {
    return [
      {
        key: 'profile',
        label: 'Complete Profile',
        icon: <User className="w-4 h-4" />,
        impact: 'high',
        description: 'Set up your profile to see personalized grant matches',
        settingsField: 'entityType',
      },
    ]
  }

  if (!profile.entityType) {
    missing.push({
      key: 'entityType',
      label: 'Organization Type',
      icon: <Building2 className="w-4 h-4" />,
      impact: 'high',
      description: 'Required for eligibility matching',
      settingsField: 'entityType',
    })
  }

  if (!profile.state) {
    missing.push({
      key: 'state',
      label: 'Location',
      icon: <MapPin className="w-4 h-4" />,
      impact: 'high',
      description: 'Many grants are region-specific',
      settingsField: 'state',
    })
  }

  if (!profile.industryTags || profile.industryTags.length === 0) {
    missing.push({
      key: 'industryTags',
      label: 'Focus Areas',
      icon: <Target className="w-4 h-4" />,
      impact: 'high',
      description: 'Helps match grants to your mission',
      settingsField: 'industryTags',
    })
  }

  if (!profile.sizeBand) {
    missing.push({
      key: 'sizeBand',
      label: 'Organization Size',
      icon: <User className="w-4 h-4" />,
      impact: 'medium',
      description: 'Some grants target specific org sizes',
      settingsField: 'sizeBand',
    })
  }

  if (!profile.annualBudget) {
    missing.push({
      key: 'annualBudget',
      label: 'Budget Range',
      icon: <DollarSign className="w-4 h-4" />,
      impact: 'medium',
      description: 'Matches you with appropriately sized grants',
      settingsField: 'annualBudget',
    })
  }

  return missing
}

function getScoreColor(score: number): string {
  if (score >= 0.8) return 'text-green-400'
  if (score >= 0.6) return 'text-blue-400'
  if (score >= 0.4) return 'text-yellow-400'
  return 'text-orange-400'
}

function getScoreBgColor(score: number): string {
  if (score >= 0.8) return 'bg-green-400'
  if (score >= 0.6) return 'bg-blue-400'
  if (score >= 0.4) return 'bg-yellow-400'
  return 'bg-orange-400'
}

export function ProfileCompletenessBanner({
  profile,
  onDismiss,
  compact = false,
}: ProfileCompletenessBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false)

  const missingFields = getMissingFields(profile)
  const confidenceScore = profile?.confidenceScore ?? 0
  const scorePercent = Math.round(confidenceScore * 100)

  // Don't show if profile is complete (score >= 80%)
  if (confidenceScore >= 0.8 || isDismissed) {
    return null
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    onDismiss?.()
  }

  // Build the settings URL with tab and highlight field
  const getSettingsUrl = (field?: string) => {
    const params = new URLSearchParams()
    params.set('tab', 'matching')
    if (field) {
      params.set('highlight', field)
    }
    return `/app/settings?${params.toString()}`
  }

  // Get the first missing field for targeted navigation
  const firstMissingField = missingFields[0]?.settingsField

  // Compact version for inline display
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
      >
        <div className="flex items-center justify-between p-3 rounded-lg bg-pulse-accent/10 border border-pulse-accent/20">
          <div className="flex items-center gap-3">
            <div className={`text-sm font-semibold ${getScoreColor(confidenceScore)}`}>
              {scorePercent}% Match Accuracy
            </div>
            <span className="text-xs text-pulse-text-tertiary">
              {missingFields.length > 0 ? `Add ${missingFields[0].label.toLowerCase()} to improve` : 'Complete your profile'}
            </span>
          </div>
          <Link href={getSettingsUrl(firstMissingField)}>
            <Button variant="ghost" size="sm" className="text-pulse-accent">
              Improve
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </motion.div>
    )
  }

  // Full banner version
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="mb-6"
      >
        <GlassCard className="p-5 border-pulse-accent/20">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              {/* Score Circle */}
              <div className="relative w-16 h-16 shrink-0">
                <svg className="w-16 h-16 transform -rotate-90">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    strokeWidth="4"
                    fill="none"
                    className="stroke-pulse-border"
                  />
                  <motion.circle
                    cx="32"
                    cy="32"
                    r="28"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                    className={getScoreBgColor(confidenceScore).replace('bg-', 'stroke-')}
                    initial={{ strokeDashoffset: 176 }}
                    animate={{
                      strokeDashoffset: 176 - (176 * confidenceScore),
                    }}
                    style={{
                      strokeDasharray: 176,
                    }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-lg font-bold ${getScoreColor(confidenceScore)}`}>
                    {scorePercent}%
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-pulse-accent" />
                  <h3 className="text-sm font-semibold text-pulse-text">
                    Match Accuracy: {scorePercent}%
                  </h3>
                </div>
                <p className="text-sm text-pulse-text-secondary mb-3">
                  {scorePercent < 40
                    ? 'Complete your profile to see grants matched to your organization.'
                    : scorePercent < 70
                    ? 'Add a few more details to improve your match quality.'
                    : 'Almost there! Add final details for the best matches.'}
                </p>

                {/* Missing Fields */}
                {missingFields.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {missingFields.slice(0, 3).map((field) => (
                      <div
                        key={field.key}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs border ${
                          field.impact === 'high'
                            ? 'bg-orange-500/10 border-orange-500/20 text-orange-400'
                            : 'bg-pulse-surface border-pulse-border text-pulse-text-tertiary'
                        }`}
                      >
                        {field.icon}
                        <span>{field.label}</span>
                        {field.impact === 'high' && (
                          <AlertCircle className="w-3 h-3" />
                        )}
                      </div>
                    ))}
                    {missingFields.length > 3 && (
                      <span className="text-xs text-pulse-text-tertiary self-center">
                        +{missingFields.length - 3} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0 ml-4">
              <Link href={profile?.onboardingCompleted ? getSettingsUrl(firstMissingField) : '/onboarding/step-1'}>
                <Button size="sm">
                  {missingFields.length > 0
                    ? `Add ${missingFields[0].label}`
                    : profile?.onboardingCompleted
                    ? 'View Settings'
                    : 'Finish Setup'}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              {onDismiss && (
                <button
                  onClick={handleDismiss}
                  className="p-1.5 rounded-lg text-pulse-text-tertiary hover:text-pulse-text hover:bg-pulse-surface transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* High Impact Tip */}
          {missingFields.length > 0 && missingFields[0].impact === 'high' && (
            <div className="mt-4 pt-4 border-t border-pulse-border">
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-pulse-accent" />
                <span className="text-pulse-text-secondary">
                  <strong className="text-pulse-text">Tip:</strong> {missingFields[0].description}
                </span>
              </div>
            </div>
          )}
        </GlassCard>
      </motion.div>
    </AnimatePresence>
  )
}
