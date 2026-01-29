'use client'

/**
 * MOCKUP 8: COMMAND CENTER + AI HERO SECTION
 * -------------------------------------------
 * AI takes the hero spot at top, with Command Center bento below
 * - Large AI insight/action card as the hero
 * - AI-powered "Next Best Action" prominence
 * - Bento grid for stats and data below
 * - Floating AI quick-access button
 */

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowRight,
  Search,
  Bookmark,
  FolderOpen,
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
  PlayCircle,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  MessageSquare,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GlassCard } from '@/components/ui/glass-card'
import { useEffect, useState } from 'react'

// Mock data
const aiNextAction = {
  type: 'deadline',
  priority: 'urgent',
  title: 'Complete your SBIR Phase I application',
  description: 'You\'re 75% done. Based on your progress, I estimate 2 hours to finish. The deadline is in 3 days.',
  grant: 'NSF SBIR Phase I',
  amount: '$275,000',
  progress: 75,
  deadline: '3 days',
  suggestions: [
    'I can help draft your technical approach section',
    'Your budget looks good, but consider adding travel costs',
    'Similar successful applications averaged 12 pages',
  ],
}

const aiInsights = [
  { icon: Target, text: '94% match grant found', type: 'opportunity' },
  { icon: Lightbulb, text: 'Add budget detail for +40% approval', type: 'tip' },
  { icon: Zap, text: 'Reuse 60% content for EPA grant', type: 'quick-win' },
]

const fundingPotential = 2450000
const applicationStages = [
  { name: 'Discovered', count: 24, color: '#40ffaa' },
  { name: 'In Progress', count: 8, color: '#ffb340' },
  { name: 'Submitted', count: 12, color: '#40a0ff' },
  { name: 'Awarded', count: 3, color: '#a040ff' },
]

const topMatches = [
  { title: 'SBIR Phase II - AI/ML', sponsor: 'NSF', match: 94, amount: '$1M' },
  { title: 'Clean Tech Innovation', sponsor: 'DOE', match: 91, amount: '$500K' },
  { title: 'Rural Business Grant', sponsor: 'USDA', match: 88, amount: '$250K' },
]

const recentActivity = [
  { text: '8 new grants match your profile', time: '2h ago', icon: Sparkles },
  { text: 'SBIR Phase I deadline in 3 days', time: '5h ago', icon: Clock },
  { text: 'Saved Community Development Grant', time: '1d ago', icon: Bookmark },
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

// Typing dots
function TypingDots() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-pulse-accent"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  )
}

export default function MockupCommandAIHero() {
  const [showChat, setShowChat] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const totalGrants = applicationStages.reduce((sum, s) => sum + s.count, 0)

  return (
    <div className="p-8">
      {/* Header */}
      <motion.div
        className="flex items-end justify-between mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-pulse-accent" />
            <span className="text-pulse-text-tertiary font-mono text-micro uppercase tracking-wider">
              AI-Powered Command Center
            </span>
          </div>
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
      </motion.div>

      {/* AI Hero - Next Best Action */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <div className="relative group">
          {/* Animated glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-pulse-accent/30 via-pulse-accent/10 to-pulse-accent/30 rounded-3xl blur-xl opacity-60 group-hover:opacity-80 transition-opacity" />

          <div className="relative bg-gradient-to-br from-pulse-surface/90 to-pulse-elevated/80 border border-pulse-accent/30 rounded-3xl p-6 backdrop-blur-xl overflow-hidden">
            {/* Background pattern */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-pulse-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10">
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pulse-accent to-pulse-accent/50 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-pulse-bg" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-pulse-text">AI Recommended Action</p>
                      <Badge variant="error">Priority</Badge>
                    </div>
                    <p className="text-xs text-pulse-accent flex items-center gap-1">
                      <TypingDots /> Analyzing your progress...
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-serif text-pulse-accent">{aiNextAction.amount}</p>
                  <p className="text-xs text-pulse-warning flex items-center justify-end gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {aiNextAction.deadline} remaining
                  </p>
                </div>
              </div>

              {/* Main Content */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Left - Action Details */}
                <div className="lg:col-span-2">
                  <h2 className="text-xl font-semibold text-pulse-text mb-2">
                    {aiNextAction.title}
                  </h2>
                  <p className="text-pulse-text-secondary mb-4">
                    {aiNextAction.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="mb-5">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-pulse-text-secondary">Application Progress</span>
                      <span className="text-pulse-accent font-semibold">{aiNextAction.progress}%</span>
                    </div>
                    <div className="h-2.5 bg-pulse-border rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-pulse-accent to-pulse-accent/60 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${aiNextAction.progress}%` }}
                        transition={{ duration: 1.2, delay: 0.3 }}
                      />
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="flex items-center gap-3">
                    <Button size="lg" asChild>
                      <Link href="/app/workspace/1">
                        <PlayCircle className="w-5 h-5 mr-2" />
                        Continue Application
                      </Link>
                    </Button>
                    <Button variant="outline" onClick={() => setShowChat(!showChat)}>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Ask AI for Help
                    </Button>
                  </div>
                </div>

                {/* Right - AI Suggestions */}
                <div className="border-l border-pulse-border/50 pl-6">
                  <p className="text-xs font-medium text-pulse-text-tertiary uppercase tracking-wider mb-3">
                    AI Suggestions
                  </p>
                  <div className="space-y-3">
                    {aiNextAction.suggestions.map((suggestion, i) => (
                      <motion.div
                        key={i}
                        className="flex items-start gap-2"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + i * 0.1 }}
                      >
                        <CheckCircle2 className="w-4 h-4 text-pulse-accent shrink-0 mt-0.5" />
                        <p className="text-sm text-pulse-text-secondary">{suggestion}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick AI Chat (Expandable) */}
              <AnimatePresence>
                {showChat && (
                  <motion.div
                    className="mt-5 pt-5 border-t border-pulse-border/50"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Ask AI anything about this grant..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="w-full px-4 py-3 pr-12 rounded-xl bg-pulse-bg border border-pulse-border focus:border-pulse-accent focus:outline-none text-sm text-pulse-text placeholder:text-pulse-text-tertiary"
                      />
                      <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-pulse-accent flex items-center justify-center hover:bg-pulse-accent/80 transition-colors">
                        <Send className="w-4 h-4 text-pulse-bg" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick AI Insights Bar */}
      <motion.div
        className="flex items-center gap-4 mb-8 overflow-x-auto pb-2"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {aiInsights.map((insight, i) => {
          const Icon = insight.icon
          return (
            <motion.button
              key={i}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-pulse-surface/50 border border-pulse-border hover:border-pulse-accent/30 transition-all shrink-0"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25 + i * 0.05 }}
              whileHover={{ scale: 1.02 }}
            >
              <Icon className={`w-4 h-4 ${
                insight.type === 'opportunity' ? 'text-pulse-accent' :
                insight.type === 'tip' ? 'text-pulse-warning' :
                'text-blue-400'
              }`} />
              <span className="text-sm text-pulse-text">{insight.text}</span>
              <ChevronRight className="w-4 h-4 text-pulse-text-tertiary" />
            </motion.button>
          )
        })}
      </motion.div>

      {/* Bento Grid */}
      <div className="grid grid-cols-12 gap-5">
        {/* Funding Potential */}
        <motion.div
          className="col-span-12 sm:col-span-6 lg:col-span-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard className="p-5 h-full">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-pulse-accent/20 border border-pulse-accent/30 flex items-center justify-center">
                <DollarSign className="w-4 h-4 text-pulse-accent" />
              </div>
            </div>
            <div className="font-serif text-heading-lg text-pulse-text mb-1">
              <AnimatedValue value={fundingPotential} prefix="$" />
            </div>
            <p className="text-xs text-pulse-text-tertiary">Funding Potential</p>
            <p className="text-xs text-pulse-accent mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              +$450K this week
            </p>
          </GlassCard>
        </motion.div>

        {/* Pipeline Mini */}
        <motion.div
          className="col-span-12 sm:col-span-6 lg:col-span-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <GlassCard className="p-5 h-full">
            <h3 className="text-sm font-semibold text-pulse-text mb-4">Pipeline</h3>
            <div className="flex items-center justify-between">
              {applicationStages.map((stage, i) => (
                <div key={stage.name} className="text-center">
                  <div className="relative inline-flex items-center justify-center mb-1">
                    <ProgressRing progress={(stage.count / totalGrants) * 100} size={44} strokeWidth={3} color={stage.color} />
                    <span className="absolute text-sm font-semibold text-pulse-text">{stage.count}</span>
                  </div>
                  <p className="text-[10px] text-pulse-text-tertiary">{stage.name}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Top Matches */}
        <motion.div
          className="col-span-12 lg:col-span-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard className="p-5 h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-pulse-text flex items-center gap-2">
                <Target className="w-4 h-4 text-pulse-accent" />
                Top Matches
              </h3>
              <Badge variant="success">AI</Badge>
            </div>
            <div className="space-y-3">
              {topMatches.map((match, i) => (
                <Link
                  key={i}
                  href="#"
                  className="flex items-center justify-between p-2 -mx-2 rounded-lg hover:bg-pulse-surface/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-pulse-accent">{match.match}%</span>
                    <div>
                      <p className="text-sm text-pulse-text line-clamp-1">{match.title}</p>
                      <p className="text-xs text-pulse-text-tertiary">{match.sponsor}</p>
                    </div>
                  </div>
                  <span className="text-xs text-pulse-text-secondary">{match.amount}</span>
                </Link>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Activity Feed */}
        <motion.div
          className="col-span-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <GlassCard className="p-5">
            <h3 className="text-sm font-semibold text-pulse-text mb-4">Recent Activity</h3>
            <div className="flex flex-wrap gap-4">
              {recentActivity.map((activity, i) => {
                const Icon = activity.icon
                return (
                  <motion.div
                    key={i}
                    className="flex items-center gap-3 px-4 py-2 rounded-xl bg-pulse-surface/50 border border-pulse-border"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    <Icon className="w-4 h-4 text-pulse-accent" />
                    <span className="text-sm text-pulse-text">{activity.text}</span>
                    <span className="text-xs text-pulse-text-tertiary">{activity.time}</span>
                  </motion.div>
                )
              })}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  )
}
