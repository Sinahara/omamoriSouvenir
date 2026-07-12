import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'crypto'

/** Token validity: 24 hours */
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000

/** Generate a random session token */
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/** Get the expiry date for a new token (24h from now) */
export function getTokenExpiry(): Date {
  return new Date(Date.now() + TOKEN_TTL_MS)
}

/** Extract bearer token from request (Authorization header or httpOnly cookie) */
export function getTokenFromRequest(req: NextRequest): string | null {
  // Prefer Authorization header (backward compat)
  const auth = req.headers.get('authorization')
  if (auth) {
    const parts = auth.split(' ')
    if (parts.length === 2 && parts[0] === 'Bearer') return parts[1]
  }
  // Fallback to httpOnly cookie
  return req.cookies.get('auth_token')?.value ?? null
}

/** Verify token and return user, or null if invalid/expired */
export async function verifyAdminToken(
  req: NextRequest
): Promise<{ id: string; name: string; email: string; role: string } | null> {
  const token = getTokenFromRequest(req)
  if (!token) return null

  const now = new Date()
  // Force editor cache re-evaluation after Prisma generate
  const session = await db.session.findFirst({
    where: {
      token,
      expiresAt: { gte: now },
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
  })

  return session?.user ?? null
}

/** Middleware: require admin auth, returns user or 401 response */
export async function requireAdmin(
  req: NextRequest
): Promise<{ user: { id: string; name: string; email: string; role: string } } | NextResponse> {
  const user = await verifyAdminToken(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return { user }
}

/** Middleware: require super_admin role */
export async function requireSuperAdmin(
  req: NextRequest
): Promise<{ user: { id: string; name: string; email: string; role: string } } | NextResponse> {
  const user = await verifyAdminToken(req)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (user.role !== 'super_admin') {
    return NextResponse.json({ error: 'Forbidden: Hanya super admin' }, { status: 403 })
  }
  return { user }
}