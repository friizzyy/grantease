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
 */

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FolderPlus,
  Calendar,
  Clock,
  FolderOpen,
  FileText,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Sparkles,
  MoreHorizontal,
  Play,
  Pause,
  Send,
  Award,
  XCircle,
  Building2,
  ChevronRight,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GlassCard } from '@/components/ui/glass-card'
import { formatDate } from '@/lib/utils'

// Mock workspaces with enhanced data
const workspaces = [
  {
    id: '1',
    name: 'SBIR Phase I Application',
    status: 'in_progress',
    grant: {
      id: '1',
      title: 'Small Business Innovation Research (SBIR) Phase I',
      sponsor: 'National Science Foundation',
      deadlineDate: new Date('2024-03-15'),
      amount: '$275,000',
    },
    progress: 75,
    completedTasks: 9,
    totalTasks: 12,
    updatedAt: new Date('2024-01-28'),
    nextStep: 'Complete budget justification',
    matchScore: 94,
  },
  {
    id: '2',
    name: 'Community Development Grant',
    status: 'in_progress',
    grant: {
      id: '2',
      title: 'Community Development Block Grant Program',
      sponsor: 'HUD',
      deadlineDate: new Date('2024-02-28'),
      amount: '$500,000',
    },
    progress: 40,
    completedTasks: 4,
    totalTasks: 10,
    updatedAt: new Date('2024-01-25'),
    nextStep: 'Upload supporting documents',
    matchScore: 91,
  },
  {
    id: '3',
    name: 'EPA Environmental Justice',
    status: 'submitted',
    grant: {
      id: '3',
      title: 'Environmental Justice Collaborative Problem-Solving',
      sponsor: 'EPA',
      deadlineDate: new Date('2024-01-15'),
      amount: '$150,000',
    },
    progress: 100,
    completedTasks: 8,
    totalTasks: 8,
    updatedAt: new Date('2024-01-14'),
    nextStep: null,
    matchScore: 87,
    submittedDate: 'Jan 14, 2024',
  },
  {
    id: '4',
    name: 'NEA Arts Project Grant',
    status: 'not_started',
    grant: {
      id: '5',
      title: 'Grants for Arts Projects',
      sponsor: 'National Endowment for the Arts',
      deadlineDate: new Date('2024-05-15'),
      amount: '$100,000',
    },
    progress: 0,
    completedTasks: 0,
    totalTasks: 10,
    updatedAt: new Date('2024-01-20'),
    nextStep: 'Begin project narrative',
    matchScore: 78,
  },
]

const statusConfig = {
  not_started: { label: 'Not Started', variant: 'default' as const, icon: Pause, color: 'text-pulse-text-tertiary' },
  in_progress: { label: 'In Progress', variant: 'warning' as const, icon: Play, color: 'text-pulse-warning' },
  submitted: { label: 'Submitted', variant: 'success' as const, icon: Send, color: 'text-blue-400' },
  awarded: { label: 'Awarded', variant: 'accent' as const, icon: Award, color: 'text-pulse-accent' },
  rejected: { label: 'Not Selected', variant: 'error' as const, icon: XCircle, color: 'text-pulse-error' },
}

// Animated progress ring
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
          stroke="rgba(255,255,255,0.1)"
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
        <span className="text-sm font-semibold text-pulse-text">{progress}%</span>
      </div>
    </div>
  )
}

// Workspace Stats Summary
function WorkspaceStats() {
  const inProgress = workspaces.filter(w => w.status === 'in_progress').length
  const submitted = workspaces.filter(w => w.status === 'submitted').length
  const totalPipeline = workspaces.reduce((sum, w) => {
    const amount = parseInt(w.grant.amount.replace(/[^0-9]/g, '')) || 0
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-pulse-accent/20 border border-pulse-accent/30 flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-pulse-accent" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-pulse-text">{workspaces.length}</p>
                <p className="text-xs text-pulse-text-tertiary">Total applications</p>
              </div>
            </div>
            <div className="w-px h-10 bg-pulse-border" />
            <div>
              <p className="text-2xl font-semibold text-pulse-warning">{inProgress}</p>
              <p className="text-xs text-pulse-text-tertiary">In progress</p>
            </div>
            <div className="w-px h-10 bg-pulse-border" />
            <div>
              <p className="text-2xl font-semibold text-blue-400">{submitted}</p>
              <p className="text-xs text-pulse-text-tertiary">Submitted</p>
            </div>
            <div className="w-px h-10 bg-pulse-border" />
            <div>
              <p className="text-2xl font-semibold text-pulse-accent">${(totalPipeline / 1000000).toFixed(1)}M</p>
              <p className="text-xs text-pulse-text-tertiary">Pipeline value</p>
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
function AIInsightsCard() {
  const urgentCount = workspaces.filter(w => {
    if (!w.grant.deadlineDate) return false
    const daysLeft = Math.ceil((w.grant.deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return daysLeft <= 30 && w.status !== 'submitted'
  }).length

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
              <p className="text-sm text-pulse-text-secondary">
                Your SBIR Phase I application is <span className="text-pulse-accent font-medium">75% complete</span>. Complete the budget justification to finish strong.
              </p>
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
function WorkspaceCard({ workspace, index }: { workspace: typeof workspaces[0]; index: number }) {
  const status = statusConfig[workspace.status as keyof typeof statusConfig]
  const StatusIcon = status.icon
  const daysUntilDeadline = workspace.grant.deadlineDate
    ? Math.ceil((workspace.grant.deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  const getProgressColor = () => {
    if (workspace.progress >= 75) return '#40ffaa'
    if (workspace.progress >= 50) return '#40a0ff'
    if (workspace.progress >= 25) return '#ffb340'
    return '#ff4040'
  }

  const isUrgent = daysUntilDeadline !== null && daysUntilDeadline <= 14 && workspace.status !== 'submitted'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 + index * 0.05 }}
    >
      <Link href={`/app/workspace/${workspace.id}`}>
        <GlassCard className={`p-5 hover:border-pulse-accent/30 transition-all group cursor-pointer ${
          isUrgent ? 'border-pulse-warning/30' : ''
        }`}>
          <div className="flex items-start gap-5">
            {/* Progress Ring */}
            <div className="shrink-0">
              <ProgressRing progress={workspace.progress} color={getProgressColor()} />
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
                <span className="text-pulse-accent font-medium">{workspace.grant.amount}</span>
              </div>

              {/* Progress Bar & Tasks */}
              <div className="mt-4 pt-4 border-t border-pulse-border/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-pulse-text-tertiary">
                      <CheckCircle2 className="w-4 h-4 inline mr-1.5 text-pulse-accent" />
                      {workspace.completedTasks}/{workspace.totalTasks} tasks
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
                    {workspace.status === 'submitted' && workspace.submittedDate && (
                      <span className="text-sm text-blue-400">
                        Submitted {workspace.submittedDate}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-pulse-text-tertiary">
                    Updated {formatDate(workspace.updatedAt)}
                  </span>
                </div>

                {/* Next Step */}
                {workspace.nextStep && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-pulse-surface/50 border border-pulse-border">
                    <Zap className="w-4 h-4 text-pulse-accent shrink-0" />
                    <span className="text-sm text-pulse-text-secondary">
                      Next: <span className="text-pulse-text">{workspace.nextStep}</span>
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

export default function WorkspacesPage() {
  const isEmpty = workspaces.length === 0
  const [filter, setFilter] = useState<'all' | 'in_progress' | 'submitted'>('all')

  const filteredWorkspaces = filter === 'all'
    ? workspaces
    : workspaces.filter(w => w.status === filter)

  return (
    <div className="p-8">
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
              <span className="text-pulse-text-tertiary font-mono text-micro uppercase tracking-wider">
                Application Manager
              </span>
            </div>
            <h1 className="font-serif text-display text-pulse-text">
              Your Workspaces
            </h1>
            <p className="text-pulse-text-secondary mt-2">
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
          <WorkspaceStats />

          {/* AI Insights */}
          <AIInsightsCard />

          {/* Filter Tabs */}
          <motion.div
            className="flex items-center gap-2 mb-6"
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
                onClick={() => setFilter(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                  filter === tab.id
                    ? 'bg-pulse-accent/10 border-pulse-accent/30 text-pulse-accent'
                    : 'bg-pulse-surface border-pulse-border text-pulse-text-secondary hover:border-pulse-accent/20 hover:text-pulse-text'
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
            <div className="text-center py-12">
              <p className="text-pulse-text-tertiary">No applications in this category</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
