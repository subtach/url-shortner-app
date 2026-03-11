'use client'

import { useState } from 'react'
import { Code2, Zap, Calendar, FileText, Loader2 } from 'lucide-react'
import type { CodePaste, PasteResponse } from '@/lib/types'

const LANGUAGES = [
  { value: 'plaintext', label: 'Plain Text' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'scss', label: 'SCSS' },
  { value: 'sql', label: 'SQL' },
  { value: 'bash', label: 'Bash / Shell' },
  { value: 'powershell', label: 'PowerShell' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'xml', label: 'XML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'dockerfile', label: 'Dockerfile' },
  { value: 'graphql', label: 'GraphQL' },
  { value: 'r', label: 'R' },
  { value: 'lua', label: 'Lua' },
  { value: 'dart', label: 'Dart' },
  { value: 'scala', label: 'Scala' },
]

interface PasteFormProps {
  onSuccess: (paste: CodePaste) => void
}

export function PasteForm({ onSuccess }: PasteFormProps) {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('plaintext')
  const [title, setTitle] = useState('')
  const [alias, setAlias] = useState('')
  const [expiresAt, setExpiresAt] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!code.trim()) {
      setError('Please enter some code to share')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/paste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim(),
          language,
          title: title.trim() || undefined,
          customAlias: alias.trim() || undefined,
          expiresAt: expiresAt || undefined,
        }),
      })
      var response: PasteResponse = await res.json()
    } catch {
      setIsLoading(false)
      setError('Network error. Please try again.')
      return
    }

    setIsLoading(false)

    if (response.success && response.data) {
      onSuccess(response.data)
      setCode('')
      setTitle('')
      setAlias('')
      setExpiresAt('')
      setLanguage('plaintext')
    } else {
      setError(response.error || 'Something went wrong')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-3">
      {/* Title */}
      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <FileText className="h-4 w-4" />
        </div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (optional)"
          className="h-11 w-full rounded-lg border border-border bg-card pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors"
          aria-label="Paste title"
        />
      </div>

      {/* Language Selector */}
      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <Code2 className="h-4 w-4" />
        </div>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="h-11 w-full appearance-none rounded-lg border border-border bg-card pl-9 pr-8 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors cursor-pointer"
          aria-label="Programming language"
        >
          {LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Code Input */}
      <div className="relative">
        <textarea
          value={code}
          onChange={(e) => {
            setCode(e.target.value)
            if (error) setError('')
          }}
          placeholder={`Paste your ${LANGUAGES.find(l => l.value === language)?.label ?? 'code'} here...`}
          rows={14}
          spellCheck={false}
          className="w-full resize-y rounded-lg border border-border bg-card px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors min-h-[220px]"
          aria-label="Code to share"
        />
      </div>

      {/* Optional Fields */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Zap className="h-4 w-4" />
          </div>
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
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
          </div>
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

      {/* Error */}
      {error && (
        <p className="text-sm text-destructive font-medium animate-fade-in" role="alert">
          {error}
        </p>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-all hover:brightness-95 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating Paste...
          </>
        ) : (
          <>
            <Code2 className="h-4 w-4" />
            Create Paste
          </>
        )}
      </button>
    </form>
  )
}
