import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { safeJsonParse } from '@/lib/api-utils'
import { calculateScore, type UserProfileForScoring, type GrantForScoring } from '@/lib/scoring/engine'
import type { EntityType, IndustryTag, BudgetRange, PurposeTag } from '@/lib/constants/taxonomy'
import crypto from 'crypto'
import { z } from 'zod'

const saveGrantSchema = z.object({
  grantId: z.string().min(1, 'Grant ID is required').max(200),
  notes: z.string().max(5000).optional(),
  grantData: z.object({
    sourceId: z.string().max(200).optional(),
    sourceName: z.string().max(200).optional(),
    title: z.string().max(500).optional(),
    sponsor: z.string().max(500).optional(),
    summary: z.string().max(10000).optional(),
    description: z.string().max(50000).optional().nullable(),
    categories: z.array(z.string()).optional(),
    eligibility: z.union([z.array(z.string()), z.record(z.unknown())]).optional(),
    locations: z.array(z.string()).optional(),
    amountMin: z.number().nullable().optional(),
    amountMax: z.number().nullable().optional(),
    amountText: z.string().max(500).nullable().optional(),
    deadlineType: z.string().max(50).optional(),
    deadlineDate: z.string().optional(),
    url: z.string().max(2000).optional(),
    contact: z.record(z.unknown()).nullable().optional(),
    requirements: z.array(z.string()).optional(),
    status: z.string().max(50).optional(),
  }).optional(),
})

const deleteGrantQuerySchema = z.object({
  grantId: z.string().min(1, 'Grant ID is required').max(200),
})

// Generate a hash fingerprint for deduplication
function generateHashFingerprint(data: { title: string; sponsor: string; sourceId: string }): string {
  const input = `${data.title}|${data.sponsor}|${data.sourceId}`.toLowerCase().trim()
  return crypto.createHash('sha256').update(input).digest('hex').substring(0, 32)
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    const [savedGrants, profile] = await Promise.all([
      prisma.savedGrant.findMany({
        where: { userId },
        include: {
          grant: {
            select: {
              id: true,
              sourceId: true,
              sourceName: true,
              title: true,
              sponsor: true,
              summary: true,
              aiSummary: true,
              description: true,
              categories: true,
              eligibility: true,
              locations: true,
              amountMin: true,
              amountMax: true,
              amountText: true,
              deadlineDate: true,
              deadlineType: true,
              url: true,
              status: true,
              qualityScore: true,
              purposeTags: true,
              fundingType: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.userProfile.findUnique({ where: { userId } }),
    ])

    // Build a scoring profile if onboarding data exists
    const scoringProfile: UserProfileForScoring | null = profile ? (() => {
      const attrs = safeJsonParse<Record<string, unknown>>(profile.industryAttributes, {})
      const prefs = safeJsonParse<Record<string, unknown>>(profile.grantPreferences, {})
      return {
        entityType: (profile.entityType as EntityType) || null,
        state: profile.state,
        industryTags: safeJsonParse<IndustryTag[]>(profile.industryTags, []),
        certifications: Array.isArray(attrs.certifications) ? attrs.certifications as string[] : [],
        sizeBand: profile.sizeBand,
        annualBudget: (profile.annualBudget as BudgetRange) || null,
        goals: Array.isArray(attrs.goals) ? attrs.goals as string[] : [],
        grantPreferences: {
          preferredSize: (prefs.preferredSize as string) || null,
          timeline: (prefs.timeline as 'immediate' | 'quarter' | 'year' | 'flexible') || null,
          complexity: (prefs.complexity as 'simple' | 'moderate' | 'complex') || null,
        },
      }
    })() : null

    // Parse JSON fields, compute match score for each grant
    const grants = savedGrants.map(sg => {
      const categories = safeJsonParse<string[]>(sg.grant.categories || '[]', [])
      const eligibilityRaw = safeJsonParse<string[] | { tags?: string[]; rawText?: string }>(sg.grant.eligibility || '[]', [])
      const eligibilityTags = Array.isArray(eligibilityRaw) ? eligibilityRaw : (eligibilityRaw.tags || [])
      const locationsRaw = safeJsonParse<Array<string | { type: string; value?: string }>>(sg.grant.locations || '[]', [])
      const locations = locationsRaw.map(l => typeof l === 'string' ? { type: 'state', value: l } : l)
      const purposeTags = safeJsonParse<PurposeTag[]>(sg.grant.purposeTags || '[]', [])

      let matchScore: number | null = null
      if (scoringProfile) {
        const forScoring: GrantForScoring = {
          id: sg.grant.id,
          title: sg.grant.title,
          sponsor: sg.grant.sponsor,
          summary: sg.grant.summary,
          description: sg.grant.description,
          aiSummary: sg.grant.aiSummary,
          categories,
          eligibility: { tags: eligibilityTags },
          locations,
          amountMin: sg.grant.amountMin,
          amountMax: sg.grant.amountMax,
          amountText: sg.grant.amountText,
          fundingType: sg.grant.fundingType,
          purposeTags,
          deadlineDate: sg.grant.deadlineDate,
          qualityScore: sg.grant.qualityScore ?? undefined,
          status: sg.grant.status,
        }
        try {
          matchScore = calculateScore(scoringProfile, forScoring).totalScore
        } catch {
          matchScore = null
        }
      }

      return {
        savedAt: sg.createdAt,
        notes: sg.notes,
        ...sg.grant,
        categories,
        eligibility: eligibilityTags,
        locations: locations.map(l => l.value || l.type),
        matchScore,
      }
    })

    return NextResponse.json({ grants })
  } catch (error) {
    console.error('Get saved grants error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch saved grants' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    const body = await request.json()
    const validated = saveGrantSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validated.error.flatten() },
        { status: 400 }
      )
    }

    const { grantId, notes, grantData } = validated.data

    // Check if grant exists
    let grant = await prisma.grant.findUnique({
      where: { id: grantId },
    })

    // If grant doesn't exist but we have grant data (from live API), create it first
    if (!grant && grantData) {
      try {
        const sourceId = grantData.sourceId || grantId
        const title = grantData.title || 'Unknown Grant'
        const sponsor = grantData.sponsor || 'Unknown'

        grant = await prisma.grant.create({
          data: {
            id: grantId,
            sourceId,
            sourceName: grantData.sourceName || 'live-api',
            title,
            sponsor,
            summary: grantData.summary || '',
            description: grantData.description || null,
            categories: JSON.stringify(grantData.categories || []),
            eligibility: JSON.stringify(Array.isArray(grantData.eligibility) ? { tags: grantData.eligibility } : { tags: grantData.eligibility || [] }),
            locations: JSON.stringify(grantData.locations || []),
            amountMin: grantData.amountMin || null,
            amountMax: grantData.amountMax || null,
            amountText: grantData.amountText || null,
            deadlineType: grantData.deadlineType || 'hard',
            deadlineDate: grantData.deadlineDate ? new Date(grantData.deadlineDate) : null,
            url: grantData.url || '',
            contact: grantData.contact ? JSON.stringify(grantData.contact) : null,
            requirements: JSON.stringify(grantData.requirements || []),
            status: grantData.status || 'open',
            hashFingerprint: generateHashFingerprint({ title, sponsor, sourceId }),
          },
        })
      } catch (createError) {
        // Grant might have been created by another request, try to fetch it again
        console.warn('Grant creation failed, trying to fetch:', createError)
        grant = await prisma.grant.findUnique({
          where: { id: grantId },
        })
      }
    }

    if (!grant) {
      return NextResponse.json(
        { error: 'Grant not found. Please try saving from the discover page.' },
        { status: 404 }
      )
    }

    // Create or update saved grant
    const savedGrant = await prisma.savedGrant.upsert({
      where: {
        userId_grantId: { userId, grantId },
      },
      update: { notes },
      create: { userId, grantId, notes },
    })

    return NextResponse.json({ savedGrant })
  } catch (error) {
    console.error('Save grant error:', error)
    return NextResponse.json(
      { error: 'Failed to save grant' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    const { searchParams } = new URL(request.url)
    const queryValidated = deleteGrantQuerySchema.safeParse({
      grantId: searchParams.get('grantId'),
    })

    if (!queryValidated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: queryValidated.error.flatten() },
        { status: 400 }
      )
    }

    const { grantId } = queryValidated.data

    await prisma.savedGrant.delete({
      where: {
        userId_grantId: { userId, grantId },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete saved grant error:', error)
    return NextResponse.json(
      { error: 'Failed to remove saved grant' },
      { status: 500 }
    )
  }
}
