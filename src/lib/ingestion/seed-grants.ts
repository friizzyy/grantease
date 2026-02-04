/**
 * Grant Seeding Script
 *
 * Seeds the database with initial grants from known, reliable sources.
 * This ensures the system has data to work with even before automated ingestion runs.
 *
 * Run with: npx ts-node -r tsconfig-paths/register src/lib/ingestion/seed-grants.ts
 * Or: npm run seed-grants
 */

import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// ==================== SEED DATA ====================

interface SeedGrant {
  sourceId: string;
  sourceName: string;
  title: string;
  sponsor: string;
  summary: string;
  description: string;
  categories: string[];
  eligibleEntityTypes: string[];
  eligibleStates: string[];
  eligibleIndustries: string[];
  amountMin: number | null;
  amountMax: number | null;
  amountText: string | null;
  deadlineType: 'fixed' | 'rolling' | 'unknown';
  deadlineDate: Date | null;
  url: string;
  fundingType: string;
  purposeTags: string[];
  isNational: boolean;
  samRequired: boolean;
  qualityScore: number;
}

// Well-known grants that are consistently available
const SEED_GRANTS: SeedGrant[] = [
  // SBIR/STTR Programs (always available)
  {
    sourceId: 'sbir_phase1_2024',
    sourceName: 'sbir_gov',
    title: 'SBIR Phase I - Small Business Innovation Research',
    sponsor: 'Small Business Administration (SBA)',
    summary:
      'Federal program providing funding for small businesses to engage in R&D with commercialization potential.',
    description:
      'The Small Business Innovation Research (SBIR) program is a highly competitive program that encourages domestic small businesses to engage in Federal Research/Research and Development (R/R&D) with the potential for commercialization. Through a competitive awards-based program, SBIR enables small businesses to explore their technological potential and provides the incentive to profit from its commercialization.',
    categories: ['research', 'technology', 'innovation'],
    eligibleEntityTypes: ['small_business'],
    eligibleStates: ['national'],
    eligibleIndustries: ['technology', 'research', 'manufacturing', 'health'],
    amountMin: 50000,
    amountMax: 275000,
    amountText: 'Phase I: Up to $275,000; Phase II: Up to $1.5M',
    deadlineType: 'rolling',
    deadlineDate: null,
    url: 'https://www.sbir.gov',
    fundingType: 'grant',
    purposeTags: ['R&D', 'innovation', 'commercialization'],
    isNational: true,
    samRequired: true,
    qualityScore: 95,
  },
  {
    sourceId: 'sttr_phase1_2024',
    sourceName: 'sbir_gov',
    title: 'STTR Phase I - Small Business Technology Transfer',
    sponsor: 'Small Business Administration (SBA)',
    summary:
      'Federal program for small businesses partnering with research institutions for technology commercialization.',
    description:
      'The Small Business Technology Transfer (STTR) program expands funding opportunities in the federal innovation research and development arena. Central to the program is the partnership between small businesses and nonprofit research institutions.',
    categories: ['research', 'technology', 'education'],
    eligibleEntityTypes: ['small_business'],
    eligibleStates: ['national'],
    eligibleIndustries: ['technology', 'research', 'health', 'energy'],
    amountMin: 50000,
    amountMax: 275000,
    amountText: 'Phase I: Up to $275,000',
    deadlineType: 'rolling',
    deadlineDate: null,
    url: 'https://www.sbir.gov/about/about-sttr',
    fundingType: 'grant',
    purposeTags: ['R&D', 'partnerships', 'technology transfer'],
    isNational: true,
    samRequired: true,
    qualityScore: 95,
  },

  // SBA Programs
  {
    sourceId: 'sba_7a_loan_2024',
    sourceName: 'sba_gov',
    title: 'SBA 7(a) Loan Program',
    sponsor: 'Small Business Administration (SBA)',
    summary:
      'SBAs primary business loan program for small businesses needing working capital or fixed assets.',
    description:
      'The 7(a) loan program is SBAs primary program for providing financial assistance to small businesses. The terms and conditions, like the guaranty percentage and loan amount, may vary by the type of loan.',
    categories: ['business', 'finance'],
    eligibleEntityTypes: ['small_business', 'for_profit'],
    eligibleStates: ['national'],
    eligibleIndustries: [
      'business',
      'manufacturing',
      'retail',
      'services',
      'technology',
    ],
    amountMin: 50000,
    amountMax: 5000000,
    amountText: 'Up to $5 million',
    deadlineType: 'rolling',
    deadlineDate: null,
    url: 'https://www.sba.gov/funding-programs/loans/7a-loans',
    fundingType: 'loan',
    purposeTags: ['working capital', 'equipment', 'expansion', 'real estate'],
    isNational: true,
    samRequired: false,
    qualityScore: 90,
  },
  {
    sourceId: 'sba_504_loan_2024',
    sourceName: 'sba_gov',
    title: 'SBA 504 Loan Program',
    sponsor: 'Small Business Administration (SBA)',
    summary:
      'Long-term, fixed-rate financing for major fixed assets like real estate and equipment.',
    description:
      'The CDC/504 Loan Program provides long-term, fixed-rate financing for major fixed assets that promote business growth and job creation. 504 loans are available through Certified Development Companies (CDCs).',
    categories: ['business', 'real estate'],
    eligibleEntityTypes: ['small_business', 'for_profit'],
    eligibleStates: ['national'],
    eligibleIndustries: ['manufacturing', 'retail', 'services', 'technology'],
    amountMin: 125000,
    amountMax: 5500000,
    amountText: '$125,000 to $5.5 million',
    deadlineType: 'rolling',
    deadlineDate: null,
    url: 'https://www.sba.gov/funding-programs/loans/504-loans',
    fundingType: 'loan',
    purposeTags: ['real estate', 'equipment', 'expansion'],
    isNational: true,
    samRequired: false,
    qualityScore: 90,
  },

  // USDA Programs
  {
    sourceId: 'usda_reap_2024',
    sourceName: 'usda_grants',
    title: 'USDA Rural Energy for America Program (REAP)',
    sponsor: 'USDA Rural Development',
    summary:
      'Grants and loans for rural small businesses and agricultural producers for renewable energy and efficiency improvements.',
    description:
      'The Rural Energy for America Program (REAP) provides guaranteed loan financing and grant funding to agricultural producers and rural small businesses for renewable energy systems or to make energy efficiency improvements.',
    categories: ['agriculture', 'energy', 'environment'],
    eligibleEntityTypes: ['small_business', 'individual'],
    eligibleStates: ['national'],
    eligibleIndustries: ['agriculture', 'energy', 'food_production'],
    amountMin: 2500,
    amountMax: 1000000,
    amountText: 'Grants: $2,500-$1M (25% of costs); Loans: Up to $25M',
    deadlineType: 'fixed',
    deadlineDate: new Date('2025-03-31'),
    url: 'https://www.rd.usda.gov/programs-services/energy-programs/rural-energy-america-program-renewable-energy-systems-energy-efficiency-improvement-guaranteed-loans',
    fundingType: 'grant',
    purposeTags: ['renewable energy', 'energy efficiency', 'solar', 'equipment'],
    isNational: true,
    samRequired: true,
    qualityScore: 88,
  },
  {
    sourceId: 'usda_value_added_2024',
    sourceName: 'usda_grants',
    title: 'USDA Value-Added Producer Grants (VAPG)',
    sponsor: 'USDA Rural Development',
    summary:
      'Grants for agricultural producers to develop value-added products and market them.',
    description:
      'Value-Added Producer Grants help agricultural producers enter into value-added activities related to the processing or marketing of bio-based, value-added products.',
    categories: ['agriculture', 'business'],
    eligibleEntityTypes: ['small_business', 'individual', 'nonprofit'],
    eligibleStates: ['national'],
    eligibleIndustries: ['agriculture', 'food_production'],
    amountMin: 10000,
    amountMax: 250000,
    amountText: 'Up to $250,000 for planning; $500,000 for working capital',
    deadlineType: 'fixed',
    deadlineDate: new Date('2025-04-15'),
    url: 'https://www.rd.usda.gov/programs-services/business-programs/value-added-producer-grants',
    fundingType: 'grant',
    purposeTags: ['marketing', 'product development', 'planning', 'working capital'],
    isNational: true,
    samRequired: true,
    qualityScore: 85,
  },

  // DOE Programs
  {
    sourceId: 'doe_weatherization_2024',
    sourceName: 'doe_eere',
    title: 'Weatherization Assistance Program (WAP)',
    sponsor: 'Department of Energy',
    summary:
      'Reduces energy costs for low-income households by increasing energy efficiency.',
    description:
      'The Weatherization Assistance Program reduces energy costs for low-income households by increasing the energy efficiency of their homes, while ensuring their health and safety. Funds are distributed to states and territories.',
    categories: ['energy', 'housing', 'community_development'],
    eligibleEntityTypes: ['government', 'nonprofit'],
    eligibleStates: ['national'],
    eligibleIndustries: ['energy', 'housing', 'social_services'],
    amountMin: 50000,
    amountMax: 5000000,
    amountText: 'Varies by state allocation',
    deadlineType: 'rolling',
    deadlineDate: null,
    url: 'https://www.energy.gov/scep/wap/weatherization-assistance-program',
    fundingType: 'grant',
    purposeTags: ['energy efficiency', 'housing', 'low-income assistance'],
    isNational: true,
    samRequired: true,
    qualityScore: 85,
  },

  // Foundation Grants
  {
    sourceId: 'rwjf_culture_health_2024',
    sourceName: 'foundation_grants',
    title: 'Robert Wood Johnson Foundation - Building a Culture of Health',
    sponsor: 'Robert Wood Johnson Foundation',
    summary:
      'Grants to improve health and well-being, with focus on equity and community health.',
    description:
      'RWJF supports efforts to build a Culture of Health where everyone has a fair and just opportunity for health and well-being. Funding supports innovative approaches to health equity.',
    categories: ['health', 'community_development', 'research'],
    eligibleEntityTypes: ['nonprofit', 'educational', 'government'],
    eligibleStates: ['national'],
    eligibleIndustries: ['health', 'social_services', 'research'],
    amountMin: 50000,
    amountMax: 1000000,
    amountText: 'Varies by initiative',
    deadlineType: 'rolling',
    deadlineDate: null,
    url: 'https://www.rwjf.org/en/grants.html',
    fundingType: 'grant',
    purposeTags: ['health equity', 'research', 'community health', 'innovation'],
    isNational: true,
    samRequired: false,
    qualityScore: 88,
  },

  // State-Specific Examples
  {
    sourceId: 'ca_small_business_2024',
    sourceName: 'california_grants',
    title: 'California Small Business COVID-19 Relief Grant Program',
    sponsor: 'California Office of the Small Business Advocate',
    summary:
      'Grants for California small businesses and nonprofits impacted by economic conditions.',
    description:
      'The California Small Business COVID-19 Relief Grant Program provides micro grants to small businesses and nonprofits that have been impacted by COVID-19 and the related health and safety restrictions.',
    categories: ['business', 'community_development'],
    eligibleEntityTypes: ['small_business', 'nonprofit'],
    eligibleStates: ['CA'],
    eligibleIndustries: ['business', 'nonprofit'],
    amountMin: 5000,
    amountMax: 25000,
    amountText: '$5,000 - $25,000',
    deadlineType: 'rolling',
    deadlineDate: null,
    url: 'https://www.grants.ca.gov',
    fundingType: 'grant',
    purposeTags: ['operating costs', 'business continuity', 'recovery'],
    isNational: false,
    samRequired: false,
    qualityScore: 80,
  },
  {
    sourceId: 'ny_arts_grants_2024',
    sourceName: 'new_york_grants',
    title: 'NYSCA General Operating Support',
    sponsor: 'New York State Council on the Arts',
    summary:
      'Operating support for New York arts and cultural organizations.',
    description:
      'General Operating Support grants provide unrestricted operating support to eligible arts and cultural organizations in New York State that demonstrate significant artistic quality and impact.',
    categories: ['arts_culture'],
    eligibleEntityTypes: ['nonprofit'],
    eligibleStates: ['NY'],
    eligibleIndustries: ['arts_culture', 'entertainment'],
    amountMin: 5000,
    amountMax: 150000,
    amountText: '$5,000 - $150,000',
    deadlineType: 'fixed',
    deadlineDate: new Date('2025-03-01'),
    url: 'https://arts.ny.gov/grants',
    fundingType: 'grant',
    purposeTags: ['operating costs', 'arts programming'],
    isNational: false,
    samRequired: false,
    qualityScore: 82,
  },

  // Energy Rebates
  {
    sourceId: 'federal_solar_itc_2024',
    sourceName: 'dsire_rebates',
    title: 'Federal Solar Investment Tax Credit (ITC)',
    sponsor: 'Internal Revenue Service',
    summary:
      'Federal tax credit for solar energy systems installed on residential and commercial properties.',
    description:
      'The federal solar Investment Tax Credit (ITC) allows you to deduct a percentage of the cost of installing a solar energy system from your federal taxes. The ITC applies to both residential and commercial systems.',
    categories: ['energy', 'environment'],
    eligibleEntityTypes: [
      'individual',
      'small_business',
      'for_profit',
      'nonprofit',
    ],
    eligibleStates: ['national'],
    eligibleIndustries: ['all'],
    amountMin: null,
    amountMax: null,
    amountText: '30% tax credit (no cap)',
    deadlineType: 'rolling',
    deadlineDate: null,
    url: 'https://www.energy.gov/eere/solar/federal-solar-tax-credits-businesses',
    fundingType: 'tax_credit',
    purposeTags: ['solar', 'renewable energy', 'energy efficiency'],
    isNational: true,
    samRequired: false,
    qualityScore: 95,
  },

  // EDA Programs
  {
    sourceId: 'eda_planning_2024',
    sourceName: 'eda_gov',
    title: 'EDA Planning Program',
    sponsor: 'Economic Development Administration',
    summary:
      'Support for economic development planning to build local and regional capacity.',
    description:
      'The Planning program helps support local organizations to conduct planning, data gathering, and feasibility studies to design effective economic development strategies.',
    categories: ['community_development', 'business'],
    eligibleEntityTypes: ['government', 'nonprofit', 'tribal'],
    eligibleStates: ['national'],
    eligibleIndustries: ['community_development', 'government'],
    amountMin: 50000,
    amountMax: 400000,
    amountText: 'Varies; typically $50,000-$400,000',
    deadlineType: 'rolling',
    deadlineDate: null,
    url: 'https://www.eda.gov/funding/programs/planning',
    fundingType: 'grant',
    purposeTags: ['planning', 'economic development', 'feasibility studies'],
    isNational: true,
    samRequired: true,
    qualityScore: 85,
  },

  // HUD Programs
  {
    sourceId: 'hud_cdbg_2024',
    sourceName: 'hud_gov',
    title: 'Community Development Block Grant (CDBG)',
    sponsor: 'Department of Housing and Urban Development',
    summary:
      'Flexible funding to address community development needs, primarily for low-income communities.',
    description:
      'The CDBG program provides annual grants to states, cities, and counties to develop viable urban communities by providing decent housing and a suitable living environment, and by expanding economic opportunities, principally for low- and moderate-income persons.',
    categories: ['community_development', 'housing'],
    eligibleEntityTypes: ['government', 'nonprofit'],
    eligibleStates: ['national'],
    eligibleIndustries: ['housing', 'community_development', 'social_services'],
    amountMin: 100000,
    amountMax: 10000000,
    amountText: 'Formula-based allocation',
    deadlineType: 'fixed',
    deadlineDate: new Date('2025-05-15'),
    url: 'https://www.hud.gov/program_offices/comm_planning/cdbg',
    fundingType: 'grant',
    purposeTags: ['housing', 'infrastructure', 'economic development', 'public services'],
    isNational: true,
    samRequired: true,
    qualityScore: 90,
  },
];

// ==================== SEEDING FUNCTIONS ====================

function generateFingerprint(grant: SeedGrant): string {
  const normalizedTitle = grant.title.toLowerCase().replace(/[^a-z0-9]/g, '');
  const normalizedSponsor = grant.sponsor.toLowerCase().replace(/[^a-z0-9]/g, '');

  const fingerprintSource = [
    normalizedTitle.substring(0, 50),
    normalizedSponsor.substring(0, 30),
    grant.amountMin || '',
    grant.amountMax || '',
    grant.deadlineDate?.toISOString().split('T')[0] || '',
  ].join('|');

  return crypto.createHash('sha256').update(fingerprintSource).digest('hex').substring(0, 32);
}

function generateContentHash(grant: SeedGrant): string {
  return crypto
    .createHash('sha256')
    .update(grant.description + grant.title)
    .digest('hex')
    .substring(0, 32);
}

async function seedGrants() {
  console.log('Starting grant seeding...');
  console.log(`Total grants to seed: ${SEED_GRANTS.length}`);

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const seedGrant of SEED_GRANTS) {
    try {
      const fingerprint = generateFingerprint(seedGrant);

      // Check if grant already exists
      const existing = await prisma.grant.findFirst({
        where: {
          OR: [
            { hashFingerprint: fingerprint },
            { sourceId: seedGrant.sourceId, sourceName: seedGrant.sourceName },
          ],
        },
      });

      const grantData = {
        sourceId: seedGrant.sourceId,
        sourceName: seedGrant.sourceName,
        title: seedGrant.title,
        sponsor: seedGrant.sponsor,
        summary: seedGrant.summary,
        description: seedGrant.description,
        categories: JSON.stringify(seedGrant.categories),
        eligibility: JSON.stringify({
          tags: seedGrant.eligibleEntityTypes,
          industries: seedGrant.eligibleIndustries,
        }),
        locations: JSON.stringify(
          seedGrant.eligibleStates.map((s) => ({
            state: s,
            country: 'US',
          }))
        ),
        amountMin: seedGrant.amountMin,
        amountMax: seedGrant.amountMax,
        amountText: seedGrant.amountText,
        deadlineType: seedGrant.deadlineType,
        deadlineDate: seedGrant.deadlineDate,
        url: seedGrant.url,
        status: 'open',
        hashFingerprint: fingerprint,
        fundingType: seedGrant.fundingType,
        purposeTags: JSON.stringify(seedGrant.purposeTags),
        eligibleEntityTypes: JSON.stringify(seedGrant.eligibleEntityTypes),
        eligibleStates: JSON.stringify(seedGrant.eligibleStates),
        eligibleIndustries: JSON.stringify(seedGrant.eligibleIndustries),
        isNational: seedGrant.isNational,
        isStateSpecific: !seedGrant.isNational,
        samRegistrationRequired: seedGrant.samRequired,
        qualityScore: seedGrant.qualityScore,
        linkStatus: 'active',
        lastVerifiedAt: new Date(),
        contentHash: generateContentHash(seedGrant),
      };

      if (existing) {
        // Update existing grant
        await prisma.grant.update({
          where: { id: existing.id },
          data: {
            ...grantData,
            lastSeenAt: new Date(),
          },
        });
        updated++;
        console.log(`  Updated: ${seedGrant.title}`);
      } else {
        // Create new grant
        await prisma.grant.create({
          data: grantData,
        });
        created++;
        console.log(`  Created: ${seedGrant.title}`);
      }
    } catch (error) {
      console.error(`  Error seeding "${seedGrant.title}":`, error);
      skipped++;
    }
  }

  console.log('\nSeeding complete!');
  console.log(`  Created: ${created}`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Skipped: ${skipped}`);

  // Update ingestion source record
  await prisma.ingestionSource.upsert({
    where: { name: 'seed_data' },
    create: {
      name: 'seed_data',
      displayName: 'Seed Data (Manual)',
      type: 'bulk',
      config: JSON.stringify({ seededAt: new Date().toISOString() }),
      enabled: false,
      lastRunAt: new Date(),
      lastStatus: 'success',
      grantsCount: created + updated,
    },
    update: {
      lastRunAt: new Date(),
      lastStatus: 'success',
      grantsCount: {
        increment: created,
      },
    },
  });

  // Create ingestion run record
  await prisma.ingestionRun.create({
    data: {
      sourceName: 'seed_data',
      status: 'success',
      grantsFound: SEED_GRANTS.length,
      grantsNew: created,
      grantsUpdated: updated,
      startedAt: new Date(),
      completedAt: new Date(),
    },
  });
}

// ==================== EXPORTS ====================

export { seedGrants, SEED_GRANTS };

// Run if called directly
if (require.main === module) {
  seedGrants()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
