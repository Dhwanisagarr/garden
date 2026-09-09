import { NextResponse } from 'next/server'
import { isAuthorizedAdmin } from '@/lib/auth'

export async function GET(request) {
  const authorized = isAuthorizedAdmin(request)
  if (!authorized) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
  return NextResponse.json({ authenticated: true })
}
