import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...\n')

  const passwordHash = await hash('Demo1234', 12)
  const adminHash = await hash('Admin1234', 12)

  // ── Users ──────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: 'admin@grantsbyai.com' },
    update: { passwordHash: adminHash },
    create: {
      email: 'admin@grantsbyai.com',
      name: 'Admin User',
      passwordHash: adminHash,
      organization: 'Grants By AI',
      role: 'admin',
      emailVerified: new Date(),
    },
  })

  const demo = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: { passwordHash },
    create: {
      email: 'demo@example.com',
      name: 'Demo User',
      passwordHash,
      organization: 'Demo Nonprofit',
    },
  })

  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: { passwordHash },
    create: {
      email: 'test@example.com',
      name: 'Test Researcher',
      passwordHash,
      organization: 'Test University',
    },
  })

  console.log('✓ Created users: admin, demo, test')

  // ── User Profiles (Onboarding) ─────────────
  await prisma.userProfile.upsert({
    where: { userId: demo.id },
    update: {},
    create: {
      userId: demo.id,
      entityType: 'Nonprofit',
      country: 'US',
      state: 'CA',
      industryTags: JSON.stringify(['Environment', 'Community Development', 'Education']),
      sizeBand: 'small',
      stage: 'growth',
      annualBudget: '500k-1M',
      industryAttributes: JSON.stringify({ servesUnderserved: true, hasCommunityPartners: true }),
      grantPreferences: JSON.stringify({ preferredSize: '100k-500k', timeline: '3-6 months', complexity: 'moderate' }),
      onboardingCompleted: true,
      onboardingCompletedAt: new Date(),
      onboardingStep: 5,
      confidenceScore: 0.85,
      profileVersion: 1,
    },
  })

  await prisma.userProfile.upsert({
    where: { userId: testUser.id },
    update: {},
    create: {
      userId: testUser.id,
      entityType: 'Educational',
      country: 'US',
      state: 'NY',
      industryTags: JSON.stringify(['Technology', 'Research & Development', 'Science']),
      sizeBand: 'large',
      stage: 'established',
      annualBudget: '5M+',
      industryAttributes: JSON.stringify({ hasResearchFocus: true, hasIRB: true }),
      grantPreferences: JSON.stringify({ preferredSize: '500k+', timeline: '6-12 months', complexity: 'any' }),
      onboardingCompleted: true,
      onboardingCompletedAt: new Date(),
      onboardingStep: 5,
      confidenceScore: 0.9,
      profileVersion: 1,
    },
  })

  console.log('✓ Created user profiles (onboarding completed)')

  // ── Notification Preferences ───────────────
  for (const user of [demo, testUser]) {
    await prisma.notificationPreferences.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        emailEnabled: true,
        grantAlerts: true,
        deadlineReminders: true,
        weeklyDigest: true,
        applicationUpdates: true,
        deadlineReminderDays: 7,
        digestDay: 'monday',
        timezone: 'America/New_York',
      },
    })
  }
  console.log('✓ Created notification preferences')

  // ── Ingestion Sources ──────────────────────
  const ingestionSources = [
    { name: 'grants-gov', displayName: 'Grants.gov', type: 'api', config: { apiUrl: 'https://www.grants.gov/grantsws/rest/opportunities' } },
    { name: 'sam-gov', displayName: 'SAM.gov', type: 'api', config: { apiUrl: 'https://api.sam.gov/opportunities/v2/search' } },
    { name: 'nsf', displayName: 'National Science Foundation', type: 'api', config: { apiUrl: 'https://www.nsf.gov/awardsearch/advancedSearch' } },
    { name: 'nih-reporter', displayName: 'NIH Reporter', type: 'api', config: { apiUrl: 'https://api.reporter.nih.gov/v2/projects/search' } },
    { name: 'ca-grants', displayName: 'California Grants Portal', type: 'feed', config: { portalUrl: 'https://www.grants.ca.gov' } },
    { name: 'ny-grants', displayName: 'New York Grants Gateway', type: 'feed', config: { portalUrl: 'https://grantsgateway.ny.gov' } },
    { name: 'tx-grants', displayName: 'Texas Grants', type: 'feed', config: { portalUrl: 'https://comptroller.texas.gov/programs/funding' } },
    { name: 'candid', displayName: 'Candid / Foundation Directory', type: 'api', config: { apiUrl: 'https://api.candid.org/grants' } },
  ]

  for (const src of ingestionSources) {
    await prisma.ingestionSource.upsert({
      where: { name: src.name },
      update: {},
      create: {
        name: src.name,
        displayName: src.displayName,
        type: src.type,
        config: JSON.stringify(src.config),
        enabled: true,
        lastStatus: 'success',
        lastRunAt: new Date(),
        grantsCount: Math.floor(Math.random() * 500) + 50,
      },
    })
  }
  console.log(`✓ Created ${ingestionSources.length} ingestion sources`)

  // ── Sample Grants ──────────────────────────
  const now = new Date()
  const futureDate = (days: number) => new Date(now.getTime() + days * 86400000)

  const grantsData = [
    // Federal grants
    { sourceId: 'NSF-SBIR-2026-001', sourceName: 'grants-gov', title: 'Small Business Innovation Research (SBIR) Phase I', sponsor: 'National Science Foundation', summary: 'Funding for small businesses to conduct R&D on innovative technologies with commercialization potential.', categories: ['Research & Development', 'Technology', 'Small Business'], eligibility: ['Small Business', 'For-Profit'], amountMin: 256000, amountMax: 256000, deadlineDays: 60, fundingType: 'grant', entityTypes: ['small_business'], states: ['national'], industries: ['technology', 'science'] },
    { sourceId: 'HUD-CDBG-2026-001', sourceName: 'grants-gov', title: 'Community Development Block Grant (CDBG)', sponsor: 'Department of Housing and Urban Development', summary: 'Flexible funding for community development including housing, infrastructure, and economic development.', categories: ['Community Development', 'Housing', 'Infrastructure'], eligibility: ['Government', 'Nonprofit'], amountMin: 100000, amountMax: 5000000, deadlineDays: 45, fundingType: 'grant', entityTypes: ['government', 'nonprofit'], states: ['national'], industries: ['housing', 'community_development'] },
    { sourceId: 'EPA-EJ-2026-001', sourceName: 'grants-gov', title: 'Environmental Justice Collaborative Problem-Solving', sponsor: 'Environmental Protection Agency', summary: 'Support for community-based organizations addressing environmental and public health issues.', categories: ['Environment', 'Health', 'Community Development'], eligibility: ['Nonprofit', 'Tribal'], amountMin: 150000, amountMax: 500000, deadlineDays: 30, fundingType: 'grant', entityTypes: ['nonprofit', 'tribal'], states: ['national'], industries: ['environment', 'health'] },
    { sourceId: 'USDA-RD-2026-001', sourceName: 'grants-gov', title: 'Rural Business Development Grant', sponsor: 'USDA Rural Development', summary: 'Grants for rural projects financing development of small and emerging businesses.', categories: ['Small Business', 'Rural Development', 'Economic Development'], eligibility: ['Nonprofit', 'Government'], amountMin: 10000, amountMax: 500000, deadlineDays: 55, fundingType: 'grant', entityTypes: ['nonprofit', 'government'], states: ['national'], industries: ['agriculture', 'rural_development'], restrictedToRural: true },
    { sourceId: 'NEA-ARTS-2026-001', sourceName: 'grants-gov', title: 'Grants for Arts Projects', sponsor: 'National Endowment for the Arts', summary: 'Support for artistically excellent projects celebrating creativity and cultural heritage.', categories: ['Arts & Culture', 'Education'], eligibility: ['Nonprofit', 'Government'], amountMin: 10000, amountMax: 100000, deadlineDays: 90, fundingType: 'grant', entityTypes: ['nonprofit', 'government'], states: ['national'], industries: ['arts_culture'] },
    { sourceId: 'DOL-YB-2026-001', sourceName: 'grants-gov', title: 'YouthBuild', sponsor: 'Department of Labor', summary: 'Pre-apprenticeship program for at-risk youth combining education and occupational skills training.', categories: ['Education', 'Workforce Development', 'Youth'], eligibility: ['Nonprofit', 'Government'], amountMin: 700000, amountMax: 1500000, deadlineDays: 40, fundingType: 'grant', entityTypes: ['nonprofit', 'government'], states: ['national'], industries: ['education', 'workforce'] },
    { sourceId: 'NSF-CAREER-2026-001', sourceName: 'nsf', title: 'Faculty Early Career Development (CAREER)', sponsor: 'National Science Foundation', summary: 'NSF\'s most prestigious award for early-career faculty integrating research and education.', categories: ['Research & Development', 'Education', 'Science'], eligibility: ['Educational'], amountMin: 400000, amountMax: 800000, deadlineDays: 120, fundingType: 'grant', entityTypes: ['educational'], states: ['national'], industries: ['science', 'education'] },
    { sourceId: 'NIH-R01-2026-001', sourceName: 'nih-reporter', title: 'NIH Research Project Grant (R01)', sponsor: 'National Institutes of Health', summary: 'Support for health-related research projects by qualified investigators.', categories: ['Health', 'Research & Development', 'Science'], eligibility: ['Educational', 'Nonprofit'], amountMin: 250000, amountMax: 500000, deadlineDays: 75, fundingType: 'grant', entityTypes: ['educational', 'nonprofit'], states: ['national'], industries: ['health', 'science'] },
    { sourceId: 'DOE-EERE-2026-001', sourceName: 'grants-gov', title: 'Energy Efficiency and Renewable Energy R&D', sponsor: 'Department of Energy', summary: 'Funding for research and development of clean energy technologies.', categories: ['Energy', 'Technology', 'Research & Development'], eligibility: ['Small Business', 'Educational', 'Nonprofit'], amountMin: 200000, amountMax: 2000000, deadlineDays: 65, fundingType: 'grant', entityTypes: ['small_business', 'educational', 'nonprofit'], states: ['national'], industries: ['energy', 'technology'] },
    { sourceId: 'ED-TITLE-2026-001', sourceName: 'grants-gov', title: 'Title III - Strengthening Institutions', sponsor: 'Department of Education', summary: 'Grants to help eligible institutions become self-sufficient and expand capacity.', categories: ['Education', 'Institutional Development'], eligibility: ['Educational'], amountMin: 500000, amountMax: 2000000, deadlineDays: 50, fundingType: 'grant', entityTypes: ['educational'], states: ['national'], industries: ['education'] },
    { sourceId: 'FEMA-BRIC-2026-001', sourceName: 'grants-gov', title: 'Building Resilient Infrastructure and Communities (BRIC)', sponsor: 'Federal Emergency Management Agency', summary: 'Pre-disaster mitigation funding to reduce risks from natural hazards.', categories: ['Emergency Management', 'Infrastructure', 'Community Development'], eligibility: ['Government', 'Tribal'], amountMin: 1000000, amountMax: 50000000, deadlineDays: 85, fundingType: 'grant', entityTypes: ['government', 'tribal'], states: ['national'], industries: ['emergency_management', 'infrastructure'] },
    { sourceId: 'SBA-STEP-2026-001', sourceName: 'sam-gov', title: 'State Trade Expansion Program (STEP)', sponsor: 'Small Business Administration', summary: 'Grants to help small businesses enter and succeed in international markets.', categories: ['Small Business', 'International Trade'], eligibility: ['Small Business'], amountMin: 50000, amountMax: 300000, deadlineDays: 35, fundingType: 'grant', entityTypes: ['small_business'], states: ['national'], industries: ['trade', 'small_business'] },
    { sourceId: 'HRSA-HC-2026-001', sourceName: 'grants-gov', title: 'Health Center Program - New Access Points', sponsor: 'Health Resources and Services Administration', summary: 'Funding to establish new health center sites in underserved areas.', categories: ['Health', 'Community Development'], eligibility: ['Nonprofit', 'Government'], amountMin: 650000, amountMax: 650000, deadlineDays: 70, fundingType: 'grant', entityTypes: ['nonprofit', 'government'], states: ['national'], industries: ['health'] },
    // State grants
    { sourceId: 'CA-CLIMATE-2026-001', sourceName: 'ca-grants', title: 'California Climate Investments - Community Air Protection', sponsor: 'California Air Resources Board', summary: 'Funding to reduce air pollution in communities most impacted by poor air quality.', categories: ['Environment', 'Health'], eligibility: ['Nonprofit', 'Government'], amountMin: 50000, amountMax: 2000000, deadlineDays: 25, fundingType: 'grant', entityTypes: ['nonprofit', 'government'], states: ['CA'], industries: ['environment', 'health'], isNational: false, isStateSpecific: true },
    { sourceId: 'CA-STEM-2026-001', sourceName: 'ca-grants', title: 'California STEM Education Grant', sponsor: 'California Department of Education', summary: 'Support for K-12 STEM education programs across California schools.', categories: ['Education', 'Technology', 'Science'], eligibility: ['Educational', 'Nonprofit'], amountMin: 25000, amountMax: 250000, deadlineDays: 40, fundingType: 'grant', entityTypes: ['educational', 'nonprofit'], states: ['CA'], industries: ['education', 'technology'], isNational: false, isStateSpecific: true },
    { sourceId: 'NY-ARTS-2026-001', sourceName: 'ny-grants', title: 'New York State Council on the Arts - General Operating Support', sponsor: 'NYSCA', summary: 'Operating support for arts organizations serving New York communities.', categories: ['Arts & Culture'], eligibility: ['Nonprofit'], amountMin: 5000, amountMax: 100000, deadlineDays: 55, fundingType: 'grant', entityTypes: ['nonprofit'], states: ['NY'], industries: ['arts_culture'], isNational: false, isStateSpecific: true },
    { sourceId: 'NY-TECH-2026-001', sourceName: 'ny-grants', title: 'New York Innovation Venture Capital Fund', sponsor: 'Empire State Development', summary: 'Venture capital for innovative technology startups in New York.', categories: ['Technology', 'Small Business', 'Innovation'], eligibility: ['Small Business', 'For-Profit'], amountMin: 100000, amountMax: 500000, deadlineDays: 45, fundingType: 'loan', entityTypes: ['small_business'], states: ['NY'], industries: ['technology'], isNational: false, isStateSpecific: true },
    { sourceId: 'TX-AGRI-2026-001', sourceName: 'tx-grants', title: 'Texas Agricultural Finance Authority Grant', sponsor: 'Texas Department of Agriculture', summary: 'Financial assistance for agricultural projects and rural economic development in Texas.', categories: ['Agriculture', 'Rural Development'], eligibility: ['Small Business', 'Individual'], amountMin: 10000, amountMax: 200000, deadlineDays: 60, fundingType: 'grant', entityTypes: ['small_business', 'individual'], states: ['TX'], industries: ['agriculture'], isNational: false, isStateSpecific: true, restrictedToRural: true },
    { sourceId: 'TX-CLEAN-2026-001', sourceName: 'tx-grants', title: 'Texas Emissions Reduction Plan (TERP)', sponsor: 'Texas Commission on Environmental Quality', summary: 'Grants to reduce emissions from heavy-duty vehicles and equipment.', categories: ['Environment', 'Energy', 'Transportation'], eligibility: ['Small Business', 'Government', 'Nonprofit'], amountMin: 25000, amountMax: 750000, deadlineDays: 50, fundingType: 'rebate', entityTypes: ['small_business', 'government', 'nonprofit'], states: ['TX'], industries: ['environment', 'transportation'], isNational: false, isStateSpecific: true },
    // Foundation grants
    { sourceId: 'FORD-CIVIC-2026-001', sourceName: 'candid', title: 'Civic Engagement and Government Program', sponsor: 'Ford Foundation', summary: 'Support for organizations strengthening democratic participation and effective governance.', categories: ['Civic Engagement', 'Democracy'], eligibility: ['Nonprofit'], amountMin: 100000, amountMax: 1000000, deadlineDays: null, fundingType: 'grant', entityTypes: ['nonprofit'], states: ['national'], industries: ['civic_engagement', 'government'] },
    { sourceId: 'GATES-GH-2026-001', sourceName: 'candid', title: 'Global Health Discovery & Tools', sponsor: 'Bill & Melinda Gates Foundation', summary: 'Funding for innovative approaches to detect, prevent, and treat infectious diseases.', categories: ['Health', 'Research & Development', 'International'], eligibility: ['Nonprofit', 'Educational'], amountMin: 100000, amountMax: 5000000, deadlineDays: null, fundingType: 'grant', entityTypes: ['nonprofit', 'educational'], states: ['national'], industries: ['health', 'science'] },
    { sourceId: 'MACARTHUR-2026-001', sourceName: 'candid', title: 'MacArthur Foundation - Climate Solutions', sponsor: 'John D. and Catherine T. MacArthur Foundation', summary: 'Support for efforts to reduce greenhouse gas emissions and help communities adapt to climate change.', categories: ['Environment', 'Climate', 'Research & Development'], eligibility: ['Nonprofit', 'Educational'], amountMin: 200000, amountMax: 2000000, deadlineDays: null, fundingType: 'grant', entityTypes: ['nonprofit', 'educational'], states: ['national'], industries: ['environment', 'climate'] },
    { sourceId: 'KRESGE-2026-001', sourceName: 'candid', title: 'Kresge Foundation - Arts and Culture Program', sponsor: 'The Kresge Foundation', summary: 'Grants for arts organizations building creative capacity in underserved communities.', categories: ['Arts & Culture', 'Community Development'], eligibility: ['Nonprofit'], amountMin: 50000, amountMax: 500000, deadlineDays: 80, fundingType: 'grant', entityTypes: ['nonprofit'], states: ['national'], industries: ['arts_culture', 'community_development'] },
    { sourceId: 'BLOOMBERG-2026-001', sourceName: 'candid', title: 'Bloomberg Philanthropies - Public Art Challenge', sponsor: 'Bloomberg Philanthropies', summary: 'Grants for temporary public art projects that celebrate creativity and promote civic engagement.', categories: ['Arts & Culture', 'Civic Engagement'], eligibility: ['Government'], amountMin: 500000, amountMax: 1000000, deadlineDays: 100, fundingType: 'grant', entityTypes: ['government'], states: ['national'], industries: ['arts_culture'] },
    // More federal to reach ~30
    { sourceId: 'NOAA-SEA-2026-001', sourceName: 'grants-gov', title: 'Sea Grant National Strategic Investments', sponsor: 'NOAA Sea Grant', summary: 'Research and extension activities for sustainable use of marine resources.', categories: ['Environment', 'Research & Development', 'Marine Science'], eligibility: ['Educational', 'Nonprofit'], amountMin: 100000, amountMax: 1500000, deadlineDays: 95, fundingType: 'grant', entityTypes: ['educational', 'nonprofit'], states: ['national'], industries: ['environment', 'science'] },
    { sourceId: 'NASA-EPSCoR-2026-001', sourceName: 'grants-gov', title: 'NASA EPSCoR Research Infrastructure Development', sponsor: 'NASA', summary: 'Building research capabilities in states historically underrepresented in NASA funding.', categories: ['Research & Development', 'Science', 'Technology'], eligibility: ['Educational'], amountMin: 750000, amountMax: 750000, deadlineDays: 110, fundingType: 'grant', entityTypes: ['educational'], states: ['national'], industries: ['science', 'technology'] },
    { sourceId: 'IMLS-MUSEUMS-2026-001', sourceName: 'grants-gov', title: 'Museums for America', sponsor: 'Institute of Museum and Library Services', summary: 'Support for museum projects that strengthen their ability to serve the public.', categories: ['Arts & Culture', 'Education', 'Community Development'], eligibility: ['Nonprofit', 'Government'], amountMin: 25000, amountMax: 250000, deadlineDays: 70, fundingType: 'grant', entityTypes: ['nonprofit', 'government'], states: ['national'], industries: ['arts_culture', 'education'] },
    { sourceId: 'OJP-BJA-2026-001', sourceName: 'grants-gov', title: 'Byrne Justice Assistance Grant (JAG)', sponsor: 'Bureau of Justice Assistance', summary: 'Flexible funding for state and local criminal justice programs.', categories: ['Justice', 'Public Safety', 'Community Development'], eligibility: ['Government'], amountMin: 50000, amountMax: 5000000, deadlineDays: 55, fundingType: 'grant', entityTypes: ['government'], states: ['national'], industries: ['justice', 'public_safety'] },
    { sourceId: 'ACL-ILC-2026-001', sourceName: 'grants-gov', title: 'Independent Living - Centers for Independent Living', sponsor: 'Administration for Community Living', summary: 'Funding for centers providing independent living services for people with disabilities.', categories: ['Health', 'Disability Services', 'Community Development'], eligibility: ['Nonprofit'], amountMin: 200000, amountMax: 600000, deadlineDays: 65, fundingType: 'grant', entityTypes: ['nonprofit'], states: ['national'], industries: ['health', 'disability_services'] },
    { sourceId: 'USDA-NIFA-2026-001', sourceName: 'grants-gov', title: 'Agriculture and Food Research Initiative (AFRI)', sponsor: 'USDA National Institute of Food and Agriculture', summary: 'Competitive grants for fundamental and applied research in agriculture and food sciences.', categories: ['Agriculture', 'Research & Development', 'Food Science'], eligibility: ['Educational', 'Nonprofit'], amountMin: 150000, amountMax: 3000000, deadlineDays: 80, fundingType: 'grant', entityTypes: ['educational', 'nonprofit'], states: ['national'], industries: ['agriculture', 'science'] },
  ]

  let grantCount = 0
  for (const g of grantsData) {
    await prisma.grant.upsert({
      where: { sourceName_sourceId: { sourceName: g.sourceName, sourceId: g.sourceId } },
      update: {},
      create: {
        sourceId: g.sourceId,
        sourceName: g.sourceName,
        title: g.title,
        sponsor: g.sponsor,
        summary: g.summary,
        categories: JSON.stringify(g.categories),
        eligibility: JSON.stringify(g.eligibility),
        locations: JSON.stringify(g.states.includes('national') ? ['National'] : g.states),
        amountMin: g.amountMin,
        amountMax: g.amountMax,
        amountText: g.amountMin === g.amountMax ? `$${g.amountMin.toLocaleString()}` : `$${g.amountMin.toLocaleString()} - $${g.amountMax.toLocaleString()}`,
        deadlineDate: g.deadlineDays ? futureDate(g.deadlineDays) : null,
        deadlineType: g.deadlineDays ? 'fixed' : 'rolling',
        url: `https://example.com/grants/${g.sourceId}`,
        status: 'open',
        hashFingerprint: `${g.sourceName}-${g.sourceId}-hash`,
        fundingType: g.fundingType,
        eligibleEntityTypes: JSON.stringify(g.entityTypes),
        eligibleStates: JSON.stringify(g.states),
        eligibleIndustries: JSON.stringify(g.industries),
        isNational: g.isNational ?? true,
        isStateSpecific: g.isStateSpecific ?? false,
        restrictedToRural: g.restrictedToRural ?? false,
        qualityScore: 70 + Math.floor(Math.random() * 30),
      },
    })
    grantCount++
  }
  console.log(`✓ Created ${grantCount} sample grants`)

  // ── Saved Grants ───────────────────────────
  const allGrants = await prisma.grant.findMany({ take: 5 })
  for (const grant of allGrants) {
    await prisma.savedGrant.upsert({
      where: { userId_grantId: { userId: demo.id, grantId: grant.id } },
      update: {},
      create: { userId: demo.id, grantId: grant.id, notes: 'Saved for review' },
    })
  }
  console.log(`✓ Saved ${allGrants.length} grants for demo user`)

  // ── Saved Searches ─────────────────────────
  const searches = [
    { id: 'search-1', name: 'Small Business Technology Grants', query: 'technology innovation', filters: { categories: ['Technology', 'R&D'], eligibility: ['Small Business'] }, alertFreq: 'daily' },
    { id: 'search-2', name: 'Environmental Justice', query: 'environmental community', filters: { categories: ['Environment', 'Community Development'] }, alertFreq: 'weekly' },
    { id: 'search-3', name: 'Education Grants CA', query: 'education california', filters: { categories: ['Education'], states: ['CA'] }, alertFreq: 'daily' },
  ]
  for (const s of searches) {
    await prisma.savedSearch.upsert({
      where: { id: s.id },
      update: {},
      create: { id: s.id, userId: demo.id, name: s.name, query: s.query, filters: JSON.stringify(s.filters), alertEnabled: true, alertFreq: s.alertFreq },
    })
  }
  console.log(`✓ Created ${searches.length} saved searches`)

  // ── Workspaces ─────────────────────────────
  if (allGrants.length > 0) {
    await prisma.workspace.upsert({
      where: { id: 'workspace-1' },
      update: {},
      create: {
        id: 'workspace-1',
        userId: demo.id,
        grantId: allGrants[0].id,
        name: `${allGrants[0].title} Application`,
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
  }

  // ── Grant Applications ─────────────────────
  if (allGrants.length >= 3) {
    await prisma.grantApplication.upsert({
      where: { userId_grantId: { userId: demo.id, grantId: allGrants[0].id } },
      update: {},
      create: {
        userId: demo.id,
        grantId: allGrants[0].id,
        status: 'in_progress',
        projectTitle: 'Community Green Infrastructure Initiative',
        projectSummary: 'A comprehensive plan to implement green infrastructure solutions in underserved neighborhoods.',
        requestedAmount: 250000,
        completedSections: JSON.stringify(['contact_info', 'project_narrative']),
        currentSection: 'budget',
        progressPercent: 45,
        formData: JSON.stringify({ contactName: 'Demo User', orgName: 'Demo Nonprofit' }),
      },
    })

    await prisma.grantApplication.upsert({
      where: { userId_grantId: { userId: demo.id, grantId: allGrants[1].id } },
      update: {},
      create: {
        userId: demo.id,
        grantId: allGrants[1].id,
        status: 'draft',
        projectTitle: 'Affordable Housing Rehabilitation Project',
        requestedAmount: 1500000,
        progressPercent: 10,
        formData: JSON.stringify({}),
      },
    })

    console.log('✓ Created 2 grant applications')
  }

  // ── Notifications ──────────────────────────
  const notifications = [
    { type: 'new_match', title: 'New Grant Match', message: 'We found 3 new grants matching your profile. Check your discover page!', link: '/app/discover' },
    { type: 'deadline_reminder', title: 'Deadline Approaching', message: `${allGrants[0]?.title || 'SBIR Grant'} deadline is in 7 days.`, link: '/app/workspace' },
    { type: 'system', title: 'Welcome to Grants By AI', message: 'Complete your profile to get personalized grant recommendations.', link: '/app/settings' },
    { type: 'application_update', title: 'Application Progress', message: 'Your Community Green Infrastructure Initiative application is 45% complete.', link: '/app/workspace' },
  ]

  for (const n of notifications) {
    await prisma.notification.create({
      data: { userId: demo.id, type: n.type, title: n.title, message: n.message, link: n.link },
    })
  }
  console.log(`✓ Created ${notifications.length} notifications`)

  // ── Grant Collections ──────────────────────
  const collection = await prisma.grantCollection.upsert({
    where: { id: 'collection-1' },
    update: {},
    create: {
      id: 'collection-1',
      userId: demo.id,
      name: 'Top Picks',
      description: 'My best grant opportunities',
      color: '#40ffaa',
      icon: 'star',
      isDefault: true,
    },
  })

  if (allGrants.length >= 2) {
    for (const grant of allGrants.slice(0, 2)) {
      await prisma.grantCollectionItem.upsert({
        where: { collectionId_grantId: { collectionId: collection.id, grantId: grant.id } },
        update: {},
        create: { collectionId: collection.id, grantId: grant.id },
      })
    }
  }
  console.log('✓ Created 1 grant collection')

  // ── User Vault ─────────────────────────────
  await prisma.userVault.upsert({
    where: { userId: demo.id },
    update: {},
    create: {
      userId: demo.id,
      organizationName: 'Demo Nonprofit',
      organizationLegalName: 'Demo Nonprofit Organization Inc.',
      ein: '12-3456789',
      yearFounded: 2018,
      websiteUrl: 'https://demo-nonprofit.org',
      primaryContactName: 'Demo User',
      primaryContactTitle: 'Executive Director',
      primaryContactEmail: 'demo@example.com',
      primaryContactPhone: '555-123-4567',
      streetAddress: '123 Main Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      missionStatement: 'We empower underserved communities through environmental education and sustainable development programs.',
      serviceArea: 'San Francisco Bay Area',
      populationsServed: JSON.stringify(['Low-income families', 'Youth', 'Minority communities']),
      annualOperatingBudget: '$750,000',
      fiscalYearEnd: 'December',
      samRegistered: true,
      nonprofitStatus: '501c3',
      certifications: JSON.stringify(['minority_led', 'community_based']),
      keyPersonnel: JSON.stringify([
        { name: 'Demo User', title: 'Executive Director', email: 'demo@example.com', bio: '10 years in nonprofit leadership' },
        { name: 'Jane Smith', title: 'Program Director', email: 'jane@demo-nonprofit.org', bio: 'Environmental science background' },
      ]),
      boardMembers: JSON.stringify([
        { name: 'John Board', title: 'Chair', affiliation: 'Community Leader' },
        { name: 'Sarah Trustee', title: 'Treasurer', affiliation: 'CPA' },
      ]),
    },
  })
  console.log('✓ Created user vault with organization data')

  console.log('\n✨ Seed completed successfully!')
  console.log('\n📋 Test accounts:')
  console.log('  Admin:  admin@grantsbyai.com / Admin1234')
  console.log('  Demo:   demo@example.com / Demo1234')
  console.log('  Test:   test@example.com / Demo1234')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
