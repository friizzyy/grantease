import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const createDocumentSchema = z.object({
  name: z.string().min(1, 'Document name is required').max(500),
  type: z.string().min(1, 'Document type is required').max(100),
  url: z.string().max(2000).nullable().optional(),
  notes: z.string().max(5000).nullable().optional(),
})

/**
 * GET /api/user/workspaces/[id]/documents
 *
 * Get all documents for a workspace
 */
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

    const { id: workspaceId } = await params

    // Verify workspace ownership
    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId, userId },
    })

    if (!workspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      )
    }

    const documents = await prisma.workspaceDocument.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ documents })
  } catch (error) {
    console.error('Get documents error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/user/workspaces/[id]/documents
 *
 * Add a new document to a workspace
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
    const userId = session.user.id

    const { id: workspaceId } = await params

    // Verify workspace ownership
    const workspace = await prisma.workspace.findFirst({
      where: { id: workspaceId, userId },
    })

    if (!workspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validated = createDocumentSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validated.error.flatten() },
        { status: 400 }
      )
    }

    const { name, type, url, notes } = validated.data

    const document = await prisma.workspaceDocument.create({
      data: {
        workspaceId,
        name,
        type,
        url: url || null,
        notes: notes || null,
      },
    })

    // Update workspace timestamp
    await prisma.workspace.update({
      where: { id: workspaceId },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json({ document }, { status: 201 })
  } catch (error) {
    console.error('Create document error:', error)
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 }
    )
  }
}
