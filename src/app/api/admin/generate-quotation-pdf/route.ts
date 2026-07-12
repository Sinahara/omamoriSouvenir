import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { db } from '@/lib/db'
import { buildQuotationPdfBuffer } from '@/lib/quotation-pdf'

export async function POST(req: NextRequest) {
  const auth = await requireAdmin(req)
  if (auth instanceof NextResponse) return auth

  try {
    const body = await req.json()
    const { quoteId } = body as { quoteId: string }

    if (!quoteId) {
      return NextResponse.json({ error: 'quoteId diperlukan.' }, { status: 400 })
    }

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

    const pdfBuffer = await buildQuotationPdfBuffer(quote)

    const safeQuoteNumber = quote.quoteNumber.replace(/\//g, '-')
    const filename = `quotation-${safeQuoteNumber}.pdf`

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(pdfBuffer.length),
      },
    })
  } catch (error) {
    console.error('Error generating quotation PDF:', error)
    return NextResponse.json(
      { error: 'Gagal membuat PDF penawaran.' },
      { status: 500 }
    )
  }
}