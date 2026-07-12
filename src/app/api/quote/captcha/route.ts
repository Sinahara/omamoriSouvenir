import { NextResponse } from 'next/server'
import crypto from 'crypto'

/**
 * Server-side CAPTCHA challenge generator.
 * Returns { a, b, token } where token is HMAC-signed so the server
 * can verify the answer without storing state.
 * Token format: base64(JSON({ a, b, exp })) + '.' + hmac_signature
 */

const CAPTCHA_SECRET = process.env.CAPTCHA_SECRET || crypto.randomBytes(32).toString('hex')
const CAPTCHA_TTL_MS = 5 * 60 * 1000 // 5 minutes

function signPayload(payload: object): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = crypto.createHmac('sha256', CAPTCHA_SECRET).update(data).digest('base64url')
  return `${data}.${sig}`
}

export function verifyCaptchaToken(token: string, answer: number): boolean {
  const parts = token.split('.')
  if (parts.length !== 2) return false

  const [data, sig] = parts
  const expectedSig = crypto.createHmac('sha256', CAPTCHA_SECRET).update(data).digest('base64url')

  // Timing-safe comparison
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expectedSig))) {
    return false
  }

  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString())
    if (Date.now() > payload.exp) return false // expired
    if (payload.a + payload.b !== answer) return false
    return true
  } catch {
    return false
  }
}

export async function GET() {
  const a = Math.floor(Math.random() * 20) + 1
  const b = Math.floor(Math.random() * 20) + 1
  const exp = Date.now() + CAPTCHA_TTL_MS

  const token = signPayload({ a, b, exp })

  return NextResponse.json({ a, b, token })
}
