'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Check, AlertCircle } from 'lucide-react'
import { AnimatedCounter } from '@/components/ui/animated-counter'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const requirements = [
  { label: 'Org type: 501(c)(3)', status: 'pass' as const },
  { label: 'Revenue under $5M', status: 'pass' as const },
  { label: 'Eligible state', status: 'pass' as const },
  { label: 'Environmental focus', status: 'pass' as const },
  { label: 'Operating 2+ years', status: 'partial' as const },
]

export function EligibilityBreakdown() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const { reduced } = useReducedMotion()
  const show = reduced || isInView

  return (
    <div ref={ref} className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1.5 h-1.5 rounded-full bg-pulse-accent" />
        <span className="text-caption text-pulse-text-tertiary font-medium">
          Eligibility check
        </span>
      </div>

      {/* Requirement rows */}
      <div className="space-y-2">
        {requirements.map((req, i) => (
          <motion.div
            key={req.label}
            className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-white/[0.02]"
            initial={reduced ? false : { opacity: 0, x: -8 }}
            animate={show ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.35, delay: reduced ? 0 : i * 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <span className="text-caption text-pulse-text-tertiary">{req.label}</span>
            <StatusIcon status={req.status} show={show} reduced={reduced} delay={i * 0.2 + 0.15} />
          </motion.div>
        ))}
      </div>

      {/* Overall score */}
      <div className="mt-3 pt-3 border-t border-white/[0.06]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-body-sm font-medium text-pulse-text-secondary">
            Overall match
          </span>
          <span className="text-body-sm font-bold text-pulse-accent tabular-nums">
            {show ? (
              <AnimatedCounter value={88} suffix="%" delay={reduced ? 0 : 1.2} />
            ) : (
              '0%'
            )}
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-pulse-accent"
            initial={{ width: 0 }}
            animate={show ? { width: '88%' } : {}}
            transition={{ duration: 0.8, delay: reduced ? 0 : 1.2, ease: 'easeOut' }}
          />
        </div>
      </div>
    </div>
  )
}

function StatusIcon({
  status,
  show,
  reduced,
  delay,
}: {
  status: 'pass' | 'partial'
  show: boolean
  reduced: boolean
  delay: number
}) {
  const isPass = status === 'pass'

  return (
    <motion.div
      initial={reduced ? false : { scale: 0, opacity: 0 }}
      animate={show ? { scale: [0, 1.2, 1], opacity: 1 } : {}}
      transition={{ duration: 0.35, delay: reduced ? 0 : delay }}
    >
      {isPass ? (
        <Check className="w-3.5 h-3.5 text-pulse-accent" />
      ) : (
        <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
      )}
    </motion.div>
  )
}
