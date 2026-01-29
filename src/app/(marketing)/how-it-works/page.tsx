import Link from 'next/link'
import { ArrowRight, Search, Filter, Target, FolderOpen, Bell, Sparkles } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Search',
    description: 'Enter keywords or describe what you need. Our AI instantly searches 50+ databases with 20,000+ active grants.',
  },
  {
    number: '02',
    icon: Filter,
    title: 'Filter',
    description: 'Narrow by eligibility, funding amount, deadline, and location. Find grants you actually qualify for.',
  },
  {
    number: '03',
    icon: Target,
    title: 'Match',
    description: 'See compatibility scores based on your profile. Focus on opportunities with the highest success rate.',
  },
  {
    number: '04',
    icon: FolderOpen,
    title: 'Organize',
    description: 'Create workspaces for each application. Track requirements, documents, and deadlines in one place.',
  },
  {
    number: '05',
    icon: Bell,
    title: 'Monitor',
    description: 'Get alerts when new grants match your criteria or deadlines approach. Never miss an opportunity.',
  },
]

export default function HowItWorksPage() {
  return (
    <main className="pt-20">
      {/* Hero */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-pulse-accent/[0.05] blur-[120px]" />
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-pulse-accent" />
            <span className="text-sm text-pulse-text-secondary">How It Works</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-pulse-text mb-4 tracking-tight">
            From search to <span className="text-pulse-accent">funded</span>
          </h1>

          <p className="text-lg text-pulse-text-secondary max-w-2xl mx-auto mb-12">
            Five simple steps to discover and win grants. No complexity, no learning curve—just results.
          </p>

          {/* Stats */}
          <div className="inline-flex items-center gap-6 md:gap-10 px-6 py-4 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <div className="text-center">
              <div className="text-2xl font-bold text-pulse-accent">&lt; 1s</div>
              <div className="text-xs text-pulse-text-tertiary">Search</div>
            </div>
            <div className="w-px h-8 bg-white/[0.08]" />
            <div className="text-center">
              <div className="text-2xl font-bold text-pulse-accent">20K+</div>
              <div className="text-xs text-pulse-text-tertiary">Grants</div>
            </div>
            <div className="w-px h-8 bg-white/[0.08]" />
            <div className="text-center">
              <div className="text-2xl font-bold text-pulse-accent">94%</div>
              <div className="text-xs text-pulse-text-tertiary">Accuracy</div>
            </div>
            <div className="w-px h-8 bg-white/[0.08]" />
            <div className="text-center">
              <div className="text-2xl font-bold text-pulse-accent">10+ hrs</div>
              <div className="text-xs text-pulse-text-tertiary">Saved/wk</div>
            </div>
          </div>
        </div>
      </section>

      {/* Steps - Vertical Timeline */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-gradient-to-b from-pulse-accent/50 via-pulse-accent/20 to-transparent" />

            <div className="space-y-8">
              {steps.map((step, index) => {
                const Icon = step.icon
                return (
                  <div key={step.number} className="relative flex gap-6 md:gap-8">
                    {/* Icon node */}
                    <div className="relative z-10 shrink-0">
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-pulse-bg border border-white/[0.08] flex items-center justify-center">
                        <Icon className="w-6 h-6 md:w-7 md:h-7 text-pulse-accent" />
                      </div>
                      <span className="absolute -top-2 -right-2 w-6 h-6 rounded-md bg-pulse-accent flex items-center justify-center text-xs font-bold text-pulse-bg">
                        {step.number}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-2 pb-4">
                      <h3 className="text-xl font-semibold text-pulse-text mb-2">
                        {step.title}
                      </h3>
                      <p className="text-pulse-text-secondary leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-y border-white/[0.04]">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '15,000+', label: 'Organizations' },
              { value: '$2.1B+', label: 'Grants Found' },
              { value: '50+', label: 'Data Sources' },
              { value: '4.9/5', label: 'User Rating' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl md:text-3xl font-bold text-pulse-text mb-1">{stat.value}</div>
                <div className="text-sm text-pulse-text-tertiary">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-pulse-accent/[0.05] blur-[120px]" />
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] mb-6">
            <Sparkles className="w-4 h-4 text-pulse-accent" />
            <span className="text-sm text-pulse-text-secondary">Ready to start?</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-pulse-text mb-4">
            Start finding grants <span className="text-pulse-accent">today</span>
          </h2>

          <p className="text-lg text-pulse-text-secondary mb-8 max-w-xl mx-auto">
            Join 15,000+ organizations discovering funding with GrantEase. Free to start.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-pulse-accent text-pulse-bg font-semibold rounded-xl hover:bg-pulse-accent/90 transition-all"
            >
              Get Started Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/[0.03] border border-white/[0.08] text-pulse-text font-semibold rounded-xl hover:border-pulse-accent/30 transition-all"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
