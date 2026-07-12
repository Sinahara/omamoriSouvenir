import type { Page } from './store'

/**
 * Client-side URL router for SPA navigation.
 * Maps Page + params to URL paths and vice versa using History API.
 */

// --- Page → URL ---

export function pageToUrl(
  page: Page,
  params: {
    selectedProductSlug?: string | null
    selectedQuoteId?: string | null
    selectedOrderId?: string | null
    selectedClientId?: string | null
    selectedInventoryId?: string | null
    catalogCategory?: string
  } = {}
): string {
  switch (page) {
    case 'landing': return '/'
    case 'about': return '/tentang'
    case 'catalog': {
      let url = '/katalog'
      if (params.catalogCategory && params.catalogCategory !== 'all') {
        url += `?kategori=${encodeURIComponent(params.catalogCategory)}`
      }
      return url
    }
    case 'product-detail':
      return `/produk/${params.selectedProductSlug || ''}`
    case 'request-quote': return '/penawaran'
    case 'track': return '/lacak'
    case 'admin-login': return '/admin/masuk'
    case 'admin-dashboard': return '/admin'
    case 'admin-products': return '/admin/produk'
    case 'admin-products-form':
      return '/admin/produk'
    case 'admin-quotes': return '/admin/penawaran'
    case 'admin-quote-detail':
      return `/admin/penawaran/${params.selectedQuoteId || ''}`
    case 'admin-orders': return '/admin/pesanan'
    case 'admin-order-detail':
      return `/admin/pesanan/${params.selectedOrderId || ''}`
    case 'admin-clients': return '/admin/klien'
    case 'admin-clients-form':
      return params.selectedClientId ? `/admin/klien/${params.selectedClientId}` : '/admin/klien/baru'
    case 'admin-inventory': return '/admin/stok'
    case 'admin-inventory-form':
      return params.selectedInventoryId ? `/admin/stok/${params.selectedInventoryId}` : '/admin/stok/baru'
    case 'admin-users': return '/admin/pengguna'
    case 'admin-settings': return '/admin/pengaturan'
    default: return '/'
  }
}

// --- URL → Page + params ---

interface UrlParseResult {
  page: Page
  selectedProductSlug: string | null
  selectedQuoteId: string | null
  selectedOrderId: string | null
  selectedClientId: string | null
  selectedInventoryId: string | null
  catalogCategory: string
}

export function urlToPage(pathname: string, search: string): UrlParseResult {
  const searchParams = new URLSearchParams(search)
  const path = pathname.replace(/\/+$/, '') || '/'

  // --- Admin routes ---
  if (path.startsWith('/admin')) {
    const rest = path.replace('/admin', '') || ''

    // /admin
    if (rest === '' || rest === '/') {
      return {
        page: 'admin-dashboard',
        selectedProductSlug: null, selectedQuoteId: null,
        selectedOrderId: null, selectedClientId: null,
        selectedInventoryId: null, catalogCategory: 'all',
      }
    }

    const segments = rest.split('/').filter(Boolean)

    // /admin/masuk
    if (segments[0] === 'masuk' && segments.length === 1) {
      return {
        page: 'admin-login',
        selectedProductSlug: null, selectedQuoteId: null,
        selectedOrderId: null, selectedClientId: null,
        selectedInventoryId: null, catalogCategory: 'all',
      }
    }

    // /admin/produk
    if (segments[0] === 'produk') {
      if (segments.length === 1) {
        return {
          page: 'admin-products',
          selectedProductSlug: null, selectedQuoteId: null,
          selectedOrderId: null, selectedClientId: null,
          selectedInventoryId: null, catalogCategory: 'all',
        }
      }
      // /admin/produk/baru or /admin/produk/:id → map back to list
      return {
        page: 'admin-products',
        selectedProductSlug: null, selectedQuoteId: null,
        selectedOrderId: null, selectedClientId: null,
        selectedInventoryId: null, catalogCategory: 'all',
      }
    }

    // /admin/penawaran
    if (segments[0] === 'penawaran') {
      if (segments.length === 1) {
        return {
          page: 'admin-quotes',
          selectedProductSlug: null, selectedQuoteId: null,
          selectedOrderId: null, selectedClientId: null,
          selectedInventoryId: null, catalogCategory: 'all',
        }
      }
      // /admin/penawaran/:id
      return {
        page: 'admin-quote-detail',
        selectedProductSlug: null,
        selectedQuoteId: segments[1],
        selectedOrderId: null, selectedClientId: null,
        selectedInventoryId: null, catalogCategory: 'all',
      }
    }

    // /admin/pesanan
    if (segments[0] === 'pesanan') {
      if (segments.length === 1) {
        return {
          page: 'admin-orders',
          selectedProductSlug: null, selectedQuoteId: null,
          selectedOrderId: null, selectedClientId: null,
          selectedInventoryId: null, catalogCategory: 'all',
        }
      }
      // /admin/pesanan/:id
      return {
        page: 'admin-order-detail',
        selectedProductSlug: null, selectedQuoteId: null,
        selectedOrderId: segments[1],
        selectedClientId: null,
        selectedInventoryId: null, catalogCategory: 'all',
      }
    }

    // /admin/klien
    if (segments[0] === 'klien') {
      if (segments.length === 1) {
        return {
          page: 'admin-clients',
          selectedProductSlug: null, selectedQuoteId: null,
          selectedOrderId: null, selectedClientId: null,
          selectedInventoryId: null, catalogCategory: 'all',
        }
      }
      // /admin/klien/baru or /admin/klien/:id
      return {
        page: 'admin-clients-form',
        selectedProductSlug: null, selectedQuoteId: null,
        selectedOrderId: null,
        selectedClientId: segments[1] === 'baru' ? null : segments[1],
        selectedInventoryId: null, catalogCategory: 'all',
      }
    }

    // /admin/stok
    if (segments[0] === 'stok') {
      if (segments.length === 1) {
        return {
          page: 'admin-inventory',
          selectedProductSlug: null, selectedQuoteId: null,
          selectedOrderId: null, selectedClientId: null,
          selectedInventoryId: null, catalogCategory: 'all',
        }
      }
      // /admin/stok/baru or /admin/stok/:id
      return {
        page: 'admin-inventory-form',
        selectedProductSlug: null, selectedQuoteId: null,
        selectedOrderId: null, selectedClientId: null,
        selectedInventoryId: segments[1] === 'baru' ? null : segments[1],
        catalogCategory: 'all',
      }
    }

    // /admin/pengguna
    if (segments[0] === 'pengguna' && segments.length === 1) {
      return {
        page: 'admin-users',
        selectedProductSlug: null, selectedQuoteId: null,
        selectedOrderId: null, selectedClientId: null,
        selectedInventoryId: null, catalogCategory: 'all',
      }
    }

    // /admin/pengaturan
    if (segments[0] === 'pengaturan' && segments.length === 1) {
      return {
        page: 'admin-settings',
        selectedProductSlug: null, selectedQuoteId: null,
        selectedOrderId: null, selectedClientId: null,
        selectedInventoryId: null, catalogCategory: 'all',
      }
    }

    // Unknown admin route → fallback to dashboard
    return {
      page: 'admin-dashboard',
      selectedProductSlug: null, selectedQuoteId: null,
      selectedOrderId: null, selectedClientId: null,
      selectedInventoryId: null, catalogCategory: 'all',
    }
  }

  // --- Public routes ---

  // /
  if (path === '/') {
    return {
      page: 'landing',
      selectedProductSlug: null, selectedQuoteId: null,
      selectedOrderId: null, selectedClientId: null,
      selectedInventoryId: null, catalogCategory: 'all',
    }
  }

  const segments = path.split('/').filter(Boolean)

  // /tentang
  if (segments[0] === 'tentang' && segments.length === 1) {
    return {
      page: 'about',
      selectedProductSlug: null, selectedQuoteId: null,
      selectedOrderId: null, selectedClientId: null,
      selectedInventoryId: null, catalogCategory: 'all',
    }
  }

  // /katalog
  if (segments[0] === 'katalog' && segments.length === 1) {
    return {
      page: 'catalog',
      selectedProductSlug: null, selectedQuoteId: null,
      selectedOrderId: null, selectedClientId: null,
      selectedInventoryId: null,
      catalogCategory: searchParams.get('kategori') || 'all',
    }
  }

  // /produk/:slug
  if (segments[0] === 'produk' && segments.length === 2) {
    return {
      page: 'product-detail',
      selectedProductSlug: segments[1],
      selectedQuoteId: null,
      selectedOrderId: null, selectedClientId: null,
      selectedInventoryId: null, catalogCategory: 'all',
    }
  }

  // /penawaran
  if (segments[0] === 'penawaran' && segments.length === 1) {
    return {
      page: 'request-quote',
      selectedProductSlug: null, selectedQuoteId: null,
      selectedOrderId: null, selectedClientId: null,
      selectedInventoryId: null, catalogCategory: 'all',
    }
  }

  // /lacak
  if (segments[0] === 'lacak' && segments.length === 1) {
    return {
      page: 'track',
      selectedProductSlug: null, selectedQuoteId: null,
      selectedOrderId: null, selectedClientId: null,
      selectedInventoryId: null, catalogCategory: 'all',
    }
  }

  // Unknown route → landing
  return {
    page: 'landing',
    selectedProductSlug: null, selectedQuoteId: null,
    selectedOrderId: null, selectedClientId: null,
    selectedInventoryId: null, catalogCategory: 'all',
  }
}

/**
 * Push a new URL to the browser history without triggering a navigation.
 */
export function pushUrl(url: string, title: string = ''): void {
  if (typeof window === 'undefined') return
  window.history.pushState({}, title, url)
}

/**
 * Replace the current URL in the browser history (no new entry).
 */
export function replaceUrl(url: string, title: string = ''): void {
  if (typeof window === 'undefined') return
  window.history.replaceState({}, title, url)
}