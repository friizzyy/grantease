'use client'

import { useState } from 'react'
import { 
  Activity, 
  Filter, 
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Clock,
  Download,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type LogLevel = 'info' | 'success' | 'warning' | 'error'

interface LogEntry {
  id: string
  timestamp: string
  level: LogLevel
  source: string
  message: string
  details?: string
  duration?: number
  grantsProcessed?: number
}

// Mock log data
const mockLogs: LogEntry[] = [
  {
    id: '1',
    timestamp: '2025-01-28T15:30:00Z',
    level: 'success',
    source: 'grants-gov',
    message: 'Ingestion completed successfully',
    duration: 45,
    grantsProcessed: 1847,
  },
  {
    id: '2',
    timestamp: '2025-01-28T15:29:55Z',
    level: 'info',
    source: 'grants-gov',
    message: 'Processing batch 10/10',
    grantsProcessed: 184,
  },
  {
    id: '3',
    timestamp: '2025-01-28T15:28:30Z',
    level: 'warning',
    source: 'grants-gov',
    message: '23 duplicate grants detected and skipped',
    details: 'Duplicates identified by fingerprint hash matching',
  },
  {
    id: '4',
    timestamp: '2025-01-28T15:00:15Z',
    level: 'error',
    source: 'ny-grants',
    message: 'Connection timeout',
    details: 'Error: ETIMEDOUT - Unable to reach https://grantsgateway.ny.gov/api after 30000ms',
  },
  {
    id: '5',
    timestamp: '2025-01-28T15:00:00Z',
    level: 'info',
    source: 'ny-grants',
    message: 'Starting ingestion run',
  },
  {
    id: '6',
    timestamp: '2025-01-28T14:35:45Z',
    level: 'success',
    source: 'sam-gov',
    message: 'Ingestion completed successfully',
    duration: 32,
    grantsProcessed: 423,
  },
  {
    id: '7',
    timestamp: '2025-01-28T14:35:00Z',
    level: 'info',
    source: 'sam-gov',
    message: 'Normalizing 423 assistance listings',
  },
  {
    id: '8',
    timestamp: '2025-01-28T14:34:00Z',
    level: 'info',
    source: 'sam-gov',
    message: 'Fetching assistance listings from SAM.gov API',
  },
  {
    id: '9',
    timestamp: '2025-01-28T12:05:00Z',
    level: 'success',
    source: 'ford-foundation',
    message: 'Ingestion completed successfully',
    duration: 8,
    grantsProcessed: 12,
  },
  {
    id: '10',
    timestamp: '2025-01-28T12:04:55Z',
    level: 'warning',
    source: 'ford-foundation',
    message: '3 grants missing deadline information',
    details: 'Grant IDs: FF-2025-001, FF-2025-004, FF-2025-007',
  },
  {
    id: '11',
    timestamp: '2025-01-28T06:00:00Z',
    level: 'info',
    source: 'scheduler',
    message: 'Daily ingestion job started',
  },
  {
    id: '12',
    timestamp: '2025-01-27T06:45:00Z',
    level: 'success',
    source: 'ca-grants',
    message: 'Ingestion completed successfully',
    duration: 28,
    grantsProcessed: 156,
  },
]

const levelIcons = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
}

const levelColors = {
  info: 'text-blue-400',
  success: 'text-green-400',
  warning: 'text-yellow-400',
  error: 'text-red-400',
}

const levelBadgeVariants = {
  info: 'outline' as const,
  success: 'success' as const,
  warning: 'warning' as const,
  error: 'error' as const,
}

export default function LogsPage() {
  const [logs] = useState<LogEntry[]>(mockLogs)
  const [filter, setFilter] = useState<'all' | LogLevel>('all')
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedLogs, setExpandedLogs] = useState<Set<string>>(new Set())

  const toggleExpanded = (logId: string) => {
    setExpandedLogs(prev => {
      const next = new Set(prev)
      if (next.has(logId)) {
        next.delete(logId)
      } else {
        next.add(logId)
      }
      return next
    })
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const uniqueSources = Array.from(new Set(logs.map(l => l.source)))

  const filteredLogs = logs.filter(log => {
    if (filter !== 'all' && log.level !== filter) return false
    if (sourceFilter !== 'all' && log.source !== sourceFilter) return false
    if (searchQuery && !log.message.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const logCounts = {
    total: logs.length,
    errors: logs.filter(l => l.level === 'error').length,
    warnings: logs.filter(l => l.level === 'warning').length,
    success: logs.filter(l => l.level === 'success').length,
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-display-sm text-pulse-text">Ingestion Logs</h1>
          <p className="text-body text-pulse-muted mt-1">
            Monitor and debug grant ingestion activity
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Logs
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-pulse-accent/10 flex items-center justify-center">
                <Activity className="h-5 w-5 text-pulse-accent" />
              </div>
              <div>
                <p className="text-sm text-pulse-muted">Total Entries</p>
                <p className="text-2xl font-medium text-pulse-text">{logCounts.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                <XCircle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-pulse-muted">Errors</p>
                <p className="text-2xl font-medium text-pulse-text">{logCounts.errors}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-pulse-muted">Warnings</p>
                <p className="text-2xl font-medium text-pulse-text">{logCounts.warnings}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-pulse-muted">Successful</p>
                <p className="text-2xl font-medium text-pulse-text">{logCounts.success}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pulse-muted" />
              <Input
                placeholder="Search logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filter} onValueChange={(v) => setFilter(v as 'all' | LogLevel)}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                {uniqueSources.map(source => (
                  <SelectItem key={source} value={source}>{source}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      <Card>
        <CardHeader>
          <CardTitle>Log Entries</CardTitle>
          <CardDescription>
            Showing {filteredLogs.length} of {logs.length} entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            {filteredLogs.map((log) => {
              const Icon = levelIcons[log.level]
              const isExpanded = expandedLogs.has(log.id)
              const hasDetails = log.details || log.duration || log.grantsProcessed
              
              return (
                <div key={log.id}>
                  <button
                    onClick={() => hasDetails && toggleExpanded(log.id)}
                    aria-expanded={hasDetails ? isExpanded : undefined}
                    aria-label={hasDetails ? `${isExpanded ? 'Collapse' : 'Expand'} log entry: ${log.message}` : undefined}
                    className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors ${
                      hasDetails ? 'hover:bg-pulse-surface/50 cursor-pointer' : 'cursor-default'
                    }`}
                  >
                    {hasDetails ? (
                      isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-pulse-muted mt-0.5 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-pulse-muted mt-0.5 flex-shrink-0" />
                      )
                    ) : (
                      <div className="w-4" />
                    )}
                    
                    <Icon className={`h-4 w-4 mt-0.5 flex-shrink-0 ${levelColors[log.level]}`} />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={levelBadgeVariants[log.level]} className="text-xs">
                          {log.source}
                        </Badge>
                        <span className="text-sm text-pulse-text">{log.message}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-pulse-muted flex-shrink-0">
                      <Clock className="h-3 w-3" />
                      {formatTime(log.timestamp)}
                    </div>
                  </button>
                  
                  {isExpanded && hasDetails && (
                    <div className="ml-11 mr-4 mb-2 p-3 rounded-lg bg-pulse-surface/30 border border-pulse-border">
                      {log.details && (
                        <p className="text-sm text-pulse-muted font-mono mb-2">{log.details}</p>
                      )}
                      <div className="flex gap-4 text-sm">
                        {log.duration && (
                          <span className="text-pulse-muted">
                            Duration: <span className="text-pulse-text">{log.duration}s</span>
                          </span>
                        )}
                        {log.grantsProcessed !== undefined && (
                          <span className="text-pulse-muted">
                            Grants: <span className="text-pulse-text">{log.grantsProcessed.toLocaleString()}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          
          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <Activity className="h-12 w-12 text-pulse-muted mx-auto mb-4" />
              <p className="text-pulse-muted">No log entries match your filters</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
