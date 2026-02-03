'use client'

/**
 * DISCOVER PAGE - Multi-Source Grant Discovery
 * Searches across Grants.gov, SAM.gov, USAspending, California Grants, and more
 */

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GlassCard } from '@/components/ui/glass-card'
import { ProfileCompletenessBanner } from '@/components/grants/ProfileCompletenessBanner'
import { EligibilityBadge } from '@/components/grants/EligibilityTooltip'
import { DeadlineBadge } from '@/components/grants/DeadlineBadge'
import { SaveSearchModal } from '@/components/grants/SaveSearchModal'

// User profile data for completeness banner
interface UserProfileData {
  entityType?: string | null
  state?: string | null
  industryTags?: string[]
  sizeBand?: string | null
  annualBudget?: string | null
  confidenceScore?: number
  onboardingCompleted?: boolean
}

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

// AI Match result with actionable details
interface AIMatchResult {
  grantId: string
  score: number
  reasons: string[]
  eligibilityStatus?: 'eligible' | 'likely_eligible' | 'check_requirements' | 'not_eligible'
  nextSteps?: string[]
  whatYouCanFund?: string[]
  applicationTips?: string[]
  urgency?: 'high' | 'medium' | 'low'
  fitSummary?: string
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

// Quick search suggestions - capitalized and clean
const quickSuggestions = [
  { label: 'Agriculture', value: 'agriculture' },
  { label: 'Small Business', value: 'small business' },
  { label: 'Technology', value: 'technology' },
  { label: 'Climate', value: 'climate' },
  { label: 'Education', value: 'education' },
  { label: 'Health', value: 'health' },
  { label: 'Research', value: 'research' },
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
function GrantCard({
  grant,
  index,
  aiMatch,
}: {
  grant: Grant
  index: number
  aiMatch?: AIMatchResult
}) {
  const router = useRouter()
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

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Store the grant data in sessionStorage so the detail page can access it
    // This allows us to show details for both database grants AND live API grants
    const grantDataForDetail = {
      ...grant,
      // Include AI match data if available
      aiMatch: aiMatch ? {
        score: aiMatch.score,
        reasons: aiMatch.reasons,
        eligibilityStatus: aiMatch.eligibilityStatus,
        nextSteps: aiMatch.nextSteps,
        whatYouCanFund: aiMatch.whatYouCanFund,
        applicationTips: aiMatch.applicationTips,
        urgency: aiMatch.urgency,
        fitSummary: aiMatch.fitSummary,
      } : null,
    }

    try {
      sessionStorage.setItem(`grant_${grant.id}`, JSON.stringify(grantDataForDetail))
    } catch (err) {
      console.warn('Failed to cache grant data:', err)
    }

    // Always navigate to the internal detail page
    router.push(`/app/grants/${encodeURIComponent(grant.id)}`)
  }

  const amountDisplay = grant.amountText ||
    (grant.amountMin && grant.amountMax
      ? `${formatCurrency(grant.amountMin)} - ${formatCurrency(grant.amountMax)}`
      : grant.amountMax
        ? `Up to ${formatCurrency(grant.amountMax)}`
        : grant.amountMin
          ? `From ${formatCurrency(grant.amountMin)}`
          : 'Amount varies')

  // Get eligibility status styling
  const getEligibilityStyle = (status?: string) => {
    switch (status) {
      case 'eligible':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'likely_eligible':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'check_requirements':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'not_eligible':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-pulse-surface text-pulse-text-tertiary'
    }
  }

  const getEligibilityLabel = (status?: string) => {
    switch (status) {
      case 'eligible': return 'Eligible'
      case 'likely_eligible': return 'Likely Eligible'
      case 'check_requirements': return 'Check Requirements'
      case 'not_eligible': return 'Not Eligible'
      default: return 'Unknown'
    }
  }

  const getUrgencyStyle = (urgency?: string) => {
    switch (urgency) {
      case 'high': return 'text-red-400'
      case 'medium': return 'text-yellow-400'
      default: return 'text-pulse-text-tertiary'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <GlassCard
        className="p-5 transition-all cursor-pointer hover:border-pulse-accent/30 hover:shadow-pulse"
        onClick={handleCardClick}
      >
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
              {aiMatch && (
                <>
                  <Badge variant="default" className="text-xs bg-pulse-accent/20 text-pulse-accent border-pulse-accent/30">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {aiMatch.score}% match
                  </Badge>
                  {aiMatch.eligibilityStatus && (
                    <EligibilityBadge
                      status={aiMatch.eligibilityStatus}
                      size="sm"
                      showTooltip={true}
                    />
                  )}
                </>
              )}
              {/* Show deadline urgency badge for urgent grants */}
              {daysLeft !== null && daysLeft > 0 && daysLeft <= 14 && (
                <DeadlineBadge deadline={grant.deadlineDate} variant="badge" />
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
          <h3 className="text-heading text-pulse-text mb-1 group-hover:text-pulse-accent transition-colors line-clamp-2">
            {grant.title}
          </h3>
          <p className="text-body-sm text-pulse-text-tertiary flex items-center gap-1.5 mb-3">
            <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{grant.sponsor}</span>
          </p>

          {/* AI Fit Summary */}
          {aiMatch?.fitSummary && (
            <p className="text-body-sm text-pulse-accent mb-3 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 flex-shrink-0" />
              {aiMatch.fitSummary}
            </p>
          )}

          {/* Summary (only if no AI match) */}
          {!aiMatch && grant.summary && (
            <p className="text-body-sm text-pulse-text-secondary mb-4 line-clamp-2">
              {grant.summary}
            </p>
          )}

          {/* Categories */}
          {!aiMatch && grant.categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {grant.categories.slice(0, 3).map((cat, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-full bg-pulse-surface text-label-sm text-pulse-text-tertiary normal-case"
                >
                  {cat}
                </span>
              ))}
              {grant.categories.length > 3 && (
                <span className="px-2 py-0.5 rounded-full bg-pulse-surface text-label-sm text-pulse-text-tertiary normal-case">
                  +{grant.categories.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Location */}
          {grant.locations.length > 0 && grant.locations[0] !== 'National' && (
            <div className="flex items-center gap-1.5 text-label-sm text-pulse-text-tertiary normal-case mb-3">
              <MapPin className="w-3 h-3" />
              <span>{grant.locations.slice(0, 2).join(', ')}</span>
            </div>
          )}

          {/* Bottom Row - Amount & Deadline */}
          <div className="flex items-center justify-between pt-3 border-t border-pulse-border mt-auto">
            <div className="flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-pulse-accent" />
              <span className="text-body-sm font-medium text-pulse-text">{amountDisplay}</span>
            </div>
            {daysLeft !== null ? (
              <div className={`flex items-center gap-1.5 text-body-sm ${
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
              <span className="text-body-sm text-pulse-text-tertiary">Rolling deadline</span>
            )}
          </div>

          {/* Click for details hint */}
          <div className="mt-3 pt-3 border-t border-pulse-border text-center">
            <span className="text-xs text-pulse-text-tertiary flex items-center justify-center gap-1">
              <ExternalLink className="w-3 h-3" />
              Click to view details
            </span>
          </div>
      </GlassCard>
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

// All US states for filter dropdown
const US_STATES = [
  { value: '', label: 'All States (Federal Only)' },
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'DC', label: 'District of Columbia' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'PR', label: 'Puerto Rico' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'VI', label: 'Virgin Islands' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
]

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
  userState,
}: {
  isOpen: boolean
  onClose: () => void
  onApply: () => void
  filters: { agency: string; status: string; state: string }
  setFilters: (f: { agency: string; status: string; state: string }) => void
  sources: SourceInfo[]
  selectedSources: string[]
  onToggleSource: (name: string) => void
  userState?: string | null
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
                  Location
                  {userState && (
                    <span className="text-pulse-accent ml-1">(Your profile: {userState})</span>
                  )}
                </label>
                <select
                  value={filters.state}
                  onChange={(e) => setFilters({ ...filters, state: e.target.value })}
                  className="w-full bg-pulse-surface border border-pulse-border rounded-lg px-3 py-2 text-sm text-pulse-text focus:outline-none focus:border-pulse-accent"
                >
                  {US_STATES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}{userState && s.value === userState ? ' (Your State)' : ''}
                    </option>
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
  const [isAiMatching, setIsAiMatching] = useState(false)
  const [aiMatchResults, setAiMatchResults] = useState<AIMatchResult[] | null>(null)
  const [aiMatchError, setAiMatchError] = useState<string | null>(null)
  const [isProfileMode, setIsProfileMode] = useState(true) // Start in profile mode
  const [userState, setUserState] = useState<string | null>(null) // User's state from profile
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [hasProfile, setHasProfile] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null) // Full profile for completeness banner
  const [showSaveSearchModal, setShowSaveSearchModal] = useState(false) // Save search modal state
  const limit = 20 // Show top 20 most relevant

  // Fetch available sources, profile data, and auto-run AI match on load
  useEffect(() => {
    async function initialize() {
      try {
        // Fetch sources and profile in parallel
        const [sourcesResponse, profileResponse] = await Promise.all([
          fetch('/api/grants/sources'),
          fetch('/api/user/profile'),
        ])

        if (sourcesResponse.ok) {
          const data = await sourcesResponse.json()
          setSources(data.sources || [])
          setSelectedSources(data.configured || [])
        }

        if (profileResponse.ok) {
          const profileData = await profileResponse.json()
          if (profileData.profile) {
            setUserProfile({
              entityType: profileData.profile.entityType,
              state: profileData.profile.state,
              industryTags: profileData.profile.industryTags || [],
              sizeBand: profileData.profile.sizeBand,
              annualBudget: profileData.profile.annualBudget,
              confidenceScore: profileData.profile.confidenceScore,
              onboardingCompleted: profileData.profile.onboardingCompleted,
            })
            setUserState(profileData.profile.state)
            // Pre-fill state filter if user has a state
            if (profileData.profile.state) {
              setFilters(prev => ({ ...prev, state: profileData.profile.state }))
            }
          }
        }

        // Try to auto-load personalized grants
        await loadPersonalizedGrants()
      } catch (err) {
        console.error('Failed to initialize:', err)
        setSelectedSources(['grants-gov'])
        setLoading(false)
      } finally {
        setProfileLoaded(true)
      }
    }
    initialize()
  }, [])

  // Load personalized grants based on profile (auto-runs on page load)
  const loadPersonalizedGrants = async () => {
    setLoading(true)
    setError(null)
    setAiMatchError(null)

    try {
      // Try the new discover endpoint first
      const response = await fetch('/api/grants/discover?limit=' + limit)
      const data = await response.json()

      if (!response.ok) {
        if (data.profileComplete === false) {
          // No profile - show message and switch to browse mode
          setHasProfile(false)
          setIsProfileMode(false)
          setAiMatchError('Complete your profile to see personalized grants tailored to your organization.')
          // Fetch general grants instead
          await fetchGeneralGrants()
        } else {
          throw new Error(data.error || data.message || 'Failed to get matches')
        }
        return
      }

      setHasProfile(true)

      if (data.grants && data.grants.length > 0) {
        // Extract AI match results from the enriched grants
        const matchResults: AIMatchResult[] = data.grants.map((g: Grant & {
          fitScore?: number
          fitSummary?: string
          fitExplanation?: string
          eligibilityStatus?: string
          nextSteps?: string[]
          whatYouCanFund?: string[]
          applicationTips?: string[]
          urgency?: string
          matchReasons?: string[]
        }) => ({
          grantId: g.id,
          score: g.fitScore || 50,
          reasons: g.matchReasons || [],
          eligibilityStatus: g.eligibilityStatus,
          nextSteps: g.nextSteps,
          whatYouCanFund: g.whatYouCanFund,
          applicationTips: g.applicationTips,
          urgency: g.urgency,
          fitSummary: g.fitSummary || g.fitExplanation,
        }))

        setAiMatchResults(matchResults)
        setGrants(data.grants)
        setTotal(data.total || data.grants.length)
        setIsProfileMode(true)
      } else {
        setAiMatchError('No matching grants found. Try updating your focus areas in Settings or browse all grants.')
        await fetchGeneralGrants()
      }
    } catch (err) {
      console.error('Error loading personalized grants:', err)
      setAiMatchError(err instanceof Error ? err.message : 'Failed to load personalized grants')
      await fetchGeneralGrants()
    } finally {
      setLoading(false)
    }
  }

  // Fetch general grants (when not in profile mode or as fallback)
  const fetchGeneralGrants = async (query?: string) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (query) params.set('q', query)
      if (filters.agency) params.set('agency', filters.agency)
      if (filters.state) params.set('state', filters.state)
      params.set('status', filters.status)
      params.set('sources', selectedSources.length > 0 ? selectedSources.join(',') : 'grants-gov')
      params.set('limit', String(limit))
      params.set('useProfile', 'true') // Still apply profile filtering

      const response = await fetch(`/api/grants/unified-search?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch grants')
      }

      const data = await response.json()
      setGrants(data.grants || [])
      setTotal(data.totalCount || 0)
      setSourceCounts(data.sources || [])
      setAiMatchResults(null) // Clear AI results when doing general search
      setIsProfileMode(false)
    } catch (err) {
      console.error('Error fetching grants:', err)
      setError('Unable to load grants. Please try again.')
      setGrants([])
      setTotal(0)
      setSourceCounts([])
    } finally {
      setLoading(false)
    }
  }

  // Toggle source selection
  const handleToggleSource = (name: string) => {
    setSelectedSources(prev =>
      prev.includes(name)
        ? prev.filter(s => s !== name)
        : [...prev, name]
    )
  }

  // Legacy fetchGrants for compatibility
  const fetchGrants = useCallback(async (query?: string) => {
    await fetchGeneralGrants(query)
  }, [filters.agency, filters.status, filters.state, selectedSources])

  // Handle search - switches to browse mode
  const handleSearch = () => {
    setIsProfileMode(false)
    setAiMatchResults(null)
    fetchGeneralGrants(searchQuery)
  }

  // Handle quick suggestion click
  const handleSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion)
    setIsProfileMode(false)
    setAiMatchResults(null)
    fetchGeneralGrants(suggestion)
  }

  // Handle filter apply
  const handleApplyFilters = () => {
    setShowFilters(false)
    setIsProfileMode(false)
    setAiMatchResults(null)
    fetchGeneralGrants(searchQuery)
  }

  // Return to personalized "For You" mode
  const handleForYou = async () => {
    if (isAiMatching) return
    setIsAiMatching(true)
    setSearchQuery('')
    setAiMatchResults(null)
    setAiMatchError(null)

    try {
      await loadPersonalizedGrants()
    } finally {
      setIsAiMatching(false)
    }
  }

  // AI-powered grant matching (same as For You)
  const handleAiMatch = async () => {
    await handleForYou()
  }

  // Legacy handler kept for compatibility
  const _legacyAiMatch = async () => {
    if (isAiMatching) return
    setIsAiMatching(true)
    setAiMatchResults(null)
    setAiMatchError(null)

    try {
      const response = await fetch('/api/grants/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maxResults: limit,
          minScore: 30,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.profileComplete === false) {
          setAiMatchError('Complete your profile to get personalized grant matches. Go to Settings → Profile to set up your organization details.')
        } else {
          throw new Error(data.error || data.message || 'Failed to get AI matches')
        }
        return
      }

      if (data.matches && data.matches.length > 0) {
        const matchedGrants = data.matches
          .filter((m: { grant: Grant | null }) => m.grant)
          .map((m: { grant: Grant }) => m.grant)

        setAiMatchResults(data.matches.map((m: AIMatchResult & { grant?: Grant }) => ({
          grantId: m.grantId || m.grant?.id,
          score: m.score,
          reasons: m.reasons || [],
          eligibilityStatus: m.eligibilityStatus,
          nextSteps: m.nextSteps,
          whatYouCanFund: m.whatYouCanFund,
          applicationTips: m.applicationTips,
          urgency: m.urgency,
          fitSummary: m.fitSummary,
        })))

        setGrants(matchedGrants)
        setTotal(matchedGrants.length)
        setIsProfileMode(true)
      } else {
        setAiMatchError('No matching grants found for your profile. Try updating your focus areas in Settings.')
      }
    } catch (err) {
      console.error('AI match error:', err)
      setAiMatchError(err instanceof Error ? err.message : 'AI matching failed')
    } finally {
      setIsAiMatching(false)
    }
  }

  // Clear AI match results
  const clearAiMatch = () => {
    setAiMatchResults(null)
    setAiMatchError(null)
    fetchGrants(searchQuery)
  }

  return (
    <div className="p-8">
      {/* Profile Completeness Banner */}
      {profileLoaded && userProfile && (
        <ProfileCompletenessBanner
          profile={userProfile}
          onDismiss={() => {}}
        />
      )}

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
              <span className="text-label text-pulse-text-tertiary">
                Grant Discovery
              </span>
            </div>
            <h1 className="text-display-page text-pulse-text">
              {isProfileMode ? 'Grants For You' : 'Browse All Grants'}
            </h1>
            <p className="text-body text-pulse-text-secondary mt-2">
              {isProfileMode
                ? 'Top grants matched to your profile and focus areas'
                : 'Search real-time across federal, state, and foundation funding opportunities'
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Mode Toggle */}
            <div className="flex items-center bg-pulse-surface rounded-lg p-1 border border-pulse-border">
              <button
                onClick={handleForYou}
                disabled={isAiMatching || loading}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                  isProfileMode
                    ? 'bg-pulse-accent text-pulse-bg'
                    : 'text-pulse-text-secondary hover:text-pulse-text'
                }`}
              >
                {(isAiMatching || (loading && isProfileMode)) ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                For You
              </button>
              <button
                onClick={() => {
                  setIsProfileMode(false)
                  setAiMatchResults(null)
                  setSearchQuery('')
                  fetchGeneralGrants()
                }}
                disabled={loading}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                  !isProfileMode
                    ? 'bg-pulse-accent text-pulse-bg'
                    : 'text-pulse-text-secondary hover:text-pulse-text'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                Browse All
              </button>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/app/saved">
                <Bookmark className="w-4 h-4 mr-2" />
                Saved
              </Link>
            </Button>
          </div>
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
            {/* Save Search Button */}
            {(searchQuery || filters.agency || filters.state) && (
              <Button
                variant="outline"
                onClick={() => setShowSaveSearchModal(true)}
              >
                <Bookmark className="w-4 h-4 mr-2" />
                Save
              </Button>
            )}
          </div>

          {/* Quick Suggestions */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-pulse-border flex-wrap">
            <span className="text-xs text-pulse-text-tertiary">Popular:</span>
            {quickSuggestions.map((suggestion) => (
              <button
                key={suggestion.value}
                onClick={() => handleSuggestion(suggestion.value)}
                className="px-3 py-1 rounded-full bg-pulse-surface border border-pulse-border text-xs text-pulse-text-secondary hover:border-pulse-accent/30 hover:text-pulse-text transition-all capitalize"
              >
                {suggestion.label}
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
        userState={userState}
      />

      {/* Summary Bar */}
      {isProfileMode && aiMatchResults && aiMatchResults.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <GlassCard variant="accent" className="p-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-pulse-accent/20 border border-pulse-accent/30 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-pulse-accent" />
                </div>
                <div>
                  <p className="text-sm font-medium text-pulse-text">
                    Your Top {aiMatchResults.length} Matched Grants
                  </p>
                  <p className="text-xs text-pulse-text-tertiary">
                    Based on your profile • Click any card to see details and next steps
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => {
                setIsProfileMode(false)
                setAiMatchResults(null)
                fetchGeneralGrants()
              }}>
                Browse All Grants
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      ) : (
        <AISummaryBar total={total} loading={loading} sourceCounts={sourceCounts} />
      )}

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
      {(selectedSources.length > 0 || isProfileMode) && grants.length > 0 && (
        <motion.div
          className="flex items-center justify-between mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center gap-3">
            {isProfileMode && aiMatchResults ? (
              <span className="text-sm text-pulse-text">
                <span className="font-semibold text-pulse-accent">{grants.length}</span> grants matched to your profile
              </span>
            ) : (
              <span className="text-sm text-pulse-text">
                Showing <span className="font-semibold text-pulse-accent">{grants.length}</span>
                {total > grants.length && ` of ${total.toLocaleString()}`} opportunities
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => isProfileMode ? loadPersonalizedGrants() : fetchGrants(searchQuery)}
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

      {/* AI Match Error Banner */}
      {aiMatchError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <GlassCard className="p-4 border-yellow-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-pulse-text">Profile Setup Needed</p>
                  <p className="text-xs text-pulse-text-secondary">
                    {aiMatchError}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="default" size="sm" asChild>
                  <Link href="/app/settings">
                    Complete Profile
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setAiMatchError(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      )}


      {/* Grant Grid */}
      {grants.length > 0 && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {grants.map((grant, index) => {
            const aiMatch = aiMatchResults?.find(m => m.grantId === grant.id)
            return (
              <GrantCard
                key={grant.id}
                grant={grant}
                index={index}
                aiMatch={aiMatch}
              />
            )
          })}
        </div>
      )}

      {/* Load More - Only show in browse mode when there are more results */}
      {!isProfileMode && grants.length > 0 && grants.length < total && (
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

      {/* Save Search Modal */}
      <SaveSearchModal
        isOpen={showSaveSearchModal}
        onClose={() => setShowSaveSearchModal(false)}
        currentQuery={searchQuery}
        currentFilters={{
          agency: filters.agency,
          status: filters.status,
          state: filters.state,
          sources: selectedSources,
        }}
        onSaved={() => {
          // Could show a toast or update UI
        }}
      />
    </div>
  )
}
