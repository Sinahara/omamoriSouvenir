import { NextRequest } from 'next/server'

/**
 * Extracts the client IP from the request.
 * Only trusts proxy headers (x-real-ip, x-forwarded-for) when TRUST_PROXY=true.
 * Falls back to a hash of available request metadata to avoid shared 'unknown' key.
 */
export function getClientIp(request: NextRequest): string {
  const trustProxy = process.env.TRUST_PROXY === 'true'

  if (trustProxy) {
    const realIp = request.headers.get('x-real-ip')
    if (realIp) return realIp.trim()

    const forwarded = request.headers.get('x-forwarded-for')
    if (forwarded) {
      const first = forwarded.split(',')[0]?.trim()
      if (first) return first
    }
  }

  // Fallback: use a combination of available headers for uniqueness
  const ua = request.headers.get('user-agent') || ''
  const accept = request.headers.get('accept-language') || ''
  const fallback = `anon:${ua.slice(0, 50)}:${accept.slice(0, 20)}`
  return fallback
}
