import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'guest-notes')

// Ensure target directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  try {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true })
  } catch (err) {
    console.error('Failed to create upload directory:', err)
  }
}

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
 * Returns relative photo URL path (e.g., '/uploads/guest-notes/abc.jpg').
 */
export async function saveUploadedPhoto(file) {
  if (!file || typeof file !== 'object') return null
  if (file.size === 0) return null

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Image size must be less than 5MB')
  }

  const mimeType = file.type?.toLowerCase() || ''
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new Error('Only image files (JPEG, PNG, WebP, GIF) are allowed')
  }

  // Derive file extension
  let ext = '.jpg'
  if (mimeType.includes('png')) ext = '.png'
  else if (mimeType.includes('webp')) ext = '.webp'
  else if (mimeType.includes('gif')) ext = '.gif'

  const fileName = `${uuidv4()}${ext}`
  const filePath = path.join(UPLOAD_DIR, fileName)

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  fs.writeFileSync(filePath, buffer)

  return `/uploads/guest-notes/${fileName}`
}

/**
 * Deletes an uploaded photo file from disk.
 */
export function deleteUploadedPhoto(photoUrl) {
  if (!photoUrl || typeof photoUrl !== 'string') return
  if (!photoUrl.startsWith('/uploads/guest-notes/')) return

  const fileName = path.basename(photoUrl)
  const filePath = path.join(UPLOAD_DIR, fileName)

  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath)
    } catch (e) {
      console.error('Failed to delete photo file:', e)
    }
  }
}
