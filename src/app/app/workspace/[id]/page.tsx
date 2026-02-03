'use client'

/**
 * WORKSPACE DETAIL PAGE - PREMIUM UPGRADE
 * ----------------------------------------
 * Premium application workspace with:
 * - AI writing assistant integration
 * - Visual progress tracking
 * - Interactive checklist with drag & drop feel
 * - Document management
 * - GlassCard design throughout
 * - Real API integration
 */

import { useState, useEffect, useCallback, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  Circle,
  FileText,
  Plus,
  Save,
  Clock,
  Trash2,
  Sparkles,
  Building2,
  DollarSign,
  AlertCircle,
  Zap,
  Upload,
  Download,
  Target,
  RefreshCw,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { GlassCard } from '@/components/ui/glass-card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatDate } from '@/lib/utils'
import { useToastActions } from '@/components/ui/toast-provider'

// Types
interface ChecklistItem {
  id: string
  text: string
  completed: boolean
  category?: string
}

interface WorkspaceDocument {
  id: string
  name: string
  type: string
  size: number | null
  url: string | null
  createdAt: string
}

interface Grant {
  id: string
  title: string
  sponsor: string
  deadlineDate: string | null
  deadlineType: string | null
  amountMin: number | null
  amountMax: number | null
  url: string | null
  categories: string[]
  eligibility: string[]
  requirements: string[]
}

interface Workspace {
  id: string
  name: string
  status: string
  notes: string | null
  checklist: ChecklistItem[]
  createdAt: string
  updatedAt: string
  grant: Grant
  documents: WorkspaceDocument[]
}

const statusOptions = [
  { value: 'not_started', label: 'Not Started', color: 'text-pulse-text-tertiary' },
  { value: 'in_progress', label: 'In Progress', color: 'text-pulse-warning' },
  { value: 'submitted', label: 'Submitted', color: 'text-blue-400' },
  { value: 'awarded', label: 'Awarded', color: 'text-pulse-accent' },
  { value: 'rejected', label: 'Not Selected', color: 'text-pulse-error' },
]

// Format amount
function formatAmount(min: number | null, max: number | null): string {
  const amount = max || min
  if (!amount) return 'Varies'
  if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`
  if (amount >= 1000) return `$${Math.round(amount / 1000)}K`
  return `$${amount.toLocaleString()}`
}

// Progress Ring Component
function ProgressRing({ progress, size = 80, strokeWidth = 6 }: {
  progress: number; size?: number; strokeWidth?: number
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  const getColor = () => {
    if (progress >= 75) return '#40ffaa'
    if (progress >= 50) return '#40a0ff'
    if (progress >= 25) return '#ffb340'
    return '#ff4040'
  }

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold text-pulse-text">{progress}%</span>
        <span className="text-xs text-pulse-text-tertiary">Complete</span>
      </div>
    </div>
  )
}

// AI Assistant Card
function AIAssistantCard({
  onOpenChat,
  onGenerateOutline,
  isLoading
}: {
  onOpenChat: () => void
  onGenerateOutline: () => void
  isLoading: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <GlassCard variant="accent" className="p-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pulse-accent to-pulse-accent/50 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-pulse-bg" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-pulse-text mb-1">AI Writing Assistant</h3>
            <p className="text-sm text-pulse-text-secondary mb-3">
              Need help with your technical proposal? I can help you draft sections, improve clarity, and ensure compliance with requirements.
            </p>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={onOpenChat} disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Zap className="w-4 h-4 mr-1" />}
                Chat with AI
              </Button>
              <Button variant="outline" size="sm" onClick={onGenerateOutline} disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <FileText className="w-4 h-4 mr-1" />}
                Generate Outline
              </Button>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}

// Checklist Item Component
function ChecklistItemRow({
  item,
  onToggle,
  onRemove,
  index
}: {
  item: ChecklistItem
  onToggle: () => void
  onRemove: () => void
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`flex items-center gap-3 p-4 rounded-xl border transition-all group ${
        item.completed
          ? 'bg-pulse-surface/30 border-pulse-border/50'
          : 'bg-pulse-surface/50 border-pulse-border hover:border-pulse-accent/30'
      }`}
    >
      <button
        onClick={onToggle}
        role="checkbox"
        aria-checked={item.completed}
        aria-label={`Mark "${item.text}" as ${item.completed ? 'incomplete' : 'complete'}`}
        className="shrink-0 transition-transform hover:scale-110"
      >
        {item.completed ? (
          <CheckCircle2 className="w-6 h-6 text-pulse-accent" aria-hidden="true" />
        ) : (
          <Circle className="w-6 h-6 text-pulse-text-tertiary hover:text-pulse-accent transition-colors" aria-hidden="true" />
        )}
      </button>
      <div className="flex-1 min-w-0">
        <span className={`text-sm ${item.completed ? 'text-pulse-text-tertiary line-through' : 'text-pulse-text'}`}>
          {item.text}
        </span>
        {item.category && (
          <span className="text-xs text-pulse-text-tertiary ml-2">• {item.category}</span>
        )}
      </div>
      <button
        onClick={onRemove}
        aria-label={`Remove "${item.text}" from checklist`}
        className="opacity-0 group-hover:opacity-100 p-2 text-pulse-text-tertiary hover:text-pulse-error transition-all rounded-lg hover:bg-pulse-error/10"
      >
        <Trash2 className="w-4 h-4" aria-hidden="true" />
      </button>
    </motion.div>
  )
}

// Document Card Component
function DocumentCard({ doc, index }: { doc: WorkspaceDocument; index: number }) {
  const getTypeColor = (type: string) => {
    switch (type.toUpperCase()) {
      case 'PDF': return 'bg-red-500/20 text-red-400'
      case 'DOCX': case 'DOC': return 'bg-blue-500/20 text-blue-400'
      case 'XLSX': case 'XLS': return 'bg-green-500/20 text-green-400'
      default: return 'bg-pulse-surface text-pulse-text-tertiary'
    }
  }

  const formatSize = (bytes: number | null): string => {
    if (!bytes) return 'Unknown size'
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`
    if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${bytes} B`
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.05 }}
      className="flex items-center gap-3 p-3 rounded-xl bg-pulse-surface/50 border border-pulse-border hover:border-pulse-accent/30 transition-all group cursor-pointer"
    >
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(doc.type)}`}>
        <FileText className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-pulse-text truncate">{doc.name}</p>
        <p className="text-xs text-pulse-text-tertiary">
          {formatSize(doc.size)} • {formatDate(new Date(doc.createdAt))}
        </p>
      </div>
      <button className="opacity-0 group-hover:opacity-100 p-2 text-pulse-text-tertiary hover:text-pulse-accent transition-all">
        <Download className="w-4 h-4" />
      </button>
    </motion.div>
  )
}

// Loading skeleton
function WorkspaceSkeleton() {
  return (
    <div className="p-8 animate-pulse">
      <div className="h-5 bg-pulse-surface rounded w-40 mb-6" />
      <div className="h-40 bg-pulse-surface rounded-2xl mb-6" />
      <div className="h-24 bg-pulse-surface rounded-2xl mb-6" />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-80 bg-pulse-surface rounded-2xl" />
          <div className="h-48 bg-pulse-surface rounded-2xl" />
        </div>
        <div className="space-y-6">
          <div className="h-64 bg-pulse-surface rounded-2xl" />
          <div className="h-48 bg-pulse-surface rounded-2xl" />
        </div>
      </div>
    </div>
  )
}

// Error state
function WorkspaceError({ onRetry, error }: { onRetry: () => void; error: string }) {
  return (
    <div className="p-8 flex items-center justify-center min-h-[60vh]">
      <GlassCard className="p-8 text-center max-w-md">
        <div className="w-12 h-12 rounded-full bg-pulse-error/20 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-6 h-6 text-pulse-error" />
        </div>
        <h2 className="text-lg font-semibold text-pulse-text mb-2">
          Failed to load workspace
        </h2>
        <p className="text-pulse-text-secondary text-sm mb-4">
          {error || 'We couldn\'t load this workspace. Please try again.'}
        </p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" asChild>
            <Link href="/app/workspace">Back to Workspaces</Link>
          </Button>
          <Button onClick={onRetry}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </GlassCard>
    </div>
  )
}

export default function WorkspaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const toast = useToastActions()

  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [newItem, setNewItem] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showAIChat, setShowAIChat] = useState(false)
  const [aiChatMessages, setAiChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([])
  const [aiChatInput, setAiChatInput] = useState('')
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [isAiSuggestionsLoading, setIsAiSuggestionsLoading] = useState(false)

  const fetchWorkspace = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/user/workspaces/${id}`)
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Workspace not found')
        }
        throw new Error('Failed to fetch workspace')
      }
      const data = await response.json()
      setWorkspace(data.workspace)
      setNotes(data.workspace.notes || '')
    } catch (err) {
      console.error('Workspace fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load workspace')
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchWorkspace()
  }, [fetchWorkspace])

  if (isLoading) {
    return <WorkspaceSkeleton />
  }

  if (error || !workspace) {
    return <WorkspaceError onRetry={fetchWorkspace} error={error || 'Workspace not found'} />
  }

  const completedCount = workspace.checklist.filter(item => item.completed).length
  const progress = workspace.checklist.length > 0
    ? Math.round((completedCount / workspace.checklist.length) * 100)
    : 0

  const daysUntilDeadline = workspace.grant.deadlineDate
    ? Math.ceil((new Date(workspace.grant.deadlineDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null
  const isUrgent = daysUntilDeadline !== null && daysUntilDeadline <= 14 && daysUntilDeadline > 0

  const toggleChecklistItem = (itemId: string) => {
    setWorkspace({
      ...workspace,
      checklist: workspace.checklist.map(item =>
        item.id === itemId ? { ...item, completed: !item.completed } : item
      ),
    })
    setHasUnsavedChanges(true)
  }

  const addChecklistItem = () => {
    if (!newItem.trim()) return
    setWorkspace({
      ...workspace,
      checklist: [
        ...workspace.checklist,
        { id: `item-${Date.now()}`, text: newItem.trim(), completed: false, category: 'Custom' },
      ],
    })
    setNewItem('')
    setHasUnsavedChanges(true)
  }

  const removeChecklistItem = (itemId: string) => {
    setWorkspace({
      ...workspace,
      checklist: workspace.checklist.filter(item => item.id !== itemId),
    })
    setHasUnsavedChanges(true)
  }

  const updateStatus = (newStatus: string) => {
    setWorkspace({ ...workspace, status: newStatus })
    setHasUnsavedChanges(true)
  }

  const updateNotes = (newNotes: string) => {
    setNotes(newNotes)
    setHasUnsavedChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/user/workspaces/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: workspace.status,
          checklist: workspace.checklist,
          notes: notes,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save changes')
      }

      const data = await response.json()
      setWorkspace(data.workspace)
      setHasUnsavedChanges(false)
      toast.success('Changes saved', 'Your workspace has been updated.')
    } catch (err) {
      console.error('Save error:', err)
      toast.error('Failed to save', err instanceof Error ? err.message : 'Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  // AI Chat functionality
  const sendAiMessage = async () => {
    if (!aiChatInput.trim() || isAiLoading || !workspace) return

    const userMessage = aiChatInput.trim()
    setAiChatInput('')
    setAiChatMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsAiLoading(true)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          context: {
            grantTitle: workspace.grant.title,
            grantSponsor: workspace.grant.sponsor,
            grantCategories: workspace.grant.categories,
            workspaceName: workspace.name,
            currentNotes: notes,
            checklistItems: workspace.checklist.map(c => c.text),
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get AI response')
      }

      const data = await response.json()
      setAiChatMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch (err) {
      console.error('AI chat error:', err)
      toast.error('AI Error', err instanceof Error ? err.message : 'Failed to get AI response')
      setAiChatMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }])
    } finally {
      setIsAiLoading(false)
    }
  }

  // AI Writing Assistant - get suggestions for notes
  const getAiSuggestions = async () => {
    if (isAiSuggestionsLoading || !workspace) return
    setIsAiSuggestionsLoading(true)

    try {
      const response = await fetch('/api/ai/writing-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'improve',
          content: notes || 'No notes yet - help me get started with strategy for this grant application.',
          context: {
            grantTitle: workspace.grant.title,
            sponsor: workspace.grant.sponsor,
            categories: workspace.grant.categories,
            deadline: workspace.grant.deadlineDate,
            amount: workspace.grant.amountMax || workspace.grant.amountMin,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get suggestions')
      }

      const data = await response.json()
      if (data.result) {
        // Append AI suggestions to notes
        const newNotes = notes ? `${notes}\n\nAI SUGGESTIONS:\n${data.result}` : data.result
        setNotes(newNotes)
        setHasUnsavedChanges(true)
        toast.success('AI Suggestions Added', 'Review the suggestions in your notes.')
      }
    } catch (err) {
      console.error('AI suggestions error:', err)
      toast.error('AI Error', err instanceof Error ? err.message : 'Failed to get suggestions')
    } finally {
      setIsAiSuggestionsLoading(false)
    }
  }

  // Generate proposal outline
  const generateProposalOutline = async () => {
    if (isAiLoading || !workspace) return
    setIsAiLoading(true)

    try {
      const response = await fetch('/api/ai/writing-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          prompt: `Create a detailed proposal outline for a grant application to ${workspace.grant.sponsor} for "${workspace.grant.title}". Include sections for: Executive Summary, Problem Statement, Goals & Objectives, Methodology, Timeline, Budget Justification, and Expected Outcomes.`,
          context: {
            grantTitle: workspace.grant.title,
            sponsor: workspace.grant.sponsor,
            categories: workspace.grant.categories,
            deadline: workspace.grant.deadlineDate,
            amount: workspace.grant.amountMax || workspace.grant.amountMin,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate outline')
      }

      const data = await response.json()
      if (data.result) {
        const newNotes = notes ? `${notes}\n\nPROPOSAL OUTLINE:\n${data.result}` : `PROPOSAL OUTLINE:\n${data.result}`
        setNotes(newNotes)
        setHasUnsavedChanges(true)
        toast.success('Outline Generated', 'A proposal outline has been added to your notes.')
      }
    } catch (err) {
      console.error('Generate outline error:', err)
      toast.error('AI Error', err instanceof Error ? err.message : 'Failed to generate outline')
    } finally {
      setIsAiLoading(false)
    }
  }

  return (
    <div className="p-8">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        <Link
          href="/app/workspace"
          className="inline-flex items-center gap-2 text-sm text-pulse-text-secondary hover:text-pulse-accent transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Workspaces
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
          <div className="flex items-start gap-6">
            {/* Progress Ring */}
            <ProgressRing progress={progress} />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h1 className="font-serif text-2xl text-pulse-text mb-1">
                    {workspace.name}
                  </h1>
                  <Link
                    href={`/app/grants/${workspace.grant.id}`}
                    className="text-sm text-pulse-text-secondary hover:text-pulse-accent transition-colors"
                  >
                    {workspace.grant.title}
                  </Link>
                </div>
                <Button onClick={handleSave} disabled={isSaving || !hasUnsavedChanges}>
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>

              {/* Meta Row */}
              <div className="flex flex-wrap items-center gap-4 mt-4">
                <Select
                  value={workspace.status}
                  onValueChange={updateStatus}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2 text-sm text-pulse-text-tertiary">
                  <Building2 className="w-4 h-4" />
                  {workspace.grant.sponsor}
                </div>

                <div className="flex items-center gap-2 text-sm text-pulse-accent font-medium">
                  <DollarSign className="w-4 h-4" />
                  {formatAmount(workspace.grant.amountMin, workspace.grant.amountMax)}
                </div>

                {daysUntilDeadline !== null && (
                  <div className={`flex items-center gap-2 text-sm ${
                    isUrgent ? 'text-pulse-error' : 'text-pulse-text-tertiary'
                  }`}>
                    <Clock className="w-4 h-4" />
                    {daysUntilDeadline > 0 ? `${daysUntilDeadline} days until deadline` : 'Deadline passed'}
                    {isUrgent && <AlertCircle className="w-4 h-4" />}
                  </div>
                )}

                <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-pulse-accent/10 border border-pulse-accent/30">
                  <Target className="w-4 h-4 text-pulse-accent" />
                  <span className="text-sm font-medium text-pulse-accent">{progress}% complete</span>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* AI Assistant */}
      <div className="mb-6">
        <AIAssistantCard
          onOpenChat={() => setShowAIChat(true)}
          onGenerateOutline={generateProposalOutline}
          isLoading={isAiLoading}
        />
      </div>

      {/* AI Chat Panel (Slide-in) */}
      {showAIChat && (
        <motion.div
          initial={{ opacity: 0, x: 400 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 400 }}
          className="fixed right-0 top-0 h-full w-96 bg-pulse-bg border-l border-pulse-border shadow-2xl z-50 flex flex-col"
        >
          {/* Chat Header */}
          <div className="p-4 border-b border-pulse-border flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pulse-accent to-pulse-accent/50 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-pulse-bg" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-pulse-text">AI Assistant</h3>
                <p className="text-xs text-pulse-text-tertiary">Grant application help</p>
              </div>
            </div>
            <button
              onClick={() => setShowAIChat(false)}
              className="p-2 rounded-lg hover:bg-pulse-surface text-pulse-text-tertiary hover:text-pulse-text transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {aiChatMessages.length === 0 && (
              <div className="text-center py-8">
                <Sparkles className="w-12 h-12 text-pulse-accent mx-auto mb-3 opacity-50" />
                <p className="text-sm text-pulse-text-secondary mb-2">How can I help with your grant application?</p>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setAiChatInput('What should I include in my executive summary?')
                      sendAiMessage()
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg bg-pulse-surface/50 text-sm text-pulse-text-secondary hover:text-pulse-text hover:bg-pulse-surface transition-colors"
                  >
                    What should I include in my executive summary?
                  </button>
                  <button
                    onClick={() => {
                      setAiChatInput('Help me write a compelling problem statement')
                      sendAiMessage()
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg bg-pulse-surface/50 text-sm text-pulse-text-secondary hover:text-pulse-text hover:bg-pulse-surface transition-colors"
                  >
                    Help me write a compelling problem statement
                  </button>
                  <button
                    onClick={() => {
                      setAiChatInput('What are common mistakes to avoid?')
                      sendAiMessage()
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg bg-pulse-surface/50 text-sm text-pulse-text-secondary hover:text-pulse-text hover:bg-pulse-surface transition-colors"
                  >
                    What are common mistakes to avoid?
                  </button>
                </div>
              </div>
            )}
            {aiChatMessages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                    msg.role === 'user'
                      ? 'bg-pulse-accent text-pulse-bg'
                      : 'bg-pulse-surface text-pulse-text'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}
            {isAiLoading && (
              <div className="flex justify-start">
                <div className="bg-pulse-surface rounded-2xl px-4 py-3">
                  <Loader2 className="w-5 h-5 animate-spin text-pulse-accent" />
                </div>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-pulse-border">
            <div className="flex gap-2">
              <Input
                value={aiChatInput}
                onChange={(e) => setAiChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendAiMessage()}
                placeholder="Ask about your grant application..."
                className="flex-1"
                disabled={isAiLoading}
              />
              <Button onClick={sendAiMessage} disabled={isAiLoading || !aiChatInput.trim()}>
                {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Checklist & Notes */}
        <div className="lg:col-span-2 space-y-6">
          {/* Checklist */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-pulse-text">Application Checklist</h2>
                  <p className="text-sm text-pulse-text-tertiary">
                    {completedCount} of {workspace.checklist.length} tasks complete
                  </p>
                </div>
                <Badge variant={progress === 100 ? 'success' : progress >= 50 ? 'warning' : 'default'}>
                  {progress}% done
                </Badge>
              </div>

              <div className="space-y-2 mb-6">
                {workspace.checklist.map((item, index) => (
                  <ChecklistItemRow
                    key={item.id}
                    item={item}
                    index={index}
                    onToggle={() => toggleChecklistItem(item.id)}
                    onRemove={() => removeChecklistItem(item.id)}
                  />
                ))}
                {workspace.checklist.length === 0 && (
                  <div className="text-center py-8 text-pulse-text-tertiary">
                    <p>No checklist items yet. Add your first task below.</p>
                  </div>
                )}
              </div>

              {/* Add Item */}
              <div className="flex gap-3">
                <Input
                  placeholder="Add a new task..."
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addChecklistItem()}
                  className="flex-1"
                />
                <Button variant="outline" onClick={addChecklistItem}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </div>
            </GlassCard>
          </motion.div>

          {/* Notes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-pulse-text">Notes & Strategy</h2>
                <Button variant="outline" size="sm" onClick={getAiSuggestions} disabled={isAiSuggestionsLoading}>
                  {isAiSuggestionsLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  {isAiSuggestionsLoading ? 'Getting Suggestions...' : 'AI Suggestions'}
                </Button>
              </div>
              <textarea
                value={notes}
                onChange={(e) => updateNotes(e.target.value)}
                placeholder="Add notes about your strategy, key points to highlight, or reminders..."
                rows={8}
                className="w-full rounded-xl bg-pulse-bg border border-pulse-border px-4 py-3 text-sm text-pulse-text placeholder:text-pulse-text-tertiary transition-all focus:outline-none focus:border-pulse-accent/40 focus:ring-2 focus:ring-pulse-accent/10 resize-none"
              />
            </GlassCard>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Grant Info Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard className="p-6">
              <h2 className="text-lg font-semibold text-pulse-text mb-4">Grant Details</h2>

              <div className="space-y-4">
                <div>
                  <p className="text-xs font-medium text-pulse-text-tertiary uppercase tracking-wider mb-1">Sponsor</p>
                  <p className="text-sm text-pulse-text">{workspace.grant.sponsor}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-pulse-text-tertiary uppercase tracking-wider mb-1">Award Amount</p>
                  <p className="text-sm text-pulse-accent font-semibold">
                    {formatAmount(workspace.grant.amountMin, workspace.grant.amountMax)}
                  </p>
                </div>
                {workspace.grant.deadlineDate && (
                  <div>
                    <p className="text-xs font-medium text-pulse-text-tertiary uppercase tracking-wider mb-1">Deadline</p>
                    <p className={`text-sm ${isUrgent ? 'text-pulse-error font-medium' : 'text-pulse-text'}`}>
                      {formatDate(new Date(workspace.grant.deadlineDate))}
                      {isUrgent && ' (Urgent!)'}
                    </p>
                  </div>
                )}
                {workspace.grant.categories.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-pulse-text-tertiary uppercase tracking-wider mb-2">Categories</p>
                    <div className="flex flex-wrap gap-1.5">
                      {workspace.grant.categories.map(cat => (
                        <span key={cat} className="px-2 py-0.5 rounded-full bg-pulse-surface text-xs text-pulse-text-tertiary">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-6 pt-4 border-t border-pulse-border">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href={`/app/grants/${workspace.grant.id}`}>
                    View Grant
                  </Link>
                </Button>
                {workspace.grant.url && (
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <a href={workspace.grant.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Source
                    </a>
                  </Button>
                )}
              </div>
            </GlassCard>
          </motion.div>

          {/* Documents */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-pulse-text">Documents</h2>
                <Button variant="ghost" size="sm">
                  <Upload className="w-4 h-4 mr-1" />
                  Upload
                </Button>
              </div>

              {workspace.documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-pulse-text-tertiary mx-auto mb-3" />
                  <p className="text-sm text-pulse-text-tertiary">No documents yet</p>
                  <Button variant="outline" size="sm" className="mt-4">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Document
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {workspace.documents.map((doc, index) => (
                    <DocumentCard key={doc.id} doc={doc} index={index} />
                  ))}
                </div>
              )}
            </GlassCard>
          </motion.div>

          {/* Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <GlassCard className="p-6">
              <h2 className="text-sm font-medium text-pulse-text-secondary mb-4">Activity</h2>
              <div className="space-y-3 text-xs text-pulse-text-tertiary">
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  Created {formatDate(new Date(workspace.createdAt))}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  Last updated {formatDate(new Date(workspace.updatedAt))}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
