/**
 * LLM RESPONSE SCHEMAS
 * --------------------
 * Strict JSON schemas for all LLM outputs.
 * Includes validation functions and type guards.
 *
 * PRINCIPLE: LLMs never decide eligibility - they only summarize and explain.
 * All structured data must be validated.
 */

import { z } from 'zod'
import { ConfidenceLevel, CONFIDENCE_LEVELS } from '@/lib/constants/taxonomy'

// ============= GRANT MATCH RESULT SCHEMA =============

export const GrantMatchResultSchema = z.object({
  grantId: z.string(),

  // Relevance flags (informational only - eligibility decided elsewhere)
  isRelevant: z.boolean(),
  isAccessible: z.boolean(),

  // Scores (0-100)
  matchScore: z.number().min(0).max(100),
  accessibilityScore: z.number().min(0).max(100),

  // Status (informational - real eligibility is deterministic)
  eligibilityStatus: z.enum(['eligible', 'likely_eligible', 'check_requirements', 'uncertain']),

  // Explanations (required)
  fitSummary: z.string().min(10).max(300), // 1-2 sentences
  whyMatch: z.string().min(10).max(150), // Single line explanation

  // Lists
  reasons: z.array(z.string().min(5).max(150)).min(1).max(5),
  concerns: z.array(z.string().max(150)).max(3),
  whatYouCanFund: z.array(z.string().max(100)).max(5),
  nextSteps: z.array(z.string().max(150)).max(5),

  // Metadata
  urgency: z.enum(['high', 'medium', 'low']),
  difficultyLevel: z.enum(['easy', 'moderate', 'complex']),
  estimatedTimeToApply: z.string().max(50),

  // Confidence
  confidence: z.enum(['high', 'medium', 'low']),
})

export type GrantMatchResult = z.infer<typeof GrantMatchResultSchema>

// Array schema
export const GrantMatchResultsSchema = z.array(GrantMatchResultSchema)
export type GrantMatchResults = z.infer<typeof GrantMatchResultsSchema>

// ============= GRANT SUMMARY SCHEMA =============

export const GrantSummarySchema = z.object({
  grantId: z.string(),

  // Plain English summary (required)
  aiSummary: z.string().min(20).max(300),

  // Structured data (extracted, NOT invented)
  fundingMin: z.number().nullable().optional(),
  fundingMax: z.number().nullable().optional(),
  fundingDisplay: z.string().max(100),
  deadlineDisplay: z.string().max(100),
  rolling: z.boolean(),

  // Categories (extracted from grant text, mapped to canonical)
  extractedCategories: z.array(z.string()).max(5),
  extractedEligibility: z.array(z.string()).max(10),
  extractedPurposes: z.array(z.string()).max(5),

  // Flags
  hasCompleteData: z.boolean(),
  missingFields: z.array(z.string()).max(10),
})

export type GrantSummary = z.infer<typeof GrantSummarySchema>

// ============= ELIGIBILITY CHECK SCHEMA =============

export const EligibilityCheckSchema = z.object({
  grantId: z.string(),
  profileId: z.string(),

  // Deterministic checks (these are computed, not LLM-decided)
  entityTypeMatch: z.boolean(),
  geographyMatch: z.boolean(),
  industryMatch: z.boolean(),

  // LLM-provided explanations
  explanation: z.string().max(500),
  suggestedActions: z.array(z.string().max(200)).max(3),

  // Confidence in the analysis
  analysisConfidence: z.enum(['high', 'medium', 'low']),

  // Uncertainties
  uncertainFactors: z.array(z.string().max(150)).max(5),
})

export type EligibilityCheck = z.infer<typeof EligibilityCheckSchema>

// ============= DISCOVER RESPONSE SCHEMA =============

export const DiscoveredGrantSchema = z.object({
  title: z.string().min(5).max(300),
  sponsor: z.string().min(2).max(200),
  description: z.string().min(20).max(1000),
  url: z.string().url(),

  // Optional structured data (must be explicit if missing)
  amountRange: z.string().max(100).nullable().optional(),
  deadline: z.string().max(100).nullable().optional(),

  // Lists
  eligibility: z.array(z.string().max(100)).max(10).optional(),
  categories: z.array(z.string().max(50)).max(5).optional(),

  // Metadata
  source: z.string().max(100),
  confidence: z.number().min(0).max(100),
  relevanceScore: z.number().min(0).max(100),
  discoveredAt: z.string(),
})

export type DiscoveredGrant = z.infer<typeof DiscoveredGrantSchema>

export const DiscoveredGrantsSchema = z.array(DiscoveredGrantSchema)
export type DiscoveredGrants = z.infer<typeof DiscoveredGrantsSchema>

// ============= APPLICATION HELP SCHEMA =============

export const ApplicationHelpSchema = z.object({
  grantId: z.string(),

  // Section-by-section guidance
  sections: z.array(z.object({
    sectionName: z.string(),
    guidance: z.string().max(500),
    tips: z.array(z.string().max(200)).max(3),
    commonMistakes: z.array(z.string().max(200)).max(3),
  })).max(10),

  // Overall tips
  keyTips: z.array(z.string().max(200)).max(5),

  // Required documents
  requiredDocuments: z.array(z.object({
    name: z.string(),
    description: z.string().max(200),
    required: z.boolean(),
  })).max(15),

  // Timeline
  estimatedTime: z.string().max(50),
  suggestedTimeline: z.array(z.object({
    task: z.string(),
    duration: z.string(),
    order: z.number(),
  })).max(10),
})

export type ApplicationHelp = z.infer<typeof ApplicationHelpSchema>

// ============= VALIDATION FUNCTIONS =============

/**
 * Validate and parse LLM response with error handling
 */
export function validateLLMResponse<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  fallback?: T
): { success: true; data: T } | { success: false; error: string; data?: T } {
  try {
    const result = schema.safeParse(data)
    if (result.success) {
      return { success: true, data: result.data }
    }

    const errorMessage = result.error.errors
      .map(e => `${e.path.join('.')}: ${e.message}`)
      .join('; ')

    if (fallback) {
      return { success: false, error: errorMessage, data: fallback }
    }

    return { success: false, error: errorMessage }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown validation error'
    if (fallback) {
      return { success: false, error: message, data: fallback }
    }
    return { success: false, error: message }
  }
}

/**
 * Validate grant match results from LLM
 */
export function validateGrantMatchResults(data: unknown): GrantMatchResults | null {
  const result = validateLLMResponse(GrantMatchResultsSchema, data)
  if (result.success) {
    return result.data
  }
  console.error('Grant match validation failed:', result.error)
  return null
}

/**
 * Validate discovered grants from LLM
 */
export function validateDiscoveredGrants(data: unknown): DiscoveredGrants | null {
  const result = validateLLMResponse(DiscoveredGrantsSchema, data)
  if (result.success) {
    return result.data
  }
  console.error('Discovered grants validation failed:', result.error)
  return null
}

/**
 * Validate a single grant match result
 */
export function validateGrantMatchResult(data: unknown): GrantMatchResult | null {
  const result = validateLLMResponse(GrantMatchResultSchema, data)
  if (result.success) {
    return result.data
  }
  console.error('Grant match result validation failed:', result.error)
  return null
}

// ============= PROMPT TEMPLATES =============

/**
 * Generate the strict JSON schema instruction for LLM prompts
 */
export function getJSONSchemaInstruction(): string {
  return `
## OUTPUT FORMAT REQUIREMENTS

You MUST return valid JSON that matches this exact schema:

\`\`\`json
[
  {
    "grantId": "string (required)",
    "isRelevant": true/false,
    "isAccessible": true/false,
    "matchScore": 0-100,
    "accessibilityScore": 0-100,
    "eligibilityStatus": "eligible" | "likely_eligible" | "check_requirements" | "uncertain",
    "fitSummary": "1-2 sentences explaining the fit (required, 10-300 chars)",
    "whyMatch": "Single line explanation (required, 10-150 chars)",
    "reasons": ["reason1", "reason2"] (1-5 items, each 5-150 chars),
    "concerns": ["concern1"] (0-3 items, each max 150 chars),
    "whatYouCanFund": ["item1", "item2"] (0-5 items),
    "nextSteps": ["step1", "step2"] (0-5 items),
    "urgency": "high" | "medium" | "low",
    "difficultyLevel": "easy" | "moderate" | "complex",
    "estimatedTimeToApply": "e.g., 2-4 hours",
    "confidence": "high" | "medium" | "low"
  }
]
\`\`\`

CRITICAL RULES:
1. Return ONLY the JSON array - no markdown, no explanation, no preamble
2. DO NOT guess or invent missing data - use "Not listed" or null
3. DO NOT decide eligibility - only report what the grant text says
4. Every field is validated - invalid responses will be rejected
5. If uncertain, set confidence to "low" and list uncertainFactors
`.trim()
}

/**
 * Generate fallback grant match result when LLM fails
 */
export function createFallbackMatchResult(grantId: string): GrantMatchResult {
  return {
    grantId,
    isRelevant: false,
    isAccessible: true,
    matchScore: 50,
    accessibilityScore: 50,
    eligibilityStatus: 'uncertain',
    fitSummary: 'Unable to generate AI analysis. Please review the grant details manually.',
    whyMatch: 'Manual review recommended',
    reasons: ['AI analysis unavailable'],
    concerns: [],
    whatYouCanFund: [],
    nextSteps: ['Review the original grant listing for complete details'],
    urgency: 'medium',
    difficultyLevel: 'moderate',
    estimatedTimeToApply: 'Varies',
    confidence: 'low',
  }
}

// ============= TYPE GUARDS =============

export function isGrantMatchResult(obj: unknown): obj is GrantMatchResult {
  return GrantMatchResultSchema.safeParse(obj).success
}

export function isDiscoveredGrant(obj: unknown): obj is DiscoveredGrant {
  return DiscoveredGrantSchema.safeParse(obj).success
}

export function isValidConfidenceLevel(level: string): level is ConfidenceLevel {
  return CONFIDENCE_LEVELS.includes(level as ConfidenceLevel)
}
