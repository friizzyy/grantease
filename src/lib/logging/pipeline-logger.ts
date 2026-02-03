/**
 * PIPELINE LOGGER
 * ---------------
 * Structured logging for the grant discovery pipeline.
 * Provides consistent formatting, timing, and context tracking.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  userId?: string
  profileVersion?: number
  grantId?: string
  stage?: string
  [key: string]: unknown
}

interface TimingEntry {
  stage: string
  startTime: number
  endTime?: number
  durationMs?: number
}

/**
 * Pipeline logger for structured observability
 */
export class PipelineLogger {
  private context: LogContext
  private timings: TimingEntry[] = []
  private enabled: boolean
  private requestId: string

  constructor(context: LogContext = {}, enabled = true) {
    this.context = context
    this.enabled = enabled
    this.requestId = generateRequestId()
  }

  /**
   * Start timing a stage
   */
  startTiming(stage: string): void {
    this.timings.push({
      stage,
      startTime: Date.now(),
    })
    this.debug(`Stage started: ${stage}`)
  }

  /**
   * End timing for the current stage
   */
  endTiming(stage: string): number {
    const entry = this.timings.find(t => t.stage === stage && !t.endTime)
    if (entry) {
      entry.endTime = Date.now()
      entry.durationMs = entry.endTime - entry.startTime
      this.debug(`Stage completed: ${stage}`, { durationMs: entry.durationMs })
      return entry.durationMs
    }
    return 0
  }

  /**
   * Get all timing data
   */
  getTimings(): { stage: string; durationMs: number }[] {
    return this.timings
      .filter(t => t.durationMs !== undefined)
      .map(t => ({ stage: t.stage, durationMs: t.durationMs! }))
  }

  /**
   * Get total processing time
   */
  getTotalTimeMs(): number {
    return this.timings.reduce((sum, t) => sum + (t.durationMs || 0), 0)
  }

  /**
   * Debug log - only in development
   */
  debug(message: string, data?: Record<string, unknown>): void {
    if (!this.enabled || process.env.NODE_ENV === 'production') return
    this.log('debug', message, data)
  }

  /**
   * Info log
   */
  info(message: string, data?: Record<string, unknown>): void {
    if (!this.enabled) return
    this.log('info', message, data)
  }

  /**
   * Warning log
   */
  warn(message: string, data?: Record<string, unknown>): void {
    if (!this.enabled) return
    this.log('warn', message, data)
  }

  /**
   * Error log
   */
  error(message: string, error?: Error | unknown, data?: Record<string, unknown>): void {
    const errorData = error instanceof Error
      ? { errorMessage: error.message, errorStack: error.stack }
      : { error }
    this.log('error', message, { ...errorData, ...data })
  }

  /**
   * Log pipeline summary
   */
  logSummary(stats: {
    fetched: number
    afterEligibility: number
    afterScoring: number
    fromCache: number
    fromAI: number
  }): void {
    this.info('Pipeline completed', {
      ...stats,
      timings: this.getTimings(),
      totalTimeMs: this.getTotalTimeMs(),
      cacheHitRate: stats.fromCache / (stats.fromCache + stats.fromAI || 1),
    })
  }

  /**
   * Core logging function
   */
  private log(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      requestId: this.requestId,
      message: `[Pipeline] ${message}`,
      ...this.context,
      ...data,
    }

    switch (level) {
      case 'debug':
        console.debug(JSON.stringify(logEntry))
        break
      case 'info':
        console.info(JSON.stringify(logEntry))
        break
      case 'warn':
        console.warn(JSON.stringify(logEntry))
        break
      case 'error':
        console.error(JSON.stringify(logEntry))
        break
    }
  }
}

/**
 * Generate a unique request ID
 */
function generateRequestId(): string {
  return `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 8)}`
}

/**
 * Create a logger for a specific user context
 */
export function createPipelineLogger(
  userId?: string,
  profileVersion?: number,
  enabled = true
): PipelineLogger {
  return new PipelineLogger({ userId, profileVersion }, enabled)
}

/**
 * Log eligibility filter results
 */
export function logEligibilityResults(
  logger: PipelineLogger,
  results: {
    total: number
    eligible: number
    filtered: number
    byReason: Record<string, number>
  }
): void {
  logger.info('Eligibility filtering complete', {
    total: results.total,
    eligible: results.eligible,
    filtered: results.filtered,
    filterRate: (results.filtered / results.total * 100).toFixed(1) + '%',
    byReason: results.byReason,
  })
}

/**
 * Log scoring results
 */
export function logScoringResults(
  logger: PipelineLogger,
  results: {
    total: number
    passedMinScore: number
    distribution: Record<string, number>
    avgScore: number
  }
): void {
  logger.info('Scoring complete', {
    total: results.total,
    passedMinScore: results.passedMinScore,
    distribution: results.distribution,
    avgScore: results.avgScore.toFixed(1),
  })
}

/**
 * Log cache results
 */
export function logCacheResults(
  logger: PipelineLogger,
  results: {
    checked: number
    hits: number
    misses: number
  }
): void {
  logger.info('Cache lookup complete', {
    checked: results.checked,
    hits: results.hits,
    misses: results.misses,
    hitRate: (results.hits / (results.checked || 1) * 100).toFixed(1) + '%',
  })
}

/**
 * Log AI enrichment results
 */
export function logAIResults(
  logger: PipelineLogger,
  results: {
    requested: number
    successful: number
    failed: number
    fallback: number
  }
): void {
  logger.info('AI enrichment complete', {
    requested: results.requested,
    successful: results.successful,
    failed: results.failed,
    fallback: results.fallback,
    successRate: (results.successful / (results.requested || 1) * 100).toFixed(1) + '%',
  })
}

/**
 * Log top candidates after scoring (for observability)
 */
export function logTopCandidates(
  logger: PipelineLogger,
  candidates: Array<{
    id: string
    title: string
    deterministicScore: number
    tier: string
  }>,
  maxToLog = 50
): void {
  const toLog = candidates.slice(0, maxToLog)
  logger.info('Top candidates selected', {
    totalCandidates: candidates.length,
    loggedCount: toLog.length,
    candidates: toLog.map(c => ({
      id: c.id,
      title: c.title.substring(0, 60) + (c.title.length > 60 ? '...' : ''),
      score: c.deterministicScore,
      tier: c.tier,
    })),
  })
}

/**
 * Log LLM rerank details (for observability)
 */
export function logLLMRerankDetails(
  logger: PipelineLogger,
  details: {
    inputSize: number
    inputOrder: string[]
    outputOrder: string[]
    validationStatus: 'success' | 'partial' | 'failed'
    rerankChanges: number
  }
): void {
  logger.info('LLM rerank complete', {
    inputSize: details.inputSize,
    outputSize: details.outputOrder.length,
    validationStatus: details.validationStatus,
    rerankChanges: details.rerankChanges,
    inputOrderSample: details.inputOrder.slice(0, 10),
    outputOrderSample: details.outputOrder.slice(0, 10),
  })
}

/**
 * Log final returned results (for observability)
 */
export function logFinalResults(
  logger: PipelineLogger,
  results: Array<{
    id: string
    title: string
    combinedScore: number
    deterministicScore: number
    aiMatchScore: number
    appliesToUser: string
  }>,
  limit: number
): void {
  logger.info('Final results returned', {
    totalReturned: results.length,
    limit,
    results: results.slice(0, 20).map(r => ({
      id: r.id,
      title: r.title.substring(0, 50) + (r.title.length > 50 ? '...' : ''),
      combined: r.combinedScore,
      deterministic: r.deterministicScore,
      ai: r.aiMatchScore,
      applies: r.appliesToUser,
    })),
  })
}

/**
 * Log canonicalized profile fields (no sensitive values)
 */
export function logCanonicalizedProfile(
  logger: PipelineLogger,
  profile: {
    entityType: string | null
    state: string | null
    industryTags: string[]
    sizeBand?: string | null
    annualBudget?: string | null
    profileVersion: number
  }
): void {
  logger.info('Profile context', {
    entityType: profile.entityType || 'not_set',
    state: profile.state || 'not_set',
    industryTagCount: profile.industryTags.length,
    industryTags: profile.industryTags,
    sizeBand: profile.sizeBand || 'not_set',
    budgetRange: profile.annualBudget || 'not_set',
    profileVersion: profile.profileVersion,
  })
}

/**
 * Structured error for pipeline failures
 */
export class PipelineError extends Error {
  public stage: string
  public context: Record<string, unknown>

  constructor(message: string, stage: string, context: Record<string, unknown> = {}) {
    super(message)
    this.name = 'PipelineError'
    this.stage = stage
    this.context = context
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      stage: this.stage,
      context: this.context,
      stack: this.stack,
    }
  }
}
