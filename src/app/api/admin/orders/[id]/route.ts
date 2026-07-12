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

    const order = await db.order.findUnique({
      where: { id },
      include: {
        client: true,
        quote: {
          include: {
            items: {
              include: {
                product: {
                  select: { id: true, name: true, slug: true, unit: true },
                },
              },
            },
          },
        },
        inventoryTransactions: {
          include: {
            item: true,
            createdBy: {
              select: { name: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Pesanan tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error fetching order:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'Gagal memuat detail pesanan' },
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
      dpPaidAt,
      dpAmount,
      balanceDue,
      balancePaidAt,
      vendorTracking,
      shippedAt,
      receivedAt,
      productionNotes,
    } = body;

    const VALID_STATUSES = ['dp_pending', 'bahan_dipesan', 'produksi', 'qc', 'siap_kirim', 'dikirim', 'lunas']

    // Validate status if provided
    if (status !== undefined && !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `Status tidak valid. Pilihan: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate numeric fields
    if (dpAmount !== undefined && (typeof dpAmount !== 'number' || !Number.isFinite(dpAmount) || dpAmount < 0)) {
      return NextResponse.json({ error: 'Jumlah DP tidak valid' }, { status: 400 });
    }
    if (balanceDue !== undefined && (typeof balanceDue !== 'number' || !Number.isFinite(balanceDue) || balanceDue < 0)) {
      return NextResponse.json({ error: 'Sisa pembayaran tidak valid' }, { status: 400 });
    }

    // Validate string fields length
    if (vendorTracking !== undefined && vendorTracking !== null && (typeof vendorTracking !== 'string' || vendorTracking.length > 200)) {
      return NextResponse.json({ error: 'No. resi terlalu panjang (maks 200 karakter)' }, { status: 400 });
    }
    if (productionNotes !== undefined && productionNotes !== null && (typeof productionNotes !== 'string' || productionNotes.length > 2000)) {
      return NextResponse.json({ error: 'Catatan produksi terlalu panjang (maks 2000 karakter)' }, { status: 400 });
    }

    // Validate date fields: if provided, must create valid Date
    const dateFields = [
      { val: dpPaidAt, label: 'Tanggal DP dibayar' },
      { val: balancePaidAt, label: 'Tanggal pelunasan' },
      { val: shippedAt, label: 'Tanggal pengiriman' },
      { val: receivedAt, label: 'Tanggal diterima' },
    ];
    for (const { val, label } of dateFields) {
      if (val !== undefined && val !== null && val !== '') {
        const d = new Date(val);
        if (isNaN(d.getTime())) {
          return NextResponse.json({ error: `${label} tidak valid` }, { status: 400 });
        }
      }
    }

    const existing = await db.order.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Pesanan tidak ditemukan' },
        { status: 404 }
      );
    }

    const order = await db.order.update({
      where: { id },
      data: {
        status: status ?? existing.status,
        dpPaidAt: dpPaidAt !== undefined ? (dpPaidAt ? new Date(dpPaidAt) : null) : existing.dpPaidAt,
        dpAmount: dpAmount !== undefined ? dpAmount : existing.dpAmount,
        balanceDue: balanceDue !== undefined ? balanceDue : existing.balanceDue,
        balancePaidAt: balancePaidAt !== undefined ? (balancePaidAt ? new Date(balancePaidAt) : null) : existing.balancePaidAt,
        vendorTracking: vendorTracking !== undefined ? vendorTracking : existing.vendorTracking,
        shippedAt: shippedAt !== undefined ? (shippedAt ? new Date(shippedAt) : null) : existing.shippedAt,
        receivedAt: receivedAt !== undefined ? (receivedAt ? new Date(receivedAt) : null) : existing.receivedAt,
        productionNotes: productionNotes !== undefined ? productionNotes : existing.productionNotes,
      },
      include: {
        client: true,
        quote: {
          include: {
            items: {
              include: {
                product: {
                  select: { id: true, name: true, slug: true, unit: true },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Error updating order:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'Gagal mengupdate pesanan' },
      { status: 500 }
    );
  }
}