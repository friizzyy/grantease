/**
 * SAM.gov Adapter
 *
 * Adapter for the SAM.gov Contract Opportunities API
 * REQUIRES API KEY - register at SAM.gov
 */

import { samGovApi, normalizeSamGovOpportunity, PROCUREMENT_TYPES } from '../sam-gov-api'
import type { GrantSourceAdapter, GrantSearchParams, GrantSearchResult, NormalizedGrant } from './index'

export const samGovAdapter: GrantSourceAdapter = {
  name: 'sam-gov',
  label: 'SAM.gov',
  description: 'Federal contract opportunities and procurement notices',
  type: 'federal',
  requiresApiKey: true,
  apiKeyEnvVar: 'SAM_GOV_API_KEY',

  isConfigured: () => !!process.env.SAM_GOV_API_KEY,

  search: async (params: GrantSearchParams): Promise<GrantSearchResult> => {
    if (!process.env.SAM_GOV_API_KEY) {
      return {
        grants: [],
        total: 0,
        source: 'sam-gov',
        sourceLabel: 'SAM.gov',
        cached: false,
        error: 'SAM.gov API key not configured. Set SAM_GOV_API_KEY in environment variables.',
      }
    }

    try {
      const response = await samGovApi.searchOpportunities({
        keyword: params.keyword,
        state: params.state,
        ptype: 'o,k', // Solicitations and Combined Synopsis/Solicitation
        limit: params.limit || 25,
        offset: params.offset || 0,
      })

      const opportunities = response.opportunitiesData || []

      const grants: NormalizedGrant[] = opportunities.map(opp => {
        const normalized = normalizeSamGovOpportunity(opp)
        return {
          id: `sam-gov-${normalized.sourceId}`,
          sourceId: normalized.sourceId,
          sourceName: 'sam-gov',
          sourceLabel: 'SAM.gov',
          type: 'contract',
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
            solicitationNumber: normalized.solicitationNumber,
            naicsCode: normalized.naicsCode,
            setAsideType: normalized.setAsideType,
            procurementType: normalized.procurementType,
            procurementTypeLabel: PROCUREMENT_TYPES[normalized.procurementType as keyof typeof PROCUREMENT_TYPES],
          },
        }
      })

      return {
        grants,
        total: response.totalRecords || 0,
        source: 'sam-gov',
        sourceLabel: 'SAM.gov',
        cached: false,
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      return {
        grants: [],
        total: 0,
        source: 'sam-gov',
        sourceLabel: 'SAM.gov',
        cached: false,
        error: errorMsg,
      }
    }
  },

  testConnection: async (): Promise<boolean> => {
    if (!process.env.SAM_GOV_API_KEY) return false
    return samGovApi.testConnection()
  },
}
