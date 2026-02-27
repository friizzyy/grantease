/**
 * Grant Source Adapter System
 *
 * Simplified to use Gemini AI for all grant discovery.
 * Gemini searches the web in real-time to find grants from:
 * - Federal sources (Grants.gov, SAM.gov, USDA, etc.)
 * - State and local programs
 * - Foundation grants
 * - Corporate giving programs
 */

import { discoverGrants, searchGrantsByKeyword, DiscoveredGrant } from '../gemini-grant-discovery'
import type { UserProfile } from '@/lib/types/onboarding'

// Normalized grant type used across the app
export interface NormalizedGrant {
  id: string
  sourceId: string
  sourceName: string
  sourceLabel: string
  type: 'grant' | 'contract' | 'award'
  title: string
  sponsor: string
  summary: string
  description?: string | null
  categories: string[]
  eligibility: string[]
  locations: string[]
  amountMin: number | null
  amountMax: number | null
  amountText: string | null
  deadlineDate: Date | null
  deadlineType?: 'hard' | 'rolling' | 'continuous'
  openDate?: Date | null
  url: string
  contact?: string | null
  status: 'forecasted' | 'open' | 'closed'
  isLive?: boolean
  confidence?: number
  relevanceScore?: number
  metadata?: Record<string, unknown>
}

// Search parameters
export interface GrantSearchParams {
  keyword?: string
  categories?: string[]
  eligibility?: string[]
  state?: string
  agency?: string
  status?: 'open' | 'forecasted' | 'closed' | 'all'
  amountMin?: number
  amountMax?: number
  limit?: number
  offset?: number
}

// Search result
export interface GrantSearchResult {
  grants: NormalizedGrant[]
  total: number
  source: string
  sourceLabel: string
  cached: boolean
  error?: string
}

/**
 * Convert a discovered grant from Gemini to normalized format
 */
function normalizeDiscoveredGrant(grant: DiscoveredGrant): NormalizedGrant {
  // Parse amount range if provided
  let amountMin: number | null = null
  let amountMax: number | null = null

  if (grant.amountRange) {
    const amounts = grant.amountRange.match(/\$?([\d,]+)/g)
    if (amounts && amounts.length >= 1) {
      amountMin = parseInt(amounts[0].replace(/[$,]/g, ''))
      if (amounts.length >= 2) {
        amountMax = parseInt(amounts[1].replace(/[$,]/g, ''))
      }
    }
  }

  // Parse deadline
  let deadlineDate: Date | null = null
  let deadlineType: 'hard' | 'rolling' | 'continuous' | undefined

  if (grant.deadline) {
    const deadlineLower = grant.deadline.toLowerCase()
    if (deadlineLower.includes('rolling') || deadlineLower.includes('ongoing')) {
      deadlineType = 'rolling'
    } else if (deadlineLower.includes('continuous')) {
      deadlineType = 'continuous'
    } else {
      try {
        deadlineDate = new Date(grant.deadline)
        if (isNaN(deadlineDate.getTime())) {
          deadlineDate = null
        }
        deadlineType = 'hard'
      } catch {
        // Keep null
      }
    }
  }

  return {
    id: `gemini-${Buffer.from(grant.url).toString('base64').slice(0, 20)}`,
    sourceId: grant.url,
    sourceName: 'gemini-discovery',
    sourceLabel: grant.source || 'AI Discovery',
    type: 'grant',
    title: grant.title,
    sponsor: grant.sponsor,
    summary: grant.description,
    description: grant.description,
    categories: grant.categories || [],
    eligibility: grant.eligibility || [],
    locations: [],
    amountMin,
    amountMax,
    amountText: grant.amountRange || null,
    deadlineDate,
    deadlineType,
    url: grant.url,
    status: 'open',
    isLive: true,
    confidence: grant.confidence,
    relevanceScore: grant.relevanceScore,
  }
}

/**
 * Search for grants using Gemini AI
 */
export async function searchGrants(
  params: GrantSearchParams,
  profile?: Partial<UserProfile>
): Promise<GrantSearchResult> {
  try {
    let grants: DiscoveredGrant[] = []

    if (params.keyword) {
      // Keyword search
      const keywordResult = await searchGrantsByKeyword(params.keyword, {
        state: params.state || profile?.state,
        entityType: profile?.entityType,
      })
      grants = keywordResult.grants
    } else if (profile) {
      // Profile-based discovery
      const discoverResult = await discoverGrants(profile as UserProfile, {
        searchFocus: 'all',
      })
      grants = discoverResult.grants
    }

    // Apply filters
    let normalizedGrants = grants.map(normalizeDiscoveredGrant)

    // Filter by status
    if (params.status && params.status !== 'all') {
      normalizedGrants = normalizedGrants.filter(g => g.status === params.status)
    }

    // Filter by amount
    if (params.amountMin) {
      normalizedGrants = normalizedGrants.filter(
        g => !g.amountMax || g.amountMax >= params.amountMin!
      )
    }
    if (params.amountMax) {
      normalizedGrants = normalizedGrants.filter(
        g => !g.amountMin || g.amountMin <= params.amountMax!
      )
    }

    // Filter by categories
    if (params.categories && params.categories.length > 0) {
      normalizedGrants = normalizedGrants.filter(g =>
        g.categories.some(c => params.categories!.includes(c))
      )
    }

    // Apply pagination
    const offset = params.offset || 0
    const limit = params.limit || 25
    const paginatedGrants = normalizedGrants.slice(offset, offset + limit)

    return {
      grants: paginatedGrants,
      total: normalizedGrants.length,
      source: 'gemini-discovery',
      sourceLabel: 'AI-Powered Discovery',
      cached: false,
    }
  } catch (error) {
    console.error('Grant search error:', error)
    return {
      grants: [],
      total: 0,
      source: 'gemini-discovery',
      sourceLabel: 'AI-Powered Discovery',
      cached: false,
      error: error instanceof Error ? error.message : 'Search failed',
    }
  }
}

/**
 * Search all sources (now just uses Gemini)
 */
export async function searchAllSources(
  params: GrantSearchParams,
  profile?: Partial<UserProfile>
): Promise<{
  results: GrantSearchResult[]
  allGrants: NormalizedGrant[]
  totalCount: number
  errors: Array<{ source: string; error: string }>
}> {
  const result = await searchGrants(params, profile)

  return {
    results: [result],
    allGrants: result.grants,
    totalCount: result.total,
    errors: result.error ? [{ source: 'gemini-discovery', error: result.error }] : [],
  }
}

// Legacy exports for backward compatibility
export function getAllSources() {
  return [{
    name: 'gemini-discovery',
    label: 'AI-Powered Discovery',
    description: 'Uses Gemini AI to search the web for grants in real-time',
    type: 'federal' as const,
    requiresApiKey: true,
    apiKeyEnvVar: 'GEMINI_API_KEY',
    isConfigured: () => !!process.env.GEMINI_API_KEY,
  }]
}

export function getConfiguredSources() {
  return getAllSources().filter(s => s.isConfigured())
}

export function getSource(name: string) {
  return getAllSources().find(s => s.name === name)
}
