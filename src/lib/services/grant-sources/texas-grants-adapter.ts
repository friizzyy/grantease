/**
 * Texas State Grants Adapter
 *
 * Adapter for Texas state grants
 * NO API KEY REQUIRED - Public data
 */

import { texasGrantsService, normalizeTexasGrant } from '../texas-grants-api'
import type { GrantSourceAdapter, GrantSearchParams, GrantSearchResult, NormalizedGrant } from './index'

export const texasGrantsAdapter: GrantSourceAdapter = {
  name: 'texas-grants',
  label: 'Texas Grants',
  description: 'Grant opportunities from Texas state agencies',
  type: 'state',
  region: 'Texas',
  requiresApiKey: false,

  isConfigured: () => true,

  search: async (params: GrantSearchParams): Promise<GrantSearchResult> => {
    try {
      const searchResult = await texasGrantsService.searchGrants({
        keyword: params.keyword,
        agency: params.agency,
        category: params.categories?.[0],
        openOnly: params.status === 'open',
        limit: params.limit || 25,
        offset: params.offset || 0,
      })

      const grants: NormalizedGrant[] = searchResult.grants.map(grant => {
        const normalized = normalizeTexasGrant(grant)
        return {
          id: `tx-${normalized.sourceId}`,
          sourceId: normalized.sourceId,
          sourceName: 'texas-grants',
          sourceLabel: 'Texas Grants',
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
          metadata: {
            agencyCode: normalized.agencyCode,
            fiscalYear: normalized.fiscalYear,
          },
        }
      })

      return {
        grants,
        total: searchResult.total,
        source: 'texas-grants',
        sourceLabel: 'Texas Grants',
        cached: true,
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      return {
        grants: [],
        total: 0,
        source: 'texas-grants',
        sourceLabel: 'Texas Grants',
        cached: false,
        error: errorMsg,
      }
    }
  },

  testConnection: async (): Promise<boolean> => {
    return texasGrantsService.testConnection()
  },
}
