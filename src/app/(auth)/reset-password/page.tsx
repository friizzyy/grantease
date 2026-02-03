'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Lock, ArrowLeft, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'

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
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.4,
          type: 'spring',
          stiffness: 300,
          damping: 30,
        }}
      >
        <Card className="border-pulse-border/50 overflow-hidden relative">
          <CardHeader className="text-center relative z-10">
            <motion.div
              className="w-16 h-16 rounded-full bg-pulse-accent/20 border border-pulse-accent/30 flex items-center justify-center mx-auto mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
            >
              <CheckCircle2 className="w-8 h-8 text-pulse-accent" />
            </motion.div>
            <CardTitle className="font-serif text-heading-md">Password Reset!</CardTitle>
            <CardDescription className="mt-2">
              Your password has been successfully reset.
            </CardDescription>
          </CardHeader>

          <CardContent className="relative z-10 space-y-4">
            <p className="text-sm text-pulse-text-secondary text-center">
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
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.4,
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
    >
      <Card className="border-pulse-border/50 overflow-hidden relative">
        <CardHeader className="text-center relative z-10">
          <CardTitle className="font-serif text-heading-md">Reset your password</CardTitle>
          <CardDescription>
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
                <label htmlFor="password" className="text-sm text-pulse-text-secondary mb-2 block">
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
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-pulse-text-tertiary hover:text-pulse-text"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="text-sm text-pulse-text-secondary mb-2 block">
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
                />
              </div>

              {/* Password requirements */}
              <div className="text-xs text-pulse-text-tertiary space-y-1">
                <p className={password.length >= 8 ? 'text-pulse-accent' : ''}>
                  {password.length >= 8 ? '✓' : '○'} At least 8 characters
                </p>
                <p className={/[A-Z]/.test(password) ? 'text-pulse-accent' : ''}>
                  {/[A-Z]/.test(password) ? '✓' : '○'} One uppercase letter
                </p>
                <p className={/[a-z]/.test(password) ? 'text-pulse-accent' : ''}>
                  {/[a-z]/.test(password) ? '✓' : '○'} One lowercase letter
                </p>
                <p className={/[0-9]/.test(password) ? 'text-pulse-accent' : ''}>
                  {/[0-9]/.test(password) ? '✓' : '○'} One number
                </p>
              </div>

              <Button type="submit" className="w-full" loading={isLoading}>
                Reset Password
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-pulse-text-secondary">
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
        <Card className="border-pulse-border/50">
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
