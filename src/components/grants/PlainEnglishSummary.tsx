'use client'

/**
 * PlainEnglishSummary Component
 *
 * Translates grant jargon into plain English to help users understand:
 * - What the grant actually funds
 * - Who should apply
 * - What documents and information are needed
 */

import { motion } from 'framer-motion'
import { MessageSquare, Target, FileText, Sparkles } from 'lucide-react'
import { GlassCard } from '@/components/ui/glass-card'

interface Grant {
  id: string
  title: string
  summary: string | null
  description: string | null
  eligibility: string[]
  requirements: string[]
  categories: string[]
}

interface PlainEnglishSummaryProps {
  grant: Grant
  aiGenerated?: boolean
}

export function PlainEnglishSummary({ grant, aiGenerated = false }: PlainEnglishSummaryProps) {
  // Generate plain English bullet points from grant data
  const getFundingBullets = (): string[] => {
    const bullets: string[] = []

    // Use categories to explain what can be funded
    if (grant.categories.length > 0) {
      grant.categories.slice(0, 4).forEach(category => {
        bullets.push(`${category} projects and initiatives`)
      })
    }

    // Fallback if no categories
    if (bullets.length === 0) {
      bullets.push('See grant description for funding details')
    }

    return bullets
  }

  const getEligibilityBullets = (): string[] => {
    if (grant.eligibility.length === 0) {
      return ['Check grant details for eligibility requirements']
    }

    // Convert eligibility to plain English
    return grant.eligibility.slice(0, 4).map(item => {
      // Try to make it more readable
      return item
        .replace(/_/g, ' ')
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    })
  }

  const getRequirementsBullets = (): string[] => {
    const bullets: string[] = []

    // Common requirements based on what we know
    if (grant.requirements.length > 0) {
      grant.requirements.slice(0, 4).forEach(req => {
        bullets.push(req)
      })
    }

    // Add common defaults if needed
    if (bullets.length === 0) {
      bullets.push('Basic organization information')
      bullets.push('Project narrative and budget')
      bullets.push('Required forms and documentation')
    }

    return bullets
  }

  const fundingBullets = getFundingBullets()
  const eligibilityBullets = getEligibilityBullets()
  const requirementsBullets = getRequirementsBullets()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <GlassCard className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pulse-accent/20 to-purple-500/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-pulse-accent" />
            </div>
            <div>
              <h3 className="font-semibold text-pulse-text">Plain English Summary</h3>
              <p className="text-xs text-pulse-text-tertiary">Jargon-free explanation</p>
            </div>
          </div>
          {aiGenerated && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-pulse-accent/10 border border-pulse-accent/20">
              <Sparkles className="w-3 h-3 text-pulse-accent" />
              <span className="text-xs text-pulse-accent font-medium">AI</span>
            </div>
          )}
        </div>

        {/* What This Grant Funds */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-pulse-accent" />
            <h4 className="text-sm font-semibold text-pulse-text">What this grant funds</h4>
          </div>
          <ul className="space-y-1.5 ml-6">
            {fundingBullets.map((bullet, i) => (
              <li key={i} className="text-sm text-pulse-text-secondary flex items-start gap-2">
                <span className="text-pulse-accent mt-1.5">•</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Who Should Apply */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-pulse-accent" />
            <h4 className="text-sm font-semibold text-pulse-text">Who should apply</h4>
          </div>
          <ul className="space-y-1.5 ml-6">
            {eligibilityBullets.map((bullet, i) => (
              <li key={i} className="text-sm text-pulse-text-secondary flex items-start gap-2">
                <span className="text-pulse-accent mt-1.5">•</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* What You'll Need */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-pulse-accent" />
            <h4 className="text-sm font-semibold text-pulse-text">What you'll need</h4>
          </div>
          <ul className="space-y-1.5 ml-6">
            {requirementsBullets.map((bullet, i) => (
              <li key={i} className="text-sm text-pulse-text-secondary flex items-start gap-2">
                <span className="text-pulse-accent mt-1.5">•</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>
      </GlassCard>
    </motion.div>
  )
}
