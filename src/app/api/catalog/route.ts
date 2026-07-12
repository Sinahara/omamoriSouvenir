import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = { isActive: true };

    if (category) {
      where.category = category;
    }

    if (search) {
      where.name = { contains: search.slice(0, 100) };
    }

    const products = await db.product.findMany({
      where,
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        pricingTiers: {
          orderBy: { minQty: 'asc' },
        },
      },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching catalog:', error);
    return NextResponse.json(
      { error: 'Gagal memuat katalog produk' },
      { status: 500 }
    );
  }
}