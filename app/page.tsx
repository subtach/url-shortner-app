'use client'

import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { ShortenForm } from '@/components/shorten-form'
import { ResultCard } from '@/components/result-card'
import type { ShortenedLink } from '@/lib/types'
import { Link2, BarChart3, Shield } from 'lucide-react'

export default function HomePage() {
  const [result, setResult] = useState<ShortenedLink | null>(null)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          {/* Hero */}
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
              Shorten your links,
              <br />
              <span className="text-primary">amplify your reach</span>
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Create short, memorable links in seconds. Track clicks and manage everything from one dashboard.
            </p>
          </div>

          {/* Shorten Form */}
          <ShortenForm onSuccess={(link) => setResult(link)} />

          {/* Result */}
          {result && (
            <div className="mt-5">
              <ResultCard link={result} />
            </div>
          )}

          {/* Features */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col items-center text-center">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
                <Link2 className="h-5 w-5 text-foreground" />
              </div>
              <span className="text-xs font-medium text-foreground">Custom Links</span>
              <span className="text-[11px] text-muted-foreground mt-0.5">Your own aliases</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/40">
                <BarChart3 className="h-5 w-5 text-foreground" />
              </div>
              <span className="text-xs font-medium text-foreground">Click Tracking</span>
              <span className="text-[11px] text-muted-foreground mt-0.5">Real-time analytics</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/50">
                <Shield className="h-5 w-5 text-foreground" />
              </div>
              <span className="text-xs font-medium text-foreground">Link Expiry</span>
              <span className="text-[11px] text-muted-foreground mt-0.5">Auto-expire links</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
