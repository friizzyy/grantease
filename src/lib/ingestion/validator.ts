/**
 * Grant Validation, Deduplication, and Expiry Detection
 *
 * Ensures data quality before grants are persisted to the database.
 * All operations are deterministic - no LLM involvement.
 */

import crypto from 'crypto';
import { ExtractedGrant, ValidationResult, NormalizedGrant, IngestionError } from './types';
import { verifyUrl } from './scraper';

// ==================== VALIDATION ====================

/**
 * Validate an extracted grant
 */
export async function validateGrant(
  grant: ExtractedGrant,
  existingHashes: Set<string>
): Promise<ValidationResult> {
  const checks = {
    hasTitle: Boolean(grant.title && grant.title !== 'Untitled Grant'),
    hasSponsor: Boolean(grant.sponsor && grant.sponsor !== 'Unknown Sponsor'),
    hasDescription: Boolean(grant.description && grant.description.length >= 50),
    hasApplyUrl: Boolean(grant.applyUrl),
    applyUrlValid: false,
    applyUrlStatus: undefined as number | undefined,
    hasDeadlineOrRolling:
      grant.deadline.type !== 'unknown' ||
      Boolean(grant.deadline.date) ||
      Boolean(grant.deadline.text),
    deadlineNotExpired: true,
    hasFundingInfo:
      Boolean(grant.funding.min) ||
      Boolean(grant.funding.max) ||
      Boolean(grant.funding.text),
    hasEligibilityInfo: grant.eligibility.entityTypes.length > 0,
    hasGeographyInfo: Boolean(
      grant.geography.isNational ||
      (grant.geography.states && grant.geography.states.length > 0)
    ),
  };

  const warnings: string[] = [];
  const errors: string[] = [];

  // Verify apply URL
  if (grant.applyUrl) {
    try {
      const urlCheck = await verifyUrl(grant.applyUrl);
      checks.applyUrlValid = urlCheck.isValid;
      checks.applyUrlStatus = urlCheck.status;

      if (!urlCheck.isValid) {
        warnings.push(`Apply URL returned status ${urlCheck.status}`);
      }
    } catch {
      warnings.push('Could not verify apply URL');
    }
  }

  // Check deadline expiry
  if (grant.deadline.date) {
    const deadlineDate = new Date(grant.deadline.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (deadlineDate < today) {
      checks.deadlineNotExpired = false;
      warnings.push('Grant deadline has passed');
    }
  }

  // Critical validation errors
  if (!checks.hasTitle) {
    errors.push('Missing title');
  }
  if (!checks.hasSponsor) {
    errors.push('Missing sponsor');
  }
  if (!checks.hasApplyUrl) {
    errors.push('Missing apply URL');
  }

  // Calculate quality score
  let qualityScore = 0;

  // Core fields (50 points total)
  if (checks.hasTitle) qualityScore += 15;
  if (checks.hasSponsor) qualityScore += 10;
  if (checks.hasDescription) qualityScore += 15;
  if (checks.hasApplyUrl && checks.applyUrlValid) qualityScore += 10;

  // Supplementary fields (50 points total)
  if (checks.hasDeadlineOrRolling) qualityScore += 10;
  if (checks.hasFundingInfo) qualityScore += 15;
  if (checks.hasEligibilityInfo) qualityScore += 15;
  if (checks.hasGeographyInfo) qualityScore += 10;

  // Deduct for issues
  if (!checks.deadlineNotExpired) qualityScore -= 20;
  if (!checks.applyUrlValid && checks.hasApplyUrl) qualityScore -= 10;

  qualityScore = Math.max(0, Math.min(100, qualityScore));

  // Check for duplicates
  const fingerprint = generateFingerprint(grant);
  const isDuplicate = existingHashes.has(fingerprint);

  return {
    isValid: errors.length === 0 && qualityScore >= 30,
    qualityScore,
    checks,
    warnings,
    errors,
    isDuplicate,
    duplicateOf: isDuplicate ? fingerprint : undefined,
    similarityScore: isDuplicate ? 100 : undefined,
  };
}

/**
 * Generate a fingerprint for deduplication
 */
export function generateFingerprint(grant: ExtractedGrant): string {
  // Normalize text for comparison
  const normalizedTitle = grant.title.toLowerCase().replace(/[^a-z0-9]/g, '');
  const normalizedSponsor = grant.sponsor.toLowerCase().replace(/[^a-z0-9]/g, '');

  // Create fingerprint from key identifying fields
  const fingerprintSource = [
    normalizedTitle.substring(0, 50),
    normalizedSponsor.substring(0, 30),
    grant.funding.min || '',
    grant.funding.max || '',
    grant.deadline.date?.toISOString().split('T')[0] || '',
  ].join('|');

  return crypto.createHash('sha256').update(fingerprintSource).digest('hex').substring(0, 32);
}

/**
 * Calculate similarity between two grants
 */
export function calculateSimilarity(grant1: ExtractedGrant, grant2: ExtractedGrant): number {
  let score = 0;
  let maxScore = 0;

  // Title similarity (40% weight)
  maxScore += 40;
  score += textSimilarity(grant1.title, grant2.title) * 40;

  // Sponsor similarity (20% weight)
  maxScore += 20;
  score += textSimilarity(grant1.sponsor, grant2.sponsor) * 20;

  // Funding similarity (20% weight)
  maxScore += 20;
  if (grant1.funding.min === grant2.funding.min && grant1.funding.max === grant2.funding.max) {
    score += 20;
  } else if (grant1.funding.min && grant2.funding.min) {
    const minRatio = Math.min(grant1.funding.min, grant2.funding.min) /
                     Math.max(grant1.funding.min, grant2.funding.min);
    score += minRatio * 10;
  }

  // Deadline similarity (10% weight)
  maxScore += 10;
  if (grant1.deadline.date && grant2.deadline.date) {
    const date1 = new Date(grant1.deadline.date).getTime();
    const date2 = new Date(grant2.deadline.date).getTime();
    const daysDiff = Math.abs(date1 - date2) / (1000 * 60 * 60 * 24);
    if (daysDiff === 0) score += 10;
    else if (daysDiff <= 7) score += 5;
  }

  // URL similarity (10% weight)
  maxScore += 10;
  if (grant1.applyUrl === grant2.applyUrl) {
    score += 10;
  } else {
    try {
      const url1 = new URL(grant1.applyUrl);
      const url2 = new URL(grant2.applyUrl);
      if (url1.hostname === url2.hostname) score += 5;
    } catch {
      // Invalid URLs
    }
  }

  return Math.round((score / maxScore) * 100);
}

/**
 * Simple text similarity (Jaccard index on words)
 */
function textSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/).filter((w) => w.length > 2));
  const words2 = new Set(text2.toLowerCase().split(/\s+/).filter((w) => w.length > 2));

  if (words1.size === 0 && words2.size === 0) return 1;
  if (words1.size === 0 || words2.size === 0) return 0;

  const intersection = new Set([...words1].filter((w) => words2.has(w)));
  const union = new Set([...words1, ...words2]);

  return intersection.size / union.size;
}

// ==================== NORMALIZATION ====================

/**
 * Normalize an extracted grant for database storage
 */
export function normalizeGrant(
  grant: ExtractedGrant,
  validation: ValidationResult
): NormalizedGrant {
  const now = new Date();

  return {
    sourceId: grant.sourceId,
    sourceName: grant.sourceName,

    title: grant.title.trim(),
    sponsor: grant.sponsor.trim(),
    summary: grant.summary || grant.description.substring(0, 500),
    description: grant.description,

    // JSON fields
    categories: JSON.stringify(grant.categories),
    eligibility: JSON.stringify({
      tags: grant.eligibility.entityTypes,
      industries: grant.eligibility.industries,
      restrictions: grant.eligibility.restrictions,
      requirements: grant.eligibility.requirements,
      raw: grant.geography.serviceAreaText,
    }),
    locations: JSON.stringify(
      grant.geography.states?.map((state) => ({
        state,
        country: 'US',
      })) || []
    ),

    // Amounts
    amountMin: grant.funding.min || null,
    amountMax: grant.funding.max || null,
    amountText: grant.funding.text || null,

    // Timeline
    deadlineType: grant.deadline.type,
    deadlineDate: grant.deadline.date || null,
    postedDate: grant.postedDate || null,

    // URLs & Contact
    url: grant.applyUrl,
    contact: grant.contact
      ? JSON.stringify(grant.contact)
      : null,

    // Requirements
    requirements: grant.requirements
      ? JSON.stringify([
          ...(grant.requirements.documents || []),
          ...(grant.requirements.certifications || []),
          ...(grant.requirements.registrations || []),
          ...(grant.requirements.other || []),
        ])
      : null,
    requirementsStructured: grant.requirements
      ? JSON.stringify({
          documents: grant.requirements.documents,
          certifications: grant.requirements.certifications,
          registrations: grant.requirements.registrations,
          other: grant.requirements.other,
        })
      : null,

    // Status
    status: validation.checks.deadlineNotExpired ? 'open' : 'closed',

    // Deduplication
    hashFingerprint: generateFingerprint(grant),
    duplicateOf: validation.duplicateOf || null,

    // Classification
    fundingType: grant.funding.type !== 'unknown' ? grant.funding.type : null,
    purposeTags: JSON.stringify(grant.purposeTags),

    // Structured eligibility
    eligibleEntityTypes: JSON.stringify(grant.eligibility.entityTypes),
    eligibleStates: JSON.stringify(
      grant.geography.isNational ? ['national'] : grant.geography.states || []
    ),
    eligibleIndustries: JSON.stringify(grant.eligibility.industries || []),
    minBudgetRequirement: grant.eligibility.budgetMin || null,
    maxBudgetRequirement: grant.eligibility.budgetMax || null,
    restrictedToRural: grant.eligibility.ruralOnly || false,
    restrictedToUrban: grant.eligibility.urbanOnly || false,
    citizenshipRequired: grant.eligibility.citizenshipRequired || false,
    samRegistrationRequired: grant.eligibility.samRequired || false,

    // Geography
    isNational: grant.geography.isNational,
    isStateSpecific: !grant.geography.isNational && (grant.geography.states?.length || 0) > 0,
    isLocalOnly: grant.geography.isLocalOnly || false,
    serviceAreaText: grant.geography.serviceAreaText || null,

    // Quality
    qualityScore: validation.qualityScore,
    linkStatus: validation.checks.applyUrlValid ? 'active' : 'unknown',
    lastVerifiedAt: now,
    contentHash: crypto
      .createHash('sha256')
      .update(grant.description + grant.title)
      .digest('hex')
      .substring(0, 32),
  };
}

// ==================== EXPIRY DETECTION ====================

/**
 * Check if a grant is expired
 */
export function isGrantExpired(grant: {
  deadlineType: string;
  deadlineDate: Date | null;
  status: string;
}): boolean {
  // Already marked as closed
  if (grant.status === 'closed') return true;

  // Rolling deadlines don't expire
  if (grant.deadlineType === 'rolling') return false;

  // Check fixed deadline
  if (grant.deadlineDate) {
    const deadline = new Date(grant.deadlineDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return deadline < today;
  }

  // Unknown deadline - don't mark as expired
  return false;
}

/**
 * Find grants to mark as expired
 */
export function findExpiredGrants(
  grants: Array<{
    id: string;
    deadlineType: string;
    deadlineDate: Date | null;
    status: string;
  }>
): string[] {
  return grants
    .filter((grant) => grant.status === 'open' && isGrantExpired(grant))
    .map((grant) => grant.id);
}

// ==================== BATCH OPERATIONS ====================

/**
 * Validate and normalize a batch of grants
 */
export async function processBatch(
  grants: ExtractedGrant[],
  existingHashes: Set<string>,
  onProgress?: (processed: number, total: number) => void
): Promise<{
  valid: NormalizedGrant[];
  invalid: Array<{ grant: ExtractedGrant; errors: string[] }>;
  duplicates: Array<{ grant: ExtractedGrant; duplicateOf: string }>;
  errors: IngestionError[];
}> {
  const valid: NormalizedGrant[] = [];
  const invalid: Array<{ grant: ExtractedGrant; errors: string[] }> = [];
  const duplicates: Array<{ grant: ExtractedGrant; duplicateOf: string }> = [];
  const errors: IngestionError[] = [];

  // Track fingerprints within this batch too
  const batchHashes = new Set<string>();

  for (let i = 0; i < grants.length; i++) {
    const grant = grants[i];
    onProgress?.(i, grants.length);

    try {
      // Check against existing and batch hashes
      const combinedHashes = new Set([...existingHashes, ...batchHashes]);
      const validation = await validateGrant(grant, combinedHashes);

      if (validation.isDuplicate) {
        duplicates.push({
          grant,
          duplicateOf: validation.duplicateOf!,
        });
        continue;
      }

      if (!validation.isValid) {
        invalid.push({
          grant,
          errors: validation.errors,
        });
        continue;
      }

      const normalized = normalizeGrant(grant, validation);
      valid.push(normalized);

      // Track this grant's fingerprint
      batchHashes.add(normalized.hashFingerprint);
    } catch (error) {
      errors.push({
        timestamp: new Date(),
        stage: 'validate',
        url: grant.sourceUrl,
        message: error instanceof Error ? error.message : 'Validation error',
        recoverable: false,
      });
    }
  }

  return { valid, invalid, duplicates, errors };
}

/**
 * Deduplicate grants against database
 */
export function deduplicateAgainstExisting(
  newGrants: NormalizedGrant[],
  existingGrants: Array<{ hashFingerprint: string; id: string }>
): {
  unique: NormalizedGrant[];
  updates: Array<{ grant: NormalizedGrant; existingId: string }>;
} {
  const existingMap = new Map(
    existingGrants.map((g) => [g.hashFingerprint, g.id])
  );

  const unique: NormalizedGrant[] = [];
  const updates: Array<{ grant: NormalizedGrant; existingId: string }> = [];

  for (const grant of newGrants) {
    const existingId = existingMap.get(grant.hashFingerprint);

    if (existingId) {
      updates.push({ grant, existingId });
    } else {
      unique.push(grant);
    }
  }

  return { unique, updates };
}
