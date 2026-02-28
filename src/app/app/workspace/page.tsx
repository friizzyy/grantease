'use client'

/**
 * WORKSPACE PAGE - PREMIUM UPGRADE
 * ---------------------------------
 * Premium application management with:
 * - AI progress insights
 * - Visual progress tracking
 * - Quick action cards
 * - Deadline urgency indicators
 * - GlassCard design throughout
 * - Real API integration
 */

import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  FolderPlus,
  Clock,
  FolderOpen,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Play,
  Pause,
  Send,
  Award,
  XCircle,
  Building2,
  ChevronRight,
  Zap,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GlassCard } from '@/components/ui/glass-card'
import { formatDate } from '@/lib/utils'

// Types
interface Workspace {
  id: string
  name: string
  status: string
  notes: string | null
  checklist: Array<{ id: string; text: string; completed: boolean; category?: string }>
  createdAt: string
  updatedAt: string
  grant: {
    id: string
    title: string
    sponsor: string
    deadlineDate: string | null
    deadlineType: string | null
    amountMin: number | null
    amountMax: number | null
  }
  documents: Array<{ id: string; name: string; type: string; createdAt: string }>
}

const statusConfig = {
  not_started: { label: 'Not Started', variant: 'default' as const, icon: Pause, color: 'text-pulse-text-tertiary' },
  in_progress: { label: 'In Progress', variant: 'warning' as const, icon: Play, color: 'text-pulse-warning' },
  submitted: { label: 'Submitted', variant: 'success' as const, icon: Send, color: 'text-emerald-400' },
  awarded: { label: 'Awarded', variant: 'accent' as const, icon: Award, color: 'text-pulse-accent' },
  rejected: { label: 'Not Selected', variant: 'error' as const, icon: XCircle, color: 'text-pulse-error' },
}

// Format amount
function formatAmount(min: number | null, max: number | null): string {
  const amount = max || min
  if (!amount) return 'Varies'
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`
  if (amount >= 1000) return `$${Math.round(amount / 1000)}K`
  return `$${amount.toLocaleString()}`
}

// Clean progress ring without glow filters
function ProgressRing({ progress, size = 56, strokeWidth = 5, color }: {
  progress: number; size?: number; strokeWidth?: number; color: string
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-label-sm text-pulse-text">{progress}%</span>
      </div>
    </div>
  )
}

// Workspace Stats Summary
function WorkspaceStats({ workspaces }: { workspaces: Workspace[] }) {
  const inProgress = workspaces.filter(w => w.status === 'in_progress').length
  const submitted = workspaces.filter(w => w.status === 'submitted').length
  const totalPipeline = workspaces.reduce((sum, w) => {
    const amount = w.grant.amountMax || w.grant.amountMin || 0
    return sum + amount
  }, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="mb-6"
    >
      <GlassCard variant="accent" className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-pulse-accent/10 border border-pulse-accent/20 flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-pulse-accent" />
              </div>
              <div>
                <p className="text-stat-sm text-pulse-text">{workspaces.length}</p>
                <p className="text-label-sm text-pulse-text-tertiary normal-case">Total applications</p>
              </div>
            </div>
            <div className="w-px h-10 bg-pulse-border hidden sm:block" />
            <div>
              <p className="text-stat-sm text-pulse-warning">{inProgress}</p>
              <p className="text-label-sm text-pulse-text-tertiary normal-case">In progress</p>
            </div>
            <div className="w-px h-10 bg-pulse-border hidden sm:block" />
            <div>
              <p className="text-stat-sm text-emerald-400">{submitted}</p>
              <p className="text-label-sm text-pulse-text-tertiary normal-case">Submitted</p>
            </div>
            <div className="w-px h-10 bg-pulse-border hidden sm:block" />
            <div>
              <p className="text-stat-sm text-pulse-accent">
                {totalPipeline >= 1000000
                  ? `$${(totalPipeline / 1000000).toFixed(1)}M`
                  : `$${Math.round(totalPipeline / 1000)}K`
                }
              </p>
              <p className="text-label-sm text-pulse-text-tertiary normal-case">Pipeline value</p>
            </div>
          </div>
          <Button size="sm" asChild>
            <Link href="/app/discover">
              <FolderPlus className="w-4 h-4 mr-2" />
              New Application
            </Link>
          </Button>
        </div>
      </GlassCard>
    </motion.div>
  )
}

// AI Insights Card
function AIInsightsCard({ workspaces }: { workspaces: Workspace[] }) {
  const urgentCount = workspaces.filter(w => {
    if (!w.grant.deadlineDate) return false
    const daysLeft = Math.ceil((new Date(w.grant.deadlineDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return daysLeft <= 30 && daysLeft > 0 && w.status !== 'submitted' && w.status !== 'awarded'
  }).length

  const inProgressWorkspace = workspaces.find(w => w.status === 'in_progress')
  const progress = inProgressWorkspace
    ? Math.round((inProgressWorkspace.checklist.filter(i => i.completed).length / Math.max(inProgressWorkspace.checklist.length, 1)) * 100)
    : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="mb-6"
    >
      <GlassCard className="p-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pulse-accent to-pulse-accent/50 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-pulse-bg" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-pulse-text mb-1">AI Recommendations</h3>
            <div className="space-y-2">
              {urgentCount > 0 && (
                <p className="text-sm text-pulse-text-secondary">
                  <span className="text-pulse-warning font-medium">{urgentCount} application(s)</span> have deadlines within 30 days. Focus on completing these first.
                </p>
              )}
              {inProgressWorkspace && (
                <p className="text-sm text-pulse-text-secondary">
                  Your {inProgressWorkspace.name} is <span className="text-pulse-accent font-medium">{progress}% complete</span>.
                  {inProgressWorkspace.checklist.find(i => !i.completed)?.text
                    ? ` Next: ${inProgressWorkspace.checklist.find(i => !i.completed)?.text}`
                    : ''
                  }
                </p>
              )}
              {workspaces.length === 0 && (
                <p className="text-sm text-pulse-text-secondary">
                  Start by discovering grants that match your profile and creating your first application.
                </p>
              )}
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Zap className="w-4 h-4 mr-1" />
            Get Help
          </Button>
        </div>
      </GlassCard>
    </motion.div>
  )
}

// Premium Workspace Card
function WorkspaceCard({ workspace, index }: { workspace: Workspace; index: number }) {
  const status = statusConfig[workspace.status as keyof typeof statusConfig] || statusConfig.not_started
  const StatusIcon = status.icon

  const completedTasks = workspace.checklist.filter(i => i.completed).length
  const totalTasks = workspace.checklist.length
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const daysUntilDeadline = workspace.grant.deadlineDate
    ? Math.ceil((new Date(workspace.grant.deadlineDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  const getProgressColor = () => {
    if (progress >= 75) return '#40ffaa'
    if (progress >= 50) return '#34d399'
    if (progress >= 25) return '#fbbf24'
    return 'rgba(255,255,255,0.25)'
  }

  const isUrgent = daysUntilDeadline !== null && daysUntilDeadline <= 14 && daysUntilDeadline > 0 && workspace.status !== 'submitted'
  const nextStep = workspace.checklist.find(i => !i.completed)?.text

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 + index * 0.05 }}
    >
      <Link href={`/app/workspace/${workspace.id}`}>
        <GlassCard className={`p-5 md:p-6 hover:border-white/[0.1] transition-all duration-200 group cursor-pointer ${
          isUrgent ? 'border-pulse-warning/30' : ''
        }`}>
          <div className="flex items-start gap-5">
            {/* Progress Ring */}
            <div className="shrink-0">
              <ProgressRing progress={progress} color={getProgressColor()} />
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-pulse-text group-hover:text-pulse-accent transition-colors truncate">
                    {workspace.name}
                  </h3>
                  <Badge variant={status.variant} className="shrink-0">
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {status.label}
                  </Badge>
                  {isUrgent && (
                    <Badge variant="error" className="shrink-0">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Urgent
                    </Badge>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-pulse-text-tertiary group-hover:text-pulse-accent transition-colors" />
              </div>

              {/* Grant Info */}
              <p className="text-sm text-pulse-text-secondary mb-3 truncate">
                {workspace.grant.title}
              </p>

              {/* Meta Info */}
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5 text-pulse-text-tertiary">
                  <Building2 className="w-4 h-4" />
                  {workspace.grant.sponsor}
                </span>
                <span className="text-pulse-accent font-medium">
                  {formatAmount(workspace.grant.amountMin, workspace.grant.amountMax)}
                </span>
              </div>

              {/* Progress Bar & Tasks */}
              <div className="mt-4 pt-4 border-t border-pulse-border/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-pulse-text-tertiary">
                      <CheckCircle2 className="w-4 h-4 inline mr-1.5 text-pulse-accent" />
                      {completedTasks}/{totalTasks} tasks
                    </span>
                    {daysUntilDeadline !== null && daysUntilDeadline > 0 && (
                      <span className={`text-sm flex items-center gap-1.5 ${
                        daysUntilDeadline <= 7 ? 'text-pulse-error' :
                        daysUntilDeadline <= 14 ? 'text-pulse-warning' :
                        'text-pulse-text-tertiary'
                      }`}>
                        <Clock className="w-4 h-4" />
                        {daysUntilDeadline} days left
                      </span>
                    )}
                    {workspace.status === 'submitted' && (
                      <span className="text-sm text-emerald-400">
                        Submitted
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-pulse-text-tertiary">
                    Updated {formatDate(new Date(workspace.updatedAt))}
                  </span>
                </div>

                {/* Next Step */}
                {nextStep && workspace.status !== 'submitted' && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-pulse-accent/5 to-pulse-surface border border-pulse-accent/20">
                    <Zap className="w-4 h-4 text-pulse-accent shrink-0" />
                    <span className="text-sm text-pulse-text-secondary">
                      Next: <span className="text-pulse-text">{nextStep}</span>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </GlassCard>
      </Link>
    </motion.div>
  )
}

// Empty State
function EmptyWorkspaces() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-16"
    >
      <GlassCard className="max-w-md mx-auto p-8">
        <div className="w-16 h-16 rounded-full bg-pulse-accent/10 border border-pulse-accent/30 flex items-center justify-center mx-auto mb-6">
          <FolderOpen className="w-8 h-8 text-pulse-accent" />
        </div>
        <h2 className="text-xl font-semibold text-pulse-text mb-2">No applications yet</h2>
        <p className="text-pulse-text-secondary mb-6">
          Start working on a grant application by finding a matching opportunity.
        </p>
        <Button asChild>
          <Link href="/app/discover">
            <Sparkles className="w-4 h-4 mr-2" />
            Discover Grants
          </Link>
        </Button>
      </GlassCard>
    </motion.div>
  )
}

// Loading skeleton
function WorkspacesSkeleton() {
  return (
    <div className="px-4 md:px-6 lg:px-8 py-8 animate-pulse">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-5 h-5 bg-pulse-surface rounded" />
          <div className="h-3 bg-pulse-surface rounded w-32" />
        </div>
        <div className="h-10 bg-pulse-surface rounded w-64 mb-2" />
        <div className="h-5 bg-pulse-surface rounded w-96" />
      </div>

      {/* Stats Bar */}
      <div className="rounded-2xl border border-pulse-border/30 bg-pulse-surface/30 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-3">
                {i === 1 && <div className="w-10 h-10 bg-pulse-surface rounded-lg" />}
                <div>
                  <div className="h-8 bg-pulse-surface rounded w-12 mb-1" />
                  <div className="h-3 bg-pulse-surface rounded w-20" />
                </div>
              </div>
            ))}
          </div>
          <div className="h-9 bg-pulse-surface rounded-lg w-36" />
        </div>
      </div>

      {/* AI Insights */}
      <div className="rounded-2xl border border-pulse-border/30 bg-pulse-surface/30 p-4 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-pulse-surface rounded-lg shrink-0" />
          <div className="flex-1">
            <div className="h-4 bg-pulse-surface rounded w-40 mb-2" />
            <div className="h-3 bg-pulse-surface rounded w-full mb-1" />
            <div className="h-3 bg-pulse-surface rounded w-3/4" />
          </div>
          <div className="h-8 bg-pulse-surface rounded-lg w-24" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6">
        {['All', 'In Progress', 'Submitted'].map(tab => (
          <div key={tab} className="h-9 bg-pulse-surface rounded-xl w-28" />
        ))}
      </div>

      {/* Workspace Cards */}
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="rounded-2xl border border-pulse-border/30 bg-pulse-surface/30 p-5">
            <div className="flex items-start gap-5">
              {/* Progress ring placeholder */}
              <div className="w-14 h-14 bg-pulse-surface rounded-full shrink-0" />
              <div className="flex-1 min-w-0">
                {/* Header row */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-5 bg-pulse-surface rounded w-48" />
                  <div className="h-5 bg-pulse-surface rounded-full w-24" />
                </div>
                {/* Grant title */}
                <div className="h-4 bg-pulse-surface rounded w-72 mb-3" />
                {/* Meta info */}
                <div className="flex items-center gap-4">
                  <div className="h-4 bg-pulse-surface rounded w-32" />
                  <div className="h-4 bg-pulse-surface rounded w-16" />
                </div>
                {/* Progress bar area */}
                <div className="mt-4 pt-4 border-t border-pulse-border/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-4">
                      <div className="h-4 bg-pulse-surface rounded w-24" />
                      <div className="h-4 bg-pulse-surface rounded w-20" />
                    </div>
                    <div className="h-3 bg-pulse-surface rounded w-24" />
                  </div>
                  <div className="h-10 bg-pulse-surface rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Error state
function WorkspacesError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="px-4 md:px-6 lg:px-8 py-8 flex items-center justify-center min-h-[60vh]">
      <GlassCard className="p-8 text-center max-w-md">
        <div className="w-12 h-12 rounded-full bg-pulse-error/20 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6 text-pulse-error" />
        </div>
        <h2 className="text-lg font-semibold text-pulse-text mb-2">
          Failed to load workspaces
        </h2>
        <p className="text-pulse-text-secondary text-sm mb-4">
          We couldn&apos;t load your workspaces. Please try again.
        </p>
        <Button onClick={onRetry}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </GlassCard>
    </div>
  )
}

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'submitted'>('all')

  const fetchWorkspaces = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/user/workspaces')
      if (!response.ok) {
        throw new Error('Failed to fetch workspaces')
      }
      const data = await response.json()
      setWorkspaces(data.workspaces || [])
    } catch (err) {
      console.error('Workspaces fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load workspaces')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchWorkspaces()
  }, [fetchWorkspaces])

  if (isLoading) {
    return <WorkspacesSkeleton />
  }

  if (error) {
    return <WorkspacesError onRetry={fetchWorkspaces} />
  }

  const isEmpty = workspaces.length === 0
  const filteredWorkspaces = filter === 'all'
    ? workspaces
    : workspaces.filter(w => w.status === filter)

  return (
    <div className="px-4 md:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-5 h-5 text-pulse-accent" />
              <span className="text-label text-pulse-text-tertiary">
                Application Manager
              </span>
            </div>
            <h1 className="text-display-page text-pulse-text">
              Your Workspaces
            </h1>
            <p className="text-body text-pulse-text-secondary mt-2">
              Track progress, manage tasks, and submit winning applications
            </p>
          </div>
        </div>
      </motion.div>

      {isEmpty ? (
        <EmptyWorkspaces />
      ) : (
        <>
          {/* Stats Summary */}
          <WorkspaceStats workspaces={workspaces} />

          {/* AI Insights */}
          <AIInsightsCard workspaces={workspaces} />

          {/* Filter Tabs */}
          <motion.div
            className="flex items-center gap-2 mb-6 flex-wrap"
            role="tablist"
            aria-label="Filter workspaces"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            {[
              { id: 'all', label: 'All', count: workspaces.length },
              { id: 'in_progress', label: 'In Progress', count: workspaces.filter(w => w.status === 'in_progress').length },
              { id: 'submitted', label: 'Submitted', count: workspaces.filter(w => w.status === 'submitted').length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as 'all' | 'in_progress' | 'submitted')}
                role="tab"
                aria-selected={filter === tab.id}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border active:scale-[0.98] transition-all duration-150 focus-visible:ring-2 focus-visible:ring-pulse-accent/50 focus-visible:outline-none ${
                  filter === tab.id
                    ? 'bg-pulse-accent/10 border-pulse-accent/30 text-pulse-accent'
                    : 'bg-pulse-surface border-pulse-border/40 text-pulse-text-secondary hover:border-pulse-border hover:text-pulse-text'
                }`}
              >
                <span className="text-sm font-medium">{tab.label}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  filter === tab.id ? 'bg-pulse-accent/20' : 'bg-pulse-elevated'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </motion.div>

          {/* Workspace List */}
          <div className="space-y-4">
            {filteredWorkspaces.map((workspace, index) => (
              <WorkspaceCard key={workspace.id} workspace={workspace} index={index} />
            ))}
          </div>

          {filteredWorkspaces.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-12 h-12 rounded-2xl bg-pulse-surface border border-pulse-border flex items-center justify-center mx-auto mb-4">
                <FolderOpen className="w-6 h-6 text-pulse-text-tertiary" />
              </div>
              <p className="text-body-sm text-pulse-text-secondary">No applications match this filter</p>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}
