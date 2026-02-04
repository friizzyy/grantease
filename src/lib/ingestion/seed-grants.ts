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

  // ==================== ADDITIONAL GRANTS - SMALL BUSINESS ====================

  {
    sourceId: 'sba_microloan_2024',
    sourceName: 'sba_gov',
    title: 'SBA Microloan Program',
    sponsor: 'Small Business Administration (SBA)',
    summary: 'Small loans up to $50,000 for startups and small businesses needing working capital.',
    description: 'The Microloan program provides loans up to $50,000 to help small businesses and certain not-for-profit childcare centers start up and expand. The average microloan is about $13,000.',
    categories: ['business', 'finance'],
    eligibleEntityTypes: ['small_business', 'for_profit', 'nonprofit'],
    eligibleStates: ['national'],
    eligibleIndustries: ['business', 'retail', 'services', 'manufacturing'],
    amountMin: 500,
    amountMax: 50000,
    amountText: 'Up to $50,000',
    deadlineType: 'rolling',
    deadlineDate: null,
    url: 'https://www.sba.gov/funding-programs/loans/microloans',
    fundingType: 'loan',
    purposeTags: ['working capital', 'inventory', 'equipment', 'startup costs'],
    isNational: true,
    samRequired: false,
    qualityScore: 88,
  },
  {
    sourceId: 'sba_disaster_loan_2024',
    sourceName: 'sba_gov',
    title: 'SBA Economic Injury Disaster Loans (EIDL)',
    sponsor: 'Small Business Administration (SBA)',
    summary: 'Low-interest loans for businesses affected by declared disasters.',
    description: 'Economic Injury Disaster Loans provide vital economic support to small businesses to help overcome the temporary loss of revenue they are experiencing.',
    categories: ['business', 'emergency'],
    eligibleEntityTypes: ['small_business', 'for_profit', 'nonprofit'],
    eligibleStates: ['national'],
    eligibleIndustries: ['business', 'retail', 'services', 'manufacturing', 'agriculture'],
    amountMin: 1000,
    amountMax: 2000000,
    amountText: 'Up to $2 million',
    deadlineType: 'rolling',
    deadlineDate: null,
    url: 'https://www.sba.gov/funding-programs/disaster-assistance',
    fundingType: 'loan',
    purposeTags: ['disaster recovery', 'working capital', 'business continuity'],
    isNational: true,
    samRequired: false,
    qualityScore: 90,
  },
  {
    sourceId: 'amber_grant_2024',
    sourceName: 'private_grants',
    title: 'Amber Grant for Women',
    sponsor: 'WomensNet',
    summary: 'Monthly grants for women-owned businesses to help fund their dreams.',
    description: 'The Amber Grant is awarded monthly to women-owned businesses. One grant recipient each month receives $10,000, and at the end of the year, one of those monthly winners receives an additional $25,000.',
    categories: ['business', 'entrepreneurship'],
    eligibleEntityTypes: ['small_business', 'for_profit'],
    eligibleStates: ['national'],
    eligibleIndustries: ['business', 'retail', 'services', 'technology', 'manufacturing'],
    amountMin: 10000,
    amountMax: 25000,
    amountText: '$10,000 monthly; $25,000 annual bonus',
    deadlineType: 'rolling',
    deadlineDate: null,
    url: 'https://ambergrantsforwomen.com',
    fundingType: 'grant',
    purposeTags: ['women-owned', 'startup', 'business growth'],
    isNational: true,
    samRequired: false,
    qualityScore: 82,
  },
  {
    sourceId: 'fedex_grant_2024',
    sourceName: 'corporate_grants',
    title: 'FedEx Small Business Grant Contest',
    sponsor: 'FedEx',
    summary: 'Annual grant contest awarding funding to innovative small businesses.',
    description: 'The FedEx Small Business Grant Contest awards grants to small businesses across various industries. Winners receive grants ranging from $15,000 to $50,000.',
    categories: ['business', 'entrepreneurship'],
    eligibleEntityTypes: ['small_business', 'for_profit'],
    eligibleStates: ['national'],
    eligibleIndustries: ['business', 'retail', 'services', 'technology', 'manufacturing'],
    amountMin: 15000,
    amountMax: 50000,
    amountText: '$15,000 - $50,000',
    deadlineType: 'fixed',
    deadlineDate: new Date('2025-06-01'),
    url: 'https://www.fedex.com/en-us/small-business/grant-contest.html',
    fundingType: 'grant',
    purposeTags: ['business growth', 'innovation', 'expansion'],
    isNational: true,
    samRequired: false,
    qualityScore: 85,
  },
  {
    sourceId: 'nav_grant_2024',
    sourceName: 'private_grants',
    title: 'Nav Small Business Grant',
    sponsor: 'Nav',
    summary: 'Quarterly grants for small businesses to fuel growth and success.',
    description: 'Nav awards quarterly grants to small businesses. The grants are designed to help entrepreneurs overcome financial barriers and grow their businesses.',
    categories: ['business', 'finance'],
    eligibleEntityTypes: ['small_business', 'for_profit'],
    eligibleStates: ['national'],
    eligibleIndustries: ['business', 'retail', 'services', 'technology'],
    amountMin: 10000,
    amountMax: 10000,
    amountText: '$10,000',
    deadlineType: 'fixed',
    deadlineDate: new Date('2025-03-31'),
    url: 'https://www.nav.com/small-business-grant',
    fundingType: 'grant',
    purposeTags: ['business growth', 'working capital'],
    isNational: true,
    samRequired: false,
    qualityScore: 80,
  },

  // ==================== TECHNOLOGY & INNOVATION ====================

  {
    sourceId: 'nsf_seed_fund_2024',
    sourceName: 'nsf_gov',
    title: 'NSF America\'s Seed Fund (SBIR/STTR)',
    sponsor: 'National Science Foundation',
    summary: 'Funding for startups and small businesses developing deep technology innovations.',
    description: 'America\'s Seed Fund powered by NSF awards over $200 million annually to startups and small businesses, transforming scientific discovery into products and services with commercial and societal impact.',
    categories: ['technology', 'research', 'innovation'],
    eligibleEntityTypes: ['small_business'],
    eligibleStates: ['national'],
    eligibleIndustries: ['technology', 'research', 'manufacturing', 'health', 'energy'],
    amountMin: 256000,
    amountMax: 1500000,
    amountText: 'Phase I: $256,000; Phase II: Up to $1.5M',
    deadlineType: 'fixed',
    deadlineDate: new Date('2025-06-05'),
    url: 'https://seedfund.nsf.gov',
    fundingType: 'grant',
    purposeTags: ['R&D', 'deep tech', 'commercialization', 'prototyping'],
    isNational: true,
    samRequired: true,
    qualityScore: 95,
  },
  {
    sourceId: 'arpa_e_2024',
    sourceName: 'doe_arpa',
    title: 'ARPA-E Energy Innovation Grants',
    sponsor: 'Advanced Research Projects Agency - Energy',
    summary: 'High-risk, high-reward funding for transformational energy technologies.',
    description: 'ARPA-E advances high-potential, high-impact energy technologies that are too early for private-sector investment. Projects must be transformational rather than incremental.',
    categories: ['energy', 'technology', 'research'],
    eligibleEntityTypes: ['small_business', 'for_profit', 'nonprofit', 'educational'],
    eligibleStates: ['national'],
    eligibleIndustries: ['energy', 'technology', 'research', 'manufacturing'],
    amountMin: 250000,
    amountMax: 10000000,
    amountText: 'Varies; typically $250K - $10M',
    deadlineType: 'fixed',
    deadlineDate: new Date('2025-04-15'),
    url: 'https://arpa-e.energy.gov',
    fundingType: 'grant',
    purposeTags: ['clean energy', 'innovation', 'R&D', 'breakthrough technology'],
    isNational: true,
    samRequired: true,
    qualityScore: 92,
  },
  {
    sourceId: 'nist_mep_2024',
    sourceName: 'nist_gov',
    title: 'NIST Manufacturing Extension Partnership',
    sponsor: 'National Institute of Standards and Technology',
    summary: 'Support for small and medium manufacturers to improve competitiveness.',
    description: 'The MEP National Network provides U.S. manufacturers with access to resources to help them grow and become more competitive.',
    categories: ['manufacturing', 'technology', 'business'],
    eligibleEntityTypes: ['small_business', 'for_profit'],
    eligibleStates: ['national'],
    eligibleIndustries: ['manufacturing', 'technology'],
    amountMin: 10000,
    amountMax: 500000,
    amountText: 'Varies by program',
    deadlineType: 'rolling',
    deadlineDate: null,
    url: 'https://www.nist.gov/mep',
    fundingType: 'grant',
    purposeTags: ['manufacturing', 'process improvement', 'technology adoption'],
    isNational: true,
    samRequired: false,
    qualityScore: 85,
  },

  // ==================== AGRICULTURE & FOOD ====================

  {
    sourceId: 'usda_specialty_crop_2024',
    sourceName: 'usda_grants',
    title: 'USDA Specialty Crop Block Grant Program',
    sponsor: 'USDA Agricultural Marketing Service',
    summary: 'Grants to enhance the competitiveness of specialty crops.',
    description: 'The Specialty Crop Block Grant Program provides grants to state departments of agriculture to enhance the competitiveness of specialty crops (fruits, vegetables, tree nuts, dried fruits, horticulture, and nursery crops).',
    categories: ['agriculture', 'business'],
    eligibleEntityTypes: ['small_business', 'individual', 'nonprofit', 'government'],
    eligibleStates: ['national'],
    eligibleIndustries: ['agriculture', 'food_production'],
    amountMin: 10000,
    amountMax: 500000,
    amountText: 'Varies by state',
    deadlineType: 'fixed',
    deadlineDate: new Date('2025-05-01'),
    url: 'https://www.ams.usda.gov/services/grants/scbgp',
    fundingType: 'grant',
    purposeTags: ['specialty crops', 'marketing', 'research', 'food safety'],
    isNational: true,
    samRequired: true,
    qualityScore: 88,
  },
  {
    sourceId: 'usda_organic_cert_2024',
    sourceName: 'usda_grants',
    title: 'USDA Organic Certification Cost Share Program',
    sponsor: 'USDA Farm Service Agency',
    summary: 'Reimburses organic producers for certification costs.',
    description: 'The Organic Certification Cost Share Program provides cost share assistance to producers and handlers of agricultural products for the costs of obtaining or maintaining organic certification.',
    categories: ['agriculture'],
    eligibleEntityTypes: ['small_business', 'individual'],
    eligibleStates: ['national'],
    eligibleIndustries: ['agriculture', 'food_production'],
    amountMin: 250,
    amountMax: 750,
    amountText: 'Up to 50% of costs, max $750 per scope',
    deadlineType: 'rolling',
    deadlineDate: null,
    url: 'https://www.fsa.usda.gov/programs-and-services/occsp/index',
    fundingType: 'grant',
    purposeTags: ['organic certification', 'agriculture', 'food production'],
    isNational: true,
    samRequired: false,
    qualityScore: 82,
  },
  {
    sourceId: 'usda_beginning_farmer_2024',
    sourceName: 'usda_grants',
    title: 'Beginning Farmer and Rancher Development Program',
    sponsor: 'USDA National Institute of Food and Agriculture',
    summary: 'Training and education for beginning farmers and ranchers.',
    description: 'The Beginning Farmer and Rancher Development Program provides grants to organizations for education, mentoring, and technical assistance initiatives for beginning farmers and ranchers.',
    categories: ['agriculture', 'education'],
    eligibleEntityTypes: ['small_business', 'individual', 'nonprofit', 'educational'],
    eligibleStates: ['national'],
    eligibleIndustries: ['agriculture', 'education'],
    amountMin: 100000,
    amountMax: 750000,
    amountText: '$100,000 - $750,000 over 3 years',
    deadlineType: 'fixed',
    deadlineDate: new Date('2025-04-20'),
    url: 'https://nifa.usda.gov/funding-opportunity/beginning-farmer-and-rancher-development-program-bfrdp',
    fundingType: 'grant',
    purposeTags: ['farmer training', 'education', 'mentorship'],
    isNational: true,
    samRequired: true,
    qualityScore: 85,
  },
  {
    sourceId: 'usda_farmers_market_2024',
    sourceName: 'usda_grants',
    title: 'Farmers Market Promotion Program (FMPP)',
    sponsor: 'USDA Agricultural Marketing Service',
    summary: 'Supports direct-to-consumer markets for agricultural products.',
    description: 'The Farmers Market Promotion Program funds projects that develop, coordinate, and expand direct producer-to-consumer markets.',
    categories: ['agriculture', 'business', 'community_development'],
    eligibleEntityTypes: ['small_business', 'nonprofit', 'government'],
    eligibleStates: ['national'],
    eligibleIndustries: ['agriculture', 'food_production', 'retail'],
    amountMin: 50000,
    amountMax: 500000,
    amountText: '$50,000 - $500,000',
    deadlineType: 'fixed',
    deadlineDate: new Date('2025-05-15'),
    url: 'https://www.ams.usda.gov/services/grants/fmpp',
    fundingType: 'grant',
    purposeTags: ['farmers markets', 'direct sales', 'local food'],
    isNational: true,
    samRequired: true,
    qualityScore: 85,
  },

  // ==================== HEALTHCARE & LIFE SCIENCES ====================

  {
    sourceId: 'nih_sbir_2024',
    sourceName: 'nih_gov',
    title: 'NIH SBIR/STTR Program',
    sponsor: 'National Institutes of Health',
    summary: 'Funding for small businesses developing health-related innovations.',
    description: 'The NIH SBIR/STTR programs support small businesses to undertake scientific research and development that has the potential for commercialization.',
    categories: ['health', 'research', 'technology'],
    eligibleEntityTypes: ['small_business'],
    eligibleStates: ['national'],
    eligibleIndustries: ['health', 'research', 'technology', 'manufacturing'],
    amountMin: 275000,
    amountMax: 2000000,
    amountText: 'Phase I: $275K; Phase II: Up to $2M',
    deadlineType: 'fixed',
    deadlineDate: new Date('2025-04-05'),
    url: 'https://sbir.nih.gov',
    fundingType: 'grant',
    purposeTags: ['health R&D', 'medical devices', 'therapeutics', 'diagnostics'],
    isNational: true,
    samRequired: true,
    qualityScore: 95,
  },
  {
    sourceId: 'hrsa_community_health_2024',
    sourceName: 'hrsa_gov',
    title: 'HRSA Community Health Center Grants',
    sponsor: 'Health Resources and Services Administration',
    summary: 'Funding for community health centers serving underserved populations.',
    description: 'HRSA supports community health centers that provide comprehensive primary care services to medically underserved areas and populations.',
    categories: ['health', 'community_development'],
    eligibleEntityTypes: ['nonprofit', 'government'],
    eligibleStates: ['national'],
    eligibleIndustries: ['health', 'social_services'],
    amountMin: 100000,
    amountMax: 5000000,
    amountText: 'Varies by program',
    deadlineType: 'fixed',
    deadlineDate: new Date('2025-06-01'),
    url: 'https://www.hrsa.gov/grants',
    fundingType: 'grant',
    purposeTags: ['community health', 'primary care', 'underserved populations'],
    isNational: true,
    samRequired: true,
    qualityScore: 88,
  },

  // ==================== CLEAN ENERGY & ENVIRONMENT ====================

  {
    sourceId: 'doe_loan_guarantee_2024',
    sourceName: 'doe_eere',
    title: 'DOE Loan Programs Office - Clean Energy Projects',
    sponsor: 'Department of Energy',
    summary: 'Loan guarantees for innovative clean energy projects.',
    description: 'The Loan Programs Office provides loan guarantees and direct loans to support innovative clean energy projects, advanced technology vehicle manufacturing, and tribal energy development.',
    categories: ['energy', 'environment', 'technology'],
    eligibleEntityTypes: ['small_business', 'for_profit', 'nonprofit'],
    eligibleStates: ['national'],
    eligibleIndustries: ['energy', 'manufacturing', 'technology'],
    amountMin: 10000000,
    amountMax: 500000000,
    amountText: '$10M - $500M+',
    deadlineType: 'rolling',
    deadlineDate: null,
    url: 'https://www.energy.gov/lpo',
    fundingType: 'loan',
    purposeTags: ['clean energy', 'manufacturing', 'infrastructure'],
    isNational: true,
    samRequired: true,
    qualityScore: 90,
  },
  {
    sourceId: 'epa_brownfields_2024',
    sourceName: 'epa_gov',
    title: 'EPA Brownfields Grants',
    sponsor: 'Environmental Protection Agency',
    summary: 'Grants to assess, clean up, and redevelop contaminated properties.',
    description: 'EPA Brownfields grants empower states, communities, and other stakeholders to work together to assess, safely clean up, and sustainably reuse contaminated properties.',
    categories: ['environment', 'community_development'],
    eligibleEntityTypes: ['government', 'nonprofit'],
    eligibleStates: ['national'],
    eligibleIndustries: ['environment', 'community_development', 'real_estate'],
    amountMin: 200000,
    amountMax: 5000000,
    amountText: '$200,000 - $5,000,000',
    deadlineType: 'fixed',
    deadlineDate: new Date('2025-05-01'),
    url: 'https://www.epa.gov/brownfields/types-brownfields-grant-funding',
    fundingType: 'grant',
    purposeTags: ['environmental cleanup', 'redevelopment', 'community revitalization'],
    isNational: true,
    samRequired: true,
    qualityScore: 88,
  },
  {
    sourceId: 'usda_rural_biz_2024',
    sourceName: 'usda_grants',
    title: 'USDA Rural Business Development Grants',
    sponsor: 'USDA Rural Development',
    summary: 'Support for small businesses and microenterprises in rural areas.',
    description: 'Rural Business Development Grants provide technical assistance and training for small rural businesses.',
    categories: ['business', 'community_development'],
    eligibleEntityTypes: ['small_business', 'nonprofit', 'government'],
    eligibleStates: ['national'],
    eligibleIndustries: ['business', 'manufacturing', 'services', 'agriculture'],
    amountMin: 10000,
    amountMax: 500000,
    amountText: 'Up to $500,000',
    deadlineType: 'rolling',
    deadlineDate: null,
    url: 'https://www.rd.usda.gov/programs-services/business-programs/rural-business-development-grants',
    fundingType: 'grant',
    purposeTags: ['rural business', 'training', 'economic development'],
    isNational: true,
    samRequired: true,
    qualityScore: 85,
  },

  // ==================== EDUCATION & WORKFORCE ====================

  {
    sourceId: 'dol_apprenticeship_2024',
    sourceName: 'dol_gov',
    title: 'DOL Registered Apprenticeship Program',
    sponsor: 'Department of Labor',
    summary: 'Funding to develop and expand registered apprenticeship programs.',
    description: 'The Department of Labor provides grants to expand registered apprenticeships in high-growth industries.',
    categories: ['education', 'workforce'],
    eligibleEntityTypes: ['small_business', 'nonprofit', 'educational', 'government'],
    eligibleStates: ['national'],
    eligibleIndustries: ['education', 'manufacturing', 'technology', 'health'],
    amountMin: 100000,
    amountMax: 5000000,
    amountText: 'Varies by competition',
    deadlineType: 'fixed',
    deadlineDate: new Date('2025-07-01'),
    url: 'https://www.apprenticeship.gov/investments-tax-credits-and-tuition-support/grants',
    fundingType: 'grant',
    purposeTags: ['apprenticeships', 'workforce development', 'training'],
    isNational: true,
    samRequired: true,
    qualityScore: 85,
  },

  // ==================== STATE-SPECIFIC GRANTS ====================

  {
    sourceId: 'tx_enterprise_fund_2024',
    sourceName: 'texas_grants',
    title: 'Texas Enterprise Fund',
    sponsor: 'Office of the Texas Governor',
    summary: 'Deal-closing fund for businesses creating jobs in Texas.',
    description: 'The Texas Enterprise Fund is a deal-closing fund that helps attract businesses that are considering Texas and at least one other competitive state or country.',
    categories: ['business', 'economic_development'],
    eligibleEntityTypes: ['small_business', 'for_profit'],
    eligibleStates: ['TX'],
    eligibleIndustries: ['business', 'manufacturing', 'technology'],
    amountMin: 100000,
    amountMax: 50000000,
    amountText: 'Varies based on job creation',
    deadlineType: 'rolling',
    deadlineDate: null,
    url: 'https://gov.texas.gov/business/page/texas-enterprise-fund',
    fundingType: 'grant',
    purposeTags: ['job creation', 'economic development', 'expansion'],
    isNational: false,
    samRequired: false,
    qualityScore: 85,
  },
  {
    sourceId: 'fl_startup_fund_2024',
    sourceName: 'florida_grants',
    title: 'Florida Startup Fund',
    sponsor: 'Enterprise Florida',
    summary: 'Funding for Florida-based startups and emerging companies.',
    description: 'Enterprise Florida provides funding and support for startups and emerging companies headquartered in Florida.',
    categories: ['business', 'technology'],
    eligibleEntityTypes: ['small_business', 'for_profit'],
    eligibleStates: ['FL'],
    eligibleIndustries: ['technology', 'business', 'manufacturing'],
    amountMin: 50000,
    amountMax: 500000,
    amountText: '$50,000 - $500,000',
    deadlineType: 'rolling',
    deadlineDate: null,
    url: 'https://www.enterpriseflorida.com',
    fundingType: 'grant',
    purposeTags: ['startup', 'innovation', 'job creation'],
    isNational: false,
    samRequired: false,
    qualityScore: 82,
  },
  {
    sourceId: 'ma_mip_2024',
    sourceName: 'massachusetts_grants',
    title: 'Massachusetts Innovation Pathways',
    sponsor: 'Massachusetts Technology Collaborative',
    summary: 'Support for technology companies in Massachusetts.',
    description: 'The Massachusetts Technology Collaborative supports innovative technology companies through various funding programs.',
    categories: ['technology', 'research'],
    eligibleEntityTypes: ['small_business', 'for_profit'],
    eligibleStates: ['MA'],
    eligibleIndustries: ['technology', 'research', 'manufacturing'],
    amountMin: 25000,
    amountMax: 250000,
    amountText: '$25,000 - $250,000',
    deadlineType: 'rolling',
    deadlineDate: null,
    url: 'https://masstech.org',
    fundingType: 'grant',
    purposeTags: ['innovation', 'technology', 'R&D'],
    isNational: false,
    samRequired: false,
    qualityScore: 83,
  },
  {
    sourceId: 'wa_clean_energy_2024',
    sourceName: 'washington_grants',
    title: 'Washington Clean Energy Fund',
    sponsor: 'Washington State Department of Commerce',
    summary: 'Funding for clean energy projects in Washington State.',
    description: 'The Clean Energy Fund accelerates the development of clean energy technologies and projects in Washington State.',
    categories: ['energy', 'environment'],
    eligibleEntityTypes: ['small_business', 'for_profit', 'nonprofit', 'government'],
    eligibleStates: ['WA'],
    eligibleIndustries: ['energy', 'technology', 'manufacturing'],
    amountMin: 50000,
    amountMax: 2000000,
    amountText: '$50,000 - $2,000,000',
    deadlineType: 'fixed',
    deadlineDate: new Date('2025-04-30'),
    url: 'https://www.commerce.wa.gov/growing-the-economy/energy/clean-energy-fund/',
    fundingType: 'grant',
    purposeTags: ['clean energy', 'sustainability', 'innovation'],
    isNational: false,
    samRequired: false,
    qualityScore: 85,
  },
  {
    sourceId: 'co_advanced_industries_2024',
    sourceName: 'colorado_grants',
    title: 'Colorado Advanced Industries Accelerator Programs',
    sponsor: 'Colorado Office of Economic Development',
    summary: 'Grants for advanced industries including aerospace, bioscience, and technology.',
    description: 'Colorado\'s Advanced Industries Accelerator Programs provide grants to companies in advanced industries to accelerate commercialization and growth.',
    categories: ['technology', 'research', 'manufacturing'],
    eligibleEntityTypes: ['small_business', 'for_profit'],
    eligibleStates: ['CO'],
    eligibleIndustries: ['technology', 'manufacturing', 'health', 'energy'],
    amountMin: 50000,
    amountMax: 250000,
    amountText: 'Up to $250,000',
    deadlineType: 'fixed',
    deadlineDate: new Date('2025-05-15'),
    url: 'https://oedit.colorado.gov/advanced-industries',
    fundingType: 'grant',
    purposeTags: ['commercialization', 'proof of concept', 'R&D'],
    isNational: false,
    samRequired: false,
    qualityScore: 85,
  },
  {
    sourceId: 'il_small_biz_2024',
    sourceName: 'illinois_grants',
    title: 'Illinois Small Business Emergency Loan Fund',
    sponsor: 'Illinois Department of Commerce',
    summary: 'Low-interest loans for Illinois small businesses.',
    description: 'The Illinois Small Business Emergency Loan Fund provides low-interest loans to small businesses facing economic challenges.',
    categories: ['business', 'finance'],
    eligibleEntityTypes: ['small_business', 'for_profit'],
    eligibleStates: ['IL'],
    eligibleIndustries: ['business', 'retail', 'services', 'manufacturing'],
    amountMin: 5000,
    amountMax: 50000,
    amountText: '$5,000 - $50,000',
    deadlineType: 'rolling',
    deadlineDate: null,
    url: 'https://www2.illinois.gov/dceo/SmallBizAssistance',
    fundingType: 'loan',
    purposeTags: ['working capital', 'emergency funding', 'business continuity'],
    isNational: false,
    samRequired: false,
    qualityScore: 80,
  },
  {
    sourceId: 'ga_ongeorgia_2024',
    sourceName: 'georgia_grants',
    title: 'Georgia OneGeorgia EDGE Fund',
    sponsor: 'Georgia Department of Community Affairs',
    summary: 'Economic development funding for Georgia businesses.',
    description: 'The EDGE Fund provides financial assistance to projects that promote economic development and job creation in Georgia.',
    categories: ['business', 'economic_development'],
    eligibleEntityTypes: ['small_business', 'for_profit'],
    eligibleStates: ['GA'],
    eligibleIndustries: ['business', 'manufacturing', 'technology'],
    amountMin: 25000,
    amountMax: 500000,
    amountText: '$25,000 - $500,000',
    deadlineType: 'rolling',
    deadlineDate: null,
    url: 'https://www.dca.ga.gov/community-economic-development/funding-programs/onegeorgia',
    fundingType: 'grant',
    purposeTags: ['job creation', 'economic development', 'expansion'],
    isNational: false,
    samRequired: false,
    qualityScore: 83,
  },
  {
    sourceId: 'pa_ben_franklin_2024',
    sourceName: 'pennsylvania_grants',
    title: 'Ben Franklin Technology Partners',
    sponsor: 'Pennsylvania Department of Community & Economic Development',
    summary: 'Technology investment and business support in Pennsylvania.',
    description: 'Ben Franklin Technology Partners invests in early-stage technology companies and provides business support services.',
    categories: ['technology', 'business'],
    eligibleEntityTypes: ['small_business', 'for_profit'],
    eligibleStates: ['PA'],
    eligibleIndustries: ['technology', 'manufacturing', 'health'],
    amountMin: 25000,
    amountMax: 500000,
    amountText: '$25,000 - $500,000',
    deadlineType: 'rolling',
    deadlineDate: null,
    url: 'https://benfranklin.org',
    fundingType: 'investment',
    purposeTags: ['startup', 'technology', 'growth capital'],
    isNational: false,
    samRequired: false,
    qualityScore: 85,
  },
  {
    sourceId: 'oh_third_frontier_2024',
    sourceName: 'ohio_grants',
    title: 'Ohio Third Frontier Program',
    sponsor: 'Ohio Development Services Agency',
    summary: 'Technology-based economic development funding in Ohio.',
    description: 'Third Frontier provides funding to accelerate the growth of technology-based companies and research initiatives in Ohio.',
    categories: ['technology', 'research'],
    eligibleEntityTypes: ['small_business', 'for_profit', 'educational'],
    eligibleStates: ['OH'],
    eligibleIndustries: ['technology', 'research', 'manufacturing'],
    amountMin: 100000,
    amountMax: 2000000,
    amountText: '$100,000 - $2,000,000',
    deadlineType: 'fixed',
    deadlineDate: new Date('2025-06-15'),
    url: 'https://www.thirdfrontier.com',
    fundingType: 'grant',
    purposeTags: ['technology', 'innovation', 'R&D'],
    isNational: false,
    samRequired: false,
    qualityScore: 87,
  },
  {
    sourceId: 'nc_jdig_2024',
    sourceName: 'north_carolina_grants',
    title: 'NC Job Development Investment Grant (JDIG)',
    sponsor: 'North Carolina Department of Commerce',
    summary: 'Performance-based incentive for job-creating projects in NC.',
    description: 'JDIG provides cash grants to new and expanding businesses to help offset the cost of locating or expanding a facility in North Carolina.',
    categories: ['business', 'economic_development'],
    eligibleEntityTypes: ['small_business', 'for_profit'],
    eligibleStates: ['NC'],
    eligibleIndustries: ['business', 'manufacturing', 'technology'],
    amountMin: 50000,
    amountMax: 10000000,
    amountText: 'Based on job creation metrics',
    deadlineType: 'rolling',
    deadlineDate: null,
    url: 'https://www.nccommerce.com/grants-incentives/job-development-investment-grant',
    fundingType: 'grant',
    purposeTags: ['job creation', 'expansion', 'economic development'],
    isNational: false,
    samRequired: false,
    qualityScore: 85,
  },
  {
    sourceId: 'az_commerce_2024',
    sourceName: 'arizona_grants',
    title: 'Arizona Commerce Authority Innovation Accelerator',
    sponsor: 'Arizona Commerce Authority',
    summary: 'Funding for innovative Arizona businesses.',
    description: 'The Innovation Accelerator Fund provides capital to Arizona startups and small businesses developing innovative products or services.',
    categories: ['technology', 'business'],
    eligibleEntityTypes: ['small_business', 'for_profit'],
    eligibleStates: ['AZ'],
    eligibleIndustries: ['technology', 'manufacturing', 'health'],
    amountMin: 50000,
    amountMax: 350000,
    amountText: '$50,000 - $350,000',
    deadlineType: 'rolling',
    deadlineDate: null,
    url: 'https://www.azcommerce.com',
    fundingType: 'grant',
    purposeTags: ['innovation', 'startup', 'commercialization'],
    isNational: false,
    samRequired: false,
    qualityScore: 83,
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
