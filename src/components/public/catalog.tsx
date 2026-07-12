'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Search, Package, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useAppStore } from '@/lib/store'
import { CATEGORIES, formatRupiah, type Product } from '@/lib/types'

type SortOption = 'terbaru' | 'harga_rendah' | 'harga_tinggi'

export default function Catalog() {
  const { selectProduct, catalogCategory, setCatalogCategory } = useAppStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState(catalogCategory)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sort, setSort] = useState<SortOption>('terbaru')
  const debounceTimer = useRef<NodeJS.Timeout | undefined>(undefined)
  const [imgErrors, setImgErrors] = useState<Set<string>>(new Set())

  const handleImgError = (src: string) => {
    setImgErrors(prev => new Set(prev).add(src))
  }

  // Debounce search input
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => setDebouncedSearch(search), 400)
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current) }
  }, [search])

  // Sync category from store when catalog mounts
  useEffect(() => {
    setCategory(catalogCategory)
    setSearch('')
    setDebouncedSearch('')
    setSort('terbaru')
  }, [catalogCategory])

  const fetchProducts = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (category !== 'all') params.set('category', category)
      if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim())
      const res = await fetch(`/api/catalog?${params.toString()}`)
      const data = await res.json()
      let items: Product[] = Array.isArray(data) ? data : (data?.products || [])
      if (sort === 'harga_rendah') items.sort((a, b) => a.basePrice - b.basePrice)
      if (sort === 'harga_tinggi') items.sort((a, b) => b.basePrice - a.basePrice)
      setProducts(items)
    } catch {
      setProducts([])
    } finally {
      setLoading(false)
    }
  }, [category, debouncedSearch, sort])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const sortLabels: Record<SortOption, string> = {
    terbaru: 'Terbaru',
    harga_rendah: 'Harga Terendah',
    harga_tinggi: 'Harga Tertinggi',
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
      {/* Header */}
      <section>
        <div className="text-center mb-10">
        <span className="inline-block text-[11px] font-semibold tracking-[0.15em] uppercase text-[#00a651] border border-[#00a651]/20 px-4 py-1 rounded-sm mb-4">Katalog</span>
        <h2 className="text-2xl md:text-3xl font-bold text-[#333333] tracking-tight">Katalog Produk</h2>
        <p className="text-[#999999] mt-3">Temukan corporate gift yang tepat untuk bisnis Anda</p>
      </div>
      </section>

      {/* Filters */}
      <section>
      <div className="space-y-5 mb-10">
        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => { setCategory(cat.value); setCatalogCategory(cat.value) }}
              className={`shrink-0 px-4 py-1.5 text-[13px] tracking-wide transition-all duration-300 ${
                category === cat.value
                  ? 'bg-[#00a651] text-white'
                  : 'bg-white border border-[#e0e0e0] text-[#999999] hover:text-[#333333] hover:border-[#cccccc]'
              }`}
              style={{ borderRadius: '2px' }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search + Sort row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#aaaaaa]" />
            <Input
              placeholder="Cari produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="corp-input pl-10 h-10"
            />
          </div>
          <div className="flex gap-2">
            {(Object.keys(sortLabels) as SortOption[]).map((s) => (
              <Button
                key={s}
                variant={sort === s ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSort(s)}
                className={`shrink-0 text-[13px] tracking-wide ${
                  sort === s
                    ? 'bg-[#00a651] hover:bg-[#008a40] text-white'
                    : 'border-[#e0e0e0] text-[#999999] hover:text-[#333333] hover:bg-[#fafafa]'
                }`}
                style={{ borderRadius: '2px' }}
              >
                {sortLabels[s]}
              </Button>
            ))}
          </div>
        </div>
      </div>
      </section>

      {/* Product count */}
      {!loading && (
        <p className="text-[13px] text-[#aaaaaa] tracking-wide mb-6">
          Menampilkan {products.length} produk
        </p>
      )}

      {/* Product Grid */}
      <section>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="corp-card overflow-hidden">
              <Skeleton className="h-48 w-full" />
              <div className="p-5 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24">
          <SlidersHorizontal className="w-10 h-10 text-[#e0e0e0] mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[#333333] mb-1">Tidak ada produk ditemukan</h3>
          <p className="text-[#999999] text-sm mb-6">
            Coba ubah filter atau kata kunci pencarian Anda
          </p>
          <Button
            variant="outline"
            className="border-[#d4d4d4] text-[#666666] hover:text-[#333333] hover:bg-[#fafafa] rounded-[4px] tracking-wide text-sm"
            onClick={() => {
              setCategory('all')
              setCatalogCategory('all')
              setSearch('')
              setSort('terbaru')
            }}
          >
            Reset Filter
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <motion.button
              key={product.id}
              onClick={() => selectProduct(product.slug)}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="corp-card overflow-hidden text-left cursor-pointer group"
            >
              <div className="p-3 pb-0">
                <div className="h-44 bg-[#1a1a1a] rounded-2xl flex items-center justify-center relative overflow-hidden">
                  {product.images?.[0]?.path && !imgErrors.has(product.images[0].path) ? (
                    <img
                      src={product.images[0].path}
                      alt={product.name}
                      loading="lazy"
                      decoding="async"
                      onError={() => handleImgError(product.images[0].path)}
                      className="w-full h-full object-cover rounded-2xl group-hover:scale-[1.03] transition-transform duration-700"
                    />
                  ) : (
                    <Package className="w-16 h-16 text-[#cccccc] group-hover:text-[#aaaaaa] transition-colors" />
                  )}
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="text-[10px] tracking-wide bg-white/80 text-[#666666] rounded-sm">
                      {CATEGORIES.find(c => c.value === product.category)?.label || product.category}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="px-5 pb-5 pt-4 space-y-2">
                <h3 className="font-semibold text-[#333333] line-clamp-2 group-hover:text-[#00a651] transition-colors text-[15px]">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-[#00a651] font-semibold">
                    Mulai dari {formatRupiah(product.basePrice)}
                  </p>
                  <span className="text-xs text-[#aaaaaa]">
                    Min. {product.minQty} {product.unit}
                  </span>
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      )}
      </section>
    </div>
  )
}