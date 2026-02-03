/**
 * Grant Deduplication Utilities
 * 
 * Identifies duplicate grants using multiple strategies:
 * 1. Exact match on sourceId + sourceName
 * 2. Fingerprint matching (hash of key fields)
 * 3. Fuzzy matching on title/description (optional)
 */

import crypto from 'crypto'
import type { NormalizedGrant, DedupeResult } from '../types'

/**
 * Generate a fingerprint hash for a grant
 * Used for detecting duplicates across different sources
 */
export function generateFingerprint(grant: NormalizedGrant): string {
  // Normalize fields for consistent hashing
  const normalizedTitle = grant.title.toLowerCase().replace(/[^a-z0-9]/g, '')
  const normalizedSponsor = grant.sponsor.toLowerCase().replace(/[^a-z0-9]/g, '')
  const deadline = grant.deadlineDate?.toISOString().split('T')[0] || ''
  
  const content = [
    normalizedTitle,
    normalizedSponsor,
    deadline,
    grant.amountMin?.toString() || '',
    grant.amountMax?.toString() || '',
  ].join('|')
  
  return crypto
    .createHash('sha256')
    .update(content)
    .digest('hex')
    .substring(0, 32)
}

/**
 * Calculate similarity between two strings using Levenshtein distance
 */
function levenshteinSimilarity(a: string, b: string): number {
  if (a === b) return 1
  if (a.length === 0 || b.length === 0) return 0
  
  const matrix: number[][] = []
  
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i]
  }
  
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j
  }
  
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        )
      }
    }
  }
  
  const distance = matrix[b.length][a.length]
  const maxLength = Math.max(a.length, b.length)
  return 1 - distance / maxLength
}

/**
 * Calculate similarity between two grants
 */
export function calculateSimilarity(a: NormalizedGrant, b: NormalizedGrant): number {
  // Title similarity (weighted heavily)
  const titleSimilarity = levenshteinSimilarity(
    a.title.toLowerCase(),
    b.title.toLowerCase()
  )
  
  // Sponsor similarity
  const sponsorSimilarity = levenshteinSimilarity(
    a.sponsor.toLowerCase(),
    b.sponsor.toLowerCase()
  )
  
  // Summary similarity
  const summarySimilarity = levenshteinSimilarity(
    a.summary.toLowerCase().substring(0, 500),
    b.summary.toLowerCase().substring(0, 500)
  )
  
  // Deadline match (binary)
  const deadlineMatch = 
    a.deadlineDate && b.deadlineDate &&
    a.deadlineDate.toISOString().split('T')[0] === b.deadlineDate.toISOString().split('T')[0]
      ? 1 : 0
  
  // Weighted average
  return (
    titleSimilarity * 0.4 +
    sponsorSimilarity * 0.25 +
    summarySimilarity * 0.25 +
    deadlineMatch * 0.1
  )
}

/**
 * Check if a grant is a duplicate of any existing grants
 */
export async function checkDuplicate(
  grant: NormalizedGrant,
  existingGrants: Map<string, { id: string; fingerprint: string; grant: NormalizedGrant }>,
  fingerprints: Set<string>,
  options: {
    fuzzyThreshold?: number
    enableFuzzy?: boolean
  } = {}
): Promise<DedupeResult> {
  const { fuzzyThreshold = 0.85, enableFuzzy = false } = options
  
  // 1. Check exact match by source
  const sourceKey = `${grant.sourceName}:${grant.sourceId}`
  const exactMatch = existingGrants.get(sourceKey)
  if (exactMatch) {
    return {
      isDuplicate: true,
      existingId: exactMatch.id,
      matchType: 'exact',
      confidence: 1.0,
    }
  }
  
  // 2. Check fingerprint match
  const fingerprint = generateFingerprint(grant)
  if (fingerprints.has(fingerprint)) {
    // Find the grant with this fingerprint
    for (const [, existing] of existingGrants) {
      if (existing.fingerprint === fingerprint) {
        return {
          isDuplicate: true,
          existingId: existing.id,
          matchType: 'fingerprint',
          confidence: 0.95,
        }
      }
    }
  }
  
  // 3. Optional fuzzy matching
  if (enableFuzzy) {
    for (const [, existing] of existingGrants) {
      const similarity = calculateSimilarity(grant, existing.grant)
      if (similarity >= fuzzyThreshold) {
        return {
          isDuplicate: true,
          existingId: existing.id,
          matchType: 'fuzzy',
          confidence: similarity,
        }
      }
    }
  }
  
  return { isDuplicate: false }
}

/**
 * Batch deduplicate grants
 * Returns grants grouped by: new, duplicates, updates
 */
export function batchDeduplicate(
  incomingGrants: NormalizedGrant[],
  existingGrants: Map<string, { id: string; fingerprint: string; grant: NormalizedGrant }>
): {
  newGrants: NormalizedGrant[]
  duplicates: Array<{ grant: NormalizedGrant; existingId: string; matchType: string }>
  updates: Array<{ grant: NormalizedGrant; existingId: string }>
} {
  const result = {
    newGrants: [] as NormalizedGrant[],
    duplicates: [] as Array<{ grant: NormalizedGrant; existingId: string; matchType: string }>,
    updates: [] as Array<{ grant: NormalizedGrant; existingId: string }>,
  }
  
  const fingerprints = new Set(
    Array.from(existingGrants.values()).map(e => e.fingerprint)
  )
  
  for (const grant of incomingGrants) {
    const sourceKey = `${grant.sourceName}:${grant.sourceId}`
    const exactMatch = existingGrants.get(sourceKey)
    
    if (exactMatch) {
      // Same source - this is an update
      result.updates.push({ grant, existingId: exactMatch.id })
    } else {
      // Check fingerprint for cross-source duplicates
      const fingerprint = generateFingerprint(grant)
      if (fingerprints.has(fingerprint)) {
        for (const [, existing] of existingGrants) {
          if (existing.fingerprint === fingerprint) {
            result.duplicates.push({
              grant,
              existingId: existing.id,
              matchType: 'fingerprint',
            })
            break
          }
        }
      } else {
        result.newGrants.push(grant)
        // Add to fingerprints to catch duplicates within the batch
        fingerprints.add(fingerprint)
      }
    }
  }
  
  return result
}
