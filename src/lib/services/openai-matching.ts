/**
 * OpenAI-powered Grant Matching Service
 *
 * Uses OpenAI's API to provide intelligent grant matching based on:
 * - Organization profile and mission
 * - Past grant history
 * - Grant requirements and eligibility
 * - Keyword and semantic matching
 */

import OpenAI from 'openai'

// Types
export interface OrganizationProfile {
  name: string
  type: string // nonprofit, forprofit, government, individual, academic
  mission?: string
  focusAreas?: string[]
  location?: string
  annualBudget?: number
  employeeCount?: number
  previousGrants?: string[]
  naicsCodes?: string[]
  capabilities?: string[]
}

export interface GrantForMatching {
  id: string
  title: string
  sponsor: string
  summary: string
  categories: string[]
  eligibility: string[]
  amountMin?: number | null
  amountMax?: number | null
  deadlineDate?: Date | null
}

export interface MatchResult {
  grantId: string
  score: number // 0-100
  reasoning: string
  strengthPoints: string[]
  weaknessPoints: string[]
  recommendations: string[]
}

export interface MatchingResponse {
  matches: MatchResult[]
  summary: string
  totalAnalyzed: number
}

// OpenAI Matching Client
export class OpenAIMatchingClient {
  private client: OpenAI | null = null
  private model = 'gpt-4o-mini' // Cost-effective for matching

  constructor(apiKey?: string) {
    const key = apiKey || process.env.OPENAI_API_KEY
    if (key) {
      this.client = new OpenAI({ apiKey: key })
    }
  }

  /**
   * Check if the service is configured
   */
  isConfigured(): boolean {
    return this.client !== null
  }

  /**
   * Match grants to an organization profile
   */
  async matchGrants(
    profile: OrganizationProfile,
    grants: GrantForMatching[],
    options: { maxResults?: number; minScore?: number } = {}
  ): Promise<MatchingResponse> {
    if (!this.client) {
      throw new Error('OpenAI API key is required. Set OPENAI_API_KEY in environment variables.')
    }

    const { maxResults = 10, minScore = 50 } = options

    // Prepare the prompt
    const systemPrompt = `You are an expert grant matching assistant. Your job is to analyze grant opportunities and determine how well they match an organization's profile.

For each grant, you will:
1. Evaluate alignment with the organization's mission and focus areas
2. Check eligibility requirements against the organization type
3. Assess whether the grant amount fits the organization's scale
4. Consider geographic restrictions
5. Look at timing and deadlines

Respond with a JSON object containing:
- matches: Array of match results with grantId, score (0-100), reasoning, strengthPoints, weaknessPoints, and recommendations
- summary: Overall analysis summary
- totalAnalyzed: Number of grants analyzed

Be honest and accurate. A low score is better than a misleading high score.`

    const userPrompt = `Analyze these grants for the following organization:

ORGANIZATION PROFILE:
${JSON.stringify(profile, null, 2)}

GRANTS TO ANALYZE:
${JSON.stringify(grants.map(g => ({
  id: g.id,
  title: g.title,
  sponsor: g.sponsor,
  summary: g.summary,
  categories: g.categories,
  eligibility: g.eligibility,
  amountRange: g.amountMin && g.amountMax ? `$${g.amountMin.toLocaleString()} - $${g.amountMax.toLocaleString()}` : 'Not specified',
  deadline: g.deadlineDate ? new Date(g.deadlineDate).toLocaleDateString() : 'Not specified',
})), null, 2)}

Return the top ${maxResults} matches with scores of ${minScore} or higher. If fewer grants meet the threshold, return only those that do.`

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3, // Lower temperature for more consistent matching
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    const result = JSON.parse(content) as MatchingResponse

    // Sort by score descending
    result.matches = result.matches
      .filter(m => m.score >= minScore)
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults)

    return result
  }

  /**
   * Generate a grant summary for better matching
   */
  async summarizeGrant(grant: GrantForMatching): Promise<string> {
    if (!this.client) {
      throw new Error('OpenAI API key is required.')
    }

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'You are a grant analyst. Summarize the key aspects of this grant in 2-3 sentences, focusing on: purpose, eligible applicants, and key requirements.',
        },
        {
          role: 'user',
          content: `Title: ${grant.title}\nSponsor: ${grant.sponsor}\nCategories: ${grant.categories.join(', ')}\nEligibility: ${grant.eligibility.join(', ')}\nSummary: ${grant.summary}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 200,
    })

    return response.choices[0]?.message?.content || grant.summary
  }

  /**
   * Generate application tips for a specific grant
   */
  async generateApplicationTips(
    profile: OrganizationProfile,
    grant: GrantForMatching
  ): Promise<{
    tips: string[]
    keyRequirements: string[]
    potentialChallenges: string[]
    suggestedApproach: string
  }> {
    if (!this.client) {
      throw new Error('OpenAI API key is required.')
    }

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: `You are an expert grant writing consultant. Provide practical advice for applying to this grant based on the organization's profile. Return a JSON object with:
- tips: Array of 3-5 specific, actionable tips
- keyRequirements: Array of critical requirements to address
- potentialChallenges: Array of challenges this organization might face
- suggestedApproach: A brief paragraph on the best approach for this application`,
        },
        {
          role: 'user',
          content: `ORGANIZATION:\n${JSON.stringify(profile, null, 2)}\n\nGRANT:\n${JSON.stringify(grant, null, 2)}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.5,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    return JSON.parse(content)
  }

  /**
   * Extract keywords and themes from text for better matching
   */
  async extractKeywords(text: string): Promise<string[]> {
    if (!this.client) {
      throw new Error('OpenAI API key is required.')
    }

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'Extract 5-10 key themes and keywords relevant for grant matching. Return as a JSON array of strings.',
        },
        {
          role: 'user',
          content: text,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      return []
    }

    const result = JSON.parse(content)
    return Array.isArray(result) ? result : result.keywords || []
  }

  /**
   * Generate embeddings for semantic search (uses embedding model)
   */
  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.client) {
      throw new Error('OpenAI API key is required.')
    }

    const response = await this.client.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    })

    return response.data[0]?.embedding || []
  }

  /**
   * Calculate cosine similarity between two embeddings
   */
  cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0

    let dotProduct = 0
    let normA = 0
    let normB = 0

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i]
      normA += a[i] * a[i]
      normB += b[i] * b[i]
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
  }
}

// Export singleton instance
export const openaiMatching = new OpenAIMatchingClient()

/**
 * Simple keyword-based matching (fallback when OpenAI not configured)
 */
export function simpleKeywordMatch(
  profile: OrganizationProfile,
  grants: GrantForMatching[]
): MatchResult[] {
  const profileKeywords = new Set<string>()

  // Extract keywords from profile
  if (profile.mission) {
    profile.mission.toLowerCase().split(/\W+/).forEach(w => {
      if (w.length > 3) profileKeywords.add(w)
    })
  }
  profile.focusAreas?.forEach(area => {
    area.toLowerCase().split(/\W+/).forEach(w => {
      if (w.length > 3) profileKeywords.add(w)
    })
  })
  profile.capabilities?.forEach(cap => {
    cap.toLowerCase().split(/\W+/).forEach(w => {
      if (w.length > 3) profileKeywords.add(w)
    })
  })

  return grants.map(grant => {
    // Extract grant keywords
    const grantText = `${grant.title} ${grant.summary} ${grant.categories.join(' ')}`.toLowerCase()
    const grantWords = new Set(grantText.split(/\W+/).filter(w => w.length > 3))

    // Calculate overlap
    let matches = 0
    profileKeywords.forEach(keyword => {
      if (grantWords.has(keyword)) matches++
    })

    const score = profileKeywords.size > 0
      ? Math.min(100, Math.round((matches / profileKeywords.size) * 100 * 2))
      : 50

    return {
      grantId: grant.id,
      score,
      reasoning: `Matched ${matches} keywords from your profile`,
      strengthPoints: matches > 0 ? ['Keyword alignment with your focus areas'] : [],
      weaknessPoints: matches === 0 ? ['Limited keyword overlap'] : [],
      recommendations: ['Review grant requirements carefully', 'Check eligibility criteria'],
    }
  }).sort((a, b) => b.score - a.score)
}
