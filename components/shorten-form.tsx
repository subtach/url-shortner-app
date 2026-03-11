'use client'

import { useState } from 'react'
import { Link, Calendar, Zap, Loader2 } from 'lucide-react'
import type { ShortenedLink, ShortenResponse } from '@/lib/types'

interface ShortenFormProps {
  onSuccess: (link: ShortenedLink) => void
}

export function ShortenForm({ onSuccess }: ShortenFormProps) {
  const [url, setUrl] = useState('')
  const [alias, setAlias] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!url.trim()) {
      setError('Please enter a URL')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          customAlias: alias.trim() || undefined,
          expiresAt: expiresAt || undefined,
        }),
      })
      var response: ShortenResponse = await res.json()
    } catch {
      setIsLoading(false)
      setError('Network error. Please try again.')
      return
    }

    setIsLoading(false)

    if (response.success && response.data) {
      onSuccess(response.data)
      setUrl('')
      setAlias('')
      setExpiresAt('')
    } else {
      setError(response.error || 'Something went wrong')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-3">
      {/* URL Input */}
      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <Link className="h-5 w-5" />
        </div>
        <input
          type="text"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value)
            if (error) setError('')
          }}
          placeholder="Paste your long URL here..."
          className="h-12 w-full rounded-lg border border-border bg-card pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors"
          aria-label="URL to shorten"
        />
      </div>

      {/* Optional Fields */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Zap className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={alias}
            onChange={(e) => setAlias(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
            placeholder="Custom alias (optional)"
            className="h-12 w-full rounded-lg border border-border bg-card pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors"
            aria-label="Custom alias"
          />
        </div>
        <div className="relative flex-1">
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
          </div>
          <input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="h-12 w-full rounded-lg border border-border bg-card pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors"
            aria-label="Expiry date"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <p className="text-sm text-destructive font-medium animate-fade-in" role="alert">
          {error}
        </p>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-all hover:brightness-95 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Shortening...
          </>
        ) : (
          'Shorten URL'
        )}
      </button>
    </form>
  )
}
