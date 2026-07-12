'use client'

import { useEffect, useState, useRef } from 'react'
import { Save, Upload, ImageIcon, RefreshCw, Plus, Trash2, GripVertical, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { useAppStore } from '@/lib/store'
import { adminFetch } from '@/lib/admin-fetch'

interface CompanySettings {
  companyName: string
  alamat: string
  kota: string
  npwp: string
  telepon: string
  email: string
  website: string
}

interface HeroSettings {
  hero_badge: string
  hero_title: string
  hero_subtitle: string
  hero_image: string
  hero_btn_primary_text: string
  hero_btn_secondary_text: string
}

interface AdvantageItem {
  icon: string
  title: string
  desc: string
}

interface AboutSettings {
  about_title: string
  about_subtitle: string
  about_description: string
  about_image: string
  about_advantages: string
  about_benefits: string
  about_whatsapp: string
  about_email: string
  about_phone: string
  about_address: string
}

const defaultCompany: CompanySettings = {
  companyName: 'PT Omamori Souvenir Indonesia',
  alamat: '',
  kota: 'Surabaya',
  npwp: '',
  telepon: '',
  email: 'info@omamorisouvenir.id',
  website: 'https://omamorisouvenir.id',
}

const defaultHero: HeroSettings = {
  hero_badge: 'Corporate Gift Terpercaya',
  hero_title: 'Solusi Corporate Gift Premium untuk Bisnis Anda',
  hero_subtitle: 'Dari tumbler custom hingga employee onboarding kit lengkap. Zero inventory, mockup premium, dokumen lengkap.',
  hero_image: '/hero-product.png',
  hero_btn_primary_text: 'Minta Penawaran',
  hero_btn_secondary_text: 'Lihat Katalog',
}

const defaultAbout: AboutSettings = {
  about_title: 'Tentang Omamori Souvenir',
  about_subtitle: 'Mitra Terpercaya untuk Solusi Corporate Gift Premium',
  about_description: 'Omamori Souvenir adalah penyedia solusi corporate gift premium yang berlokasi di Surabaya, Jawa Timur. Kami berdedikasi untuk membantu perusahaan dalam memenuhi kebutuhan souvenir, merchandise, dan gift set berkualitas tinggi.\n\nDengan pengalaman bertahun-tahun di industri corporate gifting, kami memahami bahwa setiap produk yang kami hasilkan mencerminkan citra dan nilai perusahaan Anda. Oleh karena itu, kami selalu mengutamakan kualitas material, ketepatan waktu, dan kepuasan klien dalam setiap pesanan.',
  about_image: '/about-team.png',
  about_advantages: JSON.stringify([
    { icon: 'Package', title: 'Zero Inventory', desc: 'Tidak perlu stok, produksi setelah DP. Minim risiko, maksimal fleksibilitas untuk bisnis Anda.' },
    { icon: 'FileText', title: 'Dokumen Lengkap', desc: 'Quotation, invoice, kuitansi bermeterai. Semua administrasi terurus rapi dan profesional.' },
    { icon: 'Sparkles', title: 'Mockup Premium', desc: 'Visualisasi produk dengan mockup AI berkualitas tinggi sebelum produksi dimulai.' },
    { icon: 'Shield', title: 'Quality Control', desc: 'Pengecekan kualitas ketat di setiap tahap produksi untuk memastikan hasil terbaik.' },
    { icon: 'Truck', title: 'Pengiriman Tepat Waktu', desc: 'Logistik terpercaya dengan tracking real-time, pengiriman aman ke seluruh Indonesia.' },
    { icon: 'Users', title: 'Tim Profesional', desc: 'Dedicated account manager siap membantu konsultasi dan pendampingan dari awal hingga selesai.' },
  ], null, 2),
  about_benefits: JSON.stringify([
    { icon: 'Target', title: 'Hemat Biaya', desc: 'Harga kompetitif langsung dari produsen tanpa perantara. Diskon khusus untuk jumlah besar.' },
    { icon: 'TrendingUp', title: 'Brand Visibility', desc: 'Produk custom dengan logo perusahaan meningkatkan brand awareness di setiap kesempatan.' },
    { icon: 'Award', title: 'Kualitas Premium', desc: 'Material pilihan dan proses produksi berstandar tinggi, menghasilkan produk yang tahan lama.' },
    { icon: 'CheckCircle2', title: 'Customisasi Penuh', desc: 'Desain, warna, ukuran, dan packaging bisa disesuaikan dengan kebutuhan dan identitas brand Anda.' },
  ], null, 2),
  about_whatsapp: '6281234567890',
  about_email: 'info@omamorisouvenir.id',
  about_phone: '031-1234-5678',
  about_address: 'Surabaya — Sidoarjo, Jawa Timur, Indonesia',
}

const iconOptions = [
  { value: 'Package', label: 'Paket' },
  { value: 'FileText', label: 'Dokumen' },
  { value: 'Sparkles', label: 'Bintang' },
  { value: 'Shield', label: 'Perisai' },
  { value: 'Truck', label: 'Truk' },
  { value: 'Users', label: 'Tim' },
  { value: 'Target', label: 'Target' },
  { value: 'TrendingUp', label: 'Tren Naik' },
  { value: 'Award', label: 'Penghargaan' },
  { value: 'CheckCircle2', label: 'Centang' },
]

const STORAGE_KEY = 'omamori_company_settings'
// Use sessionStorage (cleared on tab close) instead of localStorage to protect sensitive data like NPWP

function parseJsonItems(jsonStr: string, fallback: AdvantageItem[]): AdvantageItem[] {
  if (!jsonStr) return fallback
  try {
    const parsed = JSON.parse(jsonStr)
    if (Array.isArray(parsed)) return parsed
  } catch { /* ignore */ }
  return fallback
}

export default function AdminSettings() {
  const { adminUser } = useAppStore()
  const [company, setCompany] = useState<CompanySettings>({ ...defaultCompany })
  const [hero, setHero] = useState<HeroSettings>({ ...defaultHero })
  const [about, setAbout] = useState<AboutSettings>({ ...defaultAbout })
  const [savingCompany, setSavingCompany] = useState(false)
  const [savingHero, setSavingHero] = useState(false)
  const [savingAbout, setSavingAbout] = useState(false)
  const [loadingHero, setLoadingHero] = useState(true)
  const [loadingAbout, setLoadingAbout] = useState(true)
  const [uploadingHero, setUploadingHero] = useState(false)
  const [uploadingAbout, setUploadingAbout] = useState(false)
  const heroFileRef = useRef<HTMLInputElement>(null)
  const aboutFileRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY)
      if (stored) setCompany({ ...defaultCompany, ...JSON.parse(stored) })
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    loadHeroSettings()
    loadAboutSettings()
  }, [])

  const loadHeroSettings = async () => {
    setLoadingHero(true)
    try {
      const res = await adminFetch('/api/admin/site-settings')
      if (res.ok) {
        const data = await res.json()
        if (data && typeof data === 'object') {
          setHero(prev => ({
            hero_badge: data.hero_badge || prev.hero_badge,
            hero_title: data.hero_title || prev.hero_title,
            hero_subtitle: data.hero_subtitle || prev.hero_subtitle,
            hero_image: data.hero_image || prev.hero_image,
            hero_btn_primary_text: data.hero_btn_primary_text || prev.hero_btn_primary_text,
            hero_btn_secondary_text: data.hero_btn_secondary_text || prev.hero_btn_secondary_text,
          }))
        }
      }
    } catch { /* ignore */ } finally {
      setLoadingHero(false)
    }
  }

  const loadAboutSettings = async () => {
    setLoadingAbout(true)
    try {
      const res = await adminFetch('/api/admin/site-settings')
      if (res.ok) {
        const data = await res.json()
        if (data && typeof data === 'object') {
          setAbout(prev => ({
            ...prev,
            about_title: data.about_title || prev.about_title,
            about_subtitle: data.about_subtitle || prev.about_subtitle,
            about_description: data.about_description || prev.about_description,
            about_image: data.about_image || prev.about_image,
            about_advantages: data.about_advantages || prev.about_advantages,
            about_benefits: data.about_benefits || prev.about_benefits,
            about_whatsapp: data.about_whatsapp || prev.about_whatsapp,
            about_email: data.about_email || prev.about_email,
            about_phone: data.about_phone || prev.about_phone,
            about_address: data.about_address || prev.about_address,
          }))
        }
      }
    } catch { /* ignore */ } finally {
      setLoadingAbout(false)
    }
  }

  const updateCompanyField = (field: keyof CompanySettings, value: string) => {
    setCompany(prev => ({ ...prev, [field]: value }))
  }

  const updateHeroField = (field: keyof HeroSettings, value: string) => {
    setHero(prev => ({ ...prev, [field]: value }))
  }

  const updateAboutField = (field: keyof AboutSettings, value: string) => {
    setAbout(prev => ({ ...prev, [field]: value }))
  }

  const handleSaveCompany = () => {
    setSavingCompany(true)
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(company))
      toast({ title: 'Berhasil', description: 'Pengaturan perusahaan tersimpan.' })
    } catch {
      toast({ title: 'Error', description: 'Gagal menyimpan pengaturan.', variant: 'destructive' })
    } finally {
      setSavingCompany(false)
    }
  }

  const handleSaveHero = async () => {
    setSavingHero(true)
    try {
      const res = await adminFetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: hero }),
      })
      if (!res.ok) {
        toast({ title: 'Error', description: 'Gagal menyimpan pengaturan beranda.', variant: 'destructive' })
        return
      }
      toast({ title: 'Berhasil', description: 'Pengaturan tampilan beranda tersimpan.' })
    } catch {
      toast({ title: 'Error', description: 'Gagal terhubung ke server.', variant: 'destructive' })
    } finally {
      setSavingHero(false)
    }
  }

  const handleSaveAbout = async () => {
    setSavingAbout(true)
    try {
      const res = await adminFetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: about }),
      })
      if (!res.ok) {
        toast({ title: 'Error', description: 'Gagal menyimpan pengaturan Tentang Kami.', variant: 'destructive' })
        return
      }
      toast({ title: 'Berhasil', description: 'Pengaturan Tentang Kami tersimpan.' })
    } catch {
      toast({ title: 'Error', description: 'Gagal terhubung ke server.', variant: 'destructive' })
    } finally {
      setSavingAbout(false)
    }
  }

  const handleHeroUpload = async (file: File) => {
    setUploadingHero(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'hero')
      const res = await adminFetch('/api/admin/upload', { method: 'POST', body: fd })
      if (!res.ok) {
        const d = await res.json()
        toast({ title: 'Error', description: d.error || 'Gagal upload.', variant: 'destructive' })
        return
      }
      const data = await res.json()
      setHero(prev => ({ ...prev, hero_image: data.path }))
      toast({ title: 'Berhasil', description: 'Gambar hero berhasil diupload.' })
    } catch {
      toast({ title: 'Error', description: 'Gagal mengupload gambar.', variant: 'destructive' })
    } finally {
      setUploadingHero(false)
    }
  }

  const handleAboutUpload = async (file: File) => {
    setUploadingAbout(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'about')
      const res = await adminFetch('/api/admin/upload', { method: 'POST', body: fd })
      if (!res.ok) {
        const d = await res.json()
        toast({ title: 'Error', description: d.error || 'Gagal upload.', variant: 'destructive' })
        return
      }
      const data = await res.json()
      setAbout(prev => ({ ...prev, about_image: data.path }))
      toast({ title: 'Berhasil', description: 'Gambar berhasil diupload.' })
    } catch {
      toast({ title: 'Error', description: 'Gagal mengupload gambar.', variant: 'destructive' })
    } finally {
      setUploadingAbout(false)
    }
  }

  const updateListItem = (jsonKey: 'about_advantages' | 'about_benefits', index: number, field: keyof AdvantageItem, value: string) => {
    const items = parseJsonItems(about[jsonKey], [])
    if (items[index]) {
      items[index] = { ...items[index], [field]: value }
      updateAboutField(jsonKey, JSON.stringify(items, null, 2))
    }
  }

  const addListItem = (jsonKey: 'about_advantages' | 'about_benefits') => {
    const items = parseJsonItems(about[jsonKey], [])
    items.push({ icon: 'CheckCircle2', title: '', desc: '' })
    updateAboutField(jsonKey, JSON.stringify(items, null, 2))
  }

  const removeListItem = (jsonKey: 'about_advantages' | 'about_benefits', index: number) => {
    const items = parseJsonItems(about[jsonKey], [])
    items.splice(index, 1)
    updateAboutField(jsonKey, JSON.stringify(items, null, 2))
  }

  if (adminUser?.role !== 'super_admin') {
    return <p className="text-[#999999] py-8 text-center">Anda tidak memiliki akses ke halaman ini.</p>
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-[#333333]">Pengaturan</h2>

      <Tabs defaultValue="hero" className="w-full">
        <TabsList className="mb-6 bg-[#f0f0f0]">
          <TabsTrigger value="hero" className="data-[state=active]:bg-white data-[state=active]:text-[#00a651] data-[state=active]:shadow-sm">
            <ImageIcon className="w-4 h-4 mr-1.5" />
            Tampilan Beranda
          </TabsTrigger>
          <TabsTrigger value="about" className="data-[state=active]:bg-white data-[state=active]:text-[#00a651] data-[state=active]:shadow-sm">
            <Info className="w-4 h-4 mr-1.5" />
            Tentang Kami
          </TabsTrigger>
          <TabsTrigger value="company" className="data-[state=active]:bg-white data-[state=active]:text-[#00a651] data-[state=active]:shadow-sm">
            <Save className="w-4 h-4 mr-1.5" />
            Profil Perusahaan
          </TabsTrigger>
        </TabsList>

        {/* ═══════ HERO / BERANDA ═══════ */}
        <TabsContent value="hero">
          <div className="space-y-6 max-w-2xl">
            <div className="corp-card rounded-[10px] p-4">
              <div className="flex items-center justify-between mb-3">
                <Label className="text-base font-semibold text-[#333333]">Preview Hero</Label>
                <Button variant="outline" size="sm" onClick={loadHeroSettings} disabled={loadingHero}>
                  <RefreshCw className={`w-3 h-3 mr-1 ${loadingHero ? 'animate-spin' : ''}`} /> Refresh
                </Button>
              </div>
              <div className="bg-linear-to-br from-[#fafafa] to-[#f0f0f0] rounded-lg p-6 space-y-3">
                {hero.hero_badge && (
                  <span className="inline-block text-xs px-3 py-1 text-[#00a651] border border-[#00a651]/30 rounded-full">{hero.hero_badge}</span>
                )}
                <h3 className="text-xl font-bold text-[#333333] leading-tight">{hero.hero_title || 'Judul Hero'}</h3>
                <p className="text-sm text-[#888888] leading-relaxed">{hero.hero_subtitle || 'Subjudul hero akan muncul di sini.'}</p>
                <div className="flex gap-2 pt-1">
                  <span className="inline-block text-xs px-4 py-1.5 bg-[#00a651] text-white rounded-full">{hero.hero_btn_primary_text || 'Minta Penawaran'}</span>
                  <span className="inline-block text-xs px-4 py-1.5 border border-[#eeeeee] text-[#888888] rounded-full">{hero.hero_btn_secondary_text || 'Lihat Katalog'}</span>
                </div>
                {hero.hero_image && (
                  <div className="pt-3 flex justify-center">
                    <img src={hero.hero_image} alt="Hero Preview" className="max-h-40 object-contain rounded-lg" />
                  </div>
                )}
              </div>
            </div>

            <div className="corp-card rounded-[10px] p-6">
              <h3 className="font-semibold text-[#333333] mb-4">Gambar Hero</h3>
              <div className="space-y-3">
                <input ref={heroFileRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleHeroUpload(f); e.target.value = '' }} />
                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={() => heroFileRef.current?.click()} disabled={uploadingHero}>
                    {uploadingHero ? 'Uploading...' : <><Upload className="w-4 h-4 mr-2" />Upload Gambar Baru</>}
                  </Button>
                  {hero.hero_image && <span className="text-sm text-[#666666] truncate max-w-[260px]" title={hero.hero_image}>{hero.hero_image}</span>}
                </div>
                <div>
                  <Label className="text-xs text-[#666666]">Atau masukkan path manual</Label>
                  <Input value={hero.hero_image} onChange={e => updateHeroField('hero_image', e.target.value)} placeholder="/hero-product.png" className="mt-1" />
                </div>
              </div>
            </div>

            <div className="corp-card rounded-[10px] p-6">
              <h3 className="font-semibold text-[#333333] mb-4">Teks Hero</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[#333333]">Badge Text</Label>
                  <Input value={hero.hero_badge} onChange={e => updateHeroField('hero_badge', e.target.value)} placeholder="Contoh: Corporate Gift Terpercaya" />
                  <p className="text-xs text-[#999999]">Teks kecil di atas judul (opsional)</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-[#333333]">Judul Utama</Label>
                  <Textarea rows={2} value={hero.hero_title} onChange={e => updateHeroField('hero_title', e.target.value)} placeholder="Contoh: Solusi Corporate Gift Premium untuk Bisnis Anda" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#333333]">Sub Judul</Label>
                  <Textarea rows={3} value={hero.hero_subtitle} onChange={e => updateHeroField('hero_subtitle', e.target.value)} placeholder="Contoh: Dari tumbler custom hingga employee onboarding kit lengkap." />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#333333]">Tombol Utama</Label>
                    <Input value={hero.hero_btn_primary_text} onChange={e => updateHeroField('hero_btn_primary_text', e.target.value)} placeholder="Minta Penawaran" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#333333]">Tombol Sekunder</Label>
                    <Input value={hero.hero_btn_secondary_text} onChange={e => updateHeroField('hero_btn_secondary_text', e.target.value)} placeholder="Lihat Katalog" />
                  </div>
                </div>
              </div>
              <div className="pt-5">
                <Button onClick={handleSaveHero} disabled={savingHero} className="bg-[#00a651] hover:bg-[#008a40] text-white">
                  <Save className="w-4 h-4 mr-2" />{savingHero ? 'Menyimpan...' : 'Simpan Tampilan Beranda'}
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ═══════ ABOUT / TENTANG KAMI ═══════ */}
        <TabsContent value="about">
          <div className="space-y-6 max-w-3xl">
            <div className="flex items-center justify-between">
              <p className="text-sm text-[#999999]">Kelola konten halaman &quot;Tentang Kami&quot; yang tampil di website.</p>
              <Button variant="outline" size="sm" onClick={loadAboutSettings} disabled={loadingAbout}>
                <RefreshCw className={`w-3 h-3 mr-1 ${loadingAbout ? 'animate-spin' : ''}`} /> Refresh
              </Button>
            </div>

            <div className="corp-card rounded-[10px] p-6">
              <h3 className="font-semibold text-[#333333] mb-4">Teks Tentang Kami</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[#333333]">Judul Halaman</Label>
                  <Input value={about.about_title} onChange={e => updateAboutField('about_title', e.target.value)} placeholder="Tentang Omamori Souvenir" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#333333]">Sub Judul</Label>
                  <Input value={about.about_subtitle} onChange={e => updateAboutField('about_subtitle', e.target.value)} placeholder="Mitra Terpercaya untuk Solusi Corporate Gift Premium" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#333333]">Deskripsi Bisnis</Label>
                  <Textarea rows={6} value={about.about_description} onChange={e => updateAboutField('about_description', e.target.value)} placeholder="Ceritakan tentang bisnis Anda..." />
                  <p className="text-xs text-[#999999]">Gunakan baris baru (Enter) untuk membuat paragraf terpisah.</p>
                </div>
              </div>
            </div>

            <div className="corp-card rounded-[10px] p-6">
              <h3 className="font-semibold text-[#333333] mb-4">Gambar Tentang Kami</h3>
              <div className="space-y-3">
                <input ref={aboutFileRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleAboutUpload(f); e.target.value = '' }} />
                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={() => aboutFileRef.current?.click()} disabled={uploadingAbout}>
                    {uploadingAbout ? 'Uploading...' : <><Upload className="w-4 h-4 mr-2" />Upload Gambar</>}
                  </Button>
                  {about.about_image && <span className="text-sm text-[#666666] truncate max-w-[260px]" title={about.about_image}>{about.about_image}</span>}
                </div>
                {about.about_image && (
                  <div className="pt-2">
                    <img src={about.about_image} alt="About Preview" className="max-h-40 object-contain rounded-lg border border-[#eeeeee] p-2" />
                  </div>
                )}
                <div>
                  <Label className="text-xs text-[#666666]">Atau masukkan path manual</Label>
                  <Input value={about.about_image} onChange={e => updateAboutField('about_image', e.target.value)} placeholder="/about-team.png" className="mt-1" />
                </div>
              </div>
            </div>

            <div className="corp-card rounded-[10px] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[#333333]">Keunggulan Kami</h3>
                <Button variant="outline" size="sm" onClick={() => addListItem('about_advantages')}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Tambah
                </Button>
              </div>
              <AdvantageEditor items={parseJsonItems(about.about_advantages, [])} jsonKey="about_advantages" onUpdate={updateListItem} onRemove={removeListItem} />
            </div>

            <div className="corp-card rounded-[10px] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[#333333]">Keuntungan Produk</h3>
                <Button variant="outline" size="sm" onClick={() => addListItem('about_benefits')}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Tambah
                </Button>
              </div>
              <AdvantageEditor items={parseJsonItems(about.about_benefits, [])} jsonKey="about_benefits" onUpdate={updateListItem} onRemove={removeListItem} />
            </div>

            <div className="corp-card rounded-[10px] p-6">
              <h3 className="font-semibold text-[#333333] mb-4">Informasi Kontak</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[#333333]">WhatsApp (tanpa +)</Label>
                    <Input value={about.about_whatsapp} onChange={e => updateAboutField('about_whatsapp', e.target.value)} placeholder="6281234567890" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[#333333]">Email</Label>
                    <Input type="email" value={about.about_email} onChange={e => updateAboutField('about_email', e.target.value)} placeholder="info@omamorisouvenir.id" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-[#333333]">Telepon</Label>
                  <Input value={about.about_phone} onChange={e => updateAboutField('about_phone', e.target.value)} placeholder="031-1234-5678" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#333333]">Alamat</Label>
                  <Textarea rows={2} value={about.about_address} onChange={e => updateAboutField('about_address', e.target.value)} placeholder="Surabaya — Sidoarjo, Jawa Timur, Indonesia" />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Button onClick={handleSaveAbout} disabled={savingAbout} className="bg-[#00a651] hover:bg-[#008a40] text-white">
                <Save className="w-4 h-4 mr-2" />{savingAbout ? 'Menyimpan...' : 'Simpan Pengaturan Tentang Kami'}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* ═══════ COMPANY ═══════ */}
        <TabsContent value="company">
          <div className="corp-card rounded-[10px] p-6 max-w-2xl">
            <h3 className="font-semibold text-[#333333] mb-4">Profil Perusahaan</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-[#333333]">Nama Perusahaan</Label>
                <Input value={company.companyName} onChange={e => updateCompanyField('companyName', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="text-[#333333]">Alamat</Label>
                <Textarea rows={2} value={company.alamat} onChange={e => updateCompanyField('alamat', e.target.value)} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#333333]">Kota</Label>
                  <Input value={company.kota} onChange={e => updateCompanyField('kota', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#333333]">NPWP</Label>
                  <Input value={company.npwp} onChange={e => updateCompanyField('npwp', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[#333333]">Telepon</Label>
                  <Input value={company.telepon} onChange={e => updateCompanyField('telepon', e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label className="text-[#333333]">Email</Label>
                  <Input type="email" value={company.email} onChange={e => updateCompanyField('email', e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-[#333333]">Website</Label>
                <Input value={company.website} onChange={e => updateCompanyField('website', e.target.value)} />
              </div>
              <div className="pt-4">
                <Button onClick={handleSaveCompany} disabled={savingCompany} className="bg-[#00a651] hover:bg-[#008a40] text-white">
                  <Save className="w-4 h-4 mr-2" />{savingCompany ? 'Menyimpan...' : 'Simpan Pengaturan'}
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

/* ═══════ REUSABLE LIST EDITOR ═══════ */
function AdvantageEditor({
  items, jsonKey, onUpdate, onRemove,
}: {
  items: AdvantageItem[]
  jsonKey: 'about_advantages' | 'about_benefits'
  onUpdate: (jsonKey: 'about_advantages' | 'about_benefits', index: number, field: keyof AdvantageItem, value: string) => void
  onRemove: (jsonKey: 'about_advantages' | 'about_benefits', index: number) => void
}) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-[#999999] py-4 text-center border border-dashed border-[#eeeeee] rounded-lg">
        Belum ada item. Klik &quot;Tambah&quot; untuk menambahkan.
      </p>
    )
  }

  return (
    <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
      {items.map((item, idx) => (
        <div key={idx} className="border border-[#eeeeee] rounded-lg p-4 space-y-3 relative group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GripVertical className="w-4 h-4 text-[#cccccc]" />
              <span className="text-xs font-medium text-[#999999] bg-[#f5f5f5] px-2 py-0.5 rounded">#{idx + 1}</span>
            </div>
            <Button variant="ghost" size="icon" className="w-7 h-7 text-[#cccccc] hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => onRemove(jsonKey, idx)}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-[#666666]">Ikon</Label>
              <select
                value={item.icon}
                onChange={e => onUpdate(jsonKey, idx, 'icon', e.target.value)}
                className="w-full h-9 px-3 rounded-md border border-[#eeeeee] bg-white text-sm text-[#333333] focus:border-[#00a651] focus:outline-none focus:ring-2 focus:ring-[#00a651]/10 transition-colors"
              >
                {iconOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-[#666666]">Judul</Label>
              <Input value={item.title} onChange={e => onUpdate(jsonKey, idx, 'title', e.target.value)} placeholder="Judul..." className="h-9" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-[#666666]">Deskripsi</Label>
            <Textarea rows={2} value={item.desc} onChange={e => onUpdate(jsonKey, idx, 'desc', e.target.value)} placeholder="Deskripsi singkat..." className="text-sm" />
          </div>
        </div>
      ))}
    </div>
  )
}