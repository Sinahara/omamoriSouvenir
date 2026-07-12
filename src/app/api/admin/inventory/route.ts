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
        { name: { contains: search } },
        { category: { contains: search } },
      ];
    }

    const [data, total] = await Promise.all([
      db.inventoryItem.findMany({
        where,
        include: {
          transactions: {
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: {
              createdBy: {
                select: { name: true },
              },
              order: {
                select: { orderNumber: true },
              },
            },
          },
        },
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.inventoryItem.count({ where }),
    ]);

    return NextResponse.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    return NextResponse.json(
      { error: 'Gagal memuat inventaris' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) return auth
  try {
    const body = await request.json();
    const { name, category, unit, currentStock, minimumStock, notes } = body;

    // Type validation
    if (typeof name !== 'string' || typeof category !== 'string' || typeof unit !== 'string') {
      return NextResponse.json(
        { error: 'Nama, kategori, dan satuan harus berupa teks' },
        { status: 400 }
      );
    }

    // Length validation
    if (name.trim().length === 0 || name.trim().length > 200) {
      return NextResponse.json(
        { error: 'Nama harus diisi dan maksimal 200 karakter' },
        { status: 400 }
      );
    }
    if (category.trim().length === 0 || category.trim().length > 100) {
      return NextResponse.json(
        { error: 'Kategori harus diisi dan maksimal 100 karakter' },
        { status: 400 }
      );
    }
    if (unit.trim().length === 0 || unit.trim().length > 50) {
      return NextResponse.json(
        { error: 'Satuan harus diisi dan maksimal 50 karakter' },
        { status: 400 }
      );
    }
    if (notes !== undefined && notes !== null && typeof notes !== 'string') {
      return NextResponse.json(
        { error: 'Catatan harus berupa teks' },
        { status: 400 }
      );
    }
    if (notes && notes.length > 1000) {
      return NextResponse.json(
        { error: 'Catatan maksimal 1000 karakter' },
        { status: 400 }
      );
    }

    // Validate currentStock: must be number, finite, >= 0
    if (currentStock !== undefined) {
      const parsedCurrentStock = Number(currentStock);
      if (typeof currentStock !== 'number' || !Number.isFinite(parsedCurrentStock) || parsedCurrentStock < 0) {
        return NextResponse.json(
          { error: 'Stok saat ini harus berupa angka non-negatif' },
          { status: 400 }
        );
      }
    }

    // Validate minimumStock: must be number, finite, >= 0
    if (minimumStock !== undefined) {
      const parsedMinimumStock = Number(minimumStock);
      if (typeof minimumStock !== 'number' || !Number.isFinite(parsedMinimumStock) || parsedMinimumStock < 0) {
        return NextResponse.json(
          { error: 'Stok minimum harus berupa angka non-negatif' },
          { status: 400 }
        );
      }
    }

    const item = await db.inventoryItem.create({
      data: {
        name,
        category,
        unit,
        currentStock: Number(currentStock) || 0,
        minimumStock: Number(minimumStock) || 0,
        notes: notes || null,
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error('Error creating inventory item:', error);
    return NextResponse.json(
      { error: 'Gagal membuat item inventaris' },
      { status: 500 }
    );
  }
}