'use client'

import { useEffect, useState, useCallback } from 'react'
import { ArrowLeft, ArrowRightLeft, Sparkles, Save, FileDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { useAppStore } from '@/lib/store'
import { type Quote, type QuoteItem, QUOTE_STATUSES, formatRupiah, formatDate, getStatusLabel, getStatusColor } from '@/lib/types'
import { adminFetch } from '@/lib/admin-fetch'

export default function AdminQuoteDetail() {
  const { selectedQuoteId, navigate, selectQuote } = useAppStore()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [converting, setConverting] = useState(false)
  const [aiDialogOpen, setAiDialogOpen] = useState(false)
  const [aiResult, setAiResult] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const { toast } = useToast()

  const fetchQuote = useCallback(async () => {
    if (!selectedQuoteId) return
    setLoading(true)
    try {
      const res = await adminFetch(`/api/admin/quotes/${selectedQuoteId}`)
      if (res.ok) {
        const json = await res.json()
        setQuote(json.quote || json)
      }
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }, [selectedQuoteId])

  useEffect(() => { fetchQuote() }, [fetchQuote])

  const updateQuote = (field: string, value: string | number) => {
    setQuote(prev => prev ? { ...prev, [field]: value } : prev)
  }

  const updateItem = (idx: number, field: string, value: string | number) => {
    setQuote(prev => {
      if (!prev?.items) return prev
      const items = [...prev.items]
      items[idx] = { ...items[idx], [field]: value }
      if (field === 'qty' || field === 'unitPrice') {
        const qty = field === 'qty' ? Number(value) : items[idx].qty
        const price = field === 'unitPrice' ? Number(value) : items[idx].unitPrice
        items[idx] = { ...items[idx], subtotal: qty * price }
      }
      const newSubtotal = items.reduce((sum, it) => sum + it.subtotal, 0)
      const discAmt = Math.round(newSubtotal * (prev.discPct / 100))
      return { ...prev, items, subtotal: newSubtotal, discAmt, total: newSubtotal - discAmt }
    })
  }

  const handleDownloadPdf = async () => {
    if (!selectedQuoteId) return
    setPdfLoading(true)
    try {
      const res = await adminFetch('/api/admin/generate-quotation-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteId: selectedQuoteId }),
      })
      if (!res.ok) throw new Error('Gagal membuat PDF')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `quotation-${quote?.quoteNumber || 'draft'}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      toast({ title: 'Gagal', description: 'Tidak bisa membuat PDF', variant: 'destructive' })
    } finally {
      setPdfLoading(false)
    }
  }

  const handleSave = async () => {
    if (!quote) return
    setSaving(true)
    try {
      const res = await adminFetch(`/api/admin/quotes/${quote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: quote.status,
          deadline: quote.deadline || null,
          notes: quote.notes || null,
          discPct: quote.discPct,
          discAmt: quote.discAmt,
          total: quote.total,
          dpPct: quote.dpPct,
          items: quote.items?.map(it => ({
            id: it.id,
            productId: it.productId,
            customDescription: it.customDescription,
            qty: it.qty,
            unitPrice: it.unitPrice,
            notes: it.notes,
          })),
        }),
      })
      if (!res.ok) { const d = await res.json(); toast({ title: 'Error', description: d.error || 'Gagal update.', variant: 'destructive' }); return }
      toast({ title: 'Berhasil', description: 'Penawaran diperbarui.' })
      fetchQuote()
    } catch {
      toast({ title: 'Error', description: 'Gagal terhubung ke server.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleConvert = async () => {
    if (!quote) return
    setConverting(true)
    try {
      const res = await adminFetch('/api/admin/convert-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteId: quote.id }),
      })
      if (!res.ok) { const d = await res.json(); toast({ title: 'Error', description: d.error || 'Gagal convert.', variant: 'destructive' }); return }
      toast({ title: 'Berhasil', description: 'Quote dikonversi ke order.' })
      fetchQuote()
    } catch {
      toast({ title: 'Error', description: 'Gagal terhubung ke server.', variant: 'destructive' })
    } finally {
      setConverting(false)
    }
  }

  const handleAiDraft = async () => {
    if (!quote) return
    setAiLoading(true)
    setAiResult('')
    try {
      const res = await adminFetch('/api/admin/ai/draft-quotation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quoteId: quote.id }),
      })
      const d = await res.json()
      setAiResult(d.result || d.draft || JSON.stringify(d))
    } catch {
      setAiResult('Gagal generate draft.')
    } finally {
      setAiLoading(false)
      setAiDialogOpen(true)
    }
  }

  if (loading) {
    return <div className="space-y-4"><Skeleton className="h-10 w-48" /><Skeleton className="h-64 w-full" /><Skeleton className="h-64 w-full" /></div>
  }

  if (!quote) {
    return <p className="text-[#999999]">Penawaran tidak ditemukan.</p>
  }

  const canConvert = ['accepted'].includes(quote.status) && !quote.order

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('admin-quotes')} className="text-[#666666]">
        <ArrowLeft className="w-4 h-4 mr-2" />Kembali ke Daftar
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Quote Info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="corp-card rounded-[10px] p-5 space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <h3 className="text-lg font-semibold text-[#333333]">{quote.quoteNumber}</h3>
              <Badge className={getStatusColor(quote.status, QUOTE_STATUSES)}>
                {getStatusLabel(quote.status, QUOTE_STATUSES)}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-[#999999]">Klien</Label>
                <p className="text-sm font-medium text-[#333333]">{quote.client?.companyName ?? '-'}</p>
                <p className="text-xs text-[#999999]">{quote.client?.picName} — {quote.client?.whatsapp}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-[#999999]">Status</Label>
                <Select value={quote.status} onValueChange={v => updateQuote('status', v)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {QUOTE_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-[#999999]">Valid Until</Label>
                <Input type="date" value={quote.validUntil?.split('T')[0] || ''} onChange={e => updateQuote('validUntil', e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-[#999999]">Deadline</Label>
                <Input type="date" value={quote.deadline?.split('T')[0] || ''} onChange={e => updateQuote('deadline', e.target.value)} />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-[#999999]">Catatan</Label>
              <Textarea rows={2} value={quote.notes || ''} onChange={e => updateQuote('notes', e.target.value)} />
            </div>
          </div>

          {/* Items Table */}
          <div className="corp-card rounded-[10px] p-5">
            <h4 className="font-semibold text-[#333333] mb-3">Item Penawaran</h4>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-10 text-[#666666]">No</TableHead>
                    <TableHead className="text-[#666666]">Produk</TableHead>
                    <TableHead className="text-right text-[#666666]">Qty</TableHead>
                    <TableHead className="text-right text-[#666666]">Harga Satuan</TableHead>
                    <TableHead className="text-right text-[#666666]">Subtotal</TableHead>
                    <TableHead className="text-[#666666]">Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quote.items?.map((item, i) => (
                    <TableRow key={item.id} className="hover:bg-[#f8f8f8]">
                      <TableCell className="text-sm text-[#666666]">{i + 1}</TableCell>
                      <TableCell className="text-sm font-medium text-[#333333]">{item.product?.name || item.customDescription || '-'}</TableCell>
                      <TableCell>
                        <Input type="number" className="w-20 text-right" value={item.qty} onChange={e => updateItem(i, 'qty', e.target.value)} />
                      </TableCell>
                      <TableCell>
                        <Input type="number" className="w-28 text-right" value={item.unitPrice} onChange={e => updateItem(i, 'unitPrice', e.target.value)} />
                      </TableCell>
                      <TableCell className="text-right text-sm text-[#333333]">{formatRupiah(item.subtotal)}</TableCell>
                      <TableCell>
                        <Input className="text-xs" placeholder="Notes" value={item.notes || ''} onChange={e => updateItem(i, 'notes', e.target.value)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Separator className="my-4 bg-[#e0e0e0]" />

            {/* Pricing Summary */}
            <div className="space-y-2 text-sm max-w-xs ml-auto">
              <div className="flex justify-between"><span className="text-[#666666]">Subtotal</span><span className="text-[#333333]">{formatRupiah(quote.subtotal)}</span></div>
              <div className="flex items-center gap-2 justify-end">
                <span className="text-[#666666]">Diskon (%)</span>
                <Input type="number" className="w-20 text-right h-8 text-sm" value={quote.discPct} onChange={e => {
                  const pct = Number(e.target.value) || 0
                  const amt = Math.round(quote.subtotal * (pct / 100))
                  setQuote(prev => prev ? { ...prev, discPct: pct, discAmt: amt, total: prev.subtotal - amt } : prev)
                }} />
              </div>
              <div className="flex justify-between"><span className="text-[#666666]">Diskon (Rp)</span><span className="text-[#333333]">{formatRupiah(quote.discAmt)}</span></div>
              <Separator className="bg-[#e0e0e0]" />
              <div className="flex justify-between font-semibold text-base"><span className="text-[#333333]">Total</span><span className="text-[#00a651]">{formatRupiah(quote.total)}</span></div>
              <div className="flex items-center gap-2 justify-end mt-2">
                <span className="text-[#666666]">DP (%)</span>
                <Input type="number" className="w-20 text-right h-8 text-sm" value={quote.dpPct} onChange={e => updateQuote('dpPct', Number(e.target.value) || 0)} />
              </div>
              <div className="flex justify-between"><span className="text-[#666666]">Amount DP</span><span className="text-[#333333]">{formatRupiah(Math.round(quote.total * quote.dpPct / 100))}</span></div>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="space-y-4">
          <div className="corp-card rounded-[10px] p-5 space-y-4">
            <h4 className="font-semibold text-[#333333]">Aksi</h4>
            <div className="space-y-1">
              <Label className="text-xs text-[#999999]">Update Status</Label>
              <Select value={quote.status} onValueChange={v => updateQuote('status', v)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {QUOTE_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <Button className="w-full bg-[#00a651] hover:bg-[#008a40] text-white" onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />{saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>

            <Button variant="outline" className="w-full text-[#00a651] border-[#00a651] hover:bg-[#e8f5ee]" onClick={handleDownloadPdf} disabled={pdfLoading}>
              <FileDown className="w-4 h-4 mr-2" />{pdfLoading ? 'Membuat PDF...' : 'Download PDF'}
            </Button>

            {canConvert && (
              <Button variant="outline" className="w-full" onClick={handleConvert} disabled={converting}>
                <ArrowRightLeft className="w-4 h-4 mr-2" />{converting ? 'Mengkonversi...' : 'Convert ke Order'}
              </Button>
            )}

            <Button variant="outline" className="w-full text-[#00a651] border-[#00a651] hover:bg-[#e8f5ee]" onClick={handleAiDraft} disabled={aiLoading}>
              <Sparkles className="w-4 h-4 mr-2" />{aiLoading ? 'Generating...' : 'Generate Draft AI'}
            </Button>
          </div>

          <div className="corp-card rounded-[10px] p-5">
            <h4 className="font-semibold text-[#333333] mb-2">Info</h4>
            <div className="text-sm space-y-1 text-[#999999]">
              <p>Dibuat: {formatDate(quote.createdAt)}</p>
              <p>Diupdate: {formatDate(quote.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Draft Dialog */}
      <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#333333]">Draft Surat Penawaran</DialogTitle>
            <DialogDescription className="sr-only">Draft surat penawaran yang dihasilkan</DialogDescription>
          </DialogHeader>
          <Textarea rows={20} value={aiResult} readOnly />
        </DialogContent>
      </Dialog>
    </div>
  )
}