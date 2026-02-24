'use client'

import { useState } from 'react'
import { QrCode, Trash2, AlertCircle, MousePointerClick } from 'lucide-react'
import { CopyButton } from './copy-button'
import { QRCodeModal } from './qr-code-modal'
import type { ShortenedLink } from '@/lib/types'

interface LinkTableProps {
  links: ShortenedLink[]
  onDelete: (id: string) => void
}

function TableRow({ link, onDelete }: { link: ShortenedLink; onDelete: (id: string) => void }) {
  const [qrOpen, setQrOpen] = useState(false)

  const createdDate = new Date(link.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  const expiryDate = link.expiresAt
    ? new Date(link.expiresAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    : '\u2014'

  return (
    <>
      <tr
        className={`border-b border-border transition-colors hover:bg-muted/40 ${
          link.isExpired ? 'opacity-55' : ''
        }`}
      >
        <td className="py-3 px-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground whitespace-nowrap">
              {link.shortCode}
            </span>
            {link.isExpired && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-md bg-expired/15 px-1.5 py-0.5 text-[10px] font-semibold text-expired">
                <AlertCircle className="h-3 w-3" />
                Expired
              </span>
            )}
          </div>
        </td>
        <td className="py-3 px-4">
          <span className="text-sm text-muted-foreground truncate block max-w-[200px]">
            {link.originalUrl}
          </span>
        </td>
        <td className="py-3 px-4 text-center">
          <span className="inline-flex items-center gap-1 text-sm text-foreground font-medium">
            <MousePointerClick className="h-3.5 w-3.5 text-muted-foreground" />
            {link.clicks}
          </span>
        </td>
        <td className="py-3 px-4 text-sm text-muted-foreground whitespace-nowrap">
          {createdDate}
        </td>
        <td className={`py-3 px-4 text-sm whitespace-nowrap ${link.isExpired ? 'text-expired font-medium' : 'text-muted-foreground'}`}>
          {expiryDate}
        </td>
        <td className="py-3 px-4">
          <div className="flex items-center justify-end gap-1">
            <CopyButton text={link.shortUrl} className="min-h-[36px] text-xs px-2" />
            <button
              onClick={() => setQrOpen(true)}
              className="inline-flex h-9 items-center gap-1 rounded-lg bg-secondary px-2.5 text-xs font-medium text-secondary-foreground transition-all hover:brightness-95 active:scale-95"
              aria-label="Show QR code"
            >
              <QrCode className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => onDelete(link.id)}
              className="inline-flex h-9 items-center rounded-lg px-2 text-muted-foreground transition-all hover:bg-destructive/10 hover:text-destructive active:scale-95"
              aria-label="Delete link"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </td>
      </tr>

      <QRCodeModal
        url={link.shortUrl}
        isOpen={qrOpen}
        onClose={() => setQrOpen(false)}
      />
    </>
  )
}

export function LinkTable({ links, onDelete }: LinkTableProps) {
  return (
    <div className="w-full overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full min-w-[640px]">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Short Link
            </th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Original URL
            </th>
            <th className="py-3 px-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Clicks
            </th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Created
            </th>
            <th className="py-3 px-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Expires
            </th>
            <th className="py-3 px-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {links.map((link) => (
            <TableRow key={link.id} link={link} onDelete={onDelete} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
