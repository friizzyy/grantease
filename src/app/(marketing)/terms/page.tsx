'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import {
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Shield,
  Ban,
  AlertTriangle,
  Scale,
  Briefcase,
  FileCheck,
  UserCheck,
  ScrollText,
  Gavel,
} from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { fadeIn } from '@/lib/motion/marketing-animations'

/* ─── DATA ─── */

const keyTakeaways = [
  { icon: FileCheck, title: 'Free to use', detail: 'Starter plan is free forever, no credit card needed', color: 'accent' },
  { icon: Shield, title: 'Your data stays yours', detail: 'We never sell or share your personal information', color: 'accent' },
  { icon: UserCheck, title: 'Fair cancellation', detail: 'Cancel anytime, keep access until billing period ends', color: 'rose' },
  { icon: Scale, title: '14-day guarantee', detail: 'Full refund within 14 days if you\'re not satisfied', color: 'accent' },
]

const serviceCommitments = [
  { title: 'Grant Discovery', description: 'Access 20,000+ grants from federal, state, and private sources, updated daily.', icon: BookOpen },
  { title: 'AI Assistance', description: 'Intelligent matching, eligibility analysis, and application writing support.', icon: CheckCircle2 },
  { title: 'Secure Platform', description: 'Enterprise-grade encryption, regular backups, and 99.9% uptime target.', icon: Shield },
]

const userExpectations = [
  { text: 'Provide accurate information about yourself and your organization', done: true },
  { text: 'Maintain the confidentiality of your account credentials', done: true },
  { text: 'Use the platform only for legitimate grant discovery purposes', done: true },
  { text: 'Verify grant information with original sources before applying', done: true },
  { text: 'Comply with all applicable laws and regulations', done: true },
  { text: 'Report any security vulnerabilities or misuse you discover', done: true },
]

const restrictions = [
  { icon: Ban, title: 'No Automated Access', description: 'Scraping, bots, or automated data collection is strictly prohibited', severity: 'high' },
  { icon: Briefcase, title: 'No Reselling', description: 'You may not resell or redistribute our data commercially', severity: 'high' },
  { icon: AlertTriangle, title: 'No Misrepresentation', description: "Don't impersonate others or misrepresent your eligibility to funders", severity: 'medium' },
  { icon: Shield, title: 'No Interference', description: "Don't attempt to disrupt, reverse-engineer, or compromise our systems", severity: 'high' },
]

const disclaimers = [
  { title: 'Information accuracy', description: 'Grant information is provided for informational purposes. We strive for accuracy but always verify with the original grant source before applying.' },
  { title: 'No funding guarantee', description: 'Using Grants By AI does not guarantee you will receive grant funding. Success depends on eligibility, application quality, and funder decisions.' },
  { title: 'Service availability', description: 'We aim for 99.9% uptime but cannot guarantee uninterrupted access. Scheduled maintenance and unforeseen issues may occasionally affect availability.' },
  { title: 'Third-party links', description: 'Our platform links to external grant sources. We are not responsible for the content, accuracy, or practices of these third-party sites.' },
]

const ownership = [
  { label: 'Our platform', value: 'We own it', detail: 'Design, code, features, and content are our intellectual property', color: 'pulse-accent' },
  { label: 'Your data', value: 'You own it', detail: 'Any data you submit remains yours. We just store and process it for you', color: 'pulse-accent' },
  { label: 'Grant info', value: 'Public domain', detail: 'Sourced from public government databases and foundation directories', color: 'pulse-rose' },
  { label: 'Your feedback', value: 'Licensed to us', detail: 'Suggestions and feedback help us improve the platform for everyone', color: 'pulse-text-secondary' },
]

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  accent: { bg: 'bg-pulse-accent/10', text: 'text-pulse-accent', border: 'border-pulse-accent/15' },
  rose: { bg: 'bg-pulse-rose-dim', text: 'text-pulse-rose', border: 'border-pulse-rose/15' },
  indigo: { bg: 'bg-pulse-indigo-dim', text: 'text-pulse-indigo', border: 'border-pulse-indigo/15' },
}

/* ─── ANIMATED SECTIONS ─── */

function AnimatedChecklist({ items, reduced }: { items: typeof userExpectations; reduced: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })
  const show = reduced || isInView

  return (
    <div ref={ref} className="space-y-2.5">
      {items.map((item, i) => (
        <motion.div
          key={item.text}
          className="flex items-start gap-3 p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-all duration-200"
          initial={reduced ? false : { opacity: 0, x: -8 }}
          animate={show ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.3, delay: reduced ? 0 : i * 0.06 }}
        >
          <motion.div
            className="shrink-0 mt-0.5"
            initial={reduced ? false : { scale: 0 }}
            animate={show ? { scale: [0, 1.2, 1] } : {}}
            transition={{ duration: 0.3, delay: reduced ? 0 : 0.15 + i * 0.06 }}
          >
            <CheckCircle2 className="w-4.5 h-4.5 text-pulse-accent" />
          </motion.div>
          <span className="text-body-sm text-pulse-text-secondary leading-relaxed">{item.text}</span>
        </motion.div>
      ))}
    </div>
  )
}

/* ─── PAGE ─── */

export default function TermsPage() {
  const { reduced, m } = useReducedMotion()

  const restrictRef = useRef<HTMLDivElement>(null)
  const restrictInView = useInView(restrictRef, { once: true, margin: '-80px' })
  const showRestrict = reduced || restrictInView

  return (
    <main className="pt-[60px]">
      {/* ─── HERO ─── */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 lg:pt-32 pb-16 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[20%] w-[500px] h-[400px] rounded-full bg-pulse-indigo/[0.04] blur-[180px]" />
          <div className="absolute bottom-[5%] right-[15%] w-[300px] h-[300px] rounded-full bg-pulse-indigo/[0.025] blur-[140px]" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pulse-indigo/[0.12] border border-pulse-indigo/15 mb-6">
              <ScrollText className="w-3.5 h-3.5 text-pulse-indigo" />
              <span className="text-caption font-medium text-pulse-indigo">Terms of Service</span>
            </div>

            <h1 className="text-display-hero text-pulse-text mb-5">
              Fair terms,{' '}
              <span className="text-gradient-rose italic">plain language.</span>
            </h1>

            <div className="h-px w-16 mx-auto bg-gradient-to-r from-transparent via-pulse-indigo/40 to-transparent mb-6" />

            <p className="text-body-lg text-pulse-text-secondary max-w-lg mx-auto mb-6">
              No legal jargon walls. Here&apos;s what you&apos;re agreeing to
              when you use Grants By AI, explained clearly.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <div className="w-1.5 h-1.5 rounded-full bg-pulse-indigo" />
              <span className="text-label-sm text-pulse-text-tertiary">
                Last updated: February 2026
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── KEY TAKEAWAYS STRIP ─── */}
      <div className="bg-pulse-surface/30">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <motion.div
          className="px-4 sm:px-6 lg:px-8 py-8"
          {...m(fadeIn)}
        >
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-2 mb-5">
              <Gavel className="w-4 h-4 text-pulse-indigo" />
              <span className="text-label-sm text-pulse-indigo font-medium tracking-wide uppercase">
                The short version
              </span>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {keyTakeaways.map((item) => {
                const Icon = item.icon
                const colors = colorMap[item.color]
                return (
                  <div
                    key={item.title}
                    className={`p-4 rounded-xl bg-white/[0.02] border ${colors.border} hover:bg-white/[0.04] transition-all duration-200`}
                  >
                    <div className={`w-8 h-8 rounded-lg ${colors.bg} flex items-center justify-center mb-3`}>
                      <Icon className={`w-4 h-4 ${colors.text}`} />
                    </div>
                    <h3 className="text-body font-semibold text-pulse-text mb-0.5">{item.title}</h3>
                    <p className="text-caption text-pulse-text-tertiary">{item.detail}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>

      {/* ─── WHAT WE PROVIDE ─── */}
      <motion.section
        className="px-4 sm:px-6 lg:px-8 py-20 sm:py-24"
        {...m(fadeIn)}
      >
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="w-4 h-4 text-pulse-indigo" />
                <span className="text-label-sm text-pulse-indigo font-medium tracking-wide uppercase">
                  Our commitments
                </span>
              </div>
              <h2 className="text-display-section text-pulse-text mb-3">
                What we provide
              </h2>
              <p className="text-body text-pulse-text-secondary leading-relaxed">
                Grants By AI offers a comprehensive platform for discovering, evaluating, and
                managing grant opportunities. By using our service, you get access to these core capabilities.
              </p>
            </div>

            <div className="space-y-4">
              {serviceCommitments.map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.title}
                    className="flex items-start gap-4 p-5 rounded-xl bg-white/[0.02] border border-pulse-accent/10 hover:bg-white/[0.04] transition-all duration-200"
                  >
                    <div className="w-10 h-10 rounded-lg bg-pulse-accent/10 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-pulse-accent" />
                    </div>
                    <div>
                      <h3 className="text-heading-sm text-pulse-text mb-1">{item.title}</h3>
                      <p className="text-body-sm text-pulse-text-tertiary leading-relaxed">{item.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ─── WHAT WE EXPECT: Animated checklist ─── */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <motion.section
        className="px-4 sm:px-6 lg:px-8 py-20 sm:py-24"
        {...m(fadeIn)}
      >
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div className="md:sticky md:top-24">
              <div className="flex items-center gap-2 mb-3">
                <UserCheck className="w-4 h-4 text-pulse-indigo" />
                <span className="text-label-sm text-pulse-indigo font-medium tracking-wide uppercase">
                  Your responsibilities
                </span>
              </div>
              <h2 className="text-display-section text-pulse-text mb-3">
                What we expect
              </h2>
              <p className="text-body text-pulse-text-secondary leading-relaxed">
                To keep the platform fair and useful for everyone, we ask that all users
                follow these straightforward guidelines.
              </p>
            </div>

            <AnimatedChecklist items={userExpectations} reduced={reduced} />
          </div>
        </div>
      </motion.section>

      {/* ─── PROHIBITED: Warning cards ─── */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <motion.section
        className="px-4 sm:px-6 lg:px-8 py-20 sm:py-24 relative"
        {...m(fadeIn)}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Ban className="w-4 h-4 text-pulse-indigo" />
              <span className="text-label-sm text-pulse-indigo font-medium tracking-wide uppercase">
                Prohibited
              </span>
            </div>
            <h2 className="text-display-section text-pulse-text mb-3">
              What&apos;s not allowed
            </h2>
            <p className="text-body text-pulse-text-secondary max-w-md mx-auto">
              To maintain a secure and fair platform for everyone, these activities are strictly prohibited.
            </p>
          </div>

          <div ref={restrictRef} className="grid md:grid-cols-2 gap-4">
            {restrictions.map((restriction, i) => {
              const Icon = restriction.icon
              const isHigh = restriction.severity === 'high'
              return (
                <motion.div
                  key={restriction.title}
                  className={`group flex items-start gap-4 p-5 rounded-xl bg-white/[0.02] border hover:bg-white/[0.04] transition-all duration-200 ${
                    isHigh ? 'border-pulse-rose/15' : 'border-white/[0.06]'
                  }`}
                  initial={reduced ? false : { opacity: 0, scale: 0.97 }}
                  animate={showRestrict ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.3, delay: reduced ? 0 : i * 0.08 }}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    isHigh ? 'bg-pulse-rose-dim' : 'bg-white/[0.04]'
                  }`}>
                    <Icon className={`w-4.5 h-4.5 ${isHigh ? 'text-pulse-rose' : 'text-pulse-text-tertiary'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-heading-sm text-pulse-text group-hover:text-pulse-rose transition-colors">
                        {restriction.title}
                      </h3>
                      {isHigh && (
                        <span className="text-label-sm text-pulse-rose/70 bg-pulse-rose/10 px-1.5 py-0.5 rounded">
                          Strict
                        </span>
                      )}
                    </div>
                    <p className="text-body-sm text-pulse-text-tertiary leading-relaxed">
                      {restriction.description}
                    </p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </motion.section>

      {/* ─── DISCLAIMERS: Clean numbered list ─── */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <motion.section
        className="px-4 sm:px-6 lg:px-8 py-20 sm:py-24 bg-pulse-surface/20"
        {...m(fadeIn)}
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-pulse-text-tertiary" />
            <span className="text-label-sm text-pulse-text-tertiary font-medium tracking-wide uppercase">
              Important notices
            </span>
          </div>
          <h2 className="text-heading-lg text-pulse-text mb-8">Things to keep in mind</h2>

          <div className="space-y-4">
            {disclaimers.map((item, i) => (
              <div
                key={item.title}
                className="flex gap-4 p-5 rounded-xl bg-white/[0.02] border border-white/[0.06]"
              >
                <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center shrink-0">
                  <span className="text-body-sm font-bold text-pulse-text-tertiary tabular-nums">{i + 1}</span>
                </div>
                <div>
                  <h3 className="text-body font-semibold text-pulse-text mb-1">{item.title}</h3>
                  <p className="text-body-sm text-pulse-text-tertiary leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ─── OWNERSHIP: Visual chart ─── */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <motion.section
        className="px-4 sm:px-6 lg:px-8 py-20 sm:py-24"
        {...m(fadeIn)}
      >
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Scale className="w-4 h-4 text-pulse-indigo" />
                <span className="text-label-sm text-pulse-indigo font-medium tracking-wide uppercase">
                  Intellectual property
                </span>
              </div>
              <h2 className="text-display-section text-pulse-text mb-3">
                Who owns what
              </h2>
              <p className="text-body text-pulse-text-secondary leading-relaxed">
                The Grants By AI platform is protected by intellectual property laws.
                You retain full ownership of any data you submit. Here&apos;s the breakdown.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {ownership.map((item) => (
                <div
                  key={item.label}
                  className="p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-all duration-200"
                >
                  <div className="text-label-sm text-pulse-text-tertiary mb-1">{item.label}</div>
                  <div className={`text-heading-sm ${item.color} mb-2`}>{item.value}</div>
                  <p className="text-caption text-pulse-text-tertiary leading-snug">{item.detail}</p>
                </div>
              ))}
            </div>
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
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-pulse-indigo/[0.03] blur-[180px] rounded-full" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div>
              <h2 className="text-display-section text-pulse-text mb-3 max-w-md">
                Questions about{' '}
                <span className="text-pulse-rose">our terms?</span>
              </h2>
              <p className="text-body text-pulse-text-tertiary">
                Our legal team is happy to clarify any part of this agreement.
              </p>
            </div>
            <div className="flex items-center gap-4 shrink-0 self-start lg:self-auto">
              <a
                href="mailto:legal@grantsby.ai"
                className="group inline-flex items-center gap-2.5 px-8 py-4 bg-pulse-accent text-pulse-bg font-semibold text-body rounded-lg hover:bg-pulse-accent/90 transition-all duration-200"
              >
                Contact Legal Team
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
              <Link
                href="/"
                className="text-body-sm text-pulse-text-secondary hover:text-pulse-accent inline-flex items-center gap-2 transition-colors duration-200"
              >
                Return Home
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </motion.section>
    </main>
  )
}
