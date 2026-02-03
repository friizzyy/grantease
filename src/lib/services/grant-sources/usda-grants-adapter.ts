/**
 * USDA Grants Adapter
 *
 * Specialized adapter for USDA and agriculture-related grants
 * Uses Grants.gov API filtered by USDA agency codes and agriculture categories
 * NO API KEY REQUIRED
 */

import { grantsGovApi, normalizeGrantsGovOpportunity } from '../grants-gov-api'
import type { GrantSourceAdapter, GrantSearchParams, GrantSearchResult, NormalizedGrant } from './index'

// USDA agency codes on Grants.gov
const USDA_AGENCY_CODES = [
  'USDA', // Main USDA
  'USDA-AMS', // Agricultural Marketing Service
  'USDA-APHIS', // Animal and Plant Health Inspection Service
  'USDA-ARS', // Agricultural Research Service
  'USDA-ERS', // Economic Research Service
  'USDA-FAS', // Foreign Agricultural Service
  'USDA-FNS', // Food and Nutrition Service
  'USDA-FS', // Forest Service
  'USDA-FSA', // Farm Service Agency
  'USDA-NASS', // National Agricultural Statistics Service
  'USDA-NIFA', // National Institute of Food and Agriculture
  'USDA-NRCS', // Natural Resources Conservation Service
  'USDA-RD', // Rural Development
  'USDA-RMA', // Risk Management Agency
]

// Agriculture-related funding categories on Grants.gov
const AGRICULTURE_CATEGORIES = [
  'AG', // Agriculture
  'NR', // Natural Resources
  'FN', // Food and Nutrition
  'ENV', // Environment
  'RD', // Regional Development
  'CD', // Community Development
  'ED', // Education (for ag education programs)
  'ST', // Science and Technology
]

export const usdaGrantsAdapter: GrantSourceAdapter = {
  name: 'usda-grants',
  label: 'USDA Agriculture Grants',
  description: 'Federal agriculture grants from USDA and related agencies',
  type: 'federal',
  requiresApiKey: false,

  isConfigured: () => true, // Always available, no API key needed

  search: async (params: GrantSearchParams): Promise<GrantSearchResult> => {
    try {
      // Map status to Grants.gov format
      let oppStatuses = 'posted'
      if (params.status === 'forecasted') oppStatuses = 'forecasted'
      else if (params.status === 'closed') oppStatuses = 'closed'
      else if (params.status === 'all') oppStatuses = 'posted|forecasted|closed'

      // Build keyword with agriculture focus
      let keyword = params.keyword || ''

      // If no keyword provided, search for broad agriculture terms
      if (!keyword) {
        keyword = 'agriculture OR farm OR rural OR crop OR livestock'
      }

      // Search with USDA agency filter
      const response = await grantsGovApi.searchOpportunities({
        keywords: keyword,
        agency: 'USDA', // Filter to USDA
        fundingCategories: 'AG', // Agriculture category
        oppStatuses,
        rows: params.limit || 50,
        startRecordNum: params.offset || 0,
      })

      const opportunities = response.data?.oppHits || response.hitOppHitList || []

      const grants: NormalizedGrant[] = opportunities.map(opp => {
        const normalized = normalizeGrantsGovOpportunity(opp)
        return {
          id: `usda-${normalized.sourceId}`,
          sourceId: normalized.sourceId,
          sourceName: 'usda-grants',
          sourceLabel: 'USDA Agriculture Grants',
          type: 'grant',
          title: normalized.title,
          sponsor: normalized.sponsor,
          summary: normalized.summary || '',
          description: normalized.description,
          categories: [...normalized.categories, 'Agriculture'],
          eligibility: normalized.eligibility,
          locations: normalized.locations,
          amountMin: normalized.amountMin,
          amountMax: normalized.amountMax,
          amountText: normalized.amountText,
          deadlineDate: normalized.deadlineDate,
          deadlineType: normalized.deadlineType as 'hard' | 'rolling' | 'continuous' | undefined,
          openDate: normalized.openDate,
          url: normalized.url,
          contact: normalized.contact,
          status: normalized.status,
          isLive: true,
        }
      })

      return {
        grants,
        total: response.data?.hitCount || response.totalCount || 0,
        source: 'usda-grants',
        sourceLabel: 'USDA Agriculture Grants',
        cached: false,
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      return {
        grants: [],
        total: 0,
        source: 'usda-grants',
        sourceLabel: 'USDA Agriculture Grants',
        cached: false,
        error: errorMsg,
      }
    }
  },

  testConnection: async (): Promise<boolean> => {
    return grantsGovApi.testConnection()
  },
}

/**
 * Search for agriculture grants across multiple categories
 * This function provides more comprehensive agriculture grant coverage
 */
export async function searchAgricultureGrants(
  keyword?: string,
  options: { limit?: number; offset?: number; status?: 'open' | 'forecasted' | 'closed' | 'all' } = {}
): Promise<GrantSearchResult> {
  const { limit = 100, offset = 0, status = 'open' } = options

  let oppStatuses = 'posted'
  if (status === 'forecasted') oppStatuses = 'forecasted'
  else if (status === 'closed') oppStatuses = 'closed'
  else if (status === 'all') oppStatuses = 'posted|forecasted|closed'

  try {
    // Search multiple agriculture-related terms
    const agricultureKeywords = keyword
      ? keyword
      : 'agriculture farm rural crop livestock food nutrition forestry conservation'

    const response = await grantsGovApi.searchOpportunities({
      keywords: agricultureKeywords,
      fundingCategories: 'AG', // Agriculture funding category
      oppStatuses,
      rows: limit,
      startRecordNum: offset,
    })

    const opportunities = response.data?.oppHits || response.hitOppHitList || []

    const grants: NormalizedGrant[] = opportunities.map(opp => {
      const normalized = normalizeGrantsGovOpportunity(opp)
      return {
        id: `ag-${normalized.sourceId}`,
        sourceId: normalized.sourceId,
        sourceName: 'agriculture-grants',
        sourceLabel: 'Agriculture Grants',
        type: 'grant',
        title: normalized.title,
        sponsor: normalized.sponsor,
        summary: normalized.summary || '',
        description: normalized.description,
        categories: [...normalized.categories, 'Agriculture'],
        eligibility: normalized.eligibility,
        locations: normalized.locations,
        amountMin: normalized.amountMin,
        amountMax: normalized.amountMax,
        amountText: normalized.amountText,
        deadlineDate: normalized.deadlineDate,
        deadlineType: normalized.deadlineType as 'hard' | 'rolling' | 'continuous' | undefined,
        openDate: normalized.openDate,
        url: normalized.url,
        contact: normalized.contact,
        status: normalized.status,
        isLive: true,
      }
    })

    return {
      grants,
      total: response.data?.hitCount || response.totalCount || 0,
      source: 'agriculture-grants',
      sourceLabel: 'Agriculture Grants',
      cached: false,
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error'
    return {
      grants: [],
      total: 0,
      source: 'agriculture-grants',
      sourceLabel: 'Agriculture Grants',
      cached: false,
      error: errorMsg,
    }
  }
}
