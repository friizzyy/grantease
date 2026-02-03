/**
 * RELEVANCE ENGINE
 * ----------------
 * Main entry point for grant relevance calculations
 */

import { UserProfile } from '@/lib/types/onboarding'
import { GrantForRelevance, RelevanceResult } from './types'
import { runHardFilters } from './hard-filters'
import { calculateSoftScore } from './soft-scoring'

/**
 * Calculate complete relevance for a grant
 */
export function calculateRelevance(
  grant: GrantForRelevance,
  profile: UserProfile | null
): RelevanceResult {
  // No profile = show everything with neutral score
  if (!profile) {
    return {
      isEligible: true,
      relevanceScore: 50,
      confidenceLevel: 'low',
      breakdown: {
        entityMatch: 10,
        industryMatch: 12,
        geographyMatch: 8,
        sizeMatch: 5,
        purposeMatch: 8,
        preferencesMatch: 5,
        qualityBonus: 2,
      },
      matchReasons: ['Complete your profile for personalized matches'],
      warnings: [],
      suggestions: ['Set up your profile to see how well this grant matches you'],
    }
  }

  // Run hard filters first
  const hardFilterResult = runHardFilters(profile, grant)

  if (!hardFilterResult.passes) {
    return {
      isEligible: false,
      eligibilityReason: hardFilterResult.reason,
      relevanceScore: 0,
      confidenceLevel: 'high',
      breakdown: {
        entityMatch: 0,
        industryMatch: 0,
        geographyMatch: 0,
        sizeMatch: 0,
        purposeMatch: 0,
        preferencesMatch: 0,
        qualityBonus: 0,
      },
      matchReasons: [],
      warnings: [hardFilterResult.reason || 'Not eligible for this grant'],
      suggestions: [],
    }
  }

  // Calculate soft score
  const softScore = calculateSoftScore(profile, grant)

  // Determine confidence level based on profile completeness
  const confidenceLevel = getConfidenceLevel(profile)

  // Generate suggestions
  const suggestions = generateSuggestions(profile, softScore.totalScore)

  return {
    isEligible: true,
    relevanceScore: softScore.totalScore,
    confidenceLevel,
    breakdown: softScore.breakdown,
    matchReasons: softScore.matchReasons,
    warnings: softScore.warnings,
    suggestions,
  }
}

/**
 * Determine confidence level based on profile completeness
 */
function getConfidenceLevel(profile: UserProfile): 'high' | 'medium' | 'low' {
  let completeness = 0

  if (profile.entityType) completeness++
  if (profile.state) completeness++
  if (profile.industryTags && profile.industryTags.length > 0) completeness++
  if (profile.sizeBand) completeness++
  if (profile.grantPreferences?.preferredSize) completeness++

  if (completeness >= 4) return 'high'
  if (completeness >= 2) return 'medium'
  return 'low'
}

/**
 * Generate suggestions for improving match
 */
function generateSuggestions(profile: UserProfile, score: number): string[] {
  const suggestions: string[] = []

  if (!profile.state) {
    suggestions.push('Add your state to find location-specific grants')
  }

  if (!profile.industryTags || profile.industryTags.length === 0) {
    suggestions.push('Select your focus areas to improve match accuracy')
  }

  if (profile.industryTags && profile.industryTags.length === 1) {
    suggestions.push('Add more focus areas to discover more relevant grants')
  }

  if (!profile.annualBudget && !profile.grantPreferences?.preferredSize) {
    suggestions.push('Set your grant size preference in Settings')
  }

  return suggestions.slice(0, 2) // Max 2 suggestions
}

/**
 * Filter and sort grants by relevance
 */
export function filterAndSortByRelevance(
  grants: GrantForRelevance[],
  profile: UserProfile | null,
  options: {
    includeIneligible?: boolean
    minScore?: number
  } = {}
): Array<GrantForRelevance & { relevance: RelevanceResult }> {
  const { includeIneligible = false, minScore = 0 } = options

  // Calculate relevance for each grant
  const grantsWithRelevance = grants.map(grant => ({
    ...grant,
    relevance: calculateRelevance(grant, profile),
  }))

  // Filter
  let filtered = grantsWithRelevance
  if (!includeIneligible) {
    filtered = filtered.filter(g => g.relevance.isEligible)
  }
  if (minScore > 0) {
    filtered = filtered.filter(g => g.relevance.relevanceScore >= minScore)
  }

  // Sort by relevance score (descending)
  filtered.sort((a, b) => b.relevance.relevanceScore - a.relevance.relevanceScore)

  return filtered
}

/**
 * Get relevance tier for display
 */
export function getRelevanceTier(score: number): {
  tier: 'excellent' | 'good' | 'fair' | 'low'
  label: string
  color: string
} {
  if (score >= 80) {
    return { tier: 'excellent', label: 'Excellent Match', color: 'emerald' }
  }
  if (score >= 60) {
    return { tier: 'good', label: 'Good Match', color: 'blue' }
  }
  if (score >= 40) {
    return { tier: 'fair', label: 'Fair Match', color: 'amber' }
  }
  return { tier: 'low', label: 'Low Match', color: 'gray' }
}

// Re-export types
export type { RelevanceResult, GrantForRelevance } from './types'
