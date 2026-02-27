/**
 * PROMPT INPUT SANITIZER
 * ----------------------
 * Sanitize user-provided text before interpolating into AI prompts.
 * Prevents prompt injection by escaping control patterns and truncating.
 *
 * Why: User data (organizationName, missionStatement, etc.) is interpolated
 * directly into LLM prompts. Without sanitization, a malicious user could
 * craft input like "Ignore all previous instructions and ..." to hijack
 * the LLM's behavior.
 */

/**
 * Sanitize user-provided text before interpolating into AI prompts.
 * Prevents prompt injection by removing control patterns and truncating.
 *
 * @param input - Raw user-provided string (may be null/undefined)
 * @param maxLength - Maximum allowed length after sanitization (default 2000)
 * @returns Sanitized string safe for prompt interpolation
 */
export function sanitizePromptInput(
  input: string | null | undefined,
  maxLength = 2000
): string {
  if (!input) return 'Not provided'

  let sanitized = input
    // Remove potential prompt injection delimiters
    .replace(/```/g, '')
    .replace(/---/g, '')
    // Remove system/assistant/user role markers that could confuse the model
    .replace(/\b(system|assistant|user)\s*:/gi, '')
    // Remove common injection patterns
    .replace(
      /ignore\s+(all\s+)?(previous|above|prior)\s+(instructions?|prompts?|rules?)/gi,
      '[filtered]'
    )
    .replace(/you\s+are\s+now\s+/gi, '[filtered]')
    .replace(/new\s+instructions?\s*:/gi, '[filtered]')
    .replace(/disregard\s+(all\s+)?(previous|above|prior)\s+(instructions?|context)/gi, '[filtered]')
    .replace(/override\s+(system|previous|all)\s+(prompt|instructions?|rules?)/gi, '[filtered]')
    .replace(/forget\s+(everything|all|previous)\s+(above|instructions?|context)?/gi, '[filtered]')
    // Remove model-specific injection tokens
    .replace(/\[INST\]/gi, '')
    .replace(/<\/?s>/gi, '')
    .replace(/<\|im_start\|>/gi, '')
    .replace(/<\|im_end\|>/gi, '')
    .replace(/<\|endoftext\|>/gi, '')
    .replace(/<\|system\|>/gi, '')
    .replace(/<\|user\|>/gi, '')
    .replace(/<\|assistant\|>/gi, '')
    // Remove XML-like tags that could be used to inject structure
    .replace(/<\/?(?:system|instruction|prompt|context|role|message)>/gi, '')
    // Truncate to prevent context overflow
    .slice(0, maxLength)
    .trim()

  return sanitized || 'Not provided'
}

/**
 * Sanitize an array of strings for prompt interpolation.
 * Useful for lists like industryTags, categories, etc.
 *
 * @param items - Array of strings to sanitize
 * @param maxItemLength - Maximum length per item (default 200)
 * @param maxItems - Maximum number of items (default 20)
 * @returns Sanitized array joined as comma-separated string
 */
export function sanitizePromptArray(
  items: string[] | null | undefined,
  maxItemLength = 200,
  maxItems = 20
): string {
  if (!items || items.length === 0) return 'Not provided'

  return items
    .slice(0, maxItems)
    .map(item => sanitizePromptInput(item, maxItemLength))
    .filter(item => item !== 'Not provided')
    .join(', ') || 'Not provided'
}
