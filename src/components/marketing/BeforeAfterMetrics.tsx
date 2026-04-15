'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { AnimatedCounter } from '@/components/ui/animated-counter'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const painPoints = [
  {
    value: 15,
    suffix: '+',
    label: 'databases to search',
    detail: 'Each with different formats, syntax, and eligibility rules',
  },
  {
    value: 10,
    prefix: '$',
    suffix: 'K+',
    label: 'in consultant fees per grant',
    detail: 'Money that should go directly to your mission',
  },
  {
    value: 80,
    suffix: ' hrs',
    label: 'per single application',
    detail: 'Rewriting the same org info every time you apply',
  },
]

export function BeforeAfterMetrics() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const { reduced } = useReducedMotion()
  const show = reduced || isInView

  return (
    <div ref={ref} className="space-y-4">
      {/* Hero stat panel */}
      <motion.div
        className="relative p-8 sm:p-10 lg:p-12 rounded-2xl bg-white/[0.015] border border-white/[0.06] overflow-hidden"
        initial={reduced ? false : { opacity: 0, y: 12 }}
        animate={show ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-pulse-error/[0.04] via-transparent to-transparent pointer-events-none" />

        <div className="relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-3 sm:gap-8">
            <div className="text-[4.5rem] sm:text-[6rem] lg:text-[7rem] font-display font-bold leading-[0.85] tracking-tighter text-pulse-text tabular-nums">
              400<span className="text-pulse-error/70">+</span>
            </div>
            <div className="sm:pb-3 lg:pb-5">
              <p className="text-heading-sm sm:text-heading text-pulse-text mb-1">hours wasted annually</p>
              <p className="text-body-sm text-pulse-text-tertiary">per organization, just searching for grant funding</p>
            </div>
          </div>

          {/* Waste indicator bar */}
          <div className="mt-8 sm:mt-10">
            <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-pulse-error/50 via-pulse-error/30 to-pulse-error/10"
                initial={{ width: 0 }}
                animate={show ? { width: '93%' } : {}}
                transition={{ duration: 1.2, delay: reduced ? 0 : 0.5, ease: [0.25, 0.1, 0.25, 1] }}
              />
            </div>
            <p className="mt-2.5 text-caption text-pulse-text-tertiary">93% of time spent on manual, repetitive processes</p>
          </div>
        </div>
      </motion.div>

      {/* Pain cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {painPoints.map((point, i) => (
          <motion.div
            key={point.label}
            className="p-6 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.03] transition-colors duration-200"
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={show ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.4, delay: reduced ? 0 : 0.3 + i * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="text-stat-sm text-pulse-text mb-1.5">
              {show ? (
                <AnimatedCounter
                  value={point.value}
                  prefix={point.prefix}
                  suffix={point.suffix}
                  delay={reduced ? 0 : 0.5 + i * 0.15}
                />
              ) : (
                `${point.prefix || ''}0${point.suffix || ''}`
              )}
            </div>
            <p className="text-body-sm font-medium text-pulse-text-secondary mb-2">{point.label}</p>
            <p className="text-caption text-pulse-text-tertiary leading-relaxed">{point.detail}</p>
          </motion.div>
        ))}
      </div>

      {/* Resolution strip */}
      <motion.div
        className="p-5 rounded-xl bg-pulse-accent/[0.04] border border-pulse-accent/10"
        initial={reduced ? false : { opacity: 0, y: 8 }}
        animate={show ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.4, delay: reduced ? 0 : 0.7, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-0">
          <span className="text-label-sm font-semibold text-pulse-accent tracking-wide uppercase shrink-0 sm:mr-5">
            With Grants By AI
          </span>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-body-sm text-pulse-text-secondary">
            <span><strong className="text-pulse-accent font-semibold">1</strong> unified search</span>
            <span className="hidden sm:inline text-white/[0.08]">&middot;</span>
            <span><strong className="text-pulse-accent font-semibold">$0</strong> to start</span>
            <span className="hidden sm:inline text-white/[0.08]">&middot;</span>
            <span><strong className="text-pulse-accent font-semibold">5 hrs</strong> not 80</span>
            <span className="hidden sm:inline text-white/[0.08]">&middot;</span>
            <span><strong className="text-pulse-accent font-semibold">0</strong> missed deadlines</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
