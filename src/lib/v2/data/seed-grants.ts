/**
 * GRANTS V2 - SEED DATASET (SMALL FARM FOCUSED)
 * ==============================================
 * Curated agriculture grants for small farms, rural landowners, and family operations.
 *
 * ELIGIBILITY RULES:
 * - smallFarmFriendly: true = Individual farmers/small ops can realistically apply
 * - institutionOnly: true = NEVER show (universities, large NGOs, municipalities only)
 * - typicalApplicant: 'small_farm' | 'institution' | 'mixed'
 * - eligibilityConfidence: 'high' | 'medium' | 'low'
 *
 * FILTERING RULES:
 * - institutionOnly = true → EXCLUDED from discover
 * - smallFarmFriendly = false → EXCLUDED from discover
 * - eligibilityConfidence = 'low' → deprioritized heavily
 * - Only top 15-20 shown after filtering
 */

import { GrantV2 } from '../types';

export const SEED_GRANTS_V2: GrantV2[] = [
  // =============================================================================
  // TIER 1: HIGH-CONFIDENCE SMALL FARM PROGRAMS (USDA/FSA/NRCS)
  // These are the bread-and-butter programs that small farmers actually use
  // =============================================================================

  {
    id: 'usda-eqip-001',
    title: 'Environmental Quality Incentives Program (EQIP)',
    sponsor: 'USDA Natural Resources Conservation Service',
    applyUrl: 'https://www.nrcs.usda.gov/programs-initiatives/eqip-environmental-quality-incentives',
    summaryShort: 'Cost-share for conservation practices: irrigation efficiency, fencing, livestock facilities, soil health, and more.',
    descriptionClean: 'EQIP is one of the most popular USDA programs for small farms. It provides financial and technical assistance to implement conservation practices like high tunnels, irrigation systems, livestock watering facilities, fencing, cover crops, and nutrient management. Beginning farmers can receive up to 90% cost-share. You work with your local NRCS office to develop a plan.',
    geographyScope: 'national',
    statesIncluded: [],
    purposeTags: ['irrigation', 'cattle', 'land_development', 'conservation', 'equipment'],
    applicantTypes: ['individual', 'small_business', 'farm', 'ranch'],
    maxEmployees: 0,
    smallFarmFriendly: true,
    institutionOnly: false,
    typicalApplicant: 'small_farm',
    eligibilityConfidence: 'high',
    fundingMin: 1500,
    fundingMax: 450000,
    fundingDisplay: 'Up to $450,000 (typically $5K-$50K for small farms)',
    deadlineType: 'rolling',
    deadlineDate: null,
    deadlineDisplay: 'Rolling - Contact local NRCS office',
    requirementsBullets: [
      'Must have eligible land (cropland, pasture, rangeland)',
      'Work with local NRCS office to develop conservation plan',
      'Beginning farmers receive priority and higher payment rates',
      'Socially disadvantaged farmers receive advance payments'
    ],
    qualityScore: 98,
    source: 'usda_nrcs',
    lastVerified: '2026-01-15',
  },

  {
    id: 'usda-fsa-microloans-001',
    title: 'FSA Farm Operating Microloans',
    sponsor: 'USDA Farm Service Agency',
    applyUrl: 'https://www.fsa.usda.gov/programs-and-services/farm-loan-programs/microloans/index',
    summaryShort: 'Low-interest loans up to $50,000 for small and beginning farmers - simplified application.',
    descriptionClean: 'FSA Microloans are designed specifically for small and beginning farmers who need smaller amounts of financing. The application is simplified compared to regular FSA loans. Use funds for equipment, livestock, feed, seed, fertilizer, and operating expenses. Great for farmers who can\'t get conventional bank loans.',
    geographyScope: 'national',
    statesIncluded: [],
    purposeTags: ['equipment', 'cattle', 'operating'],
    applicantTypes: ['individual', 'small_business', 'farm', 'ranch'],
    maxEmployees: 0,
    smallFarmFriendly: true,
    institutionOnly: false,
    typicalApplicant: 'small_farm',
    eligibilityConfidence: 'high',
    fundingMin: 1000,
    fundingMax: 50000,
    fundingDisplay: 'Up to $50,000',
    deadlineType: 'rolling',
    deadlineDate: null,
    deadlineDisplay: 'Rolling - Apply anytime at local FSA office',
    requirementsBullets: [
      'Must be U.S. citizen or legal resident',
      'Cannot get credit elsewhere at reasonable terms',
      'Simplified application - less paperwork than regular loans',
      'No minimum farming experience required'
    ],
    qualityScore: 96,
    source: 'usda_fsa',
    lastVerified: '2026-01-15',
  },

  {
    id: 'usda-fsa-ownership-001',
    title: 'FSA Farm Ownership Loans (Direct)',
    sponsor: 'USDA Farm Service Agency',
    applyUrl: 'https://www.fsa.usda.gov/programs-and-services/farm-loan-programs/farm-ownership-loans/index',
    summaryShort: 'Low-interest loans to buy farmland, construct buildings, or make farm improvements.',
    descriptionClean: 'FSA Direct Farm Ownership Loans help farmers and ranchers purchase or expand farms. Funds can be used to buy land, construct or repair buildings, develop farmland, and make soil/water conservation improvements. Beginning farmers get priority. Down payment program available with as little as 5% down.',
    geographyScope: 'national',
    statesIncluded: [],
    purposeTags: ['land_development', 'equipment'],
    applicantTypes: ['individual', 'small_business', 'farm', 'ranch'],
    maxEmployees: 0,
    smallFarmFriendly: true,
    institutionOnly: false,
    typicalApplicant: 'small_farm',
    eligibilityConfidence: 'high',
    fundingMin: 10000,
    fundingMax: 600000,
    fundingDisplay: 'Up to $600,000',
    deadlineType: 'rolling',
    deadlineDate: null,
    deadlineDisplay: 'Rolling - Apply at local FSA office',
    requirementsBullets: [
      'Must be unable to obtain credit elsewhere',
      'Must have 3+ years farm experience (or education equivalent)',
      'Beginning farmers get priority consideration',
      'Down Payment program: only 5% down required'
    ],
    qualityScore: 94,
    source: 'usda_fsa',
    lastVerified: '2026-01-15',
  },

  {
    id: 'usda-csp-001',
    title: 'Conservation Stewardship Program (CSP)',
    sponsor: 'USDA Natural Resources Conservation Service',
    applyUrl: 'https://www.nrcs.usda.gov/programs-initiatives/csp-conservation-stewardship-program',
    summaryShort: 'Annual payments for maintaining and improving conservation practices you already do.',
    descriptionClean: 'CSP rewards farmers who are already good stewards of the land. If you\'re already doing cover crops, rotational grazing, no-till, or other conservation practices, CSP pays you to maintain and enhance them. 5-year contracts with annual payments based on your practices.',
    geographyScope: 'national',
    statesIncluded: [],
    purposeTags: ['conservation', 'land_development', 'cattle'],
    applicantTypes: ['individual', 'small_business', 'farm', 'ranch'],
    maxEmployees: 0,
    smallFarmFriendly: true,
    institutionOnly: false,
    typicalApplicant: 'small_farm',
    eligibilityConfidence: 'high',
    fundingMin: 1500,
    fundingMax: 200000,
    fundingDisplay: 'Annual payments vary by practices',
    deadlineType: 'rolling',
    deadlineDate: null,
    deadlineDisplay: 'Rolling - Contact local NRCS',
    requirementsBullets: [
      'Must already have active conservation practices',
      'Land must be in agricultural production',
      '5-year contract commitment',
      'Must meet stewardship threshold for at least one resource'
    ],
    qualityScore: 90,
    source: 'usda_nrcs',
    lastVerified: '2026-01-15',
  },

  {
    id: 'usda-reap-001',
    title: 'Rural Energy for America Program (REAP)',
    sponsor: 'USDA Rural Development',
    applyUrl: 'https://www.rd.usda.gov/programs-services/energy-programs/rural-energy-america-program-renewable-energy-systems-energy-efficiency-improvement-guaranteed-loans',
    summaryShort: 'Grants up to 50% for solar panels, energy-efficient equipment, and renewable energy systems.',
    descriptionClean: 'REAP helps rural small businesses and agricultural producers invest in renewable energy and energy efficiency. Popular uses include solar panels, grain dryers, irrigation pumps, HVAC systems, and lighting upgrades. Grants cover up to 50% of project costs.',
    geographyScope: 'national',
    statesIncluded: [],
    purposeTags: ['equipment', 'irrigation'],
    applicantTypes: ['individual', 'small_business', 'farm', 'ranch'],
    maxEmployees: 500,
    smallFarmFriendly: true,
    institutionOnly: false,
    typicalApplicant: 'small_farm',
    eligibilityConfidence: 'high',
    fundingMin: 2500,
    fundingMax: 1000000,
    fundingDisplay: '$2,500 - $1,000,000 (grants)',
    deadlineType: 'rolling',
    deadlineDate: null,
    deadlineDisplay: 'Quarterly deadlines - check RD website',
    requirementsBullets: [
      'Must be in eligible rural area (population under 50,000)',
      'Must be agricultural producer or rural small business',
      'Energy audit or assessment may be required',
      'Grants cover up to 50% of project costs'
    ],
    qualityScore: 92,
    source: 'usda_rd',
    lastVerified: '2026-01-15',
  },

  {
    id: 'usda-vapg-001',
    title: 'Value-Added Producer Grants (VAPG)',
    sponsor: 'USDA Rural Development',
    applyUrl: 'https://www.rd.usda.gov/programs-services/business-programs/value-added-producer-grants',
    summaryShort: 'Up to $250,000 for farmers to process, market, or brand their products (cheese, jerky, jams, etc.).',
    descriptionClean: 'VAPG helps farmers add value to their products. If you want to make cheese from your milk, jerky from your beef, jam from your fruit, or create a local brand - this grant can fund planning and working capital. Beginning and socially disadvantaged farmers get priority.',
    geographyScope: 'national',
    statesIncluded: [],
    purposeTags: ['equipment', 'operating'],
    applicantTypes: ['individual', 'small_business', 'farm', 'ranch', 'cooperative'],
    maxEmployees: 0,
    smallFarmFriendly: true,
    institutionOnly: false,
    typicalApplicant: 'small_farm',
    eligibilityConfidence: 'high',
    fundingMin: 10000,
    fundingMax: 250000,
    fundingDisplay: 'Up to $250,000',
    deadlineType: 'fixed',
    deadlineDate: '2026-04-15',
    deadlineDisplay: 'April 2026 (typical)',
    requirementsBullets: [
      'Must be independent agricultural producer',
      'Product must be value-added (processed or marketed differently)',
      '50% matching funds required',
      'Priority for beginning, veteran, and socially disadvantaged farmers'
    ],
    qualityScore: 88,
    source: 'usda_rd',
    lastVerified: '2026-01-15',
  },

  {
    id: 'usda-fsa-elap-001',
    title: 'Emergency Assistance for Livestock (ELAP)',
    sponsor: 'USDA Farm Service Agency',
    applyUrl: 'https://www.fsa.usda.gov/programs-and-services/disaster-assistance-program/emergency-assist-for-livestock-honeybees-background/index',
    summaryShort: 'Emergency payments for livestock losses due to disease, adverse weather, or other disasters.',
    descriptionClean: 'ELAP provides emergency assistance when your livestock, honeybees, or farm-raised fish are affected by disease, adverse weather, or feed/water shortages. If you had to haul water, buy emergency feed, or lost animals, ELAP can help cover costs.',
    geographyScope: 'national',
    statesIncluded: [],
    purposeTags: ['cattle', 'operating'],
    applicantTypes: ['individual', 'small_business', 'farm', 'ranch'],
    maxEmployees: 0,
    smallFarmFriendly: true,
    institutionOnly: false,
    typicalApplicant: 'small_farm',
    eligibilityConfidence: 'high',
    fundingMin: 0,
    fundingMax: 125000,
    fundingDisplay: 'Based on documented losses',
    deadlineType: 'rolling',
    deadlineDate: null,
    deadlineDisplay: 'Within 30 days of loss',
    requirementsBullets: [
      'Must report losses within 30 days',
      'Must have qualifying livestock/honeybee/fish losses',
      'Documentation of losses required',
      'AGI limits apply ($900K)'
    ],
    qualityScore: 86,
    source: 'usda_fsa',
    lastVerified: '2026-01-15',
  },

  {
    id: 'usda-fsa-lfp-001',
    title: 'Livestock Forage Disaster Program (LFP)',
    sponsor: 'USDA Farm Service Agency',
    applyUrl: 'https://www.fsa.usda.gov/programs-and-services/disaster-assistance-program/livestock-forage/index',
    summaryShort: 'Payments for grazing losses when your county is in drought.',
    descriptionClean: 'LFP helps livestock producers who lose grazing due to drought or wildfire. When your county is designated for drought (check the US Drought Monitor), you may qualify for payments based on your livestock numbers and grazing acres.',
    geographyScope: 'national',
    statesIncluded: [],
    purposeTags: ['cattle', 'operating'],
    applicantTypes: ['individual', 'small_business', 'farm', 'ranch'],
    maxEmployees: 0,
    smallFarmFriendly: true,
    institutionOnly: false,
    typicalApplicant: 'small_farm',
    eligibilityConfidence: 'high',
    fundingMin: 0,
    fundingMax: 125000,
    fundingDisplay: 'Based on grazing losses',
    deadlineType: 'rolling',
    deadlineDate: null,
    deadlineDisplay: 'Within 30 days of county drought designation',
    requirementsBullets: [
      'County must be designated for drought (D2 or higher)',
      'Must own or lease eligible grazing land',
      'Covered livestock only (cattle, sheep, goats, etc.)',
      'May need to purchase crop insurance or NAP coverage'
    ],
    qualityScore: 85,
    source: 'usda_fsa',
    lastVerified: '2026-01-15',
  },

  // =============================================================================
  // TIER 1: SARE FARMER/RANCHER GRANTS (HIGHLY ACCESSIBLE)
  // =============================================================================

  {
    id: 'sare-farmer-rancher-001',
    title: 'SARE Farmer/Rancher Grant',
    sponsor: 'Sustainable Agriculture Research & Education',
    applyUrl: 'https://www.sare.org/grants/farmer-rancher/',
    summaryShort: 'Small grants ($1K-$30K) for farmers to test sustainable practices on their own land.',
    descriptionClean: 'SARE Farmer/Rancher grants are perfect for experimenting with new ideas. Want to try rotational grazing, cover crops, a new irrigation method, or direct marketing? SARE will fund your on-farm research. Simple application, and you share what you learn with other farmers.',
    geographyScope: 'national',
    statesIncluded: [],
    purposeTags: ['conservation', 'equipment', 'cattle', 'land_development', 'irrigation'],
    applicantTypes: ['individual', 'farm', 'ranch'],
    maxEmployees: 0,
    smallFarmFriendly: true,
    institutionOnly: false,
    typicalApplicant: 'small_farm',
    eligibilityConfidence: 'high',
    fundingMin: 1000,
    fundingMax: 30000,
    fundingDisplay: '$1,000 - $30,000',
    deadlineType: 'fixed',
    deadlineDate: null,
    deadlineDisplay: 'Varies by region - check SARE website',
    requirementsBullets: [
      'Must be actively farming or ranching',
      'Project must test a sustainable practice',
      'Simple application process',
      'Must share results with other farmers'
    ],
    qualityScore: 92,
    source: 'sare',
    lastVerified: '2026-01-15',
  },

  {
    id: 'sare-western-001',
    title: 'Western SARE Farmer/Rancher Grant',
    sponsor: 'Western SARE',
    applyUrl: 'https://western.sare.org/grants/farmer-rancher-grants/',
    summaryShort: 'Grants for Western US farmers to explore sustainable practices. AK, AZ, CA, CO, HI, ID, MT, NV, NM, OR, UT, WA, WY.',
    descriptionClean: 'Western SARE funds farmers and ranchers in the Western region to conduct on-farm research. Focus areas include water conservation, grazing management, soil health, and diversified cropping systems.',
    geographyScope: 'regional',
    statesIncluded: ['AK', 'AZ', 'CA', 'CO', 'HI', 'ID', 'MT', 'NV', 'NM', 'OR', 'UT', 'WA', 'WY'],
    purposeTags: ['conservation', 'irrigation', 'cattle', 'land_development'],
    applicantTypes: ['individual', 'farm', 'ranch'],
    maxEmployees: 0,
    smallFarmFriendly: true,
    institutionOnly: false,
    typicalApplicant: 'small_farm',
    eligibilityConfidence: 'high',
    fundingMin: 2500,
    fundingMax: 25000,
    fundingDisplay: '$2,500 - $25,000',
    deadlineType: 'fixed',
    deadlineDate: '2026-11-01',
    deadlineDisplay: 'November (typical)',
    requirementsBullets: [
      'Must be in Western SARE region',
      'Must be producer or rancher',
      'Focus on sustainable practices',
      'Short application process'
    ],
    qualityScore: 90,
    source: 'sare',
    lastVerified: '2026-01-15',
  },

  {
    id: 'sare-southern-001',
    title: 'Southern SARE Producer Grant',
    sponsor: 'Southern SARE',
    applyUrl: 'https://southern.sare.org/grants/apply-for-a-grant/producer-grant/',
    summaryShort: 'Grants for Southern US farmers. AL, AR, FL, GA, KY, LA, MS, NC, OK, SC, TN, TX, VA.',
    descriptionClean: 'Southern SARE supports farmers in the South to conduct sustainable agriculture research on their operations. Popular topics include cover crops, livestock integration, and marketing.',
    geographyScope: 'regional',
    statesIncluded: ['AL', 'AR', 'FL', 'GA', 'KY', 'LA', 'MS', 'NC', 'OK', 'SC', 'TN', 'TX', 'VA'],
    purposeTags: ['conservation', 'equipment', 'cattle', 'land_development'],
    applicantTypes: ['individual', 'farm', 'ranch'],
    maxEmployees: 0,
    smallFarmFriendly: true,
    institutionOnly: false,
    typicalApplicant: 'small_farm',
    eligibilityConfidence: 'high',
    fundingMin: 3000,
    fundingMax: 20000,
    fundingDisplay: '$3,000 - $20,000',
    deadlineType: 'fixed',
    deadlineDate: '2026-02-01',
    deadlineDisplay: 'February (typical)',
    requirementsBullets: [
      'Must be in Southern SARE region',
      'Must be actively farming',
      'Sustainable agriculture focus',
      'Outreach component required'
    ],
    qualityScore: 89,
    source: 'sare',
    lastVerified: '2026-01-15',
  },

  {
    id: 'sare-northcentral-001',
    title: 'North Central SARE Farmer Rancher Grant',
    sponsor: 'North Central SARE',
    applyUrl: 'https://northcentral.sare.org/grants/our-grant-programs/farmer-rancher-grant-program/',
    summaryShort: 'Grants for Midwest farmers. IL, IN, IA, KS, MI, MN, MO, NE, ND, OH, SD, WI.',
    descriptionClean: 'North Central SARE funds farmers in the Midwest to test innovative sustainable practices. Cover crops, grazing, soil health, and diversification are popular topics.',
    geographyScope: 'regional',
    statesIncluded: ['IL', 'IN', 'IA', 'KS', 'MI', 'MN', 'MO', 'NE', 'ND', 'OH', 'SD', 'WI'],
    purposeTags: ['conservation', 'cattle', 'equipment', 'land_development'],
    applicantTypes: ['individual', 'farm', 'ranch'],
    maxEmployees: 0,
    smallFarmFriendly: true,
    institutionOnly: false,
    typicalApplicant: 'small_farm',
    eligibilityConfidence: 'high',
    fundingMin: 3000,
    fundingMax: 25000,
    fundingDisplay: '$3,000 - $25,000',
    deadlineType: 'fixed',
    deadlineDate: '2026-12-01',
    deadlineDisplay: 'December (typical)',
    requirementsBullets: [
      'Must be in North Central SARE region',
      'Must be actively farming',
      'Sustainable innovation focus',
      'Partner farmers encouraged'
    ],
    qualityScore: 89,
    source: 'sare',
    lastVerified: '2026-01-15',
  },

  {
    id: 'sare-northeast-001',
    title: 'Northeast SARE Farmer Grant',
    sponsor: 'Northeast SARE',
    applyUrl: 'https://northeast.sare.org/grants/get-a-grant/farmer-grant/',
    summaryShort: 'Grants for Northeast farmers. CT, DE, ME, MD, MA, NH, NJ, NY, PA, RI, VT, WV.',
    descriptionClean: 'Northeast SARE provides grants to farmers in the Northeast to conduct on-farm sustainable agriculture research. Focus areas include season extension, soil health, and livestock.',
    geographyScope: 'regional',
    statesIncluded: ['CT', 'DE', 'ME', 'MD', 'MA', 'NH', 'NJ', 'NY', 'PA', 'RI', 'VT', 'WV'],
    purposeTags: ['conservation', 'equipment', 'cattle', 'land_development'],
    applicantTypes: ['individual', 'farm', 'ranch'],
    maxEmployees: 0,
    smallFarmFriendly: true,
    institutionOnly: false,
    typicalApplicant: 'small_farm',
    eligibilityConfidence: 'high',
    fundingMin: 5000,
    fundingMax: 30000,
    fundingDisplay: '$5,000 - $30,000',
    deadlineType: 'fixed',
    deadlineDate: '2026-11-01',
    deadlineDisplay: 'November (typical)',
    requirementsBullets: [
      'Must be in Northeast SARE region',
      'Must be actively farming',
      'Project must be innovative/sustainable',
      'Results shared at field day'
    ],
    qualityScore: 89,
    source: 'sare',
    lastVerified: '2026-01-15',
  },

  // =============================================================================
  // TIER 1: CALIFORNIA CDFA PROGRAMS (STATE-SPECIFIC, HIGH-CONFIDENCE)
  // =============================================================================

  {
    id: 'ca-cdfa-sweep-001',
    title: 'California SWEEP - Water Efficiency Enhancement',
    sponsor: 'California Department of Food and Agriculture (CDFA)',
    applyUrl: 'https://www.cdfa.ca.gov/oefi/sweep/',
    summaryShort: 'Up to $200,000 for California farmers to upgrade irrigation systems and save water.',
    descriptionClean: 'SWEEP provides grants to California farmers to implement irrigation systems that reduce water use and greenhouse gas emissions. Eligible projects include soil moisture monitoring, irrigation scheduling, pump efficiency, and converting to drip/micro irrigation.',
    geographyScope: 'state',
    statesIncluded: ['CA'],
    purposeTags: ['irrigation', 'equipment', 'conservation'],
    applicantTypes: ['individual', 'small_business', 'farm', 'ranch'],
    maxEmployees: 0,
    smallFarmFriendly: true,
    institutionOnly: false,
    typicalApplicant: 'small_farm',
    eligibilityConfidence: 'high',
    fundingMin: 10000,
    fundingMax: 200000,
    fundingDisplay: 'Up to $200,000',
    deadlineType: 'fixed',
    deadlineDate: null,
    deadlineDisplay: 'Check CDFA website for funding cycles',
    requirementsBullets: [
      'Must be California agricultural operation',
      'Must demonstrate water savings and GHG reduction',
      'Technical assistance available',
      'Priority for disadvantaged communities'
    ],
    qualityScore: 94,
    source: 'cdfa',
    lastVerified: '2026-01-15',
  },

  {
    id: 'ca-cdfa-healthysoils-001',
    title: 'California Healthy Soils Program',
    sponsor: 'California Department of Food and Agriculture (CDFA)',
    applyUrl: 'https://www.cdfa.ca.gov/oefi/healthysoils/',
    summaryShort: 'Up to $100,000 for cover crops, compost, mulching, and other soil health practices.',
    descriptionClean: 'The Healthy Soils Program pays California farmers to implement practices that sequester carbon and improve soil health. Popular practices include cover cropping, compost application, reduced tillage, and mulching.',
    geographyScope: 'state',
    statesIncluded: ['CA'],
    purposeTags: ['conservation', 'land_development'],
    applicantTypes: ['individual', 'small_business', 'farm', 'ranch'],
    maxEmployees: 0,
    smallFarmFriendly: true,
    institutionOnly: false,
    typicalApplicant: 'small_farm',
    eligibilityConfidence: 'high',
    fundingMin: 5000,
    fundingMax: 100000,
    fundingDisplay: 'Up to $100,000',
    deadlineType: 'fixed',
    deadlineDate: null,
    deadlineDisplay: 'Check CDFA website for current cycle',
    requirementsBullets: [
      'Must be California agricultural operation',
      'Must implement approved soil health practices',
      '3-year practice commitment required',
      'Technical assistance provided'
    ],
    qualityScore: 93,
    source: 'cdfa',
    lastVerified: '2026-01-15',
  },

  {
    id: 'ca-cdfa-ammp-001',
    title: 'Alternative Manure Management Program (AMMP)',
    sponsor: 'California Department of Food and Agriculture (CDFA)',
    applyUrl: 'https://www.cdfa.ca.gov/oefi/ammp/',
    summaryShort: 'Up to $750,000 for California livestock operations to reduce methane from manure.',
    descriptionClean: 'AMMP funds non-digester manure management practices that reduce methane emissions. Eligible practices include pasture-based management, solid separation, composting, and improved lagoon management. Priority for small and medium operations.',
    geographyScope: 'state',
    statesIncluded: ['CA'],
    purposeTags: ['cattle', 'conservation', 'equipment'],
    applicantTypes: ['individual', 'small_business', 'farm', 'ranch'],
    maxEmployees: 0,
    smallFarmFriendly: true,
    institutionOnly: false,
    typicalApplicant: 'small_farm',
    eligibilityConfidence: 'high',
    fundingMin: 25000,
    fundingMax: 750000,
    fundingDisplay: 'Up to $750,000',
    deadlineType: 'fixed',
    deadlineDate: null,
    deadlineDisplay: 'Check CDFA website for current cycle',
    requirementsBullets: [
      'Must be California livestock operation',
      'Non-digester practices only',
      'Must demonstrate GHG reductions',
      'Priority for small and medium operations'
    ],
    qualityScore: 87,
    source: 'cdfa',
    lastVerified: '2026-01-15',
  },

  // =============================================================================
  // TIER 2: OTHER USDA PROGRAMS (GOOD FOR SMALL FARMS)
  // =============================================================================

  {
    id: 'usda-fmpp-001',
    title: 'Farmers Market Promotion Program (FMPP)',
    sponsor: 'USDA Agricultural Marketing Service',
    applyUrl: 'https://www.ams.usda.gov/services/grants/fmpp',
    summaryShort: 'Grants for farmers markets, CSAs, food hubs, and direct-to-consumer marketing.',
    descriptionClean: 'FMPP helps develop and expand farmers markets, CSAs, roadside stands, and other direct producer-to-consumer markets. Good for producer groups and cooperatives that want to create or improve local marketing channels.',
    geographyScope: 'national',
    statesIncluded: [],
    purposeTags: ['operating', 'equipment'],
    applicantTypes: ['small_business', 'farm', 'cooperative'],
    maxEmployees: 0,
    smallFarmFriendly: true,
    institutionOnly: false,
    typicalApplicant: 'mixed',
    eligibilityConfidence: 'medium',
    fundingMin: 50000,
    fundingMax: 500000,
    fundingDisplay: '$50,000 - $500,000',
    deadlineType: 'fixed',
    deadlineDate: '2026-05-01',
    deadlineDisplay: 'May 2026 (typical)',
    requirementsBullets: [
      'Must support direct-to-consumer marketing',
      'Projects should benefit multiple producers',
      '25% matching funds required',
      'Farmer cooperatives and groups eligible'
    ],
    qualityScore: 82,
    source: 'usda_ams',
    lastVerified: '2026-01-15',
  },

  {
    id: 'usda-occsp-001',
    title: 'Organic Certification Cost Share Program',
    sponsor: 'USDA Farm Service Agency',
    applyUrl: 'https://www.fsa.usda.gov/programs-and-services/occsp/index',
    summaryShort: 'Reimburses up to 75% of organic certification costs (up to $750 per scope).',
    descriptionClean: 'If you\'re certified organic (or getting certified), this program reimburses up to 75% of your certification costs. Apply through your state agriculture department or local FSA office after paying your certification fees.',
    geographyScope: 'national',
    statesIncluded: [],
    purposeTags: ['operating'],
    applicantTypes: ['individual', 'small_business', 'farm'],
    maxEmployees: 0,
    smallFarmFriendly: true,
    institutionOnly: false,
    typicalApplicant: 'small_farm',
    eligibilityConfidence: 'high',
    fundingMin: 0,
    fundingMax: 750,
    fundingDisplay: 'Up to $750 per scope (max $3,000/year)',
    deadlineType: 'fixed',
    deadlineDate: null,
    deadlineDisplay: 'October 31 annually',
    requirementsBullets: [
      'Must be certified organic operation',
      'Reimburses certification costs only',
      'Up to 4 scopes eligible (crops, livestock, handling, wild crops)',
      'Apply through state or local FSA office'
    ],
    qualityScore: 88,
    source: 'usda_fsa',
    lastVerified: '2026-01-15',
  },

  {
    id: 'usda-nrcs-cig-001',
    title: 'Conservation Innovation Grants - On-Farm Trials',
    sponsor: 'USDA Natural Resources Conservation Service',
    applyUrl: 'https://www.nrcs.usda.gov/programs-initiatives/cig-conservation-innovation-grants',
    summaryShort: 'Funding for farmers to test new conservation approaches. Partners with universities but farmers can participate.',
    descriptionClean: 'CIG On-Farm Trials fund projects that test innovative conservation approaches on working farms. While grants go to organizations, farmers participate as partners and receive payments for hosting trials.',
    geographyScope: 'national',
    statesIncluded: [],
    purposeTags: ['conservation', 'irrigation', 'land_development'],
    applicantTypes: ['individual', 'small_business', 'farm', 'ranch'],
    maxEmployees: 0,
    smallFarmFriendly: true,
    institutionOnly: false,
    typicalApplicant: 'mixed',
    eligibilityConfidence: 'medium',
    fundingMin: 0,
    fundingMax: 50000,
    fundingDisplay: 'Varies - payments for hosting trials',
    deadlineType: 'rolling',
    deadlineDate: null,
    deadlineDisplay: 'Contact local NRCS for opportunities',
    requirementsBullets: [
      'Farmers participate as partners in research',
      'Host on-farm trials of new practices',
      'Technical support provided',
      'Payment for participation'
    ],
    qualityScore: 78,
    source: 'usda_nrcs',
    lastVerified: '2026-01-15',
  },

  // =============================================================================
  // TIER 2: EMERGENCY AND DISASTER PROGRAMS
  // =============================================================================

  {
    id: 'usda-fsa-lip-001',
    title: 'Livestock Indemnity Program (LIP)',
    sponsor: 'USDA Farm Service Agency',
    applyUrl: 'https://www.fsa.usda.gov/programs-and-services/disaster-assistance-program/livestock-indemnity/index',
    summaryShort: 'Payments for livestock deaths caused by eligible disasters (weather, disease, attacks).',
    descriptionClean: 'LIP compensates livestock owners for deaths in excess of normal mortality caused by eligible adverse weather or disease. If you lose cattle, sheep, goats, or other livestock to a qualifying event, LIP can help.',
    geographyScope: 'national',
    statesIncluded: [],
    purposeTags: ['cattle', 'operating'],
    applicantTypes: ['individual', 'small_business', 'farm', 'ranch'],
    maxEmployees: 0,
    smallFarmFriendly: true,
    institutionOnly: false,
    typicalApplicant: 'small_farm',
    eligibilityConfidence: 'high',
    fundingMin: 0,
    fundingMax: 125000,
    fundingDisplay: 'Based on livestock losses',
    deadlineType: 'rolling',
    deadlineDate: null,
    deadlineDisplay: 'Within 30 days of loss',
    requirementsBullets: [
      'Must have livestock deaths from eligible cause',
      'Report within 30 days of loss',
      'Documentation required (photos, vet records)',
      'AGI limits apply'
    ],
    qualityScore: 84,
    source: 'usda_fsa',
    lastVerified: '2026-01-15',
  },

  // =============================================================================
  // TIER 2: FOUNDATION/PRIVATE GRANTS (ACCESSIBLE TO SMALL FARMS)
  // =============================================================================

  {
    id: 'farmaid-family-001',
    title: 'Farm Aid Family Farm Disaster Fund',
    sponsor: 'Farm Aid',
    applyUrl: 'https://www.farmaid.org/our-work/grants/',
    summaryShort: 'Emergency grants ($500-$5,000) for family farmers facing financial hardship.',
    descriptionClean: 'Farm Aid provides emergency grants to family farmers in crisis. If you\'re facing foreclosure, disaster recovery, or financial emergency, Farm Aid can help with immediate needs. One-time emergency assistance.',
    geographyScope: 'national',
    statesIncluded: [],
    purposeTags: ['operating'],
    applicantTypes: ['individual', 'farm', 'ranch'],
    maxEmployees: 15,
    smallFarmFriendly: true,
    institutionOnly: false,
    typicalApplicant: 'small_farm',
    eligibilityConfidence: 'high',
    fundingMin: 500,
    fundingMax: 5000,
    fundingDisplay: '$500 - $5,000',
    deadlineType: 'rolling',
    deadlineDate: null,
    deadlineDisplay: 'Rolling - Emergency basis',
    requirementsBullets: [
      'Must be family farm operation',
      'Must demonstrate financial hardship',
      'Cannot be large-scale commercial operation',
      'One-time emergency assistance'
    ],
    qualityScore: 80,
    source: 'foundation',
    lastVerified: '2026-01-15',
  },

  // =============================================================================
  // TIER 2: STATE PROGRAMS (TEXAS, IOWA, ETC.)
  // =============================================================================

  {
    id: 'tx-tsswcb-wqmp-001',
    title: 'Texas Water Quality Management Plan Program',
    sponsor: 'Texas State Soil and Water Conservation Board',
    applyUrl: 'https://www.tsswcb.texas.gov/programs/texas-nonpoint-source-management-program',
    summaryShort: 'Cost-share for Texas farmers to implement water quality practices - free technical assistance.',
    descriptionClean: 'Texas SWCD provides cost-share assistance for best management practices that protect water quality on Texas agricultural lands. Free technical assistance to develop a certified Water Quality Management Plan.',
    geographyScope: 'state',
    statesIncluded: ['TX'],
    purposeTags: ['irrigation', 'conservation', 'cattle'],
    applicantTypes: ['individual', 'small_business', 'farm', 'ranch'],
    maxEmployees: 0,
    smallFarmFriendly: true,
    institutionOnly: false,
    typicalApplicant: 'small_farm',
    eligibilityConfidence: 'high',
    fundingMin: 0,
    fundingMax: 50000,
    fundingDisplay: 'Cost-share varies by practice',
    deadlineType: 'rolling',
    deadlineDate: null,
    deadlineDisplay: 'Contact local SWCD',
    requirementsBullets: [
      'Must be Texas agricultural operation',
      'Must develop certified WQMP',
      'Practices must address water quality concerns',
      'Free technical assistance available'
    ],
    qualityScore: 82,
    source: 'tx_state',
    lastVerified: '2026-01-15',
  },

  {
    id: 'ia-ifa-beginning-001',
    title: 'Iowa Beginning Farmer Loan Program',
    sponsor: 'Iowa Finance Authority',
    applyUrl: 'https://www.iowafinance.com/beginning-farmer-programs/',
    summaryShort: 'Low-interest loans and tax credits for Iowa beginning farmers.',
    descriptionClean: 'Iowa provides tax credits to landowners who rent to beginning farmers, and low-interest loans for beginning farmers to purchase land and equipment. Must have less than 10 years farming experience.',
    geographyScope: 'state',
    statesIncluded: ['IA'],
    purposeTags: ['land_development', 'equipment', 'cattle'],
    applicantTypes: ['individual', 'farm', 'ranch'],
    maxEmployees: 0,
    smallFarmFriendly: true,
    institutionOnly: false,
    typicalApplicant: 'small_farm',
    eligibilityConfidence: 'high',
    fundingMin: 0,
    fundingMax: 600000,
    fundingDisplay: 'Loans up to $600,000 / Tax credits vary',
    deadlineType: 'rolling',
    deadlineDate: null,
    deadlineDisplay: 'Apply anytime',
    requirementsBullets: [
      'Must be Iowa resident',
      'Net worth less than $853,000',
      'Less than 10 years farming experience',
      'Must complete financial management course'
    ],
    qualityScore: 86,
    source: 'ia_state',
    lastVerified: '2026-01-15',
  },

];

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get count of seed grants
 */
export function getSeedGrantCount(): number {
  return SEED_GRANTS_V2.length;
}

/**
 * Get only small-farm-friendly grants (excludes institution-only)
 */
export function getSmallFarmGrants(): GrantV2[] {
  return SEED_GRANTS_V2.filter(g =>
    g.smallFarmFriendly &&
    !g.institutionOnly
  );
}

/**
 * Get grants by eligibility confidence
 */
export function getHighConfidenceGrants(): GrantV2[] {
  return SEED_GRANTS_V2.filter(g =>
    g.smallFarmFriendly &&
    !g.institutionOnly &&
    g.eligibilityConfidence === 'high'
  );
}

/**
 * Get all unique states covered
 */
export function getCoveredStates(): string[] {
  const states = new Set<string>();
  // National grants cover all states
  const allStates = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
    'DC', 'PR', 'GU', 'AS'
  ];

  SEED_GRANTS_V2.forEach(g => {
    if (g.geographyScope === 'national') {
      allStates.forEach(s => states.add(s));
    } else {
      g.statesIncluded.forEach(s => states.add(s));
    }
  });
  return Array.from(states).sort();
}

/**
 * Get all unique purpose tags
 */
export function getAvailablePurposeTags(): string[] {
  const tags = new Set<string>();
  SEED_GRANTS_V2.forEach(g => {
    g.purposeTags.forEach(t => tags.add(t));
  });
  return Array.from(tags).sort();
}

/**
 * Validate seed data integrity
 */
export function validateSeedData(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  SEED_GRANTS_V2.forEach((grant, index) => {
    if (!grant.id) errors.push(`Grant ${index}: missing id`);
    if (!grant.title) errors.push(`Grant ${index}: missing title`);
    if (!grant.applyUrl) errors.push(`Grant ${index}: missing applyUrl`);
    if (!grant.applyUrl.startsWith('http')) errors.push(`Grant ${index}: invalid applyUrl`);
    if (grant.purposeTags.length === 0) errors.push(`Grant ${index}: no purpose tags`);
    if (grant.applicantTypes.length === 0) errors.push(`Grant ${index}: no applicant types`);
    if (typeof grant.smallFarmFriendly !== 'boolean') errors.push(`Grant ${index}: missing smallFarmFriendly`);
    if (typeof grant.institutionOnly !== 'boolean') errors.push(`Grant ${index}: missing institutionOnly`);
    if (!grant.typicalApplicant) errors.push(`Grant ${index}: missing typicalApplicant`);
    if (!grant.eligibilityConfidence) errors.push(`Grant ${index}: missing eligibilityConfidence`);
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get statistics about the seed data
 */
export function getSeedStats(): {
  total: number;
  smallFarmFriendly: number;
  institutionOnly: number;
  highConfidence: number;
  byTypicalApplicant: Record<string, number>;
  bySource: Record<string, number>;
} {
  const stats = {
    total: SEED_GRANTS_V2.length,
    smallFarmFriendly: 0,
    institutionOnly: 0,
    highConfidence: 0,
    byTypicalApplicant: {} as Record<string, number>,
    bySource: {} as Record<string, number>,
  };

  SEED_GRANTS_V2.forEach(g => {
    if (g.smallFarmFriendly) stats.smallFarmFriendly++;
    if (g.institutionOnly) stats.institutionOnly++;
    if (g.eligibilityConfidence === 'high') stats.highConfidence++;

    stats.byTypicalApplicant[g.typicalApplicant] =
      (stats.byTypicalApplicant[g.typicalApplicant] || 0) + 1;

    stats.bySource[g.source] = (stats.bySource[g.source] || 0) + 1;
  });

  return stats;
}
