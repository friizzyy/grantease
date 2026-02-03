import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { rateLimiters, rateLimitExceededResponse } from '@/lib/rate-limit'
import { safeJsonParse } from '@/lib/api-utils'
import { UserProfile } from '@/lib/types/onboarding'
import {
  generateApplicationPlan,
  generateChecklist,
  generateTimeline,
  getStrategyAdvice,
  reviewApplicationSection,
  type GrantForApplication,
} from '@/lib/services/gemini-application-helper'
import { isGeminiConfigured } from '@/lib/services/gemini-client'

/**
 * POST /api/ai/application-helper
 *
 * Help users prepare grant applications
 *
 * Body:
 * - action: 'plan' | 'checklist' | 'timeline' | 'strategy' | 'review'
 * - grant: { id, title, sponsor, description?, requirements?, eligibility?, deadline?, url, amountMin?, amountMax? }
 * - For 'timeline': availableHoursPerWeek?: number
 * - For 'review': sectionName, content
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const rateLimit = rateLimiters.ai(session.user.id)
    if (!rateLimit.allowed) {
      return rateLimitExceededResponse(rateLimit.resetAt)
    }

    if (!isGeminiConfigured()) {
      return NextResponse.json(
        { error: 'AI application helper not configured.' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const { action, grant, availableHoursPerWeek, sectionName, content } = body

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 })
    }

    if (!grant && action !== 'review') {
      return NextResponse.json({ error: 'Grant details are required' }, { status: 400 })
    }

    // Load user profile for plan and strategy actions
    let profile: UserProfile | null = null
    if (action === 'plan' || action === 'strategy') {
      const dbProfile = await prisma.userProfile.findUnique({
        where: { userId: session.user.id },
      })

      if (dbProfile) {
        profile = {
          id: dbProfile.id,
          userId: dbProfile.userId,
          entityType: dbProfile.entityType as UserProfile['entityType'],
          country: dbProfile.country,
          state: dbProfile.state,
          industryTags: safeJsonParse<string[]>(dbProfile.industryTags, []),
          sizeBand: (dbProfile.sizeBand || null) as UserProfile['sizeBand'],
          stage: (dbProfile.stage || null) as UserProfile['stage'],
          annualBudget: (dbProfile.annualBudget || null) as UserProfile['annualBudget'],
          industryAttributes: safeJsonParse<Record<string, string | string[] | boolean>>(dbProfile.industryAttributes, {}),
          grantPreferences: safeJsonParse<UserProfile['grantPreferences']>(dbProfile.grantPreferences, { preferredSize: null, timeline: null, complexity: null }),
          onboardingCompleted: dbProfile.onboardingCompleted,
          onboardingCompletedAt: dbProfile.onboardingCompletedAt,
          onboardingStep: dbProfile.onboardingStep,
          confidenceScore: dbProfile.confidenceScore,
          companyName: null, // Add from extended profile if available
          companyDescription: null,
        }
      }
    }

    const startTime = Date.now()
    let result = null

    switch (action) {
      case 'plan':
        if (!profile) {
          return NextResponse.json(
            { error: 'Please complete your profile first' },
            { status: 400 }
          )
        }
        result = await generateApplicationPlan(grant as GrantForApplication, profile)
        break

      case 'checklist':
        result = await generateChecklist(grant as GrantForApplication)
        break

      case 'timeline':
        result = await generateTimeline(
          grant as GrantForApplication,
          availableHoursPerWeek || 10
        )
        break

      case 'strategy':
        if (!profile) {
          return NextResponse.json(
            { error: 'Please complete your profile first' },
            { status: 400 }
          )
        }
        result = await getStrategyAdvice(grant as GrantForApplication, profile)
        break

      case 'review':
        if (!sectionName || !content) {
          return NextResponse.json(
            { error: 'Section name and content are required for review' },
            { status: 400 }
          )
        }
        result = await reviewApplicationSection(sectionName, content, {
          title: grant?.title || 'Grant Application',
          sponsor: grant?.sponsor || 'Unknown',
          requirements: grant?.requirements,
        })
        break

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }

    const processingTime = Date.now() - startTime

    if (!result) {
      return NextResponse.json(
        { error: 'Could not generate result. Please try again.' },
        { status: 500 }
      )
    }

    // Log usage
    try {
      await prisma.aIUsageLog.create({
        data: {
          userId: session.user.id,
          type: `application_helper_${action}`,
          model: 'gemini-1.5-pro',
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          responseTime: processingTime,
          grantId: grant?.id || null,
          success: true,
          metadata: JSON.stringify({ action }),
        },
      })
    } catch (logError) {
      console.warn('Failed to log AI usage:', logError)
    }

    return NextResponse.json({
      action,
      result,
      processingTime,
    })
  } catch (error) {
    console.error('Application helper error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/ai/application-helper
 *
 * Get available actions and their descriptions
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({
      available: isGeminiConfigured(),
      actions: [
        {
          id: 'plan',
          label: 'Full Application Plan',
          description: 'Complete preparation plan with checklist, timeline, documents needed, and strategy',
          requiresProfile: true,
        },
        {
          id: 'checklist',
          label: 'Application Checklist',
          description: 'Step-by-step checklist of everything needed for the application',
          requiresProfile: false,
        },
        {
          id: 'timeline',
          label: 'Application Timeline',
          description: 'Week-by-week schedule for completing the application',
          requiresProfile: false,
        },
        {
          id: 'strategy',
          label: 'Strategy Advice',
          description: 'Personalized strategy for making your application competitive',
          requiresProfile: true,
        },
        {
          id: 'review',
          label: 'Section Review',
          description: 'AI review of a draft section with improvement suggestions',
          requiresProfile: false,
        },
      ],
    })
  } catch (error) {
    console.error('Application helper status error:', error)
    return NextResponse.json({ error: 'Failed to check status' }, { status: 500 })
  }
}
