import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create demo user with valid password (must have uppercase, lowercase, number, 8+ chars)
  const passwordHash = await hash('Demo1234', 12)
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: { passwordHash }, // Update password if user exists
    create: {
      email: 'demo@example.com',
      name: 'Demo User',
      passwordHash,
      organization: 'Demo Organization',
    },
  })
  console.log('✓ Created demo user:', user.email)

  // Create ingestion sources
  const sources = await Promise.all([
    prisma.ingestionSource.upsert({
      where: { name: 'grants-gov' },
      update: {},
      create: {
        name: 'grants-gov',
        displayName: 'Grants.gov',
        type: 'api',
        config: JSON.stringify({ apiUrl: 'https://www.grants.gov/grantsws/rest/opportunities' }),
        enabled: true,
        lastStatus: 'success',
        lastRunAt: new Date(),
      },
    }),
    prisma.ingestionSource.upsert({
      where: { name: 'sam-gov' },
      update: {},
      create: {
        name: 'sam-gov',
        displayName: 'SAM.gov',
        type: 'api',
        config: JSON.stringify({ apiUrl: 'https://api.sam.gov/opportunities/v2/search' }),
        enabled: true,
        lastStatus: 'success',
        lastRunAt: new Date(),
      },
    }),
    prisma.ingestionSource.upsert({
      where: { name: 'ca-grants' },
      update: {},
      create: {
        name: 'ca-grants',
        displayName: 'California Grants Portal',
        type: 'feed',
        config: JSON.stringify({ portalUrl: 'https://www.grants.ca.gov' }),
        enabled: true,
        lastStatus: 'success',
        lastRunAt: new Date(),
      },
    }),
  ])
  console.log(`✓ Created ${sources.length} ingestion sources`)

  // Create sample grants
  const grants = [
    {
      sourceId: 'NSF-SBIR-2025-001',
      sourceName: 'grants-gov',
      title: 'Small Business Innovation Research (SBIR) Phase I',
      sponsor: 'National Science Foundation',
      summary: 'Funding for small businesses to conduct research and development on innovative technologies with potential for commercialization.',
      description: 'The SBIR program stimulates technological innovation in the private sector by strengthening the role of small business in meeting Federal research and development needs.',
      categories: JSON.stringify(['Research & Development', 'Technology', 'Small Business']),
      eligibility: JSON.stringify(['Small Business', 'For-Profit']),
      locations: JSON.stringify(['National']),
      amountMin: 256000,
      amountMax: 256000,
      amountText: '$256,000',
      deadlineDate: new Date('2025-06-15'),
      url: 'https://www.nsf.gov/funding/opportunities/sbir',
      contact: JSON.stringify({ email: 'sbir@nsf.gov', phone: '703-292-5111' }),
      requirements: JSON.stringify([
        'Must be a small business (under 500 employees)',
        'Principal investigator must be primarily employed by the small business',
        'Research must be conducted in the United States',
        'Submit project proposal with budget justification',
        'Complete company registration in Research.gov',
      ]),
      status: 'open',
      hashFingerprint: 'nsf-sbir-2025-001-hash',
    },
    {
      sourceId: 'HUD-CDBG-2025-001',
      sourceName: 'grants-gov',
      title: 'Community Development Block Grant (CDBG)',
      sponsor: 'Department of Housing and Urban Development',
      summary: 'Flexible funding for states and local governments to address community development needs including housing, infrastructure, and economic development.',
      description: 'CDBG provides annual grants on a formula basis to entitled cities and counties to develop viable urban communities.',
      categories: JSON.stringify(['Community Development', 'Housing', 'Infrastructure']),
      eligibility: JSON.stringify(['Government', 'Nonprofit']),
      locations: JSON.stringify(['National']),
      amountMin: 100000,
      amountMax: 5000000,
      amountText: '$100,000 - $5,000,000',
      deadlineDate: new Date('2025-03-31'),
      url: 'https://www.hud.gov/program_offices/comm_planning/cdbg',
      contact: JSON.stringify({ email: 'cdbg@hud.gov', phone: '202-708-1112' }),
      requirements: JSON.stringify([
        'Must be an entitled city or county',
        'Activities must meet national objectives',
        'Submit Consolidated Plan',
        'Environmental review required',
        'Public participation requirements',
      ]),
      status: 'open',
      hashFingerprint: 'hud-cdbg-2025-001-hash',
    },
    {
      sourceId: 'EPA-EJ-2025-001',
      sourceName: 'grants-gov',
      title: 'Environmental Justice Collaborative Problem-Solving',
      sponsor: 'Environmental Protection Agency',
      summary: 'Support for community-based organizations to address environmental and public health issues in underserved communities.',
      description: 'This program provides funding for projects that address environmental justice issues through collaborative problem-solving.',
      categories: JSON.stringify(['Environment', 'Community Development', 'Health']),
      eligibility: JSON.stringify(['Nonprofit', 'Tribal']),
      locations: JSON.stringify(['National']),
      amountMin: 150000,
      amountMax: 500000,
      amountText: '$150,000 - $500,000',
      deadlineDate: new Date('2025-04-30'),
      url: 'https://www.epa.gov/environmentaljustice/environmental-justice-grants',
      contact: JSON.stringify({ email: 'ej-grants@epa.gov', phone: '202-564-2515' }),
      requirements: JSON.stringify([
        'Must be a nonprofit or tribal organization',
        'Project must address environmental justice issue',
        'Community partnership required',
        'Submit work plan and budget',
        'DUNS number and SAM registration',
      ]),
      status: 'open',
      hashFingerprint: 'epa-ej-2025-001-hash',
    },
    {
      sourceId: 'USDA-RD-2025-001',
      sourceName: 'grants-gov',
      title: 'Rural Business Development Grant',
      sponsor: 'USDA Rural Development',
      summary: 'Grants for rural projects that finance and facilitate development of small and emerging rural businesses.',
      description: 'RBDG is a competitive grant designed to support targeted technical assistance, training, and other activities leading to development or expansion of small and emerging private businesses.',
      categories: JSON.stringify(['Small Business', 'Rural Development', 'Economic Development']),
      eligibility: JSON.stringify(['Nonprofit', 'Government', 'Tribal']),
      locations: JSON.stringify(['Rural Areas']),
      amountMin: 10000,
      amountMax: 500000,
      amountText: '$10,000 - $500,000',
      deadlineDate: new Date('2025-05-15'),
      url: 'https://www.rd.usda.gov/programs-services/business-programs/rural-business-development-grants',
      contact: JSON.stringify({ email: 'rbdg@usda.gov', phone: '202-690-4730' }),
      requirements: JSON.stringify([
        'Project must be in eligible rural area',
        'Must benefit small and emerging businesses',
        'Matching funds may be required',
        'Submit application via grants.gov',
        'Environmental review',
      ]),
      status: 'open',
      hashFingerprint: 'usda-rd-2025-001-hash',
    },
    {
      sourceId: 'NEA-ARTS-2025-001',
      sourceName: 'grants-gov',
      title: 'Grants for Arts Projects',
      sponsor: 'National Endowment for the Arts',
      summary: 'Support for artistically excellent projects that celebrate our creativity and cultural heritage and enhance civic engagement.',
      description: 'Grants for Arts Projects is the NEA flagship grant program. Through it, the agency supports projects that extend the reach of the arts to underserved populations.',
      categories: JSON.stringify(['Arts & Culture', 'Education', 'Community Development']),
      eligibility: JSON.stringify(['Nonprofit', 'Government', 'Tribal']),
      locations: JSON.stringify(['National']),
      amountMin: 10000,
      amountMax: 100000,
      amountText: '$10,000 - $100,000',
      deadlineDate: new Date('2025-02-13'),
      url: 'https://www.arts.gov/grants/grants-for-arts-projects',
      contact: JSON.stringify({ email: 'webmgr@arts.gov', phone: '202-682-5400' }),
      requirements: JSON.stringify([
        'Must be a nonprofit or government entity',
        'Project must involve artistic excellence',
        'Cost share/matching required (1:1)',
        'Submit work samples',
        'Organizational budget required',
      ]),
      status: 'open',
      hashFingerprint: 'nea-arts-2025-001-hash',
    },
    {
      sourceId: 'DOL-YB-2025-001',
      sourceName: 'grants-gov',
      title: 'YouthBuild',
      sponsor: 'Department of Labor',
      summary: 'Pre-apprenticeship program for at-risk youth ages 16-24 combining education and occupational skills training.',
      description: 'YouthBuild is a community-based alternative education program that provides job training and educational opportunities for at-risk youth.',
      categories: JSON.stringify(['Education', 'Workforce Development', 'Youth']),
      eligibility: JSON.stringify(['Nonprofit', 'Government']),
      locations: JSON.stringify(['National']),
      amountMin: 700000,
      amountMax: 1500000,
      amountText: '$700,000 - $1,500,000',
      deadlineDate: new Date('2025-04-01'),
      url: 'https://www.dol.gov/agencies/eta/youth/youthbuild',
      contact: JSON.stringify({ email: 'youthbuild@dol.gov', phone: '202-693-3030' }),
      requirements: JSON.stringify([
        'Must serve youth ages 16-24',
        'Focus on construction and other skills training',
        'Education component required (GED/HS diploma)',
        'Leadership development activities',
        'Post-program placement assistance',
      ]),
      status: 'open',
      hashFingerprint: 'dol-yb-2025-001-hash',
    },
    {
      sourceId: 'CA-CLIMATE-2025-001',
      sourceName: 'ca-grants',
      title: 'California Climate Investments - Community Air Protection',
      sponsor: 'California Air Resources Board',
      summary: 'Funding to reduce air pollution and protect communities most impacted by poor air quality in California.',
      description: 'The Community Air Protection Program directs resources to the communities most burdened by air pollution.',
      categories: JSON.stringify(['Environment', 'Health', 'Community Development']),
      eligibility: JSON.stringify(['Nonprofit', 'Government', 'Tribal']),
      locations: JSON.stringify(['California']),
      amountMin: 50000,
      amountMax: 2000000,
      amountText: '$50,000 - $2,000,000',
      deadlineDate: new Date('2025-03-15'),
      url: 'https://ww2.arb.ca.gov/our-work/programs/community-air-protection-program',
      contact: JSON.stringify({ email: 'communityair@arb.ca.gov', phone: '916-322-2990' }),
      requirements: JSON.stringify([
        'Project must be in California',
        'Must benefit disadvantaged community',
        'Demonstrate emissions reductions',
        'Community engagement plan',
        'Match not required but encouraged',
      ]),
      status: 'open',
      hashFingerprint: 'ca-climate-2025-001-hash',
    },
    {
      sourceId: 'FORD-CIVIC-2025-001',
      sourceName: 'foundation',
      title: 'Civic Engagement and Government Program',
      sponsor: 'Ford Foundation',
      summary: 'Support for organizations working to strengthen democratic participation and effective governance.',
      description: 'This program supports efforts to increase civic participation, promote accountable governance, and protect democratic rights.',
      categories: JSON.stringify(['Civic Engagement', 'Democracy', 'Government']),
      eligibility: JSON.stringify(['Nonprofit']),
      locations: JSON.stringify(['National', 'International']),
      amountMin: 100000,
      amountMax: 1000000,
      amountText: '$100,000 - $1,000,000',
      deadlineDate: null,
      url: 'https://www.fordfoundation.org/work/challenging-inequality/civic-engagement-and-government/',
      contact: JSON.stringify({ email: 'office-communications@fordfoundation.org' }),
      requirements: JSON.stringify([
        'Letter of inquiry required',
        'Must align with program priorities',
        '501(c)(3) or fiscal sponsor required',
        'Demonstrated track record',
        'By invitation only',
      ]),
      status: 'open',
      hashFingerprint: 'ford-civic-2025-001-hash',
    },
  ]

  for (const grantData of grants) {
    await prisma.grant.upsert({
      where: {
        sourceName_sourceId: {
          sourceName: grantData.sourceName,
          sourceId: grantData.sourceId,
        },
      },
      update: grantData,
      create: grantData,
    })
  }
  console.log(`✓ Created ${grants.length} sample grants`)

  // Create saved grants for demo user
  const allGrants = await prisma.grant.findMany({ take: 3 })
  for (const grant of allGrants) {
    await prisma.savedGrant.upsert({
      where: {
        userId_grantId: { userId: user.id, grantId: grant.id },
      },
      update: {},
      create: {
        userId: user.id,
        grantId: grant.id,
        notes: 'Interested in this opportunity',
      },
    })
  }
  console.log(`✓ Created ${allGrants.length} saved grants for demo user`)

  // Create saved searches
  await prisma.savedSearch.upsert({
    where: { id: 'search-1' },
    update: {},
    create: {
      id: 'search-1',
      userId: user.id,
      name: 'Small Business Technology Grants',
      query: 'technology innovation',
      filters: JSON.stringify({
        categories: ['Technology', 'Research & Development'],
        eligibility: ['Small Business'],
      }),
      alertEnabled: true,
      alertFreq: 'daily',
    },
  })

  await prisma.savedSearch.upsert({
    where: { id: 'search-2' },
    update: {},
    create: {
      id: 'search-2',
      userId: user.id,
      name: 'Environmental Justice',
      query: 'environmental community',
      filters: JSON.stringify({
        categories: ['Environment', 'Community Development'],
      }),
      alertEnabled: true,
      alertFreq: 'weekly',
    },
  })
  console.log('✓ Created 2 saved searches')

  // Create workspace
  const sampleGrant = allGrants[0]
  await prisma.workspace.upsert({
    where: { id: 'workspace-1' },
    update: {},
    create: {
      id: 'workspace-1',
      userId: user.id,
      grantId: sampleGrant.id,
      name: `${sampleGrant.title} Application`,
      status: 'in_progress',
      checklist: JSON.stringify([
        { id: '1', text: 'Review eligibility requirements', completed: true },
        { id: '2', text: 'Gather required documents', completed: true },
        { id: '3', text: 'Draft project narrative', completed: false },
        { id: '4', text: 'Prepare budget justification', completed: false },
        { id: '5', text: 'Submit application', completed: false },
      ]),
      notes: 'Need to finalize project narrative by end of week.',
    },
  })
  console.log('✓ Created 1 workspace')

  console.log('\n✨ Seed completed successfully!')
  console.log('\nDemo account:')
  console.log('  Email: demo@example.com')
  console.log('  Password: Demo1234')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
