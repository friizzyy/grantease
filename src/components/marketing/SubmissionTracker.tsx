'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Check, Clock } from 'lucide-react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const stages = [
  { label: 'Application drafted', date: 'Mar 12', status: 'complete' as const, color: 'bg-pulse-accent' },
  { label: 'Review complete', date: 'Mar 14', status: 'complete' as const, color: 'bg-pulse-accent' },
  { label: 'Submitted', date: 'Mar 15', status: 'active' as const, color: 'bg-pulse-indigo' },
  { label: 'Award decision', date: 'Apr 30', status: 'pending' as const, color: 'bg-white/[0.08]' },
]

interface SubmissionTrackerProps {
  compact?: boolean
}

export function SubmissionTracker({ compact = false }: SubmissionTrackerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const { reduced } = useReducedMotion()
  const show = reduced || isInView

  return (
    <div ref={ref} className={`rounded-xl border border-white/[0.06] bg-white/[0.03] ${compact ? 'p-3' : 'p-4'}`}>
      {/* Pipeline */}
      <div className={`space-y-0 ${compact ? 'ml-1' : 'ml-2'}`}>
        {stages.map((stage, i) => (
          <div key={stage.label}>
            {/* Stage row */}
            <motion.div
              className="flex items-center gap-3"
              initial={reduced ? false : { opacity: 0, x: -8 }}
              animate={show ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.35, delay: reduced ? 0 : i * 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {/* Circle */}
              <StageCircle stage={stage} show={show} reduced={reduced} delay={i * 0.3} />

              {/* Label + date */}
              <div className="flex-1 flex items-center justify-between min-w-0">
                <span className={`${compact ? 'text-caption' : 'text-body-sm'} ${
                  stage.status === 'pending' ? 'text-pulse-text-tertiary' : 'text-pulse-text-secondary'
                } truncate`}>
                  {stage.label}
                </span>
                <span className={`${compact ? 'text-[10px]' : 'text-caption'} text-pulse-text-tertiary tabular-nums shrink-0 ml-2`}>
                  {stage.date}
                </span>
              </div>
            </motion.div>

            {/* Connector line */}
            {i < stages.length - 1 && (
              <div className={`${compact ? 'ml-[7px]' : 'ml-[9px]'} ${compact ? 'h-4' : 'h-5'} flex`}>
                <motion.div
                  className="w-[2px] bg-white/[0.08] origin-top"
                  initial={reduced ? false : { scaleY: 0 }}
                  animate={show ? { scaleY: 1 } : {}}
                  transition={{ duration: 0.3, delay: reduced ? 0 : i * 0.3 + 0.15, ease: 'easeOut' }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Deadline badge */}
      <motion.div
        className={`${compact ? 'mt-3 pt-2' : 'mt-4 pt-3'} border-t border-white/[0.06] flex items-center gap-2`}
        initial={reduced ? false : { opacity: 0 }}
        animate={show ? { opacity: 1 } : {}}
        transition={{ duration: 0.4, delay: reduced ? 0 : 1.4 }}
      >
        <Clock className={`${compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-pulse-text-tertiary`} />
        <span className={`${compact ? 'text-caption' : 'text-body-sm'} text-pulse-text-tertiary`}>
          45 days until decision
        </span>
      </motion.div>
    </div>
  )
}

function StageCircle({
  stage,
  show,
  reduced,
  delay,
}: {
  stage: (typeof stages)[number]
  show: boolean
  reduced: boolean
  delay: number
}) {
  const size = 'w-[18px] h-[18px]'

  if (stage.status === 'pending') {
    return (
      <div className={`${size} rounded-full border-2 border-white/[0.12] shrink-0`} />
    )
  }

  if (stage.status === 'active') {
    return (
      <div className="relative shrink-0">
        <motion.div
          className={`${size} rounded-full ${stage.color} flex items-center justify-center`}
          initial={reduced ? false : { scale: 0 }}
          animate={show ? { scale: [0, 1.2, 1] } : {}}
          transition={{ duration: 0.4, delay: reduced ? 0 : delay + 0.1 }}
        >
          <Check className="w-2.5 h-2.5 text-white" />
        </motion.div>
        {/* Pulsing ring — CSS animation for performance */}
        {!reduced && (
          <div
            className={`absolute inset-[-3px] rounded-full border-2 ${stage.color.replace('bg-', 'border-')} animate-pulse-ring`}
          />
        )}
      </div>
    )
  }

  // complete
  return (
    <motion.div
      className={`${size} rounded-full ${stage.color} flex items-center justify-center shrink-0`}
      initial={reduced ? false : { scale: 0 }}
      animate={show ? { scale: [0, 1.2, 1] } : {}}
      transition={{ duration: 0.4, delay: reduced ? 0 : delay + 0.1 }}
    >
      <Check className="w-2.5 h-2.5 text-white" />
    </motion.div>
  )
}
