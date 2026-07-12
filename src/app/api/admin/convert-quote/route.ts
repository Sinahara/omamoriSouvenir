import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

async function getNextOrderNumber(tx: any): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `ORD/${year}/${month}/`;

  const result = await tx.order.aggregate({
    _max: { orderNumber: true },
    where: { orderNumber: { startsWith: prefix } },
  });

  const lastNumber = result._max.orderNumber;
  if (!lastNumber) {
    return `${prefix}0001`;
  }

  const parts = lastNumber.split('/');
  const seq = parseInt(parts[3], 10) + 1;
  return `${prefix}${String(seq).padStart(4, '0')}`;
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) return auth
  try {
    const body = await request.json();
    const { quoteId } = body;

    if (!quoteId) {
      return NextResponse.json(
        { error: 'Quote ID wajib diisi' },
        { status: 400 }
      );
    }

    // Use transaction to prevent race condition on order number generation
    const order = await db.$transaction(async (tx) => {
      // Fetch the quote with client inside transaction
      const quote = await tx.quote.findUnique({
        where: { id: quoteId },
        include: { client: true },
      });

      if (!quote) {
        throw new Error('NOT_FOUND');
      }

      // Check if order already exists for this quote
      const existingOrder = await tx.order.findUnique({
        where: { quoteId },
      });

      if (existingOrder) {
        throw new Error('ALREADY_EXISTS');
      }

      const orderNumber = await getNextOrderNumber(tx);

      // Create order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          quoteId: quote.id,
          clientId: quote.clientId,
          status: 'dp_pending',
          dpAmount: quote.dpAmount,
          balanceDue: quote.total - quote.dpAmount,
        },
        include: {
          client: true,
          quote: true,
        },
      });

      // Update quote status to accepted
      await tx.quote.update({
        where: { id: quoteId },
        data: { status: 'accepted' },
      });

      return newOrder;
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'NOT_FOUND') {
      return NextResponse.json(
        { error: 'Penawaran tidak ditemukan' },
        { status: 404 }
      );
    }
    if (error.message === 'ALREADY_EXISTS') {
      return NextResponse.json(
        { error: 'Pesanan sudah ada untuk penawaran ini' },
        { status: 409 }
      );
    }
    console.error('Error converting quote to order:', error);
    return NextResponse.json(
      { error: 'Gagal mengkonversi penawaran menjadi pesanan' },
      { status: 500 }
    );
  }
}