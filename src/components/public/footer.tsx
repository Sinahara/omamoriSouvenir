'use client'

import { useEffect, useState } from 'react'
import { MessageCircle, Mail, MapPin, CupSoda, Award, IdCard, Box, ShoppingBag, Briefcase, Instagram, Linkedin } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { BrandLogo } from '@/components/brand-logo'
import Reveal from '@/components/public/reveal'

const defaultContact = { whatsapp: '6285606381770', email: 'omamori@gmail.com', address: 'Surabaya — Sidoarjo — Pasuruan, Jawa Timur, Indonesia' }

// Pre-filled chat text for the floating WhatsApp button
const waMessage = 'Halo Omamori Souvenir, kami dari [Nama Perusahaan]. Kami ingin menanyakan welcome kit untuk [jumlah] karyawan baru. Mohon info contoh dan penawaran.'

const quickLinks = [
  { label: 'Beranda', page: 'landing' as const },
  { label: 'Tentang Kami', page: 'about' as const },
  { label: 'Katalog', page: 'catalog' as const },
  { label: 'Minta Penawaran', page: 'request-quote' as const },
  { label: 'Lacak Pesanan', page: 'track' as const },
]

const categories = [
  { label: 'Tumbler', icon: CupSoda, value: 'tumbler' },
  { label: 'Plakat', icon: Award, value: 'plakat' },
  { label: 'Lanyard', icon: IdCard, value: 'lanyard' },
  { label: 'Hardbox', icon: Box, value: 'hardbox' },
  { label: 'Goodie Bag', icon: ShoppingBag, value: 'goodie_bag' },
  { label: 'Starter Kit', icon: Briefcase, value: 'starter_kit' },
]

export default function Footer() {
  const { navigate, setCatalogCategory, currentPage } = useAppStore()
  const year = new Date().getFullYear()
  const [contact, setContact] = useState(defaultContact)

  useEffect(() => {
    fetch('/api/public/site-settings')
      .then(r => r.json())
      .then((data: Record<string, string>) => {
        if (data) {
          setContact({
            whatsapp: data.about_whatsapp || defaultContact.whatsapp,
            email: data.about_email || defaultContact.email,
            address: data.about_address || defaultContact.address,
          })
        }
      })
      .catch(() => {})
  }, [])

  return (
    <footer className="mt-auto">
      <div className="bg-white border-t border-line">
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16 pb-20">
          {/* Phones: company info and contact span the full width, the two link lists
              sit side by side, which keeps the footer about half as tall */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10 lg:gap-12">
            {/* Company Info */}
            <Reveal className="col-span-2 sm:col-span-1 space-y-5">
              <div className="flex items-center gap-2.5">
              <BrandLogo />
                <span className="font-bold text-[17px] text-ink tracking-tight">Omamori Souvenir</span>
              </div>
              <p className="text-sm md:text-[13px] text-ink-muted leading-relaxed">
                Welcome kit karyawan baru dan corporate gift custom untuk perusahaan di Surabaya,
                Sidoarjo, dan Pasuruan.
              </p>
              <div className="flex gap-3 pt-1">
                <a
                  href="https://instagram.com/omamorisouvenir.id"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 pointer-coarse:size-11 rounded-sm bg-surface border border-line flex items-center justify-center text-ink-muted hover:text-primary hover:border-primary/20 transition-colors duration-200"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
                <a
                  href="https://linkedin.com/company/omamorisouvenir"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 pointer-coarse:size-11 rounded-sm bg-surface border border-line flex items-center justify-center text-ink-muted hover:text-primary hover:border-primary/20 transition-colors duration-200"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
              <div className="flex items-start gap-2 text-sm md:text-[13px] text-ink-muted">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-ink-faint" />
                <span className="min-w-0 wrap-break-word">{contact.address}</span>
              </div>
            </Reveal>

            {/* Quick Links */}
            <Reveal delay={0.08} className="min-w-0 space-y-5">
              <h3 className="eyebrow text-ink">Quick Links</h3>
              <nav className="flex flex-col gap-2.5 pointer-coarse:gap-2" role="navigation">
                {quickLinks.map((link) => (
                  <button
                    key={link.page}
                    onClick={() => navigate(link.page)}
                    className="pointer-coarse:min-h-11 text-sm md:text-[13px] text-ink-muted hover:text-primary text-left transition-colors duration-200"
                  >
                    {link.label}
                  </button>
                ))}
              </nav>
            </Reveal>

            {/* Kategori */}
            <Reveal delay={0.16} className="min-w-0 space-y-5">
              <h3 className="eyebrow text-ink">Kategori</h3>
              <div className="flex flex-col gap-2.5 pointer-coarse:gap-2">
                {categories.map((cat) => {
                  const Icon = cat.icon
                  return (
                    <button
                      key={cat.label}
                      onClick={() => { setCatalogCategory(cat.value); navigate('catalog') }}
                      className="pointer-coarse:min-h-11 flex items-center gap-2.5 text-sm md:text-[13px] text-ink-muted hover:text-primary text-left transition-colors duration-200"
                    >
                      <Icon className="w-4 h-4 shrink-0 text-ink-faint" />
                      {cat.label}
                    </button>
                  )
                })}
              </div>
            </Reveal>

            {/* Kontak */}
            <Reveal delay={0.24} className="col-span-2 sm:col-span-1 min-w-0 space-y-5">
              <h3 className="eyebrow text-ink">Kontak</h3>
              <div className="flex flex-col gap-3 pointer-coarse:gap-2">
                <a
                  href={`https://wa.me/${(contact.whatsapp || '').replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pointer-coarse:min-h-11 flex items-center gap-2.5 text-sm md:text-[13px] text-ink-muted hover:text-primary transition-colors duration-200"
                >
                  <MessageCircle className="w-4 h-4 shrink-0 text-ink-faint" />
                  +{contact.whatsapp}
                </a>
                <a
                  href={`mailto:${(contact.email || '').replace(/[^\w@.\-+]/g, '')}`}
                  className="pointer-coarse:min-h-11 flex items-center gap-2.5 text-sm md:text-[13px] text-ink-muted hover:text-primary transition-colors duration-200"
                >
                  <Mail className="w-4 h-4 shrink-0 text-ink-faint" />
                  <span className="min-w-0 wrap-break-word">{contact.email}</span>
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal from="fade">
            <div className="corp-divider my-10" />

            <p className="text-center text-[12px] text-ink-muted tracking-wide">
              &copy; {year} Omamori Souvenir. Hak cipta dilindungi.
            </p>
          </Reveal>
        </div>
      </div>

      {/* WhatsApp Floating Button — hidden on the quote form, where it would cover
          the form's action buttons on phones (the footer still links to WhatsApp) */}
      {currentPage !== 'request-quote' && (
        <a
          href={`https://wa.me/${(contact.whatsapp || '').replace(/\D/g, '')}?text=${encodeURIComponent(waMessage)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-40 w-12 h-12 bg-primary hover:bg-primary-hover text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          aria-label="Hubungi via WhatsApp"
        >
          <MessageCircle className="w-5 h-5" />
        </a>
      )}
    </footer>
  )
}