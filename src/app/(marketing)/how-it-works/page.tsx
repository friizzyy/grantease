'use client'

import { useEffect, useState } from 'react'
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

const fadeIn = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] },
}

export default function HowItWorksPage() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const h = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])

  const m = (props: Record<string, unknown>) => (reduced ? {} : props)

  const steps = [
    {
      num: '01',
      icon: Search,
      title: 'Find your matches',
      desc: 'Tell us about your organization. Our AI searches 20,000+ grants from federal, state, and private sources. You see only the grants you qualify for.',
      bullets: [
        'AI checks your profile against every requirement',
        'Filter by amount, deadline, or difficulty',
        'Save promising grants for later',
      ],
    },
    {
      num: '02',
      icon: BookOpen,
      title: 'Understand before you apply',
      desc: 'Every grant explained in plain English. See what it funds, who qualifies, what documents you need, and how much effort it takes.',
      bullets: [
        'Plain English summary of requirements',
        'Detailed eligibility breakdown',
        'Estimated time to complete',
      ],
    },
    {
      num: '03',
      icon: PenLine,
      title: 'Write with AI assistance',
      desc: 'Our AI helps you craft each section. Your vault auto-fills basic info so you never retype your EIN, address, or mission statement.',
      bullets: [
        'Section-by-section guidance',
        'AI drafts you edit and refine',
        'Vault auto-fills 90% of basics',
      ],
      accent: true,
    },
    {
      num: '04',
      icon: Send,
      title: 'Submit and track',
      desc: 'Review your complete application before submitting. Track status, deadlines, and follow-ups all in one place.',
      bullets: [
        'Complete application preview',
        'Deadline reminders',
        'Status tracking dashboard',
      ],
    },
  ]

  return (
    <main className="pt-[60px]">
      {/* ---- HERO ---- */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-24 pb-20 sm:pb-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[10%] w-[700px] h-[500px] rounded-full bg-pulse-accent/[0.035] blur-[160px]" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <span className="text-label text-pulse-accent mb-6 block">How It Works</span>

            <h1 className="text-display-hero text-pulse-text mb-5 max-w-[680px]">
              You don&apos;t just find grants.{' '}
              <span className="text-pulse-text-secondary italic">You finish them.</span>
            </h1>

            <p className="text-body-lg text-pulse-text-secondary max-w-lg mb-10">
              Four steps from discovery to funded application.
              No grant writing experience needed.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ---- STATS BAR ---- */}
      <motion.section
        className="px-4 sm:px-6 lg:px-8 py-14 sm:py-16 border-t border-white/[0.04]"
        {...m(fadeIn)}
      >
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12">
            {[
              { value: '5 min', label: 'Profile setup' },
              { value: 'Instant', label: 'Grant matches' },
              { value: 'AI-guided', label: 'Applications' },
              { value: '100%', label: 'Award is yours' },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-stat-sm text-pulse-accent tabular-nums">{s.value}</div>
                <div className="text-label-sm text-pulse-text-tertiary mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ---- STEPS ---- */}
      <motion.section
        className="px-4 sm:px-6 lg:px-8 py-20 sm:py-24 border-t border-white/[0.04] relative"
        {...m(fadeIn)}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="mb-14">
            <span className="text-label text-pulse-accent mb-4 block">The Process</span>
            <h2 className="text-display-section text-pulse-text max-w-md">
              Your path from discovery to funded
            </h2>
          </div>

          <div className="space-y-6">
            {steps.map((step) => {
              const Icon = step.icon
              return (
                <div
                  key={step.num}
                  className={`group relative p-6 sm:p-8 rounded-xl border transition-all duration-300 ${
                    step.accent
                      ? 'bg-pulse-accent/[0.03] border-pulse-accent/20 hover:border-pulse-accent/30'
                      : 'bg-white/[0.02] border-white/[0.05] hover:border-white/[0.1]'
                  }`}
                >
                  {/* Accent top bar */}
                  <div className={`absolute top-0 left-4 right-4 h-px bg-gradient-to-r ${
                    step.accent
                      ? 'from-pulse-accent/30 to-pulse-accent/5'
                      : 'from-pulse-accent/20 to-pulse-accent/5'
                  }`} />

                  <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                    {/* Number + icon */}
                    <div className="flex items-center gap-4 sm:flex-col sm:items-center sm:w-16 shrink-0">
                      <span className="text-label-sm text-pulse-accent">{step.num}</span>
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        step.accent ? 'bg-pulse-accent/20' : 'bg-pulse-accent/10'
                      }`}>
                        <Icon className="w-5 h-5 text-pulse-accent" />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-heading-lg text-pulse-text mb-2">{step.title}</h3>
                      <p className="text-body text-pulse-text-secondary mb-4 max-w-2xl">{step.desc}</p>

                      <div className="grid sm:grid-cols-3 gap-3">
                        {step.bullets.map((item, i) => (
                          <div key={i} className="flex items-start gap-2">
                            {step.accent ? (
                              <Sparkles className="w-3.5 h-3.5 mt-0.5 shrink-0 text-pulse-accent" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0 text-pulse-accent" />
                            )}
                            <span className="text-body-sm text-pulse-text-tertiary">{item}</span>
                          </div>
                        ))}
                      </div>

                      {step.accent && (
                        <div className="mt-5 p-4 rounded-lg bg-white/[0.02] border border-white/[0.05]">
                          <p className="text-body-sm text-pulse-text-secondary">
                            <span className="text-pulse-accent font-medium">Professional applications without a $5,000 consultant.</span>{' '}
                            Our AI helps you sound professional while keeping your authentic voice.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </motion.section>

      {/* ---- CTA ---- */}
      <motion.section
        className="px-4 sm:px-6 lg:px-8 py-20 sm:py-28 border-t border-white/[0.04] relative overflow-hidden"
        {...m(fadeIn)}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-pulse-accent/[0.03] blur-[180px] rounded-full" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div>
              <h2 className="text-display-section text-pulse-text mb-3 max-w-md">
                Ready to start your{' '}
                <span className="text-pulse-accent">first application?</span>
              </h2>
              <p className="text-body text-pulse-text-tertiary">
                Free to start &middot; No credit card &middot; 5 minutes to set up
              </p>
            </div>
            <div className="flex items-center gap-4 shrink-0 self-start lg:self-auto">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2.5 px-8 py-4 bg-pulse-accent text-pulse-bg font-semibold text-[15px] rounded-lg hover:bg-pulse-accent/90 transition-all duration-200 shadow-[0_0_30px_rgba(64,255,170,0.15)] hover:shadow-[0_0_40px_rgba(64,255,170,0.25)]"
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
        </div>
      </motion.section>
    </main>
  )
}
