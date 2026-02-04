/**
 * DETERMINISTIC SCORING ENGINE
 * ----------------------------
 * Weighted scoring system for grant relevance.
 * Produces stable, reproducible scores.
 *
 * PRINCIPLE: Same inputs always produce same outputs.
 * PRINCIPLE: Every score component is explainable.
 */

import {
  EntityType,
  IndustryTag,
  ENTITY_TO_ELIGIBILITY_TAGS,
  INDUSTRY_POSITIVE_KEYWORDS,
  CATEGORY_TO_INDUSTRY,
  GOALS_TO_PURPOSE,
  BUDGET_TO_GRANT_SIZE,
  getGrantSizeCategory,
  containsKeywords,
  countKeywordMatches,
  SCORING_WEIGHTS,
  ConfidenceLevel,
  BudgetRange,
  PurposeTag,
  formatFundingDisplay,
} from '@/lib/constants/taxonomy'

// ============= TYPES =============

export interface UserProfileForScoring {
  entityType: EntityType | null
  state: string | null
  industryTags: IndustryTag[]
  certifications?: string[]
  sizeBand?: string | null
  annualBudget?: BudgetRange | null
  goals?: string[]
  grantPreferences?: {
    preferredSize?: string | null
    timeline?: 'immediate' | 'quarter' | 'year' | 'flexible' | null
    complexity?: 'simple' | 'moderate' | 'complex' | null
  }
}

export interface GrantForScoring {
  id: string
  title: string
  sponsor: string
  summary?: string | null
  description?: string | null
  aiSummary?: string | null
  categories: string[]
  eligibility: {
    tags: string[]
    rawText?: string
  }
  locations: Array<{
    type: string
    value?: string
  }>
  amountMin?: number | null
  amountMax?: number | null
  amountText?: string | null
  fundingType?: string | null
  purposeTags?: PurposeTag[]
  deadlineDate?: Date | null
  qualityScore?: number
  status?: string
}

export interface ScoringBreakdown {
  entityMatch: number      // 0-20
  industryMatch: number    // 0-25
  geographyMatch: number   // 0-15
  sizeMatch: number        // 0-10
  purposeMatch: number     // 0-15
  preferencesMatch: number // 0-10
  qualityBonus: number     // 0-5
}

export interface ScoringResult {
  totalScore: number       // 0-100
  breakdown: ScoringBreakdown
  matchReasons: string[]
  warnings: string[]
  confidenceLevel: ConfidenceLevel
  tier: 'excellent' | 'good' | 'fair' | 'low'
  tierLabel: string
}

// ============= SCORING COMPONENTS =============

/**
 * Score entity type match (0-20 points)
 */
function scoreEntityMatch(
  profile: UserProfileForScoring,
  grant: GrantForScoring
): { score: number; reason?: string } {
  const MAX_POINTS = SCORING_WEIGHTS.ENTITY_MATCH

  // No profile entity type - neutral score
  if (!profile.entityType) {
    return { score: Math.round(MAX_POINTS * 0.5) }
  }

  const userCompatibleTags = ENTITY_TO_ELIGIBILITY_TAGS[profile.entityType] || []
  const grantEligibilityTags = grant.eligibility?.tags || []

  // Normalize function to handle underscores, hyphens, and spaces consistently
  const normalize = (s: string) => s.toLowerCase().replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim()

  // No grant restrictions - open to all
  if (grantEligibilityTags.length === 0) {
    return {
      score: Math.round(MAX_POINTS * 0.8),
      reason: 'Open to all organization types',
    }
  }

  const grantTagsNormalized = grantEligibilityTags.map(t => normalize(t))

  // Check for exact match (after normalization)
  for (const userTag of userCompatibleTags) {
    if (grantTagsNormalized.includes(normalize(userTag))) {
      return {
        score: MAX_POINTS,
        reason: 'Perfect match for your organization type',
      }
    }
  }

  // Check for partial match
  for (const userTag of userCompatibleTags) {
    const userTagNormalized = normalize(userTag)
    for (const grantTag of grantTagsNormalized) {
      if (grantTag.includes(userTagNormalized) || userTagNormalized.includes(grantTag)) {
        return {
          score: Math.round(MAX_POINTS * 0.75),
          reason: 'Good match for your organization type',
        }
      }
    }
  }

  // No match - low score
  return { score: Math.round(MAX_POINTS * 0.2) }
}

/**
 * Score industry/category match (0-25 points)
 */
function scoreIndustryMatch(
  profile: UserProfileForScoring,
  grant: GrantForScoring
): { score: number; reasons: string[] } {
  const MAX_POINTS = SCORING_WEIGHTS.INDUSTRY_MATCH
  const reasons: string[] = []

  // No industry tags - neutral score
  if (!profile.industryTags || profile.industryTags.length === 0) {
    return { score: Math.round(MAX_POINTS * 0.5), reasons: [] }
  }

  const grantCategories = grant.categories || []
  const titleLower = (grant.title || '').toLowerCase()
  const sponsorLower = (grant.sponsor || '').toLowerCase()
  const summaryLower = (grant.summary || grant.aiSummary || '').toLowerCase()
  const combinedText = `${titleLower} ${sponsorLower} ${summaryLower}`

  let matchCount = 0
  const matchedCategories: string[] = []

  for (const userIndustry of profile.industryTags) {
    // Check grant categories
    for (const grantCat of grantCategories) {
      const matchingIndustries = CATEGORY_TO_INDUSTRY[grantCat] || []
      if (matchingIndustries.includes(userIndustry)) {
        matchCount++
        matchedCategories.push(grantCat)
        break
      }

      // Fuzzy match
      const catLower = grantCat.toLowerCase()
      const industryLower = userIndustry.toLowerCase().replace('_', ' ')
      if (catLower.includes(industryLower) || industryLower.includes(catLower)) {
        matchCount++
        matchedCategories.push(grantCat)
        break
      }
    }

    // Check keywords in text
    const keywords = INDUSTRY_POSITIVE_KEYWORDS[userIndustry] || [userIndustry]
    const keywordMatches = countKeywordMatches(combinedText, keywords)
    if (keywordMatches >= 2) {
      matchCount++
      if (!matchedCategories.includes(userIndustry)) {
        matchedCategories.push(userIndustry)
      }
    }
  }

  // Score based on match quality
  if (matchCount >= 3) {
    reasons.push(`Excellent match: ${matchedCategories.slice(0, 2).join(', ')}`)
    return { score: MAX_POINTS, reasons }
  }
  if (matchCount === 2) {
    reasons.push(`Strong match: ${matchedCategories.join(', ')}`)
    return { score: Math.round(MAX_POINTS * 0.85), reasons }
  }
  if (matchCount === 1) {
    reasons.push(`Matches your focus on ${matchedCategories[0]}`)
    return { score: Math.round(MAX_POINTS * 0.6), reasons }
  }

  // No match - low score
  return { score: Math.round(MAX_POINTS * 0.1), reasons: [] }
}

/**
 * Score geography match (0-15 points)
 */
function scoreGeographyMatch(
  profile: UserProfileForScoring,
  grant: GrantForScoring
): { score: number; reason?: string } {
  const MAX_POINTS = SCORING_WEIGHTS.GEOGRAPHY_MATCH
  const grantLocations = grant.locations || []

  // No restrictions - national
  if (grantLocations.length === 0) {
    return {
      score: Math.round(MAX_POINTS * 0.8),
      reason: 'Available nationwide',
    }
  }

  // Check for national grants
  const hasNational = grantLocations.some(loc => {
    const type = loc.type?.toLowerCase()
    const value = loc.value?.toLowerCase()
    return type === 'national' || value === 'national' || value === 'nationwide'
  })

  if (hasNational) {
    return {
      score: Math.round(MAX_POINTS * 0.85),
      reason: 'National grant',
    }
  }

  // User hasn't specified location
  if (!profile.state) {
    return { score: Math.round(MAX_POINTS * 0.5) }
  }

  // Check for state match
  const userState = profile.state.toUpperCase()
  const stateMatch = grantLocations.find(loc =>
    loc.type === 'state' &&
    loc.value?.toUpperCase() === userState
  )

  if (stateMatch) {
    return {
      score: MAX_POINTS,
      reason: `Specifically for ${profile.state}`,
    }
  }

  // Regional proximity (simplified)
  return { score: Math.round(MAX_POINTS * 0.4) }
}

/**
 * Score grant size appropriateness (0-10 points)
 */
function scoreSizeMatch(
  profile: UserProfileForScoring,
  grant: GrantForScoring
): { score: number; warning?: string } {
  const MAX_POINTS = SCORING_WEIGHTS.SIZE_MATCH

  // Check user's budget preference
  const budgetPref = profile.annualBudget
  const sizePref = profile.grantPreferences?.preferredSize

  // No preferences - neutral
  if (!budgetPref && !sizePref) {
    return { score: Math.round(MAX_POINTS * 0.5) }
  }

  const grantSize = getGrantSizeCategory(grant.amountMin, grant.amountMax)

  // Check against size preference
  if (sizePref && sizePref !== 'any') {
    if (sizePref === grantSize) {
      return { score: MAX_POINTS }
    }
    // Partial match
    return { score: Math.round(MAX_POINTS * 0.5) }
  }

  // Check against budget (appropriate grant sizes for org budget)
  if (budgetPref) {
    const appropriateSizes = BUDGET_TO_GRANT_SIZE[budgetPref] || []
    if (appropriateSizes.includes(grantSize)) {
      return { score: Math.round(MAX_POINTS * 0.8) }
    }

    // Large grants for small orgs - warning
    if (grantSize === 'large' && ['under_50k', '50k_100k'].includes(budgetPref)) {
      return {
        score: Math.round(MAX_POINTS * 0.4),
        warning: 'This is a large grant - may be competitive',
      }
    }
  }

  return { score: Math.round(MAX_POINTS * 0.5) }
}

/**
 * Score purpose/goals match (0-15 points)
 */
function scorePurposeMatch(
  profile: UserProfileForScoring,
  grant: GrantForScoring
): { score: number; reason?: string } {
  const MAX_POINTS = SCORING_WEIGHTS.PURPOSE_MATCH
  const grantPurposeTags = grant.purposeTags || []

  // No grant purpose tags - neutral
  if (grantPurposeTags.length === 0) {
    return { score: Math.round(MAX_POINTS * 0.5) }
  }

  // Get user's goals
  const userGoals = profile.goals || []
  if (userGoals.length === 0) {
    return { score: Math.round(MAX_POINTS * 0.5) }
  }

  // Expand user goals to purpose tags
  const expandedUserPurposes = new Set<string>()
  for (const goal of userGoals) {
    const purposes = GOALS_TO_PURPOSE[goal.toLowerCase()] || [goal.toLowerCase()]
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

  if (matchCount >= 2) {
    return {
      score: MAX_POINTS,
      reason: `Funds ${matchedPurposes.slice(0, 2).join(' and ')}`,
    }
  }
  if (matchCount === 1) {
    return {
      score: Math.round(MAX_POINTS * 0.8),
      reason: `Funds ${matchedPurposes[0]}`,
    }
  }

  return { score: Math.round(MAX_POINTS * 0.3) }
}

/**
 * Score preferences match (0-10 points)
 */
function scorePreferencesMatch(
  profile: UserProfileForScoring,
  grant: GrantForScoring
): { score: number } {
  const MAX_POINTS = SCORING_WEIGHTS.PREFERENCES_MATCH
  let score = Math.round(MAX_POINTS * 0.5) // Base score

  // Timeline preference
  if (profile.grantPreferences?.timeline && grant.deadlineDate) {
    const daysUntilDeadline = Math.ceil(
      (new Date(grant.deadlineDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )

    const timeline = profile.grantPreferences.timeline
    if (timeline === 'immediate' && daysUntilDeadline <= 60) {
      score += 3
    } else if (timeline === 'quarter' && daysUntilDeadline <= 180) {
      score += 2
    } else if (timeline === 'flexible') {
      score += 2
    } else if (timeline === 'year') {
      score += 1
    }
  }

  return { score: Math.min(MAX_POINTS, score) }
}

/**
 * Calculate data quality bonus (0-5 points)
 */
function calculateQualityBonus(grant: GrantForScoring): { score: number } {
  const MAX_POINTS = SCORING_WEIGHTS.QUALITY_BONUS
  const rawScore = grant.qualityScore ?? 50

  // qualityScore is stored as 0-100 in database, convert to 0-1 ratio
  const normalizedScore = rawScore > 1 ? rawScore / 100 : rawScore

  // Convert to bonus points (0-5)
  return { score: Math.round(normalizedScore * MAX_POINTS) }
}

// ============= MAIN SCORING ENGINE =============

/**
 * Calculate complete relevance score for a grant
 */
export function calculateScore(
  profile: UserProfileForScoring,
  grant: GrantForScoring
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

  const quality = calculateQualityBonus(grant)

  // Build breakdown
  const breakdown: ScoringBreakdown = {
    entityMatch: entity.score,
    industryMatch: industry.score,
    geographyMatch: geography.score,
    sizeMatch: size.score,
    purposeMatch: purpose.score,
    preferencesMatch: preferences.score,
    qualityBonus: quality.score,
  }

  // Calculate total (clamped to 0-100)
  const rawTotal = Object.values(breakdown).reduce((sum, val) => sum + val, 0)
  const totalScore = Math.min(100, Math.max(0, rawTotal))

  // Determine confidence level based on profile completeness
  const confidenceLevel = determineConfidenceLevel(profile)

  // Determine tier
  const { tier, tierLabel } = determineTier(totalScore)

  return {
    totalScore,
    breakdown,
    matchReasons: matchReasons.slice(0, 5),
    warnings,
    confidenceLevel,
    tier,
    tierLabel,
  }
}

/**
 * Determine confidence level based on profile completeness
 */
function determineConfidenceLevel(profile: UserProfileForScoring): ConfidenceLevel {
  let completeness = 0

  if (profile.entityType) completeness++
  if (profile.state) completeness++
  if (profile.industryTags && profile.industryTags.length > 0) completeness++
  if (profile.sizeBand || profile.annualBudget) completeness++
  if (profile.grantPreferences?.preferredSize) completeness++

  if (completeness >= 4) return 'high'
  if (completeness >= 2) return 'medium'
  return 'low'
}

/**
 * Determine score tier for display
 */
function determineTier(score: number): { tier: 'excellent' | 'good' | 'fair' | 'low'; tierLabel: string } {
  if (score >= 80) return { tier: 'excellent', tierLabel: 'Excellent Match' }
  if (score >= 60) return { tier: 'good', tierLabel: 'Good Match' }
  if (score >= 40) return { tier: 'fair', tierLabel: 'Fair Match' }
  return { tier: 'low', tierLabel: 'Low Match' }
}

/**
 * Score and sort multiple grants
 */
export function scoreAndSortGrants(
  profile: UserProfileForScoring,
  grants: GrantForScoring[]
): Array<GrantForScoring & { scoring: ScoringResult }> {
  const scored = grants.map(grant => ({
    ...grant,
    scoring: calculateScore(profile, grant),
  }))

  // Sort by total score descending
  scored.sort((a, b) => b.scoring.totalScore - a.scoring.totalScore)

  return scored
}

/**
 * Get top N grants by score
 */
export function getTopGrants(
  profile: UserProfileForScoring,
  grants: GrantForScoring[],
  limit: number = 20,
  minScore: number = 30
): Array<GrantForScoring & { scoring: ScoringResult }> {
  const scored = scoreAndSortGrants(profile, grants)
  return scored
    .filter(g => g.scoring.totalScore >= minScore)
    .slice(0, limit)
}

/**
 * Get score breakdown explanation
 */
export function explainScore(breakdown: ScoringBreakdown): string[] {
  const explanations: string[] = []

  if (breakdown.entityMatch >= 18) {
    explanations.push('Excellent organization type match')
  } else if (breakdown.entityMatch >= 12) {
    explanations.push('Good organization type compatibility')
  }

  if (breakdown.industryMatch >= 20) {
    explanations.push('Strong alignment with your focus areas')
  } else if (breakdown.industryMatch >= 15) {
    explanations.push('Relevant to your industry')
  }

  if (breakdown.geographyMatch >= 12) {
    explanations.push('Available in your location')
  }

  if (breakdown.purposeMatch >= 12) {
    explanations.push('Funds your stated needs')
  }

  return explanations
}
