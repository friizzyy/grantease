'use client'

/**
 * ONBOARDING STEP 4 - SPLIT SCREEN IMMERSIVE
 * ------------------------------------------
 * "A few more details"
 * Premium split-screen design with dynamic questions
 */

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Check, ChevronRight, HelpCircle } from 'lucide-react'
import { useOnboarding } from '@/lib/contexts/OnboardingContext'
import { OnboardingLayout, OptionChip, StepNavigation } from '@/components/onboarding'
import { INDUSTRY_QUESTIONS } from '@/lib/types/onboarding'

export default function OnboardingStep4() {
  const router = useRouter()
  const {
    state,
    setIndustryAttribute,
  } = useOnboarding()

  // Get relevant questions based on selected industries
  const relevantQuestions = useMemo(() => {
    return INDUSTRY_QUESTIONS.filter(q =>
      q.appliesTo.some(industry => state.industryTags.includes(industry))
    ).slice(0, 3) // Max 3 questions
  }, [state.industryTags])

  const handleToggleOption = (questionId: string, optionValue: string, isMulti: boolean) => {
    const currentValue = state.industryAttributes[questionId]

    if (isMulti) {
      const currentArray = Array.isArray(currentValue) ? currentValue : []
      const newValue = currentArray.includes(optionValue)
        ? currentArray.filter(v => v !== optionValue)
        : [...currentArray, optionValue]
      setIndustryAttribute(questionId, newValue)
    } else {
      setIndustryAttribute(questionId, optionValue)
    }
  }

  const handleBooleanToggle = (questionId: string, value: boolean) => {
    setIndustryAttribute(questionId, value)
  }

  const isOptionSelected = (questionId: string, optionValue: string): boolean => {
    const currentValue = state.industryAttributes[questionId]
    if (Array.isArray(currentValue)) {
      return currentValue.includes(optionValue)
    }
    return currentValue === optionValue
  }

  const handleContinue = () => {
    router.push('/onboarding/step-5')
  }

  const handleBack = () => {
    router.push('/onboarding/step-3')
  }

  const handleSkip = () => {
    router.push('/onboarding/step-5')
  }

  const handleSkipAll = () => {
    router.push('/app')
  }

  // If no relevant questions, show empty state
  if (relevantQuestions.length === 0) {
    return (
      <OnboardingLayout
        currentStep={4}
        showSkipAll
        onSkipAll={handleSkipAll}
      >
        <div className="text-center py-12">
          {/* Success icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="relative w-24 h-24 mx-auto mb-8"
          >
            <div className="absolute inset-0 bg-pulse-accent/20 rounded-full blur-xl" />
            <div className="relative w-full h-full rounded-full bg-gradient-to-br from-pulse-accent to-emerald-500 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-serif text-3xl sm:text-4xl text-pulse-text mb-4"
          >
            Looking good!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-pulse-text-secondary max-w-md mx-auto mb-10"
          >
            We have enough information to find great grants for you. Let's finish up with a few preferences.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <button
              onClick={handleContinue}
              className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-pulse-accent text-pulse-bg font-semibold text-lg hover:bg-pulse-accent/90 shadow-lg shadow-pulse-accent/25 transition-all"
            >
              <span>Continue to Preferences</span>
              <ChevronRight className="w-5 h-5" />
            </button>

            <button
              onClick={handleBack}
              className="block mx-auto mt-6 text-sm text-pulse-text-tertiary hover:text-pulse-text-secondary transition-colors"
            >
              Go back
            </button>
          </motion.div>
        </div>
      </OnboardingLayout>
    )
  }

  return (
    <OnboardingLayout
      currentStep={4}
      showSkipAll
      onSkipAll={handleSkipAll}
    >
      {/* Step header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <div className="flex items-center gap-2 text-pulse-accent mb-4">
          <HelpCircle className="w-5 h-5" />
          <span className="text-sm font-medium uppercase tracking-wider">Additional Details</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-pulse-text mb-3">
          A few more details
        </h1>
        <p className="text-lg text-pulse-text-secondary">
          These help us fine-tune your grant recommendations.
        </p>
      </motion.div>

      {/* Dynamic questions */}
      <div className="space-y-6">
        {relevantQuestions.map((question, index) => (
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.1 }}
            className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]"
          >
            <h3 className="text-lg font-semibold text-pulse-text mb-5">
              {question.question}
            </h3>

            {/* Boolean question */}
            {question.type === 'boolean' && (
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => handleBooleanToggle(question.id, true)}
                  className={`flex-1 px-5 py-4 rounded-xl border-2 transition-all duration-300 ${
                    state.industryAttributes[question.id] === true
                      ? 'bg-pulse-accent/[0.08] border-pulse-accent/40'
                      : 'bg-white/[0.02] border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.04]'
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    {state.industryAttributes[question.id] === true && (
                      <div className="w-5 h-5 rounded-full bg-pulse-accent flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </div>
                    )}
                    <span className={state.industryAttributes[question.id] === true ? 'text-pulse-text font-semibold' : 'text-pulse-text-secondary'}>
                      Yes
                    </span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleBooleanToggle(question.id, false)}
                  className={`flex-1 px-5 py-4 rounded-xl border-2 transition-all duration-300 ${
                    state.industryAttributes[question.id] === false
                      ? 'bg-pulse-accent/[0.08] border-pulse-accent/40'
                      : 'bg-white/[0.02] border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.04]'
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    {state.industryAttributes[question.id] === false && (
                      <div className="w-5 h-5 rounded-full bg-pulse-accent flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" strokeWidth={3} />
                      </div>
                    )}
                    <span className={state.industryAttributes[question.id] === false ? 'text-pulse-text font-semibold' : 'text-pulse-text-secondary'}>
                      No
                    </span>
                  </span>
                </button>
              </div>
            )}

            {/* Multi-select or single-select options */}
            {(question.type === 'multi' || question.type === 'single') && question.options && (
              <div className="flex flex-wrap gap-3">
                {question.options.map((option) => (
                  <OptionChip
                    key={option.value}
                    label={option.label}
                    isSelected={isOptionSelected(question.id, option.value)}
                    onClick={() => handleToggleOption(question.id, option.value, question.type === 'multi')}
                  />
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center text-sm text-pulse-text-tertiary"
      >
        All questions are optional. Skip if none apply to you.
      </motion.p>

      {/* Navigation */}
      <StepNavigation
        canContinue
        onContinue={handleContinue}
        onBack={handleBack}
        onSkip={handleSkip}
      />
    </OnboardingLayout>
  )
}
