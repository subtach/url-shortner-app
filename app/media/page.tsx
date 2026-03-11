'use client'

import { useState } from 'react'
import { Navbar } from '@/components/navbar'
import { MediaUploadForm } from '@/components/media-upload-form'
import { MediaResultCard } from '@/components/media-result-card'
import type { MediaShare } from '@/lib/types'
import { ImageIcon, QrCode, Shield } from 'lucide-react'

export default function MediaPage() {
  const [result, setResult] = useState<MediaShare | null>(null)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex flex-1 flex-col items-center px-4 py-12">
        <div className="w-full max-w-2xl">
          {/* Hero */}
          <div className="mb-8 text-center">
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
              Share images,
              <br />
              <span className="text-primary">instantly, with anyone</span>
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Upload an image and get a short link + QR code — no account needed.
            </p>
          </div>

          {/* Upload Form */}
          <MediaUploadForm onSuccess={(media) => setResult(media)} />

          {/* Result */}
          {result && (
            <div className="mt-5">
              <MediaResultCard media={result} />
            </div>
          )}

          {/* Features */}
          <div className="mt-12 grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center text-center">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">
                <ImageIcon className="h-5 w-5 text-foreground" />
              </div>
              <span className="text-xs font-medium text-foreground">Any Image</span>
              <span className="text-[11px] text-muted-foreground mt-0.5">JPEG, PNG, GIF, WebP…</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/40">
                <QrCode className="h-5 w-5 text-foreground" />
              </div>
              <span className="text-xs font-medium text-foreground">Short Link + QR</span>
              <span className="text-[11px] text-muted-foreground mt-0.5">Scannable & shareable</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/50">
                <Shield className="h-5 w-5 text-foreground" />
              </div>
              <span className="text-xs font-medium text-foreground">Auto-Expiry</span>
              <span className="text-[11px] text-muted-foreground mt-0.5">Time-limited links</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
