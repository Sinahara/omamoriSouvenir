import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const settings = await db.siteSetting.findMany()
    const record: Record<string, string> = {}
    for (const s of settings) {
      record[s.key] = s.value
    }
    
    return NextResponse.json(record, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Gagal memuat pengaturan publik' }, { status: 500 })
  }
}