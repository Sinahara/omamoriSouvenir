'use client'

import { Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore } from '@/lib/store'

export default function Error({
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const navigate = useAppStore((s) => s.navigate)

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-2">
          <Gift className="w-8 h-8 text-red-400" />
        </div>
        <h1 className="text-5xl font-bold text-[#333333]">500</h1>
        <h2 className="text-xl font-semibold text-[#333333]">Terjadi Kesalahan Server</h2>
        <p className="text-[#999999] max-w-md mx-auto">
          Maaf, sedang terjadi masalah pada server. Silakan coba lagi nanti.
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <Button
            onClick={() => reset()}
            className="bg-[#00a651] hover:bg-[#008a40] text-white text-sm font-medium rounded-[4px] tracking-wide px-6 h-10"
          >
            Coba Lagi
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('landing')}
            className="border-[#eeeeee] text-[#666666] hover:text-[#333333] hover:bg-[#fafafa] text-sm font-medium rounded-[4px] tracking-wide px-6 h-10"
          >
            Ke Beranda
          </Button>
        </div>
      </div>
    </div>
  )
}