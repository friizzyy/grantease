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
  GOALS_TO_PURPOSE_TAGS,
} from './types'

interface ScoringBreakdown {
  entityMatch: number       // 0-20 points (was 25)
  industryMatch: number     // 0-25 points (was 30)
  geographyMatch: number    // 0-15 points (was 20)
  sizeMatch: number         // 0-10 points (was 15)
  purposeMatch: number      // 0-15 points (NEW)
  preferencesMatch: number  // 0-10 points
  qualityBonus: number      // 0-5 points (NEW)
}

interface ScoringResult {
  totalScore: number
  breakdown: ScoringBreakdown
  matchReasons: string[]
  warnings: string[]
}

/**
 * Score entity type match (0-20 points)
 */
function scoreEntityMatch(
  profile: UserProfile,
  grant: GrantForRelevance
): { score: number; reason?: string } {
  if (!profile.entityType) {
    return { score: 10 } // Neutral score if no profile
  }

  const eligibleTypes = ENTITY_TO_ELIGIBILITY[profile.entityType] || []
  const grantEligibility = grant.eligibility?.tags || []

  // No restrictions = good match
  if (grantEligibility.length === 0) {
    return { score: 16, reason: 'Open to all organization types' }
  }

  // Exact match
  const exactMatch = eligibleTypes.some(type =>
    grantEligibility.some(grantType =>
      grantType.toLowerCase() === type.toLowerCase()
    )
  )
  if (exactMatch) {
    return { score: 20, reason: 'Perfect match for your organization type' }
  }

  // Partial/fuzzy match
  const partialMatch = eligibleTypes.some(type =>
    grantEligibility.some(grantType =>
      grantType.toLowerCase().includes(type.toLowerCase()) ||
      type.toLowerCase().includes(grantType.toLowerCase())
    )
  )
  if (partialMatch) {
    return { score: 15, reason: 'Good match for your organization type' }
  }

  return { score: 4 }
}

/**
 * Score industry/category match (0-25 points)
 * STRICTER: Low scores for grants that don't match user's focus
 */
function scoreIndustryMatch(
  profile: UserProfile,
  grant: GrantForRelevance
): { score: number; reasons: string[] } {
  if (!profile.industryTags || profile.industryTags.length === 0) {
    return { score: 12, reasons: [] } // Neutral - user hasn't specified
  }

  const grantCategories = grant.categories || []

  // Check title for industry keywords even if categories are empty
  const titleLower = grant.title?.toLowerCase() || ''

  // Industry keyword mapping for enhanced matching
  const industryKeywords: Record<string, string[]> = {
    'agriculture': ['agriculture', 'farm', 'rural', 'crop', 'livestock', 'usda', 'food', 'agricultural'],
    'arts_culture': ['arts', 'culture', 'museum', 'heritage', 'creative', 'humanities', 'artistic'],
    'business': ['business', 'entrepreneur', 'commerce', 'economic', 'sbir', 'sttr', 'small business'],
    'climate': ['climate', 'environment', 'energy', 'conservation', 'sustainability', 'epa', 'environmental'],
    'community': ['community', 'neighborhood', 'civic', 'local', 'regional', 'municipal'],
    'education': ['education', 'school', 'learning', 'training', 'academic', 'student', 'educational'],
    'health': ['health', 'medical', 'wellness', 'nih', 'clinical', 'disease', 'mental health', 'healthcare'],
    'housing': ['housing', 'hud', 'shelter', 'homelessness', 'affordable housing', 'home'],
    'infrastructure': ['infrastructure', 'transportation', 'broadband', 'water', 'transit', 'roads'],
    'nonprofit': ['nonprofit', 'charitable', 'foundation', 'philanthropy', 'ngo'],
    'research': ['research', 'science', 'nsf', 'study', 'innovation', 'r&d', 'scientific'],
    'technology': ['technology', 'tech', 'digital', 'software', 'cyber', 'ai', 'computing'],
    'workforce': ['workforce', 'job', 'employment', 'career', 'labor', 'worker', 'training'],
    'youth': ['youth', 'children', 'family', 'child', 'juvenile', 'teen', 'young'],
  }

  // Count matching categories
  let matchCount = 0
  const matchedCategories: string[] = []

  for (const userTag of profile.industryTags) {
    const expandedCategories = INDUSTRY_TO_CATEGORIES[userTag] || [userTag]
    const keywords = industryKeywords[userTag.toLowerCase()] || [userTag.toLowerCase()]

    // Check grant categories
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

    // Also check title for keyword matches
    if (keywords.some(kw => titleLower.includes(kw))) {
      matchCount++
      if (!matchedCategories.includes(userTag)) {
        matchedCategories.push(userTag)
      }
    }
  }

  // If no categories but has general purpose indicators
  if (grantCategories.length === 0) {
    // Check if title matches user's focus
    const titleMatch = profile.industryTags.some(tag => {
      const keywords = industryKeywords[tag.toLowerCase()] || [tag.toLowerCase()]
      return keywords.some(kw => titleLower.includes(kw))
    })

    if (titleMatch) {
      return { score: 17, reasons: ['Title matches your focus areas'] }
    }
    // Be stricter - uncategorized grants with no title match get low score
    return { score: 6, reasons: ['General purpose grant - verify relevance'] }
  }

  // Score based on overlap - STRICTER scoring (max 25 points)
  if (matchCount >= 3) {
    return {
      score: 25,
      reasons: [`Excellent match: ${matchedCategories.slice(0, 2).join(', ')}`],
    }
  }
  if (matchCount === 2) {
    return {
      score: 21,
      reasons: [`Strong match: ${matchedCategories.join(', ')}`],
    }
  }
  if (matchCount === 1) {
    return {
      score: 15,
      reasons: [`Matches your focus on ${matchedCategories[0]}`],
    }
  }

  // NO MATCH - very low score (these should generally be filtered out by hard filters)
  return { score: 2, reasons: [] }
}

/**
 * Score geography match (0-15 points)
 */
function scoreGeographyMatch(
  profile: UserProfile,
  grant: GrantForRelevance
): { score: number; reason?: string } {
  const grantLocations = grant.locations || []

  // No restrictions = national/open
  if (grantLocations.length === 0) {
    return { score: 12, reason: 'Available nationwide' }
  }

  // National grants
  if (grantLocations.some(loc => loc.type === 'national')) {
    return { score: 13, reason: 'National grant' }
  }

  // User hasn't specified location
  if (!profile.state) {
    return { score: 8 }
  }

  // State-specific match
  const stateMatch = grantLocations.find(
    loc =>
      loc.type === 'state' &&
      loc.value?.toUpperCase() === profile.state?.toUpperCase()
  )
  if (stateMatch) {
    return { score: 15, reason: `Specifically for ${profile.state}` }
  }

  // Regional proximity (could be enhanced with actual region data)
  return { score: 6 }
}

/**
 * Score grant size match (0-10 points)
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
    return { score: 5 }
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
        return { score: 10 }
      }
      return { score: 3, warning: 'Grant size may not match your preference' }
    }
  }

  // Check against budget (appropriate grant sizes for org budget)
  if (budgetPref) {
    const appropriateSizes = BUDGET_TO_GRANT_SIZE[budgetPref] || []
    const grantSize = getGrantSizeCategory(grantMin, grantMax)

    if (appropriateSizes.includes(grantSize)) {
      return { score: 8 }
    }
    // Large grants for small orgs = warning
    if (grantSize === 'large' && ['under_100k', '100k_500k'].includes(budgetPref)) {
      return { score: 4, warning: 'This is a large grant - may be competitive' }
    }
  }

  return { score: 5 }
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
 * Score purpose/goals match (0-15 points)
 * NEW: Match grant purpose tags against user's goals
 */
function scorePurposeMatch(
  profile: UserProfile,
  grant: GrantForRelevance
): { score: number; reason?: string } {
  const grantPurposeTags = grant.purposeTags || []

  // If grant has no purpose tags, use neutral score
  if (grantPurposeTags.length === 0) {
    return { score: 8 }
  }

  // Get user's goals from industry attributes
  const userGoals = profile.industryAttributes?.goals as string[] | undefined
  if (!userGoals || userGoals.length === 0) {
    return { score: 8 }
  }

  // Expand user goals to purpose tags
  const expandedUserPurposes = new Set<string>()
  for (const goal of userGoals) {
    const purposes = GOALS_TO_PURPOSE_TAGS[goal.toLowerCase()] || [goal.toLowerCase()]
    purposes.forEach(p => expandedUserPurposes.add(p))
  }

  // Count matches
  let matchCount = 0
  const matchedPurposes: string[] = []

  for (const grantPurpose of grantPurposeTags) {
    if (expandedUserPurposes.has(grantPurpose.toLowerCase())) {
      matchCount++
      matchedPurposes.push(grantPurpose)
    }
  }

  // Score based on matches
  if (matchCount >= 2) {
    return { score: 15, reason: `Funds ${matchedPurposes.slice(0, 2).join(' and ')}` }
  }
  if (matchCount === 1) {
    return { score: 12, reason: `Funds ${matchedPurposes[0]}` }
  }

  // No match - lower score
  return { score: 4 }
}

/**
 * Score data quality bonus (0-5 points)
 * NEW: Prefer grants with complete data
 */
function scoreQualityBonus(
  grant: GrantForRelevance
): { score: number } {
  const qualityScore = grant.qualityScore ?? 0.5 // Default to medium quality

  // Convert 0-1 quality score to 0-5 bonus points
  return { score: Math.round(qualityScore * 5) }
}

/**
 * Calculate complete relevance score
 * Total max: 100 points
 * - Entity: 20
 * - Industry: 25
 * - Geography: 15
 * - Size: 10
 * - Purpose: 15
 * - Preferences: 10
 * - Quality: 5
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

  const purpose = scorePurposeMatch(profile, grant)
  if (purpose.reason) matchReasons.push(purpose.reason)

  const preferences = scorePreferencesMatch(profile, grant)

  const quality = scoreQualityBonus(grant)

  const breakdown: ScoringBreakdown = {
    entityMatch: entity.score,
    industryMatch: industry.score,
    geographyMatch: geography.score,
    sizeMatch: size.score,
    purposeMatch: purpose.score,
    preferencesMatch: preferences.score,
    qualityBonus: quality.score,
  }

  const totalScore =
    entity.score +
    industry.score +
    geography.score +
    size.score +
    purpose.score +
    preferences.score +
    quality.score

  return {
    totalScore,
    breakdown,
    matchReasons,
    warnings,
  }
}
