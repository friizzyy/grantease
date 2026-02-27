import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { rateLimiters, rateLimitExceededResponse } from '@/lib/rate-limit'
import { safeJsonParse } from '@/lib/api-utils'
import { UserProfile } from '@/lib/types/onboarding'
import { generateDeadlinePlan } from '@/lib/services/gemini-deadline-planner'
import { isGeminiConfigured, GEMINI_MODEL } from '@/lib/services/gemini-client'
import { z } from 'zod'

const deadlinePlannerSchema = z.object({
  availableHoursPerWeek: z.number().int().min(1).max(80).default(10),
})

/**
 * POST /api/ai/deadline-planner
 *
 * Generate a prioritized deadline plan across all saved grants,
 * active workspaces, and in-progress applications.
 *
 * Body:
 * - availableHoursPerWeek?: number (1-80, default 10)
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
        { error: 'AI deadline planner not configured.' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const validated = deadlinePlannerSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validated.error.flatten() },
        { status: 400 }
      )
    }

    const { availableHoursPerWeek } = validated.data

    // Load user profile
    const dbProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!dbProfile) {
      return NextResponse.json(
        { error: 'Please complete your profile first' },
        { status: 400 }
      )
    }

    const profile: UserProfile = {
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
      companyName: null,
      companyDescription: null,
    }

    // Fetch saved grants with deadline info
    const savedGrantRecords = await prisma.savedGrant.findMany({
      where: { userId: session.user.id },
      include: {
        grant: {
          select: {
            id: true,
            title: true,
            sponsor: true,
            deadlineDate: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    const savedGrants = savedGrantRecords.map((sg) => ({
      id: sg.grant.id,
      title: sg.grant.title,
      sponsor: sg.grant.sponsor,
      deadline: sg.grant.deadlineDate,
      matchScore: undefined as number | undefined,
    }))

    // Enrich with cached match scores where available
    if (savedGrants.length > 0) {
      const matchCaches = await prisma.grantMatchCache.findMany({
        where: {
          userId: session.user.id,
          grantId: { in: savedGrants.map((g) => g.id) },
        },
        select: { grantId: true, fitScore: true },
      })

      const scoreMap = new Map(matchCaches.map((mc) => [mc.grantId, mc.fitScore]))
      for (const grant of savedGrants) {
        const score = scoreMap.get(grant.id)
        if (score != null) {
          grant.matchScore = score
        }
      }
    }

    // Fetch active workspaces
    const workspaceRecords = await prisma.workspace.findMany({
      where: {
        userId: session.user.id,
        status: { not: 'archived' },
      },
      include: {
        grant: {
          select: { title: true },
        },
      },
      take: 20,
    })

    const activeWorkspaces = workspaceRecords.map((ws) => ({
      id: ws.id,
      grantTitle: ws.grant.title,
      status: ws.status,
      progressPercent: undefined as number | undefined,
      dueDate: ws.dueDate,
    }))

    // Fetch in-progress applications to supplement workspace data
    const applicationRecords = await prisma.grantApplication.findMany({
      where: {
        userId: session.user.id,
        status: { in: ['draft', 'in_progress'] },
      },
      include: {
        grant: {
          select: { title: true, deadlineDate: true },
        },
      },
      take: 20,
    })

    // Merge application progress into workspaces or add as separate entries
    for (const app of applicationRecords) {
      const existingWs = activeWorkspaces.find(
        (ws) => ws.grantTitle === app.grant.title
      )
      if (existingWs) {
        // Enrich existing workspace with application progress
        existingWs.progressPercent = app.progressPercent
        if (!existingWs.dueDate && app.grant.deadlineDate) {
          existingWs.dueDate = app.grant.deadlineDate
        }
      } else {
        // Add application as a workspace-like entry
        activeWorkspaces.push({
          id: app.id,
          grantTitle: app.grant.title,
          status: app.status,
          progressPercent: app.progressPercent,
          dueDate: app.grant.deadlineDate || app.internalDeadline,
        })
      }
    }

    if (savedGrants.length === 0 && activeWorkspaces.length === 0) {
      return NextResponse.json(
        { error: 'No saved grants or active applications found. Save some grants first.' },
        { status: 400 }
      )
    }

    const startTime = Date.now()

    const { result, usage } = await generateDeadlinePlan(
      savedGrants,
      activeWorkspaces,
      availableHoursPerWeek,
      profile
    )

    const processingTime = Date.now() - startTime

    if (!result) {
      return NextResponse.json(
        { error: 'Could not generate deadline plan. Please try again.' },
        { status: 500 }
      )
    }

    // Log usage
    try {
      await prisma.aIUsageLog.create({
        data: {
          userId: session.user.id,
          type: 'deadline_planner',
          model: GEMINI_MODEL,
          promptTokens: usage.promptTokens,
          completionTokens: usage.completionTokens,
          totalTokens: usage.totalTokens,
          responseTime: processingTime,
          success: true,
          metadata: JSON.stringify({
            savedGrantCount: savedGrants.length,
            activeWorkspaceCount: activeWorkspaces.length,
            availableHoursPerWeek,
          }),
        },
      })
    } catch (logError) {
      console.warn('Failed to log AI usage:', logError)
    }

    return NextResponse.json({
      result,
      processingTime,
    })
  } catch (error) {
    console.error('Deadline planner error:', error)
    return NextResponse.json(
      { error: 'Failed to generate deadline plan' },
      { status: 500 }
    )
  }
}
