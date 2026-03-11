'use client'

import { useEffect, useRef, useState } from 'react'
import { Copy, Check, QrCode, Clock, Eye, Code2, AlertTriangle } from 'lucide-react'
import { QRCodeModal } from './qr-code-modal'
import type { CodePaste } from '@/lib/types'

// Map our language values to highlight.js language keys
const HLJ_LANG_MAP: Record<string, string> = {
  plaintext: 'plaintext',
  javascript: 'javascript',
  typescript: 'typescript',
  python: 'python',
  java: 'java',
  c: 'c',
  cpp: 'cpp',
  csharp: 'csharp',
  go: 'go',
  rust: 'rust',
  php: 'php',
  ruby: 'ruby',
  swift: 'swift',
  kotlin: 'kotlin',
  html: 'xml',
  css: 'css',
  scss: 'scss',
  sql: 'sql',
  bash: 'bash',
  powershell: 'powershell',
  json: 'json',
  yaml: 'yaml',
  xml: 'xml',
  markdown: 'markdown',
  dockerfile: 'dockerfile',
  graphql: 'graphql',
  r: 'r',
  lua: 'lua',
  dart: 'dart',
  scala: 'scala',
}

interface PasteViewerProps {
  paste: CodePaste
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    hljs: any
  }
}

export function PasteViewer({ paste }: PasteViewerProps) {
  const codeRef = useRef<HTMLElement>(null)
  const [copied, setCopied] = useState(false)
  const [qrOpen, setQrOpen] = useState(false)
  const [hlReady, setHlReady] = useState(false)

  // Load Highlight.js from CDN once
  useEffect(() => {
    if (window.hljs) {
      setHlReady(true)
      return
    }
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.10.0/styles/github-dark.min.css'
    document.head.appendChild(link)

    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.10.0/highlight.min.js'
    script.onload = () => setHlReady(true)
    document.head.appendChild(script)
  }, [])

  // Apply syntax highlighting whenever hljs is ready or code changes
  useEffect(() => {
    if (hlReady && codeRef.current && window.hljs) {
      codeRef.current.removeAttribute('data-highlighted')
      window.hljs.highlightElement(codeRef.current)
    }
  }, [hlReady, paste.code])

  async function copyCode() {
    await navigator.clipboard.writeText(paste.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const langLabel =
    paste.language.charAt(0).toUpperCase() + paste.language.slice(1)

  const createdDate = new Date(paste.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <>
      <div className="w-full rounded-xl border border-border bg-card overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-4">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15">
              <Code2 className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-base font-bold text-foreground leading-tight">
                {paste.title || 'Untitled Paste'}
              </h2>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-0.5">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {createdDate}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {paste.clicks} view{paste.clicks !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-semibold text-primary">
              {langLabel}
            </span>
            <button
              onClick={copyCode}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-background px-3 text-xs font-medium text-foreground transition-all hover:bg-muted active:scale-95"
              title="Copy code"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied!' : 'Copy'}
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
        {paste.isExpired && (
          <div className="flex items-center gap-2 border-b border-border bg-destructive/10 px-5 py-3 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            This paste has expired.
          </div>
        )}

        {/* Code Block */}
        <div className="relative overflow-auto">
          <pre className="m-0 p-0 text-sm leading-relaxed">
            <code
              ref={codeRef}
              className={`language-${HLJ_LANG_MAP[paste.language] ?? 'plaintext'} block px-5 py-4 min-h-[200px]`}
            >
              {paste.code}
            </code>
          </pre>
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
