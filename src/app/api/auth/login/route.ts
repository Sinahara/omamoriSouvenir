import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { compare } from 'bcryptjs';
import { generateToken, getTokenExpiry } from '@/lib/auth';
import { isRateLimited, recordFailedAttempt, clearRateLimit } from '@/lib/rate-limiter';
import { getClientIp } from '@/lib/get-client-ip';

const LOGIN_CONFIG = { maxAttempts: 5, windowMs: 15 * 60 * 1000 }; // 5 attempts per 15 min

export async function POST(request: NextRequest) {
  try {
    // Rate limiting check
    const ip = getClientIp(request)
    if (isRateLimited(ip, LOGIN_CONFIG)) {
      return NextResponse.json(
        { error: 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password wajib diisi' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        password: true,
      },
    });

    if (!user) {
      recordFailedAttempt(ip, LOGIN_CONFIG)
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      );
    }

    const isValid = await compare(password, user.password);

    if (!isValid) {
      recordFailedAttempt(ip, LOGIN_CONFIG)
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      );
    }

    // Generate session token with 24h expiry
    const token = generateToken()
    const expiresAt = getTokenExpiry()

    // Force editor cache re-evaluation after Prisma generate
    // Create a new session (supports multiple concurrent sessions)
    await db.session.create({
      data: { userId: user.id, token, expiresAt },
    })

    // Cleanup expired sessions for this user (fire-and-forget)
    db.session.deleteMany({
      where: { userId: user.id, expiresAt: { lt: new Date() } },
    }).catch(() => { /* ignore cleanup errors */ })

    // Clear rate limit on successful login
    clearRateLimit(ip)

    // Set token in httpOnly cookie (not accessible to JavaScript)
    const isProduction = process.env.NODE_ENV === 'production'
    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
    })
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 24 * 60 * 60, // 24 hours in seconds
    })
    return response
  } catch (error) {
    console.error('Error logging in:', error);
    return NextResponse.json(
      { error: 'Gagal melakukan login' },
      { status: 500 }
    );
  }
}