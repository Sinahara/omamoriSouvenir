'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import {
  ArrowLeft, ArrowRight, Plus, Trash2, Loader2, CheckCircle2, Building2, User, Package,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import SectionHeader from '@/components/public/section-header'
import { useAppStore } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'
import { formatRupiah, type Product, type PricingTier } from '@/lib/types'

interface FormItem {
  id: string
  productId: string
  qty: number
  notes: string
  product: Product | null
  pricePerUnit: number
  subtotal: number
}

interface CompanyForm {
  companyName: string
  picName: string
  picTitle: string
  whatsapp: string
  email: string
  kota: string
  alamat: string
}

interface OrderForm {
  items: FormItem[]
  deadline: string
  notes: string
}

const emptyCompany: CompanyForm = {
  companyName: '', picName: '', picTitle: '', whatsapp: '', email: '', kota: '', alamat: '',
}

function getTierPrice(tiers: PricingTier[], qty: number): number {
  if (!tiers || tiers.length === 0) return 0
  const sorted = [...tiers].sort((a, b) => a.minQty - b.minQty)
  let price = sorted[0].pricePerUnit
  for (const tier of sorted) {
    if (qty >= tier.minQty) {
      price = tier.pricePerUnit
    }
  }
  return price
}

function generateId() {
  return Math.random().toString(36).substring(2, 9)
}

export default function RequestQuote() {
  const { rfqProductSlug, setRfqProductSlug, navigate, navigateBack, previousPage } = useAppStore()
  const { toast } = useToast()
  const stepsRef = useRef<HTMLOListElement>(null)

  // Return to the page the visitor came from; a direct visit (or one from Beranda) goes to Beranda
  const goBack = () => {
    if (previousPage === 'landing' || previousPage === 'request-quote') navigate('landing')
    else navigateBack()
  }

  const [step, setStep] = useState(1)
  const [company, setCompany] = useState<CompanyForm>({ ...emptyCompany })
  const [order, setOrder] = useState<OrderForm>({ items: [{ id: generateId(), productId: '', qty: 0, notes: '', product: null, pricePerUnit: 0, subtotal: 0 }], deadline: '', notes: '' })
  const [products, setProducts] = useState<Product[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [captcha, setCaptcha] = useState<{ a: number; b: number; token: string }>({ a: 0, b: 0, token: '' })
  const [captchaAnswer, setCaptchaAnswer] = useState('')
  const [captchaError, setCaptchaError] = useState('')
  const [captchaLoading, setCaptchaLoading] = useState(false)

  // Next/Back are pressed at the bottom of the form: bring the new step's top into view
  useEffect(() => {
    const el = stepsRef.current
    if (el && el.getBoundingClientRect().top < 0) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [step])

  // The success message replaces the form, which may leave the visitor looking at the footer
  useEffect(() => {
    if (submitted) window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [submitted])

  // Fetch products for the select dropdown
  useEffect(() => {
    fetch('/api/catalog')
      .then((r) => r.json())
      .then((data) => setProducts(data || []))
      .catch(() => setProducts([]))
  }, [])

  // Pre-fill product if rfqProductSlug is set
  useEffect(() => {
    if (rfqProductSlug && products.length > 0) {
      const found = products.find(p => p.slug === rfqProductSlug)
      if (found) {
        const price = getTierPrice(found.pricingTiers, found.minQty)
        setOrder(prev => ({
          ...prev,
          items: [{
            id: generateId(),
            productId: found.id,
            qty: found.minQty,
            notes: '',
            product: found,
            pricePerUnit: price,
            subtotal: price * found.minQty,
          }],
        }))
      }
      setRfqProductSlug(null)
    }
  }, [rfqProductSlug, products, setRfqProductSlug])

  const updateCompany = (field: keyof CompanyForm, value: string) => {
    setCompany(prev => ({ ...prev, [field]: value }))
    setErrors(prev => ({ ...prev, [field]: '' }))
  }

  const addItem = () => {
    setOrder(prev => ({
      ...prev,
      items: [...prev.items, { id: generateId(), productId: '', qty: 0, notes: '', product: null, pricePerUnit: 0, subtotal: 0 }],
    }))
  }

  const removeItem = (id: string) => {
    if (order.items.length <= 1) return
    setOrder(prev => ({
      ...prev,
      items: prev.items.filter(i => i.id !== id),
    }))
  }

  const updateItem = (id: string, field: string, value: string | number) => {
    setOrder(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id !== id) return item
        const updated = { ...item, [field]: value }

        if (field === 'productId') {
          const prod = products.find(p => p.id === value)
          updated.product = prod || null
          const qty = updated.qty || (prod?.minQty || 1)
          updated.pricePerUnit = prod ? getTierPrice(prod.pricingTiers, qty) : 0
          updated.subtotal = updated.pricePerUnit * qty
        } else if (field === 'qty') {
          const qty = Number(value) || 0
          updated.pricePerUnit = item.product ? getTierPrice(item.product.pricingTiers, qty) : 0
          updated.subtotal = updated.pricePerUnit * qty
        }
        return updated
      }),
    }))
  }

  const validateStep1 = (): boolean => {
    const e: Record<string, string> = {}
    if (!company.companyName.trim()) e.companyName = 'Nama perusahaan wajib diisi'
    if (!company.picName.trim()) e.picName = 'Nama PIC wajib diisi'
    if (!company.whatsapp.trim()) e.whatsapp = 'No. WhatsApp wajib diisi'
    if (!company.email.trim()) e.email = 'Email wajib diisi'
    if (company.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(company.email)) e.email = 'Format email tidak valid'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validateStep2 = (): boolean => {
    const e: Record<string, string> = {}
    const hasProduct = order.items.some(i => i.productId)
    if (!hasProduct) e.items = 'Pilih minimal satu produk'
    const hasQty = order.items.some(i => i.productId && i.qty > 0)
    if (!hasQty) e.items = 'Isi jumlah pesanan untuk produk yang dipilih'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const totalEstimated = order.items.reduce((sum, i) => sum + i.subtotal, 0)

  // On small screens the first invalid field can sit above the fold: bring it into view
  const focusFirstError = () => {
    requestAnimationFrame(() => {
      const el = document.querySelector<HTMLElement>('[aria-invalid="true"], [data-error-anchor]')
      if (!el) return
      el.scrollIntoView({ block: 'center', behavior: 'smooth' })
      el.focus({ preventScroll: true })
    })
  }

  const handleNext = () => {
    if (step === 1 && !validateStep1()) return focusFirstError()
    if (step === 2 && !validateStep2()) return focusFirstError()
    setStep(prev => Math.min(prev + 1, 3))
  }

  const handlePrev = () => {
    setStep(prev => Math.max(prev - 1, 1))
  }

  const refreshCaptcha = useCallback(async () => {
    setCaptchaLoading(true)
    setCaptchaAnswer('')
    setCaptchaError('')
    try {
      const res = await fetch('/api/quote/captcha')
      if (res.ok) {
        const data = await res.json()
        setCaptcha(data)
      }
    } catch {
      // Silently fail — user can retry
    } finally {
      setCaptchaLoading(false)
    }
  }, [])

  // Fetch initial CAPTCHA on mount
  useEffect(() => {
    refreshCaptcha()
  }, [refreshCaptcha])

  const handleSubmit = async () => {
    // Validate CAPTCHA answer
    const userAnswer = Number(captchaAnswer.trim())
    if (isNaN(userAnswer) || userAnswer !== captcha.a + captcha.b) {
      // Refresh first: refreshCaptcha clears captchaError, so setting it before would hide the message
      await refreshCaptcha()
      setCaptchaError('Jawaban verifikasi salah, silakan coba lagi.')
      focusFirstError()
      return
    }

    setSubmitting(true)
    try {
      const items = order.items
        .filter(i => i.productId && i.qty > 0)
        .map(i => ({
          productSlug: i.product?.slug || '',
          qty: i.qty,
          notes: i.notes || undefined,
        }))

      const res = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: company.companyName,
          picName: company.picName,
          picTitle: company.picTitle || undefined,
          whatsapp: company.whatsapp,
          email: company.email,
          kota: company.kota || undefined,
          alamat: company.alamat || undefined,
          items,
          deadline: order.deadline || undefined,
          notes: order.notes || undefined,
          captcha: { token: captcha.token, answer: userAnswer },
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Gagal mengirim penawaran')
      }

      toast({ title: 'Penawaran Terkirim!', description: 'Tim kami akan menghubungi Anda dalam 1×24 jam.' })
      setCompany({ ...emptyCompany })
      setOrder({ items: [{ id: generateId(), productId: '', qty: 0, notes: '', product: null, pricePerUnit: 0, subtotal: 0 }], deadline: '', notes: '' })
      await refreshCaptcha()
      setSubmitted(true)
    } catch (err) {
      toast({ title: 'Gagal Mengirim', description: err instanceof Error ? err.message : 'Terjadi kesalahan', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  const steps = [
    { num: 1, label: 'Info Perusahaan', icon: Building2 },
    { num: 2, label: 'Detail Pesanan', icon: Package },
    { num: 3, label: 'Konfirmasi', icon: CheckCircle2 },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-20 space-y-8">
      {/* Success State */}
      {submitted ? (
        <div className="text-center py-16 space-y-6 animate-fade-in-up">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-ink">Penawaran Berhasil Terkirim!</h2>
          <p className="text-ink-muted max-w-md mx-auto">
            Tim kami akan menghubungi Anda dalam 1×24 jam melalui WhatsApp atau email untuk mengirimkan quotation resmi.
          </p>
          <div className="flex gap-3 justify-center pt-4">
            <Button onClick={() => navigate('catalog')} variant="outline" className="border-line text-ink-soft hover:text-ink hover:bg-surface rounded-sm">
              Lihat Katalog
            </Button>
            <Button onClick={() => { setSubmitted(false); setStep(1) }} className="bg-primary hover:bg-primary-hover text-white rounded-sm">
              Buat Penawaran Baru
            </Button>
          </div>
        </div>
      ) : (
      <>
      {/* Header */}
      <Button variant="ghost" size="sm" className="text-ink-soft hover:text-ink mb-4" onClick={goBack}>
        <ArrowLeft className="w-4 h-4 mr-1" /> Kembali
      </Button>
      <SectionHeader as="h1" align="left" badge="Formulir" title="Minta Penawaran" subtitle="Quotation resmi kami kirim dalam 1×24 jam setelah form ini dikirim" />

      {/* Progress Indicator — equal columns so it never overflows narrow screens */}
      <ol ref={stepsRef} className="grid grid-cols-3 max-w-md mx-auto">
        {steps.map((s, i) => {
          const Icon = s.icon
          const isActive = step === s.num
          const isDone = step > s.num
          return (
            <li key={s.num} className="relative flex flex-col items-center gap-1.5 text-center" aria-current={isActive ? 'step' : undefined}>
              {i > 0 && (
                <span
                  aria-hidden="true"
                  className={`absolute top-[18px] right-[calc(50%+26px)] w-[calc(100%-52px)] h-px transition-colors ${step >= s.num ? 'bg-primary' : 'bg-line'}`}
                />
              )}
              <div className={`w-9 h-9 rounded-sm flex items-center justify-center transition-all ${
                isDone || isActive
                  ? 'bg-primary text-white'
                  : 'bg-surface text-ink-muted border border-line'
              }`}>
                {isDone ? <CheckCircle2 className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <span className={`eyebrow ${isActive || isDone ? 'text-primary' : 'text-ink-muted'}`}>
                {s.label}
              </span>
            </li>
          )
        })}
      </ol>

      <Separator className="bg-line" />

      {/* Step 1: Company Info */}
      {step === 1 && (
        <section>
        <div className="corp-card jp-corner-accents p-6 space-y-5 animate-fade-in-up">
          <h2 className="eyebrow text-ink-muted">Langkah 1</h2>
          <h3 className="text-lg font-semibold text-ink">Informasi Perusahaan</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label htmlFor="companyName" className="text-[13px] text-ink">Nama Perusahaan <span className="text-red-500">*</span></Label>
              <Input id="companyName" required aria-required="true" placeholder="PT. Contoh Indonesia" value={company.companyName} onChange={(e) => updateCompany('companyName', e.target.value)} aria-invalid={!!errors.companyName} className={`mt-1.5 ${errors.companyName ? 'border-destructive' : ''}`} />
              {errors.companyName && <p role="alert" className="text-xs text-destructive mt-1">{errors.companyName}</p>}
            </div>
            <div>
              <Label htmlFor="picName" className="text-[13px] text-ink">Nama PIC <span className="text-red-500">*</span></Label>
              <Input id="picName" required aria-required="true" placeholder="Budi Santoso" value={company.picName} onChange={(e) => updateCompany('picName', e.target.value)} aria-invalid={!!errors.picName} className={`mt-1.5 ${errors.picName ? 'border-destructive' : ''}`} />
              {errors.picName && <p role="alert" className="text-xs text-destructive mt-1">{errors.picName}</p>}
            </div>
            <div>
              <Label htmlFor="picTitle" className="text-[13px] text-ink">Jabatan PIC</Label>
              <Input id="picTitle" placeholder="Purchasing Manager" value={company.picTitle} onChange={(e) => updateCompany('picTitle', e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="whatsapp" className="text-[13px] text-ink">No. HP / WhatsApp <span className="text-red-500">*</span></Label>
              <Input id="whatsapp" required aria-required="true" placeholder="081234567890" value={company.whatsapp} onChange={(e) => updateCompany('whatsapp', e.target.value)} aria-invalid={!!errors.whatsapp} className={`mt-1.5 ${errors.whatsapp ? 'border-destructive' : ''}`} />
              {errors.whatsapp && <p role="alert" className="text-xs text-destructive mt-1">{errors.whatsapp}</p>}
            </div>
            <div>
              <Label htmlFor="email" className="text-[13px] text-ink">Email <span className="text-red-500">*</span></Label>
              <Input id="email" type="email" required aria-required="true" placeholder="budi@contoh.co.id" value={company.email} onChange={(e) => updateCompany('email', e.target.value)} aria-invalid={!!errors.email} className={`mt-1.5 ${errors.email ? 'border-destructive' : ''}`} />
              {errors.email && <p role="alert" className="text-xs text-destructive mt-1">{errors.email}</p>}
            </div>
            <div>
              <Label htmlFor="kota" className="text-[13px] text-ink">Kota</Label>
              <Input id="kota" placeholder="Surabaya" value={company.kota} onChange={(e) => updateCompany('kota', e.target.value)} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="alamat" className="text-[13px] text-ink">Alamat</Label>
              <Input id="alamat" placeholder="Jl. Raya Darmo No. 123" value={company.alamat} onChange={(e) => updateCompany('alamat', e.target.value)} className="mt-1.5" />
            </div>
          </div>
        </div>
        </section>
      )}

      {/* Step 2: Order Details */}
      {step === 2 && (
        <section className="space-y-4">
          {errors.items && (
            <p role="alert" data-error-anchor tabIndex={-1} className="text-sm text-destructive">{errors.items}</p>
          )}

          {order.items.map((item, idx) => (
            <div key={item.id} className="corp-card jp-corner-accents p-4 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-ink">Produk #{idx + 1}</h3>
                {order.items.length > 1 && (
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-8 w-8" onClick={() => removeItem(item.id)} aria-label={`Hapus produk #${idx + 1}`}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Label htmlFor={`product-${item.id}`} className="text-[13px] text-ink">Pilih Produk</Label>
                  <Select value={item.productId} onValueChange={(val) => updateItem(item.id, 'productId', val)}>
                    <SelectTrigger id={`product-${item.id}`} className="mt-1.5 w-full">
                      <SelectValue placeholder="Pilih produk..." />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name} — {formatRupiah(p.basePrice)}/{p.unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor={`qty-${item.id}`} className="text-[13px] text-ink">Jumlah</Label>
                  <Input
                    id={`qty-${item.id}`}
                    type="number"
                    min={item.product?.minQty || 1}
                    value={item.qty || ''}
                    onChange={(e) => updateItem(item.id, 'qty', Number(e.target.value))}
                    placeholder={item.product ? `Min. ${item.product.minQty}` : '0'}
                    className="mt-1.5"
                  />
                  {item.product && (
                    <p className="text-xs text-ink-muted mt-1">Minimal pemesanan: {item.product.minQty} {item.product.unit}</p>
                  )}
                </div>

                <div className="flex items-end">
                  <div className="w-full">
                    <p className="eyebrow text-ink-muted mb-1">Harga/Unit</p>
                    {item.productId && item.qty > 0 ? (
                      <p className="text-lg font-semibold text-primary">{formatRupiah(item.pricePerUnit)}</p>
                    ) : (
                      <p className="text-sm text-ink-muted">Pilih produk & jumlah</p>
                    )}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor={`notes-${item.id}`} className="text-[13px] text-ink">Catatan</Label>
                  <Textarea
                    id={`notes-${item.id}`}
                    placeholder="Catatan khusus untuk produk ini..."
                    value={item.notes}
                    onChange={(e) => updateItem(item.id, 'notes', e.target.value)}
                    className="mt-1.5"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={addItem}
            className="w-full sm:w-auto border-line text-ink-soft hover:text-ink hover:bg-surface rounded-sm tracking-wide text-[13px]"
          >
            <Plus className="w-4 h-4 mr-1" /> Tambah Produk
          </Button>

          <div className="corp-card jp-corner-accents p-4 sm:p-6 space-y-4">
            <h3 className="font-medium text-ink">Pengiriman & Catatan</h3>
            <div>
              <Label htmlFor="deadline" className="text-[13px] text-ink">Deadline Pengiriman</Label>
              <Input
                id="deadline"
                type="date"
                value={order.deadline}
                onChange={(e) => setOrder(prev => ({ ...prev, deadline: e.target.value }))}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="orderNotes" className="text-[13px] text-ink">Catatan Tambahan</Label>
              <Textarea
                id="orderNotes"
                placeholder="Catatan tambahan untuk pesanan ini..."
                value={order.notes}
                onChange={(e) => setOrder(prev => ({ ...prev, notes: e.target.value }))}
                className="mt-1.5"
                rows={3}
              />
            </div>
          </div>
        </section>
      )}

      {/* Step 3: Confirmation */}
      {step === 3 && (
        <section>
        <div className="space-y-4 animate-fade-in-up">
          <div className="corp-card jp-corner-accents p-6 space-y-4">
            <h3 className="font-semibold text-ink flex items-center gap-2">
              <Building2 className="w-5 h-5" /> Informasi Perusahaan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div><span className="text-ink-muted">Nama Perusahaan:</span><p className="font-medium text-ink">{company.companyName}</p></div>
              <div><span className="text-ink-muted">PIC:</span><p className="font-medium text-ink">{company.picName}{company.picTitle ? ` — ${company.picTitle}` : ''}</p></div>
              <div><span className="text-ink-muted">WhatsApp:</span><p className="font-medium text-ink">{company.whatsapp}</p></div>
              <div><span className="text-ink-muted">Email:</span><p className="font-medium text-ink">{company.email}</p></div>
              {(company.kota || company.alamat) && (
                <div className="sm:col-span-2"><span className="text-ink-muted">Alamat:</span><p className="font-medium text-ink">{company.alamat}{company.kota ? `, ${company.kota}` : ''}</p></div>
              )}
            </div>
          </div>

          <div className="corp-card jp-corner-accents p-6 space-y-4">
            <h3 className="font-semibold text-ink flex items-center gap-2">
              <Package className="w-5 h-5" /> Detail Pesanan
            </h3>
            <div className="space-y-3">
              {order.items.filter(i => i.productId && i.qty > 0).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-surface text-sm">
                  <div>
                    <p className="font-medium text-ink">{item.product?.name}</p>
                    <p className="text-ink-muted">{item.qty} {item.product?.unit || 'pcs'} × {formatRupiah(item.pricePerUnit)}</p>
                    {item.notes && <p className="text-xs text-ink-muted mt-0.5">Catatan: {item.notes}</p>}
                  </div>
                  <p className="font-semibold text-ink">{formatRupiah(item.subtotal)}</p>
                </div>
              ))}
            </div>

            {order.deadline && (
              <p className="text-sm text-ink-muted">
                Deadline: {new Date(order.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
            {order.notes && (
              <p className="text-sm text-ink-muted">
                Catatan: {order.notes}
              </p>
            )}

            <Separator className="bg-line" />

            <div className="flex items-center justify-between">
              <span className="font-medium text-ink">Estimasi Total</span>
              <span className="text-xl font-bold text-primary">{formatRupiah(totalEstimated)}</span>
            </div>
            <p className="text-xs text-ink-muted">
              *Harga estimasi berdasarkan tier harga. Harga final akan dikonfirmasi melalui quotation resmi.
            </p>
          </div>

          {/* CAPTCHA Verification */}
          <div className="corp-card jp-corner-accents p-6 space-y-4">
            <h3 className="font-semibold text-ink">Verifikasi</h3>
            <p className="text-sm text-ink-muted">Untuk mencegah spam, jawab pertanyaan berikut:</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 sm:w-auto">
                <Label htmlFor="captcha-question" className="text-[13px] text-ink">
                  {captcha.a} + {captcha.b} = ?
                </Label>
              </div>
              <div className="flex-1">
                <Input
                  id="captcha-question"
                  type="number"
                  value={captchaAnswer}
                  onChange={(e) => { setCaptchaAnswer(e.target.value); setCaptchaError('') }}
                  placeholder="Jawaban"
                  aria-invalid={!!captchaError}
                  className={`mt-0 ${captchaError ? 'border-destructive' : ''}`}
                  aria-label="Jawaban verifikasi"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="shrink-0 text-ink-muted hover:text-ink"
                onClick={refreshCaptcha}
                disabled={captchaLoading}
                aria-label="Refresh soal verifikasi"
              >
                <svg className={captchaLoading ? 'animate-spin' : undefined} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
              </Button>
            </div>
            {captchaError && <p role="alert" className="text-xs text-destructive">{captchaError}</p>}
          </div>
        </div>
        </section>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-2">
        {step > 1 ? (
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={submitting}
            className="border-line text-ink-soft hover:text-ink hover:bg-surface rounded-sm tracking-wide text-[13px]"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Sebelumnya
          </Button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <Button onClick={handleNext} className="bg-primary hover:bg-primary-hover text-white rounded-sm">
            Selanjutnya <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={submitting} className="bg-primary hover:bg-primary-hover text-white rounded-sm">
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" /> Mengirim...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-1" /> Kirim Penawaran
              </>
            )}
          </Button>
        )}
      </div>
      </>
      )}
    </div>
  )
}