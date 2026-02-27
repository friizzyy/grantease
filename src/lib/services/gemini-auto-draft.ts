/**
 * GEMINI AUTO-DRAFT
 * -----------------
 * Generates a COMPLETE application draft by combining vault data
 * with grant requirements. Produces all sections at once: contact info,
 * project summary, narrative, budget, and timeline.
 */

import { generateJSONWithUsage, isGeminiConfigured, type GeminiUsage } from './gemini-client'
import type { UserProfile } from '@/lib/types/onboarding'
import { sanitizePromptInput, sanitizePromptArray } from '@/lib/utils/prompt-sanitizer'

/** Zero usage constant for null/error returns */
const ZERO_USAGE: GeminiUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 }

/**
 * Complete auto-generated application draft
 */
export interface AutoDraftResult {
  sections: {
    contactInfo: {
      name: string
      title: string
      email: string
      phone: string
      organization: string
    }
    projectSummary: {
      projectTitle: string
      projectSummary: string
      requestedAmount: string
      projectStartDate: string
      projectEndDate: string
    }
    narrative: {
      statementOfNeed: string
      projectDescription: string
      goalsAndObjectives: string
      evaluationPlan: string
      sustainabilityPlan: string
    }
    budget: {
      personnel: Array<{ item: string; amount: number; justification: string }>
      equipment: Array<{ item: string; amount: number; justification: string }>
      supplies: Array<{ item: string; amount: number; justification: string }>
      travel: Array<{ item: string; amount: number; justification: string }>
      other: Array<{ item: string; amount: number; justification: string }>
      indirect: { rate: string; amount: number }
      totalRequested: number
    }
    timeline: Array<{
      milestone: string
      startDate: string
      endDate: string
      deliverables: string[]
    }>
  }
  qualityScore: number // 0-100 self-assessment of draft quality
  sectionsNeedingReview: string[] // Which sections need the most human review
  suggestions: string[] // Tips for improving the draft
}

/**
 * Vault data for pre-filling contact and organizational information
 */
export interface VaultData {
  orgName?: string
  legalName?: string
  ein?: string
  duns?: string
  uei?: string
  website?: string
  mission?: string
  orgHistory?: string
  serviceArea?: string
  annualBudget?: string
  primaryContactName?: string
  primaryContactTitle?: string
  primaryContactEmail?: string
  primaryContactPhone?: string
  addressStreet?: string
  addressCity?: string
  addressState?: string
  addressZip?: string
}

/**
 * Grant details needed for draft generation
 */
export interface GrantForDraft {
  id: string
  title: string
  sponsor: string
  description?: string
  requirements?: string
  eligibility?: string
  deadline?: string
  amountMin?: number
  amountMax?: number
  url?: string
}

/**
 * Generate a complete application draft from grant details, user profile, and vault data.
 *
 * The AI uses vault data for contact info and org details, generates narrative
 * sections tailored to the grant's requirements, creates a realistic budget,
 * and builds a timeline working backward from the deadline.
 */
export async function generateAutoDraft(
  grant: GrantForDraft,
  profile: UserProfile,
  vaultData: VaultData | null
): Promise<{ result: AutoDraftResult | null; usage: GeminiUsage }> {
  if (!isGeminiConfigured()) {
    return { result: null, usage: ZERO_USAGE }
  }

  // Build vault context
  const vaultContext = vaultData
    ? `## ORGANIZATION VAULT DATA (use for contact info and org details)
- Organization Name: ${sanitizePromptInput(vaultData.orgName, 500)}
- Legal Name: ${sanitizePromptInput(vaultData.legalName, 500)}
- EIN: ${sanitizePromptInput(vaultData.ein, 20)}
- DUNS: ${sanitizePromptInput(vaultData.duns, 20)}
- UEI: ${sanitizePromptInput(vaultData.uei, 20)}
- Website: ${sanitizePromptInput(vaultData.website, 500)}
- Mission: ${sanitizePromptInput(vaultData.mission)}
- Org History: ${sanitizePromptInput(vaultData.orgHistory)}
- Service Area: ${sanitizePromptInput(vaultData.serviceArea, 500)}
- Annual Budget: ${sanitizePromptInput(vaultData.annualBudget, 100)}
- Primary Contact: ${sanitizePromptInput(vaultData.primaryContactName, 200)}
- Title: ${sanitizePromptInput(vaultData.primaryContactTitle, 200)}
- Email: ${sanitizePromptInput(vaultData.primaryContactEmail, 200)}
- Phone: ${sanitizePromptInput(vaultData.primaryContactPhone, 50)}
- Address: ${sanitizePromptInput(vaultData.addressStreet, 300)}, ${sanitizePromptInput(vaultData.addressCity, 100)}, ${sanitizePromptInput(vaultData.addressState, 50)} ${sanitizePromptInput(vaultData.addressZip, 20)}`
    : `## ORGANIZATION VAULT DATA
No vault data available. Use profile information and generate reasonable placeholders marked with [FILL IN].`

  // Build funding range context
  const fundingRange = grant.amountMin || grant.amountMax
    ? `Funding Range: $${grant.amountMin?.toLocaleString() || '?'} - $${grant.amountMax?.toLocaleString() || '?'}`
    : 'Funding Range: Not specified'

  const deadlineStr = grant.deadline || 'Not specified'

  const prompt = `You are an expert grant writer generating a COMPLETE application draft.

## GRANT DETAILS
Title: ${sanitizePromptInput(grant.title, 500)}
Sponsor: ${sanitizePromptInput(grant.sponsor, 500)}
${grant.description ? `Description: ${sanitizePromptInput(grant.description)}` : ''}
${grant.requirements ? `Requirements: ${sanitizePromptInput(grant.requirements)}` : ''}
${grant.eligibility ? `Eligibility: ${sanitizePromptInput(grant.eligibility)}` : ''}
Deadline: ${sanitizePromptInput(deadlineStr, 200)}
${fundingRange}
${grant.url ? `URL: ${sanitizePromptInput(grant.url, 500)}` : ''}

## APPLICANT PROFILE
- Type: ${sanitizePromptInput(profile.entityType, 100)}
- Location: ${sanitizePromptInput(profile.state, 100) || 'USA'}
- Focus: ${sanitizePromptArray(profile.industryTags)}
- Size: ${sanitizePromptInput(profile.sizeBand, 50) || 'Not specified'}
- Stage: ${sanitizePromptInput(profile.stage, 50) || 'Not specified'}
${profile.companyName ? `- Organization: ${sanitizePromptInput(profile.companyName, 500)}` : ''}
${profile.companyDescription ? `- Description: ${sanitizePromptInput(profile.companyDescription)}` : ''}

${vaultContext}

## YOUR TASK
Generate a COMPLETE application draft with all sections. Follow these rules:

1. **Contact Info**: Use vault data if available; otherwise use profile data with [FILL IN] placeholders
2. **Project Summary**: Create a compelling project title and summary aligned with grant goals
3. **Narrative Sections**: Write detailed, professional content for each section (400-800 words each)
   - Statement of Need: Use data/statistics, show urgency, connect to funder priorities
   - Project Description: Specific activities, beneficiaries, methodology
   - Goals & Objectives: SMART goals, measurable outcomes
   - Evaluation Plan: Clear metrics, data collection methods, timeline
   - Sustainability Plan: How the project continues after funding ends
4. **Budget**: Create a realistic line-item budget within the grant's funding range
   - Each item needs justification
   - Budget should reflect the project described in the narrative
   - Include indirect costs at a reasonable rate (10-15%)
5. **Timeline**: Work backward from the deadline to create realistic milestones
6. **Quality Score**: Honestly assess the draft quality (0-100)
7. **Sections Needing Review**: Flag which sections need the most human attention
8. **Suggestions**: Provide specific tips for improving the draft

## OUTPUT FORMAT
Return as JSON:

\`\`\`json
{
  "sections": {
    "contactInfo": {
      "name": "Jane Smith",
      "title": "Executive Director",
      "email": "jane@org.com",
      "phone": "(555) 123-4567",
      "organization": "Example Nonprofit"
    },
    "projectSummary": {
      "projectTitle": "A compelling project title",
      "projectSummary": "2-3 paragraph executive summary...",
      "requestedAmount": "$50,000",
      "projectStartDate": "April 1, 2026",
      "projectEndDate": "March 31, 2027"
    },
    "narrative": {
      "statementOfNeed": "Detailed statement of need with data...",
      "projectDescription": "Detailed project description...",
      "goalsAndObjectives": "SMART goals and measurable objectives...",
      "evaluationPlan": "Evaluation methodology and metrics...",
      "sustainabilityPlan": "Post-funding sustainability strategy..."
    },
    "budget": {
      "personnel": [
        { "item": "Project Director (0.5 FTE)", "amount": 25000, "justification": "Oversees all project activities" }
      ],
      "equipment": [],
      "supplies": [
        { "item": "Office supplies", "amount": 500, "justification": "General project supplies" }
      ],
      "travel": [
        { "item": "Site visits (4 trips)", "amount": 2000, "justification": "Quarterly visits to partner sites" }
      ],
      "other": [],
      "indirect": { "rate": "12%", "amount": 3600 },
      "totalRequested": 50000
    },
    "timeline": [
      {
        "milestone": "Project Kickoff & Planning",
        "startDate": "April 2026",
        "endDate": "May 2026",
        "deliverables": ["Hire staff", "Establish partnerships", "Develop work plan"]
      }
    ]
  },
  "qualityScore": 72,
  "sectionsNeedingReview": [
    "contactInfo - verify all details are accurate",
    "budget - review amounts against actual costs"
  ],
  "suggestions": [
    "Add specific local data/statistics to statement of need",
    "Include letters of support from partner organizations"
  ]
}
\`\`\`

Write professional, compelling content. Be specific and concrete, not generic. Tailor everything to this specific grant and applicant.`

  try {
    const { data, usage } = await generateJSONWithUsage<AutoDraftResult>(prompt)
    return { result: data, usage }
  } catch (error) {
    console.error('Auto-draft generation error:', error)
    return { result: null, usage: ZERO_USAGE }
  }
}
