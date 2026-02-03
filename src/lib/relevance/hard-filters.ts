/**
 * HARD FILTERS
 * ------------
 * Absolute eligibility rules - if these fail, grant is NOT shown
 */

import { UserProfile } from '@/lib/types/onboarding'
import {
  GrantForRelevance,
  ENTITY_TO_ELIGIBILITY,
} from './types'

interface HardFilterResult {
  passes: boolean
  reason?: string
}

/**
 * Check if grant has a valid application URL
 */
export function checkUrlExists(
  grant: GrantForRelevance
): HardFilterResult {
  if (!grant.url || grant.url.trim() === '') {
    return {
      passes: false,
      reason: 'Grant has no application URL available',
    }
  }
  return { passes: true }
}

/**
 * Check if user's entity type matches grant eligibility
 */
export function checkEntityEligibility(
  profile: UserProfile,
  grant: GrantForRelevance
): HardFilterResult {
  if (!profile.entityType) {
    return { passes: true } // No profile = show all
  }

  const eligibleTypes = ENTITY_TO_ELIGIBILITY[profile.entityType] || []
  const grantEligibility = grant.eligibility?.tags || []

  // If grant has no eligibility restrictions, it's open
  if (grantEligibility.length === 0) {
    return { passes: true }
  }

  // Check if any of user's eligible types match grant's requirements
  const hasMatch = eligibleTypes.some(type =>
    grantEligibility.some(grantType =>
      grantType.toLowerCase().includes(type.toLowerCase()) ||
      type.toLowerCase().includes(grantType.toLowerCase())
    )
  )

  if (!hasMatch) {
    return {
      passes: false,
      reason: `This grant is for ${grantEligibility.join(', ')}, but your organization type is ${profile.entityType}`,
    }
  }

  return { passes: true }
}

/**
 * Check if user's geography matches grant location requirements
 */
export function checkGeographyEligibility(
  profile: UserProfile,
  grant: GrantForRelevance
): HardFilterResult {
  const grantLocations = grant.locations || []

  // If no location restrictions, it's open
  if (grantLocations.length === 0) {
    return { passes: true }
  }

  // Check for national grants (always eligible)
  if (grantLocations.some(loc => loc.type === 'national')) {
    return { passes: true }
  }

  // If user hasn't specified location, show all
  if (!profile.state) {
    return { passes: true }
  }

  // Check state matches
  const stateMatch = grantLocations.some(loc =>
    loc.type === 'state' &&
    loc.value?.toUpperCase() === profile.state?.toUpperCase()
  )

  if (!stateMatch && grantLocations.some(loc => loc.type === 'state')) {
    const grantStates = grantLocations
      .filter(loc => loc.type === 'state')
      .map(loc => loc.value)
      .join(', ')

    return {
      passes: false,
      reason: `This grant is only available in ${grantStates}, but you're in ${profile.state}`,
    }
  }

  return { passes: true }
}

/**
 * Check if there's at least some industry overlap
 * STRICT: Grants must have at least some relevance to user's focus areas
 */
export function checkIndustryMinimum(
  profile: UserProfile,
  grant: GrantForRelevance
): HardFilterResult {
  // If user has no industry tags, show all
  if (!profile.industryTags || profile.industryTags.length === 0) {
    return { passes: true }
  }

  // If grant has no categories, check title/sponsor for relevance
  if (!grant.categories || grant.categories.length === 0) {
    // Check if title contains any keywords related to user's industries
    const titleLower = grant.title?.toLowerCase() || ''
    const sponsorLower = (typeof grant.sponsor === 'string' ? grant.sponsor : '').toLowerCase()

    // Industry keyword mapping for title matching
    const industryKeywords: Record<string, string[]> = {
      'agriculture': ['agriculture', 'farm', 'rural', 'crop', 'livestock', 'usda', 'food'],
      'arts_culture': ['arts', 'culture', 'museum', 'heritage', 'creative', 'humanities'],
      'business': ['business', 'entrepreneur', 'commerce', 'economic', 'sbir', 'sttr'],
      'climate': ['climate', 'environment', 'energy', 'conservation', 'sustainability', 'epa'],
      'community': ['community', 'neighborhood', 'civic', 'local', 'regional'],
      'education': ['education', 'school', 'learning', 'training', 'academic', 'student'],
      'health': ['health', 'medical', 'wellness', 'nih', 'clinical', 'disease', 'mental'],
      'housing': ['housing', 'hud', 'shelter', 'homelessness', 'affordable'],
      'infrastructure': ['infrastructure', 'transportation', 'broadband', 'water', 'transit'],
      'nonprofit': ['nonprofit', 'charitable', 'foundation', 'philanthropy'],
      'research': ['research', 'science', 'nsf', 'study', 'innovation', 'r&d'],
      'technology': ['technology', 'tech', 'digital', 'software', 'cyber', 'ai'],
      'workforce': ['workforce', 'job', 'employment', 'career', 'labor', 'training'],
      'youth': ['youth', 'children', 'family', 'child', 'juvenile', 'teen'],
    }

    const hasKeywordMatch = profile.industryTags.some(tag => {
      const keywords = industryKeywords[tag.toLowerCase()] || [tag.toLowerCase()]
      return keywords.some(kw => titleLower.includes(kw) || sponsorLower.includes(kw))
    })

    if (hasKeywordMatch) {
      return { passes: true }
    }

    // Be slightly lenient for uncategorized grants - let them through but lower scoring will handle it
    return { passes: true }
  }

  // Normalize categories for comparison
  const normalizedGrantCategories = grant.categories.map(c => c.toLowerCase())
  const normalizedUserTags = profile.industryTags.map(t => t.toLowerCase())

  // Expanded category matching with aliases
  const categoryAliases: Record<string, string[]> = {
    'agriculture': ['ag', 'farm', 'rural', 'food', 'usda', 'agricultural'],
    'arts_culture': ['arts', 'culture', 'humanities', 'creative', 'heritage', 'museum'],
    'business': ['commerce', 'economic', 'entrepreneurship', 'small business', 'sbir'],
    'climate': ['environment', 'energy', 'conservation', 'sustainability', 'environmental'],
    'community': ['community development', 'civic', 'neighborhood', 'regional'],
    'education': ['ed', 'school', 'academic', 'learning', 'training', 'educational'],
    'health': ['he', 'medical', 'healthcare', 'wellness', 'clinical', 'nih'],
    'housing': ['ho', 'hud', 'affordable housing', 'shelter'],
    'infrastructure': ['transportation', 'broadband', 'water', 'transit'],
    'nonprofit': ['charitable', 'foundation', 'ngo'],
    'research': ['science', 'rd', 'r&d', 'scientific', 'nsf', 'innovation'],
    'technology': ['tech', 'digital', 'cyber', 'software', 'it'],
    'workforce': ['employment', 'job', 'career', 'labor'],
    'youth': ['children', 'family', 'families', 'child', 'juvenile'],
  }

  // Check for overlap using aliases
  const hasOverlap = normalizedUserTags.some(userTag => {
    // Direct match
    if (normalizedGrantCategories.some(grantCat =>
      grantCat.includes(userTag) || userTag.includes(grantCat)
    )) {
      return true
    }

    // Check aliases
    const aliases = categoryAliases[userTag] || []
    return aliases.some(alias =>
      normalizedGrantCategories.some(grantCat =>
        grantCat.includes(alias) || alias.includes(grantCat)
      )
    )
  })

  if (!hasOverlap) {
    const grantCats = grant.categories.slice(0, 3).join(', ')
    const userFocus = profile.industryTags.slice(0, 2).join(', ')
    return {
      passes: false,
      reason: `This grant focuses on ${grantCats}, which doesn't match your ${userFocus} focus areas`,
    }
  }

  return { passes: true }
}

/**
 * Run all hard filters
 */
export function runHardFilters(
  profile: UserProfile,
  grant: GrantForRelevance,
  options?: { requireUrl?: boolean }
): HardFilterResult {
  // URL check (optional, defaults to true for discover page)
  if (options?.requireUrl !== false) {
    const urlCheck = checkUrlExists(grant)
    if (!urlCheck.passes) {
      return urlCheck
    }
  }

  // Entity type check
  const entityCheck = checkEntityEligibility(profile, grant)
  if (!entityCheck.passes) {
    return entityCheck
  }

  // Geography check
  const geoCheck = checkGeographyEligibility(profile, grant)
  if (!geoCheck.passes) {
    return geoCheck
  }

  // Industry minimum (soft - always passes but notes issues)
  const industryCheck = checkIndustryMinimum(profile, grant)
  if (!industryCheck.passes) {
    return industryCheck
  }

  return { passes: true }
}
