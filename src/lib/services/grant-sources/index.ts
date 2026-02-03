/**
 * Grant Source Adapter System
 *
 * A unified interface for searching grants across multiple data sources.
 * Makes it easy to add new grant sources with consistent behavior.
 *
 * To add a new source:
 * 1. Create a service file (e.g., new-source-api.ts)
 * 2. Implement the GrantSourceAdapter interface
 * 3. Register it in GRANT_SOURCES below
 */

// Normalized grant type used across all sources
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
  // Source-specific metadata
  metadata?: Record<string, unknown>
}

// Search parameters common to all sources
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

// Search result from a source
export interface GrantSearchResult {
  grants: NormalizedGrant[]
  total: number
  source: string
  sourceLabel: string
  cached: boolean
  error?: string
}

// Grant source adapter interface
export interface GrantSourceAdapter {
  name: string
  label: string
  description: string
  type: 'federal' | 'state' | 'foundation' | 'corporate' | 'international'
  region?: string // For state-specific sources
  requiresApiKey: boolean
  apiKeyEnvVar?: string
  isConfigured: () => boolean
  search: (params: GrantSearchParams) => Promise<GrantSearchResult>
  testConnection: () => Promise<boolean>
}

// Import individual source adapters
import { grantsGovAdapter } from './grants-gov-adapter'
import { samGovAdapter } from './sam-gov-adapter'
import { usaSpendingAdapter } from './usaspending-adapter'
import { californiaGrantsAdapter } from './california-grants-adapter'
import { nihReporterAdapter } from './nih-reporter-adapter'
import { dataGovAdapter } from './data-gov-adapter'
import { candidAdapter } from './candid-adapter'
import { nyGrantsAdapter } from './ny-grants-adapter'
import { texasGrantsAdapter } from './texas-grants-adapter'
import { usdaGrantsAdapter } from './usda-grants-adapter'

// Register all available grant sources
export const GRANT_SOURCES: Record<string, GrantSourceAdapter> = {
  // Federal sources
  'grants-gov': grantsGovAdapter,
  'sam-gov': samGovAdapter,
  'usaspending': usaSpendingAdapter,
  'nih-reporter': nihReporterAdapter,
  'data-gov': dataGovAdapter,
  'usda-grants': usdaGrantsAdapter, // Agriculture-focused USDA grants
  // State sources
  'california-grants': californiaGrantsAdapter,
  'ny-state-grants': nyGrantsAdapter,
  'texas-grants': texasGrantsAdapter,
  // Foundation sources
  'candid': candidAdapter,
}

// Get list of all sources
export function getAllSources(): GrantSourceAdapter[] {
  return Object.values(GRANT_SOURCES)
}

// Get configured sources only
export function getConfiguredSources(): GrantSourceAdapter[] {
  return Object.values(GRANT_SOURCES).filter(s => s.isConfigured())
}

// Get sources by type
export function getSourcesByType(type: GrantSourceAdapter['type']): GrantSourceAdapter[] {
  return Object.values(GRANT_SOURCES).filter(s => s.type === type)
}

// Get source by name
export function getSource(name: string): GrantSourceAdapter | undefined {
  return GRANT_SOURCES[name]
}

// Search across multiple sources
export async function searchAllSources(
  params: GrantSearchParams,
  sourceNames?: string[]
): Promise<{
  results: GrantSearchResult[]
  allGrants: NormalizedGrant[]
  totalCount: number
  errors: Array<{ source: string; error: string }>
}> {
  const sources = sourceNames
    ? sourceNames.map(n => GRANT_SOURCES[n]).filter(Boolean)
    : getConfiguredSources()

  const results: GrantSearchResult[] = []
  const errors: Array<{ source: string; error: string }> = []

  // Search all sources in parallel
  const searchPromises = sources.map(async (source) => {
    try {
      const result = await source.search(params)
      results.push(result)
      if (result.error) {
        errors.push({ source: source.name, error: result.error })
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      errors.push({ source: source.name, error: errorMsg })
      results.push({
        grants: [],
        total: 0,
        source: source.name,
        sourceLabel: source.label,
        cached: false,
        error: errorMsg,
      })
    }
  })

  await Promise.all(searchPromises)

  // Combine all grants and sort by deadline
  const allGrants = results
    .flatMap(r => r.grants)
    .sort((a, b) => {
      // Open grants first, then by deadline
      if (a.status !== b.status) {
        if (a.status === 'open') return -1
        if (b.status === 'open') return 1
      }
      const dateA = a.deadlineDate ? new Date(a.deadlineDate).getTime() : Infinity
      const dateB = b.deadlineDate ? new Date(b.deadlineDate).getTime() : Infinity
      return dateA - dateB
    })

  const totalCount = results.reduce((sum, r) => sum + r.total, 0)

  return { results, allGrants, totalCount, errors }
}
