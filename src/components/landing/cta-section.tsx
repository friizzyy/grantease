'use client'

import * as React from 'react'
import { ArrowRight } from 'lucide-react'
import { ShimmerButton, ShineButton } from '@/components/ui/premium-button'
import { cn } from '@/lib/utils'

export function CTASection() {
  return (
    <section className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-pulse-accent/[0.04] blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-pulse-accent/[0.03] blur-[80px]" />
      </div>

      {/* Border */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-pulse-border to-transparent" />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Content card */}
        <div
          className={cn(
            'relative p-6 sm:p-12 md:p-16 rounded-3xl text-center',
            'bg-gradient-to-br from-pulse-elevated/80 to-pulse-surface/60',
            'border border-pulse-border/40',
            'backdrop-blur-xl'
          )}
        >
          {/* Accent glow */}
          <div className="absolute -top-px inset-x-12 h-px bg-gradient-to-r from-transparent via-pulse-accent/50 to-transparent" />

          <h2 className="text-display-page text-pulse-text mb-6">
            Ready to find your funding?
          </h2>

          <p className="text-body-lg text-pulse-text-secondary mb-10 max-w-2xl mx-auto">
            Join thousands of organizations who have discovered grants they never knew existed.
            Start your free search today.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <ShimmerButton size="xl" href="/register">
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-1" />
            </ShimmerButton>
            <ShineButton href="/pricing" className="h-16 px-10 text-lg">
              View Pricing
            </ShineButton>
          </div>

          {/* Trust line */}
          <div className="mt-10 pt-8 border-t border-pulse-border/30">
            <p className="text-body-sm text-pulse-text-tertiary">
              No credit card required · Free tier available · Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
