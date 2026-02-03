import Link from 'next/link'
import { Check, ArrowRight, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

const tiers = [
  {
    name: 'Starter',
    price: 0,
    period: 'forever',
    description: 'Perfect for individuals exploring grant opportunities.',
    features: [
      'Unlimited grant searches',
      'Basic filters and sorting',
      'Save up to 10 grants',
      '1 saved search',
      'Grant detail pages',
      'Email support',
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
      'Everything in Starter',
      'Unlimited saved grants',
      'Unlimited saved searches',
      'Email alerts for new grants',
      'Guided application builder with vault auto-fill',
      'Data vault for one-time info entry',
      'Plain English eligibility checks before you apply',
      'Document organization',
      'Deadline reminders',
      'Priority support',
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
      'Everything in Pro',
      'Up to 5 team members',
      'Shared workspaces',
      'Team activity feed',
      'Role-based permissions',
      'Advanced analytics',
      'Custom integrations',
      'Dedicated support',
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

export default function PricingPage() {
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] backdrop-blur-md border border-white/[0.08] mb-8">
            <Sparkles className="w-4 h-4 text-pulse-accent" />
            <span className="text-sm text-pulse-text-secondary">Simple pricing</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-pulse-text mb-6 tracking-tight">
            Start free, upgrade
            <br />
            <span className="text-pulse-accent">when you need more</span>
          </h1>
          <p className="text-xl text-pulse-text-secondary max-w-2xl mx-auto leading-relaxed">
            No hidden fees, no surprises. Choose the plan that fits your needs.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={cn(
                  'relative p-8 rounded-2xl backdrop-blur',
                  tier.highlighted
                    ? 'bg-gradient-to-br from-pulse-accent/10 to-emerald-500/5 border-2 border-pulse-accent/30'
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
                    <span className="text-5xl font-bold text-pulse-text">
                      {tier.price === 0 ? 'Free' : `$${tier.price}`}
                    </span>
                    {tier.price > 0 && (
                      <span className="text-pulse-text-tertiary">/{tier.period.replace('per ', '')}</span>
                    )}
                  </div>
                  <p className="text-sm text-pulse-text-secondary">{tier.description}</p>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

                <ul className="space-y-4 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-pulse-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-pulse-accent" />
                      </div>
                      <span className="text-sm text-pulse-text-secondary">{feature}</span>
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-pulse-text mb-4">
              Frequently asked questions
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-pulse-accent/20 transition-colors"
              >
                <h3 className="text-base font-medium text-pulse-text mb-2">{faq.q}</h3>
                <p className="text-sm text-pulse-text-secondary leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 border-t border-white/[0.04]">
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
      </section>
    </main>
  )
}
