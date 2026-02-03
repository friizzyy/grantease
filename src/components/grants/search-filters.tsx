'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, X, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { GRANT_CATEGORIES, US_STATES, ELIGIBILITY_TYPES } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { springs } from '@/lib/motion/animations'

interface SearchFiltersProps {
  className?: string
}

export function SearchFilters({ className }: SearchFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [query, setQuery] = useState(searchParams?.get('q') || '')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    categories: searchParams?.getAll('categories') || [],
    locations: searchParams?.getAll('locations') || [],
    eligibility: searchParams?.getAll('eligibility') || [],
    status: searchParams?.get('status') || 'open',
    sort: searchParams?.get('sort') || 'relevance',
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    applyFilters()
  }

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (filters.status && filters.status !== 'all') params.set('status', filters.status)
    if (filters.sort) params.set('sort', filters.sort)
    filters.categories.forEach(c => params.append('categories', c))
    filters.locations.forEach(l => params.append('locations', l))
    filters.eligibility.forEach(e => params.append('eligibility', e))

    router.push(`/app/discover?${params.toString()}`)
  }

  const clearFilters = () => {
    setQuery('')
    setFilters({
      categories: [],
      locations: [],
      eligibility: [],
      status: 'open',
      sort: 'relevance',
    })
    router.push('/app/discover')
  }

  const toggleCategory = (cat: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat]
    }))
  }

  const toggleLocation = (loc: string) => {
    setFilters(prev => ({
      ...prev,
      locations: prev.locations.includes(loc)
        ? prev.locations.filter(l => l !== loc)
        : [...prev.locations, loc]
    }))
  }

  const activeFilterCount =
    filters.categories.length +
    filters.locations.length +
    filters.eligibility.length +
    (filters.status !== 'open' ? 1 : 0)

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <motion.div
          className="flex-1 relative"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Input
            type="text"
            placeholder="Search grants by keyword, sponsor, or category..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            icon={<Search className="w-4 h-4" />}
            className="h-12"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <Button type="submit" size="lg" className="px-8">
            Search
          </Button>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.3 }}
        >
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'gap-2',
              activeFilterCount > 0 && 'border-pulse-accent text-pulse-accent'
            )}
          >
            <motion.div
              animate={{ rotate: showFilters ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <Filter className="w-4 h-4" />
            </motion.div>
            Filters
            <AnimatePresence>
              {activeFilterCount > 0 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={springs.bouncy}
                >
                  <Badge variant="accent" className="ml-1">
                    {activeFilterCount}
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>
      </form>

      {/* Filter Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <motion.div
              className="bg-pulse-surface/80 border border-pulse-border rounded-xl p-6 space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {/* Quick Filters Row */}
              <motion.div
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-pulse-text-secondary mb-2">
                    Status
                  </label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open Only</SelectItem>
                      <SelectItem value="closed">Closed Only</SelectItem>
                      <SelectItem value="all">All Grants</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <label className="block text-sm font-medium text-pulse-text-secondary mb-2">
                    Sort By
                  </label>
                  <Select
                    value={filters.sort}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, sort: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevance</SelectItem>
                      <SelectItem value="deadline">Deadline (Soonest)</SelectItem>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="amount">Amount (Highest)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>

              {/* Categories */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <label className="block text-sm font-medium text-pulse-text-secondary mb-3">
                  Categories
                </label>
                <div className="flex flex-wrap gap-2">
                  {GRANT_CATEGORIES.map((cat, index) => (
                    <motion.button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className={cn(
                        'chip cursor-pointer transition-all duration-200',
                        filters.categories.includes(cat) && 'chip-accent'
                      )}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 + index * 0.02 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {cat}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Locations */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
              >
                <label className="block text-sm font-medium text-pulse-text-secondary mb-3">
                  Locations
                </label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  <motion.button
                    type="button"
                    onClick={() => toggleLocation('US')}
                    className={cn(
                      'chip cursor-pointer transition-all duration-200',
                      filters.locations.includes('US') && 'chip-accent'
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    All US (Federal)
                  </motion.button>
                  {US_STATES.slice(0, 20).map((state, index) => (
                    <motion.button
                      key={state.code}
                      type="button"
                      onClick={() => toggleLocation(state.code)}
                      className={cn(
                        'chip cursor-pointer transition-all duration-200',
                        filters.locations.includes(state.code) && 'chip-accent'
                      )}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.25 + index * 0.01 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {state.name}
                    </motion.button>
                  ))}
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div
                className="flex items-center justify-between pt-4 border-t border-pulse-border"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
                <Button onClick={applyFilters}>
                  Apply Filters
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Display */}
      <AnimatePresence>
        {activeFilterCount > 0 && !showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-wrap items-center gap-2"
          >
            <span className="text-sm text-pulse-text-tertiary">Active filters:</span>
            {filters.categories.map((cat, index) => (
              <motion.div
                key={cat}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: index * 0.05 }}
              >
                <Badge variant="accent" className="gap-1">
                  {cat}
                  <motion.button
                    onClick={() => toggleCategory(cat)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-3 h-3" />
                  </motion.button>
                </Badge>
              </motion.div>
            ))}
            {filters.locations.map((loc, index) => (
              <motion.div
                key={loc}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: (filters.categories.length + index) * 0.05 }}
              >
                <Badge variant="accent" className="gap-1">
                  {loc}
                  <motion.button
                    onClick={() => toggleLocation(loc)}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="w-3 h-3" />
                  </motion.button>
                </Badge>
              </motion.div>
            ))}
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear all
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
