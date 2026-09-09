import { NextResponse } from 'next/server'
import { isAuthorizedAdmin } from '@/lib/auth'
import { updateSubmissionStatus, deleteSubmission } from '@/lib/db'
import { deleteUploadedPhoto } from '@/lib/upload'

export async function PATCH(request, { params }) {
  if (!isAuthorizedAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 })
  }

  try {
    const id = params?.id
    if (!id) {
      return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const { status } = body || {}

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 })
    }

    const updated = await updateSubmissionStatus(id, status)
    return NextResponse.json({ success: true, submission: updated })
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to update submission status' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  if (!isAuthorizedAdmin(request)) {
    return NextResponse.json({ error: 'Unauthorized admin access' }, { status: 401 })
  }

  try {
    const id = params?.id
    if (!id) {
      return NextResponse.json({ error: 'Submission ID is required' }, { status: 400 })
    }

    const deletedDoc = await deleteSubmission(id)
    if (deletedDoc?.photoUrl) {
      deleteUploadedPhoto(deletedDoc.photoUrl)
    }

    return NextResponse.json({ success: true, id })
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to delete submission' },
      { status: 500 }
    )
  }
}
