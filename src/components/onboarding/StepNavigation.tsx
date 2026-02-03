'use client'

/**
 * STEP NAVIGATION - SPLIT SCREEN IMMERSIVE STYLE
 * ----------------------------------------------
 * Premium navigation with:
 * - Large prominent continue button with shadow
 * - Subtle back button
 * - Clean layout
 */

import { useEffect } from 'react'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StepNavigationProps {
  onBack?: () => void
  onContinue: () => void
  onSkip?: () => void
  canContinue?: boolean
  isFirstStep?: boolean
  isLastStep?: boolean
  isLoading?: boolean
  continueLabel?: string
  skipLabel?: string
}

export function StepNavigation({
  onBack,
  onContinue,
  onSkip,
  canContinue = true,
  isFirstStep = false,
  isLastStep = false,
  isLoading = false,
  continueLabel,
  skipLabel = 'Skip this step',
}: StepNavigationProps) {
  const defaultContinueLabel = isLastStep ? 'Complete Setup' : 'Continue'
  const label = continueLabel || defaultContinueLabel

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && canContinue && !isLoading) {
        e.preventDefault()
        onContinue()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [canContinue, isLoading, onContinue])

  return (
    <div className="flex items-center justify-between mt-10">
      {/* Left side: Back or Skip */}
      <div className="flex items-center gap-4">
        {!isFirstStep && onBack && (
          <button
            type="button"
            onClick={onBack}
            disabled={isLoading}
            className="flex items-center gap-2 text-sm text-pulse-text-tertiary hover:text-pulse-text-secondary transition-colors disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        )}

        {isFirstStep && onSkip && (
          <button
            type="button"
            onClick={onSkip}
            disabled={isLoading}
            className="text-sm text-pulse-text-tertiary hover:text-pulse-text-secondary transition-colors disabled:opacity-50"
          >
            {skipLabel} →
          </button>
        )}
      </div>

      {/* Right side: Continue */}
      <div className="flex items-center gap-4">
        {!isFirstStep && onSkip && (
          <button
            type="button"
            onClick={onSkip}
            disabled={isLoading}
            className="text-sm text-pulse-text-tertiary hover:text-pulse-text-secondary transition-colors disabled:opacity-50"
          >
            {skipLabel}
          </button>
        )}

        <button
          type="button"
          onClick={onContinue}
          disabled={!canContinue || isLoading}
          className={cn(
            'flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-lg transition-all',
            canContinue
              ? 'bg-pulse-accent text-pulse-bg hover:bg-pulse-accent/90 shadow-lg shadow-pulse-accent/25'
              : 'bg-white/[0.06] text-pulse-text-tertiary cursor-not-allowed',
            isLoading && 'opacity-70'
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <span>{label}</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
