'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Search, Sparkles, PenLine, BookOpen, TrendingUp, Shield, Clock, DollarSign } from 'lucide-react'
import { HeroSearch } from '@/components/marketing/HeroSearch'
import { SectionIntro } from '@/components/marketing/SectionIntro'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { fadeIn } from '@/lib/motion/marketing-animations'

const trustLogos = [
  'Small Business Administration',
  'Grants.gov',
  'National Science Foundation',
  'USDA',
  'NEA',
]

export default function HomePage() {
  const { m } = useReducedMotion()

  return (
    <main className="pt-[60px]">
      {/* ─── HERO ─── */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-28 pb-20 sm:pb-28 overflow-hidden">
        {/* Background: asymmetric glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[15%] w-[600px] h-[600px] rounded-full bg-pulse-indigo/[0.03] blur-[180px]" />
          <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-pulse-indigo/[0.025] blur-[140px]" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left: Copy */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pulse-indigo/[0.12] border border-pulse-indigo/15 mb-6">
                <Sparkles className="w-3.5 h-3.5 text-pulse-indigo" />
                <span className="text-caption font-medium text-pulse-indigo">AI-Powered Grant Discovery</span>
              </div>

              <h1 className="text-display-hero text-pulse-text mb-5">
                Stop searching.{' '}
                <span className="text-pulse-text-secondary italic">Start winning.</span>
              </h1>

              <p className="text-body-lg text-pulse-text-secondary max-w-md mb-8">
                Search 20,000+ grants from 50+ sources. Get matched instantly.
                AI helps you write every section of your application.
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-4 mb-10">
                <Link
                  href="/register"
                  className="group inline-flex items-center gap-2.5 px-7 py-3.5 bg-pulse-accent text-pulse-bg font-semibold text-body rounded-lg hover:bg-pulse-accent/90 transition-all duration-200 shadow-pulse hover:shadow-pulse-lg"
                >
                  Find Your Grants
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
                <Link
                  href="/how-it-works"
                  className="inline-flex items-center gap-2 px-5 py-3.5 text-body font-medium text-pulse-text-secondary hover:text-pulse-text transition-colors"
                >
                  See how it works
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Trust bar */}
              <div className="flex items-center gap-3 text-label-sm text-pulse-text-tertiary">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-pulse-indigo" />
                  No credit card required
                </span>
                <span className="w-px h-3 bg-white/[0.08]" />
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-pulse-rose" />
                  5 min to first match
                </span>
              </div>
            </motion.div>

            {/* Right: HeroSearch (the product) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <HeroSearch />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── DATA SOURCES BAR (social proof) ─── */}
      <div className="relative bg-pulse-surface/50">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            <span className="text-label-sm font-medium uppercase tracking-wider text-pulse-text-tertiary shrink-0">
              Data from
            </span>
            {trustLogos.map((name) => (
              <span
                key={name}
                className="text-body-sm font-medium text-pulse-text-tertiary hover:text-pulse-text-secondary transition-colors"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>

      {/* ─── WHAT MAKES THIS DIFFERENT ─── */}
      <motion.section
        className="px-4 sm:px-6 lg:px-8 py-20 sm:py-24 relative"
        {...m(fadeIn)}
      >
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="max-w-lg mb-14">
            <SectionIntro
              label="The difference"
              description="Most grant tools give you a list and say &ldquo;good luck.&rdquo; We match, explain, and help you write, end to end."
            >
              Not another grant database.
            </SectionIntro>
          </div>

          {/* Asymmetric grid: 2 tall cards + 2 short cards */}
          <div className="grid md:grid-cols-2 gap-5">
            {/* Feature 1: Full width emphasis card */}
            <div className="group relative p-7 rounded-2xl card-glass-accent md:row-span-2">
              <div className="flex items-start gap-4 mb-5">
                <div className="w-11 h-11 rounded-xl bg-pulse-accent/15 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110">
                  <Search className="w-5 h-5 text-pulse-accent" />
                </div>
                <div>
                  <h3 className="text-heading text-pulse-text mb-1 group-hover:text-pulse-accent transition-colors duration-200">Eligibility matching</h3>
                  <p className="text-body-sm text-pulse-text-secondary leading-relaxed">
                    Every requirement checked against your profile. You only see grants you actually qualify for, not thousands of irrelevant results.
                  </p>
                </div>
              </div>
              {/* Mini demo visualization */}
              <div className="space-y-2.5 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                {[
                  { label: 'Organization type', status: 'Match', color: 'text-pulse-accent' },
                  { label: 'Revenue under $5M', status: 'Match', color: 'text-pulse-accent' },
                  { label: 'Located in California', status: 'Match', color: 'text-pulse-accent' },
                  { label: 'Environmental focus', status: 'Match', color: 'text-pulse-accent' },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between text-caption">
                    <span className="text-pulse-text-tertiary">{item.label}</span>
                    <span className={`font-medium ${item.color}`}>{item.status}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between">
                  <span className="text-caption text-pulse-text-secondary font-medium">Overall match</span>
                  <span className="text-body-sm font-semibold text-pulse-accent">94%</span>
                </div>
              </div>
            </div>

            {/* Feature 2: Gold card for funding */}
            <div className="group relative p-7 rounded-2xl card-glass-rose">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-pulse-rose-dim flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110">
                  <DollarSign className="w-5 h-5 text-pulse-rose" />
                </div>
                <div>
                  <h3 className="text-heading text-pulse-text mb-1 group-hover:text-pulse-rose transition-colors duration-200">Keep 100% of awards</h3>
                  <p className="text-body-sm text-pulse-text-secondary leading-relaxed">
                    No percentage fees. No success fees. No hidden costs.
                    Every dollar you win goes to your mission.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 3: Indigo card for AI */}
            <div className="group relative p-7 rounded-2xl card-glass-accent">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-pulse-accent-dim flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110">
                  <PenLine className="w-5 h-5 text-pulse-accent" />
                </div>
                <div>
                  <h3 className="text-heading text-pulse-text mb-1 group-hover:text-pulse-accent transition-colors duration-200">AI writes first drafts</h3>
                  <p className="text-body-sm text-pulse-text-secondary leading-relaxed">
                    Section-by-section guidance. Your vault auto-fills the basics
                    so you never retype your EIN or mission statement.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ─── STATS ─── */}
      <div className="relative bg-pulse-surface/30">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <motion.section
          className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20"
          {...m(fadeIn)}
        >
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-10 sm:gap-16">
              {[
                { value: '$12B+', label: 'Available funding', color: 'text-pulse-rose' },
                { value: '20K+', label: 'Grants indexed', color: 'text-pulse-accent' },
                { value: '50+', label: 'Data sources', color: 'text-pulse-accent' },
                { value: '15 min', label: 'To first match', color: 'text-pulse-accent' },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className={`text-stat ${s.color} tabular-nums`}>{s.value}</div>
                  <div className="text-label-sm text-pulse-text-tertiary mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>

      {/* ─── HOW IT WORKS (compact) ─── */}
      <motion.section
        className="px-4 sm:px-6 lg:px-8 py-20 sm:py-24"
        {...m(fadeIn)}
      >
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <SectionIntro
              label="How it works"
              align="center"
              description="Four steps. No grant writing experience needed."
            >
              From search to submission
            </SectionIntro>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Search, title: 'Search & match', desc: 'Tell us about your org. See only grants you qualify for.', accent: 'accent' },
              { icon: BookOpen, title: 'Understand clearly', desc: 'Every grant explained in plain English. No jargon.', accent: 'accent' },
              { icon: PenLine, title: 'Write with AI', desc: 'Draft every section. Vault auto-fills 90% of basics.', accent: 'rose' },
              { icon: TrendingUp, title: 'Submit & track', desc: 'Review, submit, and track deadlines in one place.', accent: 'accent' },
            ].map((step, i) => {
              const Icon = step.icon
              const colorMap = {
                accent: { bg: 'bg-pulse-accent/10', text: 'text-pulse-accent', border: 'border-pulse-accent/20' },
                rose: { bg: 'bg-pulse-rose-dim', text: 'text-pulse-rose', border: 'border-pulse-rose/20' },
                indigo: { bg: 'bg-pulse-indigo-dim', text: 'text-pulse-indigo', border: 'border-pulse-indigo/20' },
              }
              const colors = colorMap[step.accent as keyof typeof colorMap]
              return (
                <div
                  key={step.title}
                  className="group relative p-6 rounded-xl card-glass"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-9 h-9 rounded-lg ${colors.bg} flex items-center justify-center transition-transform duration-200 group-hover:scale-110`}>
                      <Icon className={`w-4.5 h-4.5 ${colors.text}`} />
                    </div>
                    <span className={`text-label-sm font-medium tracking-wide ${colors.text} ${colors.border} border px-2 py-0.5 rounded`}>
                      Step {i + 1}
                    </span>
                  </div>
                  <h3 className="text-heading-sm text-pulse-text mb-1.5 group-hover:text-pulse-accent transition-colors duration-200">{step.title}</h3>
                  <p className="text-body-sm text-pulse-text-tertiary leading-relaxed">{step.desc}</p>
                </div>
              )
            })}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/how-it-works"
              className="text-body-sm text-pulse-text-secondary hover:text-pulse-accent inline-flex items-center gap-2 transition-colors duration-200"
            >
              Learn more about the process
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </motion.section>

      {/* ─── CTA ─── */}
      <motion.section
        className="px-4 sm:px-6 lg:px-8 py-20 sm:py-28 relative overflow-hidden"
        {...m(fadeIn)}
      >
        {/* Different glow: rose + mint blend */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-[-20%] left-[20%] w-[500px] h-[400px] bg-pulse-indigo/[0.025] blur-[180px] rounded-full" />
          <div className="absolute bottom-[-10%] right-[25%] w-[400px] h-[300px] bg-pulse-indigo/[0.02] blur-[160px] rounded-full" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-display-section text-pulse-text mb-4">
              Your next grant is waiting.
            </h2>
            <p className="text-body-lg text-pulse-text-secondary mb-8">
              Join 15,000+ organizations that found funding with Grants By AI.
              Free to start. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="group inline-flex items-center gap-2.5 px-8 py-4 bg-pulse-accent text-pulse-bg font-semibold text-body rounded-lg hover:bg-pulse-accent/90 transition-all duration-200 shadow-pulse hover:shadow-pulse-lg"
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
