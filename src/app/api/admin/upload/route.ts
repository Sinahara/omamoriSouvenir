import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { requireSuperAdmin } from '@/lib/auth'

export async function POST(request: NextRequest) {
  // Pastikan hanya Super Admin yang memiliki hak untuk mengupload gambar
  const auth = await requireSuperAdmin(request)
  if (auth instanceof NextResponse) return auth

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'Tidak ada file gambar valid yang terdeteksi.' }, { status: 400 })
    }

    // Eksekusi upload ke Vercel Blob (access: public agar pengunjung web bisa melihatnya)
    const blob = await put(file.name, file, {
      access: 'public',
    })

    // Mengembalikan path gambar (URL cloud) kembali ke frontend untuk disimpan ke database
    return NextResponse.json({ path: blob.url })
    
  } catch (error) {
    console.error('Error proses upload:', error)
    return NextResponse.json({ error: 'Server gagal memproses unggahan gambar.' }, { status: 500 })
  }
}