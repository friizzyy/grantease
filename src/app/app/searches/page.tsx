'use client'

/**
 * SAVED SEARCHES PAGE - WIRED TO REAL API
 * ---------------------------------------
 * Full CRUD against /api/user/saved-searches
 * - Create/edit/delete searches
 * - Toggle alerts + change frequency (persisted)
 * - Run search (replays saved filters, not just query)
 * - Optimistic UI with rollback on error
 */

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  BellOff,
  Search,
  Trash2,
  Play,
  Clock,
  Sparkles,
  Plus,
  TrendingUp,
  AlertCircle,
  Edit3,
  RefreshCw,
  Loader2,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GlassCard } from '@/components/ui/glass-card'
import { useToastActions } from '@/components/ui/toast-provider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface SavedSearch {
  id: string
  name: string
  query: string
  filters: {
    categories?: string[]
    locations?: string[]
    eligibility?: string[]
    status?: string
    [key: string]: unknown
  }
  alertEnabled: boolean
  alertFreq: 'daily' | 'weekly'
  lastAlertAt: string | null
  createdAt: string
}

function formatTimeAgo(dateStr: string | null): string {
  if (!dateStr) return 'never'
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

/** Build a /app/discover URL that replays the saved search fully. */
function buildRunUrl(search: SavedSearch): string {
  const params = new URLSearchParams()
  if (search.query) params.set('q', search.query)
  if (search.filters.categories?.length) params.set('categories', search.filters.categories.join(','))
  if (search.filters.locations?.length) params.set('locations', search.filters.locations.join(','))
  if (search.filters.eligibility?.length) params.set('eligibility', search.filters.eligibility.join(','))
  if (search.filters.status) params.set('status', search.filters.status as string)
  return `/app/discover?${params.toString()}`
}

// Stats
function SearchStats({ searches }: { searches: SavedSearch[] }) {
  const totalSearches = searches.length
  const totalAlerts = searches.filter(s => s.alertEnabled).length

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

// Rename modal
function RenameModal({
  search,
  onClose,
  onSave,
  saving,
}: {
  search: SavedSearch
  onClose: () => void
  onSave: (newName: string) => void
  saving: boolean
}) {
  const [name, setName] = useState(search.name)
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <GlassCard className="w-full max-w-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-pulse-text">Rename search</h2>
            <button onClick={onClose} aria-label="Close" className="text-pulse-text-tertiary hover:text-pulse-text">
              <X className="w-5 h-5" />
            </button>
          </div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            aria-label="Search name"
            className="w-full px-4 py-3 rounded-xl bg-pulse-surface border border-pulse-border text-pulse-text placeholder:text-pulse-text-tertiary focus:outline-none focus:border-pulse-accent focus-visible:ring-2 focus-visible:ring-pulse-accent/50 mb-4"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && name.trim()) onSave(name.trim())
              if (e.key === 'Escape') onClose()
            }}
          />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
            <Button onClick={() => onSave(name.trim())} disabled={!name.trim() || saving || name.trim() === search.name}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save
            </Button>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  )
}

// Search card
function SearchCard({
  search,
  index,
  onToggleAlert,
  onUpdateFreq,
  onDelete,
  onRename,
  busy,
}: {
  search: SavedSearch
  index: number
  onToggleAlert: (id: string) => void
  onUpdateFreq: (id: string, freq: 'daily' | 'weekly') => void
  onDelete: (id: string) => void
  onRename: (search: SavedSearch) => void
  busy: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: 0.1 + index * 0.05 }}
    >
      <GlassCard className="p-5 hover:border-white/[0.1] transition-all">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <h3 className="text-heading text-pulse-text truncate">{search.name}</h3>
              {search.alertEnabled && (
                <Badge variant="default" className="shrink-0 bg-teal-500/10 text-teal-400 border-teal-500/20">
                  <Bell className="w-3 h-3 mr-1" />
                  {search.alertFreq}
                </Badge>
              )}
            </div>

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

            <div className="flex items-center gap-3 sm:gap-6 text-sm flex-wrap">
              <div className="flex items-center gap-2 text-pulse-text-tertiary">
                <Clock className="w-4 h-4" />
                <span>Created {formatTimeAgo(search.createdAt)}</span>
              </div>
              {search.lastAlertAt && (
                <div className="flex items-center gap-2 text-pulse-text-tertiary">
                  <RefreshCw className="w-4 h-4" />
                  <span>Last alert {formatTimeAgo(search.lastAlertAt)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <div className="flex items-center gap-2 sm:pr-3 sm:border-r border-pulse-border">
              <button
                onClick={() => onToggleAlert(search.id)}
                disabled={busy}
                aria-label={search.alertEnabled ? 'Disable alert' : 'Enable alert'}
                className={`p-2 rounded-lg transition-all min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-pulse-accent/50 focus-visible:outline-none disabled:opacity-50 ${
                  search.alertEnabled
                    ? 'bg-pulse-accent/20 text-pulse-accent'
                    : 'bg-pulse-surface text-pulse-text-tertiary hover:text-pulse-text'
                }`}
              >
                {search.alertEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              </button>

              {search.alertEnabled && (
                <Select
                  value={search.alertFreq}
                  onValueChange={(v) => onUpdateFreq(search.id, v as 'daily' | 'weekly')}
                  disabled={busy}
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

            <Button size="sm" asChild>
              <Link href={buildRunUrl(search)}>
                <Play className="w-4 h-4 mr-1" />
                Run
              </Link>
            </Button>

            <div className="flex items-center">
              <button
                onClick={() => onRename(search)}
                aria-label="Rename search"
                className="p-2 rounded-lg text-pulse-text-tertiary hover:text-pulse-text hover:bg-pulse-surface transition-all min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-pulse-accent/50 focus-visible:outline-none"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(search.id)}
                disabled={busy}
                aria-label="Delete search"
                className="p-2 rounded-lg text-pulse-text-tertiary hover:text-pulse-error hover:bg-pulse-error/10 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-pulse-accent/50 focus-visible:outline-none disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}

// Empty state
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
          Run a search on the discover page, then save it here to replay anytime and get alerts when new grants match.
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

// Loading skeleton
function LoadingState() {
  return (
    <div className="space-y-4">
      <div className="animate-pulse rounded-xl border border-pulse-accent/20 bg-pulse-elevated p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pulse-surface rounded-lg" />
              <div>
                <div className="h-6 w-8 bg-pulse-surface rounded mb-1" />
                <div className="h-3 w-20 bg-pulse-surface rounded" />
              </div>
            </div>
          </div>
          <div className="h-9 w-28 bg-pulse-surface rounded-lg" />
        </div>
      </div>
      {[1, 2, 3].map(i => (
        <div key={i} className="animate-pulse rounded-xl border border-pulse-border bg-pulse-elevated p-5 h-36" />
      ))}
    </div>
  )
}

export default function SavedSearchesPage() {
  const [searches, setSearches] = useState<SavedSearch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set())
  const [renaming, setRenaming] = useState<SavedSearch | null>(null)
  const [renameSaving, setRenameSaving] = useState(false)
  const { success, error: showError } = useToastActions()

  const setBusy = (id: string, busy: boolean) => {
    setBusyIds(prev => {
      const next = new Set(prev)
      if (busy) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const fetchSearches = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/user/saved-searches')
      if (!res.ok) throw new Error('Failed to load saved searches')
      const data = await res.json()
      setSearches(data.searches || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetchSearches() }, [fetchSearches])

  const toggleAlert = async (id: string) => {
    const current = searches.find(s => s.id === id)
    if (!current) return
    const next = !current.alertEnabled
    // Optimistic
    setSearches(prev => prev.map(s => s.id === id ? { ...s, alertEnabled: next } : s))
    setBusy(id, true)
    try {
      const res = await fetch('/api/user/saved-searches', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, alertEnabled: next }),
      })
      if (!res.ok) throw new Error('Failed to update')
      success(next ? 'Alerts enabled' : 'Alerts disabled')
    } catch (err) {
      setSearches(prev => prev.map(s => s.id === id ? { ...s, alertEnabled: current.alertEnabled } : s))
      showError('Failed to update alert', err instanceof Error ? err.message : 'Try again')
    } finally {
      setBusy(id, false)
    }
  }

  const updateAlertFreq = async (id: string, freq: 'daily' | 'weekly') => {
    const current = searches.find(s => s.id === id)
    if (!current) return
    setSearches(prev => prev.map(s => s.id === id ? { ...s, alertFreq: freq } : s))
    setBusy(id, true)
    try {
      const res = await fetch('/api/user/saved-searches', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, alertFreq: freq }),
      })
      if (!res.ok) throw new Error('Failed to update')
    } catch (err) {
      setSearches(prev => prev.map(s => s.id === id ? { ...s, alertFreq: current.alertFreq } : s))
      showError('Failed to update frequency', err instanceof Error ? err.message : 'Try again')
    } finally {
      setBusy(id, false)
    }
  }

  const deleteSearch = async (id: string) => {
    const current = searches.find(s => s.id === id)
    if (!current) return
    if (!confirm(`Delete "${current.name}"? This can't be undone.`)) return
    // Optimistic
    setSearches(prev => prev.filter(s => s.id !== id))
    setBusy(id, true)
    try {
      const res = await fetch(`/api/user/saved-searches?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      success('Search deleted')
    } catch (err) {
      // Rollback
      setSearches(prev => [current, ...prev].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ))
      showError('Failed to delete', err instanceof Error ? err.message : 'Try again')
    } finally {
      setBusy(id, false)
    }
  }

  const renameSearch = async (newName: string) => {
    if (!renaming || !newName.trim()) return
    setRenameSaving(true)
    try {
      const res = await fetch('/api/user/saved-searches', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: renaming.id, name: newName }),
      })
      if (!res.ok) {
        // The PATCH handler may not support name yet; show friendly error
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to rename')
      }
      setSearches(prev => prev.map(s => s.id === renaming.id ? { ...s, name: newName } : s))
      success('Renamed', `Saved as "${newName}"`)
      setRenaming(null)
    } catch (err) {
      showError('Rename failed', err instanceof Error ? err.message : 'Try again')
    } finally {
      setRenameSaving(false)
    }
  }

  return (
    <div className="px-4 md:px-8 lg:px-10 py-8 max-w-[1400px] mx-auto">
      <motion.div
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <h1 className="text-heading-lg text-pulse-text">Saved Searches</h1>
          <p className="text-body-sm text-pulse-text-tertiary mt-1">
            Run saved searches instantly or enable alerts for new matches
          </p>
        </div>
      </motion.div>

      {isLoading ? (
        <LoadingState />
      ) : error ? (
        <div className="text-center py-16">
          <GlassCard className="max-w-md mx-auto p-8">
            <div className="w-16 h-16 rounded-full bg-pulse-error/10 border border-pulse-error/30 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-pulse-error" />
            </div>
            <h2 className="text-xl font-semibold text-pulse-text mb-2">Couldn&apos;t load searches</h2>
            <p className="text-pulse-text-secondary mb-6">{error}</p>
            <Button onClick={fetchSearches}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try again
            </Button>
          </GlassCard>
        </div>
      ) : searches.length === 0 ? (
        <EmptySearches />
      ) : (
        <>
          <SearchStats searches={searches} />

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {searches.map((search, index) => (
                <SearchCard
                  key={search.id}
                  search={search}
                  index={index}
                  onToggleAlert={toggleAlert}
                  onUpdateFreq={updateAlertFreq}
                  onDelete={deleteSearch}
                  onRename={setRenaming}
                  busy={busyIds.has(search.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        </>
      )}

      <AnimatePresence>
        {renaming && (
          <RenameModal
            search={renaming}
            onClose={() => setRenaming(null)}
            onSave={renameSearch}
            saving={renameSaving}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
