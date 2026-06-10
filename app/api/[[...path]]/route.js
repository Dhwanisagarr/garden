import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ ok: true, app: 'DAISY' })
}
export async function POST() {
  return NextResponse.json({ ok: true })
}
