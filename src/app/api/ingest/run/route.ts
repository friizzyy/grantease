/**
 * Ingestion Run API Route
 * 
 * POST /api/ingest/run
 * 
 * Triggers a grant ingestion run. Can run all adapters or a specific one.
 * Protected by admin API key.
 */

import { NextRequest, NextResponse } from 'next/server'
import { runAllAdapters, runAdapterById, getAdapterById, getAllAdapters } from '@/lib/ingestion'

// Simple API key auth for admin endpoints
function isAuthorized(request: NextRequest): boolean {
  const apiKey = request.headers.get('x-api-key')
  const expectedKey = process.env.ADMIN_API_KEY
  
  if (!expectedKey) {
    console.warn('ADMIN_API_KEY not set - blocking all requests')
    return false
  }
  
  return apiKey === expectedKey
}

export async function POST(request: NextRequest) {
  // Check authorization
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  try {
    const body = await request.json().catch(() => ({}))
    const adapterId = body.adapterId as string | undefined
    
    // Create a logger that collects logs
    const logs: Array<{ level: string; message: string; metadata?: unknown }> = []
    const logger = {
      info: (message: string, metadata?: unknown) => {
        logs.push({ level: 'info', message, metadata })
        console.log(`[INFO] ${message}`, metadata || '')
      },
      warn: (message: string, metadata?: unknown) => {
        logs.push({ level: 'warn', message, metadata })
        console.warn(`[WARN] ${message}`, metadata || '')
      },
      error: (message: string, metadata?: unknown) => {
        logs.push({ level: 'error', message, metadata })
        console.error(`[ERROR] ${message}`, metadata || '')
      },
      success: (message: string, metadata?: unknown) => {
        logs.push({ level: 'success', message, metadata })
        console.log(`[SUCCESS] ${message}`, metadata || '')
      },
    }
    
    if (adapterId) {
      // Run specific adapter
      const adapter = getAdapterById(adapterId)
      if (!adapter) {
        return NextResponse.json(
          { error: `Adapter not found: ${adapterId}` },
          { status: 404 }
        )
      }
      
      const result = await runAdapterById(adapterId, logger)
      
      return NextResponse.json({
        success: result?.success ?? false,
        adapterId,
        result,
        logs,
      })
    } else {
      // Run all enabled adapters
      const results = await runAllAdapters(logger)
      
      // Convert Map to object for JSON serialization
      const resultsObject: Record<string, unknown> = {}
      results.forEach((value, key) => {
        resultsObject[key] = value
      })
      
      return NextResponse.json({
        success: true,
        results: resultsObject,
        logs,
      })
    }
  } catch (error) {
    console.error('Ingestion error:', error)
    return NextResponse.json(
      { 
        error: 'Ingestion failed',
        message: (error as Error).message,
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  // Check authorization
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
  
  // Return list of adapters and their status
  const adapters = getAllAdapters()
  
  return NextResponse.json({
    adapters: adapters.map(a => ({
      id: a.config.id,
      name: a.config.name,
      type: a.config.type,
      enabled: a.config.enabled,
      description: a.config.description,
    })),
  })
}
