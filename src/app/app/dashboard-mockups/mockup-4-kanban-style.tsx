'use client'

/**
 * MOCKUP 4: KANBAN-STYLE BOARD
 * -----------------------------
 * Trello/Linear-inspired dashboard with:
 * - Horizontal swim lanes for grant stages
 * - Draggable-looking cards
 * - Compact grant cards with key info
 * - Stage counts and totals
 * - Quick filters and search
 */

import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Search,
  Filter,
  Plus,
  MoreHorizontal,
  Clock,
  DollarSign,
  Building2,
  ChevronDown,
  Sparkles,
  Eye,
  Bookmark,
  FileEdit,
  Send,
  Award,
  Archive,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GlassCard } from '@/components/ui/glass-card'
import { useState } from 'react'

// Mock data organized by stage
const stages = [
  {
    id: 'discovered',
    name: 'Discovered',
    icon: Eye,
    color: '#40ffaa',
    grants: [
      { id: '1', title: 'SBIR Phase II', sponsor: 'NSF', amount: '$1M', deadline: '45 days', match: 92 },
      { id: '2', title: 'Clean Energy Innovation', sponsor: 'DOE', amount: '$500K', deadline: '30 days', match: 88 },
      { id: '3', title: 'Rural Development', sponsor: 'USDA', amount: '$250K', deadline: '60 days', match: 85 },
    ],
  },
  {
    id: 'saved',
    name: 'Saved',
    icon: Bookmark,
    color: '#40a0ff',
    grants: [
      { id: '4', title: 'Community Block Grant', sponsor: 'HUD', amount: '$500K', deadline: '20 days', match: 90 },
      { id: '5', title: 'Arts & Culture Fund', sponsor: 'NEA', amount: '$150K', deadline: '35 days', match: 82 },
    ],
  },
  {
    id: 'drafting',
    name: 'Drafting',
    icon: FileEdit,
    color: '#ffb340',
    grants: [
      { id: '6', title: 'SBIR Phase I', sponsor: 'NSF', amount: '$275K', deadline: '3 days', match: 95, progress: 75 },
      { id: '7', title: 'Environmental Justice', sponsor: 'EPA', amount: '$150K', deadline: '15 days', match: 87, progress: 40 },
    ],
  },
  {
    id: 'submitted',
    name: 'Submitted',
    icon: Send,
    color: '#a040ff',
    grants: [
      { id: '8', title: 'Research Innovation', sponsor: 'NIH', amount: '$400K', submitted: 'Jan 10', status: 'Under Review' },
      { id: '9', title: 'Tech Transfer', sponsor: 'DOD', amount: '$600K', submitted: 'Dec 28', status: 'Under Review' },
    ],
  },
  {
    id: 'awarded',
    name: 'Awarded',
    icon: Award,
    color: '#40ffaa',
    grants: [
      { id: '10', title: 'Small Business Grant', sponsor: 'SBA', amount: '$100K', awarded: 'Jan 5' },
    ],
  },
]

// Grant card component
function GrantCard({ grant, stageColor, index }: {
  grant: any; stageColor: string; index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
    >
      <Link
        href={`/app/grants/${grant.id}`}
        className="block p-4 rounded-xl bg-pulse-elevated/80 border border-pulse-border hover:border-pulse-accent/30 transition-all group"
      >
        {/* Match score indicator */}
        {grant.match && (
          <div className="flex items-center justify-between mb-2">
            <Badge
              variant="outline"
              className="text-xs"
              style={{ backgroundColor: `${stageColor}20`, color: stageColor }}
            >
              {grant.match}% match
            </Badge>
            <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-pulse-surface rounded">
              <MoreHorizontal className="w-4 h-4 text-pulse-text-tertiary" />
            </button>
          </div>
        )}

        {/* Title & Sponsor */}
        <h4 className="text-sm font-medium text-pulse-text mb-1 line-clamp-2 group-hover:text-pulse-accent transition-colors">
          {grant.title}
        </h4>
        <p className="text-xs text-pulse-text-tertiary flex items-center gap-1 mb-3">
          <Building2 className="w-3 h-3" />
          {grant.sponsor}
        </p>

        {/* Meta info */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-pulse-accent font-medium">{grant.amount}</span>

          {grant.deadline && (
            <span className={`flex items-center gap-1 ${
              parseInt(grant.deadline) <= 7 ? 'text-pulse-error' :
              parseInt(grant.deadline) <= 14 ? 'text-pulse-warning' :
              'text-pulse-text-tertiary'
            }`}>
              <Clock className="w-3 h-3" />
              {grant.deadline}
            </span>
          )}

          {grant.submitted && (
            <span className="text-pulse-text-tertiary">
              Submitted {grant.submitted}
            </span>
          )}

          {grant.awarded && (
            <span className="text-pulse-success">
              Awarded {grant.awarded}
            </span>
          )}
        </div>

        {/* Progress bar for drafting */}
        {grant.progress && (
          <div className="mt-3">
            <div className="h-1 bg-pulse-border rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: stageColor }}
                initial={{ width: 0 }}
                animate={{ width: `${grant.progress}%` }}
                transition={{ duration: 0.5, delay: 0.3 }}
              />
            </div>
          </div>
        )}
      </Link>
    </motion.div>
  )
}

// Stage column component
function StageColumn({ stage, index }: { stage: typeof stages[0]; index: number }) {
  const Icon = stage.icon
  const totalAmount = stage.grants.reduce((sum, g) => {
    const num = parseInt(g.amount.replace(/[$KM,]/g, ''))
    const multiplier = g.amount.includes('M') ? 1000000 : g.amount.includes('K') ? 1000 : 1
    return sum + (num * multiplier)
  }, 0)

  return (
    <motion.div
      className="flex-1 min-w-[280px] max-w-[320px]"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${stage.color}20` }}
          >
            <Icon className="w-4 h-4" style={{ color: stage.color }} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-pulse-text flex items-center gap-2">
              {stage.name}
              <span className="text-xs text-pulse-text-tertiary font-normal">
                {stage.grants.length}
              </span>
            </h3>
            <p className="text-xs text-pulse-text-tertiary">
              ${(totalAmount / 1000000).toFixed(1)}M total
            </p>
          </div>
        </div>
        <button className="p-1.5 rounded-lg hover:bg-pulse-surface transition-colors">
          <Plus className="w-4 h-4 text-pulse-text-tertiary" />
        </button>
      </div>

      {/* Cards Container */}
      <div className="space-y-3 pb-4">
        {stage.grants.map((grant, i) => (
          <GrantCard
            key={grant.id}
            grant={grant}
            stageColor={stage.color}
            index={i}
          />
        ))}

        {/* Add card button */}
        <button className="w-full p-3 rounded-xl border border-dashed border-pulse-border hover:border-pulse-accent/30 hover:bg-pulse-accent/5 transition-all text-sm text-pulse-text-tertiary hover:text-pulse-accent flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />
          Add grant
        </button>
      </div>
    </motion.div>
  )
}

export default function MockupKanbanStyle() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <motion.div
        className="p-6 pb-0"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="font-serif text-display text-pulse-text mb-1">Grant Board</h1>
            <p className="text-pulse-text-secondary">
              Track your grants through every stage
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button size="sm" asChild>
              <Link href="/app/discover">
                <Sparkles className="w-4 h-4 mr-2" />
                Discover Grants
              </Link>
            </Button>
          </div>
        </div>

        {/* Search & Quick Stats */}
        <div className="flex items-center gap-6 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-pulse-text-tertiary" />
            <input
              type="text"
              placeholder="Search grants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-pulse-surface border border-pulse-border focus:border-pulse-accent/50 focus:outline-none text-sm text-pulse-text placeholder:text-pulse-text-tertiary"
            />
          </div>

          <div className="flex items-center gap-6 text-sm">
            <div>
              <span className="text-pulse-text-tertiary">Total Grants:</span>
              <span className="text-pulse-text font-semibold ml-2">
                {stages.reduce((sum, s) => sum + s.grants.length, 0)}
              </span>
            </div>
            <div>
              <span className="text-pulse-text-tertiary">Pipeline Value:</span>
              <span className="text-pulse-accent font-semibold ml-2">$4.93M</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto px-6 pb-6">
        <div className="flex gap-4 h-full min-w-max">
          {stages.map((stage, i) => (
            <StageColumn key={stage.id} stage={stage} index={i} />
          ))}
        </div>
      </div>
    </div>
  )
}
