import { NextResponse } from 'next/server'
import { isAuthorizedAdmin } from '@/lib/auth'
import { getAllSubmissions } from '@/lib/db'

export async function GET(request) {
  if (!isAuthorizedAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'all'
    const search = searchParams.get('search') || ''

    const submissions = await getAllSubmissions({ status, search })
    return NextResponse.json({ success: true, submissions })
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch submissions' },
      { status: 500 }
    )
  }
}
