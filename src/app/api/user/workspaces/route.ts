import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { safeJsonParse } from '@/lib/api-utils'

/**
 * GET /api/user/workspaces
 *
 * Get all workspaces for the user with pagination
 * Query params:
 *   - page: Page number (default: 1)
 *   - limit: Items per page (default: 20, max: 100)
 *   - status: Filter by status (not_started, in_progress, submitted, awarded, rejected)
 *   - includeDocuments: Whether to include documents (default: true)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    const searchParams = request.nextUrl.searchParams
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const status = searchParams.get('status')
    const includeDocuments = searchParams.get('includeDocuments') !== 'false'
    const skip = (page - 1) * limit

    const where = {
      userId,
      ...(status ? { status } : {}),
    }

    const [workspaces, total] = await Promise.all([
      prisma.workspace.findMany({
        where,
        skip,
        take: limit,
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
          documents: includeDocuments ? {
            select: {
              id: true,
              name: true,
              type: true,
              createdAt: true,
            },
          } : false,
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.workspace.count({ where }),
    ])

    // Parse JSON fields safely
    const parsed = workspaces.map(ws => ({
      ...ws,
      checklist: safeJsonParse<Array<{ id: string; text: string; completed: boolean }>>(ws.checklist, []),
    }))

    return NextResponse.json({
      workspaces: parsed,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + workspaces.length < total,
      },
    })
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

    // Check if user already has a workspace for this grant
    const existingWorkspace = await prisma.workspace.findFirst({
      where: { userId, grantId },
      select: { id: true, name: true },
    })

    if (existingWorkspace) {
      return NextResponse.json(
        {
          error: 'Workspace already exists for this grant',
          existingWorkspaceId: existingWorkspace.id,
          existingWorkspaceName: existingWorkspace.name,
        },
        { status: 409 }
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
