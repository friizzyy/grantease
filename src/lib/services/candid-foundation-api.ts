/**
 * Candid Foundation Directory API Adapter
 *
 * Candid (formerly Foundation Center + GuideStar) provides a comprehensive
 * database of U.S. foundation grants via REST API.
 *
 * Documentation: https://developer.candid.org/
 * Auth: Requires CANDID_API_KEY environment variable (Subscription-Key header)
 *
 * Rate limits: Respect 1 req/sec recommended; adapter enforces delay between calls.
 */

import { type IngestionSourceConfig } from '@/lib/ingestion/types';
import type { NormalizedGrant } from '@/lib/services/grant-sources';

// ==================== Candid API Response Types ====================

export interface CandidGrant {
  id: string;
  title: string;
  description: string;
  funder: string;
  funderUrl?: string;
  amount?: number;
  recipientType?: string[];
  grantSubject?: string[];
  geoFocus?: string[];
  year?: number;
  url?: string;
}

export interface CandidSearchParams {
  keyword?: string;
  state?: string;
  subject?: string;
  recipientType?: string;
  page?: number;
  pageSize?: number;
}

interface CandidApiResponse {
  grants: CandidApiGrant[];
  total_count: number;
  page: number;
  per_page: number;
  total_pages: number;
}

interface CandidApiGrant {
  grant_key: string;
  grant_description: string;
  grant_amount: number | null;
  grant_year: number;
  grant_duration_months?: number;
  grant_subject?: CandidTaxonomyItem[];
  grant_population?: CandidTaxonomyItem[];
  grant_transaction_type?: string;
  grant_support_type?: string;
  funder: CandidFunder;
  recipient?: CandidRecipient;
  geo_area_served?: CandidGeoArea[];
}

interface CandidFunder {
  funder_key: string;
  funder_name: string;
  funder_city?: string;
  funder_state?: string;
  funder_ein?: string;
  funder_profile_url?: string;
}

interface CandidRecipient {
  recipient_key: string;
  recipient_name: string;
  recipient_city?: string;
  recipient_state?: string;
  recipient_ein?: string;
  recipient_type?: string;
}

interface CandidTaxonomyItem {
  code: string;
  description: string;
}

interface CandidGeoArea {
  area_type: string; // 'state', 'country', 'county', 'city', 'national'
  area_code?: string;
  area_name: string;
}

// ==================== Constants ====================

const CANDID_BASE_URL = 'https://api.candid.org/grants/v1';

const DEFAULT_PAGE_SIZE = 50;
const MAX_PAGE_SIZE = 100;
const REQUEST_DELAY_MS = 1500;

/**
 * Mapping from Candid Philanthropy Classification System (PCS) subjects
 * to GrantEase internal categories
 */
const CANDID_SUBJECT_TO_CATEGORY: Record<string, string> = {
  'Arts and culture': 'arts_culture',
  'Education': 'education',
  'Environment and animals': 'environment',
  'Health': 'health',
  'Human services': 'community_development',
  'International affairs, development and peace': 'community_development',
  'Public affairs/society benefit': 'community_development',
  'Religion': 'community_development',
  'Science and technology': 'research',
  'Social sciences': 'research',
  'Community improvement and capacity building': 'community_development',
  'Philanthropy, voluntarism and grantmaking foundations': 'community_development',
  'Recreation, leisure and sports': 'arts_culture',
  'Youth development': 'education',
  'Crime and justice': 'community_development',
  'Employment': 'business',
  'Food, agriculture and nutrition': 'agriculture',
  'Housing and shelter': 'community_development',
  'Mutual and membership benefit': 'business',
};

/**
 * Mapping from Candid recipient types to GrantEase entity types
 */
const CANDID_RECIPIENT_TO_ENTITY: Record<string, string> = {
  'Public charity': 'nonprofit',
  'Private foundation': 'nonprofit',
  'Community foundation': 'nonprofit',
  'Operating foundation': 'nonprofit',
  'Corporate giving program': 'for_profit',
  'Government agency': 'government',
  'Educational institution': 'educational',
  'Hospital': 'nonprofit',
  'Religious organization': 'nonprofit',
  'Tribal organization': 'tribal',
  'Individual': 'individual',
};

// ==================== Configuration Check ====================

/** Check if Candid API credentials are configured */
export function isCandidConfigured(): boolean {
  return !!process.env.CANDID_API_KEY;
}

// ==================== API Client ====================

/** Delay helper for rate limiting */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Make an authenticated request to the Candid API
 *
 * @param path - API path relative to base URL (e.g., '/search')
 * @param params - URL query parameters
 * @returns Parsed JSON response
 */
async function candidFetch<T>(
  path: string,
  params: Record<string, string | number | undefined>
): Promise<T> {
  const apiKey = process.env.CANDID_API_KEY;
  if (!apiKey) {
    throw new Error('CANDID_API_KEY environment variable is not set');
  }

  // Build URL with query params, filtering out undefined values
  const url = new URL(`${CANDID_BASE_URL}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Subscription-Key': apiKey,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => 'Unknown error');
    throw new Error(
      `Candid API error: ${response.status} ${response.statusText} - ${errorBody}`
    );
  }

  return response.json() as Promise<T>;
}

// ==================== Search ====================

/**
 * Search Candid for foundation grants
 *
 * Supports keyword search, geographic filtering, subject filtering,
 * and pagination. Returns normalized results with total count.
 */
export async function searchCandidGrants(params: CandidSearchParams): Promise<{
  grants: CandidGrant[];
  total: number;
  page: number;
  totalPages: number;
}> {
  if (!isCandidConfigured()) {
    return { grants: [], total: 0, page: 0, totalPages: 0 };
  }

  const pageSize = Math.min(params.pageSize || DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
  const page = params.page || 1;

  const response = await candidFetch<CandidApiResponse>('/search', {
    keyword: params.keyword,
    state: params.state,
    subject: params.subject,
    recipient_type: params.recipientType,
    page: page,
    per_page: pageSize,
  });

  const grants = response.grants.map(mapApiGrantToCandidGrant);

  return {
    grants,
    total: response.total_count,
    page: response.page,
    totalPages: response.total_pages,
  };
}

/**
 * Fetch all pages of Candid grants for a given search.
 * Uses rate-limited sequential fetching to respect API limits.
 *
 * @param params - Search parameters (page/pageSize will be overridden)
 * @param maxPages - Maximum number of pages to fetch (default: 10)
 * @returns All collected grants plus metadata
 */
export async function fetchAllCandidGrants(
  params: CandidSearchParams,
  maxPages: number = 10
): Promise<{
  grants: CandidGrant[];
  total: number;
  pagesFetched: number;
}> {
  if (!isCandidConfigured()) {
    return { grants: [], total: 0, pagesFetched: 0 };
  }

  const allGrants: CandidGrant[] = [];
  let currentPage = 1;
  let totalPages = 1;
  let total = 0;

  while (currentPage <= Math.min(totalPages, maxPages)) {
    const result = await searchCandidGrants({
      ...params,
      page: currentPage,
      pageSize: MAX_PAGE_SIZE,
    });

    allGrants.push(...result.grants);
    total = result.total;
    totalPages = result.totalPages;

    currentPage++;

    // Rate limit between paginated requests
    if (currentPage <= totalPages) {
      await delay(REQUEST_DELAY_MS);
    }
  }

  return {
    grants: allGrants,
    total,
    pagesFetched: currentPage - 1,
  };
}

// ==================== Normalization ====================

/**
 * Map a raw Candid API grant to the CandidGrant interface
 */
function mapApiGrantToCandidGrant(apiGrant: CandidApiGrant): CandidGrant {
  return {
    id: apiGrant.grant_key,
    title: apiGrant.grant_description?.slice(0, 200) || 'Untitled Grant',
    description: apiGrant.grant_description || '',
    funder: apiGrant.funder.funder_name,
    funderUrl: apiGrant.funder.funder_profile_url,
    amount: apiGrant.grant_amount ?? undefined,
    recipientType: apiGrant.recipient?.recipient_type
      ? [apiGrant.recipient.recipient_type]
      : undefined,
    grantSubject: apiGrant.grant_subject?.map((s) => s.description),
    geoFocus: apiGrant.geo_area_served?.map((g) => g.area_name),
    year: apiGrant.grant_year,
    url: apiGrant.funder.funder_profile_url
      ? `${apiGrant.funder.funder_profile_url}#grants`
      : `https://candid.org/grants/${apiGrant.grant_key}`,
  };
}

/**
 * Convert a CandidGrant to the NormalizedGrant format used by the
 * GrantEase grant-sources system.
 *
 * This enables Candid grants to appear alongside Gemini-discovered
 * grants and other source results in the unified search UI.
 */
export function normalizeCandidGrant(grant: CandidGrant): NormalizedGrant {
  // Map Candid subjects to GrantEase categories
  const categories = (grant.grantSubject || [])
    .map((subject) => CANDID_SUBJECT_TO_CATEGORY[subject])
    .filter((c): c is string => !!c);

  // Deduplicate categories
  const uniqueCategories = [...new Set(categories)];

  // Map recipient types to eligibility entity types
  const eligibility = (grant.recipientType || [])
    .map((type) => CANDID_RECIPIENT_TO_ENTITY[type])
    .filter((e): e is string => !!e);

  const uniqueEligibility = [...new Set(eligibility)];

  // Build location list from geo focus areas
  const locations = grant.geoFocus || [];

  // Format amount text
  let amountText: string | null = null;
  if (grant.amount) {
    amountText = `$${grant.amount.toLocaleString('en-US')}`;
  }

  return {
    id: `candid-${grant.id}`,
    sourceId: grant.id,
    sourceName: 'candid-foundation',
    sourceLabel: 'Candid Foundation Directory',
    type: 'grant',
    title: grant.title,
    sponsor: grant.funder,
    summary: grant.description.slice(0, 500),
    description: grant.description,
    categories: uniqueCategories.length > 0 ? uniqueCategories : ['community_development'],
    eligibility: uniqueEligibility.length > 0 ? uniqueEligibility : ['nonprofit'],
    locations,
    amountMin: grant.amount ?? null,
    amountMax: grant.amount ?? null,
    amountText,
    deadlineDate: null, // Candid grants are historical records; no active deadline
    deadlineType: 'rolling',
    url: grant.url || `https://candid.org/grants/${grant.id}`,
    status: 'open',
    isLive: true,
    confidence: 85,
    metadata: {
      funderUrl: grant.funderUrl,
      grantYear: grant.year,
      grantSubjects: grant.grantSubject,
      geoFocus: grant.geoFocus,
    },
  };
}

/**
 * Search Candid and return results in the NormalizedGrant format,
 * ready for use in the unified grant search pipeline.
 */
export async function searchCandidNormalized(params: CandidSearchParams): Promise<{
  grants: NormalizedGrant[];
  total: number;
  page: number;
}> {
  const result = await searchCandidGrants(params);

  return {
    grants: result.grants.map(normalizeCandidGrant),
    total: result.total,
    page: result.page,
  };
}

// ==================== Source Config Export ====================

/**
 * Get the IngestionSourceConfig for Candid, suitable for use
 * with the ingestion pipeline defined in src/lib/ingestion/sources.ts.
 *
 * This is exported for programmatic access; the static config
 * is already registered in GRANT_SOURCES as 'foundation_directory'.
 */
export function getCandidSourceConfig(): IngestionSourceConfig {
  return {
    id: 'foundation_directory',
    name: 'foundation_directory',
    displayName: 'Candid Foundation Directory',
    type: 'api',
    enabled: isCandidConfigured(),
    priority: 8,
    baseUrl: 'https://api.candid.org',
    requestDelayMs: REQUEST_DELAY_MS,
    maxConcurrent: 2,
    scheduleIntervalHours: 168,
    respectsRobotsTxt: true,
    requiresAttribution: true,
    attributionText: 'Data provided by Candid',

    apiConfig: {
      endpoint: `${CANDID_BASE_URL}/search`,
      method: 'GET',
      headers: {
        'Subscription-Key': process.env.CANDID_API_KEY || '',
      },
      authType: 'api_key',
      apiKeyParam: 'Subscription-Key',
      responseFormat: 'json',
      grantsPath: 'grants',
      paginationParam: 'page',
      pageSizeParam: 'per_page',
      pageSize: DEFAULT_PAGE_SIZE,
    },

    extractionHints: {
      entityTypeMapping: CANDID_RECIPIENT_TO_ENTITY,
      categoryMapping: CANDID_SUBJECT_TO_CATEGORY,
    },
  };
}
