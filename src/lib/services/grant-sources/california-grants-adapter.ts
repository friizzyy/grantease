/**
 * California Grants Portal Adapter
 *
 * Adapter for California state grants from data.ca.gov
 * NO API KEY REQUIRED - free public data
 */

import { californiaGrantsService, normalizeCaliforniaGrant } from '../california-grants-api'
import type { GrantSourceAdapter, GrantSearchParams, GrantSearchResult, NormalizedGrant } from './index'

export const californiaGrantsAdapter: GrantSourceAdapter = {
  name: 'california-grants',
  label: 'California Grants',
  description: 'Grant opportunities from California state agencies',
  type: 'state',
  region: 'California',
  requiresApiKey: false,

  isConfigured: () => true, // Always available, no API key needed

  search: async (params: GrantSearchParams): Promise<GrantSearchResult> => {
    try {
      // Map generic params to California-specific params
      const searchResult = await californiaGrantsService.searchGrants({
        keyword: params.keyword,
        category: params.categories?.[0],
        applicantType: params.eligibility?.[0],
        openOnly: params.status === 'open',
        limit: params.limit || 25,
        offset: params.offset || 0,
      })

      const grants: NormalizedGrant[] = searchResult.grants.map(grant => {
        const normalized = normalizeCaliforniaGrant(grant)
        return {
          id: `california-${normalized.sourceId}`,
          sourceId: normalized.sourceId,
          sourceName: 'california-grants',
          sourceLabel: 'California Grants',
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
            fundingSource: normalized.fundingSource,
            matchingRequired: normalized.matchingRequired,
          },
        }
      })

      return {
        grants,
        total: searchResult.total,
        source: 'california-grants',
        sourceLabel: 'California Grants',
        cached: true, // Data is cached from daily CSV
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      return {
        grants: [],
        total: 0,
        source: 'california-grants',
        sourceLabel: 'California Grants',
        cached: false,
        error: errorMsg,
      }
    }
  },

  testConnection: async (): Promise<boolean> => {
    return californiaGrantsService.testConnection()
  },
}
