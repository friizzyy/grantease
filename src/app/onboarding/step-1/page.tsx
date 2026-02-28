'use client'

/**
 * ONBOARDING STEP 1
 * -----------------
 * "What best describes you or your organization?"
 * Entity type selection + geography
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, MapPin } from 'lucide-react'
import { useOnboarding } from '@/lib/contexts/OnboardingContext'
import { OnboardingLayout, OptionCard, StepNavigation } from '@/components/onboarding'
import { ENTITY_TYPES, US_STATES, EntityType } from '@/lib/types/onboarding'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function OnboardingStep1() {
  const router = useRouter()
  const {
    state,
    setEntityType,
    setGeography,
    canProceed,
  } = useOnboarding()

  const [showGeography, setShowGeography] = useState(state.entityType !== null)

  const handleEntitySelect = (entityType: EntityType) => {
    setEntityType(entityType)
    setShowGeography(true)
  }

  const handleContinue = () => {
    if (canProceed()) {
      router.push('/onboarding/step-2')
    }
  }

  const handleSkipAll = () => {
    router.push('/app')
  }

  return (
    <OnboardingLayout
      currentStep={1}
      showSkipAll
      onSkipAll={handleSkipAll}
    >
      {/* Step header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <span className="text-label text-pulse-accent mb-4 block">Step 01</span>
        <h1 className="text-display-section text-pulse-text mb-3">
          What best describes you?
        </h1>
        <p className="text-body text-pulse-text-secondary">
          Select the option that fits your organization type.
        </p>
      </motion.div>

      {/* Entity type selection */}
      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        {ENTITY_TYPES.map((entity, index) => (
          <motion.div
            key={entity.value}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
          >
            <OptionCard
              id={entity.value}
              label={entity.label}
              description={entity.description}
              icon={entity.icon}
              isSelected={state.entityType === entity.value}
              onClick={() => handleEntitySelect(entity.value)}
            />
          </motion.div>
        ))}
      </div>

      {/* Geography selection */}
      <AnimatePresence>
        {showGeography && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-10 overflow-hidden"
          >
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-[1px]">
                  <div className="w-full h-full rounded-xl bg-pulse-bg flex items-center justify-center">
                    <Globe className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-heading-sm text-pulse-text">Where are you based?</h3>
                  <p className="text-body-sm text-pulse-text-tertiary">Many grants are region-specific</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Country */}
                <div>
                  <label className="flex items-center gap-2 text-label-sm text-pulse-text-tertiary mb-2">
                    <Globe className="w-3 h-3" />
                    Country
                  </label>
                  <Select
                    value={state.country}
                    onValueChange={(value) => setGeography(value, state.state)}
                  >
                    <SelectTrigger className="w-full h-12 bg-white/[0.04] border-white/[0.08] hover:border-white/[0.15] transition-colors rounded-xl">
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* State (US only) */}
                <AnimatePresence>
                  {state.country === 'US' && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                    >
                      <label className="flex items-center gap-2 text-label-sm text-pulse-text-tertiary mb-2">
                        <MapPin className="w-3 h-3" />
                        State
                      </label>
                      <Select
                        value={state.state || ''}
                        onValueChange={(value) => setGeography(state.country, value)}
                      >
                        <SelectTrigger className="w-full h-12 bg-white/[0.04] border-white/[0.08] hover:border-white/[0.15] transition-colors rounded-xl">
                          <SelectValue placeholder="Select state" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[280px]">
                          {US_STATES.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <StepNavigation
        isFirstStep
        canContinue={canProceed()}
        onContinue={handleContinue}
        onSkip={handleSkipAll}
        skipLabel="Skip setup"
      />
    </OnboardingLayout>
  )
}
