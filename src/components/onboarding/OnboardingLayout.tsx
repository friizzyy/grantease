'use client'

/**
 * ONBOARDING LAYOUT - SPLIT SCREEN IMMERSIVE
 * ------------------------------------------
 * Premium split-screen design inspired by Linear/Notion
 * - Visual branding panel on left with subtle ambient background
 * - Content panel on right
 * - Smooth animated progress bar (mint)
 * - Mobile responsive with focused full-screen layout
 */

import { ReactNode } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { AnimatedLogo } from '@/components/ui/animated-logo'
import { BrandLogo } from '@/components/ui/brand-logo'

interface OnboardingLayoutProps {
  children: ReactNode
  currentStep: number
  totalSteps?: number
  showSkipAll?: boolean
  onSkipAll?: () => void
  headline?: string
  subheadline?: string
}

const STEP_HEADLINES: Record<number, { headline: string; subheadline: string }> = {
  1: {
    headline: "Let's find the\nperfect grants\nfor you.",
    subheadline: "Answer a few quick questions and we'll match you with funding opportunities tailored to your needs.",
  },
  2: {
    headline: "What areas\ndo you\nwork in?",
    subheadline: "Select the industries and causes that align with your mission. This helps us find relevant grants.",
  },
  3: {
    headline: "Tell us about\nyour\norganization.",
    subheadline: "Organization details help match you with grants designed for your size and stage.",
  },
  4: {
    headline: "A few more\nquick\nquestions.",
    subheadline: "These details help us understand your specific needs and priorities.",
  },
  5: {
    headline: "Almost there!\nSet your\npreferences.",
    subheadline: "Tell us what you're looking for and we'll prioritize the best matches.",
  },
}

export function OnboardingLayout({
  children,
  currentStep,
  totalSteps = 5,
  showSkipAll = false,
  onSkipAll,
  headline,
  subheadline,
}: OnboardingLayoutProps) {
  const stepContent = STEP_HEADLINES[currentStep] || STEP_HEADLINES[1]
  const displayHeadline = headline || stepContent.headline
  const displaySubheadline = subheadline || stepContent.subheadline

  // Parse headline for accent text (middle line gets accent color)
  const headlineLines = displayHeadline.split('\n')

  // Progress percentage for the smooth bar
  const progressPercent = currentStep > 0
    ? ((currentStep) / totalSteps) * 100
    : 0

  return (
    <div className="min-h-screen bg-pulse-bg flex flex-col lg:flex-row font-sans">
      {/* Mobile: Top progress bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50">
        <div className="h-1 bg-pulse-surface rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-pulse-accent rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Left Panel - Visual Branding */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden">
        {/* Subtle ambient background -- no floating orbs */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[10%] w-[700px] h-[500px] rounded-full bg-pulse-accent/[0.04] blur-[160px]" />
          <div className="absolute bottom-[-10%] right-[5%] w-[500px] h-[400px] rounded-full bg-emerald-500/[0.025] blur-[130px]" />
        </div>

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(to right, white 1px, transparent 1px),
                              linear-gradient(to bottom, white 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <AnimatedLogo size="lg" className="text-pulse-accent" />
            <BrandLogo size="xl" />
          </Link>

          {/* Center content */}
          <div className="flex-1 flex flex-col justify-center">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <h2 className="text-display-section text-pulse-text leading-tight mb-6">
                {headlineLines.map((line, i) => (
                  <span key={i}>
                    {i === 1 ? (
                      <span className="text-pulse-text-secondary italic">
                        {line}
                      </span>
                    ) : (
                      line
                    )}
                    {i < headlineLines.length - 1 && <br />}
                  </span>
                ))}
              </h2>
              <p className="text-body-lg text-pulse-text-secondary max-w-md">
                {displaySubheadline}
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="flex gap-8 mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <div>
                <div className="text-stat-sm text-pulse-accent tabular-nums">20K+</div>
                <div className="text-label-sm text-pulse-text-tertiary mt-1">Active grants</div>
              </div>
              <div>
                <div className="text-stat-sm text-pulse-accent tabular-nums">$12B+</div>
                <div className="text-label-sm text-pulse-text-tertiary mt-1">Total funding</div>
              </div>
              <div>
                <div className="text-stat-sm text-pulse-text tabular-nums">94%</div>
                <div className="text-label-sm text-pulse-text-tertiary mt-1">Match accuracy</div>
              </div>
            </motion.div>
          </div>

          {/* Desktop: Smooth animated progress bar at bottom */}
          <div>
            <div className="h-1 bg-pulse-surface rounded-full overflow-hidden mb-3">
              <motion.div
                className="h-full bg-pulse-accent rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i + 1 === currentStep
                        ? 'w-8 bg-pulse-accent'
                        : i + 1 < currentStep
                        ? 'w-4 bg-pulse-accent/50'
                        : 'w-3 bg-white/10'
                    }`}
                  />
                ))}
              </div>
              <span className="text-label-sm text-pulse-text-tertiary">
                {currentStep > 0 ? `Step ${currentStep} of ${totalSteps}` : 'Welcome'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <div className="lg:hidden p-6 pt-4 border-b border-white/[0.04]">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <AnimatedLogo size="sm" className="text-pulse-accent" />
              <BrandLogo size="md" />
            </Link>
            {showSkipAll && onSkipAll && (
              <button
                onClick={onSkipAll}
                className="text-body-sm text-pulse-text-tertiary hover:text-pulse-text-secondary transition-colors"
              >
                Skip for now
              </button>
            )}
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col justify-center px-6 py-8 lg:px-16 lg:py-12 overflow-y-auto">
          <div className="max-w-2xl mx-auto w-full">
            {children}
          </div>
        </div>

        {/* Mobile progress -- step dots */}
        <div className="lg:hidden p-6 border-t border-white/[0.04]">
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i + 1 === currentStep
                    ? 'w-8 bg-pulse-accent'
                    : i + 1 < currentStep
                    ? 'w-4 bg-pulse-accent/50'
                    : 'w-2 bg-white/10'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
