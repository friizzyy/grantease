const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function safeJsonParse(val, def) {
  if (!val) return def;
  if (typeof val === 'object') return val;
  try { return JSON.parse(val); } catch { return def; }
}

async function testEligibility() {
  console.log('=== TESTING ELIGIBILITY ENGINE ===\n');

  const profile = await prisma.userProfile.findFirst();
  const userProfile = {
    entityType: profile.entityType,
    state: profile.state,
    industryTags: safeJsonParse(profile.industryTags, []),
  };

  console.log('User Profile:');
  console.log('  entityType:', userProfile.entityType);
  console.log('  state:', userProfile.state);
  console.log('  industryTags:', userProfile.industryTags);
  console.log('');

  const grants = await prisma.grant.findMany({ take: 13 });

  let passCount = 0;

  for (const g of grants) {
    const eligibility = safeJsonParse(g.eligibility, { tags: [] });
    const locations = safeJsonParse(g.locations, []);
    const categories = safeJsonParse(g.categories, []);

    // Entity check
    const grantTags = eligibility.tags || [];
    const entityMatch = grantTags.length === 0 || grantTags.some(t =>
      t.toLowerCase().includes('small') ||
      t.toLowerCase().includes('business') ||
      t === 'small_business'
    );

    // Geography check
    const isNational = locations.length === 0 || locations.some(loc => {
      const state = (loc.state || loc.value || loc.type || '').toLowerCase();
      return state === 'national' || state === 'nationwide';
    });
    const stateMatch = locations.some(loc => {
      const state = (loc.state || loc.value || '').toUpperCase();
      return state === userProfile.state;
    });
    const geoPass = isNational || stateMatch;

    // Industry check - user has "agriculture"
    const allText = (g.title + ' ' + (g.summary || '') + ' ' + categories.join(' ')).toLowerCase();
    const industryMatch = userProfile.industryTags.length === 0 || userProfile.industryTags.some(tag =>
      allText.includes(tag.toLowerCase())
    );

    // Check industries in eligibility
    const eligIndustries = eligibility.industries || [];
    const eligIndustryMatch = eligIndustries.length === 0 ||
      userProfile.industryTags.some(tag => eligIndustries.some(ei => ei.toLowerCase().includes(tag.toLowerCase())));

    const overallPass = entityMatch && geoPass && (industryMatch || eligIndustryMatch);

    console.log('Grant:', g.title.substring(0, 50));
    console.log('  Entity:', entityMatch ? 'PASS' : 'FAIL', '| tags:', grantTags.join(','));
    console.log('  Geo:', geoPass ? 'PASS' : 'FAIL', '| national:', isNational, '| stateMatch:', stateMatch);
    console.log('  Industry:', (industryMatch || eligIndustryMatch) ? 'PASS' : 'FAIL', '| eligIndustries:', eligIndustries.join(','));
    console.log('  => OVERALL:', overallPass ? 'PASS' : 'FAIL');
    console.log('');

    if (overallPass) passCount++;
  }

  console.log('=== SUMMARY ===');
  console.log('Grants passing eligibility:', passCount, '/', grants.length);
}

testEligibility().then(() => prisma.$disconnect()).catch(e => { console.error(e); process.exit(1); });
