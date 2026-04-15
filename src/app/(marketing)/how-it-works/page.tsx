'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Search,
  BookOpen,
  PenLine,
  Send,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import { SectionIntro } from '@/components/marketing/SectionIntro'
import { AnimatedStatsBar } from '@/components/marketing/AnimatedStatsBar'
import { MiniSearchDemo } from '@/components/marketing/MiniSearchDemo'
import { EligibilityBreakdown } from '@/components/marketing/EligibilityBreakdown'
import { AIWritingSimulator } from '@/components/marketing/AIWritingSimulator'
import { SubmissionTracker } from '@/components/marketing/SubmissionTracker'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { fadeIn } from '@/lib/motion/marketing-animations'

export default function HowItWorksPage() {
  const { m } = useReducedMotion()

  const steps = [
    {
      icon: Search,
      title: 'Find your matches',
      desc: 'Tell us about your organization. Our AI searches 20,000+ grants from federal, state, and private sources. You see only the grants you qualify for.',
      bullets: [
        'AI checks your profile against every requirement',
        'Filter by amount, deadline, or difficulty',
        'Save promising grants for later',
      ],
      color: 'accent' as const,
    },
    {
      icon: BookOpen,
      title: 'Understand before you apply',
      desc: 'Every grant explained in plain English. See what it funds, who qualifies, what documents you need, and how much effort it takes.',
      bullets: [
        'Plain English summary of requirements',
        'Detailed eligibility breakdown',
        'Estimated time to complete',
      ],
      color: 'accent' as const,
    },
    {
      icon: PenLine,
      title: 'Write with AI assistance',
      desc: 'Our AI helps you craft each section. Your vault auto-fills basic info so you never retype your EIN, address, or mission statement.',
      bullets: [
        'Section-by-section guidance',
        'AI drafts you edit and refine',
        'Vault auto-fills 90% of basics',
      ],
      color: 'rose' as const,
      callout: 'Professional applications without a $5,000 consultant. Our AI helps you sound professional while keeping your authentic voice.',
    },
    {
      icon: Send,
      title: 'Submit and track',
      desc: 'Review your complete application before submitting. Track status, deadlines, and follow-ups all in one place.',
      bullets: [
        'Complete application preview',
        'Deadline reminders',
        'Status tracking dashboard',
      ],
      color: 'accent' as const,
    },
  ]

  const colorMap = {
    accent: { bg: 'bg-pulse-accent/10', text: 'text-pulse-accent', card: 'card-glass-accent', border: 'border-pulse-accent/20', badge: 'bg-pulse-accent text-pulse-bg' },
    rose: { bg: 'bg-pulse-rose-dim', text: 'text-pulse-rose', card: 'card-glass-rose', border: 'border-pulse-rose/20', badge: 'bg-pulse-rose text-pulse-bg' },
    indigo: { bg: 'bg-pulse-indigo-dim', text: 'text-pulse-indigo', card: 'card-glass-indigo', border: 'border-pulse-indigo/20', badge: 'bg-pulse-indigo text-pulse-bg' },
  }

  return (
    <main className="pt-[60px]">
      {/* ─── HERO ─── */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 lg:pt-32 pb-16 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[20%] w-[600px] h-[500px] rounded-full bg-pulse-indigo/[0.04] blur-[180px]" />
          <div className="absolute bottom-[0%] right-[10%] w-[400px] h-[400px] rounded-full bg-pulse-accent/[0.03] blur-[140px]" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pulse-indigo/[0.12] border border-pulse-indigo/15 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-pulse-indigo" />
              <span className="text-caption font-medium text-pulse-indigo">4-Step Process</span>
            </div>

            <h1 className="text-display-hero text-pulse-text mb-5">
              From search to{' '}
              <span className="text-gradient italic">funded.</span>
            </h1>

            <div className="h-px w-16 mx-auto bg-gradient-to-r from-transparent via-pulse-accent/40 to-transparent mb-6" />

            <p className="text-body-lg text-pulse-text-secondary max-w-lg mx-auto">
              Four steps from discovery to funded application.
              No grant writing experience needed.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ---- STATS BAR ---- */}
      <div className="relative bg-pulse-surface/30">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <motion.section
          className="px-4 sm:px-6 lg:px-8 py-12 sm:py-14"
          {...m(fadeIn)}
        >
          <div className="max-w-5xl mx-auto">
            <AnimatedStatsBar />
          </div>
        </motion.section>
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>

      {/* ---- STEPS: Alternating layout ---- */}
      <div className="px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="max-w-5xl mx-auto space-y-16 sm:space-y-20">
          {steps.map((step, i) => {
            const Icon = step.icon
            const colors = colorMap[step.color]
            const isReversed = i % 2 === 1

            return (
              <motion.div
                key={step.title}
                className={`flex flex-col md:flex-row gap-10 md:gap-14 items-center ${isReversed ? 'md:flex-row-reverse' : ''}`}
                {...m(fadeIn)}
              >
                {/* Text side */}
                <div className={`md:w-1/2 ${isReversed ? 'md:order-2' : ''}`}>
                  <div className="flex items-center gap-3 mb-5">
                    <span className={`text-label-sm font-bold px-2.5 py-1 rounded-md ${colors.badge}`}>
                      Step {i + 1}
                    </span>
                  </div>

                  <h3 className="text-heading-lg text-pulse-text mb-3">{step.title}</h3>
                  <p className="text-body text-pulse-text-secondary mb-5">{step.desc}</p>

                  <div className="space-y-2.5">
                    {step.bullets.map((item) => (
                      <div key={item} className="flex items-start gap-2.5">
                        {step.color === 'rose' ? (
                          <Sparkles className={`w-4 h-4 mt-0.5 shrink-0 ${colors.text}`} />
                        ) : (
                          <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${colors.text}`} />
                        )}
                        <span className="text-body-sm text-pulse-text-tertiary">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Visual side */}
                <div className={`md:w-1/2 ${isReversed ? 'md:order-1' : ''} ${colors.card} rounded-2xl p-6 sm:p-8 hover:scale-[1.02] hover:shadow-lg transition-all duration-300`}>
                  <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center mb-5`}>
                    <Icon className={`w-6 h-6 ${colors.text}`} />
                  </div>

                  {i === 0 && <MiniSearchDemo />}
                  {i === 1 && <EligibilityBreakdown />}
                  {i === 2 && <AIWritingSimulator />}
                  {i === 3 && <SubmissionTracker />}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* ---- CTA ---- */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <motion.section
        className="px-4 sm:px-6 lg:px-8 py-20 sm:py-28 relative overflow-hidden"
        {...m(fadeIn)}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-[-15%] left-[30%] w-[600px] h-[400px] bg-pulse-indigo/[0.025] blur-[180px] rounded-full" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <SectionIntro
            label="Get started"
            align="center"
            description="Free to start. No credit card. 5 minutes to set up."
            className="mb-8"
          >
            Ready to start your first application?
          </SectionIntro>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="group inline-flex items-center gap-2.5 px-8 py-4 bg-pulse-accent text-pulse-bg font-semibold text-body rounded-lg hover:bg-pulse-accent/90 transition-all duration-200 shadow-pulse"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/pricing"
              className="text-body-sm text-pulse-text-secondary hover:text-pulse-accent inline-flex items-center gap-2 transition-colors duration-200"
            >
              View pricing
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </motion.section>
    </main>
  )
}
