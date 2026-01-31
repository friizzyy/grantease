'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, DollarSign, ArrowRight, Loader2 } from 'lucide-react'

// Mock grant database for suggestions
const grantDatabase = [
  // Climate & Environment
  { id: 1, name: 'CA Climate Action Fund', keywords: ['climate', 'california', 'environmental', 'green', 'sustainability'], amount: '$500K - $2M', match: 94, deadline: '45 days', category: 'Environment' },
  { id: 2, name: 'Environmental Justice Grant', keywords: ['environment', 'justice', 'community', 'epa', 'pollution'], amount: '$100K - $750K', match: 89, deadline: '30 days', category: 'Environment' },
  { id: 3, name: 'Green Communities Initiative', keywords: ['green', 'community', 'sustainable', 'urban', 'renewable'], amount: '$250K - $1M', match: 85, deadline: '60 days', category: 'Environment' },
  { id: 4, name: 'Clean Energy Innovation Fund', keywords: ['clean', 'energy', 'solar', 'wind', 'renewable', 'innovation'], amount: '$1M - $5M', match: 91, deadline: '90 days', category: 'Energy' },

  // Technology & Innovation
  { id: 5, name: 'SBIR Phase I - Technology', keywords: ['technology', 'tech', 'startup', 'innovation', 'sbir', 'research'], amount: '$50K - $275K', match: 92, deadline: '55 days', category: 'Technology' },
  { id: 6, name: 'Digital Transformation Grant', keywords: ['digital', 'technology', 'software', 'ai', 'automation'], amount: '$100K - $500K', match: 87, deadline: '40 days', category: 'Technology' },
  { id: 7, name: 'AI Research Initiative', keywords: ['ai', 'artificial intelligence', 'machine learning', 'research', 'tech'], amount: '$200K - $1M', match: 88, deadline: '75 days', category: 'Technology' },

  // Healthcare & Wellness
  { id: 8, name: 'Community Health Initiative', keywords: ['health', 'healthcare', 'community', 'wellness', 'medical'], amount: '$150K - $600K', match: 86, deadline: '35 days', category: 'Healthcare' },
  { id: 9, name: 'Mental Health Services Grant', keywords: ['mental health', 'wellness', 'counseling', 'therapy', 'behavioral'], amount: '$75K - $300K', match: 90, deadline: '50 days', category: 'Healthcare' },
  { id: 10, name: 'Rural Healthcare Access Fund', keywords: ['rural', 'healthcare', 'medical', 'access', 'underserved'], amount: '$200K - $800K', match: 84, deadline: '65 days', category: 'Healthcare' },

  // Education
  { id: 11, name: 'STEM Education Grant', keywords: ['education', 'stem', 'science', 'math', 'school', 'students'], amount: '$50K - $250K', match: 93, deadline: '42 days', category: 'Education' },
  { id: 12, name: 'Youth Development Program', keywords: ['youth', 'education', 'children', 'development', 'after-school'], amount: '$100K - $400K', match: 88, deadline: '38 days', category: 'Education' },
  { id: 13, name: 'Workforce Training Initiative', keywords: ['workforce', 'training', 'jobs', 'employment', 'skills'], amount: '$150K - $500K', match: 85, deadline: '70 days', category: 'Education' },

  // Nonprofit & Community
  { id: 14, name: 'Nonprofit Capacity Building', keywords: ['nonprofit', 'capacity', 'organization', 'ngo', 'charity'], amount: '$25K - $150K', match: 91, deadline: '28 days', category: 'Nonprofit' },
  { id: 15, name: 'Community Development Block Grant', keywords: ['community', 'development', 'housing', 'urban', 'neighborhood'], amount: '$100K - $1M', match: 87, deadline: '52 days', category: 'Community' },
  { id: 16, name: 'Social Enterprise Fund', keywords: ['social', 'enterprise', 'impact', 'business', 'startup'], amount: '$50K - $300K', match: 89, deadline: '45 days', category: 'Social Impact' },

  // Arts & Culture
  { id: 17, name: 'Arts & Culture Grant', keywords: ['arts', 'culture', 'museum', 'gallery', 'creative'], amount: '$10K - $100K', match: 86, deadline: '33 days', category: 'Arts' },
  { id: 18, name: 'Creative Communities Fund', keywords: ['creative', 'arts', 'community', 'public art', 'cultural'], amount: '$25K - $200K', match: 84, deadline: '48 days', category: 'Arts' },

  // Agriculture & Food
  { id: 19, name: 'Sustainable Agriculture Grant', keywords: ['agriculture', 'farming', 'sustainable', 'food', 'organic'], amount: '$75K - $400K', match: 88, deadline: '55 days', category: 'Agriculture' },
  { id: 20, name: 'Food Security Initiative', keywords: ['food', 'hunger', 'security', 'nutrition', 'pantry'], amount: '$50K - $250K', match: 90, deadline: '40 days', category: 'Food' },

  // Small Business
  { id: 21, name: 'Small Business Innovation Grant', keywords: ['small business', 'startup', 'entrepreneur', 'sba', 'innovation'], amount: '$50K - $500K', match: 92, deadline: '60 days', category: 'Business' },
  { id: 22, name: 'Minority Business Development', keywords: ['minority', 'business', 'diverse', 'entrepreneur', 'mbe'], amount: '$25K - $200K', match: 87, deadline: '35 days', category: 'Business' },
  { id: 23, name: 'Women-Owned Business Fund', keywords: ['women', 'business', 'entrepreneur', 'wbe', 'female'], amount: '$50K - $300K', match: 89, deadline: '45 days', category: 'Business' },
]

function searchGrants(query: string): typeof grantDatabase {
  if (!query.trim()) return []

  const searchTerms = query.toLowerCase().split(/\s+/)

  const scored = grantDatabase.map(grant => {
    let score = 0
    const allKeywords = [...grant.keywords, grant.name.toLowerCase(), grant.category.toLowerCase()]

    searchTerms.forEach(term => {
      allKeywords.forEach(keyword => {
        if (keyword.includes(term) || term.includes(keyword)) {
          score += keyword === term ? 3 : 1
        }
      })
    })

    return { ...grant, score }
  })

  return scored
    .filter(g => g.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
}

// Get 3 random grants for default display
function getRandomGrants(): typeof grantDatabase {
  const shuffled = [...grantDatabase].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, 3)
}

// Fixed set of grants for SSR to avoid hydration mismatch
const DEFAULT_GRANTS = grantDatabase.slice(0, 3)

export function HeroSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<typeof grantDatabase>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [defaultGrants, setDefaultGrants] = useState(DEFAULT_GRANTS)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  // Randomize grants after hydration to avoid mismatch
  useEffect(() => {
    setDefaultGrants(getRandomGrants())
  }, [])

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    if (!query.trim()) {
      setResults([])
      setHasSearched(false)
      setIsSearching(false)
      return
    }

    setIsSearching(true)

    debounceRef.current = setTimeout(() => {
      const searchResults = searchGrants(query)
      setResults(searchResults)
      setIsSearching(false)
      setHasSearched(true)
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query])

  const handleResultClick = (grantName?: string) => {
    // Store the search query or grant name for the registration page
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('grantSearchQuery', query || grantName || '')
    }
    router.push('/register')
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      handleResultClick()
    }
  }

  const showResults = isFocused && query.trim().length > 0

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl shadow-black/30">
        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="p-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-4">
            <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl focus-within:border-pulse-accent/50 transition-colors">
              {isSearching ? (
                <Loader2 className="w-5 h-5 text-pulse-accent animate-spin" />
              ) : (
                <Search className="w-5 h-5 text-pulse-text-tertiary" />
              )}
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setTimeout(() => setIsFocused(false), 200)}
                placeholder="Try: climate nonprofit, tech startup, education..."
                className="flex-1 bg-transparent text-pulse-text placeholder:text-pulse-text-tertiary focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-pulse-accent text-pulse-bg font-semibold rounded-xl hover:bg-pulse-accent/90 transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {/* Results */}
        <div className="p-5">
          <AnimatePresence mode="wait">
            {!hasSearched && !query.trim() ? (
              // Default state - show random clickable grants
              <motion.div
                key="default"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-pulse-text-secondary">
                    Featured grants
                  </span>
                  <span className="text-xs text-pulse-text-tertiary">Click to get started</span>
                </div>

                <div className="space-y-3">
                  {defaultGrants.map((grant, i) => (
                    <motion.button
                      key={grant.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => handleResultClick(grant.name)}
                      className="w-full flex items-center justify-between gap-4 p-4 bg-white/[0.02] border border-white/[0.04] rounded-xl hover:border-pulse-accent/30 hover:bg-white/[0.04] transition-all cursor-pointer text-left group"
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-pulse-accent/10 flex items-center justify-center shrink-0 group-hover:bg-pulse-accent/20 transition-colors">
                          <DollarSign className="w-5 h-5 text-pulse-accent" />
                        </div>
                        <div className="min-w-0 text-left">
                          <div className="font-medium text-pulse-text truncate group-hover:text-pulse-accent transition-colors">{grant.name}</div>
                          <div className="text-sm text-pulse-text-tertiary">{grant.amount}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                        <div className="text-right hidden sm:block">
                          <div className="text-sm text-pulse-text">{grant.deadline}</div>
                          <div className="text-xs text-pulse-text-tertiary">remaining</div>
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-pulse-accent">{grant.match}%</div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : hasSearched && results.length > 0 ? (
              // Real search results
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-pulse-text-secondary">
                    Found <span className="text-pulse-accent font-bold">{results.length}</span> matching grants
                  </span>
                  <span className="text-xs text-pulse-text-tertiary">0.3s</span>
                </div>

                <div className="space-y-3">
                  {results.map((grant, i) => (
                    <motion.button
                      key={grant.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => handleResultClick(grant.name)}
                      className="w-full flex items-center justify-between gap-4 p-4 bg-white/[0.02] border border-white/[0.04] rounded-xl hover:border-pulse-accent/30 hover:bg-white/[0.04] transition-all cursor-pointer text-left group"
                    >
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-pulse-accent/10 flex items-center justify-center shrink-0 group-hover:bg-pulse-accent/20 transition-colors">
                          <DollarSign className="w-5 h-5 text-pulse-accent" />
                        </div>
                        <div className="min-w-0 text-left">
                          <div className="font-medium text-pulse-text truncate group-hover:text-pulse-accent transition-colors">{grant.name}</div>
                          <div className="text-sm text-pulse-text-tertiary">{grant.amount}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                        <div className="text-right hidden sm:block">
                          <div className="text-sm text-pulse-text">{grant.deadline}</div>
                          <div className="text-xs text-pulse-text-tertiary">remaining</div>
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-pulse-accent">{grant.match}%</div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : hasSearched && results.length === 0 ? (
              // No results
              <motion.div
                key="no-results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center py-8"
              >
                <p className="text-pulse-text-secondary mb-2">No exact matches found for "{query}"</p>
                <p className="text-sm text-pulse-text-tertiary">
                  Sign up to access our full database of 20,000+ grants
                </p>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* CTA fade */}
          <div className="relative mt-4 pt-6">
            <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-t from-transparent to-pulse-bg/50 pointer-events-none" />
            <button
              onClick={() => handleResultClick()}
              className="inline-flex items-center gap-2 text-pulse-accent font-semibold hover:underline"
            >
              Sign up free to see all results
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
