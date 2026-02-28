'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ArrowRight } from 'lucide-react'
import { AnimatedLogo } from '@/components/ui/animated-logo'
import { BrandLogo } from '@/components/ui/brand-logo'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
  { label: 'FAQ', href: '/faq' },
]

const menuVariants = {
  closed: { opacity: 0 },
  open: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const menuItemVariants = {
  closed: { opacity: 0, x: -20 },
  open: { opacity: 1, x: 0, transition: { duration: 0.3 } },
}

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const isHidden = pathname?.startsWith('/app') || pathname?.startsWith('/admin')

  useEffect(() => {
    if (isHidden) return
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isHidden])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  if (isHidden) {
    return null
  }

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled
          ? 'bg-[#0a0e27]/85 backdrop-blur-2xl shadow-[0_1px_0_rgba(64,255,170,0.06),0_4px_40px_rgba(0,0,0,0.4)]'
          : 'bg-transparent'
      )}
    >
      {/* Subtle top accent line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-pulse-accent/20 to-transparent" />

      <nav className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[60px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <AnimatedLogo className="text-pulse-accent" />
            <BrandLogo size="lg" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1" role="navigation" aria-label="Main navigation">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'relative px-4 py-2 text-[13px] font-medium tracking-wide transition-colors duration-200 rounded-lg',
                    isActive
                      ? 'text-pulse-accent'
                      : 'text-pulse-text-secondary/80 hover:text-pulse-text'
                  )}
                >
                  {item.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-active-indicator"
                      className="absolute bottom-0 left-2 right-2 h-px bg-pulse-accent rounded-full shadow-[0_0_6px_rgba(64,255,170,0.5)]"
                      aria-hidden="true"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              )
            })}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-[13px] font-medium text-pulse-text-secondary/80 hover:text-pulse-text transition-colors duration-200"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="group inline-flex items-center gap-1.5 px-5 py-2 text-[13px] font-semibold text-pulse-bg bg-pulse-accent rounded-lg hover:bg-pulse-accent/90 transition-all duration-200 shadow-[0_0_16px_rgba(64,255,170,0.2)] hover:shadow-[0_0_24px_rgba(64,255,170,0.35)]"
            >
              Get Started
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-pulse-text-secondary hover:text-pulse-text transition-colors focus-visible:ring-2 focus-visible:ring-pulse-accent/50 focus-visible:outline-none rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-controls="mobile-menu"
          >
            <AnimatePresence mode="wait">
              {mobileMenuOpen ? (
                <motion.div
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <X className="w-6 h-6" aria-hidden="true" />
                </motion.div>
              ) : (
                <motion.div
                  key="open"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Menu className="w-6 h-6" aria-hidden="true" />
                </motion.div>
              )}
            </AnimatePresence>
          </button>
        </div>
      </nav>

      {/* Bottom border that fades in on scroll */}
      <div
        className={cn(
          'absolute bottom-0 inset-x-0 h-px transition-opacity duration-500',
          scrolled ? 'opacity-100' : 'opacity-0'
        )}
      >
        <div className="h-full bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            className="md:hidden fixed inset-0 top-[60px] z-50 bg-[#0a0e27]/98 backdrop-blur-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            role="navigation"
            aria-label="Mobile navigation"
          >
            <motion.div
              className="flex flex-col p-6 gap-1"
              variants={menuVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              {navItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <motion.div key={item.href} variants={menuItemVariants}>
                    <Link
                      href={item.href}
                      className={cn(
                        'block px-4 py-3 text-lg font-medium rounded-xl transition-colors duration-150',
                        isActive
                          ? 'text-pulse-accent bg-pulse-accent/8'
                          : 'text-pulse-text-secondary hover:text-pulse-text hover:bg-white/[0.03]'
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                )
              })}

              <motion.div variants={menuItemVariants} className="flex flex-col gap-3 mt-8 px-4">
                <Link
                  href="/login"
                  className="block text-center px-6 py-3 text-sm font-medium text-pulse-text-secondary border border-white/[0.08] rounded-xl hover:bg-white/[0.03] transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="block text-center px-6 py-3 text-sm font-semibold text-pulse-bg bg-pulse-accent rounded-xl shadow-[0_0_20px_rgba(64,255,170,0.2)]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started Free
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
