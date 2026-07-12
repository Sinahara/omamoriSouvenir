import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isRateLimited as checkRateLimit, recordFailedAttempt } from '@/lib/rate-limiter';
import { verifyCaptchaToken } from './captcha/route';
import { getClientIp } from '@/lib/get-client-ip';

// --- Input validation helpers ---

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+\-\s()]{8,20}$/;
const MAX_STR_LEN = 200;
const MAX_ITEMS = 20;
const MAX_QTY = 100000;
const MAX_NOTES_LEN = 1000;

const QUOTE_RATE_CONFIG = { maxAttempts: 5, windowMs: 60 * 60 * 1000 }; // 5 per hour per IP

function sanitizeString(val: unknown, maxLen: number): string | null {
  if (typeof val !== 'string') return null;
  const trimmed = val.trim();
  if (trimmed.length === 0 || trimmed.length > maxLen) return null;
  return trimmed;
}

// (removed dead code: generateQuoteNumber — use getNextQuoteNumber instead)

async function getNextQuoteNumber(tx: any): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `QUO/${year}/${month}/`;

  const result = await tx.quote.aggregate({
    _max: { quoteNumber: true },
    where: { quoteNumber: { startsWith: prefix } },
  });

  const lastNumber = result._max.quoteNumber;
  if (!lastNumber) {
    return `${prefix}0001`;
  }

  const parts = lastNumber.split('/');
  const seq = parseInt(parts[3], 10) + 1;
  return `${prefix}${String(seq).padStart(4, '0')}`;
}

async function resolveUnitPrice(
  tx: Parameters<Parameters<typeof db.$transaction>[0]>[0],
  productSlug: string,
  qty: number
): Promise<number> {
  const product = await tx.product.findUnique({
    where: { slug: productSlug },
    include: {
      pricingTiers: {
        orderBy: { minQty: 'asc' },
      },
    },
  });

  if (!product) return 0;

  // Find the applicable pricing tier
  const applicableTier = [...product.pricingTiers]
    .reverse()
    .find((tier) => qty >= tier.minQty);

  if (applicableTier) {
    return applicableTier.pricePerUnit;
  }

  return product.basePrice;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = getClientIp(request);
    if (checkRateLimit(ip, QUOTE_RATE_CONFIG)) {
      return NextResponse.json(
        { error: 'Terlalu banyak permintaan. Silakan coba lagi nanti.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const {
      companyName,
      picName,
      picTitle,
      whatsapp,
      email,
      kota,
      alamat,
      items,
      deadline,
      notes,
      captcha,
    } = body;

    // --- CAPTCHA validation (server-side signed token) ---
    if (
      !captcha ||
      typeof captcha !== 'object' ||
      typeof captcha.token !== 'string' ||
      typeof captcha.answer !== 'number' ||
      !verifyCaptchaToken(captcha.token, captcha.answer)
    ) {
      return NextResponse.json(
        { error: 'Verifikasi gagal. Silakan coba lagi.' },
        { status: 400 }
      );
    }

    // --- Strict input validation ---
    const safeCompanyName = sanitizeString(companyName, MAX_STR_LEN);
    const safePicName = sanitizeString(picName, MAX_STR_LEN);
    const safePicTitle = sanitizeString(picTitle, MAX_STR_LEN);
    const safeWhatsapp = sanitizeString(whatsapp, 20);
    const safeEmail = sanitizeString(email, MAX_STR_LEN);
    const safeKota = sanitizeString(kota, MAX_STR_LEN);
    const safeAlamat = sanitizeString(alamat, 500);
    const safeNotes = sanitizeString(notes, MAX_NOTES_LEN);

    if (!safeCompanyName || !safePicName || !safeWhatsapp || !safeEmail) {
      return NextResponse.json(
        { error: 'Data wajib tidak lengkap' },
        { status: 400 }
      );
    }

    if (!EMAIL_RE.test(safeEmail)) {
      return NextResponse.json(
        { error: 'Format email tidak valid' },
        { status: 400 }
      );
    }

    if (!PHONE_RE.test(safeWhatsapp)) {
      return NextResponse.json(
        { error: 'Format nomor WhatsApp tidak valid' },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0 || items.length > MAX_ITEMS) {
      return NextResponse.json(
        { error: 'Item pesanan tidak valid (maks 20 item)' },
        { status: 400 }
      );
    }

    // Validate each item
    for (const item of items) {
      if (!item.productSlug || typeof item.productSlug !== 'string' || item.productSlug.length > MAX_STR_LEN) {
        return NextResponse.json(
          { error: 'Produk dalam item tidak valid' },
          { status: 400 }
        );
      }
      const qty = Number(item.qty);
      if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
        return NextResponse.json(
          { error: 'Jumlah pesanan harus antara 1-100.000' },
          { status: 400 }
        );
      }
      if (item.notes && (typeof item.notes !== 'string' || item.notes.length > MAX_NOTES_LEN)) {
        return NextResponse.json(
          { error: 'Catatan item terlalu panjang' },
          { status: 400 }
        );
      }
    }

    // Validate deadline if provided
    if (deadline) {
      const deadlineDate = new Date(deadline);
      if (isNaN(deadlineDate.getTime())) {
        return NextResponse.json(
          { error: 'Format deadline tidak valid' },
          { status: 400 }
        );
      }
      // Deadline must be in the future
      const minDeadline = new Date();
      minDeadline.setDate(minDeadline.getDate() + 1); // at least 1 day from now
      if (deadlineDate < minDeadline) {
        return NextResponse.json(
          { error: 'Deadline harus minimal 1 hari dari sekarang' },
          { status: 400 }
        );
      }
    }

    // Find or create client (M2 fix: do NOT overwrite existing client data)
    let client = await db.client.findFirst({
      where: { companyName: safeCompanyName, whatsapp: safeWhatsapp },
    });

    if (!client) {
      client = await db.client.create({
        data: {
          companyName: safeCompanyName,
          picName: safePicName,
          picTitle: safePicTitle,
          whatsapp: safeWhatsapp,
          email: safeEmail,
          kota: safeKota,
          alamat: safeAlamat,
        },
      });
    }

    // Find a system user for createdById (C3 fix: no backdoor creation)
    let systemUser = await db.user.findFirst();
    if (!systemUser) {
      // Instead of creating a super_admin backdoor, create a minimal system record
      systemUser = await db.user.create({
        data: {
          name: 'System',
          email: 'system@omamori.local',
          password: '$2b$10$DISABLED_ACCOUNT_NEVER_USE',
          role: 'staff',
        },
      });
    }

    // Create quote with items inside a transaction to prevent race conditions
    // (pricing + quote number generation all happen atomically)
    const MAX_RETRIES = 3;
    let quote;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
      try {
        quote = await db.$transaction(async (tx) => {
          // Process items and calculate pricing INSIDE transaction
          const quoteItemsData: any[] = [];
          let subtotal = 0;

          for (const item of items) {
            const qty = Number(item.qty);
            const unitPrice = await resolveUnitPrice(tx, item.productSlug, qty);
            const itemSubtotal = unitPrice * qty;
            subtotal += itemSubtotal;

            const product = await tx.product.findUnique({
              where: { slug: item.productSlug },
              select: { id: true },
            });

            quoteItemsData.push({
              productId: product?.id || null,
              customDescription: !product ? item.productSlug : null,
              qty,
              unitPrice,
              subtotal: itemSubtotal,
              notes: (typeof item.notes === 'string' && item.notes.trim()) ? item.notes.trim() : null,
            });
          }

          const total = subtotal;
          const quoteNumber = await getNextQuoteNumber(tx);

          return tx.quote.create({
            data: {
              quoteNumber,
              clientId: client.id,
              createdById: systemUser.id,
              status: 'pending',
              deadline: deadline ? new Date(deadline) : null,
              notes: safeNotes,
              subtotal,
              total,
              dpPct: 50,
              dpAmount: total * 0.5,
              items: {
                create: quoteItemsData,
              },
            },
            include: {
              client: true,
              items: true,
            },
          });
        });
        break; // success — exit retry loop
      } catch (txError: any) {
        // M1: Retry on unique constraint violation (quote number collision)
        if (attempt < MAX_RETRIES - 1 && txError?.code === 'P2002') {
          continue;
        }
        throw txError;
      }
    }

    return NextResponse.json({ quote }, { status: 201 });
  } catch (error) {
    console.error('Error creating quote:', error);
    return NextResponse.json(
      { error: 'Gagal mengirim permintaan penawaran' },
      { status: 500 }
    );
  }
}