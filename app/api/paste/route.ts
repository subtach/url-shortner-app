import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createPaste } from '@/lib/api'

export async function POST(request: NextRequest) {
  const body = await request.json()

  const protocol = request.nextUrl.protocol || 'http:'
  const host = request.headers.get('host') || 'localhost:3000'
  const baseUrl = `${protocol}//${host}`

  // Get userId if the user is authenticated (optional)
  let userId: string | null = null
  try {
    const { userId: clerkUserId } = await auth()
    userId = clerkUserId
  } catch {
    // Not authenticated
  }

  const result = await createPaste(body, baseUrl, userId)
  return NextResponse.json(result, {
    status: result.success ? 200 : 400,
  })
}
