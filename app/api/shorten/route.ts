import { NextRequest, NextResponse } from 'next/server'
import { shortenUrl } from '@/lib/api'

export async function POST(request: NextRequest) {
  const body = await request.json()

  // Derive the real base URL from the incoming request
  // Derive the real base URL from the incoming request
  const protocol = request.nextUrl.protocol || 'http:'
  const host = request.headers.get('host') || 'localhost:3000'
  const baseUrl = `${protocol}//${host}`

  const result = await shortenUrl(body, baseUrl)
  return NextResponse.json(result, {
    status: result.success ? 200 : 400,
  })
}
