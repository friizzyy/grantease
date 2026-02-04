/**
 * FULL PIPELINE TEST
 * Tests the exact flow from database to eligibility checking
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function safeJsonParse(val, def) {
  if (!val) return def;
  if (typeof val === 'object') return val;
  try { return JSON.parse(val); } catch { return def; }
}

async function testPipeline() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║              FULL PIPELINE TEST                               ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // 1. Load grants like loadGrantsFromDatabase does
  console.log('━━━ STEP 1: LOAD GRANTS (simulating loadGrantsFromDatabase) ━━━\n');

  const dbGrants = await prisma.grant.findMany({
    where: {
      status: 'open',
      url: { not: '' },
    },
    take: 20,
  });

  console.log(`Loaded ${dbGrants.length} grants from database\n`);

  // Transform grants (this is the NEW correct transformation)
  const grants = dbGrants.map(g => {
    // Parse eligibility correctly
    const eligibilityData = safeJsonParse(g.eligibility, {});

    // Parse and transform locations
    const rawLocations = safeJsonParse(g.locations, []);
    const locations = rawLocations.map(loc => {
      if (loc.type) {
        return { type: loc.type, value: loc.value };
      }
      if (loc.state?.toLowerCase() === 'national' || loc.state?.toLowerCase() === 'nationwide') {
        return { type: 'national' };
      }
      if (loc.state) {
        return { type: 'state', value: loc.state };
      }
      return { type: 'unknown' };
    });

    return {
      id: g.id,
      title: g.title,
      eligibility: {
        tags: eligibilityData.tags || [],
      },
      locations,
    };
  });

  // Show transformed data
  console.log('Transformed grant data:\n');
  for (const g of grants.slice(0, 3)) {
    console.log(`  ${g.title.substring(0, 45)}...`);
    console.log(`    eligibility.tags: ${JSON.stringify(g.eligibility.tags)}`);
    console.log(`    locations: ${JSON.stringify(g.locations)}`);
    console.log('');
  }

  // 2. Load user profile
  console.log('━━━ STEP 2: LOAD USER PROFILE ━━━\n');

  const profileDb = await prisma.userProfile.findFirst();
  const profile = {
    entityType: profileDb.entityType,
    state: profileDb.state,
    industryTags: safeJsonParse(profileDb.industryTags, []),
  };

  console.log(`  entityType: ${profile.entityType}`);
  console.log(`  state: ${profile.state}`);
  console.log(`  industryTags: ${JSON.stringify(profile.industryTags)}\n`);

  // 3. Run eligibility checks
  console.log('━━━ STEP 3: ELIGIBILITY CHECKS ━━━\n');

  let passCount = 0;

  for (const g of grants) {
    // Entity check
    const grantTags = g.eligibility.tags || [];
    const entityMatch = grantTags.length === 0 || grantTags.some(t =>
      t.toLowerCase().includes('small') ||
      t.toLowerCase().includes('business') ||
      t === 'small_business'
    );

    // Geography check - NOW USING CORRECT FORMAT
    const isNational = g.locations.length === 0 || g.locations.some(loc => {
      return loc.type === 'national' || loc.type === 'nationwide';
    });
    const stateMatch = g.locations.some(loc => {
      return loc.type === 'state' && loc.value?.toUpperCase() === profile.state;
    });
    const geoPass = isNational || stateMatch;

    // Industry check is now SOFT (doesn't block)
    const overallPass = entityMatch && geoPass;

    const status = overallPass ? '✓ PASS' : '✗ FAIL';
    const failReasons = [];
    if (!entityMatch) failReasons.push('entity');
    if (!geoPass) failReasons.push('geo');

    if (overallPass) passCount++;

    console.log(`  ${status}: ${g.title.substring(0, 45)}...`);
    if (!overallPass) {
      console.log(`         Failed: ${failReasons.join(', ')}`);
    }
  }

  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log(`║  RESULT: ${passCount}/${grants.length} grants pass eligibility                    ║`);
  console.log('╠══════════════════════════════════════════════════════════════╣');

  if (passCount > 0) {
    console.log('║  ✓ SUCCESS: Grants will appear in /app/discover              ║');
  } else {
    console.log('║  ✗ FAILURE: No grants pass eligibility                       ║');
  }

  console.log('╚══════════════════════════════════════════════════════════════╝');
}

testPipeline().then(() => prisma.$disconnect()).catch(e => { console.error(e); process.exit(1); });
