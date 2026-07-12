import { useAppStore } from '@/lib/store'

/**
 * Wrapper around fetch for admin API calls.
 * The auth token is sent via httpOnly cookie automatically by the browser.
 * Automatically handles 401 responses by clearing state and redirecting to login.
 */
export function adminFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(options.headers)

  // Only set content-type for non-FormData bodies
  if (!(options.body instanceof FormData)) {
    if (!headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json')
    }
  }

  return fetch(url, { ...options, headers }).then(async (res) => {
    if (res.status === 401) {
      // Session expired or invalid — clear state and redirect to login
      // L6: Guard against redirect loop
      try { sessionStorage.removeItem('omamori_auth') } catch { /* ignore */ }
      useAppStore.setState({ adminUser: null, isAuthenticated: false })
      if (!window.location.pathname.startsWith('/admin') || window.location.pathname !== '/') {
        window.location.href = '/'
      }
    }
    return res
  })
}