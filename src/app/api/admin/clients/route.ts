import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { parsePagination } from '@/lib/pagination';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) return auth
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, search } = parsePagination(searchParams);

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { companyName: { contains: search } },
        { picName: { contains: search } },
      ];
    }

    const [data, total] = await Promise.all([
      db.client.findMany({
        where,
        include: {
          _count: {
            select: { quotes: true, orders: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.client.count({ where }),
    ]);

    return NextResponse.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Gagal memuat klien' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) return auth
  try {
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

    if (!companyName || !picName || !whatsapp || !email) {
      return NextResponse.json(
        { error: 'Data wajib tidak lengkap' },
        { status: 400 }
      );
    }

    // Validate field types & lengths
    if (typeof companyName !== 'string' || companyName.trim().length === 0 || companyName.length > 200) {
      return NextResponse.json({ error: 'Nama perusahaan tidak valid (maks 200 karakter)' }, { status: 400 });
    }
    if (typeof picName !== 'string' || picName.trim().length === 0 || picName.length > 200) {
      return NextResponse.json({ error: 'Nama PIC tidak valid (maks 200 karakter)' }, { status: 400 });
    }
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 200) {
      return NextResponse.json({ error: 'Format email tidak valid' }, { status: 400 });
    }
    if (typeof whatsapp !== 'string' || !/^[0-9+\-\s()]{8,20}$/.test(whatsapp)) {
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

    const client = await db.client.create({
      data: {
        companyName,
        npwp: npwp || null,
        alamat: alamat || null,
        kota: kota || null,
        picName,
        picTitle: picTitle || null,
        whatsapp,
        email,
        notes: notes || null,
      },
    });

    return NextResponse.json({ client }, { status: 201 });
  } catch (error) {
    console.error('Error creating client:', error);
    return NextResponse.json(
      { error: 'Gagal membuat klien' },
      { status: 500 }
    );
  }
}