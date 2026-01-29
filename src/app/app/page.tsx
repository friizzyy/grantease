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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GlassCard } from '@/components/ui/glass-card'
import { useEffect, useState } from 'react'

// Mock data
const fundingPotential = 2450000
const applicationStages = [
  { name: 'Discovered', count: 24, color: '#40ffaa' },
  { name: 'In Progress', count: 8, color: '#ffb340' },
  { name: 'Submitted', count: 12, color: '#40a0ff' },
  { name: 'Awarded', count: 3, color: '#a040ff' },
]

const aiRecommendations = [
  {
    id: 'rec-1',
    type: 'opportunity',
    icon: Target,
    priority: 'high',
    title: '94% match found',
    description: 'NSF SBIR Phase II perfectly matches your tech profile',
    action: 'View Grant',
    href: '/app/grants/1',
    amount: '$1M',
  },
  {
    id: 'rec-2',
    type: 'insight',
    icon: Lightbulb,
    priority: 'normal',
    title: 'Success pattern',
    description: 'Add budget breakdown to increase approval odds by 40%',
    action: 'Learn More',
    href: '/app/workspace/1',
  },
  {
    id: 'rec-3',
    type: 'action',
    icon: Zap,
    priority: 'normal',
    title: 'Quick win',
    description: 'Reuse 60% of your HUD application for the EPA grant',
    action: 'Start Draft',
    href: '/app/workspace/new',
  },
]

const upcomingDeadlines = [
  { id: 'd1', title: 'SBIR Phase I', days: 3, amount: '$275K', urgent: true, progress: 75, href: '/app/workspace/1' },
  { id: 'd2', title: 'Community Block Grant', days: 12, amount: '$500K', urgent: false, progress: 30, href: '/app/workspace/2' },
  { id: 'd3', title: 'EPA Environmental', days: 28, amount: '$150K', urgent: false, progress: 0, href: '/app/grants/3' },
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
              {rec.amount && (
                <Badge variant="success" className="text-xs">{rec.amount}</Badge>
              )}
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

export default function AppDashboard() {
  const [inputValue, setInputValue] = useState('')
  const [commandBarFocused, setCommandBarFocused] = useState(false)
  const totalGrants = applicationStages.reduce((sum, s) => sum + s.count, 0)

  return (
    <div className="p-8">
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
            <h1 className="font-serif text-display text-pulse-text">
              Good morning, Sarah
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
              <span className="text-sm font-medium text-pulse-text">Ask GrantEase AI anything</span>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="e.g., Find grants for renewable energy startups..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onFocus={() => setCommandBarFocused(true)}
                onBlur={() => setCommandBarFocused(false)}
                className="w-full px-4 py-3 pr-12 rounded-xl bg-pulse-bg border border-pulse-border focus:border-pulse-accent focus:outline-none text-pulse-text placeholder:text-pulse-text-tertiary"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-pulse-accent flex items-center justify-center hover:bg-pulse-accent/80 transition-colors">
                <Send className="w-4 h-4 text-pulse-bg" />
              </button>
            </div>

            {/* Quick Commands */}
            <div className="flex flex-wrap gap-2 mt-3">
              {quickCommands.map((cmd, i) => (
                <motion.button
                  key={cmd}
                  className="px-3 py-1.5 rounded-full bg-pulse-elevated border border-pulse-border text-xs text-pulse-text-secondary hover:border-pulse-accent/30 hover:text-pulse-text transition-all"
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
      <div className="grid grid-cols-12 gap-5">
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
                <AnimatedValue value={fundingPotential} prefix="$" />
              </div>
              <p className="text-pulse-accent text-xs flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +$450K this week
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
            <div className="grid grid-cols-4 gap-4">
              {applicationStages.map((stage, i) => (
                <motion.div
                  key={stage.name}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.1 }}
                >
                  <div className="relative inline-flex items-center justify-center mb-2">
                    <ProgressRing progress={(stage.count / totalGrants) * 100} color={stage.color} />
                    <span className="absolute text-base font-semibold text-pulse-text">{stage.count}</span>
                  </div>
                  <p className="text-xs text-pulse-text-secondary">{stage.name}</p>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* AI Recommendations Row */}
        <div className="col-span-12">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-pulse-accent" />
            <h3 className="text-sm font-semibold text-pulse-text">AI Recommendations</h3>
            <Badge variant="success" className="text-xs">3 new</Badge>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {aiRecommendations.map((rec, i) => (
              <AIRecommendationCard key={rec.id} rec={rec} index={i} />
            ))}
          </div>
        </div>

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
                        <span className="font-medium text-pulse-text text-sm">{deadline.title}</span>
                        {deadline.urgent && <Badge variant="error" className="text-xs">Urgent</Badge>}
                      </div>
                      <span className="text-pulse-accent text-sm font-medium">{deadline.amount}</span>
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
                      <span className={`text-xs ${deadline.urgent ? 'text-pulse-error' : 'text-pulse-text-tertiary'}`}>
                        {deadline.days}d left
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
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
                <p className="text-2xl font-semibold text-pulse-text">2,847</p>
                <p className="text-xs text-pulse-text-tertiary">Grants analyzed</p>
              </div>
              <div className="p-3 rounded-xl bg-pulse-surface/50 border border-pulse-border">
                <p className="text-2xl font-semibold text-pulse-accent">124</p>
                <p className="text-xs text-pulse-text-tertiary">Matches found</p>
              </div>
              <div className="p-3 rounded-xl bg-pulse-surface/50 border border-pulse-border">
                <p className="text-2xl font-semibold text-pulse-text">~47h</p>
                <p className="text-xs text-pulse-text-tertiary">Time saved</p>
              </div>
              <div className="p-3 rounded-xl bg-pulse-surface/50 border border-pulse-border">
                <p className="text-2xl font-semibold text-pulse-text">23%</p>
                <p className="text-xs text-pulse-text-tertiary">Success rate</p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="mt-4 pt-4 border-t border-pulse-border space-y-2">
              {[
                { icon: Search, label: 'Discover Grants', href: '/app/discover' },
                { icon: Bookmark, label: 'Saved Grants', href: '/app/saved' },
                { icon: FolderOpen, label: 'Workspaces', href: '/app/workspace' },
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
                  <ChevronRight className="w-4 h-4 text-pulse-text-tertiary group-hover:text-pulse-accent transition-colors" />
                </Link>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}
