# Grants By AI

A modern grant discovery and application management platform built with Next.js 14, featuring the Pulse Grid design system.

![Grants By AI](https://img.shields.io/badge/version-0.1.0-pulse)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Prisma](https://img.shields.io/badge/Prisma-5.0-teal)

## Features

- **Grant Discovery** - Search and filter across federal, state, and foundation grants
- **Smart Matching** - Filter by category, eligibility, location, and amount
- **Saved Searches** - Save searches with email alerts for new matches
- **Application Workspaces** - Organize your applications with checklists and documents
- **Admin Dashboard** - Manage ingestion sources and monitor pipeline health

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (prod) / SQLite (dev)
- **ORM**: Prisma
- **Styling**: Tailwind CSS + Pulse Grid Design System
- **Components**: Radix UI primitives
- **Animation**: Framer Motion
- **Auth**: NextAuth.js (configured)
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn
- PostgreSQL (for production) or SQLite (for development)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/grantsby-ai.git
cd grantsby-ai
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Database
DATABASE_URL="file:./dev.db"  # SQLite for development
# DATABASE_URL="postgresql://user:password@localhost:5432/grantsby"  # PostgreSQL for production

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Admin API
ADMIN_API_KEY="your-admin-api-key"

# Optional: Email (for alerts)
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="your-email@example.com"
SMTP_PASSWORD="your-password"
```

4. Set up the database:
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed with demo data
npx prisma db seed
```

5. Start the development server:
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

### Demo Account

After seeding, you can log in with:
- **Email**: demo@example.com
- **Password**: demo123

## Project Structure

```
grantsby-ai/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Demo data seeder
├── public/                # Static assets
├── src/
│   ├── app/
│   │   ├── (auth)/        # Auth pages (login, register)
│   │   ├── (marketing)/   # Marketing pages
│   │   ├── admin/         # Admin dashboard
│   │   ├── api/           # API routes
│   │   └── app/           # Main application
│   ├── components/
│   │   ├── grants/        # Grant-specific components
│   │   ├── layout/        # Layout components
│   │   ├── pulse-grid/    # Animated background
│   │   └── ui/            # Base UI components
│   ├── hooks/             # Custom React hooks
│   ├── lib/
│   │   ├── db/            # Database client
│   │   ├── utils/         # Utility functions
│   │   └── validations/   # Zod schemas
│   ├── styles/
│   │   └── globals.css    # Global styles + Pulse Grid
│   └── types/             # TypeScript types
├── .env.example           # Environment template
├── next.config.js         # Next.js configuration
├── package.json
├── tailwind.config.ts     # Tailwind + Pulse Grid tokens
└── tsconfig.json
```

## API Routes

### Grants
- `GET /api/grants` - Search grants with filters
- `GET /api/grants/[id]` - Get single grant

### User
- `GET /api/user/saved-grants` - List saved grants
- `POST /api/user/saved-grants` - Save a grant
- `DELETE /api/user/saved-grants?grantId=` - Remove saved grant
- `GET /api/user/saved-searches` - List saved searches
- `POST /api/user/saved-searches` - Create saved search
- `PATCH /api/user/saved-searches` - Update search alerts
- `DELETE /api/user/saved-searches?id=` - Delete search
- `GET /api/user/workspaces` - List workspaces
- `POST /api/user/workspaces` - Create workspace
- `GET /api/user/workspaces/[id]` - Get workspace
- `PATCH /api/user/workspaces/[id]` - Update workspace
- `DELETE /api/user/workspaces/[id]` - Delete workspace

### Admin (requires API key)
- `GET /api/ingest` - Get ingestion status
- `POST /api/ingest` - Run ingestion

## Ingestion Pipeline

The platform supports ingesting grants from multiple sources:

- **Federal**: Grants.gov, SAM.gov
- **State**: California Grants Portal, NY Grants Gateway
- **Foundation**: Ford Foundation, MacArthur Foundation

To add a new source, implement the `IngestionAdapter` interface:

```typescript
interface IngestionAdapter {
  sourceId: string
  sourceName: string
  fetch(): Promise<RawGrant[]>
  normalize(raw: RawGrant): NormalizedGrant
}
```

## Design System

The Pulse Grid design system includes:

### Colors
- `pulse-bg`: Deep black (#0a0a0b)
- `pulse-surface`: Elevated surface
- `pulse-accent`: Mint green (#40ffaa)
- `pulse-text`: Off-white text

### Typography
- Display: Instrument Serif (headings)
- Body: Inter (paragraphs)
- Mono: Geist Mono (labels, code)

### Components
- Button, Input, Card, Badge
- Select, Dialog, Toast
- Skeleton loaders
- Animated grid background

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run prisma:studio # Open Prisma Studio
npm run prisma:seed   # Seed database
```

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Set environment variables
4. Deploy

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) for details.

---

Built with ❤️ using the Pulse Grid design system
