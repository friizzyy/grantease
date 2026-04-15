'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Search, PenLine, Calendar, Sparkles } from 'lucide-react'
import { SectionIntro } from '@/components/marketing/SectionIntro'
import { BeforeAfterMetrics } from '@/components/marketing/BeforeAfterMetrics'
import { LiveEligibilityCheck } from '@/components/marketing/LiveEligibilityCheck'
import { AIWritingSimulator } from '@/components/marketing/AIWritingSimulator'
import { SubmissionTracker } from '@/components/marketing/SubmissionTracker'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { fadeIn } from '@/lib/motion/marketing-animations'
import { AnimatedCounter } from '@/components/ui/animated-counter'

export default function AboutPage() {
  const { reduced, m } = useReducedMotion()

  return (
    <main className="pt-[60px]">
      {/* ─── HERO ─── */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 lg:pt-32 pb-20 sm:pb-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[20%] w-[600px] h-[500px] rounded-full bg-pulse-indigo/[0.04] blur-[180px]" />
          <div className="absolute bottom-[5%] right-[10%] w-[400px] h-[300px] rounded-full bg-pulse-accent/[0.03] blur-[140px]" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pulse-indigo/[0.12] border border-pulse-indigo/15 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-pulse-indigo" />
              <span className="text-caption font-medium text-pulse-indigo">Our Mission</span>
            </div>

            <h1 className="text-display-hero text-pulse-text mb-5">
              Grant funding shouldn&apos;t be{' '}
              <span className="text-gradient italic">this hard.</span>
            </h1>

            <div className="h-px w-16 mx-auto bg-gradient-to-r from-transparent via-pulse-indigo/40 to-transparent mb-6" />

            <p className="text-body-lg text-pulse-text-secondary max-w-xl mx-auto mb-14">
              We built Grants By AI because organizations deserve to spend time
              on their mission, not buried in spreadsheets hunting for funding.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {[
              { value: 12, suffix: 'B+', prefix: '$', label: 'Available grants indexed', color: 'text-pulse-rose', border: 'border-pulse-rose/20' },
              { value: 20, suffix: 'K+', prefix: '', label: 'Grant programs searchable', color: 'text-pulse-accent', border: 'border-pulse-accent/20' },
              { value: 15, suffix: 'K+', prefix: '', label: 'Organizations trust us', color: 'text-pulse-accent', border: 'border-pulse-accent/20' },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={`p-6 rounded-xl bg-white/[0.02] border ${stat.border}`}
              >
                <div className={`text-stat-sm ${stat.color} tabular-nums mb-1`}>
                  <AnimatedCounter
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    delay={i * 0.15}
                  />
                </div>
                <p className="text-body-sm text-pulse-text-tertiary">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── BEFORE / AFTER: Visual comparison ─── */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <motion.section
        className="px-4 sm:px-6 lg:px-8 py-20 sm:py-28"
        {...m(fadeIn)}
      >
        <div className="max-w-5xl mx-auto">
          <SectionIntro
            label="The problem"
            description="Organizations waste hundreds of hours on a process that should take minutes."
            className="max-w-lg mb-12"
          >
            The grant landscape is broken.
          </SectionIntro>

          <BeforeAfterMetrics />
        </div>
      </motion.section>

      {/* ─── HOW WE DO IT: Bento ─── */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <motion.section
        className="px-4 sm:px-6 lg:px-8 py-20 sm:py-28"
        {...m(fadeIn)}
      >
        <div className="max-w-5xl mx-auto">
          <SectionIntro
            label="Our approach"
            description='Most grant platforms give you a list and say &ldquo;good luck.&rdquo; We built something better.'
            className="max-w-lg mb-12"
          >
            Three things we do differently.
          </SectionIntro>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Card 1: Large, spans 2 rows, with LiveEligibilityCheck */}
            <div className="group md:row-span-2 p-6 sm:p-8 rounded-2xl card-glass-accent overflow-hidden">
              <div className="mb-6">
                <div className="w-10 h-10 rounded-xl bg-pulse-accent/15 flex items-center justify-center mb-4">
                  <Search className="w-5 h-5 text-pulse-accent" />
                </div>
                <h3 className="text-heading text-pulse-text mb-2">Intelligent matching</h3>
                <p className="text-body-sm text-pulse-text-secondary leading-relaxed">
                  We don&apos;t just search by keyword. Our AI reads every
                  grant&apos;s full requirements and matches them against your
                  org profile: size, location, focus area, revenue, and more.
                </p>
              </div>

              <LiveEligibilityCheck />
            </div>

            {/* Card 2: AI writing */}
            <div className="group p-6 sm:p-8 rounded-2xl card-glass-accent">
              <div className="w-10 h-10 rounded-xl bg-pulse-accent-dim flex items-center justify-center mb-4">
                <PenLine className="w-5 h-5 text-pulse-accent" />
              </div>
              <h3 className="text-heading text-pulse-text mb-2">
                AI writing assistant
              </h3>
              <p className="text-body-sm text-pulse-text-secondary leading-relaxed mb-5">
                Draft every section of your application. The AI pulls from your
                vault so you never retype your mission, EIN, or org history.
              </p>
              <AIWritingSimulator compact />
            </div>

            {/* Card 3: Deadline tracking */}
            <div className="group p-6 sm:p-8 rounded-2xl card-glass-rose">
              <div className="w-10 h-10 rounded-xl bg-pulse-rose-dim flex items-center justify-center mb-4">
                <Calendar className="w-5 h-5 text-pulse-rose" />
              </div>
              <h3 className="text-heading text-pulse-text mb-2">
                Deadline management
              </h3>
              <p className="text-body-sm text-pulse-text-secondary leading-relaxed mb-5">
                Track every deadline, get reminders, and never miss an
                opportunity. Organize applications by status across your team.
              </p>
              <SubmissionTracker compact />
            </div>
          </div>
        </div>
      </motion.section>

      {/* ─── PULL QUOTE ─── */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <motion.section
        className="px-4 sm:px-6 lg:px-8 py-20 sm:py-28 relative overflow-hidden"
        {...m(fadeIn)}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[5%] w-[300px] h-[300px] bg-pulse-indigo/[0.02] blur-[120px] rounded-full" />
        </div>

        <div className="max-w-3xl mx-auto relative z-10 text-center">
          <blockquote>
            <p className="text-heading-lg sm:text-display text-pulse-text leading-snug mb-8">
              &ldquo;We started this because a $50M nonprofit told us they spend
              <span className="text-pulse-rose"> 400 hours a year</span> just
              searching for grants. That&apos;s not a workflow problem.
              It&apos;s a systems failure.&rdquo;
            </p>
          </blockquote>
          <div className="flex items-center justify-center gap-3">
            <div className="w-px h-5 bg-pulse-accent/40" />
            <span className="text-body-sm text-pulse-text-tertiary">
              The founding team at Grants By AI
            </span>
          </div>
        </div>
      </motion.section>

      {/* ─── CTA ─── */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <motion.section
        className="px-4 sm:px-6 lg:px-8 py-20 sm:py-28 relative overflow-hidden"
        {...m(fadeIn)}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-[-10%] left-[10%] w-[500px] h-[400px] bg-pulse-accent/[0.025] blur-[180px] rounded-full" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div>
              <h2 className="text-display-section text-pulse-text mb-3 max-w-md">
                Ready to find your funding?
              </h2>
              <p className="text-body text-pulse-text-tertiary">
                Join 15,000+ organizations discovering grants with Grants By AI.
              </p>
            </div>
            <div className="flex items-center gap-4 shrink-0 self-start lg:self-auto">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2.5 px-8 py-4 bg-pulse-accent text-pulse-bg font-semibold text-body rounded-lg hover:bg-pulse-accent/90 transition-all duration-200 shadow-pulse"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/contact"
                className="text-body-sm text-pulse-text-secondary hover:text-pulse-accent inline-flex items-center gap-2 transition-colors duration-200"
              >
                Contact us
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </motion.section>
    </main>
  )
}
