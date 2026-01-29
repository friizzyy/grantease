'use client'

/**
 * DISCOVER PAGE - PREMIUM UPGRADE
 * --------------------------------
 * AI-enhanced grant discovery with:
 * - Premium search bar with AI suggestions
 * - Match score indicators on each grant
 * - Filter toggle with advanced options
 * - AI summary bar with match statistics
 * - GlassCard design throughout
 */

import { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Filter,
  Sparkles,
  Target,
  Clock,
  DollarSign,
  Building2,
  TrendingUp,
  ChevronRight,
  ChevronLeft,
  Save,
  Bookmark,
  BookmarkCheck,
  SlidersHorizontal,
  X,
  Zap,
  ArrowUpRight,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GlassCard } from '@/components/ui/glass-card'
import { springs } from '@/lib/motion/animations'

// Mock grant data with AI match scores
const mockGrants = [
  {
    id: '1',
    title: 'Small Business Innovation Research (SBIR) Phase I',
    sponsor: 'National Science Foundation',
    summary: 'The SBIR program stimulates technological innovation in the private sector by strengthening the role of small business concerns in meeting Federal research and development needs.',
    categories: ['Small Business', 'Research', 'Technology'],
    amountMin: 50000,
    amountMax: 275000,
    amountText: '$50,000 - $275,000',
    deadlineDate: new Date('2024-03-15'),
    daysLeft: 45,
    matchScore: 94,
    isNew: true,
    isSaved: false,
  },
  {
    id: '2',
    title: 'Community Development Block Grant Program',
    sponsor: 'Department of Housing and Urban Development',
    summary: 'The CDBG program provides annual grants to states, cities, and counties to develop viable urban communities by providing decent housing and expanding economic opportunities.',
    categories: ['Housing', 'Community Development'],
    amountMin: 100000,
    amountMax: 500000,
    amountText: '$100,000 - $500,000',
    deadlineDate: new Date('2024-02-28'),
    daysLeft: 20,
    matchScore: 91,
    isNew: true,
    isSaved: true,
  },
  {
    id: '3',
    title: 'Environmental Justice Collaborative Problem-Solving',
    sponsor: 'Environmental Protection Agency',
    summary: 'This program provides funding to support community-based organizations in their efforts to collaborate and develop solutions to address local environmental and public health issues.',
    categories: ['Climate', 'Community Development', 'Health'],
    amountMin: 50000,
    amountMax: 150000,
    amountText: 'Up to $150,000',
    deadlineDate: new Date('2024-04-01'),
    daysLeft: 60,
    matchScore: 87,
    isNew: false,
    isSaved: false,
  },
  {
    id: '4',
    title: 'Rural Business Development Grant',
    sponsor: 'USDA Rural Development',
    summary: 'Provides technical assistance and training for small rural businesses. Grant funds may be used for a variety of purposes including training and technical assistance.',
    categories: ['Small Business', 'Agriculture', 'Community Development'],
    amountMin: 10000,
    amountMax: 500000,
    amountText: '$10,000 - $500,000',
    deadlineDate: null,
    daysLeft: null,
    matchScore: 85,
    isNew: false,
    isSaved: false,
  },
  {
    id: '5',
    title: 'Grants for Arts Projects',
    sponsor: 'National Endowment for the Arts',
    summary: 'Supports public engagement with, and access to, various forms of excellent art across the nation. Projects may include festivals, exhibitions, tours, readings, and more.',
    categories: ['Arts & Culture', 'Community Development'],
    amountMin: 10000,
    amountMax: 100000,
    amountText: '$10,000 - $100,000',
    deadlineDate: new Date('2024-05-15'),
    daysLeft: 105,
    matchScore: 78,
    isNew: false,
    isSaved: true,
  },
  {
    id: '6',
    title: 'Workforce Innovation and Opportunity Act Youth Program',
    sponsor: 'Department of Labor',
    summary: 'Provides funding to states and local areas to support a wide range of activities and services to prepare youth for success in the labor market.',
    categories: ['Workforce Development', 'Education', 'Youth & Families'],
    amountMin: 100000,
    amountMax: 1000000,
    amountText: '$100,000 - $1,000,000',
    deadlineDate: new Date('2024-03-30'),
    daysLeft: 58,
    matchScore: 72,
    isNew: false,
    isSaved: false,
  },
]

// Quick search suggestions
const quickSuggestions = [
  'Small business grants',
  'Tech startups',
  'Community development',
  'Environmental projects',
  'Research funding',
]

// Premium Grant Card Component
function PremiumGrantCard({ grant, index }: { grant: typeof mockGrants[0]; index: number }) {
  const [isSaved, setIsSaved] = useState(grant.isSaved)

  const getMatchColor = (score: number) => {
    if (score >= 90) return 'text-pulse-accent'
    if (score >= 80) return 'text-blue-400'
    if (score >= 70) return 'text-yellow-400'
    return 'text-pulse-text-tertiary'
  }

  const getMatchBg = (score: number) => {
    if (score >= 90) return 'bg-pulse-accent/10 border-pulse-accent/30'
    if (score >= 80) return 'bg-blue-500/10 border-blue-500/30'
    if (score >= 70) return 'bg-yellow-500/10 border-yellow-500/30'
    return 'bg-pulse-surface border-pulse-border'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link href={`/app/grants/${grant.id}`}>
        <GlassCard className="p-5 hover:border-pulse-accent/30 transition-all group cursor-pointer">
          {/* Top Row - Match Score & Actions */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`px-2.5 py-1 rounded-lg border ${getMatchBg(grant.matchScore)}`}>
                <span className={`text-sm font-semibold ${getMatchColor(grant.matchScore)}`}>
                  {grant.matchScore}% match
                </span>
              </div>
              {grant.isNew && (
                <Badge variant="success" className="text-xs">New</Badge>
              )}
            </div>
            <button
              onClick={(e) => {
                e.preventDefault()
                setIsSaved(!isSaved)
              }}
              aria-label={isSaved ? 'Remove from saved grants' : 'Save this grant'}
              aria-pressed={isSaved}
              className={`p-2 rounded-lg transition-all ${
                isSaved
                  ? 'bg-pulse-accent/20 text-pulse-accent'
                  : 'bg-pulse-surface text-pulse-text-tertiary hover:text-pulse-accent'
              }`}
            >
              {isSaved ? <BookmarkCheck className="w-4 h-4" aria-hidden="true" /> : <Bookmark className="w-4 h-4" aria-hidden="true" />}
            </button>
          </div>

          {/* Title & Sponsor */}
          <h3 className="text-lg font-semibold text-pulse-text mb-1 group-hover:text-pulse-accent transition-colors line-clamp-2">
            {grant.title}
          </h3>
          <p className="text-sm text-pulse-text-tertiary flex items-center gap-1.5 mb-3">
            <Building2 className="w-3.5 h-3.5" />
            {grant.sponsor}
          </p>

          {/* Summary */}
          <p className="text-sm text-pulse-text-secondary mb-4 line-clamp-2">
            {grant.summary}
          </p>

          {/* Categories */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {grant.categories.slice(0, 3).map((cat) => (
              <span
                key={cat}
                className="px-2 py-0.5 rounded-full bg-pulse-surface text-xs text-pulse-text-tertiary"
              >
                {cat}
              </span>
            ))}
          </div>

          {/* Bottom Row - Amount & Deadline */}
          <div className="flex items-center justify-between pt-3 border-t border-pulse-border">
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-pulse-accent" />
              <span className="text-sm font-medium text-pulse-text">{grant.amountText}</span>
            </div>
            {grant.daysLeft !== null ? (
              <div className={`flex items-center gap-1.5 text-sm ${
                grant.daysLeft <= 14 ? 'text-pulse-error' :
                grant.daysLeft <= 30 ? 'text-pulse-warning' :
                'text-pulse-text-tertiary'
              }`}>
                <Clock className="w-4 h-4" />
                <span>{grant.daysLeft} days left</span>
              </div>
            ) : (
              <span className="text-sm text-pulse-text-tertiary">Rolling deadline</span>
            )}
          </div>
        </GlassCard>
      </Link>
    </motion.div>
  )
}

// AI Summary Bar Component
function AISummaryBar() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <GlassCard variant="accent" className="p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-pulse-accent/20 border border-pulse-accent/30 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-pulse-accent" />
            </div>
            <div>
              <p className="text-sm font-medium text-pulse-text">AI found 6 grants matching your profile</p>
              <p className="text-xs text-pulse-text-tertiary">3 with 90%+ match score • 2 new this week</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-lg font-semibold text-pulse-accent">$2.5M</p>
              <p className="text-xs text-pulse-text-tertiary">Total potential</p>
            </div>
            <Button size="sm" variant="outline" className="border-pulse-accent/30 text-pulse-accent hover:bg-pulse-accent/10">
              <Zap className="w-4 h-4 mr-1" />
              Refine
            </Button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}

// Filter Panel Component
function FilterPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const categories = ['Small Business', 'Research', 'Technology', 'Community Development', 'Arts & Culture', 'Climate', 'Education']
  const amounts = ['Under $50K', '$50K - $250K', '$250K - $1M', 'Over $1M']
  const deadlines = ['Next 2 weeks', 'Next 30 days', 'Next 90 days', 'Rolling']

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden mb-6"
        >
          <GlassCard className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-pulse-text">Advanced Filters</h3>
              <button
                onClick={onClose}
                aria-label="Close filters panel"
                className="p-1 rounded hover:bg-pulse-surface"
              >
                <X className="w-4 h-4 text-pulse-text-tertiary" aria-hidden="true" />
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Categories */}
              <div>
                <p className="text-xs font-medium text-pulse-text-secondary uppercase tracking-wider mb-3">Category</p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      className="px-3 py-1.5 rounded-full bg-pulse-surface border border-pulse-border text-xs text-pulse-text-secondary hover:border-pulse-accent/30 hover:text-pulse-text transition-all"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div>
                <p className="text-xs font-medium text-pulse-text-secondary uppercase tracking-wider mb-3">Funding Amount</p>
                <div className="flex flex-wrap gap-2">
                  {amounts.map((amt) => (
                    <button
                      key={amt}
                      className="px-3 py-1.5 rounded-full bg-pulse-surface border border-pulse-border text-xs text-pulse-text-secondary hover:border-pulse-accent/30 hover:text-pulse-text transition-all"
                    >
                      {amt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Deadline */}
              <div>
                <p className="text-xs font-medium text-pulse-text-secondary uppercase tracking-wider mb-3">Deadline</p>
                <div className="flex flex-wrap gap-2">
                  {deadlines.map((d) => (
                    <button
                      key={d}
                      className="px-3 py-1.5 rounded-full bg-pulse-surface border border-pulse-border text-xs text-pulse-text-secondary hover:border-pulse-accent/30 hover:text-pulse-text transition-all"
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-pulse-border">
              <Button variant="ghost" size="sm" onClick={onClose}>
                Clear All
              </Button>
              <Button size="sm">
                Apply Filters
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function DiscoverPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [sortBy, setSortBy] = useState('match')

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
              <Target className="w-5 h-5 text-pulse-accent" />
              <span className="text-pulse-text-tertiary font-mono text-micro uppercase tracking-wider">
                Grant Discovery
              </span>
            </div>
            <h1 className="font-serif text-display text-pulse-text">
              Find Your Perfect Grant
            </h1>
            <p className="text-pulse-text-secondary mt-2">
              AI-powered search across thousands of federal, state, and private funding opportunities
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/app/saved">
              <Bookmark className="w-4 h-4 mr-2" />
              Saved Grants
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <GlassCard className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pulse-text-tertiary" />
              <input
                type="text"
                placeholder="Search by keyword, sponsor, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-pulse-bg border border-pulse-border focus:border-pulse-accent focus:outline-none text-pulse-text placeholder:text-pulse-text-tertiary"
              />
            </div>
            <Button
              variant={showFilters ? 'default' : 'outline'}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </Button>
            <Button>
              <Sparkles className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>

          {/* Quick Suggestions */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-pulse-border">
            <span className="text-xs text-pulse-text-tertiary">Popular:</span>
            {quickSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setSearchQuery(suggestion)}
                className="px-3 py-1 rounded-full bg-pulse-surface border border-pulse-border text-xs text-pulse-text-secondary hover:border-pulse-accent/30 hover:text-pulse-text transition-all"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Filter Panel */}
      <FilterPanel isOpen={showFilters} onClose={() => setShowFilters(false)} />

      {/* AI Summary Bar */}
      <AISummaryBar />

      {/* Results Header */}
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        <div className="flex items-center gap-3">
          <span className="text-sm text-pulse-text">
            <span className="font-semibold text-pulse-accent">{mockGrants.length}</span> grants found
          </span>
          <Button variant="ghost" size="sm">
            <Save className="w-4 h-4 mr-1" />
            Save Search
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="sort-grants" className="text-xs text-pulse-text-tertiary">Sort by:</label>
          <select
            id="sort-grants"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-pulse-surface border border-pulse-border rounded-lg px-3 py-1.5 text-sm text-pulse-text focus:outline-none focus:border-pulse-accent"
          >
            <option value="match">Match Score</option>
            <option value="deadline">Deadline</option>
            <option value="amount">Amount</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </motion.div>

      {/* Grant Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {mockGrants.map((grant, index) => (
          <PremiumGrantCard key={grant.id} grant={grant} index={index} />
        ))}
      </div>

      {/* Pagination */}
      <motion.div
        className="flex items-center justify-center gap-4 mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        role="navigation"
        aria-label="Pagination"
      >
        <Button variant="outline" size="sm" disabled aria-label="Go to previous page">
          <ChevronLeft className="w-4 h-4 mr-1" aria-hidden="true" />
          Previous
        </Button>
        <div className="flex items-center gap-2" role="list">
          <button className="w-8 h-8 rounded-lg bg-pulse-accent text-pulse-bg text-sm font-medium" aria-label="Page 1" aria-current="page">1</button>
          <button className="w-8 h-8 rounded-lg bg-pulse-surface text-pulse-text-secondary text-sm hover:bg-pulse-elevated transition-colors" aria-label="Go to page 2">2</button>
          <button className="w-8 h-8 rounded-lg bg-pulse-surface text-pulse-text-secondary text-sm hover:bg-pulse-elevated transition-colors" aria-label="Go to page 3">3</button>
        </div>
        <Button variant="outline" size="sm" aria-label="Go to next page">
          Next
          <ChevronRight className="w-4 h-4 ml-1" aria-hidden="true" />
        </Button>
      </motion.div>
    </div>
  )
}
