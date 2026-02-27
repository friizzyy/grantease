'use client'

/**
 * USER DATA VAULT PAGE
 * --------------------
 * Manage reusable application data:
 * - Organization info
 * - Contact details
 * - Documents
 * - Text blocks (narratives)
 * - Budget items
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Building2,
  Users,
  FileText,
  DollarSign,
  MapPin,
  Mail,
  Phone,
  Globe,
  Calendar,
  ChevronDown,
  ChevronRight,
  Edit2,
  Save,
  X,
  Plus,
  Trash2,
  Upload,
  Loader2,
  CheckCircle2,
  Circle,
  AlertCircle,
  Sparkles,
  Shield,
  FileUp,
  Type,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GlassCard } from '@/components/ui/glass-card'
import { useToastActions } from '@/components/ui/toast-provider'

interface VaultData {
  id: string
  organizationName?: string | null
  organizationLegalName?: string | null
  ein?: string | null
  ueiNumber?: string | null
  dunsNumber?: string | null
  yearFounded?: number | null
  websiteUrl?: string | null
  primaryContactName?: string | null
  primaryContactTitle?: string | null
  primaryContactEmail?: string | null
  primaryContactPhone?: string | null
  streetAddress?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
  country: string
  missionStatement?: string | null
  organizationHistory?: string | null
  serviceArea?: string | null
  annualOperatingBudget?: string | null
  samRegistered: boolean
  nonprofitStatus?: string | null
  certifications: string[]
  keyPersonnel: Array<{
    id: string
    name: string
    title: string
    email?: string
    role: string
  }>
}

interface VaultCompleteness {
  overall: number
  sections: {
    organization: number
    contact: number
    address: number
    details: number
    registrations: number
    personnel: number
    documents: number
    textBlocks: number
  }
  missingCritical: string[]
  recommendations: string[]
}

interface VaultDocument {
  id: string
  name: string
  type: string
  fileName: string
  fileSize: number
  uploadedAt: string
  usageCount: number
}

interface VaultTextBlock {
  id: string
  title: string
  category: string
  content: string
  wordCount: number
  aiGenerated: boolean
  usageCount: number
}

// Section component with collapsible content
function VaultSection({
  title,
  icon: Icon,
  completeness,
  children,
  defaultOpen = false,
}: {
  title: string
  icon: React.ElementType
  completeness?: number
  children: React.ReactNode
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <GlassCard className="overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        className="w-full p-4 flex items-center justify-between hover:bg-pulse-surface/50 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-pulse-accent/50 focus-visible:outline-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-pulse-accent/10 border border-pulse-accent/20 flex items-center justify-center">
            <Icon className="w-5 h-5 text-pulse-accent" />
          </div>
          <div className="text-left">
            <h3 className="font-medium text-pulse-text">{title}</h3>
            {completeness !== undefined && (
              <div className="flex items-center gap-2 mt-1">
                <div className="w-24 h-1.5 bg-pulse-border rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      completeness >= 80 ? 'bg-green-500' :
                      completeness >= 50 ? 'bg-yellow-500' :
                      'bg-pulse-error'
                    }`}
                    style={{ width: `${completeness}%` }}
                  />
                </div>
                <span className="text-xs text-pulse-text-tertiary">{completeness}%</span>
              </div>
            )}
          </div>
        </div>
        {isOpen ? (
          <ChevronDown className="w-5 h-5 text-pulse-text-tertiary" />
        ) : (
          <ChevronRight className="w-5 h-5 text-pulse-text-tertiary" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 pt-0 border-t border-pulse-border">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  )
}

// Editable field component
function EditableField({
  label,
  value,
  name,
  onSave,
  type = 'text',
  placeholder,
  multiline = false,
}: {
  label: string
  value: string | null | undefined
  name: string
  onSave: (name: string, value: string) => Promise<void>
  type?: string
  placeholder?: string
  multiline?: boolean
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value || '')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(name, editValue)
      setIsEditing(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditValue(value || '')
    setIsEditing(false)
  }

  if (isEditing) {
    return (
      <div className="space-y-2">
        <label className="text-xs font-medium text-pulse-text-secondary">{label}</label>
        {multiline ? (
          <textarea
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder={placeholder}
            rows={4}
            className="w-full px-4 py-2.5 rounded-lg bg-pulse-surface border border-pulse-border focus:outline-none focus:ring-2 focus:ring-pulse-accent/30 focus:border-pulse-accent text-sm text-pulse-text placeholder:text-pulse-text-tertiary resize-none transition-all duration-150"
          />
        ) : (
          <input
            type={type}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-2.5 rounded-lg bg-pulse-surface border border-pulse-border focus:outline-none focus:ring-2 focus:ring-pulse-accent/30 focus:border-pulse-accent text-sm text-pulse-text placeholder:text-pulse-text-tertiary transition-all duration-150"
          />
        )}
        <div className="flex gap-2">
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
            <span className="ml-1">Save</span>
          </Button>
          <Button size="sm" variant="ghost" onClick={handleCancel}>
            <X className="w-3 h-3" />
            <span className="ml-1">Cancel</span>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="group">
      <div className="flex items-start justify-between">
        <div>
          <label className="text-xs font-medium text-pulse-text-secondary">{label}</label>
          <p className="text-sm text-pulse-text mt-0.5">
            {value || <span className="italic text-pulse-text-tertiary">Not set</span>}
          </p>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          aria-label={`Edit ${label}`}
          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-pulse-surface active:scale-[0.98] transition-all duration-150 min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-pulse-accent/50 focus-visible:outline-none"
        >
          <Edit2 className="w-3.5 h-3.5 text-pulse-text-tertiary" />
        </button>
      </div>
    </div>
  )
}

// Completeness card
function CompletenessCard({ completeness }: { completeness: VaultCompleteness }) {
  return (
    <GlassCard variant="accent" className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-pulse-accent/20 border border-pulse-accent/30 flex items-center justify-center">
            <Shield className="w-6 h-6 text-pulse-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-pulse-text">Vault Completeness</h3>
            <p className="text-sm text-pulse-text-secondary">
              {completeness.overall >= 80 ? 'Ready for most applications' :
               completeness.overall >= 50 ? 'Good progress, keep going' :
               'Fill in more details to speed up applications'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-3xl font-bold text-pulse-accent">{completeness.overall}%</span>
        </div>
      </div>

      <div className="h-2 bg-pulse-border rounded-full overflow-hidden mb-4">
        <motion.div
          className="h-full bg-pulse-accent rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${completeness.overall}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      {/* Why This Matters */}
      <div className="mb-4 p-3 rounded-xl bg-pulse-accent/5 border border-pulse-accent/20">
        <p className="text-xs font-medium text-pulse-accent mb-1.5">Why complete your vault?</p>
        <p className="text-xs text-pulse-text-secondary mb-2">
          Your vault can auto-fill approximately <span className="font-semibold text-pulse-text">{completeness.overall}%</span> of the average grant application.
        </p>
        <p className="text-xs text-pulse-text-tertiary">
          Complete your vault to save ~15-20 hours per grant application.
        </p>
      </div>

      {completeness.missingCritical.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-medium text-pulse-error mb-2">Missing Critical Info:</p>
          <div className="flex flex-wrap gap-2">
            {completeness.missingCritical.map((item, i) => (
              <Badge key={i} variant="outline" className="text-pulse-error border-pulse-error/30">
                {item}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {completeness.recommendations.length > 0 && (
        <div>
          <p className="text-xs font-medium text-pulse-text-secondary mb-2">Recommendations:</p>
          <ul className="space-y-1">
            {completeness.recommendations.slice(0, 3).map((rec, i) => (
              <li key={i} className="text-xs text-pulse-text-tertiary flex items-start gap-2">
                <Sparkles className="w-3 h-3 text-pulse-accent shrink-0 mt-0.5" />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </GlassCard>
  )
}

export default function VaultPage() {
  const toast = useToastActions()
  const [isLoading, setIsLoading] = useState(true)
  const [vault, setVault] = useState<VaultData | null>(null)
  const [completeness, setCompleteness] = useState<VaultCompleteness | null>(null)
  const [documents, setDocuments] = useState<VaultDocument[]>([])
  const [textBlocks, setTextBlocks] = useState<VaultTextBlock[]>([])

  // Modal states
  const [showAddTextBlock, setShowAddTextBlock] = useState(false)
  const [editingTextBlock, setEditingTextBlock] = useState<VaultTextBlock | null>(null)
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null)
  const [deletingBlockId, setDeletingBlockId] = useState<string | null>(null)

  // Document import state
  const [importLoading, setImportLoading] = useState(false)
  const [importResult, setImportResult] = useState<{
    fields: Array<{ name: string; value: string; confidence: number; selected: boolean }>
    error?: string
  } | null>(null)
  const [showImportReview, setShowImportReview] = useState(false)

  // New text block form
  const [newBlockTitle, setNewBlockTitle] = useState('')
  const [newBlockCategory, setNewBlockCategory] = useState('mission_statement')
  const [newBlockContent, setNewBlockContent] = useState('')
  const [isSavingBlock, setIsSavingBlock] = useState(false)

  useEffect(() => {
    loadVault()
  }, [])

  const loadVault = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/vault')
      if (response.ok) {
        const data = await response.json()
        setVault(data.vault)
        setCompleteness(data.completeness)
        setDocuments(data.documents || [])
        setTextBlocks(data.textBlocks || [])
      }
    } catch (error) {
      console.error('Failed to load vault:', error)
      toast.error('Failed to load', 'Could not load your vault data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveField = async (name: string, value: string) => {
    try {
      const response = await fetch('/api/vault', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [name]: value }),
      })

      if (response.ok) {
        const data = await response.json()
        setVault(data.vault)
        setCompleteness(data.completeness)
        toast.success('Saved', 'Your changes have been saved')
      } else {
        throw new Error('Failed to save')
      }
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save', 'Please try again')
      throw error
    }
  }

  // Handle document delete
  const handleDeleteDocument = async (docId: string) => {
    setDeletingDocId(docId)
    try {
      const response = await fetch(`/api/vault/documents?id=${docId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete')
      setDocuments(prev => prev.filter(d => d.id !== docId))
      toast.success('Deleted', 'Document has been removed')
      loadVault() // Refresh completeness
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete', 'Please try again')
    } finally {
      setDeletingDocId(null)
    }
  }

  // Handle text block save
  const handleSaveTextBlock = async () => {
    if (!newBlockTitle.trim() || !newBlockContent.trim()) {
      toast.error('Required fields', 'Title and content are required')
      return
    }

    setIsSavingBlock(true)
    try {
      if (editingTextBlock) {
        // Update existing
        const response = await fetch('/api/vault/text-blocks', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            blockId: editingTextBlock.id,
            title: newBlockTitle,
            category: newBlockCategory,
            content: newBlockContent,
          }),
        })
        if (!response.ok) throw new Error('Failed to update')
        const data = await response.json()
        setTextBlocks(prev => prev.map(b => b.id === editingTextBlock.id ? data.textBlock : b))
        toast.success('Updated', 'Text block has been updated')
      } else {
        // Create new
        const response = await fetch('/api/vault/text-blocks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: newBlockTitle,
            category: newBlockCategory,
            content: newBlockContent,
          }),
        })
        if (!response.ok) throw new Error('Failed to create')
        const data = await response.json()
        setTextBlocks(prev => [data.textBlock, ...prev])
        toast.success('Created', 'Text block has been added')
      }

      // Reset form and close
      setNewBlockTitle('')
      setNewBlockCategory('mission_statement')
      setNewBlockContent('')
      setShowAddTextBlock(false)
      setEditingTextBlock(null)
      loadVault() // Refresh completeness
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save', 'Please try again')
    } finally {
      setIsSavingBlock(false)
    }
  }

  // Handle text block delete
  const handleDeleteTextBlock = async (blockId: string) => {
    setDeletingBlockId(blockId)
    try {
      const response = await fetch(`/api/vault/text-blocks?id=${blockId}`, {
        method: 'DELETE',
      })
      if (!response.ok) throw new Error('Failed to delete')
      setTextBlocks(prev => prev.filter(b => b.id !== blockId))
      toast.success('Deleted', 'Text block has been removed')
      loadVault() // Refresh completeness
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete', 'Please try again')
    } finally {
      setDeletingBlockId(null)
    }
  }

  // Open edit modal for text block
  const handleEditTextBlock = (block: VaultTextBlock) => {
    setEditingTextBlock(block)
    setNewBlockTitle(block.title)
    setNewBlockCategory(block.category)
    setNewBlockContent(block.content)
    setShowAddTextBlock(true)
  }

  // Handle document upload (opens file picker)
  const handleUploadDocument = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.pdf,.doc,.docx,.txt,.png,.jpg,.jpeg'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      // For now, show a toast explaining file storage is not set up
      // In production, this would upload to S3/Cloudinary and then call the API
      toast.info(
        'Upload coming soon',
        'File storage integration is being set up. For now, you can link to documents stored elsewhere.'
      )
    }
    input.click()
  }

  // Handle AI document import
  const handleImportDocument = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.pdf,.png,.jpg,.jpeg,.webp'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      setImportLoading(true)
      setImportResult(null)
      setShowImportReview(true)

      try {
        // Convert file to base64
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => {
            const result = reader.result as string
            // Remove the data URL prefix to get raw base64
            const base64Data = result.split(',')[1]
            resolve(base64Data)
          }
          reader.onerror = reject
          reader.readAsDataURL(file)
        })

        const response = await fetch('/api/vault/import-document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            fileData: base64,
          }),
        })

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}))
          throw new Error(errData.error || 'Failed to analyze document')
        }

        const data = await response.json()
        // Add selected=true by default
        const fields = (data.fields || []).map((f: { name: string; value: string; confidence: number }) => ({
          ...f,
          selected: true,
        }))
        setImportResult({ fields })
      } catch (err) {
        setImportResult({
          fields: [],
          error: err instanceof Error ? err.message : 'Failed to analyze document',
        })
      } finally {
        setImportLoading(false)
      }
    }
    input.click()
  }

  // Toggle field selection in import review
  const toggleImportField = (index: number) => {
    if (!importResult) return
    setImportResult({
      ...importResult,
      fields: importResult.fields.map((f, i) =>
        i === index ? { ...f, selected: !f.selected } : f
      ),
    })
  }

  // Apply selected imported fields to vault
  const applyImportedFields = async () => {
    if (!importResult) return
    const selectedFields = importResult.fields.filter(f => f.selected)
    if (selectedFields.length === 0) {
      toast.error('No fields selected', 'Select at least one field to apply.')
      return
    }

    try {
      // Build the update object from selected fields
      const updates: Record<string, string> = {}
      for (const field of selectedFields) {
        updates[field.name] = field.value
      }

      const response = await fetch('/api/vault', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        const data = await response.json()
        setVault(data.vault)
        setCompleteness(data.completeness)
        setShowImportReview(false)
        setImportResult(null)
        toast.success('Fields updated', `${selectedFields.length} fields have been applied to your vault.`)
      } else {
        throw new Error('Failed to update vault')
      }
    } catch (error) {
      console.error('Import apply error:', error)
      toast.error('Failed to apply', 'Could not update vault fields. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="px-4 md:px-6 lg:px-8 py-8 max-w-4xl mx-auto animate-pulse">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 bg-pulse-surface rounded" />
            <div className="h-3 bg-pulse-surface rounded w-20" />
          </div>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="h-9 bg-pulse-surface rounded w-64 mb-2" />
              <div className="h-4 bg-pulse-surface rounded w-96" />
            </div>
            <div className="h-10 bg-pulse-surface rounded-lg w-44" />
          </div>
        </div>

        {/* Completeness Card */}
        <div className="rounded-2xl border border-pulse-border/30 bg-pulse-surface/30 p-5 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-pulse-surface rounded-xl" />
              <div>
                <div className="h-5 bg-pulse-surface rounded w-40 mb-1" />
                <div className="h-3 bg-pulse-surface rounded w-56" />
              </div>
            </div>
            <div className="h-8 bg-pulse-surface rounded w-12" />
          </div>
          <div className="h-2 bg-pulse-surface rounded-full mb-4" />
          <div className="h-20 bg-pulse-surface/50 rounded-lg mb-4" />
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-6 bg-pulse-surface rounded-full w-28" />
            ))}
          </div>
        </div>

        {/* Vault Sections */}
        <div className="space-y-4">
          {[
            { label: 'Organization Information', open: true },
            { label: 'Primary Contact', open: false },
            { label: 'Address', open: false },
            { label: 'Organization Details', open: false },
            { label: 'Registrations & Certifications', open: false },
            { label: 'Documents', open: false },
            { label: 'Reusable Text Blocks', open: false },
          ].map((section, i) => (
            <div key={i} className="rounded-2xl border border-pulse-border/30 bg-pulse-surface/30 overflow-hidden">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-pulse-surface rounded-lg" />
                  <div>
                    <div className="h-4 bg-pulse-surface rounded w-44 mb-1" />
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 bg-pulse-surface rounded-full" />
                      <div className="h-3 bg-pulse-surface rounded w-8" />
                    </div>
                  </div>
                </div>
                <div className="w-5 h-5 bg-pulse-surface rounded" />
              </div>
              {section.open && (
                <div className="p-4 pt-0 border-t border-pulse-border/30">
                  <div className="grid md:grid-cols-2 gap-4 pt-4">
                    {[1, 2, 3, 4].map(j => (
                      <div key={j}>
                        <div className="h-3 bg-pulse-surface rounded w-24 mb-1" />
                        <div className="h-4 bg-pulse-surface rounded w-full" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 md:px-6 lg:px-8 py-8 max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-2">
          <Shield className="w-5 h-5 text-pulse-accent" />
          <span className="text-label text-pulse-text-tertiary">Data Vault</span>
        </div>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-display-page text-pulse-text mb-2">Your Application Vault</h1>
            <p className="text-body text-pulse-text-secondary">
              Store your information once, use it across all grant applications
            </p>
          </div>
          <Button
            onClick={handleImportDocument}
            disabled={importLoading}
            className="bg-pulse-accent text-pulse-bg hover:bg-pulse-accent/90 active:scale-[0.98] rounded-lg font-medium transition-all duration-150"
          >
            {importLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Upload className="w-4 h-4 mr-2" />
            )}
            Upload & Auto-Fill
          </Button>
        </div>
      </motion.div>

      {/* Completeness Card */}
      {completeness && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <CompletenessCard completeness={completeness} />
        </motion.div>
      )}

      {/* Sections */}
      <div className="space-y-4">
        {/* Organization Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <VaultSection
            title="Organization Information"
            icon={Building2}
            completeness={completeness?.sections.organization}
            defaultOpen={true}
          >
            <div className="grid md:grid-cols-2 gap-4 pt-4">
              <EditableField
                label="Organization Name"
                value={vault?.organizationName}
                name="organizationName"
                onSave={handleSaveField}
                placeholder="Your organization's name"
              />
              <EditableField
                label="Legal Name"
                value={vault?.organizationLegalName}
                name="organizationLegalName"
                onSave={handleSaveField}
                placeholder="Legal entity name"
              />
              <EditableField
                label="EIN / Tax ID"
                value={vault?.ein}
                name="ein"
                onSave={handleSaveField}
                placeholder="XX-XXXXXXX"
              />
              <EditableField
                label="UEI Number"
                value={vault?.ueiNumber}
                name="ueiNumber"
                onSave={handleSaveField}
                placeholder="SAM.gov UEI"
              />
              <EditableField
                label="Year Founded"
                value={vault?.yearFounded?.toString()}
                name="yearFounded"
                onSave={handleSaveField}
                type="number"
                placeholder="2020"
              />
              <EditableField
                label="Website"
                value={vault?.websiteUrl}
                name="websiteUrl"
                onSave={handleSaveField}
                type="url"
                placeholder="https://..."
              />
            </div>
          </VaultSection>
        </motion.div>

        {/* Contact Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <VaultSection
            title="Primary Contact"
            icon={Users}
            completeness={completeness?.sections.contact}
          >
            <div className="grid md:grid-cols-2 gap-4 pt-4">
              <EditableField
                label="Full Name"
                value={vault?.primaryContactName}
                name="primaryContactName"
                onSave={handleSaveField}
                placeholder="John Smith"
              />
              <EditableField
                label="Title"
                value={vault?.primaryContactTitle}
                name="primaryContactTitle"
                onSave={handleSaveField}
                placeholder="Executive Director"
              />
              <EditableField
                label="Email"
                value={vault?.primaryContactEmail}
                name="primaryContactEmail"
                onSave={handleSaveField}
                type="email"
                placeholder="john@org.com"
              />
              <EditableField
                label="Phone"
                value={vault?.primaryContactPhone}
                name="primaryContactPhone"
                onSave={handleSaveField}
                type="tel"
                placeholder="(555) 123-4567"
              />
            </div>
          </VaultSection>
        </motion.div>

        {/* Address */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <VaultSection
            title="Address"
            icon={MapPin}
            completeness={completeness?.sections.address}
          >
            <div className="grid md:grid-cols-2 gap-4 pt-4">
              <div className="md:col-span-2">
                <EditableField
                  label="Street Address"
                  value={vault?.streetAddress}
                  name="streetAddress"
                  onSave={handleSaveField}
                  placeholder="123 Main Street"
                />
              </div>
              <EditableField
                label="City"
                value={vault?.city}
                name="city"
                onSave={handleSaveField}
                placeholder="City"
              />
              <div className="grid grid-cols-2 gap-4">
                <EditableField
                  label="State"
                  value={vault?.state}
                  name="state"
                  onSave={handleSaveField}
                  placeholder="CA"
                />
                <EditableField
                  label="ZIP Code"
                  value={vault?.zipCode}
                  name="zipCode"
                  onSave={handleSaveField}
                  placeholder="12345"
                />
              </div>
            </div>
          </VaultSection>
        </motion.div>

        {/* Organization Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <VaultSection
            title="Organization Details"
            icon={FileText}
            completeness={completeness?.sections.details}
          >
            <div className="space-y-4 pt-4">
              <EditableField
                label="Mission Statement"
                value={vault?.missionStatement}
                name="missionStatement"
                onSave={handleSaveField}
                placeholder="Your organization's mission..."
                multiline
              />
              <EditableField
                label="Organization History"
                value={vault?.organizationHistory}
                name="organizationHistory"
                onSave={handleSaveField}
                placeholder="Brief history of your organization..."
                multiline
              />
              <EditableField
                label="Service Area"
                value={vault?.serviceArea}
                name="serviceArea"
                onSave={handleSaveField}
                placeholder="Geographic area you serve"
              />
              <EditableField
                label="Annual Operating Budget"
                value={vault?.annualOperatingBudget}
                name="annualOperatingBudget"
                onSave={handleSaveField}
                placeholder="$500,000"
              />
            </div>
          </VaultSection>
        </motion.div>

        {/* Registrations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <VaultSection
            title="Registrations & Certifications"
            icon={Shield}
            completeness={completeness?.sections.registrations}
          >
            <div className="pt-4 space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-pulse-surface border border-pulse-border/40">
                <div>
                  <p className="text-sm font-medium text-pulse-text">SAM.gov Registration</p>
                  <p className="text-xs text-pulse-text-tertiary">Required for federal grants</p>
                </div>
                <Badge variant={vault?.samRegistered ? 'success' : 'outline'}>
                  {vault?.samRegistered ? 'Registered' : 'Not Registered'}
                </Badge>
              </div>
              <EditableField
                label="Nonprofit Status"
                value={vault?.nonprofitStatus}
                name="nonprofitStatus"
                onSave={handleSaveField}
                placeholder="501(c)(3)"
              />
              {vault?.certifications && vault.certifications.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-pulse-text-secondary mb-2">Certifications</p>
                  <div className="flex flex-wrap gap-2">
                    {vault.certifications.map((cert, i) => (
                      <Badge key={i} variant="accent">{cert}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </VaultSection>
        </motion.div>

        {/* Documents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <VaultSection
            title="Documents"
            icon={FileUp}
            completeness={completeness?.sections.documents}
          >
            <div className="pt-4">
              {documents.length > 0 ? (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-pulse-surface border border-pulse-border/40"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-pulse-accent/10 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-pulse-accent" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-pulse-text">{doc.name}</p>
                          <p className="text-xs text-pulse-text-tertiary">
                            {doc.type} • Used {doc.usageCount} times
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteDocument(doc.id)}
                        disabled={deletingDocId === doc.id}
                      >
                        {deletingDocId === doc.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-pulse-error" />
                        ) : (
                          <Trash2 className="w-4 h-4 text-pulse-error" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-10"
                >
                  <div className="w-12 h-12 rounded-2xl bg-pulse-surface border border-pulse-border flex items-center justify-center mx-auto mb-4">
                    <FileUp className="w-6 h-6 text-pulse-text-tertiary" />
                  </div>
                  <h4 className="text-heading-sm font-semibold text-pulse-text mb-1">No documents uploaded yet</h4>
                  <p className="text-body-sm text-pulse-text-secondary max-w-xs mx-auto mb-4">
                    Upload tax-exempt letters, financial statements, or other reusable application documents.
                  </p>
                  <Button variant="outline" size="sm" onClick={handleUploadDocument}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                  </Button>
                </motion.div>
              )}
            </div>
          </VaultSection>
        </motion.div>

        {/* Text Blocks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
        >
          <VaultSection
            title="Reusable Text Blocks"
            icon={Type}
            completeness={completeness?.sections.textBlocks}
          >
            <div className="pt-4">
              {textBlocks.length > 0 ? (
                <div className="space-y-2">
                  {textBlocks.map((block) => (
                    <div
                      key={block.id}
                      className="p-3 rounded-xl bg-pulse-surface border border-pulse-border/40"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-sm font-medium text-pulse-text">{block.title}</p>
                          <p className="text-xs text-pulse-text-tertiary">
                            {block.category} • {block.wordCount} words • Used {block.usageCount} times
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {block.aiGenerated && (
                            <Badge variant="outline" className="text-xs">
                              <Sparkles className="w-3 h-3 mr-1" />
                              AI
                            </Badge>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => handleEditTextBlock(block)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteTextBlock(block.id)}
                            disabled={deletingBlockId === block.id}
                          >
                            {deletingBlockId === block.id ? (
                              <Loader2 className="w-4 h-4 animate-spin text-pulse-error" />
                            ) : (
                              <Trash2 className="w-4 h-4 text-pulse-error" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-pulse-text-secondary line-clamp-2">
                        {block.content}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-10"
                >
                  <div className="w-12 h-12 rounded-2xl bg-pulse-surface border border-pulse-border flex items-center justify-center mx-auto mb-4">
                    <Type className="w-6 h-6 text-pulse-text-tertiary" />
                  </div>
                  <h4 className="text-heading-sm font-semibold text-pulse-text mb-1">No text blocks created yet</h4>
                  <p className="text-body-sm text-pulse-text-secondary max-w-sm mx-auto mb-4">
                    Create reusable narratives like mission statements, need statements, and organizational capacity descriptions.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setShowAddTextBlock(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Text Block
                  </Button>
                </motion.div>
              )}
            </div>
          </VaultSection>
        </motion.div>
      </div>

      {/* Footer tip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-center"
      >
        <p className="text-xs text-pulse-text-tertiary">
          Data in your vault is automatically used to pre-fill grant applications, saving you time.
        </p>
      </motion.div>

      {/* Document Import Review Modal */}
      <AnimatePresence>
        {showImportReview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Document import review"
            onClick={() => !importLoading && (setShowImportReview(false), setImportResult(null))}
            onKeyDown={(e) => e.key === 'Escape' && !importLoading && (setShowImportReview(false), setImportResult(null))}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg max-h-[85vh] flex flex-col"
            >
              <GlassCard className="p-6 flex flex-col max-h-full">
                <div className="flex items-center gap-3 mb-4 shrink-0">
                  <div className="w-10 h-10 rounded-lg bg-pulse-accent/20 border border-pulse-accent/30 flex items-center justify-center">
                    <FileUp className="w-5 h-5 text-pulse-accent" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-pulse-text">Document Analysis</h2>
                    <p className="text-xs text-pulse-text-tertiary">Review extracted data before applying</p>
                  </div>
                </div>

                {importLoading && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 text-pulse-accent animate-spin mb-4" />
                    <p className="text-sm text-pulse-text-secondary">Analyzing your document with AI...</p>
                    <p className="text-xs text-pulse-text-tertiary mt-1">Extracting organization details</p>
                  </div>
                )}

                {importResult?.error && (
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-pulse-error/10 border border-pulse-error/20">
                    <AlertCircle className="w-5 h-5 text-pulse-error shrink-0 mt-0.5" />
                    <p className="text-sm text-pulse-error">{importResult.error}</p>
                  </div>
                )}

                {importResult && !importResult.error && importResult.fields.length > 0 && (
                  <>
                    <div className="flex-1 overflow-y-auto min-h-0 space-y-2">
                      {importResult.fields.map((field, i) => (
                        <div
                          key={i}
                          className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                            field.selected
                              ? 'bg-pulse-accent/5 border-pulse-accent/30'
                              : 'bg-pulse-surface border-pulse-border/40 hover:border-pulse-border'
                          }`}
                          onClick={() => toggleImportField(i)}
                        >
                          <div className="mt-0.5">
                            {field.selected ? (
                              <CheckCircle2 className="w-5 h-5 text-pulse-accent" />
                            ) : (
                              <Circle className="w-5 h-5 text-pulse-text-tertiary" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-xs font-medium text-pulse-text-secondary">{field.name}</p>
                              <span className={`text-xs px-1.5 py-0.5 rounded ${
                                field.confidence >= 0.8 ? 'bg-green-500/20 text-green-400' :
                                field.confidence >= 0.5 ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-orange-500/20 text-orange-400'
                              }`}>
                                {Math.round(field.confidence * 100)}% conf.
                              </span>
                            </div>
                            <p className="text-sm text-pulse-text line-clamp-2">{field.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-pulse-border shrink-0">
                      <span className="text-xs text-pulse-text-tertiary">
                        {importResult.fields.filter(f => f.selected).length} of {importResult.fields.length} fields selected
                      </span>
                      <div className="flex gap-3">
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setShowImportReview(false)
                            setImportResult(null)
                          }}
                        >
                          Cancel
                        </Button>
                        <Button onClick={applyImportedFields} className="bg-pulse-accent text-pulse-bg hover:bg-pulse-accent/90 active:scale-[0.98] transition-all duration-150">
                          <Sparkles className="w-4 h-4 mr-2" />
                          Apply Selected
                        </Button>
                      </div>
                    </div>
                  </>
                )}

                {importResult && !importResult.error && importResult.fields.length === 0 && !importLoading && (
                  <div className="text-center py-8">
                    <AlertCircle className="w-8 h-8 text-pulse-text-tertiary mx-auto mb-3" />
                    <p className="text-sm text-pulse-text-secondary">No fields could be extracted from this document.</p>
                    <p className="text-xs text-pulse-text-tertiary mt-1">Try uploading a different document or a clearer image.</p>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Text Block Modal */}
      <AnimatePresence>
        {showAddTextBlock && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            role="dialog"
            aria-modal="true"
            aria-label={editingTextBlock ? 'Edit text block' : 'Add text block'}
            onClick={() => {
              setShowAddTextBlock(false)
              setEditingTextBlock(null)
              setNewBlockTitle('')
              setNewBlockCategory('mission_statement')
              setNewBlockContent('')
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setShowAddTextBlock(false)
                setEditingTextBlock(null)
                setNewBlockTitle('')
                setNewBlockCategory('mission_statement')
                setNewBlockContent('')
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg"
            >
              <GlassCard className="p-6">
                <h2 className="text-lg font-semibold text-pulse-text mb-4">
                  {editingTextBlock ? 'Edit Text Block' : 'Add Text Block'}
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-pulse-text mb-2 block">Title</label>
                    <input
                      type="text"
                      value={newBlockTitle}
                      onChange={(e) => setNewBlockTitle(e.target.value)}
                      placeholder="e.g., Mission Statement"
                      className="w-full px-4 py-2.5 rounded-lg bg-pulse-surface border border-pulse-border focus:ring-2 focus:ring-pulse-accent/30 focus:border-pulse-accent focus:outline-none text-sm text-pulse-text placeholder:text-pulse-text-tertiary transition-all duration-150"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-pulse-text mb-2 block">Category</label>
                    <select
                      value={newBlockCategory}
                      onChange={(e) => setNewBlockCategory(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-lg bg-pulse-surface border border-pulse-border focus:ring-2 focus:ring-pulse-accent/30 focus:border-pulse-accent focus:outline-none text-sm text-pulse-text transition-all duration-150"
                    >
                      <option value="mission_statement">Mission Statement</option>
                      <option value="need_statement">Need Statement</option>
                      <option value="org_capacity">Organizational Capacity</option>
                      <option value="project_description">Project Description</option>
                      <option value="evaluation_plan">Evaluation Plan</option>
                      <option value="sustainability">Sustainability Plan</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-pulse-text mb-2 block">Content</label>
                    <textarea
                      value={newBlockContent}
                      onChange={(e) => setNewBlockContent(e.target.value)}
                      placeholder="Enter your reusable text..."
                      rows={6}
                      className="w-full px-4 py-2.5 rounded-lg bg-pulse-surface border border-pulse-border focus:ring-2 focus:ring-pulse-accent/30 focus:border-pulse-accent focus:outline-none text-sm text-pulse-text placeholder:text-pulse-text-tertiary resize-none transition-all duration-150"
                    />
                    <p className="text-xs text-pulse-text-tertiary mt-1">
                      {newBlockContent.split(/\s+/).filter(Boolean).length} words
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setShowAddTextBlock(false)
                      setEditingTextBlock(null)
                      setNewBlockTitle('')
                      setNewBlockCategory('mission_statement')
                      setNewBlockContent('')
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveTextBlock} disabled={isSavingBlock}>
                    {isSavingBlock ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    {editingTextBlock ? 'Update' : 'Add'} Text Block
                  </Button>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
