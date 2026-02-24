'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Link2 } from 'lucide-react'
import { ThemeToggle } from './theme-toggle'

export function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full bg-card border-b border-border">
      <nav className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
        <Link
          href="/"
          className="flex items-center gap-2 text-foreground"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Link2 className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold tracking-tight">short.ly</span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/"
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              pathname === '/'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            Home
          </Link>
          <Link
            href="/dashboard"
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              pathname === '/dashboard'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            Dashboard
          </Link>
          <div className="ml-1 h-5 w-px bg-border" />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  )
}
