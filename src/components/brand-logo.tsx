import Image from 'next/image'
import { cn } from '@/lib/utils'

/**
 * logo.png is 520×680 (≈400 KB) but only ever shown about 28–44 px tall.
 * next/image serves a resized copy of the same file (a few KB).
 */
export function BrandLogo({ className, priority = false }: { className?: string; priority?: boolean }) {
  return (
    <Image
      src="/logo.png"
      alt="Omamori Souvenir"
      width={520}
      height={680}
      sizes="40px"
      priority={priority}
      className={cn('h-7 w-auto object-contain', className)}
    />
  )
}
