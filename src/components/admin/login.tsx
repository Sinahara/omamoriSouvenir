'use client'

import { useState } from 'react'
import { LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useAppStore } from '@/lib/store'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, navigate } = useAppStore()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast({ title: 'Error', description: 'Email dan password wajib diisi.', variant: 'destructive' })
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: 'Login Gagal', description: data.error || 'Terjadi kesalahan.', variant: 'destructive' })
        return
      }
      login(data.user)
      navigate('admin-dashboard')
      toast({ title: 'Berhasil', description: 'Selamat datang, ' + data.user.name + '!' })
    } catch {
      toast({ title: 'Error', description: 'Gagal terhubung ke server.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center p-4">
      <div className="corp-card rounded-[10px] p-8 w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <img src="/logo.png" alt="Omamori Souvenir" className="h-11 w-auto object-contain" />
          <div>
            <h1 className="text-xl font-bold text-[#333333]">Omamori Souvenir Admin</h1>
            <p className="text-xs text-[#999999]">Panel Manajemen</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#333333]">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@omamorisouvenir.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-[#333333]">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <Button type="submit" className="w-full bg-[#00a651] hover:bg-[#008a40] text-white" disabled={loading}>
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                Memproses...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                Masuk
              </span>
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}