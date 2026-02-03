/**
 * PIPELINE REGRESSION TESTS
 * -------------------------
 * Tests to verify the grant discovery pipeline works correctly.
 * Run with: npx jest src/lib/tests/pipeline.test.ts
 */

import { describe, it, expect, beforeAll } from '@jest/globals'

import {
  runEligibilityEngine,
  filterEligibleGrants,
  UserProfileForEligibility,
  GrantForEligibility,
} from '@/lib/eligibility/engine'

import {
  calculateScore,
  scoreAndSortGrants,
  UserProfileForScoring,
  GrantForScoring,
} from '@/lib/scoring/engine'

import { EntityType, IndustryTag, BudgetRange } from '@/lib/constants/taxonomy'

// ============= TEST FIXTURES =============

/**
 * Test user profiles representing different user types
 */
export const TEST_PROFILES: Record<string, UserProfileForEligibility & UserProfileForScoring> = {
  // Small business farmer in California
  agriculture_ca: {
    entityType: 'small_business',
    state: 'CA',
    industryTags: ['agriculture'],
    certifications: [],
    sizeBand: 'small',
    annualBudget: '100k_250k',
  },

  // Nonprofit in New York focused on youth
  nonprofit_ny: {
    entityType: 'nonprofit',
    state: 'NY',
    industryTags: ['community', 'youth'],
    certifications: [],
    sizeBand: 'micro',
    annualBudget: 'under_50k',
  },

  // Individual homeowner in Washington interested in climate/housing
  homeowner_wa: {
    entityType: 'individual',
    state: 'WA',
    industryTags: ['climate', 'housing'],
    certifications: [],
    sizeBand: 'solo',
    annualBudget: 'under_50k',
  },

  // Medium manufacturer in Texas
  manufacturer_tx: {
    entityType: 'small_business',
    state: 'TX',
    industryTags: ['business', 'technology'],
    certifications: [],
    sizeBand: 'medium',
    annualBudget: '500k_1m',
  },

  // Tech startup in Massachusetts
  startup_ma: {
    entityType: 'small_business',
    state: 'MA',
    industryTags: ['technology', 'research'],
    certifications: [],
    sizeBand: 'micro',
    annualBudget: '50k_100k',
  },

  // Tribal organization in Arizona
  tribal_az: {
    entityType: 'tribal',
    state: 'AZ',
    industryTags: ['community', 'arts_culture'],
    certifications: [],
    sizeBand: 'small',
    annualBudget: '100k_250k',
  },
}

/**
 * Test grants representing different grant types
 */
export const TEST_GRANTS: Record<string, GrantForEligibility & GrantForScoring> = {
  // USDA Agriculture grant - should match agriculture profiles
  usda_agriculture: {
    id: 'test_usda_agriculture',
    title: 'USDA Beginning Farmer and Rancher Development Program',
    sponsor: 'U.S. Department of Agriculture',
    summary: 'Funding for beginning farmers and ranchers in agricultural operations.',
    description: 'This program provides education, training, outreach, and technical assistance to beginning farmers and ranchers.',
    categories: ['Agriculture', 'Rural Development', 'Small Business'],
    eligibility: {
      tags: ['small_business', 'nonprofit', 'tribal'],
      rawText: 'Eligible applicants include small businesses, nonprofits, and tribal organizations involved in agriculture.',
    },
    locations: [{ type: 'national' }],
    url: 'https://www.usda.gov/grants',
    status: 'open',
    qualityScore: 85,
    amountMin: 50000,
    amountMax: 250000,
    amountText: '$50,000 - $250,000',
    fundingType: 'grant',
    purposeTags: ['equipment', 'training', 'operating'],
    deadlineDate: new Date('2025-06-30'),
  },

  // Teacher grant - should NOT match agriculture profiles
  teacher_grant: {
    id: 'test_teacher_grant',
    title: 'K-12 Teacher Professional Development Grant',
    sponsor: 'Department of Education',
    summary: 'Supporting K-12 teachers with professional development funding.',
    description: 'This grant provides funding for K-12 classroom teachers to attend professional development workshops.',
    categories: ['Education', 'Teacher', 'Professional Development'],
    eligibility: {
      tags: ['individual', 'school_district', 'educational_institution'],
      rawText: 'Open to K-12 classroom teachers and school districts.',
    },
    locations: [{ type: 'national' }],
    url: 'https://www.ed.gov/grants',
    status: 'open',
    qualityScore: 80,
    amountMin: 5000,
    amountMax: 25000,
    amountText: '$5,000 - $25,000',
    fundingType: 'grant',
    purposeTags: ['training'],
    deadlineDate: new Date('2025-04-15'),
  },

  // Youth nonprofit grant - should match nonprofit with youth focus
  youth_nonprofit_grant: {
    id: 'test_youth_nonprofit',
    title: 'Youth Development Initiative Grant',
    sponsor: 'Annie E. Casey Foundation',
    summary: 'Supporting nonprofits working with underserved youth.',
    description: 'This initiative supports evidence-based youth development programs in underserved communities.',
    categories: ['Youth', 'Community Development', 'Nonprofit'],
    eligibility: {
      tags: ['nonprofit'],
      rawText: 'Open to 501(c)(3) nonprofit organizations with at least 2 years of experience in youth programming.',
    },
    locations: [{ type: 'state', value: 'NY' }, { type: 'state', value: 'NJ' }],
    url: 'https://www.aecf.org/grants',
    status: 'open',
    qualityScore: 90,
    amountMin: 100000,
    amountMax: 500000,
    amountText: '$100,000 - $500,000',
    fundingType: 'grant',
    purposeTags: ['operating', 'hiring'],
    deadlineDate: new Date('2025-05-01'),
  },

  // Homeowner energy efficiency grant
  homeowner_energy: {
    id: 'test_homeowner_energy',
    title: 'Residential Clean Energy Rebate Program',
    sponsor: 'Department of Energy',
    summary: 'Rebates for homeowners installing clean energy systems.',
    description: 'This program provides rebates to homeowners who install solar panels, heat pumps, or other clean energy systems.',
    categories: ['Energy', 'Climate', 'Residential'],
    eligibility: {
      tags: ['individual', 'homeowner'],
      rawText: 'Available to homeowners in participating states. Must own the property and be the primary residence.',
    },
    locations: [{ type: 'state', value: 'WA' }, { type: 'state', value: 'OR' }, { type: 'state', value: 'CA' }],
    url: 'https://www.energy.gov/rebates',
    status: 'open',
    qualityScore: 88,
    amountMin: 2000,
    amountMax: 14000,
    amountText: 'Up to $14,000',
    fundingType: 'rebate',
    purposeTags: ['equipment', 'construction'],
    deadlineDate: null,
  },

  // State-specific grant for Texas only
  texas_only_grant: {
    id: 'test_texas_only',
    title: 'Texas Enterprise Fund',
    sponsor: 'Office of the Governor of Texas',
    summary: 'Economic development funding for Texas businesses.',
    description: 'The Texas Enterprise Fund helps attract and retain businesses in Texas through economic incentives.',
    categories: ['Business', 'Economic Development'],
    eligibility: {
      tags: ['small_business', 'corporation'],
      rawText: 'Businesses must be located in Texas or relocating to Texas.',
    },
    locations: [{ type: 'state', value: 'TX' }],
    url: 'https://gov.texas.gov/tef',
    status: 'open',
    qualityScore: 82,
    amountMin: 100000,
    amountMax: 5000000,
    amountText: '$100,000+',
    fundingType: 'grant',
    purposeTags: ['expansion', 'hiring', 'equipment'],
    deadlineDate: null,
  },

  // Tech/research grant - includes more keywords to ensure industry relevance match
  sbir_tech_grant: {
    id: 'test_sbir',
    title: 'SBIR Phase I Technology Development',
    sponsor: 'National Science Foundation',
    summary: 'Funding for small businesses to develop innovative technologies through NSF scientific research.',
    description: 'The Small Business Innovation Research (SBIR) program funds early-stage R&D in science and technology. This technology innovation grant supports research and development.',
    categories: ['Technology', 'Research', 'Innovation'],
    eligibility: {
      tags: ['small_business'],
      rawText: 'Must be a U.S. small business with less than 500 employees. Principal investigator must be primarily employed by the small business.',
    },
    locations: [{ type: 'national' }],
    url: 'https://www.nsf.gov/sbir',
    status: 'open',
    qualityScore: 95,
    amountMin: 256000,
    amountMax: 256000,
    amountText: 'Up to $256,000',
    fundingType: 'grant',
    purposeTags: ['r_and_d'],
    deadlineDate: new Date('2025-06-05'),
  },

  // Tribal-specific grant
  tribal_arts_grant: {
    id: 'test_tribal_arts',
    title: 'Native American Arts Initiative',
    sponsor: 'National Endowment for the Arts',
    summary: 'Supporting Native American art and cultural preservation.',
    description: 'This program supports Native American artists and tribal organizations preserving traditional and contemporary art forms.',
    categories: ['Arts', 'Culture', 'Tribal'],
    eligibility: {
      tags: ['tribal', 'nonprofit'],
      rawText: 'Federally recognized tribal organizations and Native American-serving nonprofits.',
    },
    locations: [{ type: 'national' }],
    url: 'https://www.arts.gov/tribal',
    status: 'open',
    qualityScore: 85,
    amountMin: 10000,
    amountMax: 100000,
    amountText: '$10,000 - $100,000',
    fundingType: 'grant',
    purposeTags: ['operating', 'training'],
    deadlineDate: new Date('2025-03-15'),
  },

  // Grant with no URL (should be filtered)
  no_url_grant: {
    id: 'test_no_url',
    title: 'Mystery Grant Program',
    sponsor: 'Unknown Foundation',
    summary: 'A grant with missing information.',
    description: 'This grant has no valid URL.',
    categories: ['General'],
    eligibility: {
      tags: ['nonprofit'],
    },
    locations: [{ type: 'national' }],
    url: '',
    status: 'open',
    qualityScore: 30,
    amountMin: null,
    amountMax: null,
    amountText: null,
    fundingType: null,
    purposeTags: [],
    deadlineDate: null,
  },

  // Closed grant
  closed_grant: {
    id: 'test_closed',
    title: 'Expired Opportunity',
    sponsor: 'Past Foundation',
    summary: 'This grant is no longer accepting applications.',
    description: 'Applications closed.',
    categories: ['General'],
    eligibility: {
      tags: ['nonprofit'],
    },
    locations: [{ type: 'national' }],
    url: 'https://example.com',
    status: 'closed',
    qualityScore: 80,
    amountMin: 50000,
    amountMax: 100000,
    amountText: '$50,000 - $100,000',
    fundingType: 'grant',
    purposeTags: [],
    deadlineDate: new Date('2024-01-01'),
  },
}

// ============= ELIGIBILITY TESTS =============

describe('Eligibility Engine', () => {
  describe('Entity Type Matching', () => {
    it('should allow small_business for agriculture grant', () => {
      const result = runEligibilityEngine(TEST_PROFILES.agriculture_ca, TEST_GRANTS.usda_agriculture)
      expect(result.isEligible).toBe(true)
      expect(result.passedFilters).toContain('ENTITY_TYPE')
    })

    it('should reject individual for SBIR grant', () => {
      const result = runEligibilityEngine(TEST_PROFILES.homeowner_wa, TEST_GRANTS.sbir_tech_grant)
      expect(result.isEligible).toBe(false)
      expect(result.failedFilters).toContain('ENTITY_TYPE')
    })

    it('should allow nonprofit for youth grant', () => {
      const result = runEligibilityEngine(TEST_PROFILES.nonprofit_ny, TEST_GRANTS.youth_nonprofit_grant)
      expect(result.isEligible).toBe(true)
    })

    it('should allow tribal for tribal arts grant', () => {
      const result = runEligibilityEngine(TEST_PROFILES.tribal_az, TEST_GRANTS.tribal_arts_grant)
      expect(result.isEligible).toBe(true)
      expect(result.passedFilters).toContain('ENTITY_TYPE')
    })
  })

  describe('Geography Matching', () => {
    it('should allow WA resident for WA/OR/CA grant', () => {
      const result = runEligibilityEngine(TEST_PROFILES.homeowner_wa, TEST_GRANTS.homeowner_energy)
      expect(result.isEligible).toBe(true)
      expect(result.passedFilters).toContain('GEOGRAPHY')
    })

    it('should reject NY resident for Texas-only grant', () => {
      const result = runEligibilityEngine(TEST_PROFILES.nonprofit_ny, TEST_GRANTS.texas_only_grant)
      expect(result.isEligible).toBe(false)
      expect(result.failedFilters).toContain('GEOGRAPHY')
    })

    it('should allow TX resident for Texas grant', () => {
      const result = runEligibilityEngine(TEST_PROFILES.manufacturer_tx, TEST_GRANTS.texas_only_grant)
      expect(result.isEligible).toBe(true)
    })

    it('should allow any state for national grants', () => {
      const result = runEligibilityEngine(TEST_PROFILES.startup_ma, TEST_GRANTS.sbir_tech_grant)
      expect(result.isEligible).toBe(true)
    })
  })

  describe('Industry Relevance', () => {
    it('should match agriculture profile with agriculture grant', () => {
      const result = runEligibilityEngine(TEST_PROFILES.agriculture_ca, TEST_GRANTS.usda_agriculture)
      expect(result.isEligible).toBe(true)
      expect(result.passedFilters).toContain('INDUSTRY_RELEVANCE')
    })

    it('should NOT match agriculture profile with teacher grant', () => {
      const result = runEligibilityEngine(TEST_PROFILES.agriculture_ca, TEST_GRANTS.teacher_grant)
      // Teacher grant has explicit entity type requirements
      expect(result.failedFilters.length).toBeGreaterThan(0)
    })

    it('should match tech startup with SBIR grant', () => {
      const result = runEligibilityEngine(TEST_PROFILES.startup_ma, TEST_GRANTS.sbir_tech_grant)
      expect(result.isEligible).toBe(true)
    })
  })

  describe('Data Quality Filters', () => {
    it('should reject grants with no URL', () => {
      const result = runEligibilityEngine(TEST_PROFILES.nonprofit_ny, TEST_GRANTS.no_url_grant)
      expect(result.isEligible).toBe(false)
      expect(result.failedFilters).toContain('URL_EXISTS')
    })

    it('should reject closed grants', () => {
      const result = runEligibilityEngine(TEST_PROFILES.nonprofit_ny, TEST_GRANTS.closed_grant)
      expect(result.isEligible).toBe(false)
      expect(result.failedFilters).toContain('GRANT_STATUS')
    })
  })

  describe('Batch Filtering', () => {
    it('should correctly filter a batch of grants', () => {
      const allGrants = Object.values(TEST_GRANTS)
      const result = filterEligibleGrants(TEST_PROFILES.agriculture_ca, allGrants)

      // Agriculture CA should be eligible for USDA agriculture, not teacher/homeowner specific
      const eligibleIds = result.eligible.map(g => g.id)
      expect(eligibleIds).toContain('test_usda_agriculture')
      expect(eligibleIds).not.toContain('test_no_url')
      expect(eligibleIds).not.toContain('test_closed')
    })
  })
})

// ============= SCORING TESTS =============

describe('Scoring Engine', () => {
  describe('Entity Type Scoring', () => {
    it('should give higher score for matching entity type', () => {
      const result = calculateScore(TEST_PROFILES.agriculture_ca, TEST_GRANTS.usda_agriculture)
      expect(result.breakdown.entityMatch).toBeGreaterThan(10)
    })
  })

  describe('Industry Scoring', () => {
    it('should give higher score for matching industry', () => {
      const agricultureScore = calculateScore(TEST_PROFILES.agriculture_ca, TEST_GRANTS.usda_agriculture)
      const techScore = calculateScore(TEST_PROFILES.startup_ma, TEST_GRANTS.usda_agriculture)

      // Agriculture profile should score higher on agriculture grant
      expect(agricultureScore.breakdown.industryMatch).toBeGreaterThan(techScore.breakdown.industryMatch)
    })

    it('should give maximum industry score for perfect match', () => {
      const result = calculateScore(TEST_PROFILES.startup_ma, TEST_GRANTS.sbir_tech_grant)
      expect(result.breakdown.industryMatch).toBeGreaterThanOrEqual(15)
    })
  })

  describe('Geography Scoring', () => {
    it('should give higher score for state match', () => {
      const txResult = calculateScore(TEST_PROFILES.manufacturer_tx, TEST_GRANTS.texas_only_grant)
      const nyResult = calculateScore(TEST_PROFILES.nonprofit_ny, TEST_GRANTS.texas_only_grant)

      expect(txResult.breakdown.geographyMatch).toBeGreaterThan(nyResult.breakdown.geographyMatch)
    })
  })

  describe('Tier Assignment', () => {
    it('should assign excellent tier for high scores', () => {
      const result = calculateScore(TEST_PROFILES.agriculture_ca, TEST_GRANTS.usda_agriculture)
      // Perfect match should be at least "good" tier
      expect(['excellent', 'good']).toContain(result.tier)
    })

    it('should assign lower tier for mismatched entity types', () => {
      const result = calculateScore(TEST_PROFILES.homeowner_wa, TEST_GRANTS.sbir_tech_grant)
      // Individual homeowner for SBIR small business grant - entity mismatch should lower score
      // But industry (technology) might still partially match
      expect(result.breakdown.entityMatch).toBeLessThan(10) // Mismatch should give low entity score
    })
  })

  describe('Batch Scoring', () => {
    it('should sort grants by score descending', () => {
      const grants = [TEST_GRANTS.usda_agriculture, TEST_GRANTS.teacher_grant, TEST_GRANTS.sbir_tech_grant]
      const scored = scoreAndSortGrants(TEST_PROFILES.agriculture_ca, grants)

      // Scores should be in descending order
      for (let i = 1; i < scored.length; i++) {
        expect(scored[i - 1].scoring.totalScore).toBeGreaterThanOrEqual(scored[i].scoring.totalScore)
      }

      // USDA agriculture should score higher than teacher grant for agriculture profile
      const usdaScore = scored.find(g => g.id === 'test_usda_agriculture')!.scoring.totalScore
      const teacherScore = scored.find(g => g.id === 'test_teacher_grant')!.scoring.totalScore
      expect(usdaScore).toBeGreaterThan(teacherScore)
    })
  })
})

// ============= REGRESSION TESTS =============

describe('Regression Tests', () => {
  it('agriculture profile should NEVER see teacher grants in top results', () => {
    const allGrants = Object.values(TEST_GRANTS).filter(g => g.url && g.status === 'open')
    const scored = scoreAndSortGrants(TEST_PROFILES.agriculture_ca, allGrants)
    const top5 = scored.slice(0, 5)

    const hasTeacher = top5.some(g =>
      g.title.toLowerCase().includes('teacher') ||
      g.categories.some(c => c.toLowerCase().includes('teacher'))
    )

    expect(hasTeacher).toBe(false)
  })

  it('nonprofit in NY should see youth grants highly ranked', () => {
    const allGrants = Object.values(TEST_GRANTS).filter(g => g.url && g.status === 'open')
    const result = filterEligibleGrants(TEST_PROFILES.nonprofit_ny, allGrants)
    const scored = scoreAndSortGrants(TEST_PROFILES.nonprofit_ny, result.eligible)

    const youthGrantRank = scored.findIndex(g => g.id === 'test_youth_nonprofit')
    expect(youthGrantRank).toBeLessThan(3) // Should be in top 3
  })

  it('Texas business should see Texas-specific grants', () => {
    const result = filterEligibleGrants(TEST_PROFILES.manufacturer_tx, Object.values(TEST_GRANTS))
    const texasGrant = result.eligible.find(g => g.id === 'test_texas_only')
    expect(texasGrant).toBeDefined()
  })

  it('non-Texas business should NOT see Texas-only grants', () => {
    const result = filterEligibleGrants(TEST_PROFILES.startup_ma, Object.values(TEST_GRANTS))
    const texasGrant = result.eligible.find(g => g.id === 'test_texas_only')
    expect(texasGrant).toBeUndefined()
  })

  it('all results should have valid URLs', () => {
    const allGrants = Object.values(TEST_GRANTS)
    const result = filterEligibleGrants(TEST_PROFILES.nonprofit_ny, allGrants)

    for (const grant of result.eligible) {
      expect(grant.url).toBeTruthy()
    }
  })

  it('no closed grants should appear in eligible results', () => {
    const allGrants = Object.values(TEST_GRANTS)
    const result = filterEligibleGrants(TEST_PROFILES.nonprofit_ny, allGrants)

    const closedGrant = result.eligible.find(g => g.status === 'closed')
    expect(closedGrant).toBeUndefined()
  })
})

// ============= EDGE CASE TESTS =============

describe('Edge Cases', () => {
  it('should handle profile with no industry tags', () => {
    const emptyProfile: UserProfileForEligibility = {
      entityType: 'nonprofit',
      state: 'CA',
      industryTags: [],
      certifications: [],
      sizeBand: null,
      annualBudget: null,
    }

    const result = runEligibilityEngine(emptyProfile, TEST_GRANTS.usda_agriculture)
    // Should still be able to process, just with lower confidence
    expect(result.confidenceLevel).toBe('low')
  })

  it('should handle grant with minimal data', () => {
    const minimalGrant: GrantForEligibility = {
      id: 'minimal',
      title: 'Minimal Grant',
      sponsor: 'Unknown',
      summary: null,
      description: null,
      categories: [],
      eligibility: { tags: [] },
      locations: [],
      url: 'https://example.com',
      status: 'open',
      qualityScore: 50,
      amountMin: null,
      amountMax: null,
    }

    const result = runEligibilityEngine(TEST_PROFILES.nonprofit_ny, minimalGrant)
    // Should process without error
    expect(result).toHaveProperty('isEligible')
    expect(result).toHaveProperty('confidenceLevel')
  })

  it('should handle empty grant list', () => {
    const result = filterEligibleGrants(TEST_PROFILES.agriculture_ca, [])
    expect(result.eligible).toHaveLength(0)
    expect(result.ineligible).toHaveLength(0)
  })
})
