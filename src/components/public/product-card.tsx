'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Package } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { CATEGORIES, formatRupiah, type Product } from '@/lib/types'

interface ProductCardProps {
  product: Product
  onSelect: (slug: string) => void
  /** Katalog shows the minimum order next to the price */
  showMinQty?: boolean
}

/* ── Product Card ───────────────────────────────
   Shared by Beranda (Produk Unggulan) and Katalog. The photo frame is square like
   the product photos, so object-cover shows the whole product instead of cutting
   off its top and bottom. Compact padding keeps two columns readable on phones. */
export default function ProductCard({ product, onSelect, showMinQty = false }: ProductCardProps) {
  const [imgError, setImgError] = useState(false)
  const image = product.images?.[0]?.path
  const category = CATEGORIES.find(c => c.value === product.category)?.label || product.category

  return (
    <motion.button
      onClick={() => onSelect(product.slug)}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="corp-card overflow-hidden h-full w-full text-left cursor-pointer group flex flex-col"
    >
      <div className="p-2 pb-0 sm:p-3 sm:pb-0">
        <div className="aspect-square bg-media rounded-xl sm:rounded-2xl flex items-center justify-center relative overflow-hidden">
          {image && !imgError ? (
            <img
              src={image}
              alt={product.name}
              loading="lazy"
              decoding="async"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover rounded-xl sm:rounded-2xl group-hover:scale-[1.03] transition-transform duration-700"
            />
          ) : (
            <Package className="w-10 h-10 sm:w-16 sm:h-16 text-ink-faint group-hover:text-ink-muted transition-colors" />
          )}
          <div className="absolute top-2 left-2 right-2 sm:top-3 sm:left-3 sm:right-3">
            <Badge variant="secondary" className="max-w-full truncate text-[10px] tracking-wide bg-white/80 text-ink-soft rounded-sm">
              {category}
            </Badge>
          </div>
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-2 px-3 pb-3 pt-3 sm:px-5 sm:pb-5 sm:pt-4">
        <h3 className="font-semibold text-ink line-clamp-2 wrap-break-word group-hover:text-primary transition-colors text-sm sm:text-[15px]">
          {product.name}
        </h3>
        {/* wraps instead of colliding when the price or unit is long */}
        <div className="mt-auto flex flex-wrap items-end justify-between gap-x-3 gap-y-1">
          <p className="text-sm sm:text-[15px] text-primary font-semibold leading-snug">
            <span className="block text-xs font-normal text-ink-muted">Mulai dari</span>
            {formatRupiah(product.basePrice)}
          </p>
          {showMinQty && (
            <span className="text-xs text-ink-muted">
              Min. {product.minQty} {product.unit}
            </span>
          )}
        </div>
      </div>
    </motion.button>
  )
}

export function ProductCardSkeleton() {
  return (
    <div className="corp-card overflow-hidden p-2 sm:p-3">
      <Skeleton className="aspect-square w-full rounded-xl sm:rounded-2xl" />
      <div className="px-1 pt-3 pb-1 sm:px-2 sm:pt-4 space-y-2 sm:space-y-3">
        <Skeleton className="h-4 sm:h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  )
}
