import { NextRequest, NextResponse } from 'next/server'
import { getStore } from '@netlify/blobs'
import { resolveMediaShortCode } from '@/lib/api'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  const { shortCode } = await params
  const protocol = request.nextUrl.protocol || 'http:'
  const host = request.headers.get('host') || 'localhost:3000'
  const baseUrl = `${protocol}//${host}`

  // Resolve metadata (also increments clicks)
  const result = await resolveMediaShortCode(shortCode, baseUrl)
  if (!result.success || !result.data) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 })
  }

  const { mimeType, isExpired } = result.data
  if (isExpired) {
    return NextResponse.json({ success: false, error: 'This link has expired' }, { status: 410 })
  }

  try {
    const store = getStore('media-shares')
    const blob = await store.get(shortCode, { type: 'arrayBuffer' })
    if (!blob) {
      return NextResponse.json({ success: false, error: 'Image not found in store' }, { status: 404 })
    }

    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Disposition': `inline; filename="${result.data.filename}"`,
      },
    })
  } catch (err) {
    console.error('Blob fetch error:', err)
    return NextResponse.json({ success: false, error: 'Failed to retrieve image' }, { status: 500 })
  }
}
