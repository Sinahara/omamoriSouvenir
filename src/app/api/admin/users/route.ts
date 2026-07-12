import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hash } from 'bcryptjs';
import { requireAdmin, requireSuperAdmin } from '@/lib/auth';
import { parsePagination } from '@/lib/pagination';

export async function GET(request: NextRequest) {
  const auth = await requireSuperAdmin(request)
  if (auth instanceof NextResponse) return auth
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, search } = parsePagination(searchParams);

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const [data, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.user.count({ where }),
    ]);

    return NextResponse.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Gagal memuat pengguna' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireSuperAdmin(request)
  if (auth instanceof NextResponse) return auth
  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nama, email, dan password wajib diisi' },
        { status: 400 }
      );
    }

    // Validate role
    const VALID_ROLES = ['super_admin', 'staff']
    const safeRole = VALID_ROLES.includes(role) ? role : 'staff'

    // Validate password strength (min 8 chars)
    if (typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        { error: 'Password minimal 8 karakter' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Format email tidak valid' },
        { status: 400 }
      );
    }

    // Validate name length
    if (typeof name !== 'string' || name.trim().length === 0 || name.trim().length > 200) {
      return NextResponse.json(
        { error: 'Nama tidak valid' },
        { status: 400 }
      );
    }

    // Check email uniqueness
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(password, 10);

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: safeRole,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { error: 'Gagal membuat pengguna' },
      { status: 500 }
    );
  }
}