'use client'

/**
 * SAVED SEARCHES PAGE - PREMIUM UPGRADE
 * --------------------------------------
 * Premium search management with:
 * - AI-powered search insights
 * - Alert management with frequency settings
 * - New matches highlighting
 * - Quick run actions
 * - GlassCard design throughout
 */

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Bell,
  BellOff,
  Search,
  Trash2,
  Play,
  Clock,
  Sparkles,
  Filter,
  Plus,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  Edit3,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GlassCard } from '@/components/ui/glass-card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Mock saved searches with enhanced data
const savedSearches = [
  {
    id: '1',
    name: 'Small Business Technology',
    query: 'technology innovation',
    filters: {
      categories: ['Small Business', 'Technology'],
      status: 'open',
    },
    alertEnabled: true,
    alertFreq: 'daily',
    lastAlertAt: new Date('2024-01-28'),
    newMatches: 8,
    totalMatches: 124,
    avgMatchScore: 87,
    lastRun: '2 hours ago',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Nonprofit Community Development',
    query: 'community development housing',
    filters: {
      categories: ['Community Development', 'Housing'],
      eligibility: ['Nonprofit 501(c)(3)'],
      status: 'open',
    },
    alertEnabled: true,
    alertFreq: 'weekly',
    lastAlertAt: new Date('2024-01-21'),
    newMatches: 3,
    totalMatches: 56,
    avgMatchScore: 82,
    lastRun: '1 day ago',
    createdAt: new Date('2024-01-10'),
  },
  {
    id: '3',
    name: 'California Education Grants',
    query: 'education',
    filters: {
      categories: ['Education'],
      locations: ['CA'],
      status: 'open',
    },
    alertEnabled: false,
    alertFreq: 'daily',
    lastAlertAt: null,
    newMatches: 0,
    totalMatches: 34,
    avgMatchScore: 75,
    lastRun: '3 days ago',
    createdAt: new Date('2024-01-05'),
  },
]

// Stats Summary Component
function SearchStats() {
  const totalSearches = savedSearches.length
  const totalAlerts = savedSearches.filter(s => s.alertEnabled).length
  const totalNewMatches = savedSearches.reduce((sum, s) => sum + s.newMatches, 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="mb-6"
    >
      <GlassCard variant="accent" className="p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-pulse-accent/10 border border-pulse-accent/20 flex items-center justify-center">
                <Search className="w-5 h-5 text-pulse-accent" />
              </div>
              <div>
                <p className="text-stat-sm text-pulse-text">{totalSearches}</p>
                <p className="text-label-sm text-pulse-text-tertiary normal-case">Saved searches</p>
              </div>
            </div>
            <div className="w-px h-10 bg-pulse-border hidden sm:block" />
            <div>
              <p className="text-stat-sm text-pulse-accent">{totalAlerts}</p>
              <p className="text-label-sm text-pulse-text-tertiary normal-case">Active alerts</p>
            </div>
            <div className="w-px h-10 bg-pulse-border hidden sm:block" />
            <div>
              <p className="text-stat-sm text-pulse-warning">{totalNewMatches}</p>
              <p className="text-label-sm text-pulse-text-tertiary normal-case">New matches</p>
            </div>
          </div>
          <Button size="sm" asChild>
            <Link href="/app/discover">
              <Plus className="w-4 h-4 mr-2" />
              New Search
            </Link>
          </Button>
        </div>
      </GlassCard>
    </motion.div>
  )
}

// Search Card Component
function SearchCard({
  search,
  index,
  onToggleAlert,
  onUpdateFreq,
  onDelete
}: {
  search: typeof savedSearches[0]
  index: number
  onToggleAlert: (id: string) => void
  onUpdateFreq: (id: string, freq: string) => void
  onDelete: (id: string) => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.05 }}
    >
      <GlassCard className="p-5 hover:border-white/[0.1] transition-all">
        <div className="flex items-start justify-between gap-4">
          {/* Search Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-heading text-pulse-text truncate">{search.name}</h3>
              {search.newMatches > 0 && (
                <Badge variant="accent" className="shrink-0">
                  {search.newMatches} new
                </Badge>
              )}
              {search.alertEnabled && (
                <Badge variant="default" className="shrink-0 bg-teal-500/10 text-teal-400 border-teal-500/20">
                  <Bell className="w-3 h-3 mr-1" />
                  {search.alertFreq}
                </Badge>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {search.query && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-pulse-surface border border-pulse-border text-xs text-pulse-text-secondary">
                  <Search className="w-3 h-3" />
                  {search.query}
                </span>
              )}
              {search.filters.categories?.map((cat) => (
                <span key={cat} className="px-2.5 py-1 rounded-lg bg-pulse-surface border border-pulse-border text-xs text-pulse-text-secondary">
                  {cat}
                </span>
              ))}
              {search.filters.locations?.map((loc) => (
                <span key={loc} className="px-2.5 py-1 rounded-lg bg-pulse-surface border border-pulse-border text-xs text-pulse-text-secondary">
                  {loc}
                </span>
              ))}
              {search.filters.eligibility?.map((el) => (
                <span key={el} className="px-2.5 py-1 rounded-lg bg-pulse-surface border border-pulse-border text-xs text-pulse-text-secondary">
                  {el}
                </span>
              ))}
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-pulse-text-tertiary">
                <TrendingUp className="w-4 h-4" />
                <span>{search.totalMatches} total matches</span>
              </div>
              <div className="flex items-center gap-2 text-pulse-accent">
                <Sparkles className="w-4 h-4" />
                <span>{search.avgMatchScore}% avg match</span>
              </div>
              <div className="flex items-center gap-2 text-pulse-text-tertiary">
                <Clock className="w-4 h-4" />
                <span>Last run {search.lastRun}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Alert Toggle & Frequency */}
            <div className="flex items-center gap-2 pr-3 border-r border-pulse-border">
              <button
                onClick={() => onToggleAlert(search.id)}
                aria-label={search.alertEnabled ? 'Disable alert for this search' : 'Enable alert for this search'}
                className={`p-2 rounded-lg transition-all min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-pulse-accent/50 focus-visible:outline-none ${
                  search.alertEnabled
                    ? 'bg-pulse-accent/20 text-pulse-accent'
                    : 'bg-pulse-surface text-pulse-text-tertiary hover:text-pulse-text'
                }`}
              >
                {search.alertEnabled ? (
                  <Bell className="w-4 h-4" />
                ) : (
                  <BellOff className="w-4 h-4" />
                )}
              </button>

              {search.alertEnabled && (
                <Select
                  value={search.alertFreq}
                  onValueChange={(v) => onUpdateFreq(search.id, v)}
                >
                  <SelectTrigger className="w-24 h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Run Search */}
            <Button size="sm" asChild>
              <Link href={`/app/discover?q=${encodeURIComponent(search.query || '')}&categories=${search.filters.categories?.join(',') || ''}`}>
                <Play className="w-4 h-4 mr-1" />
                Run
              </Link>
            </Button>

            {/* More Actions */}
            <div className="flex items-center">
              <button
                aria-label="Edit search"
                className="p-2 rounded-lg text-pulse-text-tertiary hover:text-pulse-text hover:bg-pulse-surface transition-all min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-pulse-accent/50 focus-visible:outline-none"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(search.id)}
                aria-label="Delete search"
                className="p-2 rounded-lg text-pulse-text-tertiary hover:text-pulse-error hover:bg-pulse-error/10 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-pulse-accent/50 focus-visible:outline-none"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Last Alert Info */}
        {search.alertEnabled && search.lastAlertAt && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-pulse-border/50 text-xs text-pulse-text-tertiary">
            <RefreshCw className="w-3 h-3" />
            <span>Last alert sent {search.lastAlertAt.toLocaleDateString()}</span>
            {search.newMatches > 0 && (
              <span className="text-pulse-accent">• {search.newMatches} new since then</span>
            )}
          </div>
        )}
      </GlassCard>
    </motion.div>
  )
}

// Empty State
function EmptySearches() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-16"
    >
      <GlassCard className="max-w-md mx-auto p-8">
        <div className="w-16 h-16 rounded-full bg-pulse-accent/10 border border-pulse-accent/30 flex items-center justify-center mx-auto mb-6">
          <Search className="w-8 h-8 text-pulse-accent" />
        </div>
        <h2 className="text-xl font-semibold text-pulse-text mb-2">No saved searches yet</h2>
        <p className="text-pulse-text-secondary mb-6">
          Save your search queries to quickly run them again or set up alerts for new matches.
        </p>
        <Button asChild>
          <Link href="/app/discover">
            <Sparkles className="w-4 h-4 mr-2" />
            Start Searching
          </Link>
        </Button>
      </GlassCard>
    </motion.div>
  )
}

export default function SavedSearchesPage() {
  const [searches, setSearches] = useState(savedSearches)
  const isEmpty = searches.length === 0

  const toggleAlert = (id: string) => {
    setSearches(searches.map(s =>
      s.id === id ? { ...s, alertEnabled: !s.alertEnabled } : s
    ))
  }

  const updateAlertFreq = (id: string, freq: string) => {
    setSearches(searches.map(s =>
      s.id === id ? { ...s, alertFreq: freq } : s
    ))
  }

  const deleteSearch = (id: string) => {
    setSearches(searches.filter(s => s.id !== id))
  }

  return (
    <div className="px-4 md:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-end justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Search className="w-5 h-5 text-pulse-accent" />
              <span className="text-label text-pulse-text-tertiary">
                Search Management
              </span>
            </div>
            <h1 className="text-display-page text-pulse-text">
              Saved Searches
            </h1>
            <p className="text-body text-pulse-text-secondary mt-2">
              Run saved searches instantly or enable alerts for new matches
            </p>
          </div>
        </div>
      </motion.div>

      {isEmpty ? (
        <EmptySearches />
      ) : (
        <>
          {/* Stats Summary */}
          <SearchStats />

          {/* AI Insights */}
          {searches.some(s => s.newMatches > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <div className="flex items-center gap-3 p-4 rounded-xl bg-pulse-accent/10 border border-pulse-accent/30">
                <AlertCircle className="w-5 h-5 text-pulse-accent shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-pulse-text">
                    {searches.reduce((sum, s) => sum + s.newMatches, 0)} new grants match your saved searches
                  </p>
                  <p className="text-xs text-pulse-text-tertiary mt-0.5">
                    Review them before they hit their deadlines
                  </p>
                </div>
                <Button size="sm" variant="outline" className="border-pulse-accent/30 text-pulse-accent hover:bg-pulse-accent/10">
                  View all new
                </Button>
              </div>
            </motion.div>
          )}

          {/* Search List */}
          <div className="space-y-4">
            {searches.map((search, index) => (
              <SearchCard
                key={search.id}
                search={search}
                index={index}
                onToggleAlert={toggleAlert}
                onUpdateFreq={updateAlertFreq}
                onDelete={deleteSearch}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
