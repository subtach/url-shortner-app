'use client'

import { useState } from 'react'
import { ExternalLink, QrCode, Eye } from 'lucide-react'
import { CopyButton } from './copy-button'
import { QRCodeModal } from './qr-code-modal'
import type { CodePaste } from '@/lib/types'
import Link from 'next/link'

interface PasteResultCardProps {
  paste: CodePaste
}

export function PasteResultCard({ paste }: PasteResultCardProps) {
  const [qrOpen, setQrOpen] = useState(false)

  const langLabel = paste.language.charAt(0).toUpperCase() + paste.language.slice(1)

  return (
    <>
      <div className="w-full rounded-xl border border-border bg-card p-5 animate-scale-in">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent">
            <ExternalLink className="h-3.5 w-3.5 text-accent-foreground" />
          </div>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Your paste link is ready
          </span>
          <span className="ml-auto rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-primary">
            {langLabel}
          </span>
        </div>

        {paste.title && (
          <p className="mb-1 text-sm font-semibold text-foreground">{paste.title}</p>
        )}

        <p className="mb-3 text-lg font-bold text-foreground break-all">
          {paste.shortUrl}
        </p>

        <div className="flex flex-wrap gap-2">
          <CopyButton text={paste.shortUrl} className="flex-1" />
          <Link
            href={`/paste/${paste.shortCode}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-[48px] items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground transition-all hover:brightness-95 active:scale-95"
          >
            <Eye className="h-4 w-4" />
            <span>View</span>
          </Link>
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
        url={paste.shortUrl}
        isOpen={qrOpen}
        onClose={() => setQrOpen(false)}
      />
    </>
  )
}
