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
    return <p className="text-[#999999]">Pesanan tidak ditemukan.</p>
  }

  const currentIdx = ORDER_STATUSES.findIndex(s => s.value === order.status)

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={() => navigate('admin-orders')} className="text-[#666666]">
        <ArrowLeft className="w-4 h-4 mr-2" />Kembali ke Daftar
      </Button>

      {/* Status Pipeline */}
      <div className="corp-card rounded-[10px] p-5 overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {ORDER_STATUSES.map((stage, i) => {
            const isActive = i === currentIdx
            const isCompleted = i < currentIdx
            return (
              <div key={stage.value} className="flex items-center">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-[#e8f5ee] text-[#00a651] ring-2 ring-[#00a651]/30'
                    : isCompleted
                      ? 'bg-[#e8f5ee] text-[#00a651]'
                      : 'bg-[#f3f4f6] text-[#9ca3af]'
                }`}>
                  {stageIcons[stage.value]}
                  <span className="hidden sm:inline">{stage.label}</span>
                </div>
                {i < ORDER_STATUSES.length - 1 && (
                  <div className={`w-6 h-0.5 mx-1 ${i < currentIdx ? 'bg-[#00a651]' : 'bg-[#e0e0e0]'}`} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Order Info */}
        <div className="lg:col-span-2 space-y-4">
          <div className="corp-card rounded-[10px] p-5 space-y-4">
            <div className="flex flex-wrap items-center gap-4">
              <h3 className="text-lg font-semibold text-[#333333]">{order.orderNumber}</h3>
              <Badge className={getStatusColor(order.status, ORDER_STATUSES)}>
                {getStatusLabel(order.status, ORDER_STATUSES)}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-[#999999]">Klien</Label>
                <p className="text-sm font-medium text-[#333333]">{order.client?.companyName ?? '-'}</p>
                <p className="text-xs text-[#999999]">{order.client?.picName} — {order.client?.whatsapp}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-[#999999]">Referensi Quote</Label>
                <p className="text-sm text-[#333333]">{order.quote?.quoteNumber ?? '-'}</p>
              </div>
            </div>
          </div>

          {/* Payment Info */}
          <div className="corp-card rounded-[10px] p-5 space-y-4">
            <h4 className="font-semibold text-[#333333]">Pembayaran</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-[#999999]">DP Amount</Label>
                <p className="text-sm font-medium text-[#333333]">{formatRupiah(order.dpAmount)}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-[#999999]">Tanggal Bayar DP</Label>
                <Input type="date" value={order.dpPaidAt?.split('T')[0] || ''} onChange={e => updateOrder('dpPaidAt', e.target.value || null)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-[#999999]">Sisa Tagihan</Label>
                <p className="text-sm font-medium text-[#333333]">{formatRupiah(order.balanceDue)}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-[#999999]">Tanggal Lunas</Label>
                <Input type="date" value={order.balancePaidAt?.split('T')[0] || ''} onChange={e => updateOrder('balancePaidAt', e.target.value || null)} />
              </div>
            </div>
          </div>

          {/* Shipping & Tracking */}
          <div className="corp-card rounded-[10px] p-5 space-y-4">
            <h4 className="font-semibold text-[#333333]">Pengiriman & Tracking</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-[#999999]">No. Resi Vendor</Label>
                <Input placeholder="Masukkan no. resi" value={order.vendorTracking || ''} onChange={e => updateOrder('vendorTracking', e.target.value || null)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-[#999999]">Tanggal Dikirim</Label>
                <Input type="date" value={order.shippedAt?.split('T')[0] || ''} onChange={e => updateOrder('shippedAt', e.target.value || null)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-[#999999]">Tanggal Diterima</Label>
                <Input type="date" value={order.receivedAt?.split('T')[0] || ''} onChange={e => updateOrder('receivedAt', e.target.value || null)} />
              </div>
            </div>
          </div>

          {/* Production Notes */}
          <div className="corp-card rounded-[10px] p-5 space-y-3">
            <Label className="text-sm font-semibold text-[#333333]">Catatan Produksi</Label>
            <Textarea rows={3} placeholder="Catatan produksi..." value={order.productionNotes || ''} onChange={e => updateOrder('productionNotes', e.target.value || null)} />
          </div>

          {/* Items from Quote */}
          {quoteItems.length > 0 && (
            <div className="corp-card rounded-[10px] p-5">
              <h4 className="font-semibold text-[#333333] mb-3">Item Pesanan (dari Quote)</h4>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-[#666666]">No</TableHead>
                      <TableHead className="text-[#666666]">Produk</TableHead>
                      <TableHead className="text-right text-[#666666]">Qty</TableHead>
                      <TableHead className="text-right text-[#666666]">Harga</TableHead>
                      <TableHead className="text-right text-[#666666]">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quoteItems.map((item, i) => (
                      <TableRow key={item.id} className="hover:bg-[#f8f8f8]">
                        <TableCell className="text-sm text-[#666666]">{i + 1}</TableCell>
                        <TableCell className="text-sm text-[#333333]">{item.product?.name || item.customDescription || '-'}</TableCell>
                        <TableCell className="text-right text-sm text-[#333333]">{item.qty}</TableCell>
                        <TableCell className="text-right text-sm text-[#333333]">{formatRupiah(item.unitPrice)}</TableCell>
                        <TableCell className="text-right text-sm text-[#333333]">{formatRupiah(item.subtotal)}</TableCell>
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
          <div className="corp-card rounded-[10px] p-5 space-y-4">
            <h4 className="font-semibold text-[#333333]">Aksi</h4>
            <div className="space-y-1">
              <Label className="text-xs text-[#999999]">Update Status</Label>
              <Select value={order.status} onValueChange={v => updateOrder('status', v)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full bg-[#00a651] hover:bg-[#008a40] text-white" onClick={handleSave} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />{saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>

          <div className="corp-card rounded-[10px] p-5">
            <h4 className="font-semibold text-[#333333] mb-2">Info</h4>
            <div className="text-sm space-y-1 text-[#999999]">
              <p>Dibuat: {formatDateTime(order.createdAt)}</p>
              <p>Diupdate: {formatDateTime(order.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}