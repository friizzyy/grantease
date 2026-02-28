'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ArrowRight, Plus, Minus } from 'lucide-react'
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
    accent: 'from-pulse-accent/20 to-pulse-accent/5',
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
      { text: 'Plain English eligibility checks', included: true },
      { text: 'Document organization', included: true },
      { text: 'Deadline reminders', included: true },
      { text: 'Priority support', included: true },
    ],
    cta: 'Start Pro Trial',
    href: '/register?plan=pro',
    highlighted: true,
    accent: 'from-pulse-accent/30 to-emerald-400/10',
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
    accent: 'from-emerald-400/20 to-emerald-400/5',
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

const fadeIn = {
  initial: { opacity: 0, y: 14 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.55, ease: [0.25, 0.1, 0.25, 1] },
}

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<string | null>(null)
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
      {/* ---- HERO ---- */}
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
            <span className="text-label text-pulse-accent mb-6 block">Pricing</span>

            <h1 className="text-display-hero text-pulse-text mb-5 max-w-[600px]">
              Start free, upgrade{' '}
              <span className="text-pulse-text-secondary italic">when you need more</span>
            </h1>

            <p className="text-body-lg text-pulse-text-secondary max-w-lg">
              No hidden fees, no surprises. Choose the plan that fits.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ---- PRICING CARDS ---- */}
      <motion.section
        className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 border-t border-white/[0.04]"
        {...m(fadeIn)}
      >
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-6">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={cn(
                  'relative p-6 sm:p-8 rounded-xl transition-all duration-300',
                  tier.highlighted
                    ? 'bg-pulse-accent/[0.04] border border-pulse-accent/20 hover:border-pulse-accent/30'
                    : 'bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1]'
                )}
              >
                {/* Accent top bar */}
                <div className={`absolute top-0 left-4 right-4 h-px bg-gradient-to-r ${tier.accent}`} />

                {/* Popular badge */}
                {tier.highlighted && (
                  <div className="absolute -top-3 left-6">
                    <span className="text-label-sm bg-pulse-accent text-pulse-bg px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-heading text-pulse-text mb-3">{tier.name}</h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    {tier.price === 0 ? (
                      <span className="text-stat-sm text-pulse-text">Free</span>
                    ) : (
                      <>
                        <span className="text-stat-sm text-pulse-accent">${tier.price}</span>
                        <span className="text-body-sm text-pulse-text-tertiary">/mo</span>
                      </>
                    )}
                  </div>
                  <p className="text-body-sm text-pulse-text-tertiary">{tier.description}</p>
                </div>

                {/* Divider */}
                <div className="h-px bg-white/[0.05] mb-6" />

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature.text} className="flex items-start gap-2.5">
                      <Check className={cn(
                        'w-4 h-4 mt-0.5 shrink-0',
                        feature.included ? 'text-pulse-accent' : 'text-white/[0.1]'
                      )} />
                      <span className={cn(
                        'text-body-sm',
                        feature.included ? 'text-pulse-text-secondary' : 'text-pulse-text-tertiary/40 line-through'
                      )}>{feature.text}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={tier.href}
                  className={cn(
                    'w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-semibold text-[15px] transition-all duration-200',
                    tier.highlighted
                      ? 'bg-pulse-accent text-pulse-bg hover:bg-pulse-accent/90 shadow-[0_0_30px_rgba(64,255,170,0.15)] hover:shadow-[0_0_40px_rgba(64,255,170,0.25)]'
                      : 'bg-white/[0.03] border border-white/[0.08] text-pulse-text hover:border-white/[0.15]'
                  )}
                >
                  {tier.cta}
                  {tier.highlighted && <ArrowRight className="w-4 h-4" />}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ---- FAQ ---- */}
      <motion.section
        className="px-4 sm:px-6 lg:px-8 py-20 sm:py-24 border-t border-white/[0.04]"
        {...m(fadeIn)}
      >
        <div className="max-w-3xl mx-auto">
          <div className="mb-10">
            <span className="text-label text-pulse-accent mb-4 block">FAQ</span>
            <h2 className="text-display-section text-pulse-text">Common questions</h2>
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
                      : 'bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1]'
                  )}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : faq.q)}
                    className="w-full p-5 flex items-center justify-between gap-4 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className={cn(
                      'text-heading-sm transition-colors',
                      isOpen ? 'text-pulse-accent' : 'text-pulse-text'
                    )}>
                      {faq.q}
                    </span>
                    <div className={cn(
                      'w-7 h-7 rounded-md flex items-center justify-center shrink-0 transition-all',
                      isOpen
                        ? 'bg-pulse-accent text-pulse-bg'
                        : 'bg-white/[0.03] border border-white/[0.08] text-pulse-text-tertiary'
                    )}>
                      {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
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
                        <div className="px-5 pb-5 text-body-sm text-pulse-text-secondary leading-relaxed">
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
                Start finding grants{' '}
                <span className="text-pulse-accent">today</span>
              </h2>
              <p className="text-body text-pulse-text-tertiary">
                Free to start &middot; No credit card &middot; Upgrade anytime
              </p>
            </div>
            <Link
              href="/register"
              className="group inline-flex items-center gap-2.5 px-8 py-4 bg-pulse-accent text-pulse-bg font-semibold text-[15px] rounded-lg hover:bg-pulse-accent/90 transition-all duration-200 shadow-[0_0_30px_rgba(64,255,170,0.15)] hover:shadow-[0_0_40px_rgba(64,255,170,0.25)] shrink-0 self-start lg:self-auto"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </motion.section>
    </main>
  )
}
