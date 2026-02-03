import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'

/**
 * GET /api/export/workspaces
 *
 * Export workspaces (applications) to CSV or JSON format
 * Query params:
 *   - format: 'csv' | 'json' (default: csv)
 *   - status: filter by workspace status
 *   - includeDocuments: boolean - include document list
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = session.user.id

    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'
    const status = searchParams.get('status')
    const includeDocuments = searchParams.get('includeDocuments') === 'true'

    // Build where clause
    const where: Record<string, unknown> = { userId }
    if (status) {
      where.status = status
    }

    const workspaces = await prisma.workspace.findMany({
      where,
      include: {
        grant: {
          select: {
            title: true,
            sponsor: true,
            deadlineDate: true,
            amountMin: true,
            amountMax: true,
            url: true,
          },
        },
        documents: includeDocuments ? {
          select: {
            name: true,
            type: true,
            createdAt: true,
          },
        } : false,
      },
      orderBy: { updatedAt: 'desc' },
    })

    // Format data for export
    const exportData = workspaces.map(ws => {
      const checklist = JSON.parse(ws.checklist || '[]')
      const completedItems = checklist.filter((item: { completed: boolean }) => item.completed).length
      const totalItems = checklist.length

      const base = {
        workspaceName: ws.name,
        status: ws.status,
        grantTitle: ws.grant.title,
        sponsor: ws.grant.sponsor,
        deadline: ws.grant.deadlineDate?.toISOString().split('T')[0] || '',
        amountMin: ws.grant.amountMin,
        amountMax: ws.grant.amountMax,
        grantUrl: ws.grant.url,
        checklistProgress: `${completedItems}/${totalItems}`,
        progressPercent: totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0,
        notes: ws.notes || '',
        createdAt: ws.createdAt.toISOString().split('T')[0],
        updatedAt: ws.updatedAt.toISOString().split('T')[0],
      }

      if (includeDocuments && ws.documents) {
        return {
          ...base,
          documentCount: ws.documents.length,
          documents: ws.documents.map((d: { name: string; type: string }) => `${d.name} (${d.type})`).join('; '),
        }
      }

      return base
    })

    if (format === 'json') {
      return NextResponse.json({
        workspaces: exportData,
        exportedAt: new Date().toISOString(),
        count: exportData.length,
        summary: {
          total: exportData.length,
          byStatus: {
            not_started: exportData.filter(w => w.status === 'not_started').length,
            in_progress: exportData.filter(w => w.status === 'in_progress').length,
            submitted: exportData.filter(w => w.status === 'submitted').length,
            awarded: exportData.filter(w => w.status === 'awarded').length,
            rejected: exportData.filter(w => w.status === 'rejected').length,
          },
        },
      })
    }

    // CSV format
    const fields = Object.keys(exportData[0] || {})
    const csv = generateCSV(exportData, fields)

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="workspaces-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Export workspaces error:', error)
    return NextResponse.json(
      { error: 'Failed to export workspaces' },
      { status: 500 }
    )
  }
}

function generateCSV(data: Record<string, unknown>[], fields: string[]): string {
  if (data.length === 0) {
    return ''
  }

  // Header row
  const headers = fields.join(',')

  // Data rows
  const rows = data.map(item => {
    return fields.map(field => {
      const value = item[field]
      if (value === null || value === undefined) {
        return ''
      }
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return String(value)
    }).join(',')
  })

  return [headers, ...rows].join('\n')
}
