import Link from 'next/link'
import { 
  ArrowLeft, 
  ExternalLink, 
  Bookmark, 
  Calendar, 
  DollarSign, 
  MapPin, 
  Building, 
  Users,
  CheckCircle2,
  Clock,
  FolderPlus,
  Share2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate, parseJSON } from '@/lib/utils'

// Mock grant data
const mockGrant = {
  id: '1',
  sourceId: 'NSF-2024-001',
  sourceName: 'grants_gov',
  title: 'Small Business Innovation Research (SBIR) Phase I',
  sponsor: 'National Science Foundation',
  summary: 'The SBIR program stimulates technological innovation in the private sector by strengthening the role of small business concerns in meeting Federal research and development needs, increasing the commercial application of federally funded research results, and fostering and encouraging participation by socially and economically disadvantaged small business concerns and women-owned small business concerns in technological innovation.',
  description: 'The National Science Foundation (NSF) SBIR program supports moving scientific excellence and technological innovation from the lab to the market. By funding startups and small businesses, NSF helps build a strong national economy and stimulates the creation of novel products, services, and solutions.\n\nPhase I awards typically provide $275,000 for approximately 6-12 months of research and development. Awardees may apply for Phase II funding of up to $1,000,000 for 24 months to continue development.',
  categories: JSON.stringify(['Small Business', 'Research', 'Technology', 'Innovation']),
  eligibility: JSON.stringify({ 
    types: ['Small Business'], 
    raw: 'Must be a US small business with fewer than 500 employees. The Principal Investigator must be primarily employed by the small business at the time of award.' 
  }),
  locations: JSON.stringify([{ country: 'US' }]),
  amountMin: 50000,
  amountMax: 275000,
  amountText: '$50,000 - $275,000',
  deadlineType: 'fixed',
  deadlineDate: new Date('2024-03-15'),
  postedDate: new Date('2024-01-01'),
  url: 'https://www.nsf.gov/sbir',
  contact: JSON.stringify({ name: 'NSF SBIR Program', email: 'sbir@nsf.gov', phone: '703-292-8050' }),
  requirements: JSON.stringify([
    'Company must be a US-based small business with fewer than 500 employees',
    'Principal Investigator must be primarily employed by the company',
    'Project must address an identified technical challenge',
    'Technical proposal (15 pages max)',
    'Company commercialization plan',
    'Budget and budget justification',
    'Biographical sketches of key personnel',
    'Current and pending support documentation'
  ]),
  status: 'open',
  hashFingerprint: 'abc123',
  duplicateOf: null,
  firstSeenAt: new Date(),
  lastSeenAt: new Date(),
  createdAt: new Date(),
  updatedAt: new Date(),
}

export default function GrantDetailPage({ params }: { params: { id: string } }) {
  const grant = mockGrant
  const categories = parseJSON<string[]>(grant.categories, [])
  const eligibility = parseJSON<{ types: string[]; raw?: string }>(grant.eligibility, { types: [] })
  const requirements = parseJSON<string[]>(grant.requirements || '[]', [])
  const contact = parseJSON<{ name?: string; email?: string; phone?: string }>(grant.contact || '{}', {})
  const locations = parseJSON<{ country?: string; state?: string }[]>(grant.locations, [])

  return (
    <div className="p-8 max-w-6xl">
      {/* Back Button */}
      <Link 
        href="/app/discover"
        className="inline-flex items-center gap-2 text-sm text-pulse-text-secondary hover:text-pulse-text mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Search
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-6 mb-4">
          <div>
            <p className="font-mono text-micro uppercase tracking-wider text-pulse-accent mb-2">
              {grant.sponsor}
            </p>
            <h1 className="font-serif text-heading-lg text-pulse-text mb-3">
              {grant.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant={grant.status === 'open' ? 'success' : 'error'} className="capitalize">
                {grant.status}
              </Badge>
              {categories.slice(0, 4).map((cat) => (
                <Badge key={cat} variant="outline">{cat}</Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button>
            <Bookmark className="w-4 h-4" />
            Save Grant
          </Button>
          <Button variant="secondary">
            <FolderPlus className="w-4 h-4" />
            Create Workspace
          </Button>
          <Button variant="outline" asChild>
            <a href={grant.url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4" />
              View Original
            </a>
          </Button>
          <Button variant="ghost">
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary */}
          <Card >
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-body text-pulse-text-secondary whitespace-pre-line">
                {grant.summary}
              </p>
              {grant.description && (
                <div className="mt-4 pt-4 border-t border-pulse-border">
                  <p className="text-body-sm text-pulse-text-secondary whitespace-pre-line">
                    {grant.description}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Eligibility */}
          <Card >
            <CardHeader>
              <CardTitle>Eligibility</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {eligibility.types.map((type) => (
                  <Badge key={type} variant="accent">{type}</Badge>
                ))}
              </div>
              {eligibility.raw && (
                <p className="text-body-sm text-pulse-text-secondary">
                  {eligibility.raw}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Requirements Checklist */}
          <Card >
            <CardHeader>
              <CardTitle>Requirements Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {requirements.map((req, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full border border-pulse-border flex items-center justify-center shrink-0 mt-0.5">
                      <span className="text-xs text-pulse-text-tertiary">{index + 1}</span>
                    </div>
                    <span className="text-body-sm text-pulse-text-secondary">{req}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Quick Info */}
        <div className="space-y-6">
          {/* Key Details */}
          <Card >
            <CardHeader>
              <CardTitle>Key Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Amount */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-pulse-accent/10 flex items-center justify-center shrink-0">
                  <DollarSign className="w-4 h-4 text-pulse-accent" />
                </div>
                <div>
                  <p className="text-sm text-pulse-text-tertiary">Funding Amount</p>
                  <p className="text-body font-medium text-pulse-text">
                    {grant.amountMin && grant.amountMax
                      ? `${formatCurrency(grant.amountMin)} - ${formatCurrency(grant.amountMax)}`
                      : grant.amountText || 'Varies'}
                  </p>
                </div>
              </div>

              {/* Deadline */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-pulse-accent/10 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-pulse-accent" />
                </div>
                <div>
                  <p className="text-sm text-pulse-text-tertiary">Deadline</p>
                  <p className="text-body font-medium text-pulse-text">
                    {grant.deadlineDate 
                      ? formatDate(grant.deadlineDate)
                      : grant.deadlineType === 'rolling' 
                        ? 'Rolling (Apply anytime)'
                        : 'Not specified'}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-pulse-accent/10 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-pulse-accent" />
                </div>
                <div>
                  <p className="text-sm text-pulse-text-tertiary">Location</p>
                  <p className="text-body font-medium text-pulse-text">
                    {locations.length > 0 
                      ? locations.map(l => l.state || l.country).join(', ')
                      : 'United States'}
                  </p>
                </div>
              </div>

              {/* Posted Date */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-pulse-accent/10 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-pulse-accent" />
                </div>
                <div>
                  <p className="text-sm text-pulse-text-tertiary">Posted</p>
                  <p className="text-body font-medium text-pulse-text">
                    {formatDate(grant.postedDate)}
                  </p>
                </div>
              </div>

              {/* Sponsor */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-pulse-accent/10 flex items-center justify-center shrink-0">
                  <Building className="w-4 h-4 text-pulse-accent" />
                </div>
                <div>
                  <p className="text-sm text-pulse-text-tertiary">Sponsor</p>
                  <p className="text-body font-medium text-pulse-text">
                    {grant.sponsor}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          {(contact.name || contact.email || contact.phone) && (
            <Card >
              <CardHeader>
                <CardTitle>Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-body-sm">
                {contact.name && (
                  <p className="text-pulse-text">{contact.name}</p>
                )}
                {contact.email && (
                  <a href={`mailto:${contact.email}`} className="block text-pulse-accent hover:underline">
                    {contact.email}
                  </a>
                )}
                {contact.phone && (
                  <p className="text-pulse-text-secondary">{contact.phone}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Source Info */}
          <Card >
            <CardHeader>
              <CardTitle>Source</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-body-sm text-pulse-text-secondary mb-3">
                Data sourced from {grant.sourceName === 'grants_gov' ? 'Grants.gov' : grant.sourceName}
              </p>
              <p className="text-xs text-pulse-text-tertiary">
                Last updated: {formatDate(grant.lastSeenAt)}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
