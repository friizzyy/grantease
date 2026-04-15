'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu,
  X,
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
import { AnimatedLogo } from '@/components/ui/animated-logo'
import { BrandLogo } from '@/components/ui/brand-logo'

const mainNav = [
  { label: 'Dashboard', href: '/app', icon: LayoutDashboard },
  { label: 'Discover Grants', href: '/app/discover', icon: Search },
  { label: 'Saved Grants', href: '/app/saved', icon: Bookmark },
  { label: 'Workspaces', href: '/app/workspace', icon: FolderOpen },
  { label: 'Saved Searches', href: '/app/searches', icon: Bell },
  { label: 'Settings', href: '/app/settings', icon: Settings },
]

interface MobileNavProps {
  isAdmin?: boolean
}

export function MobileNav({ isAdmin = false }: MobileNavProps) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      await signOut({ redirect: true, callbackUrl: '/login' })
    } catch {
      setIsSigningOut(false)
    }
  }

  return (
    <div className="md:hidden">
      {/* Fixed top bar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-14 bg-pulse-bg/90 backdrop-blur-md border-b border-white/[0.06] flex items-center justify-between px-4">
        <Link href="/app" className="flex items-center gap-2">
          <AnimatedLogo size="sm" className="text-pulse-accent" />
          <BrandLogo size="sm" />
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-10 h-10 flex items-center justify-center rounded-lg text-pulse-text-secondary hover:text-pulse-text hover:bg-white/[0.04] transition-colors"
          aria-label={isOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isOpen}
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Overlay + slide-out menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsOpen(false)}
              aria-hidden="true"
            />
            <motion.nav
              className="fixed top-14 right-0 bottom-0 z-50 w-[min(18rem,85vw)] bg-pulse-surface border-l border-white/[0.06] overflow-y-auto"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              aria-label="Mobile navigation"
            >
              <div className="flex flex-col h-full">
                <div className="flex-1 px-3 py-4 space-y-1">
                  {mainNav.map((item) => {
                    const isActive = pathname === item.href ||
                      (item.href !== '/app' && pathname?.startsWith(item.href))
                    const Icon = item.icon

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-pulse-accent/10 text-pulse-accent'
                            : 'text-pulse-text-secondary hover:text-pulse-text hover:bg-white/[0.04]'
                        )}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <Icon className={cn('w-5 h-5', isActive ? 'text-pulse-accent' : 'text-pulse-text-tertiary')} />
                        {item.label}
                      </Link>
                    )
                  })}

                  {isAdmin && (
                    <div className="pt-3 mt-3 border-t border-white/[0.06]">
                      <p className="px-4 py-2 text-[0.65rem] uppercase tracking-wider text-pulse-text-tertiary font-medium">Admin</p>
                      <Link
                        href="/admin/ingestion"
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                          pathname?.startsWith('/admin')
                            ? 'bg-pulse-accent/10 text-pulse-accent'
                            : 'text-pulse-text-secondary hover:text-pulse-text hover:bg-white/[0.04]'
                        )}
                      >
                        <Shield className="w-5 h-5 text-pulse-text-tertiary" />
                        Ingestion
                      </Link>
                    </div>
                  )}
                </div>

                <div className="px-3 py-4 border-t border-white/[0.06]">
                  <button
                    onClick={handleSignOut}
                    disabled={isSigningOut}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-pulse-text-secondary hover:text-pulse-error hover:bg-pulse-error/10 transition-colors disabled:opacity-50"
                  >
                    {isSigningOut ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <LogOut className="w-5 h-5" />
                    )}
                    {isSigningOut ? 'Signing out...' : 'Sign Out'}
                  </button>
                </div>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
