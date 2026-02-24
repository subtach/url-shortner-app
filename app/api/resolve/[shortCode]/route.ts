import { NextRequest, NextResponse } from 'next/server'
import { resolveShortCode } from '@/lib/api'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  const { shortCode } = await params
  const result = await resolveShortCode(shortCode)
  return NextResponse.json(result, {
    status: result.success ? 200 : 404,
  })
}
