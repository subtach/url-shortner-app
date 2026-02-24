'use client'

import { useState, useEffect, useCallback } from 'react'
import { Navbar } from '@/components/navbar'
import { LinkTable } from '@/components/link-table'
import { LinkCard } from '@/components/link-card'
import type { ShortenedLink } from '@/lib/types'
import { Link2, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const [links, setLinks] = useState<ShortenedLink[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchLinks = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/links')
      const response = await res.json()
      if (response.success) {
        setLinks(response.data)
      }
    } catch {
      // Network error
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    fetchLinks()
  }, [fetchLinks])

  async function handleDelete(id: string) {
    try {
      const res = await fetch('/api/links', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const result = await res.json()
      if (result.success) {
        setLinks((prev) => prev.filter((l) => l.id !== id))
      }
    } catch {
      // Network error
    }
  }

  const activeLinks = links.filter((l) => !l.isExpired)
  const totalClicks = links.reduce((sum, l) => sum + l.clicks, 0)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage and track all your shortened links
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Links</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{links.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Active</p>
            <p className="mt-1 text-2xl font-bold text-primary">{activeLinks.length}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Clicks</p>
            <p className="mt-1 text-2xl font-bold text-foreground">{totalClicks}</p>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : links.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card py-16 px-4 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <Link2 className="h-7 w-7 text-muted-foreground" />
            </div>
            <h2 className="mb-1 text-lg font-bold text-foreground">No links yet</h2>
            <p className="mb-5 text-sm text-muted-foreground">
              Create your first shortened link to get started
            </p>
            <Link
              href="/"
              className="inline-flex min-h-[48px] items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition-all hover:brightness-95 active:scale-95"
            >
              Shorten a URL
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <LinkTable links={links} onDelete={handleDelete} />
            </div>

            {/* Mobile Cards */}
            <div className="flex flex-col gap-3 md:hidden">
              {links.map((link) => (
                <LinkCard key={link.id} link={link} onDelete={handleDelete} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
