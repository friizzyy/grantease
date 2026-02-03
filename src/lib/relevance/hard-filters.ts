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
 * POSITIVE keywords that indicate a grant IS relevant to an industry
 * A grant must contain at least one of these to pass the filter
 */
const INDUSTRY_POSITIVE_KEYWORDS: Record<string, string[]> = {
  'agriculture': [
    'agriculture', 'agricultural', 'farm', 'farmer', 'farming', 'ranch', 'rancher',
    'rural development', 'rural community', 'crop', 'crops', 'livestock', 'cattle',
    'poultry', 'usda', 'food production', 'food supply', 'agribusiness', 'soil',
    'irrigation', 'harvest', 'seed', 'grain', 'dairy', 'organic farm',
    'conservation land', 'land conservation', 'pasture', 'grazing', 'horticulture',
    'commodity', 'agricultural land', 'farmland', 'beginning farmer', 'young farmer',
    'agricultural research', 'food security', 'rural business', 'agricu',
    'vineyard', 'orchard', 'nursery', 'aquaculture', 'fishery', 'forestry',
    'timber', 'woodland', 'agroforestry', 'pollinator', 'bee', 'cooperative extension',
  ],
  'arts_culture': [
    'arts', 'art ', 'culture', 'cultural', 'museum', 'heritage', 'creative', 'humanities',
    'artistic', 'theater', 'theatre', 'music', 'visual arts', 'performing arts',
    'nea', 'neh', 'endowment', 'gallery', 'exhibition', 'literary', 'dance',
    'symphony', 'orchestra', 'opera', 'film', 'media arts', 'folk art',
  ],
  'business': [
    'business', 'entrepreneur', 'commerce', 'economic development', 'sbir', 'sttr',
    'small business', 'startup', 'commercialization', 'sba', 'export',
    'trade', 'manufacturing', 'industry', 'enterprise', 'venture',
  ],
  'climate': [
    'climate', 'environment', 'environmental', 'energy', 'conservation', 'sustainability',
    'epa', 'renewable', 'clean energy', 'carbon', 'emissions', 'green', 'solar',
    'wind energy', 'geothermal', 'recycling', 'waste reduction', 'pollution',
  ],
  'community': [
    'community development', 'community service', 'neighborhood', 'civic', 'regional development',
    'block grant', 'cdbg', 'local government', 'municipal', 'town', 'village',
  ],
  'education': [
    'education', 'school', 'learning', 'training', 'academic', 'student',
    'teacher', 'curriculum', 'educational', 'k-12', 'higher education', 'university',
    'college', 'classroom', 'literacy', 'stem education',
  ],
  'health': [
    'health', 'medical', 'wellness', 'nih', 'clinical', 'disease', 'mental health',
    'healthcare', 'hospital', 'patient', 'treatment', 'therapy', 'nursing',
    'public health', 'medicine', 'biomedical', 'pharmaceutical',
  ],
  'housing': [
    'housing', 'hud', 'shelter', 'homelessness', 'affordable housing',
    'rent', 'mortgage', 'homeowner', 'residential', 'apartment', 'dwelling',
  ],
  'infrastructure': [
    'infrastructure', 'transportation', 'broadband', 'water system', 'transit',
    'highway', 'bridge', 'road', 'utility', 'sewer', 'electric grid',
  ],
  'nonprofit': [
    'nonprofit', 'non-profit', 'charitable', 'philanthropy', '501c', '501(c)',
    'voluntary', 'civil society', 'ngo',
  ],
  'research': [
    'research', 'science', 'nsf', 'study', 'r&d', 'scientific',
    'laboratory', 'experiment', 'investigation', 'academic research',
  ],
  'technology': [
    'technology', 'tech', 'digital', 'software', 'cyber', 'artificial intelligence',
    'data', 'computing', 'information technology', 'internet', 'broadband',
    'telecommunications', 'innovation',
  ],
  'workforce': [
    'workforce', 'job training', 'employment', 'career', 'labor', 'worker',
    'apprenticeship', 'vocational', 'skills training', 'job placement',
  ],
  'youth': [
    'youth', 'children', 'child', 'family', 'families', 'juvenile', 'teen',
    'adolescent', 'young people', 'minor', 'kids', 'afterschool',
  ],
}

/**
 * EXCLUSION keywords - if a grant contains these AND doesn't contain positive keywords,
 * it's likely NOT relevant to the user's industry
 */
const INDUSTRY_EXCLUSION_KEYWORDS: Record<string, string[]> = {
  'agriculture': [
    // Medical/health research that's not agriculture-related
    'cancer treatment', 'cancer therapy', 'chemotherapy', 'tumor', 'oncology',
    'hiv treatment', 'aids research', 'hiv/aids', 'alzheimer', 'dementia',
    'clinical trial', 'drug trial', 'pharmaceutical development', 'drug development',
    'patient care', 'hospital bed', 'nursing care', 'surgery', 'surgical',
    'mental illness', 'psychiatric', 'addiction treatment', 'substance abuse treatment',
    // Pure tech/cyber
    'cybersecurity', 'cyber attack', 'video game', 'gaming', 'social media platform',
    'app development', 'mobile app', 'website development',
    // Arts & Culture (not ag-related)
    'museum exhibit', 'art gallery', 'theater production', 'symphony', 'opera',
    'film festival', 'dance performance', 'visual arts exhibition',
    // Urban/metro (not rural)
    'urban renewal', 'metropolitan', 'subway system', 'city transit', 'metro area',
    // Defense/military (not ag)
    'weapons system', 'missile defense', 'military combat', 'armed forces equipment',
    // Construction (not farm)
    'fence repair', 'fence construction', 'fencing contract', 'boundary fence',
  ],
  'health': [
    'crop production', 'livestock management', 'farm equipment', 'irrigation system',
    'timber harvest', 'mining operation', 'oil extraction', 'coal mining',
  ],
  'technology': [
    'livestock', 'crop yield', 'farm equipment', 'agricultural production',
    'nursing home', 'patient care facility', 'medical equipment maintenance',
  ],
  'arts_culture': [
    'clinical trial', 'drug development', 'medical device', 'patient outcome',
    'farm equipment', 'livestock', 'crop production', 'agricultural chemicals',
  ],
}

/**
 * Check if there's at least some industry overlap
 * STRICT: Grants must have clear relevance to user's focus areas
 * Uses positive keyword matching AND exclusion filtering
 */
export function checkIndustryMinimum(
  profile: UserProfile,
  grant: GrantForRelevance
): HardFilterResult {
  // If user has no industry tags, show all
  if (!profile.industryTags || profile.industryTags.length === 0) {
    return { passes: true }
  }

  const titleLower = grant.title?.toLowerCase() || ''
  const sponsorLower = (typeof grant.sponsor === 'string' ? grant.sponsor : '').toLowerCase()
  const summaryLower = (grant.aiSummary || '').toLowerCase()
  const combinedText = `${titleLower} ${sponsorLower} ${summaryLower}`

  const normalizedUserTags = profile.industryTags.map(t => t.toLowerCase())

  // Step 1: Check for EXCLUSION keywords first
  // If grant has exclusion keywords AND no positive keywords, reject it
  for (const userTag of normalizedUserTags) {
    const exclusions = INDUSTRY_EXCLUSION_KEYWORDS[userTag] || []
    const hasExclusion = exclusions.some(excl => combinedText.includes(excl))

    if (hasExclusion) {
      // Check if it ALSO has positive keywords - might be a crossover grant
      const positiveKeywords = INDUSTRY_POSITIVE_KEYWORDS[userTag] || []
      const hasPositive = positiveKeywords.some(kw => combinedText.includes(kw))

      if (!hasPositive) {
        return {
          passes: false,
          reason: `This grant appears to be for a different industry than ${userTag}`,
        }
      }
    }
  }

  // Step 2: Check grant categories if available
  if (grant.categories && grant.categories.length > 0) {
    const normalizedGrantCategories = grant.categories.map(c => c.toLowerCase())

    // Category aliases for matching
    const categoryAliases: Record<string, string[]> = {
      'agriculture': ['ag', 'farm', 'rural', 'food', 'usda', 'agricultural', 'agricu', 'natural resources'],
      'arts_culture': ['arts', 'culture', 'humanities', 'creative', 'heritage', 'museum', 'nea', 'neh'],
      'business': ['commerce', 'economic', 'entrepreneurship', 'small business', 'sbir', 'sba'],
      'climate': ['environment', 'energy', 'conservation', 'sustainability', 'environmental', 'epa'],
      'community': ['community development', 'civic', 'neighborhood', 'regional', 'cdbg'],
      'education': ['ed', 'school', 'academic', 'learning', 'training', 'educational'],
      'health': ['he', 'medical', 'healthcare', 'wellness', 'clinical', 'nih', 'hhs'],
      'housing': ['ho', 'hud', 'affordable housing', 'shelter', 'residential'],
      'infrastructure': ['transportation', 'broadband', 'water', 'transit', 'dot'],
      'nonprofit': ['charitable', 'foundation', 'ngo', '501c'],
      'research': ['science', 'rd', 'r&d', 'scientific', 'nsf'],
      'technology': ['tech', 'digital', 'cyber', 'software', 'it', 'innovation'],
      'workforce': ['employment', 'job', 'career', 'labor', 'dol'],
      'youth': ['children', 'family', 'families', 'child', 'juvenile', 'acf'],
    }

    // Check for category overlap
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

    if (hasOverlap) {
      return { passes: true }
    }
  }

  // Step 3: Check for positive keyword matches in title/sponsor/summary
  const hasPositiveMatch = normalizedUserTags.some(userTag => {
    const keywords = INDUSTRY_POSITIVE_KEYWORDS[userTag] || [userTag]
    return keywords.some(kw => combinedText.includes(kw))
  })

  if (hasPositiveMatch) {
    return { passes: true }
  }

  // NO MATCH - this grant doesn't appear relevant to user's focus areas
  const userFocus = profile.industryTags.slice(0, 2).join(', ')
  return {
    passes: false,
    reason: `This grant doesn't appear to be related to ${userFocus}`,
  }
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
