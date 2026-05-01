import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { Navbar } from '@/components/navbar'
import { PasteViewer } from '@/components/paste-viewer'
import { PastePasswordGateWrapper } from '@/components/paste-password-gate-wrapper'
import { resolvePasteShortCode } from '@/lib/api'

interface PasteViewPageProps {
  params: Promise<{ shortCode: string }>
}

async function getBaseUrl(): Promise<string> {
  const hdrs = await headers()
  const host = hdrs.get('host') || 'localhost:3000'
  const proto = hdrs.get('x-forwarded-proto') || 'http'
  return `${proto}://${host}`
}

export async function generateMetadata({ params }: PasteViewPageProps) {
  const { shortCode } = await params
  const baseUrl = await getBaseUrl()
  const result = await resolvePasteShortCode(shortCode, baseUrl)
  if (!result.success || !result.data) return {}
  return {
    title: result.data.title
      ? `${result.data.title} — short.ly Paste`
      : 'Code Paste — short.ly',
    description: `A ${result.data.language} snippet shared via short.ly`,
  }
}

export default async function PasteViewPage({ params }: PasteViewPageProps) {
  const { shortCode } = await params
  const baseUrl = await getBaseUrl()

  const result = await resolvePasteShortCode(shortCode, baseUrl)

  if (!result.success || !result.data) {
    return notFound()
  }

  const paste = result.data

  // If password-protected, show the gate (code will be empty)
  if (paste.isPasswordProtected && !paste.code) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex flex-1 flex-col items-center justify-center px-4 py-10">
          <PastePasswordGateWrapper shortCode={shortCode} />
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex flex-1 flex-col items-center px-4 py-10">
        <div className="w-full max-w-4xl">
          <PasteViewer paste={paste} />
        </div>
      </main>
    </div>
  )
}
