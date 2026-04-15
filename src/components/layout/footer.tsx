import Link from 'next/link'
import { AnimatedLogo } from '@/components/ui/animated-logo'
import { BrandLogo } from '@/components/ui/brand-logo'

const footerLinks = {
  Product: [
    { label: 'Grant Search', href: '/app/discover' },
    { label: 'AI Writing Assistant', href: '/how-it-works' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'How It Works', href: '/how-it-works' },
  ],
  Resources: [
    { label: 'Blog', href: '/' },
    { label: 'Help Center', href: '/faq' },
    { label: 'Status', href: '/' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'FAQ', href: '/faq' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
}

export function Footer() {
  return (
    <footer className="relative">
      {/* Top gradient */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        {/* Top: Brand + Link columns */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6 sm:gap-8 md:gap-8">
          {/* Brand column: spans 2 */}
          <div className="col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <AnimatedLogo size="sm" className="text-pulse-accent" />
              <BrandLogo size="md" />
            </Link>
            <p className="text-body-sm text-pulse-text-tertiary max-w-[260px] leading-relaxed mb-5">
              Find and apply to grants matched to your organization using
              AI-driven search, eligibility analysis, and writing tools.
            </p>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-pulse-accent/[0.08] border border-pulse-accent/15 text-[11px] font-medium tracking-wide text-pulse-accent">
                20K+ grants
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-pulse-rose/[0.08] border border-pulse-rose/15 text-[11px] font-medium tracking-wide text-pulse-rose">
                $12B+ funding
              </span>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <nav key={category} aria-label={`${category} links`}>
              <h3 className="text-label-sm text-pulse-text-secondary mb-4">{category}</h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-pulse-text-tertiary hover:text-pulse-text transition-colors duration-150"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6">
          <div className="h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent mb-6" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-[12px] text-pulse-text-tertiary">
              &copy; {new Date().getFullYear()} Grants By AI. All rights reserved.
            </p>

          </div>
        </div>
      </div>
    </footer>
  )
}
