import { readFileSync, existsSync, mkdirSync } from 'fs'
import { writeFile as writeFileAsync } from 'fs/promises'
import { join } from 'path'
import { createHash } from 'crypto'

/**
 * Simple persistent rate limiter.
 * Persists attempt counts to a JSON file so they survive server restarts.
 * Identifiers (e.g. IP addresses) are hashed before storage to protect privacy.
 */

const DATA_DIR = join(process.cwd(), 'db')
const DATA_FILE = join(DATA_DIR, 'rate-limits.json')

interface RateRecord {
  count: number
  resetAt: number
}

/** Hash an identifier with a static salt so raw values are never stored */
function hashIdentifier(identifier: string): string {
  return createHash('sha256').update(`ratelimit:${identifier}`).digest('hex')
}

// In-memory cache (source of truth during runtime)
const store = new Map<string, RateRecord>()
let loaded = false

/** Load persisted data from file (once) */
function ensureLoaded(): void {
  if (loaded) return
  loaded = true
  try {
    // Ensure data directory exists
    if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true })
    if (existsSync(DATA_FILE)) {
      const raw = readFileSync(DATA_FILE, 'utf-8')
      const data: Record<string, RateRecord> = JSON.parse(raw)
      const now = Date.now()
      for (const [key, record] of Object.entries(data)) {
        // Only load non-expired entries
        if (now < record.resetAt) {
          store.set(key, record)
        }
      }
    }
  } catch {
    // If file is corrupt, start fresh
  }
}

/** Persist current state to file (non-blocking, fire-and-forget) */
function persist(): void {
  // Fire-and-forget: in-memory store is the source of truth,
  // file is only for persistence across restarts.
  const data: Record<string, RateRecord> = {}
  const now = Date.now()
  for (const [key, record] of store.entries()) {
    if (now < record.resetAt) {
      data[key] = record
    }
  }
  writeFileAsync(DATA_FILE, JSON.stringify(data), 'utf-8').catch(() => {
    // Fail silently — rate limiting is a nice-to-have
  })
}

export interface RateLimitConfig {
  maxAttempts: number
  windowMs: number
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutes
}

/**
 * Check if an identifier is rate limited.
 * Returns true if the limit has been exceeded.
 */
export function isRateLimited(
  identifier: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): boolean {
  ensureLoaded()
  const now = Date.now()
  const key = hashIdentifier(identifier)
  const record = store.get(key)
  if (!record || now > record.resetAt) return false
  return record.count >= config.maxAttempts
}

/**
 * Record a failed attempt. Returns true if the limit has now been reached.
 */
export function recordFailedAttempt(
  identifier: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): boolean {
  ensureLoaded()
  const now = Date.now()
  const key = hashIdentifier(identifier)
  const existing = store.get(key)
  if (!existing || now > existing.resetAt) {
    store.set(key, { count: 1, resetAt: now + config.windowMs })
  } else {
    existing.count++
  }
  persist()
  const record = store.get(key)!
  return record.count >= config.maxAttempts
}

/**
 * Clear rate limit for an identifier (e.g. after successful login).
 */
export function clearRateLimit(identifier: string): void {
  ensureLoaded()
  store.delete(hashIdentifier(identifier))
  persist()
}