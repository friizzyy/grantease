import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import OpenAI from 'openai'
import { rateLimiters, rateLimitExceededResponse } from '@/lib/rate-limit'

// Lazy initialization to avoid build-time errors when API key is not set
function getOpenAIClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not configured')
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

interface WritingRequest {
  action: 'improve' | 'expand' | 'summarize' | 'proofread' | 'tone' | 'generate'
  text?: string
  context?: {
    grantId?: string
    workspaceId?: string
    sectionType?: string
    targetTone?: string
    maxLength?: number
  }
  prompt?: string
}

/**
 * POST /api/ai/writing-assistant
 *
 * AI-powered writing assistance for grant applications
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    // Rate limiting for AI endpoints
    const rateLimit = rateLimiters.ai(userId)
    if (!rateLimit.allowed) {
      return rateLimitExceededResponse(rateLimit.resetAt)
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'AI writing assistant not configured' },
        { status: 503 }
      )
    }

    const body: WritingRequest = await request.json()
    const { action, text, context, prompt } = body

    if (!action) {
      return NextResponse.json(
        { error: 'Action is required' },
        { status: 400 }
      )
    }

    // Get grant context if provided
    let grantContext = ''
    if (context?.grantId) {
      const grant = await prisma.grant.findUnique({
        where: { id: context.grantId },
        select: {
          title: true,
          sponsor: true,
          summary: true,
          eligibility: true,
          requirements: true,
        },
      })
      if (grant) {
        grantContext = `
Grant: ${grant.title}
Sponsor: ${grant.sponsor}
Summary: ${grant.summary}
Eligibility: ${grant.eligibility}
Requirements: ${grant.requirements || 'Not specified'}
`
      }
    }

    // Get user profile for context
    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
      select: {
        entityType: true,
        industryTags: true,
      },
    })

    const userContext = profile ? `
Applicant Type: ${profile.entityType}
Industry Focus: ${profile.industryTags}
` : ''

    // Build system prompt based on action
    const systemPrompts: Record<string, string> = {
      improve: `You are an expert grant writing assistant. Your task is to improve the provided text to be more compelling, clear, and professional for a grant application. Maintain the original meaning and key points while enhancing the writing quality. Keep the same approximate length unless the text is very short.`,

      expand: `You are an expert grant writing assistant. Your task is to expand the provided text with more detail, examples, and supporting information appropriate for a grant application. Make it more comprehensive while maintaining coherence and professionalism.`,

      summarize: `You are an expert grant writing assistant. Your task is to create a concise summary of the provided text that captures all key points. This should be suitable for an executive summary or abstract section of a grant application.`,

      proofread: `You are an expert grant writing assistant and editor. Your task is to proofread the provided text, fixing any grammar, spelling, punctuation, and style issues. Return the corrected text with a brief note about what was changed.`,

      tone: `You are an expert grant writing assistant. Your task is to adjust the tone of the provided text to be ${context?.targetTone || 'professional and persuasive'} while maintaining the original content and meaning.`,

      generate: `You are an expert grant writing assistant. Your task is to generate content for a grant application section based on the provided context and requirements. Write in a professional, compelling manner appropriate for grant applications.`,
    }

    const systemPrompt = systemPrompts[action] || systemPrompts.improve

    // Build user prompt
    let userPrompt = ''

    if (action === 'generate') {
      userPrompt = `${grantContext}\n${userContext}\n\nSection to write: ${context?.sectionType || 'general'}\n\nAdditional instructions: ${prompt || 'Write a compelling section for this grant application.'}`
    } else {
      if (!text) {
        return NextResponse.json(
          { error: 'Text is required for this action' },
          { status: 400 }
        )
      }
      userPrompt = `${grantContext}\n${userContext}\n\nText to ${action}:\n\n${text}`

      if (prompt) {
        userPrompt += `\n\nAdditional instructions: ${prompt}`
      }

      if (context?.maxLength) {
        userPrompt += `\n\nMaximum length: approximately ${context.maxLength} words.`
      }
    }

    const openaiClient = getOpenAIClient()
    const startTime = Date.now()
    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    })
    const responseTime = Date.now() - startTime

    const result = completion.choices[0]?.message?.content

    // Log AI usage
    await prisma.aIUsageLog.create({
      data: {
        userId: session.user.id,
        type: 'writing_assistant',
        model: 'gpt-4o-mini',
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0,
        responseTime,
        grantId: context?.grantId || null,
        workspaceId: context?.workspaceId || null,
        success: !!result,
        errorMessage: result ? null : 'No response generated',
        metadata: JSON.stringify({ action, sectionType: context?.sectionType }),
      },
    })

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to generate response' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      result,
      action,
      usage: {
        promptTokens: completion.usage?.prompt_tokens,
        completionTokens: completion.usage?.completion_tokens,
        totalTokens: completion.usage?.total_tokens,
      },
    })
  } catch (error) {
    console.error('AI writing assistant error:', error)
    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: `OpenAI API error: ${error.message}` },
        { status: error.status || 500 }
      )
    }
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

    const isConfigured = !!process.env.OPENAI_API_KEY

    return NextResponse.json({
      isConfigured,
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
          options: ['professional', 'persuasive', 'formal', 'friendly', 'technical'],
        },
        {
          id: 'generate',
          label: 'Generate Content',
          description: 'Create new content for a section',
          sections: [
            'executive_summary',
            'project_narrative',
            'methodology',
            'budget_justification',
            'organizational_capacity',
            'evaluation_plan',
            'sustainability',
          ],
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
