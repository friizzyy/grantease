/**
 * Candid (Foundation Directory) Adapter
 *
 * Adapter for foundation grants from Candid
 * REQUIRES API KEY - Contact Candid for subscription
 */

import { candidApi, normalizeCandidTransaction, normalizeCandidFunder } from '../candid-api'
import type { GrantSourceAdapter, GrantSearchParams, GrantSearchResult, NormalizedGrant } from './index'

export const candidAdapter: GrantSourceAdapter = {
  name: 'candid',
  label: 'Candid',
  description: 'Foundation grants and funders from Candid (Foundation Directory)',
  type: 'foundation',
  requiresApiKey: true,
  apiKeyEnvVar: 'CANDID_API_KEY',

  isConfigured: () => candidApi.isConfigured(),

  search: async (params: GrantSearchParams): Promise<GrantSearchResult> => {
    if (!candidApi.isConfigured()) {
      return {
        grants: [],
        total: 0,
        source: 'candid',
        sourceLabel: 'Candid',
        cached: false,
        error: 'Candid API key not configured. Set CANDID_API_KEY in environment variables.',
      }
    }

    try {
      // Search both transactions and funders for comprehensive results
      const [transactionsResponse, fundersResponse] = await Promise.all([
        candidApi.searchTransactions({
          keyword: params.keyword,
          state: params.state,
          minAmount: params.amountMin,
          maxAmount: params.amountMax,
          perPage: Math.ceil((params.limit || 25) / 2),
          page: params.offset ? Math.floor(params.offset / ((params.limit || 25) / 2)) + 1 : 1,
        }),
        candidApi.searchFunders({
          keyword: params.keyword,
          state: params.state,
          perPage: Math.ceil((params.limit || 25) / 2),
          page: params.offset ? Math.floor(params.offset / ((params.limit || 25) / 2)) + 1 : 1,
        }),
      ])

      const grants: NormalizedGrant[] = []

      // Add transaction results
      transactionsResponse.transactions?.forEach(transaction => {
        const normalized = normalizeCandidTransaction(transaction)
        grants.push({
          id: `candid-tx-${normalized.sourceId}`,
          sourceId: normalized.sourceId,
          sourceName: 'candid',
          sourceLabel: 'Candid',
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
            type: 'transaction',
            yearAuthorized: normalized.yearAuthorized,
            funderEin: normalized.funderEin,
            recipientEin: normalized.recipientEin,
          },
        })
      })

      // Add funder results (as funding opportunities)
      fundersResponse.funders?.forEach(funder => {
        const normalized = normalizeCandidFunder(funder)
        grants.push({
          id: `candid-funder-${normalized.sourceId}`,
          sourceId: normalized.sourceId,
          sourceName: 'candid',
          sourceLabel: 'Candid',
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
            type: 'funder',
            ein: normalized.ein,
            totalAssets: normalized.totalAssets,
            acceptsUnsolicited: normalized.acceptsUnsolicited,
          },
        })
      })

      const total = (transactionsResponse.total_count || 0) + (fundersResponse.total_count || 0)

      return {
        grants,
        total,
        source: 'candid',
        sourceLabel: 'Candid',
        cached: false,
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      return {
        grants: [],
        total: 0,
        source: 'candid',
        sourceLabel: 'Candid',
        cached: false,
        error: errorMsg,
      }
    }
  },

  testConnection: async (): Promise<boolean> => {
    return candidApi.testConnection()
  },
}
