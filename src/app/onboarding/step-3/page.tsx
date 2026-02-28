'use client'

/**
 * ONBOARDING STEP 3
 * -----------------
 * "Tell us about your organization"
 * Organization size, stage, budget details
 */

import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, TrendingUp, DollarSign, Check } from 'lucide-react'
import { useOnboarding } from '@/lib/contexts/OnboardingContext'
import { OnboardingLayout, OptionCard, StepNavigation } from '@/components/onboarding'
import {
  SIZE_BANDS,
  STAGES,
  BUDGET_RANGES,
} from '@/lib/types/onboarding'

export default function OnboardingStep3() {
  const router = useRouter()
  const {
    state,
    setSizeBand,
    setStage,
    setBudget,
  } = useOnboarding()

  const handleContinue = () => {
    router.push('/onboarding/step-4')
  }

  const handleBack = () => {
    router.push('/onboarding/step-2')
  }

  const handleSkip = () => {
    router.push('/onboarding/step-4')
  }

  const handleSkipAll = () => {
    router.push('/app')
  }

  // Determine which questions to show based on entity type
  const showTeamSize = ['nonprofit', 'small_business', 'for_profit', 'educational', 'government'].includes(state.entityType || '')
  const showStage = ['nonprofit', 'small_business', 'for_profit', 'individual'].includes(state.entityType || '')
  const showBudget = ['nonprofit', 'small_business', 'for_profit', 'educational', 'government', 'tribal'].includes(state.entityType || '')
  const isIndividual = state.entityType === 'individual'

  return (
    <OnboardingLayout
      currentStep={3}
      showSkipAll
      onSkipAll={handleSkipAll}
    >
      {/* Step header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <span className="text-label text-pulse-accent mb-4 block">Step 03</span>
        <h1 className="text-display-section text-pulse-text mb-3">
          {isIndividual ? 'Tell us about your work' : 'Tell us about your organization'}
        </h1>
        <p className="text-body text-pulse-text-secondary">
          This helps match you with appropriately sized grants.
        </p>
      </motion.div>

      <div className="space-y-10">
        {/* Team/Organization Size */}
        <AnimatePresence>
          {showTeamSize && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 p-[1px]">
                  <div className="w-full h-full rounded-xl bg-pulse-bg flex items-center justify-center">
                    <Users className="w-5 h-5 text-teal-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-heading-sm text-pulse-text">
                    {isIndividual ? 'Do you work with a team?' : 'Organization size'}
                  </h3>
                  <p className="text-body-sm text-pulse-text-tertiary">Size affects grant eligibility</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {SIZE_BANDS.map((size) => (
                  <OptionCard
                    key={size.value}
                    label={size.label}
                    description={size.description}
                    isSelected={state.sizeBand === size.value}
                    onClick={() => setSizeBand(size.value)}
                    size="compact"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stage */}
        <AnimatePresence>
          {showStage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-[1px]">
                  <div className="w-full h-full rounded-xl bg-pulse-bg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-heading-sm text-pulse-text">
                    {isIndividual ? 'Where are you in your journey?' : 'Organization stage'}
                  </h3>
                  <p className="text-body-sm text-pulse-text-tertiary">Some grants target specific stages</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {STAGES.map((stage) => (
                  <OptionCard
                    key={stage.value}
                    label={stage.label}
                    description={stage.description}
                    isSelected={state.stage === stage.value}
                    onClick={() => setStage(stage.value)}
                    size="compact"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Budget */}
        <AnimatePresence>
          {showBudget && !isIndividual && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pulse-accent to-emerald-500 p-[1px]">
                  <div className="w-full h-full rounded-xl bg-pulse-bg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-pulse-accent" />
                  </div>
                </div>
                <div>
                  <h3 className="text-heading-sm text-pulse-text">Annual operating budget</h3>
                  <p className="text-body-sm text-pulse-text-tertiary">Helps match grant award sizes</p>
                </div>
              </div>

              <div className="space-y-2">
                {BUDGET_RANGES.map((budget) => (
                  <button
                    key={budget.value}
                    type="button"
                    onClick={() => setBudget(budget.value)}
                    className={`w-full text-left px-5 py-4 rounded-xl border transition-all duration-300 ${
                      state.annualBudget === budget.value
                        ? 'bg-pulse-accent/[0.06] border-pulse-accent/30'
                        : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-body font-medium ${
                        state.annualBudget === budget.value
                          ? 'text-pulse-text'
                          : 'text-pulse-text-secondary'
                      }`}>
                        {budget.label}
                      </span>

                      {state.annualBudget === budget.value && (
                        <div className="w-6 h-6 rounded-full bg-pulse-accent flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Individual - Affiliation */}
        <AnimatePresence>
          {isIndividual && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pulse-accent to-emerald-500 p-[1px]">
                  <div className="w-full h-full rounded-xl bg-pulse-bg flex items-center justify-center">
                    <Users className="w-5 h-5 text-pulse-accent" />
                  </div>
                </div>
                <div>
                  <h3 className="text-heading-sm text-pulse-text">Are you affiliated with an institution?</h3>
                  <p className="text-body-sm text-pulse-text-tertiary">Institutional backing affects eligibility</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <OptionCard
                  label="Independent"
                  description="Working on my own"
                  isSelected={state.industryAttributes.affiliation === 'independent'}
                  onClick={() => {}}
                  size="compact"
                />
                <OptionCard
                  label="Affiliated"
                  description="University, research center, etc."
                  isSelected={state.industryAttributes.affiliation === 'affiliated'}
                  onClick={() => {}}
                  size="compact"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
