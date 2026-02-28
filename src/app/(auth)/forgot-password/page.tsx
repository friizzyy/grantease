'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { AnimatedLogo } from '@/components/ui/animated-logo'
import { BrandLogo } from '@/components/ui/brand-logo'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // Validate email
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email')
      }

      setIsSubmitted(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <Card className="overflow-hidden relative bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm">
          <CardHeader className="text-center relative z-10">
            <motion.div
              className="w-16 h-16 rounded-full bg-pulse-accent/[0.1] border border-pulse-accent/[0.15] flex items-center justify-center mx-auto mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            >
              <CheckCircle2 className="w-8 h-8 text-pulse-accent" />
            </motion.div>
            <CardTitle className="text-display-section text-pulse-text">Check your email</CardTitle>
            <CardDescription className="text-body-sm text-pulse-text-secondary mt-2">
              We&apos;ve sent password reset instructions to{' '}
              <span className="text-pulse-text font-medium">{email}</span>
            </CardDescription>
          </CardHeader>

          <CardContent className="relative z-10 space-y-4">
            <p className="text-body-sm text-pulse-text-secondary text-center">
              If you don&apos;t see the email, check your spam folder. The link will expire in 1 hour.
            </p>

            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setIsSubmitted(false)
                  setEmail('')
                }}
              >
                Try a different email
              </Button>

              <Button asChild className="w-full">
                <Link href="/login">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to login
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="w-full max-w-md"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <Card className="overflow-hidden relative bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm">
        <CardHeader className="text-center relative z-10">
          <motion.div
            className="flex items-center justify-center gap-2 mb-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.05, duration: 0.4 }}
          >
            <AnimatedLogo size="md" className="text-pulse-accent" />
            <BrandLogo size="lg" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <CardTitle className="text-display-section text-pulse-text">Forgot password?</CardTitle>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <CardDescription className="text-body-sm text-pulse-text-secondary">
              Enter your email and we&apos;ll send you a reset link
            </CardDescription>
          </motion.div>
        </CardHeader>

        <CardContent className="relative z-10">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <motion.div
                role="alert"
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                className="p-3 rounded-lg bg-pulse-error/10 border border-pulse-error/20"
              >
                <p className="text-sm text-pulse-error flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </p>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <label htmlFor="email" className="text-body-sm text-pulse-text-secondary mb-2 block">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                icon={<Mail className="w-4 h-4" />}
                required
                autoFocus
                className="placeholder:text-pulse-text-tertiary/70"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Button type="submit" className="w-full" loading={isLoading}>
                Send Reset Link
                <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          </form>

          <motion.p
            className="mt-6 text-center text-body-sm text-pulse-text-secondary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
          >
            Remember your password?{' '}
            <Link href="/login" className="text-pulse-accent hover:underline">
              Sign in
            </Link>
          </motion.p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
