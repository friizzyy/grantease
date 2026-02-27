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
  FileText,
  Clock,
  Shield,
  MessageSquare,
  RefreshCw,
} from 'lucide-react'

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.6, ease: 'easeOut' },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

const hoverLift = {
  whileHover: { y: -2, transition: { duration: 0.2 } },
  whileTap: { scale: 0.98 },
}

export default function HowItWorksPage() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const motionProps = (props: Record<string, unknown>) =>
    prefersReducedMotion ? {} : props

  const steps = [
    {
      number: '1',
      icon: Search,
      title: 'Find Your Matches',
      subtitle: 'Stop searching. Start discovering.',
      description:
        "Tell us about your organization: what you do, where you're located, what you need funding for. Our AI searches 20,000+ grants from federal, state, and private sources. In seconds, you see only the grants you actually qualify for.",
      bullets: [
        'AI analyzes your profile against every requirement',
        "See why each grant matches (or doesn't)",
        'Filter by amount, deadline, difficulty',
        'Save promising grants for later',
      ],
      bulletIcon: CheckCircle2,
      accent: false,
    },
    {
      number: '2',
      icon: BookOpen,
      title: 'Understand Before You Apply',
      subtitle: "Know exactly what you're getting into.",
      description:
        "Every grant is explained in plain English, not government jargon. See exactly what the grant funds, who qualifies, what documents you'll need, and how much effort it takes to apply. Make informed decisions before investing your time.",
      bullets: [
        'Plain English summary of requirements',
        'Detailed eligibility breakdown',
        'List of required documents',
        'Estimated time to complete application',
      ],
      bulletIcon: CheckCircle2,
      accent: false,
    },
    {
      number: '3',
      icon: PenLine,
      title: 'Write with AI Assistance',
      subtitle: 'This is where the magic happens.',
      description:
        "You're not alone. Our AI writing assistant helps you craft each section of your application. Your vault auto-fills basic information. You never retype your address, EIN, or organization details. Get feedback on your drafts before you submit.",
      bullets: [
        'Section-by-section guidance',
        'AI drafts you can edit and refine',
        'Your vault auto-fills 90% of basic fields. Never retype your EIN, address, or mission',
        'Feedback on clarity and completeness',
      ],
      bulletIcon: Sparkles,
      accent: true,
      callout:
        'Professional applications without hiring a $5,000 consultant. Our AI helps you sound professional while keeping your authentic voice. Every word is yours to approve.',
    },
    {
      number: '4',
      icon: Send,
      title: 'Submit & Track',
      subtitle: 'Confidence at every stage.',
      description:
        'Review your complete application before submitting. Track your status, deadlines, and any follow-up requirements all in one place. We help you stay organized even after you hit submit.',
      bullets: [
        'Complete application preview',
        'Deadline reminders',
        'Status tracking dashboard',
        'Follow-up guidance if needed',
      ],
      bulletIcon: CheckCircle2,
      accent: false,
      isLast: true,
    },
  ]

  return (
    <main className="pt-20">
      {/* Hero */}
      <motion.section
        className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
        {...motionProps(fadeInUp)}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-pulse-accent/[0.05] blur-[120px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-pulse-accent" />
            <span className="text-sm text-pulse-text-secondary">You finish applications here, not just browse</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-pulse-text mb-6 tracking-tight">
            You don&apos;t just find grants here.
            <br />
            <span className="text-pulse-accent">You finish them.</span>
          </h1>

          <p className="text-xl text-pulse-text-secondary max-w-2xl mx-auto mb-8 leading-relaxed">
            We guide you through every step, from understanding if you qualify to
            submitting a professional application. No grant writing experience needed.
          </p>

          {/* Quick stats */}
          <div className="inline-flex flex-wrap justify-center items-center gap-6 md:gap-10 px-6 py-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <div className="text-center">
              <div className="text-2xl font-bold text-pulse-accent tabular-nums">5 min</div>
              <div className="text-xs text-pulse-text-tertiary uppercase tracking-wider font-medium">Profile setup</div>
            </div>
            <div className="w-px h-8 bg-white/[0.08]" />
            <div className="text-center">
              <div className="text-2xl font-bold text-pulse-accent">Instant</div>
              <div className="text-xs text-pulse-text-tertiary uppercase tracking-wider font-medium">Grant matches</div>
            </div>
            <div className="w-px h-8 bg-white/[0.08]" />
            <div className="text-center">
              <div className="text-2xl font-bold text-pulse-accent">AI-guided</div>
              <div className="text-xs text-pulse-text-tertiary uppercase tracking-wider font-medium">Applications</div>
            </div>
            <div className="w-px h-8 bg-white/[0.08]" />
            <div className="text-center">
              <div className="text-2xl font-bold text-pulse-accent tabular-nums">100%</div>
              <div className="text-xs text-pulse-text-tertiary uppercase tracking-wider font-medium">Award is yours</div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* The 4-Step Journey - Detailed */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-16"
            {...motionProps(fadeInUp)}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-pulse-text mb-4">
              Your path from discovery to funded
            </h2>
            <p className="text-lg text-pulse-text-secondary max-w-2xl mx-auto">
              Four clear steps. Each one designed to remove confusion and build your confidence.
            </p>
          </motion.div>

          <div className="space-y-16">
            {steps.map((step, index) => {
              const BulletIcon = step.bulletIcon
              const isEven = index % 2 === 1

              return (
                <motion.div
                  key={step.number}
                  {...motionProps({
                    initial: { opacity: 0, y: 24 },
                    whileInView: { opacity: 1, y: 0 },
                    viewport: { once: true, margin: '-60px' },
                    transition: { duration: 0.6, ease: 'easeOut' },
                  })}
                >
                  <div className={`flex items-start gap-6 md:gap-10 ${isEven ? 'md:flex-row-reverse' : ''}`}>
                    {/* Step number indicator with connecting line */}
                    <div className="hidden md:flex flex-col items-center">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                        step.isLast ? 'bg-emerald-500/20' : 'bg-pulse-accent/20'
                      }`}>
                        <span className={`text-2xl font-bold ${
                          step.isLast ? 'text-emerald-400' : 'text-pulse-accent'
                        }`}>{step.number}</span>
                      </div>
                      {!step.isLast && (
                        <div className="w-px h-full bg-gradient-to-b from-pulse-accent/30 to-transparent mt-4 min-h-[80px]" />
                      )}
                    </div>

                    {/* Content card */}
                    <div className="flex-1">
                      <div className={`p-8 rounded-2xl ${
                        step.accent
                          ? 'bg-gradient-to-br from-pulse-accent/5 to-transparent border border-pulse-accent/20'
                          : 'bg-white/[0.02] border border-white/[0.06]'
                      }`}>
                        <div className="flex items-center gap-4 mb-6">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            step.isLast ? 'bg-emerald-500/10' : step.accent ? 'bg-pulse-accent/20' : 'bg-pulse-accent/10'
                          }`}>
                            <step.icon className={`w-6 h-6 ${
                              step.isLast ? 'text-emerald-400' : 'text-pulse-accent'
                            }`} />
                          </div>
                          <div>
                            <h3 className="text-2xl font-semibold text-pulse-text">{step.title}</h3>
                            <p className={`text-sm ${
                              step.accent ? 'text-pulse-accent font-medium' : 'text-pulse-text-tertiary'
                            }`}>{step.subtitle}</p>
                          </div>

                          {/* Mobile step number */}
                          <div className={`md:hidden ml-auto w-10 h-10 rounded-xl flex items-center justify-center ${
                            step.isLast ? 'bg-emerald-500/20' : 'bg-pulse-accent/20'
                          }`}>
                            <span className={`text-lg font-bold ${
                              step.isLast ? 'text-emerald-400' : 'text-pulse-accent'
                            }`}>{step.number}</span>
                          </div>
                        </div>

                        <p className="text-pulse-text-secondary mb-6 leading-relaxed">
                          {step.description}
                        </p>

                        <div className={`grid sm:grid-cols-2 gap-4 ${step.callout ? 'mb-6' : ''}`}>
                          {step.bullets.map((item, i) => (
                            <div key={i} className="flex items-start gap-2">
                              <BulletIcon className={`w-4 h-4 mt-0.5 shrink-0 ${
                                step.isLast ? 'text-emerald-400' : 'text-pulse-accent'
                              }`} />
                              <span className={`text-sm ${
                                step.accent ? 'text-pulse-text' : 'text-pulse-text-secondary'
                              }`}>{item}</span>
                            </div>
                          ))}
                        </div>

                        {step.callout && (
                          <div className="p-4 rounded-xl bg-pulse-bg/50 border border-white/[0.06]">
                            <p className="text-sm text-pulse-text-secondary">
                              <span className="text-pulse-accent font-medium">Professional applications without hiring a $5,000 consultant.</span> Our AI helps you
                              sound professional while keeping your authentic voice. Every word is yours to approve.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* What's Different */}
      <motion.section
        className="py-24 px-4 sm:px-6 lg:px-8 bg-white/[0.01] border-y border-white/[0.04]"
        {...motionProps(fadeInUp)}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-pulse-text mb-4">
              Built different from grant databases
            </h2>
            <p className="text-lg text-pulse-text-secondary max-w-2xl mx-auto">
              Other sites show you a list of grants. We actually help you complete applications.
            </p>
          </div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {[
              {
                icon: MessageSquare,
                title: 'Plain English Explanations',
                description: 'Every grant requirement translated from bureaucratic jargon into language anyone can understand.',
              },
              {
                icon: FileText,
                title: 'One Profile, Many Applications',
                description: 'Enter your info once. It auto-fills every application. Update once, apply everywhere.',
              },
              {
                icon: Sparkles,
                title: 'AI Writing Assistance',
                description: 'Get help drafting every section. Sound professional without hiring a consultant.',
              },
              {
                icon: Shield,
                title: 'Eligibility Verification',
                description: 'Know if you qualify before you invest time. We check every requirement against your profile.',
              },
              {
                icon: Clock,
                title: 'Time Estimates',
                description: 'See how long each application takes before you start. Plan your time realistically.',
              },
              {
                icon: RefreshCw,
                title: 'Reusable Content',
                description: 'Good answers you write for one grant can be adapted for others. Your work compounds.',
              },
            ].map((feature) => (
              <motion.div
                key={feature.title}
                variants={staggerItem}
                {...(prefersReducedMotion ? {} : hoverLift)}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-pulse-accent/20 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-pulse-accent/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-5 h-5 text-pulse-accent" />
                </div>
                <h3 className="text-lg font-semibold text-pulse-text mb-2">{feature.title}</h3>
                <p className="text-sm text-pulse-text-secondary">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* FAQ */}
      <motion.section
        className="py-24 px-4 sm:px-6 lg:px-8"
        {...motionProps(fadeInUp)}
      >
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-pulse-text mb-4">
              Common questions
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: 'Do I need grant writing experience?',
                a: 'No. Our AI guides you through each section with suggestions and examples. You edit and approve everything. The final application is yours.',
              },
              {
                q: 'How long does it take to get started?',
                a: "About 5 minutes to create your profile. You'll see matched grants immediately after. Your first application depends on the grant, but we show you time estimates upfront.",
              },
              {
                q: 'Do you take a percentage of my award?',
                a: 'Never. You keep 100% of every dollar you win. We charge a subscription fee for access to the platform, not a cut of your funding.',
              },
              {
                q: 'What if I get stuck on an application?',
                a: 'The AI assistant is there for every section. If you need more help, you can reach our support team. We want you to succeed.',
              },
              {
                q: 'Can I use this for any type of grant?',
                a: 'We focus on grants accessible to small organizations: small businesses, farms, nonprofits, individuals. Not the massive research grants that require institutional backing.',
              },
            ].map((faq) => (
              <div
                key={faq.q}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]"
              >
                <h3 className="text-base font-medium text-pulse-text mb-2">{faq.q}</h3>
                <p className="text-sm text-pulse-text-secondary leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA - "Ready to get started?" */}
      <motion.section
        className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden border-t border-white/[0.04]"
        {...motionProps(fadeInUp)}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-pulse-accent/[0.05] blur-[120px]" />
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-pulse-text mb-4">
            Ready to start your first application?
          </h2>

          <p className="text-lg text-pulse-text-secondary mb-8 max-w-xl mx-auto">
            Build your profile in 5 minutes. See your matched grants. Start applying with AI assistance.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-pulse-accent text-pulse-bg font-semibold rounded-xl hover:bg-pulse-accent/90 transition-all"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/[0.03] border border-white/[0.08] text-pulse-text font-semibold rounded-xl hover:border-pulse-accent/30 transition-all"
            >
              View Pricing
            </Link>
          </div>

          <p className="mt-6 text-sm text-pulse-text-tertiary">
            Free to start. No credit card required.
          </p>
        </div>
      </motion.section>
    </main>
  )
}
