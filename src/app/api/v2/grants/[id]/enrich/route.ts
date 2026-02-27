import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getAIClient, GEMINI_MODEL, isGeminiConfigured } from '@/lib/services/gemini-client';
import { sanitizePromptInput } from '@/lib/utils/prompt-sanitizer';
import { z } from 'zod';

interface EnrichmentRequest {
  grantTitle: string;
  grantSponsor: string;
  grantDescription: string;
  userState: string;
  deadlineDisplay: string;
  applyUrl: string;
}

interface EnrichmentResponse {
  success: boolean;
  stateDeadline?: {
    date: string;
    display: string;
    isStateSpecific: boolean;
    note?: string;
  };
  expandedDescription?: string;
  applicationSteps?: Array<{
    title: string;
    description: string;
    tips?: string[];
  }>;
  eligibilityDetails?: Array<{
    requirement: string;
    explanation: string;
    whatYouNeed?: string[];
  }>;
  fundingBreakdown?: Array<{
    category: string;
    description: string;
    typicalRange?: string;
  }>;
  error?: string;
}

const enrichmentSchema = z.object({
  grantTitle: z.string().min(1, 'Grant title is required'),
  grantSponsor: z.string().min(1, 'Grant sponsor is required'),
  grantDescription: z.string().min(1, 'Grant description is required'),
  userState: z.string().min(1, 'User state is required'),
  deadlineDisplay: z.string().default(''),
  applyUrl: z.string().default(''),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = enrichmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { grantTitle, grantSponsor, grantDescription, userState, deadlineDisplay, applyUrl } = parsed.data;

    const ai = getAIClient();
    if (!ai) {
      return NextResponse.json({
        success: false,
        error: 'Gemini API key not configured',
      });
    }

    const sanitizedState = sanitizePromptInput(userState, 100)
    const prompt = `You are an expert on US agricultural grants. Analyze this grant and provide detailed, accurate information.

GRANT INFORMATION:
- Title: ${sanitizePromptInput(grantTitle, 500)}
- Sponsor: ${sanitizePromptInput(grantSponsor, 500)}
- Description: ${sanitizePromptInput(grantDescription)}
- Current Deadline Display: ${sanitizePromptInput(deadlineDisplay, 200)}
- Apply URL: ${sanitizePromptInput(applyUrl, 500)}
- User's State: ${sanitizedState}

Please provide the following in JSON format:

1. stateDeadline: Find the specific deadline for ${sanitizedState} if this grant has state-specific deadlines. Many USDA programs have different application windows by state or region.
   - date: ISO date string if known, or null
   - display: Human readable date (e.g., "November 15, 2026" or "Rolling - contact your local office")
   - isStateSpecific: true if this is specific to ${sanitizedState}, false if it's a general deadline
   - note: Any important notes about the deadline (e.g., "Applications accepted year-round but reviewed quarterly")

2. expandedDescription: A 2-3 paragraph detailed explanation of:
   - What this grant is specifically designed to fund
   - The types of projects that are ideal candidates
   - What makes an application competitive
   - Any important context about the program's goals

3. applicationSteps: Array of 3-5 steps to apply, each with:
   - title: Step name
   - description: What to do
   - tips: Array of 1-2 practical tips

4. eligibilityDetails: Array of 3-5 ACTUAL eligibility requirements that applicants must meet. Focus ONLY on concrete criteria such as:
   - Farm size requirements (e.g., "Must operate less than 500 acres")
   - Income thresholds (e.g., "Annual gross farm income under $350,000")
   - Geographic requirements (e.g., "Must be located in a designated rural area")
   - Experience requirements (e.g., "Must have 3+ years of farming experience")
   - Entity type (e.g., "Must be a legal US citizen or permanent resident")
   - Land ownership/lease requirements
   - Prior participation rules

   DO NOT include generic items like "Simple application process", "Multiple funding options", or "Flexible terms" - these are NOT requirements.

   Each requirement should have:
   - requirement: The actual eligibility criterion (be specific)
   - explanation: Plain English explanation of what this means
   - whatYouNeed: Array of specific documents or proof the applicant needs

5. fundingBreakdown: Array of 2-4 funding categories showing what can be funded:
   - category: Category name
   - description: What's covered
   - typicalRange: Typical funding range for this category if known

Respond ONLY with valid JSON, no markdown or explanation.`;

    const result = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        temperature: 0.2,
        maxOutputTokens: 4096,
        responseMimeType: 'application/json',
      },
    });
    const text = result.text ?? '';

    // Parse the JSON response
    let parsedResponse;
    try {
      // Remove any markdown code blocks if present (fallback)
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedResponse = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response');
      return NextResponse.json({
        success: false,
        error: 'Failed to parse AI response',
      });
    }

    return NextResponse.json({
      success: true,
      ...parsedResponse,
    } as EnrichmentResponse);
  } catch (error) {
    console.error('Grant enrichment error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to enrich grant data',
    });
  }
}
