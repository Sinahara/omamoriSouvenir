import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) return auth
  try {
    const { id } = await params;

    const quote = await db.quote.findUnique({
      where: { id },
      include: {
        client: true,
        items: {
          include: {
            product: {
              select: { id: true, name: true, slug: true, unit: true },
            },
          },
          orderBy: { id: 'asc' },
        },
        createdBy: {
          select: { id: true, name: true },
        },
        order: true,
      },
    });

    if (!quote) {
      return NextResponse.json(
        { error: 'Penawaran tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ quote });
  } catch (error) {
    console.error('Error fetching quote:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'Gagal memuat detail penawaran' },
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
      status,
      notes,
      subtotal,
      discPct,
      discAmt,
      total,
      dpPct,
      dpAmount,
      validUntil,
      deadline,
      items,
    } = body;

    const VALID_STATUSES = ['pending', 'diproses', 'dikirim', 'accepted', 'rejected']

    // Validate status if provided
    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Status tidak valid. Pilihan: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate numeric fields
    const numericChecks: { val: unknown; label: string }[] = [
      { val: subtotal, label: 'Subtotal' },
      { val: discPct, label: 'Diskon (%)' },
      { val: discAmt, label: 'Jumlah diskon' },
      { val: total, label: 'Total' },
      { val: dpPct, label: 'DP (%)' },
      { val: dpAmount, label: 'Jumlah DP' },
    ]
    for (const { val, label } of numericChecks) {
      if (val !== undefined && (typeof val !== 'number' || !Number.isFinite(val) || val < 0)) {
        return NextResponse.json({ error: `${label} harus berupa angka non-negatif` }, { status: 400 });
      }
    }

    // Validate notes length
    if (notes !== undefined && notes !== null && (typeof notes !== 'string' || notes.length > 2000)) {
      return NextResponse.json({ error: 'Catatan terlalu panjang (maks 2000 karakter)' }, { status: 400 });
    }

    const existing = await db.quote.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Penawaran tidak ditemukan' },
        { status: 404 }
      );
    }

    // Update quote fields
    const quote = await db.quote.update({
      where: { id },
      data: {
        status: status ?? existing.status,
        notes: notes !== undefined ? notes : existing.notes,
        subtotal: subtotal !== undefined ? subtotal : existing.subtotal,
        discPct: discPct !== undefined ? discPct : existing.discPct,
        discAmt: discAmt !== undefined ? discAmt : existing.discAmt,
        total: total !== undefined ? total : existing.total,
        dpPct: dpPct !== undefined ? dpPct : existing.dpPct,
        dpAmount: dpAmount !== undefined ? dpAmount : existing.dpAmount,
        validUntil: validUntil !== undefined ? (validUntil ? new Date(validUntil) : null) : existing.validUntil,
        deadline: deadline !== undefined ? (deadline ? new Date(deadline) : null) : existing.deadline,
      },
      include: {
        client: true,
        items: {
          include: {
            product: {
              select: { id: true, name: true, slug: true, unit: true },
            },
          },
        },
      },
    });

    // Update items if provided
    if (items && Array.isArray(items)) {
      for (const item of items) {
        if (!item.id) continue;

        // Validate quote item fields
        if (item.qty !== undefined) {
          if (typeof item.qty !== 'number' || !Number.isFinite(item.qty) || item.qty < 1) {
            return NextResponse.json({ error: 'Jumlah item harus berupa angka minimal 1' }, { status: 400 });
          }
        }
        if (item.unitPrice !== undefined) {
          if (typeof item.unitPrice !== 'number' || !Number.isFinite(item.unitPrice) || item.unitPrice < 0) {
            return NextResponse.json({ error: 'Harga satuan harus berupa angka non-negatif' }, { status: 400 });
          }
        }
        if (item.subtotal !== undefined) {
          if (typeof item.subtotal !== 'number' || !Number.isFinite(item.subtotal) || item.subtotal < 0) {
            return NextResponse.json({ error: 'Subtotal harus berupa angka non-negatif' }, { status: 400 });
          }
        }
        if (item.notes !== undefined && item.notes !== null && typeof item.notes !== 'string') {
          return NextResponse.json({ error: 'Catatan item harus berupa teks' }, { status: 400 });
        }
        if (typeof item.notes === 'string' && item.notes.length > 500) {
          return NextResponse.json({ error: 'Catatan item maksimal 500 karakter' }, { status: 400 });
        }

        await db.quoteItem.update({
          where: { id: item.id, quoteId: id },
          data: {
            qty: item.qty !== undefined ? item.qty : undefined,
            unitPrice: item.unitPrice !== undefined ? item.unitPrice : undefined,
            subtotal: item.subtotal !== undefined ? item.subtotal : undefined,
            notes: item.notes !== undefined ? item.notes : undefined,
          },
        });
      }

      // Return updated quote with fresh items
      const updatedQuote = await db.quote.findUnique({
        where: { id },
        include: {
          client: true,
          items: {
            include: {
              product: {
                select: { id: true, name: true, slug: true, unit: true },
              },
            },
            orderBy: { id: 'asc' },
          },
          order: true,
        },
      });

      return NextResponse.json({ quote: updatedQuote });
    }

    return NextResponse.json({ quote });
  } catch (error) {
    console.error('Error updating quote:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'Gagal mengupdate penawaran' },
      { status: 500 }
    );
  }
}