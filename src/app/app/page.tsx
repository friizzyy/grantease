'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Search,
  Bookmark,
  TrendingUp,
  Clock,
  Sparkles,
  DollarSign,
  ChevronRight,
  Bot,
  Send,
  Lightbulb,
  Target,
  Zap,
  FolderOpen,
  RefreshCw,
  AlertCircle,
  Shield,
  Calendar,
  CheckCircle,
  XCircle,
  ExternalLink,
  Loader2,
  AlertTriangle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GlassCard } from '@/components/ui/glass-card'
import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'

// Types for API response
interface DashboardData {
  user: {
    id: string
    name: string | null
    email: string
    organization: string | null
    hasCompletedOnboarding: boolean
  }
  stats: {
    savedGrants: number
    workspaces: number
    savedSearches: number
    fundingPotential: number
    unreadNotifications: number
  }
  applicationStages: Array<{
    name: string
    count: number
    color: string
  }>
  upcomingDeadlines: Array<{
    id: string
    title: string
    type: 'saved' | 'workspace'
    deadline: string | null
    amount: number | null
    progress: number
    href: string
    daysLeft: number | null
    urgent: boolean
  }>
  topCategories: Array<{
    name: string
    count: number
  }>
  aiStats: {
    grantsAnalyzed: number
    matchesFound: number
    timeSaved: string
    successRate: number
  }
  recentActivity: {
    lastSavedGrant: string | null
    lastWorkspaceUpdate: string | null
  }
  vaultCompleteness?: {
    overall: number
    sections: Array<{ name: string; complete: boolean }>
    missingCritical: string[]
  }
}

// Default AI recommendations (static for now, could be from API later)
const aiRecommendations = [
  {
    id: 'rec-1',
    type: 'opportunity',
    icon: Target,
    priority: 'high' as const,
    title: 'Find your best matches',
    description: 'Discover grants tailored to your organization profile',
    action: 'Explore Grants',
    href: '/app/discover',
  },
  {
    id: 'rec-2',
    type: 'insight',
    icon: Lightbulb,
    priority: 'normal' as const,
    title: 'Improve success rate',
    description: 'Complete your profile to get better AI-powered recommendations',
    action: 'Update Profile',
    href: '/app/settings',
  },
  {
    id: 'rec-3',
    type: 'action',
    icon: Zap,
    priority: 'normal' as const,
    title: 'Start an application',
    description: 'Create a workspace to begin drafting your grant application',
    action: 'New Workspace',
    href: '/app/discover',
  },
]

const quickCommands = [
  'Find matching grants',
  'Show deadlines',
  'Improve my application',
  'What should I do next?',
]

// Animated value
function AnimatedValue({ value, prefix = '' }: { value: number; prefix?: string }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const duration = 1500
    const start = Date.now()
    const animate = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      setDisplay(Math.round((1 - Math.pow(1 - progress, 3)) * value))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [value])
  return <span>{prefix}{display.toLocaleString()}</span>
}

// Progress ring
function ProgressRing({ progress, size = 56, strokeWidth = 4, color }: {
  progress: number; size?: number; strokeWidth?: number; color: string
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={strokeWidth} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"
        initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
      />
    </svg>
  )
}

// AI Recommendation Card
function AIRecommendationCard({ rec, index }: { rec: typeof aiRecommendations[0]; index: number }) {
  const Icon = rec.icon
  const isHigh = rec.priority === 'high'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 + index * 0.1 }}
      whileHover={{ y: -2 }}
    >
      <Link
        href={rec.href}
        className={`block p-5 md:p-6 rounded-xl border transition-all duration-200 group h-full hover:shadow-lg hover:shadow-pulse-accent/5 hover:-translate-y-0.5 ${
          isHigh
            ? 'bg-gradient-to-br from-pulse-accent/15 to-pulse-accent/5 border-pulse-accent/30 hover:border-pulse-accent/50'
            : 'bg-pulse-surface border-pulse-border/40 hover:border-pulse-border'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
            isHigh ? 'bg-pulse-accent/20 text-pulse-accent' : 'bg-pulse-elevated text-pulse-text-secondary'
          }`}>
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-medium text-pulse-text group-hover:text-pulse-accent transition-colors">
                {rec.title}
              </p>
            </div>
            <p className="text-xs text-pulse-text-secondary line-clamp-2 mb-2">
              {rec.description}
            </p>
            <span className="text-xs text-pulse-accent font-medium flex items-center gap-1">
              {rec.action}
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

// Loading skeleton
function DashboardSkeleton() {
  return (
    <div className="px-4 md:px-6 lg:px-8 py-8 animate-pulse">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="h-3 bg-pulse-surface rounded w-28 mb-2" />
            <div className="h-10 bg-pulse-surface rounded w-72" />
          </div>
          <div className="h-9 bg-pulse-surface rounded-lg w-28" />
        </div>

        {/* Command Bar */}
        <div className="rounded-2xl border border-pulse-border/30 bg-pulse-surface/30 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-pulse-surface rounded-lg" />
            <div className="h-4 bg-pulse-surface rounded w-36" />
          </div>
          <div className="h-11 bg-pulse-surface rounded-xl mb-3" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-7 bg-pulse-surface rounded-full w-36" />
            ))}
          </div>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Funding Potential */}
        <div className="col-span-12 lg:col-span-4">
          <div className="rounded-2xl border border-pulse-border/30 bg-pulse-surface/30 p-5 h-40">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-pulse-surface rounded-lg" />
              <div className="h-3 bg-pulse-surface rounded w-28" />
            </div>
            <div className="h-10 bg-pulse-surface rounded w-32 mb-2" />
            <div className="h-3 bg-pulse-surface rounded w-24" />
          </div>
        </div>

        {/* Pipeline */}
        <div className="col-span-12 lg:col-span-8">
          <div className="rounded-2xl border border-pulse-border/30 bg-pulse-surface/30 p-5 h-40">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-pulse-surface rounded w-36" />
              <div className="h-3 bg-pulse-surface rounded w-16" />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="text-center">
                  <div className="w-14 h-14 bg-pulse-surface rounded-full mx-auto mb-2" />
                  <div className="h-3 bg-pulse-surface rounded w-16 mx-auto" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="col-span-12">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-4 h-4 bg-pulse-surface rounded" />
            <div className="h-4 bg-pulse-surface rounded w-40" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="rounded-xl border border-pulse-border/30 bg-pulse-surface/30 p-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-pulse-surface rounded-lg shrink-0" />
                  <div className="flex-1">
                    <div className="h-4 bg-pulse-surface rounded w-32 mb-2" />
                    <div className="h-3 bg-pulse-surface rounded w-full mb-1" />
                    <div className="h-3 bg-pulse-surface rounded w-2/3 mb-3" />
                    <div className="h-3 bg-pulse-surface rounded w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vault Widget */}
        <div className="col-span-12 lg:col-span-5">
          <div className="rounded-2xl border border-pulse-border/30 bg-pulse-surface/30 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-4 h-4 bg-pulse-surface rounded" />
              <div className="h-4 bg-pulse-surface rounded w-24" />
            </div>
            <div className="w-28 h-28 bg-pulse-surface rounded-full mx-auto mb-4" />
            <div className="h-3 bg-pulse-surface rounded w-48 mx-auto mb-4" />
            <div className="h-16 bg-pulse-surface/50 rounded-lg mb-4" />
            <div className="h-10 bg-pulse-surface rounded-lg" />
          </div>
        </div>

        {/* Deadlines */}
        <div className="col-span-12 lg:col-span-7">
          <div className="rounded-2xl border border-pulse-border/30 bg-pulse-surface/30 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-pulse-surface rounded" />
                <div className="h-4 bg-pulse-surface rounded w-36" />
              </div>
              <div className="h-8 bg-pulse-surface rounded-lg w-16" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-3 rounded-xl border border-pulse-border/20 bg-pulse-surface/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="h-4 bg-pulse-surface rounded w-48" />
                    <div className="h-4 bg-pulse-surface rounded w-16" />
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-pulse-surface rounded-full" />
                    <div className="h-3 bg-pulse-surface rounded w-16" />
                    <div className="h-3 bg-pulse-surface rounded w-12" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Error state
function DashboardError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="px-4 md:px-6 lg:px-8 py-8 flex items-center justify-center min-h-[60vh]">
      <GlassCard className="p-8 text-center max-w-md">
        <div className="w-12 h-12 rounded-full bg-pulse-error/20 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6 text-pulse-error" />
        </div>
        <h2 className="text-lg font-semibold text-pulse-text mb-2">
          Failed to load dashboard
        </h2>
        <p className="text-pulse-text-secondary text-sm mb-4">
          We couldn&apos;t load your dashboard data. Please try again.
        </p>
        <Button onClick={onRetry}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </GlassCard>
    </div>
  )
}

// Format currency
function formatCurrency(amount: number): string {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`
  }
  return `$${amount}`
}

// Get greeting based on time
function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function AppDashboard() {
  const { data: session } = useSession()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inputValue, setInputValue] = useState('')
  const [commandBarFocused, setCommandBarFocused] = useState(false)
  const [commandLoading, setCommandLoading] = useState(false)
  const [commandResult, setCommandResult] = useState<{
    response?: string
    suggestedAction?: { label: string; href: string }
    grants?: Array<{ id: string; title: string; sponsor: string; amount?: string; deadline?: string }>
    error?: string
  } | null>(null)
  const [plannerLoading, setPlannerLoading] = useState(false)
  const [plannerResult, setPlannerResult] = useState<{
    priorities?: Array<{ grantId: string; title: string; urgency: 'critical' | 'urgent' | 'upcoming' | 'comfortable'; daysLeft: number; reason: string }>
    weeklyPlan?: Array<{ day: string; tasks: string[] }>
    quickWins?: string[]
    warnings?: string[]
    error?: string
  } | null>(null)
  const [plannerHours, setPlannerHours] = useState(10)
  const [showPlanner, setShowPlanner] = useState(false)

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/dashboard')
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard')
      }
      const data = await response.json()
      setDashboardData(data)
    } catch (err) {
      console.error('Dashboard fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleCommandSubmit = useCallback(async (commandText?: string) => {
    const text = commandText || inputValue
    if (!text.trim() || commandLoading) return
    setCommandLoading(true)
    setCommandResult(null)
    try {
      const response = await fetch('/api/ai/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: text.trim() }),
      })
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to process command')
      }
      const data = await response.json()
      setCommandResult(data)
    } catch (err) {
      setCommandResult({ error: err instanceof Error ? err.message : 'Something went wrong. Please try again.' })
    } finally {
      setCommandLoading(false)
    }
  }, [inputValue, commandLoading])

  const handlePlanMyWeek = useCallback(async () => {
    if (plannerLoading) return
    setPlannerLoading(true)
    setPlannerResult(null)
    setShowPlanner(true)
    try {
      const response = await fetch('/api/ai/deadline-planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hoursPerWeek: plannerHours }),
      })
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to generate plan')
      }
      const data = await response.json()
      setPlannerResult(data)
    } catch (err) {
      setPlannerResult({ error: err instanceof Error ? err.message : 'Failed to generate plan.' })
    } finally {
      setPlannerLoading(false)
    }
  }, [plannerHours, plannerLoading])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (error || !dashboardData) {
    return <DashboardError onRetry={fetchDashboard} />
  }

  const { user, stats, applicationStages, upcomingDeadlines, aiStats } = dashboardData
  const totalGrants = applicationStages.reduce((sum, s) => sum + s.count, 0)
  const userName = user.name || session?.user?.name || 'there'
  const firstName = userName.split(' ')[0]

  return (
    <div className="px-4 md:px-6 lg:px-8 py-8">
      {/* Header with AI Command Bar */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <p className="text-pulse-text-tertiary font-mono text-micro uppercase tracking-wider mb-2">
              Command Center
            </p>
            <h1 className="text-heading-lg md:text-display font-bold tracking-tight text-pulse-text">
              {getGreeting()}, {firstName}
            </h1>
          </div>
          <Button size="sm" asChild>
            <Link href="/app/discover">
              <Search className="w-4 h-4 mr-2" />
              Find Grants
            </Link>
          </Button>
        </div>

        {/* AI Command Bar */}
        <motion.div
          className={`relative transition-all duration-300 ${commandBarFocused ? 'scale-[1.01]' : ''}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className={`absolute -inset-1 bg-gradient-to-r from-pulse-accent/20 via-pulse-accent/10 to-pulse-accent/20 rounded-2xl blur-xl transition-opacity duration-300 ${
            commandBarFocused ? 'opacity-100' : 'opacity-0'
          }`} />

          <div className="relative bg-pulse-surface/80 border border-pulse-border rounded-2xl p-4 backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pulse-accent to-pulse-accent/50 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-pulse-bg" />
              </div>
              <span className="text-sm font-medium text-pulse-text">Ask the AI anything</span>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="e.g., Find grants for renewable energy startups..."
                aria-label="Ask the AI anything about grants"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={() => setCommandBarFocused(true)}
                onBlur={() => setCommandBarFocused(false)}
                onKeyDown={(e) => e.key === 'Enter' && handleCommandSubmit()}
                className="w-full px-4 py-3 pr-12 rounded-xl bg-pulse-surface border border-pulse-border/40 focus:ring-2 focus:ring-pulse-accent/30 focus:border-pulse-accent focus:outline-none text-sm text-pulse-text placeholder:text-pulse-text-tertiary transition-all duration-150"
              />
              <button
                onClick={() => handleCommandSubmit()}
                disabled={commandLoading || !inputValue.trim()}
                aria-label="Send command"
                className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg bg-pulse-accent flex items-center justify-center hover:bg-pulse-accent/90 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-pulse-accent/50 focus-visible:outline-none"
              >
                {commandLoading ? (
                  <Loader2 className="w-4 h-4 text-pulse-bg animate-spin" />
                ) : (
                  <Send className="w-4 h-4 text-pulse-bg" />
                )}
              </button>
            </div>

            {/* Quick Commands */}
            <div className="flex flex-wrap gap-2 mt-3">
              {quickCommands.map((cmd, i) => (
                <motion.button
                  key={cmd}
                  className="px-3 py-2 rounded-full bg-pulse-elevated border border-pulse-border/40 text-xs text-pulse-text-secondary hover:border-pulse-border hover:text-pulse-text active:scale-[0.98] transition-all duration-150 min-h-[44px] focus-visible:ring-2 focus-visible:ring-pulse-accent/50 focus-visible:outline-none"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  onClick={() => {
                    setInputValue(cmd)
                    handleCommandSubmit(cmd)
                  }}
                >
                  {cmd}
                </motion.button>
              ))}
            </div>
          {/* Command Result */}
          {commandResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 pt-4 border-t border-pulse-border"
            >
              {commandResult.error ? (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-pulse-error/10 border border-pulse-error/20">
                  <AlertCircle className="w-5 h-5 text-pulse-error shrink-0 mt-0.5" />
                  <p className="text-sm text-pulse-error">{commandResult.error}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {commandResult.response && (
                    <div className="p-3 rounded-xl bg-pulse-bg border border-pulse-border/40">
                      <div className="flex items-start gap-3">
                        <div className="w-7 h-7 rounded-lg bg-pulse-accent/20 flex items-center justify-center shrink-0">
                          <Sparkles className="w-3.5 h-3.5 text-pulse-accent" />
                        </div>
                        <p className="text-sm text-pulse-text whitespace-pre-wrap">{commandResult.response}</p>
                      </div>
                    </div>
                  )}
                  {commandResult.suggestedAction && (
                    <Link
                      href={commandResult.suggestedAction.href}
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-pulse-accent text-pulse-bg text-sm font-medium hover:bg-pulse-accent/90 active:scale-[0.98] transition-all duration-150"
                    >
                      {commandResult.suggestedAction.label}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                  {commandResult.grants && commandResult.grants.length > 0 && (
                    <div className="grid sm:grid-cols-2 gap-2">
                      {commandResult.grants.map((g) => (
                        <Link
                          key={g.id}
                          href={`/app/grants/${encodeURIComponent(g.id)}`}
                          className="p-3 rounded-xl bg-pulse-surface border border-pulse-border/40 hover:border-pulse-border hover:shadow-lg hover:shadow-pulse-accent/5 transition-all duration-200 group"
                        >
                          <p className="text-sm font-medium text-pulse-text group-hover:text-pulse-accent transition-colors line-clamp-1">
                            {g.title}
                          </p>
                          <p className="text-xs text-pulse-text-tertiary mt-0.5">{g.sponsor}</p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-pulse-text-tertiary">
                            {g.amount && (
                              <span className="flex items-center gap-1 text-pulse-accent">
                                <DollarSign className="w-3 h-3" />
                                {g.amount}
                              </span>
                            )}
                            {g.deadline && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {g.deadline}
                              </span>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={() => setCommandResult(null)}
                className="mt-2 text-xs text-pulse-text-tertiary hover:text-pulse-text active:scale-[0.98] transition-all duration-150"
              >
                Dismiss
              </button>
            </motion.div>
          )}
          </div>
        </motion.div>
      </motion.div>

      {/* Bento Grid with AI Cards */}
      <div className="grid grid-cols-12 gap-4 md:gap-6">
        {/* Funding Potential */}
        <motion.div
          className="col-span-12 lg:col-span-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
        >
          <GlassCard variant="accent" className="p-5 h-full relative overflow-hidden">
            <motion.div
              className="absolute -top-16 -right-16 w-40 h-40 rounded-full bg-pulse-accent/20 blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-pulse-accent/20 border border-pulse-accent/30 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-pulse-accent" />
                </div>
                <span className="text-pulse-text-secondary text-xs">Funding Potential</span>
              </div>
              <div className="font-serif text-heading-lg text-pulse-text mb-1">
                {stats.fundingPotential > 0 ? (
                  <AnimatedValue value={stats.fundingPotential} prefix="$" />
                ) : (
                  <span className="text-pulse-text-secondary">$0</span>
                )}
              </div>
              <p className="text-pulse-accent text-xs flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {stats.savedGrants} grants saved
              </p>
            </div>
          </GlassCard>
        </motion.div>

        {/* Pipeline */}
        <motion.div
          className="col-span-12 lg:col-span-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard className="p-5 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold tracking-tight text-pulse-text">Application Pipeline</h3>
              <span className="text-pulse-text-tertiary text-xs">{totalGrants} grants</span>
            </div>
            {totalGrants > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {applicationStages.map((stage, i) => (
                  <motion.div
                    key={stage.name}
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 + i * 0.1 }}
                  >
                    <div className="relative inline-flex items-center justify-center mb-2">
                      <ProgressRing progress={totalGrants > 0 ? (stage.count / totalGrants) * 100 : 0} color={stage.color} />
                      <span className="absolute text-base font-semibold text-pulse-text">{stage.count}</span>
                    </div>
                    <p className="text-xs text-pulse-text-secondary">{stage.name}</p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-pulse-surface flex items-center justify-center mb-3">
                  <Bookmark className="w-5 h-5 text-pulse-text-tertiary" />
                </div>
                <p className="text-sm text-pulse-text-secondary mb-2">No grants in your pipeline yet</p>
                <Button size="sm" variant="outline" asChild>
                  <Link href="/app/discover">Discover Grants</Link>
                </Button>
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* AI Recommendations Row */}
        <div className="col-span-12">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-pulse-accent" />
            <h3 className="text-sm font-semibold tracking-tight text-pulse-text">AI Recommendations</h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {aiRecommendations.map((rec, i) => (
              <AIRecommendationCard key={rec.id} rec={rec} index={i} />
            ))}
          </div>
        </div>

        {/* Vault Completeness Widget */}
        <motion.div
          className="col-span-12 lg:col-span-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <GlassCard className="p-5 h-full">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-pulse-accent" />
              <h3 className="text-sm font-semibold tracking-tight text-pulse-text">Your Vault</h3>
            </div>

            {/* Progress Ring */}
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <ProgressRing
                  progress={dashboardData.vaultCompleteness?.overall ?? 0}
                  size={120}
                  strokeWidth={8}
                  color="rgb(var(--pulse-accent))"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-pulse-text">
                    {dashboardData.vaultCompleteness?.overall ?? 0}%
                  </span>
                  <span className="text-xs text-pulse-text-tertiary">complete</span>
                </div>
              </div>
            </div>

            {/* Status Message */}
            <div className="text-center mb-4">
              <p className="text-sm text-pulse-text-secondary">
                {(dashboardData.vaultCompleteness?.overall ?? 0) >= 80
                  ? 'Your vault is ready for applications!'
                  : (dashboardData.vaultCompleteness?.overall ?? 0) >= 50
                  ? 'Almost there! A few more details needed.'
                  : 'Complete your vault to auto-fill applications'}
              </p>
            </div>

            {/* Benefits */}
            <div className="p-3 rounded-xl bg-pulse-accent/5 border border-pulse-accent/20 mb-4">
              <p className="text-xs font-medium text-pulse-accent mb-1">Why complete your vault?</p>
              <p className="text-xs text-pulse-text-tertiary">
                Auto-fill ~{(dashboardData.vaultCompleteness?.overall ?? 0)}% of grant applications.
                Save 15-20 hours per application.
              </p>
            </div>

            {/* CTA Button */}
            <Button className="w-full" variant="outline" asChild>
              <Link href="/app/vault">
                <Shield className="w-4 h-4 mr-2" />
                Update Vault
              </Link>
            </Button>
          </GlassCard>
        </motion.div>

        {/* Deadlines with Progress */}
        <motion.div
          className="col-span-12 lg:col-span-7"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-pulse-warning" />
                <h3 className="text-sm font-semibold tracking-tight text-pulse-text">Deadlines & Progress</h3>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/app/workspace">View all</Link>
              </Button>
            </div>
            {upcomingDeadlines.length > 0 ? (
              <div className="space-y-3">
                {upcomingDeadlines.map((deadline, i) => (
                  <motion.div
                    key={deadline.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    <Link
                      href={deadline.href}
                      className={`block p-3 rounded-xl border transition-all duration-200 hover:border-pulse-border hover:shadow-lg hover:shadow-pulse-accent/5 hover:-translate-y-0.5 ${
                        deadline.urgent ? 'bg-pulse-error/10 border-pulse-error/30' : 'bg-pulse-surface border-pulse-border/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-pulse-text text-sm line-clamp-1">{deadline.title}</span>
                          {deadline.urgent && <Badge variant="error" className="text-xs shrink-0">Urgent</Badge>}
                        </div>
                        {deadline.amount && (
                          <span className="text-pulse-accent text-sm font-medium shrink-0">
                            {formatCurrency(deadline.amount)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-pulse-border rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-pulse-accent rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${deadline.progress}%` }}
                            transition={{ duration: 0.8, delay: 0.6 + i * 0.1 }}
                          />
                        </div>
                        <span className="text-xs text-pulse-text-tertiary w-16 text-right">
                          {deadline.progress}% done
                        </span>
                        <span className={`text-xs shrink-0 ${deadline.urgent ? 'text-pulse-error' : 'text-pulse-text-tertiary'}`}>
                          {deadline.daysLeft !== null ? `${deadline.daysLeft}d left` : 'No deadline'}
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 rounded-full bg-pulse-surface flex items-center justify-center mb-3">
                  <Clock className="w-5 h-5 text-pulse-text-tertiary" />
                </div>
                <p className="text-sm text-pulse-text-secondary mb-2">No upcoming deadlines</p>
                <p className="text-xs text-pulse-text-tertiary">Save grants to track their deadlines</p>
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Plan My Week */}
        <motion.div
          className="col-span-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <GlassCard className="p-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-pulse-accent" />
                <h3 className="text-sm font-semibold tracking-tight text-pulse-text">Weekly Planner</h3>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <label htmlFor="planner-hours" className="text-xs text-pulse-text-tertiary">Hours/week:</label>
                  <input
                    id="planner-hours"
                    type="number"
                    min={1}
                    max={40}
                    value={plannerHours}
                    onChange={(e) => setPlannerHours(Math.max(1, Math.min(40, parseInt(e.target.value) || 10)))}
                    className="w-16 px-2 py-1 rounded-lg bg-pulse-surface border border-pulse-border/40 text-sm text-pulse-text text-center focus:ring-2 focus:ring-pulse-accent/30 focus:border-pulse-accent focus:outline-none transition-all duration-150"
                  />
                </div>
                <Button size="sm" onClick={handlePlanMyWeek} disabled={plannerLoading}>
                  {plannerLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Plan My Week
                </Button>
              </div>
            </div>

            {showPlanner && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {plannerLoading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-pulse-accent animate-spin mr-3" />
                    <span className="text-sm text-pulse-text-secondary">Analyzing your deadlines and generating a plan...</span>
                  </div>
                )}

                {plannerResult?.error && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-pulse-error/10 border border-pulse-error/20">
                    <AlertCircle className="w-5 h-5 text-pulse-error shrink-0 mt-0.5" />
                    <p className="text-sm text-pulse-error">{plannerResult.error}</p>
                  </div>
                )}

                {plannerResult && !plannerResult.error && !plannerLoading && (
                  <div className="space-y-4">
                    {/* Prioritized Grants */}
                    {plannerResult.priorities && plannerResult.priorities.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-pulse-text-secondary uppercase tracking-wider mb-2">Priority Grants</p>
                        <div className="space-y-2">
                          {plannerResult.priorities.map((p, i) => {
                            const urgencyColors = {
                              critical: 'bg-red-500/20 text-red-400 border-red-500/30',
                              urgent: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
                              upcoming: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
                              comfortable: 'bg-green-500/20 text-green-400 border-green-500/30',
                            }
                            return (
                              <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-pulse-surface border border-pulse-border/40">
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${urgencyColors[p.urgency]}`}>
                                  {p.urgency}
                                </span>
                                <span className="text-sm text-pulse-text flex-1 line-clamp-1">{p.title}</span>
                                <span className="text-xs text-pulse-text-tertiary shrink-0">{p.daysLeft}d left</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Weekly Plan */}
                    {plannerResult.weeklyPlan && plannerResult.weeklyPlan.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-pulse-text-secondary uppercase tracking-wider mb-2">This Week</p>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {plannerResult.weeklyPlan.map((day, i) => (
                            <div key={i} className="p-3 rounded-lg bg-pulse-surface border border-pulse-border/40">
                              <p className="text-xs font-medium text-pulse-accent mb-1.5">{day.day}</p>
                              <ul className="space-y-1">
                                {day.tasks.map((task, j) => (
                                  <li key={j} className="text-xs text-pulse-text-secondary flex items-start gap-1.5">
                                    <CheckCircle className="w-3 h-3 text-pulse-text-tertiary shrink-0 mt-0.5" />
                                    {task}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quick Wins & Warnings */}
                    <div className="grid sm:grid-cols-2 gap-3">
                      {plannerResult.quickWins && plannerResult.quickWins.length > 0 && (
                        <div className="p-3 rounded-xl bg-pulse-accent/5 border border-pulse-accent/20">
                          <p className="text-xs font-medium text-pulse-accent mb-2">Quick Wins</p>
                          <ul className="space-y-1">
                            {plannerResult.quickWins.map((win, i) => (
                              <li key={i} className="text-xs text-pulse-text-secondary flex items-start gap-1.5">
                                <Zap className="w-3 h-3 text-pulse-accent shrink-0 mt-0.5" />
                                {win}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {plannerResult.warnings && plannerResult.warnings.length > 0 && (
                        <div className="p-3 rounded-xl bg-pulse-error/5 border border-pulse-error/20">
                          <p className="text-xs font-medium text-pulse-error mb-2">Warnings</p>
                          <ul className="space-y-1">
                            {plannerResult.warnings.map((warn, i) => (
                              <li key={i} className="text-xs text-pulse-text-secondary flex items-start gap-1.5">
                                <AlertTriangle className="w-3 h-3 text-pulse-error shrink-0 mt-0.5" />
                                {warn}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </GlassCard>
        </motion.div>

        {/* AI Quick Stats */}
        <motion.div
          className="col-span-12 lg:col-span-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <GlassCard className="p-5 h-full">
            <div className="flex items-center gap-2 mb-4">
              <Bot className="w-4 h-4 text-pulse-accent" />
              <h3 className="text-sm font-semibold tracking-tight text-pulse-text">AI Working For You</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-pulse-surface border border-pulse-border/40">
                <p className="text-3xl font-bold tabular-nums text-pulse-text">{aiStats.grantsAnalyzed.toLocaleString()}</p>
                <p className="text-xs text-pulse-text-tertiary">Grants analyzed</p>
              </div>
              <div className="p-3 rounded-xl bg-pulse-surface border border-pulse-border/40">
                <p className="text-3xl font-bold tabular-nums text-pulse-accent">{aiStats.matchesFound}</p>
                <p className="text-xs text-pulse-text-tertiary">Matches found</p>
              </div>
              <div className="p-3 rounded-xl bg-pulse-surface border border-pulse-border/40">
                <p className="text-3xl font-bold tabular-nums text-pulse-text">{aiStats.timeSaved}</p>
                <p className="text-xs text-pulse-text-tertiary">Time saved</p>
              </div>
              <div className="p-3 rounded-xl bg-pulse-surface border border-pulse-border/40">
                <p className="text-3xl font-bold tabular-nums text-pulse-text">{aiStats.successRate}%</p>
                <p className="text-xs text-pulse-text-tertiary">Success rate</p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="mt-4 pt-4 border-t border-pulse-border space-y-2">
              {[
                { icon: Search, label: 'Discover Grants', href: '/app/discover', count: null },
                { icon: Bookmark, label: 'Saved Grants', href: '/app/saved', count: stats.savedGrants },
                { icon: FolderOpen, label: 'Workspaces', href: '/app/workspace', count: stats.workspaces },
              ].map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-pulse-surface/50 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-2">
                    <item.icon className="w-4 h-4 text-pulse-text-tertiary group-hover:text-pulse-accent transition-colors" />
                    <span className="text-sm text-pulse-text-secondary group-hover:text-pulse-text transition-colors">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.count !== null && item.count > 0 && (
                      <span className="text-xs text-pulse-text-tertiary">{item.count}</span>
                    )}
                    <ChevronRight className="w-4 h-4 text-pulse-text-tertiary group-hover:text-pulse-accent transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}
