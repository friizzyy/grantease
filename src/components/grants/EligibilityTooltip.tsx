'use client'

/**
 * ELIGIBILITY STATUS TOOLTIP
 * --------------------------
 * Explains what each eligibility status means
 * Used throughout the app to help users understand match results
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  XCircle,
  Info,
} from 'lucide-react'

type EligibilityStatus = 'eligible' | 'likely_eligible' | 'check_requirements' | 'not_eligible' | 'uncertain'

interface EligibilityInfo {
  label: string
  description: string
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
  actionText: string
}

const ELIGIBILITY_INFO: Record<EligibilityStatus, EligibilityInfo> = {
  eligible: {
    label: 'Eligible',
    description: 'Your organization meets all known eligibility criteria for this grant.',
    icon: <CheckCircle2 className="w-4 h-4" />,
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    actionText: 'Ready to apply!',
  },
  likely_eligible: {
    label: 'Likely Eligible',
    description: 'Based on your profile, you appear to meet the main eligibility requirements. Some details may need verification.',
    icon: <CheckCircle2 className="w-4 h-4" />,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    actionText: 'Review requirements before applying',
  },
  check_requirements: {
    label: 'Check Requirements',
    description: 'Some eligibility criteria couldn\'t be verified from your profile. Review the grant requirements to confirm you qualify.',
    icon: <AlertCircle className="w-4 h-4" />,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
    actionText: 'Verify eligibility before applying',
  },
  not_eligible: {
    label: 'Not Eligible',
    description: 'Based on your profile, you may not meet the eligibility requirements for this grant.',
    icon: <XCircle className="w-4 h-4" />,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    actionText: 'Consider other grants',
  },
  uncertain: {
    label: 'Uncertain',
    description: 'We couldn\'t determine your eligibility with confidence. Review the grant requirements carefully.',
    icon: <HelpCircle className="w-4 h-4" />,
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/20',
    actionText: 'Review requirements manually',
  },
}

interface EligibilityBadgeProps {
  status: EligibilityStatus
  showTooltip?: boolean
  size?: 'sm' | 'md'
}

export function EligibilityBadge({
  status,
  showTooltip = true,
  size = 'md',
}: EligibilityBadgeProps) {
  const [isHovered, setIsHovered] = useState(false)
  const info = ELIGIBILITY_INFO[status] || ELIGIBILITY_INFO.uncertain

  const sizeClasses = size === 'sm'
    ? 'text-xs px-2 py-0.5 gap-1'
    : 'text-xs px-2.5 py-1 gap-1.5'

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`inline-flex items-center rounded-full border font-medium ${sizeClasses} ${info.color} ${info.bgColor} ${info.borderColor}`}
      >
        {info.icon}
        <span>{info.label}</span>
        {showTooltip && (
          <HelpCircle className={size === 'sm' ? 'w-3 h-3 opacity-60' : 'w-3.5 h-3.5 opacity-60'} />
        )}
      </div>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="absolute z-50 top-full left-0 mt-2 w-64"
          >
            <div className={`p-3 rounded-lg border ${info.bgColor} ${info.borderColor} shadow-lg backdrop-blur-xl`}>
              <div className={`flex items-center gap-2 mb-2 ${info.color}`}>
                {info.icon}
                <span className="font-semibold">{info.label}</span>
              </div>
              <p className="text-sm text-pulse-text-secondary mb-2">
                {info.description}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-pulse-text-tertiary">
                <Info className="w-3 h-3" />
                <span>{info.actionText}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface EligibilityExplanationProps {
  status: EligibilityStatus
  reasons?: string[]
}

export function EligibilityExplanation({
  status,
  reasons = [],
}: EligibilityExplanationProps) {
  const info = ELIGIBILITY_INFO[status] || ELIGIBILITY_INFO.uncertain

  return (
    <div className={`p-4 rounded-lg border ${info.bgColor} ${info.borderColor}`}>
      <div className={`flex items-center gap-2 mb-2 ${info.color}`}>
        {info.icon}
        <span className="font-semibold">{info.label}</span>
      </div>
      <p className="text-sm text-pulse-text-secondary mb-3">
        {info.description}
      </p>

      {reasons.length > 0 && (
        <div className="space-y-1.5 mb-3">
          {reasons.map((reason, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-pulse-text-tertiary">
              <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${info.color}`} />
              <span>{reason}</span>
            </div>
          ))}
        </div>
      )}

      <div className={`text-xs ${info.color} font-medium`}>
        → {info.actionText}
      </div>
    </div>
  )
}

// Simple inline status indicator
export function EligibilityDot({ status }: { status: EligibilityStatus }) {
  const info = ELIGIBILITY_INFO[status] || ELIGIBILITY_INFO.uncertain
  return (
    <span
      className={`inline-block w-2 h-2 rounded-full ${info.bgColor.replace('/10', '')}`}
      title={info.label}
    />
  )
}
