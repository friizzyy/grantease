'use client'

/**
 * GUIDED APPLICATION FLOW
 * -----------------------
 * Step-by-step grant application with:
 * - Pre-populated data from user vault
 * - AI writing assistance
 * - Progress tracking
 * - Auto-save
 */

import { useState, useEffect, useCallback, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Circle,
  Sparkles,
  FileText,
  Building2,
  Users,
  DollarSign,
  Calendar,
  Clock,
  Save,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Wand2,
  Copy,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GlassCard } from '@/components/ui/glass-card'
import { useToastActions } from '@/components/ui/toast-provider'

// Application steps
const STEPS = [
  { id: 'contact', label: 'Contact Info', icon: Users, description: 'Your contact details' },
  { id: 'organization', label: 'Organization', icon: Building2, description: 'About your organization' },
  { id: 'project', label: 'Project Summary', icon: FileText, description: 'Overview of your project' },
  { id: 'narrative', label: 'Project Narrative', icon: Sparkles, description: 'Detailed description' },
  { id: 'budget', label: 'Budget', icon: DollarSign, description: 'Financial breakdown' },
  { id: 'timeline', label: 'Timeline', icon: Calendar, description: 'Key milestones' },
  { id: 'review', label: 'Review', icon: Check, description: 'Final review' },
]

interface Grant {
  id: string
  title: string
  sponsor: string
  deadlineDate: string | null
  amountMin: number | null
  amountMax: number | null
  url: string
}

interface VaultData {
  organizationName?: string
  ein?: string
  primaryContactName?: string
  primaryContactEmail?: string
  primaryContactPhone?: string
  primaryContactTitle?: string
  streetAddress?: string
  city?: string
  state?: string
  zipCode?: string
  missionStatement?: string
  organizationHistory?: string
  ueiNumber?: string
  dunsNumber?: string
}

interface ApplicationFormData {
  // Contact
  contactName: string
  contactTitle: string
  contactEmail: string
  contactPhone: string
  // Organization
  organizationName: string
  organizationAddress: string
  organizationCity: string
  organizationState: string
  organizationZip: string
  ein: string
  dunsNumber: string
  ueiNumber: string
  // Project
  projectTitle: string
  projectSummary: string
  totalProjectCost: string
  amountRequested: string
  projectStartDate: string
  projectEndDate: string
  // Narrative
  needStatement: string
  projectDescription: string
  goalsAndObjectives: string
  evaluationPlan: string
  sustainabilityPlan: string
  // Budget
  budgetNarrative: string
  personnelCost: string
  equipmentCost: string
  suppliesCost: string
  travelCost: string
  otherCost: string
  indirectCost: string
  // Timeline
  milestones: string
}

const INITIAL_FORM_DATA: ApplicationFormData = {
  contactName: '',
  contactTitle: '',
  contactEmail: '',
  contactPhone: '',
  organizationName: '',
  organizationAddress: '',
  organizationCity: '',
  organizationState: '',
  organizationZip: '',
  ein: '',
  dunsNumber: '',
  ueiNumber: '',
  projectTitle: '',
  projectSummary: '',
  totalProjectCost: '',
  amountRequested: '',
  projectStartDate: '',
  projectEndDate: '',
  needStatement: '',
  projectDescription: '',
  goalsAndObjectives: '',
  evaluationPlan: '',
  sustainabilityPlan: '',
  budgetNarrative: '',
  personnelCost: '',
  equipmentCost: '',
  suppliesCost: '',
  travelCost: '',
  otherCost: '',
  indirectCost: '',
  milestones: '',
}

// Progress indicator
function ProgressSteps({
  currentStep,
  completedSteps,
  onStepClick
}: {
  currentStep: number
  completedSteps: Set<number>
  onStepClick: (step: number) => void
}) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute left-0 right-0 top-5 h-0.5 bg-pulse-border" />
        <div
          className="absolute left-0 top-5 h-0.5 bg-pulse-accent transition-all duration-500"
          style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
        />

        {STEPS.map((step, index) => {
          const isActive = index === currentStep
          const isCompleted = completedSteps.has(index) || index < currentStep
          const Icon = step.icon

          return (
            <button
              key={step.id}
              onClick={() => onStepClick(index)}
              className="relative z-10 flex flex-col items-center group"
            >
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center transition-all
                ${isActive
                  ? 'bg-pulse-accent text-pulse-bg ring-4 ring-pulse-accent/20'
                  : isCompleted
                    ? 'bg-pulse-accent/20 text-pulse-accent border-2 border-pulse-accent'
                    : 'bg-pulse-surface text-pulse-text-tertiary border-2 border-pulse-border group-hover:border-pulse-accent/50'
                }
              `}>
                {isCompleted && !isActive ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <span className={`
                mt-2 text-xs font-medium hidden md:block
                ${isActive ? 'text-pulse-accent' : 'text-pulse-text-tertiary'}
              `}>
                {step.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// AI Writing Assistant
function AIWritingAssistant({
  fieldName,
  currentValue,
  onApply,
  context,
}: {
  fieldName: string
  currentValue: string
  onApply: (text: string) => void
  context: { grant: Grant | null; formData: ApplicationFormData }
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [suggestion, setSuggestion] = useState('')
  const toast = useToastActions()

  const generateSuggestion = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/ai/application-helper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'review',
          grantId: context.grant?.id,
          grantTitle: context.grant?.title,
          section: fieldName,
          content: currentValue,
          context: {
            organizationName: context.formData.organizationName,
            projectTitle: context.formData.projectTitle,
            projectSummary: context.formData.projectSummary,
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate suggestion')
      }

      const data = await response.json()
      setSuggestion(data.improvedContent || data.suggestions?.[0] || 'No suggestion available')
    } catch (error) {
      console.error('AI generation error:', error)
      toast.error('Failed to generate', 'Please try again')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs text-pulse-accent hover:text-pulse-accent/80 transition-colors"
      >
        <Wand2 className="w-3.5 h-3.5" />
        AI Writing Assistant
        {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 p-3 rounded-lg bg-pulse-accent/5 border border-pulse-accent/20">
              {!suggestion ? (
                <div className="text-center">
                  <p className="text-sm text-pulse-text-secondary mb-3">
                    Let AI help you write or improve this section
                  </p>
                  <Button
                    size="sm"
                    onClick={generateSuggestion}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    Generate Suggestion
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="text-xs font-medium text-pulse-accent mb-2">AI Suggestion:</p>
                  <p className="text-sm text-pulse-text-secondary mb-3 whitespace-pre-wrap">
                    {suggestion}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => {
                        onApply(suggestion)
                        setSuggestion('')
                        setIsOpen(false)
                      }}
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Use This
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(suggestion)
                        toast.success('Copied', 'Text copied to clipboard')
                      }}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={generateSuggestion}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Regenerate'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Form field components
function FormInput({
  label,
  name,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
  fromVault,
}: {
  label: string
  name: string
  value: string
  onChange: (name: string, value: string) => void
  type?: string
  placeholder?: string
  required?: boolean
  fromVault?: boolean
}) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-medium text-pulse-text mb-2">
        {label}
        {required && <span className="text-pulse-error">*</span>}
        {fromVault && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            From Vault
          </Badge>
        )}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 rounded-lg bg-pulse-bg border border-pulse-border focus:border-pulse-accent focus:outline-none focus:ring-2 focus:ring-pulse-accent/20 text-pulse-text placeholder:text-pulse-text-tertiary transition-all"
        required={required}
      />
    </div>
  )
}

function FormTextarea({
  label,
  name,
  value,
  onChange,
  placeholder,
  required,
  rows = 4,
  showAI,
  context,
}: {
  label: string
  name: string
  value: string
  onChange: (name: string, value: string) => void
  placeholder?: string
  required?: boolean
  rows?: number
  showAI?: boolean
  context?: { grant: Grant | null; formData: ApplicationFormData }
}) {
  return (
    <div>
      <label className="flex items-center gap-2 text-sm font-medium text-pulse-text mb-2">
        {label}
        {required && <span className="text-pulse-error">*</span>}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-3 rounded-lg bg-pulse-bg border border-pulse-border focus:border-pulse-accent focus:outline-none focus:ring-2 focus:ring-pulse-accent/20 text-pulse-text placeholder:text-pulse-text-tertiary transition-all resize-none"
        required={required}
      />
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-pulse-text-tertiary">
          {value.split(/\s+/).filter(Boolean).length} words
        </span>
        {showAI && context && (
          <AIWritingAssistant
            fieldName={name}
            currentValue={value}
            onApply={(text) => onChange(name, text)}
            context={context}
          />
        )}
      </div>
    </div>
  )
}

// Step content components
function ContactStep({
  formData,
  onChange,
  vaultData,
}: {
  formData: ApplicationFormData
  onChange: (name: string, value: string) => void
  vaultData: VaultData | null
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-pulse-text mb-2">Contact Information</h2>
        <p className="text-sm text-pulse-text-secondary">
          Primary contact for this application. This person will receive all communications about your application.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <FormInput
          label="Full Name"
          name="contactName"
          value={formData.contactName}
          onChange={onChange}
          placeholder="John Smith"
          required
          fromVault={!!vaultData?.primaryContactName && formData.contactName === vaultData.primaryContactName}
        />
        <FormInput
          label="Title/Position"
          name="contactTitle"
          value={formData.contactTitle}
          onChange={onChange}
          placeholder="Executive Director"
          fromVault={!!vaultData?.primaryContactTitle && formData.contactTitle === vaultData.primaryContactTitle}
        />
        <FormInput
          label="Email"
          name="contactEmail"
          value={formData.contactEmail}
          onChange={onChange}
          type="email"
          placeholder="john@organization.org"
          required
          fromVault={!!vaultData?.primaryContactEmail && formData.contactEmail === vaultData.primaryContactEmail}
        />
        <FormInput
          label="Phone"
          name="contactPhone"
          value={formData.contactPhone}
          onChange={onChange}
          type="tel"
          placeholder="(555) 123-4567"
          fromVault={!!vaultData?.primaryContactPhone && formData.contactPhone === vaultData.primaryContactPhone}
        />
      </div>
    </div>
  )
}

function OrganizationStep({
  formData,
  onChange,
  vaultData,
}: {
  formData: ApplicationFormData
  onChange: (name: string, value: string) => void
  vaultData: VaultData | null
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-pulse-text mb-2">Organization Information</h2>
        <p className="text-sm text-pulse-text-secondary">
          Details about your organization. Required for most grant applications.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <FormInput
            label="Organization Name"
            name="organizationName"
            value={formData.organizationName}
            onChange={onChange}
            placeholder="Your Organization Name"
            required
            fromVault={!!vaultData?.organizationName && formData.organizationName === vaultData.organizationName}
          />
        </div>
        <FormInput
          label="EIN / Tax ID"
          name="ein"
          value={formData.ein}
          onChange={onChange}
          placeholder="XX-XXXXXXX"
          fromVault={!!vaultData?.ein && formData.ein === vaultData.ein}
        />
        <FormInput
          label="UEI Number"
          name="ueiNumber"
          value={formData.ueiNumber}
          onChange={onChange}
          placeholder="12 character UEI"
          fromVault={!!vaultData?.ueiNumber && formData.ueiNumber === vaultData.ueiNumber}
        />
        <div className="md:col-span-2">
          <FormInput
            label="Street Address"
            name="organizationAddress"
            value={formData.organizationAddress}
            onChange={onChange}
            placeholder="123 Main Street"
            fromVault={!!vaultData?.streetAddress && formData.organizationAddress === vaultData.streetAddress}
          />
        </div>
        <FormInput
          label="City"
          name="organizationCity"
          value={formData.organizationCity}
          onChange={onChange}
          placeholder="City"
          fromVault={!!vaultData?.city && formData.organizationCity === vaultData.city}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormInput
            label="State"
            name="organizationState"
            value={formData.organizationState}
            onChange={onChange}
            placeholder="CA"
            fromVault={!!vaultData?.state && formData.organizationState === vaultData.state}
          />
          <FormInput
            label="ZIP"
            name="organizationZip"
            value={formData.organizationZip}
            onChange={onChange}
            placeholder="12345"
            fromVault={!!vaultData?.zipCode && formData.organizationZip === vaultData.zipCode}
          />
        </div>
      </div>
    </div>
  )
}

function ProjectStep({
  formData,
  onChange,
  grant,
}: {
  formData: ApplicationFormData
  onChange: (name: string, value: string) => void
  grant: Grant | null
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-pulse-text mb-2">Project Summary</h2>
        <p className="text-sm text-pulse-text-secondary">
          Provide a high-level overview of your project. This should be concise but compelling.
        </p>
      </div>

      <div className="space-y-4">
        <FormInput
          label="Project Title"
          name="projectTitle"
          value={formData.projectTitle}
          onChange={onChange}
          placeholder="A clear, descriptive title for your project"
          required
        />

        <FormTextarea
          label="Project Summary"
          name="projectSummary"
          value={formData.projectSummary}
          onChange={onChange}
          placeholder="Briefly describe your project, its goals, and expected outcomes (150-300 words)"
          rows={5}
          required
          showAI
          context={{ grant, formData }}
        />

        <div className="grid md:grid-cols-2 gap-4">
          <FormInput
            label="Total Project Cost"
            name="totalProjectCost"
            value={formData.totalProjectCost}
            onChange={onChange}
            placeholder="$50,000"
          />
          <FormInput
            label="Amount Requested"
            name="amountRequested"
            value={formData.amountRequested}
            onChange={onChange}
            placeholder="$25,000"
            required
          />
          <FormInput
            label="Project Start Date"
            name="projectStartDate"
            value={formData.projectStartDate}
            onChange={onChange}
            type="date"
          />
          <FormInput
            label="Project End Date"
            name="projectEndDate"
            value={formData.projectEndDate}
            onChange={onChange}
            type="date"
          />
        </div>
      </div>
    </div>
  )
}

function NarrativeStep({
  formData,
  onChange,
  grant,
}: {
  formData: ApplicationFormData
  onChange: (name: string, value: string) => void
  grant: Grant | null
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-pulse-text mb-2">Project Narrative</h2>
        <p className="text-sm text-pulse-text-secondary">
          This is the heart of your application. Be specific, use data when possible, and connect to the funder's priorities.
        </p>
      </div>

      <div className="space-y-6">
        <FormTextarea
          label="Statement of Need"
          name="needStatement"
          value={formData.needStatement}
          onChange={onChange}
          placeholder="What problem or need does your project address? Include data and evidence."
          rows={6}
          showAI
          context={{ grant, formData }}
        />

        <FormTextarea
          label="Project Description"
          name="projectDescription"
          value={formData.projectDescription}
          onChange={onChange}
          placeholder="Describe your project in detail. What activities will you conduct? How will you achieve your goals?"
          rows={8}
          showAI
          context={{ grant, formData }}
        />

        <FormTextarea
          label="Goals and Objectives"
          name="goalsAndObjectives"
          value={formData.goalsAndObjectives}
          onChange={onChange}
          placeholder="List your SMART goals (Specific, Measurable, Achievable, Relevant, Time-bound)"
          rows={5}
          showAI
          context={{ grant, formData }}
        />

        <FormTextarea
          label="Evaluation Plan"
          name="evaluationPlan"
          value={formData.evaluationPlan}
          onChange={onChange}
          placeholder="How will you measure success? What metrics will you track?"
          rows={4}
          showAI
          context={{ grant, formData }}
        />

        <FormTextarea
          label="Sustainability Plan"
          name="sustainabilityPlan"
          value={formData.sustainabilityPlan}
          onChange={onChange}
          placeholder="How will the project continue after the grant period? What is your long-term funding strategy?"
          rows={4}
          showAI
          context={{ grant, formData }}
        />
      </div>
    </div>
  )
}

function BudgetStep({
  formData,
  onChange,
  grant,
}: {
  formData: ApplicationFormData
  onChange: (name: string, value: string) => void
  grant: Grant | null
}) {
  const calculateTotal = () => {
    const fields = ['personnelCost', 'equipmentCost', 'suppliesCost', 'travelCost', 'otherCost', 'indirectCost']
    return fields.reduce((sum, field) => {
      const value = parseFloat(formData[field as keyof ApplicationFormData] || '0')
      return sum + (isNaN(value) ? 0 : value)
    }, 0)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-pulse-text mb-2">Budget</h2>
        <p className="text-sm text-pulse-text-secondary">
          Provide a detailed breakdown of your project budget. Be specific and realistic.
        </p>
      </div>

      <GlassCard className="p-4">
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <FormInput
            label="Personnel / Salaries"
            name="personnelCost"
            value={formData.personnelCost}
            onChange={onChange}
            type="number"
            placeholder="0"
          />
          <FormInput
            label="Equipment"
            name="equipmentCost"
            value={formData.equipmentCost}
            onChange={onChange}
            type="number"
            placeholder="0"
          />
          <FormInput
            label="Supplies"
            name="suppliesCost"
            value={formData.suppliesCost}
            onChange={onChange}
            type="number"
            placeholder="0"
          />
          <FormInput
            label="Travel"
            name="travelCost"
            value={formData.travelCost}
            onChange={onChange}
            type="number"
            placeholder="0"
          />
          <FormInput
            label="Other Direct Costs"
            name="otherCost"
            value={formData.otherCost}
            onChange={onChange}
            type="number"
            placeholder="0"
          />
          <FormInput
            label="Indirect Costs"
            name="indirectCost"
            value={formData.indirectCost}
            onChange={onChange}
            type="number"
            placeholder="0"
          />
        </div>

        <div className="pt-4 border-t border-pulse-border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-pulse-text">Total Budget</span>
            <span className="text-xl font-bold text-pulse-accent">
              ${calculateTotal().toLocaleString()}
            </span>
          </div>
        </div>
      </GlassCard>

      <FormTextarea
        label="Budget Narrative"
        name="budgetNarrative"
        value={formData.budgetNarrative}
        onChange={onChange}
        placeholder="Justify each budget line item. Explain why each cost is necessary for the project."
        rows={6}
        showAI
        context={{ grant, formData }}
      />
    </div>
  )
}

function TimelineStep({
  formData,
  onChange,
  grant,
}: {
  formData: ApplicationFormData
  onChange: (name: string, value: string) => void
  grant: Grant | null
}) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-pulse-text mb-2">Project Timeline</h2>
        <p className="text-sm text-pulse-text-secondary">
          Outline the key milestones and deliverables for your project.
        </p>
      </div>

      <FormTextarea
        label="Milestones & Deliverables"
        name="milestones"
        value={formData.milestones}
        onChange={onChange}
        placeholder={`Example format:

Month 1-2: Planning Phase
- Hire project staff
- Finalize partnerships
- Complete needs assessment

Month 3-6: Implementation Phase
- Launch program activities
- Conduct outreach
- Begin data collection

Month 7-12: Evaluation Phase
- Complete all program activities
- Analyze data
- Submit final report`}
        rows={12}
        showAI
        context={{ grant, formData }}
      />
    </div>
  )
}

function ReviewStep({
  formData,
  grant,
}: {
  formData: ApplicationFormData
  grant: Grant | null
}) {
  const sections = [
    {
      title: 'Contact Information',
      fields: [
        { label: 'Name', value: formData.contactName },
        { label: 'Email', value: formData.contactEmail },
        { label: 'Phone', value: formData.contactPhone },
        { label: 'Title', value: formData.contactTitle },
      ],
    },
    {
      title: 'Organization',
      fields: [
        { label: 'Name', value: formData.organizationName },
        { label: 'Address', value: `${formData.organizationAddress}, ${formData.organizationCity}, ${formData.organizationState} ${formData.organizationZip}` },
        { label: 'EIN', value: formData.ein },
        { label: 'UEI', value: formData.ueiNumber },
      ],
    },
    {
      title: 'Project Summary',
      fields: [
        { label: 'Title', value: formData.projectTitle },
        { label: 'Summary', value: formData.projectSummary, long: true },
        { label: 'Amount Requested', value: formData.amountRequested },
      ],
    },
  ]

  const completionItems = [
    { label: 'Contact info complete', done: !!(formData.contactName && formData.contactEmail) },
    { label: 'Organization info complete', done: !!formData.organizationName },
    { label: 'Project summary written', done: !!(formData.projectTitle && formData.projectSummary) },
    { label: 'Statement of need written', done: !!formData.needStatement },
    { label: 'Budget prepared', done: !!(formData.personnelCost || formData.equipmentCost) },
    { label: 'Timeline defined', done: !!formData.milestones },
  ]

  const completedCount = completionItems.filter(i => i.done).length
  const completionPercent = Math.round((completedCount / completionItems.length) * 100)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-pulse-text mb-2">Review Your Application</h2>
        <p className="text-sm text-pulse-text-secondary">
          Review all sections before submitting. Make sure everything is complete and accurate.
        </p>
      </div>

      {/* Completion status */}
      <GlassCard variant="accent" className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-pulse-text">Application Completeness</span>
          <span className="text-lg font-bold text-pulse-accent">{completionPercent}%</span>
        </div>
        <div className="h-2 bg-pulse-border rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-pulse-accent rounded-full transition-all"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          {completionItems.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              {item.done ? (
                <CheckCircle2 className="w-4 h-4 text-pulse-accent" />
              ) : (
                <Circle className="w-4 h-4 text-pulse-text-tertiary" />
              )}
              <span className={item.done ? 'text-pulse-text' : 'text-pulse-text-tertiary'}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </GlassCard>

      {/* Review sections */}
      {sections.map((section, i) => (
        <GlassCard key={i} className="p-4">
          <h3 className="text-sm font-semibold text-pulse-text mb-3">{section.title}</h3>
          <div className="space-y-2">
            {section.fields.map((field, j) => (
              <div key={j}>
                <span className="text-xs text-pulse-text-tertiary">{field.label}</span>
                <p className={`text-sm text-pulse-text ${field.long ? 'line-clamp-3' : ''}`}>
                  {field.value || <span className="italic text-pulse-text-tertiary">Not provided</span>}
                </p>
              </div>
            ))}
          </div>
        </GlassCard>
      ))}

      {/* Grant info */}
      {grant && (
        <GlassCard className="p-4 border-pulse-accent/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-pulse-accent/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-pulse-accent" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-pulse-text">{grant.title}</h3>
              <p className="text-xs text-pulse-text-tertiary">{grant.sponsor}</p>
            </div>
            {grant.url && (
              <Button size="sm" variant="outline" asChild>
                <a href={grant.url} target="_blank" rel="noopener noreferrer">
                  Apply
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </Button>
            )}
          </div>
        </GlassCard>
      )}
    </div>
  )
}

// Main component
export default function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const toast = useToastActions()

  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [formData, setFormData] = useState<ApplicationFormData>(INITIAL_FORM_DATA)
  const [grant, setGrant] = useState<Grant | null>(null)
  const [vaultData, setVaultData] = useState<VaultData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [applicationId, setApplicationId] = useState<string | null>(null)

  // Load grant and vault data
  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      try {
        // Load grant, vault, and existing application in parallel
        const [grantRes, vaultRes, appRes] = await Promise.all([
          fetch(`/api/grants/${encodeURIComponent(id)}`),
          fetch('/api/vault'),
          fetch(`/api/applications?grantId=${encodeURIComponent(id)}`).catch(() => null),
        ])

        if (grantRes.ok) {
          const grantData = await grantRes.json()
          setGrant(grantData)
        }

        if (vaultRes.ok) {
          const vaultResult = await vaultRes.json()
          if (vaultResult.vault) {
            setVaultData(vaultResult.vault)
            // Pre-populate form with vault data
            setFormData(prev => ({
              ...prev,
              contactName: vaultResult.vault.primaryContactName || '',
              contactEmail: vaultResult.vault.primaryContactEmail || '',
              contactPhone: vaultResult.vault.primaryContactPhone || '',
              contactTitle: vaultResult.vault.primaryContactTitle || '',
              organizationName: vaultResult.vault.organizationName || '',
              organizationAddress: vaultResult.vault.streetAddress || '',
              organizationCity: vaultResult.vault.city || '',
              organizationState: vaultResult.vault.state || '',
              organizationZip: vaultResult.vault.zipCode || '',
              ein: vaultResult.vault.ein || '',
              ueiNumber: vaultResult.vault.ueiNumber || '',
              dunsNumber: vaultResult.vault.dunsNumber || '',
            }))
          }
        }

        // Check for existing application
        if (appRes?.ok) {
          const appResult = await appRes.json()
          if (appResult.applications?.length > 0) {
            const existingApp = appResult.applications[0]
            setApplicationId(existingApp.id)
            // Load existing form data if available
            if (existingApp.formData) {
              setFormData(prev => ({ ...prev, ...existingApp.formData }))
            }
          }
        }
      } catch (error) {
        console.error('Failed to load data:', error)
        toast.error('Failed to load', 'Could not load grant details')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [id, toast])

  // Handle form field change
  const handleChange = useCallback((name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }, [])

  // Save application
  const handleSave = async () => {
    setIsSaving(true)
    try {
      if (applicationId) {
        // Update existing application
        await fetch(`/api/applications/${applicationId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'update_form', formData }),
        })
      } else {
        // Create new application
        const response = await fetch('/api/applications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ grantId: id }),
        })
        const data = await response.json()
        if (data.application) {
          setApplicationId(data.application.id)
          // Update with form data
          await fetch(`/api/applications/${data.application.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'update_form', formData }),
          })
        }
      }
      toast.success('Saved', 'Your progress has been saved')
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save', 'Please try again')
    } finally {
      setIsSaving(false)
    }
  }

  // Navigate steps
  const goNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCompletedSteps(prev => new Set([...prev, currentStep]))
      setCurrentStep(prev => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const goPrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const goToStep = (step: number) => {
    setCurrentStep(step)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-pulse-accent animate-spin mx-auto mb-4" />
          <p className="text-pulse-text-secondary">Loading application...</p>
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
        <Link
          href={`/app/grants/${encodeURIComponent(id)}`}
          className="inline-flex items-center gap-2 text-sm text-pulse-text-secondary hover:text-pulse-accent transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Grant Details
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-pulse-text mb-2">
              Grant Application
            </h1>
            {grant && (
              <p className="text-sm text-pulse-text-secondary">
                {grant.title}
                {grant.deadlineDate && (
                  <span className="text-pulse-accent ml-2">
                    <Clock className="w-3 h-3 inline mr-1" />
                    Due: {new Date(grant.deadlineDate).toLocaleDateString()}
                  </span>
                )}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Progress
          </Button>
        </div>
      </motion.div>

      {/* Progress Steps */}
      <ProgressSteps
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={goToStep}
      />

      {/* Step Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
      >
        <GlassCard className="p-6 mb-6">
          {currentStep === 0 && (
            <ContactStep formData={formData} onChange={handleChange} vaultData={vaultData} />
          )}
          {currentStep === 1 && (
            <OrganizationStep formData={formData} onChange={handleChange} vaultData={vaultData} />
          )}
          {currentStep === 2 && (
            <ProjectStep formData={formData} onChange={handleChange} grant={grant} />
          )}
          {currentStep === 3 && (
            <NarrativeStep formData={formData} onChange={handleChange} grant={grant} />
          )}
          {currentStep === 4 && (
            <BudgetStep formData={formData} onChange={handleChange} grant={grant} />
          )}
          {currentStep === 5 && (
            <TimelineStep formData={formData} onChange={handleChange} grant={grant} />
          )}
          {currentStep === 6 && (
            <ReviewStep formData={formData} grant={grant} />
          )}
        </GlassCard>
      </motion.div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={goPrev}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="flex items-center gap-3">
          <span className="text-sm text-pulse-text-tertiary">
            Step {currentStep + 1} of {STEPS.length}
          </span>

          {currentStep < STEPS.length - 1 ? (
            <Button onClick={goNext}>
              Continue to {STEPS[currentStep + 1].label}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              className="bg-gradient-to-r from-pulse-accent to-pulse-accent/80"
              onClick={() => {
                handleSave()
                if (grant?.url) {
                  window.open(grant.url, '_blank')
                }
              }}
            >
              <Check className="w-4 h-4 mr-2" />
              Complete & Apply
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
