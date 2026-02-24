'use client'

import { useState } from 'react'
import { QrCode, Calendar, MousePointerClick, Trash2, AlertCircle } from 'lucide-react'
import { CopyButton } from './copy-button'
import { QRCodeModal } from './qr-code-modal'
import type { ShortenedLink } from '@/lib/types'

interface LinkCardProps {
  link: ShortenedLink
  onDelete: (id: string) => void
}

export function LinkCard({ link, onDelete }: LinkCardProps) {
  const [qrOpen, setQrOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    onDelete(link.id)
  }

  const createdDate = new Date(link.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  const expiryDate = link.expiresAt
    ? new Date(link.expiresAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  return (
    <>
      <div
        className={`rounded-xl border bg-card p-4 transition-colors ${
          link.isExpired
            ? 'border-expired/30 opacity-60'
            : 'border-border'
        }`}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-sm font-bold text-foreground truncate">
                {link.shortUrl}
              </p>
              {link.isExpired && (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-expired/15 px-2 py-0.5 text-[11px] font-semibold text-expired">
                  <AlertCircle className="h-3 w-3" />
                  Expired
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {link.originalUrl}
            </p>
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-3 mb-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <MousePointerClick className="h-3.5 w-3.5" />
            {link.clicks} clicks
          </span>
          <span className="inline-flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {createdDate}
          </span>
          {expiryDate && (
            <span className={`inline-flex items-center gap-1 ${link.isExpired ? 'text-expired' : ''}`}>
              Expires {expiryDate}
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <CopyButton text={link.shortUrl} className="flex-1 min-h-[40px]" />
          <button
            onClick={() => setQrOpen(true)}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-xs font-medium text-secondary-foreground transition-all hover:brightness-95 active:scale-95"
          >
            <QrCode className="h-3.5 w-3.5" />
            QR
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="inline-flex min-h-[40px] items-center rounded-lg px-3 py-2 text-xs text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive active:scale-95 disabled:opacity-50"
            aria-label="Delete link"
          >
            <Trash2 className="h-3.5 w-3.5" />
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
