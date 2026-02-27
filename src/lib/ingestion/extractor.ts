/**
 * LLM-Assisted Grant Extraction
 *
 * Uses Gemini to extract structured grant data from raw text.
 * The LLM only assists with extraction - it does NOT replace scraping.
 */

import { getGeminiExtractionModel } from '@/lib/services/gemini-client';
import {
  RawGrantPage,
  ExtractedGrant,
  LLMExtractionRequest,
  LLMExtractionResponse,
  IngestionError,
} from './types';
import { ENTITY_TYPE_MAP, CATEGORY_MAP, STATE_CODES } from './sources';
import { sanitizePromptInput } from '@/lib/utils/prompt-sanitizer';

// Extraction prompt template
const EXTRACTION_PROMPT = `You are a grant data extraction system. Extract structured grant information from the provided text.

CRITICAL RULES:
1. ONLY extract information that is EXPLICITLY stated in the text
2. DO NOT guess, infer, or make up any information
3. Use null for fields where information is not found
4. Extract exact text for amounts and dates when found
5. Be conservative - it's better to leave fields null than to guess

SOURCE: {SOURCE_NAME}
URL: {SOURCE_URL}

RAW TEXT:
{RAW_TEXT}

{PRE_EXTRACTED}

Extract the following fields and return ONLY valid JSON (no markdown, no explanation):

{
  "title": "string - exact grant/program title",
  "sponsor": "string - funding agency or organization name",
  "description": "string - full description of the grant",
  "summary": "string - 1-2 sentence summary (you may write this)",
  "applyUrl": "string or null - URL to apply or learn more",
  "funding": {
    "min": "number or null - minimum funding amount in dollars",
    "max": "number or null - maximum funding amount in dollars",
    "text": "string or null - original funding text exactly as written",
    "type": "grant|loan|rebate|tax_credit|forgivable_loan|unknown"
  },
  "deadline": {
    "type": "fixed|rolling|unknown",
    "date": "string or null - ISO date format YYYY-MM-DD if found",
    "text": "string or null - original deadline text"
  },
  "postedDate": "string or null - ISO date format if found",
  "geography": {
    "isNational": "boolean - true if available nationwide",
    "states": ["array of 2-letter state codes if state-specific"],
    "isLocalOnly": "boolean - true if only local/county level",
    "serviceAreaText": "string or null - original geographic text"
  },
  "eligibility": {
    "entityTypes": ["array: nonprofit, small_business, individual, for_profit, educational, government, tribal"],
    "industries": ["array of relevant industries/sectors"],
    "restrictions": ["array of who is NOT eligible"],
    "requirements": ["array of eligibility requirements"],
    "budgetMin": "number or null - minimum org budget required",
    "budgetMax": "number or null - maximum org budget allowed",
    "citizenshipRequired": "boolean",
    "samRequired": "boolean - SAM.gov registration required",
    "ruralOnly": "boolean",
    "urbanOnly": "boolean"
  },
  "categories": ["array of relevant categories: agriculture, arts_culture, business, community_development, education, energy, environment, health, research, technology, transportation"],
  "purposeTags": ["array: equipment, hiring, R&D, sustainability, expansion, training, capital, operating, etc."],
  "requirements": {
    "documents": ["array of required documents"],
    "certifications": ["array of required certifications"],
    "registrations": ["array of required registrations like SAM, DUNS, etc."],
    "other": ["array of other requirements"]
  },
  "contact": {
    "name": "string or null",
    "email": "string or null",
    "phone": "string or null",
    "agency": "string or null"
  },
  "confidence": "number 0-100 - how confident are you in this extraction"
}`;

/**
 * Extract grant data using Gemini LLM
 */
export async function extractWithLLM(
  request: LLMExtractionRequest
): Promise<LLMExtractionResponse> {
  try {
    const model = getGeminiExtractionModel();
    if (!model) {
      return {
        success: false,
        confidence: 0,
        error: 'Gemini API key not configured',
      };
    }

    // Build pre-extracted context (sanitize scraped content for prompt safety)
    let preExtractedText = '';
    if (request.preExtracted) {
      preExtractedText = '\nPRE-EXTRACTED HINTS (verify these against the text):';
      if (request.preExtracted.title) {
        preExtractedText += `\n- Title hint: ${sanitizePromptInput(request.preExtracted.title, 500)}`;
      }
      if (request.preExtracted.sponsor) {
        preExtractedText += `\n- Sponsor hint: ${sanitizePromptInput(request.preExtracted.sponsor, 500)}`;
      }
      if (request.preExtracted.deadlineText) {
        preExtractedText += `\n- Deadline hint: ${sanitizePromptInput(request.preExtracted.deadlineText, 200)}`;
      }
      if (request.preExtracted.amountText) {
        preExtractedText += `\n- Amount hint: ${sanitizePromptInput(request.preExtracted.amountText, 200)}`;
      }
    }

    // Truncate raw text to prevent token overflow and sanitize for prompt safety
    const maxTextLength = 15000;
    const rawText = sanitizePromptInput(request.rawText, maxTextLength);

    const prompt = EXTRACTION_PROMPT.replace('{SOURCE_NAME}', sanitizePromptInput(request.sourceName, 200))
      .replace('{SOURCE_URL}', sanitizePromptInput(request.sourceUrl, 500))
      .replace('{RAW_TEXT}', rawText)
      .replace('{PRE_EXTRACTED}', preExtractedText);

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse JSON from response
    let jsonText = text;

    // Handle markdown code blocks
    const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }

    // Try to parse
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(jsonText.trim());
    } catch {
      // Try to fix common JSON issues
      jsonText = jsonText
        .replace(/,\s*}/g, '}')
        .replace(/,\s*]/g, ']')
        .replace(/'/g, '"');
      try {
        parsed = JSON.parse(jsonText.trim());
      } catch {
        return {
          success: false,
          confidence: 0,
          error: 'Failed to parse LLM response as JSON',
        };
      }
    }

    // Map to ExtractedGrant
    const grant = mapParsedToGrant(parsed, request);

    return {
      success: true,
      grant,
      confidence: (parsed.confidence as number) || 50,
      warnings: validateExtraction(grant),
    };
  } catch (error) {
    return {
      success: false,
      confidence: 0,
      error: error instanceof Error ? error.message : 'Unknown extraction error',
    };
  }
}

/**
 * Map parsed JSON to ExtractedGrant type
 */
function mapParsedToGrant(
  parsed: Record<string, unknown>,
  request: LLMExtractionRequest
): ExtractedGrant {
  const funding = (parsed.funding as Record<string, unknown>) || {};
  const deadline = (parsed.deadline as Record<string, unknown>) || {};
  const geography = (parsed.geography as Record<string, unknown>) || {};
  const eligibility = (parsed.eligibility as Record<string, unknown>) || {};
  const requirements = (parsed.requirements as Record<string, unknown>) || {};
  const contact = (parsed.contact as Record<string, unknown>) || {};

  return {
    sourceId: generateSourceId(request.sourceUrl),
    sourceName: request.sourceName,
    sourceUrl: request.sourceUrl,

    title: String(parsed.title || 'Untitled Grant'),
    sponsor: String(parsed.sponsor || 'Unknown Sponsor'),
    description: String(parsed.description || ''),
    applyUrl: String(parsed.applyUrl || request.sourceUrl),
    summary: String(parsed.summary || ''),

    funding: {
      min: parseNumber(funding.min),
      max: parseNumber(funding.max),
      text: funding.text as string | undefined,
      type: normalizeFundingType(funding.type as string),
    },

    deadline: {
      type: normalizeDeadlineType(deadline.type as string),
      date: parseDate(deadline.date as string),
      text: deadline.text as string | undefined,
    },

    postedDate: parseDate(parsed.postedDate as string),

    geography: {
      isNational: Boolean(geography.isNational),
      states: normalizeStates(geography.states as string[]),
      isLocalOnly: Boolean(geography.isLocalOnly),
      serviceAreaText: geography.serviceAreaText as string | undefined,
    },

    eligibility: {
      entityTypes: normalizeEntityTypes(eligibility.entityTypes as string[]),
      industries: normalizeCategories(eligibility.industries as string[]),
      restrictions: (eligibility.restrictions as string[]) || [],
      requirements: (eligibility.requirements as string[]) || [],
      budgetMin: parseNumber(eligibility.budgetMin),
      budgetMax: parseNumber(eligibility.budgetMax),
      citizenshipRequired: Boolean(eligibility.citizenshipRequired),
      samRequired: Boolean(eligibility.samRequired),
      ruralOnly: Boolean(eligibility.ruralOnly),
      urbanOnly: Boolean(eligibility.urbanOnly),
    },

    categories: normalizeCategories(parsed.categories as string[]),
    purposeTags: (parsed.purposeTags as string[]) || [],

    requirements: {
      documents: (requirements.documents as string[]) || [],
      certifications: (requirements.certifications as string[]) || [],
      registrations: (requirements.registrations as string[]) || [],
      other: (requirements.other as string[]) || [],
    },

    contact: {
      name: contact.name as string | undefined,
      email: contact.email as string | undefined,
      phone: contact.phone as string | undefined,
      agency: contact.agency as string | undefined,
    },

    extractionConfidence: parseNumber(parsed.confidence) || 50,
    rawTextSnapshot: request.rawText.substring(0, 5000),
  };
}

/**
 * Generate a source ID from URL
 */
function generateSourceId(url: string): string {
  // Use URL path and query as ID base
  try {
    const parsed = new URL(url);
    const base = parsed.pathname + parsed.search;
    // Create a short hash
    const hash = require('crypto').createHash('sha256').update(base).digest('hex');
    return hash.substring(0, 16);
  } catch {
    return require('crypto').createHash('sha256').update(url).digest('hex').substring(0, 16);
  }
}

/**
 * Parse a number from various formats
 */
function parseNumber(value: unknown): number | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    // Remove currency symbols and commas
    const cleaned = value.replace(/[$,]/g, '').trim();
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
}

/**
 * Parse a date from various formats
 */
function parseDate(value: unknown): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? undefined : parsed;
  }
  return undefined;
}

/**
 * Normalize funding type
 */
function normalizeFundingType(
  type: string | undefined
): 'grant' | 'loan' | 'rebate' | 'tax_credit' | 'forgivable_loan' | 'unknown' {
  if (!type) return 'unknown';
  const normalized = type.toLowerCase().trim();
  const validTypes = ['grant', 'loan', 'rebate', 'tax_credit', 'forgivable_loan'];
  if (validTypes.includes(normalized)) {
    return normalized as 'grant' | 'loan' | 'rebate' | 'tax_credit' | 'forgivable_loan';
  }
  return 'unknown';
}

/**
 * Normalize deadline type
 */
function normalizeDeadlineType(
  type: string | undefined
): 'fixed' | 'rolling' | 'unknown' {
  if (!type) return 'unknown';
  const normalized = type.toLowerCase().trim();
  if (normalized === 'fixed') return 'fixed';
  if (normalized === 'rolling' || normalized === 'ongoing' || normalized === 'open') {
    return 'rolling';
  }
  return 'unknown';
}

/**
 * Normalize state codes
 */
function normalizeStates(states: string[] | undefined): string[] {
  if (!states || !Array.isArray(states)) return [];

  return states
    .map((state) => {
      if (!state) return null;
      const upper = state.toUpperCase().trim();

      // Already a valid code
      if (STATE_CODES[upper]) return upper;

      // Try to find by name
      for (const [code, name] of Object.entries(STATE_CODES)) {
        if (name.toLowerCase() === state.toLowerCase().trim()) {
          return code;
        }
      }

      return null;
    })
    .filter((s): s is string => s !== null);
}

/**
 * Normalize entity types
 */
function normalizeEntityTypes(types: string[] | undefined): string[] {
  if (!types || !Array.isArray(types)) return [];

  return types
    .map((type) => {
      if (!type) return null;
      const lower = type.toLowerCase().trim();
      return ENTITY_TYPE_MAP[lower] || null;
    })
    .filter((t): t is string => t !== null);
}

/**
 * Normalize categories
 */
function normalizeCategories(categories: string[] | undefined): string[] {
  if (!categories || !Array.isArray(categories)) return [];

  return categories
    .map((cat) => {
      if (!cat) return null;
      const lower = cat.toLowerCase().trim();
      return CATEGORY_MAP[lower] || lower;
    })
    .filter((c): c is string => c !== null);
}

/**
 * Validate extraction and return warnings
 */
function validateExtraction(grant: ExtractedGrant): string[] {
  const warnings: string[] = [];

  if (!grant.title || grant.title === 'Untitled Grant') {
    warnings.push('Missing or default title');
  }

  if (!grant.sponsor || grant.sponsor === 'Unknown Sponsor') {
    warnings.push('Missing or default sponsor');
  }

  if (!grant.description || grant.description.length < 50) {
    warnings.push('Missing or very short description');
  }

  if (!grant.applyUrl || grant.applyUrl === grant.sourceUrl) {
    warnings.push('No dedicated apply URL found');
  }

  if (!grant.funding.min && !grant.funding.max && !grant.funding.text) {
    warnings.push('No funding information found');
  }

  if (grant.deadline.type === 'unknown' && !grant.deadline.text) {
    warnings.push('No deadline information found');
  }

  if (grant.eligibility.entityTypes.length === 0) {
    warnings.push('No eligible entity types identified');
  }

  if (grant.extractionConfidence < 50) {
    warnings.push('Low extraction confidence');
  }

  return warnings;
}

/**
 * Batch extract grants with rate limiting
 */
export async function batchExtract(
  pages: RawGrantPage[],
  onProgress?: (processed: number, total: number, current?: string) => void
): Promise<{
  extracted: ExtractedGrant[];
  errors: IngestionError[];
}> {
  const extracted: ExtractedGrant[] = [];
  const errors: IngestionError[] = [];

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    onProgress?.(i, pages.length, page.pageUrl);

    const request: LLMExtractionRequest = {
      rawText: page.rawText,
      sourceUrl: page.pageUrl,
      sourceName: page.sourceName,
      preExtracted: page.preExtracted,
    };

    const result = await extractWithLLM(request);

    if (result.success && result.grant) {
      extracted.push(result.grant);
    } else {
      errors.push({
        timestamp: new Date(),
        stage: 'extract',
        url: page.pageUrl,
        message: result.error || 'Extraction failed',
        recoverable: true,
      });
    }

    // Rate limit - 10 requests per minute to Gemini
    if (i < pages.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 6000));
    }
  }

  return { extracted, errors };
}

/**
 * Extract grant from API response (for API-based sources)
 */
export function extractFromApiResponse(
  data: Record<string, unknown>,
  sourceName: string
): ExtractedGrant | null {
  try {
    // Handle grants.gov format
    if (sourceName === 'grants_gov') {
      return extractGrantsGovGrant(data);
    }

    // Handle SBIR format
    if (sourceName === 'sbir_gov') {
      return extractSbirGrant(data);
    }

    // Generic mapping
    return {
      sourceId: String(data.id || data.opportunityId || data.number || ''),
      sourceName,
      sourceUrl: String(data.url || data.link || ''),
      title: String(data.title || data.opportunityTitle || data.name || 'Untitled'),
      sponsor: String(data.agency || data.sponsor || data.agencyName || 'Unknown'),
      description: String(data.description || data.synopsis || ''),
      summary: String(data.summary || data.description || '').substring(0, 500),
      applyUrl: String(data.applyUrl || data.url || data.link || ''),
      funding: {
        min: parseNumber(data.awardFloor || data.minAmount),
        max: parseNumber(data.awardCeiling || data.maxAmount),
        text: String(data.awardText || data.fundingAmount || ''),
        type: 'grant',
      },
      deadline: {
        type: data.deadline ? 'fixed' : 'unknown',
        date: parseDate(data.deadline || data.closeDate || data.dueDate),
        text: String(data.deadlineText || data.closeDate || ''),
      },
      postedDate: parseDate(data.postedDate || data.openDate),
      geography: {
        isNational: true,
        states: [],
      },
      eligibility: {
        entityTypes: [],
        requirements: [],
      },
      categories: [],
      purposeTags: [],
      extractionConfidence: 70,
    };
  } catch {
    return null;
  }
}

/**
 * Extract from Grants.gov API format
 */
function extractGrantsGovGrant(data: Record<string, unknown>): ExtractedGrant {
  const eligibilityTypes: string[] = [];

  // Map Grants.gov eligibility codes
  const eligCodes = (data.eligibleApplicants as string) || '';
  if (eligCodes.includes('25') || eligCodes.includes('nonprofits')) {
    eligibilityTypes.push('nonprofit');
  }
  if (eligCodes.includes('05') || eligCodes.includes('small')) {
    eligibilityTypes.push('small_business');
  }
  if (eligCodes.includes('06') || eligCodes.includes('higher education')) {
    eligibilityTypes.push('educational');
  }
  if (eligCodes.includes('00') || eligCodes.includes('state') || eligCodes.includes('local')) {
    eligibilityTypes.push('government');
  }
  if (eligCodes.includes('04') || eligCodes.includes('individual')) {
    eligibilityTypes.push('individual');
  }
  if (eligCodes.includes('07') || eligCodes.includes('tribal')) {
    eligibilityTypes.push('tribal');
  }

  return {
    sourceId: String(data.id || data.opportunityId || data.oppNum || ''),
    sourceName: 'grants_gov',
    sourceUrl: `https://www.grants.gov/search-results-detail/${data.id || data.opportunityId}`,
    title: String(data.title || data.opportunityTitle || ''),
    sponsor: String(data.agencyName || data.agency || ''),
    description: String(data.description || data.synopsis || ''),
    summary: String(data.synopsis || data.description || '').substring(0, 500),
    applyUrl: `https://www.grants.gov/search-results-detail/${data.id || data.opportunityId}`,
    funding: {
      min: parseNumber(data.awardFloor),
      max: parseNumber(data.awardCeiling),
      text: data.awardFloor || data.awardCeiling
        ? `$${data.awardFloor || '0'} - $${data.awardCeiling || 'varies'}`
        : undefined,
      type: 'grant',
    },
    deadline: {
      type: data.closeDate ? 'fixed' : 'unknown',
      date: parseDate(data.closeDate),
      text: data.closeDate as string | undefined,
    },
    postedDate: parseDate(data.openDate || data.postedDate),
    geography: {
      isNational: true,
      states: [],
    },
    eligibility: {
      entityTypes: eligibilityTypes,
      requirements: [],
      samRequired: true, // Most federal grants require SAM
    },
    categories: mapGrantsGovCategories(data.category as string),
    purposeTags: [],
    extractionConfidence: 85,
  };
}

/**
 * Map Grants.gov category codes to our taxonomy
 */
function mapGrantsGovCategories(categoryCode: string | undefined): string[] {
  if (!categoryCode) return [];

  const categoryMap: Record<string, string[]> = {
    AG: ['agriculture'],
    AR: ['arts_culture'],
    BC: ['business', 'community_development'],
    CD: ['community_development'],
    CP: ['environment'],
    DPR: ['research'],
    ED: ['education'],
    ELT: ['education', 'technology'],
    EN: ['energy'],
    ENV: ['environment'],
    FN: ['business'],
    HL: ['health'],
    HO: ['community_development'],
    HU: ['arts_culture'],
    ISS: ['research', 'technology'],
    LJL: ['community_development'],
    NR: ['environment'],
    RA: ['research'],
    RD: ['community_development'],
    ST: ['research', 'technology'],
    T: ['transportation'],
    O: [],
  };

  return categoryMap[categoryCode] || [];
}

/**
 * Extract from SBIR API format
 */
function extractSbirGrant(data: Record<string, unknown>): ExtractedGrant {
  return {
    sourceId: String(data.solicitationId || data.id || ''),
    sourceName: 'sbir_gov',
    sourceUrl: `https://www.sbir.gov/node/${data.id || data.solicitationId}`,
    title: String(data.solicitationTitle || data.title || ''),
    sponsor: String(data.agency || 'Multiple Agencies'),
    description: String(data.description || data.abstract || ''),
    summary: String(data.abstract || data.description || '').substring(0, 500),
    applyUrl: String(data.applicationUrl || data.url || `https://www.sbir.gov/node/${data.id}`),
    funding: {
      min: parseNumber(data.phase1Amount),
      max: parseNumber(data.phase2Amount || data.phase1Amount),
      text: data.phase1Amount ? `Phase I: $${data.phase1Amount}` : undefined,
      type: 'grant',
    },
    deadline: {
      type: data.closeDate ? 'fixed' : 'unknown',
      date: parseDate(data.closeDate || data.deadline),
      text: data.closeDate as string | undefined,
    },
    postedDate: parseDate(data.openDate || data.releaseDate),
    geography: {
      isNational: true,
      states: [],
    },
    eligibility: {
      entityTypes: ['small_business'],
      requirements: [
        'Must be a U.S. small business',
        'Fewer than 500 employees',
        '51% owned by U.S. citizens or permanent residents',
      ],
      citizenshipRequired: true,
    },
    categories: ['research', 'technology'],
    purposeTags: ['R&D', 'innovation'],
    extractionConfidence: 90,
  };
}
