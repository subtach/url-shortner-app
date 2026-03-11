'use client'

import { useState } from 'react'
import { Download, QrCode, Clock, Eye, ImageIcon, Copy, Check, AlertTriangle } from 'lucide-react'
import { QRCodeModal } from './qr-code-modal'
import type { MediaShare } from '@/lib/types'

interface MediaViewerProps {
  media: MediaShare
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function MediaViewer({ media }: MediaViewerProps) {
  const [qrOpen, setQrOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const createdDate = new Date(media.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  const ext = media.filename.split('.').pop()?.toUpperCase() ?? '—'

  async function copyLink() {
    await navigator.clipboard.writeText(media.shortUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleDownload() {
    const a = document.createElement('a')
    a.href = media.rawUrl
    a.download = media.filename
    a.click()
  }

  return (
    <>
      <div className="w-full rounded-xl border border-border bg-card overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15">
              <ImageIcon className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-base font-bold text-foreground leading-tight">
                {media.title || media.filename}
              </h2>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {createdDate}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {media.clicks} view{media.clicks !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-semibold text-primary">
              {ext} · {formatBytes(media.sizeBytes)}
            </span>
            <button
              onClick={copyLink}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground transition-all hover:bg-muted active:scale-95"
              title="Copy short link"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground transition-all hover:bg-muted active:scale-95"
              title="Download image"
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </button>
            <button
              onClick={() => setQrOpen(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground transition-all hover:bg-muted active:scale-95"
              title="Get QR code"
            >
              <QrCode className="h-3.5 w-3.5" />
              QR
            </button>
          </div>
        </div>

        {/* Expiry notice */}
        {media.isExpired && (
          <div className="flex items-center gap-2 border-b border-border bg-destructive/10 px-5 py-3 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            This media link has expired.
          </div>
        )}

        {/* Image */}
        <div className="flex items-center justify-center bg-muted/20 p-6 min-h-[300px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={media.rawUrl}
            alt={media.title ?? media.filename}
            className="max-h-[70vh] max-w-full rounded-lg object-contain shadow-sm"
          />
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
