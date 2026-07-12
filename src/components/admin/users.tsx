'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
import { useAppStore } from '@/lib/store'
import { adminFetch } from '@/lib/admin-fetch'

interface UserRecord {
  id: string
  name: string
  email: string
  role: string
}

interface UserFormData {
  name: string
  email: string
  password: string
  role: string
}

const emptyForm: UserFormData = { name: '', email: '', password: '', role: 'staff' }

export default function AdminUsers() {
  const { adminUser } = useAppStore()
  const [users, setUsers] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const searchTimer = useRef<NodeJS.Timeout>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState<UserFormData>({ ...emptyForm })
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      params.set('page', String(page))
      params.set('limit', '20')
      if (search) params.set('search', search)
      const res = await adminFetch(`/api/admin/users?${params.toString()}`)
      if (res.ok) {
        const json = await res.json()
        setUsers(json.data)
        setTotalPages(json.totalPages)
      }
    } catch { /* ignore */ } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setSearch(value)
      setPage(1)
    }, 400)
  }

  const updateField = (field: keyof UserFormData, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const openCreate = () => {
    setEditId(null)
    setForm({ ...emptyForm })
    setDialogOpen(true)
  }

  const openEdit = (u: UserRecord) => {
    setEditId(u.id)
    setForm({ name: u.name, email: u.email, password: '', role: u.role })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      toast({ title: 'Error', description: 'Nama dan email wajib diisi.', variant: 'destructive' })
      return
    }
    if (!editId && !form.password.trim()) {
      toast({ title: 'Error', description: 'Password wajib diisi untuk user baru.', variant: 'destructive' })
      return
    }
    setSaving(true)
    try {
      const body: Record<string, string> = { name: form.name, email: form.email, role: form.role }
      if (form.password.trim()) body.password = form.password
      const url = editId ? `/api/admin/users/${editId}` : '/api/admin/users'
      const method = editId ? 'PUT' : 'POST'
      const res = await adminFetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) { const d = await res.json(); toast({ title: 'Error', description: d.error || 'Gagal menyimpan.', variant: 'destructive' }); return }
      toast({ title: 'Berhasil', description: editId ? 'User diperbarui.' : 'User ditambahkan.' })
      setDialogOpen(false)
      fetchUsers()
    } catch {
      toast({ title: 'Error', description: 'Gagal terhubung ke server.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const res = await adminFetch(`/api/admin/users/${deleteId}`, { method: 'DELETE' })
      if (!res.ok) { const d = await res.json(); toast({ title: 'Error', description: d.error || 'Gagal menghapus.', variant: 'destructive' }); return }
      toast({ title: 'Berhasil', description: 'User dihapus.' })
      fetchUsers()
    } catch {
      toast({ title: 'Error', description: 'Gagal terhubung ke server.', variant: 'destructive' })
    } finally {
      setDeleteId(null)
    }
  }

  if (adminUser?.role !== 'super_admin') {
    return <p className="text-[#999999] py-8 text-center">Anda tidak memiliki akses ke halaman ini.</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-[#333333]">Manajemen User</h2>
        <Button onClick={openCreate} className="bg-[#00a651] hover:bg-[#008a40] text-white"><Plus className="w-4 h-4 mr-2" />Tambah User</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999999] pointer-events-none" />
        <Input
          placeholder="Cari nama atau email..."
          value={searchInput}
          onChange={e => handleSearchChange(e.target.value)}
          className="pl-9 mb-3 corp-input"
        />
      </div>

      <div className="corp-card rounded-[10px] p-4 overflow-x-auto">
        {loading ? (
          <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10 text-[#666666]">No</TableHead>
                <TableHead className="text-[#666666]">Nama</TableHead>
                <TableHead className="text-[#666666]">Email</TableHead>
                <TableHead className="text-[#666666]">Role</TableHead>
                <TableHead className="text-right text-[#666666]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center text-[#999999] py-8">Tidak ada user.</TableCell></TableRow>
              ) : users.map((u, i) => (
                <TableRow key={u.id} className="hover:bg-[#f8f8f8]">
                  <TableCell className="text-sm text-[#666666]">{i + 1}</TableCell>
                  <TableCell className="font-medium text-sm text-[#333333]">{u.name}</TableCell>
                  <TableCell className="text-sm text-[#666666]">{u.email}</TableCell>
                  <TableCell>
                    <Badge variant={u.role === 'super_admin' ? 'default' : 'secondary'}>{u.role}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(u)}><Pencil className="w-4 h-4" /></Button>
                      <Button variant="ghost" size="sm" className="text-destructive" onClick={() => setDeleteId(u.id)}><Trash2 className="w-4 h-4" /></Button>
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

      {/* User Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#333333]">{editId ? 'Edit User' : 'Tambah User'}</DialogTitle>
            <DialogDescription className="sr-only">Form untuk {editId ? 'mengedit' : 'menambahkan'} user admin</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[#333333]">Nama *</Label>
              <Input value={form.name} onChange={e => updateField('name', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-[#333333]">Email *</Label>
              <Input type="email" value={form.email} onChange={e => updateField('email', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-[#333333]">{editId ? 'Password (kosongkan jika tidak diubah)' : 'Password *'}</Label>
              <Input type="password" value={form.password} onChange={e => updateField('password', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label className="text-[#333333]">Role</Label>
              <Select value={form.role} onValueChange={v => updateField('role', v)}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
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
            <AlertDialogTitle className="text-[#333333]">Hapus User?</AlertDialogTitle>
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