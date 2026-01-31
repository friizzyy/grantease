import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

/**
 * GET /api/ready
 *
 * Readiness check endpoint for load balancers and orchestration.
 * Returns whether the service is ready to accept traffic.
 */
export async function GET() {
  try {
    // Check database is ready
    await prisma.$queryRaw`SELECT 1`

    // Check required environment variables
    const requiredEnvVars = ['DATABASE_URL', 'NEXTAUTH_SECRET']
    const missingVars = requiredEnvVars.filter((v) => !process.env[v])

    if (missingVars.length > 0) {
      return NextResponse.json(
        {
          ready: false,
          reason: `Missing environment variables: ${missingVars.join(', ')}`,
        },
        { status: 503 }
      )
    }

    return NextResponse.json({
      ready: true,
      timestamp: new Date().toISOString(),
      checks: {
        database: 'ready',
        configuration: 'valid',
      },
    })
  } catch (error) {
    console.error('Readiness check failed:', error)

    return NextResponse.json(
      {
        ready: false,
        reason: error instanceof Error ? error.message : 'Unknown error',
        checks: {
          database: 'not_ready',
          configuration: 'unknown',
        },
      },
      { status: 503 }
    )
  }
}
