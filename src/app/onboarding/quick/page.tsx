'use client'

/**
 * QUICK-START ONBOARDING
 * ----------------------
 * 60-second onboarding flow for users who want grants FAST
 * Collects only the essential information needed for basic matching
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap,
  ArrowRight,
  Building2,
  MapPin,
  Target,
  Check,
  Loader2,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ENTITY_TYPES, US_STATES, INDUSTRY_CATEGORIES, EntityType } from '@/lib/types/onboarding'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Simplified entity types for quick selection
const QUICK_ENTITY_TYPES = ENTITY_TYPES.slice(0, 6) // First 6 most common

// Top industry categories
const QUICK_INDUSTRIES = INDUSTRY_CATEGORIES.slice(0, 8) // First 8 most popular

export default function QuickOnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [entityType, setEntityType] = useState<EntityType | null>(null)
  const [state, setState] = useState<string>('')
  const [industries, setIndustries] = useState<string[]>([])

  const totalSteps = 3
  const progress = (step / totalSteps) * 100

  const canProceed = () => {
    switch (step) {
      case 1:
        return entityType !== null
      case 2:
        return state !== ''
      case 3:
        return industries.length > 0
      default:
        return false
    }
  }

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const handleIndustryToggle = (value: string) => {
    setIndustries((prev) =>
      prev.includes(value)
        ? prev.filter((i) => i !== value)
        : prev.length < 3
        ? [...prev, value]
        : prev
    )
  }

  const handleSubmit = async () => {
    if (!entityType || !state || industries.length === 0) {
      setError('Please complete all fields')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType,
          country: 'US',
          state,
          industryTags: industries,
          onboardingStep: 5,
          onboardingCompleted: true,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save profile')
      }

      // Navigate to discover page
      router.push('/app/discover')
    } catch (err) {
      console.error('Error saving profile:', err)
      setError('Failed to save your profile. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-pulse-bg flex flex-col font-sans">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-pulse-accent/[0.08] blur-[100px]" />
        <div className="absolute bottom-1/3 left-1/3 w-[300px] h-[300px] rounded-full bg-emerald-500/[0.05] blur-[80px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 border-b border-white/[0.06]">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-pulse-accent flex items-center justify-center">
              <Zap className="w-5 h-5 text-pulse-bg" />
            </div>
            <span className="font-bold text-pulse-text">Quick Start</span>
          </Link>
          <div className="flex items-center gap-2 text-sm text-pulse-text-tertiary">
            <Clock className="w-4 h-4" />
            <span>~60 seconds</span>
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="relative z-10 w-full h-1 bg-pulse-border">
        <motion.div
          className="h-full bg-pulse-accent"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {/* Step 1: Organization Type */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-8">
                  <div className="w-12 h-12 rounded-xl bg-pulse-accent/20 flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-6 h-6 text-pulse-accent" />
                  </div>
                  <h1 className="text-2xl font-serif text-pulse-text mb-2">
                    What type of organization?
                  </h1>
                  <p className="text-pulse-text-secondary">
                    Select the option that best describes you
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-8">
                  {QUICK_ENTITY_TYPES.map((entity) => (
                    <button
                      key={entity.value}
                      onClick={() => setEntityType(entity.value)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        entityType === entity.value
                          ? 'bg-pulse-accent/10 border-pulse-accent text-pulse-text'
                          : 'bg-white/[0.02] border-white/[0.06] text-pulse-text-secondary hover:border-white/[0.12]'
                      }`}
                    >
                      <div className="text-lg mb-1">{entity.icon}</div>
                      <div className="text-sm font-medium">{entity.label}</div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Location */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-8">
                  <div className="w-12 h-12 rounded-xl bg-pulse-accent/20 flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-6 h-6 text-pulse-accent" />
                  </div>
                  <h1 className="text-2xl font-serif text-pulse-text mb-2">
                    Where are you based?
                  </h1>
                  <p className="text-pulse-text-secondary">
                    Many grants are region-specific
                  </p>
                </div>

                <Select value={state} onValueChange={setState}>
                  <SelectTrigger className="w-full h-14 bg-white/[0.04] border-white/[0.08] hover:border-white/[0.15] transition-colors rounded-xl text-lg">
                    <SelectValue placeholder="Select your state" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {US_STATES.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
            )}

            {/* Step 3: Focus Areas */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="text-center mb-8">
                  <div className="w-12 h-12 rounded-xl bg-pulse-accent/20 flex items-center justify-center mx-auto mb-4">
                    <Target className="w-6 h-6 text-pulse-accent" />
                  </div>
                  <h1 className="text-2xl font-serif text-pulse-text mb-2">
                    What do you focus on?
                  </h1>
                  <p className="text-pulse-text-secondary">
                    Select up to 3 focus areas
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-8">
                  {QUICK_INDUSTRIES.map((industry) => {
                    const isSelected = industries.includes(industry.value)
                    const isDisabled = industries.length >= 3 && !isSelected

                    return (
                      <button
                        key={industry.value}
                        onClick={() => handleIndustryToggle(industry.value)}
                        disabled={isDisabled}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-pulse-accent/10 border-pulse-accent text-pulse-text'
                            : isDisabled
                            ? 'bg-white/[0.01] border-white/[0.04] text-pulse-text-tertiary cursor-not-allowed'
                            : 'bg-white/[0.02] border-white/[0.06] text-pulse-text-secondary hover:border-white/[0.12]'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="text-lg mb-1">{industry.icon}</div>
                          {isSelected && (
                            <Check className="w-4 h-4 text-pulse-accent" />
                          )}
                        </div>
                        <div className="text-sm font-medium">{industry.label}</div>
                      </button>
                    )
                  })}
                </div>

                {industries.length > 0 && (
                  <div className="text-center text-sm text-pulse-text-tertiary mb-4">
                    {industries.length}/3 selected
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            {step > 1 ? (
              <Button variant="ghost" onClick={handleBack}>
                Back
              </Button>
            ) : (
              <Link href="/onboarding/step-1">
                <Button variant="ghost">
                  Full Setup
                </Button>
              </Link>
            )}

            {step < totalSteps ? (
              <Button onClick={handleNext} disabled={!canProceed()}>
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || isSubmitting}
                className="min-w-[140px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Find Grants
                    <Zap className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mt-8">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  s === step
                    ? 'w-8 bg-pulse-accent'
                    : s < step
                    ? 'w-4 bg-pulse-accent/50'
                    : 'w-3 bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 p-6 text-center">
        <p className="text-xs text-pulse-text-tertiary">
          Want more personalized matches?{' '}
          <Link href="/onboarding/step-1" className="text-pulse-accent hover:underline">
            Complete full setup
          </Link>
        </p>
      </footer>
    </div>
  )
}
