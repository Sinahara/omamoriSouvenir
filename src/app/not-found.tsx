'use client'

import { Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'

export default function NotFound() {
  const navigate = useAppStore((s) => s.navigate)

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-xl bg-[#00a651]/10 flex items-center justify-center mx-auto mb-2">
          <Gift className="w-8 h-8 text-[#00a651]" />
        </div>
        <h1 className="text-6xl font-bold text-[#00a651]">404</h1>
        <h2 className="text-xl font-semibold text-[#333333]">Halaman Tidak Ditemukan</h2>
        <p className="text-[#999999] max-w-md mx-auto">
          Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.
        </p>
        <Button
          onClick={() => navigate('landing')}
          className="mt-4 bg-[#00a651] hover:bg-[#008a40] text-white text-sm font-medium rounded-[4px] tracking-wide transition-colors px-6 h-10"
        >
          Kembali ke Beranda
        </Button>
      </div>
    </div>
  )
}