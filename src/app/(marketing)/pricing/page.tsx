'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { motion, useInView } from 'framer-motion'
import { Check, ArrowRight, Minus, Shield, Zap, CreditCard, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SectionIntro } from '@/components/marketing/SectionIntro'
import { SavingsCalculator } from '@/components/marketing/SavingsCalculator'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { fadeIn } from '@/lib/motion/marketing-animations'

/* ─── PLAN DATA ─── */

const tiers = [
  {
    name: 'Starter',
    monthlyPrice: 0,
    annualPrice: 0,
    period: 'forever',
    description: 'For individuals exploring grant opportunities.',
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
    accent: 'accent' as const,
    cardClass: 'card-glass',
  },
  {
    name: 'Pro',
    monthlyPrice: 29,
    annualPrice: 23,
    period: 'per month',
    description: 'For organizations serious about winning grants.',
    features: [
      { text: 'Everything in Starter', included: true },
      { text: 'Unlimited saved grants', included: true },
      { text: 'Unlimited saved searches', included: true },
      { text: 'Email alerts for new grants', included: true },
      { text: 'Guided application builder', included: true },
      { text: 'Data vault auto-fill', included: true },
      { text: 'Plain English eligibility checks', included: true },
      { text: 'Document organization', included: true },
      { text: 'Deadline reminders', included: true },
      { text: 'Priority support', included: true },
    ],
    cta: 'Start Pro Trial',
    href: '/register?plan=pro',
    highlighted: true,
    accent: 'rose' as const,
    cardClass: 'card-glass-rose',
  },
  {
    name: 'Team',
    monthlyPrice: 99,
    annualPrice: 79,
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
    accent: 'indigo' as const,
    cardClass: 'card-glass-indigo',
  },
]

const guarantees = [
  { icon: Shield, text: '14-day free trial', subtext: 'on Pro & Team' },
  { icon: CreditCard, text: 'No credit card', subtext: 'to start' },
  { icon: Zap, text: 'Cancel anytime', subtext: 'no lock-in' },
]

/* ─── FEATURE COMPARISON TABLE ─── */

const comparisonFeatures = [
  { feature: 'Grant searches', starter: 'Unlimited', pro: 'Unlimited', team: 'Unlimited' },
  { feature: 'Saved grants', starter: '10', pro: 'Unlimited', team: 'Unlimited' },
  { feature: 'Saved searches', starter: '1', pro: 'Unlimited', team: 'Unlimited' },
  { feature: 'Email alerts', starter: false, pro: true, team: true },
  { feature: 'AI writing assistant', starter: false, pro: true, team: true },
  { feature: 'Vault auto-fill', starter: false, pro: true, team: true },
  { feature: 'Eligibility checks', starter: 'Basic', pro: 'AI-powered', team: 'AI-powered' },
  { feature: 'Deadline reminders', starter: false, pro: true, team: true },
  { feature: 'Document organization', starter: false, pro: true, team: true },
  { feature: 'Team members', starter: '1', pro: '1', team: 'Up to 5' },
  { feature: 'Shared workspaces', starter: false, pro: false, team: true },
  { feature: 'Activity feed', starter: false, pro: false, team: true },
  { feature: 'Analytics', starter: 'Basic', pro: 'Standard', team: 'Advanced' },
  { feature: 'Support', starter: 'Email', pro: 'Priority', team: 'Dedicated' },
]

function ComparisonCell({ value }: { value: boolean | string }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="w-4 h-4 text-pulse-accent mx-auto" />
    ) : (
      <X className="w-4 h-4 text-white/[0.1] mx-auto" />
    )
  }
  return <span className="text-body-sm text-pulse-text-secondary">{value}</span>
}

/* ─── PAGE ─── */

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false)
  const { reduced, m } = useReducedMotion()

  const tableRef = useRef<HTMLDivElement>(null)
  const tableInView = useInView(tableRef, { once: true, margin: '-80px' })
  const showTable = reduced || tableInView

  return (
    <main className="pt-[60px]">
      {/* ─── HERO ─── */}
      <section className="relative px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[-15%] right-[20%] w-[500px] h-[400px] rounded-full bg-pulse-indigo/[0.04] blur-[180px]" />
          <div className="absolute top-[10%] left-[5%] w-[300px] h-[300px] rounded-full bg-pulse-indigo/[0.03] blur-[140px]" />
        </div>

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-pulse-indigo/[0.12] border border-pulse-indigo/15 mb-6">
              <Zap className="w-3.5 h-3.5 text-pulse-indigo" />
              <span className="text-caption font-medium text-pulse-indigo">Plans & Pricing</span>
            </div>

            <h1 className="text-display-hero text-pulse-text mb-5">
              Simple, honest{' '}
              <span className="text-gradient-rose italic">pricing</span>
            </h1>

            <div className="h-px w-16 mx-auto bg-gradient-to-r from-transparent via-pulse-indigo/40 to-transparent mb-6" />

            <p className="text-body-lg text-pulse-text-secondary max-w-md mx-auto mb-10">
              Start free. Upgrade when you need AI writing and team features.
              No hidden fees.
            </p>

            {/* Billing toggle */}
            <div className="inline-flex items-center gap-3 p-1.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <button
                onClick={() => setIsAnnual(false)}
                className={cn(
                  'px-5 py-2 rounded-lg text-body-sm font-medium transition-all duration-200',
                  !isAnnual
                    ? 'bg-white/[0.08] text-pulse-text shadow-sm'
                    : 'text-pulse-text-tertiary hover:text-pulse-text-secondary'
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={cn(
                  'px-5 py-2 rounded-lg text-body-sm font-medium transition-all duration-200 flex items-center gap-2',
                  isAnnual
                    ? 'bg-white/[0.08] text-pulse-text shadow-sm'
                    : 'text-pulse-text-tertiary hover:text-pulse-text-secondary'
                )}
              >
                Annual
                <span className="text-label-sm font-bold text-pulse-accent bg-pulse-accent/15 px-1.5 py-0.5 rounded">
                  -20%
                </span>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── PRICING CARDS ─── */}
      <motion.section
        className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16"
        {...m(fadeIn)}
      >
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-6 items-start">
            {tiers.map((tier) => {
              const price = isAnnual ? tier.annualPrice : tier.monthlyPrice
              const isFree = tier.monthlyPrice === 0

              return (
                <div
                  key={tier.name}
                  className={cn(
                    'relative p-6 sm:p-8 rounded-2xl transition-all duration-300',
                    tier.cardClass,
                    tier.highlighted && 'lg:scale-[1.03] ring-1 ring-pulse-rose/20'
                  )}
                >
                  {tier.highlighted && (
                    <div className="absolute -top-3 left-6">
                      <span className="text-label-sm font-bold bg-pulse-rose text-pulse-bg px-3 py-1 rounded-full shadow-[0_0_20px_rgba(64,255,170,0.25)]">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-heading text-pulse-text mb-3">{tier.name}</h3>
                    <div className="flex items-baseline gap-1 mb-2">
                      {isFree ? (
                        <span className="text-stat text-pulse-text">Free</span>
                      ) : (
                        <>
                          <motion.span
                            key={price}
                            className="text-stat text-pulse-rose"
                            initial={reduced ? false : { opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            ${price}
                          </motion.span>
                          <span className="text-body-sm text-pulse-text-tertiary">/mo</span>
                        </>
                      )}
                    </div>
                    {!isFree && isAnnual && (
                      <motion.p
                        className="text-caption text-pulse-accent font-medium"
                        initial={reduced ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                      >
                        ${price * 12}/yr &middot; Save ${(tier.monthlyPrice - tier.annualPrice) * 12}/yr
                      </motion.p>
                    )}
                    <p className="text-body-sm text-pulse-text-tertiary mt-2">{tier.description}</p>
                  </div>

                  <div className="h-px bg-gradient-to-r from-white/[0.06] to-transparent mb-6" />

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
                        ? 'bg-pulse-rose text-pulse-bg hover:bg-pulse-rose/90 shadow-[0_0_30px_rgba(64,255,170,0.15)]'
                        : tier.name === 'Team'
                          ? 'bg-white/[0.03] border border-pulse-indigo/20 text-pulse-text hover:border-pulse-indigo/40'
                          : 'bg-white/[0.03] border border-white/[0.08] text-pulse-text hover:border-white/[0.15]'
                    )}
                  >
                    {tier.cta}
                    {tier.highlighted && <ArrowRight className="w-4 h-4" />}
                  </Link>
                </div>
              )
            })}
          </div>

          {/* Trust strip */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {guarantees.map((g) => {
              const Icon = g.icon
              return (
                <div key={g.text} className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4 text-pulse-accent" />
                  <div>
                    <span className="text-body-sm font-medium text-pulse-text-secondary">{g.text}</span>
                    <span className="text-caption text-pulse-text-tertiary ml-1.5">{g.subtext}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </motion.section>

      {/* ─── SAVINGS CALCULATOR ─── */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <motion.section
        className="px-4 sm:px-6 lg:px-8 py-20 sm:py-24"
        {...m(fadeIn)}
      >
        <div className="max-w-4xl mx-auto">
          <SectionIntro
            label="ROI Calculator"
            description="See how much time and money you save compared to traditional grant writing."
            className="max-w-lg mb-10"
          >
            Calculate your savings
          </SectionIntro>

          <SavingsCalculator />
        </div>
      </motion.section>

      {/* ─── FEATURE COMPARISON TABLE ─── */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <motion.section
        className="px-4 sm:px-6 lg:px-8 py-20 sm:py-24"
        {...m(fadeIn)}
      >
        <div className="max-w-4xl mx-auto">
          <SectionIntro
            label="Compare plans"
            description="A detailed breakdown of what's included in each plan."
            className="max-w-lg mb-10"
          >
            Feature comparison
          </SectionIntro>

          <div ref={tableRef} className="overflow-x-auto -mx-4 px-4">
            <div className="min-w-[600px]">
              {/* Table header */}
              <div className="grid grid-cols-4 gap-4 pb-4 mb-4 border-b border-white/[0.06]">
                <div className="text-body-sm font-medium text-pulse-text-tertiary">Feature</div>
                <div className="text-center text-body-sm font-medium text-pulse-text-secondary">Starter</div>
                <div className="text-center">
                  <span className="text-body-sm font-bold text-pulse-rose">Pro</span>
                </div>
                <div className="text-center text-body-sm font-medium text-pulse-text-secondary">Team</div>
              </div>

              {/* Table rows */}
              <div className="space-y-1">
                {comparisonFeatures.map((row, i) => (
                  <motion.div
                    key={row.feature}
                    className="grid grid-cols-4 gap-4 py-3 px-3 rounded-lg hover:bg-white/[0.02] transition-colors duration-150"
                    initial={reduced ? false : { opacity: 0 }}
                    animate={showTable ? { opacity: 1 } : {}}
                    transition={{ duration: 0.2, delay: reduced ? 0 : Math.min(i * 0.03, 0.4) }}
                  >
                    <div className="text-body-sm text-pulse-text-secondary">{row.feature}</div>
                    <div className="text-center"><ComparisonCell value={row.starter} /></div>
                    <div className="text-center"><ComparisonCell value={row.pro} /></div>
                    <div className="text-center"><ComparisonCell value={row.team} /></div>
                  </motion.div>
                ))}
              </div>
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
          <div className="absolute bottom-[-10%] right-[10%] w-[500px] h-[400px] bg-pulse-indigo/[0.025] blur-[180px] rounded-full" />
        </div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <SectionIntro
                label="Get started"
                description="Start free and upgrade when you&apos;re ready. Most organizations see results within the first week."
              >
                Not sure which plan?
              </SectionIntro>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 md:justify-end">
              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-pulse-accent text-pulse-bg font-semibold text-[15px] rounded-lg hover:bg-pulse-accent/90 transition-all duration-200 shadow-[0_0_30px_rgba(64,255,170,0.15)]"
              >
                Try Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 text-[15px] font-medium text-pulse-text-secondary border border-white/[0.08] rounded-lg hover:border-white/[0.15] transition-colors"
              >
                Talk to Sales
              </Link>
            </div>
          </div>
        </div>
      </motion.section>
    </main>
  )
}
