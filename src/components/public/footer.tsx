'use client'

import { useEffect, useState } from 'react'
import { MessageCircle, Mail, MapPin, CupSoda, Award, IdCard, Box, ShoppingBag, Briefcase, Instagram, Linkedin } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import { BrandLogo } from '@/components/brand-logo'

const defaultContact = { whatsapp: '6281234567890', email: 'info@omamorisouvenir.id', address: 'Surabaya — Sidoarjo, Jawa Timur, Indonesia' }

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
        <div className="max-w-6xl mx-auto px-4 py-16 pb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
            {/* Company Info */}
            <div className="space-y-5">
              <div className="flex items-center gap-2.5">
              <BrandLogo />
                <span className="font-bold text-[17px] text-ink tracking-tight">Omamori Souvenir</span>
              </div>
              <p className="text-sm md:text-[13px] text-ink-muted leading-relaxed">
                Corporate gift custom untuk perusahaan di Surabaya dan Sidoarjo, dari tumbler
                sampai paket onboarding karyawan.
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
                <span>{contact.address}</span>
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-5">
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
            </div>

            {/* Kategori */}
            <div className="space-y-5">
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
                      <Icon className="w-4 h-4 text-ink-faint" />
                      {cat.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Kontak */}
            <div className="space-y-5">
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
                  {contact.email}
                </a>
              </div>
            </div>
          </div>

          <div className="corp-divider my-10" />

          <p className="text-center text-[12px] text-ink-muted tracking-wide">
            &copy; {year} Omamori Souvenir. Hak cipta dilindungi.
          </p>
        </div>
      </div>

      {/* WhatsApp Floating Button — hidden on the quote form, where it would cover
          the form's action buttons on phones (the footer still links to WhatsApp) */}
      {currentPage !== 'request-quote' && (
        <a
          href={`https://wa.me/${(contact.whatsapp || '').replace(/\D/g, '')}`}
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