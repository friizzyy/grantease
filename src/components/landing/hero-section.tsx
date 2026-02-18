'use client'

import * as React from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react'
import { ShimmerButton, GlowButton } from '@/components/ui/premium-button'
import { cn } from '@/lib/utils'

interface HeroSectionProps {
  categories: string[]
}

export function HeroSection({ categories }: HeroSectionProps) {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-20 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Large gradient orb */}
        <div className="absolute top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full bg-pulse-accent/[0.03] blur-[120px]" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-pulse-accent/[0.02] blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left column - Content */}
          <div className="max-w-2xl">
            {/* Eyebrow badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pulse-accent/10 border border-pulse-accent/20 mb-8">
              <Sparkles className="w-4 h-4 text-pulse-accent" />
              <span className="text-label text-pulse-accent">
                AI-Powered Grant Discovery
              </span>
            </div>

            {/* Main headline - Large and intentional */}
            <h1 className="text-display-hero text-pulse-text mb-6">
              Find grants across{' '}
              <span className="relative">
                <span className="text-gradient">every category</span>
                {/* Underline accent */}
                <span className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-pulse-accent to-pulse-accent/0 rounded-full" />
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-body-lg text-pulse-text-secondary mb-10 max-w-xl">
              Federal, state, local, nonprofit, and private funding opportunities.
              Search intelligently, qualify precisely, apply with confidence.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 mb-12">
              <ShimmerButton size="xl" href="/register">
                Start Free Discovery
                <ArrowRight className="w-5 h-5 ml-1" />
              </ShimmerButton>
              <GlowButton size="xl" href="/how-it-works">
                See How It Works
              </GlowButton>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap gap-x-8 gap-y-3 text-body-sm text-pulse-text-secondary">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-pulse-accent" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-pulse-accent" />
                <span>20,000+ grants indexed</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-pulse-accent" />
                <span>Updated daily</span>
              </div>
            </div>
          </div>

          {/* Right column - Visual element */}
          <div className="hidden lg:block relative">
            {/* Floating card mockup */}
            <div className="relative">
              {/* Main card */}
              <div className="relative bg-pulse-elevated/80 backdrop-blur-xl border border-pulse-border/50 rounded-3xl p-8 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)]">
                {/* Card header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <div className="text-label-sm text-pulse-text-secondary mb-1">Matching Grants</div>
                    <div className="text-stat-sm text-pulse-text">2,847</div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-pulse-success/10 border border-pulse-success/20 text-pulse-success text-body-sm font-medium">
                    +127 today
                  </div>
                </div>

                {/* Sample grant cards */}
                <div className="space-y-4">
                  {[
                    { title: 'Community Development Block Grant', amount: '$500K - $2M', deadline: '45 days' },
                    { title: 'Small Business Innovation Research', amount: '$150K - $1M', deadline: '30 days' },
                    { title: 'Environmental Justice Grant', amount: '$75K - $500K', deadline: '60 days' },
                  ].map((grant, i) => (
                    <div
                      key={i}
                      className={cn(
                        'p-4 rounded-xl bg-pulse-surface/50 border border-pulse-border/30',
                        'transition-all duration-300 hover:border-pulse-accent/30 hover:bg-pulse-surface/80'
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-heading-sm text-pulse-text mb-1">{grant.title}</div>
                          <div className="text-body-sm text-pulse-text-secondary">{grant.amount}</div>
                        </div>
                        <div className="text-label-sm text-pulse-accent whitespace-nowrap">{grant.deadline}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bottom action */}
                <div className="mt-6 pt-6 border-t border-pulse-border/30">
                  <div className="flex items-center justify-between text-body-sm">
                    <span className="text-pulse-text-secondary">View all matching grants</span>
                    <ArrowRight className="w-4 h-4 text-pulse-accent" />
                  </div>
                </div>
              </div>

              {/* Floating accent elements */}
              <div className="absolute -top-6 -right-6 w-24 h-24 rounded-2xl bg-pulse-accent/10 border border-pulse-accent/20 flex items-center justify-center backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-stat-sm text-pulse-accent">98%</div>
                  <div className="text-label-sm text-pulse-accent/70">Match rate</div>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-4 px-4 py-3 rounded-xl bg-pulse-surface/90 border border-pulse-border/50 backdrop-blur-sm shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-pulse-success animate-pulse" />
                  <span className="text-body-sm text-pulse-text">Live data sync active</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Categories row */}
        <div className="mt-20 pt-12 border-t border-pulse-border/30">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-label text-pulse-text-secondary">Popular categories</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/app/discover?category=${encodeURIComponent(cat)}`}
                className={cn(
                  'px-4 py-2.5 min-h-[44px] inline-flex items-center rounded-full text-body-sm font-medium',
                  'bg-pulse-surface/60 border border-pulse-border/50 text-pulse-text-secondary',
                  'transition-colors duration-200',
                  'hover:border-pulse-accent/30 hover:text-pulse-accent hover:bg-pulse-surface',
                  'active:border-pulse-accent/30 active:text-pulse-accent'
                )}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
