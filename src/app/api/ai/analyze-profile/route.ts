import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { rateLimiters, rateLimitExceededResponse } from '@/lib/rate-limit'
import {
  analyzeBusinessProfile,
  quickAnalyzeByName,
  getSuggestedQuestions,
  type BusinessInfoInput,
} from '@/lib/services/gemini-profile-analyzer'
import { isGeminiConfigured } from '@/lib/services/gemini-client'
import { z } from 'zod'

const analyzeProfileSchema = z.object({
  websiteUrl: z.string().url().max(2000).optional(),
  companyName: z.string().max(500).optional(),
  description: z.string().max(5000).optional(),
  mode: z.enum(['full', 'quick', 'questions']).default('full'),
  partialProfile: z.record(z.unknown()).optional(),
}).refine(
  (data) => data.websiteUrl || data.companyName || data.description,
  { message: 'Please provide a website URL, company name, or description' }
)

/**
 * POST /api/ai/analyze-profile
 *
 * Analyze a business/organization using AI to auto-fill profile
 *
 * Body:
 * - websiteUrl?: string - Company website to scrape
 * - companyName?: string - Company name for quick analysis
 * - description?: string - Manual description
 * - mode?: 'full' | 'quick' | 'questions' - Analysis mode
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting (use AI rate limiter)
    const rateLimit = rateLimiters.ai(session.user.id)
    if (!rateLimit.allowed) {
      return rateLimitExceededResponse(rateLimit.resetAt)
    }

    if (!isGeminiConfigured()) {
      return NextResponse.json(
        { error: 'AI analysis not configured. Please add GEMINI_API_KEY.' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const validated = analyzeProfileSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validated.error.flatten() },
        { status: 400 }
      )
    }

    const { websiteUrl, companyName, description, mode, partialProfile } = validated.data

    // Handle different analysis modes
    if (mode === 'questions' && partialProfile) {
      // Just get suggested questions
      const questions = await getSuggestedQuestions(partialProfile)
      return NextResponse.json({ questions })
    }

    if (mode === 'quick' && companyName && !websiteUrl) {
      // Quick name-only analysis
      const result = await quickAnalyzeByName(companyName)
      if (!result) {
        return NextResponse.json(
          { error: 'Could not analyze company name. Try providing more details.' },
          { status: 422 }
        )
      }
      return NextResponse.json({
        profile: result,
        isPartial: true,
        message: 'Quick analysis complete. Add a website URL for more detailed results.',
      })
    }

    // Full analysis
    const input: BusinessInfoInput = {
      websiteUrl,
      companyName,
      description,
    }

    const startTime = Date.now()
    const profile = await analyzeBusinessProfile(input)
    const analysisTime = Date.now() - startTime

    if (!profile) {
      return NextResponse.json(
        {
          error: 'Could not analyze the provided information. Please check the URL or try adding a description.',
          suggestion: websiteUrl
            ? 'The website may be blocking access. Try adding a manual description instead.'
            : 'Try providing a website URL for better results.',
        },
        { status: 422 }
      )
    }

    // Get follow-up questions if confidence is low
    let suggestedQuestions: string[] = []
    if (profile.confidence < 70) {
      suggestedQuestions = await getSuggestedQuestions(profile)
    }

    return NextResponse.json({
      profile,
      suggestedQuestions,
      analysisTime,
      message:
        profile.confidence >= 70
          ? 'Analysis complete! Review and confirm your profile details.'
          : 'We found some information but need a few more details for accurate matching.',
    })
  } catch (error) {
    console.error('Profile analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze profile' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/ai/analyze-profile
 *
 * Check if AI analysis is available
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({
      available: isGeminiConfigured(),
      features: [
        'Website analysis',
        'Company name lookup',
        'Industry detection',
        'Size estimation',
        'Grant category matching',
        'Follow-up questions',
      ],
    })
  } catch (error) {
    console.error('Check analysis availability error:', error)
    return NextResponse.json({ error: 'Failed to check' }, { status: 500 })
  }
}
