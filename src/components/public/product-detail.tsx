'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, MessageCircle, Package, Send, X, ZoomIn, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useAppStore } from '@/lib/store'
import { CATEGORIES, formatRupiah, type Product, type PricingTier } from '@/lib/types'

function getCategoryTint(category: string) {
  const map: Record<string, string> = {
    tumbler: 'cat-tint-tumbler',
    plakat: 'cat-tint-plakat',
    lanyard: 'cat-tint-lanyard',
    hardbox: 'cat-tint-hardbox',
    goodie_bag: 'cat-tint-goodie_bag',
  }
  return map[category] || 'cat-tint-tumbler'
}

function parseSpecs(specs: string | null): { name: string; value: string }[] {
  if (!specs) return []
  try {
    const parsed = JSON.parse(specs)
    if (Array.isArray(parsed)) {
      return parsed.map((item: Record<string, string>) => ({
        name: item.name || item.key || item.spec || '',
        value: item.value || item.val || '',
      })).filter(s => s.name && s.value)
    }
    if (typeof parsed === 'object') {
      return Object.entries(parsed).map(([key, val]) => ({ name: key, value: String(val) }))
    }
  } catch {
    // Not valid JSON, return empty
  }
  return []
}

// Spec keys are stored as typed by the admin ("material", "areaPrint"): show them as labels
function formatSpecName(name: string) {
  const spaced = name.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/_/g, ' ')
  return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

type FetchState =
  | { status: 'idle' }
  | { status: 'loading'; slug: string }
  | { status: 'success'; product: Product }
  | { status: 'error' }

export default function ProductDetail() {
  const { selectedProductSlug, navigate, navigateBack, setRfqProductSlug, previousPage } = useAppStore()
  const [fetchState, setFetchState] = useState<FetchState>(
    selectedProductSlug ? { status: 'loading', slug: selectedProductSlug } : { status: 'idle' }
  )
  const [activeThumb, setActiveThumb] = useState(0)
  const [whatsapp, setWhatsapp] = useState('6281234567890')
  const [lightbox, setLightbox] = useState(false)

  // Fetch WhatsApp from site settings
  useEffect(() => {
    fetch('/api/public/site-settings')
      .then(r => r.json())
      .then((data: Record<string, string>) => {
        if (data?.about_whatsapp) setWhatsapp(data.about_whatsapp)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!selectedProductSlug) return
    let cancelled = false
    fetch(`/api/catalog/${selectedProductSlug}`)
      .then((r) => {
        if (!r.ok) throw new Error('Not found')
        return r.json()
      })
      .then((data) => {
        const p = data?.product || data
        if (!cancelled) setFetchState({ status: 'success', product: p })
      })
      .catch(() => {
        if (!cancelled) setFetchState({ status: 'error' })
      })
    return () => { cancelled = true }
  }, [selectedProductSlug])

  const loading = fetchState.status === 'loading'
  const notFound = fetchState.status === 'idle' || fetchState.status === 'error'
  const product = fetchState.status === 'success' ? fetchState.product : null

  // Step back through history only when the visitor came from the catalog (keeps its
  // filter and scroll); otherwise open the catalog, so the button never leaves the site.
  const backToCatalog = () => {
    if (previousPage === 'catalog') navigateBack()
    else navigate('catalog')
  }

  const handleRequestQuote = () => {
    if (product) {
      setRfqProductSlug(product.slug)
    }
    navigate('request-quote')
  }

  if (fetchState.status === 'loading') {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-20 space-y-8">
        <Button variant="ghost" size="sm" className="text-ink-muted hover:text-ink text-[13px]" onClick={backToCatalog}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Katalog
        </Button>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <Skeleton className="h-96 rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (notFound || !product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-24 text-center">
        <Package className="w-12 h-12 text-ink-faint mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-ink mb-2">Produk Tidak Ditemukan</h2>
        <p className="text-ink-muted text-sm mb-6">Produk ini mungkin sudah tidak dijual, atau tautannya salah.</p>
        <Button onClick={backToCatalog} className="rounded-sm text-[13px] tracking-wide">
          <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Katalog
        </Button>
      </div>
    )
  }

  const specs = parseSpecs(product.specs)
  const images = product.images?.length ? product.images : []
  const tint = getCategoryTint(product.category)
  const showPrevImage = () => setActiveThumb(prev => (prev - 1 + images.length) % images.length)
  const showNextImage = () => setActiveThumb(prev => (prev + 1) % images.length)

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 md:py-20 space-y-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        className="text-ink-muted hover:text-ink text-[13px]"
        onClick={backToCatalog}
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke Katalog
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
        {/* Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <button
            onClick={() => images.length > 0 && setLightbox(true)}
            className="w-full rounded-2xl bg-media h-72 sm:h-96 flex items-center justify-center overflow-hidden relative group/main cursor-pointer"
            aria-label="Perbesar gambar"
          >
            {images.length > 0 && images[activeThumb]?.path ? (
              <img
                src={images[activeThumb].path}
                alt={product.name}
                className="w-full h-full object-cover rounded-2xl"
                loading="eager"
                decoding="async"
              />
            ) : (
              <Package className="w-24 h-24 text-ink-faint" />
            )}
            {images.length > 0 && images[activeThumb]?.path && (
              <div className="absolute inset-0 bg-black/0 group-hover/main:bg-black/10 transition-colors flex items-center justify-center">
                <ZoomIn className="w-8 h-8 text-white opacity-0 group-hover/main:opacity-70 transition-opacity" />
              </div>
            )}
          </button>
          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setActiveThumb(idx)}
                  aria-label={`Lihat gambar ${idx + 1}`}
                  aria-pressed={idx === activeThumb}
                  className={`shrink-0 w-20 h-20 rounded-2xl bg-media flex items-center justify-center border-2 transition-all ${
                    idx === activeThumb ? 'border-primary shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  {img.path ? (
                    <img src={img.path} alt={`Thumbnail ${product.name}`} className="w-full h-full object-cover rounded-2xl" loading="lazy" decoding="async" />
                  ) : (
                    <Package className="w-8 h-8 text-ink-faint" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <Badge variant="secondary" className="mb-3 bg-primary-soft text-primary-hover rounded-sm text-[11px] tracking-wide">
              {CATEGORIES.find(c => c.value === product.category)?.label || product.category}
            </Badge>
            <h1 className="text-2xl md:text-3xl font-bold text-ink tracking-tight">{product.name}</h1>
            <p className="text-2xl font-bold text-primary mt-2">
              Mulai dari {formatRupiah(product.basePrice)}
              <span className="text-sm font-normal text-ink-muted">/{product.unit}</span>
            </p>
            <p className="text-sm text-ink-soft mt-1">
              Minimal pemesanan: {product.minQty} {product.unit}
            </p>
          </div>

          {product.description && (
            <div>
              <h3 className="eyebrow text-ink mb-2">Deskripsi</h3>
              <p className="text-[15px] text-ink-muted leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {specs.length > 0 && (
            <div>
              <h3 className="eyebrow text-ink mb-3">Spesifikasi</h3>
              <div className="corp-table overflow-hidden">
                <table className="w-full text-sm">
                  <tbody>
                    {specs.map((spec, i) => (
                      <tr key={i} className={i < specs.length - 1 ? 'border-b border-line' : ''}>
                        <td className="px-4 py-3 font-medium text-ink bg-surface w-1/3">
                          {formatSpecName(spec.name)}
                        </td>
                        <td className="px-4 py-3 text-ink-muted">
                          {spec.value}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {product.pricingTiers && product.pricingTiers.length > 0 && (
            <div>
              <h3 className="eyebrow text-ink mb-3">Harga per Jumlah</h3>
              <div className="corp-table overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-line">
                      <th className="px-4 py-3 text-left font-semibold text-ink bg-surface text-[13px]">
                        Jumlah
                      </th>
                      <th className="px-4 py-3 text-right font-semibold text-ink bg-surface text-[13px]">
                        Harga/Unit
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.pricingTiers.map((tier: PricingTier) => (
                      <tr key={tier.id} className="border-b border-line last:border-b-0">
                        <td className="px-4 py-3 text-ink-muted">
                          {tier.maxQty ? `${tier.minQty} – ${tier.maxQty}` : `${tier.minQty}+`} {product.unit}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-ink">
                          {formatRupiah(tier.pricePerUnit)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="corp-divider" />

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              className="flex-1 bg-primary hover:bg-primary-hover text-white rounded-sm text-sm tracking-wide"
              onClick={handleRequestQuote}
            >
              <Send className="w-4 h-4 mr-2" />
              Minta Penawaran
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="flex-1 border-line text-ink-muted hover:text-ink hover:bg-surface rounded-sm text-sm tracking-wide"
            >
              <a
                href={`https://wa.me/${whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Halo, saya tertarik dengan produk: ${product.name}`)}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </a>
            </Button>
          </div>
        </div>
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={lightbox} onOpenChange={setLightbox}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-4xl w-[95vw] p-0 bg-black/95 border-none rounded-xl overflow-hidden"
          onKeyDown={(e) => {
            if (images.length < 2) return
            if (e.key === 'ArrowLeft') showPrevImage()
            if (e.key === 'ArrowRight') showNextImage()
          }}
        >
          <DialogTitle className="sr-only">{product.name}</DialogTitle>
          <DialogDescription className="sr-only">Galeri gambar produk {product.name}</DialogDescription>
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-3 right-3 z-10 size-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
          {images.length > 1 && (
            <button
              onClick={showPrevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-10 size-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              aria-label="Gambar sebelumnya"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          {images.length > 0 && images[activeThumb]?.path && (
            <img
              src={images[activeThumb].path}
              alt={product.name}
              className="w-full h-[85vh] object-contain"
            />
          )}
          {images.length > 1 && (
            <button
              onClick={showNextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-10 size-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              aria-label="Gambar selanjutnya"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
          {images.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex z-10">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveThumb(idx)}
                  className="flex size-6 items-center justify-center pointer-coarse:size-11"
                  aria-label={`Gambar ${idx + 1}`}
                  aria-current={idx === activeThumb}
                >
                  <span className={`block w-2 h-2 rounded-full transition-colors ${idx === activeThumb ? 'bg-white' : 'bg-white/30'}`} />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}