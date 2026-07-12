import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request)
  if (auth instanceof NextResponse) return auth
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // This month's first and last day
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);

    // Parallel queries
    const [
      todayQuotesCount,
      activeOrdersCount,
      monthlyRevenueResult,
      clientCount,
      pendingQuotes,
      lowStockItems,
      revenueByMonth,
    ] = await Promise.all([
      // Today's new quotes
      db.quote.count({
        where: {
          createdAt: { gte: today, lt: tomorrow },
        },
      }),

      // Active orders (not lunas, not cancelled)
      db.order.count({
        where: {
          status: {
            in: ['dp_pending', 'bahan_dipesan', 'produksi', 'qc', 'siap_kirim', 'dikirim'],
          },
        },
      }),

      // This month's revenue from accepted quotes
      db.quote.aggregate({
        where: {
          status: 'accepted',
          createdAt: { gte: firstDayOfMonth, lte: lastDayOfMonth },
        },
        _sum: { total: true },
      }),

      // Total clients
      db.client.count(),

      // Latest 5 pending quotes
      db.quote.findMany({
        where: { status: 'pending' },
        include: {
          client: {
            select: { companyName: true, picName: true },
          },
          items: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),

      // Low stock inventory items (filter at DB level for performance)
      db.$queryRaw<{ id: string; name: string; category: string; unit: string; currentStock: number; minimumStock: number }[]>`
        SELECT id, name, category, unit, "currentStock", "minimumStock"
        FROM "InventoryItem"
        WHERE "currentStock" <= "minimumStock"
        ORDER BY "currentStock" ASC
        LIMIT 10
      `,

      // Revenue by month (last 6 months)
      db.$queryRaw<{ month: string; total: number }[]>`
        WITH RECURSIVE months(m) AS (
          SELECT 5
          UNION ALL
          SELECT m - 1 FROM months WHERE m > 0
        )
        SELECT
          strftime('%Y-%m', date('now', '-' || m || ' months')) as month,
          COALESCE(SUM(q."total"), 0) as total
        FROM months
        LEFT JOIN "Quote" q
          ON q.status = 'accepted'
          AND strftime('%Y-%m', q."createdAt") = strftime('%Y-%m', date('now', '-' || m || ' months'))
        GROUP BY month
        ORDER BY month ASC
      `,
    ]);

    return NextResponse.json({
      todayQuotesCount,
      activeOrdersCount,
      monthlyRevenue: Number(monthlyRevenueResult._sum.total || 0),
      clientCount,
      pendingQuotes,
      lowStockItems: Array.isArray(lowStockItems) ? lowStockItems : [],
      revenueByMonth: Array.isArray(revenueByMonth) ? revenueByMonth.map((r: { month: string; total: unknown }) => ({ month: r.month, total: Number(r.total) })) : [],
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    return NextResponse.json(
      { error: 'Gagal memuat data dashboard' },
      { status: 500 }
    );
  }
}