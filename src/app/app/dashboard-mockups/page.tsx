'use client'

/**
 * DASHBOARD MOCKUP SELECTOR
 * View and compare all 5 dashboard designs
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { GlassCard } from '@/components/ui/glass-card'
import {
  LayoutDashboard,
  Target,
  BarChart3,
  Columns,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Check,
} from 'lucide-react'

// Import mockups
import MockupCommandCenter from './mockup-1-command-center'
import MockupFocusMode from './mockup-2-focus-mode'
import MockupAnalyticsDashboard from './mockup-3-analytics-dashboard'
import MockupKanbanStyle from './mockup-4-kanban-style'
import MockupAIAssistant from './mockup-5-ai-assistant'
import MockupCommandAIChat from './mockup-6-command-ai-chat'
import MockupCommandAIInline from './mockup-7-command-ai-inline'
import MockupCommandAIHero from './mockup-8-command-ai-hero'

const mockups = [
  {
    id: 1,
    name: 'Command Center',
    description: 'Mission-control style with bento grid, circular progress rings, and funding potential hero card',
    icon: LayoutDashboard,
    features: ['Bento grid layout', 'Circular progress indicators', 'Timeline activity feed', 'Deadline urgency cards'],
    component: MockupCommandCenter,
  },
  {
    id: 2,
    name: 'Focus Mode',
    description: 'Minimal, zen-like design centered around your next action with journey progress visualization',
    icon: Target,
    features: ['Single priority action', 'Journey progress steps', 'Clean card stack', 'Floating action button'],
    component: MockupFocusMode,
  },
  {
    id: 3,
    name: 'Analytics Dashboard',
    description: 'Data-rich view with sparklines, metrics, charts, and performance tracking tables',
    icon: BarChart3,
    features: ['Sparkline charts', 'Monthly trends', 'Funding distribution', 'Submission tracking'],
    component: MockupAnalyticsDashboard,
  },
  {
    id: 4,
    name: 'Kanban Board',
    description: 'Trello-inspired horizontal swim lanes tracking grants through discovery to award stages',
    icon: Columns,
    features: ['Horizontal swim lanes', 'Stage-based organization', 'Match scores', 'Quick filters'],
    component: MockupKanbanStyle,
  },
  {
    id: 5,
    name: 'AI Assistant',
    description: 'AI-forward design with smart recommendations, chat interface, and personalized matches',
    icon: Sparkles,
    features: ['AI chat interface', 'Smart recommendations', 'Personalized matches', 'Quick commands'],
    component: MockupAIAssistant,
  },
  {
    id: 6,
    name: 'Command + AI Sidebar',
    description: 'Command Center bento grid with a collapsible AI chat panel on the right side',
    icon: LayoutDashboard,
    features: ['Full bento grid layout', 'Persistent AI chat sidebar', 'Quick suggestions', 'Collapsible panel'],
    component: MockupCommandAIChat,
    isNew: true,
  },
  {
    id: 7,
    name: 'Command + AI Inline',
    description: 'AI command bar at top with recommendation cards woven into the bento grid',
    icon: Sparkles,
    features: ['AI command bar', 'Inline AI recommendation cards', 'Progress + deadlines', 'AI stats panel'],
    component: MockupCommandAIInline,
    isNew: true,
  },
  {
    id: 8,
    name: 'Command + AI Hero',
    description: 'AI-powered "Next Best Action" as hero section with bento stats below',
    icon: Target,
    features: ['AI hero action card', 'Inline AI suggestions', 'Quick insight pills', 'Expandable chat'],
    component: MockupCommandAIHero,
    isNew: true,
  },
]

export default function DashboardMockupsPage() {
  const [selectedMockup, setSelectedMockup] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'preview'>('grid')

  const CurrentMockup = selectedMockup !== null ? mockups[selectedMockup].component : null

  return (
    <div className="min-h-screen">
      <AnimatePresence mode="wait">
        {viewMode === 'grid' ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-8"
          >
            {/* Header */}
            <div className="mb-8">
              <Badge variant="outline" className="mb-4">Dashboard Mockups</Badge>
              <h1 className="font-serif text-display text-pulse-text mb-2">
                Choose Your Dashboard Style
              </h1>
              <p className="text-pulse-text-secondary text-lg">
                Click on any mockup to preview it full-screen. All designs follow the Pulse Grid theme.
              </p>
            </div>

            {/* Mockup Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockups.map((mockup, index) => {
                const Icon = mockup.icon
                return (
                  <motion.div
                    key={mockup.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <GlassCard
                      interactive
                      className="p-6 cursor-pointer h-full"
                      onClick={() => {
                        setSelectedMockup(index)
                        setViewMode('preview')
                      }}
                    >
                      {/* Icon & Number */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-pulse-accent/10 border border-pulse-accent/20 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-pulse-accent" />
                        </div>
                        <div className="flex items-center gap-2">
                          {'isNew' in mockup && mockup.isNew && (
                            <Badge variant="success">New</Badge>
                          )}
                          <span className="text-4xl font-serif text-pulse-text-tertiary">
                            {mockup.id}
                          </span>
                        </div>
                      </div>

                      {/* Name & Description */}
                      <h3 className="text-xl font-semibold text-pulse-text mb-2">
                        {mockup.name}
                      </h3>
                      <p className="text-sm text-pulse-text-secondary mb-4">
                        {mockup.description}
                      </p>

                      {/* Features */}
                      <div className="space-y-2">
                        {mockup.features.map((feature) => (
                          <div key={feature} className="flex items-center gap-2 text-sm text-pulse-text-tertiary">
                            <Check className="w-4 h-4 text-pulse-accent" />
                            {feature}
                          </div>
                        ))}
                      </div>

                      {/* Preview Button */}
                      <Button variant="outline" className="w-full mt-6">
                        Preview Mockup
                      </Button>
                    </GlassCard>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen"
          >
            {/* Preview Header */}
            <div className="fixed top-0 left-64 right-0 z-50 bg-pulse-bg/80 backdrop-blur-xl border-b border-pulse-border">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Back to Selection
                  </Button>

                  <div className="h-6 w-px bg-pulse-border" />

                  <span className="text-sm text-pulse-text-secondary">
                    Previewing:
                  </span>
                  <Badge variant="default">
                    {selectedMockup !== null && mockups[selectedMockup].name}
                  </Badge>
                </div>

                {/* Navigation */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedMockup(prev => prev !== null ? Math.max(0, prev - 1) : 0)}
                    disabled={selectedMockup === 0}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>

                  <span className="text-sm text-pulse-text-secondary px-2">
                    {selectedMockup !== null ? selectedMockup + 1 : 1} / {mockups.length}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedMockup(prev => prev !== null ? Math.min(mockups.length - 1, prev + 1) : 0)}
                    disabled={selectedMockup === mockups.length - 1}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Mockup Content */}
            <div className="pt-16">
              {CurrentMockup && <CurrentMockup />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
