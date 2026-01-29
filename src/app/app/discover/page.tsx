'use client'

import { Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SearchFilters } from '@/components/grants/search-filters'
import { GrantCard, GrantCardGrid, GrantCardItem } from '@/components/grants/grant-card'
import { NoSearchResults } from '@/components/grants/empty-state'
import { GrantCardSkeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Save, Sparkles } from 'lucide-react'
import { springs, fadeInUp } from '@/lib/motion/animations'

// Mock grant data
const mockGrants = [
  {
    id: '1',
    sourceId: 'NSF-2024-001',
    sourceName: 'grants_gov',
    title: 'Small Business Innovation Research (SBIR) Phase I',
    sponsor: 'National Science Foundation',
    summary: 'The SBIR program stimulates technological innovation in the private sector by strengthening the role of small business concerns in meeting Federal research and development needs.',
    description: null,
    categories: JSON.stringify(['Small Business', 'Research', 'Technology']),
    eligibility: JSON.stringify({ types: ['Small Business'], raw: 'Must be a US small business with fewer than 500 employees' }),
    locations: JSON.stringify([{ country: 'US' }]),
    amountMin: 50000,
    amountMax: 275000,
    amountText: '$50,000 - $275,000',
    deadlineType: 'fixed',
    deadlineDate: new Date('2024-03-15'),
    postedDate: new Date('2024-01-01'),
    url: 'https://www.nsf.gov/sbir',
    contact: null,
    requirements: JSON.stringify(['Business plan', 'Technical proposal', 'Budget justification']),
    status: 'open',
    hashFingerprint: 'abc123',
    duplicateOf: null,
    firstSeenAt: new Date(),
    lastSeenAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    sourceId: 'HUD-2024-001',
    sourceName: 'grants_gov',
    title: 'Community Development Block Grant Program',
    sponsor: 'Department of Housing and Urban Development',
    summary: 'The CDBG program provides annual grants to states, cities, and counties to develop viable urban communities by providing decent housing and expanding economic opportunities.',
    description: null,
    categories: JSON.stringify(['Housing', 'Community Development']),
    eligibility: JSON.stringify({ types: ['Government Entity', 'Nonprofit 501(c)(3)'], raw: 'State and local governments, nonprofits' }),
    locations: JSON.stringify([{ country: 'US' }]),
    amountMin: 100000,
    amountMax: 500000,
    amountText: '$100,000 - $500,000',
    deadlineType: 'fixed',
    deadlineDate: new Date('2024-02-28'),
    postedDate: new Date('2024-01-05'),
    url: 'https://www.hud.gov/cdbg',
    contact: null,
    requirements: JSON.stringify(['Application form', 'Community needs assessment', 'Project timeline']),
    status: 'open',
    hashFingerprint: 'def456',
    duplicateOf: null,
    firstSeenAt: new Date(),
    lastSeenAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    sourceId: 'EPA-2024-001',
    sourceName: 'grants_gov',
    title: 'Environmental Justice Collaborative Problem-Solving Cooperative Agreement',
    sponsor: 'Environmental Protection Agency',
    summary: 'This program provides funding to support community-based organizations in their efforts to collaborate and develop solutions to address local environmental and public health issues.',
    description: null,
    categories: JSON.stringify(['Climate', 'Community Development', 'Health']),
    eligibility: JSON.stringify({ types: ['Nonprofit 501(c)(3)'], raw: 'Community-based nonprofits' }),
    locations: JSON.stringify([{ country: 'US' }]),
    amountMin: 50000,
    amountMax: 150000,
    amountText: 'Up to $150,000',
    deadlineType: 'fixed',
    deadlineDate: new Date('2024-04-01'),
    postedDate: new Date('2024-01-10'),
    url: 'https://www.epa.gov/environmentaljustice',
    contact: null,
    requirements: JSON.stringify(['Project narrative', 'Community partnership letters', 'Budget']),
    status: 'open',
    hashFingerprint: 'ghi789',
    duplicateOf: null,
    firstSeenAt: new Date(),
    lastSeenAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    sourceId: 'USDA-2024-001',
    sourceName: 'grants_gov',
    title: 'Rural Business Development Grant',
    sponsor: 'USDA Rural Development',
    summary: 'Provides technical assistance and training for small rural businesses. Grant funds may be used for a variety of purposes including training and technical assistance.',
    description: null,
    categories: JSON.stringify(['Small Business', 'Agriculture', 'Community Development']),
    eligibility: JSON.stringify({ types: ['Small Business', 'Nonprofit 501(c)(3)'], raw: 'Rural small businesses and nonprofits' }),
    locations: JSON.stringify([{ country: 'US' }]),
    amountMin: 10000,
    amountMax: 500000,
    amountText: '$10,000 - $500,000',
    deadlineType: 'rolling',
    deadlineDate: null,
    postedDate: new Date('2024-01-01'),
    url: 'https://www.rd.usda.gov/rbdg',
    contact: null,
    requirements: JSON.stringify(['Business plan', 'Financial statements', 'Rural area certification']),
    status: 'open',
    hashFingerprint: 'jkl012',
    duplicateOf: null,
    firstSeenAt: new Date(),
    lastSeenAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '5',
    sourceId: 'NEA-2024-001',
    sourceName: 'grants_gov',
    title: 'Grants for Arts Projects',
    sponsor: 'National Endowment for the Arts',
    summary: 'Supports public engagement with, and access to, various forms of excellent art across the nation. Projects may include festivals, exhibitions, tours, readings, and more.',
    description: null,
    categories: JSON.stringify(['Arts & Culture', 'Community Development']),
    eligibility: JSON.stringify({ types: ['Nonprofit 501(c)(3)', 'Government Entity'], raw: 'Arts organizations and government agencies' }),
    locations: JSON.stringify([{ country: 'US' }]),
    amountMin: 10000,
    amountMax: 100000,
    amountText: '$10,000 - $100,000',
    deadlineType: 'fixed',
    deadlineDate: new Date('2024-05-15'),
    postedDate: new Date('2024-01-15'),
    url: 'https://www.arts.gov/grants',
    contact: null,
    requirements: JSON.stringify(['Project description', 'Work samples', 'Budget']),
    status: 'open',
    hashFingerprint: 'mno345',
    duplicateOf: null,
    firstSeenAt: new Date(),
    lastSeenAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '6',
    sourceId: 'DOL-2024-001',
    sourceName: 'grants_gov',
    title: 'Workforce Innovation and Opportunity Act Youth Program',
    sponsor: 'Department of Labor',
    summary: 'Provides funding to states and local areas to support a wide range of activities and services to prepare youth for success in the labor market.',
    description: null,
    categories: JSON.stringify(['Workforce Development', 'Education', 'Youth & Families']),
    eligibility: JSON.stringify({ types: ['Government Entity', 'Nonprofit 501(c)(3)'], raw: 'State/local workforce agencies and their partners' }),
    locations: JSON.stringify([{ country: 'US' }]),
    amountMin: 100000,
    amountMax: 1000000,
    amountText: '$100,000 - $1,000,000',
    deadlineType: 'fixed',
    deadlineDate: new Date('2024-03-30'),
    postedDate: new Date('2024-01-20'),
    url: 'https://www.dol.gov/wioa',
    contact: null,
    requirements: JSON.stringify(['Program design', 'Partnership agreements', 'Performance metrics']),
    status: 'open',
    hashFingerprint: 'pqr678',
    duplicateOf: null,
    firstSeenAt: new Date(),
    lastSeenAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

function GrantResults() {
  const grants = mockGrants
  const total = grants.length
  const page = 1
  const totalPages = 1

  if (grants.length === 0) {
    return <NoSearchResults />
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      {/* Results Header */}
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-3">
          <motion.span
            className="text-body text-pulse-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <motion.span
              className="font-medium text-pulse-accent"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={springs.bouncy}
            >
              {total}
            </motion.span>{' '}
            grants found
          </motion.span>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Button variant="ghost" size="sm">
              <Save className="w-4 h-4 mr-1" />
              Save Search
            </Button>
          </motion.div>
        </div>
        <motion.div
          className="flex items-center gap-2 text-sm text-pulse-text-tertiary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
        >
          <Sparkles className="w-4 h-4 text-pulse-accent" />
          <span>Sorted by relevance</span>
        </motion.div>
      </motion.div>

      {/* Grant Grid */}
      <GrantCardGrid>
        {grants.map((grant, index) => (
          <GrantCardItem key={grant.id}>
            <GrantCard grant={grant as any} index={index} />
          </GrantCardItem>
        ))}
      </GrantCardGrid>

      {/* Pagination */}
      <AnimatePresence>
        {totalPages > 1 && (
          <motion.div
            className="flex items-center justify-center gap-2 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.4 }}
          >
            <Button variant="outline" size="sm" disabled={page === 1}>
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1 px-4">
              <span className="text-sm text-pulse-text">Page {page} of {totalPages}</span>
            </div>
            <Button variant="outline" size="sm" disabled={page === totalPages}>
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function LoadingGrants() {
  return (
    <motion.div
      className="grid gap-4"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.1,
          }
        }
      }}
    >
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 }
          }}
        >
          <GrantCardSkeleton />
        </motion.div>
      ))}
    </motion.div>
  )
}

export default function DiscoverPage() {
  return (
    <div className="p-8">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.h1
          className="font-serif text-display text-pulse-text mb-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          Discover Grants
        </motion.h1>
        <motion.p
          className="text-body text-pulse-text-secondary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          Search across thousands of federal, state, local, nonprofit, and private funding opportunities.
        </motion.p>
      </motion.div>

      {/* Search & Filters */}
      <Suspense fallback={<div className="h-16 bg-pulse-surface rounded-lg animate-pulse mb-8" />}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.4 }}
        >
          <SearchFilters className="mb-8" />
        </motion.div>
      </Suspense>

      {/* Results */}
      <Suspense fallback={<LoadingGrants />}>
        <GrantResults />
      </Suspense>
    </div>
  )
}
