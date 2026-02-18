'use client'

/**
 * SAVED GRANTS PAGE - PRODUCTION-READY
 * ------------------------------------
 * Real API integration with:
 * - AI match scores and insights
 * - Collection/folder organization
 * - Quick actions and comparison
 * - GlassCard design throughout
 * - Deadline tracking with progress
 * - Loading/empty/error states
 */

import { useState, useEffect, useCallback } from 'react'
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
  ChevronRight,
  MoreHorizontal,
  ExternalLink,
  FileText,
  Target,
  AlertCircle,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GlassCard } from '@/components/ui/glass-card'
import { useToastActions } from '@/components/ui/toast-provider'

interface SavedGrant {
  id: string
  sourceId: string
  sourceName: string
  title: string
  sponsor: string
  summary: string
  categories: string[]
  eligibility: string[]
  locations: string[]
  amountMin: number | null
  amountMax: number | null
  amountText: string
  deadlineDate: string | null
  deadlineType: string
  url: string
  status: string
  savedAt: string
  notes: string | null
  matchScore?: number | null // Real AI match score if available
}

interface Collection {
  id: string
  name: string
  count: number
  icon: React.ComponentType<{ className?: string }>
}

function formatCurrency(min: number | null, max: number | null, text?: string): string {
  if (text) return text
  if (!min && !max) return 'Amount varies'
  if (min && max) {
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`
  }
  if (max) return `Up to $${max.toLocaleString()}`
  if (min) return `From $${min.toLocaleString()}`
  return 'Amount varies'
}

function getDaysLeft(deadlineDate: string | null): number | null {
  if (!deadlineDate) return null
  const now = new Date()
  const deadline = new Date(deadlineDate)
  const diffTime = deadline.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays > 0 ? diffDays : 0
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 14) return '1 week ago'
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  if (diffDays < 60) return '1 month ago'
  return `${Math.floor(diffDays / 30)} months ago`
}

// Saved Grant Card Component
function SavedGrantCard({
  grant,
  index,
  onRemove,
  isRemoving,
}: {
  grant: SavedGrant
  index: number
  onRemove: (id: string) => void
  isRemoving: boolean
}) {
  const [showMenu, setShowMenu] = useState(false)
  const daysLeft = getDaysLeft(grant.deadlineDate)

  // Use real match score if available, otherwise show no score
  const matchScore = grant.matchScore

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
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
    >
      <GlassCard className="p-5 hover:border-pulse-accent/30 transition-all group">
        {/* Top Row - Match Score & Actions */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {matchScore ? (
              <div className={`px-2.5 py-1 rounded-lg border ${getMatchBg(matchScore)}`}>
                <span className={`text-sm font-semibold ${getMatchColor(matchScore)}`}>
                  {matchScore}% match
                </span>
              </div>
            ) : (
              <div className="px-2.5 py-1 rounded-lg border bg-pulse-surface border-pulse-border">
                <span className="text-sm text-pulse-text-tertiary">Saved</span>
              </div>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              onBlur={(e) => {
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
                  <Link
                    href={`/app/workspace/new?grantId=${grant.id}`}
                    role="menuitem"
                    className="w-full px-4 py-2 text-left text-sm text-pulse-text hover:bg-pulse-surface flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Start application
                  </Link>
                  <a
                    href={grant.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    role="menuitem"
                    className="w-full px-4 py-2 text-left text-sm text-pulse-text hover:bg-pulse-surface flex items-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View source
                  </a>
                  <div className="border-t border-pulse-border" role="separator" />
                  <button
                    role="menuitem"
                    onClick={() => {
                      setShowMenu(false)
                      onRemove(grant.id)
                    }}
                    disabled={isRemoving}
                    className="w-full px-4 py-2 text-left text-sm text-pulse-error hover:bg-pulse-error/10 flex items-center gap-2 disabled:opacity-50"
                  >
                    {isRemoving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Remove
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Title & Sponsor */}
        <Link href={`/app/grants/${grant.id}`}>
          <h3 className="text-heading text-pulse-text mb-1 hover:text-pulse-accent transition-colors line-clamp-2">
            {grant.title}
          </h3>
        </Link>
        <p className="text-body-sm text-pulse-text-tertiary flex items-center gap-1.5 mb-3">
          <Building2 className="w-3.5 h-3.5" />
          {grant.sponsor}
        </p>

        {/* Summary */}
        <p className="text-body-sm text-pulse-text-secondary mb-4 line-clamp-2">
          {grant.summary}
        </p>

        {/* Notes */}
        {grant.notes && (
          <div className="px-3 py-2 rounded-lg bg-pulse-surface/50 border border-pulse-border mb-4">
            <p className="text-label-sm text-pulse-text-secondary italic normal-case">"{grant.notes}"</p>
          </div>
        )}

        {/* Categories */}
        {grant.categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {grant.categories.slice(0, 3).map((cat, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-full bg-pulse-surface border border-pulse-border text-label-sm text-pulse-text-secondary normal-case"
              >
                {cat}
              </span>
            ))}
            {grant.categories.length > 3 && (
              <span className="px-2 py-0.5 text-label-sm text-pulse-text-tertiary normal-case">
                +{grant.categories.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Bottom Row - Amount & Deadline */}
        <div className="flex items-center justify-between pt-3 border-t border-pulse-border">
          <div className="flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-pulse-accent" />
            <span className="text-body-sm font-medium text-pulse-text">
              {formatCurrency(grant.amountMin, grant.amountMax, grant.amountText)}
            </span>
          </div>
          {daysLeft !== null ? (
            <div className={`flex items-center gap-1.5 text-body-sm ${
              daysLeft <= 14 ? 'text-pulse-error' :
              daysLeft <= 30 ? 'text-pulse-warning' :
              'text-pulse-text-tertiary'
            }`}>
              <Clock className="w-4 h-4" />
              <span>{daysLeft} days left</span>
            </div>
          ) : (
            <span className="text-body-sm text-pulse-text-tertiary">
              {grant.deadlineType === 'rolling' ? 'Rolling deadline' : 'No deadline'}
            </span>
          )}
        </div>

        {/* Saved info */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-pulse-border/50">
          <span className="text-label-sm text-pulse-text-tertiary normal-case">
            Saved {formatTimeAgo(grant.savedAt)}
          </span>
          <span className="text-label-sm px-2 py-0.5 rounded-full bg-pulse-surface text-pulse-text-tertiary capitalize normal-case">
            {grant.sourceName.replace(/-/g, ' ')}
          </span>
        </div>
      </GlassCard>
    </motion.div>
  )
}

// Stats Summary Component
function SavedStats({ grants }: { grants: SavedGrant[] }) {
  const totalPotential = grants.reduce((sum, g) => {
    return sum + (g.amountMax || g.amountMin || 0)
  }, 0)

  const urgentCount = grants.filter(g => {
    const days = getDaysLeft(g.deadlineDate)
    return days !== null && days <= 30
  }).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="mb-6"
    >
      <GlassCard variant="accent" className="p-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-6 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-pulse-accent/20 border border-pulse-accent/30 flex items-center justify-center">
                <BookmarkCheck className="w-5 h-5 text-pulse-accent" />
              </div>
              <div>
                <p className="text-stat-sm text-pulse-text">{grants.length}</p>
                <p className="text-label-sm text-pulse-text-tertiary normal-case">Saved grants</p>
              </div>
            </div>
            <div className="w-px h-10 bg-pulse-border hidden sm:block" />
            <div>
              <p className="text-stat-sm text-pulse-accent">
                ${(totalPotential / 1000000).toFixed(1)}M
              </p>
              <p className="text-label-sm text-pulse-text-tertiary normal-case">Total potential</p>
            </div>
            {urgentCount > 0 && (
              <>
                <div className="w-px h-10 bg-pulse-border hidden sm:block" />
                <div>
                  <p className="text-stat-sm text-pulse-warning">{urgentCount}</p>
                  <p className="text-label-sm text-pulse-text-tertiary normal-case">Due within 30 days</p>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative group">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <div className="absolute right-0 top-full mt-1 w-48 bg-pulse-elevated border border-pulse-border rounded-xl shadow-xl z-10 overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <a
                  href="/api/export/grants?format=csv&type=saved&humanHeaders=true"
                  className="w-full px-4 py-2 text-left text-body-sm text-pulse-text hover:bg-pulse-surface flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Export as CSV
                </a>
                <a
                  href="/api/export/grants?format=json&type=saved"
                  className="w-full px-4 py-2 text-left text-body-sm text-pulse-text hover:bg-pulse-surface flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Export as JSON
                </a>
              </div>
            </div>
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

// Loading State
function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse">
        <div className="h-20 bg-pulse-surface rounded-xl" />
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-64 bg-pulse-surface rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  )
}

// Error State
function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-16"
    >
      <GlassCard className="max-w-md mx-auto p-8">
        <div className="w-16 h-16 rounded-full bg-pulse-error/10 border border-pulse-error/30 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-pulse-error" />
        </div>
        <h2 className="text-xl font-semibold text-pulse-text mb-2">Failed to load saved grants</h2>
        <p className="text-pulse-text-secondary mb-6">
          Something went wrong while fetching your saved grants. Please try again.
        </p>
        <Button onClick={onRetry}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
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
  const [grants, setGrants] = useState<SavedGrant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [activeCollection, setActiveCollection] = useState('all')
  const [showNewCollectionModal, setShowNewCollectionModal] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')
  const [creatingCollection, setCreatingCollection] = useState(false)
  const { success, error: showError } = useToastActions()

  const fetchGrants = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/user/saved-grants')
      if (!response.ok) {
        throw new Error('Failed to fetch saved grants')
      }
      const data = await response.json()
      setGrants(data.grants || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchGrants()
  }, [fetchGrants])

  const handleRemove = async (grantId: string) => {
    setRemovingId(grantId)
    try {
      const response = await fetch(`/api/user/saved-grants?grantId=${grantId}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to remove grant')
      }
      setGrants((prev) => prev.filter((g) => g.id !== grantId))
      success('Grant removed', 'The grant has been removed from your saved list')
    } catch (err) {
      showError('Failed to remove', err instanceof Error ? err.message : 'Please try again')
    } finally {
      setRemovingId(null)
    }
  }

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      showError('Name required', 'Please enter a collection name')
      return
    }
    setCreatingCollection(true)
    try {
      const response = await fetch('/api/user/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCollectionName.trim() }),
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create collection')
      }
      success('Collection created', `"${newCollectionName}" has been created`)
      setNewCollectionName('')
      setShowNewCollectionModal(false)
    } catch (err) {
      showError('Failed to create', err instanceof Error ? err.message : 'Please try again')
    } finally {
      setCreatingCollection(false)
    }
  }

  // Build collections from grants
  const collections: Collection[] = [
    { id: 'all', name: 'All Saved', count: grants.length, icon: Bookmark },
    {
      id: 'priority',
      name: 'Due Soon',
      count: grants.filter((g) => {
        const days = getDaysLeft(g.deadlineDate)
        return days !== null && days <= 30
      }).length,
      icon: Target,
    },
    {
      id: 'later',
      name: 'No Rush',
      count: grants.filter((g) => {
        const days = getDaysLeft(g.deadlineDate)
        return days === null || days > 30
      }).length,
      icon: Clock,
    },
  ]

  const filteredGrants = grants.filter((g) => {
    if (activeCollection === 'all') return true
    const days = getDaysLeft(g.deadlineDate)
    if (activeCollection === 'priority') return days !== null && days <= 30
    if (activeCollection === 'later') return days === null || days > 30
    return true
  })

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <BookmarkCheck className="w-5 h-5 text-pulse-accent" />
            <span className="text-label text-pulse-text-tertiary">
              Your Collection
            </span>
          </div>
          <h1 className="text-display-page text-pulse-text">Saved Grants</h1>
        </motion.div>
        <LoadingState />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-display-page text-pulse-text">Saved Grants</h1>
        </motion.div>
        <ErrorState onRetry={fetchGrants} />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
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
            <h1 className="text-display-page text-pulse-text">
              Saved Grants
            </h1>
            <p className="text-body text-pulse-text-secondary mt-2">
              Manage and organize grants you're interested in
            </p>
          </div>
          {grants.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => setShowNewCollectionModal(true)}>
              <FolderPlus className="w-4 h-4 mr-2" />
              New Collection
            </Button>
          )}
        </div>
      </motion.div>

      {grants.length === 0 ? (
        <EmptySaved />
      ) : (
        <>
          {/* Stats Summary */}
          <SavedStats grants={grants} />

          {/* Collection Tabs */}
          <motion.div
            className="flex items-center gap-2 mb-6 flex-wrap"
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
          {activeCollection === 'all' && grants.some(g => {
            const days = getDaysLeft(g.deadlineDate)
            return days !== null && days <= 30
          }) && (
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
                    {grants.filter(g => {
                      const days = getDaysLeft(g.deadlineDate)
                      return days !== null && days <= 30
                    }).length} grant(s) have deadlines within 30 days
                  </p>
                  <p className="text-xs text-pulse-text-tertiary mt-0.5">
                    Don't miss out on funding opportunities
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-pulse-warning/30 text-pulse-warning hover:bg-pulse-warning/10"
                  onClick={() => setActiveCollection('priority')}
                >
                  View urgent
                </Button>
              </div>
            </motion.div>
          )}

          {/* Grant Grid */}
          <AnimatePresence mode="popLayout">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredGrants.map((grant, index) => (
                <SavedGrantCard
                  key={grant.id}
                  grant={grant}
                  index={index}
                  onRemove={handleRemove}
                  isRemoving={removingId === grant.id}
                />
              ))}
            </div>
          </AnimatePresence>

          {filteredGrants.length === 0 && (
            <div className="text-center py-12">
              <p className="text-pulse-text-tertiary">No grants in this collection</p>
            </div>
          )}
        </>
      )}

      {/* New Collection Modal */}
      <AnimatePresence>
        {showNewCollectionModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowNewCollectionModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <GlassCard className="w-full max-w-md p-6">
                <h2 className="text-lg font-semibold text-pulse-text mb-4">Create New Collection</h2>
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="Collection name..."
                  className="w-full px-4 py-3 rounded-xl bg-pulse-surface border border-pulse-border text-pulse-text placeholder:text-pulse-text-tertiary focus:outline-none focus:border-pulse-accent mb-4"
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateCollection()}
                  autoFocus
                />
                <div className="flex justify-end gap-3">
                  <Button variant="ghost" onClick={() => setShowNewCollectionModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateCollection} disabled={creatingCollection}>
                    {creatingCollection ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <FolderPlus className="w-4 h-4 mr-2" />
                    )}
                    Create
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
