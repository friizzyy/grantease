import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import {
  addVaultDocument,
  updateVaultDocument,
  deleteVaultDocument,
  getOrCreateVault,
} from '@/lib/services/vault-service'
import type { DocumentType } from '@/lib/types/vault'

/**
 * GET /api/vault/documents
 * Get all documents in the vault
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const vault = await getOrCreateVault(session.user.id)
    const documents = await prisma.vaultDocument.findMany({
      where: { vaultId: vault.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ documents })
  } catch (error) {
    console.error('Error fetching documents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/vault/documents
 * Add a new document to the vault
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      name,
      type,
      description,
      fileName,
      fileUrl,
      fileSize,
      mimeType,
      documentDate,
      expiresAt,
    } = body

    if (!name || !type || !fileName || !fileUrl || !fileSize || !mimeType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const vault = await getOrCreateVault(session.user.id)
    const document = await addVaultDocument(vault.id, {
      name,
      type: type as DocumentType,
      description,
      fileName,
      fileUrl,
      fileSize,
      mimeType,
      documentDate: documentDate ? new Date(documentDate) : undefined,
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    })

    return NextResponse.json({ document })
  } catch (error) {
    console.error('Error adding document:', error)
    return NextResponse.json(
      { error: 'Failed to add document' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/vault/documents
 * Update a document
 */
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { documentId, ...updateData } = body

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID required' },
        { status: 400 }
      )
    }

    // Verify ownership
    const vault = await getOrCreateVault(session.user.id)
    const existingDoc = await prisma.vaultDocument.findFirst({
      where: { id: documentId, vaultId: vault.id },
    })

    if (!existingDoc) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    const document = await updateVaultDocument(documentId, updateData)
    return NextResponse.json({ document })
  } catch (error) {
    console.error('Error updating document:', error)
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/vault/documents
 * Delete a document
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('id')

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID required' },
        { status: 400 }
      )
    }

    // Verify ownership
    const vault = await getOrCreateVault(session.user.id)
    const existingDoc = await prisma.vaultDocument.findFirst({
      where: { id: documentId, vaultId: vault.id },
    })

    if (!existingDoc) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    await deleteVaultDocument(documentId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting document:', error)
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    )
  }
}
