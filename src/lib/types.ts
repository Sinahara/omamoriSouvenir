export interface Product {
  id: string
  name: string
  slug: string
  category: string
  description: string | null
  specs: string | null
  basePrice: number
  unit: string
  minQty: number
  isActive: boolean
  sortOrder: number
  images: ProductImage[]
  pricingTiers: PricingTier[]
}

export interface ProductImage {
  id: string
  productId: string
  path: string
  isPrimary: boolean
  sortOrder: number
}

export interface PricingTier {
  id: string
  productId: string
  minQty: number
  maxQty: number | null
  pricePerUnit: number
}

export interface Client {
  id: string
  companyName: string
  npwp: string | null
  alamat: string | null
  kota: string | null
  picName: string
  picTitle: string | null
  whatsapp: string
  email: string
  notes: string | null
  _count?: { quotes: number; orders: number }
}

export interface Quote {
  id: string
  quoteNumber: string
  clientId: string
  status: string
  deadline: string | null
  notes: string | null
  subtotal: number
  discPct: number
  discAmt: number
  total: number
  dpPct: number
  dpAmount: number
  validUntil: string | null
  createdById: string
  createdAt: string
  updatedAt: string
  client?: Client
  items?: QuoteItem[]
  order?: Order | null
}

export interface QuoteItem {
  id: string
  quoteId: string
  productId: string | null
  customDescription: string | null
  qty: number
  unitPrice: number
  subtotal: number
  notes: string | null
  product?: Product | null
}

export interface Order {
  id: string
  orderNumber: string
  quoteId: string
  clientId: string
  status: string
  dpPaidAt: string | null
  dpAmount: number
  balanceDue: number
  balancePaidAt: string | null
  vendorTracking: string | null
  shippedAt: string | null
  receivedAt: string | null
  productionNotes: string | null
  createdAt: string
  updatedAt: string
  client?: Client
  quote?: Quote
}

export interface InventoryItem {
  id: string
  name: string
  category: string
  unit: string
  currentStock: number
  minimumStock: number
  notes: string | null
  transactions?: InventoryTransaction[]
}

export interface InventoryTransaction {
  id: string
  itemId: string
  orderId: string | null
  type: string
  qty: number
  refNumber: string | null
  notes: string | null
  createdAt: string
}

export interface DashboardData {
  todayQuotes: number
  activeOrders: number
  monthlyRevenue: number
  clientCount: number
  todayQuotesCount: number
  activeOrdersCount: number
  pendingQuotes: Quote[]
  lowStockItems: InventoryItem[]
  revenueByMonth: { month: string; total: number }[]
}

export const CATEGORIES = [
  { value: 'all', label: 'Semua', icon: 'Grid3x3' },
  { value: 'tumbler', label: 'Tumbler', icon: 'CupSoda' },
  { value: 'plakat', label: 'Plakat', icon: 'Award' },
  { value: 'lanyard', label: 'Lanyard', icon: 'IdCard' },
  { value: 'hardbox', label: 'Hardbox', icon: 'Box' },
  { value: 'goodie_bag', label: 'Goodie Bag', icon: 'ShoppingBag' },
  { value: 'starter_kit', label: 'Starter Kit', icon: 'Briefcase' },
] as const

export const ORDER_STATUSES = [
  { value: 'dp_pending', label: 'Menunggu DP', color: 'tag-amber' },
  { value: 'bahan_dipesan', label: 'Bahan Dipesan', color: 'tag-blue' },
  { value: 'produksi', label: 'Produksi', color: 'tag-amber' },
  { value: 'qc', label: 'Quality Check', color: 'tag-purple' },
  { value: 'siap_kirim', label: 'Siap Kirim', color: 'tag-blue' },
  { value: 'dikirim', label: 'Dikirim', color: 'tag-green' },
  { value: 'lunas', label: 'Lunas', color: 'tag-green' },
] as const

export const QUOTE_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'tag-amber' },
  { value: 'diproses', label: 'Diproses', color: 'tag-blue' },
  { value: 'dikirim', label: 'Dikirim', color: 'tag-purple' },
  { value: 'accepted', label: 'Diterima', color: 'tag-green' },
  { value: 'rejected', label: 'Ditolak', color: 'tag-red' },
] as const

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getStatusLabel(status: string, statuses: readonly { value: string; label: string }[]): string {
  return statuses.find(s => s.value === status)?.label || status
}

export function getStatusColor(status: string, statuses: readonly { value: string; label: string; color: string }[]): string {
  return statuses.find(s => s.value === status)?.color || 'tag-gray'
}