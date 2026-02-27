/**
 * GEMINI APPLICATION HELPER
 * -------------------------
 * Helps users prepare grant applications:
 * - Generate application checklists
 * - Parse grant requirements
 * - Create timelines
 * - Provide strategy advice
 */

import { generateJSON, generateJSONWithUsage, generateText, isGeminiConfigured, type GeminiUsage } from './gemini-client'
import type { UserProfile } from '@/lib/types/onboarding'
import { sanitizePromptInput, sanitizePromptArray } from '@/lib/utils/prompt-sanitizer'

/** Zero usage constant for null/error returns */
const ZERO_USAGE: GeminiUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 }

/**
 * Grant details for application help
 */
export interface GrantForApplication {
  id: string
  title: string
  sponsor: string
  description?: string
  requirements?: string
  eligibility?: string
  deadline?: string | Date
  url: string
  amountMin?: number
  amountMax?: number
}

/**
 * Application checklist item
 */
export interface ChecklistItem {
  id: string
  category: 'document' | 'form' | 'narrative' | 'budget' | 'review' | 'submit'
  title: string
  description: string
  required: boolean
  estimatedTime: string
  tips?: string[]
  order: number
  dependsOn?: string[] // IDs of items that must be done first
}

/**
 * Complete application preparation plan
 */
export interface ApplicationPlan {
  grantId: string
  grantTitle: string

  // Overview
  summary: string
  totalEstimatedTime: string
  recommendedStartDate: string
  deadline: string

  // Checklist
  checklist: ChecklistItem[]

  // Timeline
  milestones: Array<{
    date: string
    title: string
    items: string[]
  }>

  // Documents needed
  documentsRequired: Array<{
    name: string
    description: string
    howToGet: string
    estimatedTime: string
  }>

  // Writing sections
  narrativeSections: Array<{
    name: string
    wordLimit?: number
    description: string
    tips: string[]
  }>

  // Budget
  budgetGuidance: {
    categories: string[]
    tips: string[]
    commonMistakes: string[]
  }

  // Strategy
  strategyTips: string[]
  commonPitfalls: string[]
  competitiveAdvantages: string[] // What makes this applicant strong
}

/**
 * Generate complete application preparation plan
 */
export async function generateApplicationPlan(
  grant: GrantForApplication,
  profile: UserProfile
): Promise<{ result: ApplicationPlan | null; usage: GeminiUsage }> {
  if (!isGeminiConfigured()) {
    return { result: null, usage: ZERO_USAGE }
  }

  const deadline = grant.deadline
    ? new Date(grant.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Not specified'

  const prompt = `You are a grant application strategist helping someone prepare a strong application.

## GRANT DETAILS
Title: ${sanitizePromptInput(grant.title, 500)}
Sponsor: ${sanitizePromptInput(grant.sponsor, 500)}
${grant.description ? `Description: ${sanitizePromptInput(grant.description)}` : ''}
${grant.requirements ? `Requirements: ${sanitizePromptInput(grant.requirements)}` : ''}
${grant.eligibility ? `Eligibility: ${sanitizePromptInput(grant.eligibility)}` : ''}
Deadline: ${deadline}
${grant.amountMin || grant.amountMax ? `Funding: $${grant.amountMin?.toLocaleString() || '?'} - $${grant.amountMax?.toLocaleString() || '?'}` : ''}
URL: ${sanitizePromptInput(grant.url, 500)}

## APPLICANT PROFILE
- Type: ${sanitizePromptInput(profile.entityType, 100)}
- Location: ${sanitizePromptInput(profile.state, 100) || 'USA'}
- Focus: ${sanitizePromptArray(profile.industryTags)}
- Size: ${sanitizePromptInput(profile.sizeBand, 50) || 'Not specified'}
- Stage: ${sanitizePromptInput(profile.stage, 50) || 'Not specified'}
${profile.companyName ? `- Organization: ${sanitizePromptInput(profile.companyName, 500)}` : ''}

## YOUR TASK
Create a comprehensive application preparation plan with:

1. **Checklist** - Every step needed to complete the application
2. **Timeline** - When to complete each step (working backward from deadline)
3. **Documents** - What documents they need and how to get them
4. **Narrative sections** - What writing is required and tips for each
5. **Budget guidance** - How to prepare the budget section
6. **Strategy tips** - How to make their application competitive

## OUTPUT FORMAT
Return as detailed JSON:

\`\`\`json
{
  "grantId": "${grant.id}",
  "grantTitle": "${grant.title}",

  "summary": "Brief overview of what this application involves",
  "totalEstimatedTime": "20-30 hours",
  "recommendedStartDate": "4 weeks before deadline",
  "deadline": "${deadline}",

  "checklist": [
    {
      "id": "doc-1",
      "category": "document",
      "title": "Gather organizational documents",
      "description": "Collect 501(c)(3) letter, articles of incorporation, etc.",
      "required": true,
      "estimatedTime": "2-3 hours",
      "tips": ["Request early - some docs take time"],
      "order": 1
    }
  ],

  "milestones": [
    {
      "date": "Week 1",
      "title": "Preparation Phase",
      "items": ["Gather documents", "Review guidelines thoroughly"]
    }
  ],

  "documentsRequired": [
    {
      "name": "501(c)(3) Determination Letter",
      "description": "IRS letter confirming tax-exempt status",
      "howToGet": "Should be in your files from when you incorporated",
      "estimatedTime": "1 hour to locate"
    }
  ],

  "narrativeSections": [
    {
      "name": "Project Description",
      "wordLimit": 500,
      "description": "Describe what you plan to do with the funding",
      "tips": ["Be specific about activities", "Include measurable outcomes"]
    }
  ],

  "budgetGuidance": {
    "categories": ["Personnel", "Equipment", "Supplies", "Travel", "Other"],
    "tips": ["Be realistic", "Justify each line item"],
    "commonMistakes": ["Underestimating costs", "Missing indirect costs"]
  },

  "strategyTips": [
    "Lead with your strongest qualifications",
    "Show clear alignment with funder's priorities"
  ],

  "commonPitfalls": [
    "Submitting at the last minute",
    "Not following formatting requirements"
  ],

  "competitiveAdvantages": [
    "Based on profile, highlight: [specific strengths]"
  ]
}
\`\`\`

Make the plan actionable and realistic. Consider the applicant's specific situation.`

  try {
    const { data, usage } = await generateJSONWithUsage<ApplicationPlan>(prompt, true)
    return { result: data, usage }
  } catch (error) {
    console.error('Application plan generation error:', error)
    return { result: null, usage: ZERO_USAGE }
  }
}

/**
 * Generate just the checklist (faster)
 */
export async function generateChecklist(
  grant: GrantForApplication
): Promise<{ result: ChecklistItem[] | null; usage: GeminiUsage }> {
  if (!isGeminiConfigured()) {
    return { result: null, usage: ZERO_USAGE }
  }

  const prompt = `Create an application checklist for this grant:

Grant: ${sanitizePromptInput(grant.title, 500)} from ${sanitizePromptInput(grant.sponsor, 500)}
${grant.requirements ? `Requirements: ${sanitizePromptInput(grant.requirements)}` : ''}
Deadline: ${grant.deadline || 'Not specified'}

Return JSON array of checklist items:
[
  {
    "id": "1",
    "category": "document" | "form" | "narrative" | "budget" | "review" | "submit",
    "title": "Task title",
    "description": "What to do",
    "required": true/false,
    "estimatedTime": "2 hours",
    "order": 1
  }
]

Include ALL steps from gathering documents through final submission.`

  try {
    const { data, usage } = await generateJSONWithUsage<ChecklistItem[]>(prompt, false)
    return { result: data, usage }
  } catch {
    return { result: null, usage: ZERO_USAGE }
  }
}

/**
 * Generate application timeline
 */
export async function generateTimeline(
  grant: GrantForApplication,
  availableHoursPerWeek: number = 10
): Promise<{ result: Array<{ week: number; tasks: string[]; hoursNeeded: number }> | null; usage: GeminiUsage }> {
  if (!isGeminiConfigured()) {
    return { result: null, usage: ZERO_USAGE }
  }

  const deadline = grant.deadline
    ? new Date(grant.deadline)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Default 30 days

  const weeksUntilDeadline = Math.ceil(
    (deadline.getTime() - Date.now()) / (7 * 24 * 60 * 60 * 1000)
  )

  const prompt = `Create a week-by-week timeline for this grant application:

Grant: ${sanitizePromptInput(grant.title, 500)}
Deadline: ${deadline.toLocaleDateString()}
Weeks available: ${weeksUntilDeadline}
Hours available per week: ${availableHoursPerWeek}

Return JSON timeline:
[
  {
    "week": 1,
    "tasks": ["Review guidelines", "Gather basic documents"],
    "hoursNeeded": 5
  }
]

Spread work realistically across available time. Leave buffer for review.`

  try {
    const { data, usage } = await generateJSONWithUsage<Array<{ week: number; tasks: string[]; hoursNeeded: number }>>(prompt, false)
    return { result: data, usage }
  } catch {
    return { result: null, usage: ZERO_USAGE }
  }
}

/**
 * Get strategy advice for a specific grant
 */
interface StrategyAdviceResult {
  overallStrategy: string
  keyMessages: string[]
  differentiators: string[]
  risksToAddress: string[]
  suggestedApproach: string
}

export async function getStrategyAdvice(
  grant: GrantForApplication,
  profile: UserProfile
): Promise<{ result: StrategyAdviceResult | null; usage: GeminiUsage }> {
  if (!isGeminiConfigured()) {
    return { result: null, usage: ZERO_USAGE }
  }

  const prompt = `Provide strategic advice for this grant application:

GRANT: ${sanitizePromptInput(grant.title, 500)} from ${sanitizePromptInput(grant.sponsor, 500)}
${grant.description ? `About: ${sanitizePromptInput(grant.description)}` : ''}

APPLICANT:
- Type: ${sanitizePromptInput(profile.entityType, 100)}
- Focus: ${sanitizePromptArray(profile.industryTags)}
- Location: ${sanitizePromptInput(profile.state, 100)}
${profile.companyName ? `- Organization: ${sanitizePromptInput(profile.companyName, 500)}` : ''}
${profile.companyDescription ? `- Description: ${sanitizePromptInput(profile.companyDescription)}` : ''}

What strategic approach should they take?

Return JSON:
{
  "overallStrategy": "2-3 sentence strategy summary",
  "keyMessages": ["Key points to emphasize in application"],
  "differentiators": ["What makes this applicant stand out"],
  "risksToAddress": ["Potential weaknesses to proactively address"],
  "suggestedApproach": "Recommended angle/narrative for the application"
}`

  try {
    const { data, usage } = await generateJSONWithUsage<StrategyAdviceResult>(prompt, true)
    return { result: data, usage }
  } catch {
    return { result: null, usage: ZERO_USAGE }
  }
}

/**
 * Review draft application section
 */
interface SectionReviewResult {
  score: number
  strengths: string[]
  improvements: string[]
  rewriteSuggestions: string[]
  criticalIssues: string[]
}

export async function reviewApplicationSection(
  sectionName: string,
  content: string,
  grantContext: { title: string; sponsor: string; requirements?: string }
): Promise<{ result: SectionReviewResult | null; usage: GeminiUsage }> {
  if (!isGeminiConfigured()) {
    return { result: null, usage: ZERO_USAGE }
  }

  const prompt = `Review this grant application section:

GRANT: ${sanitizePromptInput(grantContext.title, 500)} from ${sanitizePromptInput(grantContext.sponsor, 500)}
${grantContext.requirements ? `Requirements: ${sanitizePromptInput(grantContext.requirements)}` : ''}

SECTION: ${sanitizePromptInput(sectionName, 200)}
CONTENT:
${sanitizePromptInput(content, 5000)}

Evaluate this section and provide feedback.

Return JSON:
{
  "score": 0-100,
  "strengths": ["What's working well"],
  "improvements": ["Specific suggestions to improve"],
  "rewriteSuggestions": ["Alternative phrasing for weak sentences"],
  "criticalIssues": ["Any serious problems that must be fixed"]
}

Be constructive but honest. Focus on making the application competitive.`

  try {
    const { data, usage } = await generateJSONWithUsage<SectionReviewResult>(prompt, true)
    return { result: data, usage }
  } catch {
    return { result: null, usage: ZERO_USAGE }
  }
}
