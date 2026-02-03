/**
 * DETERMINISTIC ELIGIBILITY ENGINE
 * ---------------------------------
 * Hard-filter engine that determines grant eligibility using ONLY
 * deterministic rules. LLMs never decide eligibility.
 *
 * PRINCIPLE: Every eligibility decision is explainable and reproducible.
 */

import {
  EntityType,
  IndustryTag,
  GeographyScope,
  ENTITY_TO_ELIGIBILITY_TAGS,
  INDUSTRY_POSITIVE_KEYWORDS,
  INDUSTRY_EXCLUSION_KEYWORDS,
  CATEGORY_TO_INDUSTRY,
  US_STATES,
  normalizeState,
  containsKeywords,
  countKeywordMatches,
  HARD_FILTER_CONFIG,
  ConfidenceLevel,
} from '@/lib/constants/taxonomy'

// ============= TYPES =============

export interface UserProfileForEligibility {
  entityType: EntityType | null
  state: string | null
  industryTags: IndustryTag[]
  certifications?: string[]
  sizeBand?: string | null
  annualBudget?: string | null
}

export interface GrantForEligibility {
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
    type: GeographyScope | string
    value?: string
  }>
  url?: string | null
  status?: string
  qualityScore?: number
  amountMin?: number | null
  amountMax?: number | null
}

export interface EligibilityResult {
  passes: boolean
  reason: string | null
  filterName: string
  confidence: ConfidenceLevel
  details?: Record<string, unknown>
}

export interface FullEligibilityResult {
  isEligible: boolean
  confidenceLevel: ConfidenceLevel
  primaryReason: string | null
  allResults: EligibilityResult[]
  passedFilters: string[]
  failedFilters: string[]
  warnings: string[]
  suggestions: string[]
}

// ============= HARD FILTERS =============

/**
 * Check if grant has a valid application URL
 */
export function checkUrlExists(grant: GrantForEligibility): EligibilityResult {
  const filterName = 'URL_EXISTS'

  if (!grant.url || grant.url.trim() === '') {
    return {
      passes: !HARD_FILTER_CONFIG.REQUIRE_URL, // Configurable
      reason: 'Grant has no application URL available',
      filterName,
      confidence: 'high',
    }
  }

  // Basic URL validation
  try {
    new URL(grant.url)
    return { passes: true, reason: null, filterName, confidence: 'high' }
  } catch {
    return {
      passes: false,
      reason: 'Grant URL is invalid',
      filterName,
      confidence: 'high',
    }
  }
}

/**
 * Check grant status
 */
export function checkGrantStatus(grant: GrantForEligibility): EligibilityResult {
  const filterName = 'GRANT_STATUS'
  const status = (grant.status || 'unknown').toLowerCase()

  if (status === 'open' || status === 'active') {
    return { passes: true, reason: null, filterName, confidence: 'high' }
  }

  if (status === 'closed' || status === 'expired') {
    return {
      passes: false,
      reason: 'Grant is no longer accepting applications',
      filterName,
      confidence: 'high',
    }
  }

  // Unknown status - allow but note uncertainty
  if (HARD_FILTER_CONFIG.ALLOW_UNKNOWN_STATUS) {
    return {
      passes: true,
      reason: 'Grant status is unknown - verify on original site',
      filterName,
      confidence: 'low',
    }
  }

  return {
    passes: false,
    reason: 'Grant status could not be verified',
    filterName,
    confidence: 'medium',
  }
}

/**
 * Check if user's entity type matches grant eligibility
 */
export function checkEntityEligibility(
  profile: UserProfileForEligibility,
  grant: GrantForEligibility
): EligibilityResult {
  const filterName = 'ENTITY_TYPE'

  // No profile entity type - pass but low confidence
  if (!profile.entityType) {
    return {
      passes: true,
      reason: null,
      filterName,
      confidence: 'low',
      details: { skipped: 'No entity type in profile' },
    }
  }

  const grantEligibilityTags = grant.eligibility?.tags || []

  // No eligibility restrictions on grant - open to all
  if (grantEligibilityTags.length === 0) {
    return {
      passes: true,
      reason: null,
      filterName,
      confidence: 'medium',
      details: { note: 'Grant has no eligibility restrictions' },
    }
  }

  // Get compatible eligibility tags for user's entity type
  const userCompatibleTags = ENTITY_TO_ELIGIBILITY_TAGS[profile.entityType] || []

  // Normalize function to handle underscores, hyphens, and spaces consistently
  const normalize = (s: string) => s.toLowerCase().replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim()

  // Check for match (case-insensitive, partial matching)
  const grantTagsNormalized = grantEligibilityTags.map(t => normalize(t))

  for (const userTag of userCompatibleTags) {
    const userTagNormalized = normalize(userTag)

    // Exact match (after normalization)
    if (grantTagsNormalized.includes(userTagNormalized)) {
      return {
        passes: true,
        reason: null,
        filterName,
        confidence: 'high',
        details: { matchedTag: userTag },
      }
    }

    // Partial match (grant tag contains user tag or vice versa)
    for (const grantTag of grantTagsNormalized) {
      if (grantTag.includes(userTagNormalized) || userTagNormalized.includes(grantTag)) {
        return {
          passes: true,
          reason: null,
          filterName,
          confidence: 'high',
          details: { matchedTag: userTag, grantTag },
        }
      }
    }
  }

  // No match found
  const grantTypesDisplay = grantEligibilityTags.slice(0, 3).join(', ')
  return {
    passes: false,
    reason: `This grant is for ${grantTypesDisplay}, but your organization type is ${profile.entityType}`,
    filterName,
    confidence: 'high',
    details: { grantTags: grantEligibilityTags, userEntityType: profile.entityType },
  }
}

/**
 * Check if user's geography matches grant location requirements
 */
export function checkGeographyEligibility(
  profile: UserProfileForEligibility,
  grant: GrantForEligibility
): EligibilityResult {
  const filterName = 'GEOGRAPHY'
  const grantLocations = grant.locations || []

  // No location restrictions - national/open
  if (grantLocations.length === 0) {
    return {
      passes: true,
      reason: null,
      filterName,
      confidence: 'medium',
      details: { note: 'Grant has no location restrictions (assumed national)' },
    }
  }

  // Check for national grants
  const hasNational = grantLocations.some(loc => {
    const type = loc.type?.toLowerCase()
    const value = loc.value?.toLowerCase()
    return (
      type === 'national' ||
      type === 'nationwide' ||
      value === 'national' ||
      value === 'nationwide' ||
      value === 'all states' ||
      value === 'usa' ||
      value === 'united states'
    )
  })

  if (hasNational) {
    return {
      passes: true,
      reason: null,
      filterName,
      confidence: 'high',
      details: { grantScope: 'national' },
    }
  }

  // User hasn't specified location - pass but note
  if (!profile.state) {
    return {
      passes: true,
      reason: null,
      filterName,
      confidence: 'low',
      details: { skipped: 'No state in profile' },
    }
  }

  const userStateCode = normalizeState(profile.state)

  // Check for state match
  for (const loc of grantLocations) {
    if (loc.type === 'state' && loc.value) {
      const grantStateCode = normalizeState(loc.value)
      if (grantStateCode && userStateCode && grantStateCode === userStateCode) {
        return {
          passes: true,
          reason: null,
          filterName,
          confidence: 'high',
          details: { matchedState: userStateCode },
        }
      }
    }
  }

  // Check if there are state restrictions and user doesn't match
  const stateLocations = grantLocations.filter(loc => loc.type === 'state')
  if (stateLocations.length > 0) {
    const grantStates = stateLocations
      .map(loc => loc.value || 'Unknown')
      .slice(0, 3)
      .join(', ')

    return {
      passes: false,
      reason: `This grant is only available in ${grantStates}, but you're in ${profile.state}`,
      filterName,
      confidence: 'high',
      details: { grantStates: stateLocations.map(l => l.value), userState: profile.state },
    }
  }

  // Other location types (county, city, tribal) - pass with low confidence
  return {
    passes: true,
    reason: null,
    filterName,
    confidence: 'low',
    details: { note: 'Grant has location restrictions but unable to verify match' },
  }
}

/**
 * Check if grant is relevant to user's industry/focus areas
 * This is the strictest filter - prevents showing irrelevant grants
 */
export function checkIndustryRelevance(
  profile: UserProfileForEligibility,
  grant: GrantForEligibility
): EligibilityResult {
  const filterName = 'INDUSTRY_RELEVANCE'

  // No industry tags in profile - pass everything
  if (!profile.industryTags || profile.industryTags.length === 0) {
    return {
      passes: true,
      reason: null,
      filterName,
      confidence: 'low',
      details: { skipped: 'No industry tags in profile' },
    }
  }

  // Build combined text for keyword matching
  const titleLower = (grant.title || '').toLowerCase()
  const sponsorLower = (grant.sponsor || '').toLowerCase()
  const summaryLower = (grant.summary || grant.aiSummary || '').toLowerCase()
  const descriptionLower = (grant.description || '').toLowerCase()
  const combinedText = `${titleLower} ${sponsorLower} ${summaryLower} ${descriptionLower}`

  // Check grant categories against user industries
  const grantCategories = grant.categories || []

  for (const userIndustry of profile.industryTags) {
    // Step 1: Check for exclusion keywords first
    const exclusionKeywords = INDUSTRY_EXCLUSION_KEYWORDS[userIndustry] || []
    if (exclusionKeywords.length > 0) {
      const hasExclusion = containsKeywords(combinedText, exclusionKeywords)
      if (hasExclusion) {
        // Check if it also has positive keywords - might be crossover
        const positiveKeywords = INDUSTRY_POSITIVE_KEYWORDS[userIndustry] || []
        const hasPositive = containsKeywords(combinedText, positiveKeywords)

        if (!hasPositive) {
          // Has exclusion but no positive - likely wrong industry
          return {
            passes: false,
            reason: `This grant appears to be for a different industry than ${userIndustry}`,
            filterName,
            confidence: 'medium',
            details: { detectedExclusion: true, userIndustry },
          }
        }
      }
    }

    // Step 2: Check grant categories
    for (const grantCat of grantCategories) {
      const matchingIndustries = CATEGORY_TO_INDUSTRY[grantCat] || []
      if (matchingIndustries.includes(userIndustry)) {
        return {
          passes: true,
          reason: null,
          filterName,
          confidence: 'high',
          details: { matchedCategory: grantCat, userIndustry },
        }
      }

      // Fuzzy category match
      const catLower = grantCat.toLowerCase()
      const industryLower = userIndustry.toLowerCase().replace('_', ' ')
      if (catLower.includes(industryLower) || industryLower.includes(catLower)) {
        return {
          passes: true,
          reason: null,
          filterName,
          confidence: 'high',
          details: { fuzzyMatchedCategory: grantCat, userIndustry },
        }
      }
    }

    // Step 3: Check positive keywords in text
    const positiveKeywords = INDUSTRY_POSITIVE_KEYWORDS[userIndustry] || [userIndustry]
    const matchCount = countKeywordMatches(combinedText, positiveKeywords)

    if (matchCount >= 2) {
      return {
        passes: true,
        reason: null,
        filterName,
        confidence: 'high',
        details: { keywordMatchCount: matchCount, userIndustry },
      }
    }

    if (matchCount === 1) {
      return {
        passes: true,
        reason: null,
        filterName,
        confidence: 'medium',
        details: { keywordMatchCount: matchCount, userIndustry },
      }
    }
  }

  // No industry match found - fail
  const userFocus = profile.industryTags.slice(0, 2).join(', ')
  return {
    passes: false,
    reason: `This grant doesn't appear to be related to ${userFocus}`,
    filterName,
    confidence: 'medium',
    details: { userIndustries: profile.industryTags, grantCategories },
  }
}

/**
 * Check data quality threshold
 */
export function checkDataQuality(grant: GrantForEligibility): EligibilityResult {
  const filterName = 'DATA_QUALITY'
  const qualityScore = grant.qualityScore ?? 0.5

  if (qualityScore < HARD_FILTER_CONFIG.MIN_QUALITY_SCORE) {
    return {
      passes: false,
      reason: 'Grant data quality is too low for reliable matching',
      filterName,
      confidence: 'high',
      details: { qualityScore },
    }
  }

  return {
    passes: true,
    reason: null,
    filterName,
    confidence: 'high',
    details: { qualityScore },
  }
}

/**
 * Check for explicit exclusions in grant text
 */
export function checkExplicitExclusions(
  profile: UserProfileForEligibility,
  grant: GrantForEligibility
): EligibilityResult {
  const filterName = 'EXPLICIT_EXCLUSIONS'

  const eligibilityText = (grant.eligibility?.rawText || '').toLowerCase()
  const descriptionLower = (grant.description || '').toLowerCase()
  const combinedText = `${eligibilityText} ${descriptionLower}`

  // Entity type exclusions
  if (profile.entityType) {
    const entityExclusionPatterns: Record<string, string[]> = {
      'individual': ['not for individuals', 'organizations only', 'entities only', 'businesses only'],
      'for_profit': ['nonprofits only', 'non-profit only', '501(c)(3) only', 'not-for-profit only'],
      'small_business': ['large businesses', 'corporations only', 'enterprises only'],
      'nonprofit': ['for-profit only', 'businesses only', 'commercial entities'],
    }

    const exclusions = entityExclusionPatterns[profile.entityType] || []
    for (const pattern of exclusions) {
      if (combinedText.includes(pattern)) {
        return {
          passes: false,
          reason: `Grant explicitly excludes ${profile.entityType} organizations`,
          filterName,
          confidence: 'high',
          details: { excludedPattern: pattern, entityType: profile.entityType },
        }
      }
    }
  }

  // Geographic exclusions
  if (profile.state) {
    const stateCode = normalizeState(profile.state)
    const stateName = stateCode ? US_STATES[stateCode]?.toLowerCase() : profile.state.toLowerCase()

    const excludePatterns = [
      `excluding ${stateName}`,
      `except ${stateName}`,
      `not available in ${stateName}`,
      `does not include ${stateName}`,
    ]

    for (const pattern of excludePatterns) {
      if (combinedText.includes(pattern)) {
        return {
          passes: false,
          reason: `Grant explicitly excludes ${profile.state}`,
          filterName,
          confidence: 'high',
          details: { excludedPattern: pattern, state: profile.state },
        }
      }
    }
  }

  return {
    passes: true,
    reason: null,
    filterName,
    confidence: 'medium',
  }
}

// ============= MAIN ENGINE =============

/**
 * Run all eligibility filters and return comprehensive result
 */
export function runEligibilityEngine(
  profile: UserProfileForEligibility,
  grant: GrantForEligibility
): FullEligibilityResult {
  const results: EligibilityResult[] = []
  const passedFilters: string[] = []
  const failedFilters: string[] = []
  const warnings: string[] = []
  const suggestions: string[] = []

  // Define filter order (fail-fast order)
  const filters = [
    () => checkGrantStatus(grant),
    () => checkUrlExists(grant),
    () => checkDataQuality(grant),
    () => checkEntityEligibility(profile, grant),
    () => checkGeographyEligibility(profile, grant),
    () => checkExplicitExclusions(profile, grant),
    () => checkIndustryRelevance(profile, grant),
  ]

  let primaryReason: string | null = null
  let isEligible = true
  let lowestConfidence: ConfidenceLevel = 'high'

  for (const runFilter of filters) {
    const result = runFilter()
    results.push(result)

    if (result.passes) {
      passedFilters.push(result.filterName)

      // Track warnings from passing filters
      if (result.reason) {
        warnings.push(result.reason)
      }

      // Track lowest confidence
      if (result.confidence === 'low' || (result.confidence === 'medium' && lowestConfidence === 'high')) {
        lowestConfidence = result.confidence
      }
    } else {
      failedFilters.push(result.filterName)
      isEligible = false

      // Capture first failure reason as primary
      if (!primaryReason && result.reason) {
        primaryReason = result.reason
      }
    }
  }

  // Generate suggestions based on profile gaps
  if (!profile.entityType) {
    suggestions.push('Add your organization type for more accurate matching')
  }
  if (!profile.state) {
    suggestions.push('Add your state/location for regional grant matching')
  }
  if (!profile.industryTags || profile.industryTags.length === 0) {
    suggestions.push('Add your focus areas/industries for better relevance')
  }
  if (profile.industryTags && profile.industryTags.length === 1) {
    suggestions.push('Add more focus areas to discover additional grants')
  }

  return {
    isEligible,
    confidenceLevel: isEligible ? lowestConfidence : 'high',
    primaryReason,
    allResults: results,
    passedFilters,
    failedFilters,
    warnings,
    suggestions: suggestions.slice(0, 2),
  }
}

/**
 * Quick eligibility check - returns just pass/fail
 */
export function quickEligibilityCheck(
  profile: UserProfileForEligibility,
  grant: GrantForEligibility
): boolean {
  const result = runEligibilityEngine(profile, grant)
  return result.isEligible
}

/**
 * Batch eligibility check for multiple grants
 */
export function batchEligibilityCheck(
  profile: UserProfileForEligibility,
  grants: GrantForEligibility[]
): Map<string, FullEligibilityResult> {
  const results = new Map<string, FullEligibilityResult>()

  for (const grant of grants) {
    results.set(grant.id, runEligibilityEngine(profile, grant))
  }

  return results
}

/**
 * Filter grants to only eligible ones
 */
export function filterEligibleGrants(
  profile: UserProfileForEligibility,
  grants: GrantForEligibility[]
): {
  eligible: GrantForEligibility[]
  ineligible: Array<{ grant: GrantForEligibility; reason: string }>
  stats: {
    total: number
    passed: number
    failed: number
    byFilter: Record<string, number>
  }
} {
  const eligible: GrantForEligibility[] = []
  const ineligible: Array<{ grant: GrantForEligibility; reason: string }> = []
  const failuresByFilter: Record<string, number> = {}

  for (const grant of grants) {
    const result = runEligibilityEngine(profile, grant)

    if (result.isEligible) {
      eligible.push(grant)
    } else {
      ineligible.push({
        grant,
        reason: result.primaryReason || 'Unknown eligibility issue',
      })

      // Track which filters caused failures
      for (const filter of result.failedFilters) {
        failuresByFilter[filter] = (failuresByFilter[filter] || 0) + 1
      }
    }
  }

  return {
    eligible,
    ineligible,
    stats: {
      total: grants.length,
      passed: eligible.length,
      failed: ineligible.length,
      byFilter: failuresByFilter,
    },
  }
}
