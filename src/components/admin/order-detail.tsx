'use client'

import { useEffect, useState, useCallback } from 'react'
import { ArrowLeft, Save, Check, Truck, Package, ShieldCheck, Clock, DollarSign } from 'lucide-react'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { useAppStore } from '@/lib/store'
import { type Order, type QuoteItem, ORDER_STATUSES, formatRupiah, formatDate, formatDateTime, getStatusLabel, getStatusColor } from '@/lib/types'
import { adminFetch } from '@/lib/admin-fetch'

const stageIcons: Record<string, React.ReactNode> = {
  dp_pending: <DollarSign className="w-4 h-4" />,
  bahan_dipesan: <Package className="w-4 h-4" />,
  produksi: <Clock className="w-4 h-4" />,
  qc: <ShieldCheck className="w-4 h-4" />,
  siap_kirim: <Check className="w-4 h-4" />,
  dikirim: <Truck className="w-4 h-4" />,
  lunas: <Check className="w-4 h-4" />,
}

export default function AdminOrderDetail() {
  const { selectedOrderId, navigate } = useAppStore()
  const [order, setOrder] = useState<Order | null>(null)
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const fetchOrder = useCallback(async () => {
    if (!selectedOrderId) return
    setLoading(true)
    try {
      const res = await adminFetch(`/api/admin/orders/${selectedOrderId}`)
      if (res.ok) {
        const json = await res.json()
        const orderData = json.order || json
        setOrder(orderData)
        setQuoteItems(orderData.quote?.items || [])
      }
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }, [selectedOrderId])

  useEffect(() => { fetchOrder() }, [fetchOrder])

  const updateOrder = (field: string, value: string | null) => {
    setOrder(prev => prev ? { ...prev, [field]: value } : prev)
  }

  const handleSave = async () => {
    if (!order) return
    setSaving(true)
    try {
      const res = await adminFetch(`/api/admin/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: order.status,
          vendorTracking: order.vendorTracking || null,
          shippedAt: order.shippedAt || null,
          receivedAt: order.receivedAt || null,
          dpPaidAt: order.dpPaidAt || null,
          balancePaidAt: order.balancePaidAt || null,
          productionNotes: order.productionNotes || null,
        }),
      })
      if (!res.ok) { const d = await res.json(); toast({ title: 'Error', description: d.error || 'Gagal update.', variant: 'destructive' }); return }
      toast({ title: 'Berhasil', description: 'Pesanan diperbarui.' })
      fetchOrder()
    } catch {
      toast({ title: 'Error', description: 'Gagal terhubung ke server.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="space-y-4"><Skeleton className="h-10 w-48" /><Skeleton className="h-64 w-full" /><Skeleton className="h-64 w-full" /></div>
  }

  if (!order) {
    return <p className="text-ink-muted">Pesanan tidak ditemukan.</p>
  }

  const currentIdx = ORDER_STATUSES.findIndex(s => s.value === order.status)

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('admin-orders')} className="text-ink-soft">
        <ArrowLeft className="w-4 h-4 mr-2" />Kembali ke Daftar
      </Button>

      {/* Status Pipeline */}
      <div className="corp-card p-5 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {ORDER_STATUSES.map((stage, i) => {
            const isActive = i === currentIdx
            const isCompleted = i < currentIdx
            return (
              <div key={stage.value} className="flex items-center">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-primary-soft text-primary ring-2 ring-primary/30'
                    : isCompleted
                      ? 'bg-primary-soft text-primary'
                      : 'bg-accent text-ink-muted'
                }`}>
                  {stageIcons[stage.value]}
                  <span className="hidden sm:inline">{stage.label}</span>
                </div>
                {i < ORDER_STATUSES.length - 1 && (
                  <div className={`w-6 h-0.5 mx-1 ${i < currentIdx ? 'bg-primary' : 'bg-line-strong'}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Order Info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="corp-card p-5 space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <h3 className="text-lg font-semibold text-ink">{order.orderNumber}</h3>
              <Badge className={getStatusColor(order.status, ORDER_STATUSES)}>
                {getStatusLabel(order.status, ORDER_STATUSES)}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-ink-muted">Klien</Label>
                <p className="text-sm font-medium text-ink">{order.client?.companyName ?? '-'}</p>
                <p className="text-xs text-ink-muted">{order.client?.picName} — {order.client?.whatsapp}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-ink-muted">Referensi Penawaran</Label>
                <p className="text-sm text-ink">{order.quote?.quoteNumber ?? '-'}</p>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="corp-card p-5 space-y-4">
            <h4 className="font-semibold text-ink">Pembayaran</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-ink-muted">Jumlah DP</Label>
                <p className="text-sm font-medium text-ink">{formatRupiah(order.dpAmount)}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-ink-muted">Tanggal Bayar DP</Label>
                <Input type="date" value={order.dpPaidAt?.split('T')[0] || ''} onChange={e => updateOrder('dpPaidAt', e.target.value || null)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-ink-muted">Sisa Tagihan</Label>
                <p className="text-sm font-medium text-ink">{formatRupiah(order.balanceDue)}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-ink-muted">Tanggal Lunas</Label>
                <Input type="date" value={order.balancePaidAt?.split('T')[0] || ''} onChange={e => updateOrder('balancePaidAt', e.target.value || null)} />
              </div>
            </div>
          </div>

          {/* Shipping & Tracking */}
          <div className="corp-card p-5 space-y-4">
            <h4 className="font-semibold text-ink">Pengiriman & Tracking</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-ink-muted">No. Resi Vendor</Label>
                <Input placeholder="Masukkan no. resi" value={order.vendorTracking || ''} onChange={e => updateOrder('vendorTracking', e.target.value || null)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-ink-muted">Tanggal Dikirim</Label>
                <Input type="date" value={order.shippedAt?.split('T')[0] || ''} onChange={e => updateOrder('shippedAt', e.target.value || null)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-ink-muted">Tanggal Diterima</Label>
                <Input type="date" value={order.receivedAt?.split('T')[0] || ''} onChange={e => updateOrder('receivedAt', e.target.value || null)} />
              </div>
            </div>
          </div>

          {/* Production Notes */}
          <div className="corp-card p-5 space-y-3">
            <Label className="text-sm font-semibold text-ink">Catatan Produksi</Label>
            <Textarea rows={3} placeholder="Catatan produksi..." value={order.productionNotes || ''} onChange={e => updateOrder('productionNotes', e.target.value || null)} />
          </div>

          {/* Items from Quote */}
          {quoteItems.length > 0 && (
            <div className="corp-card p-5">
              <h4 className="font-semibold text-ink mb-3">Item Pesanan (dari Penawaran)</h4>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-ink-soft">No</TableHead>
                      <TableHead className="text-ink-soft">Produk</TableHead>
                      <TableHead className="text-right text-ink-soft">Qty</TableHead>
                      <TableHead className="text-right text-ink-soft">Harga</TableHead>
                      <TableHead className="text-right text-ink-soft">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quoteItems.map((item, i) => (
                      <TableRow key={item.id} className="hover:bg-muted">
                        <TableCell className="text-sm text-ink-soft">{i + 1}</TableCell>
                        <TableCell className="text-sm text-ink">{item.product?.name || item.customDescription || '-'}</TableCell>
                        <TableCell className="text-right text-sm text-ink">{item.qty}</TableCell>
                        <TableCell className="text-right text-sm text-ink">{formatRupiah(item.unitPrice)}</TableCell>
                        <TableCell className="text-right text-sm text-ink">{formatRupiah(item.subtotal)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="space-y-4">
          <div className="corp-card p-5 space-y-4">
            <h4 className="font-semibold text-ink">Aksi</h4>
            <div className="space-y-1">
              <Label className="text-xs text-ink-muted">Ubah Status</Label>
              <Select value={order.status} onValueChange={v => updateOrder('status', v)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full bg-primary hover:bg-primary-hover text-white" onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />{saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>

          <div className="corp-card p-5">
            <h4 className="font-semibold text-ink mb-2">Info</h4>
            <div className="text-sm space-y-1 text-ink-muted">
              <p>Dibuat: {formatDateTime(order.createdAt)}</p>
              <p>Diupdate: {formatDateTime(order.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}