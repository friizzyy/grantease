/**
 * USAspending.gov Adapter
 *
 * Adapter for USAspending.gov - federal spending data on awards
 * NO API KEY REQUIRED - free public access
 *
 * Note: USAspending shows AWARDED grants (historical), not open opportunities
 */

import { usaSpendingApi, normalizeUSASpendingAward, GRANT_AWARD_TYPES } from '../usaspending-api'
import type { GrantSourceAdapter, GrantSearchParams, GrantSearchResult, NormalizedGrant } from './index'

export const usaSpendingAdapter: GrantSourceAdapter = {
  name: 'usaspending',
  label: 'USAspending.gov',
  description: 'Historical federal grant awards and spending data',
  type: 'federal',
  requiresApiKey: false,

  isConfigured: () => true, // Always available, no API key needed

  search: async (params: GrantSearchParams): Promise<GrantSearchResult> => {
    try {
      const searchParams: Parameters<typeof usaSpendingApi.searchAwards>[0] = {
        limit: params.limit || 25,
        page: Math.floor((params.offset || 0) / (params.limit || 25)) + 1,
      }

      // Add keyword search
      if (params.keyword) {
        searchParams.keywords = [params.keyword]
      }

      // Add state filter
      if (params.state) {
        searchParams.recipient_locations = [{
          country: 'USA',
          state: params.state,
        }]
      }

      // Add amount filter
      if (params.amountMin || params.amountMax) {
        searchParams.award_amounts = [{
          lower_bound: params.amountMin,
          upper_bound: params.amountMax,
        }]
      }

      const response = await usaSpendingApi.searchAwards(searchParams)

      const grants: NormalizedGrant[] = response.results.map(award => {
        const normalized = normalizeUSASpendingAward(award)
        return {
          id: `usaspending-${normalized.sourceId}`,
          sourceId: normalized.sourceId,
          sourceName: 'usaspending',
          sourceLabel: 'USAspending.gov',
          type: 'award',
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
          openDate: normalized.openDate,
          url: normalized.url,
          contact: normalized.contact,
          status: normalized.status,
          isLive: true,
          metadata: {
            recipientName: normalized.recipientName,
            awardType: normalized.awardType,
            awardTypeLabel: GRANT_AWARD_TYPES[normalized.awardType as keyof typeof GRANT_AWARD_TYPES],
            internalId: normalized.internalId,
          },
        }
      })

      return {
        grants,
        total: response.page_metadata?.total || 0,
        source: 'usaspending',
        sourceLabel: 'USAspending.gov',
        cached: false,
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      return {
        grants: [],
        total: 0,
        source: 'usaspending',
        sourceLabel: 'USAspending.gov',
        cached: false,
        error: errorMsg,
      }
    }
  },

  testConnection: async (): Promise<boolean> => {
    return usaSpendingApi.testConnection()
  },
}
