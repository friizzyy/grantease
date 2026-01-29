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
 */

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ExternalLink,
  Calendar,
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
  MoreHorizontal,
  Play,
  Target,
  Send,
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

// Mock workspace data with enhanced info
const mockWorkspace = {
  id: '1',
  name: 'SBIR Phase I Application',
  status: 'in_progress',
  notes: 'Need to finalize the technical proposal section. Waiting on budget approval from finance. Key focus: Highlight our prototype results and market validation data.',
  dueDate: new Date('2024-03-10'),
  matchScore: 94,
  grant: {
    id: '1',
    title: 'Small Business Innovation Research (SBIR) Phase I',
    sponsor: 'National Science Foundation',
    deadlineDate: new Date('2024-03-15'),
    url: 'https://www.nsf.gov/sbir',
    amount: '$275,000',
    categories: ['Small Business', 'Research', 'Technology'],
  },
  checklist: [
    { id: '1', text: 'Review eligibility requirements', completed: true, category: 'Prerequisites' },
    { id: '2', text: 'Prepare company commercialization plan', completed: true, category: 'Business' },
    { id: '3', text: 'Draft technical proposal', completed: false, category: 'Technical' },
    { id: '4', text: 'Complete budget justification', completed: false, category: 'Financial' },
    { id: '5', text: 'Gather biographical sketches', completed: true, category: 'Team' },
    { id: '6', text: 'Document current and pending support', completed: false, category: 'Support' },
    { id: '7', text: 'Internal review', completed: false, category: 'Review' },
    { id: '8', text: 'Submit application', completed: false, category: 'Submission' },
  ],
  documents: [
    { id: '1', name: 'Company Overview.pdf', type: 'PDF', size: '2.4 MB', addedAt: new Date('2024-01-20') },
    { id: '2', name: 'Technical Proposal Draft.docx', type: 'DOCX', size: '1.8 MB', addedAt: new Date('2024-01-25') },
    { id: '3', name: 'Budget Spreadsheet.xlsx', type: 'XLSX', size: '456 KB', addedAt: new Date('2024-01-26') },
  ],
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-28'),
}

const statusOptions = [
  { value: 'not_started', label: 'Not Started', color: 'text-pulse-text-tertiary' },
  { value: 'in_progress', label: 'In Progress', color: 'text-pulse-warning' },
  { value: 'submitted', label: 'Submitted', color: 'text-blue-400' },
  { value: 'awarded', label: 'Awarded', color: 'text-pulse-accent' },
  { value: 'rejected', label: 'Not Selected', color: 'text-pulse-error' },
]

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
function AIAssistantCard() {
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
              <Button size="sm">
                <Zap className="w-4 h-4 mr-1" />
                Get AI Help
              </Button>
              <Button variant="outline" size="sm">
                Review Draft
              </Button>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}

// Checklist Item Component
function ChecklistItem({
  item,
  onToggle,
  onRemove,
  index
}: {
  item: typeof mockWorkspace.checklist[0]
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
        <span className="text-xs text-pulse-text-tertiary ml-2">• {item.category}</span>
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
function DocumentCard({ doc, index }: { doc: typeof mockWorkspace.documents[0]; index: number }) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PDF': return 'bg-red-500/20 text-red-400'
      case 'DOCX': return 'bg-blue-500/20 text-blue-400'
      case 'XLSX': return 'bg-green-500/20 text-green-400'
      default: return 'bg-pulse-surface text-pulse-text-tertiary'
    }
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
        <p className="text-xs text-pulse-text-tertiary">{doc.size} • {formatDate(doc.addedAt)}</p>
      </div>
      <button className="opacity-0 group-hover:opacity-100 p-2 text-pulse-text-tertiary hover:text-pulse-accent transition-all">
        <Download className="w-4 h-4" />
      </button>
    </motion.div>
  )
}

export default function WorkspaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Note: In a real implementation, you would use React.use(params) to unwrap the promise
  // For now, this page uses mock data so the params aren't actively used
  const [workspace, setWorkspace] = useState(mockWorkspace)
  const [notes, setNotes] = useState(workspace.notes || '')
  const [newItem, setNewItem] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const completedCount = workspace.checklist.filter(item => item.completed).length
  const progress = Math.round((completedCount / workspace.checklist.length) * 100)

  const daysUntilDeadline = Math.ceil(
    (workspace.grant.deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )
  const isUrgent = daysUntilDeadline <= 14

  const toggleChecklistItem = (id: string) => {
    setWorkspace({
      ...workspace,
      checklist: workspace.checklist.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      ),
    })
  }

  const addChecklistItem = () => {
    if (!newItem.trim()) return
    setWorkspace({
      ...workspace,
      checklist: [
        ...workspace.checklist,
        { id: Date.now().toString(), text: newItem.trim(), completed: false, category: 'Custom' },
      ],
    })
    setNewItem('')
  }

  const removeChecklistItem = (id: string) => {
    setWorkspace({
      ...workspace,
      checklist: workspace.checklist.filter(item => item.id !== id),
    })
  }

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    setIsSaving(false)
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
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>Saving...</>
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
                  onValueChange={(value) => setWorkspace({ ...workspace, status: value })}
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
                  {workspace.grant.amount}
                </div>

                <div className={`flex items-center gap-2 text-sm ${
                  isUrgent ? 'text-pulse-error' : 'text-pulse-text-tertiary'
                }`}>
                  <Clock className="w-4 h-4" />
                  {daysUntilDeadline} days until deadline
                  {isUrgent && <AlertCircle className="w-4 h-4" />}
                </div>

                <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-pulse-accent/10 border border-pulse-accent/30">
                  <Target className="w-4 h-4 text-pulse-accent" />
                  <span className="text-sm font-medium text-pulse-accent">{workspace.matchScore}% match</span>
                </div>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {/* AI Assistant */}
      <div className="mb-6">
        <AIAssistantCard />
      </div>

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
                  <ChecklistItem
                    key={item.id}
                    item={item}
                    index={index}
                    onToggle={() => toggleChecklistItem(item.id)}
                    onRemove={() => removeChecklistItem(item.id)}
                  />
                ))}
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
                <Button variant="outline" size="sm">
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Suggestions
                </Button>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
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
                  <p className="text-sm text-pulse-accent font-semibold">{workspace.grant.amount}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-pulse-text-tertiary uppercase tracking-wider mb-1">Deadline</p>
                  <p className={`text-sm ${isUrgent ? 'text-pulse-error font-medium' : 'text-pulse-text'}`}>
                    {formatDate(workspace.grant.deadlineDate)}
                    {isUrgent && ' (Urgent!)'}
                  </p>
                </div>
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
              </div>

              <div className="flex gap-2 mt-6 pt-4 border-t border-pulse-border">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <Link href={`/app/grants/${workspace.grant.id}`}>
                    View Grant
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <a href={workspace.grant.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Source
                  </a>
                </Button>
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
                  Created {formatDate(workspace.createdAt)}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  Last updated {formatDate(workspace.updatedAt)}
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
