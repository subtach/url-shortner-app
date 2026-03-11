import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { Navbar } from '@/components/navbar'
import { MediaViewer } from '@/components/media-viewer'
import { resolveMediaShortCode } from '@/lib/api'

interface MediaViewPageProps {
  params: Promise<{ shortCode: string }>
}

async function getBaseUrl(): Promise<string> {
  const hdrs = await headers()
  const host = hdrs.get('host') || 'localhost:3000'
  const proto = hdrs.get('x-forwarded-proto') || 'http'
  return `${proto}://${host}`
}

export async function generateMetadata({ params }: MediaViewPageProps) {
  const { shortCode } = await params
  const baseUrl = await getBaseUrl()
  const result = await resolveMediaShortCode(shortCode, baseUrl)
  if (!result.success || !result.data) return {}
  return {
    title: result.data.title
      ? `${result.data.title} — short.ly Media`
      : `${result.data.filename} — short.ly Media`,
    description: `Shared image via short.ly`,
  }
}

export default async function MediaViewPage({ params }: MediaViewPageProps) {
  const { shortCode } = await params
  const baseUrl = await getBaseUrl()

  const result = await resolveMediaShortCode(shortCode, baseUrl)

  if (!result.success || !result.data) {
    notFound()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex flex-1 flex-col items-center px-4 py-10">
        <div className="w-full max-w-4xl">
          <MediaViewer media={result.data} />
        </div>
      </main>
    </div>
  )
}
