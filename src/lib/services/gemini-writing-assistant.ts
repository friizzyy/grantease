/**
 * GEMINI WRITING ASSISTANT
 * ------------------------
 * Uses Gemini AI to help users write grant applications
 */

import { generateText, generateTextWithUsage, generateJSON, generateJSONWithUsage, isGeminiConfigured, type GeminiUsage } from './gemini-client'
import { UserProfile } from '@/lib/types/onboarding'
import { sanitizePromptInput, sanitizePromptArray } from '@/lib/utils/prompt-sanitizer'

export { isGeminiConfigured }

/** Zero usage constant for null/error returns */
const ZERO_USAGE: GeminiUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 }

/**
 * Grant application section types
 */
export type SectionType =
  | 'executive_summary'
  | 'statement_of_need'
  | 'project_description'
  | 'goals_objectives'
  | 'methods_approach'
  | 'evaluation_plan'
  | 'budget_narrative'
  | 'organizational_capacity'
  | 'sustainability_plan'
  | 'timeline'

/**
 * Writing assistance request
 */
export interface WritingRequest {
  section: SectionType
  grantTitle: string
  grantSponsor: string
  grantRequirements?: string
  userDraft?: string // User's existing draft to improve
  userNotes?: string // Notes/bullet points to expand
  wordLimit?: number
  tone?: 'formal' | 'conversational' | 'technical'
}

/**
 * Writing assistance response
 */
export interface WritingResponse {
  content: string
  wordCount: number
  suggestions: string[]
  strengthenTips: string[]
}

/**
 * Get section-specific guidance
 */
function getSectionGuidance(section: SectionType): string {
  const guidance: Record<SectionType, string> = {
    executive_summary: `Write a compelling executive summary that:
- Opens with a hook that captures attention
- Clearly states the problem and proposed solution
- Highlights the organization's qualifications
- Mentions the funding amount requested
- Summarizes expected outcomes
- Keep it to 1-2 paragraphs maximum`,

    statement_of_need: `Write a statement of need that:
- Uses data and statistics to demonstrate the problem
- Shows the urgency and significance
- Connects the problem to the funder's priorities
- Avoids being overly negative or hopeless
- Shows you understand the root causes
- Focuses on the community/beneficiaries, not the organization`,

    project_description: `Write a project description that:
- Clearly explains what will be done
- Describes who will benefit and how
- Explains the approach and methodology
- Shows innovation or uniqueness
- Aligns with the funder's goals
- Is specific and concrete, not vague`,

    goals_objectives: `Write goals and objectives that are:
- SMART: Specific, Measurable, Achievable, Relevant, Time-bound
- Clearly distinguish between goals (broad) and objectives (specific)
- Aligned with the statement of need
- Realistic given the budget and timeline
- Written in action-oriented language`,

    methods_approach: `Write methods/approach section that:
- Explains HOW the project will be implemented
- Describes specific activities and tasks
- Identifies who will do what
- Shows logical sequence of activities
- Addresses potential challenges
- Demonstrates evidence-based practices`,

    evaluation_plan: `Write an evaluation plan that:
- Defines clear success metrics
- Explains data collection methods
- Describes both process and outcome evaluation
- Shows how results will be used
- Identifies who will conduct evaluation
- Includes realistic timeline for evaluation activities`,

    budget_narrative: `Write a budget narrative that:
- Justifies each line item
- Shows how costs relate to activities
- Explains personnel costs and time allocations
- Addresses any unusual expenses
- Shows cost-effectiveness
- Aligns with project activities`,

    organizational_capacity: `Write organizational capacity section that:
- Highlights relevant experience and track record
- Describes key staff qualifications
- Shows infrastructure and resources
- Mentions successful past projects
- Demonstrates financial stability
- Shows partnerships and community connections`,

    sustainability_plan: `Write a sustainability plan that:
- Explains how the project will continue after funding ends
- Identifies potential future funding sources
- Shows community buy-in and ownership
- Describes plans to institutionalize successful practices
- Is realistic and concrete`,

    timeline: `Create a project timeline that:
- Shows major milestones and activities
- Is realistic given the scope
- Includes start and end dates
- Shows dependencies between activities
- Aligns with the budget and evaluation plan`,
  }

  return guidance[section] || 'Write clear, compelling content for this grant section.'
}

/**
 * Build profile context for writing
 */
function buildProfileContext(profile: UserProfile): string {
  const parts: string[] = []

  if (profile.entityType) {
    const labels: Record<string, string> = {
      individual: 'Individual/Sole Proprietor',
      nonprofit: 'Nonprofit Organization',
      small_business: 'Small Business',
      for_profit: 'For-Profit Company',
      educational: 'Educational Institution',
      government: 'Government Entity',
      tribal: 'Tribal Organization',
    }
    parts.push(`Organization Type: ${labels[profile.entityType] || sanitizePromptInput(profile.entityType, 100)}`)
  }

  if (profile.state) parts.push(`Location: ${sanitizePromptInput(profile.state, 100)}`)
  if (profile.industryTags?.length) parts.push(`Focus Areas: ${sanitizePromptArray(profile.industryTags)}`)
  if (profile.sizeBand) parts.push(`Size: ${sanitizePromptInput(profile.sizeBand, 50)} employees`)

  if (profile.industryAttributes) {
    const attrs = profile.industryAttributes
    if (attrs.farmType) parts.push(`Type: ${sanitizePromptInput(String(attrs.farmType), 100)}`)
    if (attrs.acreage) parts.push(`Acreage: ${sanitizePromptInput(String(attrs.acreage), 50)}`)
    if (attrs.yearsInOperation) parts.push(`Years Operating: ${sanitizePromptInput(String(attrs.yearsInOperation), 50)}`)
    if (attrs.products && Array.isArray(attrs.products)) {
      parts.push(`Products: ${sanitizePromptArray(attrs.products as string[])}`)
    }
  }

  return parts.join('\n')
}

/**
 * Generate content for a grant application section
 */
export async function generateSectionContent(
  request: WritingRequest,
  profile: UserProfile
): Promise<{ result: WritingResponse | null; usage: GeminiUsage }> {
  if (!isGeminiConfigured()) {
    return { result: null, usage: ZERO_USAGE }
  }

  const sectionGuidance = getSectionGuidance(request.section)
  const profileContext = buildProfileContext(profile)

  const prompt = `You are an expert grant writer helping a ${sanitizePromptInput(profile.entityType, 100) || 'organization'} write a grant application.

## APPLICANT PROFILE
${profileContext}

## GRANT DETAILS
- Grant: ${sanitizePromptInput(request.grantTitle, 500)}
- Sponsor: ${sanitizePromptInput(request.grantSponsor, 500)}
${request.grantRequirements ? `- Requirements: ${sanitizePromptInput(request.grantRequirements)}` : ''}

## SECTION TO WRITE: ${request.section.replace(/_/g, ' ').toUpperCase()}

${sectionGuidance}

${request.userDraft ? `## USER'S CURRENT DRAFT (improve this):\n${sanitizePromptInput(request.userDraft, 5000)}` : ''}
${request.userNotes ? `## USER'S NOTES/IDEAS (expand on these):\n${sanitizePromptInput(request.userNotes, 3000)}` : ''}

## REQUIREMENTS
- Word limit: ${request.wordLimit || 500} words
- Tone: ${request.tone || 'formal'}
- Write in first person plural ("we", "our organization")
- Be specific and concrete, not vague
- Align content with the funder's mission

## OUTPUT FORMAT
Return JSON:
{
  "content": "The written section content...",
  "wordCount": 123,
  "suggestions": ["Suggestion 1", "Suggestion 2"],
  "strengthenTips": ["Tip to make it stronger 1", "Tip 2"]
}

Write compelling, professional grant content.`

  try {
    const { data, usage } = await generateJSONWithUsage<WritingResponse>(prompt, true)
    return { result: data, usage }
  } catch (error) {
    console.error('Gemini writing error:', error)
    return { result: null, usage: ZERO_USAGE }
  }
}

/**
 * Improve existing draft content
 */
export async function improveDraft(
  draft: string,
  section: SectionType,
  grantContext: { title: string; sponsor: string },
  profile: UserProfile
): Promise<{ result: string | null; usage: GeminiUsage }> {
  if (!isGeminiConfigured()) {
    return { result: null, usage: ZERO_USAGE }
  }

  const sectionGuidance = getSectionGuidance(section)

  const prompt = `You are an expert grant writer. Improve this draft for a ${section.replace(/_/g, ' ')} section.

GRANT: ${sanitizePromptInput(grantContext.title, 500)} from ${sanitizePromptInput(grantContext.sponsor, 500)}
APPLICANT: ${sanitizePromptInput(profile.entityType, 100)} in ${sanitizePromptInput(profile.state, 100)}, focusing on ${sanitizePromptArray(profile.industryTags)}

DRAFT TO IMPROVE:
${sanitizePromptInput(draft, 5000)}

SECTION GUIDELINES:
${sectionGuidance}

Improve the draft by:
1. Making it more compelling and persuasive
2. Adding specific details and data where appropriate
3. Improving clarity and flow
4. Ensuring it addresses funder priorities
5. Maintaining the same word count (±10%)

Return ONLY the improved text, no explanations.`

  const { text, usage } = await generateTextWithUsage(prompt, true)
  return { result: text, usage }
}

/**
 * Generate a complete grant outline
 */
export async function generateGrantOutline(
  grantTitle: string,
  grantSponsor: string,
  grantDescription: string,
  profile: UserProfile
): Promise<{
  sections: Array<{
    section: SectionType
    title: string
    keyPoints: string[]
    suggestedLength: string
  }>
} | null> {
  if (!isGeminiConfigured()) {
    return null
  }

  const profileContext = buildProfileContext(profile)

  const prompt = `You are an expert grant writer. Create an outline for this grant application.

GRANT: ${sanitizePromptInput(grantTitle, 500)}
SPONSOR: ${sanitizePromptInput(grantSponsor, 500)}
DESCRIPTION: ${sanitizePromptInput(grantDescription)}

APPLICANT PROFILE:
${profileContext}

Create a comprehensive outline with sections appropriate for this grant and applicant.

Return JSON:
{
  "sections": [
    {
      "section": "executive_summary",
      "title": "Executive Summary",
      "keyPoints": ["Point 1 to cover", "Point 2 to cover"],
      "suggestedLength": "200-300 words"
    }
  ]
}

Include relevant sections based on typical grant requirements. Focus on sections that would strengthen this particular application.`

  return generateJSON(prompt, true)
}

/**
 * Get AI feedback on a draft
 */
interface DraftFeedbackResult {
  score: number
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
}

export async function getDraftFeedback(
  draft: string,
  section: SectionType,
  grantContext: { title: string; sponsor: string }
): Promise<{ result: DraftFeedbackResult | null; usage: GeminiUsage }> {
  if (!isGeminiConfigured()) {
    return { result: null, usage: ZERO_USAGE }
  }

  const prompt = `You are an expert grant reviewer. Evaluate this ${section.replace(/_/g, ' ')} section.

GRANT: ${sanitizePromptInput(grantContext.title, 500)} from ${sanitizePromptInput(grantContext.sponsor, 500)}

DRAFT:
${sanitizePromptInput(draft, 5000)}

Evaluate the draft and provide feedback.

Return JSON:
{
  "score": 75,
  "strengths": ["Strength 1", "Strength 2"],
  "weaknesses": ["Weakness 1", "Weakness 2"],
  "suggestions": ["Specific suggestion 1", "Specific suggestion 2"]
}

Score should be 0-100 based on how likely this section would impress grant reviewers.`

  const { data, usage } = await generateJSONWithUsage<DraftFeedbackResult>(prompt, false)
  return { result: data, usage }
}

/**
 * Chat-style writing assistance
 */
export async function chatWithWritingAssistant(
  message: string,
  context: {
    grantTitle: string
    grantSponsor: string
    currentSection?: SectionType
    previousMessages?: Array<{ role: 'user' | 'assistant'; content: string }>
  },
  profile: UserProfile
): Promise<{ result: string | null; usage: GeminiUsage }> {
  if (!isGeminiConfigured()) {
    return { result: null, usage: ZERO_USAGE }
  }

  const profileContext = buildProfileContext(profile)

  // Build conversation history (sanitize each message to prevent injection via chat history)
  const history = context.previousMessages?.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${sanitizePromptInput(m.content, 1000)}`).join('\n\n') || ''

  const prompt = `You are a helpful grant writing assistant. You're helping a user write a grant application.

GRANT: ${sanitizePromptInput(context.grantTitle, 500)} from ${sanitizePromptInput(context.grantSponsor, 500)}
${context.currentSection ? `CURRENT SECTION: ${context.currentSection.replace(/_/g, ' ')}` : ''}

APPLICANT:
${profileContext}

${history ? `PREVIOUS CONVERSATION:\n${history}\n\n` : ''}USER'S MESSAGE: ${sanitizePromptInput(message, 3000)}

Provide helpful, specific advice. If they share a draft, offer constructive feedback. If they ask questions, answer them. Keep responses focused and actionable.`

  const { text, usage } = await generateTextWithUsage(prompt)
  return { result: text, usage }
}
