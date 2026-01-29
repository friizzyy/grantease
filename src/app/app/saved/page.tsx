'use client'

/**
 * SAVED GRANTS PAGE - PREMIUM UPGRADE
 * ------------------------------------
 * Premium saved grants management with:
 * - AI match scores and insights
 * - Collection/folder organization
 * - Quick actions and comparison
 * - GlassCard design throughout
 * - Deadline tracking with progress
 */

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bookmark,
  BookmarkCheck,
  Search,
  Download,
  Trash2,
  FolderOpen,
  FolderPlus,
  Clock,
  DollarSign,
  Building2,
  Sparkles,
  TrendingUp,
  ChevronRight,
  MoreHorizontal,
  ExternalLink,
  FileText,
  Target,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GlassCard } from '@/components/ui/glass-card'

// Mock saved grants with enhanced data
const savedGrants = [
  {
    id: '1',
    title: 'Small Business Innovation Research (SBIR) Phase I',
    sponsor: 'National Science Foundation',
    summary: 'The SBIR program stimulates technological innovation in the private sector by strengthening the role of small business concerns.',
    categories: ['Small Business', 'Research', 'Technology'],
    amountText: '$50,000 - $275,000',
    daysLeft: 45,
    matchScore: 94,
    savedDate: '2 days ago',
    collection: 'Priority',
    notes: 'Great fit for Q2 project',
    hasApplication: true,
  },
  {
    id: '2',
    title: 'Community Development Block Grant Program',
    sponsor: 'Department of Housing and Urban Development',
    summary: 'The CDBG program provides annual grants to develop viable urban communities by providing decent housing.',
    categories: ['Housing', 'Community Development'],
    amountText: '$100,000 - $500,000',
    daysLeft: 20,
    matchScore: 91,
    savedDate: '1 week ago',
    collection: 'Priority',
    notes: null,
    hasApplication: false,
  },
  {
    id: '3',
    title: 'Grants for Arts Projects',
    sponsor: 'National Endowment for the Arts',
    summary: 'Supports public engagement with various forms of excellent art across the nation.',
    categories: ['Arts & Culture', 'Community Development'],
    amountText: '$10,000 - $100,000',
    daysLeft: 105,
    matchScore: 78,
    savedDate: '2 weeks ago',
    collection: 'Later',
    notes: 'Consider for 2025',
    hasApplication: false,
  },
  {
    id: '4',
    title: 'Rural Business Development Grant',
    sponsor: 'USDA Rural Development',
    summary: 'Provides technical assistance and training for small rural businesses.',
    categories: ['Small Business', 'Agriculture'],
    amountText: '$10,000 - $500,000',
    daysLeft: null,
    matchScore: 85,
    savedDate: '3 weeks ago',
    collection: 'Later',
    notes: null,
    hasApplication: false,
  },
]

// Collections for organization
const collections = [
  { id: 'all', name: 'All Saved', count: 4, icon: Bookmark },
  { id: 'priority', name: 'Priority', count: 2, icon: Target },
  { id: 'later', name: 'Later', count: 2, icon: Clock },
]

// Saved Grant Card Component
function SavedGrantCard({ grant, index }: { grant: typeof savedGrants[0]; index: number }) {
  const [showMenu, setShowMenu] = useState(false)

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
      <GlassCard className="p-5 hover:border-pulse-accent/30 transition-all group">
        {/* Top Row - Match Score & Actions */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`px-2.5 py-1 rounded-lg border ${getMatchBg(grant.matchScore)}`}>
              <span className={`text-sm font-semibold ${getMatchColor(grant.matchScore)}`}>
                {grant.matchScore}% match
              </span>
            </div>
            {grant.hasApplication && (
              <Badge variant="default" className="text-xs bg-blue-500/20 text-blue-400 border-blue-500/30">
                <FileText className="w-3 h-3 mr-1" />
                In progress
              </Badge>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              onBlur={(e) => {
                // Close menu when focus leaves the menu area
                if (!e.currentTarget.parentElement?.contains(e.relatedTarget as Node)) {
                  setShowMenu(false)
                }
              }}
              className="p-2 rounded-lg bg-pulse-surface text-pulse-text-tertiary hover:text-pulse-text transition-all"
              aria-label="Open grant actions menu"
              aria-expanded={showMenu}
              aria-haspopup="menu"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <AnimatePresence>
              {showMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-full mt-1 w-48 bg-pulse-elevated border border-pulse-border rounded-xl shadow-xl z-10 overflow-hidden"
                  role="menu"
                  aria-label="Grant actions"
                >
                  <button
                    role="menuitem"
                    className="w-full px-4 py-2 text-left text-sm text-pulse-text hover:bg-pulse-surface flex items-center gap-2"
                  >
                    <FolderOpen className="w-4 h-4" />
                    Move to collection
                  </button>
                  <button
                    role="menuitem"
                    className="w-full px-4 py-2 text-left text-sm text-pulse-text hover:bg-pulse-surface flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Start application
                  </button>
                  <button
                    role="menuitem"
                    className="w-full px-4 py-2 text-left text-sm text-pulse-text hover:bg-pulse-surface flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View source
                  </button>
                  <div className="border-t border-pulse-border" role="separator" />
                  <button
                    role="menuitem"
                    className="w-full px-4 py-2 text-left text-sm text-pulse-error hover:bg-pulse-error/10 flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Remove
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Title & Sponsor */}
        <Link href={`/app/grants/${grant.id}`}>
          <h3 className="text-lg font-semibold text-pulse-text mb-1 hover:text-pulse-accent transition-colors line-clamp-2">
            {grant.title}
          </h3>
        </Link>
        <p className="text-sm text-pulse-text-tertiary flex items-center gap-1.5 mb-3">
          <Building2 className="w-3.5 h-3.5" />
          {grant.sponsor}
        </p>

        {/* Summary */}
        <p className="text-sm text-pulse-text-secondary mb-4 line-clamp-2">
          {grant.summary}
        </p>

        {/* Notes */}
        {grant.notes && (
          <div className="px-3 py-2 rounded-lg bg-pulse-surface/50 border border-pulse-border mb-4">
            <p className="text-xs text-pulse-text-secondary italic">"{grant.notes}"</p>
          </div>
        )}

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

        {/* Saved info */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-pulse-border/50">
          <span className="text-xs text-pulse-text-tertiary">Saved {grant.savedDate}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-pulse-surface text-pulse-text-tertiary">
            {grant.collection}
          </span>
        </div>
      </GlassCard>
    </motion.div>
  )
}

// Stats Summary Component
function SavedStats() {
  const totalPotential = savedGrants.reduce((sum, g) => {
    const maxAmount = parseInt(g.amountText.replace(/[^0-9]/g, '').slice(-6)) || 0
    return sum + maxAmount
  }, 0)

  const urgentCount = savedGrants.filter(g => g.daysLeft && g.daysLeft <= 30).length

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
                <BookmarkCheck className="w-5 h-5 text-pulse-accent" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-pulse-text">{savedGrants.length}</p>
                <p className="text-xs text-pulse-text-tertiary">Saved grants</p>
              </div>
            </div>
            <div className="w-px h-10 bg-pulse-border" />
            <div>
              <p className="text-2xl font-semibold text-pulse-accent">$1.4M</p>
              <p className="text-xs text-pulse-text-tertiary">Total potential</p>
            </div>
            <div className="w-px h-10 bg-pulse-border" />
            <div>
              <p className="text-2xl font-semibold text-pulse-warning">{urgentCount}</p>
              <p className="text-xs text-pulse-text-tertiary">Due within 30 days</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button size="sm" asChild>
              <Link href="/app/discover">
                <Sparkles className="w-4 h-4 mr-2" />
                Find More
              </Link>
            </Button>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}

// Empty State Component
function EmptySaved() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-16"
    >
      <GlassCard className="max-w-md mx-auto p-8">
        <div className="w-16 h-16 rounded-full bg-pulse-accent/10 border border-pulse-accent/30 flex items-center justify-center mx-auto mb-6">
          <Bookmark className="w-8 h-8 text-pulse-accent" />
        </div>
        <h2 className="text-xl font-semibold text-pulse-text mb-2">No saved grants yet</h2>
        <p className="text-pulse-text-secondary mb-6">
          Start exploring grants and save the ones that match your needs for easy access later.
        </p>
        <Button asChild>
          <Link href="/app/discover">
            <Search className="w-4 h-4 mr-2" />
            Discover Grants
          </Link>
        </Button>
      </GlassCard>
    </motion.div>
  )
}

export default function SavedGrantsPage() {
  const [activeCollection, setActiveCollection] = useState('all')
  const isEmpty = savedGrants.length === 0

  const filteredGrants = activeCollection === 'all'
    ? savedGrants
    : savedGrants.filter(g => g.collection.toLowerCase() === activeCollection)

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
              <BookmarkCheck className="w-5 h-5 text-pulse-accent" />
              <span className="text-pulse-text-tertiary font-mono text-micro uppercase tracking-wider">
                Your Collection
              </span>
            </div>
            <h1 className="font-serif text-display text-pulse-text">
              Saved Grants
            </h1>
            <p className="text-pulse-text-secondary mt-2">
              Manage and organize grants you're interested in
            </p>
          </div>
          {!isEmpty && (
            <Button variant="outline" size="sm">
              <FolderPlus className="w-4 h-4 mr-2" />
              New Collection
            </Button>
          )}
        </div>
      </motion.div>

      {isEmpty ? (
        <EmptySaved />
      ) : (
        <>
          {/* Stats Summary */}
          <SavedStats />

          {/* Collection Tabs */}
          <motion.div
            className="flex items-center gap-2 mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            role="tablist"
            aria-label="Grant collections"
          >
            {collections.map((collection) => {
              const Icon = collection.icon
              const isActive = activeCollection === collection.id
              return (
                <button
                  key={collection.id}
                  onClick={() => setActiveCollection(collection.id)}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`collection-panel-${collection.id}`}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-pulse-accent/10 border-pulse-accent/30 text-pulse-accent'
                      : 'bg-pulse-surface border-pulse-border text-pulse-text-secondary hover:border-pulse-accent/20 hover:text-pulse-text'
                  }`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  <span className="text-sm font-medium">{collection.name}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-pulse-accent/20' : 'bg-pulse-elevated'
                  }`}>
                    {collection.count}
                  </span>
                </button>
              )
            })}
          </motion.div>

          {/* Urgent Deadline Alert */}
          {activeCollection === 'all' && savedGrants.some(g => g.daysLeft && g.daysLeft <= 30) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mb-6"
            >
              <div className="flex items-center gap-3 p-4 rounded-xl bg-pulse-warning/10 border border-pulse-warning/30">
                <AlertCircle className="w-5 h-5 text-pulse-warning shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-pulse-text">
                    {savedGrants.filter(g => g.daysLeft && g.daysLeft <= 30).length} grant(s) have deadlines within 30 days
                  </p>
                  <p className="text-xs text-pulse-text-tertiary mt-0.5">
                    Don't miss out on funding opportunities
                  </p>
                </div>
                <Button size="sm" variant="outline" className="border-pulse-warning/30 text-pulse-warning hover:bg-pulse-warning/10">
                  View urgent
                </Button>
              </div>
            </motion.div>
          )}

          {/* Grant Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredGrants.map((grant, index) => (
              <SavedGrantCard key={grant.id} grant={grant} index={index} />
            ))}
          </div>

          {filteredGrants.length === 0 && (
            <div className="text-center py-12">
              <p className="text-pulse-text-tertiary">No grants in this collection</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
