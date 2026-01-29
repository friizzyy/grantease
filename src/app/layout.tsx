import type { Metadata, Viewport } from 'next'
import '@/styles/globals.css'
import { MotionProvider } from '@/lib/motion/motion-context'

export const metadata: Metadata = {
  title: {
    default: 'GrantEase - Intelligent Grant Discovery',
    template: '%s | GrantEase',
  },
  description: 'Find grants across every category. Federal, state, local, nonprofit, and private funding opportunities. Search, qualify, organize, and apply with confidence.',
  keywords: ['grants', 'funding', 'nonprofit', 'small business', 'government grants', 'grant search'],
  authors: [{ name: 'GrantEase' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://grantease.io',
    siteName: 'GrantEase',
    title: 'GrantEase - Intelligent Grant Discovery',
    description: 'Find grants across every category. Federal, state, local, nonprofit, and private funding opportunities.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GrantEase - Intelligent Grant Discovery',
    description: 'Find grants across every category.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0a0b',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Preconnect to font services */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* Load fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-pulse-bg text-pulse-text antialiased font-sans">
        <MotionProvider>
          {children}
        </MotionProvider>
      </body>
    </html>
  )
}
