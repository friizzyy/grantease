# Grants By AI System Map

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                           FRONTEND                                   │
│  Next.js 16 App Router + React 19 + TypeScript + Tailwind           │
│                                                                      │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────────┐ │
│  │   Marketing  │ │     Auth     │ │     App      │ │  Onboarding │ │
│  │    Pages     │ │    Pages     │ │    Pages     │ │    Flow     │ │
│  └──────────────┘ └──────────────┘ └──────────────┘ └─────────────┘ │
└────────────────────────────────────────────────────┬────────────────┘
                                                     │
                                                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                           API LAYER                                  │
│  Next.js Route Handlers (/api/*)                                    │
│                                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────────┐ │
│  │  Auth    │ │  Grants  │ │   User   │ │    AI    │ │  Health   │ │
│  │ NextAuth │ │  CRUD    │ │ Profile  │ │  OpenAI  │ │  Checks   │ │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └───────────┘ │
└────────────────────────────────────────────────────┬────────────────┘
                                                     │
                                                     ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         DATA LAYER                                   │
│  Prisma ORM + SQLite (dev) / PostgreSQL (prod)                      │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  Models: User, Grant, SavedGrant, Workspace, UserProfile,      │ │
│  │          Notification, SavedSearch, WorkspaceDocument,          │ │
│  │          NotificationPreferences, Collection                    │ │
│  └────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Directory Structure

```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth pages (login, register, forgot-password)
│   ├── (marketing)/              # Public pages (home, pricing, etc.)
│   ├── api/                      # API routes
│   │   ├── ai/                   # AI endpoints (chat, writing-assistant)
│   │   ├── auth/                 # NextAuth handlers
│   │   ├── contracts/            # Contract search
│   │   ├── cron/                 # Scheduled jobs
│   │   ├── dashboard/            # Aggregated dashboard
│   │   ├── export/               # Data export
│   │   ├── grants/               # Grant CRUD & search
│   │   ├── health/               # Health checks
│   │   ├── opportunities/        # Opportunity search
│   │   ├── ready/                # Readiness check
│   │   └── user/                 # User-specific endpoints
│   ├── app/                      # Protected app pages
│   │   ├── discover/             # Grant discovery
│   │   ├── grants/[id]/          # Grant detail
│   │   ├── saved/                # Saved grants
│   │   ├── settings/             # User settings
│   │   ├── workspace/            # Workspaces list
│   │   └── workspace/[id]/       # Workspace detail
│   └── onboarding/               # Onboarding flow
├── components/
│   ├── layout/                   # Layout components (sidebar, header)
│   ├── ui/                       # UI primitives (button, input, toast)
│   ├── onboarding/               # Onboarding components
│   └── providers/                # Context providers
├── lib/
│   ├── services/                 # Business logic services
│   ├── motion/                   # Animation configurations
│   ├── auth.ts                   # NextAuth config
│   ├── db.ts                     # Prisma client
│   └── utils.ts                  # Utility functions
├── styles/
│   └── globals.css               # Global styles
└── types/
    └── next-auth.d.ts            # Type declarations
```

---

## Page Routes

### Public Pages
| Route | File | Description |
|-------|------|-------------|
| `/` | `(marketing)/page.tsx` | Landing page |
| `/pricing` | `(marketing)/pricing/page.tsx` | Pricing plans |
| `/how-it-works` | `(marketing)/how-it-works/page.tsx` | Feature overview |
| `/faq` | `(marketing)/faq/page.tsx` | FAQ |
| `/contact` | `(marketing)/contact/page.tsx` | Contact form |
| `/privacy` | `(marketing)/privacy/page.tsx` | Privacy policy |
| `/terms` | `(marketing)/terms/page.tsx` | Terms of service |

### Auth Pages
| Route | File | Description |
|-------|------|-------------|
| `/login` | `(auth)/login/page.tsx` | Sign in |
| `/register` | `(auth)/register/page.tsx` | Sign up |
| `/forgot-password` | `(auth)/forgot-password/page.tsx` | Password reset |

### App Pages (Protected)
| Route | File | Description |
|-------|------|-------------|
| `/app` | `app/page.tsx` | Dashboard |
| `/app/discover` | `app/discover/page.tsx` | Grant discovery |
| `/app/grants/[id]` | `app/grants/[id]/page.tsx` | Grant detail |
| `/app/saved` | `app/saved/page.tsx` | Saved grants |
| `/app/searches` | `app/searches/page.tsx` | Saved searches |
| `/app/workspace` | `app/workspace/page.tsx` | Workspaces list |
| `/app/workspace/[id]` | `app/workspace/[id]/page.tsx` | Workspace detail |
| `/app/settings` | `app/settings/page.tsx` | User settings |

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/[...nextauth]` | NextAuth handlers |
| POST | `/api/auth/register` | User registration |

### Grants
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/grants` | List grants |
| GET | `/api/grants/[id]` | Get grant by ID |
| POST | `/api/grants/search-live` | Live grant search |
| POST | `/api/grants/unified-search` | Multi-source search |
| POST | `/api/grants/match` | AI grant matching |
| POST | `/api/grants/sync` | Sync grants from sources |
| GET | `/api/grants/sources` | List data sources |

### User
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/PATCH | `/api/user/profile` | User profile |
| GET/PATCH | `/api/user/notification-preferences` | Notification settings |
| GET/POST/DELETE | `/api/user/saved-grants` | Saved grants |
| GET/POST/DELETE | `/api/user/saved-searches` | Saved searches |
| GET/POST | `/api/user/workspaces` | Workspaces |
| GET/PATCH/DELETE | `/api/user/workspaces/[id]` | Single workspace |
| POST | `/api/user/workspaces/[id]/documents` | Workspace documents |
| GET/POST/PUT | `/api/user/collections` | Grant collections |
| GET/PATCH | `/api/user/notifications` | User notifications |
| POST | `/api/user/password` | Change password |
| DELETE | `/api/user/account` | Delete account |

### AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | `/api/ai/chat` | AI chat assistant |
| GET/POST | `/api/ai/writing-assistant` | AI writing help |

### System
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/ready` | Readiness check |
| GET | `/api/dashboard` | Aggregated dashboard data |

---

## Database Schema

### Core Models

```prisma
model User {
  id             String   @id @default(cuid())
  email          String   @unique
  name           String?
  password       String?
  organization   String?
  image          String?
  emailVerified  DateTime?
  provider       String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}

model Grant {
  id            String   @id @default(cuid())
  sourceId      String?
  sourceName    String?
  title         String
  sponsor       String
  summary       String?
  description   String?
  categories    String?  // JSON array
  eligibility   String?  // JSON array
  locations     String?  // JSON array
  amountMin     Int?
  amountMax     Int?
  amountText    String?
  deadlineType  String?
  deadlineDate  DateTime?
  postedDate    DateTime?
  url           String?
  contact       String?  // JSON object
  requirements  String?  // JSON array
  status        String   @default("open")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Workspace {
  id        String   @id @default(cuid())
  userId    String
  grantId   String
  name      String
  status    String   @default("not_started")
  checklist String?  // JSON array
  notes     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model UserProfile {
  id                    String   @id @default(cuid())
  userId                String   @unique
  entityType            String
  country               String   @default("US")
  state                 String?
  industryTags          String?  // JSON array
  sizeBand              String?
  stage                 String?
  annualBudget          String?
  industryAttributes    String?  // JSON object
  grantPreferences      String?  // JSON object
  onboardingStep        Int      @default(1)
  onboardingCompleted   Boolean  @default(false)
  onboardingCompletedAt DateTime?
  confidenceScore       Float    @default(0)
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}
```

---

## External Integrations

### Grant Sources
- **Grants.gov** - Federal grants
- **SAM.gov** - Federal contracts
- **USAspending** - Federal awards data
- **NIH RePORTER** - Research grants
- **State Portals** - California, New York, Texas
- **Candid/Foundation Directory** - Foundation grants

### AI Services
- **OpenAI** - Chat, writing assistance, grant matching (gpt-4o-mini)

### Authentication
- **NextAuth.js** - Email/password, Google OAuth, GitHub OAuth

---

## Environment Variables

```env
# Database
DATABASE_URL=

# NextAuth
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# OAuth Providers
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GITHUB_ID=
GITHUB_SECRET=

# AI
OPENAI_API_KEY=

# Grant Sources
GRANTS_GOV_API_KEY=
SAM_API_KEY=
NIH_API_KEY=
```

---

## Key Dependencies

```json
{
  "next": "^16.1.6",
  "react": "^19.0.0",
  "prisma": "^5.22.0",
  "next-auth": "^4.24.10",
  "openai": "^4.76.3",
  "framer-motion": "^11.15.0",
  "tailwindcss": "^3.4.17",
  "zod": "^3.24.1",
  "lucide-react": "^0.468.0"
}
```
