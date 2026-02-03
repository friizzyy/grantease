import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { safeJsonParse } from '@/lib/api-utils'
import { getVaultWithData, calculateVaultCompleteness } from '@/lib/services/vault-service'
import { getUserApplicationStats } from '@/lib/services/application-service'

import { EntityType, IndustryTag, BudgetRange } from '@/lib/constants/taxonomy'

/**
 * GET /api/user/profile/complete
 *
 * Returns a complete user profile with:
 * - Basic user info
 * - Profile/onboarding data
 * - Vault data and completeness
 * - Application statistics
 *
 * This is the canonical endpoint for loading full user context
 * for personalized grant matching.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Fetch all data in parallel
    const [user, profile, vaultData, appStats] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          organization: true,
          image: true,
          createdAt: true,
        },
      }),
      prisma.userProfile.findUnique({
        where: { userId },
      }),
      getVaultWithData(userId),
      getUserApplicationStats(userId),
    ])

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Calculate vault completeness
    const vaultCompleteness = await calculateVaultCompleteness(userId)

    // Parse profile data
    const parsedProfile = profile
      ? {
          id: profile.id,
          userId: profile.userId,
          entityType: profile.entityType as EntityType,
          country: profile.country,
          state: profile.state,
          industryTags: safeJsonParse<IndustryTag[]>(profile.industryTags, []),
          sizeBand: profile.sizeBand,
          stage: profile.stage,
          annualBudget: profile.annualBudget as BudgetRange | null,
          industryAttributes: safeJsonParse<Record<string, unknown>>(profile.industryAttributes, {}),
          grantPreferences: safeJsonParse<{
            preferredSize?: string | null
            timeline?: 'immediate' | 'quarter' | 'year' | 'flexible' | null
            complexity?: 'simple' | 'moderate' | 'complex' | null
          }>(profile.grantPreferences, {}),
          onboardingCompleted: profile.onboardingCompleted,
          onboardingCompletedAt: profile.onboardingCompletedAt,
          onboardingStep: profile.onboardingStep,
          confidenceScore: profile.confidenceScore,
          profileVersion: profile.profileVersion,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
        }
      : null

    // Build profile readiness assessment
    const profileReadiness = calculateProfileReadiness(parsedProfile, {
      organizationName: vaultData.vault.organizationName || null,
      primaryContactEmail: vaultData.vault.primaryContactEmail || null,
      missionStatement: vaultData.vault.missionStatement || null,
    })

    return NextResponse.json({
      user,

      profile: parsedProfile,
      hasCompletedOnboarding: profile?.onboardingCompleted || false,

      vault: {
        data: vaultData.vault,
        documents: vaultData.documents,
        textBlocks: vaultData.textBlocks,
        budgetItems: vaultData.budgetItems,
        completeness: vaultCompleteness,
      },

      applications: appStats,

      readiness: profileReadiness,
    })
  } catch (error) {
    console.error('Error fetching complete profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

/**
 * Calculate how ready the user is to apply for grants
 */
function calculateProfileReadiness(
  profile: {
    entityType: EntityType | null
    state: string | null
    industryTags: IndustryTag[]
    sizeBand: string | null
    annualBudget: string | null
    onboardingCompleted: boolean
  } | null,
  vault: { organizationName: string | null; primaryContactEmail: string | null; missionStatement: string | null }
): {
  score: number
  level: 'ready' | 'almost_ready' | 'needs_setup'
  missingCritical: string[]
  nextSteps: string[]
} {
  const missingCritical: string[] = []
  const nextSteps: string[] = []
  let score = 0

  // Profile checks
  if (!profile) {
    return {
      score: 0,
      level: 'needs_setup',
      missingCritical: ['Complete onboarding'],
      nextSteps: ['Start the onboarding process to set up your profile'],
    }
  }

  if (!profile.onboardingCompleted) {
    missingCritical.push('Complete onboarding')
    nextSteps.push('Finish setting up your profile')
  } else {
    score += 30
  }

  if (profile.entityType) score += 15
  else missingCritical.push('Entity type')

  if (profile.state) score += 10

  if (profile.industryTags.length > 0) score += 15
  else {
    missingCritical.push('Industry/focus areas')
    nextSteps.push('Add your industry or focus areas')
  }

  if (profile.sizeBand) score += 5
  if (profile.annualBudget) score += 5

  // Vault checks
  if (vault.organizationName) score += 10
  else {
    missingCritical.push('Organization name')
    nextSteps.push('Add your organization name to your data vault')
  }

  if (vault.primaryContactEmail) score += 5
  if (vault.missionStatement) score += 5

  // Determine level
  let level: 'ready' | 'almost_ready' | 'needs_setup'
  if (score >= 80) {
    level = 'ready'
  } else if (score >= 50) {
    level = 'almost_ready'
    if (nextSteps.length === 0) {
      nextSteps.push('Complete your data vault for faster applications')
    }
  } else {
    level = 'needs_setup'
    if (nextSteps.length === 0) {
      nextSteps.push('Complete your profile setup')
    }
  }

  return {
    score,
    level,
    missingCritical,
    nextSteps: nextSteps.slice(0, 3),
  }
}
