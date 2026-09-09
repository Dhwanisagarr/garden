import { cookies } from 'next/headers'
import crypto from 'crypto'

const COOKIE_NAME = 'daisy_admin_session'
const DEFAULT_PASSWORD = 'dahlia2026'

export function getAdminPassword() {
  return process.env.ADMIN_PASSWORD || DEFAULT_PASSWORD
}

function getSecretKey() {
  const secret = process.env.JWT_SECRET || getAdminPassword()
  return crypto.createHash('sha256').update(secret).digest()
}

/**
 * Creates a signed admin token string.
 */
export function createAdminToken() {
  const payload = JSON.stringify({
    role: 'admin',
    iat: Date.now(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  })
  const base64Payload = Buffer.from(payload).toString('base64url')
  const signature = crypto
    .createHmac('sha256', getSecretKey())
    .update(base64Payload)
    .digest('base64url')
  return `${base64Payload}.${signature}`
}

/**
 * Verifies a signed admin token string.
 */
export function verifyAdminToken(token) {
  if (!token || typeof token !== 'string') return false
  const parts = token.split('.')
  if (parts.length !== 2) return false

  const [base64Payload, signature] = parts
  const expectedSignature = crypto
    .createHmac('sha256', getSecretKey())
    .update(base64Payload)
    .digest('base64url')

  if (signature !== expectedSignature) return false

  try {
    const payloadJson = Buffer.from(base64Payload, 'base64url').toString('utf-8')
    const payload = JSON.parse(payloadJson)
    if (payload.exp && Date.now() > payload.exp) return false
    return payload.role === 'admin'
  } catch (e) {
    return false
  }
}

/**
 * Server middleware helper to verify admin session from Request headers/cookies.
 */
export function isAuthorizedAdmin(request) {
  let token = null

  // 1. Check HTTP Authorization header (Bearer token)
  const authHeader = request?.headers?.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim()
  }

  // 2. Check HTTP-only cookie
  if (!token && request?.headers?.get('cookie')) {
    const cookieHeader = request.headers.get('cookie')
    const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]*)`))
    if (match) token = match[1]
  }

  // 3. Fallback to next/headers cookie store
  if (!token) {
    try {
      const cookieStore = cookies()
      token = cookieStore.get(COOKIE_NAME)?.value
    } catch (e) {}
  }

  return verifyAdminToken(token)
}

export { COOKIE_NAME }
