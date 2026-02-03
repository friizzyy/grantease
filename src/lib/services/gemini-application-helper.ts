/**
 * GEMINI APPLICATION HELPER
 * -------------------------
 * Helps users prepare grant applications:
 * - Generate application checklists
 * - Parse grant requirements
 * - Create timelines
 * - Provide strategy advice
 */

import { generateJSON, generateText, isGeminiConfigured } from './gemini-client'
import type { UserProfile } from '@/lib/types/onboarding'

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
): Promise<ApplicationPlan | null> {
  if (!isGeminiConfigured()) {
    return null
  }

  const deadline = grant.deadline
    ? new Date(grant.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Not specified'

  const prompt = `You are a grant application strategist helping someone prepare a strong application.

## GRANT DETAILS
Title: ${grant.title}
Sponsor: ${grant.sponsor}
${grant.description ? `Description: ${grant.description}` : ''}
${grant.requirements ? `Requirements: ${grant.requirements}` : ''}
${grant.eligibility ? `Eligibility: ${grant.eligibility}` : ''}
Deadline: ${deadline}
${grant.amountMin || grant.amountMax ? `Funding: $${grant.amountMin?.toLocaleString() || '?'} - $${grant.amountMax?.toLocaleString() || '?'}` : ''}
URL: ${grant.url}

## APPLICANT PROFILE
- Type: ${profile.entityType}
- Location: ${profile.state || 'USA'}
- Focus: ${profile.industryTags?.join(', ')}
- Size: ${profile.sizeBand || 'Not specified'}
- Stage: ${profile.stage || 'Not specified'}
${profile.companyName ? `- Organization: ${profile.companyName}` : ''}

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
    const result = await generateJSON<ApplicationPlan>(prompt, true)
    return result
  } catch (error) {
    console.error('Application plan generation error:', error)
    return null
  }
}

/**
 * Generate just the checklist (faster)
 */
export async function generateChecklist(
  grant: GrantForApplication
): Promise<ChecklistItem[] | null> {
  if (!isGeminiConfigured()) {
    return null
  }

  const prompt = `Create an application checklist for this grant:

Grant: ${grant.title} from ${grant.sponsor}
${grant.requirements ? `Requirements: ${grant.requirements}` : ''}
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
    return await generateJSON<ChecklistItem[]>(prompt, false)
  } catch {
    return null
  }
}

/**
 * Generate application timeline
 */
export async function generateTimeline(
  grant: GrantForApplication,
  availableHoursPerWeek: number = 10
): Promise<Array<{ week: number; tasks: string[]; hoursNeeded: number }> | null> {
  if (!isGeminiConfigured()) {
    return null
  }

  const deadline = grant.deadline
    ? new Date(grant.deadline)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Default 30 days

  const weeksUntilDeadline = Math.ceil(
    (deadline.getTime() - Date.now()) / (7 * 24 * 60 * 60 * 1000)
  )

  const prompt = `Create a week-by-week timeline for this grant application:

Grant: ${grant.title}
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
    return await generateJSON(prompt, false)
  } catch {
    return null
  }
}

/**
 * Get strategy advice for a specific grant
 */
export async function getStrategyAdvice(
  grant: GrantForApplication,
  profile: UserProfile
): Promise<{
  overallStrategy: string
  keyMessages: string[]
  differentiators: string[]
  risksToAddress: string[]
  suggestedApproach: string
} | null> {
  if (!isGeminiConfigured()) {
    return null
  }

  const prompt = `Provide strategic advice for this grant application:

GRANT: ${grant.title} from ${grant.sponsor}
${grant.description ? `About: ${grant.description}` : ''}

APPLICANT:
- Type: ${profile.entityType}
- Focus: ${profile.industryTags?.join(', ')}
- Location: ${profile.state}
${profile.companyName ? `- Organization: ${profile.companyName}` : ''}
${profile.companyDescription ? `- Description: ${profile.companyDescription}` : ''}

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
    return await generateJSON(prompt, true)
  } catch {
    return null
  }
}

/**
 * Review draft application section
 */
export async function reviewApplicationSection(
  sectionName: string,
  content: string,
  grantContext: { title: string; sponsor: string; requirements?: string }
): Promise<{
  score: number
  strengths: string[]
  improvements: string[]
  rewriteSuggestions: string[]
  criticalIssues: string[]
} | null> {
  if (!isGeminiConfigured()) {
    return null
  }

  const prompt = `Review this grant application section:

GRANT: ${grantContext.title} from ${grantContext.sponsor}
${grantContext.requirements ? `Requirements: ${grantContext.requirements}` : ''}

SECTION: ${sectionName}
CONTENT:
${content}

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
    return await generateJSON(prompt, true)
  } catch {
    return null
  }
}
