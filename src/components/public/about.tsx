'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Award, Shield, Truck, Sparkles, Package, FileText,
  MessageCircle, Mail, Phone, MapPin, Clock, CheckCircle2,
  Users, Target, TrendingUp, ArrowRight, Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAppStore } from '@/lib/store';

/* ── Animation Variants ───────────────────────────────── */
const fadeInUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: 'easeOut' as const },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

/* ── Icon & Color Maps ─────────────────────────────────── */
const iconMap: Record<string, React.ElementType> = {
  Package, FileText, Sparkles, Shield, Truck, Users,
  Target, TrendingUp, Award, CheckCircle2,
};

const colorMap: Record<string, string> = {
  Package: 'kpi-icon-green',
  FileText: 'kpi-icon-green',
  Sparkles: 'kpi-icon-green',
  Shield: 'kpi-icon-green',
  Truck: 'kpi-icon-green',
  Users: 'kpi-icon-green',
  Target: 'kpi-icon-green',
  TrendingUp: 'kpi-icon-green',
  Award: 'kpi-icon-green',
  CheckCircle2: 'kpi-icon-green',
};

/* ── Default Data ──────────────────────────────────────── */
const defaultAdvantages = [
  { icon: 'Package', title: 'Zero Inventory', desc: 'Anda tidak perlu menyetok barang. Kami mengelola stok dan produksi sesuai kebutuhan pesanan, menghilangkan risiko overstock sepenuhnya.' },
  { icon: 'FileText', title: 'Dokumen Lengkap', desc: 'Setiap pengiriman dilengkapi invoice, surat jalan, dan dokumen administrasi rapi untuk kebutuhan pelaporan perusahaan Anda.' },
  { icon: 'Sparkles', title: 'Mockup Premium', desc: 'Dapatkan preview mockup digital gratis sebelum produksi dimulai, memastikan hasil sesuai ekspektasi dan identitas brand Anda.' },
  { icon: 'Shield', title: 'Quality Control', desc: 'Tim QC memeriksa setiap produk secara ketat sebelum dikirim. Garansi penggantian jika produk tidak memenuhi standar.' },
  { icon: 'Truck', title: 'Pengiriman Tepat Waktu', desc: 'Didukung jaringan logistik luas di seluruh Indonesia, pesanan dijamin sampai di alamat tujuan tepat waktu dan aman.' },
  { icon: 'Users', title: 'Tim Profesional', desc: 'Dedicated account manager dan tim desainer berpengalaman siap membantu dari konsultasi awal hingga pengiriman.' },
];

const defaultBenefits = [
  { icon: 'Target', title: 'Hemat Biaya', desc: 'Harga kompetitif langsung dari produsen tanpa perantara. Hemat hingga 30% dibandingkan pembelian retail untuk jumlah besar.' },
  { icon: 'TrendingUp', title: 'Brand Visibility', desc: 'Produk berkualitas meningkatkan citra merek Anda. Souvenir premium menjadi media promosi jangka panjang.' },
  { icon: 'Award', title: 'Kualitas Premium', desc: 'Material terpilih dengan proses produksi berstandar tinggi. Setiap produk melewati quality check berlapis untuk hasil terbaik.' },
  { icon: 'CheckCircle2', title: 'Customisasi Penuh', desc: 'Desain, warna, ukuran, dan bentuk disesuaikan sepenuhnya dengan kebutuhan dan identitas visual brand Anda.' },
];

const defaultContact = { whatsapp: '6281234567890', email: 'info@omamorisouvenir.id', phone: '031-1234-5678', address: 'Surabaya — Sidoarjo, Jawa Timur, Indonesia' };

/* ── Section Header ────────────────────────────────────── */
function SectionHeader({ badge, title, subtitle }: { badge: string; title: string; subtitle?: string }) {
  return (
    <div className="text-center mb-12">
      <span className="inline-block text-[11px] font-semibold tracking-[0.15em] uppercase text-[#00a651] border border-[#00a651]/20 px-4 py-1 rounded-sm mb-4">{badge}</span>
      <h2 className="text-2xl md:text-3xl font-bold text-[#333333] tracking-tight">{title}</h2>
      {subtitle && <p className="text-[#999999] mt-3 max-w-md mx-auto">{subtitle}</p>}
    </div>
  );
}

interface Settings {
  about_title?: string; about_subtitle?: string; about_description?: string;
  about_image?: string; about_advantages?: string; about_benefits?: string;
  about_whatsapp?: string; about_email?: string; about_phone?: string; about_address?: string;
}

const getIcon = (name: string): React.ElementType => iconMap[name] || Package;
const getColor = (name: string): string => colorMap[name] || 'kpi-icon-green';
/* ═══ MAIN COMPONENT — About / Tentang Kami ═══ */
export default function About() {
  const navigate = useAppStore((s) => s.navigate);
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    fetch('/api/public/site-settings')
      .then((r) => r.json())
      .then((data) => { setSettings(data.settings || data || {}); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  /* ── Parsed settings with fallbacks ─── */
  const title = settings.about_title || 'Mitra Terpercaya untuk Souvenir & Corporate Gift Premium';
  const subtitle = settings.about_subtitle || 'Lebih dari 5 tahun pengalaman melayani kebutuhan corporate gift untuk ratusan perusahaan di seluruh Indonesia.';
  const description = settings.about_description
    || 'Omamori Souvenir adalah penyedia solusi corporate gift dan souvenir premium berbasis di Jawa Timur. Kami hadir untuk membantu perusahaan dalam memilih, mendesain, dan mendistribusikan produk berkualitas tinggi yang merepresentasikan nilai merek Anda.\n\nDengan tim profesional dan jaringan produksi luas, setiap pesanan dieksekusi dengan standar kualitas terbaik — mulai dari pen produk, mug premium, tote bag, hingga paket hamper eksklusif.';

  const advantages = (() => { try { const p = JSON.parse(settings.about_advantages || 'null'); return Array.isArray(p) && p.length > 0 ? p : defaultAdvantages; } catch { return defaultAdvantages; } })();
  const benefits = (() => { try { const p = JSON.parse(settings.about_benefits || 'null'); return Array.isArray(p) && p.length > 0 ? p : defaultBenefits; } catch { return defaultBenefits; } })();

  const contact = {
    whatsapp: settings.about_whatsapp || defaultContact.whatsapp,
    email: settings.about_email || defaultContact.email,
    phone: settings.about_phone || defaultContact.phone,
    address: settings.about_address || defaultContact.address,
  };

  return (
    <div className="min-h-screen flex flex-col">

      {/* ═══ 1. HERO BANNER ═══ */}
      <section className="relative pt-28 pb-20 md:pt-36 md:pb-28 bg-linear-to-br from-[#00a651] to-emerald-700 text-white overflow-hidden">
        <div className="absolute inset-0 jp-seigaiha-bg opacity-[0.06]" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}>
            <span className="inline-block text-[11px] font-semibold tracking-[0.15em] uppercase text-white/80 border border-white/20 px-4 py-1 rounded-sm mb-6">
              About Us
            </span>
          </motion.div>
          <motion.h1
            className="text-3xl md:text-4xl xl:text-[42px] font-bold leading-[1.2] mb-5 tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {loading ? <Skeleton className="h-12 w-full max-w-2xl mx-auto" /> : title}
          </motion.h1>
          <motion.div
            className="text-base md:text-lg text-white/75 max-w-xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {loading ? (
              <>
                <Skeleton className="h-5 w-full mb-2" />
                <Skeleton className="h-5 w-3/4 mx-auto" />
              </>
            ) : (
              subtitle
            )}
          </motion.div>
          <motion.div
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="jp-ornament-diamond max-w-[60px] mx-auto" />
          </motion.div>
        </div>
      </section>

      {/* ═══ 2. TENTANG BISNIS ═══ */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Left — Image */}
            <motion.div
              className="rounded-lg overflow-hidden jp-corner-accents"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {loading ? (
                <Skeleton className="w-full h-72 md:h-[360px]" />
              ) : (
                <div className="relative w-full h-72 md:h-[360px]">
                  {!imgError ? (
                    <img
                      src={settings.about_image || '/about-team.png'}
                      alt="Tentang Omamori Souvenir"
                      className="w-full h-full object-cover"
                      decoding="async"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <div className="w-full h-full jp-washi-bg flex flex-col items-center justify-center text-gray-400">
                      <svg className="w-16 h-16 mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                      <span className="text-sm">Gambar tidak tersedia</span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>

            {/* Right — Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {loading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-7 w-64" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-5">
                    <div className="jp-simple-line" />
                    <span className="text-[11px] font-semibold text-[#00a651] uppercase tracking-[0.15em]">Tentang Kami</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-[#333333] mb-6 leading-tight tracking-tight">
                    Kenapa Memilih Omamori Souvenir?
                  </h2>
                  {description.split('\n').filter(Boolean).map((para, idx) => (
                    <div key={idx} className="text-[#999999] leading-relaxed mb-4 text-[15px]">{para}</div>
                  ))}
                  <div className="corp-divider my-6" />
                  <div className="flex flex-wrap gap-3">
                    <Button
                      className="bg-[#00a651] hover:bg-[#008a40] text-white font-medium px-6 rounded-[4px] text-sm tracking-wide"
                      onClick={() => navigate('request-quote')}
                    >
                      Minta Penawaran <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="border-[#d4d4d4] text-[#666666] hover:text-[#333333] hover:bg-[#fafafa] font-medium px-6 rounded-[4px] text-sm tracking-wide"
                      onClick={() => navigate('catalog')}
                    >
                      Lihat Katalog
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ 3. KEUNGULAN KAMI — 6 Cards ═══ */}
      <section className="py-16 md:py-24 section-gray jp-asanoha-bg">
        <div className="max-w-6xl mx-auto px-4">
          <SectionHeader badge="Keunggulan Kami" title="Apa yang Membuat Kami Berbeda" subtitle="Keunggulan layanan dan produk kami" />
          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            {advantages.map((item: { icon: string; title: string; desc: string }, i: number) => {
              const Icon = getIcon(item.icon);
              return (
                <motion.div
                  key={i}
                  className="corp-card jp-corner-accents p-6"
                  variants={fadeInUp}
                  custom={i}
                >
                  <div className={`w-11 h-11 ${getColor(item.icon)} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-[#333333] text-[15px] mb-2">{item.title}</h3>
                  <div className="text-[#999999] text-sm leading-relaxed">{item.desc}</div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ═══ 4. KEUNTUNGAN PRODUK — 4 Items ═══ */}
      <section className="py-16 md:py-24 jp-washi-bg">
        <div className="max-w-5xl mx-auto px-4">
          <SectionHeader badge="Keuntungan Produk" title="Manfaat untuk Bisnis Anda" subtitle="Nilai tambah dari setiap produk yang kami sediakan" />
          <motion.div
            className="grid sm:grid-cols-2 gap-5"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            {benefits.map((item: { icon: string; title: string; desc: string }, i: number) => {
              const Icon = getIcon(item.icon);
              return (
                <motion.div
                  key={i}
                  className="flex gap-5 p-6 rounded-lg border border-[#eeeeee] bg-white hover:border-[#d4d4d4] transition-all duration-300"
                  variants={fadeInUp}
                  custom={i}
                >
                  <div className={`shrink-0 w-11 h-11 ${getColor(item.icon)} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[#333333] text-[15px] mb-1.5">{item.title}</h3>
                    <div className="text-[#999999] text-sm leading-relaxed">{item.desc}</div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ═══ 5. HUBUNGI KAMI ═══ */}
      <section className="py-16 md:py-24 section-gray">
        <div className="max-w-5xl mx-auto px-4">
          <SectionHeader badge="Hubungi Kami" title="Kami Siap Membantu Anda" subtitle="Hubungi kami untuk konsultasi dan pemesanan" />

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            {[
              { icon: MessageCircle, label: 'WhatsApp', value: `+${contact.whatsapp}`, href: `https://wa.me/${(contact.whatsapp || '').replace(/\D/g, '')}`, external: true },
              { icon: Mail, label: 'Email', value: contact.email, href: `mailto:${(contact.email || '').replace(/[^\w@.\-+]/g, '')}`, external: false },
              { icon: Phone, label: 'Telepon', value: contact.phone, href: `tel:${(contact.phone || '').replace(/[^\d+]/g, '')}`, external: false },
              { icon: MapPin, label: 'Lokasi', value: contact.address, href: '#', external: false },
            ].map((c, i) => (
              <motion.a
                key={i}
                href={c.href}
                target={c.external ? '_blank' : undefined}
                rel={c.external ? 'noopener noreferrer' : undefined}
                className="corp-card jp-corner-accents p-5 text-center group cursor-pointer"
                variants={scaleIn}
              >
                <div className="w-11 h-11 kpi-icon-green rounded-lg flex items-center justify-center mx-auto mb-3">
                  <c.icon className="w-5 h-5" />
                </div>
                <div className="font-semibold text-[#333333] text-sm mb-1">{c.label}</div>
                <div className="text-[#999999] text-xs leading-snug wrap-break-word">{c.value}</div>
              </motion.a>
            ))}
          </motion.div>

          {/* Operating Hours */}
          <motion.div
            className="flex justify-center"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-white rounded-full border border-[#eeeeee] text-sm text-[#999999]">
              <Clock className="w-4 h-4 text-[#00a651] shrink-0" />
              <span>Senin — Jumat: 08.00 — 17.00 WIB &nbsp;·&nbsp; Sabtu: 08.00 — 12.00 WIB</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ 6. CTA SECTION ═══ */}
      <section className="py-16 md:py-24 bg-[#00a651] text-white relative overflow-hidden">
        <div className="absolute inset-0 jp-seigaiha-bg opacity-[0.06]" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="w-14 h-14 bg-white/10 rounded-lg flex items-center justify-center mx-auto mb-6">
              <Send className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">
              Siap Memulai Pesanan?
            </h2>
            <p className="text-white/75 text-[15px] mb-8 max-w-md mx-auto leading-relaxed">
              Hubungi tim kami sekarang dan dapatkan penawaran terbaik untuk kebutuhan corporate gift Anda.
            </p>
            <Button
              size="lg"
              className="bg-white text-[#00a651] hover:bg-white/90 font-semibold px-8 h-11 rounded-[4px] text-sm tracking-wide"
              onClick={() => navigate('request-quote')}
            >
              Minta Penawaran Sekarang <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}