import PDFDocument from 'pdfkit'
import type { Quote, QuoteItem, Client, User } from '@prisma/client'

export type QuoteWithRelations = Quote & {
  client: Client
  items: (QuoteItem & { product: { name: string; unit: string } | null })[]
  createdBy: Pick<User, 'id' | 'name'>
}

function formatRupiah(amount: number): string {
  return 'Rp ' + amount.toLocaleString('id-ID')
}

function formatDate(date: Date): string {
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ]
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`
}

export function buildQuotationPdfBuffer(quote: QuoteWithRelations): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      bufferPages: true,
    })

    const buffers: Buffer[] = []
    doc.on('data', (chunk: Buffer) => buffers.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(buffers)))
    doc.on('error', reject)

    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right
    const left = doc.page.margins.left
    const right = doc.page.width - doc.page.margins.right

    // ── Company Header ──
    doc.font('Helvetica-Bold').fontSize(24).fillColor('#1a1a2e')
      .text('OMAMORI SOUVENIR', left, 50, { align: 'center' })
    doc.font('Helvetica').fontSize(9).fillColor('#555')
      .text('Surabaya — Sidoarjo, Jawa Timur', left, 78, { align: 'center' })
    doc.moveDown(0.3)

    // Divider line
    doc.moveTo(left, 96).lineTo(right, 96).strokeColor('#1a1a2e').lineWidth(2).stroke()
    doc.moveDown(0.8)

    // ── Title ──
    doc.font('Helvetica-Bold').fontSize(16).fillColor('#1a1a2e')
      .text('QUOTATION', left, doc.y, { align: 'center' })
    doc.font('Helvetica').fontSize(9).fillColor('#666')
      .text('(Penawaran Harga)', left, doc.y, { align: 'center' })
    doc.moveDown(1)

    // ── Quotation Info & Client Info (side by side) ──
    const infoY = doc.y

    // Left: Quotation info
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#1a1a2e').text('No. Penawaran', left, infoY)
    doc.font('Helvetica').fontSize(8).fillColor('#333').text(`: ${quote.quoteNumber}`, left + 80, infoY)
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#1a1a2e').text('Tanggal', left, infoY + 14)
    doc.font('Helvetica').fontSize(8).fillColor('#333').text(`: ${formatDate(quote.createdAt)}`, left + 80, infoY + 14)
    if (quote.validUntil) {
      doc.font('Helvetica-Bold').fontSize(8).fillColor('#1a1a2e').text('Berlaku Hingga', left, infoY + 28)
      doc.font('Helvetica').fontSize(8).fillColor('#333').text(`: ${formatDate(new Date(quote.validUntil))}`, left + 80, infoY + 28)
    }

    // Right: Client info
    const clientX = left + pageWidth * 0.5
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#1a1a2e').text('Kepada Yth.', clientX, infoY)
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#333').text(quote.client.companyName, clientX, infoY + 14)
    doc.font('Helvetica').fontSize(8).fillColor('#333').text(`PIC: ${quote.client.picName}${quote.client.picTitle ? ` — ${quote.client.picTitle}` : ''}`, clientX, infoY + 26)
    if (quote.client.alamat) {
      doc.font('Helvetica').fontSize(8).fillColor('#333').text(quote.client.alamat, clientX, infoY + 38, { width: pageWidth * 0.5 })
    }
    doc.font('Helvetica').fontSize(8).fillColor('#333').text(`Email: ${quote.client.email}`, clientX, doc.y + 2)

    doc.moveDown(1.5)

    // ── Items Table ──
    const tableTop = doc.y
    const colWidths = [30, pageWidth - 30 - 45 - 70 - 80 - 85, 45, 70, 80, 85]
    const headers = ['No', 'Deskripsi', 'Qty', 'Satuan', 'Harga Satuan', 'Subtotal']
    const rowHeight = 22
    const headerBg = '#1a1a2e'
    const altRowBg = '#f5f5f8'

    // Draw table header
    let x = left
    const headerY = tableTop
    doc.rect(left, headerY, pageWidth, rowHeight).fill(headerBg)
    for (let i = 0; i < headers.length; i++) {
      doc.font('Helvetica-Bold').fontSize(7).fillColor('#ffffff')
        .text(headers[i], x + 4, headerY + 7, { width: colWidths[i] - 8, align: i === 0 ? 'center' : (i >= 3 ? 'right' : 'left') })
      x += colWidths[i]
    }

    // Draw table rows
    let y = headerY + rowHeight
    quote.items.forEach((item, idx) => {
      const isAlt = idx % 2 === 1
      if (isAlt) {
        doc.rect(left, y, pageWidth, rowHeight).fill(altRowBg)
      }

      // Row bottom border
      doc.moveTo(left, y + rowHeight).lineTo(right, y + rowHeight)
        .strokeColor('#ddd').lineWidth(0.5).stroke()

      const description = item.customDescription || (item.product ? item.product.name : '-')
      const unit = item.product?.unit || 'pcs'

      x = left
      const values = [
        `${idx + 1}`,
        description,
        `${item.qty}`,
        unit,
        formatRupiah(item.unitPrice),
        formatRupiah(item.subtotal),
      ]

      for (let i = 0; i < values.length; i++) {
        doc.font('Helvetica').fontSize(7).fillColor('#333')
          .text(values[i], x + 4, y + 7, {
            width: colWidths[i] - 8,
            align: i === 0 ? 'center' : (i >= 3 ? 'right' : 'left'),
            lineBreak: false,
          })
        x += colWidths[i]
      }

      y += rowHeight
    })

    // Table outer border
    doc.rect(left, headerY, pageWidth, y - headerY).strokeColor('#1a1a2e').lineWidth(1).stroke()

    doc.y = y + 15

    // ── Summary ──
    const summaryX = left + pageWidth * 0.45
    const summaryWidth = pageWidth * 0.55
    const labelX = summaryX

    const drawSummaryLine = (label: string, value: string, bold = false, color = '#333', size = 8) => {
      doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(size).fillColor(color)
        .text(label, labelX, doc.y, { continued: false, width: summaryWidth * 0.55 })
      doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(size).fillColor(color)
        .text(value, labelX, doc.y - size - 4, { width: summaryWidth, align: 'right' })
    }

    drawSummaryLine('Subtotal', formatRupiah(quote.subtotal))

    if (quote.discPct > 0 || quote.discAmt > 0) {
      const discLabel = quote.discPct > 0
        ? `Diskon (${quote.discPct}%)`
        : 'Diskon'
      drawSummaryLine(discLabel, `- ${formatRupiah(quote.discAmt)}`)
    }

    // Separator line
    doc.moveTo(labelX, doc.y + 2).lineTo(right, doc.y + 2)
      .strokeColor('#1a1a2e').lineWidth(1.5).stroke()
    doc.moveDown(0.3)

    drawSummaryLine('TOTAL', formatRupiah(quote.total), true, '#1a1a2e', 9)

    doc.moveDown(0.3)
    const dpPct = quote.dpPct || 50
    const dpAmount = quote.total * dpPct / 100
    const balance = quote.total - dpAmount

    drawSummaryLine(`Uang Muka (DP ${dpPct}%)`, formatRupiah(dpAmount))
    drawSummaryLine('Sisa Pembayaran', formatRupiah(balance), true, '#c0392b', 8)

    doc.moveDown(1.5)

    // ── Terms & Conditions ──
    const termsY = doc.y
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#1a1a2e')
      .text('Syarat & Ketentuan:', left, termsY)
    doc.moveDown(0.3)

    const terms = [
      'Harga belum termasuk PPN (kecuali disepakati lain).',
      'Pembayaran DP diharapkan setelah penawaran ini disetujui.',
      'Produksi dimulai setelah DP diterima.',
      'Pengiriman sesuai kesepakatan setelah produksi selesai dan QC lulus.',
      'Penawaran ini berlaku sesuai tanggal yang tertera di atas.',
    ]

    terms.forEach((term) => {
      doc.font('Helvetica').fontSize(7).fillColor('#555')
        .text(`• ${term}`, left + 10, doc.y, { width: pageWidth - 20 })
      doc.moveDown(0.15)
    })

    doc.moveDown(1.5)

    // ── Signature Area ──
    const sigY = doc.y
    const sigWidth = pageWidth * 0.4

    // Left: Prepared by
    doc.font('Helvetica').fontSize(8).fillColor('#333')
      .text('Disiapkan oleh:', left, sigY, { width: sigWidth, align: 'center' })
    doc.moveDown(3)
    doc.font('Helvetica-Bold').fontSize(8).fillColor('#1a1a2e')
      .text(quote.createdBy.name, left, doc.y, { width: sigWidth, align: 'center' })

    // Right: Approved by
    const rightSigX = right - sigWidth
    doc.font('Helvetica').fontSize(8).fillColor('#333')
      .text('Disetujui oleh:', rightSigX, sigY, { width: sigWidth, align: 'center' })
    doc.moveDown(3)
    doc.font('Helvetica').fontSize(8).fillColor('#999')
      .text('________________________', rightSigX, doc.y, { width: sigWidth, align: 'center' })

    doc.moveDown(1)
    doc.font('Helvetica').fontSize(7).fillColor('#999')
      .text(`Dicetak pada: ${formatDate(new Date())}`, left, doc.y, { align: 'center' })

    doc.end()
  })
}