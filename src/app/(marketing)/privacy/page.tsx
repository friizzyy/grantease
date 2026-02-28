'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Shield, Eye, Lock, Server, Users, Bell, FileText, Mail } from 'lucide-react'

const fadeIn = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] },
}

const dataCategories = [
  {
    icon: Users,
    title: 'Account Information',
    description: 'Name, email, organization details, and preferences you provide when creating an account.',
  },
  {
    icon: FileText,
    title: 'Usage Data',
    description: 'How you interact with our platform, including searches, saved grants, and application progress.',
  },
  {
    icon: Server,
    title: 'Technical Data',
    description: 'Device information, IP address, and browser type to ensure optimal performance.',
  },
]

const protections = [
  {
    icon: Lock,
    title: 'Encryption',
    description: 'All data encrypted in transit (TLS 1.3) and at rest (AES-256).',
  },
  {
    icon: Shield,
    title: 'Access Controls',
    description: 'Strict role-based permissions and regular security audits.',
  },
  {
    icon: Eye,
    title: 'Privacy by Design',
    description: 'We collect only what we need and never sell your data.',
  },
]

const rights = [
  { title: 'Access', description: 'Request a copy of your personal data' },
  { title: 'Correction', description: 'Update or correct inaccurate information' },
  { title: 'Deletion', description: 'Request deletion of your account and data' },
  { title: 'Portability', description: 'Export your data in a standard format' },
  { title: 'Opt-out', description: 'Unsubscribe from marketing communications' },
  { title: 'Restrict', description: 'Limit how we process your information' },
]

export default function PrivacyPage() {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const h = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', h)
    return () => mq.removeEventListener('change', h)
  }, [])

  const m = (props: Record<string, unknown>) => (reduced ? {} : props)

  return (
    <main className="pt-[60px]">
      {/* ─── HERO ─── */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-24 pb-16 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-20%] left-[10%] w-[700px] h-[500px] rounded-full bg-pulse-accent/[0.035] blur-[160px]" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <span className="text-label text-pulse-accent mb-6 block">Privacy Policy</span>

            <h1 className="text-display-hero text-pulse-text mb-5 max-w-[680px]">
              Your data,{' '}
              <span className="text-pulse-text-secondary italic">your control.</span>
            </h1>

            <p className="text-body-lg text-pulse-text-secondary max-w-lg mb-3">
              We&apos;re transparent about how we handle your data.
              Here&apos;s what we collect, how we use it, and your rights.
            </p>

            <p className="text-label-sm text-pulse-text-tertiary">
              Last updated: February 2026
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── DATA WE COLLECT ─── */}
      <motion.section
        className="px-4 sm:px-6 lg:px-8 py-20 sm:py-24 border-t border-white/[0.04]"
        {...m(fadeIn)}
      >
        <div className="max-w-5xl mx-auto">
          <span className="text-label-sm text-pulse-accent mb-4 block">Data Collection</span>
          <h2 className="text-display-section text-pulse-text mb-3">Information we collect</h2>
          <p className="text-body text-pulse-text-secondary mb-10 max-w-lg">
            We collect information to provide better services and personalized grant recommendations.
          </p>

          <div className="grid sm:grid-cols-3 gap-6">
            {dataCategories.map((category) => {
              const Icon = category.icon
              return (
                <div
                  key={category.title}
                  className="group relative p-5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-all duration-300"
                >
                  <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-pulse-accent/20 to-pulse-accent/5" />
                  <div className="w-10 h-10 rounded-lg bg-pulse-accent/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-pulse-accent" />
                  </div>
                  <h3 className="text-heading-sm text-pulse-text mb-2">{category.title}</h3>
                  <p className="text-body-sm text-pulse-text-tertiary leading-relaxed">{category.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </motion.section>

      {/* ─── HOW WE USE DATA ─── */}
      <motion.section
        className="px-4 sm:px-6 lg:px-8 py-20 sm:py-24 border-t border-white/[0.04]"
        {...m(fadeIn)}
      >
        <div className="max-w-5xl mx-auto">
          <span className="text-label-sm text-pulse-accent mb-4 block">Data Usage</span>
          <h2 className="text-display-section text-pulse-text mb-10">How we use your information</h2>

          <div className="space-y-3">
            {[
              { title: 'Personalized Recommendations', description: 'Match you with grants that fit your organization and mission' },
              { title: 'Platform Improvement', description: 'Analyze usage patterns to enhance features and user experience' },
              { title: 'Communication', description: 'Send grant alerts, application reminders, and important updates' },
              { title: 'Security', description: 'Detect and prevent fraud, abuse, and unauthorized access' },
              { title: 'Legal Compliance', description: 'Meet regulatory requirements and respond to legal requests' },
            ].map((item, i) => (
              <div
                key={item.title}
                className="flex items-start gap-4 p-5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-all duration-300"
              >
                <span className="text-label-sm text-pulse-accent mt-0.5">0{i + 1}</span>
                <div>
                  <h3 className="text-heading-sm text-pulse-text mb-1">{item.title}</h3>
                  <p className="text-body-sm text-pulse-text-tertiary leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ─── DATA PROTECTION ─── */}
      <motion.section
        className="px-4 sm:px-6 lg:px-8 py-20 sm:py-24 border-t border-white/[0.04]"
        {...m(fadeIn)}
      >
        <div className="max-w-5xl mx-auto">
          <span className="text-label-sm text-pulse-accent mb-4 block">Security</span>
          <h2 className="text-display-section text-pulse-text mb-10">How we protect your data</h2>

          <div className="grid sm:grid-cols-3 gap-6">
            {protections.map((protection) => {
              const Icon = protection.icon
              return (
                <div
                  key={protection.title}
                  className="group relative p-5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-all duration-300"
                >
                  <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-emerald-400/20 to-emerald-400/5" />
                  <div className="w-10 h-10 rounded-lg bg-emerald-400/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <h3 className="text-heading-sm text-pulse-text mb-2">{protection.title}</h3>
                  <p className="text-body-sm text-pulse-text-tertiary leading-relaxed">{protection.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </motion.section>

      {/* ─── YOUR RIGHTS ─── */}
      <motion.section
        className="px-4 sm:px-6 lg:px-8 py-20 sm:py-24 border-t border-white/[0.04]"
        {...m(fadeIn)}
      >
        <div className="max-w-5xl mx-auto">
          <span className="text-label-sm text-pulse-accent mb-4 block">Your Rights</span>
          <h2 className="text-display-section text-pulse-text mb-3">Control over your data</h2>
          <p className="text-body text-pulse-text-secondary mb-10 max-w-lg">
            You have rights regarding your personal data. Here&apos;s what you can do.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {rights.map((right) => (
              <div
                key={right.title}
                className="group p-5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-all duration-300"
              >
                <h3 className="text-heading-sm text-pulse-text mb-1 group-hover:text-pulse-accent transition-colors">
                  {right.title}
                </h3>
                <p className="text-body-sm text-pulse-text-tertiary leading-relaxed">
                  {right.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ─── CTA ─── */}
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
                Questions about{' '}
                <span className="text-pulse-accent">privacy?</span>
              </h2>
              <p className="text-body text-pulse-text-tertiary">
                Our privacy team responds within 24 hours.
              </p>
            </div>
            <div className="flex items-center gap-4 shrink-0 self-start lg:self-auto">
              <a
                href="mailto:privacy@grantsby.ai"
                className="group inline-flex items-center gap-2.5 px-8 py-4 bg-pulse-accent text-pulse-bg font-semibold text-[15px] rounded-lg hover:bg-pulse-accent/90 transition-all duration-200"
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
