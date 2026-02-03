'use client'

import * as React from 'react'
import { StatCard } from '@/components/ui/feature-card'
import { cn } from '@/lib/utils'

interface Stat {
  value: string
  label: string
}

interface StatsSectionProps {
  stats: Stat[]
}

export function StatsSection({ stats }: StatsSectionProps) {
  return (
    <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-pulse-accent/[0.02] via-transparent to-pulse-accent/[0.02]" />

      {/* Top border */}
      <div className="absolute inset-x-0 top-0">
        <div className="h-px bg-gradient-to-r from-transparent via-pulse-border to-transparent" />
        <div className="h-px bg-gradient-to-r from-transparent via-pulse-accent/20 to-transparent blur-sm" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={cn(
                'text-center p-6 lg:p-8 rounded-2xl',
                'bg-pulse-surface/40 backdrop-blur-sm',
                'border border-pulse-border/30',
                'transition-all duration-500',
                'hover:border-pulse-accent/20 hover:bg-pulse-surface/60'
              )}
            >
              <div className="text-stat text-pulse-accent mb-3">
                {stat.value}
              </div>
              <div className="text-body-sm text-pulse-text-secondary font-medium">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom border */}
      <div className="absolute inset-x-0 bottom-0">
        <div className="h-px bg-gradient-to-r from-transparent via-pulse-border to-transparent" />
        <div className="h-px bg-gradient-to-r from-transparent via-pulse-accent/20 to-transparent blur-sm" />
      </div>
    </section>
  )
}
