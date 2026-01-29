import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Pulse Grid Design System
        pulse: {
          bg: '#0a0a0b',
          surface: '#111113',
          elevated: '#1a1a1d',
          border: 'rgba(255, 255, 255, 0.06)',
          'border-hover': 'rgba(255, 255, 255, 0.12)',
          accent: '#40ffaa',
          'accent-dim': 'rgba(64, 255, 170, 0.15)',
          'accent-glow': 'rgba(64, 255, 170, 0.25)',
          text: '#fafafa',
          'text-secondary': 'rgba(250, 250, 250, 0.6)',
          'text-tertiary': 'rgba(250, 250, 250, 0.4)',
          success: '#40ffaa',
          warning: '#ffb340',
          error: '#ff4040',
        },
      },
      fontFamily: {
        serif: ['Instrument Serif', 'Georgia', 'serif'],
        mono: ['Geist Mono', 'JetBrains Mono', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['5rem', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        'display-lg': ['4rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display': ['3rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'heading-lg': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'heading': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.01em' }],
        'heading-sm': ['1.25rem', { lineHeight: '1.4' }],
        'body-lg': ['1.125rem', { lineHeight: '1.7' }],
        'body': ['1rem', { lineHeight: '1.6' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        'caption': ['0.75rem', { lineHeight: '1.4' }],
        'micro': ['0.65rem', { lineHeight: '1.3', letterSpacing: '0.1em' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.25rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        'pulse': '0 0 40px rgba(64, 255, 170, 0.1)',
        'pulse-lg': '0 0 60px rgba(64, 255, 170, 0.15)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 8px 40px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse-slow 4s ease-in-out infinite',
        'pulse-grid': 'pulse-grid 3s ease-in-out infinite',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'slide-up': 'slide-up 0.5s ease-out forwards',
        'glow': 'glow 2s ease-in-out infinite',
        'scan-line': 'scan-line 2s ease-in-out infinite',
      },
      keyframes: {
        'scan-line': {
          '0%, 100%': { transform: 'translateY(-12px)', opacity: '0' },
          '10%': { opacity: '1' },
          '50%': { transform: 'translateY(12px)', opacity: '1' },
          '90%': { opacity: '1' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '0.3' },
          '50%': { opacity: '0.6' },
        },
        'pulse-grid': {
          '0%, 100%': { opacity: '0.02', transform: 'scale(1)' },
          '50%': { opacity: '0.05', transform: 'scale(1.02)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(64, 255, 170, 0.1)' },
          '50%': { boxShadow: '0 0 40px rgba(64, 255, 170, 0.2)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'pulse-gradient': 'radial-gradient(ellipse at center, rgba(64, 255, 170, 0.08), transparent 50%)',
      },
    },
  },
  plugins: [],
}
export default config
