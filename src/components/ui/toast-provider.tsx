'use client'

import * as React from 'react'
import { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info, X, Loader2 } from 'lucide-react'
import { springs } from '@/lib/motion/animations'

interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'loading'
  title: string
  description?: string
  duration?: number
}

interface ToastContextValue {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => string
  removeToast: (id: string) => void
  updateToast: (id: string, updates: Partial<Omit<Toast, 'id'>>) => void
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>): string => {
    const id = Math.random().toString(36).substring(7)
    const newToast = { ...toast, id }
    setToasts((prev) => [...prev, newToast])

    // Auto-dismiss non-loading toasts
    if (toast.type !== 'loading') {
      const duration = toast.duration ?? 4000
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, duration)
    }

    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const updateToast = useCallback((id: string, updates: Partial<Omit<Toast, 'id'>>) => {
    setToasts((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = { ...t, ...updates }
          // Auto-dismiss if updating from loading to another type
          if (t.type === 'loading' && updates.type && updates.type !== 'loading') {
            const duration = updates.duration ?? 4000
            setTimeout(() => {
              setToasts((prev) => prev.filter((toast) => toast.id !== id))
            }, duration)
          }
          return updated
        }
        return t
      })
    )
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, updateToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  )
}

function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: Toast[]
  removeToast: (id: string) => void
}) {
  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
      aria-live="polite"
      aria-label="Notifications"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-pulse-accent" />,
    error: <AlertCircle className="w-5 h-5 text-pulse-error" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
    loading: <Loader2 className="w-5 h-5 text-pulse-accent animate-spin" />,
  }

  const backgrounds = {
    success: 'bg-pulse-accent/10 border-pulse-accent/30',
    error: 'bg-pulse-error/10 border-pulse-error/30',
    info: 'bg-blue-500/10 border-blue-500/30',
    loading: 'bg-pulse-surface border-pulse-border',
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={springs.snappy}
      className={`pointer-events-auto min-w-[300px] max-w-[400px] rounded-xl border backdrop-blur-sm shadow-lg ${backgrounds[toast.type]}`}
    >
      <div className="flex items-start gap-3 p-4">
        <div className="shrink-0 mt-0.5">{icons[toast.type]}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-pulse-text">{toast.title}</p>
          {toast.description && (
            <p className="text-xs text-pulse-text-secondary mt-0.5">{toast.description}</p>
          )}
        </div>
        {toast.type !== 'loading' && (
          <button
            onClick={onDismiss}
            className="shrink-0 p-1 rounded-lg text-pulse-text-tertiary hover:text-pulse-text hover:bg-pulse-surface transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Convenience hooks for common toast patterns
export function useToastActions() {
  const { addToast, updateToast, removeToast } = useToast()

  const success = useCallback(
    (title: string, description?: string) => {
      return addToast({ type: 'success', title, description })
    },
    [addToast]
  )

  const error = useCallback(
    (title: string, description?: string) => {
      return addToast({ type: 'error', title, description })
    },
    [addToast]
  )

  const info = useCallback(
    (title: string, description?: string) => {
      return addToast({ type: 'info', title, description })
    },
    [addToast]
  )

  const loading = useCallback(
    (title: string, description?: string) => {
      return addToast({ type: 'loading', title, description })
    },
    [addToast]
  )

  const promise = useCallback(
    async <T,>(
      promiseFn: Promise<T>,
      messages: {
        loading: string
        success: string
        error: string
      }
    ): Promise<T> => {
      const id = addToast({ type: 'loading', title: messages.loading })
      try {
        const result = await promiseFn
        updateToast(id, { type: 'success', title: messages.success })
        return result
      } catch (err) {
        updateToast(id, {
          type: 'error',
          title: messages.error,
          description: err instanceof Error ? err.message : undefined,
        })
        throw err
      }
    },
    [addToast, updateToast]
  )

  return { success, error, info, loading, promise, updateToast, removeToast }
}
