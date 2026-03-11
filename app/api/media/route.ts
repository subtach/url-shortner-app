import { NextRequest, NextResponse } from 'next/server'
import { getStore } from '@netlify/blobs'
import { createMediaShare } from '@/lib/api'

const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/avif',
]

export async function POST(request: NextRequest) {
  const protocol = request.nextUrl.protocol || 'http:'
  const host = request.headers.get('host') || 'localhost:3000'
  const baseUrl = `${protocol}//${host}`

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid form data' }, { status: 400 })
  }

  const file = formData.get('file') as File | null
  if (!file) {
    return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { success: false, error: 'Unsupported file type. Please upload a JPEG, PNG, GIF, WebP, SVG, or AVIF image.' },
      { status: 400 }
    )
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { success: false, error: 'File too large. Maximum size is 5 MB.' },
      { status: 400 }
    )
  }

  const title = (formData.get('title') as string | null)?.trim() || undefined
  const customAlias = (formData.get('customAlias') as string | null)?.trim() || undefined
  const expiresAt = (formData.get('expiresAt') as string | null) || undefined

  // Create DB record first to get the shortCode
  const result = await createMediaShare(
    {
      filename: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      title,
      customAlias,
      expiresAt,
    },
    baseUrl
  )

  if (!result.success || !result.data) {
    return NextResponse.json(result, { status: 400 })
  }

  // Store blob in Netlify Blobs keyed by shortCode
  try {
    const store = getStore('media-shares')
    const arrayBuffer = await file.arrayBuffer()
    await store.set(result.data.shortCode, arrayBuffer, {
      metadata: {
        filename: file.name,
        mimeType: file.type,
      },
    })
  } catch (err) {
    console.error('Blob upload error:', err)
    return NextResponse.json(
      { success: false, error: 'Failed to store image. Please try again.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, data: result.data })
}
