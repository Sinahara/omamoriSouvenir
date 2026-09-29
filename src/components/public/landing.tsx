'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  CupSoda, Award, IdCard, Box, ShoppingBag, FileText, Truck,
  Upload, Shield, Sparkles, ArrowRight, Quote,
  Package, ClipboardCheck, Send, Briefcase,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import SectionHeader from '@/components/public/section-header'
import Reveal from '@/components/public/reveal'
import { useAppStore } from '@/lib/store'
import { CATEGORIES, formatRupiah, type Product } from '@/lib/types'

const categoryCards = [
  { value: 'tumbler', label: 'Tumbler', icon: CupSoda, desc: 'Tumbler custom untuk souvenir perusahaan & event' },
  { value: 'plakat', label: 'Plakat', icon: Award, desc: 'Plakat penghargaan premium & certificate frame' },
  { value: 'lanyard', label: 'Lanyard', icon: IdCard, desc: 'Tali ID card & name tag dengan cetak logo' },
  { value: 'hardbox', label: 'Hardbox', icon: Box, desc: 'Packaging hardbox premium untuk gift set' },
  { value: 'goodie_bag', label: 'Goodie Bag', icon: ShoppingBag, desc: 'Goodie bag custom untuk event & seminar' },
  { value: 'starter_kit', label: 'Starter Kit', icon: Briefcase, desc: 'Paket starter kit lengkap untuk employee onboarding & welcome gift' },
]

const howItWorks = [
  {
    step: 1,
    icon: Upload,
    title: 'Kirim Permintaan',
    desc: 'Kirim brief atau isi form Minta Penawaran. Tim kami merespons dalam 1×24 jam.',
  },
  {
    step: 2,
    icon: ClipboardCheck,
    title: 'Proses Produksi',
    desc: 'Produksi dimulai setelah DP masuk, dan Anda mendapat kabar progresnya secara berkala.',
  },
  {
    step: 3,
    icon: Truck,
    title: 'Pengiriman',
    desc: 'Barang dicek sebelum dikirim. Statusnya bisa dipantau di halaman Lacak Pesanan.',
  },
]

const usps = [
  {
    icon: Package,
    title: 'Zero Inventory',
    desc: 'Barang diproduksi setelah DP masuk, jadi Anda tidak perlu menyimpan stok.',
    iconClass: 'kpi-icon-green',
  },
  {
    icon: FileText,
    title: 'Dokumen Lengkap',
    desc: 'Quotation, invoice, dan kuitansi bermeterai kami siapkan untuk administrasi kantor Anda.',
    iconClass: 'kpi-icon-amber',
  },
  {
    icon: Sparkles,
    title: 'Mockup Premium',
    desc: 'Mockup berbasis AI memperlihatkan produk dengan desain Anda sebelum produksi dimulai.',
    iconClass: 'kpi-icon-blue',
  },
]

// Real client testimonials only, shared with the client's permission. The section
// stays hidden while this list is empty; the earlier entries were placeholders.
const testimonials: { quote: string; name: string; title: string }[] = []

export default function Landing() {
  const { navigate, selectProduct, setCatalogCategory } = useAppStore()
  const [featured, setFeatured] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set())

  // Fallbacks only: the live hero text comes from Pengaturan → Tampilan Beranda
  const [settings, setSettings] = useState({
    hero_badge: 'Corporate Gift Custom',
    hero_title: 'Corporate Gift Custom untuk Perusahaan di Surabaya & Sidoarjo',
    hero_subtitle: 'Tumbler, plakat, lanyard, hardbox, goodie bag, dan starter kit dengan logo perusahaan Anda. Diproduksi setelah DP, dengan mockup sebelum produksi.',
    hero_btn_primary_text: 'Minta Penawaran',
    hero_btn_secondary_text: 'Lihat Katalog',
    hero_image: '/hero-3d-product.png',
  })

  const [settingsLoaded, setSettingsLoaded] = useState(false)
  
  const handleImgError = (src: string) => {
    setImgErrors(prev => new Set(prev).add(src))
  }

  useEffect(() => {
    fetch('/api/public/site-settings')
      .then((r) => r.json())
      .then((data) => {
        if (data && !data.error) {
          setSettings(prev => ({ ...prev, ...data }))
        }
      })
      .catch((err) => console.error('Gagal memuat pengaturan:', err))
      .finally(() => {
        setSettingsLoaded(true) 
      })

    fetch('/api/catalog')
      .then((r) => r.json())
      .then((data) => {
        const items = Array.isArray(data) ? data : (data?.products || [])
        setFeatured(items.slice(0, 6))
      })
      .catch(() => setFeatured([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      {/* ═══ Hero Section ═══ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 jp-seigaiha-bg opacity-[0.03]" />
        {/* Same max-w-6xl as the navbar, so the hero lines up with the logo */}
        <div className="relative max-w-6xl mx-auto px-4 py-12 md:py-16 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-10 md:gap-12 lg:gap-16 items-center">
            {/* Left — Text Content */}
            <motion.div
              className="min-w-0 space-y-6 md:space-y-8 text-center lg:text-left"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {!settingsLoaded ? (
                <div className="space-y-4 pt-4">
                  <Skeleton className="h-6 w-48 mx-auto lg:mx-0 rounded-full" />
                  <Skeleton className="h-12 md:h-14 w-full rounded-md" />
                  <Skeleton className="h-12 md:h-14 w-3/4 mx-auto lg:mx-0 rounded-md" />
                  <Skeleton className="h-20 w-full max-w-md mx-auto lg:mx-0 rounded-md" />
                  <div className="flex gap-3 justify-center lg:justify-start pt-2">
                    <Skeleton className="h-11 w-40 rounded-md" />
                    <Skeleton className="h-11 w-32 rounded-md" />
                  </div>
                </div>
              ) : (
                /* JIKA DATA SUDAH SIAP, TAMPILKAN TEKS ASLI DARI DATABASE */
                <>
                  <span className="inline-block eyebrow text-primary border border-primary/20 px-4 py-1 rounded-sm">
                    {settings.hero_badge}
                  </span>
                  <h1 className="text-3xl md:text-4xl xl:text-[44px] font-bold text-ink leading-[1.2] tracking-tight wrap-break-word">
                    {settings.hero_title}
                  </h1>
                  <p className="text-base text-ink-muted max-w-md mx-auto lg:mx-0 leading-relaxed whitespace-pre-wrap wrap-break-word">
                    {settings.hero_subtitle}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
                    <Button
                      size="lg"
                      className="text-sm px-8 h-11 bg-primary hover:bg-primary-hover text-white rounded-sm tracking-wide"
                      onClick={() => navigate('request-quote')}
                    >
                      {settings.hero_btn_primary_text}
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="text-sm px-8 h-11 border-line-strong text-ink-soft hover:text-ink hover:bg-surface hover:border-line-hover rounded-sm tracking-wide"
                      onClick={() => navigate('catalog')}
                    >
                      {settings.hero_btn_secondary_text}
                    </Button>
                  </div>
                </>
              )}
            </motion.div>

            {/* Right — Floating Product */}
            <motion.div
              className="relative min-w-0 flex items-center justify-center lg:justify-end"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 }}
            >
              <div className="absolute w-[70%] h-[70%] bg-linear-to-br from-emerald-50/80 to-emerald-100/40 rounded-full blur-3xl" />
              {/* Gentle float as a CSS transform animation: it runs on the compositor
                  instead of a JS loop, and stops under prefers-reduced-motion */}
              <img
                src={settings.hero_image || '/hero-3d-product.png'}
                alt="Premium Corporate Gift Set"
                width={640}
                height={480}
                className="relative w-full max-w-lg xl:max-w-xl drop-shadow-xl animate-float"
                fetchPriority="high"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ Kategori Section ═══ */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <Reveal>
            <SectionHeader
              badge="Kategori"
              title="Kategori Produk"
              subtitle="Enam kategori, semuanya bisa disesuaikan dengan identitas brand Anda"
            />
          </Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-5">
            {categoryCards.map((cat, i) => {
              const Icon = cat.icon
              return (
                <Reveal key={cat.value} delay={i * 0.06}>
                  <motion.button
                    onClick={() => { setCatalogCategory(cat.value); navigate('catalog') }}
                    whileHover={{ y: -3 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="corp-card jp-corner-accents jp-corner-accents-tight p-5 sm:p-6 xl:p-5 h-full w-full text-left cursor-pointer group flex flex-col"
                  >
                    <div className="w-10 h-10 rounded-lg kpi-icon-green flex items-center justify-center mb-4 shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-ink mb-1.5 text-[15px]">{cat.label}</h3>
                    <p className="text-[13px] sm:text-sm text-ink-muted leading-relaxed">{cat.desc}</p>
                  </motion.button>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══ Featured Products Section ═══ */}
      <section className="section-gray py-16 md:py-24 jp-asanoha-bg">
        <div className="max-w-6xl mx-auto px-4">
          <Reveal>
            <SectionHeader
              badge="Unggulan"
              title="Produk Unggulan"
              subtitle="Harga per unit turun untuk pesanan dalam jumlah besar"
            />
          </Reveal>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="corp-card overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : featured.length === 0 ? (
            <Reveal className="corp-card max-w-md mx-auto px-6 py-10 text-center">
              <Package className="w-10 h-10 text-ink-faint mx-auto mb-3" />
              <p className="font-medium text-ink">Produk belum bisa ditampilkan</p>
              <p className="text-sm text-ink-muted mt-1 mb-5">
                Anda tetap bisa mengirim kebutuhan lewat form penawaran, tim kami akan membantu memilih produknya.
              </p>
              <Button
                variant="outline"
                className="border-line-strong text-ink-soft hover:text-ink hover:bg-surface rounded-sm"
                onClick={() => navigate('request-quote')}
              >
                Minta Penawaran
              </Button>
            </Reveal>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
                {featured.map((product, i) => (
                  <Reveal key={product.id} delay={(i % 3) * 0.08}>
                    <motion.button
                      onClick={() => selectProduct(product.slug)}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                      className="corp-card overflow-hidden h-full w-full text-left cursor-pointer group flex flex-col"
                    >
                      <div className="p-3 pb-0">
                        <div className="h-44 bg-media rounded-2xl flex items-center justify-center relative overflow-hidden">
                          {product.images?.[0]?.path && !imgErrors.has(product.images[0].path) ? (
                            <img
                              src={product.images[0].path}
                              alt={product.name}
                              loading="lazy"
                              decoding="async"
                              onError={() => handleImgError(product.images[0].path)}
                              className="w-full h-full object-cover rounded-2xl group-hover:scale-[1.03] transition-transform duration-700"
                            />
                          ) : (
                            <Package className="w-16 h-16 text-ink-faint group-hover:text-ink-muted transition-colors" />
                          )}
                          <div className="absolute top-3 left-3 right-3">
                            <Badge variant="secondary" className="max-w-full truncate text-[10px] tracking-wide bg-white/80 text-ink-soft rounded-sm">
                              {CATEGORIES.find(c => c.value === product.category)?.label || product.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-1 flex-col gap-2 px-5 pb-5 pt-4">
                        <h3 className="font-semibold text-ink line-clamp-2 wrap-break-word group-hover:text-primary transition-colors text-[15px]">
                          {product.name}
                        </h3>
                        <p className="mt-auto text-sm text-primary font-semibold">
                          Mulai dari {formatRupiah(product.basePrice)}
                        </p>
                      </div>
                    </motion.button>
                  </Reveal>
                ))}
              </div>
              <Reveal className="text-center mt-10">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-line-hover text-ink-soft hover:text-ink hover:bg-surface hover:border-line-hover rounded-sm tracking-wide px-6 h-10"
                  onClick={() => navigate('catalog')}
                >
                  Lihat Semua Produk
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Reveal>
            </>
          )}
        </div>
      </section>

      {/* ═══ How It Works Section ═══ */}
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4">
          <Reveal>
            <SectionHeader
              badge="Proses"
              title="Cara Kerja"
              subtitle="Tiga tahap dari brief sampai barang diterima"
            />
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 lg:gap-8 relative">
            <div className="hidden md:block absolute top-[18px] left-[calc(16.67%+18px)] right-[calc(16.67%+18px)] connecting-line" />

            {howItWorks.map((item, i) => {
              const Icon = item.icon
              return (
                <Reveal
                  key={item.step}
                  delay={i * 0.12}
                  className="relative flex flex-col items-center text-center"
                >
                  <div className="step-num mb-5 z-10">
                    {item.step}
                  </div>
                  {/* flex-1 keeps the three cards the same height in a row */}
                  <div className="corp-card jp-corner-accents jp-corner-accents-tight p-6 w-full max-w-sm md:max-w-none flex-1">
                    <div className="w-10 h-10 rounded-lg kpi-icon-green flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-ink mb-2 text-[15px]">{item.title}</h3>
                    <p className="text-sm text-ink-muted leading-relaxed">{item.desc}</p>
                  </div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══ USP Section ═══ */}
      <section className="section-gray py-16 md:py-24 jp-washi-bg">
        <div className="max-w-5xl mx-auto px-4">
          <Reveal>
            <SectionHeader
              badge="Keunggulan"
              title="Yang Kami Tangani untuk Anda"
              subtitle="Stok, desain, dan dokumen administrasi tidak perlu Anda urus sendiri"
            />
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {usps.map((usp, i) => {
              const Icon = usp.icon
              return (
                <Reveal key={usp.title} delay={i * 0.1}>
                  <motion.div
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="corp-card jp-corner-accents jp-corner-accents-tight p-6 h-full"
                  >
                    <div className={`w-10 h-10 rounded-lg ${usp.iconClass} flex items-center justify-center mb-4`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-ink mb-2 text-[15px]">{usp.title}</h3>
                    <p className="text-sm text-ink-muted leading-relaxed">{usp.desc}</p>
                  </motion.div>
                </Reveal>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══ Testimonial Section — shown only once real testimonials are added ═══ */}
      {testimonials.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="max-w-6xl mx-auto px-4">
            <Reveal>
              <SectionHeader
                badge="Testimoni"
                title="Kata Klien Kami"
                subtitle="Pengalaman klien yang pernah memesan di Omamori Souvenir"
              />
            </Reveal>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
              {testimonials.map((item, i) => (
                <Reveal
                  key={i}
                  delay={(i % 3) * 0.1}
                  className="corp-card jp-corner-accents jp-corner-accents-tight p-6 flex flex-col"
                >
                  <Quote className="w-6 h-6 text-primary/15 mb-4 shrink-0" />
                  <p className="text-[15px] text-ink-soft leading-relaxed flex-1">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                  <div className="corp-divider my-4" />
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary-soft flex items-center justify-center text-sm font-semibold text-primary shrink-0">
                      {item.name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink">{item.name}</p>
                      <p className="text-xs text-ink-muted mt-0.5">{item.title}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══ Final CTA ═══ */}
      <section className="py-16 md:py-24 jp-seigaiha-bg">
        <div className="max-w-4xl mx-auto px-4">
          <Reveal className="relative bg-primary rounded-lg px-6 py-10 sm:p-10 md:p-14 text-center text-white overflow-hidden">
            <div className="absolute inset-0 jp-seigaiha-bg opacity-[0.06]" />
            <div className="relative">
              <h2 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">
                Siap Memulai Pesanan?
              </h2>
              <p className="text-white/75 max-w-md mx-auto mb-8 leading-relaxed text-[15px]">
                Kirim kebutuhan Anda, quotation resmi kami kirim dalam 1×24&nbsp;jam.
                Konsultasi gratis.
              </p>
              <Button
                size="lg"
                className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 text-sm px-8 h-11 rounded-sm font-semibold tracking-wide"
                onClick={() => navigate('request-quote')}
              >
                Minta Penawaran Sekarang
                <Send className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}