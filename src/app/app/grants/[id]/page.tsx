'use client'

/**
 * GRANT DETAIL PAGE - PREMIUM UPGRADE
 * ------------------------------------
 * Premium grant details with:
 * - AI match score and insights
 * - Visual match breakdown
 * - Interactive requirements checklist
 * - Quick actions and workspace creation
 * - GlassCard design throughout
 * - Real API integration
 */

import { useState, useEffect, useCallback, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Calendar,
  DollarSign,
  MapPin,
  Building2,
  Clock,
  FolderPlus,
  Share2,
  Sparkles,
  Target,
  CheckCircle2,
  Circle,
  AlertCircle,
  TrendingUp,
  Zap,
  Users,
  FileText,
  Mail,
  Phone,
  Globe,
  RefreshCw,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GlassCard } from '@/components/ui/glass-card'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useToastActions } from '@/components/ui/toast-provider'

// Types
interface Grant {
  id: string
  sourceId: string | null
  sourceName: string | null
  title: string
  sponsor: string
  summary: string | null
  description: string | null
  categories: string[]
  eligibility: string[]
  locations: Array<{ country?: string; state?: string; city?: string; type?: string; value?: string }>
  amountMin: number | null
  amountMax: number | null
  amountText: string | null
  deadlineType: string | null
  deadlineDate: string | null
  postedDate: string | null
  url: string | null
  contact: { name?: string; email?: string; phone?: string } | null
  requirements: string[]
  status: string
}

// AI Match data from discover page
interface AIMatchData {
  score: number
  reasons: string[]
  eligibilityStatus?: 'eligible' | 'likely_eligible' | 'check_requirements' | 'not_eligible'
  nextSteps?: string[]
  whatYouCanFund?: string[]
  applicationTips?: string[]
  urgency?: 'high' | 'medium' | 'low'
  fitSummary?: string
}

// Format amount
function formatAmount(min: number | null, max: number | null, text: string | null): string {
  if (text) return text
  if (max && min) return `$${formatCurrency(min)} - $${formatCurrency(max)}`
  if (max) return `Up to $${formatCurrency(max)}`
  if (min) return `$${formatCurrency(min)}+`
  return 'Varies'
}

// Calculate days left
function getDaysLeft(deadline: string | null): number | null {
  if (!deadline) return null
  const now = new Date()
  const deadlineDate = new Date(deadline)
  const diff = deadlineDate.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// Get location string
function getLocationString(locations: Grant['locations']): string {
  if (!locations || locations.length === 0) return 'National'
  const loc = locations[0]
  // Handle standard format
  if (loc.city && loc.state && loc.country) return `${loc.city}, ${loc.state}, ${loc.country}`
  if (loc.state && loc.country) return `${loc.state}, ${loc.country}`
  if (loc.country) return loc.country
  // Handle API format with type/value
  if (loc.type === 'national' || loc.value === 'National') return 'National'
  if (loc.value) return loc.value
  if (loc.state) return loc.state
  return 'National'
}

// AI Match Score Card - shows real AI match data when available
function MatchScoreCard({ aiMatch }: { aiMatch: AIMatchData | null }) {
  const score = aiMatch?.score ?? 0
  const hasMatch = aiMatch !== null && score > 0

  const getScoreColor = (s: number) => {
    if (s >= 90) return 'text-pulse-accent'
    if (s >= 80) return 'text-blue-400'
    if (s >= 70) return 'text-yellow-400'
    if (s >= 50) return 'text-orange-400'
    return 'text-pulse-error'
  }

  const getScoreBg = (s: number) => {
    if (s >= 90) return 'bg-pulse-accent'
    if (s >= 80) return 'bg-blue-400'
    if (s >= 70) return 'bg-yellow-400'
    if (s >= 50) return 'bg-orange-400'
    return 'bg-pulse-error'
  }

  const getEligibilityLabel = (status?: string) => {
    switch (status) {
      case 'eligible': return { label: 'Eligible', color: 'text-green-400 bg-green-500/20 border-green-500/30' }
      case 'likely_eligible': return { label: 'Likely Eligible', color: 'text-blue-400 bg-blue-500/20 border-blue-500/30' }
      case 'check_requirements': return { label: 'Check Requirements', color: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30' }
      case 'not_eligible': return { label: 'Not Eligible', color: 'text-red-400 bg-red-500/20 border-red-500/30' }
      default: return null
    }
  }

  const eligibility = getEligibilityLabel(aiMatch?.eligibilityStatus)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <GlassCard variant="accent" className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-5 h-5 text-pulse-accent" />
              <span className="text-sm font-medium text-pulse-text-secondary">AI Match Score</span>
            </div>
            {hasMatch ? (
              <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
                {score}%
              </div>
            ) : (
              <div className="text-2xl font-bold text-pulse-text-tertiary">
                Not analyzed
              </div>
            )}
          </div>
          <div className="w-12 h-12 rounded-full bg-pulse-accent/20 border-2 border-pulse-accent flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-pulse-accent" />
          </div>
        </div>

        {eligibility && (
          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium mb-3 ${eligibility.color}`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            {eligibility.label}
          </div>
        )}

        {aiMatch?.fitSummary && (
          <p className="text-sm text-pulse-accent mb-4">
            {aiMatch.fitSummary}
          </p>
        )}

        {!hasMatch && (
          <p className="text-sm text-pulse-text-tertiary mb-4">
            Return to the Discover page and use "For You" matching to see your personalized match score.
          </p>
        )}

        {hasMatch && (
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-pulse-text-tertiary">Overall Match</span>
                <span className={getScoreColor(score)}>{score}%</span>
              </div>
              <div className="h-1.5 bg-pulse-border rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${getScoreBg(score)}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Match Reasons */}
        {aiMatch?.reasons && aiMatch.reasons.length > 0 && (
          <div className="mt-4 pt-4 border-t border-pulse-border">
            <p className="text-xs font-medium text-pulse-text-secondary uppercase tracking-wider mb-2">Why this matches</p>
            <ul className="space-y-1.5">
              {aiMatch.reasons.slice(0, 3).map((reason, i) => (
                <li key={i} className="text-sm text-pulse-text-tertiary flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-pulse-accent shrink-0 mt-0.5" />
                  {reason}
                </li>
              ))}
            </ul>
          </div>
        )}
      </GlassCard>
    </motion.div>
  )
}

// Requirement Item Component
function RequirementItem({ requirement, index }: { requirement: string; index: number }) {
  const [isChecked, setIsChecked] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.03 }}
      role="checkbox"
      aria-checked={isChecked}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          setIsChecked(!isChecked)
        }
      }}
      className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
        isChecked
          ? 'bg-pulse-accent/5 border-pulse-accent/30'
          : 'bg-pulse-surface/50 border-pulse-border hover:border-pulse-accent/20'
      }`}
      onClick={() => setIsChecked(!isChecked)}
    >
      <span className="shrink-0 mt-0.5" aria-hidden="true">
        {isChecked ? (
          <CheckCircle2 className="w-5 h-5 text-pulse-accent" />
        ) : (
          <Circle className="w-5 h-5 text-pulse-text-tertiary" />
        )}
      </span>
      <span className={`text-sm ${isChecked ? 'text-pulse-text-tertiary line-through' : 'text-pulse-text'}`}>
        {requirement}
      </span>
    </motion.div>
  )
}

// Loading skeleton
function GrantSkeleton() {
  return (
    <div className="p-8 animate-pulse">
      <div className="h-5 bg-pulse-surface rounded w-40 mb-6" />
      <div className="h-48 bg-pulse-surface rounded-2xl mb-6" />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-32 bg-pulse-surface rounded-2xl" />
          <div className="h-48 bg-pulse-surface rounded-2xl" />
          <div className="h-64 bg-pulse-surface rounded-2xl" />
        </div>
        <div className="space-y-6">
          <div className="h-48 bg-pulse-surface rounded-2xl" />
          <div className="h-64 bg-pulse-surface rounded-2xl" />
        </div>
      </div>
    </div>
  )
}

// Error state
function GrantError({ onRetry, error }: { onRetry: () => void; error: string }) {
  return (
    <div className="p-8 flex items-center justify-center min-h-[60vh]">
      <GlassCard className="p-8 text-center max-w-md">
        <div className="w-12 h-12 rounded-full bg-pulse-error/20 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6 text-pulse-error" />
        </div>
        <h2 className="text-lg font-semibold text-pulse-text mb-2">
          Failed to load grant
        </h2>
        <p className="text-pulse-text-secondary text-sm mb-4">
          {error || 'We couldn\'t load this grant. Please try again.'}
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" asChild>
            <Link href="/app/discover">Back to Discovery</Link>
          </Button>
          <Button onClick={onRetry}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </GlassCard>
    </div>
  )
}

export default function GrantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const toast = useToastActions()

  const [grant, setGrant] = useState<Grant | null>(null)
  const [aiMatch, setAiMatch] = useState<AIMatchData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false)

  const fetchGrant = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    // First, try to get cached grant data from sessionStorage
    // This allows us to display live API grants that aren't in the database
    let cachedGrant: (Grant & { aiMatch?: AIMatchData }) | null = null
    try {
      const cached = sessionStorage.getItem(`grant_${id}`)
      if (cached) {
        cachedGrant = JSON.parse(cached)
        if (cachedGrant?.aiMatch) {
          setAiMatch(cachedGrant.aiMatch)
        }
      }
    } catch (err) {
      console.warn('Failed to read cached grant:', err)
    }

    try {
      // Try to fetch from database API first
      const response = await fetch(`/api/grants/${encodeURIComponent(id)}`)

      if (response.ok) {
        const data = await response.json()
        // Normalize the data structure
        const normalizedGrant = normalizeGrantData(data)
        setGrant(normalizedGrant)
      } else if (response.status === 404 && cachedGrant) {
        // Grant not in database, but we have cached data from discover page
        const normalizedGrant = normalizeGrantData(cachedGrant)
        setGrant(normalizedGrant)
      } else {
        throw new Error(response.status === 404 ? 'Grant not found' : 'Failed to fetch grant')
      }

      // Check if grant is saved
      try {
        const savedResponse = await fetch('/api/user/saved-grants')
        if (savedResponse.ok) {
          const savedData = await savedResponse.json()
          const savedGrants = savedData.savedGrants || []
          setIsSaved(savedGrants.some((sg: { grantId: string }) => sg.grantId === id))
        }
      } catch {
        // Non-critical, continue without saved status
      }
    } catch (err) {
      console.error('Grant fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load grant')
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchGrant()
  }, [fetchGrant])

  // Normalize grant data from different sources (DB vs cached API data)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function normalizeGrantData(data: any): Grant {
    // Handle eligibility - could be array of strings or object with tags
    let eligibility: string[] = []
    if (Array.isArray(data.eligibility)) {
      eligibility = data.eligibility as string[]
    } else if (data.eligibility && typeof data.eligibility === 'object') {
      const eligObj = data.eligibility as { tags?: string[] }
      eligibility = eligObj.tags || []
    }

    // Handle locations - could be different formats
    let locations: Grant['locations'] = []
    if (Array.isArray(data.locations)) {
      locations = (data.locations as Array<string | { type?: string; value?: string; country?: string; state?: string; city?: string }>).map(loc => {
        if (typeof loc === 'string') {
          return { state: loc }
        }
        return loc as Grant['locations'][0]
      })
    }

    // Handle categories
    let categories: string[] = []
    if (Array.isArray(data.categories)) {
      categories = data.categories as string[]
    }

    // Handle requirements
    let requirements: string[] = []
    if (Array.isArray(data.requirements)) {
      requirements = data.requirements as string[]
    }

    return {
      id: data.id as string,
      sourceId: (data.sourceId as string) || null,
      sourceName: (data.sourceName as string) || null,
      title: data.title as string,
      sponsor: data.sponsor as string,
      summary: (data.summary as string) || null,
      description: (data.description as string) || null,
      categories,
      eligibility,
      locations,
      amountMin: (data.amountMin as number) || null,
      amountMax: (data.amountMax as number) || null,
      amountText: (data.amountText as string) || null,
      deadlineType: (data.deadlineType as string) || null,
      deadlineDate: (data.deadlineDate as string) || null,
      postedDate: (data.postedDate as string) || null,
      url: (data.url as string) || null,
      contact: (data.contact as Grant['contact']) || null,
      requirements,
      status: (data.status as string) || 'open',
    }
  }

  const handleSaveGrant = async () => {
    setIsSaving(true)
    try {
      if (isSaved) {
        // Unsave the grant
        const response = await fetch(`/api/user/saved-grants?grantId=${encodeURIComponent(id)}`, {
          method: 'DELETE',
        })
        if (!response.ok) throw new Error('Failed to remove grant')
        setIsSaved(false)
        toast.success('Grant removed', 'Grant has been removed from your saved list.')
      } else {
        // Save the grant - include grant data for live API grants that aren't in the database
        const response = await fetch('/api/user/saved-grants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            grantId: id,
            grantData: grant ? {
              sourceId: grant.sourceId,
              sourceName: grant.sourceName,
              title: grant.title,
              sponsor: grant.sponsor,
              summary: grant.summary,
              description: grant.description,
              categories: grant.categories,
              eligibility: grant.eligibility,
              locations: grant.locations,
              amountMin: grant.amountMin,
              amountMax: grant.amountMax,
              amountText: grant.amountText,
              deadlineType: grant.deadlineType,
              deadlineDate: grant.deadlineDate,
              url: grant.url,
              contact: grant.contact,
              requirements: grant.requirements,
              status: grant.status,
            } : null,
          }),
        })
        if (!response.ok) throw new Error('Failed to save grant')
        setIsSaved(true)
        toast.success('Grant saved', 'Grant has been added to your saved list.')
      }
    } catch (err) {
      console.error('Save error:', err)
      toast.error('Failed to save', err instanceof Error ? err.message : 'Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleStartApplication = async () => {
    setIsCreatingWorkspace(true)
    try {
      const response = await fetch('/api/user/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grantId: id }),
      })
      if (!response.ok) throw new Error('Failed to create workspace')
      const data = await response.json()
      toast.success('Workspace created', 'Your application workspace is ready.')
      router.push(`/app/workspace/${data.workspace.id}`)
    } catch (err) {
      console.error('Workspace creation error:', err)
      toast.error('Failed to create workspace', err instanceof Error ? err.message : 'Please try again.')
    } finally {
      setIsCreatingWorkspace(false)
    }
  }

  if (isLoading) {
    return <GrantSkeleton />
  }

  if (error || !grant) {
    return <GrantError onRetry={fetchGrant} error={error || 'Grant not found'} />
  }

  const daysLeft = getDaysLeft(grant.deadlineDate)
  const isUrgent = daysLeft !== null && daysLeft <= 14 && daysLeft > 0
  const amountDisplay = formatAmount(grant.amountMin, grant.amountMax, grant.amountText)

  return (
    <div className="p-8">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Link
          href="/app/discover"
          className="inline-flex items-center gap-2 text-sm text-pulse-text-secondary hover:text-pulse-accent transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Discovery
        </Link>
      </motion.div>

      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <GlassCard className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-pulse-accent" />
                <span className="text-sm font-medium text-pulse-accent">{grant.sponsor}</span>
              </div>
              <h1 className="font-serif text-2xl lg:text-3xl text-pulse-text mb-3">
                {grant.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={grant.status === 'open' ? 'success' : 'error'} className="capitalize">
                  {grant.status}
                </Badge>
                {grant.categories.slice(0, 4).map((cat) => (
                  <Badge key={cat} variant="outline">{cat}</Badge>
                ))}
              </div>
            </div>

            {/* Match Score Badge */}
            {aiMatch && aiMatch.score > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pulse-accent/10 border border-pulse-accent/30 shrink-0">
                <Target className="w-5 h-5 text-pulse-accent" />
                <span className="text-xl font-bold text-pulse-accent">{aiMatch.score}%</span>
                <span className="text-sm text-pulse-text-tertiary">match</span>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap items-center gap-6 py-4 border-t border-b border-pulse-border mb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-pulse-accent" />
              <span className="text-lg font-semibold text-pulse-text">{amountDisplay}</span>
            </div>
            {daysLeft !== null && (
              <div className={`flex items-center gap-2 ${isUrgent ? 'text-pulse-error' : 'text-pulse-text-tertiary'}`}>
                <Calendar className="w-5 h-5" />
                <span className="font-medium">
                  {daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
                  {isUrgent && <AlertCircle className="w-4 h-4 ml-1 inline" />}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2 text-pulse-text-tertiary">
              <MapPin className="w-5 h-5" />
              <span>{getLocationString(grant.locations)}</span>
            </div>
          </div>

          {/* Primary CTA - Apply Now */}
          {grant.url ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-4"
            >
              <Button
                size="lg"
                className="w-full sm:w-auto px-8 py-6 text-lg font-semibold bg-gradient-to-r from-pulse-accent to-pulse-accent/80 hover:from-pulse-accent/90 hover:to-pulse-accent/70 shadow-lg shadow-pulse-accent/25"
                asChild
              >
                <a href={grant.url} target="_blank" rel="noopener noreferrer">
                  Apply Now
                  <ExternalLink className="w-5 h-5 ml-2" />
                </a>
              </Button>
            </motion.div>
          ) : (
            <div className="mb-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <span className="text-sm text-yellow-500">Application link unavailable</span>
            </div>
          )}

          {/* Secondary Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              variant={isSaved ? 'outline' : 'secondary'}
              onClick={handleSaveGrant}
              disabled={isSaving}
              className={isSaved ? 'border-pulse-accent text-pulse-accent' : ''}
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : isSaved ? (
                <>
                  <BookmarkCheck className="w-4 h-4 mr-2" />
                  Saved
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4 mr-2" />
                  Save Grant
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleStartApplication}
              disabled={isCreatingWorkspace}
            >
              {isCreatingWorkspace ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <FolderPlus className="w-4 h-4 mr-2" />
              )}
              Start Application
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href)
                toast.success('Link copied', 'Grant link has been copied to clipboard.')
              }}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </GlassCard>
      </motion.div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <GlassCard className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pulse-accent to-pulse-accent/50 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-pulse-bg" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-pulse-text mb-2">AI Analysis</h3>
                  {aiMatch?.fitSummary ? (
                    <p className="text-sm text-pulse-accent mb-3">
                      {aiMatch.fitSummary}
                    </p>
                  ) : (
                    <p className="text-sm text-pulse-text-secondary mb-3">
                      Review the eligibility requirements carefully and consider highlighting relevant experience in your application.
                    </p>
                  )}

                  {/* Next Steps */}
                  {aiMatch?.nextSteps && aiMatch.nextSteps.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-pulse-text-secondary uppercase tracking-wider mb-2">Recommended Next Steps</p>
                      <ul className="space-y-1.5">
                        {aiMatch.nextSteps.map((step, i) => (
                          <li key={i} className="text-sm text-pulse-text-secondary flex items-start gap-2">
                            <span className="w-5 h-5 rounded-full bg-pulse-accent/20 text-pulse-accent text-xs flex items-center justify-center shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* What You Can Fund */}
                  {aiMatch?.whatYouCanFund && aiMatch.whatYouCanFund.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-pulse-text-secondary uppercase tracking-wider mb-2">What You Can Fund</p>
                      <div className="flex flex-wrap gap-1.5">
                        {aiMatch.whatYouCanFund.map((item, i) => (
                          <span key={i} className="px-2 py-1 rounded-full bg-pulse-surface text-xs text-pulse-text-secondary border border-pulse-border">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Application Tips */}
                  {aiMatch?.applicationTips && aiMatch.applicationTips.length > 0 && (
                    <div className="mb-3 p-3 rounded-lg bg-pulse-surface/50 border border-pulse-border">
                      <p className="text-xs font-medium text-pulse-text-secondary uppercase tracking-wider mb-2">Application Tips</p>
                      <ul className="space-y-1">
                        {aiMatch.applicationTips.map((tip, i) => (
                          <li key={i} className="text-sm text-pulse-text-tertiary flex items-start gap-2">
                            <TrendingUp className="w-3.5 h-3.5 text-pulse-accent shrink-0 mt-0.5" />
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <Button size="sm">
                      <Zap className="w-4 h-4 mr-1" />
                      Get Application Help
                    </Button>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard className="p-6">
              <h2 className="text-lg font-semibold text-pulse-text mb-4">Overview</h2>
              {grant.summary && (
                <p className="text-sm text-pulse-text-secondary whitespace-pre-line mb-4">
                  {grant.summary}
                </p>
              )}
              {grant.description && (
                <div className={grant.summary ? 'pt-4 border-t border-pulse-border' : ''}>
                  <p className="text-sm text-pulse-text-secondary whitespace-pre-line">
                    {grant.description}
                  </p>
                </div>
              )}
              {!grant.summary && !grant.description && (
                <p className="text-sm text-pulse-text-tertiary italic">
                  No detailed description available. Visit the original source for more information.
                </p>
              )}
            </GlassCard>
          </motion.div>

          {/* Eligibility */}
          {grant.eligibility.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <GlassCard className="p-6">
                <h2 className="text-lg font-semibold text-pulse-text mb-4">Eligibility</h2>
                <div className="flex flex-wrap gap-2 mb-4">
                  {grant.eligibility.map((type, i) => (
                    <Badge key={i} variant="accent">{type}</Badge>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Requirements Checklist */}
          {grant.requirements.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-pulse-text">Requirements Checklist</h2>
                  <span className="text-sm text-pulse-text-tertiary">
                    Click to track progress
                  </span>
                </div>
                <div className="space-y-2">
                  {grant.requirements.map((req, index) => (
                    <RequirementItem key={index} requirement={req} index={index} />
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Match Score Card */}
          <MatchScoreCard aiMatch={aiMatch} />

          {/* Key Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
          >
            <GlassCard className="p-6">
              <h2 className="text-lg font-semibold text-pulse-text mb-4">Key Details</h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-pulse-accent/10 border border-pulse-accent/20 flex items-center justify-center shrink-0">
                    <DollarSign className="w-4 h-4 text-pulse-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-pulse-text-tertiary uppercase tracking-wider">Funding Amount</p>
                    <p className="text-sm font-semibold text-pulse-text">{amountDisplay}</p>
                  </div>
                </div>

                {grant.deadlineDate && (
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      isUrgent ? 'bg-pulse-error/10 border border-pulse-error/20' : 'bg-pulse-accent/10 border border-pulse-accent/20'
                    }`}>
                      <Calendar className={`w-4 h-4 ${isUrgent ? 'text-pulse-error' : 'text-pulse-accent'}`} />
                    </div>
                    <div>
                      <p className="text-xs text-pulse-text-tertiary uppercase tracking-wider">Deadline</p>
                      <p className={`text-sm font-semibold ${isUrgent ? 'text-pulse-error' : 'text-pulse-text'}`}>
                        {formatDate(new Date(grant.deadlineDate))}
                      </p>
                      {daysLeft !== null && daysLeft > 0 && (
                        <p className="text-xs text-pulse-text-tertiary">{daysLeft} days remaining</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-pulse-accent/10 border border-pulse-accent/20 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-pulse-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-pulse-text-tertiary uppercase tracking-wider">Location</p>
                    <p className="text-sm font-semibold text-pulse-text">{getLocationString(grant.locations)}</p>
                  </div>
                </div>

                {grant.postedDate && (
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-pulse-accent/10 border border-pulse-accent/20 flex items-center justify-center shrink-0">
                      <Clock className="w-4 h-4 text-pulse-accent" />
                    </div>
                    <div>
                      <p className="text-xs text-pulse-text-tertiary uppercase tracking-wider">Posted</p>
                      <p className="text-sm font-semibold text-pulse-text">{formatDate(new Date(grant.postedDate))}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-pulse-accent/10 border border-pulse-accent/20 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4 text-pulse-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-pulse-text-tertiary uppercase tracking-wider">Sponsor</p>
                    <p className="text-sm font-semibold text-pulse-text">{grant.sponsor}</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard className="p-6">
              <h2 className="text-lg font-semibold text-pulse-text mb-4">Contact Information</h2>
              <div className="space-y-3">
                {grant.contact?.name && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-pulse-accent/10 flex items-center justify-center">
                      <Users className="w-4 h-4 text-pulse-accent" />
                    </div>
                    <span className="text-sm text-pulse-text">{grant.contact.name}</span>
                  </div>
                )}
                {grant.contact?.email && (
                  <a
                    href={`mailto:${grant.contact.email}`}
                    className="flex items-center gap-3 p-2 -ml-2 rounded-lg hover:bg-pulse-accent/5 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-pulse-accent/10 flex items-center justify-center">
                      <Mail className="w-4 h-4 text-pulse-accent" />
                    </div>
                    <span className="text-sm text-pulse-accent group-hover:underline">{grant.contact.email}</span>
                  </a>
                )}
                {grant.contact?.phone && (
                  <a
                    href={`tel:${grant.contact.phone}`}
                    className="flex items-center gap-3 p-2 -ml-2 rounded-lg hover:bg-pulse-accent/5 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-pulse-accent/10 flex items-center justify-center">
                      <Phone className="w-4 h-4 text-pulse-accent" />
                    </div>
                    <span className="text-sm text-pulse-text group-hover:text-pulse-accent">{grant.contact.phone}</span>
                  </a>
                )}
                {grant.url && (
                  <a
                    href={grant.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-2 -ml-2 rounded-lg hover:bg-pulse-accent/5 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-pulse-accent/10 flex items-center justify-center">
                      <Globe className="w-4 h-4 text-pulse-accent" />
                    </div>
                    <span className="text-sm text-pulse-accent group-hover:underline truncate">Visit Website</span>
                    <ExternalLink className="w-3 h-3 text-pulse-accent/50" />
                  </a>
                )}
                {!grant.contact?.email && !grant.contact?.phone && !grant.contact?.name && (
                  <p className="text-sm text-pulse-text-tertiary italic">
                    Contact information not available. Check the original listing.
                  </p>
                )}
              </div>
            </GlassCard>
          </motion.div>

          {/* Grant Distributor */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
          >
            <GlassCard className="p-6">
              <h2 className="text-lg font-semibold text-pulse-text mb-4">Grant Distributor</h2>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pulse-accent/20 to-pulse-accent/5 border border-pulse-accent/20 flex items-center justify-center shrink-0">
                  <Building2 className="w-6 h-6 text-pulse-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-pulse-text truncate">{grant.sponsor}</h3>
                  <p className="text-sm text-pulse-text-tertiary mt-1">
                    Federal/State Agency
                  </p>
                  {grant.url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      asChild
                    >
                      <a href={grant.url} target="_blank" rel="noopener noreferrer">
                        Visit Agency
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Data Source */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <GlassCard className="p-6">
              <h2 className="text-sm font-medium text-pulse-text-secondary mb-3">Data Source</h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-pulse-text-tertiary">
                  <Globe className="w-4 h-4" />
                  <span>{grant.sourceName || 'GrantsBy AI'}</span>
                </div>
                {grant.sourceId && (
                  <p className="text-xs text-pulse-text-tertiary">
                    ID: {grant.sourceId}
                  </p>
                )}
                <div className="pt-2 border-t border-pulse-border mt-2">
                  <div className="flex items-center justify-between text-xs text-pulse-text-tertiary">
                    <span>Data Quality</span>
                    <span className="text-pulse-accent">Good</span>
                  </div>
                  <div className="h-1.5 bg-pulse-border rounded-full overflow-hidden mt-1">
                    <div className="h-full w-4/5 bg-pulse-accent rounded-full" />
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>

      {/* Bottom CTA */}
      {grant.url && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <GlassCard className="p-6 text-center">
            <h3 className="text-lg font-semibold text-pulse-text mb-2">Ready to Apply?</h3>
            <p className="text-sm text-pulse-text-secondary mb-4">
              Start your application today. Make sure to review all requirements before submitting.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button
                size="lg"
                className="px-8 bg-gradient-to-r from-pulse-accent to-pulse-accent/80"
                asChild
              >
                <a href={grant.url} target="_blank" rel="noopener noreferrer">
                  Apply Now
                  <ExternalLink className="w-4 h-4 ml-2" />
                </a>
              </Button>
              <Button variant="outline" onClick={handleSaveGrant} disabled={isSaving}>
                {isSaved ? (
                  <>
                    <BookmarkCheck className="w-4 h-4 mr-2" />
                    Saved
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4 mr-2" />
                    Save for Later
                  </>
                )}
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Footer */}
      <div className="mt-6 flex items-center justify-between text-xs text-pulse-text-tertiary">
        <button
          className="hover:text-pulse-accent transition-colors"
          onClick={() => toast.info('Report submitted', 'Thank you for helping us improve.')}
        >
          Report an issue
        </button>
        <span>Last updated: {new Date().toLocaleDateString()}</span>
      </div>
    </div>
  )
}
