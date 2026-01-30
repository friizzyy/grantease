'use client'

/**
 * SETTINGS PAGE - PREMIUM REDESIGN
 * ---------------------------------
 * Complete reformat with:
 * - Tab-based navigation for cleaner UX
 * - Ambient gradient backgrounds
 * - Enhanced glass morphism cards
 * - Smooth animations throughout
 * - Premium visual polish matching site quality
 * - Account summary sidebar
 * - Improved accessibility
 */

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Check,
  Mail,
  Building2,
  Sparkles,
  Target,
  Settings as SettingsIcon,
  Zap,
  Globe,
  MapPin,
  FileText,
  AlertCircle,
  LogOut,
  RefreshCw,
  Users,
  DollarSign,
  Clock,
  Layers,
  Edit3,
  Key,
  Smartphone,
  Download,
  Trash2,
  ChevronRight,
  ExternalLink,
  HelpCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { GlassCard } from '@/components/ui/glass-card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { springs } from '@/lib/motion/animations'
import {
  ENTITY_TYPES,
  INDUSTRY_CATEGORIES,
  SIZE_BANDS,
  STAGES,
  BUDGET_RANGES,
  GRANT_SIZE_PREFERENCES,
  TIMELINE_PREFERENCES,
  US_STATES,
  EntityType,
  SizeBand,
  Stage,
  BudgetRange,
  GrantSizePreference,
  TimelinePreference,
} from '@/lib/types/onboarding'

// Tab definitions
const tabs = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'matching', label: 'AI Matching', icon: Sparkles },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'billing', label: 'Billing', icon: CreditCard },
]

// Animated toggle switch
function AnimatedToggle({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean
  onChange: () => void
  disabled?: boolean
}) {
  return (
    <motion.button
      onClick={onChange}
      disabled={disabled}
      className={`relative w-12 h-7 rounded-full transition-colors ${
        checked ? 'bg-pulse-accent' : 'bg-white/10'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      whileTap={disabled ? {} : { scale: 0.95 }}
    >
      <motion.span
        className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm"
        animate={{ left: checked ? 26 : 4 }}
        transition={springs.snappy}
      />
    </motion.button>
  )
}

// Setting row component
function SettingRow({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
  disabled = false,
}: {
  icon?: React.ElementType
  title: string
  description: string
  checked: boolean
  onChange: () => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-all">
      <div className="flex items-center gap-4">
        {Icon && (
          <div className="w-10 h-10 rounded-lg bg-pulse-accent/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-pulse-accent" />
          </div>
        )}
        <div>
          <p className="font-medium text-pulse-text">{title}</p>
          <p className="text-sm text-pulse-text-tertiary">{description}</p>
        </div>
      </div>
      <AnimatedToggle checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  )
}

// Info card for displaying profile data
function InfoCard({
  icon: Icon,
  label,
  value,
  isEditing,
  children,
}: {
  icon: React.ElementType
  label: string
  value?: string
  isEditing?: boolean
  children?: React.ReactNode
}) {
  return (
    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-pulse-accent/20 transition-all group">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4 text-pulse-accent" />
        <span className="text-xs font-medium text-pulse-text-tertiary uppercase tracking-wider">{label}</span>
      </div>
      {isEditing && children ? (
        children
      ) : (
        <p className="text-sm font-medium text-pulse-text group-hover:text-pulse-accent transition-colors">
          {value || 'Not set'}
        </p>
      )}
    </div>
  )
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')

  const [profile, setProfile] = useState({
    name: 'Sarah Johnson',
    email: 'sarah@acmeresearch.com',
    organization: 'Acme Research Labs',
    location: 'CA',
  })

  const [onboardingProfile, setOnboardingProfile] = useState({
    entityType: 'small_business' as EntityType,
    state: 'CA',
    industryTags: ['technology', 'research', 'business'],
    sizeBand: 'small' as SizeBand,
    stage: 'growth' as Stage,
    annualBudget: '500k_1m' as BudgetRange,
    grantPreferences: {
      preferredSize: 'medium' as GrantSizePreference,
      timeline: 'quarter' as TimelinePreference,
    },
  })

  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isEditingMatching, setIsEditingMatching] = useState(false)

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    weeklyDigest: true,
    newGrants: true,
    deadlineReminders: true,
    reminderDays: '7',
    aiRecommendations: true,
    marketingEmails: false,
  })

  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    setIsSaving(false)
    setSaved(true)
    setIsEditingProfile(false)
    setIsEditingMatching(false)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="min-h-screen relative">
      {/* Ambient backgrounds */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] rounded-full bg-pulse-accent/[0.03] blur-[120px]" />
        <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] rounded-full bg-violet-500/[0.02] blur-[100px]" />
      </div>

      <div className="relative z-10 p-8 max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] mb-4">
            <SettingsIcon className="w-4 h-4 text-pulse-accent" />
            <span className="text-sm text-pulse-text-secondary">Account Settings</span>
          </div>
          <h1 className="font-serif text-4xl text-pulse-text mb-2">Settings</h1>
          <p className="text-pulse-text-secondary">
            Manage your profile, AI matching preferences, and account settings
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <motion.div
            className="lg:w-72 shrink-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="sticky top-8 space-y-6">
              {/* Account Summary Card */}
              <GlassCard className="p-6">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pulse-accent to-pulse-accent/50 flex items-center justify-center text-2xl font-bold text-pulse-bg mb-3">
                    SJ
                  </div>
                  <h3 className="text-lg font-semibold text-pulse-text">{profile.name}</h3>
                  <p className="text-sm text-pulse-text-tertiary">{profile.organization}</p>
                  <Badge variant="success" className="mt-2">Verified</Badge>
                </div>
                <div className="space-y-3 pt-4 border-t border-pulse-border/50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-pulse-text-tertiary">Member since</span>
                    <span className="text-pulse-text font-medium">Jan 2024</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-pulse-text-tertiary">Plan</span>
                    <span className="text-pulse-accent font-medium">Starter</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-pulse-text-tertiary">Grants saved</span>
                    <span className="text-pulse-text font-medium">3 / 5</span>
                  </div>
                </div>
              </GlassCard>

              {/* Navigation Tabs */}
              <GlassCard className="p-2">
                <nav className="space-y-1" role="navigation" aria-label="Settings navigation">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    const isActive = activeTab === tab.id
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        aria-current={isActive ? 'page' : undefined}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                          isActive
                            ? 'bg-pulse-accent/10 text-pulse-text border border-pulse-accent/30'
                            : 'text-pulse-text-secondary hover:text-pulse-text hover:bg-pulse-surface/50'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${isActive ? 'text-pulse-accent' : ''}`} />
                        <span className="font-medium">{tab.label}</span>
                        {isActive && <ChevronRight className="w-4 h-4 ml-auto text-pulse-accent" />}
                      </button>
                    )
                  })}
                </nav>
              </GlassCard>

              {/* Quick Actions */}
              <GlassCard className="p-4">
                <p className="text-xs font-medium text-pulse-text-tertiary uppercase tracking-wider mb-3 px-2">
                  Quick Actions
                </p>
                <div className="space-y-1">
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-pulse-text-secondary hover:text-pulse-text hover:bg-pulse-surface/50 transition-all text-left group">
                    <Download className="w-4 h-4 group-hover:text-pulse-accent transition-colors" />
                    <span className="text-sm">Export Data</span>
                    <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-pulse-text-secondary hover:text-pulse-text hover:bg-pulse-surface/50 transition-all text-left group">
                    <HelpCircle className="w-4 h-4 group-hover:text-pulse-accent transition-colors" />
                    <span className="text-sm">Help Center</span>
                    <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-pulse-text-secondary hover:text-pulse-error hover:bg-pulse-error/5 transition-all text-left group">
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Sign Out</span>
                  </button>
                </div>
              </GlassCard>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            className="flex-1 min-w-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <AnimatePresence mode="wait">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Personal Information */}
                  <GlassCard className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pulse-accent/20 to-pulse-accent/5 border border-pulse-accent/30 flex items-center justify-center">
                          <User className="w-6 h-6 text-pulse-accent" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-pulse-text">Personal Information</h2>
                          <p className="text-sm text-pulse-text-tertiary">Your basic profile details</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsEditingProfile(!isEditingProfile)}
                        className="text-pulse-text-secondary hover:text-pulse-accent"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        {isEditingProfile ? 'Done' : 'Edit'}
                      </Button>
                    </div>

                    {/* Avatar Section */}
                    <div className="flex items-center gap-4 mb-6 p-4 rounded-xl bg-pulse-surface/30 border border-pulse-border/50">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pulse-accent to-pulse-accent/50 flex items-center justify-center text-2xl font-bold text-pulse-bg">
                        SJ
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-pulse-text">Profile Photo</p>
                        <p className="text-xs text-pulse-text-tertiary mb-2">JPG, PNG or GIF. Max size 2MB</p>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" disabled={!isEditingProfile}>
                            Upload
                          </Button>
                          <Button variant="ghost" size="sm" className="text-pulse-text-tertiary" disabled={!isEditingProfile}>
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-pulse-text-tertiary uppercase tracking-wider mb-2 block flex items-center gap-1.5">
                          <User className="w-3 h-3" />
                          Full Name
                        </label>
                        <Input
                          value={profile.name}
                          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                          disabled={!isEditingProfile}
                          className="bg-pulse-surface/50"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-pulse-text-tertiary uppercase tracking-wider mb-2 block flex items-center gap-1.5">
                          <Mail className="w-3 h-3" />
                          Email Address
                        </label>
                        <Input
                          type="email"
                          value={profile.email}
                          onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                          disabled={!isEditingProfile}
                          className="bg-pulse-surface/50"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-pulse-text-tertiary uppercase tracking-wider mb-2 block flex items-center gap-1.5">
                          <Building2 className="w-3 h-3" />
                          Organization
                        </label>
                        <Input
                          value={profile.organization}
                          onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
                          disabled={!isEditingProfile}
                          className="bg-pulse-surface/50"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-pulse-text-tertiary uppercase tracking-wider mb-2 block flex items-center gap-1.5">
                          <MapPin className="w-3 h-3" />
                          Location
                        </label>
                        <Input
                          value={profile.location}
                          onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                          disabled={!isEditingProfile}
                          className="bg-pulse-surface/50"
                        />
                      </div>
                    </div>

                    <AnimatePresence>
                      {isEditingProfile && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-6 pt-6 border-t border-pulse-border/50 flex justify-end gap-3"
                        >
                          <Button variant="ghost" onClick={() => setIsEditingProfile(false)}>
                            Cancel
                          </Button>
                          <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Changes'}
                          </Button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </GlassCard>

                  {/* Danger Zone */}
                  <GlassCard className="p-6 border-pulse-error/20">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-pulse-error/10 border border-pulse-error/20 flex items-center justify-center">
                        <AlertCircle className="w-5 h-5 text-pulse-error" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-pulse-error">Danger Zone</h3>
                        <p className="text-sm text-pulse-text-tertiary">Irreversible actions</p>
                      </div>
                    </div>
                    <p className="text-sm text-pulse-text-tertiary mb-4">
                      Once you delete your account, there is no going back. All your data will be permanently removed.
                    </p>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </GlassCard>
                </motion.div>
              )}

              {/* AI Matching Tab */}
              {activeTab === 'matching' && (
                <motion.div
                  key="matching"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* AI Profile Card */}
                  <GlassCard variant="accent" className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pulse-accent to-pulse-accent/50 flex items-center justify-center">
                          <Sparkles className="w-6 h-6 text-pulse-bg" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-pulse-text">AI Match Profile</h2>
                          <p className="text-sm text-pulse-text-tertiary">Personalized grant matching settings</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="success" className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          94% Match Rate
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsEditingMatching(!isEditingMatching)}
                          className="text-pulse-text-secondary hover:text-pulse-accent"
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          {isEditingMatching ? 'Cancel' : 'Edit'}
                        </Button>
                      </div>
                    </div>

                    {/* Profile Grid */}
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      <InfoCard
                        icon={User}
                        label="Organization Type"
                        value={ENTITY_TYPES.find(t => t.value === onboardingProfile.entityType)?.label}
                        isEditing={isEditingMatching}
                      >
                        <Select
                          value={onboardingProfile.entityType}
                          onValueChange={(value) => setOnboardingProfile({ ...onboardingProfile, entityType: value as EntityType })}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {ENTITY_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </InfoCard>

                      <InfoCard
                        icon={MapPin}
                        label="Location"
                        value={`${US_STATES.find(s => s.value === onboardingProfile.state)?.label || 'Not set'}, US`}
                        isEditing={isEditingMatching}
                      >
                        <Select
                          value={onboardingProfile.state || ''}
                          onValueChange={(value) => setOnboardingProfile({ ...onboardingProfile, state: value })}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select state" />
                          </SelectTrigger>
                          <SelectContent className="max-h-[200px]">
                            {US_STATES.map((state) => (
                              <SelectItem key={state.value} value={state.value}>
                                {state.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </InfoCard>
                    </div>

                    {/* Focus Areas */}
                    <div className="mb-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Target className="w-4 h-4 text-pulse-accent" />
                        <span className="text-xs font-medium text-pulse-text-tertiary uppercase tracking-wider">Focus Areas</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {onboardingProfile.industryTags.map((tag) => {
                          const category = INDUSTRY_CATEGORIES.find(c => c.value === tag)
                          return (
                            <span
                              key={tag}
                              className="px-3 py-1.5 rounded-lg bg-pulse-accent/10 border border-pulse-accent/20 text-sm text-pulse-accent"
                            >
                              {category?.label || tag}
                            </span>
                          )
                        })}
                        {isEditingMatching && (
                          <button className="px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-pulse-text-tertiary hover:border-pulse-accent/30 hover:text-pulse-text transition-all">
                            + Add more
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Size & Stage Grid */}
                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                      <InfoCard
                        icon={Users}
                        label="Team Size"
                        value={SIZE_BANDS.find(s => s.value === onboardingProfile.sizeBand)?.label}
                        isEditing={isEditingMatching}
                      >
                        <Select
                          value={onboardingProfile.sizeBand || ''}
                          onValueChange={(value) => setOnboardingProfile({ ...onboardingProfile, sizeBand: value as SizeBand })}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent>
                            {SIZE_BANDS.map((size) => (
                              <SelectItem key={size.value} value={size.value}>
                                {size.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </InfoCard>

                      <InfoCard
                        icon={Layers}
                        label="Stage"
                        value={STAGES.find(s => s.value === onboardingProfile.stage)?.label}
                        isEditing={isEditingMatching}
                      >
                        <Select
                          value={onboardingProfile.stage || ''}
                          onValueChange={(value) => setOnboardingProfile({ ...onboardingProfile, stage: value as Stage })}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select stage" />
                          </SelectTrigger>
                          <SelectContent>
                            {STAGES.map((stage) => (
                              <SelectItem key={stage.value} value={stage.value}>
                                {stage.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </InfoCard>

                      <InfoCard
                        icon={DollarSign}
                        label="Annual Budget"
                        value={BUDGET_RANGES.find(b => b.value === onboardingProfile.annualBudget)?.label}
                        isEditing={isEditingMatching}
                      >
                        <Select
                          value={onboardingProfile.annualBudget || ''}
                          onValueChange={(value) => setOnboardingProfile({ ...onboardingProfile, annualBudget: value as BudgetRange })}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select budget" />
                          </SelectTrigger>
                          <SelectContent>
                            {BUDGET_RANGES.map((budget) => (
                              <SelectItem key={budget.value} value={budget.value}>
                                {budget.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </InfoCard>
                    </div>

                    {/* Grant Preferences */}
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                      <InfoCard
                        icon={DollarSign}
                        label="Preferred Grant Size"
                        value={GRANT_SIZE_PREFERENCES.find(p => p.value === onboardingProfile.grantPreferences.preferredSize)?.label}
                        isEditing={isEditingMatching}
                      >
                        <Select
                          value={onboardingProfile.grantPreferences.preferredSize || ''}
                          onValueChange={(value) => setOnboardingProfile({
                            ...onboardingProfile,
                            grantPreferences: { ...onboardingProfile.grantPreferences, preferredSize: value as GrantSizePreference }
                          })}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent>
                            {GRANT_SIZE_PREFERENCES.map((pref) => (
                              <SelectItem key={pref.value} value={pref.value}>
                                {pref.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </InfoCard>

                      <InfoCard
                        icon={Clock}
                        label="Funding Timeline"
                        value={TIMELINE_PREFERENCES.find(p => p.value === onboardingProfile.grantPreferences.timeline)?.label}
                        isEditing={isEditingMatching}
                      >
                        <Select
                          value={onboardingProfile.grantPreferences.timeline || ''}
                          onValueChange={(value) => setOnboardingProfile({
                            ...onboardingProfile,
                            grantPreferences: { ...onboardingProfile.grantPreferences, timeline: value as TimelinePreference }
                          })}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Select timeline" />
                          </SelectTrigger>
                          <SelectContent>
                            {TIMELINE_PREFERENCES.map((pref) => (
                              <SelectItem key={pref.value} value={pref.value}>
                                {pref.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </InfoCard>
                    </div>

                    {/* Profile Completeness */}
                    <div className="p-4 rounded-xl bg-pulse-surface/30 border border-pulse-border/50 mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-pulse-text">Profile Completeness</span>
                        <span className="text-sm font-semibold text-pulse-accent">90%</span>
                      </div>
                      <div className="w-full h-2 bg-pulse-border rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-pulse-accent to-pulse-accent/70 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: '90%' }}
                          transition={{ duration: 1, delay: 0.2 }}
                        />
                      </div>
                      <p className="text-xs text-pulse-text-tertiary mt-2">Complete your profile to improve match accuracy</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-pulse-border/50">
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/onboarding/step-1">
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Retake Onboarding
                        </Link>
                      </Button>
                      {isEditingMatching && (
                        <Button onClick={handleSave} disabled={isSaving}>
                          {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                      )}
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <motion.div
                  key="notifications"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <GlassCard className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-pulse-elevated border border-pulse-border flex items-center justify-center">
                        <Bell className="w-6 h-6 text-pulse-text-secondary" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-pulse-text">Email Notifications</h2>
                        <p className="text-sm text-pulse-text-tertiary">Control what emails you receive from GrantEase</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <SettingRow
                        icon={Mail}
                        title="Grant Alerts"
                        description="Get notified when new grants match your profile"
                        checked={notifications.emailAlerts}
                        onChange={() => setNotifications({ ...notifications, emailAlerts: !notifications.emailAlerts })}
                      />

                      <SettingRow
                        icon={FileText}
                        title="Weekly Digest"
                        description="Receive a weekly summary of new opportunities"
                        checked={notifications.weeklyDigest}
                        onChange={() => setNotifications({ ...notifications, weeklyDigest: !notifications.weeklyDigest })}
                      />

                      <SettingRow
                        icon={Sparkles}
                        title="AI Recommendations"
                        description="Get personalized grant suggestions from our AI"
                        checked={notifications.aiRecommendations}
                        onChange={() => setNotifications({ ...notifications, aiRecommendations: !notifications.aiRecommendations })}
                      />

                      <SettingRow
                        icon={Clock}
                        title="Deadline Reminders"
                        description="Get reminded before saved grant deadlines"
                        checked={notifications.deadlineReminders}
                        onChange={() => setNotifications({ ...notifications, deadlineReminders: !notifications.deadlineReminders })}
                      />

                      <AnimatePresence>
                        {notifications.deadlineReminders && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="ml-14 pl-4 border-l-2 border-pulse-accent/20"
                          >
                            <label className="text-xs font-medium text-pulse-text-tertiary uppercase tracking-wider mb-2 block">
                              Remind me
                            </label>
                            <Select
                              value={notifications.reminderDays}
                              onValueChange={(value) => setNotifications({ ...notifications, reminderDays: value })}
                            >
                              <SelectTrigger className="w-48">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1 day before</SelectItem>
                                <SelectItem value="3">3 days before</SelectItem>
                                <SelectItem value="7">1 week before</SelectItem>
                                <SelectItem value="14">2 weeks before</SelectItem>
                                <SelectItem value="30">1 month before</SelectItem>
                              </SelectContent>
                            </Select>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </GlassCard>

                  <GlassCard className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-pulse-elevated border border-pulse-border flex items-center justify-center">
                        <Globe className="w-6 h-6 text-pulse-text-secondary" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-pulse-text">Marketing</h2>
                        <p className="text-sm text-pulse-text-tertiary">Control marketing and promotional emails</p>
                      </div>
                    </div>

                    <SettingRow
                      icon={Bell}
                      title="Product Updates"
                      description="News about new features and improvements"
                      checked={notifications.marketingEmails}
                      onChange={() => setNotifications({ ...notifications, marketingEmails: !notifications.marketingEmails })}
                    />
                  </GlassCard>
                </motion.div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <motion.div
                  key="security"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <GlassCard className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-pulse-elevated border border-pulse-border flex items-center justify-center">
                        <Shield className="w-6 h-6 text-pulse-text-secondary" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-pulse-text">Password & Authentication</h2>
                        <p className="text-sm text-pulse-text-tertiary">Keep your account secure</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-pulse-surface/30 border border-pulse-border/50 hover:border-pulse-accent/30 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-pulse-accent/10 border border-pulse-accent/30 flex items-center justify-center">
                            <Key className="w-5 h-5 text-pulse-accent" />
                          </div>
                          <div>
                            <p className="font-medium text-pulse-text">Password</p>
                            <p className="text-sm text-pulse-text-tertiary">Last changed 30 days ago</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Change
                        </Button>
                      </div>

                      <div className="flex items-center justify-between p-4 rounded-xl bg-pulse-surface/30 border border-pulse-border/50 hover:border-pulse-accent/30 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-pulse-elevated border border-pulse-border flex items-center justify-center">
                            <Smartphone className="w-5 h-5 text-pulse-text-secondary" />
                          </div>
                          <div>
                            <p className="font-medium text-pulse-text">Two-Factor Authentication</p>
                            <p className="text-sm text-pulse-text-tertiary">Add an extra layer of security</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Enable
                        </Button>
                      </div>
                    </div>
                  </GlassCard>

                  <GlassCard className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-pulse-elevated border border-pulse-border flex items-center justify-center">
                        <Globe className="w-6 h-6 text-pulse-text-secondary" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-pulse-text">Sessions</h2>
                        <p className="text-sm text-pulse-text-tertiary">Manage your active sessions</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-pulse-surface/30 border border-pulse-border/50">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-pulse-accent/10 border border-pulse-accent/30 flex items-center justify-center">
                            <Globe className="w-5 h-5 text-pulse-accent" />
                          </div>
                          <div>
                            <p className="font-medium text-pulse-text">Current Session</p>
                            <p className="text-sm text-pulse-text-tertiary">Chrome on macOS · San Francisco, CA</p>
                          </div>
                        </div>
                        <Badge variant="success">Active</Badge>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="mt-4 text-pulse-text-tertiary hover:text-pulse-error">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out of All Devices
                    </Button>
                  </GlassCard>
                </motion.div>
              )}

              {/* Billing Tab */}
              {activeTab === 'billing' && (
                <motion.div
                  key="billing"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Current Plan */}
                  <GlassCard variant="accent" className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pulse-accent to-pulse-accent/50 flex items-center justify-center">
                          <Zap className="w-6 h-6 text-pulse-bg" />
                        </div>
                        <div>
                          <h2 className="text-lg font-semibold text-pulse-text">Starter Plan</h2>
                          <p className="text-sm text-pulse-text-tertiary">Free forever</p>
                        </div>
                      </div>
                      <Badge variant="outline">Current Plan</Badge>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                      <div className="p-4 rounded-xl bg-pulse-surface/30 border border-pulse-border/50 text-center">
                        <p className="text-2xl font-bold text-pulse-text">5</p>
                        <p className="text-sm text-pulse-text-tertiary">Saved Grants</p>
                      </div>
                      <div className="p-4 rounded-xl bg-pulse-surface/30 border border-pulse-border/50 text-center">
                        <p className="text-2xl font-bold text-pulse-text">3</p>
                        <p className="text-sm text-pulse-text-tertiary">Saved Searches</p>
                      </div>
                      <div className="p-4 rounded-xl bg-pulse-surface/30 border border-pulse-border/50 text-center">
                        <p className="text-2xl font-bold text-pulse-accent">Basic</p>
                        <p className="text-sm text-pulse-text-tertiary">AI Matching</p>
                      </div>
                    </div>

                    <Button className="w-full">
                      <Zap className="w-4 h-4 mr-2" />
                      Upgrade to Pro - $29/month
                    </Button>
                  </GlassCard>

                  {/* Pro Plan Features */}
                  <GlassCard className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-pulse-elevated border border-pulse-border flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-pulse-text-secondary" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-pulse-text">Pro Plan Features</h2>
                        <p className="text-sm text-pulse-text-tertiary">Everything in Starter, plus:</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3">
                      {[
                        'Unlimited saved grants',
                        'Unlimited saved searches',
                        'Advanced AI matching (99% accuracy)',
                        'Priority email support',
                        'Export to PDF/CSV',
                        'Team collaboration',
                        'API access',
                        'Custom grant alerts',
                      ].map((feature, i) => (
                        <motion.div
                          key={feature}
                          className="flex items-center gap-3 p-3 rounded-lg bg-pulse-surface/30 border border-pulse-border/50"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.03 * i }}
                        >
                          <div className="w-6 h-6 rounded-full bg-pulse-accent/20 border border-pulse-accent/30 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 text-pulse-accent" />
                          </div>
                          <span className="text-sm text-pulse-text">{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* Success Toast */}
      <AnimatePresence>
        {saved && (
          <motion.div
            className="fixed bottom-8 right-8 flex items-center gap-2 px-4 py-3 rounded-xl bg-pulse-accent text-pulse-bg font-medium shadow-lg shadow-pulse-accent/20"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={springs.snappy}
          >
            <Check className="w-5 h-5" />
            Changes saved successfully
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
