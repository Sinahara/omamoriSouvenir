'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'

const PAGE_SEO: Record<string, { title: string; description: string }> = {
  landing: {
    title: 'Omamori Souvenir — Jasa Pembuatan Corporate Gift & Employee Onboarding Kit Premium | Surabaya',
    description: 'Omamori Souvenir adalah penyedia corporate gift, souvenir perusahaan, dan employee onboarding kit premium di Surabaya. Tumbler custom, plakat penghargaan, lanyard, hardbox, goodie bag, starter kit — zero inventory, mockup AI, dokumen lengkap.',
  },
  catalog: {
    title: 'Katalog Produk Corporate Gift & Souvenir Perusahaan | Omamori Souvenir',
    description: 'Jelajahi katalog produk corporate gift premium: tumbler custom, plakat akrilik & kayu, lanyard printing, hardbox, goodie bag kanvas, dan starter kit onboarding karyawan. Harga bersaing, melayani seluruh Indonesia.',
  },
  'product-detail': {
    title: 'Detail Produk Corporate Gift | Omamori Souvenir',
    description: 'Lihat detail spesifikasi, harga, dan paket produk corporate gift premium. Tersedia pricing tier untuk quantity besar. Minta penawaran sekarang!',
  },
  'request-quote': {
    title: 'Minta Penawaran Corporate Gift & Souvenir Perusahaan | Omamori Souvenir',
    description: 'Ajukan permintaan penawaran (RFQ) corporate gift, souvenir perusahaan, dan employee onboarding kit. Respon cepat 1x24 jam, mockup gratis, dokumen lengkap.',
  },
  track: {
    title: 'Lacak Pesanan Corporate Gift | Omamori Souvenir',
    description: 'Lacak status pesanan corporate gift dan souvenir perusahaan Anda secara real-time. Monitor proses produksi hingga pengiriman.',
  },
}

function setMeta(name: string, content: string) {
  let el = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setOgProperty(property: string, content: string) {
  let el = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('property', property)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

export function useSeo() {
  const { currentPage } = useAppStore()

  useEffect(() => {
    const seo = PAGE_SEO[currentPage] || PAGE_SEO.landing
    const siteName = 'Omamori Souvenir'

    // Update document title (no suffix — layout template handles it)
    document.title = seo.title

    // Update meta description
    setMeta('description', seo.description)

    // Update Open Graph
    setOgProperty('og:title', seo.title)
    setOgProperty('og:description', seo.description)
    setOgProperty('og:type', currentPage === 'landing' ? 'website' : 'article')
    setOgProperty('og:locale', 'id_ID')

    // Update Twitter Card
    setMeta('twitter:title', seo.title)
    setMeta('twitter:description', seo.description)
  }, [currentPage])
}