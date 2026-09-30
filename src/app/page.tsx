'use client'

import dynamic from 'next/dynamic'
import { useEffect,useState } from 'react'
import { motion, AnimatePresence, MotionConfig } from 'framer-motion'
import { useAppStore, initUrlRouter, takePendingScroll, restoreScroll } from '@/lib/store'
import { Skeleton } from '@/components/ui/skeleton'
import { PageSkeleton, HeaderSkeleton, HeroSkeleton } from '@/components/page-skeleton'
import { ErrorBoundary } from '@/components/error-boundary'

const PAGE_TITLES: Record<string, string> = {
  landing: 'Omamori Souvenir — Solusi Corporate Gift Premium',
  about: 'Tentang Kami — Omamori Souvenir',
  catalog: 'Katalog Produk — Omamori Souvenir',
  'product-detail': 'Detail Produk — Omamori Souvenir',
  'request-quote': 'Minta Penawaran — Omamori Souvenir',
  track: 'Lacak Pesanan — Omamori Souvenir',
  'admin-login': 'Login Admin — Omamori Souvenir',
  'admin-dashboard': 'Dashboard — Omamori Souvenir Admin',
  'admin-products': 'Produk — Omamori Souvenir Admin',
  'admin-quotes': 'Penawaran — Omamori Souvenir Admin',
  'admin-orders': 'Pesanan — Omamori Souvenir Admin',
  'admin-clients': 'Klien — Omamori Souvenir Admin',
  'admin-inventory': 'Inventaris — Omamori Souvenir Admin',
  'admin-users': 'Pengguna — Omamori Souvenir Admin',
  'admin-settings': 'Pengaturan — Omamori Souvenir Admin',
}

const PAGE_DESCRIPTIONS: Record<string, string> = {
  landing: 'Dari tumbler custom hingga employee onboarding kit lengkap. Zero inventory, mockup premium, dokumen lengkap. Melayani area Surabaya & Sidoarjo.',
  about: 'Kenali Omamori Souvenir: corporate gift custom untuk perusahaan di Surabaya dan Sidoarjo, dari tumbler sampai paket onboarding karyawan.',
  catalog: 'Temukan corporate gift yang tepat untuk bisnis Anda. Tumbler, plakat, lanyard, hardbox, goodie bag, dan starter kit.',
  'product-detail': 'Lihat detail produk, spesifikasi, dan harga corporate gift premium dari Omamori Souvenir.',
  'request-quote': 'Minta penawaran corporate gift custom. Isi form, dapatkan quotation resmi dalam 1x24 jam.',
  track: 'Lacak status pesanan corporate gift Anda secara real-time dengan nomor pesanan.',
}

// Shown while a page's code chunk downloads (slow networks, low-end phones)
const pageLoader = () => <div className="max-w-6xl mx-auto px-4 py-12 md:py-20 space-y-6"><Skeleton className="h-8 w-48 mx-auto" /><Skeleton className="h-5 w-full max-w-sm mx-auto" /><Skeleton className="h-64 w-full" /></div>

// Code-split: each page loads only when needed
const Navbar = dynamic(() => import('@/components/public/navbar'), { ssr: false, loading: () => <HeaderSkeleton /> })
const Footer = dynamic(() => import('@/components/public/footer'), { ssr: false })
const Landing = dynamic(() => import('@/components/public/landing'), { ssr: false, loading: () => <HeroSkeleton /> })
const About = dynamic(() => import('@/components/public/about'), { ssr: false, loading: pageLoader })
const Catalog = dynamic(() => import('@/components/public/catalog'), {
  ssr: false,
  loading: () => <div className="max-w-6xl mx-auto px-4 py-12 md:py-20 space-y-6"><Skeleton className="h-8 w-48 mx-auto" /><Skeleton className="h-5 w-full max-w-sm mx-auto" /><div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-5 md:gap-6"><Skeleton className="aspect-square w-full" /><Skeleton className="aspect-square w-full" /><Skeleton className="aspect-square w-full" /></div></div>,
})
const ProductDetail = dynamic(() => import('@/components/public/product-detail'), { ssr: false, loading: pageLoader })
const RequestQuote = dynamic(() => import('@/components/public/request-quote'), { ssr: false, loading: pageLoader })
const TrackOrder = dynamic(() => import('@/components/public/track-order'), { ssr: false, loading: pageLoader })

const adminSkeleton = <div className="p-6 space-y-6"><Skeleton className="h-8 w-48" /><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"><Skeleton className="h-28 w-full" /><Skeleton className="h-28 w-full" /><Skeleton className="h-28 w-full" /><Skeleton className="h-28 w-full" /></div><Skeleton className="h-64 w-full" /></div>

const AdminLayout = dynamic(() => import('@/components/admin/admin-layout'), { ssr: false })
const AdminDashboard = dynamic(() => import('@/components/admin/dashboard'), { ssr: false, loading: () => adminSkeleton })
const AdminProducts = dynamic(() => import('@/components/admin/products'), { ssr: false, loading: () => adminSkeleton })
const AdminQuotes = dynamic(() => import('@/components/admin/quotes'), { ssr: false, loading: () => adminSkeleton })
const AdminQuoteDetail = dynamic(() => import('@/components/admin/quote-detail'), { ssr: false, loading: () => adminSkeleton })
const AdminOrders = dynamic(() => import('@/components/admin/orders'), { ssr: false, loading: () => adminSkeleton })
const AdminOrderDetail = dynamic(() => import('@/components/admin/order-detail'), { ssr: false, loading: () => adminSkeleton })
const AdminClients = dynamic(() => import('@/components/admin/clients'), { ssr: false, loading: () => adminSkeleton })
const AdminInventory = dynamic(() => import('@/components/admin/inventory'), { ssr: false, loading: () => adminSkeleton })
const AdminUsers = dynamic(() => import('@/components/admin/users'), { ssr: false, loading: () => adminSkeleton })
const AdminSettings = dynamic(() => import('@/components/admin/settings'), { ssr: false, loading: () => adminSkeleton })

const publicPages = ['landing', 'about', 'catalog', 'product-detail', 'request-quote', 'track'] as const

// Runs once the outgoing page has faded out, so it never visibly scrolls
function applyPendingScroll() {
  const y = takePendingScroll()
  if (y !== null) restoreScroll(y)
}

function AdminPageRouter() {
  const { currentPage } = useAppStore()

  switch (currentPage) {
    case 'admin-dashboard':
      return <AdminDashboard />
    case 'admin-products':
    case 'admin-products-form':
      return <AdminProducts />
    case 'admin-quotes':
      return <AdminQuotes />
    case 'admin-quote-detail':
      return <AdminQuoteDetail />
    case 'admin-orders':
      return <AdminOrders />
    case 'admin-order-detail':
      return <AdminOrderDetail />
    case 'admin-clients':
    case 'admin-clients-form':
      return <AdminClients />
    case 'admin-inventory':
    case 'admin-inventory-form':
      return <AdminInventory />
    case 'admin-users':
      return <AdminUsers />
    case 'admin-settings':
      return <AdminSettings />
    default:
      return <AdminDashboard />
  }
}

export default function Home() {
  const { currentPage } = useAppStore()
  const [isRouterReady, setIsRouterReady] = useState(false)
  const isPublic = publicPages.includes(currentPage as typeof publicPages[number])

  // Initialize URL routing on first mount. Render only after the session check,
  // otherwise a logged-in admin briefly sees the landing page on refresh.
  useEffect(() => {
    let active = true
    initUrlRouter().finally(() => {
      if (active) setIsRouterReady(true)
    })
    return () => { active = false }
  }, [])

  // Switching between the public site and admin has no exit animation
  useEffect(() => {
    applyPendingScroll()
  }, [isPublic])

  // Dynamic document title & meta description
  useEffect(() => {
    document.title = PAGE_TITLES[currentPage] || PAGE_TITLES.landing
    const desc = PAGE_DESCRIPTIONS[currentPage]
    if (desc) {
      let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null
      if (meta) {
        meta.content = desc
      } else {
        meta = document.createElement('meta')
        meta.name = 'description'
        meta.content = desc
        document.head.appendChild(meta)
      }
    }
  }, [currentPage])
  if (!isRouterReady) {
    return <PageSkeleton />
  }

  const renderPublicPage = () => {
    switch (currentPage) {
      case 'landing':
        return <Landing />
      case 'about':
        return <About />
      case 'catalog':
        return <Catalog />
      case 'product-detail':
        return <ProductDetail />
      case 'request-quote':
        return <RequestQuote />
      case 'track':
        return <TrackOrder />
      default:
        return <Landing />
    }
  }

  if (!isPublic) {
    return (
      <MotionConfig reducedMotion="user">
        <AdminLayout>
          <ErrorBoundary>
            <AnimatePresence mode="wait" onExitComplete={applyPendingScroll}>
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
              >
                <AdminPageRouter />
              </motion.div>
            </AnimatePresence>
          </ErrorBoundary>
        </AdminLayout>
      </MotionConfig>
    )
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-white flex flex-col">
        <Navbar />
        <main className="flex-1">
          <ErrorBoundary>
            <AnimatePresence mode="wait" onExitComplete={applyPendingScroll}>
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                {renderPublicPage()}
              </motion.div>
            </AnimatePresence>
          </ErrorBoundary>
        </main>
        <Footer />
      </div>
    </MotionConfig>
  )
}