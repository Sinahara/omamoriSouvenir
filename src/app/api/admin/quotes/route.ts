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
        { quoteNumber: { contains: search } },
        { client: { companyName: { contains: search } } },
      ];
    }

    const [quotes, total] = await Promise.all([
      db.quote.findMany({
        where,
        include: {
          client: {
            select: { id: true, companyName: true, picName: true },
          },
          items: {
            select: { id: true },
          },
          createdBy: {
            select: { id: true, name: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.quote.count({ where }),
    ]);

    const data = quotes.map((q) => ({
      ...q,
      _count: { items: q.items.length },
    }));

    return NextResponse.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return NextResponse.json(
      { error: 'Gagal memuat penawaran' },
      { status: 500 }
    );
  }
}