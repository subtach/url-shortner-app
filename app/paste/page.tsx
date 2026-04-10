'use client'

import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { PasteForm } from '@/components/paste-form'
import { PasteResultCard } from '@/components/paste-result-card'
import type { CodePaste } from '@/lib/types'
import { Code2, Share2, Shield } from 'lucide-react'

export default function PastePage() {
  const [result, setResult] = useState<CodePaste | null>(null)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex flex-1 flex-col items-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Hero */}
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
              Share your code,
              <br />
              <span className="text-primary">instantly, anywhere</span>
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Paste code, pick a language, and get a short shareable link — with syntax highlighting and a QR code.
            </p>
          </div>

          {/* Paste Form */}
          <PasteForm onSuccess={(paste) => setResult(paste)} />

          {/* Result */}
          {result && (
            <div className="mt-5">
              <PasteResultCard paste={result} />
            </div>
          )}

          {/* Features */}
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col items-center text-center">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
                <Code2 className="h-5 w-5 text-foreground" />
              </div>
              <span className="text-xs font-medium text-foreground">30+ Languages</span>
              <span className="text-[11px] text-muted-foreground mt-0.5">Syntax highlighting</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/40">
                <Share2 className="h-5 w-5 text-foreground" />
              </div>
              <span className="text-xs font-medium text-foreground">Short Links</span>
              <span className="text-[11px] text-muted-foreground mt-0.5">+ QR code</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/50">
                <Shield className="h-5 w-5 text-foreground" />
              </div>
              <span className="text-xs font-medium text-foreground">Auto-Expiry</span>
              <span className="text-[11px] text-muted-foreground mt-0.5">Time-limited pastes</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
