import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const db = new PrismaClient()

const CATEGORIES = ['tumbler', 'plakat', 'lanyard', 'hardbox', 'goodie_bag'] as const

const products = [
  {
    name: 'Tumbler Stainless Steel 500ml',
    slug: 'tumbler-stainless-500ml',
    category: 'tumbler',
    description: 'Tumbler premium stainless steel 500ml dengan finishing glossy. Cocok untuk souvenir perusahaan, employee onboarding kit, dan event corporate. Print area luas untuk branding logo perusahaan Anda.',
    specs: JSON.stringify({
      material: 'Stainless Steel 304',
      kapasitas: '500ml',
      tinggi: '22cm',
      diameter: '7cm',
      areaPrint: '15cm x 8cm',
      finishing: 'Glossy / Matte',
      berat: '280g'
    }),
    basePrice: 45000,
    unit: 'pcs',
    minQty: 12,
    sortOrder: 1,
    images: [
      { path: '/placeholder-tumbler-1.jpg', isPrimary: true, sortOrder: 0 },
      { path: '/placeholder-tumbler-2.jpg', isPrimary: false, sortOrder: 1 },
    ],
    tiers: [
      { minQty: 1, maxQty: 11, pricePerUnit: 65000 },
      { minQty: 12, maxQty: 50, pricePerUnit: 55000 },
      { minQty: 51, maxQty: 100, pricePerUnit: 48000 },
      { minQty: 101, maxQty: null, pricePerUnit: 42000 },
    ]
  },
  {
    name: 'Tumbler Travel 750ml',
    slug: 'tumbler-travel-750ml',
    category: 'tumbler',
    description: 'Tumbler travel 750ml dengan double wall insulation. Menjaga suhu minuman panas/dingin lebih lama. Ideal untuk gift set employee onboarding.',
    specs: JSON.stringify({
      material: 'Stainless Steel 304 Double Wall',
      kapasitas: '750ml',
      tinggi: '26cm',
      diameter: '7.5cm',
      areaPrint: '16cm x 9cm',
      finishing: 'Powder Coated',
      berat: '350g'
    }),
    basePrice: 65000,
    unit: 'pcs',
    minQty: 12,
    sortOrder: 2,
    images: [
      { path: '/placeholder-tumbler-travel-1.jpg', isPrimary: true, sortOrder: 0 },
    ],
    tiers: [
      { minQty: 1, maxQty: 11, pricePerUnit: 85000 },
      { minQty: 12, maxQty: 50, pricePerUnit: 72000 },
      { minQty: 51, maxQty: 100, pricePerUnit: 65000 },
      { minQty: 101, maxQty: null, pricePerUnit: 58000 },
    ]
  },
  {
    name: 'Plakat Akrilik Premium',
    slug: 'plakat-akrilik-premium',
    category: 'plakat',
    description: 'Plakat penghargaan dari akrilik premium 15mm tebal. Desain elegan dengan print UV full color. Sempurna untuk award ceremony, penghargaan karyawan, dan corporate event.',
    specs: JSON.stringify({
      material: 'Akrilik 15mm',
      ukuran: '20cm x 15cm',
      ketebalan: '15mm',
      teknikPrint: 'UV Print Full Color',
      finishing: 'Stand Akrilik + Box',
      berat: '650g'
    }),
    basePrice: 85000,
    unit: 'pcs',
    minQty: 5,
    sortOrder: 3,
    images: [
      { path: '/placeholder-plakat-1.jpg', isPrimary: true, sortOrder: 0 },
    ],
    tiers: [
      { minQty: 1, maxQty: 4, pricePerUnit: 120000 },
      { minQty: 5, maxQty: 20, pricePerUnit: 95000 },
      { minQty: 21, maxQty: 50, pricePerUnit: 85000 },
      { minQty: 51, maxQty: null, pricePerUnit: 75000 },
    ]
  },
  {
    name: 'Plakat Kayu Eksklusif',
    slug: 'plakat-kayu-eksklusif',
    category: 'plakat',
    description: 'Plakat dari kayu jati belanda dengan ukiran laser. Kesan natural dan premium untuk penghargaan yang berkesan.',
    specs: JSON.stringify({
      material: 'Kayu Jati Belanda',
      ukuran: '25cm x 18cm',
      ketebalan: '12mm',
      teknikPrint: 'Laser Engraving + UV Print',
      finishing: 'Duco Glossy',
      berat: '500g'
    }),
    basePrice: 120000,
    unit: 'pcs',
    minQty: 5,
    sortOrder: 4,
    images: [
      { path: '/placeholder-plakat-kayu-1.jpg', isPrimary: true, sortOrder: 0 },
    ],
    tiers: [
      { minQty: 1, maxQty: 4, pricePerUnit: 160000 },
      { minQty: 5, maxQty: 20, pricePerUnit: 135000 },
      { minQty: 21, maxQty: 50, pricePerUnit: 120000 },
      { minQty: 51, maxQty: null, pricePerUnit: 105000 },
    ]
  },
  {
    name: 'Lanyard Custom Printing',
    slug: 'lanyard-custom-printing',
    category: 'lanyard',
    description: 'Lanyard custom printing full color dengan berbagai pilihan aksesoris. Cocok untuk ID card karyawan, event seminar, dan visitor badge.',
    specs: JSON.stringify({
      material: 'Polyester Taffeta 20mm',
      lebar: '20mm',
      panjang: '90cm (adjustable)',
      teknikPrint: 'Sublimasi Full Color',
      aksesoris: 'Hook + ID Card Holder',
      berat: '25g'
    }),
    basePrice: 12000,
    unit: 'pcs',
    minQty: 50,
    sortOrder: 5,
    images: [
      { path: '/placeholder-lanyard-1.jpg', isPrimary: true, sortOrder: 0 },
    ],
    tiers: [
      { minQty: 1, maxQty: 49, pricePerUnit: 18000 },
      { minQty: 50, maxQty: 200, pricePerUnit: 14000 },
      { minQty: 201, maxQty: 500, pricePerUnit: 12000 },
      { minQty: 501, maxQty: null, pricePerUnit: 10000 },
    ]
  },
  {
    name: 'Hardbox Premium Custom',
    slug: 'hardbox-premium-custom',
    category: 'hardbox',
    description: 'Box kemasan premium hardbox dengan custom printing. Ideal untuk packaging corporate gift set, hamper, dan employee welcome kit.',
    specs: JSON.stringify({
      material: 'Art Paper 310gsm + Greyboard 2mm',
      ukuran: '30cm x 20cm x 10cm',
      teknikPrint: 'Offset + Laminasi Glossy/Doff',
      finishing: 'Hot Stamp Gold/Silver',
      berat: '200g'
    }),
    basePrice: 35000,
    unit: 'pcs',
    minQty: 25,
    sortOrder: 6,
    images: [
      { path: '/placeholder-hardbox-1.jpg', isPrimary: true, sortOrder: 0 },
    ],
    tiers: [
      { minQty: 1, maxQty: 24, pricePerUnit: 50000 },
      { minQty: 25, maxQty: 100, pricePerUnit: 40000 },
      { minQty: 101, maxQty: 300, pricePerUnit: 35000 },
      { minQty: 301, maxQty: null, pricePerUnit: 30000 },
    ]
  },
  {
    name: 'Goodie Bag Kanvas',
    slug: 'goodie-bag-kanvas',
    category: 'goodie_bag',
    description: 'Tote bag kanvas premium yang ramah lingkungan. Sablon manual/bordir custom logo perusahaan. Trendy dan fungsional untuk daily use.',
    specs: JSON.stringify({
      material: 'Kanvas Blacu 12oz',
      ukuran: '38cm x 35cm x 10cm',
      teknikPrint: 'Sablon Manual / Bordir Komputer',
      tali: 'Webbing 2.5cm',
      berat: '150g'
    }),
    basePrice: 25000,
    unit: 'pcs',
    minQty: 24,
    sortOrder: 7,
    images: [
      { path: '/placeholder-goodie-1.jpg', isPrimary: true, sortOrder: 0 },
    ],
    tiers: [
      { minQty: 1, maxQty: 23, pricePerUnit: 38000 },
      { minQty: 24, maxQty: 100, pricePerUnit: 30000 },
      { minQty: 101, maxQty: 300, pricePerUnit: 25000 },
      { minQty: 301, maxQty: null, pricePerUnit: 22000 },
    ]
  },
  {
    name: 'Goodie Bag Spunbond',
    slug: 'goodie-bag-spunbond',
    category: 'goodie_bag',
    description: 'Goodie bag spunbond 100gsm ekonomis untuk event besar. Cetak full color satu sisi. Pilihan praktis untuk seminar, workshop, dan giveaway.',
    specs: JSON.stringify({
      material: 'Spunbond 100gsm',
      ukuran: '30cm x 25cm x 8cm',
      teknikPrint: 'Sablon / Print Digital',
      tali: 'Tali Pundak Spunbond',
      berat: '50g'
    }),
    basePrice: 8000,
    unit: 'pcs',
    minQty: 100,
    sortOrder: 8,
    images: [
      { path: '/placeholder-goodie-spunbond-1.jpg', isPrimary: true, sortOrder: 0 },
    ],
    tiers: [
      { minQty: 1, maxQty: 99, pricePerUnit: 12000 },
      { minQty: 100, maxQty: 500, pricePerUnit: 9500 },
      { minQty: 501, maxQty: 1000, pricePerUnit: 8000 },
      { minQty: 1001, maxQty: null, pricePerUnit: 7000 },
    ]
  },
]

async function main() {
  console.log('Seeding database...')

  // Create admin user
  const hashedPassword = await hash('admin123', 12)
  const admin = await db.user.upsert({
    where: { email: 'admin@corporategift.id' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@corporategift.id',
      password: hashedPassword,
      role: 'super_admin',
    },
  })

  // Create staff user
  const staffPassword = await hash('staff123', 12)
  const staff = await db.user.upsert({
    where: { email: 'staff@corporategift.id' },
    update: {},
    create: {
      name: 'Staff Operator',
      email: 'staff@corporategift.id',
      password: staffPassword,
      role: 'staff',
    },
  })

  // Create sample clients
  const client1 = await db.client.create({
    data: {
      companyName: 'PT Maju Bersama Indonesia',
      npwp: '01.234.567.8-012.000',
      alamat: 'Jl. Rungkut Industri Raya No. 12',
      kota: 'Surabaya',
      picName: 'Budi Santoso',
      picTitle: 'HR Manager',
      whatsapp: '6281234567890',
      email: 'budi@majubersama.co.id',
      notes: 'Klien reguler, preferensi desain minimalis',
    }
  })

  const client2 = await db.client.create({
    data: {
      companyName: 'CV Berkah Abadi',
      npwp: '02.345.678.9-013.000',
      alamat: 'Jl. Ahmad Yani No. 45',
      kota: 'Sidoarjo',
      picName: 'Siti Nurhaliza',
      picTitle: 'Purchasing',
      whatsapp: '6282345678901',
      email: 'siti@berkahabadi.com',
      notes: 'Budget-conscious, sering minta diskon',
    }
  })

  // Create products with images and pricing tiers
  for (const p of products) {
    const { images, tiers, ...productData } = p
    const product = await db.product.create({
      data: {
        ...productData,
        images: {
          create: images,
        },
        pricingTiers: {
          create: tiers,
        },
      },
    })
    console.log(`  Created product: ${product.name}`)
  }

  // Create a sample quote
  const quoteNumber = `QUO/${new Date().getFullYear()}/01/0001`
  const quote = await db.quote.create({
    data: {
      quoteNumber,
      clientId: client1.id,
      status: 'pending',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      notes: 'Klien minta mockup terlebih dahulu',
      subtotal: 2750000,
      discPct: 5,
      discAmt: 137500,
      total: 2612500,
      dpPct: 50,
      dpAmount: 1306250,
      validUntil: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      createdById: admin.id,
      items: {
        create: [
          {
            productId: (await db.product.findFirst({ where: { slug: 'tumbler-stainless-500ml' } }))!.id,
            qty: 50,
            unitPrice: 55000,
            subtotal: 2750000,
            notes: 'Print logo 1 sisi',
          },
        ],
      },
    },
  })

  // Create inventory items
  const inventoryItems = [
    { name: 'Tumbler SS 500ml Kosongan', category: 'barang_kosongan', unit: 'pcs', currentStock: 200, minimumStock: 50, notes: 'Supplier: PT Stainless Indo' },
    { name: 'Tinta Sublimasi Hi-Res', category: 'bahan_cetak', unit: 'ml', currentStock: 5000, minimumStock: 1000, notes: 'Epson Original' },
    { name: 'Kertas Sublimasi A4', category: 'bahan_cetak', unit: 'lembar', currentStock: 3000, minimumStock: 500, notes: '110gsm' },
    { name: 'Box Kemasan Standard', category: 'bahan_kemas', unit: 'pcs', currentStock: 150, minimumStock: 30, notes: '30x20x10cm' },
    { name: 'Lanyard Blank Polyester', category: 'barang_kosongan', unit: 'pcs', currentStock: 500, minimumStock: 100, notes: '20mm width' },
  ]

  for (const item of inventoryItems) {
    await db.inventoryItem.create({ data: item })
  }

  console.log('Seed completed!')
  console.log(`  Admin: admin@corporategift.id / admin123`)
  console.log(`  Staff: staff@corporategift.id / staff123`)
  console.log(`  Products: ${products.length} items`)
  console.log(`  Clients: 2`)
  console.log(`  Quotes: 1`)
  console.log(`  Inventory Items: ${inventoryItems.length}`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => db.$disconnect())