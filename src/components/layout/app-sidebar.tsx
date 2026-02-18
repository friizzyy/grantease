'use client'

import { useState, useEffect } from 'react'
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
  Menu,
  X,
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
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

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

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-pulse-border">
        <Link href="/app" className="flex items-center gap-2.5 group">
          <AnimatedLogo className="text-pulse-accent" />
          <BrandLogo size="lg" />
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1 relative overflow-y-auto overscroll-contain" aria-label="Main navigation">
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
      <div className="p-4 border-t border-pulse-border space-y-1 pb-[calc(1rem+env(safe-area-inset-bottom))]">
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
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-pulse-text-secondary hover:text-pulse-error hover:bg-pulse-error/10 transition-colors duration-200 w-full relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
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
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-pulse-surface/90 backdrop-blur-md border-b border-pulse-border flex items-center justify-between px-4">
        <Link href="/app" className="flex items-center gap-2">
          <AnimatedLogo size="sm" className="text-pulse-accent" />
          <BrandLogo size="sm" />
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-pulse-text-secondary hover:text-pulse-text hover:bg-pulse-surface transition-colors"
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="md:hidden fixed inset-0 z-40 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            className="md:hidden fixed left-0 top-0 bottom-0 w-72 max-w-[85vw] bg-pulse-surface border-r border-pulse-border z-50 overflow-hidden"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{ overscrollBehavior: 'contain' }}
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <aside className="hidden md:block fixed left-0 top-0 bottom-0 w-64 bg-pulse-surface/50 border-r border-pulse-border backdrop-blur-sm z-40">
        {sidebarContent}
      </aside>
    </>
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
    <Link
      href={href}
      className="block relative"
      aria-current={isActive ? 'page' : undefined}
      style={{ WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation' }}
    >
      <motion.div
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 relative min-h-[44px]',
          isActive
            ? 'text-pulse-accent'
            : 'text-pulse-text-secondary hover:text-pulse-text active:text-pulse-text'
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
