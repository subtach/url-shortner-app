'use client'

import { useState } from 'react'
import { Lock, Eye, EyeOff, Loader2, ShieldAlert } from 'lucide-react'

interface PasswordGateProps {
  shortCode: string
  type: 'link' | 'paste' | 'media'
  onUnlock: (data: unknown) => void
}

export function PasswordGate({ shortCode, type, onUnlock }: PasswordGateProps) {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (!password.trim()) {
      setError('Please enter a password')
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch('/api/verify-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shortCode, type, password: password.trim() }),
      })
      const result = await res.json()

      if (result.success && result.data) {
        onUnlock(result.data)
      } else {
        setError(result.error || 'Incorrect password')
        setShake(true)
        setTimeout(() => setShake(false), 500)
      }
    } catch {
      setError('Network error. Please try again.')
    }

    setIsLoading(false)
  }

  const typeLabel = type === 'link' ? 'link' : type === 'paste' ? 'paste' : 'media'

  return (
    <div className="flex flex-col items-center justify-center px-4 py-16 animate-fade-in">
      <div className={`w-full max-w-sm ${shake ? 'animate-shake' : ''}`}>
        {/* Icon */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20 shadow-lg shadow-primary/5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15">
            <Lock className="h-6 w-6 text-primary" />
          </div>
        </div>

        {/* Text */}
        <div className="mb-6 text-center">
          <h2 className="mb-1.5 text-xl font-bold text-foreground">
            Password Protected
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This {typeLabel} is protected. Enter the password to continue.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="relative">
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <ShieldAlert className="h-4 w-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (error) setError('')
              }}
              placeholder="Enter password"
              autoFocus
              className="h-12 w-full rounded-lg border border-border bg-card pl-10 pr-12 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/20 transition-colors"
              aria-label="Password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {error && (
            <p className="text-sm text-destructive font-medium animate-fade-in" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-all hover:brightness-95 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" />
                Unlock
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
