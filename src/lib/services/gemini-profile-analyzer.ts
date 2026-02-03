/**
 * GEMINI PROFILE ANALYZER
 * -----------------------
 * Uses Gemini AI to analyze websites/business info and auto-generate
 * rich, detailed profiles for grant matching.
 *
 * Features:
 * - Scrape and analyze company websites
 * - Extract business type, industry, size, products/services
 * - Generate detailed industry attributes
 * - Suggest the most relevant grant categories
 */

import { generateJSON, isGeminiConfigured } from './gemini-client'
import type { EntityType, SizeBand, Stage, BudgetRange } from '@/lib/types/onboarding'

/**
 * Raw business info that can be provided by user
 */
export interface BusinessInfoInput {
  websiteUrl?: string
  companyName?: string
  description?: string // Optional manual description
  socialLinks?: string[] // LinkedIn, Facebook, etc.
}

/**
 * Analyzed profile from Gemini
 */
export interface AnalyzedProfile {
  // Basic info
  companyName: string
  tagline: string // Short description for display
  description: string // Detailed description

  // Inferred profile fields
  suggestedEntityType: EntityType
  entityTypeConfidence: number // 0-100
  entityTypeReasoning: string

  // Industry analysis
  primaryIndustry: string
  secondaryIndustries: string[]
  industryTags: string[] // Mapped to our INDUSTRY_CATEGORIES
  industryConfidence: number

  // Organization details
  estimatedSize: SizeBand | null
  estimatedStage: Stage | null
  estimatedBudget: BudgetRange | null
  sizeReasoning: string

  // Rich details for better matching
  products: string[] // Products or services offered
  services: string[]
  targetAudience: string[] // Who they serve
  geographicFocus: string[] // Where they operate
  certifications: string[] // Any certifications mentioned
  specializations: string[] // Specific areas of expertise

  // Agriculture-specific (if applicable)
  farmDetails?: {
    farmType?: string // crop, livestock, mixed, etc.
    acreage?: string
    products?: string[]
    organic?: boolean
    sustainable?: boolean
  }

  // For grant matching context
  fundingNeeds: string[] // What they might need funding for
  potentialProjects: string[] // Types of projects they could apply for
  strengthsForGrants: string[] // Why they'd be competitive

  // Metadata
  dataSource: 'website' | 'manual' | 'combined'
  analysisDate: string
  confidence: number // Overall confidence 0-100
}

/**
 * Fetch and extract text content from a website URL
 * Uses a simple approach - in production, you'd want a proper scraper
 */
async function fetchWebsiteContent(url: string): Promise<string | null> {
  try {
    // Normalize URL
    let normalizedUrl = url.trim()
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = 'https://' + normalizedUrl
    }

    // Use a proxy/fetch service to avoid CORS issues
    // In production, you'd use a proper web scraping service
    const response = await fetch(normalizedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GrantEase/1.0; +https://grantease.com)',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })

    if (!response.ok) {
      console.warn(`Failed to fetch ${url}: ${response.status}`)
      return null
    }

    const html = await response.text()

    // Extract meaningful text content (strip HTML tags)
    // This is a simple approach - a real implementation would use cheerio/jsdom
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '') // Remove scripts
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '') // Remove styles
      .replace(/<[^>]+>/g, ' ') // Remove all HTML tags
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim()
      .slice(0, 15000) // Limit content length for API

    return textContent
  } catch (error) {
    console.error('Error fetching website:', error)
    return null
  }
}

/**
 * Analyze a business using Gemini AI
 */
export async function analyzeBusinessProfile(
  input: BusinessInfoInput
): Promise<AnalyzedProfile | null> {
  if (!isGeminiConfigured()) {
    console.warn('Gemini not configured')
    return null
  }

  // Gather content to analyze
  let websiteContent = ''
  if (input.websiteUrl) {
    const content = await fetchWebsiteContent(input.websiteUrl)
    if (content) {
      websiteContent = content
    }
  }

  // Build the analysis prompt
  const prompt = `You are an expert business analyst helping to create a detailed profile for grant matching.

Analyze the following business information and extract/infer as much detail as possible.

## INPUT DATA
${input.companyName ? `Company Name: ${input.companyName}` : ''}
${input.websiteUrl ? `Website: ${input.websiteUrl}` : ''}
${input.description ? `User Description: ${input.description}` : ''}
${websiteContent ? `\nWebsite Content:\n${websiteContent}` : ''}

## YOUR TASK
Create a detailed business profile that will help match this organization with relevant grants.

Focus on:
1. **Entity Type** - Is this an individual, small business, nonprofit, farm, etc.?
2. **Industry** - What sectors do they operate in? Map to these categories:
   - agriculture (farms, food production, rural)
   - arts_culture (arts, museums, heritage)
   - business (general business, entrepreneurship)
   - climate (environment, clean energy, conservation)
   - community (community development, social services)
   - education (schools, training, learning)
   - health (healthcare, wellness, medical)
   - housing (affordable housing, shelter)
   - infrastructure (transportation, utilities, broadband)
   - nonprofit (general nonprofit operations)
   - research (scientific research, R&D)
   - technology (tech, software, innovation)
   - workforce (job training, employment)
   - youth (children, families, youth programs)

3. **Size & Stage** - How big are they? How established?
4. **Specific Details** - Products, services, certifications, specializations
5. **Grant Potential** - What could they realistically apply for funding for?

## IMPORTANT GUIDELINES
- Be SPECIFIC - vague profiles don't help with grant matching
- If it's a FARM or AGRICULTURAL business, include detailed farm info
- If it's a SMALL BUSINESS, focus on what makes them unique
- Consider what grants would actually help this organization
- Think about accessibility - most users are small operations, not large institutions

## OUTPUT FORMAT
Return a detailed JSON object:

\`\`\`json
{
  "companyName": "Business name",
  "tagline": "One-line description",
  "description": "2-3 sentence description",

  "suggestedEntityType": "small_business" | "nonprofit" | "individual" | "for_profit" | "educational" | "government" | "tribal",
  "entityTypeConfidence": 85,
  "entityTypeReasoning": "Why this entity type fits",

  "primaryIndustry": "Main industry in plain English",
  "secondaryIndustries": ["Other relevant industries"],
  "industryTags": ["agriculture", "climate"], // From our categories
  "industryConfidence": 90,

  "estimatedSize": "solo" | "small" | "medium" | "large" | null,
  "estimatedStage": "idea" | "early" | "growth" | "established" | null,
  "estimatedBudget": "under_100k" | "100k_500k" | "500k_1m" | "1m_5m" | "over_5m" | null,
  "sizeReasoning": "How we estimated size",

  "products": ["Product 1", "Product 2"],
  "services": ["Service 1", "Service 2"],
  "targetAudience": ["Who they serve"],
  "geographicFocus": ["Regions they operate in"],
  "certifications": ["Any certifications"],
  "specializations": ["Areas of expertise"],

  "farmDetails": {
    "farmType": "crop" | "livestock" | "mixed" | "specialty" | null,
    "acreage": "estimated or null",
    "products": ["Specific crops/animals"],
    "organic": true/false,
    "sustainable": true/false
  },

  "fundingNeeds": ["Equipment", "Expansion", "Research"],
  "potentialProjects": ["Specific project types they could apply for"],
  "strengthsForGrants": ["Why they'd be competitive for grants"],

  "dataSource": "website" | "manual" | "combined",
  "analysisDate": "2024-01-15",
  "confidence": 75
}
\`\`\`

Provide your best analysis based on available information. If information is limited, make reasonable inferences but note lower confidence.`

  try {
    const result = await generateJSON<AnalyzedProfile>(prompt, true) // Use Pro model

    if (!result) {
      return null
    }

    // Validate and clean up the result
    return {
      ...result,
      analysisDate: new Date().toISOString().split('T')[0],
      dataSource: websiteContent ? (input.description ? 'combined' : 'website') : 'manual',
    }
  } catch (error) {
    console.error('Error analyzing business profile:', error)
    return null
  }
}

/**
 * Quick analysis from just a company name (faster, less detailed)
 */
export async function quickAnalyzeByName(
  companyName: string
): Promise<Partial<AnalyzedProfile> | null> {
  if (!isGeminiConfigured()) {
    return null
  }

  const prompt = `Quick business analysis for grant matching.

Company Name: "${companyName}"

Based on just the company name, make your best guess about:
1. What type of business this is
2. What industry they're in
3. What entity type (individual, small_business, nonprofit, etc.)

Return JSON:
{
  "companyName": "${companyName}",
  "tagline": "Best guess one-liner",
  "suggestedEntityType": "small_business",
  "primaryIndustry": "Best guess industry",
  "industryTags": ["relevant", "categories"],
  "confidence": 30
}

Note: This is a name-only guess, so confidence should be low (20-40).`

  try {
    return await generateJSON<Partial<AnalyzedProfile>>(prompt, false) // Use Flash for speed
  } catch {
    return null
  }
}

/**
 * Enhance an existing profile with additional context
 */
export async function enhanceProfileWithContext(
  existingProfile: Partial<AnalyzedProfile>,
  additionalContext: string
): Promise<AnalyzedProfile | null> {
  if (!isGeminiConfigured()) {
    return null
  }

  const prompt = `Enhance this business profile with additional context for better grant matching.

## EXISTING PROFILE
${JSON.stringify(existingProfile, null, 2)}

## ADDITIONAL CONTEXT FROM USER
${additionalContext}

## TASK
Update and enhance the profile with the new information. Fill in any gaps and improve confidence scores where the new info confirms or clarifies details.

Return the complete, enhanced profile in the same JSON format.`

  try {
    return await generateJSON<AnalyzedProfile>(prompt, true)
  } catch {
    return null
  }
}

/**
 * Generate suggested profile questions based on partial info
 */
export async function getSuggestedQuestions(
  partialProfile: Partial<AnalyzedProfile>
): Promise<string[]> {
  if (!isGeminiConfigured()) {
    return getDefaultQuestions(partialProfile)
  }

  const prompt = `Based on this partial business profile, suggest 3-5 specific questions that would help us find better grants for them.

Profile so far:
${JSON.stringify(partialProfile, null, 2)}

Questions should be:
- Specific to their industry/type
- Help clarify funding needs
- Easy to answer (yes/no or short response)
- Relevant to grant eligibility

Return JSON array of question strings:
["Question 1?", "Question 2?", "Question 3?"]`

  try {
    const result = await generateJSON<string[]>(prompt, false)
    return result || getDefaultQuestions(partialProfile)
  } catch {
    return getDefaultQuestions(partialProfile)
  }
}

/**
 * Default questions when AI isn't available
 */
function getDefaultQuestions(profile: Partial<AnalyzedProfile>): string[] {
  const questions: string[] = []

  if (profile.industryTags?.includes('agriculture')) {
    questions.push('How many acres do you farm or manage?')
    questions.push('What are your main crops or livestock?')
    questions.push('Are you certified organic or pursuing certification?')
  }

  if (profile.suggestedEntityType === 'small_business') {
    questions.push('How many employees do you have?')
    questions.push('When did you start your business?')
  }

  if (profile.suggestedEntityType === 'nonprofit') {
    questions.push('What is your 501(c)(3) status?')
    questions.push('Who is your primary population served?')
  }

  // Default questions
  if (questions.length < 3) {
    questions.push('What is your biggest funding need right now?')
    questions.push('What geographic area do you primarily serve?')
    questions.push('Do you have experience applying for grants?')
  }

  return questions.slice(0, 5)
}
