import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { shortenUrl } from '@/lib/api'

export async function POST(request: NextRequest) {
  const body = await request.json()

  // Derive the real base URL from the incoming request
  const protocol = request.nextUrl.protocol || 'http:'
  const host = request.headers.get('host') || 'localhost:3000'
  const baseUrl = `${protocol}//${host}`

  // Get userId if the user is authenticated (optional — anonymous creation allowed)
  let userId: string | null = null
  try {
    const { userId: clerkUserId } = await auth()
    userId = clerkUserId
  } catch {
    // Not authenticated — that's fine
  }

  const result = await shortenUrl(body, baseUrl, userId)
  return NextResponse.json(result, {
    status: result.success ? 200 : 400,
  })
}
