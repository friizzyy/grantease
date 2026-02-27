import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import {
  addVaultTextBlock,
  updateVaultTextBlock,
  deleteVaultTextBlock,
  getOrCreateVault,
} from '@/lib/services/vault-service'
import type { TextBlockCategory } from '@/lib/types/vault'
import { z } from 'zod'

const addTextBlockSchema = z.object({
  title: z.string().min(1, 'Title is required').max(500),
  category: z.string().min(1, 'Category is required').max(100),
  content: z.string().min(1, 'Content is required').max(50000),
  shortVersion: z.string().max(10000).optional(),
  longVersion: z.string().max(100000).optional(),
  aiGenerated: z.boolean().optional(),
})

const updateTextBlockSchema = z.object({
  blockId: z.string().min(1, 'Block ID required').max(200),
  title: z.string().max(500).optional(),
  category: z.string().max(100).optional(),
  content: z.string().max(50000).optional(),
  shortVersion: z.string().max(10000).optional(),
  longVersion: z.string().max(100000).optional(),
  aiImproved: z.boolean().optional(),
})

/**
 * GET /api/vault/text-blocks
 * Get all text blocks in the vault
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const vault = await getOrCreateVault(session.user.id)
    const textBlocks = await prisma.vaultTextBlock.findMany({
      where: { vaultId: vault.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ textBlocks })
  } catch (error) {
    console.error('Error fetching text blocks:', error)
    return NextResponse.json(
      { error: 'Failed to fetch text blocks' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/vault/text-blocks
 * Add a new text block to the vault
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = addTextBlockSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validated.error.flatten() },
        { status: 400 }
      )
    }

    const {
      title,
      category,
      content,
      shortVersion,
      longVersion,
      aiGenerated,
    } = validated.data

    const vault = await getOrCreateVault(session.user.id)
    const textBlock = await addVaultTextBlock(vault.id, {
      title,
      category: category as TextBlockCategory,
      content,
      shortVersion,
      longVersion,
      aiGenerated,
    })

    return NextResponse.json({ textBlock })
  } catch (error) {
    console.error('Error adding text block:', error)
    return NextResponse.json(
      { error: 'Failed to add text block' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/vault/text-blocks
 * Update a text block
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validated = updateTextBlockSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: validated.error.flatten() },
        { status: 400 }
      )
    }

    const { blockId, ...updateData } = validated.data

    // Verify ownership
    const vault = await getOrCreateVault(session.user.id)
    const existingBlock = await prisma.vaultTextBlock.findFirst({
      where: { id: blockId, vaultId: vault.id },
    })

    if (!existingBlock) {
      return NextResponse.json(
        { error: 'Text block not found' },
        { status: 404 }
      )
    }

    const textBlock = await updateVaultTextBlock(blockId, updateData as Parameters<typeof updateVaultTextBlock>[1])
    return NextResponse.json({ textBlock })
  } catch (error) {
    console.error('Error updating text block:', error)
    return NextResponse.json(
      { error: 'Failed to update text block' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/vault/text-blocks
 * Delete a text block
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const blockId = searchParams.get('id')

    if (!blockId) {
      return NextResponse.json(
        { error: 'Block ID required' },
        { status: 400 }
      )
    }

    // Verify ownership
    const vault = await getOrCreateVault(session.user.id)
    const existingBlock = await prisma.vaultTextBlock.findFirst({
      where: { id: blockId, vaultId: vault.id },
    })

    if (!existingBlock) {
      return NextResponse.json(
        { error: 'Text block not found' },
        { status: 404 }
      )
    }

    await deleteVaultTextBlock(blockId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting text block:', error)
    return NextResponse.json(
      { error: 'Failed to delete text block' },
      { status: 500 }
    )
  }
}
