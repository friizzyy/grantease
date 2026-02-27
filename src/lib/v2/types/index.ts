/**
 * GRANTS V2 - TYPE DEFINITIONS
 * ============================
 * Clean, minimal types for the small farm MVP.
 * No legacy baggage.
 */

// ============= USER PROFILE =============

export type FarmType = 'crop' | 'cattle' | 'mixed' | 'specialty';

export type OperatorType = 'individual' | 'small_business';

export type FundingGoal = 'irrigation' | 'equipment' | 'land_development' | 'cattle' | 'conservation' | 'operating';

export type AcresBand = 'under_50' | '50_100' | '100_500' | '500_1000' | 'over_1000';

export interface FarmProfileV2 {
  id: string;
  userId: string;

  // Location
  state: string;           // 2-letter state code (e.g., "CA")
  county?: string | null;  // Optional county

  // Farm details
  farmType: FarmType;
  acresBand: AcresBand;
  operatorType: OperatorType;
  employeeCount: number;   // Must be <= 15

  // Funding goals (multi-select)
  goals: FundingGoal[];

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  version: number;
}

// ============= GRANTS =============

export type GeographyScope = 'national' | 'regional' | 'state' | 'county';

export type GrantStatus = 'open' | 'closed' | 'rolling';

export type ApplicantType = 'individual' | 'small_business' | 'farm' | 'ranch' | 'cooperative';

// Who typically applies - used for filtering
export type TypicalApplicant = 'small_farm' | 'institution' | 'mixed';

// How confident we are about eligibility
export type EligibilityConfidence = 'high' | 'medium' | 'low';

export interface GrantV2 {
  id: string;

  // Core info
  title: string;
  sponsor: string;
  applyUrl: string;

  // Summary
  summaryShort: string;      // 1-2 sentences
  descriptionClean: string;  // Full description

  // Geography
  geographyScope: GeographyScope;
  statesIncluded: string[];  // Empty for national

  // Purpose/eligibility
  purposeTags: FundingGoal[];
  applicantTypes: ApplicantType[];
  maxEmployees: number;      // Max employee count allowed (0 = no limit)

  // === SMALL FARM ELIGIBILITY GATES (CRITICAL) ===
  smallFarmFriendly: boolean;       // Can small farms realistically apply?
  institutionOnly: boolean;         // Restricted to universities/NGOs/municipalities?
  typicalApplicant: TypicalApplicant; // Who usually gets this?
  eligibilityConfidence: EligibilityConfidence; // How sure are we?

  // Funding
  fundingMin: number | null;
  fundingMax: number | null;
  fundingDisplay: string;    // "Up to $500,000" or "Varies"

  // Deadline
  deadlineType: 'fixed' | 'rolling';
  deadlineDate: string | null;  // ISO date string
  deadlineDisplay: string;      // "Rolling" or "March 15, 2025"

  // Requirements
  requirementsBullets: string[];

  // Quality
  qualityScore: number;  // 0-100

  // Metadata
  source: string;        // "usda", "ca_state", "manual"
  lastVerified: string;  // ISO date
}

// ============= MATCHING =============

export interface MatchResultV2 {
  grant: GrantV2;
  score: number;           // 0-100
  matchReasons: string[];  // Why this matches
  warnings: string[];      // Things to verify
}

export interface DiscoverResponseV2 {
  grants: MatchResultV2[];
  total: number;
  profile: {
    state: string;
    farmType: FarmType;
    goals: FundingGoal[];
  };
  filters: {
    appliedFilters: string[];
    grantsBeforeFilter: number;
    grantsAfterFilter: number;
  };
}

// ============= API TYPES =============

export interface OnboardingRequestV2 {
  state: string;
  county?: string;
  farmType: FarmType;
  acresBand: AcresBand;
  operatorType: OperatorType;
  employeeCount: number;
  goals: FundingGoal[];
}

export interface OnboardingResponseV2 {
  success: boolean;
  profile: FarmProfileV2;
  message: string;
}
