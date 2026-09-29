'use client'

import { useState } from 'react'
import { Search, Package, Clock, CheckCircle2, Truck, CircleDot, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import SectionHeader from '@/components/public/section-header'
import { ORDER_STATUSES, getStatusLabel, getStatusColor, formatDate } from '@/lib/types'

interface TrackResult {
  orderNumber: string
  companyName: string
  status: string
  vendorTracking: string | null
  dpPaidAt: string | null
  shippedAt: string | null
  receivedAt: string | null
  balancePaidAt: string | null
  createdAt: string
  updatedAt: string
}

const stageMeta: Record<string, { icon: typeof CircleDot; dateField?: string }> = {
  dp_pending: { icon: Clock, dateField: 'dpPaidAt' },
  bahan_dipesan: { icon: Package },
  produksi: { icon: CircleDot },
  qc: { icon: CheckCircle2 },
  siap_kirim: { icon: Truck, dateField: 'shippedAt' },
  dikirim: { icon: Truck, dateField: 'shippedAt' },
  lunas: { icon: CheckCircle2, dateField: 'receivedAt' },
}

function getStageIndex(status: string): number {
  const idx = ORDER_STATUSES.findIndex(s => s.value === status)
  return idx >= 0 ? idx : -1
}

export default function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState('')
  const [result, setResult] = useState<TrackResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)

  const handleTrack = async () => {
    const num = orderNumber.trim()
    if (!num) return
    setLoading(true)
    setError('')
    setResult(null)
    setSearched(true)
    try {
      const res = await fetch(`/api/track/${encodeURIComponent(num)}`)
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Pesanan tidak ditemukan')
      }
      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleTrack()
  }

  const currentIdx = result ? getStageIndex(result.status) : -1

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 md:py-20 space-y-8">
      {/* Header */}
      <SectionHeader as="h1" badge="Lacak" title="Lacak Pesanan" subtitle="Masukkan nomor pesanan untuk melihat status terbaru" />

      {/* Search */}
      <div className="corp-card jp-corner-accents p-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
            <Input
              placeholder="Contoh: ORD/2025/01/001"
              aria-label="Nomor pesanan"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 h-10"
            />
          </div>
          <Button
            onClick={handleTrack}
            disabled={loading || !orderNumber.trim()}
            aria-label={loading ? 'Mencari pesanan' : undefined}
            className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-white rounded-sm text-[13px] tracking-wide px-5"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              'Lacak'
            )}
          </Button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="corp-card jp-corner-accents p-6 space-y-4">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
          <div className="corp-divider" />
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-full" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {searched && !loading && error && (
        <div className="corp-card jp-corner-accents p-8 text-center">
          <AlertCircle className="w-10 h-10 text-destructive mx-auto mb-4" />
          {/* The server message ("Pesanan tidak ditemukan", rate limit, …) is the headline */}
          <h3 role="alert" className="text-lg font-medium text-ink mb-1">{error}</h3>
          <p className="text-sm text-ink-muted mt-2">Pastikan nomor pesanan sesuai format ORD/YYYY/MM/XXXX</p>
        </div>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="corp-card jp-corner-accents p-6 space-y-6 animate-fade-in-up">
          {/* Order Info */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="eyebrow text-ink-muted">Nomor Pesanan</p>
                <p className="font-mono font-semibold text-lg text-ink mt-0.5">{result.orderNumber}</p>
              </div>
              <Badge className={getStatusColor(result.status, ORDER_STATUSES)}>
                {getStatusLabel(result.status, ORDER_STATUSES)}
              </Badge>
            </div>
            <p className="text-[13px] text-ink-muted">
              Perusahaan: <span className="text-ink font-medium">{result.companyName || '-'}</span>
            </p>
            <p className="text-[12px] text-ink-muted">
              Terakhir diperbarui: {formatDate(result.updatedAt)}
            </p>
          </div>

          <div className="corp-divider" />

          {/* Timeline */}
          <div>
            <h3 className="eyebrow text-ink mb-4">Status Pesanan</h3>
            <div className="space-y-0">
              {ORDER_STATUSES.map((stage, idx) => {
                const isCompleted = idx <= currentIdx
                const isCurrent = idx === currentIdx
                const isUpcoming = idx > currentIdx
                const isLast = idx === ORDER_STATUSES.length - 1
                const meta = stageMeta[stage.value]
                const Icon = meta?.icon || CircleDot

                return (
                  <div key={stage.value} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${
                        isCompleted
                          ? 'bg-primary text-white'
                          : 'bg-accent text-ink-faint'
                      } ${isCurrent ? 'ring-4 ring-primary/15' : ''}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      {!isLast && (
                        <div className={`w-px flex-1 min-h-8 my-1 transition-all duration-200 ${
                          idx < currentIdx ? 'bg-primary' : 'bg-line'
                        }`} />
                      )}
                    </div>
                    <div className={`pb-6 ${isLast ? 'pb-0' : ''}`}>
                      <p className={`text-[13px] font-medium ${isCompleted ? 'text-ink' : 'text-ink-muted'}`}>
                        {stage.label}
                      </p>
                      {isCurrent && (
                        <p className="text-[11px] text-primary font-medium mt-0.5 tracking-wide">Status saat ini</p>
                      )}
                      {isUpcoming && (
                        <p className="text-[11px] text-ink-muted mt-0.5">Menunggu</p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Vendor tracking */}
          {result.vendorTracking && (
            <>
              <div className="corp-divider" />
              <div className="flex items-center justify-between p-4 rounded-lg bg-surface">
                <div>
                  <p className="eyebrow text-ink-muted">Nomor Resi / Tracking</p>
                  <p className="font-mono font-medium text-ink mt-0.5">{result.vendorTracking}</p>
                </div>
                {result.shippedAt && (
                  <p className="text-[12px] text-ink-muted">
                    Dikirim: {formatDate(result.shippedAt)}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}