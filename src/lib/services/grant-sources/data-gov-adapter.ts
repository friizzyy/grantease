/**
 * Data.gov Adapter
 *
 * Adapter for federal grants datasets from Data.gov
 * API KEY: Optional (DEMO_KEY available)
 */

import { dataGovApi, normalizeDataGovDataset } from '../data-gov-api'
import type { GrantSourceAdapter, GrantSearchParams, GrantSearchResult, NormalizedGrant } from './index'

export const dataGovAdapter: GrantSourceAdapter = {
  name: 'data-gov',
  label: 'Data.gov',
  description: 'Federal grants datasets and metadata from Data.gov',
  type: 'federal',
  requiresApiKey: false, // DEMO_KEY available

  isConfigured: () => true,

  search: async (params: GrantSearchParams): Promise<GrantSearchResult> => {
    try {
      const response = await dataGovApi.searchGrantsDatasets(params.keyword, {
        limit: params.limit || 25,
        offset: params.offset || 0,
      })

      const grants: NormalizedGrant[] = response.result.results.map(dataset => {
        const normalized = normalizeDataGovDataset(dataset)
        return {
          id: `data-gov-${normalized.sourceId}`,
          sourceId: normalized.sourceId,
          sourceName: 'data-gov',
          sourceLabel: 'Data.gov',
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
          openDate: normalized.openDate,
          url: normalized.url,
          contact: normalized.contact,
          status: normalized.status,
          isLive: true,
          metadata: {
            formats: normalized.formats,
            resourceCount: normalized.resourceCount,
            csvUrl: normalized.csvUrl,
            jsonUrl: normalized.jsonUrl,
            lastModified: normalized.lastModified,
          },
        }
      })

      return {
        grants,
        total: response.result?.count || 0,
        source: 'data-gov',
        sourceLabel: 'Data.gov',
        cached: false,
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      return {
        grants: [],
        total: 0,
        source: 'data-gov',
        sourceLabel: 'Data.gov',
        cached: false,
        error: errorMsg,
      }
    }
  },

  testConnection: async (): Promise<boolean> => {
    return dataGovApi.testConnection()
  },
}
