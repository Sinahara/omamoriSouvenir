import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const product = await db.product.findFirst({
      where: { slug, isActive: true },
      include: {
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        pricingTiers: {
          orderBy: { minQty: 'asc' },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Error fetching product:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'Gagal memuat detail produk' },
      { status: 500 }
    );
  }
}