import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, requireSuperAdmin } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) return auth
  try {
    const { id } = await params;

    const client = await db.client.findUnique({
      where: { id },
      include: {
        quotes: {
          orderBy: { createdAt: 'desc' },
          include: {
            items: { select: { id: true } },
          },
        },
        orders: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: 'Klien tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ client });
  } catch (error) {
    console.error('Error fetching client:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Gagal memuat detail klien' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) return auth
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      companyName,
      npwp,
      alamat,
      kota,
      picName,
      picTitle,
      whatsapp,
      email,
      notes,
    } = body;

    // Validate fields if provided
    if (companyName !== undefined && (typeof companyName !== 'string' || companyName.trim().length === 0 || companyName.length > 200)) {
      return NextResponse.json({ error: 'Nama perusahaan tidak valid (maks 200 karakter)' }, { status: 400 });
    }
    if (picName !== undefined && (typeof picName !== 'string' || picName.trim().length === 0 || picName.length > 200)) {
      return NextResponse.json({ error: 'Nama PIC tidak valid (maks 200 karakter)' }, { status: 400 });
    }
    if (email !== undefined && (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200)) {
      return NextResponse.json({ error: 'Format email tidak valid' }, { status: 400 });
    }
    if (whatsapp !== undefined && (typeof whatsapp !== 'string' || !/^[0-9+\-\s()]{8,20}$/.test(whatsapp))) {
      return NextResponse.json({ error: 'Format nomor WhatsApp tidak valid' }, { status: 400 });
    }
    if (npwp !== undefined && npwp !== null && (typeof npwp !== 'string' || npwp.length > 50)) {
      return NextResponse.json({ error: 'NPWP tidak valid (maks 50 karakter)' }, { status: 400 });
    }
    if (alamat !== undefined && alamat !== null && (typeof alamat !== 'string' || alamat.length > 500)) {
      return NextResponse.json({ error: 'Alamat terlalu panjang (maks 500 karakter)' }, { status: 400 });
    }
    if (kota !== undefined && kota !== null && (typeof kota !== 'string' || kota.length > 100)) {
      return NextResponse.json({ error: 'Kota tidak valid (maks 100 karakter)' }, { status: 400 });
    }
    if (picTitle !== undefined && picTitle !== null && (typeof picTitle !== 'string' || picTitle.length > 100)) {
      return NextResponse.json({ error: 'Jabatan PIC tidak valid (maks 100 karakter)' }, { status: 400 });
    }
    if (notes !== undefined && notes !== null && (typeof notes !== 'string' || notes.length > 2000)) {
      return NextResponse.json({ error: 'Catatan terlalu panjang (maks 2000 karakter)' }, { status: 400 });
    }

    const existing = await db.client.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Klien tidak ditemukan' },
        { status: 404 }
      );
    }

    const client = await db.client.update({
      where: { id },
      data: {
        companyName: companyName ?? existing.companyName,
        npwp: npwp !== undefined ? npwp : existing.npwp,
        alamat: alamat !== undefined ? alamat : existing.alamat,
        kota: kota !== undefined ? kota : existing.kota,
        picName: picName ?? existing.picName,
        picTitle: picTitle !== undefined ? picTitle : existing.picTitle,
        whatsapp: whatsapp ?? existing.whatsapp,
        email: email ?? existing.email,
        notes: notes !== undefined ? notes : existing.notes,
      },
    });

    return NextResponse.json({ client });
  } catch (error) {
    console.error('Error updating client:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Gagal mengupdate klien' },
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

    const existing = await db.client.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Klien tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if client has quotes or orders
    const quoteCount = await db.quote.count({ where: { clientId: id } });
    const orderCount = await db.order.count({ where: { clientId: id } });

    if (quoteCount > 0 || orderCount > 0) {
      return NextResponse.json(
        { error: 'Klien tidak dapat dihapus karena memiliki penawaran atau pesanan terkait' },
        { status: 409 }
      );
    }

    await db.client.delete({ where: { id } });

    return NextResponse.json({ message: 'Klien berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting client:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Gagal menghapus klien' },
      { status: 500 }
    );
  }
}