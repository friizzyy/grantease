import Link from 'next/link'
import { ArrowRight, CheckCircle2, X, Check, Bell, FolderOpen, Target, Search } from 'lucide-react'
import { HeroSearch } from '@/components/marketing/HeroSearch'
import { FloatingCard, PulsingDot } from '@/components/marketing/HeroAnimations'

export default function HomePage() {
  return (
    <main className="pt-20">
      {/* Hero - Glass aesthetic with live search */}
      <section className="min-h-[95vh] flex items-center px-4 sm:px-6 lg:px-8 py-20 relative overflow-hidden">
        {/* Ambient background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-pulse-accent/[0.05] blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-emerald-500/[0.03] blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto w-full relative z-10">
          {/* Floating stats - Left */}
          <FloatingCard className="hidden lg:block absolute top-1/4 left-0" delay={0}>
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5">
              <div className="text-3xl font-bold text-pulse-text mb-1">$12B+</div>
              <div className="text-sm text-pulse-text-tertiary">Available funding</div>
            </div>
          </FloatingCard>

          {/* Floating stats - Right */}
          <FloatingCard className="hidden lg:block absolute top-1/3 right-0" delay={1}>
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5">
              <div className="text-3xl font-bold text-pulse-accent mb-1">20,000+</div>
              <div className="text-sm text-pulse-text-tertiary">Active grants</div>
            </div>
          </FloatingCard>

          <div className="text-center max-w-4xl mx-auto">
            {/* Premium badge */}
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/[0.03] backdrop-blur-md border border-white/[0.08] mb-10">
              <div className="flex items-center gap-1.5">
                <PulsingDot />
                <span className="text-xs font-medium text-pulse-accent uppercase tracking-wider">Live</span>
              </div>
              <div className="w-px h-4 bg-white/10" />
              <span className="text-sm text-pulse-text-secondary">2,847 grants indexed today</span>
            </div>

            {/* Main headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-pulse-text leading-[1.05] tracking-tight mb-8">
              Find grants for your
              <br />
              <span className="bg-gradient-to-r from-pulse-accent via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                organization in seconds
              </span>
            </h1>

            <p className="text-xl text-pulse-text-secondary max-w-2xl mx-auto mb-12 leading-relaxed">
              Search <span className="text-pulse-text font-semibold">20,000+ grants</span> from federal, state & private sources.
              One search. All the funding opportunities.
            </p>

            {/* Interactive Search Component */}
            <HeroSearch />

            {/* Trust indicators */}
            <div className="flex flex-wrap justify-center gap-8 mt-10 text-sm text-pulse-text-tertiary">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-pulse-accent" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-pulse-accent" />
                <span>50+ data sources</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-pulse-accent" />
                <span>15,000+ organizations</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 border-y border-white/[0.04] bg-white/[0.01]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: '20,000+', label: 'Active Grants' },
              { value: '50+', label: 'Data Sources' },
              { value: '$12B+', label: 'Total Funding' },
              { value: '94%', label: 'Match Accuracy' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-pulse-text mb-1">{stat.value}</div>
                <div className="text-sm text-pulse-text-tertiary">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features - Glass cards */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-bold text-pulse-text mb-4">
              Everything you need to win grants
            </h2>
            <p className="text-xl text-pulse-text-secondary">
              Powerful tools built for organizations serious about funding.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Search, title: 'Smart Search', desc: 'AI-powered search across 50+ databases' },
              { icon: Target, title: 'Match Scoring', desc: 'See which grants fit your organization' },
              { icon: Bell, title: 'Deadline Alerts', desc: 'Automatic reminders for every deadline' },
              { icon: FolderOpen, title: 'Workspace', desc: 'Track all applications in one place' },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group p-6 rounded-2xl bg-white/[0.02] backdrop-blur border border-white/[0.06] hover:border-pulse-accent/20 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-pulse-accent/10 flex items-center justify-center mb-4 group-hover:bg-pulse-accent/20 transition-colors">
                  <feature.icon className="w-6 h-6 text-pulse-accent" />
                </div>
                <h3 className="text-lg font-semibold text-pulse-text mb-2">{feature.title}</h3>
                <p className="text-sm text-pulse-text-secondary">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem / Solution Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white/[0.01] border-y border-white/[0.04]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-pulse-text mb-4">
              Stop wasting time on scattered searches
            </h2>
            <p className="text-lg text-pulse-text-secondary">
              See how Grants By AI simplifies your grant research
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Before */}
            <div className="relative">
              <div className="absolute -top-4 left-4 px-4 py-2 bg-pulse-error/10 border border-pulse-error/20 rounded-full">
                <span className="text-sm font-semibold text-pulse-error">The Old Way</span>
              </div>
              <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 pt-12 h-full">
                <div className="space-y-4">
                  {[
                    'Search 10+ different websites',
                    'Manually track deadlines',
                    'Miss opportunities you never find',
                    'Spend 20+ hours/week researching',
                    'No idea if you\'re eligible',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-pulse-error/10 flex items-center justify-center shrink-0">
                        <X className="w-4 h-4 text-pulse-error" />
                      </div>
                      <span className="text-pulse-text-secondary">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* After */}
            <div className="relative">
              <div className="absolute -top-4 left-4 px-4 py-2 bg-pulse-accent/10 border border-pulse-accent/20 rounded-full">
                <span className="text-sm font-semibold text-pulse-accent">With Grants By AI</span>
              </div>
              <div className="bg-gradient-to-br from-pulse-accent/5 to-transparent border border-pulse-accent/20 rounded-2xl p-8 pt-12 h-full">
                <div className="space-y-4">
                  {[
                    'One search across all 50+ databases',
                    'Automatic deadline tracking & alerts',
                    'AI finds grants you\'d never discover',
                    'Research done in minutes',
                    'Eligibility matching before you apply',
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-pulse-accent/20 flex items-center justify-center shrink-0">
                        <Check className="w-4 h-4 text-pulse-accent" />
                      </div>
                      <span className="text-pulse-text">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-pulse-text mb-6">
            Start finding grants
            <span className="text-pulse-accent"> today</span>
          </h2>
          <p className="text-xl text-pulse-text-secondary mb-10 max-w-2xl mx-auto">
            Join 15,000+ organizations already using Grants By AI.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-10 py-5 bg-pulse-accent text-pulse-bg font-semibold text-lg rounded-xl hover:bg-pulse-accent/90 transition-colors"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="mt-6 text-sm text-pulse-text-tertiary">
            No credit card required • Free forever plan
          </p>
        </div>
      </section>
    </main>
  )
}
