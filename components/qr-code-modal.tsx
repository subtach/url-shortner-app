'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { X, Download, Loader2 } from 'lucide-react'
import QRCode from 'qrcode'

interface QRCodeModalProps {
  url: string
  isOpen: boolean
  onClose: () => void
}

export function QRCodeModal({ url, isOpen, onClose }: QRCodeModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState('')

  useEffect(() => {
    if (!isOpen || !url) {
      setQrDataUrl('')
      setError('')
      return
    }

    setIsGenerating(true)
    setError('')

    QRCode.toDataURL(url, {
      width: 300,
      margin: 2,
      color: { dark: '#2B2B2B', light: '#FFFFFF' },
      errorCorrectionLevel: 'M',
    })
      .then((dataUrl) => {
        setQrDataUrl(dataUrl)
        setIsGenerating(false)
      })
      .catch((err) => {
        console.error('QR Code generation failed:', err)
        setError('Failed to generate QR code')
        setIsGenerating(false)
      })
  }, [isOpen, url])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  function handleDownload() {
    const a = document.createElement('a')
    a.href = qrDataUrl
    a.download = `qr-${url.replace(/[^a-zA-Z0-9]/g, '-')}.png`
    a.click()
  }

  function handleBackdropClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4 animate-fade-in"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="QR Code"
    >
      <div
        ref={dialogRef}
        className="w-full max-w-sm rounded-xl bg-card p-6 animate-scale-in"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-foreground">QR Code</h2>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex justify-center mb-4">
          <div className="rounded-xl border border-border bg-white p-3">
            {isGenerating ? (
              <div className="flex h-60 w-60 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="flex h-60 w-60 items-center justify-center text-center text-sm text-destructive px-4">
                {error}
              </div>
            ) : qrDataUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={qrDataUrl}
                alt={`QR code for ${url}`}
                width={240}
                height={240}
                className="h-60 w-60"
              />
            ) : null}
          </div>
        </div>

        <p className="mb-5 text-center text-sm text-muted-foreground break-all">
          {url}
        </p>

        <button
          onClick={handleDownload}
          disabled={!qrDataUrl}
          className="flex w-full min-h-[48px] items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-all hover:brightness-95 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Download className="h-4 w-4" />
          Download QR Code
        </button>
      </div>
    </div>
  )
}
