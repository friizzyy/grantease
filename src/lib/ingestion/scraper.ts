/**
 * Web Scraper Engine
 *
 * Responsible for fetching raw content from grant sources.
 * Does NOT rely on LLM for scraping - purely deterministic.
 */

import * as cheerio from 'cheerio';
import crypto from 'crypto';
import { IngestionSourceConfig, RawGrantPage, IngestionError } from './types';

// Rate limiting state
const rateLimitState: Record<
  string,
  {
    lastRequest: number;
    requestCount: number;
  }
> = {};

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Apply rate limiting for a source
 */
async function applyRateLimit(source: IngestionSourceConfig): Promise<void> {
  const state = rateLimitState[source.id] || { lastRequest: 0, requestCount: 0 };
  const now = Date.now();
  const timeSinceLastRequest = now - state.lastRequest;

  if (timeSinceLastRequest < source.requestDelayMs) {
    await sleep(source.requestDelayMs - timeSinceLastRequest);
  }

  rateLimitState[source.id] = {
    lastRequest: Date.now(),
    requestCount: state.requestCount + 1,
  };
}

/**
 * Generate content hash for deduplication
 */
function generateContentHash(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex').substring(0, 32);
}

/**
 * Fetch a single page with error handling
 */
async function fetchPage(
  url: string,
  source: IngestionSourceConfig
): Promise<{
  html: string;
  status: number;
  error?: IngestionError;
}> {
  try {
    await applyRateLimit(source);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'GrantEase/1.0 (Grant Discovery Bot; contact@grantease.io)',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    clearTimeout(timeout);

    const html = await response.text();

    return {
      html,
      status: response.status,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown fetch error';
    return {
      html: '',
      status: 0,
      error: {
        timestamp: new Date(),
        stage: 'scrape',
        url,
        message,
        recoverable: true,
      },
    };
  }
}

/**
 * Extract text content from HTML
 */
function extractTextContent(html: string): string {
  const $ = cheerio.load(html);

  // Remove script, style, and nav elements
  $('script, style, nav, header, footer, aside, [role="navigation"]').remove();

  // Get main content if available
  const mainContent = $('main, article, [role="main"], .content, #content').first();

  if (mainContent.length > 0) {
    return mainContent.text().replace(/\s+/g, ' ').trim();
  }

  // Fallback to body
  return $('body').text().replace(/\s+/g, ' ').trim();
}

/**
 * Pre-extract basic grant info using CSS selectors (before LLM)
 */
function preExtractGrantInfo(
  html: string,
  source: IngestionSourceConfig
): {
  title?: string;
  sponsor?: string;
  deadlineText?: string;
  amountText?: string;
} {
  if (!source.selectors) {
    return {};
  }

  const $ = cheerio.load(html);
  const result: Record<string, string | undefined> = {};

  const { title, sponsor, deadline, amount } = source.selectors;

  if (title) {
    result.title = $(title).first().text().trim();
  }

  if (sponsor) {
    result.sponsor = $(sponsor).first().text().trim();
  }

  if (deadline) {
    result.deadlineText = $(deadline).first().text().trim();
  }

  if (amount) {
    result.amountText = $(amount).first().text().trim();
  }

  return result;
}

/**
 * Extract grant links from a listing page
 */
function extractGrantLinks(
  html: string,
  source: IngestionSourceConfig,
  baseUrl: string
): string[] {
  const $ = cheerio.load(html);
  const links: string[] = [];

  const listSelector = source.selectors?.grantList || '.grant, .opportunity, .program';
  const linkSelector = source.selectors?.grantLink || 'a';

  $(listSelector).each((_: number, element: cheerio.Element) => {
    const link = $(element).find(linkSelector).attr('href') || $(element).attr('href');

    if (link) {
      // Resolve relative URLs
      try {
        const absoluteUrl = new URL(link, baseUrl).href;
        if (!links.includes(absoluteUrl)) {
          links.push(absoluteUrl);
        }
      } catch {
        // Invalid URL, skip
      }
    }
  });

  return links;
}

/**
 * Get next page URL for pagination
 */
function getNextPageUrl(
  html: string,
  source: IngestionSourceConfig,
  currentPage: number,
  baseUrl: string
): string | null {
  const $ = cheerio.load(html);

  // Try CSS selector for next page
  if (source.selectors?.nextPage) {
    const nextLink = $(source.selectors.nextPage).attr('href');
    if (nextLink) {
      try {
        return new URL(nextLink, baseUrl).href;
      } catch {
        // Invalid URL
      }
    }
  }

  // Try pagination pattern
  if (source.paginationPattern && source.maxPages && currentPage < source.maxPages) {
    return baseUrl + source.paginationPattern.replace('{page}', String(currentPage + 1));
  }

  return null;
}

/**
 * Scrape a single grant page
 */
export async function scrapeGrantPage(
  url: string,
  source: IngestionSourceConfig
): Promise<{
  page?: RawGrantPage;
  error?: IngestionError;
}> {
  const { html, status, error } = await fetchPage(url, source);

  if (error || status !== 200) {
    return {
      error: error || {
        timestamp: new Date(),
        stage: 'scrape',
        url,
        message: `HTTP ${status}`,
        recoverable: status >= 500,
      },
    };
  }

  const rawText = extractTextContent(html);
  const preExtracted = preExtractGrantInfo(html, source);

  const page: RawGrantPage = {
    sourceId: source.id,
    sourceName: source.name,
    sourceUrl: source.baseUrl,
    pageUrl: url,
    rawHtml: html,
    rawText,
    preExtracted,
    scrapedAt: new Date(),
    httpStatus: status,
    contentHash: generateContentHash(rawText),
  };

  return { page };
}

/**
 * Scrape all grants from a listing page (with pagination)
 */
export async function scrapeListingPage(
  source: IngestionSourceConfig,
  onProgress?: (message: string, count: number) => void
): Promise<{
  grantUrls: string[];
  errors: IngestionError[];
}> {
  const allUrls: string[] = [];
  const errors: IngestionError[] = [];

  const listingUrls = source.listingUrls || [source.baseUrl];

  for (const listingUrl of listingUrls) {
    let currentUrl: string | null = listingUrl;
    let pageNum = 1;

    while (currentUrl) {
      onProgress?.(`Scraping ${source.displayName} page ${pageNum}...`, allUrls.length);

      const { html, status, error } = await fetchPage(currentUrl, source);

      if (error) {
        errors.push(error);
        break;
      }

      if (status !== 200) {
        errors.push({
          timestamp: new Date(),
          stage: 'scrape',
          url: currentUrl,
          message: `HTTP ${status}`,
          recoverable: status >= 500,
        });
        break;
      }

      const grantLinks = extractGrantLinks(html, source, currentUrl);
      allUrls.push(...grantLinks.filter((u) => !allUrls.includes(u)));

      // Check for next page
      currentUrl = getNextPageUrl(html, source, pageNum, listingUrl);
      pageNum++;

      // Safety limit
      if (pageNum > (source.maxPages || 50)) {
        break;
      }
    }
  }

  return { grantUrls: allUrls, errors };
}

/**
 * Verify if a URL is still accessible (for link validation)
 */
export async function verifyUrl(url: string): Promise<{
  status: number;
  isValid: boolean;
  redirectUrl?: string;
}> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'GrantEase/1.0 (Link Validator)',
      },
    });

    clearTimeout(timeout);

    return {
      status: response.status,
      isValid: response.status >= 200 && response.status < 400,
      redirectUrl: response.redirected ? response.url : undefined,
    };
  } catch {
    return {
      status: 0,
      isValid: false,
    };
  }
}

/**
 * Batch verify URLs with rate limiting
 */
export async function batchVerifyUrls(
  urls: string[],
  concurrency: number = 5,
  delayMs: number = 200
): Promise<Map<string, { status: number; isValid: boolean }>> {
  const results = new Map<string, { status: number; isValid: boolean }>();

  // Process in batches
  for (let i = 0; i < urls.length; i += concurrency) {
    const batch = urls.slice(i, i + concurrency);

    const batchResults = await Promise.all(
      batch.map(async (url) => {
        const result = await verifyUrl(url);
        return { url, result };
      })
    );

    for (const { url, result } of batchResults) {
      results.set(url, { status: result.status, isValid: result.isValid });
    }

    // Rate limit between batches
    if (i + concurrency < urls.length) {
      await sleep(delayMs);
    }
  }

  return results;
}

// ==================== API-BASED SOURCES ====================

/**
 * Fetch grants from API-based sources (grants.gov, SBIR, etc.)
 */
export async function fetchFromApi(
  source: IngestionSourceConfig,
  onProgress?: (message: string, count: number) => void
): Promise<{
  rawGrants: unknown[];
  errors: IngestionError[];
}> {
  if (!source.apiConfig) {
    return {
      rawGrants: [],
      errors: [
        {
          timestamp: new Date(),
          stage: 'scrape',
          message: 'No API configuration for source',
          recoverable: false,
        },
      ],
    };
  }

  const { apiConfig } = source;
  const allGrants: unknown[] = [];
  const errors: IngestionError[] = [];

  let page = 0;
  let hasMore = true;
  const pageSize = apiConfig.pageSize || 100;

  while (hasMore) {
    await applyRateLimit(source);
    onProgress?.(`Fetching ${source.displayName} page ${page + 1}...`, allGrants.length);

    try {
      let url = apiConfig.endpoint;
      const headers: Record<string, string> = { ...apiConfig.headers };

      // Add pagination
      if (apiConfig.method === 'GET') {
        const params = new URLSearchParams();

        if (apiConfig.paginationParam) {
          params.set(apiConfig.paginationParam, String(page * pageSize));
        }
        if (apiConfig.pageSizeParam) {
          params.set(apiConfig.pageSizeParam, String(pageSize));
        }

        // Add API key if needed
        if (apiConfig.authType === 'api_key' && apiConfig.apiKeyParam) {
          const apiKey = process.env[`${source.id.toUpperCase()}_API_KEY`];
          if (apiKey) {
            params.set(apiConfig.apiKeyParam, apiKey);
          }
        }

        url += '?' + params.toString();
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 60000);

      let response: Response;

      if (apiConfig.method === 'POST') {
        const body: Record<string, unknown> = {};

        if (apiConfig.paginationParam) {
          body[apiConfig.paginationParam] = page * pageSize;
        }
        if (apiConfig.pageSizeParam) {
          body[apiConfig.pageSizeParam] = pageSize;
        }

        response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          body: JSON.stringify(body),
          signal: controller.signal,
        });
      } else {
        response = await fetch(url, {
          headers,
          signal: controller.signal,
        });
      }

      clearTimeout(timeout);

      if (!response.ok) {
        errors.push({
          timestamp: new Date(),
          stage: 'scrape',
          url,
          message: `API returned ${response.status}`,
          recoverable: response.status >= 500,
        });
        break;
      }

      const data = await response.json();

      // Extract grants from response
      let grants: unknown[] = data;
      if (apiConfig.grantsPath) {
        const pathParts = apiConfig.grantsPath.split('.');
        let current: unknown = data;
        for (const part of pathParts) {
          if (current && typeof current === 'object' && part in current) {
            current = (current as Record<string, unknown>)[part];
          } else {
            current = [];
            break;
          }
        }
        grants = Array.isArray(current) ? current : [];
      }

      if (grants.length === 0) {
        hasMore = false;
      } else {
        allGrants.push(...grants);
        page++;

        // Safety limit
        if (page > 100 || allGrants.length > 10000) {
          hasMore = false;
        }
      }
    } catch (error) {
      errors.push({
        timestamp: new Date(),
        stage: 'scrape',
        message: error instanceof Error ? error.message : 'Unknown API error',
        recoverable: true,
      });
      break;
    }
  }

  return { rawGrants: allGrants, errors };
}
