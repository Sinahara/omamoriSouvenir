/**
 * Parse and validate pagination query parameters.
 * Returns clamped values to prevent abuse.
 */
export function parsePagination(searchParams: URLSearchParams): {
  page: number
  limit: number
  search: string
} {
  const rawPage = parseInt(searchParams.get('page') || '1', 10)
  const rawLimit = parseInt(searchParams.get('limit') || '20', 10)
  const rawSearch = (searchParams.get('search') || '').trim()

  return {
    page: Math.max(1, Math.min(rawPage || 1, 1000)),
    limit: Math.max(1, Math.min(rawLimit || 20, 100)),
    search: rawSearch.slice(0, 100), // max 100 chars for search
  }
}