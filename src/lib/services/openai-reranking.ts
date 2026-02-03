/**
 * OPENAI RERANKING SERVICE
 * ------------------------
 * Uses OpenAI to rerank top grant candidates and generate
 * personalized summaries and fit explanations.
 */

import OpenAI from 'openai'
import { UserProfile } from '@/lib/types/onboarding'
import { CachedMatchResult, getCachedMatches, setCachedMatches } from './match-cache'

interface GrantForReranking {
  id: string
  title: string
  sponsor: string
  summary: string
  categories: string[]
  eligibility: string[]
  amountMin?: number
  amountMax?: number
  deadlineDate?: Date
  url?: string
  updatedAt: Date
}

export interface RerankResult extends CachedMatchResult {
  cached: boolean
}

interface OpenAIRerankResponse {
  grantId: string
  score: number
  summary: string
  fitExplanation: string
  eligibilityStatus: 'eligible' | 'likely_eligible' | 'check_requirements' | 'not_eligible'
  nextSteps: string[]
  whatYouCanFund: string[]
  applicationTips: string[]
  urgency: 'high' | 'medium' | 'low'
}

// Lazy-load OpenAI client to avoid build-time errors
let openaiInstance: OpenAI | null = null

function getOpenAI(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) {
    return null
  }
  if (!openaiInstance) {
    openaiInstance = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return openaiInstance
}

/**
 * Check if OpenAI is configured
 */
export function isOpenAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY
}

/**
 * Rerank grants using OpenAI with caching
 */
export async function rerankWithLLM(
  userId: string,
  profile: UserProfile,
  grants: GrantForReranking[],
  profileVersion: number,
  maxResults: number = 20
): Promise<RerankResult[]> {
  if (grants.length === 0) {
    return []
  }

  const grantIds = grants.map((g) => g.id)

  // Check cache first
  const cachedMatches = await getCachedMatches(userId, grantIds, profileVersion)

  // Separate cached and uncached grants
  const cachedResults: RerankResult[] = []
  const uncachedGrants: GrantForReranking[] = []

  for (const grant of grants) {
    const cached = cachedMatches.get(grant.id)
    if (cached) {
      cachedResults.push({ ...cached, cached: true })
    } else {
      uncachedGrants.push(grant)
    }
  }

  // If all cached, return sorted
  if (uncachedGrants.length === 0) {
    return sortAndLimit(cachedResults, maxResults)
  }

  // Generate matches for uncached grants
  let newResults: RerankResult[] = []

  if (isOpenAIConfigured()) {
    try {
      newResults = await generateAIMatches(profile, uncachedGrants)

      // Store in cache
      await setCachedMatches(
        userId,
        profileVersion,
        newResults.map((r) => ({
          ...r,
          grantUpdatedAt: uncachedGrants.find((g) => g.id === r.grantId)?.updatedAt || new Date(),
        }))
      )
    } catch (error) {
      console.error('OpenAI reranking failed, using fallback:', error)
      newResults = generateFallbackMatches(profile, uncachedGrants)
    }
  } else {
    newResults = generateFallbackMatches(profile, uncachedGrants)
  }

  // Combine and sort all results
  const allResults = [...cachedResults, ...newResults]
  return sortAndLimit(allResults, maxResults)
}

/**
 * Generate AI-powered match analysis
 */
async function generateAIMatches(
  profile: UserProfile,
  grants: GrantForReranking[]
): Promise<RerankResult[]> {
  const profileSummary = buildProfileSummary(profile)

  // Process in batches of 10 to avoid token limits
  const batchSize = 10
  const results: RerankResult[] = []

  for (let i = 0; i < grants.length; i += batchSize) {
    const batch = grants.slice(i, i + batchSize)
    const batchResults = await processGrantBatch(profileSummary, batch)
    results.push(...batchResults)
  }

  return results
}

/**
 * Process a batch of grants with OpenAI
 */
async function processGrantBatch(
  profileSummary: string,
  grants: GrantForReranking[]
): Promise<RerankResult[]> {
  const grantsData = grants.map((g) => ({
    id: g.id,
    title: g.title,
    sponsor: g.sponsor,
    summary: g.summary.slice(0, 500),
    categories: g.categories.slice(0, 5),
    eligibility: g.eligibility.slice(0, 5),
    amount: formatAmount(g.amountMin, g.amountMax),
    deadline: g.deadlineDate ? g.deadlineDate.toISOString().split('T')[0] : 'Rolling',
  }))

  const systemPrompt = `You are a grant matching expert. Analyze grants for a specific organization and provide personalized recommendations.

IMPORTANT RULES:
1. Be factual - never invent details about grants
2. If funding amount is unknown, say "Varies"
3. If deadline is unknown, say "Rolling" or "Not listed"
4. Keep summaries to 1-2 sentences
5. Be specific to the organization's profile in fit explanations
6. Return valid JSON only`

  const userPrompt = `Organization Profile:
${profileSummary}

Grants to analyze:
${JSON.stringify(grantsData, null, 2)}

For each grant, provide:
1. score (0-100): How well this grant matches the organization
2. summary: 1-2 sentence plain English summary of the grant
3. fitExplanation: Why this matches or doesn't match this specific organization
4. eligibilityStatus: "eligible", "likely_eligible", "check_requirements", or "not_eligible"
5. nextSteps: Array of 2-3 specific action items
6. whatYouCanFund: Array of 2-3 specific things this org could fund with this grant
7. applicationTips: Array of 1-2 practical tips
8. urgency: "high", "medium", or "low" based on deadline proximity

Return as JSON array: [{ grantId, score, summary, fitExplanation, eligibilityStatus, nextSteps, whatYouCanFund, applicationTips, urgency }]`

  const openai = getOpenAI()
  if (!openai) {
    throw new Error('OpenAI not configured')
  }

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0]?.message?.content
  if (!content) {
    throw new Error('Empty response from OpenAI')
  }

  const parsed = JSON.parse(content) as { results?: OpenAIRerankResponse[] } | OpenAIRerankResponse[]
  const aiResults = Array.isArray(parsed) ? parsed : parsed.results || []

  return aiResults.map((r) => ({
    grantId: r.grantId,
    fitScore: Math.min(100, Math.max(0, r.score)),
    fitSummary: r.summary,
    fitExplanation: r.fitExplanation,
    eligibilityStatus: r.eligibilityStatus,
    nextSteps: r.nextSteps || [],
    whatYouCanFund: r.whatYouCanFund || [],
    applicationTips: r.applicationTips || [],
    urgency: r.urgency || 'medium',
    cached: false,
  }))
}

/**
 * Generate fallback matches without OpenAI
 */
function generateFallbackMatches(
  profile: UserProfile,
  grants: GrantForReranking[]
): RerankResult[] {
  return grants.map((grant) => {
    // Calculate basic score based on keyword matching
    const score = calculateFallbackScore(profile, grant)
    const urgency = calculateUrgency(grant.deadlineDate)

    return {
      grantId: grant.id,
      fitScore: score,
      fitSummary: grant.summary.slice(0, 150) + (grant.summary.length > 150 ? '...' : ''),
      fitExplanation: `This grant from ${grant.sponsor} may be relevant to your ${profile.industryTags?.join(', ') || 'interests'}.`,
      eligibilityStatus: 'check_requirements' as const,
      nextSteps: [
        'Review the full grant requirements',
        'Check eligibility criteria carefully',
        'Prepare required documentation',
      ],
      whatYouCanFund: grant.categories.slice(0, 3),
      applicationTips: ['Start your application early', 'Follow all formatting guidelines'],
      urgency,
      cached: false,
    }
  })
}

/**
 * Calculate fallback score using keyword matching
 */
function calculateFallbackScore(profile: UserProfile, grant: GrantForReranking): number {
  let score = 50 // Base score

  const titleLower = grant.title.toLowerCase()
  const summaryLower = grant.summary.toLowerCase()
  const categoriesLower = grant.categories.map((c) => c.toLowerCase())

  // Industry match
  if (profile.industryTags) {
    for (const tag of profile.industryTags) {
      const tagLower = tag.toLowerCase()
      if (titleLower.includes(tagLower) || summaryLower.includes(tagLower)) {
        score += 10
      }
      if (categoriesLower.some((c) => c.includes(tagLower))) {
        score += 8
      }
    }
  }

  // Entity match
  if (profile.entityType) {
    const entityKeywords: Record<string, string[]> = {
      nonprofit: ['nonprofit', '501(c)', 'charitable'],
      small_business: ['small business', 'entrepreneur', 'sbir'],
      educational: ['education', 'school', 'academic'],
    }
    const keywords = entityKeywords[profile.entityType] || []
    for (const kw of keywords) {
      if (grant.eligibility.some((e) => e.toLowerCase().includes(kw))) {
        score += 5
      }
    }
  }

  return Math.min(100, Math.max(0, score))
}

/**
 * Calculate urgency based on deadline
 */
function calculateUrgency(deadline?: Date): 'high' | 'medium' | 'low' {
  if (!deadline) return 'low'

  const daysUntil = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  if (daysUntil <= 14) return 'high'
  if (daysUntil <= 45) return 'medium'
  return 'low'
}

/**
 * Build a summary of the user's profile for the AI prompt
 */
function buildProfileSummary(profile: UserProfile): string {
  const parts: string[] = []

  if (profile.entityType) {
    parts.push(`Organization Type: ${profile.entityType}`)
  }
  if (profile.state) {
    parts.push(`Location: ${profile.state}, ${profile.country || 'US'}`)
  }
  if (profile.industryTags?.length) {
    parts.push(`Focus Areas: ${profile.industryTags.join(', ')}`)
  }
  if (profile.sizeBand) {
    parts.push(`Size: ${profile.sizeBand}`)
  }
  if (profile.stage) {
    parts.push(`Stage: ${profile.stage}`)
  }
  if (profile.annualBudget) {
    parts.push(`Annual Budget: ${profile.annualBudget}`)
  }

  return parts.join('\n')
}

/**
 * Format amount range for display
 */
function formatAmount(min?: number, max?: number): string {
  if (!min && !max) return 'Varies'
  if (min && max) {
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`
  }
  if (max) return `Up to $${max.toLocaleString()}`
  if (min) return `From $${min.toLocaleString()}`
  return 'Varies'
}

/**
 * Sort results by score and limit
 */
function sortAndLimit(results: RerankResult[], limit: number): RerankResult[] {
  return results.sort((a, b) => b.fitScore - a.fitScore).slice(0, limit)
}
