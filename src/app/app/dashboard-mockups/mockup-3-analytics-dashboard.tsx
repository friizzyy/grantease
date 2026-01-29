'use client'

/**
 * MOCKUP 3: ANALYTICS DASHBOARD
 * ------------------------------
 * Data-rich dashboard with:
 * - Mini charts and sparklines
 * - Success rate metrics
 * - Funding distribution visualization
 * - Trend indicators everywhere
 * - Dense but organized information display
 */

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  Bookmark,
  FolderOpen,
  Bell,
  TrendingUp,
  Clock,
  DollarSign,
  Target,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Award,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GlassCard } from '@/components/ui/glass-card'
import { useEffect, useState } from 'react'

// Mock data
const metrics = [
  {
    label: 'Total Applications',
    value: 47,
    change: 12,
    isPositive: true,
    icon: FileText,
    sparkline: [20, 25, 22, 30, 35, 32, 47],
  },
  {
    label: 'Success Rate',
    value: '23%',
    change: 5,
    isPositive: true,
    icon: Target,
    sparkline: [15, 18, 16, 20, 19, 22, 23],
  },
  {
    label: 'Funding Secured',
    value: '$1.2M',
    change: 180000,
    isPositive: true,
    icon: DollarSign,
    sparkline: [400, 500, 600, 750, 900, 1000, 1200],
  },
  {
    label: 'Avg. Response Time',
    value: '45 days',
    change: 8,
    isPositive: false,
    icon: Clock,
    sparkline: [60, 55, 50, 48, 52, 47, 45],
  },
]

const fundingByCategory = [
  { name: 'Technology', amount: 450000, percentage: 37.5, color: '#40ffaa' },
  { name: 'Research', amount: 350000, percentage: 29.2, color: '#40a0ff' },
  { name: 'Community', amount: 250000, percentage: 20.8, color: '#a040ff' },
  { name: 'Environment', amount: 150000, percentage: 12.5, color: '#ffb340' },
]

const recentSubmissions = [
  { title: 'SBIR Phase I', status: 'Under Review', date: 'Jan 15', score: 85 },
  { title: 'NEA Arts Grant', status: 'Awarded', date: 'Jan 10', score: 92 },
  { title: 'DOE Clean Energy', status: 'Rejected', date: 'Jan 5', score: 68 },
  { title: 'NIH Research', status: 'Under Review', date: 'Dec 28', score: 78 },
]

const monthlyTrend = [
  { month: 'Jul', applications: 4, awards: 1 },
  { month: 'Aug', applications: 6, awards: 1 },
  { month: 'Sep', applications: 5, awards: 2 },
  { month: 'Oct', applications: 8, awards: 2 },
  { month: 'Nov', applications: 7, awards: 1 },
  { month: 'Dec', applications: 9, awards: 3 },
  { month: 'Jan', applications: 8, awards: 2 },
]

// Mini sparkline chart
function Sparkline({ data, color = '#40ffaa', height = 32 }: {
  data: number[]; color?: string; height?: number
}) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = height - ((value - min) / range) * height
    return `${x},${y}`
  }).join(' ')

  return (
    <svg width="100%" height={height} className="overflow-visible">
      <motion.polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      />
    </svg>
  )
}

// Mini bar chart
function MiniBarChart({ data }: { data: typeof monthlyTrend }) {
  const maxApps = Math.max(...data.map(d => d.applications))

  return (
    <div className="flex items-end justify-between h-24 gap-2">
      {data.map((item, i) => (
        <div key={item.month} className="flex-1 flex flex-col items-center gap-1">
          <div className="relative w-full flex flex-col gap-0.5" style={{ height: '100%' }}>
            <motion.div
              className="w-full bg-pulse-accent/30 rounded-t"
              initial={{ height: 0 }}
              animate={{ height: `${(item.applications / maxApps) * 100}%` }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            />
            <motion.div
              className="absolute bottom-0 w-full bg-pulse-accent rounded-t"
              initial={{ height: 0 }}
              animate={{ height: `${(item.awards / maxApps) * 100}%` }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.05 }}
            />
          </div>
          <span className="text-[10px] text-pulse-text-tertiary">{item.month}</span>
        </div>
      ))}
    </div>
  )
}

// Metric card with sparkline
function MetricCard({ metric, index }: { metric: typeof metrics[0]; index: number }) {
  const Icon = metric.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <GlassCard className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-xl bg-pulse-accent/10 border border-pulse-accent/20 flex items-center justify-center">
            <Icon className="w-5 h-5 text-pulse-accent" />
          </div>
          <div className={`flex items-center gap-1 text-xs font-medium ${
            metric.isPositive ? 'text-pulse-success' : 'text-pulse-error'
          }`}>
            {metric.isPositive ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {typeof metric.change === 'number' && metric.change > 1000
              ? `$${(metric.change / 1000).toFixed(0)}K`
              : `${metric.change}${typeof metric.value === 'string' && metric.value.includes('%') ? '%' : ''}`
            }
          </div>
        </div>

        <div className="mb-3">
          <p className="text-2xl font-semibold text-pulse-text">{metric.value}</p>
          <p className="text-sm text-pulse-text-tertiary">{metric.label}</p>
        </div>

        <div className="h-8">
          <Sparkline
            data={metric.sparkline}
            color={metric.isPositive ? '#40ffaa' : '#ff4040'}
          />
        </div>
      </GlassCard>
    </motion.div>
  )
}

export default function MockupAnalyticsDashboard() {
  return (
    <div className="p-8">
      {/* Header */}
      <motion.div
        className="flex items-end justify-between mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-5 h-5 text-pulse-accent" />
            <span className="text-pulse-text-tertiary font-mono text-micro uppercase tracking-wider">
              Analytics Overview
            </span>
          </div>
          <h1 className="font-serif text-display text-pulse-text">
            Performance Dashboard
          </h1>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="sm">
            <Activity className="w-4 h-4 mr-2" />
            Last 30 Days
          </Button>
          <Button size="sm">
            <Search className="w-4 h-4 mr-2" />
            Find Grants
          </Button>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((metric, i) => (
          <MetricCard key={metric.label} metric={metric} index={i} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        {/* Monthly Trend */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-pulse-text">Monthly Activity</h3>
                <p className="text-sm text-pulse-text-tertiary">Applications vs Awards</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-pulse-accent/30" />
                  <span className="text-pulse-text-tertiary">Applications</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-pulse-accent" />
                  <span className="text-pulse-text-tertiary">Awards</span>
                </div>
              </div>
            </div>

            <MiniBarChart data={monthlyTrend} />
          </GlassCard>
        </motion.div>

        {/* Funding Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <GlassCard className="p-6 h-full">
            <h3 className="text-lg font-semibold text-pulse-text mb-6">Funding by Category</h3>

            <div className="space-y-4">
              {fundingByCategory.map((cat, i) => (
                <motion.div
                  key={cat.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                >
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-pulse-text">{cat.name}</span>
                    <span className="text-pulse-text-tertiary">
                      ${(cat.amount / 1000).toFixed(0)}K
                    </span>
                  </div>
                  <div className="h-2 bg-pulse-border rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: cat.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.percentage}%` }}
                      transition={{ duration: 0.8, delay: 0.7 + i * 0.1 }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Recent Submissions Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-pulse-text">Recent Submissions</h3>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/app/workspace">View all <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-pulse-text-tertiary uppercase tracking-wider border-b border-pulse-border">
                  <th className="pb-3 font-medium">Grant</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Submitted</th>
                  <th className="pb-3 font-medium text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {recentSubmissions.map((sub, i) => (
                  <motion.tr
                    key={sub.title}
                    className="border-b border-pulse-border/50 last:border-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                  >
                    <td className="py-4">
                      <span className="text-pulse-text font-medium">{sub.title}</span>
                    </td>
                    <td className="py-4">
                      <Badge variant={
                        sub.status === 'Awarded' ? 'success' :
                        sub.status === 'Rejected' ? 'error' : 'default'
                      }>
                        {sub.status}
                      </Badge>
                    </td>
                    <td className="py-4 text-pulse-text-secondary">{sub.date}</td>
                    <td className="py-4 text-right">
                      <span className={`font-mono ${
                        sub.score >= 80 ? 'text-pulse-success' :
                        sub.score >= 70 ? 'text-pulse-warning' :
                        'text-pulse-error'
                      }`}>
                        {sub.score}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}
