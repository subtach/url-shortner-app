import { notFound } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { PasteViewer } from '@/components/paste-viewer'
import { resolvePasteShortCode } from '@/lib/api'

interface PasteViewPageProps {
  params: Promise<{ shortCode: string }>
}

export async function generateMetadata({ params }: PasteViewPageProps) {
  const { shortCode } = await params
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
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
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  const result = await resolvePasteShortCode(shortCode, baseUrl)

  if (!result.success || !result.data) {
    notFound()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex flex-1 flex-col items-center px-4 py-10">
        <div className="w-full max-w-4xl">
          <PasteViewer paste={result.data} />
        </div>
      </main>
    </div>
  )
}
