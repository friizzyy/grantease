'use client'

import { useState } from 'react'
import { 
  Database, 
  Play, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  FileText,
  Globe,
  Building2,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type SourceStatus = 'idle' | 'running' | 'success' | 'error'

interface IngestionSource {
  id: string
  name: string
  type: 'federal' | 'state' | 'foundation' | 'other'
  description: string
  lastRun: string | null
  lastStatus: SourceStatus
  grantsIngested: number
  nextScheduled: string | null
  enabled: boolean
}

// Mock data for ingestion sources
const mockSources: IngestionSource[] = [
  {
    id: 'grants-gov',
    name: 'Grants.gov',
    type: 'federal',
    description: 'Federal grant opportunities from Grants.gov API',
    lastRun: '2025-01-28T14:30:00Z',
    lastStatus: 'success',
    grantsIngested: 1847,
    nextScheduled: '2025-01-29T06:00:00Z',
    enabled: true,
  },
  {
    id: 'sam-gov',
    name: 'SAM.gov',
    type: 'federal',
    description: 'Federal assistance listings from SAM.gov',
    lastRun: '2025-01-28T14:35:00Z',
    lastStatus: 'success',
    grantsIngested: 423,
    nextScheduled: '2025-01-29T06:00:00Z',
    enabled: true,
  },
  {
    id: 'ca-grants',
    name: 'California Grants Portal',
    type: 'state',
    description: 'State of California grant opportunities',
    lastRun: '2025-01-28T15:00:00Z',
    lastStatus: 'success',
    grantsIngested: 156,
    nextScheduled: '2025-01-29T06:00:00Z',
    enabled: true,
  },
  {
    id: 'ny-grants',
    name: 'New York State Grants',
    type: 'state',
    description: 'State of New York grant opportunities',
    lastRun: '2025-01-27T06:00:00Z',
    lastStatus: 'error',
    grantsIngested: 0,
    nextScheduled: '2025-01-29T06:00:00Z',
    enabled: true,
  },
  {
    id: 'ford-foundation',
    name: 'Ford Foundation',
    type: 'foundation',
    description: 'Ford Foundation grants and fellowships',
    lastRun: '2025-01-28T12:00:00Z',
    lastStatus: 'success',
    grantsIngested: 12,
    nextScheduled: '2025-01-29T12:00:00Z',
    enabled: true,
  },
  {
    id: 'macarthur',
    name: 'MacArthur Foundation',
    type: 'foundation',
    description: 'MacArthur Foundation funding opportunities',
    lastRun: null,
    lastStatus: 'idle',
    grantsIngested: 0,
    nextScheduled: null,
    enabled: false,
  },
]

const statusIcons = {
  idle: Clock,
  running: RefreshCw,
  success: CheckCircle,
  error: XCircle,
}

const statusColors = {
  idle: 'text-pulse-muted',
  running: 'text-pulse-accent animate-spin',
  success: 'text-green-400',
  error: 'text-red-400',
}

const typeIcons = {
  federal: Globe,
  state: Building2,
  foundation: FileText,
  other: Database,
}

export default function IngestionPage() {
  const [sources, setSources] = useState<IngestionSource[]>(mockSources)
  const [runningAll, setRunningAll] = useState(false)

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never'
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const runSource = async (sourceId: string) => {
    setSources(prev => prev.map(s => 
      s.id === sourceId ? { ...s, lastStatus: 'running' as const } : s
    ))
    
    // Simulate ingestion
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setSources(prev => prev.map(s => 
      s.id === sourceId 
        ? { 
            ...s, 
            lastStatus: 'success' as const,
            lastRun: new Date().toISOString(),
            grantsIngested: s.grantsIngested + Math.floor(Math.random() * 50)
          } 
        : s
    ))
  }

  const runAllSources = async () => {
    setRunningAll(true)
    const enabledSources = sources.filter(s => s.enabled)
    
    for (const source of enabledSources) {
      await runSource(source.id)
    }
    
    setRunningAll(false)
  }

  const toggleSource = (sourceId: string) => {
    setSources(prev => prev.map(s => 
      s.id === sourceId ? { ...s, enabled: !s.enabled } : s
    ))
  }

  const totalGrants = sources.reduce((sum, s) => sum + s.grantsIngested, 0)
  const activeSources = sources.filter(s => s.enabled).length
  const failedSources = sources.filter(s => s.lastStatus === 'error').length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-display-sm text-pulse-text">Ingestion Pipeline</h1>
          <p className="text-body text-pulse-muted mt-1">
            Manage grant data sources and run ingestion jobs
          </p>
        </div>
        <Button 
          onClick={runAllSources} 
          disabled={runningAll}
          className="gap-2"
        >
          {runningAll ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Play className="h-4 w-4" />
              Run All Sources
            </>
          )}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-pulse-accent/10 flex items-center justify-center">
                <Database className="h-5 w-5 text-pulse-accent" />
              </div>
              <div>
                <p className="text-sm text-pulse-muted">Total Grants</p>
                <p className="text-2xl font-medium text-pulse-text">{totalGrants.toLocaleString()}</p>
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
                <p className="text-sm text-pulse-muted">Active Sources</p>
                <p className="text-2xl font-medium text-pulse-text">{activeSources}</p>
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
                <p className="text-sm text-pulse-muted">Failed Sources</p>
                <p className="text-2xl font-medium text-pulse-text">{failedSources}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-pulse-muted">Next Scheduled</p>
                <p className="text-lg font-medium text-pulse-text">6:00 AM</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sources List */}
      <Card>
        <CardHeader>
          <CardTitle>Data Sources</CardTitle>
          <CardDescription>
            Configure and manage grant data ingestion sources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sources.map((source) => {
              const StatusIcon = statusIcons[source.lastStatus]
              const TypeIcon = typeIcons[source.type]
              
              return (
                <div
                  key={source.id}
                  className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                    source.enabled 
                      ? 'bg-pulse-surface/50 border-pulse-border' 
                      : 'bg-pulse-bg/50 border-pulse-border/50 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-pulse-accent/10 flex items-center justify-center">
                      <TypeIcon className="h-5 w-5 text-pulse-accent" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-pulse-text">{source.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {source.type}
                        </Badge>
                        {source.lastStatus === 'error' && (
                          <Badge variant="error" className="text-xs">
                            Failed
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-pulse-muted">{source.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-pulse-muted">Last Run</p>
                      <p className="text-sm text-pulse-text">{formatDate(source.lastRun)}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-pulse-muted">Grants</p>
                      <p className="text-sm text-pulse-text">{source.grantsIngested.toLocaleString()}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusIcon className={`h-5 w-5 ${statusColors[source.lastStatus]}`} />
                    </div>

                    <button
                      onClick={() => toggleSource(source.id)}
                      role="switch"
                      aria-checked={source.enabled}
                      aria-label={`${source.enabled ? 'Disable' : 'Enable'} ${source.name} data source`}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        source.enabled ? 'bg-pulse-accent' : 'bg-pulse-border'
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          source.enabled ? 'translate-x-5' : ''
                        }`}
                        aria-hidden="true"
                      />
                    </button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => runSource(source.id)}
                      disabled={!source.enabled || source.lastStatus === 'running'}
                      className="gap-1"
                    >
                      {source.lastStatus === 'running' ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Play className="h-3 w-3" />
                      )}
                      Run
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Error Details */}
      {failedSources > 0 && (
        <Card className="border-red-500/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <CardTitle className="text-red-400">Recent Errors</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sources
                .filter(s => s.lastStatus === 'error')
                .map((source) => (
                  <div
                    key={source.id}
                    className="p-3 rounded-lg bg-red-500/5 border border-red-500/20"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-pulse-text">{source.name}</span>
                      <span className="text-sm text-pulse-muted">{formatDate(source.lastRun)}</span>
                    </div>
                    <p className="text-sm text-red-400 font-mono">
                      Error: Connection timeout - Unable to reach API endpoint after 30s
                    </p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
