'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

// Simple animated headline - no framer motion, just CSS animations
interface AnimatedHeadlineProps {
  children: string
  className?: string
  highlightWords?: string[]
  highlightClassName?: string
}

export function AnimatedHeadline({
  children,
  className,
  highlightWords = [],
  highlightClassName = 'text-gradient',
}: AnimatedHeadlineProps) {
  const words = children.split(' ')

  return (
    <h1 className={cn('font-serif', className)}>
      {words.map((word, i) => (
        <span key={i}>
          <span className={highlightWords.includes(word.toLowerCase()) ? highlightClassName : ''}>
            {word}
          </span>
          {i < words.length - 1 && ' '}
        </span>
      ))}
    </h1>
  )
}

// Animated stat component with CSS
interface AnimatedStatProps {
  value: string
  label: string
  className?: string
  delay?: number
}

export function AnimatedStat({ value, label, className, delay = 0 }: AnimatedStatProps) {
  return (
    <div
      className={cn('text-center animate-fade-in-up', className)}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="text-stat text-pulse-accent mb-2">
        {value}
      </div>
      <div className="text-body-sm text-pulse-text-secondary">{label}</div>
    </div>
  )
}

// Simple feature card
interface AnimatedFeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  index?: number
}

export function AnimatedFeatureCard({ icon, title, description, index = 0 }: AnimatedFeatureCardProps) {
  return (
    <div
      className={cn(
        'group p-8 rounded-xl bg-pulse-surface/60 border border-pulse-border backdrop-blur-sm',
        'hover:border-pulse-accent/20 hover:shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:-translate-y-0.5',
        'transition-all duration-200 animate-fade-in-up'
      )}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex items-start gap-5">
        <div className="w-12 h-12 rounded-xl bg-pulse-accent/10 border border-pulse-accent/20 flex items-center justify-center shrink-0 group-hover:bg-pulse-accent/15 transition-colors">
          {icon}
        </div>
        <div>
          <h3 className="text-heading-sm text-pulse-text mb-2 group-hover:text-pulse-accent transition-colors">
            {title}
          </h3>
          <p className="text-body-sm text-pulse-text-secondary">
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}

// Category badge
interface AnimatedCategoryBadgeProps {
  children: string
  index?: number
  onClick?: () => void
}

export function AnimatedCategoryBadge({ children, index = 0, onClick }: AnimatedCategoryBadgeProps) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center rounded-full px-3 py-1 text-body-sm border border-pulse-border text-pulse-text-secondary hover:border-pulse-accent/30 hover:text-pulse-accent hover:bg-pulse-accent/5 transition-colors"
    >
      {children}
    </button>
  )
}
