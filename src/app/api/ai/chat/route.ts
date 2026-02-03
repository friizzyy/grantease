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

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

/**
 * POST /api/ai/chat
 *
 * AI-powered chat assistant for grant discovery and guidance
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
        { error: 'AI chat not configured' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { message, conversationHistory = [] } = body

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Get user profile for context
    const profile = await prisma.userProfile.findUnique({
      where: { userId },
    })

    // Get recent activity for context
    const [savedGrants, workspaces] = await Promise.all([
      prisma.savedGrant.findMany({
        where: { userId },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          grant: {
            select: {
              title: true,
              sponsor: true,
              categories: true,
            },
          },
        },
      }),
      prisma.workspace.findMany({
        where: { userId },
        take: 5,
        orderBy: { updatedAt: 'desc' },
        include: {
          grant: {
            select: {
              title: true,
              sponsor: true,
            },
          },
        },
      }),
    ])

    // Build context about the user
    let userContext = 'User Profile:\n'
    if (profile) {
      userContext += `- Entity Type: ${profile.entityType}\n`
      userContext += `- Location: ${profile.state || 'Not specified'}, ${profile.country}\n`
      userContext += `- Industries: ${profile.industryTags}\n`
      userContext += `- Size: ${profile.sizeBand || 'Not specified'}\n`
      userContext += `- Stage: ${profile.stage || 'Not specified'}\n`
    } else {
      userContext += '- No profile set up yet\n'
    }

    if (savedGrants.length > 0) {
      userContext += '\nRecently saved grants:\n'
      savedGrants.forEach(sg => {
        userContext += `- ${sg.grant.title} (${sg.grant.sponsor})\n`
      })
    }

    if (workspaces.length > 0) {
      userContext += '\nActive applications:\n'
      workspaces.forEach(ws => {
        userContext += `- ${ws.grant.title}: ${ws.status}\n`
      })
    }

    const systemPrompt = `You are the Grants By AI assistant, an expert grant advisor. Your role is to help users:

1. Find relevant grants based on their profile and needs
2. Understand grant requirements and eligibility
3. Provide guidance on grant applications
4. Answer questions about the grant process
5. Suggest strategies for successful applications

${userContext}

Guidelines:
- Be concise but helpful
- When suggesting grants, mention specific types or sources that match their profile
- If they ask about specific grants you don't have info on, suggest they search in the app
- Provide actionable advice when possible
- If you're not sure about something, say so
- Keep responses focused and under 300 words unless more detail is needed

Available grant sources in the system:
- Grants.gov (Federal grants)
- SAM.gov (Federal contracts)
- USAspending (Federal awards)
- NIH RePORTER (Research grants)
- California Grants Portal
- New York State Grants
- Texas State Grants
- Candid/Foundation Directory (Foundation grants)
- Data.gov datasets`

    // Build messages array
    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
    ]

    // Add conversation history (limit to last 10 messages for context window)
    const recentHistory = conversationHistory.slice(-10)
    messages.push(...recentHistory)

    // Add current message
    messages.push({ role: 'user', content: message })

    const openaiClient = getOpenAIClient()
    const startTime = Date.now()
    const completion = await openaiClient.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      temperature: 0.7,
      max_tokens: 1000,
    })
    const responseTime = Date.now() - startTime

    const response = completion.choices[0]?.message?.content

    // Log AI usage
    await prisma.aIUsageLog.create({
      data: {
        userId,
        type: 'chat',
        model: 'gpt-4o-mini',
        promptTokens: completion.usage?.prompt_tokens || 0,
        completionTokens: completion.usage?.completion_tokens || 0,
        totalTokens: completion.usage?.total_tokens || 0,
        responseTime,
        success: !!response,
        errorMessage: response ? null : 'No response generated',
      },
    })

    if (!response) {
      return NextResponse.json(
        { error: 'Failed to generate response' },
        { status: 500 }
      )
    }

    // Parse response for any suggested actions
    const suggestedActions = extractActions(response)

    return NextResponse.json({
      response,
      suggestedActions,
      usage: {
        promptTokens: completion.usage?.prompt_tokens,
        completionTokens: completion.usage?.completion_tokens,
        totalTokens: completion.usage?.total_tokens,
      },
    })
  } catch (error) {
    console.error('AI chat error:', error)
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
 * Extract suggested actions from the AI response
 */
function extractActions(response: string): Array<{ type: string; label: string; action: string }> {
  const actions: Array<{ type: string; label: string; action: string }> = []

  // Check for search suggestions
  if (response.toLowerCase().includes('search for') || response.toLowerCase().includes('look for grants')) {
    const searchMatch = response.match(/search for ["']?([^"'\n]+)["']?/i)
    if (searchMatch) {
      actions.push({
        type: 'search',
        label: `Search: ${searchMatch[1].slice(0, 30)}...`,
        action: `/app/discover?q=${encodeURIComponent(searchMatch[1])}`,
      })
    }
  }

  // Check for profile suggestions
  if (response.toLowerCase().includes('update your profile') || response.toLowerCase().includes('complete your profile')) {
    actions.push({
      type: 'profile',
      label: 'Update Profile',
      action: '/app/settings',
    })
  }

  // Check for workspace suggestions
  if (response.toLowerCase().includes('start an application') || response.toLowerCase().includes('create a workspace')) {
    actions.push({
      type: 'workspace',
      label: 'View Workspaces',
      action: '/app/workspace',
    })
  }

  return actions
}

/**
 * GET /api/ai/chat
 *
 * Get chat configuration and suggested prompts
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
      suggestedPrompts: [
        'What grants are available for nonprofits in California?',
        'How do I apply for an SBIR grant?',
        'What are the requirements for federal grants?',
        'Find grants for environmental projects',
        'Help me understand the grant application process',
        'What deadlines are coming up soon?',
        'Suggest grants that match my profile',
        'How can I improve my grant application?',
      ],
    })
  } catch (error) {
    console.error('Get chat config error:', error)
    return NextResponse.json(
      { error: 'Failed to get configuration' },
      { status: 500 }
    )
  }
}
