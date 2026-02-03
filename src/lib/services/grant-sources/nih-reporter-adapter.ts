/**
 * NIH RePORTER Adapter
 *
 * Adapter for NIH-funded research projects
 * NO API KEY REQUIRED - Free public access
 */

import { nihReporterApi, normalizeNIHProject } from '../nih-reporter-api'
import type { GrantSourceAdapter, GrantSearchParams, GrantSearchResult, NormalizedGrant } from './index'

export const nihReporterAdapter: GrantSourceAdapter = {
  name: 'nih-reporter',
  label: 'NIH RePORTER',
  description: 'NIH-funded research projects and grants',
  type: 'federal',
  requiresApiKey: false,

  isConfigured: () => true,

  search: async (params: GrantSearchParams): Promise<GrantSearchResult> => {
    try {
      const response = await nihReporterApi.searchProjects({
        keyword: params.keyword,
        states: params.state ? [params.state] : undefined,
        isActive: params.status === 'open' ? true : undefined,
        limit: params.limit || 25,
        offset: params.offset || 0,
      })

      const grants: NormalizedGrant[] = response.results.map(project => {
        const normalized = normalizeNIHProject(project)
        return {
          id: `nih-${normalized.sourceId}`,
          sourceId: normalized.sourceId,
          sourceName: 'nih-reporter',
          sourceLabel: 'NIH RePORTER',
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
            projectNumber: normalized.projectNumber,
            fiscalYear: normalized.fiscalYear,
            isActive: normalized.isActive,
            activityCode: normalized.activityCode,
            instituteCode: normalized.instituteCode,
          },
        }
      })

      return {
        grants,
        total: response.meta?.total || 0,
        source: 'nih-reporter',
        sourceLabel: 'NIH RePORTER',
        cached: false,
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      return {
        grants: [],
        total: 0,
        source: 'nih-reporter',
        sourceLabel: 'NIH RePORTER',
        cached: false,
        error: errorMsg,
      }
    }
  },

  testConnection: async (): Promise<boolean> => {
    return nihReporterApi.testConnection()
  },
}
