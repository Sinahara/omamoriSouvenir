'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import SectionHeader from '@/components/public/section-header'
import Reveal from '@/components/public/reveal'
import ProductCard, { ProductCardSkeleton } from '@/components/public/product-card'
import { useAppStore } from '@/lib/store'
import { CATEGORIES, type Product } from '@/lib/types'

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
      <Reveal>
        <SectionHeader as="h1" badge="Katalog" title="Katalog Produk" subtitle="Harga yang tertera adalah harga mulai, harga final mengikuti jumlah pesanan" />
      </Reveal>

      {/* Filters */}
      <section>
      <Reveal delay={0.1} className="space-y-4 sm:space-y-5 mb-8 md:mb-10">
        {/* Category pills: wrap onto a second row on phones so every category stays visible */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => { setCategory(cat.value); setCatalogCategory(cat.value) }}
              aria-pressed={category === cat.value}
              className={`shrink-0 rounded-sm px-4 py-1.5 pointer-coarse:min-h-11 text-[13px] tracking-wide transition-all duration-200 ${
                category === cat.value
                  ? 'bg-primary text-white'
                  : 'bg-white border border-line-strong text-ink-muted hover:text-ink hover:border-line-hover'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search + Sort row */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
            <Input
              placeholder="Cari produk..."
              aria-label="Cari produk"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(sortLabels) as SortOption[]).map((s) => (
              <Button
                key={s}
                variant={sort === s ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSort(s)}
                aria-pressed={sort === s}
                className={`shrink-0 px-2.5 sm:px-3 text-[13px] tracking-wide ${
                  sort === s
                    ? 'bg-primary hover:bg-primary-hover text-white'
                    : 'border-line-strong text-ink-muted hover:text-ink hover:bg-surface'
                }`}
              >
                {sortLabels[s]}
              </Button>
            ))}
          </div>
        </div>
      </Reveal>
      </section>

      {/* Product count */}
      {!loading && (
        <p className="text-[13px] text-ink-muted tracking-wide mb-6">
          Menampilkan {products.length} produk
        </p>
      )}

      {/* Product Grid */}
      <section>
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 md:gap-6">
          {[...Array(6)].map((_, i) => <ProductCardSkeleton key={i} />)}
        </div>
      ) : products.length === 0 ? (
        <Reveal className="text-center py-16 md:py-24">
          <SlidersHorizontal className="w-10 h-10 text-ink-faint mx-auto mb-4" />
          <h3 className="text-lg font-medium text-ink mb-1">Tidak ada produk ditemukan</h3>
          <p className="text-ink-soft text-sm mb-6">
            Coba ubah filter atau kata kunci pencarian Anda
          </p>
          <Button
            variant="outline"
            className="border-line-hover text-ink-soft hover:text-ink hover:bg-surface rounded-sm tracking-wide text-sm"
            onClick={() => {
              setCategory('all')
              setCatalogCategory('all')
              setSearch('')
              setSort('terbaru')
            }}
          >
            Reset Filter
          </Button>
        </Reveal>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 md:gap-6">
          {products.map((product, i) => (
            <Reveal key={product.id} delay={(i % 3) * 0.08}>
              <ProductCard product={product} onSelect={selectProduct} showMinQty />
            </Reveal>
          ))}
        </div>
      )}
      </section>
    </div>
  )
}