import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { safeJsonParse } from '@/lib/api-utils'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    const workspaces = await prisma.workspace.findMany({
      where: { userId },
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
        documents: {
          select: {
            id: true,
            name: true,
            type: true,
            createdAt: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    // Parse JSON fields safely
    const parsed = workspaces.map(ws => ({
      ...ws,
      checklist: safeJsonParse<Array<{ id: string; text: string; completed: boolean }>>(ws.checklist, []),
    }))

    return NextResponse.json({ workspaces: parsed })
  } catch (error) {
    console.error('Get workspaces error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch workspaces' },
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
    const { grantId, name } = body

    if (!grantId) {
      return NextResponse.json(
        { error: 'Grant ID is required' },
        { status: 400 }
      )
    }

    // Check if grant exists
    const grant = await prisma.grant.findUnique({
      where: { id: grantId },
      select: { title: true, requirements: true },
    })

    if (!grant) {
      return NextResponse.json(
        { error: 'Grant not found' },
        { status: 404 }
      )
    }

    // Create default checklist from grant requirements
    const requirements = safeJsonParse<string[]>(grant.requirements, [])
    const defaultChecklist = requirements.map((req: string, index: number) => ({
      id: `item-${index + 1}`,
      text: req,
      completed: false,
    }))

    const workspace = await prisma.workspace.create({
      data: {
        userId,
        grantId,
        name: name || `${grant.title} Application`,
        status: 'not_started',
        checklist: JSON.stringify(defaultChecklist),
        notes: '',
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
      },
    })

    return NextResponse.json({
      workspace: {
        ...workspace,
        checklist: safeJsonParse<Array<{ id: string; text: string; completed: boolean }>>(workspace.checklist, []),
        documents: [],
      },
    })
  } catch (error) {
    console.error('Create workspace error:', error)
    return NextResponse.json(
      { error: 'Failed to create workspace' },
      { status: 500 }
    )
  }
}
