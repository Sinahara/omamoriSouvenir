import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { db } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { buildQuotationPdfBuffer } from '@/lib/quotation-pdf'

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (auth instanceof NextResponse) return auth

  try {
    const body = await req.json()
    const { quoteId, notes } = body as { quoteId: string; notes?: string }

    if (!quoteId) {
      return NextResponse.json({ error: 'quoteId diperlukan.' }, { status: 400 })
    }

    // Fetch quote with relations
    const quote = await db.quote.findUnique({
      where: { id: quoteId },
      include: {
        client: true,
        items: {
          include: {
            product: {
              select: { name: true, unit: true },
            },
          },
          orderBy: { id: 'asc' },
        },
        createdBy: {
          select: { id: true, name: true },
        },
      },
    })

    if (!quote) {
      return NextResponse.json({ error: 'Penawaran tidak ditemukan.' }, { status: 404 })
    }

    // Generate PDF buffer
    const pdfBuffer = await buildQuotationPdfBuffer(quote)

    // Sanitize quoteNumber for filename (prevent path traversal)
    const safeQuoteNumber = quote.quoteNumber.replace(/[^A-Za-z0-9/-]/g, '_')
    const filename = `quotation-${safeQuoteNumber}-${Date.now()}.pdf`

    // Store PDF outside public/ to prevent direct URL access
    const uploadDir = path.join(process.cwd(), 'uploads', 'quotations')
    await mkdir(uploadDir, { recursive: true })
    const filePath = path.join(uploadDir, filename)
    await writeFile(filePath, pdfBuffer)

    // Store relative path (not publicly accessible)
    const storedPath = `uploads/quotations/${filename}`

    // Create Document record
    const document = await db.document.create({
      data: {
        documentableType: 'Quote',
        documentableId: quote.id,
        type: 'quotation_pdf',
        path: storedPath,
        filename,
        notes: notes || `Quotation PDF for ${quote.quoteNumber}`,
        createdById: auth.user.id,
      },
    })

    return NextResponse.json({
      message: 'PDF berhasil disimpan.',
      document: {
        id: document.id,
        path: storedPath,
        filename: document.filename,
      },
    })
  } catch (error) {
    console.error('Error saving quotation PDF:', error)
    return NextResponse.json(
      { error: 'Gagal menyimpan PDF penawaran.' },
      { status: 500 }
    )
  }
}