'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { PasswordGate } from '@/components/password-gate'
import { AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function RedirectPage() {
  const params = useParams()
  const shortCode = typeof params.shortCode === 'string' ? params.shortCode : params.shortCode?.[0] ?? ''
  const [status, setStatus] = useState<'loading' | 'expired' | 'not_found' | 'password_protected'>('loading')

  useEffect(() => {
    async function resolve() {
      try {
        const res = await fetch(`/api/resolve/${shortCode}`)
        const data = await res.json()

        if (data.success && data.data) {
          if (data.data.isPasswordProtected) {
            setStatus('password_protected')
          } else if (data.data.isExpired) {
            setStatus('expired')
          } else {
            // Perform the actual redirect
            window.location.href = data.data.originalUrl
          }
        } else {
          setStatus('not_found')
        }
      } catch {
        setStatus('not_found')
      }
    }

    resolve()
  }, [shortCode])

  function handlePasswordUnlock(data: unknown) {
    const result = data as { originalUrl: string; isExpired: boolean }
    if (result.isExpired) {
      setStatus('expired')
    } else {
      window.location.href = result.originalUrl
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-sm text-muted-foreground">Redirecting...</p>
      </div>
    )
  }

  if (status === 'password_protected') {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
          <PasswordGate
            shortCode={shortCode}
            type="link"
            onUnlock={handlePasswordUnlock}
          />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-expired/15">
            <AlertCircle className="h-7 w-7 text-expired" />
          </div>
          <h1 className="mb-2 text-xl font-bold text-foreground">
            {status === 'expired' ? 'Link Expired' : 'Link Not Found'}
          </h1>
          <p className="mb-6 text-sm text-muted-foreground leading-relaxed">
            {status === 'expired'
              ? 'This short link has expired and is no longer active.'
              : 'This short link does not exist or has been deleted.'}
          </p>
          <Link
            href="/"
            className="inline-flex min-h-[48px] items-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:brightness-95 active:scale-95"
          >
            Create a new link
          </Link>
        </div>
      </main>
    </div>
  )
}
