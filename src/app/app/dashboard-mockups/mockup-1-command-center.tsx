'use client'

/**
 * MOCKUP 1: COMMAND CENTER
 * --------------------------
 * A mission-control style dashboard with:
 * - Large hero stat card showing total funding potential
 * - Circular progress indicators for application stages
 * - Timeline-based activity feed
 * - Deadline countdown with urgency indicators
 * - Bento grid layout for visual hierarchy
 */

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  Search,
  Bookmark,
  FolderOpen,
  Bell,
  TrendingUp,
  Clock,
  Sparkles,
  Target,
  Calendar,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GlassCard, GlassCardContent, GlassCardHeader } from '@/components/ui/glass-card'
import { springs } from '@/lib/motion/animations'
import { useEffect, useState, useRef } from 'react'

// Mock data
const fundingPotential = 2450000
const applicationStages = [
  { name: 'Discovered', count: 24, color: '#40ffaa' },
  { name: 'In Progress', count: 8, color: '#ffb340' },
  { name: 'Submitted', count: 12, color: '#40a0ff' },
  { name: 'Awarded', count: 3, color: '#a040ff' },
]

const upcomingDeadlines = [
  { title: 'SBIR Phase I', days: 3, amount: '$275,000', urgent: true },
  { title: 'Community Block Grant', days: 12, amount: '$500,000', urgent: false },
  { title: 'EPA Environmental Justice', days: 28, amount: '$150,000', urgent: false },
]

const recentActivity = [
  { type: 'match', text: '8 new grants match "Small Business Tech"', time: '2h ago' },
  { type: 'deadline', text: 'SBIR Phase I deadline in 3 days', time: '5h ago' },
  { type: 'saved', text: 'You saved "Community Development Grant"', time: '1d ago' },
  { type: 'workspace', text: 'Draft updated for EPA submission', time: '2d ago' },
]

// Animated number formatter
function AnimatedValue({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const duration = 1500
    const start = Date.now()
    const animate = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(eased * value))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [value])

  return <span>{prefix}{display.toLocaleString()}{suffix}</span>
}

// Circular progress ring
function ProgressRing({ progress, size = 80, strokeWidth = 6, color }: {
  progress: number; size?: number; strokeWidth?: number; color: string
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
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
        transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
      />
    </svg>
  )
}

export default function MockupCommandCenter() {
  const totalGrants = applicationStages.reduce((sum, s) => sum + s.count, 0)

  return (
    <div className="p-8 space-y-8">
      {/* Header with greeting */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-end justify-between"
      >
        <div>
          <p className="text-pulse-text-tertiary font-mono text-micro uppercase tracking-wider mb-2">
            Command Center
          </p>
          <h1 className="font-serif text-display text-pulse-text">
            Good morning, Sarah
          </h1>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Bell className="w-4 h-4" />
            <span className="ml-2">3 alerts</span>
          </Button>
          <Button size="sm">
            <Search className="w-4 h-4" />
            <span className="ml-2">Find Grants</span>
          </Button>
        </div>
      </motion.div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-12 gap-6">

        {/* Hero Stat - Total Funding Potential */}
        <motion.div
          className="col-span-12 lg:col-span-5"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard variant="accent" className="p-8 h-full relative overflow-hidden">
            {/* Animated background glow */}
            <motion.div
              className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-pulse-accent/20 blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 4, repeat: Infinity }}
            />

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-pulse-accent/20 border border-pulse-accent/30 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-pulse-accent" />
                </div>
                <span className="text-pulse-text-secondary text-sm">Total Funding Potential</span>
              </div>

              <div className="font-serif text-display-lg text-pulse-text mb-2">
                <AnimatedValue value={fundingPotential} prefix="$" />
              </div>

              <p className="text-pulse-accent text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                +$450K from 8 new matches this week
              </p>
            </div>
          </GlassCard>
        </motion.div>

        {/* Application Pipeline */}
        <motion.div
          className="col-span-12 lg:col-span-7"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard className="p-6 h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-pulse-text">Application Pipeline</h3>
              <span className="text-pulse-text-tertiary text-sm">{totalGrants} total grants</span>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {applicationStages.map((stage, i) => (
                <motion.div
                  key={stage.name}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                >
                  <div className="relative inline-flex items-center justify-center mb-3">
                    <ProgressRing
                      progress={(stage.count / totalGrants) * 100}
                      color={stage.color}
                    />
                    <span className="absolute text-2xl font-semibold text-pulse-text">
                      {stage.count}
                    </span>
                  </div>
                  <p className="text-sm text-pulse-text-secondary">{stage.name}</p>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Urgent Deadlines */}
        <motion.div
          className="col-span-12 lg:col-span-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard className="p-6 h-full">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-pulse-warning" />
              <h3 className="text-lg font-semibold text-pulse-text">Upcoming Deadlines</h3>
            </div>

            <div className="space-y-4">
              {upcomingDeadlines.map((deadline, i) => (
                <motion.div
                  key={deadline.title}
                  className={`p-4 rounded-xl border ${
                    deadline.urgent
                      ? 'bg-pulse-error/10 border-pulse-error/30'
                      : 'bg-pulse-surface/50 border-pulse-border'
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-pulse-text">{deadline.title}</span>
                    {deadline.urgent && (
                      <Badge variant="error" className="animate-pulse">Urgent</Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className={deadline.urgent ? 'text-pulse-error' : 'text-pulse-text-tertiary'}>
                      {deadline.days} days left
                    </span>
                    <span className="text-pulse-accent">{deadline.amount}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Activity Feed */}
        <motion.div
          className="col-span-12 lg:col-span-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard className="p-6 h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-pulse-text">Recent Activity</h3>
              <Button variant="ghost" size="sm">View all</Button>
            </div>

            <div className="space-y-4">
              {recentActivity.map((activity, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    activity.type === 'match' ? 'bg-pulse-accent/20 text-pulse-accent' :
                    activity.type === 'deadline' ? 'bg-pulse-warning/20 text-pulse-warning' :
                    activity.type === 'saved' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-purple-500/20 text-purple-400'
                  }`}>
                    {activity.type === 'match' && <Sparkles className="w-4 h-4" />}
                    {activity.type === 'deadline' && <Clock className="w-4 h-4" />}
                    {activity.type === 'saved' && <Bookmark className="w-4 h-4" />}
                    {activity.type === 'workspace' && <FolderOpen className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-pulse-text">{activity.text}</p>
                    <p className="text-xs text-pulse-text-tertiary mt-1">{activity.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="col-span-12 lg:col-span-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <GlassCard className="p-6 h-full">
            <h3 className="text-lg font-semibold text-pulse-text mb-6">Quick Actions</h3>

            <div className="space-y-3">
              {[
                { icon: Search, label: 'Discover Grants', href: '/app/discover' },
                { icon: Bookmark, label: 'Saved Grants', href: '/app/saved' },
                { icon: FolderOpen, label: 'Workspaces', href: '/app/workspace' },
                { icon: Bell, label: 'Saved Searches', href: '/app/searches' },
              ].map((action, i) => (
                <motion.div
                  key={action.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                >
                  <Link
                    href={action.href}
                    className="flex items-center justify-between p-3 rounded-xl bg-pulse-surface/50 border border-pulse-border hover:border-pulse-accent/30 hover:bg-pulse-accent/5 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <action.icon className="w-4 h-4 text-pulse-accent" />
                      <span className="text-sm text-pulse-text">{action.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-pulse-text-tertiary group-hover:text-pulse-accent transition-colors" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}
