'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ArrowRight, Sparkles, Plus, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

const tiers = [
  {
    name: 'Starter',
    price: 0,
    period: 'forever',
    description: 'Perfect for individuals exploring grant opportunities.',
    features: [
      { text: 'Unlimited grant searches', included: true },
      { text: 'Basic filters and sorting', included: true },
      { text: 'Save up to 10 grants', included: true },
      { text: '1 saved search', included: true },
      { text: 'Grant detail pages', included: true },
      { text: 'Email support', included: true },
      { text: 'AI writing assistant', included: false },
      { text: 'Vault auto-fill', included: false },
    ],
    cta: 'Get Started Free',
    href: '/register',
  },
  {
    name: 'Pro',
    price: 29,
    period: 'per month',
    description: 'For organizations serious about winning grants.',
    features: [
      { text: 'Everything in Starter', included: true },
      { text: 'Unlimited saved grants', included: true },
      { text: 'Unlimited saved searches', included: true },
      { text: 'Email alerts for new grants', included: true },
      { text: 'Guided application builder with vault auto-fill', included: true },
      { text: 'Data vault for one-time info entry', included: true },
      { text: 'Plain English eligibility checks before you apply', included: true },
      { text: 'Document organization', included: true },
      { text: 'Deadline reminders', included: true },
      { text: 'Priority support', included: true },
    ],
    cta: 'Start Pro Trial',
    href: '/register?plan=pro',
    highlighted: true,
  },
  {
    name: 'Team',
    price: 99,
    period: 'per month',
    description: 'For teams managing multiple applications.',
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Up to 5 team members', included: true },
      { text: 'Shared workspaces', included: true },
      { text: 'Team activity feed', included: true },
      { text: 'Role-based permissions', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Custom integrations', included: true },
      { text: 'Dedicated support', included: true },
    ],
    cta: 'Contact Sales',
    href: '/contact?subject=team',
  },
]

const faqs = [
  {
    q: 'Can I try Pro features before committing?',
    a: 'Yes! Start with a 14-day free trial of Pro. No credit card required.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards, and can arrange invoicing for Team plans.',
  },
  {
    q: 'Can I change plans later?',
    a: 'Absolutely. Upgrade or downgrade anytime. Changes take effect on your next billing cycle.',
  },
  {
    q: 'Is there a discount for annual billing?',
    a: 'Yes, save 20% when you choose annual billing on Pro and Team plans.',
  },
]

// Animation variants
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
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

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<string | null>(null)
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

  return (
    <main className="pt-20">
      {/* Hero */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Ambient background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-pulse-accent/[0.05] blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-emerald-500/[0.03] blur-[120px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] backdrop-blur-md border border-white/[0.08] mb-8">
              <Sparkles className="w-4 h-4 text-pulse-accent" />
              <span className="text-sm text-pulse-text-secondary">Simple pricing</span>
            </div>
          </motion.div>
          <motion.h1
            className="text-5xl md:text-6xl font-bold text-pulse-text mb-6 tracking-tight"
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
          >
            Start free, upgrade
            <br />
            <span className="text-pulse-accent">when you need more</span>
          </motion.h1>
          <motion.p
            className="text-xl text-pulse-text-secondary max-w-2xl mx-auto leading-relaxed"
            initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
          >
            No hidden fees, no surprises. Choose the plan that fits your needs.
          </motion.p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <motion.div
            className="grid lg:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-40px' }}
          >
            {tiers.map((tier) => (
              <motion.div
                key={tier.name}
                variants={staggerItem}
                whileHover={prefersReducedMotion ? undefined : { y: -2, transition: { duration: 0.2 } }}
                className={cn(
                  'relative p-8 rounded-2xl backdrop-blur',
                  tier.highlighted
                    ? 'bg-gradient-to-br from-pulse-accent/10 to-emerald-500/5 ring-1 ring-pulse-accent/30'
                    : 'bg-white/[0.02] border border-white/[0.06] hover:border-pulse-accent/20 transition-colors'
                )}
              >
                {/* Popular badge */}
                {tier.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-pulse-accent text-pulse-bg text-sm font-semibold">
                      <Sparkles className="w-3.5 h-3.5" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-lg font-semibold text-pulse-text mb-4">{tier.name}</h3>
                  <div className="flex items-baseline justify-center gap-1 mb-3">
                    <span className="text-display font-bold text-pulse-text">
                      {tier.price === 0 ? 'Free' : `$${tier.price}`}
                    </span>
                    {tier.price > 0 && (
                      <span className="text-body-sm text-pulse-text-tertiary">/mo</span>
                    )}
                  </div>
                  <p className="text-sm text-pulse-text-secondary">{tier.description}</p>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature.text} className="flex items-start gap-3">
                      <div className={cn(
                        'w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                        feature.included
                          ? 'bg-pulse-accent/10'
                          : 'bg-white/[0.03]'
                      )}>
                        <Check className={cn(
                          'w-3 h-3',
                          feature.included
                            ? 'text-pulse-accent'
                            : 'text-pulse-text-tertiary/30'
                        )} />
                      </div>
                      <span className={cn(
                        'text-sm',
                        feature.included
                          ? 'text-pulse-text-secondary'
                          : 'text-pulse-text-tertiary/50 line-through'
                      )}>{feature.text}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={tier.href}
                  className={cn(
                    'w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold transition-colors',
                    tier.highlighted
                      ? 'bg-pulse-accent text-pulse-bg hover:bg-pulse-accent/90'
                      : 'bg-white/[0.03] border border-white/[0.08] text-pulse-text hover:border-pulse-accent/30'
                  )}
                >
                  {tier.cta}
                  {tier.highlighted && <ArrowRight className="w-4 h-4" />}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <motion.section
        className="py-24 px-4 sm:px-6 lg:px-8"
        {...motionProps(fadeInUp)}
      >
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-pulse-text mb-4">
              Frequently asked questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq) => {
              const isOpen = openFaq === faq.q
              return (
                <div
                  key={faq.q}
                  className={cn(
                    'rounded-xl transition-all duration-200',
                    isOpen
                      ? 'bg-white/[0.03] border border-pulse-accent/20'
                      : 'bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1]'
                  )}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : faq.q)}
                    className="w-full p-5 flex items-center justify-between gap-4 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className={cn(
                      'font-medium transition-colors',
                      isOpen ? 'text-pulse-accent' : 'text-pulse-text'
                    )}>
                      {faq.q}
                    </span>
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all',
                      isOpen
                        ? 'bg-pulse-accent text-pulse-bg'
                        : 'bg-white/[0.03] border border-white/[0.08] text-pulse-text-tertiary'
                    )}>
                      {isOpen ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 text-sm text-pulse-text-secondary leading-relaxed">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>
      </motion.section>

      {/* CTA */}
      <motion.section
        className="py-24 px-4 sm:px-6 lg:px-8 border-t border-white/[0.04]"
        {...motionProps(fadeInUp)}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-pulse-text mb-6">
            Start finding grants
            <span className="text-pulse-accent"> today</span>
          </h2>
          <p className="text-xl text-pulse-text-secondary mb-10 max-w-2xl mx-auto">
            Join thousands of organizations discovering funding with Grants By AI.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-10 py-5 bg-pulse-accent text-pulse-bg font-semibold text-lg rounded-xl hover:bg-pulse-accent/90 transition-colors"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </motion.section>
    </main>
  )
}
