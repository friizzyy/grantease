'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Bookmark,
  FolderOpen,
  Bell,
  Settings,
  LayoutDashboard,
  LogOut,
  Shield,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { springs } from '@/lib/motion/animations'
import { AnimatedLogo } from '@/components/ui/animated-logo'
import { BrandLogo } from '@/components/ui/brand-logo'

const mainNav = [
  { label: 'Dashboard', href: '/app', icon: LayoutDashboard },
  { label: 'Discover Grants', href: '/app/discover', icon: Search },
  { label: 'Saved Grants', href: '/app/saved', icon: Bookmark },
  { label: 'Workspaces', href: '/app/workspace', icon: FolderOpen },
  { label: 'Saved Searches', href: '/app/searches', icon: Bell },
]

const settingsNav = [
  { label: 'Settings', href: '/app/settings', icon: Settings },
]

interface AppSidebarProps {
  isAdmin?: boolean
}

export function AppSidebar({ isAdmin = false }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut({ redirect: false })
      router.push('/login')
    } catch (error) {
      console.error('Sign out error:', error)
      setIsSigningOut(false)
    }
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-52 bg-pulse-surface/50 border-r border-pulse-border backdrop-blur-sm z-40">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-pulse-border">
          <Link href="/app" className="flex items-center gap-2.5 group">
            <AnimatedLogo className="text-pulse-accent" />
            <BrandLogo size="lg" />
          </Link>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 p-4 space-y-1 relative" aria-label="Main navigation">
          {mainNav.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/app' && pathname?.startsWith(item.href))
            const Icon = item.icon

            return (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={Icon}
                isActive={isActive}
              />
            )
          })}

          {/* Admin Section */}
          {isAdmin && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-4 mt-4 border-t border-pulse-border"
            >
              <p className="px-3 py-2 text-micro uppercase tracking-wider text-pulse-text-tertiary font-mono">
                Admin
              </p>
              <NavItem
                href="/admin/ingestion"
                label="Ingestion"
                icon={Shield}
                isActive={pathname?.startsWith('/admin') || false}
              />
            </motion.div>
          )}
        </nav>

        {/* Settings */}
        <div className="p-4 border-t border-pulse-border space-y-1">
          {settingsNav.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={Icon}
                isActive={isActive}
              />
            )
          })}

          <motion.button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-pulse-text-secondary hover:text-pulse-error hover:bg-pulse-error/10 transition-all duration-200 w-full relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={isSigningOut ? {} : { x: 2 }}
            whileTap={isSigningOut ? {} : { scale: 0.98 }}
            aria-label="Sign out of your account"
          >
            {isSigningOut ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <LogOut className="w-4 h-4" aria-hidden="true" />
            )}
            {isSigningOut ? 'Signing out...' : 'Sign Out'}
          </motion.button>
        </div>
      </div>
    </aside>
  )
}

interface NavItemProps {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  isActive: boolean
}

function NavItem({ href, label, icon: Icon, isActive }: NavItemProps) {
  return (
    <Link href={href} className="block relative" aria-current={isActive ? 'page' : undefined}>
      <motion.div
        className={cn(
          'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 relative',
          isActive
            ? 'text-pulse-accent'
            : 'text-pulse-text-secondary hover:text-pulse-text'
        )}
        whileHover={{ x: isActive ? 0 : 4 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Active background indicator */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              layoutId="sidebar-active-bg"
              className="absolute inset-0 bg-pulse-accent/10 border border-pulse-accent/20 rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={springs.snappy}
            />
          )}
        </AnimatePresence>

        {/* Hover background */}
        {!isActive && (
          <motion.div
            className="absolute inset-0 bg-pulse-elevated rounded-lg"
            initial={{ opacity: 0 }}
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
          />
        )}

        {/* Icon with animation */}
        <motion.div
          className="relative z-10"
          animate={isActive ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <Icon className="w-4 h-4" aria-hidden="true" />
        </motion.div>

        {/* Label */}
        <span className="relative z-10">{label}</span>

        {/* Active indicator line */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-pulse-accent rounded-full"
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              exit={{ scaleY: 0, opacity: 0 }}
              transition={springs.snappy}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </Link>
  )
}
