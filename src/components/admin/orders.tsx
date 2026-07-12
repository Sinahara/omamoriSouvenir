'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useAppStore } from '@/lib/store'
import { type Order, ORDER_STATUSES, formatRupiah, formatDate, getStatusLabel, getStatusColor } from '@/lib/types'
import { adminFetch } from '@/lib/admin-fetch'

const statusTabs = [
  { value: 'all', label: 'Semua' },
  ...ORDER_STATUSES.map(s => ({ value: s.value, label: s.label })),
]

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const searchTimer = useRef<NodeJS.Timeout>(null)
  const { selectOrder } = useAppStore()

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (activeTab !== 'all') params.set('status', activeTab)
      params.set('page', String(page))
      params.set('limit', '20')
      if (search) params.set('search', search)
      const res = await adminFetch(`/api/admin/orders?${params.toString()}`)
      if (res.ok) {
        const json = await res.json()
        setOrders(json.data)
        setTotalPages(json.totalPages)
      }
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }, [activeTab, page, search])

  useEffect(() => { fetchOrders() }, [fetchOrders])

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setSearch(value)
      setPage(1)
    }, 400)
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setPage(1)
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-[#333333]">Manajemen Pesanan</h2>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="flex-wrap h-auto gap-1 bg-transparent p-0 border-b border-[#e0e0e0]">
          {statusTabs.map(tab => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="data-[state=active]:text-[#00a651] data-[state=active]:border-b-2 data-[state=active]:border-[#00a651] rounded-none px-3 py-2 text-sm text-[#666666] hover:text-[#333333] transition-colors bg-transparent shadow-none"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999] pointer-events-none" />
        <Input
          placeholder="Cari no. order atau klien..."
          value={searchInput}
          onChange={e => handleSearchChange(e.target.value)}
          className="pl-9 mb-3 corp-input"
        />
      </div>

      <div className="corp-card rounded-[10px] p-4 overflow-x-auto">
        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10 text-[#666666]">No</TableHead>
                <TableHead className="text-[#666666]">No. Order</TableHead>
                <TableHead className="text-[#666666]">Klien</TableHead>
                <TableHead className="text-right text-[#666666]">Total</TableHead>
                <TableHead className="text-[#666666]">Status</TableHead>
                <TableHead className="text-[#666666]">Dibuat</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-[#999999] py-8">Tidak ada pesanan.</TableCell></TableRow>
              ) : orders.map((o, i) => (
                <TableRow key={o.id} className="cursor-pointer hover:bg-[#f8f8f8]" onClick={() => selectOrder(o.id)}>
                  <TableCell className="text-sm text-[#666666]">{i + 1}</TableCell>
                  <TableCell className="font-medium text-sm text-[#333333]">{o.orderNumber}</TableCell>
                  <TableCell className="text-sm text-[#666666]">{o.client?.companyName ?? '-'}</TableCell>
                  <TableCell className="text-right text-sm text-[#333333]">{formatRupiah(o.quote?.total ?? o.dpAmount)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(o.status, ORDER_STATUSES)}>
                      {getStatusLabel(o.status, ORDER_STATUSES)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-[#999999]">{formatDate(o.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-[#999999]">Halaman {page} dari {totalPages || 1}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="w-4 h-4 mr-1" />Sebelumnya</Button>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Selanjutnya<ChevronRight className="w-4 h-4 ml-1" /></Button>
        </div>
      </div>
    </div>
  )
}