# GrantEase SEO & Discoverability Audit

**Audit Purpose:** Optimize organic search visibility for grant discovery pages, marketing funnel, and individual grant detail pages. Ensure proper metadata, structured data, canonical URLs, and internal linking.

**Scope:** Metadata API, dynamic OG images, sitemap generation, robots.txt, schema.org markup, content optimization, internal linking strategy.

---

## STEP 1: Grant Discovery Page SEO

### 1.1 Dynamic Metadata for Filterable Content

**Challenge:** Grant discovery page changes based on filters (category, location, etc.) but should remain indexable.

**Solution: Canonical URL for Base Search Page**

```typescript
// src/app/search/page.tsx
import type { Metadata } from 'next';
import { SearchPage } from '@/components/search/SearchPage';

export const metadata: Metadata = {
  title: 'Find Grants | GrantEase - Grant Discovery Platform',
  description:
    'Search thousands of government and foundation grants by category, funding amount, eligibility, and deadline. Filter grants for nonprofits, universities, and organizations.',
  openGraph: {
    title: 'Find Grants | GrantEase',
    description: 'Search and filter grants by category, funding amount, and eligibility.',
    url: 'https://grantease.com/search',
    type: 'website',
    images: [
      {
        url: 'https://grantease.com/og-grant-discovery.jpg',
        width: 1200,
        height: 630,
        alt: 'Grant discovery search page',
      },
    ],
  },
  canonical: 'https://grantease.com/search',
  robots: {
    index: true,
    follow: true,
  },
};

export default function SearchPage() {
  return <SearchPage />;
}
```

### 1.2 Category Landing Pages (Parametrized Routes)

```typescript
// src/app/search/[category]/page.tsx
import type { Metadata } from 'next';
import { prisma } from '@/lib/prisma';

interface CategoryPageProps {
  params: { category: string };
}

export const generateStaticParams = async () => {
  const categories = [
    'education',
    'research',
    'healthcare',
    'technology',
    'arts',
    'environmental',
    'social-services',
  ];

  return categories.map(category => ({ category }));
};

export const generateMetadata = async ({
  params,
}: CategoryPageProps): Promise<Metadata> => {
  const categoryLabel = params.category
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Get category stats for metadata
  const grantCount = await prisma.grant.count({
    where: {
      category: params.category.toUpperCase().replace('-', '_'),
    },
  });

  return {
    title: `${categoryLabel} Grants | GrantEase`,
    description: `Browse ${grantCount}+ ${categoryLabel.toLowerCase()} grants. Find funding opportunities for nonprofits, universities, and organizations.`,
    openGraph: {
      title: `${categoryLabel} Grants | GrantEase`,
      description: `Discover ${categoryLabel.toLowerCase()} grants available now.`,
      url: `https://grantease.com/search/${params.category}`,
      type: 'website',
    },
    canonical: `https://grantease.com/search/${params.category}`,
  };
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const grants = await prisma.grant.findMany({
    where: {
      category: params.category.toUpperCase().replace('-', '_'),
    },
    take: 20,
  });

  return (
    <div>
      <h1>{params.category.replace('-', ' ')} Grants</h1>
      {/* Render category-specific content */}
    </div>
  );
}
```

### 1.3 Location-based Landing Pages

```typescript
// src/app/grants/[state]/page.tsx
import type { Metadata } from 'next';
import { US_STATES } from '@/lib/constants';

export const generateStaticParams = async () => {
  return US_STATES.map(state => ({
    state: state.code.toLowerCase(),
  }));
};

export const generateMetadata = async ({
  params,
}: {
  params: { state: string };
}): Promise<Metadata> => {
  const state = US_STATES.find(s => s.code.toLowerCase() === params.state);

  if (!state) return { title: 'Not Found' };

  return {
    title: `Grants for ${state.name} Organizations | GrantEase`,
    description: `Find federal, state, and foundation grants available to organizations in ${state.name}. Browse funding opportunities by category and amount.`,
    openGraph: {
      title: `${state.name} Grants | GrantEase`,
      description: `Discover grants for organizations in ${state.name}.`,
      url: `https://grantease.com/grants/${params.state}`,
    },
    canonical: `https://grantease.com/grants/${params.state}`,
  };
};

export default function StatePage({ params }: { params: { state: string } }) {
  return <StateGrantListing state={params.state} />;
}
```

### 1.4 Robots.txt Configuration

**File:** `public/robots.txt`

```
# Allow indexing of all public pages
User-agent: *
Allow: /
Allow: /search
Allow: /grants/
Allow: /about
Allow: /pricing
Allow: /how-it-works
Allow: /faq

# Disallow private/account pages
Disallow: /app/
Disallow: /api/
Disallow: /admin/
Disallow: /auth/

# Disallow search filters to prevent duplicate content
Disallow: /search?*

# Crawl delay to prevent server overload
Crawl-delay: 1

# Sitemaps
Sitemap: https://grantease.com/sitemap.xml
Sitemap: https://grantease.com/grants-sitemap.xml
```

### 1.5 Checklist
- [ ] Grant discovery page metadata optimized
- [ ] Category landing pages generated statically
- [ ] Location landing pages generated statically
- [ ] Canonical URLs set for all pages
- [ ] robots.txt blocks /app/*, /api/*, /admin/*
- [ ] robots.txt allows /search (without query params)
- [ ] Meta descriptions under 160 chars
- [ ] OG images 1200x630px

---

## STEP 2: Individual Grant Detail Page SEO

### 2.1 Dynamic Metadata from Grant Data

```typescript
// src/app/grants/[id]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

interface GrantPageProps {
  params: { id: string };
}

export const generateMetadata = async ({
  params,
}: GrantPageProps): Promise<Metadata> => {
  const grant = await prisma.grant.findUnique({
    where: { id: params.id },
  });

  if (!grant) {
    return { title: 'Grant Not Found' };
  }

  // Extract first 160 chars of description
  const description = grant.description.slice(0, 160);

  // Generate category keyword for title
  const categoryKeywords: Record<string, string> = {
    EDUCATION: 'education grant',
    RESEARCH: 'research grant',
    HEALTHCARE: 'healthcare grant',
    TECHNOLOGY: 'technology grant',
    ARTS: 'arts grant',
  };

  const grantTypeKeyword = categoryKeywords[grant.category] || 'grant';

  return {
    title: `${grant.title} | ${grantTypeKeyword.toUpperCase()} | GrantEase`,
    description,
    keywords: [
      grant.title,
      grant.category.toLowerCase(),
      `$${(grant.fundingAmount / 1000).toFixed(0)}K grant`,
      'funding opportunity',
      grant.source,
    ].join(', '),
    openGraph: {
      title: grant.title,
      description,
      url: `https://grantease.com/grants/${grant.id}`,
      type: 'website',
      images: [
        {
          url: `https://grantease.com/api/og?grantId=${grant.id}`,
          width: 1200,
          height: 630,
          alt: grant.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: grant.title,
      description,
      images: [`https://grantease.com/api/og?grantId=${grant.id}`],
    },
    canonical: `https://grantease.com/grants/${grant.id}`,
  };
};

export const generateStaticParams = async () => {
  // Generate static pages for top 500 grants
  const grants = await prisma.grant.findMany({
    select: { id: true },
    orderBy: { createdAt: 'desc' },
    take: 500,
  });

  return grants.map(grant => ({
    id: grant.id,
  }));
};

export default async function GrantPage({ params }: GrantPageProps) {
  const grant = await prisma.grant.findUnique({
    where: { id: params.id },
    include: {
      eligibilityRequirements: true,
    },
  });

  if (!grant) {
    notFound();
  }

  return <GrantDetail grant={grant} />;
}
```

### 2.2 Dynamic OG Image Generation

```typescript
// src/app/api/og/route.tsx
import { ImageResponse } from 'next/og';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const grantId = searchParams.get('grantId');

  if (!grantId) {
    return new Response('Missing grantId', { status: 400 });
  }

  const grant = await prisma.grant.findUnique({
    where: { id: grantId },
  });

  if (!grant) {
    return new Response('Grant not found', { status: 404 });
  }

  // Format grant data for image
  const title = grant.title.slice(0, 60);
  const amount = `$${(grant.fundingAmount / 1000000).toFixed(1)}M`;
  const daysLeft = Math.ceil(
    (grant.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100%',
          backgroundColor: '#0f172a',
          backgroundImage:
            'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          padding: 60,
          justifyContent: 'space-between',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              fontSize: 48,
              fontWeight: 'bold',
              color: '#40ffaa',
            }}
          >
            GrantEase
          </div>
        </div>

        {/* Main content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div
            style={{
              fontSize: 52,
              fontWeight: 'bold',
              color: 'white',
              lineHeight: 1.2,
            }}
          >
            {title}
          </div>

          <div
            style={{
              display: 'flex',
              gap: 40,
              fontSize: 28,
              color: '#cbd5e1',
            }}
          >
            <div>
              <span style={{ color: '#40ffaa' }}>{amount}</span> Available
            </div>
            <div>
              <span style={{ color: '#40ffaa' }}>{daysLeft} days</span> Left
            </div>
            <div>
              <span style={{ color: '#40ffaa' }}>
                {grant.category.charAt(0) + grant.category.slice(1).toLowerCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            fontSize: 20,
            color: '#94a3b8',
            borderTop: '1px solid #334155',
            paddingTop: 20,
          }}
        >
          Discover and apply for grants that match your organization
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
};
```

### 2.3 Checklist
- [ ] Dynamic metadata from grant data
- [ ] Title format: "Grant Title | Category | GrantEase"
- [ ] Description 150-160 chars from grant description
- [ ] Keywords include category, amount, source
- [ ] OG images dynamically generated (1200x630)
- [ ] Twitter card images included
- [ ] Canonical URL set
- [ ] Top 500 grants statically generated

---

## STEP 3: Marketing Pages SEO

### 3.1 Homepage Metadata & Content

```typescript
// src/app/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'GrantEase | Find Grants for Your Organization',
  description:
    'Discover federal, state, and foundation grants matching your organization. Powered by AI, GrantEase simplifies grant discovery and application management.',
  openGraph: {
    title: 'GrantEase | Grant Discovery & Management Platform',
    description:
      'Find and manage grants that match your mission. AI-powered grant discovery for nonprofits, universities, and organizations.',
    url: 'https://grantease.com',
    type: 'website',
    images: [
      {
        url: 'https://grantease.com/og-home.jpg',
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function HomePage() {
  return (
    <main>
      <h1>Find Grants That Match Your Organization</h1>
      <p>
        GrantEase helps nonprofits, universities, and organizations discover
        and apply for grants. Our AI-powered platform matches you with the best
        funding opportunities.
      </p>

      {/* Hero CTA */}
      {/* Features section */}
      {/* Testimonials */}
      {/* FAQ */}
    </main>
  );
}
```

### 3.2 How It Works Page

```typescript
// src/app/how-it-works/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'How GrantEase Works | Grant Discovery Guide',
  description:
    'Learn how GrantEase helps you find and apply for grants. 4 simple steps to connect your organization with funding.',
  openGraph: {
    title: 'How GrantEase Works',
    description: 'Discover the 4-step process to find grants for your organization.',
    url: 'https://grantease.com/how-it-works',
  },
  canonical: 'https://grantease.com/how-it-works',
};

export default function HowItWorksPage() {
  return (
    <main>
      <h1>How GrantEase Works</h1>
      <p>Find and apply for grants in 4 simple steps:</p>

      <section>
        <h2>Step 1: Create Your Profile</h2>
        <p>Tell us about your organization...</p>
      </section>

      <section>
        <h2>Step 2: Search Grants</h2>
        <p>Browse thousands of grants matching your profile...</p>
      </section>

      <section>
        <h2>Step 3: AI Analysis</h2>
        <p>Get AI-powered insights for each grant...</p>
      </section>

      <section>
        <h2>Step 4: Apply</h2>
        <p>Organize applications and track progress...</p>
      </section>

      <FAQ />
    </main>
  );
}
```

### 3.3 FAQ Page

```typescript
// src/app/faq/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ | GrantEase',
  description: 'Frequently asked questions about GrantEase grant discovery platform.',
  canonical: 'https://grantease.com/faq',
};

export default function FAQPage() {
  const faqs = [
    {
      question: 'How does GrantEase find grants for my organization?',
      answer:
        'We use AI to match grants with your organization profile, considering your focus areas, funding needs, and eligibility...',
    },
    {
      question: 'What types of grants are available?',
      answer:
        'We list federal grants, state grants, and foundation grants across 30+ categories including education, research, healthcare...',
    },
    {
      question: 'Is GrantEase free to use?',
      answer: 'Yes, basic grant discovery is free. Premium features include AI analysis and application management...',
    },
    {
      question: 'How often are grants updated?',
      answer: 'Our database updates daily with new grant opportunities from grants.gov and other sources...',
    },
    {
      question: 'Can I save grants and searches?',
      answer:
        'Yes, you can save individual grants, create saved searches, and organize them in workspaces...',
    },
  ];

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-8">Frequently Asked Questions</h1>

      <div className="space-y-6">
        {faqs.map((faq, i) => (
          <details
            key={i}
            className="bg-slate-800 rounded-lg p-6 cursor-pointer"
          >
            <summary className="text-xl font-semibold text-accent">
              {faq.question}
            </summary>
            <p className="text-gray-300 mt-4">{faq.answer}</p>
          </details>
        ))}
      </div>
    </main>
  );
}
```

### 3.4 Pricing Page

```typescript
// src/app/pricing/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing | GrantEase',
  description: 'Simple, transparent pricing for grant discovery and management.',
  canonical: 'https://grantease.com/pricing',
};

export default function PricingPage() {
  return (
    <main>
      <h1>Pricing</h1>
      <p>Choose the plan that works for your organization</p>

      {/* Pricing tiers */}
    </main>
  );
}
```

### 3.5 About Page

```typescript
// src/app/about/page.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About GrantEase | Grant Discovery Platform',
  description:
    'GrantEase is on a mission to simplify grant discovery for nonprofits and organizations. Learn about our team and vision.',
  canonical: 'https://grantease.com/about',
};

export default function AboutPage() {
  return (
    <main>
      <h1>About GrantEase</h1>
      <p>Our Mission</p>
      <p>
        GrantEase simplifies grant discovery and application management for
        nonprofits, universities, and organizations. We believe access to
        funding should be easy and fair.
      </p>

      {/* About content */}
    </main>
  );
}
```

### 3.6 Checklist
- [ ] Homepage optimized for primary keywords
- [ ] How It Works page with structured content
- [ ] FAQ page with FAQ schema markup
- [ ] Pricing page metadata
- [ ] About page with company information
- [ ] All pages have unique titles and descriptions
- [ ] Canonical URLs set for all marketing pages
- [ ] Internal links between marketing pages

---

## STEP 4: Sitemap Generation

### 4.1 Static Sitemap for Marketing Pages

**File:** `public/sitemap.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">

  <!-- Homepage -->
  <url>
    <loc>https://grantease.com/</loc>
    <lastmod>2024-02-27</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Marketing Pages -->
  <url>
    <loc>https://grantease.com/search</loc>
    <lastmod>2024-02-27</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>https://grantease.com/how-it-works</loc>
    <lastmod>2024-02-27</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://grantease.com/pricing</loc>
    <lastmod>2024-02-27</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://grantease.com/faq</loc>
    <lastmod>2024-02-27</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>https://grantease.com/about</loc>
    <lastmod>2024-02-27</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>

  <!-- Category Pages -->
  <url>
    <loc>https://grantease.com/search/education</loc>
    <lastmod>2024-02-27</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://grantease.com/search/research</loc>
    <lastmod>2024-02-27</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>https://grantease.com/search/healthcare</loc>
    <lastmod>2024-02-27</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

</urlset>
```

### 4.2 Dynamic Sitemap for Grants

**File:** `src/app/grants-sitemap.xml/route.ts`

```typescript
import { prisma } from '@/lib/prisma';

export const GET = async () => {
  // Fetch all grants
  const grants = await prisma.grant.findMany({
    select: {
      id: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: 'desc' },
  });

  // Generate sitemap XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${grants
        .map(
          grant => `
        <url>
          <loc>https://grantease.com/grants/${grant.id}</loc>
          <lastmod>${grant.updatedAt.toISOString().split('T')[0]}</lastmod>
          <changefreq>monthly</changefreq>
          <priority>0.6</priority>
        </url>
      `
        )
        .join('')}
    </urlset>
  `;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
};
```

### 4.3 Sitemap Index

**File:** `src/app/sitemap.xml/route.ts`

```typescript
export const GET = async () => {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <sitemap>
        <loc>https://grantease.com/sitemap.xml</loc>
        <lastmod>2024-02-27T00:00:00Z</lastmod>
      </sitemap>
      <sitemap>
        <loc>https://grantease.com/grants-sitemap.xml</loc>
        <lastmod>2024-02-27T00:00:00Z</lastmod>
      </sitemap>
    </sitemapindex>
  `;

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
};
```

### 4.4 Checklist
- [ ] sitemap.xml for marketing + category pages
- [ ] grants-sitemap.xml for all grant detail pages
- [ ] sitemap-index.xml pointing to both
- [ ] sitemap.xml in robots.txt
- [ ] Caching configured (s-maxage=3600)
- [ ] Lastmod dates accurate
- [ ] Priority values set appropriately
- [ ] Google Search Console configured

---

## STEP 5: Structured Data Markup

### 5.1 Organization Schema (Homepage & Footer)

```typescript
// src/components/StructuredData.tsx
export const OrganizationSchema = () => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'GrantEase',
    url: 'https://grantease.com',
    logo: 'https://grantease.com/logo.png',
    description:
      'AI-powered grant discovery and management platform for nonprofits and organizations',
    sameAs: [
      'https://twitter.com/grantease',
      'https://linkedin.com/company/grantease',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+1-555-123-4567',
      contactType: 'Customer Support',
      email: 'support@grantease.com',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};
```

### 5.2 FAQPage Schema

```typescript
// src/app/faq/page.tsx
import type { Metadata } from 'next';

export default function FAQPage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How does GrantEase find grants for my organization?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We use AI to match grants with your organization profile, considering your focus areas, funding needs, and eligibility...',
        },
      },
      {
        '@type': 'Question',
        name: 'What types of grants are available?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We list federal grants, state grants, and foundation grants across 30+ categories...',
        },
      },
      // ... more FAQs
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {/* FAQ content */}
    </>
  );
}
```

### 5.3 Grant Detail Schema (GovernmentService)

```typescript
// src/app/grants/[id]/page.tsx
interface GrantDetailPageProps {
  params: { id: string };
}

export default async function GrantPage({ params }: GrantDetailPageProps) {
  const grant = await prisma.grant.findUnique({
    where: { id: params.id },
  });

  const grantSchema = {
    '@context': 'https://schema.org',
    '@type': 'GovernmentService',
    name: grant.title,
    description: grant.description,
    provider: {
      '@type': 'GovernmentOrganization',
      name: grant.source,
      url: grant.sourceUrl,
    },
    areaServed: {
      '@type': 'Place',
      name: 'United States',
    },
    eligibleRegion: {
      '@type': 'Place',
      name: 'United States',
    },
    offers: {
      '@type': 'Offer',
      price: grant.fundingAmount,
      priceCurrency: 'USD',
    },
    expires: grant.deadline.toISOString(),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(grantSchema) }}
      />
      <GrantDetail grant={grant} />
    </>
  );
}
```

### 5.4 BreadcrumbList Schema

```typescript
// src/components/Breadcrumbs.tsx
interface BreadcrumbsProps {
  items: Array<{ name: string; url: string }>;
}

export const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <nav>
        {items.map((item, i) => (
          <span key={i}>
            <a href={item.url}>{item.name}</a>
            {i < items.length - 1 && ' / '}
          </span>
        ))}
      </nav>
    </>
  );
};
```

### 5.5 Checklist
- [ ] Organization schema on homepage
- [ ] FAQPage schema on /faq
- [ ] GovernmentService schema for grants
- [ ] BreadcrumbList schema for navigation
- [ ] Valid schema.org markup
- [ ] Tested with Google's Rich Results Test
- [ ] Rich snippets appear in search results

---

## STEP 6: Internal Linking Strategy

### 6.1 Navigation Structure

```
/
├── /search (Primary entry for grant discovery)
├── /search/[category] (Category landing pages)
├── /grants/[id] (Individual grant pages)
├── /how-it-works (Marketing funnel)
├── /pricing
├── /faq
├── /about
└── /app/dashboard (Logged-in area - excluded from sitemap)
```

### 6.2 Internal Link Patterns

```typescript
// Grant detail page → Related grants
export const RelatedGrants = ({ currentGrant }: { currentGrant: Grant }) => {
  return (
    <section>
      <h2>Similar Grants</h2>
      <div className="grid grid-cols-3 gap-4">
        {relatedGrants.map(grant => (
          <Link key={grant.id} href={`/grants/${grant.id}`}>
            {grant.title}
          </Link>
        ))}
      </div>
    </section>
  );
};

// Grant detail page → Category page
export const GrantBreadcrumbs = ({ grant }: { grant: Grant }) => {
  return (
    <nav className="mb-6">
      <Link href="/">Home</Link>
      {' / '}
      <Link href={`/search/${grant.category.toLowerCase()}`}>
        {grant.category}
      </Link>
      {' / '}
      <span>{grant.title}</span>
    </nav>
  );
};

// Category page → State pages
export const StateLinks = () => {
  return (
    <div>
      <p>Grants available in:</p>
      {US_STATES.map(state => (
        <Link key={state.code} href={`/grants/${state.code.toLowerCase()}`}>
          {state.name}
        </Link>
      ))}
    </div>
  );
};

// How It Works → Search
export const HowItWorksCTA = () => {
  return (
    <Link href="/search" className="btn btn-accent">
      Start Finding Grants
    </Link>
  );
};

// FAQ → Pricing
export const FAQFooter = () => {
  return (
    <div>
      <p>Ready to get started?</p>
      <Link href="/pricing">View Pricing</Link>
    </div>
  );
};
```

### 6.3 Sitemap-based Internal Linking

All pages listed in sitemap should be reachable through internal links:
- Homepage links to search, how-it-works, faq, pricing
- How it works links back to homepage and search
- FAQ links to pricing and about
- Category pages link to homepage and search
- Grant detail pages link to category and state pages

### 6.4 Checklist
- [ ] Breadcrumb navigation on all pages
- [ ] Category pages link to state pages
- [ ] Grant detail pages link to related grants
- [ ] Marketing pages link to each other
- [ ] No orphaned pages (all in sitemap reachable via links)
- [ ] Internal links use descriptive anchor text
- [ ] Link depth < 4 levels from homepage

---

## STEP 7: Content SEO Optimization

### 7.1 Grant Title & Description Quality

```typescript
// DO: Good grant titles for SEO
const goodTitles = [
  // Keyword-rich, descriptive
  'STEM Education Grants for K-12 Schools - $50K-$500K',
  'Healthcare Innovation Grants for Nonprofits 2024',
  'Research Funding for University Faculty - NSF Grants',
];

// DON'T: Poor grant titles
const poorTitles = [
  'Grant #2024-001',
  'Opportunity',
  'Federal Funding',
];

// DO: Descriptions should be unique and descriptive
const goodDescription = `
This program provides funding for nonprofit organizations
working in STEM education. Eligible applicants include
school districts, education nonprofits, and universities.
Grants range from $50,000 to $500,000 annually.
Deadline: June 30, 2024.
`;
```

### 7.2 Landing Page Content Optimization

**Grant Search/Discovery Page:**

```markdown
# Find Education Grants for Your Organization

Browse 1,000+ education grants available to nonprofits, universities,
and school districts. Filter by funding amount, deadline, and eligibility.

## Why Choose GrantEase?

- **AI-Powered Matching:** Find grants that fit your organization
- **Real-Time Updates:** New grants added daily
- **Application Management:** Organize and track applications
- **Expert Insights:** AI analysis for each grant

## Featured Education Grants

[Grant cards here with internal links]

## Browse by Category

[Category links here - EDUCATION, RESEARCH, etc.]

## Browse by Location

[State links here - CA, NY, TX, etc.]

## How It Works

[Link to /how-it-works]

## Still Have Questions?

[Link to /faq]
```

### 7.3 Keyword Research & Targeting

**Primary Keywords:**
- Grant discovery platform
- Find grants online
- Grant search engine
- Nonprofit grants
- Education grants
- Government grants

**Long-tail Keywords:**
- How to find grants for nonprofits
- Education grants for K-12 schools
- Research grants for universities
- Grants available in [State]
- [Category] grants for [Organization Type]

### 7.4 Checklist
- [ ] Titles keyword-rich and descriptive
- [ ] Meta descriptions 150-160 chars
- [ ] H1 includes primary keyword
- [ ] H2 subheadings use secondary keywords
- [ ] Descriptions unique per grant
- [ ] Content length > 300 words for landing pages
- [ ] Keyword density 1-2% (natural)
- [ ] No keyword stuffing

---

## STEP 8: Technical SEO Checklist

### 8.1 Mobile Optimization
- [ ] Mobile-first design
- [ ] Responsive images
- [ ] Touch-friendly buttons (min 44x44px)
- [ ] Mobile Lighthouse score > 90

### 8.2 Page Speed
- [ ] LCP < 2.5s (already covered in perf audit)
- [ ] CLS < 0.1 (already covered in perf audit)
- [ ] INP < 200ms (already covered in perf audit)

### 8.3 HTTPS & Security
- [ ] HTTPS enabled
- [ ] SSL certificate valid
- [ ] No mixed content warnings
- [ ] Security headers configured

### 8.4 Core Web Vitals
- [ ] Monitored and reported in GSC
- [ ] All pages pass Core Web Vitals assessment
- [ ] Performance budget maintained

### 8.5 Crawlability
- [ ] robots.txt allows crawling
- [ ] No noindex tags on public pages
- [ ] XML sitemaps submitted to GSC
- [ ] No redirect chains

### 8.6 Indexation
- [ ] Google Search Console configured
- [ ] Bing Webmaster Tools configured
- [ ] Submit sitemaps
- [ ] Monitor crawl errors
- [ ] Monitor coverage

### 8.7 Internationalization (if needed)
- [ ] hreflang tags for multiple languages
- [ ] Language-specific sitemaps
- [ ] Content localization

### 8.8 Checklist
- [ ] All pages mobile-responsive
- [ ] Core Web Vitals passing
- [ ] robots.txt configured
- [ ] Sitemaps submitted
- [ ] Google Search Console active
- [ ] Bing Webmaster Tools active
- [ ] No crawl errors
- [ ] Good indexation coverage

---

## STEP 9: Monitoring & Maintenance

### 9.1 Google Search Console Setup

```bash
# Verify domain ownership via TXT record:
# Add to DNS: google-site-verification=[verification code]

# Submit sitemaps:
# 1. https://grantease.com/sitemap.xml
# 2. https://grantease.com/grants-sitemap.xml
```

### 9.2 SEO Monitoring Script

```typescript
// src/lib/seo-monitor.ts
import { fetch } from 'node-fetch';

export const checkSEOHealth = async () => {
  const checks = {
    // Check sitemap accessibility
    sitemap: await fetch('https://grantease.com/sitemap.xml').then(r => r.ok),

    // Check robots.txt
    robots: await fetch('https://grantease.com/robots.txt').then(r => r.ok),

    // Check homepage indexable
    homepage: await checkPageIndexable('https://grantease.com'),

    // Check grant detail pages
    grantPages: await checkSampleGrants(),

    // Core Web Vitals
    coreWebVitals: await checkCoreWebVitals(),
  };

  return checks;
};

const checkPageIndexable = async (url: string) => {
  const response = await fetch(url);
  const html = await response.text();

  // Check for noindex
  const hasNoindex = html.includes('noindex');

  return !hasNoindex && response.status === 200;
};

const checkSampleGrants = async () => {
  // Check 10 random grant pages are accessible
  const grants = await prisma.grant.findMany({
    take: 10,
    select: { id: true },
  });

  const results = await Promise.all(
    grants.map(async grant => {
      const response = await fetch(`https://grantease.com/grants/${grant.id}`);
      return response.status === 200;
    })
  );

  return results.every(r => r);
};

const checkCoreWebVitals = async () => {
  // Integration with Google PageSpeed Insights API
  // Monitor LCP, INP, CLS
  return true; // Placeholder
};
```

### 9.3 Monthly SEO Checklist

- [ ] Google Search Console: Review coverage and errors
- [ ] Google Search Console: Check Search Analytics
- [ ] Core Web Vitals: All pages passing
- [ ] Sitemap: Verify grant count
- [ ] Backlinks: Monitor brand mentions
- [ ] Competitors: Check rankings
- [ ] Content: Update old blog posts
- [ ] Meta tags: Audit for best practices
- [ ] Structured data: Validate with schema.org tester

### 9.4 Quarterly SEO Audit

- [ ] Full technical SEO audit
- [ ] Backlink profile analysis
- [ ] Competitor analysis
- [ ] Keyword ranking report
- [ ] Content gap analysis
- [ ] User experience review (Core Web Vitals)
- [ ] Update content for current year
- [ ] Fix broken links

### 9.5 Checklist
- [ ] Google Search Console configured
- [ ] Bing Webmaster Tools configured
- [ ] Monthly monitoring scheduled
- [ ] Quarterly audits scheduled
- [ ] SEO KPIs tracked
- [ ] Organic traffic monitored
- [ ] Keyword rankings tracked

---

## SEO Strategy Summary

### Priority Keywords

**Tier 1 (High Volume, High Competition):**
- Grant discovery platform
- Find grants for nonprofits
- Grant search engine

**Tier 2 (Medium Volume, Medium Competition):**
- Education grants
- Research grants
- Nonprofit funding

**Tier 3 (Long-tail, Lower Competition):**
- [State] grants for [organization type]
- How to find grants for [organization type]
- [Category] funding opportunities

### Content Pillars

1. **Grant Discovery** (Main focus)
   - Grant search
   - Category landing pages
   - State landing pages
   - Grant detail pages

2. **Guide & Education**
   - How it works
   - FAQ
   - Blog posts (future)

3. **Trust & Authority**
   - About page
   - Testimonials/case studies (future)
   - Security/privacy pages (future)

### Traffic Targets

- **Organic traffic:** 10,000+ monthly visits
- **Search visibility:** Top 10 for 50+ keywords
- **Conversion rate:** 5% to free account signup
- **Average session duration:** > 3 minutes
- **Bounce rate:** < 50%

---

## Summary Checklist

- [ ] **Homepage:** Optimized metadata and content
- [ ] **Marketing Pages:** /how-it-works, /pricing, /faq, /about optimized
- [ ] **Grant Discovery:** Filterable, canonical URL, robot-friendly
- [ ] **Category Pages:** Generated statically with unique metadata
- [ ] **Location Pages:** US states with specific metadata
- [ ] **Grant Details:** Dynamic metadata from grant data
- [ ] **OG Images:** Dynamically generated for sharing
- [ ] **robots.txt:** Blocks /app/*, /api/*, allows /search
- [ ] **Sitemaps:** Marketing + Grants sitemaps with index
- [ ] **Structured Data:** Organization, FAQ, GovernmentService, BreadcrumbList
- [ ] **Internal Links:** Navigation structure clear, no orphaned pages
- [ ] **Keywords:** Research and targeting defined
- [ ] **Content:** Quality descriptions, keyword-rich
- [ ] **Mobile:** Fully responsive and optimized
- [ ] **Core Web Vitals:** All pages passing
- [ ] **Monitoring:** GSC, BWC, monthly/quarterly audits
