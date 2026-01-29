'use client'

import { motion } from 'framer-motion'
import { GrantCard, GrantCardGrid, GrantCardItem } from '@/components/grants/grant-card'
import { NoSavedGrants } from '@/components/grants/empty-state'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Search, Download, Bookmark } from 'lucide-react'
import { springs } from '@/lib/motion/animations'

// Mock saved grants
const savedGrants = [
  {
    id: '1',
    sourceId: 'NSF-2024-001',
    sourceName: 'grants_gov',
    title: 'Small Business Innovation Research (SBIR) Phase I',
    sponsor: 'National Science Foundation',
    summary: 'The SBIR program stimulates technological innovation in the private sector by strengthening the role of small business concerns in meeting Federal research and development needs.',
    description: null,
    categories: JSON.stringify(['Small Business', 'Research', 'Technology']),
    eligibility: JSON.stringify({ types: ['Small Business'], raw: 'Must be a US small business' }),
    locations: JSON.stringify([{ country: 'US' }]),
    amountMin: 50000,
    amountMax: 275000,
    amountText: '$50,000 - $275,000',
    deadlineType: 'fixed',
    deadlineDate: new Date('2024-03-15'),
    postedDate: new Date('2024-01-01'),
    url: 'https://www.nsf.gov/sbir',
    contact: null,
    requirements: null,
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
    summary: 'The CDBG program provides annual grants to develop viable urban communities by providing decent housing and expanding economic opportunities.',
    description: null,
    categories: JSON.stringify(['Housing', 'Community Development']),
    eligibility: JSON.stringify({ types: ['Government Entity', 'Nonprofit 501(c)(3)'] }),
    locations: JSON.stringify([{ country: 'US' }]),
    amountMin: 100000,
    amountMax: 500000,
    amountText: '$100,000 - $500,000',
    deadlineType: 'fixed',
    deadlineDate: new Date('2024-02-28'),
    postedDate: new Date('2024-01-05'),
    url: 'https://www.hud.gov/cdbg',
    contact: null,
    requirements: null,
    status: 'open',
    hashFingerprint: 'def456',
    duplicateOf: null,
    firstSeenAt: new Date(),
    lastSeenAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export default function SavedGrantsPage() {
  const grants = savedGrants
  const isEmpty = grants.length === 0

  return (
    <div className="p-8">
      {/* Header */}
      <motion.div
        className="flex items-start justify-between mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <motion.h1
            className="font-serif text-display text-pulse-text mb-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            Saved Grants
          </motion.h1>
          <motion.p
            className="text-body text-pulse-text-secondary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            Grants you&apos;ve saved for later review.
          </motion.p>
        </div>
        {!isEmpty && (
          <motion.div
            className="flex gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
            <Button asChild>
              <Link href="/app/discover">
                <Search className="w-4 h-4" />
                Find More
              </Link>
            </Button>
          </motion.div>
        )}
      </motion.div>

      {/* Content */}
      {isEmpty ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <NoSavedGrants />
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          <motion.div
            className="flex items-center gap-2 mb-4"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 0.5,
                delay: 0.5,
              }}
            >
              <Bookmark className="w-4 h-4 text-pulse-accent fill-pulse-accent" />
            </motion.div>
            <p className="text-body-sm text-pulse-text-tertiary">
              <motion.span
                className="text-pulse-accent font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {grants.length}
              </motion.span>{' '}
              saved grant{grants.length !== 1 ? 's' : ''}
            </p>
          </motion.div>

          <GrantCardGrid>
            {grants.map((grant, index) => (
              <GrantCardItem key={grant.id}>
                <GrantCard
                  grant={grant as any}
                  saved={true}
                  onUnsave={() => console.log('unsave', grant.id)}
                  index={index}
                />
              </GrantCardItem>
            ))}
          </GrantCardGrid>
        </motion.div>
      )}
    </div>
  )
}
