'use client'

/**
 * ConfidenceIndicator Component
 *
 * Shows user's likelihood of success for a grant application based on:
 * - Profile match (eligibility, industry, location)
 * - Vault completeness (how much data is ready)
 * - Grant complexity (requirements, timeline)
 */

import { motion } from 'framer-motion'
import { TrendingUp, CheckCircle2, AlertCircle, XCircle } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'
import { cn } from '@/lib/utils'

type ConfidenceLevel = 'strong' | 'possible' | 'consider-others'

interface ConfidenceIndicatorProps {
  level: ConfidenceLevel
  score?: number // 0-100
  profileMatch?: number // 0-100
  vaultCompleteness?: number // 0-100
  eligibilityStatus?: 'eligible' | 'likely_eligible' | 'check_requirements' | 'not_eligible'
  reasons?: string[]
}

export function ConfidenceIndicator({
  level,
  score,
  profileMatch,
  vaultCompleteness,
  eligibilityStatus,
  reasons = [],
}: ConfidenceIndicatorProps) {
  const getConfig = (lvl: ConfidenceLevel) => {
    switch (lvl) {
      case 'strong':
        return {
          color: 'text-green-400',
          bg: 'bg-green-500/20',
          border: 'border-green-500/30',
          icon: CheckCircle2,
          label: 'Strong Match',
          description: 'You meet the requirements and your vault is ready',
        }
      case 'possible':
        return {
          color: 'text-yellow-400',
          bg: 'bg-yellow-500/20',
          border: 'border-yellow-500/30',
          icon: AlertCircle,
          label: 'Possible Match',
          description: 'Missing some requirements or vault data',
        }
      case 'consider-others':
        return {
          color: 'text-red-400',
          bg: 'bg-red-500/20',
          border: 'border-red-500/30',
          icon: XCircle,
          label: 'Consider Other Grants',
          description: 'Low eligibility or significant requirements missing',
        }
    }
  }

  const config = getConfig(level)
  const Icon = config.icon

  // Calculate overall score if not provided
  const overallScore = score ?? Math.round(
    ((profileMatch ?? 50) + (vaultCompleteness ?? 50)) / 2
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <GlassCard className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center',
              config.bg,
              'border',
              config.border
            )}>
              <Icon className={cn('w-6 h-6', config.color)} />
            </div>
            <div>
              <h3 className="font-semibold text-pulse-text">Your Confidence Score</h3>
              <p className="text-xs text-pulse-text-tertiary">Likelihood of success</p>
            </div>
          </div>
          <div className="text-right">
            <span className={cn('text-3xl font-bold', config.color)}>
              {overallScore}%
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <div className={cn(
          'inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-4',
          config.bg,
          config.border
        )}>
          <span className={cn('text-sm font-medium', config.color)}>{config.label}</span>
        </div>

        {/* Description */}
        <p className="text-sm text-pulse-text-secondary mb-4">
          {config.description}
        </p>

        {/* Breakdown */}
        {(profileMatch !== undefined || vaultCompleteness !== undefined) && (
          <div className="space-y-3 mb-4">
            {profileMatch !== undefined && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-pulse-text-tertiary">Profile Match</span>
                  <span className="text-xs font-medium text-pulse-text">{profileMatch}%</span>
                </div>
                <div className="h-1.5 bg-pulse-border rounded-full overflow-hidden">
                  <motion.div
                    className={cn('h-full rounded-full',
                      profileMatch >= 80 ? 'bg-green-500' :
                      profileMatch >= 60 ? 'bg-yellow-500' :
                      'bg-red-500'
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${profileMatch}%` }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                  />
                </div>
              </div>
            )}

            {vaultCompleteness !== undefined && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-pulse-text-tertiary">Vault Completeness</span>
                  <span className="text-xs font-medium text-pulse-text">{vaultCompleteness}%</span>
                </div>
                <div className="h-1.5 bg-pulse-border rounded-full overflow-hidden">
                  <motion.div
                    className={cn('h-full rounded-full',
                      vaultCompleteness >= 80 ? 'bg-green-500' :
                      vaultCompleteness >= 60 ? 'bg-yellow-500' :
                      'bg-red-500'
                    )}
                    initial={{ width: 0 }}
                    animate={{ width: `${vaultCompleteness}%` }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reasons */}
        {reasons.length > 0 && (
          <div className="pt-3 border-t border-pulse-border">
            <p className="text-xs font-medium text-pulse-text-secondary mb-2">Key Factors:</p>
            <ul className="space-y-1">
              {reasons.map((reason, i) => (
                <li key={i} className="text-xs text-pulse-text-tertiary flex items-start gap-2">
                  <TrendingUp className="w-3 h-3 text-pulse-accent shrink-0 mt-0.5" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        )}
      </GlassCard>
    </motion.div>
  )
}
