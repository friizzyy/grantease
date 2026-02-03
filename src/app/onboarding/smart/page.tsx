'use client'

/**
 * SMART ONBOARDING - AI-POWERED PROFILE SETUP
 * -------------------------------------------
 * Let users paste their website URL or company name,
 * and our AI will analyze and auto-fill their profile.
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  Globe,
  Building2,
  Loader2,
  Check,
  AlertCircle,
  ChevronRight,
  Wand2,
  PenLine,
  MapPin,
  Tag,
  Users,
  Wheat,
  DollarSign,
} from 'lucide-react'
import { useOnboarding } from '@/lib/contexts/OnboardingContext'
import { OnboardingLayout } from '@/components/onboarding'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import type { EntityType } from '@/lib/types/onboarding'

interface AnalyzedProfile {
  companyName: string
  tagline: string
  description: string
  suggestedEntityType: EntityType
  entityTypeConfidence: number
  primaryIndustry: string
  industryTags: string[]
  estimatedSize: string | null
  estimatedStage: string | null
  products: string[]
  services: string[]
  fundingNeeds: string[]
  farmDetails?: {
    farmType?: string
    acreage?: string
    products?: string[]
    organic?: boolean
  }
  confidence: number
}

export default function SmartOnboarding() {
  const router = useRouter()
  const { setEntityType, setGeography, state } = useOnboarding()

  // Form state
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [description, setDescription] = useState('')
  const [showManualInput, setShowManualInput] = useState(false)

  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analyzedProfile, setAnalyzedProfile] = useState<AnalyzedProfile | null>(null)
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([])

  // Handle AI analysis
  const handleAnalyze = async () => {
    if (!websiteUrl && !companyName && !description) {
      setError('Please enter a website URL, company name, or description')
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/analyze-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websiteUrl: websiteUrl || undefined,
          companyName: companyName || undefined,
          description: description || undefined,
          mode: websiteUrl ? 'full' : 'quick',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Analysis failed')
        return
      }

      setAnalyzedProfile(data.profile)
      setSuggestedQuestions(data.suggestedQuestions || [])

      // Auto-set entity type from analysis
      if (data.profile?.suggestedEntityType) {
        setEntityType(data.profile.suggestedEntityType)
      }
    } catch (err) {
      console.error('Analysis error:', err)
      setError('Failed to analyze. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Continue with analyzed profile
  const handleContinueWithProfile = () => {
    // Save the analyzed profile to session storage for later steps
    if (analyzedProfile) {
      sessionStorage.setItem('aiAnalyzedProfile', JSON.stringify(analyzedProfile))
    }
    router.push('/onboarding/step-2')
  }

  // Skip to manual onboarding
  const handleManualSetup = () => {
    router.push('/onboarding/step-1')
  }

  return (
    <OnboardingLayout
      currentStep={0}
      showSkipAll
      onSkipAll={() => router.push('/app')}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 text-pulse-accent mb-4">
          <Wand2 className="w-5 h-5" />
          <span className="text-sm font-medium uppercase tracking-wider">Smart Setup</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-pulse-text mb-3">
          Let AI build your profile
        </h1>
        <p className="text-lg text-pulse-text-secondary">
          Paste your website or tell us about your organization, and we&apos;ll create a personalized grant profile.
        </p>
      </motion.div>

      {/* Main input section */}
      {!analyzedProfile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Website URL input */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 p-[1px]">
                <div className="w-full h-full rounded-xl bg-pulse-bg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-violet-400" />
                </div>
              </div>
              <div>
                <h3 className="font-medium text-pulse-text">Website URL</h3>
                <p className="text-sm text-pulse-text-tertiary">We&apos;ll analyze your site to understand your business</p>
              </div>
            </div>
            <Input
              type="url"
              placeholder="https://yourcompany.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="h-12 bg-white/[0.04] border-white/[0.08] rounded-xl text-lg"
            />
          </div>

          {/* OR divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-white/[0.08]" />
            <span className="text-sm text-pulse-text-tertiary">or</span>
            <div className="flex-1 h-px bg-white/[0.08]" />
          </div>

          {/* Company name input */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 p-[1px]">
                <div className="w-full h-full rounded-xl bg-pulse-bg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-amber-400" />
                </div>
              </div>
              <div>
                <h3 className="font-medium text-pulse-text">Company / Organization Name</h3>
                <p className="text-sm text-pulse-text-tertiary">We&apos;ll do our best to find info about you</p>
              </div>
            </div>
            <Input
              type="text"
              placeholder="Acme Farm Supply, Inc."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="h-12 bg-white/[0.04] border-white/[0.08] rounded-xl text-lg"
            />
          </div>

          {/* Optional description */}
          <AnimatePresence>
            {(showManualInput || (!websiteUrl && !companyName)) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-[1px]">
                      <div className="w-full h-full rounded-xl bg-pulse-bg flex items-center justify-center">
                        <PenLine className="w-5 h-5 text-emerald-400" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium text-pulse-text">Tell us about yourself</h3>
                      <p className="text-sm text-pulse-text-tertiary">Describe what you do in a few sentences</p>
                    </div>
                  </div>
                  <Textarea
                    placeholder="I run a 50-acre organic vegetable farm in Vermont. We sell at farmers markets and to local restaurants. Looking for funding to expand our greenhouse operation..."
                    value={description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                    className="min-h-[120px] bg-white/[0.04] border-white/[0.08] rounded-xl resize-none"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!showManualInput && (websiteUrl || companyName) && (
            <button
              onClick={() => setShowManualInput(true)}
              className="text-sm text-pulse-text-tertiary hover:text-pulse-text-secondary transition-colors"
            >
              + Add a description for better results
            </button>
          )}

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-red-400 text-sm p-3 rounded-lg bg-red-500/10"
            >
              <AlertCircle className="w-4 h-4" />
              {error}
            </motion.div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              onClick={handleAnalyze}
              disabled={isAnalyzing || (!websiteUrl && !companyName && !description)}
              className="flex-1 h-14 text-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 rounded-xl"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Analyze with AI
                </>
              )}
            </Button>
            <Button
              onClick={handleManualSetup}
              variant="outline"
              className="h-14 px-6 rounded-xl border-white/[0.1] hover:bg-white/[0.04]"
            >
              Set up manually
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </motion.div>
      )}

      {/* Analysis results */}
      {analyzedProfile && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Success header */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Check className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="font-medium text-emerald-400">Profile analyzed!</p>
              <p className="text-sm text-pulse-text-secondary">
                {analyzedProfile.confidence >= 70
                  ? 'We found great information about your organization.'
                  : 'We found some info - you can refine it in the next steps.'}
              </p>
            </div>
          </div>

          {/* Profile summary card */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-6">
            {/* Company name and tagline */}
            <div>
              <h2 className="text-2xl font-semibold text-pulse-text mb-1">
                {analyzedProfile.companyName}
              </h2>
              {analyzedProfile.tagline && (
                <p className="text-pulse-text-secondary">{analyzedProfile.tagline}</p>
              )}
            </div>

            {/* Key details grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Entity type */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <p className="text-xs text-pulse-text-tertiary uppercase tracking-wider">Organization Type</p>
                  <p className="text-pulse-text font-medium capitalize">
                    {analyzedProfile.suggestedEntityType?.replace('_', ' ')}
                  </p>
                </div>
              </div>

              {/* Primary industry */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <Tag className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-pulse-text-tertiary uppercase tracking-wider">Primary Industry</p>
                  <p className="text-pulse-text font-medium">{analyzedProfile.primaryIndustry}</p>
                </div>
              </div>

              {/* Size */}
              {analyzedProfile.estimatedSize && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-pulse-text-tertiary uppercase tracking-wider">Size</p>
                    <p className="text-pulse-text font-medium capitalize">
                      {analyzedProfile.estimatedSize}
                    </p>
                  </div>
                </div>
              )}

              {/* Location if detected */}
              {state.state && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-pulse-text-tertiary uppercase tracking-wider">Location</p>
                    <p className="text-pulse-text font-medium">{state.state}, USA</p>
                  </div>
                </div>
              )}
            </div>

            {/* Farm details if applicable */}
            {analyzedProfile.farmDetails && (
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                <div className="flex items-center gap-2 mb-3">
                  <Wheat className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium text-emerald-400">Farm Details</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-3 text-sm">
                  {analyzedProfile.farmDetails.farmType && (
                    <div>
                      <span className="text-pulse-text-tertiary">Type:</span>{' '}
                      <span className="text-pulse-text">{analyzedProfile.farmDetails.farmType}</span>
                    </div>
                  )}
                  {analyzedProfile.farmDetails.acreage && (
                    <div>
                      <span className="text-pulse-text-tertiary">Acreage:</span>{' '}
                      <span className="text-pulse-text">{analyzedProfile.farmDetails.acreage}</span>
                    </div>
                  )}
                  {analyzedProfile.farmDetails.products && analyzedProfile.farmDetails.products.length > 0 && (
                    <div className="sm:col-span-2">
                      <span className="text-pulse-text-tertiary">Products:</span>{' '}
                      <span className="text-pulse-text">{analyzedProfile.farmDetails.products.join(', ')}</span>
                    </div>
                  )}
                  {analyzedProfile.farmDetails.organic && (
                    <div>
                      <span className="inline-flex items-center gap-1 text-emerald-400">
                        <Check className="w-3 h-3" /> Organic
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Funding needs */}
            {analyzedProfile.fundingNeeds && analyzedProfile.fundingNeeds.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-4 h-4 text-pulse-text-tertiary" />
                  <span className="text-sm font-medium text-pulse-text-secondary">Potential Funding Needs</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analyzedProfile.fundingNeeds.map((need, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full text-sm bg-white/[0.04] text-pulse-text-secondary"
                    >
                      {need}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Industry tags */}
            {analyzedProfile.industryTags && analyzedProfile.industryTags.length > 0 && (
              <div>
                <p className="text-sm font-medium text-pulse-text-secondary mb-2">Grant Categories</p>
                <div className="flex flex-wrap gap-2">
                  {analyzedProfile.industryTags.map((tag, i) => (
                    <span
                      key={i}
                      className={cn(
                        'px-3 py-1 rounded-full text-sm border',
                        i === 0
                          ? 'bg-violet-500/20 border-violet-500/30 text-violet-300'
                          : 'bg-white/[0.04] border-white/[0.08] text-pulse-text-secondary'
                      )}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Follow-up questions if confidence is low */}
          {suggestedQuestions.length > 0 && analyzedProfile.confidence < 70 && (
            <div className="p-5 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <p className="text-sm font-medium text-amber-400 mb-3">
                A few more details would help us find better grants:
              </p>
              <ul className="space-y-2">
                {suggestedQuestions.map((q, i) => (
                  <li key={i} className="text-sm text-pulse-text-secondary flex items-start gap-2">
                    <span className="text-amber-400">•</span>
                    {q}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              onClick={handleContinueWithProfile}
              className="flex-1 h-14 text-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 rounded-xl"
            >
              Continue with this profile
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              onClick={() => {
                setAnalyzedProfile(null)
                setError(null)
              }}
              variant="outline"
              className="h-14 px-6 rounded-xl border-white/[0.1] hover:bg-white/[0.04]"
            >
              Try again
            </Button>
          </div>
        </motion.div>
      )}
    </OnboardingLayout>
  )
}
