import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireSuperAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

// Allowed settings keys (whitelist)
const ALLOWED_KEYS = new Set([
  'hero_badge', 
  'hero_title', 
  'hero_subtitle', 
  'hero_image',
  'hero_btn_primary_text', 
  'hero_btn_secondary_text',
  'hero_cta', 
  
  'about_title',
  'about_subtitle',
  'about_description', 
  'about_image',
  'about_advantages', 
  'about_benefits',
  'about_whatsapp', 
  'about_email', 
  'about_phone',
  'about_address',
  'about_vision', 
  'about_mission',
  
  'testimonial_1_name', 'testimonial_1_company', 'testimonial_1_text',
  'testimonial_2_name', 'testimonial_2_company', 'testimonial_2_text',
  'testimonial_3_name', 'testimonial_3_company', 'testimonial_3_text',
])

// Strip HTML tags to prevent stored XSS
function sanitizeValue(val: string): string {
  return val.replace(/<[^>]*>/g, '').trim().slice(0, 5000)
}

// GET all site settings (admin)
export async function GET(request: NextRequest) {
  const auth = await requireSuperAdmin(request)
  if (auth instanceof NextResponse) return auth
  try {
    const settings = await db.siteSetting.findMany({
      orderBy: { key: 'asc' },
    })
    const record: Record<string, string> = {}
    for (const s of settings) {
      record[s.key] = s.value
    }
    return NextResponse.json(record)
  } catch (error) {
    console.error('Settings GET error:', error)
    return NextResponse.json({ error: 'Gagal memuat pengaturan.' }, { status: 500 })
  }
}

// PUT: upsert multiple settings at once
// Body: { settings: { key: value, ... } }
export async function PUT(req: NextRequest) {
  const auth = await requireSuperAdmin(req)
  if (auth instanceof NextResponse) return auth
  try {
    const body = await req.json()
    const { settings } = body as { settings: Record<string, string> }

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ error: 'Format tidak valid.' }, { status: 400 })
    }

    for (const [key, value] of Object.entries(settings)) {
      // Whitelist check: only allow known keys
      if (!ALLOWED_KEYS.has(key)) {
        return NextResponse.json({ error: `Key "${key}" tidak diizinkan.` }, { status: 400 })
      }
      if (typeof value !== 'string') {
        return NextResponse.json({ error: `Value untuk "${key}" harus berupa teks.` }, { status: 400 })
      }
      const sanitized = sanitizeValue(value)
      await db.siteSetting.upsert({
        where: { key },
        update: { value: sanitized },
        create: { key, value: sanitized },
      })
    }
    revalidatePath('/', 'layout')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Settings PUT error:', error)
    return NextResponse.json({ error: 'Gagal menyimpan pengaturan.' }, { status: 500 })
  }
}