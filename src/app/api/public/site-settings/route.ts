import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET public site settings (only whitelisted keys)
export async function GET() {
  try {
    const publicKeys = [
      'hero_badge',
      'hero_title',
      'hero_subtitle',
      'hero_image',
      'hero_btn_primary_text',
      'hero_btn_secondary_text',
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
    ]

    const settings = await db.siteSetting.findMany({
      where: { key: { in: publicKeys } },
    })

    const record: Record<string, string> = {}
    for (const s of settings) {
      record[s.key] = s.value
    }
    return NextResponse.json(record)
  } catch (error) {
    console.error('Public settings GET error:', error)
    return NextResponse.json({}, { status: 200 })
  }
}