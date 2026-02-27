# AI Integration Upgrade Design

**Date:** 2026-02-27
**Status:** Approved

## Problem
AI analysis generation is broken/unreliable across the application. Grant discovery, eligibility checks, writing assistance, and chat all suffer from outdated models, fragile JSON parsing, missing retry logic, and silent failures.

## Solution

### Model Strategy
- **Primary model:** `gemini-2.0-flash` for all tasks (same free tier as 1.5 Flash, better output quality)
- **Enable Google Search grounding** for grant discovery to find real, current grants

### Implementation Plan

#### 1. SDK + Client Upgrade (`gemini-client.ts`)
- Upgrade `@google/generative-ai` to latest
- Switch all model references to `gemini-2.0-flash`
- Add retry with exponential backoff to core generation functions
- Use SDK's native JSON mode (`responseMimeType: 'application/json'`) properly
- Add request timeout handling

#### 2. Grant Discovery Fix (`gemini-grant-discovery.ts`)
- Enable Google Search grounding via SDK `tools` config
- Fix hardcoded "2024 2025" → dynamic current year
- Improve JSON extraction reliability
- Better error propagation

#### 3. All AI Services - Robustness
- Standardize error handling across all 6 services
- Fix `generateJSON` to use proper JSON mode consistently
- Remove fragile regex-based JSON extraction where possible

#### 4. API Routes - Error Feedback
- Return actionable error messages to frontend
- Distinguish error types (missing key, rate limit, model error, parse error)

#### 5. Frontend Error Handling
- Surface meaningful error messages
- Add retry capability

### Out of Scope
- No architectural changes to the pipeline
- No new AI features
- No auth/DB/layout changes
- No prompt sanitizer changes
