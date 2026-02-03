/**
 * RELEVANCE ENGINE TYPES
 * ----------------------
 * Type definitions for the grant relevance scoring system
 */

import { UserProfile } from '@/lib/types/onboarding'

// Result of relevance calculation
export interface RelevanceResult {
  // Hard filter result
  isEligible: boolean
  eligibilityReason?: string

  // Soft scoring
  relevanceScore: number // 0-100
  confidenceLevel: 'high' | 'medium' | 'low'

  // Breakdown (total max: 100 points)
  breakdown: {
    entityMatch: number       // 0-20 points
    industryMatch: number     // 0-25 points
    geographyMatch: number    // 0-15 points
    sizeMatch: number         // 0-10 points
    purposeMatch: number      // 0-15 points (NEW)
    preferencesMatch: number  // 0-10 points
    qualityBonus: number      // 0-5 points (NEW)
  }

  // Explanations
  matchReasons: string[]
  warnings: string[]
  suggestions: string[]
}

// Grant data structure (simplified for relevance)
export interface GrantForRelevance {
  id: string
  title: string
  categories: string[]           // Parsed JSON array
  eligibility: {                 // Parsed JSON
    tags: string[]
    rawText?: string
  }
  locations: Array<{             // Parsed JSON array
    type: 'national' | 'state' | 'local'
    value?: string
  }>
  amountMin?: number
  amountMax?: number
  deadlineDate?: Date
  sponsor: string
  url?: string
  // NEW: Discovery enhancements
  fundingType?: string           // grant, loan, rebate, tax_credit, forgivable_loan
  purposeTags?: string[]         // equipment, hiring, R&D, sustainability, expansion, training
  qualityScore?: number          // 0-1 data completeness score
  aiSummary?: string             // Cached 1-2 line summary
}

// Purpose tag constants
export const PURPOSE_TAGS = [
  'equipment',
  'hiring',
  'r&d',
  'sustainability',
  'expansion',
  'training',
  'working_capital',
  'infrastructure',
  'marketing',
  'technology',
] as const

export type PurposeTag = typeof PURPOSE_TAGS[number]

// User goals to purpose tag mapping
export const GOALS_TO_PURPOSE_TAGS: Record<string, string[]> = {
  'equipment': ['equipment', 'technology', 'infrastructure'],
  'expansion': ['expansion', 'working_capital', 'infrastructure'],
  'sustainability': ['sustainability', 'equipment'],
  'workforce': ['hiring', 'training'],
  'research': ['r&d', 'technology'],
  'marketing': ['marketing', 'expansion'],
}

// Mapping from entity types to eligibility tags
export const ENTITY_TO_ELIGIBILITY: Record<string, string[]> = {
  individual: ['Individual'],
  nonprofit: ['Nonprofit 501(c)(3)', 'Nonprofit'],
  small_business: ['Small Business', 'For-Profit Business'],
  for_profit: ['For-Profit Business'],
  educational: ['Educational Institution'],
  government: ['Government Entity'],
  tribal: ['Tribal Organization'],
}

// Mapping from industry tags to grant categories
export const INDUSTRY_TO_CATEGORIES: Record<string, string[]> = {
  agriculture: ['Agriculture', 'Agriculture & Food'],
  arts_culture: ['Arts & Culture', 'Arts'],
  business: ['Business & Entrepreneurship', 'Business', 'Small Business'],
  climate: ['Climate & Environment', 'Climate', 'Environment'],
  community: ['Community Development', 'Community'],
  education: ['Education'],
  health: ['Health & Wellness', 'Health'],
  housing: ['Housing'],
  infrastructure: ['Infrastructure'],
  nonprofit: ['Nonprofit', 'Nonprofit Operations'],
  research: ['Research & Science', 'Research'],
  technology: ['Technology', 'Technology & Innovation'],
  workforce: ['Workforce Development', 'Workforce'],
  youth: ['Youth & Families', 'Youth'],
}

// Grant size ranges
export const GRANT_SIZE_RANGES: Record<string, { min: number; max: number }> = {
  micro: { min: 0, max: 10000 },
  small: { min: 10000, max: 50000 },
  medium: { min: 50000, max: 250000 },
  large: { min: 250000, max: Infinity },
}

// Budget to appropriate grant size mapping
export const BUDGET_TO_GRANT_SIZE: Record<string, string[]> = {
  under_100k: ['micro', 'small'],
  '100k_500k': ['micro', 'small', 'medium'],
  '500k_1m': ['small', 'medium', 'large'],
  '1m_5m': ['medium', 'large'],
  over_5m: ['medium', 'large'],
}
