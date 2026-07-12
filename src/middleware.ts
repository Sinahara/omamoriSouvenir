import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_ORIGINS: string[] = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()).filter(Boolean)
  : []

// H1: Simple in-memory rate limiter for admin API endpoints
const adminRateLimiter = new Map<string, { count: number; resetAt: number }>()
const ADMIN_RATE_LIMIT = { maxRequests: 100, windowMs: 60 * 1000 } // 100 req/min

function isAdminRateLimited(ip: string): boolean {
  const now = Date.now()
  const record = adminRateLimiter.get(ip)
  if (!record || now > record.resetAt) {
    adminRateLimiter.set(ip, { count: 1, resetAt: now + ADMIN_RATE_LIMIT.windowMs })
    return false
  }
  record.count++
  if (record.count > ADMIN_RATE_LIMIT.maxRequests) return true
  return false
}

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, record] of adminRateLimiter) {
    if (now > record.resetAt) adminRateLimiter.delete(key)
  }
}, 5 * 60 * 1000)

export function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/api')) {
    return NextResponse.next()
  }

  const origin = request.headers.get('origin') || ''
  const requestOrigin = request.nextUrl.origin

  // Same-origin requests: always allow
  if (!origin || origin === requestOrigin) {
    // H1: Rate limit admin API endpoints (same-origin included)
    if (request.nextUrl.pathname.startsWith('/api/admin')) {
      const ip = request.headers.get('x-real-ip')
        || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || 'unknown'
      if (isAdminRateLimited(ip)) {
        return NextResponse.json(
          { error: 'Terlalu banyak permintaan. Coba lagi sebentar.' },
          { status: 429 }
        )
      }
    }
    return NextResponse.next()
  }

  const isAllowed = ALLOWED_ORIGINS.includes(origin)

  if (!isAllowed && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    return new NextResponse(null, { status: 403 })
  }

  if (request.method === 'OPTIONS') {
    if (isAllowed) {
      const headers = new Headers()
      headers.set('Access-Control-Allow-Origin', origin)
      headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      headers.set('Access-Control-Max-Age', '86400')
      return new NextResponse(null, { status: 204, headers })
    }
    return new NextResponse(null, { status: 403 })
  }

  if (isAllowed) {
    // H1: Rate limit admin API endpoints (cross-origin)
    if (request.nextUrl.pathname.startsWith('/api/admin')) {
      const ip = request.headers.get('x-real-ip')
        || request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
        || 'unknown'
      if (isAdminRateLimited(ip)) {
        return NextResponse.json(
          { error: 'Terlalu banyak permintaan. Coba lagi sebentar.' },
          { status: 429 }
        )
      }
    }
    const response = NextResponse.next()
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/api/:path*',
}