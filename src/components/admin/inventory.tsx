'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Plus, Pencil, Trash2, History, ArrowDownCircle, ArrowUpCircle, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
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
import { type InventoryItem, type InventoryTransaction, formatDateTime } from '@/lib/types'
import { adminFetch } from '@/lib/admin-fetch'

interface InventoryFormData {
  name: string
  category: string
  unit: string
  minimumStock: string
  notes: string
}

const emptyForm: InventoryFormData = { name: '', category: '', unit: 'pcs', minimumStock: '10', notes: '' }

interface TransactionFormData {
  type: string
  qty: string
  refNumber: string
  notes: string
}

const emptyTxForm: TransactionFormData = { type: 'stock_in', qty: '', refNumber: '', notes: '' }

export default function AdminInventory() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const searchTimer = useRef<NodeJS.Timeout>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<InventoryFormData>({ ...emptyForm })
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Transaction dialog
  const [txDialogOpen, setTxDialogOpen] = useState(false)
  const [txItemId, setTxItemId] = useState<string | null>(null)
  const [txForm, setTxForm] = useState<TransactionFormData>({ ...emptyTxForm })
  const [txSaving, setTxSaving] = useState(false)

  // History dialog
  const [historyOpen, setHistoryOpen] = useState(false)
  const [historyItem, setHistoryItem] = useState<InventoryItem | null>(null)

  const { toast } = useToast()

  const fetchItems = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', '20')
      if (search) params.set('search', search)
      const res = await adminFetch(`/api/admin/inventory?${params.toString()}`)
      if (res.ok) {
        const json = await res.json()
        setItems(json.data)
        setTotalPages(json.totalPages)
      }
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { fetchItems() }, [fetchItems])

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setSearch(value)
      setPage(1)
    }, 400)
  }

  const updateField = (field: keyof InventoryFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const openCreate = () => {
    setEditId(null)
    setForm({ ...emptyForm })
    setDialogOpen(true)
  }

  const openEdit = (item: InventoryItem) => {
    setEditId(item.id)
    setForm({
      name: item.name,
      category: item.category,
      unit: item.unit,
      minimumStock: String(item.minimumStock),
      notes: item.notes || '',
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) { toast({ title: 'Error', description: 'Nama item wajib diisi.', variant: 'destructive' }); return }
    setSaving(true)
    try {
      const body = { ...form, minimumStock: Number(form.minimumStock) }
      const url = editId ? `/api/admin/inventory/${editId}` : '/api/admin/inventory'
      const method = editId ? 'PUT' : 'POST'
      const res = await adminFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { const d = await res.json(); toast({ title: 'Error', description: d.error || 'Gagal menyimpan.', variant: 'destructive' }); return }
      toast({ title: 'Berhasil', description: editId ? 'Item diperbarui.' : 'Item ditambahkan.' })
      setDialogOpen(false)
      fetchItems()
    } catch {
      toast({ title: 'Error', description: 'Gagal terhubung ke server.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const res = await adminFetch(`/api/admin/inventory/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) { const d = await res.json(); toast({ title: 'Error', description: d.error || 'Gagal menghapus.', variant: 'destructive' }); return }
      toast({ title: 'Berhasil', description: 'Item dihapus.' })
      fetchItems()
    } catch {
      toast({ title: 'Error', description: 'Gagal terhubung ke server.', variant: 'destructive' })
    } finally {
      setDeleteId(null)
    }
  }

  const openTxDialog = (itemId: string) => {
    setTxItemId(itemId)
    setTxForm({ ...emptyTxForm })
    setTxDialogOpen(true)
  }

  const handleTxSave = async () => {
    if (!txItemId || !txForm.qty) { toast({ title: 'Error', description: 'Jumlah wajib diisi.', variant: 'destructive' }); return }
    setTxSaving(true)
    try {
      const res = await adminFetch('/api/admin/inventory/transaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: txItemId, type: txForm.type, qty: Number(txForm.qty), refNumber: txForm.refNumber || null, notes: txForm.notes || null }),
      })
      if (!res.ok) { const d = await res.json(); toast({ title: 'Error', description: d.error || 'Gagal.', variant: 'destructive' }); return }
      toast({ title: 'Berhasil', description: 'Transaksi stok dicatat.' })
      setTxDialogOpen(false)
      fetchItems()
    } catch {
      toast({ title: 'Error', description: 'Gagal terhubung ke server.', variant: 'destructive' })
    } finally {
      setTxSaving(false)
    }
  }

  const openHistory = async (item: InventoryItem) => {
    try {
      const res = await adminFetch(`/api/admin/inventory/${item.id}`)
      if (res.ok) {
        const data = await res.json()
        setHistoryItem(data)
      }
    } catch { /* ignore */ }
    setHistoryOpen(true)
  }

  const getStockStatus = (item: InventoryItem) => {
    if (item.currentStock === 0) return { label: 'Habis', variant: 'destructive' as const }
    if (item.currentStock <= item.minimumStock) return { label: 'Rendah', variant: 'secondary' as const }
    return { label: 'OK', variant: 'default' as const }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-[#333333]">Inventaris Bahan Baku</h2>
        <Button onClick={openCreate} className="bg-[#00a651] hover:bg-[#008a40] text-white"><Plus className="w-4 h-4 mr-2" />Tambah Item</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999] pointer-events-none" />
        <Input
          placeholder="Cari nama atau kategori..."
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
                <TableHead className="text-right text-[#666666]">Stok Saat Ini</TableHead>
                <TableHead className="text-right text-[#666666]">Min. Stok</TableHead>
                <TableHead className="text-[#666666]">Satuan</TableHead>
                <TableHead className="text-[#666666]">Status</TableHead>
                <TableHead className="text-right text-[#666666]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center text-[#999999] py-8">Tidak ada item inventaris.</TableCell></TableRow>
              ) : items.map((item, i) => {
                const status = getStockStatus(item)
                const isLow = item.currentStock <= item.minimumStock
                return (
                  <TableRow key={item.id} className={`${isLow ? 'bg-amber-50' : 'hover:bg-[#f8f8f8]'}`}>
                    <TableCell className="text-sm text-[#666666]">{i + 1}</TableCell>
                    <TableCell className="font-medium text-sm text-[#333333]">{item.name}</TableCell>
                    <TableCell className="text-sm text-[#666666]">{item.category || '-'}</TableCell>
                    <TableCell className={`text-right text-sm font-medium ${isLow ? 'text-amber-700' : 'text-[#333333]'}`}>{item.currentStock}</TableCell>
                    <TableCell className="text-right text-sm text-[#666666]">{item.minimumStock}</TableCell>
                    <TableCell className="text-sm text-[#666666]">{item.unit}</TableCell>
                    <TableCell><Badge variant={status.variant}>{status.label}</Badge></TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openTxDialog(item.id)} title="Catat Stok">
                          {item.currentStock <= item.minimumStock ? <ArrowDownCircle className="w-4 h-4 text-green-600" /> : <ArrowUpCircle className="w-4 h-4 text-amber-600" />}
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => openHistory(item)} title="Riwayat"><History className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(item)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleteId(item.id)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
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

      {/* Item Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#333333]">{editId ? 'Edit Item' : 'Tambah Item'}</DialogTitle>
            <DialogDescription className="sr-only">Form untuk {editId ? 'mengedit' : 'menambahkan'} item inventaris</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[#333333]">Nama *</Label>
              <Input value={form.name} onChange={e => updateField('name', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-[#333333]">Kategori</Label>
              <Input value={form.category} onChange={e => updateField('category', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#333333]">Satuan</Label>
                <Input value={form.unit} onChange={e => updateField('unit', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-[#333333]">Min. Stok</Label>
                <Input type="number" value={form.minimumStock} onChange={e => updateField('minimumStock', e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[#333333]">Catatan</Label>
              <Textarea rows={2} value={form.notes} onChange={e => updateField('notes', e.target.value)} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-[#00a651] hover:bg-[#008a40] text-white">{saving ? 'Menyimpan...' : 'Simpan'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Transaction Dialog */}
      <Dialog open={txDialogOpen} onOpenChange={setTxDialogOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#333333]">Catat Stok</DialogTitle>
            <DialogDescription className="sr-only">Form pencatatan transaksi stok masuk atau keluar</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[#333333]">Tipe</Label>
              <Select value={txForm.type} onValueChange={v => setTxForm(prev => ({ ...prev, type: v }))}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="stock_in">Masuk (Stock In)</SelectItem>
                  <SelectItem value="stock_out">Keluar (Stock Out)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[#333333]">Jumlah *</Label>
              <Input type="number" value={txForm.qty} onChange={e => setTxForm(prev => ({ ...prev, qty: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label className="text-[#333333]">No. Referensi</Label>
              <Input value={txForm.refNumber} onChange={e => setTxForm(prev => ({ ...prev, refNumber: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label className="text-[#333333]">Catatan</Label>
              <Textarea rows={2} value={txForm.notes} onChange={e => setTxForm(prev => ({ ...prev, notes: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setTxDialogOpen(false)}>Batal</Button>
              <Button onClick={handleTxSave} disabled={txSaving} className="bg-[#00a651] hover:bg-[#008a40] text-white">{txSaving ? 'Menyimpan...' : 'Simpan'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* History Dialog */}
      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-lg bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#333333]">Riwayat Stok — {historyItem?.name}</DialogTitle>
            <DialogDescription className="sr-only">Riwayat transaksi stok untuk {historyItem?.name}</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-96">
            {historyItem?.transactions?.length ? (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[#666666]">Tipe</TableHead>
                    <TableHead className="text-right text-[#666666]">Qty</TableHead>
                    <TableHead className="text-[#666666]">Ref</TableHead>
                    <TableHead className="text-[#666666]">Tanggal</TableHead>
                    <TableHead className="text-[#666666]">Catatan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {historyItem.transactions.map((tx) => (
                    <TableRow key={tx.id} className="hover:bg-[#f8f8f8]">
                      <TableCell>
                        <Badge variant={tx.type === 'stock_in' ? 'default' : 'secondary'}>
                          {tx.type === 'stock_in' ? 'Masuk' : 'Keluar'}
                        </Badge>
                      </TableCell>
                      <TableCell className={`text-right font-medium ${tx.type === 'stock_in' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === 'stock_in' ? '+' : '-'}{tx.qty}
                      </TableCell>
                      <TableCell className="text-sm text-[#666666]">{tx.refNumber || '-'}</TableCell>
                      <TableCell className="text-sm text-[#999999]">{formatDateTime(tx.createdAt)}</TableCell>
                      <TableCell className="text-sm text-[#666666]">{tx.notes || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-center text-[#999999] py-8">Tidak ada riwayat transaksi.</p>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null) }}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#333333]">Hapus Item?</AlertDialogTitle>
            <AlertDialogDescription className="text-[#666666]">Tindakan ini tidak dapat dibatalkan.</AlertDialogDescription>
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