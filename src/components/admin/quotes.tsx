'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { ArrowRightLeft, Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
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
import { useToast } from '@/hooks/use-toast'
import { useAppStore } from '@/lib/store'
import { type Quote, QUOTE_STATUSES, formatRupiah, formatDate, getStatusLabel, getStatusColor } from '@/lib/types'
import { adminFetch } from '@/lib/admin-fetch'

const statusTabs = [
  { value: 'all', label: 'Semua' },
  ...QUOTE_STATUSES.map(s => ({ value: s.value, label: s.label })),
]

export default function AdminQuotes() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [convertingId, setConvertingId] = useState<string | null>(null)
  const searchTimer = useRef<NodeJS.Timeout>(null)
  const { selectQuote } = useAppStore()
  const { toast } = useToast()

  const fetchQuotes = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (activeTab !== 'all') params.set('status', activeTab)
      params.set('page', String(page))
      params.set('limit', '20')
      if (search) params.set('search', search)
      const res = await adminFetch(`/api/admin/quotes?${params.toString()}`)
      if (res.ok) {
        const json = await res.json()
        setQuotes(json.data)
        setTotalPages(json.totalPages)
      }
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }, [activeTab, page, search])

  useEffect(() => { fetchQuotes() }, [fetchQuotes])

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

  const handleConvert = async (e: React.MouseEvent, quote: Quote) => {
    e.stopPropagation()
    if (convertingId) return
    setConvertingId(quote.id)
    try {
      const res = await adminFetch('/api/admin/convert-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteId: quote.id }),
      })
      if (!res.ok) { const d = await res.json(); toast({ title: 'Error', description: d.error || 'Gagal convert.', variant: 'destructive' }); return }
      toast({ title: 'Berhasil', description: 'Penawaran berhasil diubah menjadi pesanan.' })
      fetchQuotes()
    } catch {
      toast({ title: 'Error', description: 'Gagal terhubung ke server.', variant: 'destructive' })
    } finally {
      setConvertingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList className="flex-wrap h-auto gap-1 bg-transparent p-0 border-b border-line-strong">
          {statusTabs.map(tab => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-3 py-2 text-sm text-ink-soft hover:text-ink transition-colors bg-transparent shadow-none"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted pointer-events-none" />
        <Input
          placeholder="Cari no. penawaran atau klien..."
          value={searchInput}
          onChange={e => handleSearchChange(e.target.value)}
          className="pl-9 mb-3"
        />
      </div>

      <div className="corp-card p-4 overflow-x-auto">
        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10 text-ink-soft">No</TableHead>
                <TableHead className="text-ink-soft">No. Penawaran</TableHead>
                <TableHead className="text-ink-soft">Klien</TableHead>
                <TableHead className="text-right text-ink-soft">Total</TableHead>
                <TableHead className="text-ink-soft">Status</TableHead>
                <TableHead className="text-ink-soft">Deadline</TableHead>
                <TableHead className="text-ink-soft">Tanggal</TableHead>
                <TableHead className="text-right text-ink-soft table-sticky-action">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center text-ink-muted py-8">Tidak ada penawaran.</TableCell></TableRow>
              ) : quotes.map((q, i) => (
                <TableRow key={q.id} tabIndex={0} className="cursor-pointer hover:bg-muted" onClick={() => selectQuote(q.id)} onKeyDown={(e) => { if (e.target === e.currentTarget && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); selectQuote(q.id) } }}>
                  <TableCell className="text-sm text-ink-soft">{i + 1}</TableCell>
                  <TableCell className="font-medium text-sm text-ink">{q.quoteNumber}</TableCell>
                  <TableCell className="text-sm text-ink-soft">{q.client?.companyName ?? '-'}</TableCell>
                  <TableCell className="text-right text-sm text-ink">{formatRupiah(q.total)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(q.status, QUOTE_STATUSES)}>
                      {getStatusLabel(q.status, QUOTE_STATUSES)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-ink-muted">{formatDate(q.deadline)}</TableCell>
                  <TableCell className="text-sm text-ink-muted">{formatDate(q.createdAt)}</TableCell>
                  <TableCell className="text-right table-sticky-action">
                    {q.status === 'accepted' && !q.order && (
                      <Button variant="outline" size="sm" onClick={(e) => handleConvert(e, q)} disabled={convertingId === q.id}>
                        {convertingId === q.id
                          ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" />Memproses...</>
                          : <><ArrowRightLeft className="w-3 h-3 sm:mr-1" /><span className="sr-only sm:not-sr-only">Jadikan Pesanan</span></>}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-muted">Halaman {page} dari {totalPages || 1}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="w-4 h-4 mr-1" />Sebelumnya</Button>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Selanjutnya<ChevronRight className="w-4 h-4 ml-1" /></Button>
        </div>
      </div>
    </div>
  )
}