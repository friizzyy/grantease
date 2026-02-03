/**
 * ONBOARDING TYPES
 * ----------------
 * Type definitions for the progressive onboarding system
 */

// Entity types that can apply for grants
export type EntityType =
  | 'individual'
  | 'nonprofit'
  | 'small_business'
  | 'for_profit'
  | 'educational'
  | 'government'
  | 'tribal'

export const ENTITY_TYPES: { value: EntityType; label: string; description: string; icon: string }[] = [
  { value: 'individual', label: 'Individual / Researcher', description: 'Independent professional, artist, or researcher', icon: 'User' },
  { value: 'nonprofit', label: 'Nonprofit Organization', description: '501(c)(3) or other tax-exempt organization', icon: 'Heart' },
  { value: 'small_business', label: 'Small Business', description: 'Under 500 employees, for-profit company', icon: 'Building2' },
  { value: 'for_profit', label: 'For-Profit Business', description: 'Larger company or corporation', icon: 'Briefcase' },
  { value: 'educational', label: 'Educational Institution', description: 'School, college, university, or training center', icon: 'GraduationCap' },
  { value: 'government', label: 'Government Entity', description: 'Local, state, or federal government agency', icon: 'Landmark' },
  { value: 'tribal', label: 'Tribal Organization', description: 'Native American tribe or tribal organization', icon: 'Users' },
]

// Industry/domain categories (aligned with grant categories)
export const INDUSTRY_CATEGORIES: { value: string; label: string; icon: string }[] = [
  { value: 'agriculture', label: 'Agriculture & Food', icon: 'Wheat' },
  { value: 'arts_culture', label: 'Arts & Culture', icon: 'Palette' },
  { value: 'business', label: 'Business & Entrepreneurship', icon: 'TrendingUp' },
  { value: 'climate', label: 'Climate & Environment', icon: 'Leaf' },
  { value: 'community', label: 'Community Development', icon: 'Users' },
  { value: 'education', label: 'Education', icon: 'BookOpen' },
  { value: 'health', label: 'Health & Wellness', icon: 'Activity' },
  { value: 'housing', label: 'Housing', icon: 'Home' },
  { value: 'infrastructure', label: 'Infrastructure', icon: 'Building' },
  { value: 'nonprofit', label: 'Nonprofit Operations', icon: 'Heart' },
  { value: 'research', label: 'Research & Science', icon: 'Microscope' },
  { value: 'technology', label: 'Technology & Innovation', icon: 'Cpu' },
  { value: 'workforce', label: 'Workforce Development', icon: 'Briefcase' },
  { value: 'youth', label: 'Youth & Families', icon: 'Baby' },
]

// Size bands for organizations
export type SizeBand = 'solo' | 'small' | 'medium' | 'large'

export const SIZE_BANDS: { value: SizeBand; label: string; description: string }[] = [
  { value: 'solo', label: 'Solo / Just me', description: '1 person' },
  { value: 'small', label: 'Small team', description: '2-10 people' },
  { value: 'medium', label: 'Medium', description: '11-50 people' },
  { value: 'large', label: 'Large', description: '50+ people' },
]

// Organization stages
export type Stage = 'idea' | 'early' | 'growth' | 'established'

export const STAGES: { value: Stage; label: string; description: string }[] = [
  { value: 'idea', label: 'Idea stage', description: 'Exploring or planning' },
  { value: 'early', label: 'Early stage', description: 'Recently started, under 2 years' },
  { value: 'growth', label: 'Growth stage', description: '2-5 years, expanding' },
  { value: 'established', label: 'Established', description: '5+ years, stable operations' },
]

// Budget ranges
export type BudgetRange = 'under_100k' | '100k_500k' | '500k_1m' | '1m_5m' | 'over_5m'

export const BUDGET_RANGES: { value: BudgetRange; label: string }[] = [
  { value: 'under_100k', label: 'Under $100,000' },
  { value: '100k_500k', label: '$100,000 - $500,000' },
  { value: '500k_1m', label: '$500,000 - $1 million' },
  { value: '1m_5m', label: '$1 million - $5 million' },
  { value: 'over_5m', label: 'Over $5 million' },
]

// Grant size preferences
export type GrantSizePreference = 'micro' | 'small' | 'medium' | 'large' | 'any'

export const GRANT_SIZE_PREFERENCES: { value: GrantSizePreference; label: string; description: string }[] = [
  { value: 'micro', label: 'Micro grants', description: 'Under $10,000' },
  { value: 'small', label: 'Small grants', description: '$10,000 - $50,000' },
  { value: 'medium', label: 'Medium grants', description: '$50,000 - $250,000' },
  { value: 'large', label: 'Large grants', description: 'Over $250,000' },
  { value: 'any', label: 'Any size', description: 'Show all grant sizes' },
]

// Timeline preferences
export type TimelinePreference = 'immediate' | 'quarter' | 'half_year' | 'flexible'

export const TIMELINE_PREFERENCES: { value: TimelinePreference; label: string; description: string }[] = [
  { value: 'immediate', label: 'Urgent', description: 'Need funding within 1-2 months' },
  { value: 'quarter', label: 'Near-term', description: 'Planning for next 3-6 months' },
  { value: 'half_year', label: 'Long-term', description: '6+ months out' },
  { value: 'flexible', label: 'Flexible', description: 'No specific timeline' },
]

// Complexity tolerance
export type ComplexityPreference = 'simple' | 'moderate' | 'any'

export const COMPLEXITY_PREFERENCES: { value: ComplexityPreference; label: string; description: string }[] = [
  { value: 'simple', label: 'Simple only', description: 'Short applications, minimal requirements' },
  { value: 'moderate', label: 'Moderate', description: 'Standard applications, some documentation' },
  { value: 'any', label: 'Any complexity', description: 'Including complex federal grants' },
]

// Industry-specific question definitions
export interface IndustryQuestion {
  id: string
  question: string
  type: 'single' | 'multi' | 'boolean'
  options?: { value: string; label: string }[]
  appliesTo: string[] // Which industries this question applies to
}

export const INDUSTRY_QUESTIONS: IndustryQuestion[] = [
  // Education
  {
    id: 'education_level',
    question: 'What education level do you serve?',
    type: 'multi',
    options: [
      { value: 'k12', label: 'K-12 Education' },
      { value: 'higher_ed', label: 'Higher Education' },
      { value: 'adult_ed', label: 'Adult Education' },
      { value: 'vocational', label: 'Vocational/Technical' },
    ],
    appliesTo: ['education'],
  },
  {
    id: 'research_focus',
    question: 'Do you have a research or academic focus?',
    type: 'boolean',
    appliesTo: ['education', 'health', 'technology', 'research'],
  },
  // Health
  {
    id: 'health_type',
    question: 'What type of health work do you do?',
    type: 'multi',
    options: [
      { value: 'clinical', label: 'Clinical Services' },
      { value: 'community', label: 'Community Health' },
      { value: 'mental', label: 'Mental Health' },
      { value: 'research', label: 'Health Research' },
      { value: 'public', label: 'Public Health' },
    ],
    appliesTo: ['health'],
  },
  // Technology
  {
    id: 'tech_focus',
    question: 'What is your technology focus?',
    type: 'multi',
    options: [
      { value: 'software', label: 'Software Development' },
      { value: 'hardware', label: 'Hardware/Manufacturing' },
      { value: 'ai_ml', label: 'AI / Machine Learning' },
      { value: 'cleantech', label: 'Clean Technology' },
      { value: 'biotech', label: 'Biotechnology' },
    ],
    appliesTo: ['technology'],
  },
  // Agriculture
  {
    id: 'ag_type',
    question: 'What type of agricultural work?',
    type: 'multi',
    options: [
      { value: 'farming', label: 'Farming/Production' },
      { value: 'processing', label: 'Food Processing' },
      { value: 'distribution', label: 'Distribution/Retail' },
      { value: 'research', label: 'Agricultural Research' },
      { value: 'conservation', label: 'Land Conservation' },
    ],
    appliesTo: ['agriculture'],
  },
  // Arts & Culture
  {
    id: 'arts_type',
    question: 'What type of arts/cultural work?',
    type: 'multi',
    options: [
      { value: 'performing', label: 'Performing Arts' },
      { value: 'visual', label: 'Visual Arts' },
      { value: 'literary', label: 'Literary Arts' },
      { value: 'media', label: 'Film/Media' },
      { value: 'heritage', label: 'Cultural Heritage' },
    ],
    appliesTo: ['arts_culture'],
  },
  // Community
  {
    id: 'community_focus',
    question: 'What community areas do you focus on?',
    type: 'multi',
    options: [
      { value: 'housing', label: 'Housing Access' },
      { value: 'economic', label: 'Economic Development' },
      { value: 'social_services', label: 'Social Services' },
      { value: 'civic', label: 'Civic Engagement' },
      { value: 'rural', label: 'Rural Development' },
    ],
    appliesTo: ['community'],
  },
  // Climate
  {
    id: 'climate_focus',
    question: 'What environmental areas do you work in?',
    type: 'multi',
    options: [
      { value: 'renewable', label: 'Renewable Energy' },
      { value: 'conservation', label: 'Conservation' },
      { value: 'sustainability', label: 'Sustainability' },
      { value: 'resilience', label: 'Climate Resilience' },
      { value: 'justice', label: 'Environmental Justice' },
    ],
    appliesTo: ['climate'],
  },
]

// US States for geography selection
export const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'DC', label: 'District of Columbia' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'PR', label: 'Puerto Rico' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'VI', label: 'Virgin Islands' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
]

// Full onboarding state
export interface OnboardingState {
  currentStep: number
  // Step 1
  entityType: EntityType | null
  country: string
  state: string | null
  // Step 2
  industryTags: string[]
  // Step 3
  sizeBand: SizeBand | null
  stage: Stage | null
  annualBudget: BudgetRange | null
  // Step 4
  industryAttributes: Record<string, string | string[] | boolean>
  // Step 5
  grantPreferences: {
    preferredSize: GrantSizePreference | null
    timeline: TimelinePreference | null
    complexity: ComplexityPreference | null
  }
}

// Default onboarding state
export const DEFAULT_ONBOARDING_STATE: OnboardingState = {
  currentStep: 1,
  entityType: null,
  country: 'US',
  state: null,
  industryTags: [],
  sizeBand: null,
  stage: null,
  annualBudget: null,
  industryAttributes: {},
  grantPreferences: {
    preferredSize: null,
    timeline: null,
    complexity: null,
  },
}

// User profile as stored in DB (JSON-parsed)
export interface UserProfile {
  id: string
  userId: string
  entityType: EntityType
  country: string
  state: string | null
  industryTags: string[]
  sizeBand: SizeBand | null
  stage: Stage | null
  annualBudget: BudgetRange | null
  industryAttributes: Record<string, string | string[] | boolean>
  grantPreferences: {
    preferredSize: GrantSizePreference | null
    timeline: TimelinePreference | null
    complexity: ComplexityPreference | null
  }
  onboardingCompleted: boolean
  onboardingCompletedAt: Date | null
  onboardingStep: number
  confidenceScore: number
}
