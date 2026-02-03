'use client'

import * as React from 'react'
import { Search, Target, FolderOpen, Bell, Zap, Shield } from 'lucide-react'
import { FeatureCard, BentoCard } from '@/components/ui/feature-card'
import { Section, SectionHeader, BentoGrid } from '@/components/ui/section'

const mainFeatures = [
  {
    icon: Search,
    title: 'Intelligent Discovery',
    description: 'AI-powered search across federal, state, local, nonprofit, and private funding sources. Surface opportunities you would have missed.',
  },
  {
    icon: Target,
    title: 'Precision Matching',
    description: 'Tell us about your organization and goals. We analyze eligibility requirements and surface grants with the highest success probability.',
  },
  {
    icon: FolderOpen,
    title: 'Application Workspace',
    description: 'Organize applications with checklists, document tracking, deadline management, and progress monitoring in one unified workspace.',
  },
  {
    icon: Bell,
    title: 'Smart Alerts',
    description: 'Save searches and get notified when new grants match your criteria. Automatic deadline reminders keep applications on track.',
  },
]

const additionalFeatures = [
  {
    icon: Zap,
    title: 'Real-Time Updates',
    description: 'Our data pipeline runs continuously, pulling the latest grants from 50+ sources. New opportunities appear within hours of publication.',
  },
  {
    icon: Shield,
    title: 'Secure & Private',
    description: 'Enterprise-grade security with encrypted data storage. Your organization information and search history remain completely private.',
  },
]

export function FeaturesSection() {
  return (
    <Section className="bg-gradient-to-b from-transparent via-pulse-surface/20 to-transparent">
      <SectionHeader
        eyebrow="How It Works"
        title="From discovery to application, simplified"
        description="Grants By AI combines comprehensive data with intelligent analysis to help you find and win funding."
      />

      {/* Bento grid layout for visual interest */}
      <BentoGrid className="mb-12">
        {/* Large feature card */}
        <BentoCard
          icon={Search}
          title="Intelligent Discovery"
          description="AI-powered search across federal, state, local, nonprofit, and private funding sources. Our algorithms understand context and surface opportunities traditional keyword search would miss."
          size="large"
        >
          {/* Visual element inside the card */}
          <div className="mt-4 p-4 rounded-xl bg-pulse-bg/50 border border-pulse-border/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-pulse-accent/10 flex items-center justify-center">
                <Search className="w-4 h-4 text-pulse-accent" />
              </div>
              <span className="text-sm text-pulse-text-secondary">Sample search query</span>
            </div>
            <div className="font-mono text-sm text-pulse-text bg-pulse-surface/50 rounded-lg p-3 border border-pulse-border/20">
              "renewable energy nonprofit California under $500K"
            </div>
            <div className="mt-3 text-xs text-pulse-accent">
              → 847 matching grants found
            </div>
          </div>
        </BentoCard>

        {/* Standard cards */}
        <BentoCard
          icon={Target}
          title="Precision Matching"
          description="Define your organization profile once. We continuously match you against new opportunities and score each grant on likelihood of success."
        />

        <BentoCard
          icon={FolderOpen}
          title="Application Workspace"
          description="Track every application from discovery to submission. Manage documents, deadlines, and team collaboration in one place."
        />

        {/* Wide card */}
        <BentoCard
          icon={Bell}
          title="Smart Alerts & Saved Searches"
          description="Create custom alerts for specific categories, agencies, or funding ranges. Get notified when matching grants are published so you have time to prepare."
          size="wide"
        >
          <div className="flex flex-wrap gap-2 mt-4">
            {['Education Grants', 'Technology', 'Under $100K', 'California'].map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-xs font-medium bg-pulse-accent/10 text-pulse-accent border border-pulse-accent/20"
              >
                {tag}
              </span>
            ))}
          </div>
        </BentoCard>
      </BentoGrid>

      {/* Additional features row */}
      <div className="grid md:grid-cols-2 gap-6">
        {additionalFeatures.map((feature) => (
          <FeatureCard
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>
    </Section>
  )
}
