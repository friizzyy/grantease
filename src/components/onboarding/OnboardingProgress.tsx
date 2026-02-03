'use client'

/**
 * ONBOARDING PROGRESS - PREMIUM REDESIGN
 * --------------------------------------
 * Clean, minimal progress indicator:
 * - Simple step counter
 * - Subtle progress bar
 * - No distracting animations
 */

import { motion } from 'framer-motion'

interface OnboardingProgressProps {
  currentStep: number
  totalSteps?: number
}

const STEP_LABELS = [
  'About You',
  'Focus Areas',
  'Organization',
  'Details',
  'Preferences',
]

export function OnboardingProgress({ currentStep, totalSteps = 5 }: OnboardingProgressProps) {
  const progress = ((currentStep - 1) / (totalSteps - 1)) * 100

  return (
    <div className="w-full">
      {/* Header with step info */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-pulse-text-tertiary font-mono text-xs uppercase tracking-wider">
            Step {currentStep} of {totalSteps}
          </span>
          <h2 className="text-lg font-semibold text-pulse-text mt-1">
            {STEP_LABELS[currentStep - 1]}
          </h2>
        </div>
        <span className="text-2xl font-bold text-pulse-accent">
          {Math.round((currentStep / totalSteps) * 100)}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-pulse-accent to-emerald-400 rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>

      {/* Step dots - desktop only */}
      <div className="hidden md:flex items-center justify-between mt-4">
        {STEP_LABELS.map((label, index) => {
          const stepNum = index + 1
          const isCompleted = stepNum < currentStep
          const isCurrent = stepNum === currentStep

          return (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full transition-all ${
                  isCompleted ? 'bg-pulse-accent' :
                  isCurrent ? 'bg-pulse-accent' :
                  'bg-white/[0.1]'
                }`}
              />
              <span className={`text-xs transition-colors ${
                isCurrent ? 'text-pulse-text font-medium' :
                isCompleted ? 'text-pulse-text-secondary' :
                'text-pulse-text-tertiary'
              }`}>
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
