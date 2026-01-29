'use client'

import { useState } from 'react'
import Link from 'next/link'
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
  Trash2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatDate } from '@/lib/utils'

// Mock workspace data
const mockWorkspace = {
  id: '1',
  name: 'SBIR Phase I Application',
  status: 'in_progress',
  notes: 'Need to finalize the technical proposal section. Waiting on budget approval from finance.',
  dueDate: new Date('2024-03-10'),
  grant: {
    id: '1',
    title: 'Small Business Innovation Research (SBIR) Phase I',
    sponsor: 'National Science Foundation',
    deadlineDate: new Date('2024-03-15'),
    url: 'https://www.nsf.gov/sbir',
  },
  checklist: [
    { id: '1', text: 'Review eligibility requirements', completed: true },
    { id: '2', text: 'Prepare company commercialization plan', completed: true },
    { id: '3', text: 'Draft technical proposal', completed: false },
    { id: '4', text: 'Complete budget justification', completed: false },
    { id: '5', text: 'Gather biographical sketches', completed: true },
    { id: '6', text: 'Document current and pending support', completed: false },
    { id: '7', text: 'Internal review', completed: false },
    { id: '8', text: 'Submit application', completed: false },
  ],
  documents: [
    { id: '1', name: 'Company Overview.pdf', type: 'PDF', addedAt: new Date('2024-01-20') },
    { id: '2', name: 'Technical Proposal Draft.docx', type: 'DOCX', addedAt: new Date('2024-01-25') },
    { id: '3', name: 'Budget Spreadsheet.xlsx', type: 'XLSX', addedAt: new Date('2024-01-26') },
  ],
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-28'),
}

const statusOptions = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'awarded', label: 'Awarded' },
  { value: 'rejected', label: 'Not Selected' },
]

export default function WorkspaceDetailPage({ params }: { params: { id: string } }) {
  const [workspace, setWorkspace] = useState(mockWorkspace)
  const [notes, setNotes] = useState(workspace.notes || '')
  const [newItem, setNewItem] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const completedCount = workspace.checklist.filter(item => item.completed).length
  const progress = Math.round((completedCount / workspace.checklist.length) * 100)

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
        { id: Date.now().toString(), text: newItem.trim(), completed: false },
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
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 500))
    setIsSaving(false)
  }

  return (
    <div className="p-8 max-w-5xl">
      {/* Back Button */}
      <Link 
        href="/app/workspace"
        className="inline-flex items-center gap-2 text-sm text-pulse-text-secondary hover:text-pulse-text mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Workspaces
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="font-serif text-heading-lg text-pulse-text mb-2">
              {workspace.name}
            </h1>
            <Link 
              href={`/app/grants/${workspace.grant.id}`}
              className="text-body-sm text-pulse-text-secondary hover:text-pulse-accent"
            >
              {workspace.grant.title}
            </Link>
          </div>
          <Button onClick={handleSave} loading={isSaving}>
            <Save className="w-4 h-4" />
            Save Changes
          </Button>
        </div>

        {/* Status & Progress */}
        <div className="flex flex-wrap items-center gap-4">
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

          <div className="flex items-center gap-3">
            <div className="w-32 h-2 bg-pulse-border rounded-full overflow-hidden">
              <div 
                className="h-full bg-pulse-accent rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm text-pulse-text-secondary">
              {progress}% complete
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-pulse-text-tertiary">
            <Calendar className="w-4 h-4" />
            Grant deadline: {formatDate(workspace.grant.deadlineDate)}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Checklist */}
        <div className="lg:col-span-2">
          <Card >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Checklist</span>
                <span className="text-sm font-normal text-pulse-text-tertiary">
                  {completedCount} of {workspace.checklist.length} complete
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                {workspace.checklist.map((item) => (
                  <div 
                    key={item.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-pulse-surface/50 border border-pulse-border group"
                  >
                    <button
                      onClick={() => toggleChecklistItem(item.id)}
                      className="shrink-0"
                    >
                      {item.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-pulse-accent" />
                      ) : (
                        <Circle className="w-5 h-5 text-pulse-text-tertiary hover:text-pulse-accent" />
                      )}
                    </button>
                    <span className={`flex-1 text-sm ${item.completed ? 'text-pulse-text-tertiary line-through' : 'text-pulse-text'}`}>
                      {item.text}
                    </span>
                    <button
                      onClick={() => removeChecklistItem(item.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-pulse-text-tertiary hover:text-pulse-error transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Item */}
              <div className="flex gap-2">
                <Input
                  placeholder="Add checklist item..."
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addChecklistItem()}
                />
                <Button variant="outline" onClick={addChecklistItem}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card  className="mt-6">
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this application..."
                rows={6}
                className="w-full rounded-lg bg-pulse-surface/50 border border-pulse-border px-4 py-3 text-sm text-pulse-text placeholder:text-pulse-text-tertiary transition-all duration-200 hover:border-pulse-border-hover focus:outline-none focus:border-pulse-accent/40 focus:ring-2 focus:ring-pulse-accent/10 resize-none"
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Grant Info */}
          <Card >
            <CardHeader>
              <CardTitle>Grant Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-pulse-text-tertiary mb-1">Sponsor</p>
                <p className="text-sm text-pulse-text">{workspace.grant.sponsor}</p>
              </div>
              <div>
                <p className="text-xs text-pulse-text-tertiary mb-1">Deadline</p>
                <p className="text-sm text-pulse-text">{formatDate(workspace.grant.deadlineDate)}</p>
              </div>
              <Button variant="outline" size="sm" className="w-full" asChild>
                <a href={workspace.grant.url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4" />
                  View Grant
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Documents */}
          <Card >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Documents</span>
                <Button variant="ghost" size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {workspace.documents.length === 0 ? (
                <p className="text-sm text-pulse-text-tertiary text-center py-4">
                  No documents yet
                </p>
              ) : (
                <div className="space-y-2">
                  {workspace.documents.map((doc) => (
                    <div 
                      key={doc.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-pulse-surface/50 cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-pulse-text-tertiary" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-pulse-text truncate">{doc.name}</p>
                        <p className="text-xs text-pulse-text-tertiary">
                          Added {formatDate(doc.addedAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-pulse-text-tertiary mt-4 text-center">
                Document upload coming soon
              </p>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card >
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-xs text-pulse-text-tertiary mb-2">
                <Clock className="w-3 h-3" />
                Created {formatDate(workspace.createdAt)}
              </div>
              <div className="flex items-center gap-2 text-xs text-pulse-text-tertiary">
                <Clock className="w-3 h-3" />
                Updated {formatDate(workspace.updatedAt)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
