'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface FeatureCardProps {
  icon: LucideIcon
  title: string
  description: string
  className?: string
  iconClassName?: string
  accentColor?: string
}

// Premium feature card with hover effects
export function FeatureCard({
  icon: Icon,
  title,
  description,
  className,
  iconClassName,
  accentColor = 'pulse-accent',
}: FeatureCardProps) {
  return (
    <div
      className={cn(
        'group relative p-8 rounded-2xl',
        'bg-gradient-to-br from-pulse-surface/80 to-pulse-surface/40',
        'border border-pulse-border/50',
        'transition-all duration-500 ease-out',
        'hover:border-pulse-accent/30',
        'hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)]',
        'hover:-translate-y-1',
        className
      )}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-pulse-accent/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      {/* Icon container */}
      <div
        className={cn(
          'relative w-14 h-14 rounded-xl mb-6',
          'bg-gradient-to-br from-pulse-accent/20 to-pulse-accent/5',
          'border border-pulse-accent/20',
          'flex items-center justify-center',
          'transition-all duration-500',
          'group-hover:scale-110 group-hover:shadow-[0_0_30px_rgba(64,255,170,0.2)]',
          iconClassName
        )}
      >
        <Icon className="w-7 h-7 text-pulse-accent" />
      </div>

      {/* Content */}
      <div className="relative">
        <h3 className="text-heading-lg text-pulse-text mb-3 transition-colors duration-300 group-hover:text-pulse-accent">
          {title}
        </h3>
        <p className="text-body text-pulse-text-secondary">
          {description}
        </p>
      </div>

      {/* Bottom accent line */}
      <div className="absolute inset-x-8 bottom-0 h-px bg-gradient-to-r from-transparent via-pulse-accent/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
    </div>
  )
}

// Bento-style feature card for larger displays
interface BentoCardProps {
  icon: LucideIcon
  title: string
  description: string
  className?: string
  size?: 'default' | 'large' | 'wide'
  children?: React.ReactNode
}

export function BentoCard({
  icon: Icon,
  title,
  description,
  className,
  size = 'default',
  children,
}: BentoCardProps) {
  const sizeClasses = {
    default: '',
    large: 'md:col-span-2 md:row-span-2',
    wide: 'md:col-span-2',
  }

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-3xl',
        'bg-gradient-to-br from-pulse-elevated/90 to-pulse-surface/60',
        'border border-pulse-border/40',
        'p-8',
        'transition-all duration-500',
        'hover:border-pulse-accent/20',
        'hover:shadow-[0_30px_80px_-20px_rgba(0,0,0,0.5)]',
        sizeClasses[size],
        className
      )}
    >
      {/* Background gradient glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-pulse-accent/10 blur-3xl opacity-0 transition-opacity duration-700 group-hover:opacity-100" />

      <div className="relative z-10">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-pulse-accent/10 border border-pulse-accent/20 flex items-center justify-center mb-6">
          <Icon className="w-6 h-6 text-pulse-accent" />
        </div>

        {/* Title */}
        <h3 className="text-heading-lg text-pulse-text mb-3">
          {title}
        </h3>

        {/* Description */}
        <p className="text-body text-pulse-text-secondary mb-6">
          {description}
        </p>

        {/* Custom content */}
        {children}
      </div>
    </div>
  )
}

// Stat card for metrics display
interface StatCardProps {
  value: string
  label: string
  sublabel?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
}

export function StatCard({ value, label, sublabel, trend, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'group relative p-6 rounded-2xl',
        'bg-pulse-surface/60 border border-pulse-border/50',
        'transition-all duration-300',
        'hover:border-pulse-accent/20 hover:bg-pulse-surface/80',
        className
      )}
    >
      {/* Value */}
      <div className="text-stat text-pulse-text mb-2">
        {value}
      </div>

      {/* Label */}
      <div className="text-body-sm font-medium text-pulse-text-secondary mb-1">
        {label}
      </div>

      {/* Sublabel */}
      {sublabel && (
        <div className="text-label-sm text-pulse-text-tertiary normal-case">
          {sublabel}
        </div>
      )}

      {/* Trend indicator */}
      {trend && (
        <div
          className={cn(
            'absolute top-6 right-6 inline-flex items-center gap-1 px-2 py-1 rounded-full text-label-sm',
            trend.isPositive
              ? 'bg-pulse-success/10 text-pulse-success'
              : 'bg-pulse-error/10 text-pulse-error'
          )}
        >
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
  )
}
