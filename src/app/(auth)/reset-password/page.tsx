'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Lock, ArrowLeft, CheckCircle2, AlertCircle, Eye, EyeOff, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { AnimatedLogo } from '@/components/ui/animated-logo'
import { BrandLogo } from '@/components/ui/brand-logo'

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  // Validate token exists
  useEffect(() => {
    if (!token) {
      setError('Invalid reset link. Please request a new password reset.')
    }
  }, [token])

  const validatePassword = () => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters'
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must include an uppercase letter'
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must include a lowercase letter'
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must include a number'
    }
    if (password !== confirmPassword) {
      return 'Passwords do not match'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const validationError = validatePassword()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reset password')
      }

      setIsSuccess(true)

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
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
            <CardTitle className="text-display-section text-pulse-text">Password Reset!</CardTitle>
            <CardDescription className="text-body-sm text-pulse-text-secondary mt-2">
              Your password has been successfully reset.
            </CardDescription>
          </CardHeader>

          <CardContent className="relative z-10 space-y-4">
            <p className="text-body-sm text-pulse-text-secondary text-center">
              Redirecting you to login...
            </p>

            <Button asChild className="w-full">
              <Link href="/login">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go to login
              </Link>
            </Button>
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
          <div className="flex items-center justify-center gap-2 mb-5">
            <AnimatedLogo size="md" className="text-pulse-accent" />
            <BrandLogo size="lg" />
          </div>
          <CardTitle className="text-display-section text-pulse-text">Reset your password</CardTitle>
          <CardDescription className="text-body-sm text-pulse-text-secondary">
            Enter your new password below
          </CardDescription>
        </CardHeader>

        <CardContent className="relative z-10">
          {!token ? (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-pulse-error/10 border border-pulse-error/20">
                <p className="text-sm text-pulse-error flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Invalid reset link. Please request a new password reset.
                </p>
              </div>
              <Button asChild className="w-full">
                <Link href="/forgot-password">
                  Request new reset link
                </Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <motion.div
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

              <div>
                <label htmlFor="password" className="text-body-sm text-pulse-text-secondary mb-2 block">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    icon={<Lock className="w-4 h-4" />}
                    required
                    autoFocus
                    className="placeholder:text-pulse-text-tertiary/70"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-pulse-text-tertiary hover:text-pulse-text transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="text-body-sm text-pulse-text-secondary mb-2 block">
                  Confirm New Password
                </label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  icon={<Lock className="w-4 h-4" />}
                  required
                  className="placeholder:text-pulse-text-tertiary/70"
                />
              </div>

              {/* Password requirements */}
              <div className="text-xs space-y-1.5">
                {[
                  { met: password.length >= 8, label: 'At least 8 characters' },
                  { met: /[A-Z]/.test(password), label: 'One uppercase letter' },
                  { met: /[a-z]/.test(password), label: 'One lowercase letter' },
                  { met: /[0-9]/.test(password), label: 'One number' },
                ].map((req) => (
                  <div key={req.label} className={`flex items-center gap-2 ${req.met ? 'text-pulse-accent' : 'text-pulse-text-tertiary/70'}`}>
                    <Check className="w-3 h-3" />
                    <span>{req.label}</span>
                  </div>
                ))}
              </div>

              <Button type="submit" className="w-full" loading={isLoading}>
                Reset Password
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-body-sm text-pulse-text-secondary">
            <Link href="/login" className="text-pulse-accent hover:underline flex items-center justify-center gap-1">
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Link>
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="w-full max-w-md">
        <Card className="bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm">
          <CardContent className="p-8 text-center">
            <div className="animate-pulse">
              <div className="w-16 h-16 bg-pulse-surface rounded-full mx-auto mb-4" />
              <div className="h-6 bg-pulse-surface rounded w-48 mx-auto mb-2" />
              <div className="h-4 bg-pulse-surface rounded w-64 mx-auto" />
            </div>
          </CardContent>
        </Card>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}
