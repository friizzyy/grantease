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
    <aside className="hidden md:block fixed left-0 top-0 bottom-0 w-52 bg-pulse-surface/50 backdrop-blur-xl z-40">
      {/* Right border gradient */}
      <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-pulse-accent/10 via-transparent to-pulse-accent/10" />
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-pulse-border/40">
          <Link href="/app" className="flex items-center gap-2.5 group">
            <AnimatedLogo className="text-pulse-accent" />
            <BrandLogo size="lg" />
          </Link>
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 relative" aria-label="Main navigation">
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

          {/* Admin Section — separated by clean divider */}
          {isAdmin && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="pt-4 mt-4 border-t border-pulse-border/40"
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

        {/* Settings + Sign Out */}
        <div className="px-3 py-4 border-t border-pulse-border/40 space-y-0.5">
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
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-pulse-text-secondary hover:text-pulse-error hover:bg-pulse-error/10 transition-all duration-150 w-full relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-pulse-accent/50 focus-visible:outline-none"
            whileHover={isSigningOut ? {} : { x: 2 }}
            whileTap={isSigningOut ? {} : { scale: 0.98 }}
            aria-label="Sign out of your account"
          >
            {isSigningOut ? (
              <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
            ) : (
              <LogOut className="w-5 h-5" aria-hidden="true" />
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
    <Link href={href} className="block relative rounded-lg focus-visible:ring-2 focus-visible:ring-pulse-accent/50 focus-visible:outline-none" aria-current={isActive ? 'page' : undefined}>
      <motion.div
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 relative',
          isActive
            ? 'text-pulse-accent'
            : 'text-pulse-text-secondary hover:text-pulse-text hover:bg-pulse-elevated'
        )}
        whileHover={{ x: isActive ? 0 : 2 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Active background indicator */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              layoutId="sidebar-active-bg"
              className="absolute inset-0 bg-pulse-accent/5 border border-pulse-accent/20 rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={springs.snappy}
            />
          )}
        </AnimatePresence>

        {/* Active indicator — mint left border, 2px wide */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-pulse-accent rounded-full"
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 1 }}
              exit={{ scaleY: 0, opacity: 0 }}
              transition={springs.snappy}
            />
          )}
        </AnimatePresence>

        {/* Icon — 20px, tertiary default, accent when active */}
        <motion.div
          className="relative z-10"
          animate={isActive ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <Icon
            className={cn(
              'w-5 h-5 transition-colors duration-150',
              isActive ? 'text-pulse-accent' : 'text-pulse-text-tertiary'
            )}
            aria-hidden="true"
          />
        </motion.div>

        {/* Label */}
        <span className="relative z-10">{label}</span>
      </motion.div>
    </Link>
  )
}
