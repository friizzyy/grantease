import Link from 'next/link'
import { ArrowRight, Search, Filter, Target, FolderOpen, Bell } from 'lucide-react'

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
    description: 'Get alerts when new grants match your criteria or deadlines approach. Stay ahead of opportunities.',
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
            Five steps from first search to funded project. Build your profile, find matches, and apply.
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

      {/* Asymmetric bento - large featured card + 4 smaller cards */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Featured first step - spans 2 rows */}
            <div className="md:row-span-2 group relative overflow-hidden rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-transparent transition-all duration-300">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pulse-accent to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="p-8 h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-mono text-pulse-accent bg-pulse-accent/10 px-3 py-1 rounded-lg">
                    Step 01
                  </span>
                </div>

                <div className="w-16 h-16 rounded-2xl bg-pulse-accent/10 flex items-center justify-center mb-6 group-hover:bg-pulse-accent/20 transition-colors">
                  <Search className="w-8 h-8 text-pulse-accent" />
                </div>

                <h3 className="text-2xl font-semibold text-pulse-text mb-4 group-hover:text-pulse-accent transition-colors">
                  Search
                </h3>
                <p className="text-pulse-text-secondary leading-relaxed flex-1">
                  Enter keywords or describe what you need. Our AI instantly searches 50+ databases with 20,000+ active grants.
                </p>

                {/* Visual element */}
                <div className="mt-6 pt-6 border-t border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                      <div className="h-full w-3/4 bg-gradient-to-r from-pulse-accent to-emerald-400 rounded-full" />
                    </div>
                    <span className="text-xs text-pulse-accent font-mono">AI Powered</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Remaining 4 cards in 2x2 grid */}
            {steps.slice(1).map((step) => {
              const Icon = step.icon
              return (
                <div
                  key={step.number}
                  className="group relative overflow-hidden rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-transparent transition-all duration-300"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pulse-accent to-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-mono text-pulse-accent bg-pulse-accent/10 px-3 py-1 rounded-lg">
                        Step {step.number}
                      </span>
                      <div className="w-10 h-10 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center group-hover:bg-pulse-accent/10 group-hover:border-pulse-accent/20 transition-all">
                        <Icon className="w-5 h-5 text-pulse-accent" />
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-pulse-text mb-2 group-hover:text-pulse-accent transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-pulse-text-secondary text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              )
            })}
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
          <h2 className="text-3xl md:text-4xl font-bold text-pulse-text mb-4">
            Start finding grants <span className="text-pulse-accent">today</span>
          </h2>

          <p className="text-lg text-pulse-text-secondary mb-8 max-w-xl mx-auto">
            Join 15,000+ organizations discovering funding with Grants By AI.
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
