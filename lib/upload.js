import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'guest-notes')

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/jpg',
])

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

/**
 * Validates and saves an uploaded File/Blob object from a FormData request.
 * Returns relative photo URL path (e.g., '/uploads/guest-notes/abc.jpg')
 * or a Base64 Data URL in read-only serverless environments (e.g. Vercel).
 */
export async function saveUploadedPhoto(file) {
  if (!file || typeof file !== 'object') return null
  if (file.size === 0) return null

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Image size must be less than 5MB')
  }

  const mimeType = file.type?.toLowerCase() || 'image/jpeg'
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new Error('Only image files (JPEG, PNG, WebP, GIF) are allowed')
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  // Try saving to disk (local dev environments)
  try {
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true })
    }

    let ext = '.jpg'
    if (mimeType.includes('png')) ext = '.png'
    else if (mimeType.includes('webp')) ext = '.webp'
    else if (mimeType.includes('gif')) ext = '.gif'

    const fileName = `${uuidv4()}${ext}`
    const filePath = path.join(UPLOAD_DIR, fileName)

    fs.writeFileSync(filePath, buffer)
    return `/uploads/guest-notes/${fileName}`
  } catch (err) {
    // Read-only filesystem in serverless environments (e.g. Vercel EROFS)
    // Fall back gracefully to Base64 Data URL
    const base64 = buffer.toString('base64')
    return `data:${mimeType};base64,${base64}`
  }
}

/**
 * Deletes an uploaded photo file from disk if present.
 */
export function deleteUploadedPhoto(photoUrl) {
  if (!photoUrl || typeof photoUrl !== 'string') return
  if (!photoUrl.startsWith('/uploads/guest-notes/')) return

  try {
    const fileName = path.basename(photoUrl)
    const filePath = path.join(UPLOAD_DIR, fileName)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  } catch (e) {
    console.error('Failed to delete photo file:', e)
  }
}

