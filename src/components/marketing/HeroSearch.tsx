'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ArrowRight, Loader2 } from 'lucide-react'

const categoryColors: Record<string, string> = {
  Environment: 'text-emerald-400 bg-emerald-400/10',
  Energy: 'text-amber-400 bg-amber-400/10',
  Technology: 'text-violet-400 bg-violet-400/10',
  Healthcare: 'text-rose-400 bg-rose-400/10',
  Education: 'text-blue-400 bg-blue-400/10',
  Nonprofit: 'text-purple-400 bg-purple-400/10',
  Community: 'text-cyan-400 bg-cyan-400/10',
  'Social Impact': 'text-pink-400 bg-pink-400/10',
  Arts: 'text-orange-400 bg-orange-400/10',
  Agriculture: 'text-lime-400 bg-lime-400/10',
  Food: 'text-yellow-400 bg-yellow-400/10',
  Business: 'text-teal-400 bg-teal-400/10',
}

const grantDatabase = [
  { id: 1, name: 'CA Climate Action Fund', keywords: ['climate', 'california', 'environmental', 'green', 'sustainability'], amount: '$500K – $2M', match: 94, deadline: '45 days', category: 'Environment' },
  { id: 2, name: 'Environmental Justice Grant', keywords: ['environment', 'justice', 'community', 'epa', 'pollution'], amount: '$100K – $750K', match: 89, deadline: '30 days', category: 'Environment' },
  { id: 3, name: 'Green Communities Initiative', keywords: ['green', 'community', 'sustainable', 'urban', 'renewable'], amount: '$250K – $1M', match: 85, deadline: '60 days', category: 'Environment' },
  { id: 4, name: 'Clean Energy Innovation Fund', keywords: ['clean', 'energy', 'solar', 'wind', 'renewable', 'innovation'], amount: '$1M – $5M', match: 91, deadline: '90 days', category: 'Energy' },
  { id: 5, name: 'SBIR Phase I – Technology', keywords: ['technology', 'tech', 'startup', 'innovation', 'sbir', 'research'], amount: '$50K – $275K', match: 92, deadline: '55 days', category: 'Technology' },
  { id: 6, name: 'Digital Transformation Grant', keywords: ['digital', 'technology', 'software', 'ai', 'automation'], amount: '$100K – $500K', match: 87, deadline: '40 days', category: 'Technology' },
  { id: 7, name: 'AI Research Initiative', keywords: ['ai', 'artificial intelligence', 'machine learning', 'research', 'tech'], amount: '$200K – $1M', match: 88, deadline: '75 days', category: 'Technology' },
  { id: 8, name: 'Community Health Initiative', keywords: ['health', 'healthcare', 'community', 'wellness', 'medical'], amount: '$150K – $600K', match: 86, deadline: '35 days', category: 'Healthcare' },
  { id: 9, name: 'Mental Health Services Grant', keywords: ['mental health', 'wellness', 'counseling', 'therapy', 'behavioral'], amount: '$75K – $300K', match: 90, deadline: '50 days', category: 'Healthcare' },
  { id: 10, name: 'Rural Healthcare Access Fund', keywords: ['rural', 'healthcare', 'medical', 'access', 'underserved'], amount: '$200K – $800K', match: 84, deadline: '65 days', category: 'Healthcare' },
  { id: 11, name: 'STEM Education Grant', keywords: ['education', 'stem', 'science', 'math', 'school', 'students'], amount: '$50K – $250K', match: 93, deadline: '42 days', category: 'Education' },
  { id: 12, name: 'Youth Development Program', keywords: ['youth', 'education', 'children', 'development', 'after-school'], amount: '$100K – $400K', match: 88, deadline: '38 days', category: 'Education' },
  { id: 13, name: 'Workforce Training Initiative', keywords: ['workforce', 'training', 'jobs', 'employment', 'skills'], amount: '$150K – $500K', match: 85, deadline: '70 days', category: 'Education' },
  { id: 14, name: 'Nonprofit Capacity Building', keywords: ['nonprofit', 'capacity', 'organization', 'ngo', 'charity'], amount: '$25K – $150K', match: 91, deadline: '28 days', category: 'Nonprofit' },
  { id: 15, name: 'Community Development Block Grant', keywords: ['community', 'development', 'housing', 'urban', 'neighborhood'], amount: '$100K – $1M', match: 87, deadline: '52 days', category: 'Community' },
  { id: 16, name: 'Social Enterprise Fund', keywords: ['social', 'enterprise', 'impact', 'business', 'startup'], amount: '$50K – $300K', match: 89, deadline: '45 days', category: 'Social Impact' },
  { id: 17, name: 'Arts & Culture Grant', keywords: ['arts', 'culture', 'museum', 'gallery', 'creative'], amount: '$10K – $100K', match: 86, deadline: '33 days', category: 'Arts' },
  { id: 18, name: 'Sustainable Agriculture Grant', keywords: ['agriculture', 'farming', 'sustainable', 'food', 'organic'], amount: '$75K – $400K', match: 88, deadline: '55 days', category: 'Agriculture' },
  { id: 19, name: 'Food Security Initiative', keywords: ['food', 'hunger', 'security', 'nutrition', 'pantry'], amount: '$50K – $250K', match: 90, deadline: '40 days', category: 'Food' },
  { id: 20, name: 'Small Business Innovation Grant', keywords: ['small business', 'startup', 'entrepreneur', 'sba', 'innovation'], amount: '$50K – $500K', match: 92, deadline: '60 days', category: 'Business' },
  { id: 21, name: 'Minority Business Development', keywords: ['minority', 'business', 'diverse', 'entrepreneur', 'mbe'], amount: '$25K – $200K', match: 87, deadline: '35 days', category: 'Business' },
  { id: 22, name: 'Women-Owned Business Fund', keywords: ['women', 'business', 'entrepreneur', 'wbe', 'female'], amount: '$50K – $300K', match: 89, deadline: '45 days', category: 'Business' },
]

function searchGrants(query: string) {
  if (!query.trim()) return []
  const terms = query.toLowerCase().split(/\s+/)
  const scored = grantDatabase.map(grant => {
    let score = 0
    const all = [...grant.keywords, grant.name.toLowerCase(), grant.category.toLowerCase()]
    terms.forEach(term => {
      all.forEach(kw => {
        if (kw.includes(term) || term.includes(kw)) score += kw === term ? 3 : 1
      })
    })
    return { ...grant, score }
  })
  return scored.filter(g => g.score > 0).sort((a, b) => b.score - a.score).slice(0, 4)
}

function getRandomGrants() {
  return [...grantDatabase].sort(() => Math.random() - 0.5).slice(0, 4)
}

/** Compact match score bar */
function MatchBar({ score }: { score: number }) {
  const color = score >= 90 ? 'bg-pulse-accent' : score >= 80 ? 'bg-emerald-400' : 'bg-amber-400'
  return (
    <div className="flex items-center gap-2.5 w-16 shrink-0">
      <div className="flex-1 h-1 rounded-full bg-white/[0.06] overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
        />
      </div>
      <span className="text-[11px] font-mono font-medium text-pulse-text-secondary tabular-nums">
        {score}
      </span>
    </div>
  )
}

export function HeroSearch() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<typeof grantDatabase>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [defaults, setDefaults] = useState(grantDatabase.slice(0, 4))
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  useEffect(() => { setDefaults(getRandomGrants()) }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) {
      setResults([])
      setHasSearched(false)
      setIsSearching(false)
      return
    }
    setIsSearching(true)
    debounceRef.current = setTimeout(() => {
      setResults(searchGrants(query))
      setIsSearching(false)
      setHasSearched(true)
    }, 250)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  const go = (name?: string) => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('grantSearchQuery', query || name || '')
    }
    router.push('/register')
  }

  const grants = hasSearched ? results : defaults

  return (
    <div className="max-w-2xl">
      {/* Card container */}
      <div className="rounded-xl border border-white/[0.06] bg-[#111113]/80 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.3)] overflow-hidden">
        {/* Search input area */}
        <form
          onSubmit={(e) => { e.preventDefault(); if (query.trim()) go() }}
          className="flex items-center border-b border-white/[0.05]"
        >
          <div className="flex items-center gap-3 flex-1 px-5 py-3.5">
            {isSearching ? (
              <Loader2 className="w-4 h-4 text-pulse-accent animate-spin shrink-0" />
            ) : (
              <Search className="w-4 h-4 text-pulse-text-tertiary shrink-0" />
            )}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder='Try "climate nonprofit" or "small business"'
              className="flex-1 bg-transparent text-pulse-text placeholder:text-pulse-text-tertiary/40 focus:outline-none text-[15px]"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3.5 bg-pulse-accent text-pulse-bg text-[13px] font-semibold tracking-wide uppercase hover:bg-pulse-accent/90 transition-colors duration-150"
          >
            Search
          </button>
        </form>

        {/* Results area */}
        <div className="px-5 py-4">
          <AnimatePresence mode="wait">
            {hasSearched && results.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-6 text-center"
              >
                <p className="text-body-sm text-pulse-text-tertiary mb-1">
                  No matches for &ldquo;{query}&rdquo; in preview
                </p>
                <button onClick={() => go()} className="text-body-sm text-pulse-accent hover:underline underline-offset-2">
                  Sign up to search the full database
                </button>
              </motion.div>
            ) : (
              <motion.div
                key={hasSearched ? 'search' : 'default'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Results header */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-pulse-text-tertiary">
                    {hasSearched ? `${results.length} matches` : 'Trending grants'}
                  </span>
                  <span className="text-[11px] font-mono text-pulse-text-tertiary hidden sm:block">
                    Match
                  </span>
                </div>

                {/* Grant rows */}
                <div className="space-y-0.5">
                  {grants.map((grant, i) => {
                    const catClass = categoryColors[grant.category] || 'text-pulse-accent bg-pulse-accent/10'
                    return (
                      <motion.button
                        key={grant.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05, duration: 0.25 }}
                        onClick={() => go(grant.name)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 -mx-3 rounded-lg hover:bg-white/[0.04] transition-colors duration-150 cursor-pointer text-left group"
                      >
                        {/* Grant details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[14px] font-medium text-pulse-text truncate group-hover:text-pulse-accent transition-colors duration-150">
                              {grant.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex px-1.5 py-0.5 text-[10px] font-medium rounded ${catClass}`}>
                              {grant.category}
                            </span>
                            <span className="text-[12px] text-pulse-text-secondary">{grant.amount}</span>
                            <span className="text-[12px] text-pulse-text-tertiary">&middot; {grant.deadline} left</span>
                          </div>
                        </div>

                        {/* Match indicator */}
                        <div className="hidden sm:block">
                          <MatchBar score={grant.match} />
                        </div>

                        <ArrowRight className="w-3.5 h-3.5 text-pulse-text-tertiary/30 group-hover:text-pulse-accent group-hover:translate-x-0.5 transition-all shrink-0" />
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-white/[0.04] flex items-center justify-between">
          <button
            onClick={() => go()}
            className="text-[13px] text-pulse-accent font-medium hover:underline underline-offset-2 inline-flex items-center gap-1.5"
          >
            See all 20,000+ grants
            <ArrowRight className="w-3 h-3" />
          </button>
          <span className="text-[11px] text-pulse-text-tertiary hidden sm:block">
            Free &middot; No account needed to preview
          </span>
        </div>
      </div>
    </div>
  )
}
