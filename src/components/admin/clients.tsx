'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
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
import { type Client } from '@/lib/types'
import { adminFetch } from '@/lib/admin-fetch'

interface ClientFormData {
  companyName: string
  npwp: string
  alamat: string
  kota: string
  picName: string
  picTitle: string
  whatsapp: string
  email: string
  notes: string
}

const emptyForm: ClientFormData = {
  companyName: '', npwp: '', alamat: '', kota: '', picName: '', picTitle: '', whatsapp: '', email: '', notes: '',
}

export default function AdminClients() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const searchTimer = useRef<NodeJS.Timeout>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<ClientFormData>({ ...emptyForm })
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchClients = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', '20')
      if (search) params.set('search', search)
      const res = await adminFetch(`/api/admin/clients?${params.toString()}`)
      if (res.ok) {
        const json = await res.json()
        setClients(json.data)
        setTotalPages(json.totalPages)
      }
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { fetchClients() }, [fetchClients])

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setSearch(value)
      setPage(1)
    }, 400)
  }

  const updateField = (field: keyof ClientFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const openCreate = () => {
    setEditId(null)
    setForm({ ...emptyForm })
    setDialogOpen(true)
  }

  const openEdit = (c: Client) => {
    setEditId(c.id)
    setForm({
      companyName: c.companyName,
      npwp: c.npwp || '',
      alamat: c.alamat || '',
      kota: c.kota || '',
      picName: c.picName,
      picTitle: c.picTitle || '',
      whatsapp: c.whatsapp,
      email: c.email,
      notes: c.notes || '',
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.companyName.trim() || !form.picName.trim()) {
      toast({ title: 'Error', description: 'Nama perusahaan dan PIC wajib diisi.', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const url = editId ? `/api/admin/clients/${editId}` : '/api/admin/clients'
      const method = editId ? 'PUT' : 'POST'
      const res = await adminFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      if (!res.ok) { const d = await res.json(); toast({ title: 'Error', description: d.error || 'Gagal menyimpan.', variant: 'destructive' }); return }
      toast({ title: 'Berhasil', description: editId ? 'Klien diperbarui.' : 'Klien ditambahkan.' })
      setDialogOpen(false)
      fetchClients()
    } catch {
      toast({ title: 'Error', description: 'Gagal terhubung ke server.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const res = await adminFetch(`/api/admin/clients/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) { const d = await res.json(); toast({ title: 'Error', description: d.error || 'Gagal menghapus.', variant: 'destructive' }); return }
      toast({ title: 'Berhasil', description: 'Klien dihapus.' })
      fetchClients()
    } catch {
      toast({ title: 'Error', description: 'Gagal terhubung ke server.', variant: 'destructive' })
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-[#333333]">Client Management (CRM)</h2>
        <Button onClick={openCreate} className="bg-[#00a651] hover:bg-[#008a40] text-white"><Plus className="w-4 h-4 mr-2" />Tambah Klien</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999] pointer-events-none" />
        <Input
          placeholder="Cari perusahaan atau PIC..."
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
                <TableHead className="text-[#666666]">Perusahaan</TableHead>
                <TableHead className="text-[#666666]">PIC</TableHead>
                <TableHead className="text-[#666666]">WhatsApp</TableHead>
                <TableHead className="text-[#666666]">Kota</TableHead>
                <TableHead className="text-right text-[#666666]">Transaksi</TableHead>
                <TableHead className="text-right text-[#666666]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center text-[#999999] py-8">Tidak ada klien.</TableCell></TableRow>
              ) : clients.map((c, i) => (
                <TableRow key={c.id} className="hover:bg-[#f8f8f8]">
                  <TableCell className="text-sm text-[#666666]">{i + 1}</TableCell>
                  <TableCell className="font-medium text-sm text-[#333333]">{c.companyName}</TableCell>
                  <TableCell className="text-sm text-[#666666]">{c.picName}{c.picTitle ? ` (${c.picTitle})` : ''}</TableCell>
                  <TableCell className="text-sm text-[#666666]">{c.whatsapp}</TableCell>
                  <TableCell className="text-sm text-[#666666]">{c.kota || '-'}</TableCell>
                  <TableCell className="text-right text-sm text-[#333333]">{c._count ? (c._count.quotes + c._count.orders) : 0}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(c)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleteId(c.id)}><Trash2 className="w-4 h-4" /></Button>
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

      {/* Client Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#333333]">{editId ? 'Edit Klien' : 'Tambah Klien'}</DialogTitle>
            <DialogDescription className="sr-only">Form untuk {editId ? 'mengedit' : 'menambahkan'} data klien</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[#333333]">Nama Perusahaan *</Label>
              <Input value={form.companyName} onChange={e => updateField('companyName', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-[#333333]">NPWP</Label>
              <Input value={form.npwp} onChange={e => updateField('npwp', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-[#333333]">Alamat</Label>
              <Textarea rows={2} value={form.alamat} onChange={e => updateField('alamat', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#333333]">Kota</Label>
                <Input value={form.kota} onChange={e => updateField('kota', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-[#333333]">Jabatan PIC</Label>
                <Input value={form.picTitle} onChange={e => updateField('picTitle', e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[#333333]">Nama PIC *</Label>
              <Input value={form.picName} onChange={e => updateField('picName', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[#333333]">WhatsApp</Label>
                <Input value={form.whatsapp} onChange={e => updateField('whatsapp', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-[#333333]">Email</Label>
                <Input type="email" value={form.email} onChange={e => updateField('email', e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[#333333]">Catatan</Label>
              <Textarea rows={2} value={form.notes} onChange={e => updateField('notes', e.target.value)} />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
              <Button onClick={handleSave} disabled={saving} className="bg-[#00a651] hover:bg-[#008a40] text-white">{saving ? 'Menyimpan...' : 'Simpan'}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null) }}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#333333]">Hapus Klien?</AlertDialogTitle>
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