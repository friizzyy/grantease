'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Search,
  Bookmark,
  Clock,
  Sparkles,
  DollarSign,
  ChevronRight,
  Send,
  FolderOpen,
  RefreshCw,
  AlertCircle,
  Shield,
  Loader2,
  FileText,
  TrendingUp,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
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

function formatCurrency(amount: number): string {
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`
  if (amount >= 1000) return `$${(amount / 1000).toFixed(0)}K`
  return `$${amount}`
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function ProgressBar({ progress, color }: { progress: number; color: string }) {
  return (
    <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
      />
    </div>
  )
}

// Skeleton
function DashboardSkeleton() {
  return (
    <div className="px-4 md:px-6 lg:px-8 py-8 max-w-6xl mx-auto animate-pulse">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-3 bg-white/[0.04] rounded w-24 mb-2" />
          <div className="h-8 bg-white/[0.04] rounded w-64" />
        </div>
        <div className="h-10 bg-white/[0.04] rounded-lg w-32" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="p-5 rounded-xl border border-white/[0.05] bg-white/[0.02]">
            <div className="h-3 bg-white/[0.04] rounded w-20 mb-3" />
            <div className="h-7 bg-white/[0.04] rounded w-24 mb-1" />
            <div className="h-3 bg-white/[0.04] rounded w-16" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-5 mb-6">
        <div className="h-4 bg-white/[0.04] rounded w-36 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-white/[0.04] rounded-lg" />
          ))}
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-5 h-48" />
        <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-5 h-48" />
      </div>
    </div>
  )
}

function DashboardError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="px-4 md:px-6 lg:px-8 py-8 flex items-center justify-center min-h-[60vh]">
      <div className="p-8 text-center max-w-md rounded-xl border border-white/[0.05] bg-white/[0.02]">
        <div className="w-12 h-12 rounded-full bg-pulse-error/10 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6 text-pulse-error" />
        </div>
        <h2 className="text-heading text-pulse-text mb-2">Failed to load dashboard</h2>
        <p className="text-body-sm text-pulse-text-secondary mb-4">
          We couldn&apos;t load your dashboard data. Please try again.
        </p>
        <Button onClick={onRetry}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    </div>
  )
}

export default function AppDashboard() {
  const { data: session } = useSession()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [aiInput, setAiInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState<{
    response?: string
    suggestedAction?: { label: string; href: string }
    grants?: Array<{ id: string; title: string; sponsor: string; amount?: string; deadline?: string }>
    error?: string
  } | null>(null)

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/dashboard')
      if (!response.ok) throw new Error('Failed to fetch dashboard')
      const data = await response.json()
      setDashboardData(data)
    } catch (err) {
      console.error('Dashboard fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleAiSubmit = useCallback(async () => {
    if (!aiInput.trim() || aiLoading) return
    setAiLoading(true)
    setAiResult(null)
    try {
      const response = await fetch('/api/ai/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: aiInput.trim() }),
      })
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        throw new Error(errData.error || 'Failed to process command')
      }
      setAiResult(await response.json())
    } catch (err) {
      setAiResult({ error: err instanceof Error ? err.message : 'Something went wrong.' })
    } finally {
      setAiLoading(false)
    }
  }, [aiInput, aiLoading])

  useEffect(() => { fetchDashboard() }, [fetchDashboard])

  if (isLoading) return <DashboardSkeleton />
  if (error || !dashboardData) return <DashboardError onRetry={fetchDashboard} />

  const { user, stats, applicationStages, upcomingDeadlines } = dashboardData
  const totalGrants = applicationStages.reduce((sum, s) => sum + s.count, 0)
  const userName = user.name || session?.user?.name || 'there'
  const firstName = userName.split(' ')[0]
  const vaultPct = dashboardData.vaultCompleteness?.overall ?? 0
  const urgentCount = upcomingDeadlines.filter(d => d.urgent || (d.daysLeft !== null && d.daysLeft <= 14)).length

  return (
    <div className="px-4 md:px-6 lg:px-8 py-8 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        className="flex items-start justify-between mb-8"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-heading-lg text-pulse-text">
            {getGreeting()}, {firstName}
          </h1>
          {user.organization && (
            <p className="text-body-sm text-pulse-text-tertiary mt-0.5">{user.organization}</p>
          )}
        </div>
        <Button size="sm" asChild>
          <Link href="/app/discover">
            <Search className="w-4 h-4 mr-2" />
            Find Grants
          </Link>
        </Button>
      </motion.div>

      {/* Metrics row */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <Link
          href="/app/saved"
          className="group p-5 rounded-xl border border-white/[0.05] bg-pulse-accent/[0.03] hover:border-pulse-accent/20 transition-all duration-200"
        >
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-pulse-accent" />
            <span className="text-label-sm text-pulse-text-tertiary">Funding potential</span>
          </div>
          <p className="text-heading-lg text-pulse-accent tabular-nums">
            {stats.fundingPotential > 0 ? formatCurrency(stats.fundingPotential) : '$0'}
          </p>
          <p className="text-label-sm text-pulse-text-tertiary mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {stats.savedGrants} grants saved
          </p>
        </Link>

        <Link
          href="/app/saved"
          className="group p-5 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:border-white/[0.1] transition-all duration-200"
        >
          <div className="flex items-center gap-2 mb-2">
            <Bookmark className="w-4 h-4 text-pulse-text-tertiary group-hover:text-pulse-accent transition-colors" />
            <span className="text-label-sm text-pulse-text-tertiary">Saved grants</span>
          </div>
          <p className="text-heading-lg text-pulse-text tabular-nums">{stats.savedGrants}</p>
          <p className="text-label-sm text-pulse-text-tertiary mt-1">
            {stats.savedSearches} saved searches
          </p>
        </Link>

        <Link
          href="/app/workspace"
          className="group p-5 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:border-white/[0.1] transition-all duration-200"
        >
          <div className="flex items-center gap-2 mb-2">
            <Clock className={`w-4 h-4 ${urgentCount > 0 ? 'text-orange-400' : 'text-pulse-text-tertiary'} group-hover:text-pulse-accent transition-colors`} />
            <span className="text-label-sm text-pulse-text-tertiary">Due soon</span>
          </div>
          <p className={`text-heading-lg tabular-nums ${urgentCount > 0 ? 'text-orange-400' : 'text-pulse-text'}`}>
            {urgentCount}
          </p>
          <p className="text-label-sm text-pulse-text-tertiary mt-1">
            {upcomingDeadlines.length} total deadlines
          </p>
        </Link>

        <Link
          href="/app/vault"
          className="group p-5 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:border-white/[0.1] transition-all duration-200"
        >
          <div className="flex items-center gap-2 mb-2">
            <Shield className={`w-4 h-4 ${vaultPct >= 80 ? 'text-pulse-accent' : 'text-pulse-text-tertiary'} group-hover:text-pulse-accent transition-colors`} />
            <span className="text-label-sm text-pulse-text-tertiary">Vault</span>
          </div>
          <p className={`text-heading-lg tabular-nums ${vaultPct >= 80 ? 'text-pulse-accent' : 'text-pulse-text'}`}>
            {vaultPct}%
          </p>
          <p className="text-label-sm text-pulse-text-tertiary mt-1">
            {vaultPct >= 80 ? 'Ready for applications' : 'Complete to auto-fill'}
          </p>
        </Link>
      </motion.div>

      {/* Deadlines */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="p-5 rounded-xl border border-white/[0.05] bg-white/[0.02]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-heading-sm text-pulse-text">Upcoming deadlines</h2>
            <Link
              href="/app/workspace"
              className="text-label-sm text-pulse-text-tertiary hover:text-pulse-accent transition-colors flex items-center gap-1"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {upcomingDeadlines.length > 0 ? (
            <div className="space-y-2">
              {upcomingDeadlines.slice(0, 5).map((d, i) => (
                <Link
                  key={d.id}
                  href={d.href}
                  className={`flex items-center gap-4 p-3 rounded-lg border transition-all duration-200 hover:border-white/[0.1] group ${
                    d.urgent
                      ? 'bg-red-500/[0.04] border-red-500/15'
                      : d.daysLeft !== null && d.daysLeft <= 14
                        ? 'bg-orange-500/[0.03] border-orange-500/10'
                        : 'bg-white/[0.01] border-white/[0.04]'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {d.urgent && <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />}
                      <span className="text-body-sm font-medium text-pulse-text truncate group-hover:text-pulse-accent transition-colors">
                        {d.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <ProgressBar progress={d.progress} color={d.urgent ? '#ef4444' : '#40ffaa'} />
                      <span className="text-label-sm text-pulse-text-tertiary shrink-0 w-12 text-right tabular-nums">
                        {d.progress}%
                      </span>
                    </div>
                  </div>
                  {d.amount && (
                    <span className="text-body-sm font-medium text-pulse-accent shrink-0 hidden sm:block">
                      {formatCurrency(d.amount)}
                    </span>
                  )}
                  <span className={`text-label-sm shrink-0 tabular-nums ${
                    d.urgent ? 'text-red-400' : d.daysLeft !== null && d.daysLeft <= 14 ? 'text-orange-400' : 'text-pulse-text-tertiary'
                  }`}>
                    {d.daysLeft !== null ? `${d.daysLeft}d` : '--'}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center">
              <Clock className="w-8 h-8 text-pulse-text-tertiary/30 mx-auto mb-3" />
              <p className="text-body-sm text-pulse-text-secondary mb-1">No upcoming deadlines</p>
              <p className="text-label-sm text-pulse-text-tertiary">
                Save grants to start tracking their deadlines
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Pipeline + Quick Actions */}
      <motion.div
        className="grid md:grid-cols-2 gap-6 mb-6"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        {/* Pipeline */}
        <div className="p-5 rounded-xl border border-white/[0.05] bg-white/[0.02]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-heading-sm text-pulse-text">Pipeline</h2>
            <span className="text-label-sm text-pulse-text-tertiary tabular-nums">{totalGrants} total</span>
          </div>

          {totalGrants > 0 ? (
            <div className="space-y-3">
              {applicationStages.map((stage) => {
                const pct = totalGrants > 0 ? (stage.count / totalGrants) * 100 : 0
                return (
                  <div key={stage.name} className="flex items-center gap-3">
                    <span className="text-body-sm text-pulse-text-secondary w-24 shrink-0">{stage.name}</span>
                    <div className="flex-1">
                      <ProgressBar progress={pct} color={stage.color} />
                    </div>
                    <span className="text-heading-sm text-pulse-text tabular-nums w-8 text-right">{stage.count}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="py-6 text-center">
              <FileText className="w-7 h-7 text-pulse-text-tertiary/30 mx-auto mb-2" />
              <p className="text-body-sm text-pulse-text-secondary mb-3">No applications yet</p>
              <Button size="sm" variant="outline" asChild>
                <Link href="/app/discover">Start discovering</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="p-5 rounded-xl border border-white/[0.05] bg-white/[0.02]">
          <h2 className="text-heading-sm text-pulse-text mb-4">Quick actions</h2>
          <div className="space-y-1">
            {[
              { icon: Search, label: 'Discover new grants', desc: 'Browse 20,000+ opportunities', href: '/app/discover' },
              { icon: FolderOpen, label: 'Your workspaces', desc: `${stats.workspaces} active workspace${stats.workspaces !== 1 ? 's' : ''}`, href: '/app/workspace' },
              { icon: Shield, label: 'Complete your vault', desc: `${vaultPct}% complete`, href: '/app/vault', highlight: vaultPct < 80 },
              { icon: Bookmark, label: 'Saved searches', desc: `${stats.savedSearches} active alert${stats.savedSearches !== 1 ? 's' : ''}`, href: '/app/searches' },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 p-3 -mx-1 rounded-lg hover:bg-white/[0.04] transition-colors group"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  item.highlight ? 'bg-pulse-accent/10 text-pulse-accent' : 'bg-white/[0.04] text-pulse-text-tertiary group-hover:text-pulse-accent'
                } transition-colors`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body-sm font-medium text-pulse-text group-hover:text-pulse-accent transition-colors">
                    {item.label}
                  </p>
                  <p className="text-label-sm text-pulse-text-tertiary">{item.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-pulse-text-tertiary/40 group-hover:text-pulse-accent transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </motion.div>

      {/* AI Assistant - compact */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="p-4 rounded-xl border border-white/[0.05] bg-[#111113]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-pulse-accent/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-pulse-accent" />
            </div>
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Ask AI anything about grants..."
                aria-label="Ask AI about grants"
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiSubmit()}
                className="w-full px-4 py-2.5 pr-11 rounded-lg bg-white/[0.03] border border-white/[0.06] focus:ring-1 focus:ring-pulse-accent/30 focus:border-pulse-accent/40 focus:outline-none text-body-sm text-pulse-text placeholder:text-pulse-text-tertiary/50 transition-all duration-150"
              />
              <button
                onClick={handleAiSubmit}
                disabled={aiLoading || !aiInput.trim()}
                aria-label="Send"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-md bg-pulse-accent flex items-center justify-center hover:bg-pulse-accent/90 transition-colors disabled:opacity-40"
              >
                {aiLoading ? (
                  <Loader2 className="w-3.5 h-3.5 text-pulse-bg animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5 text-pulse-bg" />
                )}
              </button>
            </div>
          </div>

          {/* AI Result */}
          {aiResult && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-3 pt-3 border-t border-white/[0.06]"
            >
              {aiResult.error ? (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-pulse-error/10 border border-pulse-error/20">
                  <AlertCircle className="w-4 h-4 text-pulse-error shrink-0 mt-0.5" />
                  <p className="text-body-sm text-pulse-error">{aiResult.error}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {aiResult.response && (
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-pulse-accent shrink-0 mt-1" />
                      <p className="text-body-sm text-pulse-text">{aiResult.response}</p>
                    </div>
                  )}
                  {aiResult.suggestedAction && (
                    <Link
                      href={aiResult.suggestedAction.href}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-pulse-accent text-pulse-bg text-body-sm font-medium hover:bg-pulse-accent/90 transition-colors"
                    >
                      {aiResult.suggestedAction.label}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                  {aiResult.grants && aiResult.grants.length > 0 && (
                    <div className="grid sm:grid-cols-2 gap-2">
                      {aiResult.grants.map((g) => (
                        <Link
                          key={g.id}
                          href={`/app/grants/${encodeURIComponent(g.id)}`}
                          className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-colors group"
                        >
                          <p className="text-body-sm font-medium text-pulse-text group-hover:text-pulse-accent transition-colors truncate">
                            {g.title}
                          </p>
                          <div className="flex items-center gap-3 mt-1 text-label-sm text-pulse-text-tertiary">
                            <span>{g.sponsor}</span>
                            {g.amount && <span className="text-pulse-accent">{g.amount}</span>}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={() => setAiResult(null)}
                className="mt-2 text-label-sm text-pulse-text-tertiary hover:text-pulse-text transition-colors"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
