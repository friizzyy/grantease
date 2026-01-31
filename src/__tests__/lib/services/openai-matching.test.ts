import {
  simpleKeywordMatch,
  OrganizationProfile,
  GrantForMatching,
} from '@/lib/services/openai-matching'

describe('OpenAI Matching Service', () => {
  describe('simpleKeywordMatch', () => {
    const mockProfile: OrganizationProfile = {
      name: 'Green Earth Foundation',
      type: 'nonprofit',
      mission: 'Promoting environmental sustainability and climate action',
      focusAreas: ['environment', 'climate', 'sustainability', 'green energy'],
      capabilities: ['research', 'advocacy', 'education'],
    }

    const mockGrants: GrantForMatching[] = [
      {
        id: '1',
        title: 'Climate Action Research Grant',
        sponsor: 'EPA',
        summary: 'Funding for climate research and environmental sustainability projects',
        categories: ['environment', 'research', 'climate'],
        eligibility: ['nonprofit', 'academic'],
        amountMin: 50000,
        amountMax: 100000,
        deadlineDate: new Date('2024-12-31'),
      },
      {
        id: '2',
        title: 'Arts and Culture Grant',
        sponsor: 'NEA',
        summary: 'Supporting local arts organizations and cultural programs',
        categories: ['arts', 'culture', 'community'],
        eligibility: ['nonprofit'],
        amountMin: 10000,
        amountMax: 50000,
        deadlineDate: new Date('2024-12-31'),
      },
      {
        id: '3',
        title: 'Green Energy Innovation Fund',
        sponsor: 'DOE',
        summary: 'Funding for green energy and sustainable technology development',
        categories: ['energy', 'technology', 'sustainability'],
        eligibility: ['nonprofit', 'forprofit', 'academic'],
        amountMin: 100000,
        amountMax: 500000,
        deadlineDate: new Date('2024-06-30'),
      },
    ]

    it('should return matches sorted by score descending', () => {
      const results = simpleKeywordMatch(mockProfile, mockGrants)

      expect(results.length).toBe(3)
      // First result should have highest score (climate/environment grant)
      expect(results[0].grantId).toBe('1')
      // Arts grant should have lowest score
      expect(results[results.length - 1].grantId).toBe('2')
    })

    it('should include grantId in each result', () => {
      const results = simpleKeywordMatch(mockProfile, mockGrants)

      results.forEach(result => {
        expect(result.grantId).toBeDefined()
        expect(['1', '2', '3']).toContain(result.grantId)
      })
    })

    it('should include score between 0 and 100', () => {
      const results = simpleKeywordMatch(mockProfile, mockGrants)

      results.forEach(result => {
        expect(result.score).toBeGreaterThanOrEqual(0)
        expect(result.score).toBeLessThanOrEqual(100)
      })
    })

    it('should include reasoning in each result', () => {
      const results = simpleKeywordMatch(mockProfile, mockGrants)

      results.forEach(result => {
        expect(result.reasoning).toBeDefined()
        expect(typeof result.reasoning).toBe('string')
      })
    })

    it('should include strength and weakness points', () => {
      const results = simpleKeywordMatch(mockProfile, mockGrants)

      results.forEach(result => {
        expect(Array.isArray(result.strengthPoints)).toBe(true)
        expect(Array.isArray(result.weaknessPoints)).toBe(true)
      })
    })

    it('should include recommendations', () => {
      const results = simpleKeywordMatch(mockProfile, mockGrants)

      results.forEach(result => {
        expect(Array.isArray(result.recommendations)).toBe(true)
        expect(result.recommendations.length).toBeGreaterThan(0)
      })
    })

    it('should handle empty focus areas', () => {
      const emptyProfile: OrganizationProfile = {
        name: 'Test Org',
        type: 'nonprofit',
      }

      const results = simpleKeywordMatch(emptyProfile, mockGrants)
      expect(results.length).toBe(3)
      // With no keywords to match, should return default score of 50
      results.forEach(result => {
        expect(result.score).toBe(50)
      })
    })

    it('should handle empty grants array', () => {
      const results = simpleKeywordMatch(mockProfile, [])
      expect(results).toEqual([])
    })

    it('should match keywords from mission statement', () => {
      const profileWithMission: OrganizationProfile = {
        name: 'Health Foundation',
        type: 'nonprofit',
        mission: 'Improving community health and wellness programs',
      }

      const healthGrant: GrantForMatching = {
        id: 'health-1',
        title: 'Community Health Initiative',
        sponsor: 'HHS',
        summary: 'Supporting health programs and community wellness',
        categories: ['health', 'community'],
        eligibility: ['nonprofit'],
      }

      const results = simpleKeywordMatch(profileWithMission, [healthGrant])
      expect(results[0].score).toBeGreaterThan(50)
    })
  })
})
