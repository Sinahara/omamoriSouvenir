import { BrandLogo } from '@/components/brand-logo'
import { Skeleton } from '@/components/ui/skeleton'

/* Placeholders shown before the client-side app is ready. The server renders
   these too, so the first paint shows the brand instead of a blank page. */

export function HeaderSkeleton() {
  return (
    <div className="corp-nav h-14">
      <div className="max-w-6xl mx-auto px-4 h-full flex items-center gap-2.5">
        <BrandLogo priority />
        <span className="font-bold text-[17px] text-ink tracking-tight">Omamori Souvenir</span>
      </div>
    </div>
  )
}

export function HeroSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 md:py-16 space-y-5" aria-hidden="true">
      <Skeleton className="h-6 w-44 mx-auto lg:mx-0" />
      <Skeleton className="h-10 w-full max-w-lg mx-auto lg:mx-0" />
      <Skeleton className="h-10 w-3/4 max-w-md mx-auto lg:mx-0" />
      <Skeleton className="h-16 w-full max-w-md mx-auto lg:mx-0" />
      <Skeleton className="h-56 md:h-72 w-full max-w-xl mx-auto" />
    </div>
  )
}

export function PageSkeleton() {
  return (
    <div className="min-h-screen bg-white" role="status" aria-label="Memuat halaman">
      <HeaderSkeleton />
      <HeroSkeleton />
    </div>
  )
}
