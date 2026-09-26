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
let _routerInit: Promise<void> | null = null

// Scroll target for the next page. page.tsx applies it once the old page has
// faded out, so the outgoing page never visibly scrolls.
let _pendingScroll: number | null = null

/** Queue a jump to the top for a page change, or scroll now if the page stays the same. */
function scheduleScrollTop(fromPage: Page, toPage: Page) {
  if (fromPage === toPage) window.scrollTo({ top: 0, behavior: 'smooth' })
  else _pendingScroll = 0
}

export function takePendingScroll(): number | null {
  const y = _pendingScroll
  _pendingScroll = null
  return y
}

/**
 * Jump to y without animation. Pages that load data (e.g. the catalog) may not
 * be tall enough yet, so this retries briefly and stops once the user scrolls.
 */
export function restoreScroll(y: number) {
  let cancelled = false
  const cancel = () => { cancelled = true }
  const events = ['wheel', 'touchstart', 'keydown'] as const
  events.forEach((e) => window.addEventListener(e, cancel, { once: true, passive: true }))
  const started = performance.now()
  const step = () => {
    if (cancelled) return
    window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior })
    if (Math.abs(window.scrollY - y) > 2 && performance.now() - started < 1500) {
      requestAnimationFrame(step)
    } else {
      events.forEach((e) => window.removeEventListener(e, cancel))
    }
  }
  step()
}

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
    scheduleScrollTop(state.currentPage, page)
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
    _pendingScroll = 0
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
    scheduleScrollTop(state.currentPage, 'product-detail')
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
    scheduleScrollTop(state.currentPage, 'admin-quote-detail')
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
    scheduleScrollTop(state.currentPage, 'admin-order-detail')
    syncToUrl()
  },

  // Client form
  selectedClientId: null,
  selectClient: (id) => {
    const state = get()
    const positions = { ...state.scrollPositions }
    positions[state.currentPage] = window.scrollY
    const next: Page = id ? 'admin-clients-form' : 'admin-clients'
    set({
      previousPage: state.currentPage,
      selectedClientId: id,
      currentPage: next,
      scrollPositions: positions,
    })
    scheduleScrollTop(state.currentPage, next)
    syncToUrl()
  },

  // Inventory form
  selectedInventoryId: null,
  selectInventory: (id) => {
    const state = get()
    const positions = { ...state.scrollPositions }
    positions[state.currentPage] = window.scrollY
    const next: Page = id ? 'admin-inventory-form' : 'admin-inventory'
    set({
      previousPage: state.currentPage,
      selectedInventoryId: id,
      currentPage: next,
      scrollPositions: positions,
    })
    scheduleScrollTop(state.currentPage, next)
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
 * Safe to call more than once: every caller gets the same promise, which
 * resolves after the session check, so the first render shows the right page.
 */
/**
 * This runs from a child effect, before Next.js patches history.replaceState in
 * its app-router effect. The unpatched call would drop Next's router state from
 * the history entry, and pressing Back to that entry would reload the whole page.
 * Waiting one tick lets the patched version keep that state.
 */
function replaceUrlAfterNextPatch(url: string) {
  setTimeout(() => replaceUrl(url), 0)
}

export function initUrlRouter(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if (!_routerInit) _routerInit = setupUrlRouter()
  return _routerInit
}

async function setupUrlRouter() {
  // Scroll positions are restored by the app (see restoreScroll), not the browser
  if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual'

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
    if (window.location.pathname + window.location.search !== canonicalUrl) {
      replaceUrlAfterNextPatch(canonicalUrl)
    }
  } else if (window.location.pathname !== '/') {
    // Unknown URL → redirect to landing
    replaceUrlAfterNextPatch('/')
  }

  // Listen for browser back/forward
  window.addEventListener('popstate', () => {
    if (_isProgrammaticNav) return

    const parsed = urlToPage(window.location.pathname, window.location.search)
    const state = useAppStore.getState()
    const target = state.scrollPositions[parsed.page] ?? 0

    useAppStore.setState({
      previousPage: state.currentPage,
      currentPage: parsed.page,
      selectedProductSlug: parsed.selectedProductSlug,
      selectedQuoteId: parsed.selectedQuoteId,
      selectedOrderId: parsed.selectedOrderId,
      selectedClientId: parsed.selectedClientId,
      selectedInventoryId: parsed.selectedInventoryId,
      catalogCategory: parsed.catalogCategory,
      // remember where we left, so Forward can come back to it
      scrollPositions: { ...state.scrollPositions, [state.currentPage]: window.scrollY },
    })

    // Same page: restore now. New page: page.tsx restores it after the transition.
    if (parsed.page === state.currentPage) restoreScroll(target)
    else _pendingScroll = target
  })
}