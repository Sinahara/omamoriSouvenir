'use client'

import { Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // Also catches render errors in the browser, so the copy doesn't blame the server.
  // "Ke Beranda" is a real link: a full load is what clears this error state.
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-2">
          <Gift className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="text-xl font-semibold text-ink">Terjadi Kesalahan</h1>
        <p className="text-ink-muted max-w-md mx-auto">
          Halaman gagal dimuat. Coba lagi, atau kembali ke beranda.
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <Button
            onClick={() => reset()}
            className="bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-sm tracking-wide px-6 h-10"
          >
            Coba Lagi
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-line text-ink-soft hover:text-ink hover:bg-surface text-sm font-medium rounded-sm tracking-wide px-6 h-10"
          >
            <a href="/">Ke Beranda</a>
          </Button>
        </div>
      </div>
    </div>
  )
}
