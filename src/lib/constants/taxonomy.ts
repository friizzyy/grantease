/**
 * GRANT DISCOVERY TAXONOMY - CONTROLLED VOCABULARY
 * ------------------------------------------------
 * Single source of truth for all classification data.
 * Used across eligibility, matching, and display.
 *
 * PRINCIPLE: No free-form tags. All tags map to canonical values.
 */

// ============= ENTITY TYPES =============

export const ENTITY_TYPES = [
  'individual',
  'nonprofit',
  'small_business',
  'for_profit',
  'educational',
  'government',
  'tribal',
  'cooperative',
  'municipality',
] as const

export type EntityType = typeof ENTITY_TYPES[number]

export const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  individual: 'Individual/Homeowner',
  nonprofit: 'Nonprofit Organization',
  small_business: 'Small Business',
  for_profit: 'For-Profit Business',
  educational: 'Educational Institution',
  government: 'Government Entity',
  tribal: 'Tribal Organization',
  cooperative: 'Cooperative',
  municipality: 'Municipality/Local Government',
}

// Canonical eligibility tags that grants might use
export const ELIGIBILITY_TAGS = [
  'Individual',
  'Nonprofit',
  'Nonprofit 501(c)(3)',
  'Small Business',
  'For-Profit',
  'For-Profit Business',
  'Educational Institution',
  'Government',
  'Government Entity',
  'State Government',
  'Local Government',
  'Municipal',
  'Tribal',
  'Tribal Organization',
  'Native American',
  'Cooperative',
  'Agricultural Producer',
  'Farmer',
  'Rancher',
  'Beginning Farmer',
  'Veteran',
  'Veteran-Owned',
  'Woman-Owned',
  'Minority-Owned',
  'Disabled-Owned',
  'Socially Disadvantaged',
  'Public Housing Authority',
  'Faith-Based',
] as const

export type EligibilityTag = typeof ELIGIBILITY_TAGS[number]

// Map user entity types to compatible grant eligibility tags
export const ENTITY_TO_ELIGIBILITY_TAGS: Record<EntityType, EligibilityTag[]> = {
  individual: ['Individual'],
  nonprofit: ['Nonprofit', 'Nonprofit 501(c)(3)', 'Faith-Based'],
  small_business: ['Small Business', 'For-Profit', 'For-Profit Business', 'Agricultural Producer', 'Farmer', 'Rancher', 'Beginning Farmer'],
  for_profit: ['For-Profit', 'For-Profit Business', 'Small Business'],
  educational: ['Educational Institution', 'Nonprofit'],
  government: ['Government', 'Government Entity', 'State Government', 'Local Government', 'Municipal'],
  tribal: ['Tribal', 'Tribal Organization', 'Native American', 'Government Entity'],
  cooperative: ['Cooperative', 'Nonprofit', 'Agricultural Producer'],
  municipality: ['Municipal', 'Local Government', 'Government Entity', 'Public Housing Authority'],
}

// ============= INDUSTRY/FOCUS AREAS =============

export const INDUSTRY_TAGS = [
  'agriculture',
  'arts_culture',
  'business',
  'climate',
  'community',
  'education',
  'health',
  'housing',
  'infrastructure',
  'nonprofit',
  'research',
  'technology',
  'workforce',
  'youth',
] as const

export type IndustryTag = typeof INDUSTRY_TAGS[number]

export const INDUSTRY_LABELS: Record<IndustryTag, string> = {
  agriculture: 'Agriculture & Farming',
  arts_culture: 'Arts & Culture',
  business: 'Business & Entrepreneurship',
  climate: 'Climate & Environment',
  community: 'Community Development',
  education: 'Education',
  health: 'Health & Wellness',
  housing: 'Housing',
  infrastructure: 'Infrastructure',
  nonprofit: 'Nonprofit Operations',
  research: 'Research & Science',
  technology: 'Technology & Innovation',
  workforce: 'Workforce Development',
  youth: 'Youth & Families',
}

// Keywords that POSITIVELY indicate industry relevance
export const INDUSTRY_POSITIVE_KEYWORDS: Record<IndustryTag, string[]> = {
  agriculture: [
    'agriculture', 'agricultural', 'farm', 'farmer', 'farming', 'ranch', 'rancher',
    'rural development', 'rural community', 'rural business', 'crop', 'crops', 'livestock',
    'cattle', 'poultry', 'usda', 'food production', 'food supply', 'agribusiness', 'soil',
    'irrigation', 'harvest', 'seed', 'grain', 'dairy', 'organic farm', 'conservation land',
    'land conservation', 'pasture', 'grazing', 'horticulture', 'commodity', 'agricultural land',
    'farmland', 'beginning farmer', 'young farmer', 'agricultural research', 'food security',
    'vineyard', 'orchard', 'nursery', 'aquaculture', 'fishery', 'forestry', 'timber',
    'woodland', 'agroforestry', 'pollinator', 'bee', 'cooperative extension', 'nrcs',
    'fsa', 'farm service', 'conservation reserve', 'eqip', 'csp', 'reap',
  ],
  arts_culture: [
    'arts', 'art ', 'culture', 'cultural', 'museum', 'heritage', 'creative', 'humanities',
    'artistic', 'theater', 'theatre', 'music', 'visual arts', 'performing arts',
    'nea', 'neh', 'endowment', 'gallery', 'exhibition', 'literary', 'dance',
    'symphony', 'orchestra', 'opera', 'film', 'media arts', 'folk art', 'craft',
    'preservation', 'historic', 'historical',
  ],
  business: [
    'business', 'entrepreneur', 'commerce', 'economic development', 'sbir', 'sttr',
    'small business', 'startup', 'commercialization', 'sba', 'export', 'trade',
    'manufacturing', 'industry', 'enterprise', 'venture', 'micro-enterprise',
    'minority business', 'women-owned', 'veteran-owned', 'disadvantaged business',
    'hub zone', 'procurement', '8a', 'wosb',
  ],
  climate: [
    'climate', 'environment', 'environmental', 'energy', 'conservation', 'sustainability',
    'epa', 'renewable', 'clean energy', 'carbon', 'emissions', 'green', 'solar',
    'wind energy', 'geothermal', 'recycling', 'waste reduction', 'pollution',
    'water quality', 'air quality', 'ecosystem', 'habitat', 'wildlife',
    'resilience', 'adaptation', 'mitigation', 'electric vehicle', 'ev',
  ],
  community: [
    'community development', 'community service', 'neighborhood', 'civic',
    'regional development', 'block grant', 'cdbg', 'local government', 'municipal',
    'town', 'village', 'revitalization', 'placemaking', 'main street',
    'economic development', 'community foundation', 'community action',
  ],
  education: [
    'education', 'school', 'learning', 'training', 'academic', 'student',
    'teacher', 'curriculum', 'educational', 'k-12', 'higher education', 'university',
    'college', 'classroom', 'literacy', 'stem education', 'stem', 'scholarship',
    'tuition', 'early childhood', 'head start', 'preschool', 'vocational',
  ],
  health: [
    'health', 'medical', 'wellness', 'nih', 'clinical', 'disease', 'mental health',
    'healthcare', 'hospital', 'patient', 'treatment', 'therapy', 'nursing',
    'public health', 'medicine', 'biomedical', 'behavioral health', 'substance abuse',
    'opioid', 'telehealth', 'rural health', 'community health', 'hrsa',
    'maternal', 'child health', 'nutrition', 'food access',
  ],
  housing: [
    'housing', 'hud', 'shelter', 'homelessness', 'affordable housing',
    'rent', 'mortgage', 'homeowner', 'residential', 'apartment', 'dwelling',
    'low-income housing', 'section 8', 'lihtc', 'home repair', 'weatherization',
    'fair housing', 'housing authority', 'multifamily',
  ],
  infrastructure: [
    'infrastructure', 'transportation', 'broadband', 'water system', 'transit',
    'highway', 'bridge', 'road', 'utility', 'sewer', 'electric grid',
    'telecommunications', 'fiber', 'connectivity', 'wastewater', 'stormwater',
    'public works', 'capital improvement', 'dot', 'fhwa',
  ],
  nonprofit: [
    'nonprofit', 'non-profit', 'charitable', 'philanthropy', '501c', '501(c)',
    'voluntary', 'civil society', 'ngo', 'foundation', 'giving', 'charitable organization',
    'tax-exempt', 'capacity building', 'organizational development',
  ],
  research: [
    'research', 'science', 'nsf', 'study', 'r&d', 'scientific',
    'laboratory', 'experiment', 'investigation', 'academic research', 'basic research',
    'applied research', 'innovation', 'discovery', 'nih', 'doe', 'darpa',
  ],
  technology: [
    'technology', 'tech', 'digital', 'software', 'cyber', 'artificial intelligence',
    'data', 'computing', 'information technology', 'internet', 'broadband',
    'telecommunications', 'innovation', 'ai', 'machine learning', 'blockchain',
    'cybersecurity', 'it', 'saas', 'cloud',
  ],
  workforce: [
    'workforce', 'job training', 'employment', 'career', 'labor', 'worker',
    'apprenticeship', 'vocational', 'skills training', 'job placement',
    'unemployment', 'retraining', 'wioa', 'workforce development', 'dol',
    'career pathways', 'work-based learning',
  ],
  youth: [
    'youth', 'children', 'child', 'family', 'families', 'juvenile', 'teen',
    'adolescent', 'young people', 'minor', 'kids', 'afterschool', 'after-school',
    'mentoring', 'foster', 'adoption', 'child welfare', 'acf', 'head start',
  ],
}

// Keywords that EXCLUDE grants from an industry (prevent false matches)
export const INDUSTRY_EXCLUSION_KEYWORDS: Record<IndustryTag, string[]> = {
  agriculture: [
    'cancer treatment', 'cancer therapy', 'chemotherapy', 'tumor', 'oncology',
    'hiv treatment', 'aids research', 'hiv/aids', 'alzheimer', 'dementia',
    'clinical trial', 'drug trial', 'pharmaceutical development', 'drug development',
    'patient care', 'hospital bed', 'nursing care', 'surgery', 'surgical',
    'mental illness', 'psychiatric', 'addiction treatment', 'substance abuse treatment',
    'cybersecurity', 'cyber attack', 'video game', 'gaming', 'social media platform',
    'app development', 'mobile app', 'website development',
    'museum exhibit', 'art gallery', 'theater production', 'symphony', 'opera',
    'film festival', 'dance performance', 'visual arts exhibition',
    'urban renewal', 'metropolitan', 'subway system', 'city transit', 'metro area',
    'weapons system', 'missile defense', 'military combat', 'armed forces equipment',
  ],
  health: [
    'crop production', 'livestock management', 'farm equipment', 'irrigation system',
    'timber harvest', 'mining operation', 'oil extraction', 'coal mining',
    'road construction', 'bridge building', 'highway maintenance',
  ],
  technology: [
    'livestock', 'crop yield', 'farm equipment', 'agricultural production',
    'nursing home', 'patient care facility', 'medical equipment maintenance',
    'art installation', 'museum curation',
  ],
  arts_culture: [
    'clinical trial', 'drug development', 'medical device', 'patient outcome',
    'farm equipment', 'livestock', 'crop production', 'agricultural chemicals',
    'road construction', 'water treatment', 'sewage',
  ],
  business: [],
  climate: [],
  community: [],
  education: [],
  housing: [],
  infrastructure: [],
  nonprofit: [],
  research: [],
  workforce: [],
  youth: [],
}

// Map grant categories to industry tags (for category-based matching)
export const CATEGORY_TO_INDUSTRY: Record<string, IndustryTag[]> = {
  'Agriculture': ['agriculture'],
  'Agriculture & Food': ['agriculture'],
  'Agricultural': ['agriculture'],
  'Rural Development': ['agriculture', 'community'],
  'Arts': ['arts_culture'],
  'Arts & Culture': ['arts_culture'],
  'Humanities': ['arts_culture'],
  'Cultural Heritage': ['arts_culture'],
  'Business': ['business'],
  'Business & Entrepreneurship': ['business'],
  'Small Business': ['business'],
  'Economic Development': ['business', 'community'],
  'Commerce': ['business'],
  'Environment': ['climate'],
  'Environmental': ['climate'],
  'Climate': ['climate'],
  'Energy': ['climate'],
  'Conservation': ['climate', 'agriculture'],
  'Sustainability': ['climate'],
  'Community Development': ['community'],
  'Community': ['community'],
  'Regional Development': ['community'],
  'Education': ['education'],
  'Training': ['education', 'workforce'],
  'Academic': ['education', 'research'],
  'Health': ['health'],
  'Healthcare': ['health'],
  'Medical': ['health'],
  'Public Health': ['health'],
  'Mental Health': ['health'],
  'Housing': ['housing'],
  'Affordable Housing': ['housing'],
  'Infrastructure': ['infrastructure'],
  'Transportation': ['infrastructure'],
  'Broadband': ['infrastructure', 'technology'],
  'Nonprofit': ['nonprofit'],
  'Philanthropy': ['nonprofit'],
  'Research': ['research'],
  'Science': ['research'],
  'Innovation': ['research', 'technology'],
  'Technology': ['technology'],
  'IT': ['technology'],
  'Cybersecurity': ['technology'],
  'Workforce': ['workforce'],
  'Employment': ['workforce'],
  'Job Training': ['workforce'],
  'Youth': ['youth'],
  'Children': ['youth'],
  'Families': ['youth'],
}

// ============= GEOGRAPHY =============

export const GEOGRAPHY_SCOPES = ['national', 'regional', 'state', 'county', 'city', 'tribal'] as const
export type GeographyScope = typeof GEOGRAPHY_SCOPES[number]

export const US_STATES: Record<string, string> = {
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
  'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
  'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii', 'ID': 'Idaho',
  'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa', 'KS': 'Kansas',
  'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
  'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi',
  'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada',
  'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico', 'NY': 'New York',
  'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio', 'OK': 'Oklahoma',
  'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
  'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah',
  'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia',
  'WI': 'Wisconsin', 'WY': 'Wyoming', 'DC': 'District of Columbia',
  'PR': 'Puerto Rico', 'VI': 'Virgin Islands', 'GU': 'Guam',
  'AS': 'American Samoa', 'MP': 'Northern Mariana Islands',
}

export const STATE_CODES = Object.keys(US_STATES)

// ============= FUNDING TYPES =============

export const FUNDING_TYPES = [
  'grant',
  'loan',
  'forgivable_loan',
  'rebate',
  'tax_credit',
  'cost_share',
  'contract',
  'award',
] as const

export type FundingType = typeof FUNDING_TYPES[number]

export const FUNDING_TYPE_LABELS: Record<FundingType, string> = {
  grant: 'Grant',
  loan: 'Loan',
  forgivable_loan: 'Forgivable Loan',
  rebate: 'Rebate',
  tax_credit: 'Tax Credit',
  cost_share: 'Cost-Share',
  contract: 'Contract',
  award: 'Award',
}

// ============= PURPOSE TAGS =============

export const PURPOSE_TAGS = [
  'equipment',
  'hiring',
  'r_and_d',
  'sustainability',
  'expansion',
  'training',
  'working_capital',
  'infrastructure',
  'marketing',
  'technology',
  'land_acquisition',
  'construction',
  'renovation',
  'operating',
  'planning',
  'technical_assistance',
] as const

export type PurposeTag = typeof PURPOSE_TAGS[number]

export const PURPOSE_TAG_LABELS: Record<PurposeTag, string> = {
  equipment: 'Equipment Purchase',
  hiring: 'Hiring/Personnel',
  r_and_d: 'Research & Development',
  sustainability: 'Sustainability/Conservation',
  expansion: 'Business Expansion',
  training: 'Training & Education',
  working_capital: 'Working Capital',
  infrastructure: 'Infrastructure',
  marketing: 'Marketing/Outreach',
  technology: 'Technology',
  land_acquisition: 'Land Acquisition',
  construction: 'Construction',
  renovation: 'Renovation/Repair',
  operating: 'Operating Expenses',
  planning: 'Planning/Feasibility',
  technical_assistance: 'Technical Assistance',
}

// Map user goals to purpose tags
export const GOALS_TO_PURPOSE: Record<string, PurposeTag[]> = {
  'equipment': ['equipment', 'technology'],
  'expansion': ['expansion', 'working_capital', 'construction'],
  'sustainability': ['sustainability', 'equipment', 'renovation'],
  'workforce': ['hiring', 'training'],
  'research': ['r_and_d', 'technology', 'planning'],
  'marketing': ['marketing', 'expansion'],
  'facilities': ['construction', 'renovation', 'land_acquisition'],
  'operations': ['operating', 'working_capital'],
  'planning': ['planning', 'technical_assistance'],
}

// ============= CERTIFICATIONS =============

export const CERTIFICATION_TYPES = [
  'woman_owned',
  'veteran_owned',
  'minority_owned',
  'disabled_owned',
  'small_disadvantaged',
  'hub_zone',
  '8a_certified',
  'organic',
  'usda_certified',
  'b_corp',
  'lgbtq_owned',
  'tribal_owned',
] as const

export type CertificationType = typeof CERTIFICATION_TYPES[number]

export const CERTIFICATION_LABELS: Record<CertificationType, string> = {
  woman_owned: 'Woman-Owned Business (WOSB)',
  veteran_owned: 'Veteran-Owned Business (VOSB)',
  minority_owned: 'Minority-Owned Business (MBE)',
  disabled_owned: 'Service-Disabled Veteran-Owned (SDVOSB)',
  small_disadvantaged: 'Small Disadvantaged Business (SDB)',
  hub_zone: 'HUBZone Certified',
  '8a_certified': '8(a) Certified',
  organic: 'USDA Organic Certified',
  usda_certified: 'USDA Certified',
  b_corp: 'B Corporation',
  lgbtq_owned: 'LGBTQ-Owned Business',
  tribal_owned: 'Tribally-Owned Business',
}

// ============= SIZE BANDS =============

export const SIZE_BANDS = ['solo', 'micro', 'small', 'medium', 'large'] as const
export type SizeBand = typeof SIZE_BANDS[number]

export const SIZE_BAND_LABELS: Record<SizeBand, string> = {
  solo: 'Solo (1 person)',
  micro: 'Micro (2-5 people)',
  small: 'Small (6-25 people)',
  medium: 'Medium (26-100 people)',
  large: 'Large (100+ people)',
}

export const SIZE_BAND_RANGES: Record<SizeBand, { min: number; max: number }> = {
  solo: { min: 1, max: 1 },
  micro: { min: 2, max: 5 },
  small: { min: 6, max: 25 },
  medium: { min: 26, max: 100 },
  large: { min: 101, max: Infinity },
}

// ============= BUDGET RANGES =============

export const BUDGET_RANGES = [
  'under_50k',
  '50k_100k',
  '100k_250k',
  '250k_500k',
  '500k_1m',
  '1m_5m',
  'over_5m',
] as const

export type BudgetRange = typeof BUDGET_RANGES[number]

export const BUDGET_RANGE_LABELS: Record<BudgetRange, string> = {
  under_50k: 'Under $50,000',
  '50k_100k': '$50,000 - $100,000',
  '100k_250k': '$100,000 - $250,000',
  '250k_500k': '$250,000 - $500,000',
  '500k_1m': '$500,000 - $1M',
  '1m_5m': '$1M - $5M',
  over_5m: 'Over $5M',
}

export const BUDGET_RANGE_VALUES: Record<BudgetRange, { min: number; max: number }> = {
  under_50k: { min: 0, max: 50000 },
  '50k_100k': { min: 50000, max: 100000 },
  '100k_250k': { min: 100000, max: 250000 },
  '250k_500k': { min: 250000, max: 500000 },
  '500k_1m': { min: 500000, max: 1000000 },
  '1m_5m': { min: 1000000, max: 5000000 },
  over_5m: { min: 5000000, max: Infinity },
}

// Map budget ranges to appropriate grant sizes
export const BUDGET_TO_GRANT_SIZE: Record<BudgetRange, string[]> = {
  under_50k: ['micro', 'small'],
  '50k_100k': ['micro', 'small', 'medium'],
  '100k_250k': ['small', 'medium'],
  '250k_500k': ['small', 'medium', 'large'],
  '500k_1m': ['medium', 'large'],
  '1m_5m': ['medium', 'large'],
  over_5m: ['large'],
}

// ============= GRANT SIZE CATEGORIES =============

export const GRANT_SIZE_CATEGORIES = ['micro', 'small', 'medium', 'large'] as const
export type GrantSizeCategory = typeof GRANT_SIZE_CATEGORIES[number]

export const GRANT_SIZE_RANGES: Record<GrantSizeCategory, { min: number; max: number }> = {
  micro: { min: 0, max: 10000 },
  small: { min: 10000, max: 50000 },
  medium: { min: 50000, max: 250000 },
  large: { min: 250000, max: Infinity },
}

// ============= DATA QUALITY =============

export const QUALITY_THRESHOLDS = {
  EXCELLENT: 0.9,
  GOOD: 0.7,
  FAIR: 0.5,
  POOR: 0.3,
} as const

export const CONFIDENCE_LEVELS = ['high', 'medium', 'low', 'uncertain'] as const
export type ConfidenceLevel = typeof CONFIDENCE_LEVELS[number]

// ============= SCORING WEIGHTS =============
// These are the weights used in deterministic scoring (total = 100)

export const SCORING_WEIGHTS = {
  ENTITY_MATCH: 20,        // Organization type match
  INDUSTRY_MATCH: 25,      // Industry/focus area match
  GEOGRAPHY_MATCH: 15,     // Location match
  SIZE_MATCH: 10,          // Organization size appropriateness
  PURPOSE_MATCH: 15,       // Purpose/funding use match
  PREFERENCES_MATCH: 10,   // Timeline, complexity preferences
  QUALITY_BONUS: 5,        // Data quality bonus
} as const

// Hard filter thresholds
export const HARD_FILTER_CONFIG = {
  REQUIRE_URL: true,
  ALLOW_UNKNOWN_STATUS: true,  // Allow but penalize
  UNKNOWN_STATUS_PENALTY: 20,  // Score penalty for unknown status
  MIN_QUALITY_SCORE: 0.2,      // Below this, exclude entirely
} as const

// ============= HELPER FUNCTIONS =============

/**
 * Normalize a string to a canonical tag
 */
export function normalizeToCanonical<T extends string>(
  input: string,
  canonicalList: readonly T[],
  synonyms?: Record<string, T>
): T | null {
  const normalized = input.toLowerCase().trim()

  // Direct match
  for (const canonical of canonicalList) {
    if (canonical.toLowerCase() === normalized) {
      return canonical
    }
  }

  // Synonym match
  if (synonyms && synonyms[normalized]) {
    return synonyms[normalized]
  }

  // Partial match (contains)
  for (const canonical of canonicalList) {
    if (canonical.toLowerCase().includes(normalized) || normalized.includes(canonical.toLowerCase())) {
      return canonical
    }
  }

  return null
}

/**
 * Get state code from state name or code
 */
export function normalizeState(input: string): string | null {
  const normalized = input.toUpperCase().trim()

  // Already a valid code
  if (US_STATES[normalized]) {
    return normalized
  }

  // Look up by name
  for (const [code, name] of Object.entries(US_STATES)) {
    if (name.toLowerCase() === input.toLowerCase().trim()) {
      return code
    }
  }

  return null
}

/**
 * Check if text contains any keywords from a list
 */
export function containsKeywords(text: string, keywords: string[]): boolean {
  const textLower = text.toLowerCase()
  return keywords.some(kw => textLower.includes(kw.toLowerCase()))
}

/**
 * Count matching keywords
 */
export function countKeywordMatches(text: string, keywords: string[]): number {
  const textLower = text.toLowerCase()
  return keywords.filter(kw => textLower.includes(kw.toLowerCase())).length
}

/**
 * Calculate grant size category from amount
 */
export function getGrantSizeCategory(amountMin?: number | null, amountMax?: number | null): GrantSizeCategory {
  const amount = amountMax || amountMin || 0

  if (amount < 10000) return 'micro'
  if (amount < 50000) return 'small'
  if (amount < 250000) return 'medium'
  return 'large'
}

/**
 * Format funding display string
 */
export function formatFundingDisplay(
  min: number | null | undefined,
  max: number | null | undefined,
  text?: string | null
): string {
  if (text) return text
  if (min && max && min !== max) {
    return `$${min.toLocaleString()} - $${max.toLocaleString()}`
  }
  if (max) return `Up to $${max.toLocaleString()}`
  if (min) return `From $${min.toLocaleString()}`
  return 'Varies'
}
