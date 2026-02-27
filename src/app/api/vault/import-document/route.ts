import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { rateLimiters, rateLimitExceededResponse } from '@/lib/rate-limit'
import { extractDocumentData } from '@/lib/services/gemini-document-ocr'
import { isGeminiConfigured, GEMINI_MODEL } from '@/lib/services/gemini-client'
import { z } from 'zod'

const importDocumentSchema = z.object({
  content: z.string().min(1, 'File content is required').max(10_000_000, 'File too large (max ~7.5MB base64)'),
  mimeType: z.enum(['application/pdf', 'image/png', 'image/jpeg', 'image/webp'], {
    errorMap: () => ({ message: 'Unsupported file type. Accepted: PDF, PNG, JPEG, WebP' }),
  }),
  fileName: z.string().min(1, 'File name is required').max(500),
})

/**
 * POST /api/vault/import-document
 *
 * Extract structured data from an uploaded document using AI OCR.
 * Returns extracted fields that can be used to auto-fill vault data.
 *
 * Body:
 * - content: string (base64 encoded file content)
 * - mimeType: 'application/pdf' | 'image/png' | 'image/jpeg' | 'image/webp'
 * - fileName: string
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limiting
    const rateLimit = rateLimiters.ai(session.user.id)
    if (!rateLimit.allowed) {
      return rateLimitExceededResponse(rateLimit.resetAt)
    }

    if (!isGeminiConfigured()) {
      return NextResponse.json(
        { error: 'AI document import not configured.' },
        { status: 503 }
      )
    }

    const body = await request.json()
    const validated = importDocumentSchema.safeParse(body)

    if (!validated.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validated.error.flatten() },
        { status: 400 }
      )
    }

    const { content, mimeType, fileName } = validated.data

    const startTime = Date.now()
    const { result, usage } = await extractDocumentData(content, mimeType, fileName)
    const processingTime = Date.now() - startTime

    if (!result) {
      return NextResponse.json(
        { error: 'Could not extract data from document' },
        { status: 500 }
      )
    }

    // Log usage with actual token counts from the API response
    try {
      await prisma.aIUsageLog.create({
        data: {
          userId: session.user.id,
          type: 'document_ocr',
          model: GEMINI_MODEL,
          promptTokens: usage.promptTokens,
          completionTokens: usage.completionTokens,
          totalTokens: usage.totalTokens,
          responseTime: processingTime,
          success: true,
          metadata: JSON.stringify({
            fileName,
            mimeType,
            documentType: result.documentType,
            confidence: result.confidence,
            fieldsExtracted: Object.keys(result.suggestedVaultUpdates).length,
          }),
        },
      })
    } catch (logError) {
      console.warn('Failed to log AI usage:', logError)
    }

    return NextResponse.json({
      result,
      processingTime,
    })
  } catch (error) {
    console.error('Document import error:', error)
    return NextResponse.json(
      { error: 'Failed to process document' },
      { status: 500 }
    )
  }
}
