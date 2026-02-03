import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { safeJsonParse } from '@/lib/api-utils'

/**
 * GET /api/user/profile
 *
 * Get the current user's profile including onboarding status
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    })

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        organization: true,
        image: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      user,
      profile: profile ? {
        ...profile,
        industryTags: safeJsonParse<string[]>(profile.industryTags, []),
        industryAttributes: safeJsonParse<Record<string, unknown>>(profile.industryAttributes, {}),
        grantPreferences: safeJsonParse<Record<string, unknown>>(profile.grantPreferences, {}),
      } : null,
      hasCompletedOnboarding: profile?.onboardingCompleted || false,
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

/**
 * POST /api/user/profile
 *
 * Create or update user profile (used during onboarding)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      entityType,
      country,
      state,
      industryTags,
      sizeBand,
      stage,
      annualBudget,
      industryAttributes,
      grantPreferences,
      onboardingStep,
      onboardingCompleted,
    } = body

    // Validate required fields
    if (!entityType) {
      return NextResponse.json({ error: 'Entity type is required' }, { status: 400 })
    }

    const profileData = {
      userId: session.user.id,
      entityType,
      country: country || 'US',
      state: state || null,
      industryTags: JSON.stringify(industryTags || []),
      sizeBand: sizeBand || null,
      stage: stage || null,
      annualBudget: annualBudget || null,
      industryAttributes: JSON.stringify(industryAttributes || {}),
      grantPreferences: JSON.stringify(grantPreferences || {}),
      onboardingStep: onboardingStep || 1,
      onboardingCompleted: onboardingCompleted || false,
      onboardingCompletedAt: onboardingCompleted ? new Date() : null,
      confidenceScore: calculateConfidenceScore(body),
    }

    const profile = await prisma.userProfile.upsert({
      where: { userId: session.user.id },
      update: {
        ...profileData,
        profileVersion: { increment: 1 },
      },
      create: profileData,
    })

    // Also update user's organization if provided
    if (body.organization) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { organization: body.organization },
      })
    }

    return NextResponse.json({
      profile: {
        ...profile,
        industryTags: safeJsonParse<string[]>(profile.industryTags, []),
        industryAttributes: safeJsonParse<Record<string, unknown>>(profile.industryAttributes, {}),
        grantPreferences: safeJsonParse<Record<string, unknown>>(profile.grantPreferences, {}),
      },
    })
  } catch (error) {
    console.error('Error saving profile:', error)
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 })
  }
}

/**
 * PATCH /api/user/profile
 *
 * Partial update of user profile (creates if not exists)
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Get existing profile
    const existing = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    })

    // If no profile exists, create one with the provided data
    if (!existing) {
      // Use provided entityType or default to 'nonprofit'
      const entityType = body.entityType || 'nonprofit'

      const profileData = {
        userId: session.user.id,
        entityType,
        country: body.country || 'US',
        state: body.state || null,
        industryTags: JSON.stringify(body.industryTags || []),
        sizeBand: body.sizeBand || null,
        stage: body.stage || null,
        annualBudget: body.annualBudget || null,
        industryAttributes: JSON.stringify(body.industryAttributes || {}),
        grantPreferences: JSON.stringify(body.grantPreferences || {}),
        onboardingStep: body.onboardingStep || 1,
        onboardingCompleted: body.onboardingCompleted || false,
        onboardingCompletedAt: body.onboardingCompleted ? new Date() : null,
        confidenceScore: calculateConfidenceScore(body),
      }

      const profile = await prisma.userProfile.create({
        data: profileData,
      })

      return NextResponse.json({
        profile: {
          ...profile,
          industryTags: safeJsonParse<string[]>(profile.industryTags, []),
          industryAttributes: safeJsonParse<Record<string, unknown>>(profile.industryAttributes, {}),
          grantPreferences: safeJsonParse<Record<string, unknown>>(profile.grantPreferences, {}),
        },
      })
    }

    // Build update data for existing profile
    const updateData: Record<string, unknown> = {}

    if (body.entityType !== undefined) updateData.entityType = body.entityType
    if (body.country !== undefined) updateData.country = body.country
    if (body.state !== undefined) updateData.state = body.state
    if (body.industryTags !== undefined) updateData.industryTags = JSON.stringify(body.industryTags)
    if (body.sizeBand !== undefined) updateData.sizeBand = body.sizeBand
    if (body.stage !== undefined) updateData.stage = body.stage
    if (body.annualBudget !== undefined) updateData.annualBudget = body.annualBudget
    if (body.industryAttributes !== undefined) updateData.industryAttributes = JSON.stringify(body.industryAttributes)
    if (body.grantPreferences !== undefined) updateData.grantPreferences = JSON.stringify(body.grantPreferences)
    if (body.onboardingStep !== undefined) updateData.onboardingStep = body.onboardingStep
    if (body.onboardingCompleted !== undefined) {
      updateData.onboardingCompleted = body.onboardingCompleted
      if (body.onboardingCompleted) {
        updateData.onboardingCompletedAt = new Date()
      }
    }

    // Recalculate confidence score
    const mergedData = { ...existing, ...body }
    updateData.confidenceScore = calculateConfidenceScore(mergedData)

    const profile = await prisma.userProfile.update({
      where: { userId: session.user.id },
      data: {
        ...updateData,
        profileVersion: { increment: 1 },
      },
    })

    return NextResponse.json({
      profile: {
        ...profile,
        industryTags: safeJsonParse<string[]>(profile.industryTags, []),
        industryAttributes: safeJsonParse<Record<string, unknown>>(profile.industryAttributes, {}),
        grantPreferences: safeJsonParse<Record<string, unknown>>(profile.grantPreferences, {}),
      },
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}

/**
 * Calculate confidence score based on profile completeness
 */
function calculateConfidenceScore(profile: Record<string, unknown>): number {
  let score = 0
  const weights = {
    entityType: 0.2,
    state: 0.1,
    industryTags: 0.2,
    sizeBand: 0.1,
    stage: 0.1,
    annualBudget: 0.1,
    industryAttributes: 0.1,
    grantPreferences: 0.1,
  }

  if (profile.entityType) score += weights.entityType
  if (profile.state) score += weights.state

  const tags = Array.isArray(profile.industryTags) ? profile.industryTags : []
  if (tags.length > 0) score += weights.industryTags

  if (profile.sizeBand) score += weights.sizeBand
  if (profile.stage) score += weights.stage
  if (profile.annualBudget) score += weights.annualBudget

  const attrs = profile.industryAttributes && typeof profile.industryAttributes === 'object' && !Array.isArray(profile.industryAttributes)
    ? profile.industryAttributes as Record<string, unknown>
    : {}
  if (Object.keys(attrs).length > 0) score += weights.industryAttributes

  const prefs = profile.grantPreferences && typeof profile.grantPreferences === 'object' && !Array.isArray(profile.grantPreferences)
    ? profile.grantPreferences as Record<string, unknown>
    : {}
  if (Object.keys(prefs).length > 0) score += weights.grantPreferences

  return Math.min(1, Math.max(0, score))
}
