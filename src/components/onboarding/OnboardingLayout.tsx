'use client'

/**
 * ONBOARDING LAYOUT - SPLIT SCREEN IMMERSIVE
 * ------------------------------------------
 * Premium split-screen design inspired by Linear/Notion
 * - Visual branding panel on left with animated gradients
 * - Content panel on right
 * - Progress indicator
 * - Mobile responsive
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

  // Parse headline for gradient text (middle line gets gradient)
  const headlineLines = displayHeadline.split('\n')

  return (
    <div className="min-h-screen bg-pulse-bg flex font-sans">
      {/* Left Panel - Visual Branding */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-pulse-accent/20 blur-[100px]"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 50, 0],
              y: [0, 30, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-emerald-500/15 blur-[80px]"
            animate={{
              scale: [1, 1.3, 1],
              x: [0, -30, 0],
              y: [0, -40, 0],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-[300px] h-[300px] rounded-full bg-violet-500/10 blur-[60px]"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />
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
              transition={{ delay: 0.2 }}
            >
              <h2 className="font-serif text-5xl text-pulse-text leading-tight mb-6">
                {headlineLines.map((line, i) => (
                  <span key={i}>
                    {i === 1 ? (
                      <span className="bg-gradient-to-r from-pulse-accent via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                        {line}
                      </span>
                    ) : (
                      line
                    )}
                    {i < headlineLines.length - 1 && <br />}
                  </span>
                ))}
              </h2>
              <p className="text-lg text-pulse-text-secondary max-w-md">
                {displaySubheadline}
              </p>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="flex gap-8 mt-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div>
                <div className="text-3xl font-bold text-pulse-text">20K+</div>
                <div className="text-sm text-pulse-text-tertiary">Active grants</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-pulse-accent">$12B+</div>
                <div className="text-sm text-pulse-text-tertiary">Total funding</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-pulse-text">94%</div>
                <div className="text-sm text-pulse-text-tertiary">Match accuracy</div>
              </div>
            </motion.div>
          </div>

          {/* Progress indicator */}
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
            <span className="ml-3 text-sm text-pulse-text-tertiary">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
        </div>
      </div>

      {/* Right Panel - Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <div className="lg:hidden p-6 border-b border-white/[0.06]">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <AnimatedLogo size="sm" className="text-pulse-accent" />
              <BrandLogo size="md" />
            </Link>
            {showSkipAll && onSkipAll && (
              <button
                onClick={onSkipAll}
                className="min-h-[44px] px-3 flex items-center text-sm text-pulse-text-tertiary hover:text-pulse-text-secondary active:text-pulse-text-secondary transition-colors"
                style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
              >
                Skip →
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

        {/* Mobile progress */}
        <div className="lg:hidden p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] border-t border-white/[0.06]">
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 rounded-full ${
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
