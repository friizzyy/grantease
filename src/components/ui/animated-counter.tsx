'use client'

import * as React from 'react'
import { motion, useSpring, useTransform, useInView } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AnimatedCounterProps {
  value: number
  suffix?: string
  prefix?: string
  decimals?: number
  duration?: number
  delay?: number
  className?: string
  formatOptions?: Intl.NumberFormatOptions
}

export function AnimatedCounter({
  value,
  suffix = '',
  prefix = '',
  decimals = 0,
  duration = 2,
  delay = 0,
  className,
  formatOptions,
}: AnimatedCounterProps) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  const springValue = useSpring(0, {
    stiffness: 50,
    damping: 20,
    duration: duration * 1000,
  })

  React.useEffect(() => {
    if (isInView) {
      const timeout = setTimeout(() => {
        springValue.set(value)
      }, delay * 1000)
      return () => clearTimeout(timeout)
    }
  }, [isInView, value, springValue, delay])

  const displayValue = useTransform(springValue, (latest) => {
    const formatted = formatOptions
      ? latest.toLocaleString('en-US', formatOptions)
      : latest.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return `${prefix}${formatted}${suffix}`
  })

  return (
    <motion.span
      ref={ref}
      className={cn('tabular-nums', className)}
      initial={{ opacity: 0, y: 10 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay }}
    >
      {displayValue}
    </motion.span>
  )
}

// Stat block with animated counter
interface StatBlockProps {
  value: number
  suffix?: string
  prefix?: string
  label: string
  sublabel?: string
  icon?: React.ReactNode
  trend?: { value: number; isPositive: boolean }
  delay?: number
  className?: string
}

export function StatBlock({
  value,
  suffix,
  prefix,
  label,
  sublabel,
  icon,
  trend,
  delay = 0,
  className,
}: StatBlockProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })

  return (
    <motion.div
      ref={ref}
      className={cn(
        'relative p-6 rounded-2xl bg-pulse-surface/40 backdrop-blur-sm border border-white/[0.06]',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pulse-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="relative">
        {/* Icon */}
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-pulse-accent/10 border border-pulse-accent/20 flex items-center justify-center mb-4 text-pulse-accent">
            {icon}
          </div>
        )}

        {/* Value */}
        <div className="font-serif text-4xl md:text-5xl font-medium text-pulse-text mb-2 tracking-tight">
          <AnimatedCounter
            value={value}
            suffix={suffix}
            prefix={prefix}
            delay={delay + 0.2}
          />
        </div>

        {/* Label */}
        <p className="text-sm text-pulse-text-secondary font-medium">{label}</p>

        {/* Sublabel */}
        {sublabel && (
          <p className="text-xs text-pulse-text-tertiary mt-1">{sublabel}</p>
        )}

        {/* Trend indicator */}
        {trend && (
          <div className={cn(
            'inline-flex items-center gap-1 mt-3 px-2 py-1 rounded-full text-xs font-medium',
            trend.isPositive
              ? 'bg-pulse-success/10 text-pulse-success'
              : 'bg-pulse-error/10 text-pulse-error'
          )}>
            <svg
              className={cn('w-3 h-3', !trend.isPositive && 'rotate-180')}
              fill="none"
              viewBox="0 0 12 12"
            >
              <path
                d="M6 2.5v7M6 2.5l3 3M6 2.5l-3 3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {trend.value}%
          </div>
        )}
      </div>
    </motion.div>
  )
}
