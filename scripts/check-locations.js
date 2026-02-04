const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

function safeJsonParse(val, def) {
  if (!val) return def;
  if (typeof val === 'object') return val;
  try { return JSON.parse(val); } catch { return def; }
}

async function check() {
  const grant = await prisma.grant.findFirst();
  console.log('Raw locations field:', grant.locations);

  const parsed = safeJsonParse(grant.locations, []);
  console.log('Parsed locations:', JSON.stringify(parsed, null, 2));

  // What the eligibility engine expects for national check:
  // loc.type === 'national' OR loc.value === 'national'
  console.log('\nChecking if national detection works:');
  for (const loc of parsed) {
    console.log('  loc:', JSON.stringify(loc));
    console.log('    type:', loc.type);
    console.log('    value:', loc.value);
    console.log('    state:', loc.state);
    const isNational = loc.type === 'national' || loc.value === 'national' || loc.state === 'national';
    console.log('    isNational?', isNational);
  }
}

check().then(() => prisma.$disconnect());
