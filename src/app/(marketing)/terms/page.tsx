'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, FileText, CheckCircle2, Scale, BookOpen, Shield, Users } from 'lucide-react'

const fadeIn = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] },
}

const keyTerms = [
  {
    icon: CheckCircle2,
    title: 'Service Access',
    description: 'Access to our platform for grant discovery and tracking.',
  },
  {
    icon: BookOpen,
    title: 'Grant Information',
    description: 'Aggregated data from 50+ sources, updated daily.',
  },
  {
    icon: Shield,
    title: 'Account Security',
    description: 'Secure login and data protection measures.',
  },
]

const userResponsibilities = [
  'Provide accurate information about yourself and your organization',
  'Maintain the confidentiality of your account credentials',
  'Use the platform only for legitimate grant discovery purposes',
  'Verify grant information with original sources before applying',
  'Comply with all applicable laws and regulations',
  'Report any security vulnerabilities or misuse you discover',
]

const restrictions = [
  { title: 'No Automated Access', description: 'Scraping, bots, or automated data collection is prohibited' },
  { title: 'No Reselling', description: 'You may not resell or redistribute our data commercially' },
  { title: 'No Misrepresentation', description: "Don't impersonate others or misrepresent your eligibility" },
  { title: 'No Interference', description: "Don't attempt to disrupt or compromise our systems" },
]

export default function TermsPage() {
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
          <div className="absolute top-[-20%] right-[10%] w-[700px] h-[500px] rounded-full bg-pulse-accent/[0.035] blur-[160px]" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <span className="text-label text-pulse-accent mb-6 block">Terms of Service</span>

            <h1 className="text-display-hero text-pulse-text mb-5 max-w-[680px]">
              Fair terms,{' '}
              <span className="text-pulse-text-secondary italic">clear expectations.</span>
            </h1>

            <p className="text-body-lg text-pulse-text-secondary max-w-lg mb-3">
              These terms govern your use of Grants By AI. By accessing our platform,
              you agree to be bound by these terms.
            </p>

            <p className="text-label-sm text-pulse-text-tertiary">
              Last updated: February 2026
            </p>
          </motion.div>
        </div>
      </section>

      {/* ─── WHAT YOU GET ─── */}
      <motion.section
        className="px-4 sm:px-6 lg:px-8 py-20 sm:py-24 border-t border-white/[0.04]"
        {...m(fadeIn)}
      >
        <div className="max-w-5xl mx-auto">
          <span className="text-label-sm text-pulse-accent mb-4 block">Our Services</span>
          <h2 className="text-display-section text-pulse-text mb-3">What we provide</h2>
          <p className="text-body text-pulse-text-secondary mb-10 max-w-lg">
            Grants By AI offers a comprehensive platform for discovering and managing grant opportunities.
          </p>

          <div className="grid sm:grid-cols-3 gap-6">
            {keyTerms.map((term) => {
              const Icon = term.icon
              return (
                <div
                  key={term.title}
                  className="group relative p-5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-all duration-300"
                >
                  <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-pulse-accent/20 to-pulse-accent/5" />
                  <div className="w-10 h-10 rounded-lg bg-pulse-accent/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-pulse-accent" />
                  </div>
                  <h3 className="text-heading-sm text-pulse-text mb-2">{term.title}</h3>
                  <p className="text-body-sm text-pulse-text-tertiary leading-relaxed">{term.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </motion.section>

      {/* ─── USER RESPONSIBILITIES ─── */}
      <motion.section
        className="px-4 sm:px-6 lg:px-8 py-20 sm:py-24 border-t border-white/[0.04]"
        {...m(fadeIn)}
      >
        <div className="max-w-5xl mx-auto">
          <span className="text-label-sm text-pulse-accent mb-4 block">Your Responsibilities</span>
          <h2 className="text-display-section text-pulse-text mb-10">What we expect from you</h2>

          <div className="grid md:grid-cols-2 gap-3">
            {userResponsibilities.map((responsibility, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-all duration-300"
              >
                <CheckCircle2 className="w-4 h-4 text-pulse-accent shrink-0 mt-0.5" />
                <span className="text-body-sm text-pulse-text-secondary leading-relaxed">{responsibility}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ─── RESTRICTIONS ─── */}
      <motion.section
        className="px-4 sm:px-6 lg:px-8 py-20 sm:py-24 border-t border-white/[0.04]"
        {...m(fadeIn)}
      >
        <div className="max-w-5xl mx-auto">
          <span className="text-label-sm text-pulse-text-tertiary mb-4 block">Restrictions</span>
          <h2 className="text-display-section text-pulse-text mb-3">Prohibited activities</h2>
          <p className="text-body text-pulse-text-secondary mb-10 max-w-lg">
            To maintain a fair and secure platform for everyone, certain activities are not permitted.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {restrictions.map((restriction) => (
              <div
                key={restriction.title}
                className="group p-5 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-all duration-300"
              >
                <h3 className="text-heading-sm text-pulse-text mb-1 group-hover:text-pulse-accent transition-colors">
                  {restriction.title}
                </h3>
                <p className="text-body-sm text-pulse-text-tertiary leading-relaxed">
                  {restriction.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ─── DISCLAIMERS ─── */}
      <motion.section
        className="px-4 sm:px-6 lg:px-8 py-20 sm:py-24 border-t border-white/[0.04]"
        {...m(fadeIn)}
      >
        <div className="max-w-5xl mx-auto">
          <span className="text-label-sm text-pulse-accent mb-4 block">Disclaimers</span>
          <h2 className="text-display-section text-pulse-text mb-10">Important notices</h2>

          <div className="space-y-3">
            {[
              {
                title: 'Information Accuracy',
                description: 'Grant information is provided for informational purposes only. We strive for accuracy but cannot guarantee that all details are current or complete. Always verify with the original grant source.',
              },
              {
                title: 'No Guarantee of Funding',
                description: 'Using Grants By AI does not guarantee you will receive grant funding. Success depends on many factors including eligibility, application quality, and funder decisions.',
              },
              {
                title: 'Service Availability',
                description: 'We aim for 99.9% uptime but cannot guarantee uninterrupted access. Scheduled maintenance and unforeseen issues may occasionally affect availability.',
              },
              {
                title: 'Third-Party Links',
                description: 'Our platform may contain links to external grant sources. We are not responsible for the content or practices of these third-party sites.',
              },
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

      {/* ─── INTELLECTUAL PROPERTY ─── */}
      <motion.section
        className="px-4 sm:px-6 lg:px-8 py-20 sm:py-24 border-t border-white/[0.04]"
        {...m(fadeIn)}
      >
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <span className="text-label-sm text-pulse-accent mb-4 block">Intellectual Property</span>
              <h2 className="text-display-section text-pulse-text mb-3">Ownership &amp; licensing</h2>
              <p className="text-body text-pulse-text-secondary leading-relaxed">
                The Grants By AI platform, including its design, features, code, and content, is protected
                by intellectual property laws. You retain ownership of any data you submit, but grant
                us a license to use it to provide our services.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Our Platform', value: 'We own it' },
                { label: 'Your Data', value: 'You own it' },
                { label: 'Grant Info', value: 'Public sources' },
                { label: 'Your Feedback', value: 'Licensed to us' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05]"
                >
                  <div className="text-label-sm text-pulse-text-tertiary mb-1">{item.label}</div>
                  <div className="text-heading-sm text-pulse-text">{item.value}</div>
                </div>
              ))}
            </div>
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
                <span className="text-pulse-accent">our terms?</span>
              </h2>
              <p className="text-body text-pulse-text-tertiary">
                Our legal team is happy to clarify any part of this agreement.
              </p>
            </div>
            <div className="flex items-center gap-4 shrink-0 self-start lg:self-auto">
              <a
                href="mailto:legal@grantsby.ai"
                className="group inline-flex items-center gap-2.5 px-8 py-4 bg-pulse-accent text-pulse-bg font-semibold text-[15px] rounded-lg hover:bg-pulse-accent/90 transition-all duration-200"
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
