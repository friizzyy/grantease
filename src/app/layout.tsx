import type { Metadata, Viewport } from 'next'
import '@/styles/globals.css'
import { MotionProvider } from '@/lib/motion/motion-context'
import { SessionProvider } from '@/components/providers/session-provider'
import { ToastProvider } from '@/components/ui/toast-provider'
import { Agentation } from 'agentation'

export const metadata: Metadata = {
  metadataBase: new URL('https://grantsby.ai'),
  title: {
    default: 'Grants By AI — Discover Agricultural Grants',
    template: '%s | Grants By AI',
  },
  description: 'AI-powered grant discovery platform for farmers and agricultural businesses. Find matching grants, track deadlines, and streamline applications.',
  keywords: ['agricultural grants', 'farm grants', 'USDA grants', 'grant discovery', 'grant matching', 'farming funding'],
  authors: [{ name: 'Grants By AI' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://grantsby.ai',
    siteName: 'Grants By AI',
    title: 'Grants By AI — Discover Agricultural Grants',
    description: 'AI-powered grant discovery platform for farmers and agricultural businesses.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Grants By AI — Discover Agricultural Grants',
    description: 'AI-powered grant discovery for farmers and agricultural businesses.',
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
        <SessionProvider>
          <MotionProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </MotionProvider>
        </SessionProvider>
        {process.env.NODE_ENV === 'development' && <Agentation />}
      </body>
    </html>
  )
}
