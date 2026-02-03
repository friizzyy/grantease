'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface ShimmerProps {
  className?: string
  width?: string | number
  height?: string | number
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
}

export function Shimmer({
  className,
  width,
  height,
  rounded = 'lg',
}: ShimmerProps) {
  const roundedClasses = {
    none: '',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    full: 'rounded-full',
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden bg-pulse-surface/60',
        roundedClasses[rounded],
        className
      )}
      style={{ width, height }}
    >
      <div
        className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite]"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.04) 20%, rgba(255, 255, 255, 0.08) 60%, transparent 100%)',
        }}
      />
    </div>
  )
}

// Card skeleton
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'p-6 rounded-2xl bg-pulse-surface/40 border border-white/[0.04]',
        className
      )}
    >
      <div className="flex items-start gap-4">
        <Shimmer width={48} height={48} rounded="xl" />
        <div className="flex-1 space-y-3">
          <Shimmer height={20} className="w-3/4" />
          <Shimmer height={14} className="w-full" />
          <Shimmer height={14} className="w-2/3" />
        </div>
      </div>
      <div className="mt-6 flex gap-2">
        <Shimmer height={24} className="w-16" rounded="full" />
        <Shimmer height={24} className="w-20" rounded="full" />
        <Shimmer height={24} className="w-14" rounded="full" />
      </div>
    </div>
  )
}

// Text skeleton with multiple lines
interface TextSkeletonProps {
  lines?: number
  className?: string
  lastLineWidth?: string
}

export function TextSkeleton({
  lines = 3,
  className,
  lastLineWidth = '60%',
}: TextSkeletonProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Shimmer
          key={i}
          height={14}
          width={i === lines - 1 ? lastLineWidth : undefined}
          className={i === lines - 1 ? '' : 'w-full'}
        />
      ))}
    </div>
  )
}

// Stats skeleton
export function StatsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-6 rounded-2xl bg-pulse-surface/40 border border-white/[0.04]"
        >
          <Shimmer height={40} className="w-24 mb-3" />
          <Shimmer height={14} className="w-32" />
        </div>
      ))}
    </div>
  )
}

// Table skeleton
interface TableSkeletonProps {
  rows?: number
  columns?: number
  className?: string
}

export function TableSkeleton({
  rows = 5,
  columns = 4,
  className,
}: TableSkeletonProps) {
  return (
    <div className={cn('rounded-2xl bg-pulse-surface/40 border border-white/[0.04] overflow-hidden', className)}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/[0.04] bg-white/[0.02]">
        <div className="flex gap-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Shimmer key={i} height={14} className="flex-1" />
          ))}
        </div>
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="px-6 py-4 border-b border-white/[0.02] last:border-0"
        >
          <div className="flex gap-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Shimmer
                key={colIndex}
                height={14}
                className="flex-1"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// Grant card shimmer
export function GrantCardShimmer() {
  return (
    <div className="p-6 rounded-2xl bg-pulse-surface/40 border border-white/[0.04] space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Shimmer height={22} className="w-3/4 mb-2" />
          <Shimmer height={14} className="w-1/2" />
        </div>
        <Shimmer width={32} height={32} rounded="lg" />
      </div>
      <TextSkeleton lines={2} lastLineWidth="80%" />
      <div className="flex flex-wrap gap-2 pt-2">
        <Shimmer height={22} className="w-20" rounded="full" />
        <Shimmer height={22} className="w-24" rounded="full" />
        <Shimmer height={22} className="w-16" rounded="full" />
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-white/[0.04]">
        <Shimmer height={16} className="w-24" />
        <Shimmer height={16} className="w-32" />
      </div>
    </div>
  )
}
