'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, ImageIcon, X, Zap, Calendar, FileText, Loader2 } from 'lucide-react'
import type { MediaShare, MediaShareResponse } from '@/lib/types'

const MAX_SIZE = 5 * 1024 * 1024 // 5 MB
const ALLOWED = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/avif']

interface MediaUploadFormProps {
  onSuccess: (media: MediaShare) => void
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function MediaUploadForm({ onSuccess }: MediaUploadFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [alias, setAlias] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function handleFile(f: File) {
    setError('')
    if (!ALLOWED.includes(f.type)) {
      setError('Unsupported file type. Please upload a JPEG, PNG, GIF, WebP, SVG, or AVIF.')
      return
    }
    if (f.size > MAX_SIZE) {
      setError('File too large. Maximum size is 5 MB.')
      return
    }
    setFile(f)
    const url = URL.createObjectURL(f)
    setPreview(url)
  }

  function clearFile() {
    setFile(null)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(null)
    setError('')
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!file) { setError('Please select an image to share.'); return }

    setIsLoading(true)

    const fd = new FormData()
    fd.append('file', file)
    if (title.trim()) fd.append('title', title.trim())
    if (alias.trim()) fd.append('customAlias', alias.trim())
    if (expiresAt) fd.append('expiresAt', expiresAt)

    try {
      const res = await fetch('/api/media', { method: 'POST', body: fd })
      const response: MediaShareResponse = await res.json()
      setIsLoading(false)
      if (response.success && response.data) {
        onSuccess(response.data)
        clearFile()
        setTitle('')
        setAlias('')
        setExpiresAt('')
      } else {
        setError(response.error || 'Something went wrong.')
      }
    } catch {
      setIsLoading(false)
      setError('Network error. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-3">
      {/* Title */}
      <div className="relative">
        <FileText className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (optional)"
          className="h-11 w-full rounded-lg border border-border bg-card pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors"
          aria-label="Media title"
        />
      </div>

      {/* Drop zone / preview */}
      {!preview ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed transition-colors ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border bg-card hover:border-primary/50 hover:bg-muted/30'
          }`}
          role="button"
          aria-label="Upload image"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">Drop your image here</p>
            <p className="text-xs text-muted-foreground mt-0.5">or click to browse · JPEG, PNG, GIF, WebP, SVG, AVIF · max 5 MB</p>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
            aria-label="File input"
          />
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-xl border border-border bg-card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Preview"
            className="max-h-64 w-full object-contain p-3"
          />
          <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ImageIcon className="h-3.5 w-3.5" />
              <span className="truncate max-w-[200px]">{file!.name}</span>
              <span className="text-muted-foreground/60">·</span>
              <span>{formatBytes(file!.size)}</span>
            </div>
            <button
              type="button"
              onClick={clearFile}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Optional alias / expiry */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Zap className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={alias}
            onChange={(e) => setAlias(e.target.value.replace(/[^a-zA-Z0-9-_]/g, ''))}
            placeholder="Custom alias (optional)"
            className="h-11 w-full rounded-lg border border-border bg-card pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors"
            aria-label="Custom alias"
          />
        </div>
        <div className="relative flex-1">
          <Calendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="date"
            value={expiresAt}
            onChange={(e) => setExpiresAt(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="h-11 w-full rounded-lg border border-border bg-card pl-9 pr-4 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors"
            aria-label="Expiry date"
          />
        </div>
      </div>

      {error && (
        <p className="text-sm text-destructive font-medium animate-fade-in" role="alert">{error}</p>
      )}

      <button
        type="submit"
        disabled={isLoading || !file}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-all hover:brightness-95 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <><Loader2 className="h-4 w-4 animate-spin" />Uploading...</>
        ) : (
          <><Upload className="h-4 w-4" />Share Image</>
        )}
      </button>
    </form>
  )
}
