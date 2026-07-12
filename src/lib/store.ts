import { create } from 'zustand'
import { pageToUrl, urlToPage, pushUrl, replaceUrl } from './url-router'

export type Page =
  | 'landing'
  | 'about'
  | 'catalog'
  | 'product-detail'
  | 'request-quote'
  | 'track'
  | 'admin-login'
  | 'admin-dashboard'
  | 'admin-products'
  | 'admin-products-form'
  | 'admin-quotes'
  | 'admin-quote-detail'
  | 'admin-orders'
  | 'admin-order-detail'
  | 'admin-clients'
  | 'admin-clients-form'
  | 'admin-inventory'
  | 'admin-inventory-form'
  | 'admin-users'
  | 'admin-settings'

export interface AdminUser {
  id: string
  name: string
  email: string
  role: string
}

interface AppStore {
  // Navigation
  currentPage: Page
  navigate: (page: Page) => void
  previousPage: Page
  pageParams: Record<string, string>
  scrollPositions: Record<string, number>
  navigateBack: () => void

  // Auth
  adminUser: AdminUser | null
  login: (user: AdminUser) => void
  logout: () => void
  isAuthenticated: boolean

  // Product detail
  selectedProductSlug: string | null
  selectProduct: (slug: string) => void

  // Quote detail
  selectedQuoteId: string | null
  selectQuote: (id: string) => void

  // Order detail
  selectedOrderId: string | null
  selectOrder: (id: string) => void

  // Client form
  selectedClientId: string | null
  selectClient: (id: string | null) => void

  // Inventory form
  selectedInventoryId: string | null
  selectInventory: (id: string | null) => void

  // RFQ pre-fill
  rfqProductSlug: string | null
  setRfqProductSlug: (slug: string | null) => void

  // Catalog filter
  catalogCategory: string
  setCatalogCategory: (cat: string) => void
}

// Flag to prevent popstate handler from running during programmatic navigation
let _isProgrammaticNav = false
let _routerInitialized = false

export const useAppStore = create<AppStore>((set, get) => {
  // Helper: push URL after store state change
  const syncToUrl = () => {
    const s = get()
    const url = pageToUrl(s.currentPage, {
      selectedProductSlug: s.selectedProductSlug,
      selectedQuoteId: s.selectedQuoteId,
      selectedOrderId: s.selectedOrderId,
      selectedClientId: s.selectedClientId,
      selectedInventoryId: s.selectedInventoryId,
      catalogCategory: s.catalogCategory,
    })
    _isProgrammaticNav = true
    pushUrl(url)
    // Reset flag after a microtask to let the pushState settle
    queueMicrotask(() => { _isProgrammaticNav = false })
  }

  return {
  // Navigation
  currentPage: 'landing',
  navigate: (page) => {
    const state = get()
    // Save current scroll position before leaving
    const positions = { ...state.scrollPositions }
    positions[state.currentPage] = window.scrollY
    set({
      previousPage: state.currentPage,
      currentPage: page,
      pageParams: {},
      scrollPositions: positions,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
    syncToUrl()
  },
  navigateBack: () => {
    // Use browser history back - popstate handler will update the store
    window.history.back()
  },
  previousPage: 'landing',
  pageParams: {},
  scrollPositions: {},

  // Auth
  adminUser: null,
  login: (user) => {
    // Only store a minimal flag — no token or PII in client storage
    try {
      sessionStorage.setItem('omamori_auth', '1')
    } catch { /* ignore */ }
    set({ adminUser: user, isAuthenticated: true })
  },
  logout: () => {
    // Invalidate token on server (cookie is sent automatically)
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {})
    try { sessionStorage.removeItem('omamori_auth') } catch { /* ignore */ }
    set({ adminUser: null, isAuthenticated: false, currentPage: 'landing' })
    pushUrl('/')
  },
  isAuthenticated: false,

  // Product detail
  selectedProductSlug: null,
  selectProduct: (slug) => {
    const state = get()
    // Save current scroll position before navigating
    const positions = { ...state.scrollPositions }
    positions[state.currentPage] = window.scrollY
    set({
      previousPage: state.currentPage,
      currentPage: 'product-detail',
      selectedProductSlug: slug,
      scrollPositions: positions,
      pageParams: {},
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
    syncToUrl()
  },

  // Quote detail
  selectedQuoteId: null,
  selectQuote: (id) => {
    const state = get()
    const positions = { ...state.scrollPositions }
    positions[state.currentPage] = window.scrollY
    set({
      previousPage: state.currentPage,
      currentPage: 'admin-quote-detail',
      selectedQuoteId: id,
      scrollPositions: positions,
      pageParams: {},
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
    syncToUrl()
  },

  // Order detail
  selectedOrderId: null,
  selectOrder: (id) => {
    const state = get()
    const positions = { ...state.scrollPositions }
    positions[state.currentPage] = window.scrollY
    set({
      previousPage: state.currentPage,
      currentPage: 'admin-order-detail',
      selectedOrderId: id,
      scrollPositions: positions,
      pageParams: {},
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
    syncToUrl()
  },

  // Client form
  selectedClientId: null,
  selectClient: (id) => {
    const state = get()
    const positions = { ...state.scrollPositions }
    positions[state.currentPage] = window.scrollY
    set({
      previousPage: state.currentPage,
      selectedClientId: id,
      currentPage: id ? 'admin-clients-form' : 'admin-clients',
      scrollPositions: positions,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
    syncToUrl()
  },

  // Inventory form
  selectedInventoryId: null,
  selectInventory: (id) => {
    const state = get()
    const positions = { ...state.scrollPositions }
    positions[state.currentPage] = window.scrollY
    set({
      previousPage: state.currentPage,
      selectedInventoryId: id,
      currentPage: id ? 'admin-inventory-form' : 'admin-inventory',
      scrollPositions: positions,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
    syncToUrl()
  },

  // RFQ pre-fill
  rfqProductSlug: null,
  setRfqProductSlug: (slug) => set({ rfqProductSlug: slug }),

  catalogCategory: 'all',
  setCatalogCategory: (cat) => {
    set({ catalogCategory: cat })
    // Update URL if currently on catalog page
    if (get().currentPage === 'catalog') {
      const url = pageToUrl('catalog', { catalogCategory: cat })
      _isProgrammaticNav = true
      replaceUrl(url)
      queueMicrotask(() => { _isProgrammaticNav = false })
    }
  },
  };
});

// --- Client-side URL routing initialization ---

/**
 * Initialize URL routing: parse initial URL and set up popstate listener.
 * Call once on the client, e.g. in page.tsx useEffect.
 */
export async function initUrlRouter() {
  if (typeof window === 'undefined') return
  if (_routerInitialized) return
  _routerInitialized = true

  // Verify auth session via server (httpOnly cookie)
  try {
    const saved = sessionStorage.getItem('omamori_auth')
    if (saved) {
      // Flag exists — verify the actual session with the server
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        useAppStore.setState({ adminUser: data.user, isAuthenticated: true })
      } else {
        // Token expired or invalid — clear the flag
        sessionStorage.removeItem('omamori_auth')
      }
    }
  } catch { /* ignore network errors */ }

  // Parse initial URL and set store state accordingly
  const parsed = urlToPage(window.location.pathname, window.location.search)

  // Only update if the URL suggests a non-landing page
  if (parsed.page !== 'landing') {
    useAppStore.setState({
      currentPage: parsed.page,
      selectedProductSlug: parsed.selectedProductSlug,
      selectedQuoteId: parsed.selectedQuoteId,
      selectedOrderId: parsed.selectedOrderId,
      selectedClientId: parsed.selectedClientId,
      selectedInventoryId: parsed.selectedInventoryId,
      catalogCategory: parsed.catalogCategory,
    })
    // Replace URL to canonical form (e.g., normalize trailing slashes)
    const canonicalUrl = pageToUrl(parsed.page, {
      selectedProductSlug: parsed.selectedProductSlug,
      selectedQuoteId: parsed.selectedQuoteId,
      selectedOrderId: parsed.selectedOrderId,
      selectedClientId: parsed.selectedClientId,
      selectedInventoryId: parsed.selectedInventoryId,
      catalogCategory: parsed.catalogCategory,
    })
    replaceUrl(canonicalUrl)
  } else if (window.location.pathname !== '/') {
    // Unknown URL → redirect to landing
    replaceUrl('/')
  }

  // Listen for browser back/forward
  window.addEventListener('popstate', () => {
    if (_isProgrammaticNav) return

    const parsed = urlToPage(window.location.pathname, window.location.search)
    const state = useAppStore.getState()
    const savedScroll = state.scrollPositions[parsed.page]

    useAppStore.setState({
      previousPage: state.currentPage,
      currentPage: parsed.page,
      selectedProductSlug: parsed.selectedProductSlug,
      selectedQuoteId: parsed.selectedQuoteId,
      selectedOrderId: parsed.selectedOrderId,
      selectedClientId: parsed.selectedClientId,
      selectedInventoryId: parsed.selectedInventoryId,
      catalogCategory: parsed.catalogCategory,
    })

    // Restore scroll position after a short delay for the page to render
    if (savedScroll !== undefined) {
      requestAnimationFrame(() => {
        window.scrollTo({ top: savedScroll, behavior: 'instant' as ScrollBehavior })
      })
    } else {
      window.scrollTo({ top: 0 })
    }
  })
}