import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/db'
import { authOptions } from '@/lib/auth'

/**
 * GET /api/export/grants
 *
 * Export grants to CSV or JSON format
 * Query params:
 *   - format: 'csv' | 'json' (default: csv)
 *   - type: 'saved' | 'search' | 'all' (default: saved)
 *   - search: search query for type=search
 *   - fields: comma-separated list of fields to include
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
    const type = searchParams.get('type') || 'saved'
    const fieldsParam = searchParams.get('fields')

    // Default fields to export
    const defaultFields = [
      'title',
      'sponsor',
      'summary',
      'amountMin',
      'amountMax',
      'amountText',
      'deadlineDate',
      'deadlineType',
      'status',
      'url',
      'categories',
      'eligibility',
    ]

    const fields = fieldsParam ? fieldsParam.split(',') : defaultFields

    // Get grants based on type
    let grants: Record<string, unknown>[] = []

    if (type === 'saved') {
      const savedGrants = await prisma.savedGrant.findMany({
        where: { userId },
        include: {
          grant: true,
        },
        orderBy: { createdAt: 'desc' },
      })
      grants = savedGrants.map(sg => ({
        ...sg.grant,
        savedAt: sg.createdAt,
        notes: sg.notes,
        categories: JSON.parse(sg.grant.categories || '[]'),
        eligibility: JSON.parse(sg.grant.eligibility || '[]'),
        locations: JSON.parse(sg.grant.locations || '[]'),
      }))
    } else if (type === 'search') {
      const search = searchParams.get('search')
      const status = searchParams.get('status')
      const limit = parseInt(searchParams.get('limit') || '100')

      const where: Record<string, unknown> = {}
      if (search) {
        where.OR = [
          { title: { contains: search } },
          { summary: { contains: search } },
          { sponsor: { contains: search } },
        ]
      }
      if (status && status !== 'all') {
        where.status = status
      }

      const dbGrants = await prisma.grant.findMany({
        where,
        take: limit,
        orderBy: { deadlineDate: 'asc' },
      })

      grants = dbGrants.map(g => ({
        ...g,
        categories: JSON.parse(g.categories || '[]'),
        eligibility: JSON.parse(g.eligibility || '[]'),
        locations: JSON.parse(g.locations || '[]'),
      }))
    }

    // Filter to requested fields
    const filteredGrants = grants.map(grant => {
      const filtered: Record<string, unknown> = {}
      for (const field of fields) {
        if (field in grant) {
          filtered[field] = grant[field]
        }
      }
      return filtered
    })

    if (format === 'json') {
      return NextResponse.json({
        grants: filteredGrants,
        exportedAt: new Date().toISOString(),
        count: filteredGrants.length,
      })
    }

    // CSV format
    const csv = generateCSV(filteredGrants, fields)

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="grants-export-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error('Export grants error:', error)
    return NextResponse.json(
      { error: 'Failed to export grants' },
      { status: 500 }
    )
  }
}

function generateCSV(data: Record<string, unknown>[], fields: string[]): string {
  if (data.length === 0) {
    return fields.join(',') + '\n'
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
      if (Array.isArray(value)) {
        return `"${value.join('; ')}"`
      }
      if (typeof value === 'object') {
        return `"${JSON.stringify(value).replace(/"/g, '""')}"`
      }
      if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
        return `"${value.replace(/"/g, '""')}"`
      }
      return String(value)
    }).join(',')
  })

  return [headers, ...rows].join('\n')
}
