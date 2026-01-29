'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Bell, Shield, CreditCard, LogOut, Check, Mail, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { springs } from '@/lib/motion/animations'

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
      className={`flex items-center justify-between py-2 ${
        hasBorder ? 'border-t border-pulse-border' : ''
      }`}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 * index }}
    >
      <div>
        <p className="text-sm text-pulse-text">{title}</p>
        <p className="text-xs text-pulse-text-tertiary">{description}</p>
      </div>
      <AnimatedToggle checked={checked} onChange={onChange} />
    </motion.div>
  )
}

// Section card component
function SettingsSection({
  icon: Icon,
  title,
  description,
  children,
  index,
  className = '',
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  children: React.ReactNode
  index: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.15 + index * 0.1,
        type: 'spring',
        stiffness: 300,
        damping: 24,
      }}
    >
      <Card  className={className}>
        <CardHeader>
          <div className="flex items-center gap-3">
            <motion.div
              className="w-10 h-10 rounded-lg bg-pulse-accent/10 flex items-center justify-center"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={springs.snappy}
            >
              <Icon className="w-5 h-5 text-pulse-accent" />
            </motion.div>
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </motion.div>
  )
}

export default function SettingsPage() {
  const [profile, setProfile] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    organization: 'Acme Research Labs',
  })

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    weeklyDigest: true,
    newGrants: true,
    deadlineReminders: true,
    reminderDays: '7',
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
    <div className="p-8 max-w-3xl">
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <motion.h1
          className="font-serif text-heading-lg text-pulse-text mb-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          Settings
        </motion.h1>
        <motion.p
          className="text-body-sm text-pulse-text-secondary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          Manage your account preferences and notifications
        </motion.p>
      </motion.div>

      <div className="space-y-6">
        {/* Profile Section */}
        <SettingsSection
          icon={User}
          title="Profile"
          description="Your personal information"
          index={0}
        >
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div>
              <label className="text-sm text-pulse-text-secondary mb-2 block">
                Full Name
              </label>
              <Input
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                icon={<User className="w-4 h-4" />}
              />
            </div>
            <div>
              <label className="text-sm text-pulse-text-secondary mb-2 block">
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
              <label className="text-sm text-pulse-text-secondary mb-2 block">
                Organization
              </label>
              <Input
                value={profile.organization}
                onChange={(e) => setProfile({ ...profile, organization: e.target.value })}
                icon={<Building2 className="w-4 h-4" />}
              />
            </div>
          </motion.div>
        </SettingsSection>

        {/* Notifications Section */}
        <SettingsSection
          icon={Bell}
          title="Notifications"
          description="Configure how you receive updates"
          index={1}
        >
          <div className="space-y-4">
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
              title="New Grant Notifications"
              description="Get notified when new grants match your searches"
              checked={notifications.newGrants}
              onChange={() => setNotifications({ ...notifications, newGrants: !notifications.newGrants })}
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
                  className="pt-2 border-t border-pulse-border"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <label className="text-sm text-pulse-text-secondary mb-2 block">
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
        </SettingsSection>

        {/* Subscription Section */}
        <SettingsSection
          icon={CreditCard}
          title="Subscription"
          description="Manage your plan and billing"
          index={2}
        >
          <motion.div
            className="flex items-center justify-between p-4 rounded-lg bg-pulse-surface/50 border border-pulse-border"
            whileHover={{ borderColor: 'rgba(64, 255, 170, 0.2)' }}
            transition={{ duration: 0.2 }}
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium text-pulse-text">Starter Plan</p>
                <Badge variant="outline">Free</Badge>
              </div>
              <p className="text-xs text-pulse-text-tertiary">
                5 saved grants, 3 saved searches
              </p>
            </div>
            <Button variant="outline" size="sm">
              Upgrade
            </Button>
          </motion.div>
        </SettingsSection>

        {/* Security Section */}
        <SettingsSection
          icon={Shield}
          title="Security"
          description="Manage your account security"
          index={3}
        >
          <div className="space-y-4">
            <motion.div
              className="flex items-center justify-between"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div>
                <p className="text-sm text-pulse-text">Password</p>
                <p className="text-xs text-pulse-text-tertiary">
                  Last changed 30 days ago
                </p>
              </div>
              <Button variant="outline" size="sm">
                Change Password
              </Button>
            </motion.div>
            <motion.div
              className="flex items-center justify-between pt-4 border-t border-pulse-border"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div>
                <p className="text-sm text-pulse-text">Two-Factor Authentication</p>
                <p className="text-xs text-pulse-text-tertiary">
                  Add an extra layer of security
                </p>
              </div>
              <Button variant="outline" size="sm">
                Enable
              </Button>
            </motion.div>
          </div>
        </SettingsSection>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.55,
            type: 'spring',
            stiffness: 300,
            damping: 24,
          }}
        >
          <Card  className="border-pulse-error/20">
            <CardHeader>
              <CardTitle className="text-pulse-error">Danger Zone</CardTitle>
              <CardDescription>Irreversible account actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-pulse-text">Delete Account</p>
                  <p className="text-xs text-pulse-text-tertiary">
                    Permanently delete your account and all data
                  </p>
                </div>
                <Button variant="destructive" size="sm">
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Save Button */}
        <motion.div
          className="flex items-center justify-end gap-3 pt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <AnimatePresence>
            {saved && (
              <motion.span
                className="flex items-center gap-1 text-sm text-pulse-accent"
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
                Saved
              </motion.span>
            )}
          </AnimatePresence>
          <Button onClick={handleSave} loading={isSaving}>
            Save Changes
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
