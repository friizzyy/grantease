/**
 * USER DATA VAULT TYPES
 * ---------------------
 * Type definitions for the user data vault system.
 * The vault stores reusable information for grant applications.
 */

// ============= ORGANIZATION INFO =============

export interface OrganizationInfo {
  organizationName?: string | null
  organizationLegalName?: string | null
  dbaName?: string | null
  ein?: string | null
  dunsNumber?: string | null
  ueiNumber?: string | null
  cageCode?: string | null
  yearFounded?: number | null
  websiteUrl?: string | null
}

// ============= CONTACT INFO =============

export interface ContactInfo {
  primaryContactName?: string | null
  primaryContactTitle?: string | null
  primaryContactEmail?: string | null
  primaryContactPhone?: string | null
}

// ============= ADDRESS =============

export interface Address {
  streetAddress?: string | null
  streetAddress2?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
  country?: string
}

// ============= ORGANIZATION DETAILS =============

export interface OrganizationDetails {
  missionStatement?: string | null
  organizationHistory?: string | null
  serviceArea?: string | null
  populationsServed?: string[]
  annualOperatingBudget?: string | null
}

// ============= FINANCIAL INFO =============

export interface FinancialInfo {
  fiscalYearEnd?: string | null
  bankName?: string | null
  accountType?: string | null
  // Note: Routing and account numbers should be encrypted
}

// ============= REGISTRATIONS =============

export interface RegistrationInfo {
  samRegistered: boolean
  samExpirationDate?: Date | null
  nonprofitStatus?: string | null
  stateCharityReg: boolean
}

// ============= KEY PERSONNEL =============

export interface KeyPerson {
  id: string
  name: string
  title: string
  email?: string
  phone?: string
  bio?: string
  role: 'executive_director' | 'project_lead' | 'financial_officer' | 'board_member' | 'other'
  responsibilities?: string[]
}

// ============= BOARD MEMBER =============

export interface BoardMember {
  id: string
  name: string
  title?: string
  affiliation?: string
  termStart?: string
  termEnd?: string
}

// ============= CERTIFICATIONS =============

export type CertificationType =
  | 'minority_owned'
  | 'woman_owned'
  | 'veteran_owned'
  | 'disabled_owned'
  | 'small_disadvantaged'
  | 'hubzone'
  | '8a'
  | 'lgbtq_owned'
  | 'native_american_owned'
  | 'b_corp'
  | 'other'

export const CERTIFICATION_LABELS: Record<CertificationType, string> = {
  minority_owned: 'Minority-Owned Business',
  woman_owned: 'Woman-Owned Business',
  veteran_owned: 'Veteran-Owned Business',
  disabled_owned: 'Disability-Owned Business',
  small_disadvantaged: 'Small Disadvantaged Business',
  hubzone: 'HUBZone Certified',
  '8a': '8(a) Certified',
  lgbtq_owned: 'LGBTQ-Owned Business',
  native_american_owned: 'Native American-Owned',
  b_corp: 'Certified B Corporation',
  other: 'Other Certification',
}

// ============= COMPLETE VAULT =============

export interface UserVault {
  id: string
  userId: string

  // Organization Info
  organizationName?: string | null
  organizationLegalName?: string | null
  dbaName?: string | null
  ein?: string | null
  dunsNumber?: string | null
  ueiNumber?: string | null
  cageCode?: string | null
  yearFounded?: number | null
  websiteUrl?: string | null

  // Contact Info
  primaryContactName?: string | null
  primaryContactTitle?: string | null
  primaryContactEmail?: string | null
  primaryContactPhone?: string | null

  // Physical Address
  streetAddress?: string | null
  streetAddress2?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
  country: string

  // Mailing Address
  mailingStreetAddress?: string | null
  mailingStreetAddress2?: string | null
  mailingCity?: string | null
  mailingState?: string | null
  mailingZipCode?: string | null
  mailingCountry?: string | null

  // Organization Details
  missionStatement?: string | null
  organizationHistory?: string | null
  serviceArea?: string | null
  populationsServed?: string | null // JSON string
  annualOperatingBudget?: string | null

  // Financial
  fiscalYearEnd?: string | null
  bankName?: string | null
  accountType?: string | null

  // Registrations
  samRegistered: boolean
  samExpirationDate?: Date | null
  nonprofitStatus?: string | null
  stateCharityReg: boolean

  // JSON fields
  certifications: string // JSON array
  keyPersonnel: string // JSON array
  boardMembers: string // JSON array

  createdAt: Date
  updatedAt: Date
}

// Parsed vault with JSON fields resolved
export interface ParsedUserVault extends Omit<UserVault, 'certifications' | 'keyPersonnel' | 'boardMembers' | 'populationsServed'> {
  certifications: CertificationType[]
  keyPersonnel: KeyPerson[]
  boardMembers: BoardMember[]
  populationsServed: string[]
}

// ============= VAULT DOCUMENT =============

export type DocumentType =
  | 'tax_exempt_letter' // IRS determination letter
  | '990_form' // Annual nonprofit tax form
  | 'financial_statement' // Audited financials
  | 'annual_report'
  | 'organizational_chart'
  | 'board_resolution'
  | 'articles_of_incorporation'
  | 'bylaws'
  | 'conflict_of_interest_policy'
  | 'strategic_plan'
  | 'audit_report'
  | 'indirect_cost_rate'
  | 'sam_registration'
  | 'insurance_certificate'
  | 'w9'
  | 'support_letter'
  | 'mou' // Memorandum of Understanding
  | 'other'

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  tax_exempt_letter: 'IRS Determination Letter (501c3)',
  '990_form': 'Form 990',
  financial_statement: 'Financial Statements',
  annual_report: 'Annual Report',
  organizational_chart: 'Organizational Chart',
  board_resolution: 'Board Resolution',
  articles_of_incorporation: 'Articles of Incorporation',
  bylaws: 'Bylaws',
  conflict_of_interest_policy: 'Conflict of Interest Policy',
  strategic_plan: 'Strategic Plan',
  audit_report: 'Audit Report',
  indirect_cost_rate: 'Indirect Cost Rate Agreement',
  sam_registration: 'SAM.gov Registration',
  insurance_certificate: 'Certificate of Insurance',
  w9: 'W-9 Form',
  support_letter: 'Letter of Support',
  mou: 'Memorandum of Understanding',
  other: 'Other Document',
}

export interface VaultDocument {
  id: string
  vaultId: string
  name: string
  type: DocumentType
  description?: string | null
  fileName: string
  fileUrl: string
  fileSize: number
  mimeType: string
  documentDate?: Date | null
  expiresAt?: Date | null
  isPublic: boolean
  uploadedAt: Date
  lastUsedAt?: Date | null
  usageCount: number
  createdAt: Date
  updatedAt: Date
}

// ============= TEXT BLOCKS =============

export type TextBlockCategory =
  | 'mission_statement'
  | 'organization_history'
  | 'need_statement'
  | 'project_narrative'
  | 'goals_objectives'
  | 'methodology'
  | 'evaluation_plan'
  | 'sustainability_plan'
  | 'organizational_capacity'
  | 'community_impact'
  | 'diversity_equity'
  | 'collaboration'
  | 'other'

export const TEXT_BLOCK_LABELS: Record<TextBlockCategory, string> = {
  mission_statement: 'Mission Statement',
  organization_history: 'Organization History',
  need_statement: 'Statement of Need',
  project_narrative: 'Project Narrative',
  goals_objectives: 'Goals & Objectives',
  methodology: 'Methodology',
  evaluation_plan: 'Evaluation Plan',
  sustainability_plan: 'Sustainability Plan',
  organizational_capacity: 'Organizational Capacity',
  community_impact: 'Community Impact',
  diversity_equity: 'Diversity, Equity & Inclusion',
  collaboration: 'Partnerships & Collaboration',
  other: 'Other',
}

export interface VaultTextBlock {
  id: string
  vaultId: string
  title: string
  category: TextBlockCategory
  content: string
  wordCount: number
  shortVersion?: string | null
  longVersion?: string | null
  aiGenerated: boolean
  aiImproved: boolean
  lastAiEdit?: Date | null
  lastUsedAt?: Date | null
  usageCount: number
  createdAt: Date
  updatedAt: Date
}

// ============= BUDGET ITEMS =============

export type BudgetCategory =
  | 'personnel'
  | 'fringe_benefits'
  | 'travel'
  | 'equipment'
  | 'supplies'
  | 'contractual'
  | 'construction'
  | 'other_direct'
  | 'indirect'

export const BUDGET_CATEGORY_LABELS: Record<BudgetCategory, string> = {
  personnel: 'Personnel/Salaries',
  fringe_benefits: 'Fringe Benefits',
  travel: 'Travel',
  equipment: 'Equipment',
  supplies: 'Supplies',
  contractual: 'Contractual/Consultants',
  construction: 'Construction',
  other_direct: 'Other Direct Costs',
  indirect: 'Indirect Costs',
}

export interface VaultBudgetItem {
  id: string
  vaultId: string
  category: BudgetCategory
  itemName: string
  description?: string | null
  unitCost?: number | null
  quantity?: number | null
  totalCost: number
  salaryRate?: number | null
  ftePercent?: number | null
  fringeBenefits?: number | null
  justification?: string | null
  lastUsedAt?: Date | null
  usageCount: number
  createdAt: Date
  updatedAt: Date
}

// ============= VAULT COMPLETENESS =============

export interface VaultCompleteness {
  overall: number // 0-100
  sections: {
    organization: number
    contact: number
    address: number
    details: number
    registrations: number
    personnel: number
    documents: number
    textBlocks: number
  }
  missingCritical: string[] // List of critical missing fields
  recommendations: string[] // Suggestions for improvement
}

// ============= FORM STATE =============

export interface VaultFormState {
  // Which sections are expanded
  expandedSections: string[]
  // Current editing section
  editingSection?: string
  // Unsaved changes
  hasUnsavedChanges: boolean
  // Validation errors
  errors: Record<string, string>
}
