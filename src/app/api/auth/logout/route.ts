import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, getTokenFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth instanceof NextResponse) return auth;

    // Delete only the current session (other sessions remain active)
    const token = getTokenFromRequest(request)
    if (token) {
      await db.session.deleteMany({
        where: { token },
      })
    }

    // Clear httpOnly cookie
    const response = NextResponse.json({ message: 'Berhasil logout' })
    response.cookies.set('auth_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    })
    return response
  } catch (error) {
    console.error('Error logging out:', error);
    return NextResponse.json(
      { error: 'Gagal logout' },
      { status: 500 }
    );
  }
}