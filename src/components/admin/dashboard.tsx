'use client'

import { useEffect, useState } from 'react'
import { FileText, ShoppingCart, DollarSign, Users, AlertTriangle, TrendingUp } from 'lucide-react'
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { adminFetch } from '@/lib/admin-fetch'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/lib/store'
import { type DashboardData, type Quote, type InventoryItem, formatRupiah, formatDate, getStatusLabel, getStatusColor, QUOTE_STATUSES } from '@/lib/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

function KpiCard({ title, value, icon, bg, loading }: { title: string; value: string | number; icon: React.ReactNode; bg: string; loading: boolean }) {
  return (
    <div className="corp-card rounded-[10px] p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-[#666666]">{title}</span>
        <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      {loading ? (
        <Skeleton className="h-8 w-24" />
      ) : (
        <p className="text-2xl font-bold text-[#333333]">{value}</p>
      )}
    </div>
  )
}

export default function AdminDashboard() {
  const { selectQuote } = useAppStore()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await adminFetch('/api/admin/dashboard')
        if (res.ok) {
          const json = await res.json()
          setData(json)
        }
      } catch { /* ignore */ } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  const handleQuoteClick = (quote: Quote) => {
    selectQuote(quote.id)
  }

  const chartData = (data?.revenueByMonth || []).map(item => {
    const [y, m] = item.month.split('-')
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    return {
      label: `${monthNames[parseInt(m) - 1]} ${y.slice(2)}`,
      total: item.total,
    }
  })

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Quote Hari Ini"
          value={data?.todayQuotesCount ?? '-'}
          icon={<FileText className="w-5 h-5" />}
          bg="kpi-icon-green"
          loading={loading}
        />
        <KpiCard
          title="Order Aktif"
          value={data?.activeOrdersCount ?? '-'}
          icon={<ShoppingCart className="w-5 h-5" />}
          bg="kpi-icon-blue"
          loading={loading}
        />
        <KpiCard
          title="Revenue Bulan Ini"
          value={data ? formatRupiah(data.monthlyRevenue) : '-'}
          icon={<DollarSign className="w-5 h-5" />}
          bg="kpi-icon-amber"
          loading={loading}
        />
        <KpiCard
          title="Klien Total"
          value={data?.clientCount ?? '-'}
          icon={<Users className="w-5 h-5" />}
          bg="kpi-icon-rose"
          loading={loading}
        />
      </div>

      {/* Revenue Chart */}
      <div className="corp-card rounded-[10px] p-5">
        <h3 className="text-base font-semibold text-[#333333] mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-[#00a651]" />
          Revenue 6 Bulan Terakhir
        </h3>
        {loading ? (
          <Skeleton className="h-56 w-full" />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eeeeee" vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: '#999999' }}
                axisLine={{ stroke: '#e0e0e0' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 12, fill: '#999999' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => v >= 1000000 ? `${(v / 1000000).toFixed(0)}jt` : v >= 1000 ? `${(v / 1000).toFixed(0)}rb` : String(v)}
              />
              <Tooltip
                formatter={(value: number) => [formatRupiah(value), 'Revenue']}
                contentStyle={{ borderRadius: 8, border: '1px solid #e0e0e0', fontSize: 13 }}
              />
              <Bar dataKey="total" fill="#00a651" radius={[4, 4, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Quotes */}
        <div className="corp-card rounded-[10px] p-5">
          <h3 className="text-base font-semibold text-[#333333] mb-4">Quote Pending</h3>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !data?.pendingQuotes?.length ? (
            <p className="text-sm text-[#999999] py-8 text-center">Tidak ada quote pending.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[#666666]">No. Quotation</TableHead>
                    <TableHead className="text-[#666666]">Klien</TableHead>
                    <TableHead className="text-right text-[#666666]">Total</TableHead>
                    <TableHead className="text-[#666666]">Status</TableHead>
                    <TableHead className="text-[#666666]">Tanggal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.pendingQuotes.slice(0, 5).map((q) => (
                    <TableRow
                      key={q.id}
                      className="cursor-pointer hover:bg-[#f8f8f8]"
                      onClick={() => handleQuoteClick(q)}
                    >
                      <TableCell className="font-medium text-sm text-[#333333]">{q.quoteNumber}</TableCell>
                      <TableCell className="text-sm text-[#666666]">{q.client?.companyName ?? '-'}</TableCell>
                      <TableCell className="text-right text-sm text-[#333333]">{formatRupiah(q.total)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(q.status, QUOTE_STATUSES)}>
                          {getStatusLabel(q.status, QUOTE_STATUSES)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-[#999999]">{formatDate(q.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Low Stock Alert */}
        <div className="corp-card rounded-[10px] p-5">
          <h3 className="text-base font-semibold text-[#333333] mb-4 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Stok Minimum Alert
          </h3>
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !data?.lowStockItems?.length ? (
            <p className="text-sm text-[#999999] py-8 text-center">Semua stok aman.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[#666666]">Nama Item</TableHead>
                    <TableHead className="text-right text-[#666666]">Stok Saat Ini</TableHead>
                    <TableHead className="text-right text-[#666666]">Min. Stok</TableHead>
                    <TableHead className="text-[#666666]">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.lowStockItems.map((item: InventoryItem) => (
                    <TableRow key={item.id} className="hover:bg-[#f8f8f8]">
                      <TableCell className="font-medium text-sm text-[#333333]">{item.name}</TableCell>
                      <TableCell className="text-right text-sm text-amber-700 font-medium">{item.currentStock}</TableCell>
                      <TableCell className="text-right text-sm text-[#666666]">{item.minimumStock}</TableCell>
                      <TableCell>
                        <Badge variant={item.currentStock === 0 ? 'destructive' : 'secondary'}>
                          {item.currentStock === 0 ? 'Habis' : 'Rendah'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}