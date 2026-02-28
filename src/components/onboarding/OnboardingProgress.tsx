'use client'

/**
 * ONBOARDING PROGRESS
 * -------------------
 * Clean, minimal progress indicator:
 * - Smooth animated mint progress bar
 * - Step counter with labels
 * - Uses design system typography
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
          <span className="text-label-sm text-pulse-text-tertiary">
            Step {currentStep} of {totalSteps}
          </span>
          <h2 className="text-heading-sm text-pulse-text mt-1">
            {STEP_LABELS[currentStep - 1]}
          </h2>
        </div>
        <span className="text-heading text-pulse-accent tabular-nums">
          {Math.round((currentStep / totalSteps) * 100)}%
        </span>
      </div>

      {/* Smooth mint progress bar */}
      <div className="h-1 bg-pulse-surface rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-pulse-accent rounded-full"
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        />
      </div>

      {/* Step dots -- desktop only */}
      <div className="hidden md:flex items-center justify-between mt-4">
        {STEP_LABELS.map((label, index) => {
          const stepNum = index + 1
          const isCompleted = stepNum < currentStep
          const isCurrent = stepNum === currentStep

          return (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  isCompleted ? 'bg-pulse-accent' :
                  isCurrent ? 'bg-pulse-accent' :
                  'bg-white/[0.1]'
                }`}
              />
              <span className={`text-label-sm transition-colors ${
                isCurrent ? 'text-pulse-text' :
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
