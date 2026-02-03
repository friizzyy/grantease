'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Building2,
  DollarSign,
  Calendar,
  MapPin,
  ArrowRight,
  Bookmark,
  BookmarkCheck,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Flexible interface to accept both discover page and API formats
interface AIMatchResult {
  // Can use either fitScore or score
  fitScore?: number
  score?: number
  fitSummary?: string
  fitExplanation?: string
  eligibilityStatus?: string
  nextSteps?: string[]
  whatYouCanFund?: string[]
  applicationTips?: string[]
  urgency?: string
  reasons?: string[]
  grantId?: string
}

interface Grant {
  id: string
  title: string
  sponsor: string
  summary: string
  categories: string[] | string
  eligibility: { tags: string[]; rawText?: string } | string[] | string
  locations: Array<{ type: string; value?: string }> | string[] | string
  amountMin: number | null
  amountMax: number | null
  amountText?: string | null
  fundingRange?: string
  deadlineType?: string
  deadlineDate: string | Date | null
  url: string
  status: string
}

interface GrantDetailModalProps {
  grantId: string | null
  isOpen: boolean
  onClose: () => void
  aiMatch?: AIMatchResult
  initialGrant?: Grant
}

export function GrantDetailModal({
  grantId,
  isOpen,
  onClose,
  aiMatch,
  initialGrant,
}: GrantDetailModalProps) {
  const router = useRouter()
  const [grant, setGrant] = useState<Grant | null>(initialGrant || null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  // Fetch grant details if not provided
  useEffect(() => {
    if (!isOpen || !grantId) return
    if (initialGrant && initialGrant.id === grantId) {
      setGrant(initialGrant)
      return
    }

    async function fetchGrant() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/grants/${grantId}`)
        if (!res.ok) throw new Error('Failed to load grant')
        const data = await res.json()
        setGrant(data.grant || data)
      } catch (err) {
        setError('Failed to load grant details')
      } finally {
        setLoading(false)
      }
    }

    fetchGrant()
  }, [grantId, isOpen, initialGrant])

  // Check if saved
  useEffect(() => {
    if (!isOpen || !grantId) return

    async function checkSaved() {
      try {
        const res = await fetch(`/api/user/saved-grants/check?grantId=${grantId}`)
        if (res.ok) {
          const data = await res.json()
          setIsSaved(data.isSaved)
        }
      } catch {
        // Ignore errors
      }
    }

    checkSaved()
  }, [grantId, isOpen])

  const handleSave = async () => {
    if (!grantId || saving) return
    setSaving(true)

    try {
      if (isSaved) {
        await fetch('/api/user/saved-grants', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ grantId }),
        })
        setIsSaved(false)
      } else {
        await fetch('/api/user/saved-grants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ grantId }),
        })
        setIsSaved(true)
      }
    } catch {
      // Handle error
    } finally {
      setSaving(false)
    }
  }

  const handleContinue = () => {
    onClose()
    router.push(`/app/grants/${grantId}`)
  }

  const formatDeadline = (date: string | Date | null, type?: string) => {
    if (!date) {
      return type === 'rolling' ? 'Rolling' : 'Not listed'
    }
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const formatFunding = (grant: Grant) => {
    if (grant.fundingRange) return grant.fundingRange
    if (grant.amountText) return grant.amountText
    if (grant.amountMin && grant.amountMax) {
      return `$${grant.amountMin.toLocaleString()} - $${grant.amountMax.toLocaleString()}`
    }
    if (grant.amountMax) return `Up to $${grant.amountMax.toLocaleString()}`
    if (grant.amountMin) return `From $${grant.amountMin.toLocaleString()}`
    return 'Varies'
  }

  const getLocationText = (locations: Grant['locations']) => {
    if (!locations || (Array.isArray(locations) && locations.length === 0)) return 'Nationwide'
    // Handle string (JSON) format
    if (typeof locations === 'string') {
      try {
        const parsed = JSON.parse(locations)
        if (Array.isArray(parsed)) {
          const states = parsed.filter((l: { type?: string; value?: string }) => l.type === 'state').map((l: { value?: string }) => l.value)
          if (states.length > 0) return states.join(', ')
          if (parsed.some((l: { type?: string }) => l.type === 'national')) return 'Nationwide'
        }
      } catch {
        return 'See details'
      }
    }
    // Handle array of objects format
    if (Array.isArray(locations)) {
      const locArray = locations as Array<{ type?: string; value?: string }>
      const states = locArray.filter((l) => l.type === 'state').map((l) => l.value)
      if (states.length > 0) return states.join(', ')
      if (locArray.some((l) => l.type === 'national')) return 'Nationwide'
    }
    return 'See details'
  }

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'high':
        return 'text-red-400'
      case 'medium':
        return 'text-yellow-400'
      default:
        return 'text-pulse-text-tertiary'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400 border-green-400/30 bg-green-400/10'
    if (score >= 60) return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10'
    return 'text-pulse-text-secondary border-pulse-border bg-pulse-elevated'
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <Loader2 className="w-8 h-8 animate-spin text-pulse-accent" />
              <p className="mt-4 text-sm text-pulse-text-secondary">Loading grant details...</p>
            </motion.div>
          )}

          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12"
            >
              <AlertCircle className="w-8 h-8 text-red-400" />
              <p className="mt-4 text-sm text-pulse-text-secondary">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setError(null)
                  setLoading(true)
                }}
              >
                Try again
              </Button>
            </motion.div>
          )}

          {!loading && !error && grant && (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Header */}
              <DialogHeader className="pr-8">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm text-pulse-text-secondary mb-2">
                      <Building2 className="w-4 h-4" />
                      <span className="truncate">{grant.sponsor}</span>
                    </div>
                    <DialogTitle className="text-xl leading-tight">
                      {grant.title}
                    </DialogTitle>
                  </div>

                  {aiMatch && (aiMatch.fitScore || aiMatch.score) && (
                    <div
                      className={cn(
                        'flex-shrink-0 px-3 py-1.5 rounded-lg border text-sm font-medium',
                        getScoreColor(aiMatch.fitScore ?? aiMatch.score ?? 0)
                      )}
                    >
                      {aiMatch.fitScore ?? aiMatch.score}% match
                    </div>
                  )}
                </div>
              </DialogHeader>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <span className="text-pulse-text">{formatFunding(grant)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className={cn('w-4 h-4', aiMatch ? getUrgencyColor(aiMatch.urgency) : 'text-pulse-text-secondary')} />
                  <span className="text-pulse-text">
                    {formatDeadline(grant.deadlineDate, grant.deadlineType)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <span className="text-pulse-text truncate">
                    {getLocationText(grant.locations)}
                  </span>
                </div>
              </div>

              {/* AI Fit Summary */}
              {aiMatch && aiMatch.fitSummary && (
                <div className="p-4 rounded-lg bg-pulse-accent/5 border border-pulse-accent/20">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-pulse-accent flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-pulse-accent mb-1">
                        Why this matches you
                      </p>
                      <p className="text-sm text-pulse-text-secondary">
                        {aiMatch.fitSummary}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Key Highlights */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-pulse-text">Key Highlights</h4>
                <ul className="space-y-2">
                  {(() => {
                    // Parse eligibility tags - handle string, array, or object formats
                    let tags: string[] = []
                    if (grant.eligibility) {
                      if (typeof grant.eligibility === 'string') {
                        try {
                          const parsed = JSON.parse(grant.eligibility)
                          tags = parsed.tags || parsed || []
                        } catch {
                          tags = []
                        }
                      } else if (Array.isArray(grant.eligibility)) {
                        tags = grant.eligibility
                      } else if (grant.eligibility.tags) {
                        tags = grant.eligibility.tags
                      }
                    }
                    return tags.slice(0, 3).map((tag, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-pulse-text-secondary">{tag}</span>
                      </li>
                    ))
                  })()}
                  {aiMatch?.whatYouCanFund?.slice(0, 2).map((item, i) => (
                    <li key={`fund-${i}`} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-pulse-text-secondary">Can fund: {item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Urgency Notice */}
              {aiMatch?.urgency === 'high' && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <Clock className="w-4 h-4 text-red-400" />
                  <span className="text-sm text-red-400">Deadline approaching soon</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <Button
                  className="flex-1"
                  onClick={handleContinue}
                >
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleSave}
                  disabled={saving}
                  className={cn(
                    isSaved && 'border-pulse-accent text-pulse-accent'
                  )}
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isSaved ? (
                    <BookmarkCheck className="w-4 h-4" />
                  ) : (
                    <Bookmark className="w-4 h-4" />
                  )}
                </Button>

                {grant.url && (
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                  >
                    <a href={grant.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
