/**
 * Grant Source Configuration
 *
 * Defines all known grant sources to crawl.
 * Each source has configuration for how to scrape, extract, and validate grants.
 */

import { IngestionSourceConfig } from './types';

// ==================== FEDERAL SOURCES ====================

const grantsGov: IngestionSourceConfig = {
  id: 'grants_gov',
  name: 'grants_gov',
  displayName: 'Grants.gov',
  type: 'api',
  enabled: true,
  priority: 10,
  baseUrl: 'https://www.grants.gov',
  requestDelayMs: 1000,
  maxConcurrent: 2,
  scheduleIntervalHours: 12,
  respectsRobotsTxt: true,
  requiresAttribution: true,
  attributionText: 'Data from Grants.gov',

  apiConfig: {
    endpoint: 'https://www.grants.gov/grantsws/rest/opportunities/search',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    authType: 'none',
    responseFormat: 'json',
    grantsPath: 'oppHits',
    paginationParam: 'startRecordNum',
    pageSizeParam: 'rows',
    pageSize: 100,
  },

  extractionHints: {
    dateFormat: 'MM/DD/YYYY',
    entityTypeMapping: {
      '00': 'government',
      '01': 'nonprofit',
      '02': 'for_profit',
      '04': 'individual',
      '05': 'small_business',
      '06': 'educational',
      '07': 'tribal',
      '25': 'nonprofit',
    },
  },
};

const samGov: IngestionSourceConfig = {
  id: 'sam_gov',
  name: 'sam_gov',
  displayName: 'SAM.gov Contract Opportunities',
  type: 'api',
  enabled: true,
  priority: 9,
  baseUrl: 'https://sam.gov',
  requestDelayMs: 1500,
  maxConcurrent: 1,
  scheduleIntervalHours: 24,
  respectsRobotsTxt: true,
  requiresAttribution: true,
  attributionText: 'Data from SAM.gov',

  apiConfig: {
    endpoint: 'https://api.sam.gov/opportunities/v2/search',
    method: 'GET',
    headers: {},
    authType: 'api_key',
    apiKeyParam: 'api_key',
    responseFormat: 'json',
    grantsPath: 'opportunitiesData',
    paginationParam: 'offset',
    pageSizeParam: 'limit',
    pageSize: 100,
  },
};

const usda: IngestionSourceConfig = {
  id: 'usda_grants',
  name: 'usda_grants',
  displayName: 'USDA Rural Development',
  type: 'scrape',
  enabled: true,
  priority: 8,
  baseUrl: 'https://www.rd.usda.gov',
  listingUrls: [
    'https://www.rd.usda.gov/programs-services/all-programs',
    'https://www.rd.usda.gov/programs-services/business-programs',
    'https://www.rd.usda.gov/programs-services/community-facilities',
    'https://www.rd.usda.gov/programs-services/energy-programs',
  ],
  requestDelayMs: 2000,
  maxConcurrent: 1,
  scheduleIntervalHours: 48,
  respectsRobotsTxt: true,
  requiresAttribution: false,

  selectors: {
    grantList: '.views-row',
    grantLink: 'a',
    title: 'h1',
    description: '.field--name-body',
    eligibility: '.field--name-field-eligibility',
  },

  extractionHints: {
    entityTypeMapping: {
      'rural business': 'small_business',
      'nonprofit organization': 'nonprofit',
      'tribal entity': 'tribal',
      'public body': 'government',
      'individual': 'individual',
    },
  },
};

const sbir: IngestionSourceConfig = {
  id: 'sbir_gov',
  name: 'sbir_gov',
  displayName: 'SBIR/STTR (Small Business Innovation)',
  type: 'api',
  enabled: true,
  priority: 9,
  baseUrl: 'https://www.sbir.gov',
  requestDelayMs: 1000,
  maxConcurrent: 2,
  scheduleIntervalHours: 24,
  respectsRobotsTxt: true,
  requiresAttribution: true,
  attributionText: 'Data from SBIR.gov',

  apiConfig: {
    endpoint: 'https://www.sbir.gov/api/solicitations.json',
    method: 'GET',
    authType: 'none',
    responseFormat: 'json',
    grantsPath: 'results',
    paginationParam: 'page',
    pageSize: 50,
  },
};

const sba: IngestionSourceConfig = {
  id: 'sba_gov',
  name: 'sba_gov',
  displayName: 'Small Business Administration',
  type: 'scrape',
  enabled: true,
  priority: 8,
  baseUrl: 'https://www.sba.gov',
  listingUrls: [
    'https://www.sba.gov/funding-programs/grants',
    'https://www.sba.gov/funding-programs/loans',
  ],
  requestDelayMs: 2000,
  maxConcurrent: 1,
  scheduleIntervalHours: 48,
  respectsRobotsTxt: true,
  requiresAttribution: false,

  selectors: {
    grantList: '.funding-program',
    grantLink: 'a',
    title: 'h2',
    description: '.program-description',
  },
};

const doe: IngestionSourceConfig = {
  id: 'doe_eere',
  name: 'doe_eere',
  displayName: 'Department of Energy (EERE)',
  type: 'scrape',
  enabled: true,
  priority: 7,
  baseUrl: 'https://www.energy.gov',
  listingUrls: [
    'https://www.energy.gov/eere/funding/funding-opportunities',
    'https://www.energy.gov/clean-energy/funding-opportunities',
  ],
  requestDelayMs: 2000,
  maxConcurrent: 1,
  scheduleIntervalHours: 48,
  respectsRobotsTxt: true,
  requiresAttribution: false,

  selectors: {
    grantList: '.funding-opportunity',
    grantLink: 'a',
    title: 'h3',
    deadline: '.deadline',
    amount: '.funding-amount',
  },
};

// ==================== STATE SOURCES ====================

const californiaGrants: IngestionSourceConfig = {
  id: 'california_grants',
  name: 'california_grants',
  displayName: 'California Grants Portal',
  type: 'scrape',
  enabled: true,
  priority: 7,
  baseUrl: 'https://www.grants.ca.gov',
  listingUrls: ['https://www.grants.ca.gov/grants/'],
  paginationPattern: '?page={page}',
  maxPages: 20,
  requestDelayMs: 2000,
  maxConcurrent: 1,
  scheduleIntervalHours: 24,
  respectsRobotsTxt: true,
  requiresAttribution: false,

  selectors: {
    grantList: '.grant-item',
    grantLink: '.grant-title a',
    title: '.grant-title',
    sponsor: '.grant-agency',
    deadline: '.grant-deadline',
    amount: '.grant-amount',
    eligibility: '.grant-eligibility',
    nextPage: '.pagination .next a',
  },
};

const newYorkGrants: IngestionSourceConfig = {
  id: 'new_york_grants',
  name: 'new_york_grants',
  displayName: 'New York State Grants',
  type: 'scrape',
  enabled: true,
  priority: 7,
  baseUrl: 'https://grantsgateway.ny.gov',
  listingUrls: ['https://grantsgateway.ny.gov/IntelliGrants_NYSGG/module/nysgg/goportal.aspx'],
  requestDelayMs: 2000,
  maxConcurrent: 1,
  scheduleIntervalHours: 24,
  respectsRobotsTxt: true,
  requiresAttribution: false,

  selectors: {
    grantList: '.grant-row',
    grantLink: 'a',
    title: '.grant-name',
    sponsor: '.agency',
    deadline: '.deadline',
  },
};

const texasGrants: IngestionSourceConfig = {
  id: 'texas_grants',
  name: 'texas_grants',
  displayName: 'Texas Comptroller Grants',
  type: 'scrape',
  enabled: true,
  priority: 7,
  baseUrl: 'https://comptroller.texas.gov',
  listingUrls: ['https://comptroller.texas.gov/programs/local-assistance/grants/'],
  requestDelayMs: 2000,
  maxConcurrent: 1,
  scheduleIntervalHours: 48,
  respectsRobotsTxt: true,
  requiresAttribution: false,
};

const washingtonGrants: IngestionSourceConfig = {
  id: 'washington_grants',
  name: 'washington_grants',
  displayName: 'Washington State Grants',
  type: 'scrape',
  enabled: true,
  priority: 7,
  baseUrl: 'https://www.commerce.wa.gov',
  listingUrls: ['https://www.commerce.wa.gov/building-infrastructure/capital-facilities/grant-programs/'],
  requestDelayMs: 2000,
  maxConcurrent: 1,
  scheduleIntervalHours: 48,
  respectsRobotsTxt: true,
  requiresAttribution: false,
};

// ==================== FOUNDATION SOURCES ====================

const fordFoundation: IngestionSourceConfig = {
  id: 'ford_foundation',
  name: 'ford_foundation',
  displayName: 'Ford Foundation',
  type: 'scrape',
  enabled: true,
  priority: 6,
  baseUrl: 'https://www.fordfoundation.org',
  listingUrls: ['https://www.fordfoundation.org/work/our-grants/'],
  requestDelayMs: 3000,
  maxConcurrent: 1,
  scheduleIntervalHours: 168, // Weekly
  respectsRobotsTxt: true,
  requiresAttribution: false,
};

const macarthurFoundation: IngestionSourceConfig = {
  id: 'macarthur_foundation',
  name: 'macarthur_foundation',
  displayName: 'MacArthur Foundation',
  type: 'scrape',
  enabled: true,
  priority: 6,
  baseUrl: 'https://www.macfound.org',
  listingUrls: ['https://www.macfound.org/grants/'],
  requestDelayMs: 3000,
  maxConcurrent: 1,
  scheduleIntervalHours: 168, // Weekly
  respectsRobotsTxt: true,
  requiresAttribution: false,
};

const gatesFoundation: IngestionSourceConfig = {
  id: 'gates_foundation',
  name: 'gates_foundation',
  displayName: 'Bill & Melinda Gates Foundation',
  type: 'scrape',
  enabled: true,
  priority: 6,
  baseUrl: 'https://www.gatesfoundation.org',
  listingUrls: ['https://www.gatesfoundation.org/about/how-we-work/grant-opportunities'],
  requestDelayMs: 3000,
  maxConcurrent: 1,
  scheduleIntervalHours: 168,
  respectsRobotsTxt: true,
  requiresAttribution: false,
};

const bloombergPhilanthropies: IngestionSourceConfig = {
  id: 'bloomberg_philanthropies',
  name: 'bloomberg_philanthropies',
  displayName: 'Bloomberg Philanthropies',
  type: 'scrape',
  enabled: true,
  priority: 6,
  baseUrl: 'https://www.bloomberg.org',
  listingUrls: ['https://www.bloomberg.org/grants/'],
  requestDelayMs: 3000,
  maxConcurrent: 1,
  scheduleIntervalHours: 168,
  respectsRobotsTxt: true,
  requiresAttribution: false,
};

// ==================== UTILITY & REBATE SOURCES ====================

const dsireRebates: IngestionSourceConfig = {
  id: 'dsire_rebates',
  name: 'dsire_rebates',
  displayName: 'DSIRE (Database of State Incentives)',
  type: 'api',
  enabled: true,
  priority: 7,
  baseUrl: 'https://www.dsireusa.org',
  requestDelayMs: 2000,
  maxConcurrent: 1,
  scheduleIntervalHours: 48,
  respectsRobotsTxt: true,
  requiresAttribution: true,
  attributionText: 'Data from DSIRE (NC Clean Energy Technology Center)',

  apiConfig: {
    endpoint: 'https://programs.dsireusa.org/system/program',
    method: 'GET',
    authType: 'none',
    responseFormat: 'json',
    grantsPath: 'data',
  },
};

// ==================== AGGREGATOR SOURCES ====================

const foundationDirectory: IngestionSourceConfig = {
  id: 'foundation_directory',
  name: 'foundation_directory',
  displayName: 'Foundation Directory Online',
  type: 'api',
  enabled: false, // Requires subscription
  priority: 5,
  baseUrl: 'https://fconline.foundationcenter.org',
  requestDelayMs: 2000,
  maxConcurrent: 1,
  scheduleIntervalHours: 168,
  respectsRobotsTxt: true,
  requiresAttribution: true,
};

// ==================== EXPORTED CONFIGURATION ====================

export const GRANT_SOURCES: IngestionSourceConfig[] = [
  // Federal (highest priority)
  grantsGov,
  samGov,
  sbir,
  sba,
  usda,
  doe,

  // State portals
  californiaGrants,
  newYorkGrants,
  texasGrants,
  washingtonGrants,

  // Foundations
  fordFoundation,
  macarthurFoundation,
  gatesFoundation,
  bloombergPhilanthropies,

  // Utility/Rebates
  dsireRebates,

  // Aggregators (disabled by default)
  foundationDirectory,
];

export const getEnabledSources = (): IngestionSourceConfig[] => {
  return GRANT_SOURCES.filter((s) => s.enabled).sort((a, b) => b.priority - a.priority);
};

export const getSourceById = (id: string): IngestionSourceConfig | undefined => {
  return GRANT_SOURCES.find((s) => s.id === id);
};

export const getSourceByName = (name: string): IngestionSourceConfig | undefined => {
  return GRANT_SOURCES.find((s) => s.name === name);
};

// Entity type normalization mapping
export const ENTITY_TYPE_MAP: Record<string, string> = {
  // Variations to normalize
  nonprofit: 'nonprofit',
  'non-profit': 'nonprofit',
  'non profit': 'nonprofit',
  '501c3': 'nonprofit',
  '501(c)(3)': 'nonprofit',
  ngo: 'nonprofit',
  charity: 'nonprofit',

  small_business: 'small_business',
  'small business': 'small_business',
  smb: 'small_business',
  sme: 'small_business',

  for_profit: 'for_profit',
  'for-profit': 'for_profit',
  business: 'for_profit',
  corporation: 'for_profit',
  company: 'for_profit',

  individual: 'individual',
  person: 'individual',
  citizen: 'individual',

  educational: 'educational',
  education: 'educational',
  school: 'educational',
  university: 'educational',
  college: 'educational',
  'k-12': 'educational',

  government: 'government',
  municipal: 'government',
  city: 'government',
  county: 'government',
  state: 'government',
  federal: 'government',
  'public body': 'government',

  tribal: 'tribal',
  'native american': 'tribal',
  'tribal organization': 'tribal',
  'indian tribe': 'tribal',
};

// Category normalization
export const CATEGORY_MAP: Record<string, string> = {
  agriculture: 'agriculture',
  farming: 'agriculture',
  food: 'agriculture',

  arts: 'arts_culture',
  culture: 'arts_culture',
  humanities: 'arts_culture',

  business: 'business',
  commerce: 'business',
  'economic development': 'business',

  community: 'community_development',
  'community development': 'community_development',
  housing: 'community_development',

  education: 'education',
  training: 'education',
  workforce: 'education',

  energy: 'energy',
  'clean energy': 'energy',
  renewable: 'energy',
  solar: 'energy',

  environment: 'environment',
  conservation: 'environment',
  sustainability: 'environment',

  health: 'health',
  healthcare: 'health',
  medical: 'health',

  research: 'research',
  'r&d': 'research',
  science: 'research',
  innovation: 'research',

  technology: 'technology',
  tech: 'technology',
  digital: 'technology',
  cyber: 'technology',

  transportation: 'transportation',
  transit: 'transportation',
  infrastructure: 'transportation',
};

// State code to name mapping
export const STATE_CODES: Record<string, string> = {
  AL: 'Alabama',
  AK: 'Alaska',
  AZ: 'Arizona',
  AR: 'Arkansas',
  CA: 'California',
  CO: 'Colorado',
  CT: 'Connecticut',
  DE: 'Delaware',
  FL: 'Florida',
  GA: 'Georgia',
  HI: 'Hawaii',
  ID: 'Idaho',
  IL: 'Illinois',
  IN: 'Indiana',
  IA: 'Iowa',
  KS: 'Kansas',
  KY: 'Kentucky',
  LA: 'Louisiana',
  ME: 'Maine',
  MD: 'Maryland',
  MA: 'Massachusetts',
  MI: 'Michigan',
  MN: 'Minnesota',
  MS: 'Mississippi',
  MO: 'Missouri',
  MT: 'Montana',
  NE: 'Nebraska',
  NV: 'Nevada',
  NH: 'New Hampshire',
  NJ: 'New Jersey',
  NM: 'New Mexico',
  NY: 'New York',
  NC: 'North Carolina',
  ND: 'North Dakota',
  OH: 'Ohio',
  OK: 'Oklahoma',
  OR: 'Oregon',
  PA: 'Pennsylvania',
  RI: 'Rhode Island',
  SC: 'South Carolina',
  SD: 'South Dakota',
  TN: 'Tennessee',
  TX: 'Texas',
  UT: 'Utah',
  VT: 'Vermont',
  VA: 'Virginia',
  WA: 'Washington',
  WV: 'West Virginia',
  WI: 'Wisconsin',
  WY: 'Wyoming',
  DC: 'District of Columbia',
  PR: 'Puerto Rico',
  VI: 'Virgin Islands',
  GU: 'Guam',
  AS: 'American Samoa',
  MP: 'Northern Mariana Islands',
};
