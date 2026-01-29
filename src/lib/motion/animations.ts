import { Transition, Variants } from 'framer-motion'

// Spring presets for consistent motion feel
export const springs = {
  snappy: { type: 'spring', stiffness: 400, damping: 30 } as const,
  gentle: { type: 'spring', stiffness: 100, damping: 15 } as const,
  bouncy: { type: 'spring', stiffness: 300, damping: 10 } as const,
  stiff: { type: 'spring', stiffness: 500, damping: 35 } as const,
} as const

// Easing curves
export const easings = {
  smooth: [0.25, 0.1, 0.25, 1] as const,
  smoothOut: [0, 0, 0.2, 1] as const,
  smoothIn: [0.4, 0, 1, 1] as const,
  bounce: [0.68, -0.55, 0.27, 1.55] as const,
} as const

// Duration presets (in seconds)
export const durations = {
  instant: 0.1,
  fast: 0.15,
  normal: 0.25,
  slow: 0.35,
  page: 0.4,
} as const

// Stagger utility
export const stagger = (index: number, base: number = 0.05) => index * base

// Transition presets
export const transitions = {
  micro: { duration: durations.fast, ease: easings.smooth } as Transition,
  standard: { duration: durations.normal, ease: easings.smooth } as Transition,
  slow: { duration: durations.slow, ease: easings.smooth } as Transition,
  page: { duration: durations.page, ease: easings.smooth } as Transition,
  spring: springs.snappy as Transition,
  gentleSpring: springs.gentle as Transition,
} as const

// Variant factories for common animations
export function fadeInUp(delay: number = 0): Variants {
  return {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { ...transitions.standard, delay }
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: transitions.micro
    },
  }
}

export function fadeIn(delay: number = 0): Variants {
  return {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { ...transitions.standard, delay }
    },
    exit: {
      opacity: 0,
      transition: transitions.micro
    },
  }
}

export function scaleIn(delay: number = 0): Variants {
  return {
    initial: { opacity: 0, scale: 0.9 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { ...springs.snappy, delay }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: transitions.micro
    },
  }
}

export function slideInRight(delay: number = 0): Variants {
  return {
    initial: { opacity: 0, x: 20 },
    animate: {
      opacity: 1,
      x: 0,
      transition: { ...transitions.standard, delay }
    },
    exit: {
      opacity: 0,
      x: -10,
      transition: transitions.micro
    },
  }
}

export function slideInLeft(delay: number = 0): Variants {
  return {
    initial: { opacity: 0, x: -20 },
    animate: {
      opacity: 1,
      x: 0,
      transition: { ...transitions.standard, delay }
    },
    exit: {
      opacity: 0,
      x: 10,
      transition: transitions.micro
    },
  }
}

// Container variants for staggered children
export function staggerContainer(staggerDelay: number = 0.05): Variants {
  return {
    initial: {},
    animate: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
    exit: {
      transition: {
        staggerChildren: staggerDelay / 2,
        staggerDirection: -1,
      },
    },
  }
}

export function staggerItem(): Variants {
  return {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: transitions.standard,
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: transitions.micro,
    },
  }
}

// Button variants with magnetic and depth effects
export const buttonVariants: Variants = {
  rest: {
    scale: 1,
    y: 0,
  },
  hover: {
    scale: 1.02,
    transition: springs.snappy,
  },
  tap: {
    scale: 0.98,
    y: 2,
    transition: { duration: durations.instant },
  },
}

// Card variants with lift and glow
export const cardVariants: Variants = {
  rest: {
    y: 0,
    boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
  },
  hover: {
    y: -8,
    boxShadow: '0 16px 48px rgba(0, 0, 0, 0.4), 0 0 40px rgba(64, 255, 170, 0.1)',
    transition: springs.gentle,
  },
}

// Page transition variants - subtle fade only, no jarring movements
export const pageVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: { duration: 0.2, ease: easings.smooth },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15, ease: easings.smoothOut },
  },
}

// Modal/dialog variants
export const modalOverlayVariants: Variants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: transitions.standard,
  },
  exit: {
    opacity: 0,
    transition: transitions.micro,
  },
}

export const modalContentVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
    y: 10,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springs.snappy,
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: 5,
    transition: transitions.micro,
  },
}

// Toast variants
export const toastVariants: Variants = {
  initial: {
    opacity: 0,
    x: 100,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: springs.snappy,
  },
  exit: {
    opacity: 0,
    x: 50,
    scale: 0.95,
    transition: transitions.standard,
  },
}

// Badge pop-in variants
export const badgeVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.8,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: springs.bouncy,
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: transitions.micro,
  },
}

// Select dropdown variants
export const selectContentVariants: Variants = {
  initial: {
    opacity: 0,
    y: -10,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      ...springs.snappy,
      staggerChildren: 0.03,
    },
  },
  exit: {
    opacity: 0,
    y: -5,
    scale: 0.98,
    transition: transitions.micro,
  },
}

export const selectItemVariants: Variants = {
  initial: { opacity: 0, x: -10 },
  animate: {
    opacity: 1,
    x: 0,
    transition: transitions.micro,
  },
}

// Utility function for lerp (linear interpolation)
export function lerp(start: number, end: number, factor: number): number {
  return start + (end - start) * factor
}

// Utility to clamp values
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

// Map a value from one range to another
export function mapRange(
  value: number,
  inputMin: number,
  inputMax: number,
  outputMin: number,
  outputMax: number
): number {
  return outputMin + ((value - inputMin) / (inputMax - inputMin)) * (outputMax - outputMin)
}
