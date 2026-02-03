import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { rateLimiters, rateLimitExceededResponse } from '@/lib/rate-limit'
import { safeJsonParse } from '@/lib/api-utils'
import { UserProfile } from '@/lib/types/onboarding'
import {
  generateSectionContent,
  improveDraft,
  getDraftFeedback,
  chatWithWritingAssistant,
  isGeminiConfigured,
  type SectionType,
} from '@/lib/services/gemini-writing-assistant'

interface WritingRequest {
  action: 'improve' | 'expand' | 'summarize' | 'proofread' | 'tone' | 'generate' | 'feedback' | 'chat'
  text?: string
  context?: {
    grantId?: string
    grantTitle?: string
    grantSponsor?: string
    workspaceId?: string
    sectionType?: SectionType
    targetTone?: 'formal' | 'conversational' | 'technical'
    maxLength?: number
  }
  prompt?: string
  previousMessages?: Array<{ role: 'user' | 'assistant'; content: string }>
}

/**
 * POST /api/ai/writing-assistant
 *
 * AI-powered writing assistance for grant applications using Gemini
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    // Rate limiting
    const rateLimit = rateLimiters.ai(userId)
    if (!rateLimit.allowed) {
      return rateLimitExceededResponse(rateLimit.resetAt)
    }

    if (!isGeminiConfigured()) {
      return NextResponse.json(
        { error: 'AI writing assistant not configured. Please add GEMINI_API_KEY to your environment.' },
        { status: 503 }
      )
    }

    const body: WritingRequest = await request.json()
    const { action, text, context, prompt, previousMessages } = body

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      )
    }

    // Get user profile
    const dbProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    })

    // Build profile - use a default if not set
    const profile: UserProfile = {
      id: dbProfile?.id || '',
      userId: dbProfile?.userId || session.user.id,
      entityType: (dbProfile?.entityType as UserProfile['entityType']) || 'individual',
      country: dbProfile?.country || 'US',
      state: dbProfile?.state || null,
      industryTags: dbProfile ? safeJsonParse<string[]>(dbProfile.industryTags, []) : [],
      sizeBand: (dbProfile?.sizeBand || null) as UserProfile['sizeBand'],
      stage: (dbProfile?.stage || null) as UserProfile['stage'],
      annualBudget: (dbProfile?.annualBudget || null) as UserProfile['annualBudget'],
      industryAttributes: dbProfile ? safeJsonParse<Record<string, string | string[] | boolean>>(dbProfile.industryAttributes, {}) : {},
      grantPreferences: dbProfile ? safeJsonParse<UserProfile['grantPreferences']>(dbProfile.grantPreferences, { preferredSize: null, timeline: null, complexity: null }) : { preferredSize: null, timeline: null, complexity: null },
      onboardingCompleted: dbProfile?.onboardingCompleted || false,
      onboardingCompletedAt: dbProfile?.onboardingCompletedAt || null,
      onboardingStep: dbProfile?.onboardingStep || 1,
      confidenceScore: dbProfile?.confidenceScore || 0,
    }

    // Get grant context if provided
    let grantTitle = context?.grantTitle || 'Grant Application'
    let grantSponsor = context?.grantSponsor || 'Funding Organization'
    let grantRequirements = ''

    if (context?.grantId) {
      const grant = await prisma.grant.findUnique({
        where: { id: context.grantId },
        select: {
          title: true,
          sponsor: true,
          summary: true,
          requirements: true,
        },
      })
      if (grant) {
        grantTitle = grant.title
        grantSponsor = grant.sponsor
        grantRequirements = grant.requirements || grant.summary
      }
    }

    const startTime = Date.now()
    let result: string | null = null
    let additionalData: Record<string, unknown> = {}

    switch (action) {
      case 'generate': {
        const response = await generateSectionContent(
          {
            section: context?.sectionType || 'project_description',
            grantTitle,
            grantSponsor,
            grantRequirements,
            userNotes: prompt,
            wordLimit: context?.maxLength || 500,
            tone: context?.targetTone || 'formal',
          },
          profile
        )
        if (response) {
          result = response.content
          additionalData = {
            wordCount: response.wordCount,
            suggestions: response.suggestions,
            strengthenTips: response.strengthenTips,
          }
        }
        break
      }

      case 'improve':
      case 'expand':
      case 'summarize':
      case 'proofread':
      case 'tone': {
        if (!text) {
          return NextResponse.json(
            { error: 'Text is required for this action' },
            { status: 400 }
          )
        }
        result = await improveDraft(
          text,
          context?.sectionType || 'project_description',
          { title: grantTitle, sponsor: grantSponsor },
          profile
        )
        break
      }

      case 'feedback': {
        if (!text) {
          return NextResponse.json(
            { error: 'Text is required for feedback' },
            { status: 400 }
          )
        }
        const feedback = await getDraftFeedback(
          text,
          context?.sectionType || 'project_description',
          { title: grantTitle, sponsor: grantSponsor }
        )
        if (feedback) {
          result = `Score: ${feedback.score}/100\n\nStrengths:\n${feedback.strengths.map(s => `• ${s}`).join('\n')}\n\nAreas to Improve:\n${feedback.weaknesses.map(w => `• ${w}`).join('\n')}\n\nSuggestions:\n${feedback.suggestions.map(s => `• ${s}`).join('\n')}`
          additionalData = feedback
        }
        break
      }

      case 'chat': {
        if (!prompt) {
          return NextResponse.json(
            { error: 'Message is required for chat' },
            { status: 400 }
          )
        }
        result = await chatWithWritingAssistant(
          prompt,
          {
            grantTitle,
            grantSponsor,
            currentSection: context?.sectionType,
            previousMessages,
          },
          profile
        )
        break
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

    const responseTime = Date.now() - startTime

    // Log AI usage
    try {
      await prisma.aIUsageLog.create({
        data: {
          userId: session.user.id,
          type: 'writing_assistant',
          model: 'gemini-1.5-pro',
          promptTokens: 0, // Gemini doesn't provide token counts easily
          completionTokens: 0,
          totalTokens: 0,
          responseTime,
          grantId: context?.grantId || null,
          workspaceId: context?.workspaceId || null,
          success: !!result,
          errorMessage: result ? null : 'No response generated',
          metadata: JSON.stringify({ action, sectionType: context?.sectionType }),
        },
      })
    } catch (logError) {
      console.warn('Failed to log AI usage:', logError)
    }

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to generate response' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      result,
      action,
      aiProvider: 'gemini',
      ...additionalData,
    })
  } catch (error) {
    console.error('AI writing assistant error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/ai/writing-assistant
 *
 * Get available actions and configuration
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const configured = isGeminiConfigured()

    return NextResponse.json({
      isConfigured: configured,
      aiProvider: 'gemini',
      actions: [
        {
          id: 'improve',
          label: 'Improve Writing',
          description: 'Enhance clarity, professionalism, and impact',
        },
        {
          id: 'expand',
          label: 'Expand Content',
          description: 'Add more detail and supporting information',
        },
        {
          id: 'summarize',
          label: 'Summarize',
          description: 'Create a concise summary of the text',
        },
        {
          id: 'proofread',
          label: 'Proofread',
          description: 'Fix grammar, spelling, and style issues',
        },
        {
          id: 'tone',
          label: 'Adjust Tone',
          description: 'Change the writing style or tone',
          options: ['formal', 'conversational', 'technical'],
        },
        {
          id: 'generate',
          label: 'Generate Content',
          description: 'Create new content for a section',
          sections: [
            'executive_summary',
            'statement_of_need',
            'project_description',
            'goals_objectives',
            'methods_approach',
            'evaluation_plan',
            'budget_narrative',
            'organizational_capacity',
            'sustainability_plan',
            'timeline',
          ],
        },
        {
          id: 'feedback',
          label: 'Get Feedback',
          description: 'Get AI feedback and scoring on your draft',
        },
        {
          id: 'chat',
          label: 'Chat Assistant',
          description: 'Have a conversation about your grant application',
        },
      ],
    })
  } catch (error) {
    console.error('Get writing assistant config error:', error)
    return NextResponse.json(
      { error: 'Failed to get configuration' },
      { status: 500 }
    )
  }
}
