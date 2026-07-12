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

    const item = await db.inventoryItem.findUnique({
      where: { id },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
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
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Item inventaris tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error('Error fetching inventory item:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'Gagal memuat detail item' },
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
    const { name, category, unit, minimumStock, notes } = body;

    // Type & length validation (only for fields that are provided)
    if (name !== undefined) {
      if (typeof name !== 'string') {
        return NextResponse.json({ error: 'Nama harus berupa teks' }, { status: 400 });
      }
      if (name.trim().length === 0 || name.trim().length > 200) {
        return NextResponse.json({ error: 'Nama harus diisi dan maksimal 200 karakter' }, { status: 400 });
      }
    }
    if (category !== undefined) {
      if (typeof category !== 'string') {
        return NextResponse.json({ error: 'Kategori harus berupa teks' }, { status: 400 });
      }
      if (category.trim().length === 0 || category.trim().length > 100) {
        return NextResponse.json({ error: 'Kategori harus diisi dan maksimal 100 karakter' }, { status: 400 });
      }
    }
    if (unit !== undefined) {
      if (typeof unit !== 'string') {
        return NextResponse.json({ error: 'Satuan harus berupa teks' }, { status: 400 });
      }
      if (unit.trim().length === 0 || unit.trim().length > 50) {
        return NextResponse.json({ error: 'Satuan harus diisi dan maksimal 50 karakter' }, { status: 400 });
      }
    }
    if (notes !== undefined) {
      if (typeof notes !== 'string' && notes !== null) {
        return NextResponse.json({ error: 'Catatan harus berupa teks' }, { status: 400 });
      }
      if (notes !== null && notes.length > 1000) {
        return NextResponse.json({ error: 'Catatan maksimal 1000 karakter' }, { status: 400 });
      }
    }
    if (minimumStock !== undefined) {
      const parsedMinimumStock = Number(minimumStock);
      if (typeof minimumStock !== 'number' || !Number.isFinite(parsedMinimumStock) || parsedMinimumStock < 0) {
        return NextResponse.json({ error: 'Stok minimum harus berupa angka non-negatif' }, { status: 400 });
      }
    }

    const existing = await db.inventoryItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Item inventaris tidak ditemukan' },
        { status: 404 }
      );
    }

    const item = await db.inventoryItem.update({
      where: { id },
      data: {
        name: name ?? existing.name,
        category: category ?? existing.category,
        unit: unit ?? existing.unit,
        minimumStock: minimumStock !== undefined ? minimumStock : existing.minimumStock,
        notes: notes !== undefined ? notes : existing.notes,
      },
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error('Error updating inventory item:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'Gagal mengupdate item inventaris' },
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

    const existing = await db.inventoryItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Item inventaris tidak ditemukan' },
        { status: 404 }
      );
    }

    // H5: Guard against deleting items with transaction history
    const transactionCount = await db.inventoryTransaction.count({ where: { itemId: id } });
    if (transactionCount > 0) {
      return NextResponse.json(
        { error: 'Item tidak dapat dihapus karena memiliki riwayat transaksi. Pertimbangkan untuk memperbarui stok menjadi 0 sebagai gantinya.' },
        { status: 409 }
      );
    }

    await db.inventoryItem.delete({ where: { id } });

    return NextResponse.json({ message: 'Item inventaris berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return NextResponse.json(
      { error: 'Gagal menghapus item inventaris' },
      { status: 500 }
    );
  }
}