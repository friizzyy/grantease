'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Clock, Zap, Sparkles, Trophy } from 'lucide-react'
import { AnimatedCounter } from '@/components/ui/animated-counter'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const stats = [
  { icon: Clock, value: 5, suffix: ' min', label: 'Profile setup', color: 'text-pulse-accent' },
  { icon: Zap, text: 'Instant', label: 'Grant matches', color: 'text-pulse-accent' },
  { icon: Sparkles, text: 'AI-guided', label: 'Applications', color: 'text-pulse-rose' },
  { icon: Trophy, value: 100, suffix: '%', label: 'Award is yours', color: 'text-pulse-accent' },
] as const

export function AnimatedStatsBar() {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const { reduced } = useReducedMotion()

  return (
    <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 text-center">
      {stats.map((s, i) => {
        const Icon = s.icon
        const show = reduced || isInView

        return (
          <motion.div
            key={s.label}
            initial={reduced ? false : { opacity: 0, scale: 0.8, y: 12 }}
            animate={show ? { opacity: 1, scale: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: reduced ? 0 : i * 0.15, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="flex justify-center mb-2.5">
              <motion.div
                initial={reduced ? false : { scale: 0 }}
                animate={show ? { scale: 1 } : {}}
                transition={{ type: 'spring', stiffness: 260, damping: 20, delay: reduced ? 0 : i * 0.15 }}
              >
                <Icon className={`w-6 h-6 ${s.color}`} />
              </motion.div>
            </div>

            <div className={`text-stat-sm ${s.color} tabular-nums`}>
              {'value' in s && s.value !== undefined ? (
                <AnimatedCounter
                  value={s.value}
                  suffix={s.suffix}
                  delay={reduced ? 0 : i * 0.15}
                />
              ) : (
                <TextShimmer text={s.text} show={show} reduced={reduced} delay={i * 0.15} />
              )}
            </div>
            <div className="text-label-sm text-pulse-text-tertiary mt-1">{s.label}</div>
          </motion.div>
        )
      })}
    </div>
  )
}

/** Fades in text with a brief shimmer highlight */
function TextShimmer({
  text,
  show,
  reduced,
  delay,
}: {
  text: string
  show: boolean
  reduced: boolean
  delay: number
}) {
  return (
    <motion.span
      className="inline-block relative overflow-hidden"
      initial={reduced ? false : { opacity: 0 }}
      animate={show ? { opacity: 1 } : {}}
      transition={{ duration: 0.5, delay: reduced ? 0 : delay + 0.2 }}
    >
      {text}
      {!reduced && (
        <motion.span
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
          initial={{ x: '-100%', opacity: 1 }}
          animate={show ? { x: '200%', opacity: 0 } : {}}
          transition={{ duration: 0.6, delay: delay + 0.4, ease: 'easeInOut' }}
        />
      )}
    </motion.span>
  )
}
