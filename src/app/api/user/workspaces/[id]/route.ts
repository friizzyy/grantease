import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Mock user ID for development
const MOCK_USER_ID = 'dev-user-123'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const userId = MOCK_USER_ID

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

    // Parse JSON fields
    const parsed = {
      ...workspace,
      checklist: JSON.parse(workspace.checklist || '[]'),
      grant: {
        ...workspace.grant,
        categories: JSON.parse(workspace.grant.categories || '[]'),
        eligibility: JSON.parse(workspace.grant.eligibility || '[]'),
        locations: JSON.parse(workspace.grant.locations || '[]'),
        contact: workspace.grant.contact ? JSON.parse(workspace.grant.contact) : null,
        requirements: workspace.grant.requirements ? JSON.parse(workspace.grant.requirements) : [],
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
    const { id } = await params
    const userId = MOCK_USER_ID
    const body = await request.json()
    const { status, checklist, notes, name } = body

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
        checklist: JSON.parse(workspace.checklist || '[]'),
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
    const { id } = await params
    const userId = MOCK_USER_ID

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
