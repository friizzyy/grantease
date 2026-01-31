/**
 * Simple in-memory rate limiting utility
 *
 * For production, consider using Redis or a dedicated rate limiting service.
 */

interface RateLimitConfig {
  interval: number // Time window in milliseconds
  maxRequests: number // Maximum requests allowed in the window
}

interface RateLimitEntry {
  count: number
  resetAt: number
}

// In-memory storage for rate limit data
// Note: This is cleared on server restart and doesn't scale across instances
// For production, use Redis or similar
const rateLimitStore = new Map<string, RateLimitEntry>()

// Cleanup old entries periodically (every 5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000
let cleanupTimer: NodeJS.Timeout | null = null

function startCleanup() {
  if (cleanupTimer) return

  cleanupTimer = setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetAt < now) {
        rateLimitStore.delete(key)
      }
    }
  }, CLEANUP_INTERVAL)

  // Prevent timer from keeping process alive
  cleanupTimer.unref()
}

startCleanup()

/**
 * Check rate limit for a given identifier
 *
 * @param identifier - Unique identifier (e.g., IP address, user ID)
 * @param config - Rate limit configuration
 * @returns Object with allowed status and remaining requests
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now()
  const entry = rateLimitStore.get(identifier)

  // No existing entry or window has expired
  if (!entry || entry.resetAt < now) {
    const resetAt = now + config.interval
    rateLimitStore.set(identifier, { count: 1, resetAt })
    return { allowed: true, remaining: config.maxRequests - 1, resetAt }
  }

  // Window is still active
  if (entry.count >= config.maxRequests) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt }
  }

  // Increment count
  entry.count++
  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt,
  }
}

/**
 * Pre-configured rate limiters for different endpoints
 */
export const rateLimiters = {
  // Auth endpoints: 5 requests per minute
  auth: (identifier: string) =>
    checkRateLimit(identifier, { interval: 60 * 1000, maxRequests: 5 }),

  // Password change: 3 requests per 5 minutes
  passwordChange: (identifier: string) =>
    checkRateLimit(`pwd:${identifier}`, { interval: 5 * 60 * 1000, maxRequests: 3 }),

  // Account deletion: 3 requests per 10 minutes (stricter limit for destructive action)
  accountDeletion: (identifier: string) =>
    checkRateLimit(`del:${identifier}`, { interval: 10 * 60 * 1000, maxRequests: 3 }),

  // AI endpoints: 20 requests per minute
  ai: (identifier: string) =>
    checkRateLimit(`ai:${identifier}`, { interval: 60 * 1000, maxRequests: 20 }),

  // Search endpoints: 30 requests per minute
  search: (identifier: string) =>
    checkRateLimit(`search:${identifier}`, { interval: 60 * 1000, maxRequests: 30 }),

  // General API: 100 requests per minute
  general: (identifier: string) =>
    checkRateLimit(`general:${identifier}`, { interval: 60 * 1000, maxRequests: 100 }),
}

/**
 * Get client identifier from request
 * Uses X-Forwarded-For header if behind proxy, otherwise remote address
 */
export function getClientIdentifier(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    // Take the first IP (original client)
    return forwarded.split(',')[0].trim()
  }

  // Fallback to a hash of headers for uniqueness
  const userAgent = request.headers.get('user-agent') || ''
  const accept = request.headers.get('accept') || ''
  return `anon:${hashCode(userAgent + accept)}`
}

/**
 * Simple string hash for anonymous client fingerprinting
 */
function hashCode(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16)
}

/**
 * NextResponse helper for rate limit exceeded
 */
export function rateLimitExceededResponse(resetAt: number) {
  const retryAfter = Math.ceil((resetAt - Date.now()) / 1000)
  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      retryAfter,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Reset': new Date(resetAt).toISOString(),
      },
    }
  )
}
