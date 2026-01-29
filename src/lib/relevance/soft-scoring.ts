/**
 * SOFT SCORING
 * ------------
 * Relevance scoring for prioritization and match percentage display
 */

import { UserProfile } from '@/lib/types/onboarding'
import {
  GrantForRelevance,
  ENTITY_TO_ELIGIBILITY,
  INDUSTRY_TO_CATEGORIES,
  GRANT_SIZE_RANGES,
  BUDGET_TO_GRANT_SIZE,
} from './types'

interface ScoringBreakdown {
  entityMatch: number       // 0-25 points
  industryMatch: number     // 0-30 points
  geographyMatch: number    // 0-20 points
  sizeMatch: number         // 0-15 points
  preferencesMatch: number  // 0-10 points
}

interface ScoringResult {
  totalScore: number
  breakdown: ScoringBreakdown
  matchReasons: string[]
  warnings: string[]
}

/**
 * Score entity type match (0-25 points)
 */
function scoreEntityMatch(
  profile: UserProfile,
  grant: GrantForRelevance
): { score: number; reason?: string } {
  if (!profile.entityType) {
    return { score: 12 } // Neutral score if no profile
  }

  const eligibleTypes = ENTITY_TO_ELIGIBILITY[profile.entityType] || []
  const grantEligibility = grant.eligibility?.tags || []

  // No restrictions = good match
  if (grantEligibility.length === 0) {
    return { score: 20, reason: 'Open to all organization types' }
  }

  // Exact match
  const exactMatch = eligibleTypes.some(type =>
    grantEligibility.some(grantType =>
      grantType.toLowerCase() === type.toLowerCase()
    )
  )
  if (exactMatch) {
    return { score: 25, reason: 'Perfect match for your organization type' }
  }

  // Partial/fuzzy match
  const partialMatch = eligibleTypes.some(type =>
    grantEligibility.some(grantType =>
      grantType.toLowerCase().includes(type.toLowerCase()) ||
      type.toLowerCase().includes(grantType.toLowerCase())
    )
  )
  if (partialMatch) {
    return { score: 18, reason: 'Good match for your organization type' }
  }

  return { score: 5 }
}

/**
 * Score industry/category match (0-30 points)
 */
function scoreIndustryMatch(
  profile: UserProfile,
  grant: GrantForRelevance
): { score: number; reasons: string[] } {
  if (!profile.industryTags || profile.industryTags.length === 0) {
    return { score: 15, reasons: [] } // Neutral
  }

  const grantCategories = grant.categories || []
  if (grantCategories.length === 0) {
    return { score: 15, reasons: ['General purpose grant'] }
  }

  // Count matching categories
  let matchCount = 0
  const matchedCategories: string[] = []

  for (const userTag of profile.industryTags) {
    const expandedCategories = INDUSTRY_TO_CATEGORIES[userTag] || [userTag]

    for (const grantCat of grantCategories) {
      const isMatch = expandedCategories.some(
        expanded =>
          grantCat.toLowerCase().includes(expanded.toLowerCase()) ||
          expanded.toLowerCase().includes(grantCat.toLowerCase())
      )
      if (isMatch) {
        matchCount++
        matchedCategories.push(grantCat)
        break
      }
    }
  }

  // Score based on overlap
  if (matchCount >= 3) {
    return {
      score: 30,
      reasons: [`Strong match: ${matchedCategories.slice(0, 2).join(', ')}`],
    }
  }
  if (matchCount === 2) {
    return {
      score: 25,
      reasons: [`Good match: ${matchedCategories.join(', ')}`],
    }
  }
  if (matchCount === 1) {
    return {
      score: 18,
      reasons: [`Matches your focus on ${matchedCategories[0]}`],
    }
  }

  return { score: 5, reasons: [] }
}

/**
 * Score geography match (0-20 points)
 */
function scoreGeographyMatch(
  profile: UserProfile,
  grant: GrantForRelevance
): { score: number; reason?: string } {
  const grantLocations = grant.locations || []

  // No restrictions = national/open
  if (grantLocations.length === 0) {
    return { score: 15, reason: 'Available nationwide' }
  }

  // National grants
  if (grantLocations.some(loc => loc.type === 'national')) {
    return { score: 18, reason: 'National grant' }
  }

  // User hasn't specified location
  if (!profile.state) {
    return { score: 10 }
  }

  // State-specific match
  const stateMatch = grantLocations.find(
    loc =>
      loc.type === 'state' &&
      loc.value?.toUpperCase() === profile.state?.toUpperCase()
  )
  if (stateMatch) {
    return { score: 20, reason: `Specifically for ${profile.state}` }
  }

  // Regional proximity (could be enhanced with actual region data)
  return { score: 8 }
}

/**
 * Score grant size match (0-15 points)
 */
function scoreSizeMatch(
  profile: UserProfile,
  grant: GrantForRelevance
): { score: number; warning?: string } {
  // Check user's budget preference
  const budgetPref = profile.annualBudget
  const sizePref = profile.grantPreferences?.preferredSize

  // No preferences = neutral
  if (!budgetPref && !sizePref) {
    return { score: 8 }
  }

  const grantMin = grant.amountMin || 0
  const grantMax = grant.amountMax || Infinity

  // Check against size preference
  if (sizePref && sizePref !== 'any') {
    const sizeRange = GRANT_SIZE_RANGES[sizePref]
    if (sizeRange) {
      // Check if grant overlaps with preferred range
      const overlaps =
        grantMin <= sizeRange.max && grantMax >= sizeRange.min

      if (overlaps) {
        return { score: 15 }
      }
      return { score: 5, warning: 'Grant size may not match your preference' }
    }
  }

  // Check against budget (appropriate grant sizes for org budget)
  if (budgetPref) {
    const appropriateSizes = BUDGET_TO_GRANT_SIZE[budgetPref] || []
    const grantSize = getGrantSizeCategory(grantMin, grantMax)

    if (appropriateSizes.includes(grantSize)) {
      return { score: 12 }
    }
    // Large grants for small orgs = warning
    if (grantSize === 'large' && ['under_100k', '100k_500k'].includes(budgetPref)) {
      return { score: 6, warning: 'This is a large grant - may be competitive' }
    }
  }

  return { score: 8 }
}

/**
 * Helper to categorize grant size
 */
function getGrantSizeCategory(min: number, max: number): string {
  const midpoint = (min + max) / 2
  if (midpoint < 10000) return 'micro'
  if (midpoint < 50000) return 'small'
  if (midpoint < 250000) return 'medium'
  return 'large'
}

/**
 * Score other preferences (0-10 points)
 */
function scorePreferencesMatch(
  profile: UserProfile,
  grant: GrantForRelevance
): { score: number } {
  let score = 5 // Base score

  // Timeline preference
  if (profile.grantPreferences?.timeline && grant.deadlineDate) {
    const daysUntilDeadline = Math.ceil(
      (grant.deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )

    const timeline = profile.grantPreferences.timeline
    if (timeline === 'immediate' && daysUntilDeadline <= 60) {
      score += 3
    } else if (timeline === 'quarter' && daysUntilDeadline <= 180) {
      score += 2
    } else if (timeline === 'flexible') {
      score += 2
    }
  }

  return { score: Math.min(10, score) }
}

/**
 * Calculate complete relevance score
 */
export function calculateSoftScore(
  profile: UserProfile,
  grant: GrantForRelevance
): ScoringResult {
  const matchReasons: string[] = []
  const warnings: string[] = []

  // Calculate each component
  const entity = scoreEntityMatch(profile, grant)
  if (entity.reason) matchReasons.push(entity.reason)

  const industry = scoreIndustryMatch(profile, grant)
  matchReasons.push(...industry.reasons)

  const geography = scoreGeographyMatch(profile, grant)
  if (geography.reason) matchReasons.push(geography.reason)

  const size = scoreSizeMatch(profile, grant)
  if (size.warning) warnings.push(size.warning)

  const preferences = scorePreferencesMatch(profile, grant)

  const breakdown: ScoringBreakdown = {
    entityMatch: entity.score,
    industryMatch: industry.score,
    geographyMatch: geography.score,
    sizeMatch: size.score,
    preferencesMatch: preferences.score,
  }

  const totalScore =
    entity.score +
    industry.score +
    geography.score +
    size.score +
    preferences.score

  return {
    totalScore,
    breakdown,
    matchReasons,
    warnings,
  }
}
