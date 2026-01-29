'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// Premium button with shimmer effect
const shimmerButtonVariants = cva(
  'group relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-xl font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pulse-accent focus-visible:ring-offset-2 focus-visible:ring-offset-pulse-bg disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default: 'bg-pulse-accent text-pulse-bg hover:shadow-[0_0_30px_rgba(64,255,170,0.3)]',
        outline: 'border border-pulse-border bg-transparent text-pulse-text hover:border-pulse-accent/50',
        ghost: 'bg-transparent text-pulse-text-secondary hover:text-pulse-text hover:bg-pulse-surface',
      },
      size: {
        default: 'h-11 px-6 text-sm',
        sm: 'h-9 px-4 text-xs',
        lg: 'h-14 px-8 text-base',
        xl: 'h-16 px-10 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ShimmerButtonProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof shimmerButtonVariants> {
  shimmerColor?: string
  asChild?: boolean
}

export const ShimmerButton = React.forwardRef<HTMLAnchorElement, ShimmerButtonProps>(
  (
    {
      className,
      variant,
      size,
      shimmerColor = 'rgba(255, 255, 255, 0.15)',
      children,
      asChild,
      ...props
    },
    ref
  ) => {
    return (
      <a
        className={cn(shimmerButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {/* Shimmer effect */}
        <span
          className="absolute inset-0 overflow-hidden rounded-xl pointer-events-none"
          style={{
            maskImage: 'linear-gradient(to bottom, transparent, black, transparent)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent, black, transparent)',
          }}
        >
          <span
            className="absolute inset-[-100%] animate-[shimmer-slide_2s_ease-in-out_infinite]"
            style={{
              background: `linear-gradient(90deg, transparent 20%, ${shimmerColor} 50%, transparent 80%)`,
            }}
          />
        </span>

        {/* Hover overlay */}
        <span className="absolute inset-0 rounded-xl bg-white/[0.05] opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />

        {/* Content */}
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </a>
    )
  }
)
ShimmerButton.displayName = 'ShimmerButton'

// Glow button - subtle border glow on hover
const glowButtonVariants = cva(
  'relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-xl font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pulse-accent focus-visible:ring-offset-2 focus-visible:ring-offset-pulse-bg disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      size: {
        default: 'h-11 px-6 text-sm',
        sm: 'h-9 px-4 text-xs',
        lg: 'h-14 px-8 text-base',
        xl: 'h-16 px-10 text-lg',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
)

export interface GlowButtonProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof glowButtonVariants> {
  glowColor?: string
  asChild?: boolean
}

export const GlowButton = React.forwardRef<HTMLAnchorElement, GlowButtonProps>(
  ({ className, size, glowColor = 'rgba(64, 255, 170, 0.5)', children, asChild, ...props }, ref) => {
    return (
      <a
        className={cn(
          glowButtonVariants({ size }),
          'group bg-transparent border border-pulse-accent/40 text-pulse-accent',
          'hover:border-pulse-accent hover:shadow-[0_0_30px_rgba(64,255,170,0.25)]',
          className
        )}
        ref={ref}
        {...props}
      >
        {/* Inner glow on hover */}
        <span
          className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, ${glowColor.replace('0.5', '0.08')}, transparent 70%)`,
          }}
        />
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </a>
    )
  }
)
GlowButton.displayName = 'GlowButton'

// Outline button with shine effect
export interface ShineButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  asChild?: boolean
  children: React.ReactNode
}

export const ShineButton = React.forwardRef<HTMLAnchorElement, ShineButtonProps>(
  ({ className, children, asChild, ...props }, ref) => {
    return (
      <a
        ref={ref}
        className={cn(
          'group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl px-6 py-3 font-medium transition-all duration-300',
          'border border-pulse-border bg-pulse-surface/50 text-pulse-text',
          'hover:border-pulse-accent/40 hover:bg-pulse-surface',
          'active:scale-[0.98]',
          className
        )}
        {...props}
      >
        {/* Shine sweep on hover */}
        <span className="absolute inset-0 -translate-x-full skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full pointer-events-none" />
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </a>
    )
  }
)
ShineButton.displayName = 'ShineButton'

// Standard Button component for forms etc
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pulse-accent focus-visible:ring-offset-2 focus-visible:ring-offset-pulse-bg disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-pulse-accent text-pulse-bg hover:bg-pulse-accent/90 hover:shadow-[0_0_20px_rgba(64,255,170,0.3)]',
        secondary:
          'bg-pulse-surface border border-pulse-border text-pulse-text hover:bg-pulse-elevated hover:border-pulse-border-hover',
        outline:
          'border border-pulse-border bg-transparent text-pulse-text hover:bg-pulse-surface hover:border-pulse-border-hover',
        ghost:
          'text-pulse-text-secondary hover:text-pulse-text hover:bg-pulse-surface',
        destructive:
          'bg-pulse-error/10 text-pulse-error border border-pulse-error/20 hover:bg-pulse-error/20',
      },
      size: {
        default: 'h-10 px-5 py-2',
        sm: 'h-8 px-3 text-xs',
        lg: 'h-12 px-8 text-base',
        xl: 'h-14 px-10 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface PremiumButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

export const PremiumButton = React.forwardRef<HTMLButtonElement, PremiumButtonProps>(
  ({ className, variant, size, loading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)
PremiumButton.displayName = 'PremiumButton'
