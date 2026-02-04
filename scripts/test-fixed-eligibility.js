// Quick test to simulate eligibility with soft industry filtering
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function safeJsonParse(val, def) {
  if (!val) return def;
  if (typeof val === 'object') return val;
  try { return JSON.parse(val); } catch { return def; }
}

async function test() {
  console.log('=== TESTING WITH SOFT INDUSTRY FILTER ===\n');

  const profile = await prisma.userProfile.findFirst();
  const userProfile = {
    entityType: profile.entityType,
    state: profile.state,
    industryTags: safeJsonParse(profile.industryTags, []),
  };

  console.log('User:', userProfile.entityType, '|', userProfile.state, '|', userProfile.industryTags);
  console.log('');

  const grants = await prisma.grant.findMany();

  let passCount = 0;

  for (const g of grants) {
    const eligibility = safeJsonParse(g.eligibility, { tags: [] });
    const locations = safeJsonParse(g.locations, []);

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

    // With soft industry filter - industry NO LONGER blocks grants
    // Status must be open, URL must exist
    const statusPass = g.status === 'open';
    const urlPass = g.url && g.url.length > 0;

    // Overall: ONLY entity + geo + status + url matter now
    const overallPass = entityMatch && geoPass && statusPass && urlPass;

    if (overallPass) {
      passCount++;
      console.log('PASS:', g.title.substring(0, 55));
    } else {
      const failures = [];
      if (!entityMatch) failures.push('entity');
      if (!geoPass) failures.push('geo');
      if (!statusPass) failures.push('status');
      if (!urlPass) failures.push('url');
      console.log('FAIL:', g.title.substring(0, 55), '| reasons:', failures.join(', '));
    }
  }

  console.log('\n=== SUMMARY ===');
  console.log('With SOFT industry filter:', passCount, '/', grants.length, 'grants should appear');
  console.log('\nThis is the expected behavior after the fix.');
}

test().then(() => prisma.$disconnect()).catch(e => { console.error(e); process.exit(1); });
