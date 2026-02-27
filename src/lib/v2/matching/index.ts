/**
 * GRANTS V2 - DETERMINISTIC MATCHING ENGINE (SMALL FARM FOCUSED)
 * ===============================================================
 * Pure deterministic matching - no LLM, no AI.
 * Every result is explainable and reproducible.
 *
 * ELIGIBILITY GATES (MUST PASS ALL):
 * - smallFarmFriendly = true (REQUIRED)
 * - institutionOnly = false (REQUIRED)
 * - eligibilityConfidence != 'low' (deprioritized)
 *
 * HARD FILTERS (pass/fail):
 * - Geography must match (national OR user's state)
 * - Status must be active (not past deadline)
 * - Employee count must be valid
 * - At least one purpose must match
 *
 * SCORING (0-100):
 * - Purpose match: +20 points per matching goal (max 60)
 * - Geography specificity: state > regional > national
 * - Small farm design bonus
 * - Quality/confidence bonus
 *
 * OUTPUT: Top 15-20 grants ONLY
 */

import {
  GrantV2,
  FarmProfileV2,
  MatchResultV2,
  DiscoverResponseV2,
  FundingGoal,
} from '../types';
import { SEED_GRANTS_V2, getSmallFarmGrants, getSeedStats } from '../data/seed-grants';

// ============= ELIGIBILITY GATES (CRITICAL) =============

interface EligibilityResult {
  eligible: boolean;
  reason?: string;
}

/**
 * CRITICAL: Check if grant is eligible to be shown to small farm users
 * This is the PRIMARY gate - institution-only grants NEVER pass
 */
function checkSmallFarmEligibility(grant: GrantV2): EligibilityResult {
  // HARD BLOCK: Institution-only grants are NEVER shown
  if (grant.institutionOnly) {
    return {
      eligible: false,
      reason: 'Institution-only program (universities, NGOs, municipalities)',
    };
  }

  // HARD BLOCK: Must be small-farm-friendly
  if (!grant.smallFarmFriendly) {
    return {
      eligible: false,
      reason: 'Not accessible to small farm operators',
    };
  }

  return { eligible: true };
}

// ============= HARD FILTERS =============

interface FilterResult {
  passes: boolean;
  reason?: string;
}

/**
 * Check if grant is geographically accessible to user
 */
function checkGeography(grant: GrantV2, profile: FarmProfileV2): FilterResult {
  // National grants are always accessible
  if (grant.geographyScope === 'national') {
    return { passes: true };
  }

  // Regional/State grants - check if user's state is included
  if (grant.statesIncluded.length > 0) {
    if (grant.statesIncluded.includes(profile.state)) {
      return { passes: true };
    }
    return {
      passes: false,
      reason: `Only in: ${grant.statesIncluded.slice(0, 3).join(', ')}${grant.statesIncluded.length > 3 ? '...' : ''}`,
    };
  }

  // Unknown geography - pass with caution
  return { passes: true };
}

/**
 * Check if grant deadline has not passed
 */
function checkDeadline(grant: GrantV2): FilterResult {
  // Rolling deadlines always pass
  if (grant.deadlineType === 'rolling' || !grant.deadlineDate) {
    return { passes: true };
  }

  const deadline = new Date(grant.deadlineDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (deadline < today) {
    return {
      passes: false,
      reason: `Deadline passed: ${grant.deadlineDisplay}`,
    };
  }

  return { passes: true };
}

/**
 * Check if user's employee count qualifies
 */
function checkEmployeeCount(grant: GrantV2, profile: FarmProfileV2): FilterResult {
  // No max means no restriction
  if (grant.maxEmployees === 0) {
    return { passes: true };
  }

  if (profile.employeeCount > grant.maxEmployees) {
    return {
      passes: false,
      reason: `Requires ${grant.maxEmployees} or fewer employees`,
    };
  }

  return { passes: true };
}

/**
 * Check if grant has at least one matching purpose
 */
function checkPurposeMatch(grant: GrantV2, profile: FarmProfileV2): FilterResult {
  const matchingGoals = grant.purposeTags.filter(tag =>
    profile.goals.includes(tag as FundingGoal)
  );

  if (matchingGoals.length === 0) {
    return {
      passes: false,
      reason: 'No matching funding purposes',
    };
  }

  return { passes: true };
}

/**
 * Check if applicant type matches
 */
function checkApplicantType(grant: GrantV2, profile: FarmProfileV2): FilterResult {
  // Map operator types to grant applicant types
  const userTypes: string[] = [profile.operatorType];

  // Add farm/ranch based on farm type
  if (['crop', 'mixed', 'specialty'].includes(profile.farmType)) {
    userTypes.push('farm');
  }
  if (['cattle', 'mixed'].includes(profile.farmType)) {
    userTypes.push('ranch');
  }

  // Check for any match
  const hasMatch = grant.applicantTypes.some(type => userTypes.includes(type));

  if (!hasMatch) {
    return {
      passes: false,
      reason: `Not available for ${profile.operatorType} operators`,
    };
  }

  return { passes: true };
}

/**
 * Run all hard filters
 */
function runHardFilters(
  grant: GrantV2,
  profile: FarmProfileV2
): { passes: boolean; failReason?: string } {
  const filters = [
    () => checkGeography(grant, profile),
    () => checkDeadline(grant),
    () => checkEmployeeCount(grant, profile),
    () => checkPurposeMatch(grant, profile),
    () => checkApplicantType(grant, profile),
  ];

  for (const filter of filters) {
    const result = filter();
    if (!result.passes) {
      return { passes: false, failReason: result.reason };
    }
  }

  return { passes: true };
}

// ============= SCORING =============

const GOAL_LABELS: Record<string, string> = {
  irrigation: 'irrigation/water systems',
  equipment: 'equipment purchases',
  land_development: 'land development',
  cattle: 'livestock/cattle',
  conservation: 'conservation practices',
  operating: 'operating expenses',
};

/**
 * Calculate match score (0-100)
 */
function calculateScore(grant: GrantV2, profile: FarmProfileV2): {
  score: number;
  reasons: string[];
} {
  let score = 0;
  const reasons: string[] = [];

  // === PURPOSE MATCH: +20 per goal (max 60) ===
  const matchingGoals = grant.purposeTags.filter(tag =>
    profile.goals.includes(tag as FundingGoal)
  );
  const purposeScore = Math.min(60, matchingGoals.length * 20);
  score += purposeScore;

  if (matchingGoals.length > 0) {
    const labels = matchingGoals.slice(0, 2).map(g => GOAL_LABELS[g] || g);
    reasons.push(`Funds ${labels.join(' and ')}`);
  }

  // === GEOGRAPHY: state > regional > national ===
  if (grant.geographyScope === 'state' && grant.statesIncluded.includes(profile.state)) {
    score += 15;
    reasons.push(`For ${profile.state} farmers`);
  } else if (grant.geographyScope === 'regional' && grant.statesIncluded.includes(profile.state)) {
    score += 10;
    reasons.push('Regional program for your area');
  } else if (grant.geographyScope === 'national') {
    score += 5;
  }

  // === SMALL FARM DESIGN BONUS ===
  if (grant.typicalApplicant === 'small_farm') {
    score += 8;
    reasons.push('Designed for small farms');
  }

  // === CONFIDENCE BONUS ===
  if (grant.eligibilityConfidence === 'high') {
    score += 7;
  } else if (grant.eligibilityConfidence === 'medium') {
    score += 3;
  }
  // Low confidence = no bonus

  // === QUALITY BONUS: 0-10 based on data quality ===
  const qualityBonus = Math.round((grant.qualityScore / 100) * 10);
  score += qualityBonus;

  // Cap at 100
  score = Math.min(100, Math.max(0, score));

  return { score, reasons };
}

// ============= MAIN MATCHING FUNCTION =============

/**
 * Find matching grants for a farm profile
 * Returns ONLY small-farm-friendly grants, max 20
 */
export function findMatchingGrants(
  profile: FarmProfileV2,
  options: {
    limit?: number;
    minScore?: number;
  } = {}
): DiscoverResponseV2 {
  const { limit = 20, minScore = 25 } = options;

  // START with only small-farm-friendly grants (excludes institution-only)
  const eligibleGrants = getSmallFarmGrants();
  const grantsBeforeFilter = SEED_GRANTS_V2.length;
  const appliedFilters: string[] = [];

  // Track why grants were excluded
  const exclusionReasons: Record<string, number> = {};

  // Apply hard filters and score
  const matchedGrants: MatchResultV2[] = [];

  for (const grant of eligibleGrants) {
    // Double-check eligibility (should already be filtered, but be safe)
    const eligibilityCheck = checkSmallFarmEligibility(grant);
    if (!eligibilityCheck.eligible) {
      exclusionReasons['Not small-farm-friendly'] =
        (exclusionReasons['Not small-farm-friendly'] || 0) + 1;
      continue;
    }

    // Run hard filters
    const filterResult = runHardFilters(grant, profile);
    if (!filterResult.passes) {
      const reason = filterResult.failReason || 'Filter failed';
      exclusionReasons[reason] = (exclusionReasons[reason] || 0) + 1;
      continue;
    }

    // Calculate score
    const { score, reasons } = calculateScore(grant, profile);

    // Deprioritize low-confidence grants
    const adjustedScore =
      grant.eligibilityConfidence === 'low' ? Math.max(0, score - 20) : score;

    // Apply minimum score filter
    if (adjustedScore < minScore) {
      exclusionReasons['Below minimum score'] =
        (exclusionReasons['Below minimum score'] || 0) + 1;
      continue;
    }

    matchedGrants.push({
      grant,
      score: adjustedScore,
      matchReasons: reasons,
      warnings: generateWarnings(grant, profile),
    });
  }

  // Build applied filters description
  appliedFilters.push(`State: ${profile.state}`);
  appliedFilters.push(`Farm type: ${profile.farmType}`);
  appliedFilters.push(`Goals: ${profile.goals.join(', ')}`);
  appliedFilters.push(`Small-farm-only filter: applied`);

  // Sort by score (highest first)
  matchedGrants.sort((a, b) => b.score - a.score);

  // Apply limit (max 20)
  const limitedGrants = matchedGrants.slice(0, Math.min(limit, 20));

  return {
    grants: limitedGrants,
    total: matchedGrants.length,
    profile: {
      state: profile.state,
      farmType: profile.farmType,
      goals: profile.goals,
    },
    filters: {
      appliedFilters,
      grantsBeforeFilter,
      grantsAfterFilter: matchedGrants.length,
    },
  };
}

/**
 * Generate warnings for a grant match
 */
function generateWarnings(grant: GrantV2, profile: FarmProfileV2): string[] {
  const warnings: string[] = [];

  // Deadline warning (within 30 days)
  if (grant.deadlineType === 'fixed' && grant.deadlineDate) {
    const deadline = new Date(grant.deadlineDate);
    const today = new Date();
    const daysUntil = Math.ceil(
      (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntil <= 30 && daysUntil > 0) {
      warnings.push(`Deadline in ${daysUntil} days`);
    }
  }

  // Matching funds warning
  if (grant.requirementsBullets.some(r => r.toLowerCase().includes('matching'))) {
    warnings.push('May require matching funds');
  }

  // Low confidence warning
  if (grant.eligibilityConfidence === 'low') {
    warnings.push('Verify eligibility requirements');
  }

  return warnings;
}

// ============= SINGLE GRANT LOOKUP =============

/**
 * Get a single grant by ID
 */
export function getGrantById(grantId: string): GrantV2 | null {
  return SEED_GRANTS_V2.find(g => g.id === grantId) || null;
}

/**
 * Get grant detail with match info for a profile
 */
export function getGrantDetailForProfile(
  grantId: string,
  profile: FarmProfileV2
): { grant: GrantV2; match: MatchResultV2 } | null {
  const grant = getGrantById(grantId);
  if (!grant) return null;

  // Check eligibility first
  const eligibility = checkSmallFarmEligibility(grant);
  const filterResult = runHardFilters(grant, profile);
  const { score, reasons } = calculateScore(grant, profile);

  const isEligible = eligibility.eligible && filterResult.passes;

  return {
    grant,
    match: {
      grant,
      score: isEligible ? score : 0,
      matchReasons: isEligible ? reasons : [],
      warnings: isEligible
        ? generateWarnings(grant, profile)
        : [eligibility.reason || filterResult.failReason || 'Not eligible'],
    },
  };
}

// ============= HEALTH CHECK =============

/**
 * Get system health info
 */
export function getMatchingHealth(): {
  seedGrantCount: number;
  smallFarmFriendlyCount: number;
  institutionOnlyCount: number;
  highConfidenceCount: number;
  lastLoaded: string;
  purposeTags: string[];
  coverageByState: Record<string, number>;
} {
  const stats = getSeedStats();
  const coverageByState: Record<string, number> = {};

  // Count grants per state
  const eligibleGrants = getSmallFarmGrants();
  eligibleGrants.forEach(grant => {
    if (grant.geographyScope === 'national') {
      coverageByState['NATIONAL'] = (coverageByState['NATIONAL'] || 0) + 1;
    } else {
      grant.statesIncluded.forEach(state => {
        coverageByState[state] = (coverageByState[state] || 0) + 1;
      });
    }
  });

  const allPurposes = new Set<string>();
  eligibleGrants.forEach(g => g.purposeTags.forEach(t => allPurposes.add(t)));

  return {
    seedGrantCount: stats.total,
    smallFarmFriendlyCount: stats.smallFarmFriendly,
    institutionOnlyCount: stats.institutionOnly,
    highConfidenceCount: stats.highConfidence,
    lastLoaded: new Date().toISOString(),
    purposeTags: Array.from(allPurposes),
    coverageByState,
  };
}

// ============= TEST PROFILES (QA) =============

/**
 * Test profile: California cattle ranch
 */
export const TEST_PROFILE_CA_CATTLE: FarmProfileV2 = {
  id: 'test-ca-cattle',
  userId: 'test-user-1',
  state: 'CA',
  county: 'Fresno',
  farmType: 'cattle',
  acresBand: '100_500',
  operatorType: 'individual',
  employeeCount: 3,
  goals: ['cattle', 'irrigation', 'conservation'],
  createdAt: new Date(),
  updatedAt: new Date(),
  version: 1,
};

/**
 * Test profile: California mixed farm
 */
export const TEST_PROFILE_CA_MIXED: FarmProfileV2 = {
  id: 'test-ca-mixed',
  userId: 'test-user-2',
  state: 'CA',
  county: 'Sonoma',
  farmType: 'mixed',
  acresBand: '50_100',
  operatorType: 'small_business',
  employeeCount: 5,
  goals: ['equipment', 'irrigation', 'conservation'],
  createdAt: new Date(),
  updatedAt: new Date(),
  version: 1,
};

/**
 * Test profile: Texas small ranch
 */
export const TEST_PROFILE_TX_RANCH: FarmProfileV2 = {
  id: 'test-tx-ranch',
  userId: 'test-user-3',
  state: 'TX',
  county: null,
  farmType: 'cattle',
  acresBand: '500_1000',
  operatorType: 'individual',
  employeeCount: 2,
  goals: ['cattle', 'land_development', 'equipment'],
  createdAt: new Date(),
  updatedAt: new Date(),
  version: 1,
};

/**
 * Run QA tests and return results
 */
export function runQATests(): {
  passed: boolean;
  results: Array<{
    profile: string;
    matchCount: number;
    topGrants: string[];
    hasInstitutionGrants: boolean;
    allSmallFarmFriendly: boolean;
  }>;
} {
  const testProfiles = [
    { name: 'CA Cattle Ranch', profile: TEST_PROFILE_CA_CATTLE },
    { name: 'CA Mixed Farm', profile: TEST_PROFILE_CA_MIXED },
    { name: 'TX Small Ranch', profile: TEST_PROFILE_TX_RANCH },
  ];

  const results = testProfiles.map(({ name, profile }) => {
    const matches = findMatchingGrants(profile, { limit: 20 });

    // Check for institution-only grants (should be ZERO)
    const hasInstitutionGrants = matches.grants.some(
      m => m.grant.institutionOnly
    );

    // Check all are small-farm-friendly
    const allSmallFarmFriendly = matches.grants.every(
      m => m.grant.smallFarmFriendly
    );

    return {
      profile: name,
      matchCount: matches.grants.length,
      topGrants: matches.grants.slice(0, 5).map(m => m.grant.title),
      hasInstitutionGrants,
      allSmallFarmFriendly,
    };
  });

  // All tests pass if:
  // - No institution grants appear
  // - All returned grants are small-farm-friendly
  // - Each profile gets 10+ matches
  const passed = results.every(
    r =>
      !r.hasInstitutionGrants &&
      r.allSmallFarmFriendly &&
      r.matchCount >= 10
  );

  return { passed, results };
}
