import Link from 'next/link'
import { AnimatedLogo } from '@/components/ui/animated-logo'
import { BrandLogo } from '@/components/ui/brand-logo'

const footerLinks = {
  product: [
    { label: 'Features', href: '/how-it-works' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'FAQ', href: '/faq' },
  ],
  company: [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
}

const socialLinks = [
  {
    label: 'Twitter',
    href: 'https://twitter.com/grantsbyai',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://linkedin.com/company/grantsbyai',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
]

export function Footer() {
  return (
    <footer className="relative border-t border-pulse-border/30 bg-pulse-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand — takes 2 columns */}
          <div className="col-span-2">
            <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
              <AnimatedLogo size="md" className="text-pulse-accent" />
              <BrandLogo size="lg" />
            </Link>
            <p className="text-body-sm text-pulse-text-tertiary max-w-xs leading-relaxed">
              Grant intelligence software. Profile-based qualification and execution tracking.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-caption font-semibold uppercase tracking-wider text-pulse-text-secondary mb-4">
              Product
            </h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-body-sm text-pulse-text-tertiary hover:text-pulse-text transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-caption font-semibold uppercase tracking-wider text-pulse-text-secondary mb-4">
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-body-sm text-pulse-text-tertiary hover:text-pulse-text transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-caption font-semibold uppercase tracking-wider text-pulse-text-secondary mb-4">
              Legal
            </h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-body-sm text-pulse-text-tertiary hover:text-pulse-text transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-8 border-t border-pulse-border/30 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-caption text-pulse-text-tertiary">
            &copy; {new Date().getFullYear()} Grants By AI. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-pulse-text-tertiary hover:text-pulse-text transition-colors duration-200"
                aria-label={social.label}
              >
                {social.icon}
              </a>
            ))}
            <span className="text-caption text-pulse-text-tertiary ml-2">
              Built for operators.
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}
