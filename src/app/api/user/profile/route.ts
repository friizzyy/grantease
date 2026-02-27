import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { safeJsonParse } from '@/lib/api-utils'
import { z } from 'zod'

const profileCreateSchema = z.object({
  entityType: z.string().min(1, 'Entity type is required').max(100),
  country: z.string().max(10).default('US'),
  state: z.string().max(10).nullable().optional(),
  industryTags: z.array(z.string().max(100)).max(50).optional(),
  sizeBand: z.string().max(50).nullable().optional(),
  stage: z.string().max(50).nullable().optional(),
  annualBudget: z.string().max(50).nullable().optional(),
  industryAttributes: z.record(z.unknown()).optional(),
  grantPreferences: z.record(z.unknown()).optional(),
  onboardingStep: z.number().int().min(1).max(20).optional(),
  onboardingCompleted: z.boolean().optional(),
  organization: z.string().max(500).optional(),
})

const profilePatchSchema = z.object({
  entityType: z.string().min(1).max(100).optional(),
  country: z.string().max(10).optional(),
  state: z.string().max(10).nullable().optional(),
  industryTags: z.array(z.string().max(100)).max(50).optional(),
  sizeBand: z.string().max(50).nullable().optional(),
  stage: z.string().max(50).nullable().optional(),
  annualBudget: z.string().max(50).nullable().optional(),
  industryAttributes: z.record(z.unknown()).optional(),
  grantPreferences: z.record(z.unknown()).optional(),
  onboardingStep: z.number().int().min(1).max(20).optional(),
  onboardingCompleted: z.boolean().optional(),
})

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
    const validated = profileCreateSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validated.error.flatten() },
        { status: 400 }
      )
    }

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
    } = validated.data

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
      confidenceScore: calculateConfidenceScore(validated.data),
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
    if (validated.data.organization) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { organization: validated.data.organization },
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
    const validated = profilePatchSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validated.error.flatten() },
        { status: 400 }
      )
    }

    // Get existing profile
    const existing = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    })

    // If no profile exists, create one with the provided data
    if (!existing) {
      // Use provided entityType or default to 'nonprofit'
      const entityType = validated.data.entityType || 'nonprofit'

      const profileData = {
        userId: session.user.id,
        entityType,
        country: validated.data.country || 'US',
        state: validated.data.state || null,
        industryTags: JSON.stringify(validated.data.industryTags || []),
        sizeBand: validated.data.sizeBand || null,
        stage: validated.data.stage || null,
        annualBudget: validated.data.annualBudget || null,
        industryAttributes: JSON.stringify(validated.data.industryAttributes || {}),
        grantPreferences: JSON.stringify(validated.data.grantPreferences || {}),
        onboardingStep: validated.data.onboardingStep || 1,
        onboardingCompleted: validated.data.onboardingCompleted || false,
        onboardingCompletedAt: validated.data.onboardingCompleted ? new Date() : null,
        confidenceScore: calculateConfidenceScore(validated.data),
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
    const data = validated.data

    if (data.entityType !== undefined) updateData.entityType = data.entityType
    if (data.country !== undefined) updateData.country = data.country
    if (data.state !== undefined) updateData.state = data.state
    if (data.industryTags !== undefined) updateData.industryTags = JSON.stringify(data.industryTags)
    if (data.sizeBand !== undefined) updateData.sizeBand = data.sizeBand
    if (data.stage !== undefined) updateData.stage = data.stage
    if (data.annualBudget !== undefined) updateData.annualBudget = data.annualBudget
    if (data.industryAttributes !== undefined) updateData.industryAttributes = JSON.stringify(data.industryAttributes)
    if (data.grantPreferences !== undefined) updateData.grantPreferences = JSON.stringify(data.grantPreferences)
    if (data.onboardingStep !== undefined) updateData.onboardingStep = data.onboardingStep
    if (data.onboardingCompleted !== undefined) {
      updateData.onboardingCompleted = data.onboardingCompleted
      if (data.onboardingCompleted) {
        updateData.onboardingCompletedAt = new Date()
      }
    }

    // Recalculate confidence score
    const mergedData = { ...existing, ...data }
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
