import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { safeJsonParse } from '@/lib/api-utils'

import {
  generateSectionDraft,
  generateAllDrafts,
  generateSuggestions,
  generateBudgetSuggestions,
  checkReadiness,
} from '@/lib/services/application-ai-service'

import { addTimelineEntry } from '@/lib/services/application-service'

import type { ApplicationFormData, ApplicationSection } from '@/lib/types/application'

/**
 * POST /api/applications/:id/ai
 *
 * AI assistance actions for an application.
 *
 * Actions:
 * - draft_section: Generate a draft for a specific section
 * - draft_all: Generate drafts for all applicable sections
 * - suggestions: Get improvement suggestions
 * - budget: Get budget suggestions
 * - readiness: Check application readiness
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { action, section } = body

    // Get the application
    const application = await prisma.grantApplication.findUnique({
      where: { id },
      include: {
        grant: {
          select: {
            id: true,
            title: true,
            requirements: true,
          },
        },
      },
    })

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 })
    }

    if (application.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not your application' }, { status: 403 })
    }

    const formData = safeJsonParse<ApplicationFormData>(application.formData, {})
    const requirements = safeJsonParse<string[]>(application.grant.requirements, [])

    switch (action) {
      case 'draft_section': {
        if (!section) {
          return NextResponse.json(
            { error: 'Section required for draft_section action' },
            { status: 400 }
          )
        }

        const draft = await generateSectionDraft(
          session.user.id,
          application.grantId,
          section as ApplicationSection,
          formData
        )

        if (!draft) {
          return NextResponse.json(
            { error: 'Failed to generate draft. AI may be unavailable.' },
            { status: 500 }
          )
        }

        // Log AI assistance
        await addTimelineEntry(application.id, {
          type: 'ai_assist',
          title: `AI draft generated for ${section}`,
          metadata: JSON.stringify({ section, confidence: draft.confidence }),
        })

        return NextResponse.json({
          draft,
          section,
        })
      }

      case 'draft_all': {
        const drafts = await generateAllDrafts(
          session.user.id,
          application.grantId,
          formData
        )

        const sectionCount = Object.keys(drafts.sections).length

        if (sectionCount === 0) {
          return NextResponse.json(
            { error: 'Failed to generate drafts. AI may be unavailable.' },
            { status: 500 }
          )
        }

        // Save drafts to application
        await prisma.grantApplication.update({
          where: { id },
          data: {
            aiDraftContent: JSON.stringify(drafts),
            lastActivityAt: new Date(),
          },
        })

        // Log AI assistance
        await addTimelineEntry(application.id, {
          type: 'ai_assist',
          title: `AI generated ${sectionCount} section drafts`,
          metadata: JSON.stringify({ sections: Object.keys(drafts.sections) }),
        })

        return NextResponse.json({
          drafts,
          sectionsGenerated: sectionCount,
        })
      }

      case 'suggestions': {
        const suggestions = await generateSuggestions(
          session.user.id,
          application.grantId,
          formData
        )

        if (suggestions.length === 0) {
          return NextResponse.json({
            suggestions: [],
            message: 'No suggestions generated. Your application looks complete.',
          })
        }

        // Save suggestions to application
        await prisma.grantApplication.update({
          where: { id },
          data: {
            aiSuggestions: JSON.stringify(suggestions),
            lastActivityAt: new Date(),
          },
        })

        // Log AI assistance
        await addTimelineEntry(application.id, {
          type: 'ai_assist',
          title: `AI generated ${suggestions.length} suggestions`,
        })

        return NextResponse.json({
          suggestions,
          count: suggestions.length,
        })
      }

      case 'budget': {
        const budgetSuggestions = await generateBudgetSuggestions(
          session.user.id,
          application.grantId,
          formData
        )

        if (!budgetSuggestions) {
          return NextResponse.json(
            { error: 'Failed to generate budget suggestions. AI may be unavailable.' },
            { status: 500 }
          )
        }

        // Log AI assistance
        await addTimelineEntry(application.id, {
          type: 'ai_assist',
          title: 'AI generated budget suggestions',
          metadata: JSON.stringify({
            itemCount: budgetSuggestions.items.length,
            totalBudget: budgetSuggestions.totalBudget,
          }),
        })

        return NextResponse.json(budgetSuggestions)
      }

      case 'readiness': {
        const readiness = await checkReadiness(formData, requirements)

        return NextResponse.json(readiness)
      }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('[Application AI] Error:', error)
    return NextResponse.json(
      { error: 'AI assistance failed' },
      { status: 500 }
    )
  }
}
