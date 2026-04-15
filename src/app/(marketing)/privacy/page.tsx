'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import {
  ArrowRight,
  Shield,
  Eye,
  Lock,
  Server,
  Users,
  FileText,
  Database,
  ShieldCheck,
  KeyRound,
  Fingerprint,
  Download,
  Trash2,
  Settings,
  Mail,
  ToggleRight,
  PenLine,
} from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { fadeIn } from '@/lib/motion/marketing-animations'
import { AnimatedCounter } from '@/components/ui/animated-counter'

/* ─── DATA ─── */

const dataTypes = [
  { icon: Users, label: 'Account Info', detail: 'Name, email, org details', color: 'pulse-accent' },
  { icon: FileText, label: 'Usage Data', detail: 'Searches, saves, activity', color: 'pulse-accent' },
  { icon: Server, label: 'Technical Data', detail: 'Device, IP, browser', color: 'pulse-rose' },
]

const protectionLayers = [
  { icon: Lock, label: 'TLS 1.3 in transit', description: 'Every connection encrypted end-to-end' },
  { icon: KeyRound, label: 'AES-256 at rest', description: 'All stored data encrypted with military-grade encryption' },
  { icon: ShieldCheck, label: 'SOC 2 compliant', description: 'Regular third-party security audits' },
  { icon: Fingerprint, label: 'Access controls', description: 'Strict role-based permissions, MFA enforcement' },
]

const rights = [
  { icon: Download, title: 'Access & Export', description: 'Download a copy of all your personal data at any time', color: 'pulse-accent' },
  { icon: PenLine, title: 'Correct', description: 'Update or fix any inaccurate information in your profile', color: 'pulse-accent' },
  { icon: Trash2, title: 'Delete', description: 'Request complete deletion of your account and all data', color: 'pulse-error' },
  { icon: Settings, title: 'Portability', description: 'Export in standard formats compatible with other tools', color: 'pulse-rose' },
  { icon: Mail, title: 'Opt-out', description: 'Unsubscribe from any marketing or non-essential emails', color: 'pulse-accent' },
  { icon: ToggleRight, title: 'Restrict', description: 'Limit how we process your data while keeping your account', color: 'pulse-accent' },
]

const usageReasons = [
  'Personalize grant recommendations to your profile',
  'Improve search accuracy and platform features',
  'Send grant alerts and deadline reminders',
  'Detect fraud and protect your account',
  'Meet legal and regulatory requirements',
]

/* ─── ANIMATED SHIELD ─── */

function ShieldAnimation({ show, reduced }: { show: boolean; reduced: boolean }) {
  return (
    <div className="relative w-full max-w-[280px] mx-auto aspect-square">
      {/* Outer ring */}
      <motion.div
        className="absolute inset-0 rounded-full border-2 border-pulse-indigo/20"
        initial={reduced ? false : { scale: 0.8, opacity: 0 }}
        animate={show ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: reduced ? 0 : 0.2 }}
      />
      {/* Middle ring */}
      <motion.div
        className="absolute inset-[15%] rounded-full border-2 border-pulse-accent/20"
        initial={reduced ? false : { scale: 0.8, opacity: 0 }}
        animate={show ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: reduced ? 0 : 0.4 }}
      />
      {/* Inner ring */}
      <motion.div
        className="absolute inset-[30%] rounded-full border-2 border-pulse-rose/20"
        initial={reduced ? false : { scale: 0.8, opacity: 0 }}
        animate={show ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.6, delay: reduced ? 0 : 0.6 }}
      />
      {/* Center shield */}
      <motion.div
        className="absolute inset-[38%] rounded-full bg-pulse-indigo/10 flex items-center justify-center"
        initial={reduced ? false : { scale: 0 }}
        animate={show ? { scale: [0, 1.1, 1] } : {}}
        transition={{ duration: 0.4, delay: reduced ? 0 : 0.8, type: 'spring', stiffness: 200 }}
      >
        <Shield className="w-8 h-8 text-pulse-indigo" />
      </motion.div>
      {/* Orbiting dots — CSS animations for performance */}
      {!reduced && show && (
        <>
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-pulse-indigo animate-orbit-cw"
            style={{ transformOrigin: '0 140px' }}
          />
          <div
            className="absolute top-[15%] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-pulse-accent animate-orbit-ccw"
            style={{ transformOrigin: '0 100px' }}
          />
        </>
      )}
    </div>
  )
}

/* ─── PAGE ─── */

export default function PrivacyPage() {
  const { reduced, m } = useReducedMotion()

  const shieldRef = useRef<HTMLDivElement>(null)
  const shieldInView = useInView(shieldRef, { once: true, margin: '-80px' })
  const showShield = reduced || shieldInView

  const rightsRef = useRef<HTMLDivElement>(null)
  const rightsInView = useInView(rightsRef, { once: true, margin: '-80px' })
  const showRights = reduced || rightsInView

  return (
    <main className="pt-[60px]">
      {/* ─── HERO ─── */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 lg:pt-32 pb-16 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-10%] right-[15%] w-[500px] h-[500px] rounded-full bg-pulse-indigo/[0.04] blur-[180px]" />
          <div className="absolute bottom-[5%] left-[20%] w-[400px] h-[300px] rounded-full bg-pulse-indigo/[0.025] blur-[140px]" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pulse-indigo/[0.12] border border-pulse-indigo/15 mb-6">
              <Shield className="w-3.5 h-3.5 text-pulse-indigo" />
              <span className="text-caption font-medium text-pulse-indigo">Privacy Policy</span>
            </div>

            <h1 className="text-display-hero text-pulse-text mb-5">
              Your data,{' '}
              <span className="text-pulse-indigo italic">your control.</span>
            </h1>

            <div className="h-px w-16 mx-auto bg-gradient-to-r from-transparent via-pulse-indigo/40 to-transparent mb-6" />

            <p className="text-body-lg text-pulse-text-secondary max-w-xl mx-auto mb-6">
              We&apos;re transparent about how we handle your data.
              Here&apos;s the complete picture.
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] mb-12">
              <div className="w-1.5 h-1.5 rounded-full bg-pulse-accent" />
              <span className="text-label-sm text-pulse-text-tertiary">
                Last updated: February 2026
              </span>
            </div>
          </motion.div>

          {/* Privacy stats */}
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {[
              { value: 0, label: 'Data sold to third parties', color: 'text-pulse-accent' },
              { value: 256, suffix: '-bit', label: 'AES encryption at rest', color: 'text-pulse-accent' },
              { value: 99, suffix: '.9%', label: 'Uptime guarantee', color: 'text-pulse-rose' },
              { value: 24, suffix: 'hr', label: 'Privacy request response', color: 'text-pulse-accent' },
            ].map((stat, i) => (
              <div key={stat.label} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className={`text-stat-sm ${stat.color} tabular-nums mb-0.5`}>
                  {stat.value === 0 ? (
                    'Zero'
                  ) : (
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} delay={i * 0.1} />
                  )}
                </div>
                <p className="text-caption text-pulse-text-tertiary leading-tight">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── DATA FLOW: What we collect ─── */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <motion.section
        className="px-4 sm:px-6 lg:px-8 py-20 sm:py-24"
        {...m(fadeIn)}
      >
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-4 h-4 text-pulse-indigo" />
            <span className="text-label-sm text-pulse-indigo font-medium tracking-wide uppercase">
              Collection
            </span>
          </div>
          <h2 className="text-display-section text-pulse-text mb-3 max-w-md">
            What we collect
          </h2>
          <p className="text-body text-pulse-text-secondary max-w-lg mb-10">
            We collect only what&apos;s needed to provide better services and personalized grant recommendations.
          </p>

          {/* Data type cards: horizontal flow */}
          <div className="grid sm:grid-cols-3 gap-4 mb-12">
            {dataTypes.map((dt) => {
              const Icon = dt.icon
              const isIndigo = dt.color === 'pulse-indigo'
              const isRose = dt.color === 'pulse-rose'
              const bgClass = isIndigo ? 'bg-pulse-indigo-dim' : isRose ? 'bg-pulse-rose-dim' : 'bg-pulse-accent/10'
              const textClass = isIndigo ? 'text-pulse-indigo' : isRose ? 'text-pulse-rose' : 'text-pulse-accent'
              const borderClass = isIndigo ? 'border-pulse-indigo/15' : isRose ? 'border-pulse-rose/15' : 'border-pulse-accent/15'

              return (
                <div
                  key={dt.label}
                  className={`group p-5 rounded-xl bg-white/[0.02] border ${borderClass} hover:bg-white/[0.04] transition-all duration-200`}
                >
                  <div className={`w-10 h-10 rounded-lg ${bgClass} flex items-center justify-center mb-4`}>
                    <Icon className={`w-5 h-5 ${textClass}`} />
                  </div>
                  <h3 className="text-heading-sm text-pulse-text mb-1">{dt.label}</h3>
                  <p className="text-body-sm text-pulse-text-tertiary">{dt.detail}</p>
                </div>
              )
            })}
          </div>

          {/* How we use it: flowing list */}
          <div className="p-6 sm:p-8 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center gap-2 mb-5">
              <Eye className="w-4 h-4 text-pulse-accent" />
              <h3 className="text-heading text-pulse-text">How we use it</h3>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {usageReasons.map((reason, i) => (
                <div key={reason} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02]">
                  <div className="w-6 h-6 rounded-md bg-pulse-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-label-sm font-bold text-pulse-accent tabular-nums">{i + 1}</span>
                  </div>
                  <span className="text-body-sm text-pulse-text-secondary leading-relaxed">{reason}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* ─── PROTECTION: Shield visualization ─── */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <motion.section
        className="px-4 sm:px-6 lg:px-8 py-20 sm:py-24 relative overflow-hidden"
        {...m(fadeIn)}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[30%] left-[10%] w-[400px] h-[400px] bg-pulse-indigo/[0.02] blur-[140px] rounded-full" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div ref={shieldRef} className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Shield visual */}
            <ShieldAnimation show={showShield} reduced={reduced} />

            {/* Protection details */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Lock className="w-4 h-4 text-pulse-indigo" />
                <span className="text-label-sm text-pulse-indigo font-medium tracking-wide uppercase">
                  Protection
                </span>
              </div>
              <h2 className="text-display-section text-pulse-text mb-3">
                How we protect it
              </h2>
              <p className="text-body text-pulse-text-secondary mb-8">
                Multiple layers of security protect your data at every stage.
              </p>

              <div className="space-y-3">
                {protectionLayers.map((layer, i) => {
                  const Icon = layer.icon
                  return (
                    <motion.div
                      key={layer.label}
                      className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.02] border border-pulse-accent/10 hover:bg-white/[0.04] transition-all duration-200"
                      initial={reduced ? false : { opacity: 0, x: 10 }}
                      animate={showShield ? { opacity: 1, x: 0 } : {}}
                      transition={{ duration: 0.3, delay: reduced ? 0 : 0.4 + i * 0.1 }}
                    >
                      <div className="w-9 h-9 rounded-lg bg-pulse-accent-dim flex items-center justify-center shrink-0">
                        <Icon className="w-4.5 h-4.5 text-pulse-accent" />
                      </div>
                      <div>
                        <h4 className="text-body font-semibold text-pulse-text mb-0.5">{layer.label}</h4>
                        <p className="text-body-sm text-pulse-text-tertiary">{layer.description}</p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ─── YOUR RIGHTS ─── */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <motion.section
        className="px-4 sm:px-6 lg:px-8 py-20 sm:py-24"
        {...m(fadeIn)}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-3">
              <ShieldCheck className="w-4 h-4 text-pulse-indigo" />
              <span className="text-label-sm text-pulse-indigo font-medium tracking-wide uppercase">
                Your rights
              </span>
            </div>
            <h2 className="text-display-section text-pulse-text mb-3">
              You&apos;re always in control
            </h2>
            <p className="text-body text-pulse-text-secondary max-w-md mx-auto">
              Exercise any of these rights at any time from your account settings or by contacting us.
            </p>
          </div>

          <div ref={rightsRef} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rights.map((right, i) => {
              const Icon = right.icon
              const isError = right.color === 'pulse-error'
              const bgClass = isError ? 'bg-pulse-error/10' : right.color === 'pulse-rose' ? 'bg-pulse-rose-dim' : right.color === 'pulse-indigo' ? 'bg-pulse-indigo-dim' : 'bg-pulse-accent/10'
              const textClass = isError ? 'text-pulse-error' : right.color === 'pulse-rose' ? 'text-pulse-rose' : right.color === 'pulse-indigo' ? 'text-pulse-indigo' : 'text-pulse-accent'

              return (
                <motion.div
                  key={right.title}
                  className="group p-5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-all duration-200"
                  initial={reduced ? false : { opacity: 0, y: 10 }}
                  animate={showRights ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.3, delay: reduced ? 0 : i * 0.06 }}
                >
                  <div className={`w-9 h-9 rounded-lg ${bgClass} flex items-center justify-center mb-3`}>
                    <Icon className={`w-4.5 h-4.5 ${textClass}`} />
                  </div>
                  <h3 className={`text-heading-sm text-pulse-text mb-1 group-hover:${textClass} transition-colors`}>
                    {right.title}
                  </h3>
                  <p className="text-body-sm text-pulse-text-tertiary leading-relaxed">{right.description}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </motion.section>

      {/* ─── COMMITMENT STRIP ─── */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <motion.section
        className="px-4 sm:px-6 lg:px-8 py-16 sm:py-20 bg-pulse-surface/30"
        {...m(fadeIn)}
      >
        <div className="max-w-5xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-6 text-center">
            {[
              { icon: Shield, title: 'Never sell your data', description: 'Your data is yours. We never sell, rent, or trade it.', color: 'text-pulse-accent' },
              { icon: Eye, title: 'Minimal cookies', description: 'Only essential cookies for authentication and preferences.', color: 'text-pulse-rose' },
              { icon: Lock, title: 'Privacy by design', description: 'We collect only what we need and purge what we don\'t.', color: 'text-pulse-accent' },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="p-5">
                  <div className="w-10 h-10 rounded-lg bg-white/[0.04] flex items-center justify-center mx-auto mb-3">
                    <Icon className={`w-5 h-5 ${item.color}`} />
                  </div>
                  <h3 className="text-heading-sm text-pulse-text mb-1">{item.title}</h3>
                  <p className="text-body-sm text-pulse-text-tertiary">{item.description}</p>
                </div>
              )
            })}
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
              <h2 className="text-display-section text-pulse-text mb-4 max-w-md">
                Questions about{' '}
                <span className="text-pulse-indigo">privacy?</span>
              </h2>
              <p className="text-body text-pulse-text-tertiary">
                Our privacy team responds within 24 hours.
              </p>
            </div>
            <div className="flex items-center gap-4 shrink-0 self-start lg:self-auto">
              <a
                href="mailto:privacy@grantsby.ai"
                className="group inline-flex items-center gap-2.5 px-8 py-4 bg-pulse-accent text-pulse-bg font-semibold text-body rounded-lg hover:bg-pulse-accent/90 transition-all duration-200"
              >
                Contact Privacy Team
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
