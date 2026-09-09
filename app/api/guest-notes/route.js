import { NextResponse } from 'next/server'
import { getApprovedNotes, createSubmission } from '@/lib/db'
import { saveUploadedPhoto } from '@/lib/upload'

export async function GET() {
  try {
    const notes = await getApprovedNotes()
    return NextResponse.json({ success: true, notes })
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch guest notes' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || ''

    let name = ''
    let message = ''
    let month = null
    let year = null
    let photoUrl = null

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      name = formData.get('name')
      message = formData.get('message')
      month = formData.get('month')
      year = formData.get('year')
      const photoFile = formData.get('photo')

      if (photoFile && typeof photoFile === 'object' && photoFile.size > 0) {
        photoUrl = await saveUploadedPhoto(photoFile)
      }
    } else {
      const body = await request.json()
      name = body.name
      message = body.message
      month = body.month
      year = body.year
      photoUrl = body.photoUrl || null
    }

    // Validation
    if (!name || typeof name !== 'string' || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }
    if (name.trim().length > 100) {
      return NextResponse.json({ error: 'Name must be under 100 characters' }, { status: 400 })
    }

    if (!message || typeof message !== 'string' || !message.trim()) {
      return NextResponse.json({ error: 'Note message is required' }, { status: 400 })
    }
    if (message.trim().length > 2000) {
      return NextResponse.json({ error: 'Message must be under 2000 characters' }, { status: 400 })
    }

    const MONTH_NAMES = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ]

    function parseMonthValue(val) {
      if (!val) return null
      const num = Number(val)
      if (!isNaN(num) && num >= 1 && num <= 12) {
        return MONTH_NAMES[num - 1]
      }
      if (typeof val === 'string') {
        const found = MONTH_NAMES.find(m => m.toLowerCase() === val.trim().toLowerCase())
        if (found) return found
      }
      return null
    }

    const parsedMonth = parseMonthValue(month)
    const y = Number(year)

    if (!parsedMonth) {
      return NextResponse.json({ error: 'Valid month (January-December or 1-12) is required' }, { status: 400 })
    }
    if (isNaN(y) || y < 2000 || y > 2050) {
      return NextResponse.json({ error: 'Valid year is required' }, { status: 400 })
    }

    // Store in DB as status = 'pending'
    const submission = await createSubmission({
      name,
      message,
      month: parsedMonth,
      year: y,
      photoUrl,
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Your note has been submitted for review. Thank you!',
        submission: {
          id: submission.id,
          name: submission.name,
          month: submission.month,
          year: submission.year,
          createdAt: submission.createdAt,
          status: 'pending',
        },
      },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to submit guest note' },
      { status: 400 }
    )
  }
}
