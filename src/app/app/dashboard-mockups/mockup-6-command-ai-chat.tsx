'use client'

/**
 * MOCKUP 6: COMMAND CENTER + AI CHAT SIDEBAR
 * -------------------------------------------
 * Command Center bento layout with a persistent AI chat panel on the right
 * - Left: Full bento grid (funding, pipeline, deadlines, activity)
 * - Right: Collapsible AI assistant sidebar with chat + recommendations
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
  DollarSign,
  ChevronRight,
  Bot,
  Send,
  MessageSquare,
  Lightbulb,
  X,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GlassCard } from '@/components/ui/glass-card'
import { springs } from '@/lib/motion/animations'
import { useEffect, useState } from 'react'

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
]

const recentActivity = [
  { type: 'match', text: '8 new grants match your profile', time: '2h ago' },
  { type: 'deadline', text: 'SBIR Phase I deadline approaching', time: '5h ago' },
  { type: 'saved', text: 'Saved Community Development Grant', time: '1d ago' },
]

const aiMessages = [
  { role: 'assistant', text: "Good morning! I found 3 high-match grants for you today. The NSF SBIR Phase II has a 94% match score." },
  { role: 'user', text: "Tell me more about the SBIR" },
  { role: 'assistant', text: "The SBIR Phase II offers up to $1M in funding for R&D. Based on your previous applications, I'd recommend highlighting your prototype results. Deadline is in 30 days." },
]

const quickSuggestions = [
  "Show my top matches",
  "Deadline reminders",
  "Help with SBIR app",
]

// Animated value display
function AnimatedValue({ value, prefix = '' }: { value: number; prefix?: string }) {
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
  return <span>{prefix}{display.toLocaleString()}</span>
}

// Progress ring component
function ProgressRing({ progress, size = 64, strokeWidth = 5, color }: {
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

export default function MockupCommandAIChat() {
  const [aiExpanded, setAiExpanded] = useState(true)
  const [inputValue, setInputValue] = useState('')
  const totalGrants = applicationStages.reduce((sum, s) => sum + s.count, 0)

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Main Content - Bento Grid */}
      <div className={`flex-1 p-8 overflow-auto transition-all duration-300 ${aiExpanded ? 'pr-4' : ''}`}>
        {/* Header */}
        <motion.div
          className="flex items-end justify-between mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
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
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-12 gap-5">
          {/* Funding Potential - Hero */}
          <motion.div
            className="col-span-12 lg:col-span-5"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard variant="accent" className="p-6 h-full relative overflow-hidden">
              <motion.div
                className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-pulse-accent/20 blur-3xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-pulse-accent/20 border border-pulse-accent/30 flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-pulse-accent" />
                  </div>
                  <span className="text-pulse-text-secondary text-sm">Funding Potential</span>
                </div>
                <div className="font-serif text-display text-pulse-text mb-2">
                  <AnimatedValue value={fundingPotential} prefix="$" />
                </div>
                <p className="text-pulse-accent text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  +$450K from new matches
                </p>
              </div>
            </GlassCard>
          </motion.div>

          {/* Pipeline */}
          <motion.div
            className="col-span-12 lg:col-span-7"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard className="p-6 h-full">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-pulse-text">Application Pipeline</h3>
                <span className="text-pulse-text-tertiary text-sm">{totalGrants} total</span>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {applicationStages.map((stage, i) => (
                  <motion.div
                    key={stage.name}
                    className="text-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                  >
                    <div className="relative inline-flex items-center justify-center mb-2">
                      <ProgressRing progress={(stage.count / totalGrants) * 100} color={stage.color} />
                      <span className="absolute text-lg font-semibold text-pulse-text">{stage.count}</span>
                    </div>
                    <p className="text-xs text-pulse-text-secondary">{stage.name}</p>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* Deadlines */}
          <motion.div
            className="col-span-12 lg:col-span-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-pulse-warning" />
                <h3 className="text-base font-semibold text-pulse-text">Upcoming Deadlines</h3>
              </div>
              <div className="space-y-3">
                {upcomingDeadlines.map((deadline, i) => (
                  <motion.div
                    key={deadline.title}
                    className={`p-3 rounded-xl border ${
                      deadline.urgent ? 'bg-pulse-error/10 border-pulse-error/30' : 'bg-pulse-surface/50 border-pulse-border'
                    }`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-pulse-text text-sm">{deadline.title}</span>
                      {deadline.urgent && <Badge variant="error" className="text-xs">Urgent</Badge>}
                    </div>
                    <div className="flex items-center justify-between text-xs mt-1">
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

          {/* Activity */}
          <motion.div
            className="col-span-12 lg:col-span-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <GlassCard className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-pulse-text">Recent Activity</h3>
              </div>
              <div className="space-y-3">
                {recentActivity.map((activity, i) => (
                  <motion.div
                    key={i}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      activity.type === 'match' ? 'bg-pulse-accent/20 text-pulse-accent' :
                      activity.type === 'deadline' ? 'bg-pulse-warning/20 text-pulse-warning' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {activity.type === 'match' && <Sparkles className="w-3.5 h-3.5" />}
                      {activity.type === 'deadline' && <Clock className="w-3.5 h-3.5" />}
                      {activity.type === 'saved' && <Bookmark className="w-3.5 h-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-pulse-text">{activity.text}</p>
                      <p className="text-xs text-pulse-text-tertiary mt-0.5">{activity.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>

      {/* AI Chat Sidebar */}
      <AnimatePresence>
        {aiExpanded && (
          <motion.div
            className="w-80 border-l border-pulse-border bg-pulse-surface/30 backdrop-blur-xl flex flex-col"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Header */}
            <div className="p-4 border-b border-pulse-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pulse-accent to-pulse-accent/50 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-pulse-bg" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-pulse-text">AI Assistant</p>
                  <p className="text-xs text-pulse-accent">Online</p>
                </div>
              </div>
              <button
                onClick={() => setAiExpanded(false)}
                className="p-1.5 rounded-lg hover:bg-pulse-surface transition-colors"
              >
                <X className="w-4 h-4 text-pulse-text-tertiary" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
              {aiMessages.map((msg, i) => (
                <motion.div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className={`max-w-[85%] p-3 rounded-xl text-sm ${
                    msg.role === 'user'
                      ? 'bg-pulse-accent text-pulse-bg rounded-br-sm'
                      : 'bg-pulse-elevated border border-pulse-border text-pulse-text rounded-bl-sm'
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick Suggestions */}
            <div className="px-4 pb-2">
              <div className="flex flex-wrap gap-2">
                {quickSuggestions.map((suggestion, i) => (
                  <button
                    key={i}
                    onClick={() => setInputValue(suggestion)}
                    className="px-2.5 py-1 rounded-full bg-pulse-surface border border-pulse-border text-xs text-pulse-text-secondary hover:border-pulse-accent/30 hover:text-pulse-text transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-pulse-border">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ask anything..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full px-4 py-2.5 pr-10 rounded-xl bg-pulse-bg border border-pulse-border focus:border-pulse-accent focus:outline-none text-sm text-pulse-text placeholder:text-pulse-text-tertiary"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg bg-pulse-accent flex items-center justify-center hover:bg-pulse-accent/80 transition-colors">
                  <Send className="w-3.5 h-3.5 text-pulse-bg" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed AI Toggle */}
      {!aiExpanded && (
        <motion.button
          className="fixed right-6 bottom-6 w-14 h-14 rounded-full bg-gradient-to-br from-pulse-accent to-pulse-accent/70 flex items-center justify-center shadow-lg shadow-pulse-accent/20 hover:scale-105 transition-transform"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          onClick={() => setAiExpanded(true)}
        >
          <MessageSquare className="w-6 h-6 text-pulse-bg" />
        </motion.button>
      )}
    </div>
  )
}
