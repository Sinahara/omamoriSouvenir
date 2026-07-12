'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Plus, Pencil, Trash2, ImageIcon, Star, Upload, Loader2, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { type Product, type PricingTier, type ProductImage, CATEGORIES, formatRupiah } from '@/lib/types'
import { adminFetch } from '@/lib/admin-fetch'

const categoryOptions = CATEGORIES.filter(c => c.value !== 'all')

interface ProductFormData {
  name: string
  slug: string
  category: string
  description: string
  specs: string
  basePrice: string
  unit: string
  minQty: string
  isActive: boolean
  sortOrder: string
  pricingTiers: { minQty: string; maxQty: string; pricePerUnit: string; id?: string }[]
  images: { path: string; isPrimary: boolean; id?: string }[]
}

const emptyForm: ProductFormData = {
  name: '', slug: '', category: 'tumbler', description: '', specs: '',
  basePrice: '0', unit: 'pcs', minQty: '50', isActive: true, sortOrder: '0',
  pricingTiers: [{ minQty: '50', maxQty: '', pricePerUnit: '0' }],
  images: [],
}

function generateSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filterCategory, setFilterCategory] = useState('all')
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const searchTimer = useRef<NodeJS.Timeout>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<ProductFormData>({ ...emptyForm })
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchProducts = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (filterCategory !== 'all') params.set('category', filterCategory)
      params.set('page', String(page))
      params.set('limit', '20')
      if (search) params.set('search', search)
      const res = await adminFetch(`/api/admin/products?${params.toString()}`)
      if (res.ok) {
        const json = await res.json()
        setProducts(json.data)
        setTotalPages(json.totalPages)
      }
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }, [filterCategory, page, search])

  useEffect(() => { fetchProducts() }, [fetchProducts])

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setSearch(value)
      setPage(1)
    }, 400)
  }

  const openCreate = () => {
    setEditId(null)
    setForm({ ...emptyForm })
    setDialogOpen(true)
  }

  const openEdit = (p: Product) => {
    setEditId(p.id)
    setForm({
      name: p.name,
      slug: p.slug,
      category: p.category,
      description: p.description || '',
      specs: p.specs || '',
      basePrice: String(p.basePrice),
      unit: p.unit,
      minQty: String(p.minQty),
      isActive: p.isActive,
      sortOrder: String(p.sortOrder),
      pricingTiers: p.pricingTiers.map(t => ({ minQty: String(t.minQty), maxQty: t.maxQty ? String(t.maxQty) : '', pricePerUnit: String(t.pricePerUnit), id: t.id })),
      images: p.images.map(im => ({ path: im.path, isPrimary: im.isPrimary, id: im.id })),
    })
    setDialogOpen(true)
  }

  const updateField = (field: keyof ProductFormData, value: string | boolean) => {
    setForm(prev => {
      const next = { ...prev, [field]: value }
      if (field === 'name') next.slug = generateSlug(value as string)
      return next
    })
  }

  const addTier = () => {
    setForm(prev => ({ ...prev, pricingTiers: [...prev.pricingTiers, { minQty: '', maxQty: '', pricePerUnit: '' }] }))
  }
  const removeTier = (i: number) => {
    setForm(prev => ({ ...prev, pricingTiers: prev.pricingTiers.filter((_, idx) => idx !== i) }))
  }
  const updateTier = (i: number, field: string, value: string) => {
    setForm(prev => {
      const tiers = [...prev.pricingTiers]
      tiers[i] = { ...tiers[i], [field]: value }
      return { ...prev, pricingTiers: tiers }
    })
  }

  const addImage = () => {
    setForm(prev => ({ ...prev, images: [...prev.images, { path: '', isPrimary: prev.images.length === 0 }] }))
  }
  const removeImage = (i: number) => {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))
  }
  const updateImage = (i: number, field: string, value: string | boolean) => {
    setForm(prev => {
      const imgs = [...prev.images]
      imgs[i] = { ...imgs[i], [field]: value }
      return { ...prev, images: imgs }
    })
  }

  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null)

  const handleImageUpload = async (i: number, file: File) => {
    setUploadingIdx(i)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'products')
      const res = await adminFetch('/api/admin/upload', { method: 'POST', body: fd })
      if (!res.ok) throw new Error('Upload gagal')
      const data = await res.json()
      updateImage(i, 'path', data.path)
    } catch {
      toast({ title: 'Upload Gagal', description: 'Gagal mengupload gambar', variant: 'destructive' })
    } finally {
      setUploadingIdx(null)
    }
  }

  const handleSave = async () => {
    if (!form.name.trim()) { toast({ title: 'Error', description: 'Nama produk wajib diisi.', variant: 'destructive' }); return }
    setSaving(true)
    try {
      const body = {
        ...form,
        basePrice: Number(form.basePrice),
        minQty: Number(form.minQty),
        sortOrder: Number(form.sortOrder),
        pricingTiers: form.pricingTiers.map(t => ({
          id: t.id,
          minQty: Number(t.minQty),
          maxQty: t.maxQty ? Number(t.maxQty) : null,
          pricePerUnit: Number(t.pricePerUnit),
        })),
        images: form.images,
      }
      const url = editId ? `/api/admin/products/${editId}` : '/api/admin/products'
      const method = editId ? 'PUT' : 'POST'
      const res = await adminFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) {
        const d = await res.json()
        toast({ title: 'Error', description: d.error || 'Gagal menyimpan.', variant: 'destructive' })
        return
      }
      toast({ title: 'Berhasil', description: editId ? 'Produk diperbarui.' : 'Produk ditambahkan.' })
      setDialogOpen(false)
      fetchProducts()
    } catch {
      toast({ title: 'Error', description: 'Gagal terhubung ke server.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const res = await adminFetch(`/api/admin/products/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) { const d = await res.json(); toast({ title: 'Error', description: d.error || 'Gagal menghapus.', variant: 'destructive' }); return }
      toast({ title: 'Berhasil', description: 'Produk dihapus.' })
      fetchProducts()
    } catch {
      toast({ title: 'Error', description: 'Gagal terhubung ke server.', variant: 'destructive' })
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-[#333333]">Kelola Produk</h2>
        <div className="flex items-center gap-3">
          <Select value={filterCategory} onValueChange={v => { setFilterCategory(v); setPage(1) }}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kategori</SelectItem>
              {categoryOptions.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button onClick={openCreate} className="bg-[#00a651] hover:bg-[#008a40] text-white"><Plus className="w-4 h-4 mr-2" />Tambah Produk</Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999] pointer-events-none" />
        <Input
          placeholder="Cari produk..."
          value={searchInput}
          onChange={e => handleSearchChange(e.target.value)}
          className="pl-9 mb-3 corp-input"
        />
      </div>

      <div className="corp-card rounded-[10px] p-4 overflow-x-auto">
        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10 text-[#666666]">No</TableHead>
                <TableHead className="text-[#666666]">Nama</TableHead>
                <TableHead className="text-[#666666]">Kategori</TableHead>
                <TableHead className="text-right text-[#666666]">Harga Dasar</TableHead>
                <TableHead className="text-right text-[#666666]">Min. Qty</TableHead>
                <TableHead className="text-[#666666]">Status</TableHead>
                <TableHead className="text-right text-[#666666]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-[#999999] py-8">Tidak ada produk.</TableCell></TableRow>
              ) : products.map((p, i) => (
                <TableRow key={p.id} className="hover:bg-[#f8f8f8]">
                  <TableCell className="text-sm text-[#666666]">{i + 1}</TableCell>
                  <TableCell className="font-medium text-sm text-[#333333]">{p.name}</TableCell>
                  <TableCell><Badge variant="outline" className="border-[#e0e0e0] text-[#666666]">{CATEGORIES.find(c => c.value === p.category)?.label || p.category}</Badge></TableCell>
                  <TableCell className="text-right text-sm text-[#333333]">{formatRupiah(p.basePrice)}</TableCell>
                  <TableCell className="text-right text-sm text-[#666666]">{p.minQty}</TableCell>
                  <TableCell><Badge variant={p.isActive ? 'default' : 'secondary'}>{p.isActive ? 'Aktif' : 'Nonaktif'}</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleteId(p.id)}><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-[#999999]">Halaman {page} dari {totalPages || 1}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft className="w-4 h-4 mr-1" />Sebelumnya</Button>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Selanjutnya<ChevronRight className="w-4 h-4 ml-1" /></Button>
        </div>
      </div>

      {/* Product Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto custom-scrollbar bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#333333]">{editId ? 'Edit Produk' : 'Tambah Produk'}</DialogTitle>
            <DialogDescription className="sr-only">Form untuk {editId ? 'mengedit' : 'menambahkan'} produk</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#333333]">Nama Produk</Label>
                <Input value={form.name} onChange={e => updateField('name', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-[#333333]">Slug</Label>
                <Input value={form.slug} onChange={e => updateField('slug', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#333333]">Kategori</Label>
                <Select value={form.category} onValueChange={v => updateField('category', v)}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map(c => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[#333333]">Satuan</Label>
                <Input value={form.unit} onChange={e => updateField('unit', e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[#333333]">Deskripsi</Label>
              <Textarea rows={3} value={form.description} onChange={e => updateField('description', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-[#333333]">Spesifikasi (JSON)</Label>
              <Textarea rows={3} value={form.specs} onChange={e => updateField('specs', e.target.value)} placeholder='{"Ukuran": "20oz", "Bahan": "Stainless Steel"}' />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-[#333333]">Harga Dasar (Rp)</Label>
                <Input type="number" value={form.basePrice} onChange={e => updateField('basePrice', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-[#333333]">Min. Qty</Label>
                <Input type="number" value={form.minQty} onChange={e => updateField('minQty', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-[#333333]">Sort Order</Label>
                <Input type="number" value={form.sortOrder} onChange={e => updateField('sortOrder', e.target.value)} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.isActive} onCheckedChange={v => updateField('isActive', v)} />
              <Label className="text-[#333333]">Aktif</Label>
            </div>

            {/* Pricing Tiers */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold text-[#333333]">Pricing Tiers</Label>
                <Button variant="outline" size="sm" onClick={addTier}><Plus className="w-3 h-3 mr-1" />Tambah</Button>
              </div>
              {form.pricingTiers.map((tier, i) => (
                <div key={i} className="flex items-end gap-2">
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs text-[#666666]">Min. Qty</Label>
                    <Input type="number" placeholder="50" value={tier.minQty} onChange={e => updateTier(i, 'minQty', e.target.value)} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs text-[#666666]">Max. Qty</Label>
                    <Input type="number" placeholder="opsional" value={tier.maxQty} onChange={e => updateTier(i, 'maxQty', e.target.value)} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-xs text-[#666666]">Harga/Unit</Label>
                    <Input type="number" placeholder="0" value={tier.pricePerUnit} onChange={e => updateTier(i, 'pricePerUnit', e.target.value)} />
                  </div>
                  {form.pricingTiers.length > 1 && (
                    <Button variant="ghost" size="sm" className="text-destructive mb-0.5" onClick={() => removeTier(i)}><Trash2 className="w-4 h-4" /></Button>
                  )}
                </div>
              ))}
            </div>

            {/* Images */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold text-[#333333]">Gambar</Label>
                <Button variant="outline" size="sm" onClick={addImage}><Plus className="w-3 h-3 mr-1" />Tambah</Button>
              </div>
              {form.images.map((img, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-[#eeeeee] bg-[#fafafa]">
                  {img.path ? (
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-[#1a1a1a] shrink-0">
                      <img src={img.path} alt="" className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    </div>
                  ) : (
                    <label className="w-20 h-20 rounded-lg border-2 border-dashed border-[#d4d4d4] flex flex-col items-center justify-center cursor-pointer hover:border-[#00a651] hover:bg-[#eef7f1] transition-all shrink-0">
                      {uploadingIdx === i ? <Loader2 className="w-5 h-5 text-[#00a651] animate-spin" /> : <Upload className="w-5 h-5 text-[#cccccc]" />}
                      <span className="text-[10px] text-[#999999] mt-1">Upload</span>
                      <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(i, f); e.target.value = '' }} />
                    </label>
                  )}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    {img.path && (
                      <p className="text-xs text-[#999999] truncate font-mono">{img.path}</p>
                    )}
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer">
                        <span className="text-xs text-[#00a651] hover:underline">
                          {uploadingIdx === i ? 'Mengupload...' : img.path ? 'Ganti' : 'Pilih file'}
                        </span>
                        <input type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(i, f); e.target.value = '' }} />
                      </label>
                      <Button
                        variant={img.isPrimary ? 'default' : 'outline'}
                        size="sm"
                        className="h-7 text-[11px]"
                        onClick={() => setForm(prev => ({ ...prev, images: prev.images.map((im, idx) => ({ ...im, isPrimary: idx === i })) }))}
                      >
                        <Star className="w-3 h-3 mr-1" />Primary
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive h-7" onClick={() => removeImage(i)}><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-[#00a651] hover:bg-[#008a40] text-white">
                {saving ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null) }}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#333333]">Hapus Produk?</AlertDialogTitle>
            <AlertDialogDescription className="text-[#666666]">Tindakan ini tidak dapat dibatalkan. Produk akan dihapus secara permanen.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}