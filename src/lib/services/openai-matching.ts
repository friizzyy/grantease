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
  size?: string | null
  stage?: string | null
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
  url?: string
  sourceName?: string
}

export interface MatchResult {
  grantId: string
  score: number // 0-100
  reasoning: string
  strengthPoints: string[]
  weaknessPoints: string[]
  recommendations: string[]
  // New actionable fields
  eligibilityStatus: 'eligible' | 'likely_eligible' | 'check_requirements' | 'not_eligible'
  nextSteps: string[]
  whatYouCanFund: string[]
  applicationTips: string[]
  urgency: 'high' | 'medium' | 'low'
  fitSummary: string
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
   * Match grants to an organization profile with detailed actionable insights
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

    // Prepare the prompt with detailed actionable instructions
    const systemPrompt = `You are an expert grant matching assistant for ${profile.type} organizations. Your job is to analyze grant opportunities and provide SPECIFIC, ACTIONABLE advice.

For each grant, provide:
1. A clear eligibility assessment based on their profile
2. SPECIFIC things they can fund/do with this grant (not generic)
3. Concrete next steps to apply
4. Practical application tips

Organization Profile:
- Type: ${profile.type}
- Focus Areas: ${profile.focusAreas?.join(', ') || 'Not specified'}
- Location: ${profile.location || 'Not specified'}
- Size: ${profile.size || 'Not specified'}
- Stage: ${profile.stage || 'Not specified'}

Respond with a JSON object containing:
{
  "matches": [
    {
      "grantId": "string",
      "score": number (0-100),
      "eligibilityStatus": "eligible" | "likely_eligible" | "check_requirements" | "not_eligible",
      "fitSummary": "One sentence explaining why this is a good/bad fit",
      "whatYouCanFund": ["Specific thing 1", "Specific thing 2", "Specific thing 3"],
      "nextSteps": ["Step 1", "Step 2", "Step 3"],
      "applicationTips": ["Tip 1", "Tip 2"],
      "urgency": "high" | "medium" | "low",
      "strengthPoints": ["Strength 1", "Strength 2"],
      "weaknessPoints": ["Weakness 1"],
      "recommendations": ["Recommendation 1"],
      "reasoning": "Brief explanation"
    }
  ],
  "summary": "Overall analysis",
  "totalAnalyzed": number
}

IMPORTANT:
- whatYouCanFund must be SPECIFIC to their industry (e.g., for agriculture: "Purchase new irrigation equipment", "Expand cold storage facilities")
- nextSteps must be ACTIONABLE (e.g., "Register for a SAM.gov account", "Gather last 2 years of financial statements")
- applicationTips should be PRACTICAL (e.g., "Emphasize your rural location for extra points", "Include photos of current equipment")
- Be honest about eligibility - if something is unclear, mark as "check_requirements"
- urgency: high = deadline within 30 days, medium = 30-60 days, low = 60+ days or rolling`

    const userPrompt = `Analyze these grants for the organization described above:

GRANTS TO ANALYZE:
${JSON.stringify(grants.slice(0, 20).map(g => ({
  id: g.id,
  title: g.title,
  sponsor: g.sponsor,
  summary: g.summary.substring(0, 500),
  categories: g.categories.slice(0, 5),
  eligibility: g.eligibility.slice(0, 5),
  amountRange: g.amountMin && g.amountMax
    ? `$${g.amountMin.toLocaleString()} - $${g.amountMax.toLocaleString()}`
    : g.amountMax
      ? `Up to $${g.amountMax.toLocaleString()}`
      : 'Not specified',
  deadline: g.deadlineDate ? new Date(g.deadlineDate).toLocaleDateString() : 'Rolling/Not specified',
})), null, 2)}

Return the top ${maxResults} matches with scores of ${minScore} or higher. Focus on grants where they can actually take action.`

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error('No response from OpenAI')
    }

    const result = JSON.parse(content) as MatchingResponse

    // Ensure all required fields exist with defaults
    result.matches = result.matches
      .map(m => ({
        ...m,
        eligibilityStatus: m.eligibilityStatus || 'check_requirements',
        nextSteps: m.nextSteps || ['Review the full grant announcement', 'Check eligibility requirements'],
        whatYouCanFund: m.whatYouCanFund || ['Review grant details for specific funding opportunities'],
        applicationTips: m.applicationTips || ['Start application early', 'Review all requirements'],
        urgency: m.urgency || 'medium',
        fitSummary: m.fitSummary || m.reasoning,
        strengthPoints: m.strengthPoints || [],
        weaknessPoints: m.weaknessPoints || [],
        recommendations: m.recommendations || [],
      }))
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
 * Enhanced keyword-based matching with actionable results (fallback when OpenAI not configured)
 */
export function simpleKeywordMatch(
  profile: OrganizationProfile,
  grants: GrantForMatching[]
): MatchResult[] {
  const profileKeywords = new Set<string>()
  const focusAreas = profile.focusAreas || []

  // Extract keywords from profile
  if (profile.mission) {
    profile.mission.toLowerCase().split(/\W+/).forEach(w => {
      if (w.length > 3) profileKeywords.add(w)
    })
  }
  focusAreas.forEach(area => {
    area.toLowerCase().split(/\W+/).forEach(w => {
      if (w.length > 3) profileKeywords.add(w)
    })
    // Also add the full area as keyword
    profileKeywords.add(area.toLowerCase())
  })
  profile.capabilities?.forEach(cap => {
    cap.toLowerCase().split(/\W+/).forEach(w => {
      if (w.length > 3) profileKeywords.add(w)
    })
  })

  // Get specific funding examples based on focus areas
  const getFundingExamples = (focusAreas: string[], grantTitle: string): string[] => {
    const examples: Record<string, string[]> = {
      'agriculture': [
        'Purchase farm equipment or machinery',
        'Implement sustainable farming practices',
        'Expand crop storage or processing facilities',
        'Invest in irrigation or water management systems',
        'Fund agricultural research or training programs',
      ],
      'technology': [
        'Develop new software or applications',
        'Purchase technology equipment',
        'Fund R&D projects',
        'Train staff on new technologies',
        'Implement cybersecurity measures',
      ],
      'education': [
        'Develop curriculum and training materials',
        'Purchase educational equipment',
        'Fund scholarships or student programs',
        'Train teachers and educators',
        'Expand educational facilities',
      ],
      'health': [
        'Expand healthcare services',
        'Purchase medical equipment',
        'Fund health research',
        'Implement community health programs',
        'Train healthcare workers',
      ],
      'climate': [
        'Install renewable energy systems',
        'Implement energy efficiency measures',
        'Fund conservation projects',
        'Develop sustainability programs',
        'Purchase clean energy equipment',
      ],
      'community': [
        'Develop community programs',
        'Improve local infrastructure',
        'Fund social services',
        'Support economic development',
        'Create job training programs',
      ],
    }

    const relevant: string[] = []
    for (const area of focusAreas) {
      const areaLower = area.toLowerCase()
      for (const [key, values] of Object.entries(examples)) {
        if (areaLower.includes(key) || key.includes(areaLower)) {
          relevant.push(...values.slice(0, 2))
        }
      }
    }

    // Add generic examples if nothing specific found
    if (relevant.length === 0) {
      relevant.push(
        'Review grant guidelines for specific eligible activities',
        'Fund projects aligned with program objectives',
        'Support operational improvements'
      )
    }

    return [...new Set(relevant)].slice(0, 3)
  }

  // Get next steps based on grant source
  const getNextSteps = (grant: GrantForMatching): string[] => {
    const steps: string[] = []

    if (grant.url?.includes('grants.gov')) {
      steps.push('Create or log in to your Grants.gov account')
      steps.push('Download the full funding opportunity announcement (FOA)')
      steps.push('Register in SAM.gov if not already registered')
    } else if (grant.url?.includes('sam.gov')) {
      steps.push('Verify your SAM.gov registration is current')
      steps.push('Review the solicitation documents')
      steps.push('Note any pre-submission requirements')
    } else {
      steps.push('Visit the grant website to review full details')
      steps.push('Check application submission requirements')
    }

    steps.push('Gather required documents (financials, organizational info)')
    steps.push('Start drafting your project narrative')

    return steps.slice(0, 4)
  }

  // Calculate urgency based on deadline
  const getUrgency = (deadline: Date | null | undefined): 'high' | 'medium' | 'low' => {
    if (!deadline) return 'low'
    const daysUntil = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    if (daysUntil <= 30) return 'high'
    if (daysUntil <= 60) return 'medium'
    return 'low'
  }

  return grants.map(grant => {
    // Extract grant keywords
    const grantText = `${grant.title} ${grant.summary} ${grant.categories.join(' ')}`.toLowerCase()
    const grantWords = new Set(grantText.split(/\W+/).filter(w => w.length > 3))

    // Calculate overlap
    let matches = 0
    const matchedKeywords: string[] = []
    profileKeywords.forEach(keyword => {
      if (grantWords.has(keyword) || grantText.includes(keyword)) {
        matches++
        matchedKeywords.push(keyword)
      }
    })

    // Check eligibility match
    const eligibilityLower = grant.eligibility.map(e => e.toLowerCase()).join(' ')
    const profileType = profile.type.toLowerCase().replace('_', ' ')
    const eligibilityMatch =
      eligibilityLower.includes(profileType) ||
      eligibilityLower.includes('all') ||
      eligibilityLower.includes('any') ||
      grant.eligibility.length === 0

    // Base score on keyword matches
    let score = profileKeywords.size > 0
      ? Math.min(100, Math.round((matches / Math.max(profileKeywords.size, 1)) * 100 * 1.5))
      : 40

    // Boost score for eligibility match
    if (eligibilityMatch) {
      score = Math.min(100, score + 20)
    }

    // Determine eligibility status
    let eligibilityStatus: MatchResult['eligibilityStatus'] = 'check_requirements'
    if (eligibilityMatch && matches > 2) {
      eligibilityStatus = 'eligible'
    } else if (eligibilityMatch || matches > 1) {
      eligibilityStatus = 'likely_eligible'
    } else if (!eligibilityMatch && grant.eligibility.length > 0) {
      eligibilityStatus = 'not_eligible'
      score = Math.max(0, score - 30)
    }

    const urgency = getUrgency(grant.deadlineDate)

    // Generate fit summary
    const fitSummary = matches > 2
      ? `Strong match for your ${focusAreas.slice(0, 2).join(' and ')} focus`
      : matches > 0
        ? `Potential match based on ${matchedKeywords.slice(0, 2).join(', ')}`
        : `Review grant details to assess fit for your organization`

    return {
      grantId: grant.id,
      score,
      reasoning: `Matched ${matches} keywords from your profile: ${matchedKeywords.slice(0, 3).join(', ') || 'none'}`,
      strengthPoints: [
        ...(matches > 0 ? [`Aligns with your ${focusAreas.slice(0, 2).join(', ')} focus areas`] : []),
        ...(eligibilityMatch ? [`Open to ${profile.type.replace('_', ' ')} organizations`] : []),
        ...(grant.amountMax && grant.amountMax > 50000 ? ['Significant funding available'] : []),
      ],
      weaknessPoints: [
        ...(matches === 0 ? ['Limited keyword overlap with your profile'] : []),
        ...(!eligibilityMatch && grant.eligibility.length > 0 ? ['Eligibility requirements may not match'] : []),
      ],
      recommendations: [
        'Review the full grant announcement for complete requirements',
        ...(urgency === 'high' ? ['Consider this grant a priority due to upcoming deadline'] : []),
      ],
      eligibilityStatus,
      nextSteps: getNextSteps(grant),
      whatYouCanFund: getFundingExamples(focusAreas, grant.title),
      applicationTips: [
        `Highlight your experience in ${focusAreas[0] || 'your field'}`,
        'Include measurable outcomes in your proposal',
        'Address all evaluation criteria mentioned in the announcement',
      ],
      urgency,
      fitSummary,
    }
  }).sort((a, b) => b.score - a.score)
}
