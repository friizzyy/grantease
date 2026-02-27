'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  CheckCircle2,
  X,
  Check,
  FileText,
  Target,
  Search,
  PenLine,
  Sparkles,
  Clock,
  Users,
  DollarSign,
  Lightbulb,
  BookOpen,
  Send,
} from 'lucide-react'
import { HeroSearch } from '@/components/marketing/HeroSearch'
import { FloatingCard, PulsingDot } from '@/components/marketing/HeroAnimations'

// Animation variants
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const staggerItem = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.6, ease: 'easeOut' },
}

const hoverLift = {
  whileHover: { y: -2, transition: { duration: 0.2 } },
  whileTap: { scale: 0.98 },
}

// Hero-specific stagger with 150ms delay between items
const heroContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
}

const heroItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export default function HomePage() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // If reduced motion, disable all animations
  const motionProps = (props: Record<string, unknown>) =>
    prefersReducedMotion ? {} : props

  return (
    <main className="pt-20">
      {/* Hero - Clear value proposition */}
      <section className="min-h-[95vh] flex items-center px-4 sm:px-6 lg:px-8 py-20 relative overflow-hidden">
        {/* Ambient background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-pulse-accent/[0.05] blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-emerald-500/[0.03] blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto w-full relative z-10">
          {/* Floating card - Left */}
          <FloatingCard className="hidden lg:block absolute top-1/4 left-0" delay={0}>
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-sm text-pulse-text-secondary">Application submitted</span>
              </div>
              <div className="text-2xl font-bold text-pulse-text">$25,000 grant</div>
            </div>
          </FloatingCard>

          {/* Floating card - Right */}
          <FloatingCard className="hidden lg:block absolute top-1/3 right-0" delay={1}>
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5">
              <div className="text-3xl font-bold text-pulse-accent mb-1">100%</div>
              <div className="text-sm text-pulse-text-tertiary">You keep your award</div>
            </div>
          </FloatingCard>

          <motion.div
            className="text-center max-w-4xl mx-auto"
            variants={heroContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Premium badge */}
            <motion.div variants={heroItem}>
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/[0.03] backdrop-blur-md border border-white/[0.08] mb-10">
                <div className="flex items-center gap-1.5">
                  <PulsingDot />
                  <span className="text-xs font-medium text-pulse-accent uppercase tracking-wider">Now Available</span>
                </div>
                <div className="w-px h-4 bg-white/10" />
                <span className="text-sm text-pulse-text-secondary">Complete applications, not just find grants</span>
              </div>
            </motion.div>

            {/* Main headline - Focus on outcome */}
            <motion.h1
              variants={heroItem}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-pulse-text leading-[1.05] tracking-tight mb-8"
            >
              Find grants.
              <br />
              <span className="bg-gradient-to-r from-pulse-accent via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Finish applications.
              </span>
            </motion.h1>

            <motion.p
              variants={heroItem}
              className="text-xl text-pulse-text-secondary max-w-2xl mx-auto mb-6 leading-relaxed"
            >
              We guide you through every step of applying. See grants in plain English.
              Get writing help for each section. Your data auto-fills every application. No grant writer needed.
            </motion.p>

            {/* Key differentiator */}
            <motion.p variants={heroItem} className="text-lg text-pulse-accent font-medium mb-12">
              You keep 100% of every dollar you win.
            </motion.p>

            {/* Interactive Search Component */}
            <motion.div variants={heroItem}>
              <HeroSearch />
            </motion.div>

            {/* Trust indicators - More specific */}
            <motion.div
              variants={heroItem}
              className="flex flex-wrap justify-center gap-8 mt-10 text-sm text-pulse-text-tertiary"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-pulse-accent" />
                <span>Free to start</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-pulse-accent" />
                <span>No grant writing experience needed</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-pulse-accent" />
                <span>Works for any organization type</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* The Problem Section */}
      <motion.section
        className="py-20 px-4 sm:px-6 lg:px-8 bg-white/[0.01] border-y border-white/[0.04]"
        {...motionProps(fadeInUp)}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-pulse-text mb-6">
            Grant applications shouldn&apos;t be this hard
          </h2>
          <p className="text-xl text-pulse-text-secondary max-w-3xl mx-auto mb-12 leading-relaxed">
            Most people give up on grants, not because they don&apos;t qualify, but because
            the process is confusing, time-consuming, and overwhelming. We built this to change that.
          </p>

          <motion.div
            className="grid md:grid-cols-3 gap-6 text-left"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {[
              {
                problem: 'Hours spent searching across dozens of websites',
                solution: 'One search finds grants from 50+ sources instantly',
              },
              {
                problem: 'Confusing eligibility requirements written in legalese',
                solution: 'Plain English explanations of who qualifies and why',
              },
              {
                problem: 'Starting from scratch on every single application',
                solution: 'Your vault auto-fills applications. Never retype your address, EIN, or mission statement again',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                {...(prefersReducedMotion ? {} : hoverLift)}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-pulse-accent/20 transition-colors"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-6 h-6 rounded-full bg-pulse-error/10 flex items-center justify-center shrink-0 mt-0.5">
                    <X className="w-3 h-3 text-pulse-error" />
                  </div>
                  <p className="text-sm text-pulse-text-tertiary line-through">{item.problem}</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-pulse-accent/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-pulse-accent" />
                  </div>
                  <p className="text-pulse-text font-medium">{item.solution}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* How It Actually Works - Clear workflow */}
      <motion.section
        className="py-24 px-4 sm:px-6 lg:px-8"
        {...motionProps(fadeInUp)}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-pulse-text mb-4">
              From confused to confident in four steps
            </h2>
            <p className="text-xl text-pulse-text-secondary max-w-2xl mx-auto">
              We guide you through the entire process, from finding the right grant to submitting a professional application.
            </p>
          </div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {[
              {
                step: '1',
                icon: Search,
                title: 'Find Your Match',
                description: 'Tell us about your organization. We search 20,000+ grants and show only the ones you actually qualify for.',
                detail: 'No more guessing if you\'re eligible',
              },
              {
                step: '2',
                icon: BookOpen,
                title: 'Understand It',
                description: 'Every grant explained in plain English. See exactly what\'s required, what you can fund, and your chances of winning.',
                detail: 'Know before you apply',
              },
              {
                step: '3',
                icon: PenLine,
                title: 'Write It',
                description: 'AI helps you write each section. Your profile auto-fills basics. Get feedback before you submit.',
                detail: 'Professional applications without a consultant',
              },
              {
                step: '4',
                icon: Send,
                title: 'Submit & Track',
                description: 'Review your complete application, submit with confidence, and track your status all in one place.',
                detail: 'Never lose track of a deadline',
              },
            ].map((item) => (
              <motion.div
                key={item.step}
                className="relative"
                variants={staggerItem}
                {...(prefersReducedMotion ? {} : hoverLift)}
              >
                {/* Step number */}
                <div className="absolute -top-3 left-0 w-8 h-8 rounded-full bg-pulse-accent/20 flex items-center justify-center">
                  <span className="text-sm font-bold text-pulse-accent">{item.step}</span>
                </div>

                <div className="pt-8 h-full">
                  <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] h-full hover:border-pulse-accent/30 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-pulse-accent/10 flex items-center justify-center mb-4">
                      <item.icon className="w-6 h-6 text-pulse-accent" />
                    </div>
                    <h3 className="text-lg font-semibold text-pulse-text mb-2">{item.title}</h3>
                    <p className="text-sm text-pulse-text-secondary mb-4">{item.description}</p>
                    <p className="text-xs text-pulse-accent font-medium">{item.detail}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* What Makes Us Different */}
      <motion.section
        className="py-24 px-4 sm:px-6 lg:px-8 bg-white/[0.01] border-y border-white/[0.04]"
        {...motionProps(fadeInUp)}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-pulse-text mb-4">
              This isn&apos;t just a grant database
            </h2>
            <p className="text-xl text-pulse-text-secondary max-w-2xl mx-auto">
              Other sites help you find grants. We help you finish applications.
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
                icon: Lightbulb,
                title: 'Plain English, Always',
                description: 'Grant requirements explained like a helpful friend would explain them. No jargon, no confusion.',
              },
              {
                icon: Sparkles,
                title: 'AI Writing Assistant',
                description: 'Get help writing each section. Improve drafts with AI feedback. Sound professional without hiring a $5,000 grant consultant.',
              },
              {
                icon: Target,
                title: 'Real Eligibility Checks',
                description: 'Know if you qualify before you waste time. We check every requirement against your profile.',
              },
              {
                icon: FileText,
                title: 'One Profile, Every Application',
                description: 'Enter your organization info once in your vault. Auto-fills 90% of basic fields. Update once, use everywhere.',
              },
              {
                icon: Clock,
                title: 'Application Timelines',
                description: 'See how long each application takes (10 min to 5 hours). Plan your time. Never miss another deadline.',
              },
              {
                icon: DollarSign,
                title: 'Keep 100% of Your Award',
                description: 'No percentage fees. No success fees. Every dollar you win is yours to keep.',
              },
            ].map((feature) => (
              <motion.div
                key={feature.title}
                variants={staggerItem}
                {...(prefersReducedMotion ? {} : hoverLift)}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-pulse-accent/20 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-pulse-accent/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-pulse-accent" />
                </div>
                <h3 className="text-lg font-semibold text-pulse-text mb-2">{feature.title}</h3>
                <p className="text-sm text-pulse-text-secondary">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Who It's For */}
      <motion.section
        className="py-24 px-4 sm:px-6 lg:px-8"
        {...motionProps(fadeInUp)}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-pulse-text mb-4">
              Built for people who do the work
            </h2>
            <p className="text-xl text-pulse-text-secondary max-w-2xl mx-auto">
              Not for grant consultants or large institutions. For small organizations,
              business owners, and individuals who want funding without the complexity.
            </p>
          </div>

          <motion.div
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
          >
            {[
              {
                icon: Users,
                title: 'Small Nonprofits',
                description: 'Community organizations serving their neighborhoods without a development department.',
              },
              {
                emoji: '\u{1F33E}',
                title: 'Farmers & Ranchers',
                description: 'Family farms looking for USDA programs, conservation grants, and rural development funding.',
              },
              {
                emoji: '\u{1F3EA}',
                title: 'Small Businesses',
                description: 'Local businesses seeking SBA grants, state programs, and small business incentives.',
              },
              {
                emoji: '\u{1F3E0}',
                title: 'Property Owners',
                description: 'Homeowners and landowners applying for improvement grants and conservation programs.',
              },
            ].map((persona) => (
              <motion.div
                key={persona.title}
                variants={staggerItem}
                {...(prefersReducedMotion ? {} : hoverLift)}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-center hover:shadow-[0_0_30px_rgba(64,255,170,0.05)] hover:border-pulse-accent/20 transition-all"
              >
                <div className="w-16 h-16 rounded-2xl bg-pulse-accent/10 flex items-center justify-center mb-4 mx-auto">
                  {'emoji' in persona ? (
                    <span className="text-3xl">{persona.emoji}</span>
                  ) : (
                    <persona.icon className="w-8 h-8 text-pulse-accent" />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-pulse-text mb-2">{persona.title}</h3>
                <p className="text-sm text-pulse-text-secondary">{persona.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Social Proof / Stats */}
      <motion.section
        className="py-16 px-4 sm:px-6 lg:px-8 border-y border-white/[0.04] bg-white/[0.01]"
        {...motionProps(fadeInUp)}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '20,000+', label: 'Grants Available' },
              { value: '50+', label: 'Data Sources' },
              { value: '$12B+', label: 'In Funding' },
              { value: '15 min', label: 'Avg. Time to First Match' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl md:text-4xl font-bold text-pulse-text mb-1 tabular-nums">{stat.value}</div>
                <div className="text-xs text-pulse-text-tertiary uppercase tracking-wider font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Final CTA */}
      <motion.section
        className="py-24 px-4 sm:px-6 lg:px-8"
        {...motionProps(fadeInUp)}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-pulse-text mb-6">
            Ready to stop searching
            <br />
            <span className="text-pulse-accent">and start applying?</span>
          </h2>
          <p className="text-xl text-pulse-text-secondary mb-4 max-w-2xl mx-auto">
            Build your profile in 5 minutes. See your matched grants instantly.
            Start your first application today.
          </p>
          <p className="text-lg text-pulse-accent font-medium mb-10">
            Free to start. No credit card required.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-10 py-5 bg-pulse-accent text-pulse-bg font-semibold text-lg rounded-xl hover:bg-pulse-accent/90 transition-colors"
            >
              Start Finding Grants
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 px-10 py-5 bg-white/[0.03] border border-white/[0.08] text-pulse-text font-semibold text-lg rounded-xl hover:border-pulse-accent/30 transition-colors"
            >
              See How It Works
            </Link>
          </div>
        </div>
      </motion.section>
    </main>
  )
}
