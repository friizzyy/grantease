/**
 * APPLICATION AI SERVICE
 * ----------------------
 * AI-powered assistance for grant application drafting.
 * Uses user vault data and grant context to generate section drafts.
 */

import { getAIClient, GEMINI_MODEL, isGeminiConfigured } from './gemini-client'
import { z } from 'zod'

import { safeJsonParse } from '@/lib/api-utils'
import { getVaultWithData } from './vault-service'
import { prisma } from '@/lib/db'
import { sanitizePromptInput, sanitizePromptArray } from '@/lib/utils/prompt-sanitizer'

import type {
  ApplicationSection,
  ApplicationFormData,
  AIDraftContent,
  AISuggestion,
  BudgetLineItem,
  ProjectMilestone,
} from '@/lib/types/application'

// ============= SCHEMAS =============

const SectionDraftSchema = z.object({
  content: z.string().min(50, 'Draft too short'),
  confidence: z.number().min(0).max(1),
  sources: z.array(z.string()),
})

const ApplicationSuggestionsSchema = z.object({
  suggestions: z.array(z.object({
    section: z.string(),
    type: z.enum(['improvement', 'missing', 'tip', 'warning']),
    title: z.string().max(100),
    description: z.string().max(500),
    suggestedContent: z.string().optional(),
  })),
})

const BudgetSuggestionSchema = z.object({
  items: z.array(z.object({
    category: z.string(),
    description: z.string(),
    suggestedAmount: z.number(),
    justification: z.string(),
  })),
  totalBudget: z.number(),
  notes: z.string(),
})

// ============= CONTEXT BUILDERS =============

interface ApplicationContext {
  grant: {
    title: string
    sponsor: string
    summary: string | null
    description: string | null
    categories: string[]
    eligibility: string[]
    amountMin: number | null
    amountMax: number | null
    requirements: string[]
  }
  user: {
    organizationName: string | null
    entityType: string | null
    state: string | null
    industryTags: string[]
    missionStatement: string | null
    needStatement: string | null
    capacity: string | null
    previousGrants: string | null
  }
  formData: ApplicationFormData
}

async function buildApplicationContext(
  userId: string,
  grantId: string,
  formData: ApplicationFormData
): Promise<ApplicationContext> {
  // Get grant data
  const grant = await prisma.grant.findUnique({
    where: { id: grantId },
  })

  if (!grant) {
    throw new Error(`Grant not found (grantId: ${grantId}) while building application context for user ${userId}`)
  }

  // Get user vault data and profile separately
  const { vault, textBlocks } = await getVaultWithData(userId)
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
  })

  // Find relevant text blocks
  const missionBlock = textBlocks.find(b => b.category === 'mission_statement')
  const needBlock = textBlocks.find(b => b.category === 'need_statement')
  const capacityBlock = textBlocks.find(b => b.category === 'organizational_capacity')
  // Use 'other' category for previous grants tracking
  const previousGrantsBlock = textBlocks.find(b => b.category === 'other' && b.title.toLowerCase().includes('grant'))

  return {
    grant: {
      title: grant.title,
      sponsor: grant.sponsor,
      summary: grant.summary,
      description: grant.description,
      categories: safeJsonParse<string[]>(grant.categories, []),
      eligibility: safeJsonParse<string[]>(grant.eligibility, []),
      amountMin: grant.amountMin,
      amountMax: grant.amountMax,
      requirements: safeJsonParse<string[]>(grant.requirements, []),
    },
    user: {
      organizationName: vault.organizationName || null,
      entityType: profile?.entityType || null,
      state: profile?.state || null,
      industryTags: profile ? safeJsonParse<string[]>(profile.industryTags, []) : [],
      missionStatement: missionBlock?.content || null,
      needStatement: needBlock?.content || null,
      capacity: capacityBlock?.content || null,
      previousGrants: previousGrantsBlock?.content || null,
    },
    formData,
  }
}

// ============= SECTION DRAFTING =============

/**
 * Generate a draft for a specific application section
 */
export async function generateSectionDraft(
  userId: string,
  grantId: string,
  section: ApplicationSection,
  formData: ApplicationFormData
): Promise<{
  content: string
  confidence: number
  sources: string[]
} | null> {
  const ai = getAIClient()
  if (!ai) return null

  const context = await buildApplicationContext(userId, grantId, formData)

  const sectionPrompts: Record<ApplicationSection, string> = {
    contact_info: '', // Not AI-generated
    organization_info: '', // Not AI-generated
    project_summary: `
Write a compelling 150-200 word project summary for this grant application.

GRANT: ${sanitizePromptInput(context.grant.title, 500)}
FUNDER: ${sanitizePromptInput(context.grant.sponsor, 500)}
GRANT PURPOSE: ${sanitizePromptInput(context.grant.summary || context.grant.description || 'General funding')}

ORGANIZATION: ${sanitizePromptInput(context.user.organizationName, 500)}
ORGANIZATION MISSION: ${sanitizePromptInput(context.user.missionStatement)}
PROJECT TITLE: ${sanitizePromptInput(formData.projectTitle, 500)}

Requirements:
- Start with the problem being addressed
- Briefly describe the proposed solution
- State expected outcomes
- End with why this funder should support this project
- Use active voice and specific language
- Keep it factual, avoid hyperbole
`,
    project_narrative: `
Write a detailed project narrative (400-600 words) for this grant application.

GRANT: ${sanitizePromptInput(context.grant.title, 500)}
FUNDER: ${sanitizePromptInput(context.grant.sponsor, 500)}
GRANT CATEGORIES: ${sanitizePromptArray(context.grant.categories)}

ORGANIZATION: ${sanitizePromptInput(context.user.organizationName, 500)}
MISSION: ${sanitizePromptInput(context.user.missionStatement)}
NEED: ${sanitizePromptInput(context.user.needStatement || formData.needStatement)}
PROJECT TITLE: ${sanitizePromptInput(formData.projectTitle, 500)}
PROJECT SUMMARY: ${sanitizePromptInput(formData.projectSummary)}

Structure the narrative as follows:
1. Problem Statement (why this project is needed)
2. Project Description (what you will do)
3. Target Population (who will benefit)
4. Approach/Methodology (how you will do it)
5. Expected Impact (outcomes and deliverables)

Requirements:
- Be specific and use data where possible
- Connect your work to the funder's priorities
- Show your organization's qualifications
- Use clear, professional language
`,
    goals_objectives: `
Write clear, measurable goals and objectives for this grant application.

PROJECT: ${sanitizePromptInput(formData.projectTitle || context.grant.title, 500)}
PROJECT SUMMARY: ${sanitizePromptInput(formData.projectSummary)}
FUNDING AMOUNT: ${context.grant.amountMin ? `$${context.grant.amountMin.toLocaleString()} - $${context.grant.amountMax?.toLocaleString()}` : 'Variable'}

Create 2-3 goals with 2-4 SMART objectives each.
Format as:
GOAL 1: [Broad outcome statement]
- Objective 1.1: [Specific, Measurable, Achievable, Relevant, Time-bound]
- Objective 1.2: [...]

Requirements:
- Goals should be broad outcome statements
- Objectives must be measurable with specific targets
- Include timelines for each objective
- Align with funder priorities
`,
    timeline: `
Create a project timeline with key milestones.

PROJECT: ${sanitizePromptInput(formData.projectTitle, 500)}
PROJECT DURATION: ${sanitizePromptInput(formData.projectStartDate, 100)} to ${sanitizePromptInput(formData.projectEndDate, 100)}
PROJECT SUMMARY: ${sanitizePromptInput(formData.projectSummary)}
GOALS: ${sanitizePromptInput(formData.goalsAndObjectives)}

Create 4-8 milestones in JSON format:
{
  "milestones": [
    {
      "title": "Milestone name",
      "description": "Brief description",
      "month": 1,
      "deliverables": ["Deliverable 1", "Deliverable 2"]
    }
  ]
}
`,
    budget: '', // Handled separately
    budget_narrative: `
Write a budget justification narrative for this grant application.

PROJECT: ${sanitizePromptInput(formData.projectTitle, 500)}
AMOUNT REQUESTED: ${formData.amountRequested ? `$${formData.amountRequested.toLocaleString()}` : 'Not specified'}
BUDGET ITEMS: ${formData.budgetItems ? sanitizePromptInput(formData.budgetItems.map(i => `${i.category}: $${i.amount} - ${i.description}`).join('\n'), 3000) : 'Not provided'}

Write a 200-300 word budget narrative that:
1. Explains the overall budget approach
2. Justifies major expense categories
3. Explains any personnel costs
4. Addresses cost-effectiveness
5. Notes any in-kind contributions or matching funds

Requirements:
- Be specific about what funds will support
- Explain why costs are reasonable
- Show value for money
`,
    evaluation: `
Write an evaluation plan for this grant application.

PROJECT: ${sanitizePromptInput(formData.projectTitle, 500)}
GOALS: ${sanitizePromptInput(formData.goalsAndObjectives)}
PROJECT SUMMARY: ${sanitizePromptInput(formData.projectSummary)}

Write a 200-300 word evaluation plan that includes:
1. Evaluation approach (formative and summative)
2. Data collection methods
3. Key performance indicators
4. Reporting schedule
5. How findings will be used

Requirements:
- Connect evaluation to stated goals/objectives
- Be specific about metrics and data sources
- Include both quantitative and qualitative measures
`,
    sustainability: `
Write a sustainability plan for this grant application.

PROJECT: ${sanitizePromptInput(formData.projectTitle, 500)}
ORGANIZATION: ${sanitizePromptInput(context.user.organizationName, 500)}
ORGANIZATION CAPACITY: ${sanitizePromptInput(context.user.capacity)}
PREVIOUS GRANTS: ${sanitizePromptInput(context.user.previousGrants)}

Write a 150-250 word sustainability plan that addresses:
1. How the project will continue after grant funding ends
2. Other funding sources being pursued
3. Organizational commitment to the project
4. Plans for scaling or replicating success

Requirements:
- Be realistic about sustainability
- Identify specific alternative funding sources
- Show organizational commitment
`,
    attachments: '', // Not AI-generated
    certifications: '', // Not AI-generated
  }

  const prompt = sectionPrompts[section]
  if (!prompt) return null

  try {
    const result = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `You are an expert grant writer helping prepare a grant application.

${prompt}

Respond in JSON format:
{
  "content": "The generated text content",
  "confidence": 0.8,
  "sources": ["List of data sources used like 'user mission statement', 'grant description', etc."]
}`,
      config: {
        temperature: 0.3,
        maxOutputTokens: 4096,
        responseMimeType: 'application/json',
      },
    })

    const text = result.text ?? ''
    const parsed: unknown = JSON.parse(text)
    const validated = SectionDraftSchema.parse(parsed)

    return {
      content: validated.content,
      confidence: validated.confidence,
      sources: validated.sources,
    }
  } catch (error) {
    console.error('[ApplicationAI] Section draft error:', error)
    return null
  }
}

/**
 * Generate drafts for all applicable sections
 */
export async function generateAllDrafts(
  userId: string,
  grantId: string,
  formData: ApplicationFormData
): Promise<AIDraftContent> {
  const sections: ApplicationSection[] = [
    'project_summary',
    'project_narrative',
    'goals_objectives',
    'evaluation',
    'sustainability',
  ]

  const drafts: AIDraftContent = { sections: {} }

  // Generate drafts in parallel (limit concurrency)
  const results = await Promise.allSettled(
    sections.map(section => generateSectionDraft(userId, grantId, section, formData))
  )

  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value) {
      drafts.sections[sections[index]] = {
        ...result.value,
        generatedAt: new Date().toISOString(),
      }
    }
  })

  return drafts
}

// ============= SUGGESTIONS =============

/**
 * Analyze application and generate improvement suggestions
 */
export async function generateSuggestions(
  userId: string,
  grantId: string,
  formData: ApplicationFormData
): Promise<AISuggestion[]> {
  const ai = getAIClient()
  if (!ai) return []

  const context = await buildApplicationContext(userId, grantId, formData)

  try {
    const result = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `You are a grant writing expert reviewing a draft application.

GRANT: ${sanitizePromptInput(context.grant.title, 500)}
FUNDER: ${sanitizePromptInput(context.grant.sponsor, 500)}
REQUIREMENTS: ${sanitizePromptArray(context.grant.requirements)}

APPLICATION CONTENT:
- Project Title: ${sanitizePromptInput(formData.projectTitle, 500) || 'MISSING'}
- Project Summary: ${sanitizePromptInput(formData.projectSummary) || 'MISSING'}
- Need Statement: ${sanitizePromptInput(formData.needStatement) || 'MISSING'}
- Goals: ${sanitizePromptInput(formData.goalsAndObjectives) || 'MISSING'}
- Budget Narrative: ${sanitizePromptInput(formData.budgetNarrative) || 'MISSING'}
- Evaluation Plan: ${sanitizePromptInput(formData.evaluationPlan) || 'MISSING'}
- Sustainability: ${sanitizePromptInput(formData.sustainabilityPlan) || 'MISSING'}

Analyze this application and provide suggestions for improvement.
Focus on:
1. Missing required sections
2. Sections that need more detail
3. Alignment with funder priorities
4. Clarity and persuasiveness
5. Common grant writing mistakes

Respond in JSON format:
{
  "suggestions": [
    {
      "section": "project_narrative",
      "type": "improvement",
      "title": "Brief title",
      "description": "Detailed suggestion",
      "suggestedContent": "Optional example text"
    }
  ]
}

Limit to 5-8 most important suggestions.`,
      config: {
        temperature: 0.3,
        maxOutputTokens: 4096,
        responseMimeType: 'application/json',
      },
    })

    const text = result.text ?? ''
    const parsed: unknown = JSON.parse(text)
    const validated = ApplicationSuggestionsSchema.parse(parsed)

    return validated.suggestions.map((s, i) => ({
      id: `suggestion_${Date.now()}_${i}`,
      section: s.section as ApplicationSection,
      type: s.type,
      title: s.title,
      description: s.description,
      suggestedContent: s.suggestedContent,
      dismissed: false,
      createdAt: new Date().toISOString(),
    }))
  } catch (error) {
    console.error('[ApplicationAI] Suggestions error:', error)
    return []
  }
}

// ============= BUDGET ASSISTANCE =============

/**
 * Generate budget suggestions based on project and grant
 */
export async function generateBudgetSuggestions(
  userId: string,
  grantId: string,
  formData: ApplicationFormData
): Promise<{
  items: BudgetLineItem[]
  totalBudget: number
  notes: string
} | null> {
  const ai = getAIClient()
  if (!ai) return null

  const context = await buildApplicationContext(userId, grantId, formData)

  try {
    const result = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `You are a grant budget expert helping create a realistic project budget.

GRANT: ${sanitizePromptInput(context.grant.title, 500)}
FUNDER: ${sanitizePromptInput(context.grant.sponsor, 500)}
FUNDING RANGE: ${context.grant.amountMin ? `$${context.grant.amountMin.toLocaleString()} - $${context.grant.amountMax?.toLocaleString()}` : 'Not specified'}

PROJECT: ${sanitizePromptInput(formData.projectTitle, 500)}
PROJECT SUMMARY: ${sanitizePromptInput(formData.projectSummary)}
PROJECT DURATION: ${sanitizePromptInput(formData.projectStartDate, 100)} to ${sanitizePromptInput(formData.projectEndDate, 100)}

ORGANIZATION TYPE: ${sanitizePromptInput(context.user.entityType, 200)}

Create a realistic budget with typical categories for this type of project.
Common categories include: Personnel, Fringe Benefits, Travel, Equipment, Supplies, Contractual, Other, Indirect Costs

Respond in JSON format:
{
  "items": [
    {
      "category": "Personnel",
      "description": "Project Coordinator (0.5 FTE x 12 months)",
      "suggestedAmount": 30000,
      "justification": "Coordinates all project activities"
    }
  ],
  "totalBudget": 100000,
  "notes": "Brief notes about the budget approach and any assumptions"
}

Target the budget to fit within the funder's range if specified.`,
      config: {
        temperature: 0.3,
        maxOutputTokens: 4096,
        responseMimeType: 'application/json',
      },
    })

    const text = result.text ?? ''
    const parsed: unknown = JSON.parse(text)
    const validated = BudgetSuggestionSchema.parse(parsed)

    return {
      items: validated.items.map((item, i) => ({
        id: `budget_${Date.now()}_${i}`,
        category: item.category,
        description: item.description,
        amount: item.suggestedAmount,
        justification: item.justification,
        fromVault: false,
      })),
      totalBudget: validated.totalBudget,
      notes: validated.notes,
    }
  } catch (error) {
    console.error('[ApplicationAI] Budget suggestions error:', error)
    return null
  }
}

// ============= COMPLETENESS CHECK =============

/**
 * Check application completeness and readiness
 */
export async function checkReadiness(
  formData: ApplicationFormData,
  grantRequirements: string[]
): Promise<{
  isReady: boolean
  completeness: number
  missingRequired: string[]
  warnings: string[]
  recommendations: string[]
}> {
  const missingRequired: string[] = []
  const warnings: string[] = []
  const recommendations: string[] = []

  // Required fields check
  if (!formData.contactName) missingRequired.push('Contact name')
  if (!formData.contactEmail) missingRequired.push('Contact email')
  if (!formData.organizationName) missingRequired.push('Organization name')
  if (!formData.projectTitle) missingRequired.push('Project title')
  if (!formData.projectSummary) missingRequired.push('Project summary')

  // Narrative checks
  if (!formData.projectDescription) {
    missingRequired.push('Project description/narrative')
  } else if (formData.projectDescription.length < 500) {
    warnings.push('Project narrative may be too brief (under 500 characters)')
  }

  if (!formData.goalsAndObjectives) {
    missingRequired.push('Goals and objectives')
  }

  // Budget checks
  if (!formData.budgetItems || formData.budgetItems.length === 0) {
    missingRequired.push('Budget items')
  } else {
    const total = formData.budgetItems.reduce((sum, item) => sum + item.amount, 0)
    if (formData.amountRequested && Math.abs(total - formData.amountRequested) > 100) {
      warnings.push('Budget items do not add up to requested amount')
    }
  }

  if (!formData.budgetNarrative) {
    recommendations.push('Consider adding a budget narrative/justification')
  }

  // Evaluation check
  if (!formData.evaluationPlan) {
    recommendations.push('Consider adding an evaluation plan')
  }

  // Timeline check
  if (!formData.milestones || formData.milestones.length === 0) {
    recommendations.push('Consider adding project milestones/timeline')
  }

  // Calculate completeness
  const totalFields = 15
  let filledFields = 0
  if (formData.contactName) filledFields++
  if (formData.contactEmail) filledFields++
  if (formData.organizationName) filledFields++
  if (formData.projectTitle) filledFields++
  if (formData.projectSummary) filledFields++
  if (formData.projectDescription) filledFields++
  if (formData.goalsAndObjectives) filledFields++
  if (formData.needStatement) filledFields++
  if (formData.budgetItems && formData.budgetItems.length > 0) filledFields++
  if (formData.budgetNarrative) filledFields++
  if (formData.evaluationPlan) filledFields++
  if (formData.sustainabilityPlan) filledFields++
  if (formData.milestones && formData.milestones.length > 0) filledFields++
  if (formData.ein) filledFields++
  if (formData.ueiNumber) filledFields++

  const completeness = Math.round((filledFields / totalFields) * 100)

  return {
    isReady: missingRequired.length === 0 && warnings.length === 0,
    completeness,
    missingRequired,
    warnings,
    recommendations,
  }
}
