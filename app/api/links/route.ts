import { NextRequest, NextResponse } from 'next/server'
import { getLinks, deleteLink } from '@/lib/api'

export async function GET(request: NextRequest) {
  const proto = request.headers.get('x-forwarded-proto') ?? 'https'
  const host = request.headers.get('host') ?? 'localhost:3000'
  const baseUrl = `${proto}://${host}`
  const result = await getLinks(baseUrl)
  return NextResponse.json(result)
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json()
  const result = await deleteLink(id)
  return NextResponse.json(result)
}
