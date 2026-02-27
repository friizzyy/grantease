# SECURITY & AUTH AUDIT PROMPT
## GrantEase: Grant Discovery & Application Management Platform

**Project Context:** GrantEase uses NextAuth.js v4 for authentication, bcryptjs for password hashing, and implements comprehensive security measures including session management, CSRF/XSS protection, and user-scoped database queries. This audit verifies all security controls are properly implemented and functioning.

---

## STEP 1: NEXTAUTH.JS CONFIGURATION

### 1.1 NextAuth.js Setup & Providers

Verify NextAuth.js is properly configured with appropriate providers and callbacks.

**NextAuth.js Configuration File:**

```tsx
// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  // Session configuration
  session: {
    strategy: 'jwt', // Use JWT for stateless sessions
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Update token daily
  },

  // JWT configuration
  jwt: {
    secret: process.env.NEXTAUTH_SECRET!,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  // Providers
  providers: [
    // Credentials provider for email/password login
    CredentialsProvider({
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'you@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error('Invalid credentials');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          // Don't reveal if user exists (security)
          throw new Error('Invalid credentials');
        }

        // Verify password using bcryptjs
        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          throw new Error('Invalid credentials');
        }

        // Return user object (without password)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.avatar,
        };
      },
    }),

    // Google OAuth provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: false,
    }),
  ],

  // Callbacks
  callbacks: {
    // JWT callback - run when token is created/updated
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }

      // Link account on first signin
      if (account) {
        token.provider = account.provider;
      }

      return token;
    },

    // Session callback - run when session is checked
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
      }
      return session;
    },

    // Callback when user signs in
    async signIn({ user, account, profile }) {
      // OAuth accounts are auto-approved
      if (account?.type === 'oauth') {
        return true;
      }

      // Email/password accounts must be registered
      const userExists = await prisma.user.findUnique({
        where: { email: user.email },
      });

      return !!userExists;
    },

    // Callback when redirecting after sign in
    async redirect({ url, baseUrl }) {
      // Only allow redirects to same site
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (url.startsWith(baseUrl)) return url;
      return baseUrl;
    },
  },

  // Pages
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
    newUser: '/onboarding',
  },

  // Security options
  useSecureCookies: process.env.NODE_ENV === 'production',
  events: {
    signIn: async ({ user, isNewUser }) => {
      console.log(`User ${user.email} signed in (new: ${isNewUser})`);
      // Log sign-in events for security
      await logSecurityEvent({
        type: 'sign_in',
        userId: user.id,
        email: user.email,
        timestamp: new Date(),
      });
    },
    signOut: async ({ token }) => {
      console.log(`User signed out`);
    },
  },

  // Debug (disable in production)
  debug: process.env.NODE_ENV === 'development',
};

export const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

**NextAuth Configuration Verification:**

```prisma
// Database schema for NextAuth
model Account {
  id                 String  @id @default(cuid())
  userId             String
  type               String
  provider           String
  providerAccountId  String
  refresh_token      String?  @db.Text
  access_token       String?  @db.Text
  expires_at         Int?
  token_type         String?
  scope              String?
  id_token           String?  @db.Text
  session_state      String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@index([identifier])
}
```

**Verification Checklist:**
- [ ] NextAuth.js version is 4.x or higher
- [ ] NEXTAUTH_SECRET is set in .env (strong random value)
- [ ] NEXTAUTH_URL is correct in environment
- [ ] Session strategy is JWT (stateless)
- [ ] Session maxAge is reasonable (30 days max)
- [ ] JWT secret matches NEXTAUTH_SECRET
- [ ] Credentials provider verifies password
- [ ] OAuth providers are configured with valid credentials
- [ ] Google provider has `allowDangerousEmailAccountLinking: false`
- [ ] Callbacks properly handle user info and redirects
- [ ] Sign-in events are logged
- [ ] useSecureCookies is true in production
- [ ] Debug mode is disabled in production
- [ ] Database has NextAuth.js schema tables

**Verification Actions:**
1. Check `src/app/api/auth/[...nextauth]/route.ts` for configuration
2. Verify NEXTAUTH_SECRET is set to a strong value: `echo $NEXTAUTH_SECRET`
3. Test sign-in with credentials: navigate to /auth/signin and test login
4. Test OAuth sign-in: test Google OAuth flow
5. Verify session works: check session in protected pages
6. Test password verification: attempt login with wrong password

---

### 1.2 Session Management & JWT

Verify JWT tokens are properly constructed and sessions are secure.

**JWT Structure Verification:**

```tsx
// Decoded JWT should look like:
{
  "sub": "user-id-uuid",
  "email": "user@example.com",
  "id": "user-id-uuid",
  "iat": 1708961000,
  "exp": 1711553000,
  "jti": "token-id"
}
```

**Session Security Checks:**

```tsx
// src/lib/auth/session.ts
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Get current session on server
export async function getCurrentSession() {
  const session = await getServerSession(authOptions);
  return session;
}

// Verify session and user
export async function requireAuth() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error('Unauthorized');
  }

  return session;
}

// Get current user ID
export async function getCurrentUserId(): Promise<string> {
  const session = await requireAuth();
  return session.user.id;
}

// Verify user owns resource
export async function verifyOwnership(
  userId: string,
  resourceUserId: string
): Promise<boolean> {
  return userId === resourceUserId;
}
```

**Session Middleware (Optional):**

```tsx
// src/middleware.ts
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequestWithAuth } from 'next-auth/middleware';

export const middleware = withAuth(
  function middleware(request: NextRequestWithAuth) {
    // Redirect unauthenticated users
    if (!request.nextauth.token) {
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/workspaces/:path*',
    '/applications/:path*',
  ],
};
```

**Cookie Security Settings:**

```tsx
// Verify in browser DevTools: Application → Cookies
// Each cookie should have:
// - HttpOnly: true (not accessible from JavaScript)
// - Secure: true (HTTPS only, in production)
// - SameSite: Lax (CSRF protection)
// - Path: / (accessible from all routes)
// - Domain: .grantease.com (domain-specific)
```

**Token Rotation Verification:**

```tsx
// NextAuth automatically rotates tokens:
// - Every 24 hours (updateAge: 24 * 60 * 60)
// - On every request that updates session
// - Old tokens are invalidated
```

**Verification Checklist:**
- [ ] Session strategy is JWT (not database sessions)
- [ ] JWT tokens are signed with NEXTAUTH_SECRET
- [ ] Session maxAge is set to reasonable value (30 days)
- [ ] Token rotation is enabled (updateAge set)
- [ ] Cookies have HttpOnly flag
- [ ] Cookies have Secure flag in production
- [ ] Cookies have SameSite=Lax
- [ ] Session can be retrieved server-side
- [ ] Session includes user ID and email
- [ ] Logout clears session properly

**Audit Actions:**
1. Navigate to protected page while logged in
2. Open DevTools → Application → Cookies
3. Verify `next-auth.session-token` cookie has:
   - HttpOnly: checked
   - Secure: checked (in production)
   - SameSite: Lax
4. Test logout and verify cookie is deleted
5. Try accessing protected page without session (should redirect)

---

## STEP 2: PASSWORD SECURITY

### 2.1 Password Hashing with Bcryptjs

Verify passwords are properly hashed and never stored in plain text.

**Password Hashing Implementation:**

```tsx
// src/lib/auth/password.ts
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12; // Higher rounds = slower but more secure

// Hash a password
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }

  return bcrypt.hash(password, SALT_ROUNDS);
}

// Compare password with hash
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Validate password strength
export function validatePasswordStrength(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Check if password needs rehashing (bcrypt version changed)
export function passwordNeedsRehash(hash: string): boolean {
  // Bcrypt hashes start with $2a$, $2b$, $2x$, or $2y$
  return !hash.match(/^\$2[aby]\$/);
}
```

**Password Hashing in Registration:**

```tsx
// src/app/api/auth/register/route.ts
import { hashPassword, validatePasswordStrength } from '@/lib/auth/password';
import { registerUserSchema } from '@/lib/schemas/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = registerUserSchema.parse(body);

    // Validate password strength
    const passwordCheck = validatePasswordStrength(password);
    if (!passwordCheck.valid) {
      return NextResponse.json(
        { error: 'Password is too weak', details: passwordCheck.errors },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        emailVerified: new Date(), // TODO: Add email verification
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    return NextResponse.json(
      { data: user, message: 'User registered successfully' },
      { status: 201 }
    );
  } catch (error) {
    // ... error handling
  }
}
```

**Password Hashing in Password Reset:**

```tsx
// src/app/api/auth/password-reset/route.ts
import { sendPasswordResetEmail } from '@/lib/email/password-reset';
import { generateSecureToken } from '@/lib/auth/token';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email } = z.object({ email: z.string().email() }).parse(body);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    // Don't reveal if user exists (security)
    return NextResponse.json(
      { message: 'If an account exists, a reset link has been sent' }
    );
  }

  // Generate reset token
  const token = await generateSecureToken();
  const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

  // Store token in database
  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token,
      expiresAt,
    },
  });

  // Send reset email
  await sendPasswordResetEmail(user.email, token);

  return NextResponse.json(
    { message: 'If an account exists, a reset link has been sent' }
  );
}

// src/app/api/auth/password-reset/[token]/route.ts
export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const body = await request.json();
    const { password } = z.object({ password: z.string().min(8) }).parse(body);

    // Find token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token: params.token },
      include: { user: true },
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Invalid or expired reset link' },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordCheck = validatePasswordStrength(password);
    if (!passwordCheck.valid) {
      return NextResponse.json(
        { error: 'Password is too weak', details: passwordCheck.errors },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(password);

    // Update user password
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    // Delete used token
    await prisma.passwordResetToken.delete({
      where: { token: params.token },
    });

    // Optionally: invalidate all sessions for this user
    await invalidateUserSessions(resetToken.user.id);

    return NextResponse.json(
      { message: 'Password reset successfully. Please sign in with your new password.' }
    );
  } catch (error) {
    // ... error handling
  }
}
```

**Verification Checklist:**
- [ ] Bcryptjs is installed and imported correctly
- [ ] SALT_ROUNDS is set to 12 or higher
- [ ] Passwords are hashed before storage
- [ ] Password comparison uses bcrypt.compare()
- [ ] Plain passwords are never logged
- [ ] Password strength validation is enforced
- [ ] Minimum 8 characters required
- [ ] Uppercase, lowercase, number, special char required
- [ ] Password reset tokens expire after 1 hour
- [ ] Reset tokens are single-use (deleted after use)
- [ ] Sessions are invalidated after password reset

**Audit Actions:**
1. Search codebase for hardcoded passwords: `grep -r "password.*=" src/`
2. Verify `comparePassword` is used in login: check CredentialsProvider
3. Inspect database: `SELECT email, password FROM users LIMIT 5;`
4. Verify passwords start with `$2b$` (bcrypt hash)
5. Test password reset flow end-to-end
6. Verify old sessions are invalidated after password change

---

### 2.2 Secure Password Reset Flow

Verify password reset is implemented securely.

**Secure Token Generation:**

```tsx
// src/lib/auth/token.ts
import crypto from 'crypto';

// Generate cryptographically secure random token
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

// Hash token for storage (one-way)
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Verify token (constant-time comparison)
export function verifyToken(providedToken: string, storedHash: string): boolean {
  const providedHash = hashToken(providedToken);
  return crypto.timingSafeEqual(
    Buffer.from(providedHash),
    Buffer.from(storedHash)
  );
}
```

**Password Reset Database Models:**

```prisma
model PasswordResetToken {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  token     String   @unique
  expiresAt DateTime

  createdAt DateTime @default(now())

  @@index([userId])
  @@index([token])
  @@index([expiresAt]) // For cleanup queries
}

model PasswordChangeLog {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  oldPasswordHash String? // Optional: store old hash for comparison
  changedAt DateTime @default(now())
  reason    String? // 'reset', 'security', 'user_request'

  @@index([userId])
  @@index([changedAt])
}
```

**Verification Checklist:**
- [ ] Reset tokens are cryptographically secure (32+ bytes)
- [ ] Tokens are hashed before storage
- [ ] Tokens expire after 1 hour
- [ ] Tokens are single-use (deleted after use)
- [ ] Expired tokens are cleaned up regularly
- [ ] Email includes reset link with token
- [ ] Reset link expiration is shown to user
- [ ] Password change is logged
- [ ] User is notified of password change
- [ ] Old sessions are invalidated

---

## STEP 3: API KEY SECURITY

### 3.1 Admin & CRON API Key Management

Verify API keys are properly generated, stored, and rotated.

**API Key Storage in Environment:**

```bash
# .env.local (never commit to git)
ADMIN_API_KEY=sk_admin_1234567890abcdefghij...
CRON_SECRET=sk_cron_1234567890abcdefghij...
GEMINI_API_KEY=AIzaSy...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXTAUTH_SECRET=...
```

**API Key Generation & Verification:**

```tsx
// src/lib/auth/api-keys.ts
import crypto from 'crypto';

const PREFIX_ADMIN = 'sk_admin_';
const PREFIX_CRON = 'sk_cron_';

// Generate API key
export function generateApiKey(type: 'admin' | 'cron'): string {
  const prefix = type === 'admin' ? PREFIX_ADMIN : PREFIX_CRON;
  const randomPart = crypto.randomBytes(32).toString('hex');
  return prefix + randomPart;
}

// Hash API key for storage
export function hashApiKey(apiKey: string): string {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

// Verify API key
export function verifyApiKey(providedKey: string, storedHash: string): boolean {
  const providedHash = hashApiKey(providedKey);
  return crypto.timingSafeEqual(
    Buffer.from(providedHash),
    Buffer.from(storedHash)
  );
}

// Extract API key prefix for debugging (safe to log)
export function getApiKeyPrefix(apiKey: string): string {
  return apiKey.substring(0, 8) + '...' + apiKey.substring(apiKey.length - 4);
}
```

**API Key Database Model:**

```prisma
model ApiKey {
  id           String   @id @default(cuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  name         String   // User-friendly name
  type         String   // 'admin', 'cron', 'webhook'
  keyHash      String   // Hashed key (never store plaintext)
  prefix       String   // First 8 chars for identification

  // Security
  lastUsedAt   DateTime?
  revokedAt    DateTime?
  expiresAt    DateTime?

  // Permissions
  permissions  String[] // JSON array of scopes

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@unique([keyHash])
  @@index([userId])
  @@index([type])
  @@index([revokedAt])
}

model ApiKeyUsageLog {
  id           String   @id @default(cuid())
  apiKeyId     String
  apiKey       ApiKey   @relation(fields: [apiKeyId], references: [id], onDelete: Cascade)

  method       String   // GET, POST, etc.
  path         String   // /api/...
  statusCode   Int
  userAgent    String?
  ipAddress    String?

  createdAt    DateTime @default(now())

  @@index([apiKeyId])
  @@index([createdAt])
}
```

**API Key Validation Middleware:**

```tsx
// src/lib/auth/api-key.ts
import { NextRequest, NextResponse } from 'next/server';

export async function validateApiKey(
  request: NextRequest,
  type: 'admin' | 'cron'
): Promise<{ valid: boolean; apiKey?: ApiKey; error?: string }> {
  const headerName = type === 'admin' ? 'x-admin-api-key' : 'authorization';
  const headerValue = type === 'admin'
    ? request.headers.get(headerName)
    : request.headers.get(headerName)?.replace('Bearer ', '');

  if (!headerValue) {
    return { valid: false, error: 'Missing API key' };
  }

  // Find API key by hash
  const keyHash = hashApiKey(headerValue);
  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash },
    include: { user: true },
  });

  if (!apiKey) {
    return { valid: false, error: 'Invalid API key' };
  }

  // Check if revoked
  if (apiKey.revokedAt) {
    return { valid: false, error: 'API key revoked' };
  }

  // Check if expired
  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return { valid: false, error: 'API key expired' };
  }

  // Check permissions
  if (!apiKey.permissions.includes(type)) {
    return { valid: false, error: 'Insufficient permissions' };
  }

  // Log usage
  await logApiKeyUsage(apiKey.id, request);

  // Update last used
  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() },
  });

  return { valid: true, apiKey };
}

async function logApiKeyUsage(apiKeyId: string, request: NextRequest) {
  const pathname = new URL(request.url).pathname;

  try {
    await prisma.apiKeyUsageLog.create({
      data: {
        apiKeyId,
        method: request.method,
        path: pathname,
        statusCode: 200, // Updated after response
        userAgent: request.headers.get('user-agent') || undefined,
        ipAddress: request.ip || undefined,
      },
    });
  } catch (error) {
    console.error('Failed to log API key usage:', error);
  }
}
```

**Verification Checklist:**
- [ ] API keys are generated using `crypto.randomBytes()`
- [ ] API keys are prefixed with type identifier (sk_admin_, sk_cron_)
- [ ] API keys are hashed before storage (SHA-256)
- [ ] Plaintext keys are never logged
- [ ] Keys can be revoked immediately
- [ ] Keys can expire automatically
- [ ] Key usage is logged (method, path, IP, timestamp)
- [ ] Old keys are cleaned up periodically
- [ ] Each key has permission/scope restrictions
- [ ] Keys are validated with timing-safe comparison
- [ ] Invalid keys return generic error message

**Audit Actions:**
1. Check if any API keys are stored in git history: `git log -p | grep sk_`
2. Search for plaintext keys in environment: `grep -r "sk_admin\|sk_cron" .env*`
3. Test API key validation: try invalid key, revoked key, expired key
4. Check API key usage logs for unusual activity
5. Verify old/unused keys are identified for cleanup

---

## STEP 4: USER-SCOPED QUERIES & DATA ISOLATION

### 4.1 Prisma Query Scoping

Verify all user-scoped queries include proper `where` conditions.

**User-Scoped Query Pattern:**

```tsx
// INCORRECT - Returns all data
const savedGrants = await prisma.grant.findMany({
  where: { /* no user filter */ },
});

// CORRECT - User-scoped
const savedGrants = await prisma.grant.findMany({
  where: {
    savedBy: { some: { id: userId } },
  },
});

// Alternative approach - query through saved relationship
const savedGrants = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    savedGrants: {
      select: { /* only needed fields */ },
    },
  },
});
```

**User-Scoped Query Examples:**

```tsx
// ❌ WRONG - No user filter
const applications = await prisma.grantApplication.findMany();

// ✅ CORRECT - User-filtered
const applications = await prisma.grantApplication.findMany({
  where: { userId }, // Explicitly filter by user ID
});

// ❌ WRONG - Updating without user check
await prisma.grantApplication.update({
  where: { id: applicationId },
  data: { status: 'submitted' },
});

// ✅ CORRECT - User-filtered update
await prisma.grantApplication.update({
  where: {
    id: applicationId,
    userId, // Ensure user owns this application
  },
  data: { status: 'submitted' },
});

// ❌ WRONG - Checking workspace membership
const workspace = await prisma.workspace.findUnique({
  where: { id: workspaceId },
});

// ✅ CORRECT - Check user membership + get workspace
const membership = await prisma.workspaceMember.findUnique({
  where: {
    workspaceId_userId: {
      workspaceId,
      userId,
    },
  },
  include: { workspace: true },
});

if (!membership) {
  throw new Error('Access denied');
}
```

**Comprehensive User-Scoped Queries:**

```tsx
// src/lib/db/user-queries.ts
import { prisma } from '@/lib/prisma';

export class UserQueries {
  // Get user's saved grants
  static async getUserSavedGrants(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        savedGrants: {
          select: {
            id: true,
            title: true,
            amount: true,
            deadline: true,
          },
        },
      },
    });
  }

  // Get user's applications
  static async getUserApplications(userId: string) {
    return prisma.grantApplication.findMany({
      where: { userId }, // User-scoped
      include: { grant: true },
    });
  }

  // Get user's workspaces
  static async getUserWorkspaces(userId: string) {
    return prisma.workspaceMember.findMany({
      where: { userId }, // User-scoped
      include: { workspace: true },
    });
  }

  // Get workspace (with membership check)
  static async getWorkspace(userId: string, workspaceId: string) {
    return prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: { workspaceId, userId },
      },
      include: { workspace: true },
    });
  }

  // Get user's notifications
  static async getUserNotifications(userId: string, limit: number = 50) {
    return prisma.notification.findMany({
      where: { userId }, // User-scoped
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  // Get user's vault documents
  static async getUserVaultDocuments(userId: string) {
    return prisma.vaultDocument.findMany({
      where: { userId }, // User-scoped
    });
  }

  // Get user's saved searches
  static async getUserSavedSearches(userId: string) {
    return prisma.savedSearch.findMany({
      where: { userId }, // User-scoped
    });
  }
}
```

**Verification Checklist:**
- [ ] All `findMany()` have `where` clause with user filter
- [ ] All `findUnique()` for user resources include user ID in `where`
- [ ] All `update()` operations include user ID in `where`
- [ ] All `delete()` operations include user ID in `where`
- [ ] Workspace queries check membership first
- [ ] No queries return all users' data without filters
- [ ] No queries modify users' data without ownership check
- [ ] API endpoints verify session user ID before querying

**Audit Actions:**
1. Search for queries without `where` clause: `grep -r "findMany()" src/app/api/ | grep -v "where"`
2. Check for workspace access: search for workspace queries in route handlers
3. Test cross-user access: try accessing another user's grant application
4. Test API with modified userId in session to verify enforcement

---

### 4.2 Cross-User Data Leak Prevention

Verify no endpoints expose other users' data.

**Data Exposure Audit Pattern:**

```tsx
// API response should only include user's own data or public data

// User's own data - OK to return
{
  email: 'user@example.com',
  savedGrants: [...],
  applications: [...],
}

// Public user profile - OK to return
{
  name: 'John Doe',
  bio: 'Grant writer',
  // NOT: email, phone, etc.
}

// Workspace data - OK if user is member
{
  workspaceId: '...',
  members: [...],
  grants: [...],
}
```

**Cross-User Access Prevention:**

```tsx
// src/lib/auth/authorization.ts
import { prisma } from '@/lib/prisma';

// Check if user has access to grant application
export async function checkApplicationAccess(
  userId: string,
  applicationId: string
): Promise<boolean> {
  const application = await prisma.grantApplication.findUnique({
    where: { id: applicationId },
    select: { userId: true },
  });

  return application?.userId === userId;
}

// Check if user has access to workspace
export async function checkWorkspaceAccess(
  userId: string,
  workspaceId: string
): Promise<boolean> {
  const membership = await prisma.workspaceMember.findUnique({
    where: {
      workspaceId_userId: { workspaceId, userId },
    },
  });

  return !!membership;
}

// Check if user owns vault document
export async function checkVaultDocumentAccess(
  userId: string,
  documentId: string
): Promise<boolean> {
  const document = await prisma.vaultDocument.findUnique({
    where: { id: documentId },
    select: { userId: true },
  });

  return document?.userId === userId;
}
```

**Middleware to Enforce Access Control:**

```tsx
// Usage in API route
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check access
  const hasAccess = await checkApplicationAccess(session.user.id, params.id);
  if (!hasAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Return user's data only
  const application = await prisma.grantApplication.findUnique({
    where: { id: params.id },
  });

  return NextResponse.json({ data: application });
}
```

**Verification Checklist:**
- [ ] All user-scoped data requires access check
- [ ] Cross-user access returns 403 Forbidden (not 404)
- [ ] Public endpoints return only public data
- [ ] No sensitive data in error messages
- [ ] Workspace members can't access non-members' data
- [ ] Applications are completely isolated between users
- [ ] Notifications are user-specific
- [ ] Vault documents are user-specific

---

## STEP 5: SECRETS MANAGEMENT

### 5.1 Environment Variables & Secret Protection

Verify secrets are properly managed and not exposed.

**Secrets Management Strategy:**

```bash
# .env.local (NEVER commit)
# Only in local development

# .env.example (CAN commit)
# Template with dummy values
GEMINI_API_KEY=AIzaSy... # Actual key never in repo
GOOGLE_CLIENT_ID=1234...
GOOGLE_CLIENT_SECRET=secret...

# Vercel Secrets
# Use Vercel dashboard or:
# vercel env add GEMINI_API_KEY
```

**Environment Variable Audit:**

```tsx
// src/lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),

  // NextAuth
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),

  // Gemini API
  GEMINI_API_KEY: z.string().startsWith('AIzaSy'),

  // Admin/Cron
  ADMIN_API_KEY: z.string().startsWith('sk_admin_'),
  CRON_SECRET: z.string().startsWith('sk_cron_'),

  // Environment
  NODE_ENV: z.enum(['development', 'production', 'test']),

  // Optional
  LOG_LEVEL: z.string().default('info'),
});

export const env = envSchema.parse(process.env);

// Validate at startup
if (!env.NEXTAUTH_SECRET) {
  throw new Error('NEXTAUTH_SECRET is not set');
}

if (!env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY is not set');
}
```

**Secret Rotation & Monitoring:**

```tsx
// src/lib/auth/secret-rotation.ts
export async function rotateSecrets() {
  // 1. Generate new NEXTAUTH_SECRET
  const newSecret = crypto.randomBytes(32).toString('hex');
  console.log('New NEXTAUTH_SECRET:', newSecret);
  console.log('Update in Vercel dashboard: Settings → Environment Variables');

  // 2. Rotate API keys
  const oldAdminKey = process.env.ADMIN_API_KEY;
  const newAdminKey = generateApiKey('admin');
  console.log('New ADMIN_API_KEY:', newAdminKey);

  // 3. Update in secrets manager
  // await secretsManager.updateSecret('ADMIN_API_KEY', newAdminKey);

  // 4. Log rotation event
  await logSecurityEvent({
    type: 'secret_rotation',
    secrets: ['NEXTAUTH_SECRET', 'ADMIN_API_KEY'],
    timestamp: new Date(),
  });

  // 5. Monitor for old secret usage
  console.log('Monitor logs for usage of old secrets');
}
```

**Verification Checklist:**
- [ ] No secrets are in `.env.local` committed to git
- [ ] `.env.example` has no real values
- [ ] All required secrets are set in environment
- [ ] Secrets are validated at startup
- [ ] API keys have proper prefixes (sk_, AIzaSy)
- [ ] Database URL is secure (over TLS)
- [ ] NEXTAUTH_SECRET is strong (32+ chars)
- [ ] No secrets in logs or error messages
- [ ] Git history is clean of secrets: `git log -p | grep -i secret`

**Audit Actions:**
1. Check `.env.local` is in `.gitignore`: `cat .gitignore | grep env`
2. Verify no secrets in git: `git log -p | grep -i "apikey\|secret" | head -20`
3. Test environment validation: run app without required secrets
4. Check production environment variables are set: `vercel env ls`

---

## STEP 6: CSRF & XSS PROTECTION

### 6.1 CSRF Protection

Verify CSRF tokens are properly implemented (if using form submissions).

**CSRF Token Middleware:**

```tsx
// NextAuth.js provides automatic CSRF protection for:
// - POST requests to /api/auth/*
// - POST requests with proper content-type

// For custom forms, implement CSRF tokens:

// src/lib/csrf.ts
import { cookies } from 'next/headers';
import crypto from 'crypto';

// Generate CSRF token
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Store token in cookie
export async function setCsrfToken() {
  const cookieStore = cookies();
  const token = generateCsrfToken();
  cookieStore.set('csrf-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
  });
  return token;
}

// Verify CSRF token
export async function verifyCsrfToken(token: string): Promise<boolean> {
  const cookieStore = cookies();
  const storedToken = cookieStore.get('csrf-token')?.value;

  if (!storedToken) return false;

  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(storedToken)
  );
}
```

**Form Implementation with CSRF:**

```tsx
// app/components/GrantApplicationForm.tsx
'use client';

import { useState, useEffect } from 'react';

export function GrantApplicationForm() {
  const [csrfToken, setCsrfToken] = useState('');

  useEffect(() => {
    // Fetch CSRF token on mount
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (token) {
      setCsrfToken(token);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const response = await fetch('/api/applications', {
      method: 'POST',
      headers: {
        'X-CSRF-Token': csrfToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grantId: formData.get('grantId'),
        // ...other fields
      }),
    });

    if (!response.ok) {
      console.error('Failed to submit application');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
    </form>
  );
}
```

**API Route CSRF Validation:**

```tsx
// src/app/api/applications/route.ts
export async function POST(request: NextRequest) {
  // Verify CSRF token
  const csrfToken = request.headers.get('x-csrf-token');
  if (!csrfToken || !await verifyCsrfToken(csrfToken)) {
    return NextResponse.json(
      { error: 'Invalid CSRF token' },
      { status: 403 }
    );
  }

  // Process request
  // ...
}
```

**Verification Checklist:**
- [ ] Forms include CSRF token
- [ ] CSRF tokens are validated on POST/PUT/DELETE
- [ ] Tokens are httpOnly and secure
- [ ] Tokens expire after reasonable time
- [ ] SameSite=Lax is set on cookies
- [ ] NextAuth.js handles CSRF for auth routes
- [ ] Custom API endpoints validate CSRF if applicable

---

### 6.2 XSS Protection

Verify XSS attacks are prevented through content sanitization and CSP.

**Content Security Policy (CSP):**

```tsx
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' https:; font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com; connect-src 'self' https:; frame-ancestors 'none';",
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

**Input Sanitization:**

```tsx
// src/lib/sanitize.ts
import DOMPurify from 'isomorphic-dompurify';

// Sanitize HTML content (e.g., grant descriptions from external sources)
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });
}

// Escape plain text (prevent injection in plain text contexts)
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

// Sanitize URL
export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return '/'; // Fallback to safe URL
    }
    return url;
  } catch {
    return '/';
  }
}
```

**Safe Rendering in React:**

```tsx
// DANGEROUS - Don't do this
export function GrantDescription({ grant }) {
  return <div dangerouslySetInnerHTML={{ __html: grant.description }} />;
}

// SAFE - Use sanitized content
import { sanitizeHtml } from '@/lib/sanitize';

export function GrantDescription({ grant }) {
  const sanitized = sanitizeHtml(grant.description);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}

// SAFER - Use text content only
export function GrantTitle({ grant }) {
  return <h1>{grant.title}</h1>; // Safe - text only, no HTML
}
```

**Verification Checklist:**
- [ ] CSP headers are set
- [ ] `X-Content-Type-Options: nosniff` is set
- [ ] `X-Frame-Options: DENY` is set
- [ ] `X-XSS-Protection` header is set
- [ ] User-generated content is sanitized
- [ ] No use of `dangerouslySetInnerHTML` without sanitization
- [ ] URLs are validated and sanitized
- [ ] React key props are not user-controlled
- [ ] Form inputs are validated

---

## STEP 7: SESSION & TOKEN SECURITY

### 7.1 Token Expiration & Refresh

Verify tokens are properly expired and refreshed.

**Token Expiration Configuration:**

```tsx
// NextAuth configuration
session: {
  maxAge: 30 * 24 * 60 * 60, // 30 days
  updateAge: 24 * 60 * 60, // Update token daily
},

jwt: {
  maxAge: 30 * 24 * 60 * 60, // 30 days
}
```

**Token Refresh Mechanism:**

```tsx
// NextAuth automatically refreshes tokens:
// - Every 24 hours (updateAge)
// - On every page load/API call
// - Old tokens are invalidated

// Manual token refresh (if needed):
export async function refreshSession() {
  await signOut({ redirect: false });
  await signIn('credentials', { email, password });
}
```

**Session Invalidation:**

```tsx
// src/lib/auth/session.ts
export async function invalidateUserSessions(userId: string) {
  // Delete all sessions for user (forces re-login)
  await prisma.session.deleteMany({
    where: { userId },
  });
}

// Use after password change or suspicious activity
export async function invalidateOtherSessions(userId: string, currentSessionId: string) {
  // Delete all OTHER sessions for user (keep current session)
  await prisma.session.deleteMany({
    where: {
      userId,
      sessionToken: { not: currentSessionId },
    },
  });
}
```

**Verification Checklist:**
- [ ] Session maxAge is set (30 days max)
- [ ] Token updateAge is set (refresh daily)
- [ ] Tokens are refreshed automatically
- [ ] Old tokens are invalidated
- [ ] Logout clears session immediately
- [ ] Password change invalidates all sessions
- [ ] Session can be verified server-side

---

## STEP 8: SECURITY LOGGING & MONITORING

### 8.1 Security Event Logging

Verify security events are properly logged for auditing.

**Security Event Logger:**

```tsx
// src/lib/security/event-logger.ts
export enum SecurityEventType {
  SIGN_IN = 'sign_in',
  SIGN_OUT = 'sign_out',
  SIGN_UP = 'sign_up',
  PASSWORD_CHANGE = 'password_change',
  PASSWORD_RESET = 'password_reset',
  API_KEY_CREATED = 'api_key_created',
  API_KEY_REVOKED = 'api_key_revoked',
  USER_ROLE_CHANGED = 'user_role_changed',
  WORKSPACE_CREATED = 'workspace_created',
  WORKSPACE_DELETED = 'workspace_deleted',
  MEMBER_ADDED = 'member_added',
  MEMBER_REMOVED = 'member_removed',
  PERMISSION_DENIED = 'permission_denied',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
}

export async function logSecurityEvent(
  type: SecurityEventType,
  userId: string | null,
  details: Record<string, any> = {}
) {
  try {
    await prisma.securityLog.create({
      data: {
        type,
        userId,
        details,
        timestamp: new Date(),
        ipAddress: details.ipAddress,
        userAgent: details.userAgent,
      },
    });

    // Also log to external service (e.g., Datadog, Sentry)
    console.info(`[SECURITY] ${type}`, {
      userId,
      ...details,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}
```

**Database Model:**

```prisma
model SecurityLog {
  id           String   @id @default(cuid())
  type         String   // Security event type
  userId       String?
  user         User?    @relation(fields: [userId], references: [id], onDelete: SetNull)

  details      Json     // Event-specific details
  ipAddress    String?
  userAgent    String?

  timestamp    DateTime @default(now())

  @@index([userId])
  @@index([timestamp])
  @@index([type])
}
```

**Usage in Route Handlers:**

```tsx
// Sign-in event
export async function POST(request: NextRequest) {
  const email = request.headers.get('x-user-email');

  try {
    // ... authentication logic

    await logSecurityEvent(
      SecurityEventType.SIGN_IN,
      user.id,
      {
        email: user.email,
        method: 'credentials',
        ipAddress: request.ip,
        userAgent: request.headers.get('user-agent'),
      }
    );
  } catch (error) {
    await logSecurityEvent(
      SecurityEventType.SIGN_IN,
      null,
      {
        email,
        method: 'credentials',
        success: false,
        error: error.message,
        ipAddress: request.ip,
      }
    );
  }
}
```

**Verification Checklist:**
- [ ] All security events are logged
- [ ] Logs include timestamp, user, IP, user agent
- [ ] Failed login attempts are logged
- [ ] API key usage is logged
- [ ] Permission denials are logged
- [ ] Role changes are logged
- [ ] Logs are immutable (append-only)
- [ ] Old logs are archived/retained per policy
- [ ] Sensitive data not in logs
- [ ] Logs can be searched and filtered

---

## AUDIT SUMMARY CHECKLIST

### NextAuth.js Configuration
- [ ] NextAuth.js v4 is properly configured
- [ ] NEXTAUTH_SECRET is set to strong value
- [ ] Session strategy is JWT
- [ ] Credentials provider properly verifies passwords
- [ ] OAuth providers (Google) are configured
- [ ] Callbacks handle tokens and redirects correctly
- [ ] Session events are logged

### Password Security
- [ ] Passwords are hashed with bcryptjs (12 salt rounds)
- [ ] Password strength validation enforced
- [ ] Password reset is secure (1-hour tokens)
- [ ] Reset tokens are single-use
- [ ] Sessions invalidated after password change

### API Key Security
- [ ] API keys are cryptographically secure
- [ ] Keys are hashed before storage
- [ ] Keys have proper prefixes
- [ ] Keys can be revoked and expire
- [ ] Key usage is logged
- [ ] Invalid keys return generic errors

### User Data Isolation
- [ ] All user-scoped queries include user filter
- [ ] Cross-user access returns 403, not 404
- [ ] No user data leaks between accounts
- [ ] Workspace membership is verified
- [ ] Applications are completely isolated

### Secrets Management
- [ ] All secrets in environment variables
- [ ] No secrets in git history
- [ ] Secrets validated at startup
- [ ] No secrets in logs or error messages
- [ ] Secret rotation policy in place

### CSRF & XSS Protection
- [ ] CSRF tokens implemented for forms
- [ ] Content Security Policy headers set
- [ ] User content is sanitized
- [ ] No dangerouslySetInnerHTML without sanitization
- [ ] XSS prevention headers set

### Session Management
- [ ] Sessions expire after 30 days
- [ ] Tokens are refreshed daily
- [ ] Logout clears session immediately
- [ ] Token validation is working
- [ ] Session can be checked server-side

### Security Logging
- [ ] All security events are logged
- [ ] Failed login attempts logged
- [ ] API key usage logged
- [ ] Permission denials logged
- [ ] Logs are searchable and archived

---

**Audit Complete When:**
- All 8 steps have been executed
- All checklists are marked complete
- Security events are being logged
- All tests pass
- No security vulnerabilities detected
