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
    href: '/app/workspace/new',
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
        className={`block p-4 rounded-xl border transition-all group h-full ${
          isHigh
            ? 'bg-gradient-to-br from-pulse-accent/15 to-pulse-accent/5 border-pulse-accent/30 hover:border-pulse-accent/50'
            : 'bg-pulse-surface/50 border-pulse-border hover:border-pulse-accent/30'
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
    <div className="p-4 sm:p-6 lg:p-8 animate-pulse">
      <div className="mb-8">
        <div className="h-4 bg-pulse-surface rounded w-32 mb-2" />
        <div className="h-10 bg-pulse-surface rounded w-64 mb-6" />
        <div className="h-32 bg-pulse-surface rounded-2xl" />
      </div>
      <div className="grid grid-cols-12 gap-4 sm:gap-5">
        <div className="col-span-12 lg:col-span-4 h-40 bg-pulse-surface rounded-2xl" />
        <div className="col-span-12 lg:col-span-8 h-40 bg-pulse-surface rounded-2xl" />
        <div className="col-span-12 h-48 bg-pulse-surface rounded-2xl" />
        <div className="col-span-12 lg:col-span-7 h-64 bg-pulse-surface rounded-2xl" />
        <div className="col-span-12 lg:col-span-5 h-64 bg-pulse-surface rounded-2xl" />
      </div>
    </div>
  )
}

// Error state
function DashboardError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="p-8 flex items-center justify-center min-h-[60vh]">
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
    <div className="p-4 sm:p-6 lg:p-8">
      {/* Header with AI Command Bar */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-pulse-text-tertiary font-mono text-micro uppercase tracking-wider mb-2">
              Command Center
            </p>
            <h1 className="font-serif text-display text-pulse-text">
              {getGreeting()}, {firstName}
            </h1>
          </div>
          <Button size="sm" asChild className="self-start shrink-0">
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
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={() => setCommandBarFocused(true)}
                onBlur={() => setCommandBarFocused(false)}
                className="w-full px-4 py-3 pr-12 rounded-xl bg-pulse-bg border border-pulse-border focus:border-pulse-accent focus:outline-none text-base text-pulse-text placeholder:text-pulse-text-tertiary"
              />
              <button
                className="absolute right-1 top-1/2 -translate-y-1/2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg bg-pulse-accent hover:bg-pulse-accent/80 active:bg-pulse-accent/70 transition-colors"
                aria-label="Send"
                style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
              >
                <Send className="w-4 h-4 text-pulse-bg" />
              </button>
            </div>

            {/* Quick Commands */}
            <div className="flex flex-wrap gap-2 mt-3">
              {quickCommands.map((cmd, i) => (
                <motion.button
                  key={cmd}
                  className="px-3 py-2 min-h-[36px] rounded-full bg-pulse-elevated border border-pulse-border text-xs text-pulse-text-secondary hover:border-pulse-accent/30 hover:text-pulse-text active:border-pulse-accent/30 active:text-pulse-text transition-colors"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  onClick={() => setInputValue(cmd)}
                >
                  {cmd}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Bento Grid with AI Cards */}
      <div className="grid grid-cols-12 gap-4 sm:gap-5">
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
              <h3 className="text-sm font-semibold text-pulse-text">Application Pipeline</h3>
              <span className="text-pulse-text-tertiary text-xs">{totalGrants} grants</span>
            </div>
            {totalGrants > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
            <h3 className="text-sm font-semibold text-pulse-text">AI Recommendations</h3>
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
              <h3 className="text-sm font-semibold text-pulse-text">Your Vault</h3>
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
            <div className="p-3 rounded-lg bg-pulse-accent/5 border border-pulse-accent/20 mb-4">
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
                <h3 className="text-sm font-semibold text-pulse-text">Deadlines & Progress</h3>
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
                      className={`block p-3 rounded-xl border transition-all hover:border-pulse-accent/30 ${
                        deadline.urgent ? 'bg-pulse-error/10 border-pulse-error/30' : 'bg-pulse-surface/50 border-pulse-border'
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
              <h3 className="text-sm font-semibold text-pulse-text">AI Working For You</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-xl bg-pulse-surface/50 border border-pulse-border">
                <p className="text-2xl font-semibold text-pulse-text">{aiStats.grantsAnalyzed.toLocaleString()}</p>
                <p className="text-xs text-pulse-text-tertiary">Grants analyzed</p>
              </div>
              <div className="p-3 rounded-xl bg-pulse-surface/50 border border-pulse-border">
                <p className="text-2xl font-semibold text-pulse-accent">{aiStats.matchesFound}</p>
                <p className="text-xs text-pulse-text-tertiary">Matches found</p>
              </div>
              <div className="p-3 rounded-xl bg-pulse-surface/50 border border-pulse-border">
                <p className="text-2xl font-semibold text-pulse-text">{aiStats.timeSaved}</p>
                <p className="text-xs text-pulse-text-tertiary">Time saved</p>
              </div>
              <div className="p-3 rounded-xl bg-pulse-surface/50 border border-pulse-border">
                <p className="text-2xl font-semibold text-pulse-text">{aiStats.successRate}%</p>
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
                  className="flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-pulse-surface/50 transition-colors group"
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
