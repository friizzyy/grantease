'use client'

/**
 * DISCOVER PAGE - Multi-Source Grant Discovery
 * Searches across Grants.gov, SAM.gov, USAspending, California Grants, and more
 */

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Sparkles,
  Target,
  Clock,
  DollarSign,
  Building2,
  ChevronRight,
  Bookmark,
  BookmarkCheck,
  SlidersHorizontal,
  X,
  Loader2,
  AlertCircle,
  RefreshCw,
  Globe,
  MapPin,
  FileText,
  Award,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GlassCard } from '@/components/ui/glass-card'

// Grant type from unified API
interface Grant {
  id: string
  sourceId: string
  sourceName: string
  sourceLabel?: string
  type?: 'grant' | 'contract' | 'award'
  title: string
  sponsor: string
  summary: string
  categories: string[]
  eligibility: string[]
  locations: string[]
  amountMin: number | null
  amountMax: number | null
  amountText: string | null
  deadlineDate: string | null
  url: string
  status: string
  isLive?: boolean
  metadata?: Record<string, unknown>
}

// Source info from API
interface SourceInfo {
  name: string
  label: string
  description: string
  type: string
  region?: string
  requiresApiKey: boolean
  isConfigured: boolean
}

// Quick search suggestions
const quickSuggestions = [
  'small business',
  'technology',
  'climate',
  'education',
  'health',
  'research',
]

// Format currency
function formatCurrency(amount: number | null): string {
  if (!amount) return ''
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

// Calculate days until deadline
function getDaysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null
  const deadline = new Date(dateStr)
  const now = new Date()
  const diff = deadline.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// Get type icon
function getTypeIcon(type?: string) {
  switch (type) {
    case 'contract': return <FileText className="w-3 h-3" />
    case 'award': return <Award className="w-3 h-3" />
    default: return <Globe className="w-3 h-3" />
  }
}

// Get source color
function getSourceColor(sourceName: string): string {
  const colors: Record<string, string> = {
    'grants-gov': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'sam-gov': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'usaspending': 'bg-green-500/20 text-green-400 border-green-500/30',
    'california-grants': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  }
  return colors[sourceName] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
}

// Grant Card Component
function GrantCard({ grant, index }: { grant: Grant; index: number }) {
  const [isSaved, setIsSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const daysLeft = getDaysUntil(grant.deadlineDate)

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSaving(true)

    try {
      if (isSaved) {
        await fetch(`/api/user/saved-grants?grantId=${grant.id}`, { method: 'DELETE' })
      } else {
        await fetch('/api/user/saved-grants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ grantId: grant.id }),
        })
      }
      setIsSaved(!isSaved)
    } catch (error) {
      console.error('Error saving grant:', error)
    } finally {
      setSaving(false)
    }
  }

  const amountDisplay = grant.amountText ||
    (grant.amountMin && grant.amountMax
      ? `${formatCurrency(grant.amountMin)} - ${formatCurrency(grant.amountMax)}`
      : grant.amountMax
        ? `Up to ${formatCurrency(grant.amountMax)}`
        : grant.amountMin
          ? `From ${formatCurrency(grant.amountMin)}`
          : 'Amount varies')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <Link href={grant.url} target="_blank" rel="noopener noreferrer">
        <GlassCard className="p-5 hover:border-pulse-accent/30 transition-all group cursor-pointer h-full">
          {/* Top Row - Source & Type */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={`text-xs ${getSourceColor(grant.sourceName)}`}>
                {getTypeIcon(grant.type)}
                <span className="ml-1">{grant.sourceLabel || grant.sourceName}</span>
              </Badge>
              {grant.status === 'open' && (
                <Badge variant="default" className="text-xs bg-green-500/20 text-green-400 border-green-500/30">
                  Open
                </Badge>
              )}
              {grant.status === 'forecasted' && (
                <Badge variant="outline" className="text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                  Forecasted
                </Badge>
              )}
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`p-2 rounded-lg transition-all ${
                isSaved
                  ? 'bg-pulse-accent/20 text-pulse-accent'
                  : 'bg-pulse-surface text-pulse-text-tertiary hover:text-pulse-accent'
              }`}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isSaved ? (
                <BookmarkCheck className="w-4 h-4" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Title & Sponsor */}
          <h3 className="text-lg font-semibold text-pulse-text mb-1 group-hover:text-pulse-accent transition-colors line-clamp-2">
            {grant.title}
          </h3>
          <p className="text-sm text-pulse-text-tertiary flex items-center gap-1.5 mb-3">
            <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{grant.sponsor}</span>
          </p>

          {/* Summary */}
          {grant.summary && (
            <p className="text-sm text-pulse-text-secondary mb-4 line-clamp-2">
              {grant.summary}
            </p>
          )}

          {/* Categories */}
          {grant.categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {grant.categories.slice(0, 3).map((cat, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-full bg-pulse-surface text-xs text-pulse-text-tertiary"
                >
                  {cat}
                </span>
              ))}
              {grant.categories.length > 3 && (
                <span className="px-2 py-0.5 rounded-full bg-pulse-surface text-xs text-pulse-text-tertiary">
                  +{grant.categories.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Location */}
          {grant.locations.length > 0 && grant.locations[0] !== 'National' && (
            <div className="flex items-center gap-1.5 text-xs text-pulse-text-tertiary mb-3">
              <MapPin className="w-3 h-3" />
              <span>{grant.locations.slice(0, 2).join(', ')}</span>
            </div>
          )}

          {/* Bottom Row - Amount & Deadline */}
          <div className="flex items-center justify-between pt-3 border-t border-pulse-border mt-auto">
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-pulse-accent" />
              <span className="text-sm font-medium text-pulse-text">{amountDisplay}</span>
            </div>
            {daysLeft !== null ? (
              <div className={`flex items-center gap-1.5 text-sm ${
                daysLeft <= 0 ? 'text-pulse-text-tertiary' :
                daysLeft <= 14 ? 'text-pulse-error' :
                daysLeft <= 30 ? 'text-pulse-warning' :
                'text-pulse-text-tertiary'
              }`}>
                <Clock className="w-4 h-4" />
                <span>
                  {daysLeft <= 0 ? 'Closed' : `${daysLeft} days left`}
                </span>
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

// Source Selector Component
function SourceSelector({
  sources,
  selectedSources,
  onToggle,
}: {
  sources: SourceInfo[]
  selectedSources: string[]
  onToggle: (name: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {sources.map((source) => {
        const isSelected = selectedSources.includes(source.name)
        const isDisabled = !source.isConfigured

        return (
          <button
            key={source.name}
            onClick={() => !isDisabled && onToggle(source.name)}
            disabled={isDisabled}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
              isDisabled
                ? 'bg-pulse-surface/50 text-pulse-text-tertiary cursor-not-allowed'
                : isSelected
                  ? 'bg-pulse-accent/20 text-pulse-accent border border-pulse-accent/30'
                  : 'bg-pulse-surface border border-pulse-border text-pulse-text-secondary hover:border-pulse-accent/30'
            }`}
            title={isDisabled ? `Requires ${source.requiresApiKey ? 'API key' : 'configuration'}` : source.description}
          >
            {isSelected && <CheckCircle2 className="w-4 h-4" />}
            <span>{source.label}</span>
            {source.type === 'state' && source.region && (
              <span className="text-xs opacity-70">({source.region})</span>
            )}
            {isDisabled && (
              <span className="text-xs text-pulse-warning">(Not configured)</span>
            )}
          </button>
        )
      })}
    </div>
  )
}

// AI Summary Bar Component
function AISummaryBar({
  total,
  loading,
  sourceCounts,
}: {
  total: number
  loading: boolean
  sourceCounts: Array<{ name: string; label: string; count: number; total: number; error?: string }>
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <GlassCard variant="accent" className="p-4 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-pulse-accent/20 border border-pulse-accent/30 flex items-center justify-center">
              {loading ? (
                <Loader2 className="w-4 h-4 text-pulse-accent animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-pulse-accent" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-pulse-text">
                {loading ? 'Searching grant databases...' : `Found ${total.toLocaleString()} opportunities`}
              </p>
              <p className="text-xs text-pulse-text-tertiary">
                {sourceCounts.length > 0
                  ? `From ${sourceCounts.filter(s => s.count > 0).length} sources`
                  : 'Live results from federal and state databases'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {sourceCounts.map((source) => (
              <Badge
                key={source.name}
                variant="outline"
                className={`text-xs ${source.error ? 'border-pulse-error/30 text-pulse-error' : ''}`}
              >
                {source.error ? (
                  <AlertCircle className="w-3 h-3 mr-1" />
                ) : (
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-1.5 animate-pulse" />
                )}
                {source.label}: {source.error ? 'Error' : source.count}
              </Badge>
            ))}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}

// Filter Panel Component
function FilterPanel({
  isOpen,
  onClose,
  onApply,
  filters,
  setFilters,
  sources,
  selectedSources,
  onToggleSource,
}: {
  isOpen: boolean
  onClose: () => void
  onApply: () => void
  filters: { agency: string; status: string; state: string }
  setFilters: (f: { agency: string; status: string; state: string }) => void
  sources: SourceInfo[]
  selectedSources: string[]
  onToggleSource: (name: string) => void
}) {
  const agencies = [
    { label: 'All Agencies', value: '' },
    { label: 'NSF', value: 'NSF' },
    { label: 'NIH', value: 'HHS' },
    { label: 'DOE', value: 'DOE' },
    { label: 'EPA', value: 'EPA' },
    { label: 'USDA', value: 'USDA' },
    { label: 'DOD', value: 'DOD' },
    { label: 'NASA', value: 'NASA' },
  ]

  const statuses = [
    { label: 'Open', value: 'open' },
    { label: 'Forecasted', value: 'forecasted' },
    { label: 'All', value: 'all' },
  ]

  const states = [
    { label: 'All States', value: '' },
    { label: 'California', value: 'CA' },
    { label: 'New York', value: 'NY' },
    { label: 'Texas', value: 'TX' },
    { label: 'Florida', value: 'FL' },
    { label: 'Illinois', value: 'IL' },
    { label: 'Pennsylvania', value: 'PA' },
    { label: 'Ohio', value: 'OH' },
    { label: 'Georgia', value: 'GA' },
    { label: 'North Carolina', value: 'NC' },
    { label: 'Michigan', value: 'MI' },
  ]

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
              <h3 className="text-sm font-semibold text-pulse-text">Filters & Sources</h3>
              <button onClick={onClose} className="p-1 rounded hover:bg-pulse-surface">
                <X className="w-4 h-4 text-pulse-text-tertiary" />
              </button>
            </div>

            {/* Source Selection */}
            <div className="mb-6">
              <label className="text-xs font-medium text-pulse-text-secondary uppercase tracking-wider mb-3 block">
                Data Sources
              </label>
              <SourceSelector
                sources={sources}
                selectedSources={selectedSources}
                onToggle={onToggleSource}
              />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Agency */}
              <div>
                <label className="text-xs font-medium text-pulse-text-secondary uppercase tracking-wider mb-3 block">
                  Agency
                </label>
                <select
                  value={filters.agency}
                  onChange={(e) => setFilters({ ...filters, agency: e.target.value })}
                  className="w-full bg-pulse-surface border border-pulse-border rounded-lg px-3 py-2 text-sm text-pulse-text focus:outline-none focus:border-pulse-accent"
                >
                  {agencies.map((a) => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                  ))}
                </select>
              </div>

              {/* State */}
              <div>
                <label className="text-xs font-medium text-pulse-text-secondary uppercase tracking-wider mb-3 block">
                  State
                </label>
                <select
                  value={filters.state}
                  onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                  className="w-full bg-pulse-surface border border-pulse-border rounded-lg px-3 py-2 text-sm text-pulse-text focus:outline-none focus:border-pulse-accent"
                >
                  {states.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div>
                <label className="text-xs font-medium text-pulse-text-secondary uppercase tracking-wider mb-3 block">
                  Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {statuses.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setFilters({ ...filters, status: s.value })}
                      className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                        filters.status === s.value
                          ? 'bg-pulse-accent text-pulse-bg'
                          : 'bg-pulse-surface border border-pulse-border text-pulse-text-secondary hover:border-pulse-accent/30'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-pulse-border">
              <Button variant="ghost" size="sm" onClick={() => {
                setFilters({ agency: '', status: 'open', state: '' })
              }}>
                Clear Filters
              </Button>
              <Button size="sm" onClick={onApply}>
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
  const [filters, setFilters] = useState({ agency: '', status: 'open', state: '' })
  const [grants, setGrants] = useState<Grant[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sources, setSources] = useState<SourceInfo[]>([])
  const [selectedSources, setSelectedSources] = useState<string[]>([])
  const [sourceCounts, setSourceCounts] = useState<Array<{ name: string; label: string; count: number; total: number; error?: string }>>([])
  const limit = 24

  // Fetch available sources
  useEffect(() => {
    async function fetchSources() {
      try {
        const response = await fetch('/api/grants/sources')
        if (response.ok) {
          const data = await response.json()
          setSources(data.sources || [])
          // Default to all configured sources
          setSelectedSources(data.configured || [])
        }
      } catch (err) {
        console.error('Failed to fetch sources:', err)
        // Fallback to just grants-gov
        setSelectedSources(['grants-gov'])
      }
    }
    fetchSources()
  }, [])

  // Toggle source selection
  const handleToggleSource = (name: string) => {
    setSelectedSources(prev =>
      prev.includes(name)
        ? prev.filter(s => s !== name)
        : [...prev, name]
    )
  }

  // Fetch grants from unified API
  const fetchGrants = useCallback(async (query?: string) => {
    if (selectedSources.length === 0) {
      setGrants([])
      setTotal(0)
      setSourceCounts([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (query) params.set('q', query)
      if (filters.agency) params.set('agency', filters.agency)
      if (filters.state) params.set('state', filters.state)
      params.set('status', filters.status)
      params.set('sources', selectedSources.join(','))
      params.set('limit', String(limit))

      const response = await fetch(`/api/grants/unified-search?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch grants')
      }

      const data = await response.json()
      setGrants(data.grants || [])
      setTotal(data.totalCount || 0)
      setSourceCounts(data.sources || [])
    } catch (err) {
      console.error('Error fetching grants:', err)
      setError('Unable to load grants. Please try again.')
      setGrants([])
      setTotal(0)
      setSourceCounts([])
    } finally {
      setLoading(false)
    }
  }, [filters.agency, filters.status, filters.state, selectedSources])

  // Initial load and when sources change
  useEffect(() => {
    if (selectedSources.length > 0) {
      fetchGrants(searchQuery)
    }
  }, [selectedSources]) // Only re-fetch when sources change

  // Handle search
  const handleSearch = () => {
    fetchGrants(searchQuery)
  }

  // Handle quick suggestion click
  const handleSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion)
    fetchGrants(suggestion)
  }

  // Handle filter apply
  const handleApplyFilters = () => {
    setShowFilters(false)
    fetchGrants(searchQuery)
  }

  return (
    <div className="p-8">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-end justify-between flex-wrap gap-4">
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
              Search real-time across federal, state, and foundation funding opportunities
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
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-pulse-text-tertiary" />
              <input
                type="text"
                placeholder="Search grants by keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-pulse-bg border border-pulse-border focus:border-pulse-accent focus:outline-none text-pulse-text placeholder:text-pulse-text-tertiary"
              />
            </div>
            <Button
              variant={showFilters ? 'default' : 'outline'}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
              {selectedSources.length > 0 && (
                <span className="ml-2 px-1.5 py-0.5 rounded-full bg-pulse-accent/20 text-xs">
                  {selectedSources.length}
                </span>
              )}
            </Button>
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              Search
            </Button>
          </div>

          {/* Quick Suggestions */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-pulse-border flex-wrap">
            <span className="text-xs text-pulse-text-tertiary">Popular:</span>
            {quickSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => handleSuggestion(suggestion)}
                className="px-3 py-1 rounded-full bg-pulse-surface border border-pulse-border text-xs text-pulse-text-secondary hover:border-pulse-accent/30 hover:text-pulse-text transition-all"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </GlassCard>
      </motion.div>

      {/* Filter Panel */}
      <FilterPanel
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={handleApplyFilters}
        filters={filters}
        setFilters={setFilters}
        sources={sources}
        selectedSources={selectedSources}
        onToggleSource={handleToggleSource}
      />

      {/* AI Summary Bar */}
      <AISummaryBar total={total} loading={loading} sourceCounts={sourceCounts} />

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6"
        >
          <GlassCard className="p-4 border-pulse-error/30">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-pulse-error" />
              <p className="text-sm text-pulse-error">{error}</p>
              <Button variant="ghost" size="sm" onClick={() => fetchGrants(searchQuery)}>
                <RefreshCw className="w-4 h-4 mr-1" />
                Retry
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* No Sources Selected */}
      {selectedSources.length === 0 && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 rounded-full bg-pulse-surface flex items-center justify-center mx-auto mb-4">
            <Globe className="w-8 h-8 text-pulse-text-tertiary" />
          </div>
          <h3 className="text-lg font-semibold text-pulse-text mb-2">No sources selected</h3>
          <p className="text-pulse-text-secondary mb-4">
            Select at least one data source to search for grants
          </p>
          <Button variant="outline" onClick={() => setShowFilters(true)}>
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Open Filters
          </Button>
        </motion.div>
      )}

      {/* Results Header */}
      {selectedSources.length > 0 && (
        <motion.div
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center gap-3">
            <span className="text-sm text-pulse-text">
              Showing <span className="font-semibold text-pulse-accent">{grants.length}</span>
              {total > grants.length && ` of ${total.toLocaleString()}`} opportunities
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchGrants(searchQuery)}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </motion.div>
      )}

      {/* Loading State */}
      {loading && grants.length === 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <GlassCard key={i} className="p-5 animate-pulse">
              <div className="h-4 bg-pulse-surface rounded w-1/3 mb-4" />
              <div className="h-6 bg-pulse-surface rounded w-full mb-2" />
              <div className="h-4 bg-pulse-surface rounded w-2/3 mb-4" />
              <div className="h-16 bg-pulse-surface rounded w-full mb-4" />
              <div className="h-4 bg-pulse-surface rounded w-1/2" />
            </GlassCard>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && grants.length === 0 && !error && selectedSources.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 rounded-full bg-pulse-surface flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-pulse-text-tertiary" />
          </div>
          <h3 className="text-lg font-semibold text-pulse-text mb-2">No grants found</h3>
          <p className="text-pulse-text-secondary mb-4">
            Try adjusting your search terms or filters
          </p>
          <Button variant="outline" onClick={() => {
            setSearchQuery('')
            setFilters({ agency: '', status: 'open', state: '' })
            fetchGrants()
          }}>
            Clear Search
          </Button>
        </motion.div>
      )}

      {/* Grant Grid */}
      {grants.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {grants.map((grant, index) => (
            <GrantCard key={grant.id} grant={grant} index={index} />
          ))}
        </div>
      )}

      {/* Load More */}
      {grants.length > 0 && grants.length < total && (
        <motion.div
          className="flex items-center justify-center mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            variant="outline"
            onClick={() => {
              fetchGrants(searchQuery)
            }}
          >
            Load More Grants
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </motion.div>
      )}
    </div>
  )
}
