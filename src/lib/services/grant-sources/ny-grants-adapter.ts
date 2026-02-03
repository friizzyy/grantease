/**
 * New York State Grants Adapter
 *
 * Adapter for New York state grants
 * NO API KEY REQUIRED - Public data
 */

import { nyStateGrantsService, normalizeNYStateGrant } from '../ny-grants-api'
import type { GrantSourceAdapter, GrantSearchParams, GrantSearchResult, NormalizedGrant } from './index'

export const nyGrantsAdapter: GrantSourceAdapter = {
  name: 'ny-state-grants',
  label: 'New York Grants',
  description: 'Grant opportunities from New York State agencies',
  type: 'state',
  region: 'New York',
  requiresApiKey: false,

  isConfigured: () => true,

  search: async (params: GrantSearchParams): Promise<GrantSearchResult> => {
    try {
      const searchResult = await nyStateGrantsService.searchGrants({
        keyword: params.keyword,
        agency: params.agency,
        category: params.categories?.[0],
        openOnly: params.status === 'open',
        limit: params.limit || 25,
        offset: params.offset || 0,
      })

      const grants: NormalizedGrant[] = searchResult.grants.map(grant => {
        const normalized = normalizeNYStateGrant(grant)
        return {
          id: `ny-${normalized.sourceId}`,
          sourceId: normalized.sourceId,
          sourceName: 'ny-state-grants',
          sourceLabel: 'New York Grants',
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
            agencyAcronym: normalized.agencyAcronym,
            programYear: normalized.programYear,
          },
        }
      })

      return {
        grants,
        total: searchResult.total,
        source: 'ny-state-grants',
        sourceLabel: 'New York Grants',
        cached: true,
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      return {
        grants: [],
        total: 0,
        source: 'ny-state-grants',
        sourceLabel: 'New York Grants',
        cached: false,
        error: errorMsg,
      }
    }
  },

  testConnection: async (): Promise<boolean> => {
    return nyStateGrantsService.testConnection()
  },
}
