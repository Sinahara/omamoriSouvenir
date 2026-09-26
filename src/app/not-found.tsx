'use client'

import { Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  // This page renders outside the SPA shell, so a real link (full load) is the way home
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
          <Gift className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-xl font-semibold text-ink">Halaman Tidak Ditemukan</h2>
        <p className="text-ink-muted max-w-md mx-auto">
          Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.
        </p>
        <Button
          asChild
          className="mt-4 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-sm tracking-wide transition-colors px-6 h-10"
        >
          <a href="/">Kembali ke Beranda</a>
        </Button>
      </div>
    </div>
  )
}
