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

    const product = await db.product.findUnique({
      where: { id },
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
      { error: 'Gagal memuat produk' },
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

    // Validate fields if provided
    if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0 || name.length > 200)) {
      return NextResponse.json({ error: 'Nama produk tidak valid (maks 200 karakter)' }, { status: 400 });
    }
    if (slug !== undefined && slug !== null && (typeof slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 200)) {
      return NextResponse.json({ error: 'Slug tidak valid (hanya huruf kecil, angka, dan dash)' }, { status: 400 });
    }
    const VALID_CATEGORIES = ['tumbler', 'plakat', 'lanyard', 'hardbox', 'goodie_bag', 'starter_kit']
    if (category !== undefined && !VALID_CATEGORIES.includes(category)) {
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
    if (basePrice !== undefined && (typeof basePrice !== 'number' || !Number.isFinite(basePrice) || basePrice < 0)) {
      return NextResponse.json({ error: 'Harga dasar harus berupa angka non-negatif' }, { status: 400 });
    }
    if (minQty !== undefined && (!Number.isInteger(minQty) || minQty < 1)) {
      return NextResponse.json({ error: 'Min. qty harus bilangan bulat positif' }, { status: 400 });
    }
    if (sortOrder !== undefined && (!Number.isInteger(sortOrder) || sortOrder < 0)) {
      return NextResponse.json({ error: 'Urutan tampil harus bilangan bulat non-negatif' }, { status: 400 });
    }

    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check slug uniqueness if changed
    if (slug && slug !== existing.slug) {
      const slugExists = await db.product.findUnique({ where: { slug } });
      if (slugExists) {
        return NextResponse.json(
          { error: 'Slug sudah digunakan' },
          { status: 409 }
        );
      }
    }

    // If images or tiers are provided, delete old ones and recreate
    if (images !== undefined) {
      // Validate image paths: prevent path traversal, allow known prefixes
      if (Array.isArray(images)) {
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
    }

    // M6: Wrap in transaction to prevent data loss if update fails
    const product = await db.$transaction(async (tx) => {
      if (images !== undefined) {
        await tx.productImage.deleteMany({ where: { productId: id } });
      }
      if (tiers !== undefined) {
        await tx.pricingTier.deleteMany({ where: { productId: id } });
      }

      return tx.product.update({
        where: { id },
        data: {
          name: name ?? existing.name,
          slug: slug ?? existing.slug,
          category: category ?? existing.category,
          description: description !== undefined ? description : existing.description,
          specs: specs !== undefined ? specs : existing.specs,
          basePrice: basePrice !== undefined ? basePrice : existing.basePrice,
          unit: unit ?? existing.unit,
          minQty: minQty ?? existing.minQty,
          isActive: isActive !== undefined ? isActive : existing.isActive,
          sortOrder: sortOrder !== undefined ? sortOrder : existing.sortOrder,
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
    });

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Error updating product:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'Gagal mengupdate produk' },
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

    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: 'Produk tidak ditemukan' },
        { status: 404 }
      );
    }

    // Check if product is referenced in quotes
    const quoteItemCount = await db.quoteItem.count({ where: { productId: id } });
    if (quoteItemCount > 0) {
      return NextResponse.json(
        { error: 'Produk tidak dapat dihapus karena sudah tercantum dalam penawaran. Nonaktifkan produk ini sebagai gantinya.' },
        { status: 409 }
      );
    }

    await db.product.delete({ where: { id } });

    return NextResponse.json({ message: 'Produk berhasil dihapus' });
  } catch (error) {
    console.error('Error deleting product:', error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: 'Gagal menghapus produk' },
      { status: 500 }
    );
  }
}