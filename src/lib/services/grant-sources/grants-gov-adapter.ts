/**
 * Grants.gov Adapter
 *
 * Adapter for the federal Grants.gov API
 * NO API KEY REQUIRED for search2 endpoint
 */

import { grantsGovApi, normalizeGrantsGovOpportunity } from '../grants-gov-api'
import type { GrantSourceAdapter, GrantSearchParams, GrantSearchResult, NormalizedGrant } from './index'

export const grantsGovAdapter: GrantSourceAdapter = {
  name: 'grants-gov',
  label: 'Grants.gov',
  description: 'Federal grant opportunities from all U.S. government agencies',
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

      // Map categories to Grants.gov funding category codes
      // Common codes: AG (Agriculture), ED (Education), HE (Health), ENV (Environment), etc.
      let fundingCategories: string | undefined
      if (params.categories && params.categories.length > 0) {
        // Map common category names to Grants.gov codes
        const categoryMap: Record<string, string> = {
          'agriculture': 'AG',
          'ag': 'AG',
          'education': 'ED',
          'health': 'HE',
          'environment': 'ENV',
          'science': 'ST',
          'technology': 'ST',
          'community development': 'CD',
          'housing': 'HO',
          'energy': 'EN',
          'transportation': 'TR',
          'natural resources': 'NR',
          'food': 'FN',
          'nutrition': 'FN',
        }
        const codes = params.categories
          .map(cat => categoryMap[cat.toLowerCase()] || cat)
          .filter(Boolean)
        if (codes.length > 0) {
          fundingCategories = codes.join('|')
        }
      }

      const response = await grantsGovApi.searchOpportunities({
        keywords: params.keyword,
        agency: params.agency,
        fundingCategories,
        oppStatuses,
        rows: params.limit || 25,
        startRecordNum: params.offset || 0,
      })

      const opportunities = response.data?.oppHits || response.hitOppHitList || []

      const grants: NormalizedGrant[] = opportunities.map(opp => {
        const normalized = normalizeGrantsGovOpportunity(opp)
        return {
          id: `grants-gov-${normalized.sourceId}`,
          sourceId: normalized.sourceId,
          sourceName: 'grants-gov',
          sourceLabel: 'Grants.gov',
          type: 'grant',
          title: normalized.title,
          sponsor: normalized.sponsor,
          summary: normalized.summary || '',
          description: normalized.description,
          categories: normalized.categories,
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
        source: 'grants-gov',
        sourceLabel: 'Grants.gov',
        cached: false,
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      return {
        grants: [],
        total: 0,
        source: 'grants-gov',
        sourceLabel: 'Grants.gov',
        cached: false,
        error: errorMsg,
      }
    }
  },

  testConnection: async (): Promise<boolean> => {
    return grantsGovApi.testConnection()
  },
}
