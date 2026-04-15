/**
 * EMAIL TOKEN UTILITIES
 * ---------------------
 * Stateless, HMAC-signed tokens for email-verification links.
 * Avoids a DB schema migration by encoding `{userId, email, exp}` directly in the token,
 * signed with NEXTAUTH_SECRET. Safe because:
 *   - Token is single-purpose (audience = "email-verify") and scoped to one userId+email
 *   - Expiry is enforced server-side on verification
 *   - Signing secret is server-only
 *
 * NOTE: If the user changes their email before verifying, the old token becomes invalid
 * because the encoded email no longer matches the DB row.
 */

import crypto from 'crypto'

const TOKEN_AUDIENCE = 'email-verify'
const DEFAULT_TTL_SECONDS = 60 * 60 * 24 // 24 hours

interface EmailVerifyPayload {
  uid: string
  email: string
  aud: typeof TOKEN_AUDIENCE
  exp: number // unix seconds
}

function getSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) {
    throw new Error('NEXTAUTH_SECRET is required to sign email tokens')
  }
  return secret
}

function base64urlEncode(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function base64urlDecode(str: string): Buffer {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((str.length + 3) % 4)
  return Buffer.from(padded, 'base64')
}

function sign(payload: string): string {
  return base64urlEncode(
    crypto.createHmac('sha256', getSecret()).update(payload).digest()
  )
}

/**
 * Create a signed email-verification token.
 */
export function createEmailVerifyToken(
  userId: string,
  email: string,
  ttlSeconds = DEFAULT_TTL_SECONDS
): string {
  const payload: EmailVerifyPayload = {
    uid: userId,
    email: email.toLowerCase().trim(),
    aud: TOKEN_AUDIENCE,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  }
  const payloadStr = base64urlEncode(Buffer.from(JSON.stringify(payload), 'utf8'))
  const signature = sign(payloadStr)
  return `${payloadStr}.${signature}`
}

/**
 * Verify a signed email-verification token.
 * Returns the payload if valid, or null if invalid/expired/tampered.
 */
export function verifyEmailVerifyToken(token: string): { userId: string; email: string } | null {
  if (!token || typeof token !== 'string') return null

  const parts = token.split('.')
  if (parts.length !== 2) return null

  const [payloadStr, providedSig] = parts

  // Constant-time signature comparison
  const expectedSig = sign(payloadStr)
  const a = Buffer.from(providedSig)
  const b = Buffer.from(expectedSig)
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return null
  }

  try {
    const payload = JSON.parse(base64urlDecode(payloadStr).toString('utf8')) as EmailVerifyPayload
    if (payload.aud !== TOKEN_AUDIENCE) return null
    if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) {
      return null
    }
    if (!payload.uid || !payload.email) return null
    return { userId: payload.uid, email: payload.email }
  } catch {
    return null
  }
}
