'use client'

import * as React from 'react'
import { Shield, Zap, Database, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const trustPoints = [
  'Federal grants from Grants.gov and SAM.gov',
  'State and local government programs',
  'Private foundation opportunities',
  'Corporate giving programs',
]

const trustStats = [
  { icon: Shield, value: 'Verified', label: 'Official sources only' },
  { icon: Zap, value: 'Daily', label: 'Updates & new grants' },
  { icon: Database, value: '50+', label: 'Data sources integrated' },
]

export function TrustSection() {
  return (
    <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-pulse-surface/30 to-transparent" />

      {/* Borders */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-pulse-border to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-pulse-border to-transparent" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left column - content */}
          <div>
            <span className="text-label text-pulse-accent mb-4 inline-block">
              Trusted Data
            </span>

            <h2 className="text-display-section text-pulse-text mb-6">
              Comprehensive coverage, real-time updates
            </h2>

            <p className="text-body-lg text-pulse-text-secondary mb-8">
              We aggregate data from official sources including Grants.gov, SAM.gov, state portals,
              and foundation databases. Our system runs daily to ensure you always see the latest opportunities.
            </p>

            <div className="space-y-4">
              {trustPoints.map((item) => (
                <div key={item} className="flex items-center gap-3 group">
                  <div className="w-6 h-6 rounded-full bg-pulse-accent/10 border border-pulse-accent/20 flex items-center justify-center transition-colors group-hover:bg-pulse-accent/20">
                    <ChevronRight className="w-3 h-3 text-pulse-accent" />
                  </div>
                  <span className="text-body text-pulse-text-secondary group-hover:text-pulse-text transition-colors">
                    {item}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right column - stat cards */}
          <div className="grid grid-cols-3 gap-4">
            {trustStats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <div
                  key={stat.label}
                  className={cn(
                    'p-6 rounded-2xl text-center',
                    'bg-pulse-surface/60 border border-pulse-border/40',
                    'transition-all duration-300',
                    'hover:border-pulse-accent/20 hover:bg-pulse-surface/80',
                    index === 2 && 'col-span-3 md:col-span-1'
                  )}
                >
                  <div className="w-10 h-10 rounded-xl bg-pulse-accent/10 border border-pulse-accent/20 flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-5 h-5 text-pulse-accent" />
                  </div>
                  <div className="text-stat-sm text-pulse-text mb-1">{stat.value}</div>
                  <div className="text-label-sm text-pulse-text-tertiary normal-case">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
