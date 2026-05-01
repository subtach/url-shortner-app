import { NextRequest, NextResponse } from 'next/server'
import { verifyContentPassword } from '@/lib/api'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { shortCode, type, password } = body

  if (!shortCode || !type || !password) {
    return NextResponse.json(
      { success: false, error: 'Missing required fields' },
      { status: 400 }
    )
  }

  if (!['link', 'paste', 'media'].includes(type)) {
    return NextResponse.json(
      { success: false, error: 'Invalid type' },
      { status: 400 }
    )
  }

  const protocol = request.nextUrl.protocol || 'http:'
  const host = request.headers.get('host') || 'localhost:3000'
  const baseUrl = `${protocol}//${host}`

  const result = await verifyContentPassword(shortCode, type, password, baseUrl)

  return NextResponse.json(result, {
    status: result.success ? 200 : 401,
  })
}
