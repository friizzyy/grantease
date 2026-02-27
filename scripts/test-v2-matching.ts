/**
 * QA TEST: V2 Matching Engine
 * Run with: npx ts-node scripts/test-v2-matching.ts
 */

import {
  findMatchingGrants,
  runQATests,
  getMatchingHealth,
  TEST_PROFILE_CA_CATTLE,
  TEST_PROFILE_CA_MIXED,
  TEST_PROFILE_TX_RANCH,
} from '../src/lib/v2/matching/index.js';
import { getSeedStats } from '../src/lib/v2/data/seed-grants.js';

console.log('='.repeat(60));
console.log('V2 MATCHING ENGINE - QA TEST');
console.log('='.repeat(60));

// 1. Seed Data Stats
console.log('\n📊 SEED DATA STATS:');
const stats = getSeedStats();
console.log(`  Total grants: ${stats.total}`);
console.log(`  Small-farm-friendly: ${stats.smallFarmFriendly}`);
console.log(`  Institution-only: ${stats.institutionOnly}`);
console.log(`  High confidence: ${stats.highConfidence}`);
console.log(`  By typical applicant:`, stats.byTypicalApplicant);
console.log(`  By source:`, stats.bySource);

// 2. Health Check
console.log('\n🏥 HEALTH CHECK:');
const health = getMatchingHealth();
console.log(`  Seed grant count: ${health.seedGrantCount}`);
console.log(`  Small-farm-friendly: ${health.smallFarmFriendlyCount}`);
console.log(`  Institution-only: ${health.institutionOnlyCount}`);
console.log(`  Purpose tags: ${health.purposeTags.join(', ')}`);

// 3. Run QA Tests
console.log('\n🧪 QA TESTS:');
const qaResults = runQATests();
console.log(`  Overall: ${qaResults.passed ? '✅ PASSED' : '❌ FAILED'}`);

qaResults.results.forEach(result => {
  console.log(`\n  Profile: ${result.profile}`);
  console.log(`    Match count: ${result.matchCount}`);
  console.log(`    Has institution grants: ${result.hasInstitutionGrants ? '❌ YES (BAD)' : '✅ NO (GOOD)'}`);
  console.log(`    All small-farm-friendly: ${result.allSmallFarmFriendly ? '✅ YES' : '❌ NO'}`);
  console.log(`    Top 5 grants:`);
  result.topGrants.forEach((title, i) => {
    console.log(`      ${i + 1}. ${title}`);
  });
});

// 4. Detailed test for CA Cattle Ranch
console.log('\n📋 DETAILED: CA Cattle Ranch');
const caResults = findMatchingGrants(TEST_PROFILE_CA_CATTLE, { limit: 15 });
console.log(`  Total matched: ${caResults.total}`);
console.log(`  Returned: ${caResults.grants.length}`);
console.log(`  Filters: ${caResults.filters.appliedFilters.join(', ')}`);
console.log(`\n  Top 10 matches:`);
caResults.grants.slice(0, 10).forEach((match, i) => {
  console.log(`    ${i + 1}. [${match.score}] ${match.grant.title}`);
  console.log(`       Why: ${match.matchReasons.join('; ')}`);
  if (match.warnings.length > 0) {
    console.log(`       ⚠️  ${match.warnings.join('; ')}`);
  }
});

// 5. Detailed test for TX Ranch
console.log('\n📋 DETAILED: TX Small Ranch');
const txResults = findMatchingGrants(TEST_PROFILE_TX_RANCH, { limit: 15 });
console.log(`  Total matched: ${txResults.total}`);
console.log(`  Returned: ${txResults.grants.length}`);
console.log(`\n  Top 10 matches:`);
txResults.grants.slice(0, 10).forEach((match, i) => {
  console.log(`    ${i + 1}. [${match.score}] ${match.grant.title}`);
  console.log(`       Why: ${match.matchReasons.join('; ')}`);
});

console.log('\n' + '='.repeat(60));
console.log('TEST COMPLETE');
console.log('='.repeat(60));
