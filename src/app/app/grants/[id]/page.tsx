'use client'

/**
 * GRANT DETAIL PAGE - PREMIUM UPGRADE
 * ------------------------------------
 * Premium grant details with:
 * - AI match score and insights
 * - Visual match breakdown
 * - Interactive requirements checklist
 * - Quick actions and workspace creation
 * - GlassCard design throughout
 */

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Calendar,
  DollarSign,
  MapPin,
  Building2,
  Clock,
  FolderPlus,
  Share2,
  Sparkles,
  Target,
  CheckCircle2,
  Circle,
  AlertCircle,
  TrendingUp,
  Zap,
  Users,
  FileText,
  Mail,
  Phone,
  Globe,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GlassCard } from '@/components/ui/glass-card'
import { formatCurrency, formatDate, parseJSON } from '@/lib/utils'

// Mock grant data with enhanced info
const mockGrant = {
  id: '1',
  sourceId: 'NSF-2024-001',
  sourceName: 'grants_gov',
  title: 'Small Business Innovation Research (SBIR) Phase I',
  sponsor: 'National Science Foundation',
  summary: 'The SBIR program stimulates technological innovation in the private sector by strengthening the role of small business concerns in meeting Federal research and development needs, increasing the commercial application of federally funded research results.',
  description: 'The National Science Foundation (NSF) SBIR program supports moving scientific excellence and technological innovation from the lab to the market. By funding startups and small businesses, NSF helps build a strong national economy and stimulates the creation of novel products, services, and solutions.\n\nPhase I awards typically provide $275,000 for approximately 6-12 months of research and development. Awardees may apply for Phase II funding of up to $1,000,000 for 24 months to continue development.',
  categories: ['Small Business', 'Research', 'Technology', 'Innovation'],
  eligibility: {
    types: ['Small Business'],
    raw: 'Must be a US small business with fewer than 500 employees. The Principal Investigator must be primarily employed by the small business at the time of award.'
  },
  locations: [{ country: 'US' }],
  amountMin: 50000,
  amountMax: 275000,
  amountText: '$50,000 - $275,000',
  deadlineType: 'fixed',
  deadlineDate: new Date('2024-03-15'),
  daysLeft: 45,
  postedDate: new Date('2024-01-01'),
  url: 'https://www.nsf.gov/sbir',
  contact: { name: 'NSF SBIR Program', email: 'sbir@nsf.gov', phone: '703-292-8050' },
  requirements: [
    'Company must be a US-based small business with fewer than 500 employees',
    'Principal Investigator must be primarily employed by the company',
    'Project must address an identified technical challenge',
    'Technical proposal (15 pages max)',
    'Company commercialization plan',
    'Budget and budget justification',
    'Biographical sketches of key personnel',
    'Current and pending support documentation'
  ],
  status: 'open',
  matchScore: 94,
  matchBreakdown: {
    eligibility: 95,
    mission: 92,
    funding: 98,
    timeline: 90,
  },
  similarGrants: 3,
  competitionLevel: 'Medium',
  avgAwardRate: '23%',
}

// AI Match Score Card
function MatchScoreCard({ score, breakdown }: {
  score: number
  breakdown: { eligibility: number; mission: number; funding: number; timeline: number }
}) {
  const getScoreColor = (s: number) => {
    if (s >= 90) return 'text-pulse-accent'
    if (s >= 80) return 'text-blue-400'
    if (s >= 70) return 'text-yellow-400'
    return 'text-pulse-error'
  }

  const getScoreBg = (s: number) => {
    if (s >= 90) return 'bg-pulse-accent'
    if (s >= 80) return 'bg-blue-400'
    if (s >= 70) return 'bg-yellow-400'
    return 'bg-pulse-error'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <GlassCard variant="accent" className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-5 h-5 text-pulse-accent" />
              <span className="text-sm font-medium text-pulse-text-secondary">AI Match Score</span>
            </div>
            <div className={`text-4xl font-bold ${getScoreColor(score)}`}>
              {score}%
            </div>
          </div>
          <div className="w-12 h-12 rounded-full bg-pulse-accent/20 border-2 border-pulse-accent flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-pulse-accent" />
          </div>
        </div>

        <p className="text-sm text-pulse-text-secondary mb-4">
          This grant is an excellent match for your organization based on eligibility, mission alignment, and funding needs.
        </p>

        <div className="space-y-3">
          {Object.entries(breakdown).map(([key, value]) => (
            <div key={key}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-pulse-text-tertiary capitalize">{key}</span>
                <span className={getScoreColor(value)}>{value}%</span>
              </div>
              <div className="h-1.5 bg-pulse-border rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${getScoreBg(value)}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${value}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </motion.div>
  )
}

// Requirement Item Component
function RequirementItem({ requirement, index }: { requirement: string; index: number }) {
  const [isChecked, setIsChecked] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 + index * 0.03 }}
      role="checkbox"
      aria-checked={isChecked}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          setIsChecked(!isChecked)
        }
      }}
      className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
        isChecked
          ? 'bg-pulse-accent/5 border-pulse-accent/30'
          : 'bg-pulse-surface/50 border-pulse-border hover:border-pulse-accent/20'
      }`}
      onClick={() => setIsChecked(!isChecked)}
    >
      <span className="shrink-0 mt-0.5" aria-hidden="true">
        {isChecked ? (
          <CheckCircle2 className="w-5 h-5 text-pulse-accent" />
        ) : (
          <Circle className="w-5 h-5 text-pulse-text-tertiary" />
        )}
      </span>
      <span className={`text-sm ${isChecked ? 'text-pulse-text-tertiary line-through' : 'text-pulse-text'}`}>
        {requirement}
      </span>
    </motion.div>
  )
}

export default function GrantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Note: In a real implementation, you would use React.use(params) to unwrap the promise
  // For now, this page uses mock data so the params aren't actively used
  const grant = mockGrant
  const [isSaved, setIsSaved] = useState(false)

  const isUrgent = grant.daysLeft <= 14

  return (
    <div className="p-8">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Link
          href="/app/discover"
          className="inline-flex items-center gap-2 text-sm text-pulse-text-secondary hover:text-pulse-accent transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Discovery
        </Link>
      </motion.div>

      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <GlassCard className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-4 h-4 text-pulse-accent" />
                <span className="text-sm font-medium text-pulse-accent">{grant.sponsor}</span>
              </div>
              <h1 className="font-serif text-2xl lg:text-3xl text-pulse-text mb-3">
                {grant.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={grant.status === 'open' ? 'success' : 'error'} className="capitalize">
                  {grant.status}
                </Badge>
                {grant.categories.slice(0, 4).map((cat) => (
                  <Badge key={cat} variant="outline">{cat}</Badge>
                ))}
              </div>
            </div>

            {/* Match Score Badge */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pulse-accent/10 border border-pulse-accent/30 shrink-0">
              <Target className="w-5 h-5 text-pulse-accent" />
              <span className="text-xl font-bold text-pulse-accent">{grant.matchScore}%</span>
              <span className="text-sm text-pulse-text-tertiary">match</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap items-center gap-6 py-4 border-t border-b border-pulse-border mb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-pulse-accent" />
              <span className="text-lg font-semibold text-pulse-text">{grant.amountText}</span>
            </div>
            <div className={`flex items-center gap-2 ${isUrgent ? 'text-pulse-error' : 'text-pulse-text-tertiary'}`}>
              <Calendar className="w-5 h-5" />
              <span className="font-medium">
                {grant.daysLeft} days left
                {isUrgent && <AlertCircle className="w-4 h-4 ml-1 inline" />}
              </span>
            </div>
            <div className="flex items-center gap-2 text-pulse-text-tertiary">
              <MapPin className="w-5 h-5" />
              <span>United States</span>
            </div>
            <div className="flex items-center gap-2 text-pulse-text-tertiary">
              <TrendingUp className="w-5 h-5" />
              <span>{grant.competitionLevel} competition • {grant.avgAwardRate} success rate</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Button
              variant={isSaved ? 'outline' : 'default'}
              onClick={() => setIsSaved(!isSaved)}
              className={isSaved ? 'border-pulse-accent text-pulse-accent' : ''}
            >
              {isSaved ? (
                <>
                  <BookmarkCheck className="w-4 h-4 mr-2" />
                  Saved
                </>
              ) : (
                <>
                  <Bookmark className="w-4 h-4 mr-2" />
                  Save Grant
                </>
              )}
            </Button>
            <Button variant="secondary">
              <FolderPlus className="w-4 h-4 mr-2" />
              Start Application
            </Button>
            <Button variant="outline" asChild>
              <a href={grant.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                View Original
              </a>
            </Button>
            <Button variant="ghost">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </GlassCard>
      </motion.div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <GlassCard className="p-5">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pulse-accent to-pulse-accent/50 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-pulse-bg" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-pulse-text mb-2">AI Analysis</h3>
                  <p className="text-sm text-pulse-text-secondary mb-3">
                    Based on your organization profile, this grant is an excellent fit. Your experience in technology innovation aligns well with NSF's SBIR program goals. Consider highlighting your prototype results and market validation.
                  </p>
                  <div className="flex items-center gap-2">
                    <Button size="sm">
                      <Zap className="w-4 h-4 mr-1" />
                      Get Application Help
                    </Button>
                    <span className="text-xs text-pulse-text-tertiary">
                      {grant.similarGrants} similar grants available
                    </span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard className="p-6">
              <h2 className="text-lg font-semibold text-pulse-text mb-4">Overview</h2>
              <p className="text-sm text-pulse-text-secondary whitespace-pre-line mb-4">
                {grant.summary}
              </p>
              {grant.description && (
                <div className="pt-4 border-t border-pulse-border">
                  <p className="text-sm text-pulse-text-secondary whitespace-pre-line">
                    {grant.description}
                  </p>
                </div>
              )}
            </GlassCard>
          </motion.div>

          {/* Eligibility */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-pulse-text">Eligibility</h2>
                <Badge variant="success" className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  You qualify
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {grant.eligibility.types.map((type) => (
                  <Badge key={type} variant="accent">{type}</Badge>
                ))}
              </div>
              <p className="text-sm text-pulse-text-secondary">
                {grant.eligibility.raw}
              </p>
            </GlassCard>
          </motion.div>

          {/* Requirements Checklist */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-pulse-text">Requirements Checklist</h2>
                <span className="text-sm text-pulse-text-tertiary">
                  Click to track progress
                </span>
              </div>
              <div className="space-y-2">
                {grant.requirements.map((req, index) => (
                  <RequirementItem key={index} requirement={req} index={index} />
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Match Score Card */}
          <MatchScoreCard score={grant.matchScore} breakdown={grant.matchBreakdown} />

          {/* Key Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
          >
            <GlassCard className="p-6">
              <h2 className="text-lg font-semibold text-pulse-text mb-4">Key Details</h2>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-pulse-accent/10 border border-pulse-accent/20 flex items-center justify-center shrink-0">
                    <DollarSign className="w-4 h-4 text-pulse-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-pulse-text-tertiary uppercase tracking-wider">Funding Amount</p>
                    <p className="text-sm font-semibold text-pulse-text">{grant.amountText}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    isUrgent ? 'bg-pulse-error/10 border border-pulse-error/20' : 'bg-pulse-accent/10 border border-pulse-accent/20'
                  }`}>
                    <Calendar className={`w-4 h-4 ${isUrgent ? 'text-pulse-error' : 'text-pulse-accent'}`} />
                  </div>
                  <div>
                    <p className="text-xs text-pulse-text-tertiary uppercase tracking-wider">Deadline</p>
                    <p className={`text-sm font-semibold ${isUrgent ? 'text-pulse-error' : 'text-pulse-text'}`}>
                      {formatDate(grant.deadlineDate)}
                    </p>
                    <p className="text-xs text-pulse-text-tertiary">{grant.daysLeft} days remaining</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-pulse-accent/10 border border-pulse-accent/20 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-pulse-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-pulse-text-tertiary uppercase tracking-wider">Location</p>
                    <p className="text-sm font-semibold text-pulse-text">United States</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-pulse-accent/10 border border-pulse-accent/20 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-pulse-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-pulse-text-tertiary uppercase tracking-wider">Posted</p>
                    <p className="text-sm font-semibold text-pulse-text">{formatDate(grant.postedDate)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-pulse-accent/10 border border-pulse-accent/20 flex items-center justify-center shrink-0">
                    <Building2 className="w-4 h-4 text-pulse-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-pulse-text-tertiary uppercase tracking-wider">Sponsor</p>
                    <p className="text-sm font-semibold text-pulse-text">{grant.sponsor}</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard className="p-6">
              <h2 className="text-lg font-semibold text-pulse-text mb-4">Contact</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-pulse-text-tertiary" />
                  <span className="text-sm text-pulse-text">{grant.contact.name}</span>
                </div>
                <a
                  href={`mailto:${grant.contact.email}`}
                  className="flex items-center gap-3 text-sm text-pulse-accent hover:underline"
                >
                  <Mail className="w-4 h-4" />
                  {grant.contact.email}
                </a>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-pulse-text-tertiary" />
                  <span className="text-sm text-pulse-text-secondary">{grant.contact.phone}</span>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Source */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
          >
            <GlassCard className="p-6">
              <h2 className="text-sm font-medium text-pulse-text-secondary mb-3">Data Source</h2>
              <div className="flex items-center gap-2 text-sm text-pulse-text-tertiary">
                <Globe className="w-4 h-4" />
                <span>Grants.gov</span>
              </div>
              <p className="text-xs text-pulse-text-tertiary mt-2">
                ID: {grant.sourceId}
              </p>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
