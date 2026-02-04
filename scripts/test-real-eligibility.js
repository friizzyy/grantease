// Test using the ACTUAL eligibility engine
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Import the actual eligibility engine
const {
  checkUrlExists,
  checkGrantStatus,
  checkEntityEligibility,
  checkGeographyEligibility,
  checkIndustryRelevance,
  checkDataQuality,
  runEligibilityEngine,
  filterEligibleGrants,
} = require('../src/lib/eligibility/engine');

function safeJsonParse(val, def) {
  if (!val) return def;
  if (typeof val === 'object') return val;
  try { return JSON.parse(val); } catch { return def; }
}

async function test() {
  console.log('=== TESTING REAL ELIGIBILITY ENGINE ===\n');

  const profileDb = await prisma.userProfile.findFirst();
  const profile = {
    entityType: profileDb.entityType,
    state: profileDb.state,
    industryTags: safeJsonParse(profileDb.industryTags, []),
  };

  console.log('User Profile:', profile);
  console.log('');

  const grants = await prisma.grant.findMany({ take: 13 });

  // Convert to engine format
  const grantsForEngine = grants.map(g => ({
    id: g.id,
    title: g.title,
    sponsor: g.sponsor,
    summary: g.summary,
    description: g.description,
    categories: safeJsonParse(g.categories, []),
    eligibility: {
      tags: (safeJsonParse(g.eligibility, {})).tags || [],
      rawText: (safeJsonParse(g.eligibility, {})).rawText,
    },
    locations: safeJsonParse(g.locations, []).map(loc => {
      if (loc.state === 'national') {
        return { type: 'national', value: 'national' };
      }
      return { type: 'state', value: loc.state || loc.value };
    }),
    url: g.url,
    status: g.status,
    qualityScore: g.qualityScore,
    amountMin: g.amountMin,
    amountMax: g.amountMax,
  }));

  console.log('=== INDIVIDUAL GRANT CHECKS ===\n');

  for (const grant of grantsForEngine) {
    console.log('Grant:', grant.title.substring(0, 50));
    console.log('  Categories:', grant.categories);
    console.log('  Eligibility tags:', grant.eligibility.tags);
    console.log('  Locations:', JSON.stringify(grant.locations));

    const urlResult = checkUrlExists(grant);
    const statusResult = checkGrantStatus(grant);
    const entityResult = checkEntityEligibility(profile, grant);
    const geoResult = checkGeographyEligibility(profile, grant);
    const industryResult = checkIndustryRelevance(profile, grant);
    const qualityResult = checkDataQuality(grant);

    console.log('  URL:', urlResult.passes ? 'PASS' : 'FAIL', urlResult.reason || '');
    console.log('  Status:', statusResult.passes ? 'PASS' : 'FAIL', statusResult.reason || '');
    console.log('  Entity:', entityResult.passes ? 'PASS' : 'FAIL', entityResult.reason || '', entityResult.details ? JSON.stringify(entityResult.details) : '');
    console.log('  Geography:', geoResult.passes ? 'PASS' : 'FAIL', geoResult.reason || '', geoResult.details ? JSON.stringify(geoResult.details) : '');
    console.log('  Industry:', industryResult.passes ? 'PASS' : 'FAIL', industryResult.reason || '', industryResult.details ? JSON.stringify(industryResult.details) : '');
    console.log('  Quality:', qualityResult.passes ? 'PASS' : 'FAIL', qualityResult.reason || '');

    const fullResult = runEligibilityEngine(profile, grant);
    console.log('  OVERALL:', fullResult.isEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE', '| Failed filters:', fullResult.failedFilters.join(', ') || 'none');
    console.log('');
  }

  // Run batch filter
  console.log('=== BATCH FILTER RESULTS ===\n');
  const filterResult = filterEligibleGrants(profile, grantsForEngine);
  console.log('Eligible grants:', filterResult.eligible.length);
  console.log('Ineligible grants:', filterResult.ineligible.length);
  console.log('\nFilter stats:', JSON.stringify(filterResult.stats.byFilter, null, 2));

  if (filterResult.eligible.length > 0) {
    console.log('\nEligible grant titles:');
    for (const g of filterResult.eligible) {
      console.log('  -', g.title);
    }
  }
}

test().then(() => prisma.$disconnect()).catch(e => { console.error(e); process.exit(1); });
