'use client'

/**
 * SETTINGS PAGE - PRODUCTION-READY
 * ---------------------------------
 * Real API integration with:
 * - Tab-based navigation
 * - Ambient gradient backgrounds
 * - Glass morphism cards
 * - Loading/error states
 * - Toast notifications
 * - Persisted profile changes
 */

import React, { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { signOut } from 'next-auth/react'
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
  X,
  Plus,
  Loader2,
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
import { useToastActions } from '@/components/ui/toast-provider'
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
const InfoCard = React.forwardRef<
  HTMLDivElement,
  {
    icon: React.ElementType
    label: string
    value?: string
    isEditing?: boolean
    isHighlighted?: boolean
    children?: React.ReactNode
  }
>(function InfoCard({ icon: Icon, label, value, isEditing, isHighlighted, children }, ref) {
  return (
    <div
      ref={ref}
      className={`p-4 rounded-xl bg-white/[0.02] border transition-all group ${
        isHighlighted
          ? 'border-pulse-accent ring-2 ring-pulse-accent/30 animate-pulse'
          : 'border-white/[0.06] hover:border-pulse-accent/20'
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-4 h-4 ${isHighlighted ? 'text-pulse-accent' : 'text-pulse-accent'}`} />
        <span className="text-xs font-medium text-pulse-text-tertiary uppercase tracking-wider">{label}</span>
        {isHighlighted && (
          <span className="ml-auto text-xs bg-pulse-accent/20 text-pulse-accent px-2 py-0.5 rounded-full">
            Update this
          </span>
        )}
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
})

// Loading skeleton
function SettingsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="animate-pulse">
        <div className="h-48 bg-pulse-surface rounded-xl" />
      </div>
      <div className="animate-pulse">
        <div className="h-64 bg-pulse-surface rounded-xl" />
      </div>
    </div>
  )
}

function SettingsPageContent() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState('profile')
  const [highlightedField, setHighlightedField] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { success, error: showError } = useToastActions()

  // Refs for scrolling to specific fields
  const fieldRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // Handle URL parameters for tab and highlight
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    const highlightParam = searchParams.get('highlight')

    if (tabParam && tabs.some(t => t.id === tabParam)) {
      setActiveTab(tabParam)
    }

    if (highlightParam) {
      setHighlightedField(highlightParam)
      // Auto-enable editing mode when navigating to a specific field
      if (tabParam === 'matching') {
        setIsEditingMatching(true)
      }
      // Clear highlight after animation
      const timer = setTimeout(() => {
        setHighlightedField(null)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [searchParams])

  // Scroll to highlighted field when it becomes available
  useEffect(() => {
    if (highlightedField && fieldRefs.current[highlightedField] && !isLoading) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        fieldRefs.current[highlightedField]?.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        })
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [highlightedField, isLoading, activeTab])

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    organization: '',
    location: '',
    createdAt: '',
  })

  const [onboardingProfile, setOnboardingProfile] = useState({
    entityType: '' as EntityType | '',
    state: '',
    industryTags: [] as string[],
    sizeBand: '' as SizeBand | '',
    stage: '' as Stage | '',
    annualBudget: '' as BudgetRange | '',
    onboardingCompleted: false,
    confidenceScore: 0,
    grantPreferences: {
      preferredSize: '' as GrantSizePreference | '',
      timeline: '' as TimelinePreference | '',
    },
  })

  const [notifications, setNotifications] = useState({
    emailEnabled: true,
    grantAlerts: true,
    weeklyDigest: true,
    deadlineReminders: true,
    deadlineReminderDays: 7,
    aiRecommendations: true,
  })

  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isEditingMatching, setIsEditingMatching] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  // Fetch user profile on mount
  const fetchProfile = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [profileRes, notifRes] = await Promise.all([
        fetch('/api/user/profile'),
        fetch('/api/user/notification-preferences'),
      ])

      if (!profileRes.ok) throw new Error('Failed to load profile')

      const profileData = await profileRes.json()

      if (profileData.user) {
        setProfile({
          name: profileData.user.name || '',
          email: profileData.user.email || '',
          organization: profileData.user.organization || '',
          location: profileData.profile?.state || '',
          createdAt: profileData.user.createdAt || '',
        })
      }

      if (profileData.profile) {
        const p = profileData.profile
        setOnboardingProfile({
          entityType: p.entityType || '',
          state: p.state || '',
          industryTags: Array.isArray(p.industryTags) ? p.industryTags : [],
          sizeBand: p.sizeBand || '',
          stage: p.stage || '',
          annualBudget: p.annualBudget || '',
          onboardingCompleted: p.onboardingCompleted || false,
          confidenceScore: p.confidenceScore || 0,
          grantPreferences: p.grantPreferences || {
            preferredSize: '',
            timeline: '',
          },
        })
      }

      if (notifRes.ok) {
        const notifData = await notifRes.json()
        if (notifData.preferences) {
          setNotifications({
            emailEnabled: notifData.preferences.emailEnabled ?? true,
            grantAlerts: notifData.preferences.grantAlerts ?? true,
            weeklyDigest: notifData.preferences.weeklyDigest ?? true,
            deadlineReminders: notifData.preferences.deadlineReminders ?? true,
            deadlineReminderDays: notifData.preferences.deadlineReminderDays ?? 7,
            aiRecommendations: notifData.preferences.aiRecommendations ?? true,
          })
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  // Save profile changes
  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organization: profile.organization,
        }),
      })

      if (!response.ok) throw new Error('Failed to save profile')

      success('Profile updated', 'Your changes have been saved')
      setIsEditingProfile(false)
    } catch (err) {
      showError('Failed to save', err instanceof Error ? err.message : 'Please try again')
    } finally {
      setIsSaving(false)
    }
  }

  // Save matching profile changes
  const handleSaveMatching = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityType: onboardingProfile.entityType || undefined,
          state: onboardingProfile.state || undefined,
          industryTags: onboardingProfile.industryTags,
          sizeBand: onboardingProfile.sizeBand || undefined,
          stage: onboardingProfile.stage || undefined,
          annualBudget: onboardingProfile.annualBudget || undefined,
          grantPreferences: onboardingProfile.grantPreferences,
        }),
      })

      if (!response.ok) throw new Error('Failed to save profile')

      // Update the confidence score from the response
      const data = await response.json()
      if (data.profile?.confidenceScore !== undefined) {
        setOnboardingProfile(prev => ({
          ...prev,
          confidenceScore: data.profile.confidenceScore,
        }))
      }

      success('Matching profile updated', 'Your AI matching preferences have been saved')
      setIsEditingMatching(false)
    } catch (err) {
      showError('Failed to save', err instanceof Error ? err.message : 'Please try again')
    } finally {
      setIsSaving(false)
    }
  }

  // Save notification preferences
  const handleSaveNotifications = async (updates: Partial<typeof notifications>) => {
    try {
      const response = await fetch('/api/user/notification-preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!response.ok) throw new Error('Failed to save preferences')

      setNotifications((prev) => ({ ...prev, ...updates }))
    } catch (err) {
      showError('Failed to save', err instanceof Error ? err.message : 'Please try again')
    }
  }

  // Handle sign out
  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut({ callbackUrl: '/login' })
    } catch {
      showError('Sign out failed', 'Please try again')
      setIsSigningOut(false)
    }
  }

  // Format date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Unknown'
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  // Get initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
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
          <h1 className="text-4xl font-bold text-pulse-text mb-2">Settings</h1>
          <p className="text-pulse-text-secondary">
            Manage your profile, AI matching preferences, and account settings
          </p>
        </motion.div>

        {isLoading ? (
          <SettingsSkeleton />
        ) : error ? (
          <GlassCard className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-pulse-error mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-pulse-text mb-2">Failed to load settings</h2>
            <p className="text-pulse-text-secondary mb-4">{error}</p>
            <Button onClick={fetchProfile}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </GlassCard>
        ) : (
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
                      {getInitials(profile.name || 'U')}
                    </div>
                    <h3 className="text-lg font-semibold text-pulse-text">{profile.name || 'User'}</h3>
                    <p className="text-sm text-pulse-text-tertiary">{profile.organization || 'No organization'}</p>
                    {onboardingProfile.onboardingCompleted && (
                      <Badge variant="success" className="mt-2">Profile Complete</Badge>
                    )}
                  </div>
                  <div className="space-y-3 pt-4 border-t border-pulse-border/50">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-pulse-text-tertiary">Member since</span>
                      <span className="text-pulse-text font-medium">{formatDate(profile.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-pulse-text-tertiary">Plan</span>
                      <span className="text-pulse-accent font-medium">Starter</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-pulse-text-tertiary">Match confidence</span>
                      <span className="text-pulse-text font-medium">
                        {Math.round(onboardingProfile.confidenceScore * 100)}%
                      </span>
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
                    <Link
                      href="/api/export/grants?format=csv&type=saved"
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-pulse-text-secondary hover:text-pulse-text hover:bg-pulse-surface/50 transition-all text-left group"
                    >
                      <Download className="w-4 h-4 group-hover:text-pulse-accent transition-colors" />
                      <span className="text-sm">Export Data</span>
                      <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                    <a
                      href="https://grantsby.ai/help"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-pulse-text-secondary hover:text-pulse-text hover:bg-pulse-surface/50 transition-all text-left group"
                    >
                      <HelpCircle className="w-4 h-4 group-hover:text-pulse-accent transition-colors" />
                      <span className="text-sm">Help Center</span>
                      <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                    </a>
                    <button
                      onClick={handleSignOut}
                      disabled={isSigningOut}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-pulse-text-secondary hover:text-pulse-error hover:bg-pulse-error/5 transition-all text-left group disabled:opacity-50"
                    >
                      {isSigningOut ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <LogOut className="w-4 h-4" />
                      )}
                      <span className="text-sm">{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
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
                          {isEditingProfile ? 'Cancel' : 'Edit'}
                        </Button>
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
                            disabled={true}
                            className="bg-pulse-surface/50"
                          />
                          <p className="text-xs text-pulse-text-tertiary mt-1">Name cannot be changed</p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-pulse-text-tertiary uppercase tracking-wider mb-2 block flex items-center gap-1.5">
                            <Mail className="w-3 h-3" />
                            Email Address
                          </label>
                          <Input
                            type="email"
                            value={profile.email}
                            disabled={true}
                            className="bg-pulse-surface/50"
                          />
                          <p className="text-xs text-pulse-text-tertiary mt-1">Email cannot be changed</p>
                        </div>
                        <div className="md:col-span-2">
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
                            <Button onClick={handleSaveProfile} disabled={isSaving}>
                              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                              {isSaving ? 'Saving...' : 'Save Changes'}
                            </Button>
                          </motion.div>
                        )}
                      </AnimatePresence>
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
                            {Math.round(onboardingProfile.confidenceScore * 100)}% Complete
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
                          ref={(el) => { fieldRefs.current['entityType'] = el }}
                          icon={User}
                          label="Organization Type"
                          value={ENTITY_TYPES.find(t => t.value === onboardingProfile.entityType)?.label}
                          isEditing={isEditingMatching}
                          isHighlighted={highlightedField === 'entityType'}
                        >
                          <Select
                            value={onboardingProfile.entityType || '__none__'}
                            onValueChange={(value) => setOnboardingProfile({ ...onboardingProfile, entityType: value === '__none__' ? '' : value as EntityType })}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none__">Not set</SelectItem>
                              {ENTITY_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </InfoCard>

                        <InfoCard
                          ref={(el) => { fieldRefs.current['state'] = el }}
                          icon={MapPin}
                          label="Location"
                          value={`${US_STATES.find(s => s.value === onboardingProfile.state)?.label || 'Not set'}, US`}
                          isEditing={isEditingMatching}
                          isHighlighted={highlightedField === 'state'}
                        >
                          <Select
                            value={onboardingProfile.state || '__none__'}
                            onValueChange={(value) => setOnboardingProfile({ ...onboardingProfile, state: value === '__none__' ? '' : value })}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                            <SelectContent className="max-h-[200px]">
                              <SelectItem value="__none__">Not set</SelectItem>
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
                      <div
                        ref={(el) => { fieldRefs.current['industryTags'] = el }}
                        className={`mb-6 p-4 -m-4 rounded-xl transition-all ${
                          highlightedField === 'industryTags'
                            ? 'ring-2 ring-pulse-accent/30 bg-pulse-accent/5'
                            : ''
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <Target className="w-4 h-4 text-pulse-accent" />
                          <span className="text-xs font-medium text-pulse-text-tertiary uppercase tracking-wider">Focus Areas</span>
                          {highlightedField === 'industryTags' && (
                            <span className="ml-auto text-xs bg-pulse-accent/20 text-pulse-accent px-2 py-0.5 rounded-full">
                              Update this
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {onboardingProfile.industryTags.map((tag) => {
                            const category = INDUSTRY_CATEGORIES.find(c => c.value === tag)
                            return (
                              <motion.button
                                key={tag}
                                onClick={() => {
                                  if (isEditingMatching) {
                                    setOnboardingProfile({
                                      ...onboardingProfile,
                                      industryTags: onboardingProfile.industryTags.filter(t => t !== tag)
                                    })
                                  }
                                }}
                                className={`px-3 py-1.5 rounded-lg bg-pulse-accent/10 border border-pulse-accent/20 text-sm text-pulse-accent flex items-center gap-1.5 ${
                                  isEditingMatching ? 'hover:bg-pulse-error/10 hover:border-pulse-error/30 hover:text-pulse-error cursor-pointer' : ''
                                }`}
                                whileHover={isEditingMatching ? { scale: 0.98 } : {}}
                                whileTap={isEditingMatching ? { scale: 0.95 } : {}}
                              >
                                {category?.label || tag}
                                {isEditingMatching && <X className="w-3 h-3" />}
                              </motion.button>
                            )
                          })}
                          {onboardingProfile.industryTags.length === 0 && !isEditingMatching && (
                            <span className="text-sm text-pulse-text-tertiary">No focus areas selected</span>
                          )}
                          {isEditingMatching && (
                            <Select
                              value=""
                              onValueChange={(value) => {
                                if (value && !onboardingProfile.industryTags.includes(value)) {
                                  setOnboardingProfile({
                                    ...onboardingProfile,
                                    industryTags: [...onboardingProfile.industryTags, value]
                                  })
                                }
                              }}
                            >
                              <SelectTrigger className="w-auto h-auto px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-pulse-text-tertiary hover:border-pulse-accent/30 hover:text-pulse-text transition-all">
                                <Plus className="w-3 h-3 mr-1" />
                                Add more
                              </SelectTrigger>
                              <SelectContent>
                                {INDUSTRY_CATEGORIES.filter(c => !onboardingProfile.industryTags.includes(c.value)).map((category) => (
                                  <SelectItem key={category.value} value={category.value}>
                                    {category.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </div>

                      {/* Size & Stage Grid */}
                      <div className="grid md:grid-cols-3 gap-4 mb-6">
                        <InfoCard
                          ref={(el) => { fieldRefs.current['sizeBand'] = el }}
                          icon={Users}
                          label="Team Size"
                          value={SIZE_BANDS.find(s => s.value === onboardingProfile.sizeBand)?.label}
                          isEditing={isEditingMatching}
                          isHighlighted={highlightedField === 'sizeBand'}
                        >
                          <Select
                            value={onboardingProfile.sizeBand || '__none__'}
                            onValueChange={(value) => setOnboardingProfile({ ...onboardingProfile, sizeBand: value === '__none__' ? '' : value as SizeBand })}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none__">Not set</SelectItem>
                              {SIZE_BANDS.map((size) => (
                                <SelectItem key={size.value} value={size.value}>
                                  {size.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </InfoCard>

                        <InfoCard
                          ref={(el) => { fieldRefs.current['stage'] = el }}
                          icon={Layers}
                          label="Stage"
                          value={STAGES.find(s => s.value === onboardingProfile.stage)?.label}
                          isEditing={isEditingMatching}
                          isHighlighted={highlightedField === 'stage'}
                        >
                          <Select
                            value={onboardingProfile.stage || '__none__'}
                            onValueChange={(value) => setOnboardingProfile({ ...onboardingProfile, stage: value === '__none__' ? '' : value as Stage })}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Select stage" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none__">Not set</SelectItem>
                              {STAGES.map((stage) => (
                                <SelectItem key={stage.value} value={stage.value}>
                                  {stage.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </InfoCard>

                        <InfoCard
                          ref={(el) => { fieldRefs.current['annualBudget'] = el }}
                          icon={DollarSign}
                          label="Annual Budget"
                          value={BUDGET_RANGES.find(b => b.value === onboardingProfile.annualBudget)?.label}
                          isEditing={isEditingMatching}
                          isHighlighted={highlightedField === 'annualBudget'}
                        >
                          <Select
                            value={onboardingProfile.annualBudget || '__none__'}
                            onValueChange={(value) => setOnboardingProfile({ ...onboardingProfile, annualBudget: value === '__none__' ? '' : value as BudgetRange })}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Select budget" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none__">Not set</SelectItem>
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
                            value={onboardingProfile.grantPreferences.preferredSize || '__none__'}
                            onValueChange={(value) => setOnboardingProfile({
                              ...onboardingProfile,
                              grantPreferences: { ...onboardingProfile.grantPreferences, preferredSize: value === '__none__' ? '' : value as GrantSizePreference }
                            })}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Select size" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none__">Not set</SelectItem>
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
                            value={onboardingProfile.grantPreferences.timeline || '__none__'}
                            onValueChange={(value) => setOnboardingProfile({
                              ...onboardingProfile,
                              grantPreferences: { ...onboardingProfile.grantPreferences, timeline: value === '__none__' ? '' : value as TimelinePreference }
                            })}
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="Select timeline" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none__">Not set</SelectItem>
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
                          <span className="text-sm font-semibold text-pulse-accent">
                            {Math.round(onboardingProfile.confidenceScore * 100)}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-pulse-border rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-pulse-accent to-pulse-accent/70 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${onboardingProfile.confidenceScore * 100}%` }}
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
                          <Button onClick={handleSaveMatching} disabled={isSaving}>
                            {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
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
                          <p className="text-sm text-pulse-text-tertiary">Control what emails you receive from Grants By AI</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <SettingRow
                          icon={Mail}
                          title="Grant Alerts"
                          description="Get notified when new grants match your profile"
                          checked={notifications.grantAlerts}
                          onChange={() => {
                            const newValue = !notifications.grantAlerts
                            handleSaveNotifications({ grantAlerts: newValue })
                          }}
                        />

                        <SettingRow
                          icon={FileText}
                          title="Weekly Digest"
                          description="Receive a weekly summary of new opportunities"
                          checked={notifications.weeklyDigest}
                          onChange={() => {
                            const newValue = !notifications.weeklyDigest
                            handleSaveNotifications({ weeklyDigest: newValue })
                          }}
                        />

                        <SettingRow
                          icon={Sparkles}
                          title="AI Recommendations"
                          description="Get personalized grant suggestions from our AI"
                          checked={notifications.aiRecommendations}
                          onChange={() => {
                            const newValue = !notifications.aiRecommendations
                            handleSaveNotifications({ aiRecommendations: newValue })
                          }}
                        />

                        <SettingRow
                          icon={Clock}
                          title="Deadline Reminders"
                          description="Get reminded before saved grant deadlines"
                          checked={notifications.deadlineReminders}
                          onChange={() => {
                            const newValue = !notifications.deadlineReminders
                            handleSaveNotifications({ deadlineReminders: newValue })
                          }}
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
                                value={String(notifications.deadlineReminderDays)}
                                onValueChange={(value) => {
                                  handleSaveNotifications({ deadlineReminderDays: parseInt(value) })
                                }}
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
                              <p className="text-sm text-pulse-text-tertiary">Change your password</p>
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

                    <GlassCard className="p-6 border-pulse-error/20">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-pulse-error/10 border border-pulse-error/20 flex items-center justify-center">
                            <AlertCircle className="w-4 h-4 text-pulse-error" />
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-pulse-text">Delete Account</h3>
                            <p className="text-xs text-pulse-text-tertiary">Permanently remove your account and all data</p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-pulse-error hover:bg-pulse-error/10 text-xs">
                          <Trash2 className="w-3 h-3 mr-1.5" />
                          Delete
                        </Button>
                      </div>
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
                          <p className="text-2xl font-bold text-pulse-text">Unlimited</p>
                          <p className="text-sm text-pulse-text-tertiary">Saved Grants</p>
                        </div>
                        <div className="p-4 rounded-xl bg-pulse-surface/30 border border-pulse-border/50 text-center">
                          <p className="text-2xl font-bold text-pulse-text">Unlimited</p>
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
        )}
      </div>
    </div>
  )
}

// Loading fallback for Suspense
function SettingsLoading() {
  return (
    <div className="min-h-screen relative p-8 max-w-6xl mx-auto">
      <div className="animate-pulse">
        <div className="h-10 bg-pulse-surface rounded w-1/4 mb-4" />
        <div className="h-6 bg-pulse-surface rounded w-1/2 mb-8" />
        <div className="flex gap-8">
          <div className="w-72 h-96 bg-pulse-surface rounded-xl" />
          <div className="flex-1 h-96 bg-pulse-surface rounded-xl" />
        </div>
      </div>
    </div>
  )
}

// Wrapper with Suspense boundary for useSearchParams
export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsLoading />}>
      <SettingsPageContent />
    </Suspense>
  )
}
