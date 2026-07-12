import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { parsePagination } from '@/lib/pagination';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) return auth
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const { page, limit, search } = parsePagination(searchParams);

    const where: Record<string, unknown> = {};
    if (category) {
      where.category = category;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
      ];
    }

    const [data, total] = await Promise.all([
      db.product.findMany({
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
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.product.count({ where }),
    ]);

    return NextResponse.json({ data, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Gagal memuat produk' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) return auth
  try {
    const body = await request.json();
    const {
      name,
      slug,
      category,
      description,
      specs,
      basePrice,
      unit,
      minQty,
      isActive,
      sortOrder,
      images,
      tiers,
    } = body;

    if (!name || !slug || !category) {
      return NextResponse.json(
        { error: 'Nama, slug, dan kategori wajib diisi' },
        { status: 400 }
      );
    }

    // Validate string fields type & length
    if (typeof name !== 'string' || name.trim().length === 0 || name.length > 200) {
      return NextResponse.json({ error: 'Nama produk tidak valid (maks 200 karakter)' }, { status: 400 });
    }
    if (typeof slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 200) {
      return NextResponse.json({ error: 'Slug tidak valid (hanya huruf kecil, angka, dan dash)' }, { status: 400 });
    }
    const VALID_CATEGORIES = ['tumbler', 'plakat', 'lanyard', 'hardbox', 'goodie_bag', 'starter_kit']
    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: `Kategori tidak valid. Pilihan: ${VALID_CATEGORIES.join(', ')}` }, { status: 400 });
    }
    if (description !== undefined && description !== null && (typeof description !== 'string' || description.length > 5000)) {
      return NextResponse.json({ error: 'Deskripsi terlalu panjang (maks 5000 karakter)' }, { status: 400 });
    }
    if (specs !== undefined && specs !== null && (typeof specs !== 'string' || specs.length > 5000)) {
      return NextResponse.json({ error: 'Spesifikasi terlalu panjang (maks 5000 karakter)' }, { status: 400 });
    }
    if (unit !== undefined && (typeof unit !== 'string' || unit.length > 20)) {
      return NextResponse.json({ error: 'Satuan tidak valid (maks 20 karakter)' }, { status: 400 });
    }

    // Validate numeric fields
    if (basePrice !== undefined && (typeof basePrice !== 'number' || !Number.isFinite(basePrice) || basePrice < 0)) {
      return NextResponse.json({ error: 'Harga dasar harus berupa angka non-negatif' }, { status: 400 });
    }
    if (minQty !== undefined && (!Number.isInteger(minQty) || minQty < 1)) {
      return NextResponse.json({ error: 'Min. qty harus bilangan bulat positif' }, { status: 400 });
    }
    if (sortOrder !== undefined && (!Number.isInteger(sortOrder) || sortOrder < 0)) {
      return NextResponse.json({ error: 'Urutan tampil harus bilangan bulat non-negatif' }, { status: 400 });
    }

    // Check slug uniqueness
    const existing = await db.product.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json(
        { error: 'Slug sudah digunakan' },
        { status: 409 }
      );
    }

    // Validate image paths: prevent path traversal, allow known prefixes
    if (images && Array.isArray(images)) {
      for (const img of images) {
        if (img.path && typeof img.path === 'string') {
          // Reject path traversal attempts
          if (img.path.includes('..') || img.path.includes('\\')) {
            return NextResponse.json(
              { error: 'Path gambar mengandung karakter tidak valid' },
              { status: 400 }
            );
          }
          // Must start with / and be a known safe prefix or a root-level filename
          const validPrefixes = ['/uploads/', '/images/', '/products/']
          const isValidPrefix = validPrefixes.some(p => img.path.startsWith(p))
          const isRootFile = /^\/[a-z0-9][a-z0-9._-]*\.(jpg|jpeg|png|gif|webp|svg)$/i.test(img.path)
          if (!isValidPrefix && !isRootFile) {
            return NextResponse.json(
              { error: 'Path gambar tidak valid (hanya /uploads/, /images/, /products/, atau file di root diizinkan)' },
              { status: 400 }
            );
          }
        }
      }
    }

    const product = await db.product.create({
      data: {
        name,
        slug,
        category,
        description: description || null,
        specs: specs || null,
        basePrice: basePrice || 0,
        unit: unit || 'pcs',
        minQty: minQty || 1,
        isActive: isActive ?? true,
        sortOrder: sortOrder || 0,
        images: images?.length
          ? {
              create: images.map(
                (img: { path: string; isPrimary?: boolean }, idx: number) => ({
                  path: img.path,
                  isPrimary: img.isPrimary ?? false,
                  sortOrder: idx,
                })
              ),
            }
          : undefined,
        pricingTiers: tiers?.length
          ? {
              create: tiers.map((tier: { minQty: number; maxQty?: number; pricePerUnit: number }) => ({
                minQty: tier.minQty,
                maxQty: tier.maxQty ?? null,
                pricePerUnit: tier.pricePerUnit,
              })),
            }
          : undefined,
      },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        pricingTiers: { orderBy: { minQty: 'asc' } },
      },
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Gagal membuat produk' },
      { status: 500 }
    );
  }
}