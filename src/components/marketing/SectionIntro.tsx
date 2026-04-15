'use client'

import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

const accentColors = {
  accent: {
    dot: 'bg-pulse-accent',
    line: 'bg-pulse-accent',
    label: 'text-pulse-accent',
  },
  rose: {
    dot: 'bg-pulse-rose',
    line: 'bg-pulse-rose',
    label: 'text-pulse-rose',
  },
  indigo: {
    dot: 'bg-pulse-indigo',
    line: 'bg-pulse-indigo',
    label: 'text-pulse-indigo',
  },
} as const

interface SectionIntroProps {
  label: string
  children: React.ReactNode
  description?: string
  accent?: keyof typeof accentColors
  align?: 'left' | 'center'
  headingAs?: 'h1' | 'h2' | 'h3'
  className?: string
}

export function SectionIntro({
  label,
  children,
  description,
  accent = 'indigo',
  align = 'left',
  headingAs: Tag = 'h2',
  className,
}: SectionIntroProps) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  const reduced = useReducedMotion()

  const colors = accentColors[accent]
  const show = reduced || isInView

  return (
    <div
      ref={ref}
      className={cn(
        align === 'center' && 'text-center',
        className,
      )}
    >
      {/* Eyebrow: dot + label */}
      <div
        className={cn(
          'flex items-center gap-2.5 mb-3',
          align === 'center' && 'justify-center',
        )}
        style={{
          opacity: show ? 1 : 0,
          transform: show ? 'translateY(0)' : 'translateY(8px)',
          transition: reduced ? 'none' : 'opacity 0.5s ease, transform 0.5s ease',
          transitionDelay: reduced ? '0ms' : '0ms',
        }}
      >
        <span className={cn('w-2 h-2 rounded-full', colors.dot)} />
        <span className={cn('text-label-sm font-medium tracking-wide uppercase', colors.label)}>
          {label}
        </span>
      </div>

      {/* Accent line */}
      <div
        className={cn('h-[2px] rounded-full mb-4', colors.line, align === 'center' && 'mx-auto')}
        style={{
          width: show ? 40 : 0,
          transition: reduced ? 'none' : 'width 0.4s ease',
          transitionDelay: reduced ? '0ms' : '100ms',
        }}
      />

      {/* Heading */}
      <Tag
        className="text-display-section text-pulse-text"
        style={{
          opacity: show ? 1 : 0,
          transform: show ? 'translateY(0)' : 'translateY(8px)',
          transition: reduced ? 'none' : 'opacity 0.5s ease, transform 0.5s ease',
          transitionDelay: reduced ? '0ms' : '200ms',
        }}
      >
        {children}
      </Tag>

      {/* Description */}
      {description && (
        <p
          className={cn('text-body text-pulse-text-secondary mt-3', align === 'center' && 'mx-auto max-w-md')}
          style={{
            opacity: show ? 1 : 0,
            transform: show ? 'translateY(0)' : 'translateY(8px)',
            transition: reduced ? 'none' : 'opacity 0.5s ease, transform 0.5s ease',
            transitionDelay: reduced ? '0ms' : '350ms',
          }}
        >
          {description}
        </p>
      )}
    </div>
  )
}
