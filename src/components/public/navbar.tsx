'use client'

import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet'
import { useAppStore } from '@/lib/store'
import { useState } from 'react'

const navLinks = [
  { label: 'Beranda', page: 'landing' as const },
  { label: 'Tentang Kami', page: 'about' as const },
  { label: 'Katalog', page: 'catalog' as const },
  { label: 'Lacak Pesanan', page: 'track' as const },
]

export default function Navbar() {
  const { currentPage, navigate } = useAppStore()
  const [open, setOpen] = useState(false)
  // Product pages belong to the catalog section
  const activePage = currentPage === 'product-detail' ? 'catalog' : currentPage

  const handleNav = (page: 'landing' | 'about' | 'catalog' | 'track') => {
    navigate(page)
    setOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 corp-nav">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        {/* Logo */}
        <button
          onClick={() => handleNav('landing')}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity duration-200"
        >
          <img src="/logo.png" alt="Omamori Souvenir" className="h-7 w-auto object-contain" />
          <span className="font-bold text-[17px] text-ink tracking-tight">Omamori Souvenir</span>
        </button>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1" role="navigation">
          {navLinks.map((link) => (
            <button
              key={link.page}
              onClick={() => handleNav(link.page)}
              aria-current={activePage === link.page ? 'page' : undefined}
              className={`px-3.5 py-1.5 rounded-sm text-[13px] font-medium tracking-wide transition-all duration-200 ${
                activePage === link.page
                  ? 'text-primary bg-primary-soft'
                  : 'text-ink-muted hover:text-ink hover:bg-surface'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => navigate('request-quote')}
            aria-current={currentPage === 'request-quote' ? 'page' : undefined}
            className="bg-primary hover:bg-primary-hover text-white rounded-sm text-[13px] tracking-wide h-8 px-4"
          >
            Minta Penawaran
          </Button>
        </div>

        {/* Mobile Hamburger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden text-ink">
              <Menu className="w-5 h-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 bg-white p-0 border-l border-line">
            <SheetTitle className="sr-only">Menu Navigasi</SheetTitle>
            <div className="flex flex-col h-full">
              <div className="flex items-center gap-2.5 px-6 pt-6 pb-5 border-b border-line">
                <img src="/logo.png" alt="Omamori Souvenir" className="h-7 w-auto object-contain" />
                <span className="font-bold text-[17px] text-ink tracking-tight">Omamori Souvenir</span>
              </div>
              <nav className="flex-1 px-4 py-4 flex flex-col gap-0.5" role="navigation">
                {navLinks.map((link) => (
                  <button
                    key={link.page}
                    onClick={() => handleNav(link.page)}
                    aria-current={activePage === link.page ? 'page' : undefined}
                    className={`min-h-11 px-4 py-2.5 rounded-sm text-[13px] font-medium tracking-wide text-left transition-all duration-200 ${
                      activePage === link.page
                        ? 'text-primary bg-primary-soft'
                        : 'text-ink-muted hover:text-ink hover:bg-surface'
                    }`}
                  >
                    {link.label}
                  </button>
                ))}
              </nav>
              <div className="px-4 pb-6 flex flex-col gap-2 border-t border-line pt-4">
                <Button
                  className="w-full bg-primary hover:bg-primary-hover text-white rounded-sm text-[13px] tracking-wide"
                  onClick={() => {
                    navigate('request-quote')
                    setOpen(false)
                  }}
                >
                  Minta Penawaran
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}