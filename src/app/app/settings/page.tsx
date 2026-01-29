'use client'

/**
 * SETTINGS PAGE - PREMIUM UPGRADE
 * --------------------------------
 * Premium settings with:
 * - Organization profile with AI match settings
 * - Enhanced notification preferences
 * - Subscription management
 * - Security settings
 * - GlassCard design throughout
 * - Onboarding profile management
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
  ChevronRight,
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

// Animated toggle switch
function AnimatedToggle({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: () => void
}) {
  return (
    <motion.button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors ${
        checked ? 'bg-pulse-accent' : 'bg-pulse-border'
      }`}
      whileTap={{ scale: 0.95 }}
    >
      <motion.span
        className="absolute top-1 w-4 h-4 rounded-full bg-white"
        animate={{ left: checked ? 24 : 4 }}
        transition={springs.snappy}
      />
    </motion.button>
  )
}

// Setting row component
function SettingRow({
  title,
  description,
  checked,
  onChange,
  index,
  hasBorder = true,
}: {
  title: string
  description: string
  checked: boolean
  onChange: () => void
  index: number
  hasBorder?: boolean
}) {
  return (
    <motion.div
      className={`flex items-center justify-between py-3 ${
        hasBorder ? 'border-t border-pulse-border/50' : ''
      }`}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 * index }}
    >
      <div>
        <p className="text-sm font-medium text-pulse-text">{title}</p>
        <p className="text-xs text-pulse-text-tertiary">{description}</p>
      </div>
      <AnimatedToggle checked={checked} onChange={onChange} />
    </motion.div>
  )
}

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    name: 'Sarah Johnson',
    email: 'sarah@acmeresearch.com',
    organization: 'Acme Research Labs',
    organizationType: 'small_business' as EntityType,
    location: 'CA',
    focusAreas: ['technology', 'research', 'business'],
  })

  // Onboarding profile state (simulated - in real app would come from DB)
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
    onboardingCompleted: true,
  })

  const [isEditingProfile, setIsEditingProfile] = useState(false)

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    weeklyDigest: true,
    newGrants: true,
    deadlineReminders: true,
    reminderDays: '7',
    aiRecommendations: true,
  })

  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    setIsSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 mb-2">
          <SettingsIcon className="w-5 h-5 text-pulse-accent" />
          <span className="text-pulse-text-tertiary font-mono text-micro uppercase tracking-wider">
            Account Settings
          </span>
        </div>
        <h1 className="font-serif text-display text-pulse-text">Settings</h1>
        <p className="text-pulse-text-secondary mt-2">
          Manage your profile, preferences, and AI matching settings
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Settings Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-pulse-accent/20 border border-pulse-accent/30 flex items-center justify-center">
                  <User className="w-5 h-5 text-pulse-accent" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-pulse-text">Profile</h2>
                  <p className="text-sm text-pulse-text-tertiary">Your personal information</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-pulse-text-tertiary uppercase tracking-wider mb-2 block">
                    Full Name
                  </label>
                  <Input
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    icon={<User className="w-4 h-4" />}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-pulse-text-tertiary uppercase tracking-wider mb-2 block">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    icon={<Mail className="w-4 h-4" />}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-pulse-text-tertiary uppercase tracking-wider mb-2 block">
                    Organization
                  </label>
                  <Input
                    value={profile.organization}
                    onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
                    icon={<Building2 className="w-4 h-4" />}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-pulse-text-tertiary uppercase tracking-wider mb-2 block">
                    Location
                  </label>
                  <Input
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    icon={<MapPin className="w-4 h-4" />}
                  />
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* AI Match Profile - Enhanced with Onboarding Data */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <GlassCard variant="accent" className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pulse-accent to-pulse-accent/50 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-pulse-bg" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-pulse-text">AI Match Profile</h2>
                    <p className="text-sm text-pulse-text-tertiary">Your personalized grant matching settings</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success" className="flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    Active
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    className="text-pulse-text-secondary hover:text-pulse-text"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Profile Summary */}
              <div className="space-y-4">
                {/* Entity Type & Location */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-pulse-surface/50 border border-pulse-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-pulse-accent" />
                      <span className="text-xs font-medium text-pulse-text-tertiary uppercase tracking-wider">Organization Type</span>
                    </div>
                    {isEditingProfile ? (
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
                    ) : (
                      <p className="text-sm font-medium text-pulse-text">
                        {ENTITY_TYPES.find(t => t.value === onboardingProfile.entityType)?.label}
                      </p>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-pulse-surface/50 border border-pulse-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-pulse-accent" />
                      <span className="text-xs font-medium text-pulse-text-tertiary uppercase tracking-wider">Location</span>
                    </div>
                    {isEditingProfile ? (
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
                    ) : (
                      <p className="text-sm font-medium text-pulse-text">
                        {US_STATES.find(s => s.value === onboardingProfile.state)?.label || 'Not set'}, US
                      </p>
                    )}
                  </div>
                </div>

                {/* Focus Areas */}
                <div>
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
                          className="px-3 py-1.5 rounded-lg bg-pulse-accent/20 border border-pulse-accent/30 text-sm text-pulse-accent"
                        >
                          {category?.label || tag}
                        </span>
                      )
                    })}
                    {isEditingProfile && (
                      <button className="px-3 py-1.5 rounded-lg bg-pulse-surface border border-pulse-border text-sm text-pulse-text-tertiary hover:border-pulse-accent/30 hover:text-pulse-text transition-all">
                        + Add more
                      </button>
                    )}
                  </div>
                </div>

                {/* Size & Stage */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-pulse-surface/50 border border-pulse-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-4 h-4 text-pulse-accent" />
                      <span className="text-xs font-medium text-pulse-text-tertiary uppercase tracking-wider">Team Size</span>
                    </div>
                    {isEditingProfile ? (
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
                    ) : (
                      <p className="text-sm font-medium text-pulse-text">
                        {SIZE_BANDS.find(s => s.value === onboardingProfile.sizeBand)?.label || 'Not set'}
                      </p>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-pulse-surface/50 border border-pulse-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Layers className="w-4 h-4 text-pulse-accent" />
                      <span className="text-xs font-medium text-pulse-text-tertiary uppercase tracking-wider">Stage</span>
                    </div>
                    {isEditingProfile ? (
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
                    ) : (
                      <p className="text-sm font-medium text-pulse-text">
                        {STAGES.find(s => s.value === onboardingProfile.stage)?.label || 'Not set'}
                      </p>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-pulse-surface/50 border border-pulse-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-pulse-accent" />
                      <span className="text-xs font-medium text-pulse-text-tertiary uppercase tracking-wider">Budget</span>
                    </div>
                    {isEditingProfile ? (
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
                    ) : (
                      <p className="text-sm font-medium text-pulse-text">
                        {BUDGET_RANGES.find(b => b.value === onboardingProfile.annualBudget)?.label || 'Not set'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Grant Preferences */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-pulse-surface/50 border border-pulse-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="w-4 h-4 text-pulse-accent" />
                      <span className="text-xs font-medium text-pulse-text-tertiary uppercase tracking-wider">Preferred Grant Size</span>
                    </div>
                    {isEditingProfile ? (
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
                    ) : (
                      <p className="text-sm font-medium text-pulse-text">
                        {GRANT_SIZE_PREFERENCES.find(p => p.value === onboardingProfile.grantPreferences.preferredSize)?.label || 'Any size'}
                      </p>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-pulse-surface/50 border border-pulse-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-pulse-accent" />
                      <span className="text-xs font-medium text-pulse-text-tertiary uppercase tracking-wider">Funding Timeline</span>
                    </div>
                    {isEditingProfile ? (
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
                    ) : (
                      <p className="text-sm font-medium text-pulse-text">
                        {TIMELINE_PREFERENCES.find(p => p.value === onboardingProfile.grantPreferences.timeline)?.label || 'Flexible'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Profile Completeness & Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-pulse-border/50">
                  <div>
                    <p className="text-sm font-medium text-pulse-text">Profile Completeness</p>
                    <p className="text-xs text-pulse-text-tertiary">Complete profile for better matches</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-pulse-border rounded-full overflow-hidden">
                        <div className="w-[90%] h-full bg-pulse-accent rounded-full" />
                      </div>
                      <span className="text-sm font-medium text-pulse-accent">90%</span>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/onboarding/step-1">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Retake Setup
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Notifications Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-pulse-accent/20 border border-pulse-accent/30 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-pulse-accent" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-pulse-text">Notifications</h2>
                  <p className="text-sm text-pulse-text-tertiary">Configure how you receive updates</p>
                </div>
              </div>

              <div className="space-y-1">
                <SettingRow
                  title="Email Alerts"
                  description="Receive alerts for new matching grants"
                  checked={notifications.emailAlerts}
                  onChange={() => setNotifications({ ...notifications, emailAlerts: !notifications.emailAlerts })}
                  index={0}
                  hasBorder={false}
                />

                <SettingRow
                  title="Weekly Digest"
                  description="Summary of new grants and updates"
                  checked={notifications.weeklyDigest}
                  onChange={() => setNotifications({ ...notifications, weeklyDigest: !notifications.weeklyDigest })}
                  index={1}
                />

                <SettingRow
                  title="AI Recommendations"
                  description="Get personalized grant suggestions"
                  checked={notifications.aiRecommendations}
                  onChange={() => setNotifications({ ...notifications, aiRecommendations: !notifications.aiRecommendations })}
                  index={2}
                />

                <SettingRow
                  title="Deadline Reminders"
                  description="Reminders before saved grant deadlines"
                  checked={notifications.deadlineReminders}
                  onChange={() => setNotifications({ ...notifications, deadlineReminders: !notifications.deadlineReminders })}
                  index={3}
                />

                <AnimatePresence>
                  {notifications.deadlineReminders && (
                    <motion.div
                      className="pt-4 mt-2 border-t border-pulse-border/50"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <label className="text-xs font-medium text-pulse-text-tertiary uppercase tracking-wider mb-2 block">
                        Remind me before deadline
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
          </motion.div>

          {/* Security Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-pulse-accent/20 border border-pulse-accent/30 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-pulse-accent" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-pulse-text">Security</h2>
                  <p className="text-sm text-pulse-text-tertiary">Manage your account security</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-pulse-text">Password</p>
                    <p className="text-xs text-pulse-text-tertiary">Last changed 30 days ago</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Change Password
                  </Button>
                </div>
                <div className="flex items-center justify-between py-3 border-t border-pulse-border/50">
                  <div>
                    <p className="text-sm font-medium text-pulse-text">Two-Factor Authentication</p>
                    <p className="text-xs text-pulse-text-tertiary">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Enable
                  </Button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Subscription Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-pulse-accent/20 border border-pulse-accent/30 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-pulse-accent" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-pulse-text">Subscription</h2>
                  <p className="text-sm text-pulse-text-tertiary">Your current plan</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-pulse-accent/10 to-pulse-accent/5 border border-pulse-accent/30 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-lg font-semibold text-pulse-text">Starter Plan</span>
                  <Badge variant="outline">Free</Badge>
                </div>
                <ul className="space-y-2 text-sm text-pulse-text-secondary">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-pulse-accent" />
                    5 saved grants
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-pulse-accent" />
                    3 saved searches
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-pulse-accent" />
                    Basic AI matching
                  </li>
                </ul>
              </div>

              <Button className="w-full">
                <Zap className="w-4 h-4 mr-2" />
                Upgrade to Pro
              </Button>
            </GlassCard>
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
          >
            <GlassCard className="p-6">
              <h3 className="text-sm font-medium text-pulse-text-secondary mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-pulse-surface transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-pulse-text-tertiary" />
                    <span className="text-sm text-pulse-text">Export Data</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-pulse-text-tertiary" />
                </button>
                <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-pulse-surface transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-pulse-text-tertiary" />
                    <span className="text-sm text-pulse-text">Connected Apps</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-pulse-text-tertiary" />
                </button>
                <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-pulse-surface transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <LogOut className="w-4 h-4 text-pulse-text-tertiary" />
                    <span className="text-sm text-pulse-text">Sign Out</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-pulse-text-tertiary" />
                </button>
              </div>
            </GlassCard>
          </motion.div>

          {/* Danger Zone */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard className="p-6 border-pulse-error/20">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 text-pulse-error" />
                <h3 className="text-sm font-medium text-pulse-error">Danger Zone</h3>
              </div>
              <p className="text-xs text-pulse-text-tertiary mb-4">
                Permanently delete your account and all associated data.
              </p>
              <Button variant="destructive" size="sm" className="w-full">
                Delete Account
              </Button>
            </GlassCard>
          </motion.div>
        </div>
      </div>

      {/* Floating Save Button */}
      <motion.div
        className="fixed bottom-8 right-8 flex items-center gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <AnimatePresence>
          {saved && (
            <motion.span
              className="flex items-center gap-1 text-sm text-pulse-accent bg-pulse-accent/10 px-3 py-2 rounded-lg"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={springs.snappy}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={springs.bouncy}
              >
                <Check className="w-4 h-4" />
              </motion.div>
              Changes saved
            </motion.span>
          )}
        </AnimatePresence>
        <Button onClick={handleSave} disabled={isSaving} size="lg" className="shadow-lg shadow-pulse-accent/20">
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </motion.div>
    </div>
  )
}
