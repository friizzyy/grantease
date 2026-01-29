'use client'

/**
 * MOCKUP 5: AI ASSISTANT FOCUS
 * -----------------------------
 * AI-forward dashboard featuring:
 * - Central AI chat/command interface
 * - Smart recommendations panel
 * - AI-generated insights and tips
 * - Personalized grant matches
 * - Action suggestions based on patterns
 */

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Sparkles,
  ArrowRight,
  MessageSquare,
  Lightbulb,
  Target,
  TrendingUp,
  Clock,
  Zap,
  ChevronRight,
  Bot,
  Send,
  Bookmark,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GlassCard } from '@/components/ui/glass-card'
import { useState, useEffect } from 'react'

// Mock AI suggestions
const aiSuggestions = [
  {
    type: 'opportunity',
    icon: Target,
    title: 'High-match grant detected',
    description: 'New NSF SBIR Phase II with 94% match to your profile. Application deadline in 30 days.',
    action: 'View Grant',
    href: '/app/grants/1',
    priority: 'high',
  },
  {
    type: 'deadline',
    icon: Clock,
    title: 'Deadline approaching',
    description: 'Your SBIR Phase I application is 75% complete. 3 days remaining.',
    action: 'Continue',
    href: '/app/workspace/1',
    priority: 'urgent',
  },
  {
    type: 'insight',
    icon: Lightbulb,
    title: 'Success pattern identified',
    description: 'Grants with detailed budget breakdowns have 40% higher success rates in your applications.',
    action: 'Learn More',
    href: '#',
    priority: 'normal',
  },
  {
    type: 'action',
    icon: Zap,
    title: 'Quick win available',
    description: 'The EPA Environmental Justice grant matches your recent Community Development submission. Reuse 60% of content.',
    action: 'Start Draft',
    href: '/app/workspace/new',
    priority: 'normal',
  },
]

// Mock personalized matches
const personalizedMatches = [
  { title: 'SBIR Phase II - AI/ML', sponsor: 'NSF', match: 94, amount: '$1M', isNew: true },
  { title: 'Clean Tech Innovation', sponsor: 'DOE', match: 91, amount: '$500K', isNew: true },
  { title: 'Rural Business Development', sponsor: 'USDA', match: 88, amount: '$250K', isNew: false },
  { title: 'Digital Equity Grant', sponsor: 'NTIA', match: 85, amount: '$150K', isNew: false },
]

// Quick command suggestions
const quickCommands = [
  'Find grants for renewable energy startups',
  'Show me deadlines this month',
  'What grants match my profile?',
  'Help me improve my SBIR application',
]

// Typing animation for AI
function TypingIndicator() {
  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-pulse-accent"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  )
}

// AI Suggestion Card
function SuggestionCard({ suggestion, index }: { suggestion: typeof aiSuggestions[0]; index: number }) {
  const Icon = suggestion.icon

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 + index * 0.1 }}
    >
      <Link
        href={suggestion.href}
        className={`block p-4 rounded-xl border transition-all group ${
          suggestion.priority === 'urgent'
            ? 'bg-pulse-error/10 border-pulse-error/30 hover:border-pulse-error/50'
            : suggestion.priority === 'high'
            ? 'bg-pulse-accent/10 border-pulse-accent/30 hover:border-pulse-accent/50'
            : 'bg-pulse-surface/50 border-pulse-border hover:border-pulse-accent/30'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            suggestion.priority === 'urgent' ? 'bg-pulse-error/20 text-pulse-error' :
            suggestion.priority === 'high' ? 'bg-pulse-accent/20 text-pulse-accent' :
            'bg-pulse-surface text-pulse-text-secondary'
          }`}>
            <Icon className="w-5 h-5" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="text-sm font-medium text-pulse-text group-hover:text-pulse-accent transition-colors">
                {suggestion.title}
              </h4>
              {suggestion.priority === 'urgent' && (
                <Badge variant="error" className="shrink-0">Urgent</Badge>
              )}
              {suggestion.priority === 'high' && (
                <Badge variant="success" className="shrink-0">New</Badge>
              )}
            </div>
            <p className="text-sm text-pulse-text-secondary mb-2 line-clamp-2">
              {suggestion.description}
            </p>
            <span className="text-xs text-pulse-accent font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
              {suggestion.action}
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default function MockupAIAssistant() {
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  // Simulate AI typing on mount
  useEffect(() => {
    setIsTyping(true)
    const timer = setTimeout(() => setIsTyping(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="p-8">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pulse-accent to-pulse-accent/50 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-pulse-bg" />
          </div>
          <div>
            <h1 className="font-serif text-display text-pulse-text">
              Good morning, Sarah
            </h1>
          </div>
        </div>
        <p className="text-pulse-text-secondary ml-13">
          I've analyzed your profile and found some opportunities for you.
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Column - AI Interface */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Command Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard variant="accent" className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Bot className="w-5 h-5 text-pulse-accent" />
                <span className="text-sm font-medium text-pulse-text">Ask GrantEase AI</span>
                {isTyping && <TypingIndicator />}
              </div>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Ask anything about grants, applications, or get recommendations..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-pulse-bg border border-pulse-accent/30 focus:border-pulse-accent focus:outline-none text-pulse-text placeholder:text-pulse-text-tertiary"
                />
                <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-pulse-accent flex items-center justify-center hover:bg-pulse-accent/80 transition-colors">
                  <Send className="w-4 h-4 text-pulse-bg" />
                </button>
              </div>

              {/* Quick Commands */}
              <div className="flex flex-wrap gap-2 mt-4">
                {quickCommands.map((cmd, i) => (
                  <motion.button
                    key={cmd}
                    className="px-3 py-1.5 rounded-full bg-pulse-surface border border-pulse-border text-xs text-pulse-text-secondary hover:border-pulse-accent/30 hover:text-pulse-text transition-all"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    onClick={() => setInputValue(cmd)}
                  >
                    {cmd}
                  </motion.button>
                ))}
              </div>
            </GlassCard>
          </motion.div>

          {/* AI Suggestions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-pulse-text flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-pulse-accent" />
                AI Recommendations
              </h2>
              <Button variant="ghost" size="sm">
                Refresh <ArrowUpRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <div className="space-y-3">
              {aiSuggestions.map((suggestion, i) => (
                <SuggestionCard key={i} suggestion={suggestion} index={i} />
              ))}
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Personalized Matches */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-pulse-text flex items-center gap-2">
                  <Target className="w-5 h-5 text-pulse-accent" />
                  Top Matches
                </h3>
                <Badge variant="success">{personalizedMatches.filter(m => m.isNew).length} new</Badge>
              </div>

              <div className="space-y-4">
                {personalizedMatches.map((match, i) => (
                  <motion.div
                    key={match.title}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                  >
                    <Link
                      href="#"
                      className="block p-3 rounded-xl bg-pulse-surface/50 border border-pulse-border hover:border-pulse-accent/30 transition-all group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-pulse-text group-hover:text-pulse-accent transition-colors">
                            {match.match}%
                          </span>
                          {match.isNew && (
                            <span className="w-2 h-2 rounded-full bg-pulse-accent animate-pulse" />
                          )}
                        </div>
                        <span className="text-xs text-pulse-accent">{match.amount}</span>
                      </div>
                      <p className="text-sm text-pulse-text mb-1 line-clamp-1">{match.title}</p>
                      <p className="text-xs text-pulse-text-tertiary">{match.sponsor}</p>
                    </Link>
                  </motion.div>
                ))}
              </div>

              <Button variant="ghost" size="sm" className="w-full mt-4" asChild>
                <Link href="/app/discover">
                  View all matches
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </GlassCard>
          </motion.div>

          {/* AI Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <GlassCard className="p-6">
              <h3 className="text-sm font-medium text-pulse-text-secondary mb-4">AI Activity</h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-pulse-text">Grants analyzed</span>
                  <span className="text-sm font-semibold text-pulse-text">2,847</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-pulse-text">Matches found</span>
                  <span className="text-sm font-semibold text-pulse-accent">124</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-pulse-text">Time saved</span>
                  <span className="text-sm font-semibold text-pulse-text">~47 hours</span>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Pro Tip */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <GlassCard variant="accent" className="p-6 relative overflow-hidden">
              <motion.div
                className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-pulse-accent/20 blur-2xl"
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
              />

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-pulse-accent" />
                  <span className="text-sm font-medium text-pulse-text">AI Tip</span>
                </div>
                <p className="text-sm text-pulse-text-secondary">
                  Complete your organization profile to improve match accuracy by up to 35%.
                </p>
                <Button variant="outline" size="sm" className="mt-4">
                  Complete Profile
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
