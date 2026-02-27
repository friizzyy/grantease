'use client'

/**
 * ONBOARDING ENTRY PAGE
 * ---------------------
 * Let users choose between AI-powered smart setup or manual setup
 */

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Wand2,
  ChevronRight,
  Sparkles,
  Globe,
  Clock,
  Zap,
  PenLine,
  CheckCircle2,
} from 'lucide-react'
import { OnboardingLayout } from '@/components/onboarding'

export default function OnboardingIndexPage() {
  const router = useRouter()

  return (
    <OnboardingLayout
      currentStep={0}
      showSkipAll
      onSkipAll={() => router.push('/app')}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 text-center sm:text-left"
      >
        <div className="flex items-center justify-center sm:justify-start gap-2 text-pulse-accent mb-4">
          <Sparkles className="w-5 h-5" />
          <span className="text-sm font-medium uppercase tracking-wider">Welcome</span>
        </div>
        <h1 className="text-heading-lg font-bold tracking-tight text-pulse-text mb-3">
          Let&apos;s find your perfect grants
        </h1>
        <p className="text-body text-pulse-text-secondary">
          Choose how you&apos;d like to set up your profile. The more we know, the better we can match you with funding opportunities.
        </p>
      </motion.div>

      {/* Option cards */}
      <div className="space-y-4">
        {/* Smart AI Setup - Recommended */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <button
            onClick={() => router.push('/onboarding/smart')}
            className="w-full text-left p-6 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 hover:border-violet-500/40 transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 p-[1px] flex-shrink-0">
                <div className="w-full h-full rounded-xl bg-pulse-bg flex items-center justify-center group-hover:bg-violet-500/10 transition-colors">
                  <Wand2 className="w-6 h-6 text-violet-400" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-semibold text-pulse-text">Smart AI Setup</h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-violet-500/20 text-violet-300">
                    Recommended
                  </span>
                </div>
                <p className="text-pulse-text-secondary mb-4">
                  Paste your website URL or company name, and our AI will analyze your business to create a detailed profile automatically.
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-pulse-text-tertiary">
                  <span className="flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-violet-400" />
                    Website analysis
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-violet-400" />
                    Auto-fill profile
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-violet-400" />
                    ~2 minutes
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-pulse-text-tertiary group-hover:text-violet-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
            </div>
          </button>
        </motion.div>

        {/* Manual Setup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={() => router.push('/onboarding/step-1')}
            className="w-full text-left p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-500 to-slate-600 p-[1px] flex-shrink-0">
                <div className="w-full h-full rounded-xl bg-pulse-bg flex items-center justify-center group-hover:bg-white/[0.04] transition-colors">
                  <PenLine className="w-6 h-6 text-slate-400" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-semibold text-pulse-text mb-1">Manual Setup</h3>
                <p className="text-pulse-text-secondary mb-4">
                  Answer a few questions about your organization step by step. Best if you don&apos;t have a website.
                </p>
                <div className="flex flex-wrap gap-4 text-sm text-pulse-text-tertiary">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-slate-400" />
                    5 simple steps
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-400" />
                    ~5 minutes
                  </span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-pulse-text-tertiary group-hover:text-pulse-text-secondary group-hover:translate-x-1 transition-all flex-shrink-0" />
            </div>
          </button>
        </motion.div>

        {/* Quick Setup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <button
            onClick={() => router.push('/onboarding/quick')}
            className="w-full text-left p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-medium text-pulse-text">Quick Setup</h3>
                <p className="text-sm text-pulse-text-tertiary">
                  Just the basics in 60 seconds. You can add more details later.
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-pulse-text-tertiary group-hover:text-pulse-text-secondary group-hover:translate-x-1 transition-all flex-shrink-0" />
            </div>
          </button>
        </motion.div>
      </div>

      {/* Skip as text link, not button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-8 text-center"
      >
        <button
          onClick={() => router.push('/app')}
          className="text-sm text-pulse-text-tertiary hover:text-pulse-text-secondary transition-colors duration-150"
        >
          Skip for now and browse all grants
        </button>
      </motion.div>
    </OnboardingLayout>
  )
}
