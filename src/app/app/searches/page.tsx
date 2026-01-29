'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bell, BellOff, Search, Trash2, Play, MoreVertical, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { NoSavedSearches } from '@/components/grants/empty-state'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

// Mock saved searches
const savedSearches = [
  {
    id: '1',
    name: 'Small Business Technology',
    query: 'technology innovation',
    filters: {
      categories: ['Small Business', 'Technology'],
      status: 'open',
    },
    alertEnabled: true,
    alertFreq: 'daily',
    lastAlertAt: new Date('2024-01-28'),
    newMatches: 8,
    createdAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Nonprofit Community Development',
    query: 'community development housing',
    filters: {
      categories: ['Community Development', 'Housing'],
      eligibility: ['Nonprofit 501(c)(3)'],
      status: 'open',
    },
    alertEnabled: true,
    alertFreq: 'weekly',
    lastAlertAt: new Date('2024-01-21'),
    newMatches: 3,
    createdAt: new Date('2024-01-10'),
  },
  {
    id: '3',
    name: 'California Education Grants',
    query: 'education',
    filters: {
      categories: ['Education'],
      locations: ['CA'],
      status: 'open',
    },
    alertEnabled: false,
    alertFreq: 'daily',
    lastAlertAt: null,
    newMatches: 0,
    createdAt: new Date('2024-01-05'),
  },
]

export default function SavedSearchesPage() {
  const [searches, setSearches] = useState(savedSearches)
  const isEmpty = searches.length === 0

  const toggleAlert = (id: string) => {
    setSearches(searches.map(s => 
      s.id === id ? { ...s, alertEnabled: !s.alertEnabled } : s
    ))
  }

  const updateAlertFreq = (id: string, freq: string) => {
    setSearches(searches.map(s => 
      s.id === id ? { ...s, alertFreq: freq } : s
    ))
  }

  const deleteSearch = (id: string) => {
    setSearches(searches.filter(s => s.id !== id))
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="font-serif text-display text-pulse-text mb-2">Saved Searches</h1>
          <p className="text-body text-pulse-text-secondary">
            Run saved searches instantly or enable alerts for new matches.
          </p>
        </div>
        {!isEmpty && (
          <Button asChild>
            <Link href="/app/discover">
              <Search className="w-4 h-4" />
              New Search
            </Link>
          </Button>
        )}
      </div>

      {/* Content */}
      {isEmpty ? (
        <NoSavedSearches />
      ) : (
        <div className="space-y-4">
          {searches.map((search) => (
            <Card key={search.id} className="p-6" >
              <div className="flex items-start justify-between gap-4">
                {/* Search Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-heading-sm text-pulse-text">{search.name}</h3>
                    {search.newMatches > 0 && (
                      <Badge variant="accent">{search.newMatches} new</Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {search.query && (
                      <Badge variant="outline" className="text-xs">
                        <Search className="w-3 h-3 mr-1" />
                        {search.query}
                      </Badge>
                    )}
                    {search.filters.categories?.map((cat) => (
                      <Badge key={cat} variant="outline" className="text-xs">{cat}</Badge>
                    ))}
                    {search.filters.locations?.map((loc) => (
                      <Badge key={loc} variant="outline" className="text-xs">{loc}</Badge>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-pulse-text-tertiary">
                    <span>Created {search.createdAt.toLocaleDateString()}</span>
                    {search.lastAlertAt && (
                      <>
                        <span>•</span>
                        <span>Last alert {search.lastAlertAt.toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  {/* Alert Toggle & Frequency */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant={search.alertEnabled ? 'secondary' : 'ghost'}
                      size="sm"
                      onClick={() => toggleAlert(search.id)}
                      className={search.alertEnabled ? 'text-pulse-accent' : ''}
                    >
                      {search.alertEnabled ? (
                        <Bell className="w-4 h-4 fill-current" />
                      ) : (
                        <BellOff className="w-4 h-4" />
                      )}
                    </Button>
                    
                    {search.alertEnabled && (
                      <Select 
                        value={search.alertFreq} 
                        onValueChange={(v) => updateAlertFreq(search.id, v)}
                      >
                        <SelectTrigger className="w-24 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Run Search */}
                  <Button variant="secondary" size="sm" asChild>
                    <Link href={`/app/discover?q=${encodeURIComponent(search.query || '')}&categories=${search.filters.categories?.join(',') || ''}`}>
                      <Play className="w-4 h-4" />
                      Run
                    </Link>
                  </Button>

                  {/* Delete */}
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => deleteSearch(search.id)}
                    className="text-pulse-text-tertiary hover:text-pulse-error"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
