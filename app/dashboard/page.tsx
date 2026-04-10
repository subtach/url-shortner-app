'use client'

import { useState, useEffect, useCallback } from 'react'
import { useUser } from '@clerk/nextjs'
import { Navbar } from '@/components/navbar'
import type { ShortenedLink, CodePaste, MediaShare, DashboardData } from '@/lib/types'
import {
  Link2, Code2, ImageIcon, Loader2, Trash2,
  BarChart3, MousePointerClick, ExternalLink,
  Copy, Check, TrendingUp, Calendar, Clock
} from 'lucide-react'
import Link from 'next/link'

type TabType = 'links' | 'pastes' | 'media'

export default function DashboardPage() {
  const { user, isLoaded } = useUser()
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('links')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/dashboard')
      const response = await res.json()
      if (response.success) {
        setData(response.data)
      }
    } catch {
      // Network error
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (isLoaded && user) {
      fetchDashboard()
    }
  }, [isLoaded, user, fetchDashboard])

  async function handleDelete(id: string, type: TabType) {
    const typeMap = { links: 'link', pastes: 'paste', media: 'media' } as const
    try {
      const res = await fetch('/api/dashboard', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type: typeMap[type] }),
      })
      const result = await res.json()
      if (result.success && data) {
        setData({
          ...data,
          links: type === 'links' ? data.links.filter((l) => l.id !== id) : data.links,
          pastes: type === 'pastes' ? data.pastes.filter((p) => p.id !== id) : data.pastes,
          mediaShares: type === 'media' ? data.mediaShares.filter((m) => m.id !== id) : data.mediaShares,
          stats: {
            ...data.stats,
            totalLinks: type === 'links' ? data.stats.totalLinks - 1 : data.stats.totalLinks,
            totalPastes: type === 'pastes' ? data.stats.totalPastes - 1 : data.stats.totalPastes,
            totalMedia: type === 'media' ? data.stats.totalMedia - 1 : data.stats.totalMedia,
          },
        })
      }
    } catch {
      // Network error
    }
  }

  function handleCopy(text: string, id: string) {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    })
  }

  function formatRelative(date: string) {
    const diff = Date.now() - new Date(date).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 60) return `${mins}m ago`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}d ago`
    return formatDate(date)
  }

  if (!isLoaded || isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex flex-1 items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  const stats = data?.stats
  const tabConfig = [
    { key: 'links' as TabType, label: 'Links', icon: Link2, count: stats?.totalLinks ?? 0 },
    { key: 'pastes' as TabType, label: 'Pastes', icon: Code2, count: stats?.totalPastes ?? 0 },
    { key: 'media' as TabType, label: 'Media', icon: ImageIcon, count: stats?.totalMedia ?? 0 },
  ]

  const hasContent = (stats?.totalLinks ?? 0) + (stats?.totalPastes ?? 0) + (stats?.totalMedia ?? 0) > 0

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-5xl px-4 py-6 sm:py-8">
        {/* Profile Header */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            {user?.imageUrl && (
              <div className="relative">
                <img
                  src={user.imageUrl}
                  alt={user.fullName || 'User avatar'}
                  className="h-14 w-14 rounded-2xl border-2 border-primary/30 shadow-md"
                />
                <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-card" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
                Welcome back{user?.firstName ? `, ${user.firstName}` : ''}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                {user?.primaryEmailAddress?.emailAddress || 'Manage your shortened links and content'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Total Links"
            value={stats?.totalLinks ?? 0}
            icon={<Link2 className="h-4 w-4" />}
            color="primary"
          />
          <StatCard
            label="Total Pastes"
            value={stats?.totalPastes ?? 0}
            icon={<Code2 className="h-4 w-4" />}
            color="secondary"
          />
          <StatCard
            label="Media Files"
            value={stats?.totalMedia ?? 0}
            icon={<ImageIcon className="h-4 w-4" />}
            color="accent"
          />
          <StatCard
            label="Total Clicks"
            value={stats?.totalClicks ?? 0}
            icon={<MousePointerClick className="h-4 w-4" />}
            color="highlight"
          />
        </div>

        {!hasContent ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-16 px-6 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-foreground">No content yet</h2>
            <p className="mb-6 text-sm text-muted-foreground max-w-sm">
              Start creating shortened links, code pastes, or media shares. Everything you create while signed in will appear here.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-95 active:scale-95"
              >
                <Link2 className="h-4 w-4" />
                Shorten a URL
              </Link>
              <Link
                href="/paste"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-muted active:scale-95"
              >
                <Code2 className="h-4 w-4" />
                Create a Paste
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="mb-6 flex items-center gap-1 rounded-xl bg-muted p-1 overflow-x-auto">
              {tabConfig.map(({ key, label, icon: Icon, count }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex-1 min-w-0 inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                    activeTab === key
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{label}</span>
                  <span className={`ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                    activeTab === key
                      ? 'bg-primary/15 text-primary'
                      : 'bg-muted-foreground/10 text-muted-foreground'
                  }`}>
                    {count}
                  </span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="animate-fade-in">
              {activeTab === 'links' && (
                <ContentSection
                  emptyText="No shortened links yet"
                  emptyIcon={<Link2 className="h-7 w-7 text-muted-foreground" />}
                  emptyHref="/"
                  emptyLabel="Shorten a URL"
                  items={data?.links ?? []}
                  renderItem={(link: ShortenedLink) => (
                    <ItemCard
                      key={link.id}
                      id={link.id}
                      title={link.shortUrl}
                      subtitle={link.originalUrl}
                      clicks={link.clicks}
                      createdAt={link.createdAt}
                      expiresAt={link.expiresAt}
                      isExpired={link.isExpired}
                      shortUrl={link.shortUrl}
                      onDelete={() => handleDelete(link.id, 'links')}
                      onCopy={() => handleCopy(link.shortUrl, link.id)}
                      isCopied={copiedId === link.id}
                      formatRelative={formatRelative}
                      formatDate={formatDate}
                    />
                  )}
                />
              )}
              {activeTab === 'pastes' && (
                <ContentSection
                  emptyText="No code pastes yet"
                  emptyIcon={<Code2 className="h-7 w-7 text-muted-foreground" />}
                  emptyHref="/paste"
                  emptyLabel="Create a Paste"
                  items={data?.pastes ?? []}
                  renderItem={(paste: CodePaste) => (
                    <ItemCard
                      key={paste.id}
                      id={paste.id}
                      title={paste.title || paste.shortCode}
                      subtitle={`${paste.language} • ${paste.shortUrl}`}
                      clicks={paste.clicks}
                      createdAt={paste.createdAt}
                      expiresAt={paste.expiresAt}
                      isExpired={paste.isExpired}
                      shortUrl={paste.shortUrl}
                      onDelete={() => handleDelete(paste.id, 'pastes')}
                      onCopy={() => handleCopy(paste.shortUrl, paste.id)}
                      isCopied={copiedId === paste.id}
                      formatRelative={formatRelative}
                      formatDate={formatDate}
                      badge={paste.language}
                    />
                  )}
                />
              )}
              {activeTab === 'media' && (
                <ContentSection
                  emptyText="No media shares yet"
                  emptyIcon={<ImageIcon className="h-7 w-7 text-muted-foreground" />}
                  emptyHref="/media"
                  emptyLabel="Upload Media"
                  items={data?.mediaShares ?? []}
                  renderItem={(media: MediaShare) => (
                    <ItemCard
                      key={media.id}
                      id={media.id}
                      title={media.title || media.filename}
                      subtitle={`${(media.sizeBytes / 1024).toFixed(1)} KB • ${media.mimeType}`}
                      clicks={media.clicks}
                      createdAt={media.createdAt}
                      expiresAt={media.expiresAt}
                      isExpired={media.isExpired}
                      shortUrl={media.shortUrl}
                      onDelete={() => handleDelete(media.id, 'media')}
                      onCopy={() => handleCopy(media.shortUrl, media.id)}
                      isCopied={copiedId === media.id}
                      formatRelative={formatRelative}
                      formatDate={formatDate}
                    />
                  )}
                />
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatCard({ label, value, icon, color }: {
  label: string
  value: number
  icon: React.ReactNode
  color: 'primary' | 'secondary' | 'accent' | 'highlight'
}) {
  const bgMap = {
    primary: 'bg-primary/10',
    secondary: 'bg-secondary/10',
    accent: 'bg-accent/10',
    highlight: 'bg-highlight/10',
  }
  const iconBgMap = {
    primary: 'bg-primary/20 text-primary',
    secondary: 'bg-secondary/20 text-secondary',
    accent: 'bg-accent/20 text-accent',
    highlight: 'bg-highlight/20 text-highlight',
  }

  return (
    <div className={`rounded-2xl border border-border ${bgMap[color]} p-4 transition-all hover:shadow-md`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${iconBgMap[color]}`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-foreground tabular-nums">{value}</p>
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mt-0.5">{label}</p>
    </div>
  )
}

function ContentSection<T>({ items, renderItem, emptyText, emptyIcon, emptyHref, emptyLabel }: {
  items: T[]
  renderItem: (item: T) => React.ReactNode
  emptyText: string
  emptyIcon: React.ReactNode
  emptyHref: string
  emptyLabel: string
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-14 px-4 text-center">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          {emptyIcon}
        </div>
        <p className="mb-1 text-base font-semibold text-foreground">{emptyText}</p>
        <p className="mb-5 text-sm text-muted-foreground">Create some while signed in to see them here</p>
        <Link
          href={emptyHref}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-95 active:scale-95"
        >
          {emptyLabel}
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map(renderItem)}
    </div>
  )
}

function ItemCard({
  id, title, subtitle, clicks, createdAt, expiresAt, isExpired,
  shortUrl, onDelete, onCopy, isCopied, formatRelative, formatDate, badge,
}: {
  id: string
  title: string
  subtitle: string
  clicks: number
  createdAt: string
  expiresAt: string | null
  isExpired: boolean
  shortUrl: string
  onDelete: () => void
  onCopy: () => void
  isCopied: boolean
  formatRelative: (d: string) => string
  formatDate: (d: string) => string
  badge?: string
}) {
  return (
    <div className={`group rounded-2xl border bg-card p-4 transition-all hover:shadow-md ${
      isExpired ? 'border-expired/30 opacity-70' : 'border-border'
    }`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="font-semibold text-foreground truncate text-sm">
              {title}
            </h3>
            {isExpired && (
              <span className="inline-flex items-center rounded-md bg-expired/15 px-2 py-0.5 text-[10px] font-bold text-expired uppercase tracking-wide">
                Expired
              </span>
            )}
            {badge && !isExpired && (
              <span className="inline-flex items-center rounded-md bg-secondary/15 px-2 py-0.5 text-[10px] font-bold text-secondary uppercase tracking-wide">
                {badge}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">{subtitle}</p>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-3 mt-2.5 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MousePointerClick className="h-3 w-3" />
              {clicks} click{clicks !== 1 ? 's' : ''}
            </span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatRelative(createdAt)}
            </span>
            {expiresAt && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Expires {formatDate(expiresAt)}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onCopy}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Copy short URL"
          >
            {isCopied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
          </button>
          <a
            href={shortUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Open link"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <button
            onClick={onDelete}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
