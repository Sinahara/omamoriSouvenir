import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) return auth
  try {
    const body = await request.json();
    const { itemId, type, qty, orderId, refNumber, notes } = body;

    if (!itemId || !type || qty === undefined || qty === null) {
      return NextResponse.json(
        { error: 'Item ID, tipe, dan jumlah wajib diisi' },
        { status: 400 }
      );
    }

    if (!['stock_in', 'stock_out', 'adjustment'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipe transaksi tidak valid' },
        { status: 400 }
      );
    }

    // Validate qty is a valid, non-negative number
    const parsedQty = Number(qty);
    if (!Number.isFinite(parsedQty) || parsedQty < 0) {
      return NextResponse.json(
        { error: 'Jumlah tidak valid' },
        { status: 400 }
      );
    }

    // Validate notes: must be string if provided, max 1000 chars
    if (notes !== undefined && notes !== null && typeof notes !== 'string') {
      return NextResponse.json(
        { error: 'Catatan harus berupa teks' },
        { status: 400 }
      );
    }
    if (typeof notes === 'string' && notes.length > 1000) {
      return NextResponse.json(
        { error: 'Catatan maksimal 1000 karakter' },
        { status: 400 }
      );
    }

    // Validate refNumber: must be string if provided, max 200 chars
    if (refNumber !== undefined && refNumber !== null && typeof refNumber !== 'string') {
      return NextResponse.json(
        { error: 'Nomor referensi harus berupa teks' },
        { status: 400 }
      );
    }
    if (typeof refNumber === 'string' && refNumber.length > 200) {
      return NextResponse.json(
        { error: 'Nomor referensi maksimal 200 karakter' },
        { status: 400 }
      );
    }

    // Validate orderId: if provided, check it exists in DB
    if (orderId) {
      const orderExists = await db.order.findUnique({ where: { id: orderId } });
      if (!orderExists) {
        return NextResponse.json(
          { error: 'Pesanan tidak ditemukan' },
          { status: 400 }
        );
      }
    }

    // Wrap entire operation in a transaction to prevent race condition on stock
    const result = await db.$transaction(async (tx) => {
      // Read current stock inside transaction (consistent read)
      const item = await tx.inventoryItem.findUnique({ where: { id: itemId } });
      if (!item) {
        throw new Error('NOT_FOUND');
      }

      // Calculate new stock
      let newStock: number;
      switch (type) {
        case 'stock_in':
          newStock = item.currentStock + parsedQty;
          break;
        case 'stock_out':
          newStock = Math.max(0, item.currentStock - parsedQty);
          break;
        case 'adjustment':
          newStock = parsedQty; // For adjustment, qty is the new absolute value
          break;
        default:
          newStock = item.currentStock;
      }

      // Create transaction record
      const transaction = await tx.inventoryTransaction.create({
        data: {
          itemId,
          orderId: orderId || null,
          type,
          qty: parsedQty,
          refNumber: refNumber || null,
          notes: notes || null,
          createdById: auth.user.id,
        },
        include: {
          item: true,
          createdBy: { select: { name: true } },
          order: { select: { orderNumber: true } },
        },
      });

      // Update inventory item stock atomically
      await tx.inventoryItem.update({
        where: { id: itemId },
        data: { currentStock: newStock },
      });

      return { transaction, newStock };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return NextResponse.json(
        { error: 'Item inventaris tidak ditemukan' },
        { status: 404 }
      );
    }
    console.error('Error creating inventory transaction:', error);
    return NextResponse.json(
      { error: 'Gagal mencatat transaksi inventaris' },
      { status: 500 }
    );
  }
}