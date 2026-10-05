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
import SectionHeader from '@/components/public/section-header';
import Reveal from '@/components/public/reveal';
import { useAppStore } from '@/lib/store';

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
// Fallbacks only: the live text comes from Pengaturan → Tentang Kami. Keep them to
// facts the site itself shows (order stages, tier pricing, catalog specs) and claims
// the owner can back up (see audit-website-omamori-souvenir.md).
const defaultAdvantages = [
  { icon: 'Sparkles', title: 'Mockup Sebelum Produksi', desc: 'Anda melihat gambaran desain dan menyetujuinya terlebih dulu. Mockup adalah ilustrasi; hasil produksi bisa sedikit berbeda dan dikonfirmasi lewat persetujuan sebelum produksi.' },
  { icon: 'FileText', title: 'Dokumen Lengkap', desc: 'Quotation, invoice, dan kuitansi bermeterai siap untuk administrasi kantor Anda.' },
  { icon: 'Package', title: 'Tanpa Stok di Kantor Anda', desc: 'Produksi dimulai setelah DP, jumlah mengikuti kebutuhan.' },
  { icon: 'Users', title: 'Ditangani Langsung Pendiri', desc: 'Setiap permintaan dibalas dalam 1×24 jam lewat WhatsApp, setiap hari pukul 18.00–21.00 WIB.' },
];

const defaultBenefits = [
  { icon: 'Target', title: 'Hemat Biaya', desc: 'Harga per unit turun sesuai jumlah pesanan. Daftar harga bertingkatnya tercantum di halaman setiap produk.' },
  { icon: 'TrendingUp', title: 'Brand Visibility', desc: 'Logo Anda tercetak di barang yang dipakai sehari-hari, seperti tumbler, lanyard, dan tas, sehingga tetap terlihat setelah acara selesai.' },
  { icon: 'Award', title: 'Spesifikasi Jelas', desc: 'Material dan spesifikasi setiap produk tercantum di katalog, jadi Anda tahu barang yang dipesan sebelum membayar DP.' },
  { icon: 'CheckCircle2', title: 'Desain Custom', desc: 'Desain dan warna disesuaikan dengan identitas visual brand Anda.' },
];

const defaultContact = { whatsapp: '6285606381770', email: 'omamori@gmail.com', phone: '085606381770', address: 'Surabaya — Sidoarjo — Pasuruan, Jawa Timur, Indonesia' };

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
  const title = settings.about_title || 'Souvenir & Corporate Gift Custom untuk Perusahaan';
  const subtitle = settings.about_subtitle || 'Welcome kit karyawan baru dan souvenir perusahaan untuk Surabaya, Sidoarjo, dan Pasuruan, ditangani langsung oleh pendiri.';
  const description = settings.about_description
    || 'Omamori Souvenir dirintis di Surabaya untuk membantu perusahaan menyiapkan welcome kit karyawan baru dan souvenir acara. Kami masih baru, dan itu berarti setiap klien awal ditangani langsung oleh pendirinya, dari konsultasi sampai pengiriman.\n\nSetiap pesanan dimulai dari penawaran resmi. Mockup dikirim untuk disetujui sebelum produksi, dan produksi dimulai setelah DP diterima. Status setiap tahap, dari produksi sampai pengiriman, bisa Anda pantau di halaman Lacak Pesanan.';

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
      {/* The navbar is sticky (it takes its own space), so no extra top offset is needed */}
      <section className="relative py-16 md:py-24 lg:py-28 bg-linear-to-br from-primary to-emerald-700 text-white overflow-hidden">
        <div className="absolute inset-0 jp-seigaiha-light" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}>
            <span className="inline-block eyebrow text-white/80 border border-white/20 px-4 py-1 rounded-sm mb-6">
              Tentang Kami
            </span>
          </motion.div>
          <motion.h1
            className="text-[28px] sm:text-3xl md:text-4xl xl:text-[42px] font-bold leading-[1.2] mb-5 tracking-tight wrap-break-word"
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
            {/* White diamonds: the default primary green disappears on this banner */}
            <div className="jp-ornament-diamond max-w-[60px] mx-auto [--primary:#fff]" />
          </motion.div>
        </div>
      </section>

      {/* ═══ 2. TENTANG BISNIS ═══ */}
      {/* overflow-hidden: the image and text slide in from the sides */}
      <section className="py-16 md:py-24 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Left — Image */}
            <Reveal from="left" className="min-w-0 rounded-lg overflow-hidden">
              {loading ? (
                <Skeleton className="w-full h-64 sm:h-80 lg:h-[380px]" />
              ) : (
                <div className="relative w-full h-64 sm:h-80 lg:h-[380px]">
                  {!imgError ? (
                    <img
                      src={settings.about_image || '/about-team.png'}
                      alt="Tentang Omamori Souvenir"
                      className="w-full h-full object-cover"
                      loading="lazy"
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
            </Reveal>

            {/* Right — Content */}
            <Reveal from="right" delay={0.1} className="min-w-0">
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
                    <span className="eyebrow text-primary">Profil Perusahaan</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-ink mb-6 leading-tight tracking-tight">
                    Siapa Kami
                  </h2>
                  {description.split('\n').filter(Boolean).map((para, idx) => (
                    <div key={idx} className="text-ink-soft leading-relaxed mb-4 text-[15px] wrap-break-word">{para}</div>
                  ))}
                  <div className="corp-divider my-6" />
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-white font-medium px-6 h-10 rounded-sm text-sm tracking-wide"
                      onClick={() => navigate('request-quote')}
                    >
                      Minta Penawaran <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto border-line-hover text-ink-soft hover:text-ink hover:bg-surface font-medium px-6 h-10 rounded-sm text-sm tracking-wide"
                      onClick={() => navigate('catalog')}
                    >
                      Lihat Katalog
                    </Button>
                  </div>
                </>
              )}
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══ 3. KEUNGULAN KAMI — 6 Cards ═══ */}
      <section className="py-16 md:py-24 section-gray">
        <div className="max-w-6xl mx-auto px-4">
          <Reveal>
            <SectionHeader badge="Keunggulan Kami" title="Apa yang Membuat Kami Berbeda" />
          </Reveal>
          {/* Three columns only when the cards fill every row; four cards sit 2×2 */}
          <div className={`grid sm:grid-cols-2 ${advantages.length % 3 === 0 ? 'lg:grid-cols-3' : ''} gap-4 sm:gap-5`}>
            {advantages.map((item: { icon: string; title: string; desc: string }, i: number) => {
              const Icon = getIcon(item.icon);
              return (
                <Reveal
                  key={i}
                  delay={(i % 3) * 0.08}
                  className="corp-card p-6"
                >
                  <div className={`w-11 h-11 ${getColor(item.icon)} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-semibold text-ink text-[15px] mb-2">{item.title}</h3>
                  <div className="text-ink-soft text-sm leading-relaxed wrap-break-word">{item.desc}</div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ 4. KEUNTUNGAN PRODUK — 4 Items ═══ */}
      <section className="py-16 md:py-24 jp-washi-bg">
        <div className="max-w-5xl mx-auto px-4">
          <Reveal>
            <SectionHeader badge="Keuntungan Produk" title="Manfaat untuk Bisnis Anda" />
          </Reveal>
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
            {benefits.map((item: { icon: string; title: string; desc: string }, i: number) => {
              const Icon = getIcon(item.icon);
              return (
                <Reveal
                  key={i}
                  delay={(i % 2) * 0.1}
                  className="flex gap-4 sm:gap-5 p-5 sm:p-6 rounded-lg border border-line bg-white hover:border-line-hover transition-colors duration-200"
                >
                  <div className={`shrink-0 w-11 h-11 ${getColor(item.icon)} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-ink text-[15px] mb-1.5">{item.title}</h3>
                    <div className="text-ink-soft text-sm leading-relaxed wrap-break-word">{item.desc}</div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ 5. HUBUNGI KAMI ═══ */}
      <section className="py-16 md:py-24 section-gray">
        <div className="max-w-5xl mx-auto px-4">
          <Reveal>
            <SectionHeader badge="Hubungi Kami" title="Kami Siap Membantu Anda" subtitle="Hubungi kami untuk konsultasi dan pemesanan" />
          </Reveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-10">
            {[
              { icon: MessageCircle, label: 'WhatsApp', value: `+${contact.whatsapp}`, href: `https://wa.me/${(contact.whatsapp || '').replace(/\D/g, '')}`, external: true },
              { icon: Mail, label: 'Email', value: contact.email, href: `mailto:${(contact.email || '').replace(/[^\w@.\-+]/g, '')}`, external: false },
              { icon: Phone, label: 'Telepon', value: contact.phone, href: `tel:${(contact.phone || '').replace(/[^\d+]/g, '')}`, external: false },
              { icon: MapPin, label: 'Lokasi', value: contact.address, href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`, external: true },
            ].map((c, i) => (
              <Reveal key={i} delay={i * 0.08}>
                {/* Phones: icon beside the text, one compact row per contact. sm up: centered tile. */}
                <a
                  href={c.href}
                  target={c.external ? '_blank' : undefined}
                  rel={c.external ? 'noopener noreferrer' : undefined}
                  className="corp-card h-full p-5 flex items-center gap-4 text-left sm:flex-col sm:gap-0 sm:text-center group cursor-pointer"
                >
                  <div className="w-11 h-11 shrink-0 kpi-icon-green rounded-lg flex items-center justify-center sm:mb-3">
                    <c.icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-ink text-sm mb-1">{c.label}</div>
                    <div className="text-ink-soft text-sm leading-snug wrap-break-word">{c.value}</div>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>

          {/* Operating Hours */}
          <Reveal delay={0.2} className="flex justify-center">
            <div className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-white rounded-2xl sm:rounded-full border border-line text-sm text-ink-soft">
              <Clock className="w-4 h-4 text-primary shrink-0" />
              <span>Balasan WhatsApp setiap hari: 18.00 — 21.00 WIB</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ═══ 6. CTA SECTION ═══ */}
      <section className="py-16 md:py-24 bg-primary text-white relative overflow-hidden">
        <div className="absolute inset-0 jp-seigaiha-light" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <Reveal>
            <div className="w-14 h-14 bg-white/10 rounded-lg flex items-center justify-center mx-auto mb-6">
              <Send className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">
              Siap Memulai Pesanan?
            </h2>
            <p className="text-white/75 text-[15px] mb-8 max-w-md mx-auto leading-relaxed">
              Kirim kebutuhan Anda, quotation resmi kami kirim dalam 1×24&nbsp;jam. Konsultasi gratis.
            </p>
            <Button
              size="lg"
              className="w-full sm:w-auto bg-white text-primary hover:bg-white/90 font-semibold px-8 h-11 rounded-sm text-sm tracking-wide"
              onClick={() => navigate('request-quote')}
            >
              Minta Penawaran Sekarang <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Reveal>
        </div>
      </section>
    </div>
  );
}