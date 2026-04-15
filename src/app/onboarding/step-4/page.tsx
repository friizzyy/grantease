'use client'

/**
 * ONBOARDING STEP 4
 * -----------------
 * "What do you need funding for?"
 * Primary: Funding goals (maps to GOALS_TO_PURPOSE for scoring — +15 points)
 * Secondary: Industry-specific questions (max 2) if relevant
 */

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Target, Check } from 'lucide-react'
import { useOnboarding } from '@/lib/contexts/OnboardingContext'
import { OnboardingLayout, OptionChip, StepNavigation } from '@/components/onboarding'
import { FUNDING_GOALS, INDUSTRY_QUESTIONS } from '@/lib/types/onboarding'

export default function OnboardingStep4() {
  const router = useRouter()
  const {
    state,
    toggleGoal,
    setIndustryAttribute,
    canProceed,
  } = useOnboarding()

  // Get relevant industry questions (max 2, down from 3)
  const relevantQuestions = useMemo(() => {
    return INDUSTRY_QUESTIONS.filter(q =>
      q.appliesTo.some(industry => state.industryTags.includes(industry))
    ).slice(0, 2)
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
        <span className="text-label text-pulse-accent mb-4 block">Step 04</span>
        <h1 className="text-display-section text-pulse-text mb-3">
          What do you need funding for?
        </h1>
        <p className="text-body text-pulse-text-secondary">
          Select up to 5 goals. This is the most important factor for finding relevant grants.
        </p>
      </motion.div>

      <div className="space-y-8">
        {/* Primary: Funding Goals */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pulse-accent to-emerald-500 p-[1px]">
              <div className="w-full h-full rounded-xl bg-pulse-bg flex items-center justify-center">
                <Target className="w-5 h-5 text-pulse-accent" />
              </div>
            </div>
            <div>
              <h3 className="text-heading-sm text-pulse-text">Funding goals</h3>
              <p className="text-body-sm text-pulse-text-tertiary">
                {state.goals.length > 0
                  ? `${state.goals.length} of 5 selected`
                  : 'Select at least 1'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {FUNDING_GOALS.map((goal) => (
              <OptionChip
                key={goal.value}
                label={goal.label}
                icon={goal.icon}
                isSelected={state.goals.includes(goal.value)}
                onClick={() => toggleGoal(goal.value)}
                disabled={!state.goals.includes(goal.value) && state.goals.length >= 5}
              />
            ))}
          </div>
        </motion.div>

        {/* Secondary: Industry-specific questions (if any) */}
        {relevantQuestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="border-t border-white/[0.05] pt-8">
              <p className="text-label-sm text-pulse-text-tertiary mb-6 uppercase tracking-wider">
                Additional details for your industries
              </p>

              <div className="space-y-6">
                {relevantQuestions.map((question, index) => (
                  <motion.div
                    key={question.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + index * 0.1 }}
                    className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.05]"
                  >
                    <h3 className="text-heading-sm text-pulse-text mb-5">
                      {question.question}
                    </h3>

                    {/* Boolean question */}
                    {question.type === 'boolean' && (
                      <div className="flex gap-4">
                        <button
                          type="button"
                          onClick={() => handleBooleanToggle(question.id, true)}
                          className={`flex-1 px-5 py-4 rounded-xl border transition-all duration-300 ${
                            state.industryAttributes[question.id] === true
                              ? 'bg-pulse-accent/[0.06] border-pulse-accent/30'
                              : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04]'
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
                          className={`flex-1 px-5 py-4 rounded-xl border transition-all duration-300 ${
                            state.industryAttributes[question.id] === false
                              ? 'bg-pulse-accent/[0.06] border-pulse-accent/30'
                              : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04]'
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
            </div>
          </motion.div>
        )}
      </div>

      {/* Hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center text-body-sm text-pulse-text-tertiary"
      >
        Industry-specific questions are optional. Goals are used for grant matching.
      </motion.p>

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
