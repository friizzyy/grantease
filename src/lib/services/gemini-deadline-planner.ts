/**
 * GEMINI DEADLINE PLANNER
 * -----------------------
 * Analyzes a user's saved grants and active workspaces, then creates
 * a prioritized action plan with weekly scheduling and urgency warnings.
 */

import { generateJSONWithUsage, isGeminiConfigured, type GeminiUsage } from './gemini-client'
import type { UserProfile } from '@/lib/types/onboarding'
import { sanitizePromptInput, sanitizePromptArray } from '@/lib/utils/prompt-sanitizer'

/** Zero usage constant for null/error returns */
const ZERO_USAGE: GeminiUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 }

/**
 * Complete deadline-driven action plan
 */
export interface DeadlinePlan {
  prioritizedGrants: Array<{
    grantId: string
    grantTitle: string
    deadline: string
    daysUntilDeadline: number
    urgency: 'critical' | 'urgent' | 'upcoming' | 'comfortable'
    matchScore?: number
    recommendedAction: string
    estimatedHoursNeeded: number
  }>
  weeklyPlan: Array<{
    week: string // "This week", "Next week", "Week of Mar 10"
    tasks: Array<{
      grantTitle: string
      task: string
      hours: number
      priority: 'high' | 'medium' | 'low'
    }>
    totalHours: number
  }>
  overallAdvice: string
  warnings: string[]
  quickWins: string[] // Easy tasks that can be done immediately
}

/**
 * Generate a prioritized deadline plan across all saved grants and active workspaces.
 *
 * Urgency is calculated from deadline proximity weighted by match score.
 * The weekly plan distributes work within the user's available hours.
 */
export async function generateDeadlinePlan(
  savedGrants: Array<{ id: string; title: string; sponsor: string; deadline?: Date | null; matchScore?: number }>,
  activeWorkspaces: Array<{ id: string; grantTitle: string; status: string; progressPercent?: number; dueDate?: Date | null }>,
  availableHoursPerWeek: number,
  profile: UserProfile
): Promise<{ result: DeadlinePlan | null; usage: GeminiUsage }> {
  if (!isGeminiConfigured()) {
    return { result: null, usage: ZERO_USAGE }
  }

  // Build saved grants context with deadline info
  const grantsContext = savedGrants.map((g, i) => {
    const deadlineStr = g.deadline
      ? new Date(g.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
      : 'No deadline specified'
    const daysUntil = g.deadline
      ? Math.ceil((new Date(g.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      : null
    return `${i + 1}. "${sanitizePromptInput(g.title, 300)}" by ${sanitizePromptInput(g.sponsor, 300)}
   Deadline: ${deadlineStr}${daysUntil !== null ? ` (${daysUntil} days away)` : ''}
   Match Score: ${g.matchScore != null ? `${g.matchScore}/100` : 'Not scored'}
   Grant ID: ${g.id}`
  }).join('\n')

  // Build active workspaces context
  const workspacesContext = activeWorkspaces.length > 0
    ? activeWorkspaces.map((ws, i) => {
        const dueDateStr = ws.dueDate
          ? new Date(ws.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
          : 'No due date set'
        return `${i + 1}. "${sanitizePromptInput(ws.grantTitle, 300)}"
   Status: ${sanitizePromptInput(ws.status, 50)}
   Progress: ${ws.progressPercent ?? 0}%
   Due Date: ${dueDateStr}`
      }).join('\n')
    : 'No active workspaces'

  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  const prompt = `You are a grant application strategist creating a prioritized action plan.

## TODAY'S DATE
${today}

## APPLICANT PROFILE
- Type: ${sanitizePromptInput(profile.entityType, 100)}
- Location: ${sanitizePromptInput(profile.state, 100) || 'USA'}
- Focus: ${sanitizePromptArray(profile.industryTags)}
- Size: ${sanitizePromptInput(profile.sizeBand, 50) || 'Not specified'}
- Stage: ${sanitizePromptInput(profile.stage, 50) || 'Not specified'}
${profile.companyName ? `- Organization: ${sanitizePromptInput(profile.companyName, 500)}` : ''}
- Available hours per week: ${availableHoursPerWeek}

## SAVED GRANTS
${grantsContext || 'No saved grants'}

## ACTIVE WORKSPACES (applications in progress)
${workspacesContext}

## YOUR TASK
Create a comprehensive deadline-driven action plan that:

1. **Prioritizes grants** by deadline urgency weighted by match score (higher match + closer deadline = higher priority)
2. **Creates a weekly plan** that fits within ${availableHoursPerWeek} hours/week
3. **Identifies warnings** about overlapping deadlines, insufficient time, or grants at risk
4. **Suggests quick wins** — small tasks that can be completed immediately
5. **Accounts for in-progress applications** — factor workspace status into time estimates

Urgency levels:
- critical: < 7 days until deadline
- urgent: 7-14 days
- upcoming: 15-30 days
- comfortable: > 30 days or no deadline

## OUTPUT FORMAT
Return as JSON:

\`\`\`json
{
  "prioritizedGrants": [
    {
      "grantId": "the-grant-id",
      "grantTitle": "Grant Title",
      "deadline": "March 15, 2026",
      "daysUntilDeadline": 14,
      "urgency": "urgent",
      "matchScore": 85,
      "recommendedAction": "Start narrative section immediately — strong match, tight deadline",
      "estimatedHoursNeeded": 20
    }
  ],
  "weeklyPlan": [
    {
      "week": "This week",
      "tasks": [
        {
          "grantTitle": "Grant Title",
          "task": "Complete project narrative draft",
          "hours": 4,
          "priority": "high"
        }
      ],
      "totalHours": 10
    }
  ],
  "overallAdvice": "Focus on the top 2 grants this month. Your strongest match is X, but Y has the tightest deadline.",
  "warnings": [
    "Two grants have deadlines within 3 days of each other — you may need to choose one"
  ],
  "quickWins": [
    "Gather organizational documents (EIN, 501c3 letter) — needed for multiple applications"
  ]
}
\`\`\`

Be realistic about time estimates. If the user cannot complete everything in time, say so and recommend which grants to prioritize.`

  try {
    const { data, usage } = await generateJSONWithUsage<DeadlinePlan>(prompt)
    return { result: data, usage }
  } catch (error) {
    console.error('Deadline plan generation error:', error)
    return { result: null, usage: ZERO_USAGE }
  }
}
