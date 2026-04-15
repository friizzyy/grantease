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
  Zap,
  Award,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionCard } from '@/components/ui/section-card'
import { EmptyState } from '@/components/ui/empty-state'
import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'

// ─── Types ───────────────────────────────────────────────────────

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
    totalGrantsAvailable: number
  }
  applicationStages: Array<{
    name: string
    count: number
    color: string
    href: string
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
    interactions: number
    matchesFound: number
    timeSaved: string
    successRate: number
  }
  vaultCompleteness: {
    overall: number
    sections: Record<string, number>
    missingCritical: string[]
  } | null
  recentActivity: {
    lastSavedGrant: string | null
    lastWorkspaceUpdate: string | null
  }
}

interface AIResult {
  response?: string
  suggestedAction?: { label: string; href: string }
  grants?: Array<{ title: string; sponsor: string; url?: string; relevance?: string }>
  error?: string
}

// ─── Utilities ───────────────────────────────────────────────────

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

function formatTimeAgo(dateStr: string | null): string | null {
  if (!dateStr) return null
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

// ─── Shared Animations ──────────────────────────────────────────

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.04 } } }
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] } },
}

// ─── Sub-components ─────────────────────────────────────────────

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

function StatCard({
  href,
  icon: Icon,
  label,
  value,
  sub,
  accent,
  iconColor,
}: {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: React.ReactNode
  sub: React.ReactNode
  accent?: boolean
  iconColor?: string
}) {
  return (
    <Link
      href={href}
      className={`group block p-5 rounded-xl border transition-all duration-200 ${
        accent
          ? 'border-pulse-accent/10 bg-pulse-accent/[0.03] hover:border-pulse-accent/20'
          : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
          accent
            ? 'bg-pulse-accent/10'
            : iconColor || 'bg-white/[0.04] group-hover:bg-pulse-accent/10'
        }`}>
          <Icon className={`w-3.5 h-3.5 transition-colors ${
            accent
              ? 'text-pulse-accent'
              : iconColor ? '' : 'text-pulse-text-tertiary group-hover:text-pulse-accent'
          }`} />
        </div>
        <span className="text-label-sm text-pulse-text-tertiary">{label}</span>
      </div>
      <p className={`text-stat-sm tabular-nums ${accent ? 'text-pulse-accent' : 'text-pulse-text'}`}>
        {value}
      </p>
      <p className="text-label-sm text-pulse-text-tertiary mt-2">{sub}</p>
    </Link>
  )
}

function DeadlineRow({ d }: { d: DashboardData['upcomingDeadlines'][0] }) {
  return (
    <Link
      href={d.href}
      className={`flex items-center gap-2 sm:gap-4 p-3 sm:p-3.5 rounded-lg border transition-all duration-200 hover:border-white/[0.12] group ${
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
        <div className="flex items-center gap-3 mt-2">
          <ProgressBar progress={d.progress} color={d.urgent ? '#ef4444' : '#40ffaa'} />
          <span className="text-label-sm text-pulse-text-tertiary shrink-0 w-12 text-right tabular-nums">
            {d.progress}%
          </span>
        </div>
      </div>
      {d.amount != null && d.amount > 0 && (
        <span className="text-body-sm font-medium text-pulse-accent shrink-0 hidden sm:block tabular-nums">
          {formatCurrency(d.amount)}
        </span>
      )}
      <span className={`text-label shrink-0 tabular-nums font-medium ${
        d.urgent ? 'text-red-400' : d.daysLeft !== null && d.daysLeft <= 14 ? 'text-orange-400' : 'text-pulse-text-tertiary'
      }`}>
        {d.daysLeft !== null ? `${d.daysLeft}d` : '--'}
      </span>
    </Link>
  )
}

function DashboardSkeleton() {
  return (
    <div className="px-4 md:px-8 lg:px-10 py-8 max-w-[1200px] mx-auto">
      <div className="animate-pulse">
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="h-3 skeleton w-20 mb-3" />
            <div className="h-7 skeleton w-56" />
          </div>
          <div className="h-9 skeleton rounded-lg w-28" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="p-4 sm:p-5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
              <div className="h-3 skeleton w-20 mb-4" />
              <div className="h-8 skeleton w-24 mb-2" />
              <div className="h-3 skeleton w-16" />
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 mb-6">
          <div className="h-5 skeleton w-40 mb-5" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 skeleton rounded-lg" />
            ))}
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 h-52" />
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 h-52" />
        </div>
      </div>
    </div>
  )
}

function DashboardError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="px-4 md:px-8 lg:px-10 py-8 flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md">
        <div className="w-14 h-14 rounded-2xl bg-pulse-error/10 flex items-center justify-center mx-auto mb-5">
          <AlertCircle className="w-7 h-7 text-pulse-error" />
        </div>
        <h2 className="text-heading text-pulse-text mb-2">Couldn&apos;t load your dashboard</h2>
        <p className="text-body-sm text-pulse-text-secondary mb-6">
          There was a problem loading your data. This is usually temporary.
        </p>
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try again
        </Button>
      </div>
    </div>
  )
}

// ─── Main Dashboard ─────────────────────────────────────────────

export default function AppDashboard() {
  const { data: session } = useSession()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [aiInput, setAiInput] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState<AIResult | null>(null)

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
      const data = await response.json()
      // Unwrap the {result, responseTime} envelope from the API
      const result = data.result || data
      // Normalize suggestedAction shape: API returns {type, route, params}, we need {label, href}
      let suggestedAction: AIResult['suggestedAction'] = undefined
      if (result.suggestedAction) {
        const sa = result.suggestedAction
        suggestedAction = {
          label: sa.label || sa.type?.replace(/_/g, ' ') || 'Go',
          href: sa.href || sa.route || '/app/discover',
        }
      }
      setAiResult({
        response: result.response,
        suggestedAction,
        grants: result.grants,
        error: result.error,
      })
    } catch (err) {
      setAiResult({ error: err instanceof Error ? err.message : 'Something went wrong.' })
    } finally {
      setAiLoading(false)
    }
  }, [aiInput, aiLoading])

  useEffect(() => { fetchDashboard() }, [fetchDashboard])

  if (isLoading) return <DashboardSkeleton />
  if (error || !dashboardData) return <DashboardError onRetry={fetchDashboard} />

  const { user, stats, applicationStages, upcomingDeadlines, topCategories, aiStats, recentActivity } = dashboardData
  const totalGrants = applicationStages.reduce((sum, s) => sum + s.count, 0)
  const userName = user.name || session?.user?.name || 'there'
  const firstName = userName.split(' ')[0]
  const vaultPct = dashboardData.vaultCompleteness?.overall ?? 0
  const urgentCount = upcomingDeadlines.filter(d => d.urgent || (d.daysLeft !== null && d.daysLeft <= 14)).length
  const lastActivity = formatTimeAgo(recentActivity.lastSavedGrant) || formatTimeAgo(recentActivity.lastWorkspaceUpdate)

  // Determine the single next best action for this user based on their state.
  // Priority order: onboarding → urgent deadline → empty vault → no saved grants → fill vault → open workspace → keep browsing
  const nextAction: { title: string; description: string; href: string; label: string; icon: typeof Sparkles; tone: 'accent' | 'urgent' | 'neutral' } | null = (() => {
    if (!user.hasCompletedOnboarding) return null // Already shown by onboarding CTA below
    if (urgentCount > 0) {
      return {
        title: `${urgentCount} deadline${urgentCount > 1 ? 's' : ''} within 2 weeks`,
        description: 'Review your saved grants that are closing soon — don\'t miss these.',
        href: '/app/saved',
        label: 'Review urgent',
        icon: Clock,
        tone: 'urgent',
      }
    }
    if (vaultPct < 40) {
      return {
        title: 'Set up your Vault to auto-fill applications',
        description: 'Applications take 3× longer when you start from scratch. Fill your Vault once, reuse it forever.',
        href: '/app/vault',
        label: 'Complete Vault',
        icon: Shield,
        tone: 'accent',
      }
    }
    if (stats.savedGrants === 0) {
      return {
        title: 'Find your first matching grant',
        description: `We've matched ${stats.totalGrantsAvailable.toLocaleString()} grants against your profile. Save the ones worth applying to.`,
        href: '/app/discover',
        label: 'Discover grants',
        icon: Search,
        tone: 'accent',
      }
    }
    if (vaultPct < 80) {
      return {
        title: `Vault is ${vaultPct}% ready`,
        description: 'Finish your Vault so applications prefill themselves. Most fields only need to be entered once.',
        href: '/app/vault',
        label: 'Finish Vault',
        icon: Shield,
        tone: 'accent',
      }
    }
    if (stats.workspaces === 0 && stats.savedGrants > 0) {
      return {
        title: 'Start your first application',
        description: 'Turn a saved grant into a workspace to track progress, notes, and documents.',
        href: '/app/saved',
        label: 'Pick a grant',
        icon: FileText,
        tone: 'accent',
      }
    }
    return {
      title: 'Keep the momentum going',
      description: `${stats.totalGrantsAvailable.toLocaleString()} grants available. Discover fresh matches weekly.`,
      href: '/app/discover',
      label: 'Browse more',
      icon: Sparkles,
      tone: 'neutral',
    }
  })()

  return (
    <div className="px-4 md:px-8 lg:px-10 py-8 max-w-[1200px] mx-auto">
      {/* Header */}
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-8 sm:mb-10"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <p className="text-label text-pulse-text-tertiary mb-1">{getGreeting()}</p>
          <h1 className="text-display-section text-pulse-text">{firstName}</h1>
          {user.organization && (
            <p className="text-body-sm text-pulse-text-tertiary mt-1">{user.organization}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {lastActivity && (
            <span className="text-label-sm text-pulse-text-tertiary hidden sm:block">
              Last active {lastActivity}
            </span>
          )}
          <Button size="sm" asChild>
            <Link href="/app/discover">
              <Search className="w-4 h-4 mr-2" />
              Find Grants
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Onboarding CTA for new users */}
      {!user.hasCompletedOnboarding && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-5 rounded-xl border border-pulse-accent/20 bg-pulse-accent/[0.04]"
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <h2 className="text-heading-sm text-pulse-text mb-1">Complete your profile</h2>
              <p className="text-body-sm text-pulse-text-secondary">
                Finish onboarding to unlock personalized grant matching and AI-powered recommendations.
              </p>
            </div>
            <Button size="sm" asChild>
              <Link href="/onboarding/step-1">
                Get Started
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </motion.div>
      )}

      {/* Next Best Action — single prioritized "what should I do next?" prompt */}
      {nextAction && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className={`mb-6 p-5 rounded-xl border ${
            nextAction.tone === 'urgent'
              ? 'border-red-500/20 bg-red-500/[0.04]'
              : nextAction.tone === 'accent'
                ? 'border-pulse-accent/20 bg-pulse-accent/[0.04]'
                : 'border-white/[0.08] bg-white/[0.02]'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
              nextAction.tone === 'urgent'
                ? 'bg-red-500/10 text-red-400'
                : nextAction.tone === 'accent'
                  ? 'bg-pulse-accent/10 text-pulse-accent'
                  : 'bg-white/[0.04] text-pulse-text-tertiary'
            }`}>
              <nextAction.icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-label text-pulse-text-tertiary mb-1">Recommended next step</p>
              <h2 className="text-heading-sm text-pulse-text mb-1">{nextAction.title}</h2>
              <p className="text-body-sm text-pulse-text-secondary">{nextAction.description}</p>
            </div>
            <Button
              size="sm"
              asChild
              variant={nextAction.tone === 'urgent' ? 'outline' : 'default'}
              className={nextAction.tone === 'urgent' ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : ''}
            >
              <Link href={nextAction.href}>
                {nextAction.label}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </motion.div>
      )}

      {/* Stat cards */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8"
        variants={stagger}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={fadeUp}>
          <StatCard
            href="/app/saved"
            icon={DollarSign}
            label="Funding potential"
            value={stats.fundingPotential > 0 ? formatCurrency(stats.fundingPotential) : '$0'}
            sub={<span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{stats.savedGrants} grants saved</span>}
            accent
          />
        </motion.div>

        <motion.div variants={fadeUp}>
          <StatCard
            href="/app/saved"
            icon={Bookmark}
            label="Saved grants"
            value={stats.savedGrants}
            sub={`${stats.savedSearches} saved searches`}
          />
        </motion.div>

        <motion.div variants={fadeUp}>
          <StatCard
            href="/app/workspace"
            icon={Clock}
            label="Due soon"
            value={<span className={urgentCount > 0 ? 'text-orange-400' : ''}>{urgentCount}</span>}
            sub={`${upcomingDeadlines.length} total deadlines`}
            iconColor={urgentCount > 0 ? 'bg-orange-400/10 text-orange-400' : undefined}
          />
        </motion.div>

        <motion.div variants={fadeUp}>
          <StatCard
            href="/app/vault"
            icon={Shield}
            label="Vault"
            value={<span className={vaultPct >= 80 ? 'text-pulse-accent' : ''}>{vaultPct}%</span>}
            sub={vaultPct >= 80 ? 'Ready for applications' : 'Complete to auto-fill'}
            iconColor={vaultPct >= 80 ? 'bg-pulse-accent/10 text-pulse-accent' : undefined}
          />
        </motion.div>
      </motion.div>

      {/* Deadlines */}
      <motion.div
        className="mb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.35 }}
      >
        <SectionCard
          title="Upcoming deadlines"
          headerAction={
            <Link
              href="/app/workspace"
              className="text-label-sm text-pulse-text-tertiary hover:text-pulse-accent transition-colors flex items-center gap-1"
            >
              View all <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          }
        >
          {upcomingDeadlines.length > 0 ? (
            <div className="space-y-2">
              {upcomingDeadlines.slice(0, 5).map((d) => (
                <DeadlineRow key={d.id} d={d} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Clock}
              title="No upcoming deadlines"
              description="Save grants to start tracking their deadlines automatically."
              actionLabel="Discover grants"
              actionHref="/app/discover"
            />
          )}
        </SectionCard>
      </motion.div>

      {/* Pipeline + Quick Actions */}
      <motion.div
        className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.18, duration: 0.35 }}
      >
        {/* Pipeline */}
        <SectionCard
          title="Pipeline"
          headerAction={
            <span className="text-label-sm text-pulse-text-tertiary tabular-nums">{totalGrants} total</span>
          }
        >
          {totalGrants > 0 ? (
            <div className="space-y-4">
              {applicationStages.map((stage) => {
                const pct = totalGrants > 0 ? (stage.count / totalGrants) * 100 : 0
                return (
                  <Link
                    key={stage.name}
                    href={stage.href}
                    className="flex items-center gap-3 group"
                  >
                    <span className="text-body-sm text-pulse-text-secondary w-20 sm:w-28 shrink-0 truncate group-hover:text-pulse-text transition-colors">{stage.name}</span>
                    <div className="flex-1">
                      <ProgressBar progress={pct} color={stage.color} />
                    </div>
                    <span className="text-heading-sm text-pulse-text tabular-nums w-8 text-right">{stage.count}</span>
                  </Link>
                )
              })}
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="No applications yet"
              description="Start discovering grants to build your application pipeline."
              actionLabel="Start discovering"
              actionHref="/app/discover"
            />
          )}
        </SectionCard>

        {/* Quick Actions */}
        <SectionCard title="Quick actions">
          <div className="space-y-1">
            {[
              { icon: Search, label: 'Discover new grants', desc: stats.totalGrantsAvailable > 0 ? `Browse ${stats.totalGrantsAvailable.toLocaleString()} opportunities` : 'Browse grant opportunities', href: '/app/discover' },
              { icon: FolderOpen, label: 'Your workspaces', desc: `${stats.workspaces} active workspace${stats.workspaces !== 1 ? 's' : ''}`, href: '/app/workspace' },
              { icon: Shield, label: 'Complete your vault', desc: `${vaultPct}% complete`, href: '/app/vault', highlight: vaultPct < 80 },
              { icon: Bookmark, label: 'Saved searches', desc: `${stats.savedSearches} active alert${stats.savedSearches !== 1 ? 's' : ''}`, href: '/app/searches' },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="flex items-center gap-3 p-3 -mx-1 rounded-lg hover:bg-white/[0.04] transition-colors group"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  item.highlight ? 'bg-pulse-accent/10 text-pulse-accent' : 'bg-white/[0.04] text-pulse-text-tertiary group-hover:text-pulse-accent group-hover:bg-pulse-accent/10'
                }`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-body-sm font-medium text-pulse-text group-hover:text-pulse-accent transition-colors">
                    {item.label}
                  </p>
                  <p className="text-label-sm text-pulse-text-tertiary">{item.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-pulse-text-tertiary/30 group-hover:text-pulse-accent/60 transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </SectionCard>
      </motion.div>

      {/* AI Stats + Top Categories */}
      {(aiStats.interactions > 0 || topCategories.length > 0) && (
        <motion.div
          className="grid md:grid-cols-2 gap-4 sm:gap-6 mb-6"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.35 }}
        >
          {/* AI Impact */}
          {aiStats.interactions > 0 && (
            <SectionCard title="AI Impact">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Zap className="w-3.5 h-3.5 text-pulse-accent" />
                    <span className="text-label-sm text-pulse-text-tertiary">Interactions</span>
                  </div>
                  <p className="text-heading text-pulse-text tabular-nums">{aiStats.interactions}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Bookmark className="w-3.5 h-3.5 text-pulse-accent" />
                    <span className="text-label-sm text-pulse-text-tertiary">Matches</span>
                  </div>
                  <p className="text-heading text-pulse-text tabular-nums">{aiStats.matchesFound}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Clock className="w-3.5 h-3.5 text-pulse-accent" />
                    <span className="text-label-sm text-pulse-text-tertiary">Time saved</span>
                  </div>
                  <p className="text-heading text-pulse-text">{aiStats.timeSaved}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Award className="w-3.5 h-3.5 text-pulse-accent" />
                    <span className="text-label-sm text-pulse-text-tertiary">Success rate</span>
                  </div>
                  <p className="text-heading text-pulse-text tabular-nums">{aiStats.successRate}%</p>
                </div>
              </div>
            </SectionCard>
          )}

          {/* Top Categories */}
          {topCategories.length > 0 && (
            <SectionCard
              title="Top categories"
              headerAction={
                <Link
                  href="/app/saved"
                  className="text-label-sm text-pulse-text-tertiary hover:text-pulse-accent transition-colors flex items-center gap-1"
                >
                  View all <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              }
            >
              <div className="space-y-3">
                {topCategories.map((cat, i) => {
                  const maxCount = topCategories[0]?.count || 1
                  const pct = (cat.count / maxCount) * 100
                  return (
                    <div key={cat.name} className="flex items-center gap-3">
                      <span className="text-body-sm text-pulse-text-secondary w-32 sm:w-40 shrink-0 truncate capitalize">
                        {cat.name.replace(/_/g, ' ')}
                      </span>
                      <div className="flex-1">
                        <ProgressBar progress={pct} color={i === 0 ? '#40ffaa' : '#40ffaa50'} />
                      </div>
                      <span className="text-label-sm text-pulse-text-tertiary tabular-nums w-6 text-right">{cat.count}</span>
                    </div>
                  )
                })}
              </div>
            </SectionCard>
          )}
        </motion.div>
      )}

      {/* AI Assistant */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.26, duration: 0.35 }}
      >
        <div className="p-5 rounded-xl border border-pulse-accent/10 bg-pulse-accent/[0.02]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-pulse-accent/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-pulse-accent" />
            </div>
            <div>
              <h2 className="text-heading-sm text-pulse-text">AI Assistant</h2>
              <p className="text-label-sm text-pulse-text-tertiary">Ask anything about grants, eligibility, or applications</p>
            </div>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder='e.g. "Find grants for renewable energy research"'
              aria-label="Ask AI about grants"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAiSubmit()}
              className="w-full px-4 py-3 pr-12 rounded-lg bg-white/[0.04] border border-white/[0.08] focus:ring-1 focus:ring-pulse-accent/30 focus:border-pulse-accent/30 focus:outline-none text-body-sm text-pulse-text placeholder:text-pulse-text-tertiary/40 transition-all duration-150"
            />
            <button
              onClick={handleAiSubmit}
              disabled={aiLoading || !aiInput.trim()}
              aria-label="Send"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-md bg-pulse-accent flex items-center justify-center hover:bg-pulse-accent/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {aiLoading ? (
                <Loader2 className="w-3.5 h-3.5 text-pulse-bg animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5 text-pulse-bg" />
              )}
            </button>
          </div>

          {/* AI Result */}
          {aiResult && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-4 pt-4 border-t border-white/[0.06]"
            >
              {aiResult.error ? (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-pulse-error/5 border border-pulse-error/15">
                  <AlertCircle className="w-4 h-4 text-pulse-error shrink-0 mt-0.5" />
                  <p className="text-body-sm text-pulse-error/80">{aiResult.error}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {aiResult.response && (
                    <div className="flex items-start gap-3">
                      <Sparkles className="w-4 h-4 text-pulse-accent shrink-0 mt-0.5" />
                      <p className="text-body-sm text-pulse-text leading-relaxed">{aiResult.response}</p>
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
                      {aiResult.grants.map((g, i) => (
                        <Link
                          key={g.url || `grant-${i}`}
                          href={g.url?.startsWith('http') ? g.url : `/app/discover?q=${encodeURIComponent(g.title)}`}
                          target={g.url?.startsWith('http') ? '_blank' : undefined}
                          rel={g.url?.startsWith('http') ? 'noopener noreferrer' : undefined}
                          className="p-3.5 rounded-lg bg-white/[0.03] border border-white/[0.06] hover:border-pulse-accent/20 transition-all group"
                        >
                          <p className="text-body-sm font-medium text-pulse-text group-hover:text-pulse-accent transition-colors truncate">
                            {g.title}
                          </p>
                          <div className="flex items-center gap-3 mt-1.5 text-label-sm text-pulse-text-tertiary">
                            <span>{g.sponsor}</span>
                            {g.relevance && (
                              <span className="text-pulse-accent/70 truncate">{g.relevance}</span>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={() => setAiResult(null)}
                className="mt-3 text-label-sm text-pulse-text-tertiary hover:text-pulse-text transition-colors"
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
