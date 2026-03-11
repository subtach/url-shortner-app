import { NextRequest, NextResponse } from 'next/server'
import { resolvePasteShortCode } from '@/lib/api'

export async function GET(
  request: NextRequest,
  { params }: { params: { shortCode: string } }
) {
  const protocol = request.nextUrl.protocol || 'http:'
  const host = request.headers.get('host') || 'localhost:3000'
  const baseUrl = `${protocol}//${host}`

  const result = await resolvePasteShortCode(params.shortCode, baseUrl)
  if (!result.success) {
    return NextResponse.json({ success: false, error: 'Paste not found' }, { status: 404 })
  }
  return NextResponse.json({ success: true, data: result.data })
}
