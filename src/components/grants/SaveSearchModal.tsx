'use client'

/**
 * SAVE SEARCH MODAL
 * -----------------
 * Modal for saving current search filters for quick access and alerts
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Search,
  Bell,
  BellOff,
  Loader2,
  Check,
  Bookmark,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GlassCard } from '@/components/ui/glass-card'

interface SaveSearchModalProps {
  isOpen: boolean
  onClose: () => void
  currentQuery: string
  currentFilters: {
    agency?: string
    status?: string
    state?: string
    sources?: string[]
  }
  onSaved?: () => void
}

export function SaveSearchModal({
  isOpen,
  onClose,
  currentQuery,
  currentFilters,
  onSaved,
}: SaveSearchModalProps) {
  const [name, setName] = useState('')
  const [alertEnabled, setAlertEnabled] = useState(true)
  const [alertFreq, setAlertFreq] = useState<'daily' | 'weekly'>('daily')
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Please enter a name for this search')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch('/api/user/saved-searches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          query: currentQuery,
          filters: currentFilters,
          alertEnabled,
          alertFreq,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save search')
      }

      setSuccess(true)
      onSaved?.()

      // Close modal after short delay
      setTimeout(() => {
        onClose()
        setName('')
        setSuccess(false)
      }, 1500)
    } catch (err) {
      console.error('Error saving search:', err)
      setError(err instanceof Error ? err.message : 'Failed to save search')
    } finally {
      setIsSaving(false)
    }
  }

  const getFilterSummary = () => {
    const parts: string[] = []
    if (currentQuery) parts.push(`"${currentQuery}"`)
    if (currentFilters.agency) parts.push(currentFilters.agency)
    if (currentFilters.state) parts.push(currentFilters.state)
    if (currentFilters.status && currentFilters.status !== 'all') parts.push(currentFilters.status)
    return parts.length > 0 ? parts.join(', ') : 'All grants'
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={(e) => e.target === e.currentTarget && onClose()}
        onKeyDown={(e) => { if (e.key === 'Escape') onClose() }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md"
          role="dialog"
          aria-modal="true"
          aria-labelledby="save-search-title"
        >
          <GlassCard className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pulse-accent/20 flex items-center justify-center">
                  <Bookmark className="w-5 h-5 text-pulse-accent" />
                </div>
                <div>
                  <h2 id="save-search-title" className="text-lg font-semibold text-pulse-text">Save Search</h2>
                  <p className="text-sm text-pulse-text-tertiary">Get notified about new grants</p>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="p-2 rounded-lg text-pulse-text-tertiary hover:text-pulse-text hover:bg-pulse-surface transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success State */}
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <Check className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-pulse-text mb-2">Search Saved!</h3>
                <p className="text-sm text-pulse-text-secondary">
                  {alertEnabled
                    ? `You'll receive ${alertFreq} alerts for new matches.`
                    : 'Access this search anytime from your saved searches.'}
                </p>
              </motion.div>
            ) : (
              <>
                {/* Current Search Summary */}
                <div className="mb-6 p-3 rounded-lg bg-pulse-surface/50 border border-pulse-border">
                  <div className="flex items-center gap-2 text-sm text-pulse-text-secondary">
                    <Search className="w-4 h-4 text-pulse-text-tertiary" />
                    <span>{getFilterSummary()}</span>
                  </div>
                </div>

                {/* Name Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-pulse-text-secondary mb-2">
                    Search Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Agriculture grants in California"
                    className="w-full px-4 py-3 rounded-xl bg-pulse-surface border border-pulse-border focus:border-pulse-accent focus:outline-none text-pulse-text placeholder:text-pulse-text-tertiary"
                    autoFocus
                  />
                </div>

                {/* Alert Settings */}
                <div className="mb-6 p-4 rounded-xl bg-pulse-surface/50 border border-pulse-border">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {alertEnabled ? (
                        <Bell className="w-5 h-5 text-pulse-accent" />
                      ) : (
                        <BellOff className="w-5 h-5 text-pulse-text-tertiary" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-pulse-text">Email Alerts</p>
                        <p className="text-xs text-pulse-text-tertiary">
                          Get notified when new grants match
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setAlertEnabled(!alertEnabled)}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        alertEnabled ? 'bg-pulse-accent' : 'bg-pulse-border'
                      }`}
                    >
                      <motion.div
                        className="absolute top-1 w-4 h-4 rounded-full bg-white"
                        animate={{ left: alertEnabled ? '28px' : '4px' }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    </button>
                  </div>

                  {alertEnabled && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <div className="flex gap-2">
                        <button
                          onClick={() => setAlertFreq('daily')}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                            alertFreq === 'daily'
                              ? 'bg-pulse-accent text-pulse-bg'
                              : 'bg-pulse-surface border border-pulse-border text-pulse-text-secondary hover:border-pulse-accent/30'
                          }`}
                        >
                          Daily
                        </button>
                        <button
                          onClick={() => setAlertFreq('weekly')}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                            alertFreq === 'weekly'
                              ? 'bg-pulse-accent text-pulse-bg'
                              : 'bg-pulse-surface border border-pulse-border text-pulse-text-secondary hover:border-pulse-accent/30'
                          }`}
                        >
                          Weekly
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleSave}
                    disabled={isSaving || !name.trim()}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-4 h-4 mr-2" />
                        Save Search
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
