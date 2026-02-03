import { LucideIcon, Search, Bookmark, FolderOpen, Bell, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
}

export function EmptyState({ icon: Icon = AlertCircle, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-pulse-surface border border-pulse-border flex items-center justify-center mb-6">
        <Icon className="w-8 h-8 text-pulse-text-tertiary" />
      </div>
      <h3 className="text-lg font-medium text-pulse-text mb-2">{title}</h3>
      <p className="text-sm text-pulse-text-secondary max-w-md mb-6">{description}</p>
      {action && (
        action.href ? (
          <Button asChild>
            <Link href={action.href}>{action.label}</Link>
          </Button>
        ) : (
          <Button onClick={action.onClick}>{action.label}</Button>
        )
      )}
    </div>
  )
}

// Pre-configured empty states
export function NoSearchResults() {
  return (
    <EmptyState
      icon={Search}
      title="No grants found"
      description="Try adjusting your search terms or filters to find more results."
    />
  )
}

export function NoSavedGrants() {
  return (
    <EmptyState
      icon={Bookmark}
      title="No saved grants yet"
      description="When you find grants you're interested in, save them here to track and compare."
      action={{ label: 'Discover Grants', href: '/app/discover' }}
    />
  )
}

export function NoWorkspaces() {
  return (
    <EmptyState
      icon={FolderOpen}
      title="No workspaces yet"
      description="Create a workspace when you're ready to start applying to a grant. Track documents, checklists, and progress."
      action={{ label: 'Find a Grant', href: '/app/discover' }}
    />
  )
}

export function NoSavedSearches() {
  return (
    <EmptyState
      icon={Bell}
      title="No saved searches"
      description="Save your searches to get notified when new matching grants are posted."
      action={{ label: 'Search Grants', href: '/app/discover' }}
    />
  )
}
