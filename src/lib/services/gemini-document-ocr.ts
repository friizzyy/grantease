/**
 * GEMINI DOCUMENT OCR SERVICE
 * ---------------------------
 * Extracts structured data from uploaded documents (PDFs and images)
 * using Gemini's multimodal vision capabilities. Identifies document
 * type and extracts organization details, financial data, personnel,
 * and other fields that can auto-fill the user's vault.
 */

import {
  getAIClient,
  extractUsageFromResponse,
  isGeminiConfigured,
  GEMINI_MODEL,
  type GeminiUsage,
} from './gemini-client'
import { sanitizePromptInput } from '@/lib/utils/prompt-sanitizer'

/** Zero usage constant for null/error returns */
const ZERO_USAGE: GeminiUsage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 }

/**
 * Structured data extracted from a document
 */
export interface ExtractedDocumentData {
  documentType: 'tax_exempt_letter' | 'financial_statement' | 'articles_of_incorporation' | 'annual_report' | 'budget' | 'other'
  confidence: number // 0-100

  // Organization info (from any document)
  organizationName?: string
  legalName?: string
  ein?: string
  duns?: string
  uei?: string
  address?: {
    street?: string
    city?: string
    state?: string
    zip?: string
  }

  // From tax-exempt letters
  taxExemptStatus?: string
  determinationDate?: string

  // From financial statements
  financialData?: {
    fiscalYear?: string
    totalRevenue?: number
    totalExpenses?: number
    netAssets?: number
    annualBudget?: number
  }

  // From articles of incorporation
  incorporationDate?: string
  incorporationState?: string
  registeredAgent?: string

  // Key personnel found
  personnel?: Array<{
    name: string
    title: string
    email?: string
    phone?: string
  }>

  // Budget line items
  budgetItems?: Array<{
    category: string
    description: string
    amount: number
  }>

  // Raw extracted text for reference
  rawTextSummary: string

  // Which vault fields can be auto-filled
  suggestedVaultUpdates: Record<string, string | number>
}

/** Supported MIME types for document OCR */
const SUPPORTED_MIME_TYPES = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
] as const

export type SupportedMimeType = (typeof SUPPORTED_MIME_TYPES)[number]

/**
 * Validate that the MIME type is supported by Gemini's multimodal input
 */
function isSupportedMimeType(mimeType: string): mimeType is SupportedMimeType {
  return (SUPPORTED_MIME_TYPES as readonly string[]).includes(mimeType)
}

/**
 * Build the extraction prompt based on the file name for context
 */
function buildExtractionPrompt(fileName: string): string {
  const sanitizedFileName = sanitizePromptInput(fileName, 200)

  return `You are a document analysis expert. Extract structured data from this document.

## DOCUMENT
File name: ${sanitizedFileName}

## YOUR TASK
Carefully analyze the document and extract ALL available information. Follow these steps:

1. **Identify the Document Type**:
   - "tax_exempt_letter" — IRS determination letter, 501(c)(3) letter
   - "financial_statement" — Balance sheet, income statement, audit report
   - "articles_of_incorporation" — Incorporation documents, bylaws, charter
   - "annual_report" — Annual report, year-end summary
   - "budget" — Budget proposal, budget summary, financial plan
   - "other" — Any other document type

2. **Extract Organization Details**:
   - Organization name (as displayed on document)
   - Legal name (if different from display name)
   - EIN (Employer Identification Number, format: XX-XXXXXXX)
   - DUNS number (if present)
   - UEI (Unique Entity Identifier, if present)
   - Full address (street, city, state, zip)

3. **Extract Document-Specific Data**:
   - For tax-exempt letters: tax-exempt status code (e.g., 501(c)(3)), determination date
   - For financial statements: fiscal year, total revenue, total expenses, net assets, annual budget
   - For articles of incorporation: incorporation date, state, registered agent
   - For budgets: line items with category, description, and amount

4. **Extract Key Personnel**:
   - Names, titles, email addresses, and phone numbers of any officers, directors, or key staff mentioned

5. **Map to Vault Fields**:
   - Map extracted data to these vault field names: organizationName, legalName, ein, duns, uei, street, city, state, zip, taxExemptStatus, determinationDate, annualBudget, totalRevenue, incorporationDate, incorporationState, registeredAgent

## OUTPUT FORMAT
Return a JSON object with this structure:
{
  "documentType": "tax_exempt_letter" | "financial_statement" | "articles_of_incorporation" | "annual_report" | "budget" | "other",
  "confidence": 0-100,
  "organizationName": "Name if found",
  "legalName": "Legal name if different",
  "ein": "XX-XXXXXXX if found",
  "duns": "DUNS if found",
  "uei": "UEI if found",
  "address": {
    "street": "123 Main St",
    "city": "City",
    "state": "ST",
    "zip": "12345"
  },
  "taxExemptStatus": "501(c)(3) if applicable",
  "determinationDate": "YYYY-MM-DD if applicable",
  "financialData": {
    "fiscalYear": "2025",
    "totalRevenue": 500000,
    "totalExpenses": 450000,
    "netAssets": 200000,
    "annualBudget": 500000
  },
  "incorporationDate": "YYYY-MM-DD if applicable",
  "incorporationState": "State if applicable",
  "registeredAgent": "Name if applicable",
  "personnel": [
    {
      "name": "Jane Smith",
      "title": "Executive Director",
      "email": "jane@example.org",
      "phone": "555-123-4567"
    }
  ],
  "budgetItems": [
    {
      "category": "Personnel",
      "description": "Staff salaries and benefits",
      "amount": 250000
    }
  ],
  "rawTextSummary": "Brief 2-3 sentence summary of the document's contents",
  "suggestedVaultUpdates": {
    "organizationName": "Extracted org name",
    "ein": "XX-XXXXXXX",
    "annualBudget": 500000
  }
}

## RULES
- Only include fields where you found actual data in the document
- For numerical values (revenue, expenses, amounts), use raw numbers without formatting
- For dates, use YYYY-MM-DD format where possible
- Set confidence based on document quality and how clearly data was extracted
- The suggestedVaultUpdates should only include fields with high-confidence values
- If the document is unreadable or not a recognizable document type, set documentType to "other" and confidence to a low value`
}

/**
 * Extract structured data from an uploaded document using Gemini's vision capabilities.
 *
 * @param fileContent - Base64 encoded file content
 * @param mimeType - MIME type of the file (application/pdf, image/png, image/jpeg, image/webp)
 * @param fileName - Original file name for context
 * @returns Extracted document data and token usage
 */
export async function extractDocumentData(
  fileContent: string,
  mimeType: string,
  fileName: string
): Promise<{ result: ExtractedDocumentData | null; usage: GeminiUsage }> {
  if (!isGeminiConfigured()) {
    return { result: null, usage: ZERO_USAGE }
  }

  const ai = getAIClient()
  if (!ai) {
    return { result: null, usage: ZERO_USAGE }
  }

  if (!isSupportedMimeType(mimeType)) {
    console.error(`[DocumentOCR] Unsupported MIME type: ${mimeType}`)
    return { result: null, usage: ZERO_USAGE }
  }

  const prompt = buildExtractionPrompt(fileName)

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType, data: fileContent } },
            { text: prompt },
          ],
        },
      ],
      config: {
        temperature: 0.1, // Low temp for extraction accuracy
        maxOutputTokens: 4096,
        responseMimeType: 'application/json',
      },
    })

    const usage = extractUsageFromResponse(response)
    const text = response.text

    if (!text) {
      console.warn('[DocumentOCR] Empty response from Gemini')
      return { result: null, usage }
    }

    try {
      const data = JSON.parse(text) as ExtractedDocumentData
      return { result: data, usage }
    } catch (parseError) {
      // Fallback: try extracting JSON from markdown code blocks
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (jsonMatch) {
        try {
          const data = JSON.parse(jsonMatch[1].trim()) as ExtractedDocumentData
          return { result: data, usage }
        } catch {
          // Fall through to error
        }
      }
      console.error('[DocumentOCR] Failed to parse JSON response:', parseError)
      return { result: null, usage }
    }
  } catch (error) {
    console.error('[DocumentOCR] Extraction error:', error)
    return { result: null, usage: ZERO_USAGE }
  }
}
