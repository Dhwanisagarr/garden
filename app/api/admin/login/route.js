import { NextResponse } from 'next/server'
import { getAdminPassword, createAdminToken, COOKIE_NAME } from '@/lib/auth'

export async function POST(request) {
  try {
    const body = await request.json()
    const { password } = body || {}

    const expectedPassword = getAdminPassword()
    if (!password || String(password) !== String(expectedPassword)) {
      return NextResponse.json(
        { error: 'Invalid admin password' },
        { status: 401 }
      )
    }

    const token = createAdminToken()
    const response = NextResponse.json({ success: true, message: 'Authenticated successfully' })

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Login failed' },
      { status: 500 }
    )
  }
}
