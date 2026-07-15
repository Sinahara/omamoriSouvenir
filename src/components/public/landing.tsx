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
import { useAppStore } from '@/lib/store'
import { CATEGORIES, formatRupiah, type Product } from '@/lib/types'

const categoryCards = [
  { value: 'tumbler', label: 'Tumbler', icon: CupSoda, desc: 'Tumbler custom untuk souvenir perusahaan & event' },
  { value: 'plakat', label: 'Plakat', icon: Award, desc: 'Plakat penghargaan premium & certificate frame' },
  { value: 'lanyard', label: 'Lanyard', icon: IdCard, desc: 'ID card lanyard & tali name tag berkualitas' },
  { value: 'hardbox', label: 'Hardbox', icon: Box, desc: 'Packaging hardbox premium untuk gift set' },
  { value: 'goodie_bag', label: 'Goodie Bag', icon: ShoppingBag, desc: 'Goodie bag custom untuk event & seminar' },
  { value: 'starter_kit', label: 'Starter Kit', icon: Briefcase, desc: 'Paket starter kit lengkap untuk employee onboarding & welcome gift' },
]

const howItWorks = [
  {
    step: 1,
    icon: Upload,
    title: 'Kirim Permintaan',
    desc: 'Upload brief atau isi form RFQ, tim kami akan merespon dalam 1x24 jam',
  },
  {
    step: 2,
    icon: ClipboardCheck,
    title: 'Proses Produksi',
    desc: 'Setelah DP masuk, produksi dimulai dengan update progress berkala',
  },
  {
    step: 3,
    icon: Truck,
    title: 'Pengiriman',
    desc: 'Quality check ketat, pengiriman tepat waktu dengan tracking real-time',
  },
]

const usps = [
  {
    icon: Package,
    title: 'Zero Inventory',
    desc: 'Tidak perlu stok, produksi setelah DP. Minim risiko, maksimal fleksibilitas.',
    iconClass: 'kpi-icon-green',
  },
  {
    icon: FileText,
    title: 'Dokumen Lengkap',
    desc: 'Quotation, invoice, kuitansi bermeterai. Semua administrasi terurus.',
    iconClass: 'kpi-icon-amber',
  },
  {
    icon: Sparkles,
    title: 'Mockup Premium',
    desc: 'Visualisasi produk dengan mockup AI berkualitas tinggi sebelum produksi.',
    iconClass: 'kpi-icon-blue',
  },
]

/* ── Section Header ─────────────────────────── */
function SectionHeader({ badge, title, subtitle }: { badge: string; title: string; subtitle: string }) {
  return (
    <div className="text-center mb-12">
      <span className="inline-block text-[11px] font-semibold tracking-[0.15em] uppercase text-[#00a651] border border-[#00a651]/20 px-4 py-1 rounded-sm mb-4">{badge}</span>
      <h2 className="text-2xl md:text-3xl font-bold text-[#333333] tracking-tight">{title}</h2>
      <p className="text-[#999999] mt-3 max-w-md mx-auto">{subtitle}</p>
    </div>
  )
}

export default function Landing() {
  const { navigate, selectProduct, setCatalogCategory } = useAppStore()
  const [featured, setFeatured] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set())

  const [settings, setSettings] = useState({
    hero_badge: 'Corporate Gift Terpercaya',
    hero_title: 'Solusi Corporate Gift Premium untuk Bisnis Anda',
    hero_subtitle: 'Dari tumbler custom hingga employee onboarding kit lengkap. Zero inventory, mockup premium, dokumen lengkap.',
    hero_btn_primary_text: 'Minta Penawaran',
    hero_btn_secondary_text: 'Lihat Katalog',
    hero_image: '/hero-3d-product.png',
  })

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
    <div className="pb-16">
      {/* ═══ Hero Section ═══ */}
      <section className="relative">
        <div className="absolute inset-0 jp-seigaiha-bg opacity-[0.03]" />
        <div className="relative max-w-7xl mx-auto px-4 py-10 md:py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            {/* Left — Text Content */}
            <motion.div
              className="space-y-8 text-center lg:text-left"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <span className="inline-block text-[11px] font-semibold tracking-[0.15em] uppercase text-[#00a651] border border-[#00a651]/20 px-4 py-1 rounded-sm">
                {settings.hero_badge}
              </span>
              <h1 className="text-3xl md:text-4xl xl:text-[44px] font-bold text-[#333333] leading-[1.2] tracking-tight">
                {settings.hero_title}
              </h1>
              <p className="text-base text-[#999999] max-w-md mx-auto lg:mx-0 leading-relaxed">
                {settings.hero_subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2">
                <Button
                  size="lg"
                  className="text-sm px-8 h-11 bg-[#00a651] hover:bg-[#008a40] text-white rounded-[4px] tracking-wide"
                  onClick={() => navigate('request-quote')}
                >
                  {settings.hero_btn_primary_text}
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-sm px-8 h-11 border-[#e0e0e0] text-[#666666] hover:text-[#333333] hover:bg-[#fafafa] hover:border-[#d0d0d0] rounded-[4px] tracking-wide"
                  onClick={() => navigate('catalog')}
                >
                  {settings.hero_btn_secondary_text}
                </Button>
              </div>
            </motion.div>

            {/* Right — Floating Product */}
            <motion.div
              className="relative flex items-center justify-center lg:justify-end"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 }}
            >
              <div className="absolute w-[70%] h-[70%] bg-linear-to-br from-emerald-50/80 to-emerald-100/40 rounded-full blur-3xl" />
              <motion.img
                src={settings.hero_image || '/hero-3d-product.png'}
                alt="Premium Corporate Gift Set"
                width={640}
                height={480}
                className="relative w-full max-w-lg xl:max-w-xl drop-shadow-xl"
                fetchPriority="high"
                animate={{
                  y: [0, -10, 0],
                  rotateZ: [0, 0.8, 0, -0.8, 0],
                }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ Kategori Section ═══ */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <SectionHeader
            badge="Kategori"
            title="Kategori Produk"
            subtitle="Berbagai pilihan corporate gift untuk setiap kebutuhan"
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-5 mt-12 stagger-children">
            {categoryCards.map((cat) => {
              const Icon = cat.icon
              return (
                <motion.button
                  key={cat.value}
                  onClick={() => { setCatalogCategory(cat.value); navigate('catalog') }}
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="corp-card jp-corner-accents p-6 text-left cursor-pointer group"
                >
                  <div className="w-10 h-10 rounded-lg kpi-icon-green flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-[#333333] mb-1.5 text-[15px]">{cat.label}</h3>
                  <p className="text-sm text-[#999999] leading-relaxed">{cat.desc}</p>
                </motion.button>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══ Featured Products Section ═══ */}
      <section className="section-gray py-16 md:py-24 jp-asanoha-bg">
        <div className="max-w-6xl mx-auto px-4">
          <SectionHeader
            badge="Unggulan"
            title="Produk Unggulan"
            subtitle="Produk terbaik kami yang siap untuk bisnis Anda"
          />

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
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
            <div className="text-center py-16">
              <p className="text-[#999999]">Belum ada produk yang tersedia.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
                {featured.map((product) => (
                  <motion.button
                    key={product.id}
                    onClick={() => selectProduct(product.slug)}
                    whileHover={{ y: -2 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="corp-card overflow-hidden text-left cursor-pointer group"
                  >
                    <div className="p-3 pb-0">
                      <div className="h-44 bg-[#1a1a1a] rounded-2xl flex items-center justify-center relative overflow-hidden">
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
                          <Package className="w-16 h-16 text-[#cccccc] group-hover:text-[#aaaaaa] transition-colors" />
                        )}
                        <div className="absolute top-3 left-3">
                          <Badge variant="secondary" className="text-[10px] tracking-wide bg-white/80 text-[#666666] rounded-sm">
                            {CATEGORIES.find(c => c.value === product.category)?.label || product.category}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="px-5 pb-5 pt-4 space-y-2">
                      <h3 className="font-semibold text-[#333333] line-clamp-2 group-hover:text-[#00a651] transition-colors text-[15px]">
                        {product.name}
                      </h3>
                      <p className="text-sm text-[#00a651] font-semibold">
                        Mulai dari {formatRupiah(product.basePrice)}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
              <div className="text-center mt-10">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#d4d4d4] text-[#666666] hover:text-[#333333] hover:bg-[#fafafa] hover:border-[#b0b0b0] rounded-[4px] tracking-wide px-6 h-10"
                  onClick={() => navigate('catalog')}
                >
                  Lihat Semua Produk
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ═══ How It Works Section ═══ */}
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-4">
          <SectionHeader
            badge="Proses"
            title="Cara Kerja"
            subtitle="Proses pemesanan yang mudah dan transparan"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 relative mt-12">
            <div className="hidden md:block absolute top-[18px] left-[calc(16.67%+18px)] right-[calc(16.67%+18px)] connecting-line" />

            {howItWorks.map((item) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: item.step * 0.12, ease: 'easeOut' }}
                  className="relative flex flex-col items-center text-center"
                >
                  <div className="step-num mb-5 z-10">
                    {item.step}
                  </div>
                  <div className="corp-card jp-corner-accents p-6 w-full max-w-xs">
                    <div className="w-10 h-10 rounded-lg kpi-icon-green flex items-center justify-center mx-auto mb-4">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-[#333333] mb-2 text-[15px]">{item.title}</h3>
                    <p className="text-sm text-[#999999] leading-relaxed">{item.desc}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══ USP Section ═══ */}
      <section className="section-gray py-16 md:py-24 jp-washi-bg">
        <div className="max-w-5xl mx-auto px-4">
          <SectionHeader
            badge="Keunggulan"
            title="Mengapa Memilih Kami?"
            subtitle="Keunggulan yang membedakan kami dari yang lain"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 stagger-children">
            {usps.map((usp) => {
              const Icon = usp.icon
              return (
                <motion.div
                  key={usp.title}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                  className="corp-card jp-corner-accents p-6"
                >
                  <div className={`w-10 h-10 rounded-lg ${usp.iconClass} flex items-center justify-center mb-4`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-[#333333] mb-2 text-[15px]">{usp.title}</h3>
                  <p className="text-sm text-[#999999] leading-relaxed">{usp.desc}</p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══ Testimonial Section ═══ */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <SectionHeader
            badge="Testimoni"
            title="Dipercaya oleh Ratusan Perusahaan"
            subtitle="Apa kata klien kami tentang layanan Omamori Souvenir"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            {[
              {
                quote: "Kualitas tumbler custom sangat baik dan pengiriman tepat waktu. Tim Omamori Souvenir sangat responsif dan profesional dari awal konsultasi hingga barang diterima.",
                name: "Rina Wijaya",
                title: "HR Manager, PT Mitra Sejahtera",
              },
              {
                quote: "Kami sudah bekerja sama untuk 3 event besar dan hasilnya selalu memuaskan. Plakat dan goodie bag yang dipesan selalu mendapat pujian dari peserta.",
                name: "Ahmad Fauzan",
                title: "Event Coordinator, Bank Nasional",
              },
              {
                quote: "Starter kit onboarding karyawan baru dari Omamori Souvenir benar-benar meningkatkan first impression. Desain eksklusif dan material premium sesuai identitas brand kami.",
                name: "Diana Kusuma",
                title: "Head of People, Tech Startup ID",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: 'easeOut' }}
                className="corp-card jp-corner-accents p-6 flex flex-col"
              >
                <Quote className="w-6 h-6 text-[#00a651]/15 mb-4 shrink-0" />
                <p className="text-[15px] text-[#666666] leading-relaxed flex-1">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <div className="corp-divider my-4" />
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#e8f5ee] flex items-center justify-center text-sm font-semibold text-[#00a651] shrink-0">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#333333]">{item.name}</p>
                    <p className="text-xs text-[#999999] mt-0.5">{item.title}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Final CTA ═══ */}
      <section className="py-16 md:py-24 jp-seigaiha-bg">
        <div className="max-w-4xl mx-auto px-4">
          <div className="relative bg-[#00a651] rounded-lg p-10 md:p-14 text-center text-white overflow-hidden">
            <div className="absolute inset-0 jp-seigaiha-bg opacity-[0.06]" />
            <div className="relative">
              <h2 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">
                Siap Memulai Pesanan?
              </h2>
              <p className="text-white/75 max-w-md mx-auto mb-8 leading-relaxed text-[15px]">
                Dapatkan penawaran terbaik untuk kebutuhan corporate gift perusahaan Anda.
                Gratis konsultasi.
              </p>
              <Button
                size="lg"
                className="bg-white text-[#00a651] hover:bg-white/90 text-sm px-8 h-11 rounded-[4px] font-semibold tracking-wide"
                onClick={() => navigate('request-quote')}
              >
                Minta Penawaran Sekarang
                <Send className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}