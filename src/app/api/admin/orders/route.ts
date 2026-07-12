import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { parsePagination } from '@/lib/pagination';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) return auth
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const { page, limit, search } = parsePagination(searchParams);

    const where: Record<string, unknown> = {};
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { client: { companyName: { contains: search } } },
      ];
    }

    const [data, total] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          client: {
            select: { id: true, companyName: true, picName: true, whatsapp: true },
          },
          quote: {
            select: {
              id: true,
              quoteNumber: true,
              total: true,
              items: {
                select: { id: true, customDescription: true, qty: true, product: { select: { name: true } } },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.order.count({ where }),
    ]);

    return NextResponse.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Gagal memuat pesanan' },
      { status: 500 }
    );
  }
}