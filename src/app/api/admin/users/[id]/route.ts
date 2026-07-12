import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hash } from 'bcryptjs';
import { requireSuperAdmin } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSuperAdmin(request)
  if (auth instanceof NextResponse) return auth
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, email, password, role } = body;

    const existing = await db.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Pengguna tidak ditemukan' },
        { status: 404 }
      );
    }

    // Validate name length if provided
    if (name !== undefined) {
      if (typeof name !== 'string' || name.length < 1 || name.length > 200) {
        return NextResponse.json(
          { error: 'Nama harus berupa teks 1-200 karakter' },
          { status: 400 }
        );
      }
    }

    // Validate email format if provided
    if (email !== undefined) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (typeof email !== 'string' || !emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Format email tidak valid' },
          { status: 400 }
        );
      }
    }

    // Check email uniqueness if changed
    if (email && email !== existing.email) {
      const emailExists = await db.user.findUnique({ where: { email } });
      if (emailExists) {
        return NextResponse.json(
          { error: 'Email sudah terdaftar' },
          { status: 409 }
        );
      }
    }

    const updateData: Record<string, unknown> = {
      name: name ?? existing.name,
      email: email ?? existing.email,
    };

    // Validate role if provided
    if (role !== undefined) {
      const VALID_ROLES = ['super_admin', 'staff']
      updateData.role = VALID_ROLES.includes(role) ? role : existing.role
    } else {
      updateData.role = existing.role
    }

    // Validate password strength if provided
    if (password) {
      if (typeof password !== 'string' || password.length < 8) {
        return NextResponse.json(
          { error: 'Password minimal 8 karakter' },
          { status: 400 }
        );
      }
      updateData.password = await hash(password, 10);
    }

    const user = await db.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error updating user:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'Gagal mengupdate pengguna' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireSuperAdmin(request)
  if (auth instanceof NextResponse) return auth
  try {
    const { id } = await params;

    const existing = await db.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Pengguna tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if user has related records
    const quoteCount = await db.quote.count({ where: { createdById: id } });
    const txCount = await db.inventoryTransaction.count({ where: { createdById: id } });
    const docCount = await db.document.count({ where: { createdById: id } });

    if (quoteCount > 0 || txCount > 0 || docCount > 0) {
      return NextResponse.json(
        { error: 'Pengguna tidak dapat dihapus karena memiliki data terkait' },
        { status: 409 }
      );
    }

    // Prevent self-deletion
    if (id === auth.user.id) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus akun sendiri' },
        { status: 403 }
      );
    }

    await db.user.delete({ where: { id } });

    return NextResponse.json({ message: 'Pengguna berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting user:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'Gagal menghapus pengguna' },
      { status: 500 }
    );
  }
}