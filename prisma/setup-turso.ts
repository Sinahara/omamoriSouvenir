import { createClient } from '@libsql/client'
import { hash } from 'bcryptjs'
import 'dotenv/config'

// Strip authToken from URL if present (it's passed separately via DATABASE_AUTH_TOKEN)
function cleanUrl(url: string): string {
  return url.split('?')[0]
}

const client = createClient({
  url: cleanUrl(process.env.DATABASE_URL!),
  authToken: process.env.DATABASE_AUTH_TOKEN!,
})

async function main() {
  const url = cleanUrl(process.env.DATABASE_URL!)
  const token = process.env.DATABASE_AUTH_TOKEN!
  console.log('🔄 Setting up Turso database...')
  console.log(`   Clean URL: ${url}`)
  console.log(`   Auth Token (first 30): ${token.substring(0, 30)}...`)
  console.log(`   Auth Token length: ${token.length}`)

  // Create all tables
  const createTableStatements = [
    `CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "password" TEXT NOT NULL,
      "role" TEXT NOT NULL DEFAULT 'staff',
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")`,

    `CREATE TABLE IF NOT EXISTS "Session" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "userId" TEXT NOT NULL,
      "token" TEXT NOT NULL,
      "expiresAt" DATETIME NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "Session_token_key" ON "Session"("token")`,

    `CREATE TABLE IF NOT EXISTS "Client" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "companyName" TEXT NOT NULL,
      "npwp" TEXT,
      "alamat" TEXT,
      "kota" TEXT,
      "picName" TEXT NOT NULL,
      "picTitle" TEXT,
      "whatsapp" TEXT NOT NULL,
      "email" TEXT NOT NULL,
      "notes" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL
    )`,

    `CREATE TABLE IF NOT EXISTS "Product" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "slug" TEXT NOT NULL,
      "category" TEXT NOT NULL,
      "description" TEXT,
      "specs" TEXT,
      "basePrice" REAL NOT NULL DEFAULT 0,
      "unit" TEXT NOT NULL DEFAULT 'pcs',
      "minQty" INTEGER NOT NULL DEFAULT 1,
      "isActive" INTEGER NOT NULL DEFAULT 1,
      "sortOrder" INTEGER NOT NULL DEFAULT 0,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "Product_slug_key" ON "Product"("slug")`,

    `CREATE TABLE IF NOT EXISTS "ProductImage" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "productId" TEXT NOT NULL,
      "path" TEXT NOT NULL,
      "isPrimary" INTEGER NOT NULL DEFAULT 0,
      "sortOrder" INTEGER NOT NULL DEFAULT 0,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS "PricingTier" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "productId" TEXT NOT NULL,
      "minQty" INTEGER NOT NULL,
      "maxQty" INTEGER,
      "pricePerUnit" REAL NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS "Quote" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "quoteNumber" TEXT NOT NULL,
      "clientId" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'pending',
      "deadline" DATETIME,
      "notes" TEXT,
      "subtotal" REAL NOT NULL DEFAULT 0,
      "discPct" REAL NOT NULL DEFAULT 0,
      "discAmt" REAL NOT NULL DEFAULT 0,
      "total" REAL NOT NULL DEFAULT 0,
      "dpPct" REAL NOT NULL DEFAULT 50,
      "dpAmount" REAL NOT NULL DEFAULT 0,
      "validUntil" DATETIME,
      "createdById" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "Quote_quoteNumber_key" ON "Quote"("quoteNumber")`,

    `CREATE TABLE IF NOT EXISTS "QuoteItem" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "quoteId" TEXT NOT NULL,
      "productId" TEXT,
      "customDescription" TEXT,
      "qty" INTEGER NOT NULL,
      "unitPrice" REAL NOT NULL,
      "subtotal" REAL NOT NULL,
      "notes" TEXT
    )`,

    `CREATE TABLE IF NOT EXISTS "Order" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "orderNumber" TEXT NOT NULL,
      "quoteId" TEXT NOT NULL,
      "clientId" TEXT NOT NULL,
      "status" TEXT NOT NULL DEFAULT 'dp_pending',
      "dpPaidAt" DATETIME,
      "dpAmount" REAL NOT NULL DEFAULT 0,
      "balanceDue" REAL NOT NULL DEFAULT 0,
      "balancePaidAt" DATETIME,
      "vendorTracking" TEXT,
      "shippedAt" DATETIME,
      "receivedAt" DATETIME,
      "productionNotes" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "Order_orderNumber_key" ON "Order"("orderNumber")`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "Order_quoteId_key" ON "Order"("quoteId")`,

    `CREATE TABLE IF NOT EXISTS "Document" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "documentableType" TEXT NOT NULL,
      "documentableId" TEXT NOT NULL,
      "type" TEXT NOT NULL,
      "path" TEXT NOT NULL,
      "filename" TEXT NOT NULL,
      "notes" TEXT,
      "createdById" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS "SiteSetting" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "key" TEXT NOT NULL,
      "value" TEXT NOT NULL DEFAULT '',
      "updatedAt" DATETIME NOT NULL
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "SiteSetting_key_key" ON "SiteSetting"("key")`,

    `CREATE TABLE IF NOT EXISTS "InventoryItem" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "category" TEXT NOT NULL,
      "unit" TEXT NOT NULL,
      "currentStock" REAL NOT NULL DEFAULT 0,
      "minimumStock" REAL NOT NULL DEFAULT 0,
      "notes" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL
    )`,

    `CREATE TABLE IF NOT EXISTS "InventoryTransaction" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "itemId" TEXT NOT NULL,
      "orderId" TEXT,
      "type" TEXT NOT NULL,
      "qty" REAL NOT NULL,
      "refNumber" TEXT,
      "notes" TEXT,
      "createdById" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`,
  ]

  console.log('📦 Creating tables...')
  for (const sql of createTableStatements) {
    await client.execute(sql)
  }
  console.log('✅ All tables created!')

  // Check if admin user already exists
  const existingAdmin = await client.execute({
    sql: 'SELECT id FROM "User" WHERE email = ?',
    args: ['admin@corporategift.id'],
  })

  if (existingAdmin.rows.length > 0) {
    console.log('ℹ️  Admin user already exists, skipping user seed.')
  } else {
    // Create admin user
    const adminPassword = await hash('admin123', 12)
    const now = new Date().toISOString()
    await client.execute({
      sql: `INSERT INTO "User" ("id", "name", "email", "password", "role", "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [generateCuid(), 'Super Admin', 'admin@corporategift.id', adminPassword, 'super_admin', now, now],
    })
    console.log('✅ Admin user created: admin@corporategift.id / admin123')

    // Create staff user
    const staffPassword = await hash('staff123', 12)
    await client.execute({
      sql: `INSERT INTO "User" ("id", "name", "email", "password", "role", "createdAt", "updatedAt") VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [generateCuid(), 'Staff Operator', 'staff@corporategift.id', staffPassword, 'staff', now, now],
    })
    console.log('✅ Staff user created: staff@corporategift.id / staff123')
  }

  // Verify
  const users = await client.execute('SELECT id, name, email, role FROM "User"')
  console.log('\n📋 Users in database:')
  for (const row of users.rows) {
    console.log(`   - ${row.name} (${row.email}) [${row.role}]`)
  }

  console.log('\n🎉 Database setup complete!')
}

function generateCuid(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 10)
  return `c${timestamp}${random}`
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
