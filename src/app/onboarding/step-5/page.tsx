'use client'

/**
 * ONBOARDING STEP 5
 * -----------------
 * "Last step: Your preferences"
 * Certifications (unlocks eligibility categories), grant size, timeline
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { DollarSign, Calendar, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react'
import { useOnboarding } from '@/lib/contexts/OnboardingContext'
import { OnboardingLayout, OptionCard, OptionChip } from '@/components/onboarding'
import {
  GRANT_SIZE_PREFERENCES,
  TIMELINE_PREFERENCES,
  ONBOARDING_CERTIFICATIONS,
  GrantSizePreference,
  TimelinePreference,
} from '@/lib/types/onboarding'

export default function OnboardingStep5() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const {
    state,
    toggleCertification,
    setGrantPreference,
  } = useOnboarding()

  const handleComplete = async () => {
    setIsLoading(true)
    // Save profile to API before navigating
    try {
      await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: state.entityType,
          country: state.country,
          state: state.state,
          industryTags: state.industryTags,
          sizeBand: state.sizeBand,
          stage: state.stage,
          annualBudget: state.annualBudget,
          industryAttributes: {
            ...state.industryAttributes,
            goals: state.goals,
            certifications: state.certifications,
          },
          grantPreferences: state.grantPreferences,
          onboardingStep: 5,
          onboardingCompleted: true,
          organization: state.companyName || undefined,
        }),
      })
    } catch (error) {
      console.error('Error saving profile:', error)
    }
    router.push('/onboarding/complete')
  }

  const handleBack = () => {
    router.push('/onboarding/step-4')
  }

  const handleSkip = () => {
    setIsLoading(true)
    // Still save what we have
    fetch('/api/user/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        entityType: state.entityType,
        country: state.country,
        state: state.state,
        industryTags: state.industryTags,
        sizeBand: state.sizeBand,
        stage: state.stage,
        annualBudget: state.annualBudget,
        industryAttributes: {
          ...state.industryAttributes,
          goals: state.goals,
          certifications: state.certifications,
        },
        grantPreferences: state.grantPreferences,
        onboardingStep: 5,
        onboardingCompleted: true,
        organization: state.companyName || undefined,
      }),
    }).catch(console.error)

    setTimeout(() => {
      router.push('/onboarding/complete')
    }, 500)
  }

  const handleSkipAll = () => {
    router.push('/app')
  }

  return (
    <OnboardingLayout
      currentStep={5}
      showSkipAll
      onSkipAll={handleSkipAll}
    >
      {/* Step header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <span className="text-label text-pulse-accent mb-4 block">Step 05</span>
        <h1 className="text-display-section text-pulse-text mb-3">
          Your preferences
        </h1>
        <p className="text-body text-pulse-text-secondary">
          Help us prioritize grants that fit your needs.
        </p>
      </motion.div>

      <div className="space-y-10">
        {/* Certifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pulse-accent to-emerald-500 p-[1px]">
              <div className="w-full h-full rounded-xl bg-pulse-bg flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-pulse-accent" />
              </div>
            </div>
            <div>
              <h3 className="text-heading-sm text-pulse-text">Do any of these apply to you?</h3>
              <p className="text-body-sm text-pulse-text-tertiary">Optional, unlocks specialized grants</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {ONBOARDING_CERTIFICATIONS.map((cert) => (
              <OptionChip
                key={cert.value}
                label={cert.label}
                isSelected={state.certifications.includes(cert.value)}
                onClick={() => toggleCertification(cert.value)}
              />
            ))}
          </div>
        </motion.div>

        {/* Grant Size Preference */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-[1px]">
              <div className="w-full h-full rounded-xl bg-pulse-bg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <h3 className="text-heading-sm text-pulse-text">What grant sizes interest you most?</h3>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {GRANT_SIZE_PREFERENCES.map((pref) => (
              <OptionCard
                key={pref.value}
                label={pref.label}
                description={pref.description}
                isSelected={state.grantPreferences.preferredSize === pref.value}
                onClick={() => setGrantPreference('preferredSize', pref.value as GrantSizePreference)}
                size="compact"
              />
            ))}
          </div>
        </motion.div>

        {/* Timeline Preference */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 p-[1px]">
              <div className="w-full h-full rounded-xl bg-pulse-bg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-teal-400" />
              </div>
            </div>
            <div>
              <h3 className="text-heading-sm text-pulse-text">When do you need funding?</h3>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {TIMELINE_PREFERENCES.map((pref) => (
              <OptionCard
                key={pref.value}
                label={pref.label}
                description={pref.description}
                isSelected={state.grantPreferences.timeline === pref.value}
                onClick={() => setGrantPreference('timeline', pref.value as TimelinePreference)}
                size="compact"
              />
            ))}
          </div>
        </motion.div>
      </div>

      {/* Summary hint */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-10 p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05]"
      >
        <p className="text-body-sm text-pulse-text-secondary text-center">
          After completing setup, we&apos;ll show you grants tailored to your profile.
          You can adjust these preferences anytime in Settings.
        </p>
      </motion.div>

      {/* Custom finish button for last step */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-10 space-y-4"
      >
        <button
          onClick={handleComplete}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-5 px-8 rounded-xl bg-pulse-accent text-pulse-bg font-semibold text-lg hover:bg-pulse-accent/90 shadow-lg shadow-pulse-accent/25 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3"
              >
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Finding your grants...</span>
              </motion.div>
            ) : (
              <motion.div
                key="ready"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3"
              >
                <span>Complete Setup</span>
                <ArrowRight className="w-5 h-5" />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="text-body-sm text-pulse-text-tertiary hover:text-pulse-text-secondary transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleSkip}
            disabled={isLoading}
            className="text-body-sm text-pulse-text-tertiary hover:text-pulse-text-secondary transition-colors disabled:opacity-50"
          >
            Skip & Finish
          </button>
        </div>
      </motion.div>
    </OnboardingLayout>
  )
}
