'use client'

import { useState } from 'react'
import { ExternalLink, QrCode, Eye, ImageIcon } from 'lucide-react'
import { CopyButton } from './copy-button'
import { QRCodeModal } from './qr-code-modal'
import type { MediaShare } from '@/lib/types'
import Link from 'next/link'

interface MediaResultCardProps {
  media: MediaShare
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function MediaResultCard({ media }: MediaResultCardProps) {
  const [qrOpen, setQrOpen] = useState(false)

  return (
    <>
      <div className="w-full rounded-xl border border-border bg-card p-5 animate-scale-in">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-accent">
            <ExternalLink className="h-3.5 w-3.5 text-accent-foreground" />
          </div>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Your media link is ready
          </span>
          <span className="ml-auto flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-primary">
            <ImageIcon className="h-3 w-3" />
            {formatBytes(media.sizeBytes)}
          </span>
        </div>

        {media.title && (
          <p className="mb-1 text-sm font-semibold text-foreground truncate">{media.title}</p>
        )}

        {/* Thumbnail */}
        <div className="mb-3 overflow-hidden rounded-lg border border-border bg-muted/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={media.rawUrl}
            alt={media.title ?? media.filename}
            className="max-h-40 w-full object-contain p-2"
          />
        </div>

        <p className="mb-3 text-lg font-bold text-foreground break-all">{media.shortUrl}</p>

        <div className="flex flex-wrap gap-2">
          <CopyButton text={media.shortUrl} className="flex-1" />
          <Link
            href={`/media/${media.shortCode}`}
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
        url={media.shortUrl}
        isOpen={qrOpen}
        onClose={() => setQrOpen(false)}
      />
    </>
  )
}
