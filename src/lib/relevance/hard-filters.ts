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
 * This is a softer filter - at least one tag should match
 */
export function checkIndustryMinimum(
  profile: UserProfile,
  grant: GrantForRelevance
): HardFilterResult {
  // If user has no industry tags, show all
  if (!profile.industryTags || profile.industryTags.length === 0) {
    return { passes: true }
  }

  // If grant has no categories, show it (general/open grant)
  if (!grant.categories || grant.categories.length === 0) {
    return { passes: true }
  }

  // Normalize categories for comparison
  const normalizedGrantCategories = grant.categories.map(c => c.toLowerCase())
  const normalizedUserTags = profile.industryTags.map(t => t.toLowerCase())

  // Check for any overlap (including partial matches)
  const hasOverlap = normalizedUserTags.some(userTag =>
    normalizedGrantCategories.some(grantCat =>
      grantCat.includes(userTag) || userTag.includes(grantCat)
    )
  )

  // For now, we'll make this a soft warning rather than hard filter
  // to avoid hiding potentially relevant grants
  return { passes: true }
}

/**
 * Run all hard filters
 */
export function runHardFilters(
  profile: UserProfile,
  grant: GrantForRelevance
): HardFilterResult {
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
