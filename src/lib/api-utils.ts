import { NextResponse } from 'next/server'
import { ZodError, ZodSchema } from 'zod'

/**
 * Standard API response envelope
 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, string[]>
  }
  meta?: {
    timestamp: string
    requestId?: string
  }
}

/**
 * Standard error codes for consistent error handling
 */
export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  BAD_REQUEST: 'BAD_REQUEST',
} as const

type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes]

/**
 * Create a successful response
 */
export function successResponse<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  )
}

/**
 * Create an error response
 */
export function errorResponse(
  code: ErrorCode,
  message: string,
  status: number,
  details?: Record<string, string[]>
): NextResponse<ApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  )
}

/**
 * Pre-built error responses
 */
export const ApiErrors = {
  unauthorized: (message = 'Authentication required') =>
    errorResponse(ErrorCodes.UNAUTHORIZED, message, 401),

  forbidden: (message = 'Access denied') =>
    errorResponse(ErrorCodes.FORBIDDEN, message, 403),

  notFound: (resource = 'Resource') =>
    errorResponse(ErrorCodes.NOT_FOUND, `${resource} not found`, 404),

  conflict: (message: string) =>
    errorResponse(ErrorCodes.CONFLICT, message, 409),

  badRequest: (message: string, details?: Record<string, string[]>) =>
    errorResponse(ErrorCodes.BAD_REQUEST, message, 400, details),

  validationError: (errors: Record<string, string[]>) =>
    errorResponse(ErrorCodes.VALIDATION_ERROR, 'Validation failed', 400, errors),

  rateLimited: (message = 'Too many requests') =>
    errorResponse(ErrorCodes.RATE_LIMITED, message, 429),

  internalError: (message = 'An unexpected error occurred') =>
    errorResponse(ErrorCodes.INTERNAL_ERROR, message, 500),

  serviceUnavailable: (message = 'Service temporarily unavailable') =>
    errorResponse(ErrorCodes.SERVICE_UNAVAILABLE, message, 503),
}

/**
 * Validate request body against a Zod schema
 */
export async function validateBody<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<{ data: T; error: null } | { data: null; error: NextResponse<ApiResponse> }> {
  try {
    const body = await request.json()
    const data = schema.parse(body)
    return { data, error: null }
  } catch (err) {
    if (err instanceof ZodError) {
      const details: Record<string, string[]> = {}
      for (const issue of err.issues) {
        const path = issue.path.join('.')
        if (!details[path]) {
          details[path] = []
        }
        details[path].push(issue.message)
      }
      return { data: null, error: ApiErrors.validationError(details) }
    }
    if (err instanceof SyntaxError) {
      return { data: null, error: ApiErrors.badRequest('Invalid JSON in request body') }
    }
    throw err
  }
}

/**
 * Validate query parameters against a Zod schema
 */
export function validateQuery<T>(
  url: URL | string,
  schema: ZodSchema<T>
): { data: T; error: null } | { data: null; error: NextResponse<ApiResponse> } {
  try {
    const urlObj = typeof url === 'string' ? new URL(url) : url
    const params = Object.fromEntries(urlObj.searchParams.entries())
    const data = schema.parse(params)
    return { data, error: null }
  } catch (err) {
    if (err instanceof ZodError) {
      const details: Record<string, string[]> = {}
      for (const issue of err.issues) {
        const path = issue.path.join('.')
        if (!details[path]) {
          details[path] = []
        }
        details[path].push(issue.message)
      }
      return { data: null, error: ApiErrors.validationError(details) }
    }
    throw err
  }
}

/**
 * Safe error handler wrapper for API routes
 */
export function withErrorHandler<T extends unknown[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args)
    } catch (error) {
      console.error('API Error:', error)

      // Don't expose internal errors to client
      const message = process.env.NODE_ENV === 'development' && error instanceof Error
        ? error.message
        : 'An unexpected error occurred'

      return ApiErrors.internalError(message)
    }
  }
}

/**
 * Parse JSON fields safely (for database JSON columns stored as strings)
 */
export function safeJsonParse<T>(value: string | null | undefined, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

