import { NextRequest, NextResponse } from 'next/server'
import { createPaste } from '@/lib/api'

export async function POST(request: NextRequest) {
  const body = await request.json()

  const protocol = request.nextUrl.protocol || 'http:'
  const host = request.headers.get('host') || 'localhost:3000'
  const baseUrl = `${protocol}//${host}`

  const result = await createPaste(body, baseUrl)
  return NextResponse.json(result, {
    status: result.success ? 200 : 400,
  })
}
