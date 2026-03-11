'use client'

import { useState } from 'react'
import { QrCode, Calendar, ExternalLink } from 'lucide-react'
import { CopyButton } from './copy-button'
import { QRCodeModal } from './qr-code-modal'
import type { ShortenedLink } from '@/lib/types'

interface ResultCardProps {
  link: ShortenedLink
}

export function ResultCard({ link }: ResultCardProps) {
  const [qrOpen, setQrOpen] = useState(false)

  return (
    <>
      <div className="w-full rounded-xl border border-border bg-card p-5 animate-scale-in">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent">
            <ExternalLink className="h-3.5 w-3.5 text-accent-foreground" />
          </div>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Your short link is ready
          </span>
        </div>

        <p className="mb-3 text-lg font-bold text-foreground break-all">
          {link.shortUrl}
        </p>

        <p className="mb-4 text-sm text-muted-foreground break-all line-clamp-1">
          {link.originalUrl}
        </p>

        {link.expiresAt && (
          <div className="mb-4 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              Expires{' '}
              {new Date(link.expiresAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        )}

        <div className="flex gap-2">
          <CopyButton text={link.shortUrl} className="flex-1" />
          <button
            onClick={() => setQrOpen(true)}
            className="inline-flex min-h-[48px] items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground transition-all hover:brightness-95 active:scale-95"
          >
            <QrCode className="h-4 w-4" />
            <span>QR Code</span>
          </button>
        </div>
      </div>

      <QRCodeModal
        url={link.shortUrl}
        isOpen={qrOpen}
        onClose={() => setQrOpen(false)}
      />
    </>
  )
}
