'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth, UserButton, SignInButton } from '@clerk/nextjs'
import { Code2, ImageIcon, Link2, Menu, X, LayoutDashboard, LogIn } from 'lucide-react'
import { ThemeToggle } from './theme-toggle'

export function Navbar() {
  const pathname = usePathname()
  const { isSignedIn, isLoaded } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  // Close on Escape
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') setMobileOpen(false)
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const publicLinks = [
    { href: '/', label: 'Home', icon: null, exact: true },
    { href: '/paste', label: 'Paste Code', icon: <Code2 className="h-3.5 w-3.5" />, exact: false },
    { href: '/media', label: 'Media Share', icon: <ImageIcon className="h-3.5 w-3.5" />, exact: false },
  ]

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-card border-b border-border">
      <nav className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-foreground">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Link2 className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold tracking-tight">short.ly</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {publicLinks.map(({ href, label, icon, exact }) => (
            <Link
              key={href}
              href={href}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive(href, exact)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {icon}
              {label}
            </Link>
          ))}

          {/* Dashboard link — only when signed in */}
          {isLoaded && isSignedIn && (
            <Link
              href="/dashboard"
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive('/dashboard', true)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              Dashboard
            </Link>
          )}

          <div className="ml-1 h-5 w-px bg-border" />
          <ThemeToggle />

          {/* Auth buttons */}
          {isLoaded && !isSignedIn && (
            <SignInButton mode="modal">
              <button className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-2 text-sm font-semibold text-primary-foreground transition-all hover:brightness-95 active:scale-95 ml-1">
                <LogIn className="h-3.5 w-3.5" />
                Sign In
              </button>
            </SignInButton>
          )}
          {isLoaded && isSignedIn && (
            <div className="ml-1">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'h-8 w-8',
                  },
                }}
              />
            </div>
          )}
        </div>

        {/* Mobile: auth + theme toggle + hamburger */}
        <div className="flex items-center gap-1 md:hidden">
          {isLoaded && isSignedIn && (
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'h-7 w-7',
                },
              }}
            />
          )}
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 pb-4 pt-2">
          <div className="flex flex-col gap-1">
            {publicLinks.map(({ href, label, icon, exact }) => (
              <Link
                key={href}
                href={href}
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive(href, exact)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {icon}
                {label}
              </Link>
            ))}

            {isLoaded && isSignedIn && (
              <Link
                href="/dashboard"
                className={`inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive('/dashboard', true)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Dashboard
              </Link>
            )}

            {isLoaded && !isSignedIn && (
              <SignInButton mode="modal">
                <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-95 active:scale-95 mt-1">
                  <LogIn className="h-3.5 w-3.5" />
                  Sign In
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
