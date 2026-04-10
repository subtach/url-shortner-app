import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getUserDashboardData, deleteLink, deletePaste, deleteMediaShare } from '@/lib/api'

export async function GET(request: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const proto = request.headers.get('x-forwarded-proto') ?? 'https'
  const host = request.headers.get('host') ?? 'localhost:3000'
  const baseUrl = `${proto}://${host}`

  const data = await getUserDashboardData(userId, baseUrl)
  return NextResponse.json({ success: true, data })
}

export async function DELETE(request: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  const { id, type } = await request.json()

  if (!id || !type) {
    return NextResponse.json({ success: false, error: 'Missing id or type' }, { status: 400 })
  }

  let result: { success: boolean }

  switch (type) {
    case 'link':
      result = await deleteLink(id)
      break
    case 'paste':
      result = await deletePaste(id)
      break
    case 'media':
      result = await deleteMediaShare(id)
      break
    default:
      return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 })
  }

  return NextResponse.json(result)
}
