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
        className="w-full p-4 flex items-center justify-between hover:bg-pulse-surface/50 transition-colors"
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
            className="w-full px-3 py-2 rounded-lg bg-pulse-bg border border-pulse-accent focus:outline-none focus:ring-2 focus:ring-pulse-accent/20 text-sm text-pulse-text resize-none"
          />
        ) : (
          <input
            type={type}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 rounded-lg bg-pulse-bg border border-pulse-accent focus:outline-none focus:ring-2 focus:ring-pulse-accent/20 text-sm text-pulse-text"
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
          className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-pulse-surface transition-all"
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
      <div className="mb-4 p-3 rounded-lg bg-pulse-accent/5 border border-pulse-accent/20">
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

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-pulse-accent animate-spin mx-auto mb-4" />
          <p className="text-pulse-text-secondary">Loading your vault...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
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
        <h1 className="text-display-page text-pulse-text mb-2">Your Application Vault</h1>
        <p className="text-body text-pulse-text-secondary">
          Store your information once, use it across all grant applications
        </p>
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
              <div className="flex items-center justify-between p-3 rounded-lg bg-pulse-surface/50 border border-pulse-border">
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
                      className="flex items-center justify-between p-3 rounded-lg bg-pulse-surface/50 border border-pulse-border"
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
                      <Button size="sm" variant="ghost">
                        <Trash2 className="w-4 h-4 text-pulse-error" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileUp className="w-8 h-8 text-pulse-text-tertiary mx-auto mb-3" />
                  <p className="text-sm text-pulse-text-secondary mb-3">
                    No documents uploaded yet
                  </p>
                  <Button variant="outline" size="sm">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
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
                      className="p-3 rounded-lg bg-pulse-surface/50 border border-pulse-border"
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
                          <Button size="sm" variant="ghost">
                            <Edit2 className="w-4 h-4" />
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
                <div className="text-center py-8">
                  <Type className="w-8 h-8 text-pulse-text-tertiary mx-auto mb-3" />
                  <p className="text-sm text-pulse-text-secondary mb-3">
                    No text blocks created yet
                  </p>
                  <p className="text-xs text-pulse-text-tertiary mb-4">
                    Create reusable narratives like mission statements, need statements, and organizational capacity descriptions
                  </p>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Text Block
                  </Button>
                </div>
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
    </div>
  )
}
