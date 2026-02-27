import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { safeJsonParse } from '@/lib/api-utils'
import { z } from 'zod'

const updateWorkspaceSchema = z.object({
  status: z.enum(['not_started', 'in_progress', 'submitted', 'awarded', 'rejected']).optional(),
  checklist: z.array(z.object({
    id: z.string(),
    text: z.string(),
    completed: z.boolean(),
  })).optional(),
  notes: z.string().max(50000).optional(),
  name: z.string().min(1).max(500).optional(),
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    const { id } = await params

    const workspace = await prisma.workspace.findFirst({
      where: { id, userId },
      include: {
        grant: true,
        documents: {
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!workspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      )
    }

    // Parse JSON fields safely
    const parsed = {
      ...workspace,
      checklist: safeJsonParse<Array<{ id: string; text: string; completed: boolean }>>(workspace.checklist, []),
      grant: {
        ...workspace.grant,
        categories: safeJsonParse<string[]>(workspace.grant.categories, []),
        eligibility: safeJsonParse<string[]>(workspace.grant.eligibility, []),
        locations: safeJsonParse<string[]>(workspace.grant.locations, []),
        contact: safeJsonParse<Record<string, unknown> | null>(workspace.grant.contact, null),
        requirements: safeJsonParse<string[]>(workspace.grant.requirements, []),
      },
    }

    return NextResponse.json({ workspace: parsed })
  } catch (error) {
    console.error('Get workspace error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workspace' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    const { id } = await params
    const body = await request.json()
    const validated = updateWorkspaceSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validated.error.flatten() },
        { status: 400 }
      )
    }

    const { status, checklist, notes, name } = validated.data

    // Verify ownership
    const existing = await prisma.workspace.findFirst({
      where: { id, userId },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      )
    }

    const workspace = await prisma.workspace.update({
      where: { id },
      data: {
        status: status ?? existing.status,
        checklist: checklist ? JSON.stringify(checklist) : existing.checklist,
        notes: notes ?? existing.notes,
        name: name ?? existing.name,
      },
      include: {
        grant: {
          select: {
            id: true,
            title: true,
            sponsor: true,
            deadlineDate: true,
            deadlineType: true,
            amountMin: true,
            amountMax: true,
          },
        },
        documents: true,
      },
    })

    return NextResponse.json({
      workspace: {
        ...workspace,
        checklist: safeJsonParse<Array<{ id: string; text: string; completed: boolean }>>(workspace.checklist, []),
      },
    })
  } catch (error) {
    console.error('Update workspace error:', error)
    return NextResponse.json(
      { error: 'Failed to update workspace' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    const { id } = await params

    // Verify ownership
    const existing = await prisma.workspace.findFirst({
      where: { id, userId },
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      )
    }

    // Delete associated documents first
    await prisma.workspaceDocument.deleteMany({
      where: { workspaceId: id },
    })

    // Delete workspace
    await prisma.workspace.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete workspace error:', error)
    return NextResponse.json(
      { error: 'Failed to delete workspace' },
      { status: 500 }
    )
  }
}
