'use client'

/**
 * DEADLINE BADGE COMPONENT
 * ------------------------
 * Shows deadline urgency with visual indicators
 * Helps users prioritize grants based on timeline
 */

import { Clock, AlertTriangle, Flame, Calendar, CheckCircle } from 'lucide-react'

interface DeadlineBadgeProps {
  deadline: string | Date | null
  variant?: 'badge' | 'inline' | 'card'
  showIcon?: boolean
}

interface DeadlineInfo {
  label: string
  urgency: 'critical' | 'urgent' | 'soon' | 'normal' | 'rolling' | 'closed'
  color: string
  bgColor: string
  borderColor: string
  icon: React.ReactNode
}

function getDeadlineInfo(deadline: string | Date | null): DeadlineInfo {
  if (!deadline) {
    return {
      label: 'Rolling deadline',
      urgency: 'rolling',
      color: 'text-pulse-text-tertiary',
      bgColor: 'bg-pulse-surface',
      borderColor: 'border-pulse-border',
      icon: <Calendar className="w-3.5 h-3.5" />,
    }
  }

  const now = new Date()
  const deadlineDate = new Date(deadline)
  const diffMs = deadlineDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays <= 0) {
    return {
      label: 'Closed',
      urgency: 'closed',
      color: 'text-pulse-text-tertiary',
      bgColor: 'bg-pulse-surface/50',
      borderColor: 'border-pulse-border',
      icon: <CheckCircle className="w-3.5 h-3.5" />,
    }
  }

  if (diffDays <= 3) {
    return {
      label: `${diffDays} day${diffDays === 1 ? '' : 's'} left`,
      urgency: 'critical',
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/20',
      icon: <Flame className="w-3.5 h-3.5" />,
    }
  }

  if (diffDays <= 7) {
    return {
      label: `${diffDays} days left`,
      urgency: 'urgent',
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/20',
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
    }
  }

  if (diffDays <= 14) {
    return {
      label: `${diffDays} days left`,
      urgency: 'soon',
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/20',
      icon: <Clock className="w-3.5 h-3.5" />,
    }
  }

  if (diffDays <= 30) {
    return {
      label: `${diffDays} days left`,
      urgency: 'normal',
      color: 'text-pulse-text-secondary',
      bgColor: 'bg-pulse-surface',
      borderColor: 'border-pulse-border',
      icon: <Clock className="w-3.5 h-3.5" />,
    }
  }

  // More than 30 days
  const weeks = Math.floor(diffDays / 7)
  const months = Math.floor(diffDays / 30)

  return {
    label: months >= 2 ? `${months} months left` : weeks >= 4 ? `${weeks} weeks left` : `${diffDays} days left`,
    urgency: 'normal',
    color: 'text-pulse-text-tertiary',
    bgColor: 'bg-pulse-surface',
    borderColor: 'border-pulse-border',
    icon: <Calendar className="w-3.5 h-3.5" />,
  }
}

export function DeadlineBadge({
  deadline,
  variant = 'badge',
  showIcon = true,
}: DeadlineBadgeProps) {
  const info = getDeadlineInfo(deadline)

  if (variant === 'inline') {
    return (
      <span className={`inline-flex items-center gap-1 text-sm ${info.color}`}>
        {showIcon && info.icon}
        <span>{info.label}</span>
      </span>
    )
  }

  if (variant === 'card') {
    return (
      <div className={`flex items-center gap-2 p-2 rounded-lg ${info.bgColor} border ${info.borderColor}`}>
        <div className={`${info.color}`}>
          {info.icon}
        </div>
        <div>
          <div className={`text-sm font-medium ${info.color}`}>{info.label}</div>
          {deadline && (
            <div className="text-xs text-pulse-text-tertiary">
              {new Date(deadline).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Default badge variant
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border ${info.color} ${info.bgColor} ${info.borderColor}`}
    >
      {showIcon && info.icon}
      <span>{info.label}</span>
    </span>
  )
}

// Countdown component for prominent display
export function DeadlineCountdown({
  deadline,
  size = 'md',
}: {
  deadline: string | Date | null
  size?: 'sm' | 'md' | 'lg'
}) {
  const info = getDeadlineInfo(deadline)

  if (!deadline || info.urgency === 'closed' || info.urgency === 'rolling') {
    return null
  }

  const deadlineDate = new Date(deadline)
  const now = new Date()
  const diffMs = deadlineDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl',
  }

  return (
    <div className={`text-center p-4 rounded-xl ${info.bgColor} border ${info.borderColor}`}>
      <div className={`${sizeClasses[size]} font-bold ${info.color}`}>
        {diffDays}
      </div>
      <div className="text-sm text-pulse-text-secondary">
        day{diffDays === 1 ? '' : 's'} remaining
      </div>
      <div className="text-xs text-pulse-text-tertiary mt-1">
        Deadline: {deadlineDate.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })}
      </div>
    </div>
  )
}

// Helper function to get just the urgency level
export function getDeadlineUrgency(deadline: string | Date | null): 'critical' | 'urgent' | 'soon' | 'normal' | 'rolling' | 'closed' {
  return getDeadlineInfo(deadline).urgency
}

// Helper to get days until deadline
export function getDaysUntilDeadline(deadline: string | Date | null): number | null {
  if (!deadline) return null
  const now = new Date()
  const deadlineDate = new Date(deadline)
  const diffMs = deadlineDate.getTime() - now.getTime()
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24))
}
