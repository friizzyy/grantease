'use client'

/**
 * ONBOARDING STEP 2
 * -----------------
 * "What areas does your work focus on?"
 * Industry tag selection with chip UI
 */

import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, Lightbulb } from 'lucide-react'
import { useOnboarding } from '@/lib/contexts/OnboardingContext'
import { OnboardingLayout, OptionChip, StepNavigation } from '@/components/onboarding'
import { INDUSTRY_CATEGORIES } from '@/lib/types/onboarding'

const MAX_SELECTIONS = 5

export default function OnboardingStep2() {
  const router = useRouter()
  const {
    state,
    toggleIndustryTag,
    canProceed,
  } = useOnboarding()

  const isMaxSelected = state.industryTags.length >= MAX_SELECTIONS
  const selectionCount = state.industryTags.length

  const handleToggle = (tag: string) => {
    if (state.industryTags.includes(tag)) {
      toggleIndustryTag(tag)
      return
    }
    if (isMaxSelected) return
    toggleIndustryTag(tag)
  }

  const handleContinue = () => {
    if (canProceed()) {
      router.push('/onboarding/step-3')
    }
  }

  const handleBack = () => {
    router.push('/onboarding/step-1')
  }

  const handleSkip = () => {
    router.push('/onboarding/step-3')
  }

  const handleSkipAll = () => {
    router.push('/app')
  }

  // Get contextual tip based on entity type
  const getEntityTip = () => {
    switch (state.entityType) {
      case 'nonprofit':
        return 'Many nonprofit grants span multiple areas. Select your primary focus first.'
      case 'small_business':
        return 'Small business grants often focus on technology, innovation, and workforce development.'
      case 'educational':
        return 'Educational institutions can access grants across research, community, and specific subject areas.'
      case 'individual':
        return 'Individual grants are often tied to specific fields like arts, research, or community service.'
      default:
        return 'Select the areas that align with your organization\'s primary mission.'
    }
  }

  return (
    <OnboardingLayout
      currentStep={2}
      showSkipAll
      onSkipAll={handleSkipAll}
    >
      {/* Step header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <span className="text-label text-pulse-accent mb-4 block">Step 02</span>
        <h1 className="text-display-section text-pulse-text mb-3">
          What areas does your work focus on?
        </h1>
        <p className="text-body text-pulse-text-secondary">
          Select up to {MAX_SELECTIONS} areas that best describe your focus.
        </p>
      </motion.div>

      {/* Selection counter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.05]"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex gap-1.5">
              {[...Array(MAX_SELECTIONS)].map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    i < selectionCount
                      ? 'bg-pulse-accent scale-100'
                      : 'bg-white/[0.1] scale-90'
                  }`}
                />
              ))}
            </div>
            <span className="text-body-sm text-pulse-text-secondary">
              <span className="text-pulse-text font-semibold">{selectionCount}</span> of {MAX_SELECTIONS} selected
            </span>
          </div>

          <AnimatePresence>
            {isMaxSelected && (
              <motion.span
                className="flex items-center gap-1.5 text-body-sm text-pulse-accent"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                <AlertCircle className="w-4 h-4" />
                Maximum reached
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Industry selection grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-3 justify-center"
      >
        {INDUSTRY_CATEGORIES.map((industry, index) => {
          const isSelected = state.industryTags.includes(industry.value)
          const isDisabled = !isSelected && isMaxSelected

          return (
            <motion.div
              key={industry.value}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.02 }}
            >
              <OptionChip
                label={industry.label}
                icon={industry.icon}
                isSelected={isSelected}
                disabled={isDisabled}
                onClick={() => handleToggle(industry.value)}
              />
            </motion.div>
          )
        })}
      </motion.div>

      {/* Contextual tip -- standardized to brand colors */}
      <AnimatePresence>
        {state.entityType && (
          <motion.div
            className="mt-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: 0.3 }}
          >
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pulse-accent to-emerald-500 p-[1px] shrink-0">
                  <div className="w-full h-full rounded-xl bg-pulse-bg flex items-center justify-center">
                    <Lightbulb className="w-5 h-5 text-pulse-accent" />
                  </div>
                </div>
                <div>
                  <p className="text-label-sm text-pulse-accent mb-1">Pro Tip</p>
                  <p className="text-body-sm text-pulse-text-secondary leading-relaxed">
                    {getEntityTip()}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <StepNavigation
        canContinue={canProceed()}
        onContinue={handleContinue}
        onBack={handleBack}
        onSkip={handleSkip}
      />
    </OnboardingLayout>
  )
}
