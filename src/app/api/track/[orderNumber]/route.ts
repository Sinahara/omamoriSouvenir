import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isRateLimited, recordFailedAttempt } from '@/lib/rate-limiter';
import { getClientIp } from '@/lib/get-client-ip';

const TRACK_CONFIG = { maxAttempts: 30, windowMs: 60 * 1000 }; // 30 requests/min

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  try {
    // H2: Use centralized IP extraction
    const ip = getClientIp(request)

    // Rate limiting to prevent order number enumeration
    if (isRateLimited(ip, TRACK_CONFIG)) {
      return NextResponse.json(
        { error: 'Terlalu banyak permintaan. Coba lagi sebentar.' },
        { status: 429 }
      );
    }

    // Sanitize orderNumber input
    const raw = (await params).orderNumber;
    if (!/^[A-Za-z0-9/]+$/.test(raw)) {
      return NextResponse.json(
        { error: 'Format nomor pesanan tidak valid' },
        { status: 400 }
      );
    }
    const orderNumber = raw;

    const order = await db.order.findUnique({
      where: { orderNumber },
      include: {
        client: {
          select: {
            companyName: true,
          },
        },
      },
    });

    if (!order) {
      // H4: Only record failed attempt on 404 (not on successful lookups)
      recordFailedAttempt(ip, TRACK_CONFIG)
      return NextResponse.json(
        { error: 'Pesanan tidak ditemukan' },
        { status: 404 }
      );
    }

    // Only expose timestamps for completed milestones (privacy)
    const response: Record<string, unknown> = {
      orderNumber: order.orderNumber,
      companyName: order.client.companyName,
      status: order.status,
      vendorTracking: order.vendorTracking || null,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };

    // Only include milestone timestamps if they exist (meaning the milestone was reached)
    if (order.dpPaidAt) response.dpPaidAt = order.dpPaidAt;
    if (order.shippedAt) response.shippedAt = order.shippedAt;
    if (order.receivedAt) response.receivedAt = order.receivedAt;
    if (order.balancePaidAt) response.balancePaidAt = order.balancePaidAt;

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error tracking order:', error);
    return NextResponse.json(
      { error: 'Gagal melacak pesanan' },
      { status: 500 }
    );
  }
}