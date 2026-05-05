/**
 * PUSPA V5 — Rate Limiter
 * Ported from PUSPA-V4/src/lib/rate-limit.ts
 *
 * Token bucket rate limiter with:
 * - Configurable window and max requests
 * - X-RateLimit-* response headers
 * - IP-based tracking
 * - Trusted proxy support
 *
 * NOTE: In-memory rate limiting does NOT persist across serverless cold starts.
 * Each cold start resets the map, providing only single-instance protection.
 * For production-grade distributed rate limiting, use Upstash Redis or Vercel KV.
 */

// ─── Bucket Storage ───────────────────────────────────────────────

const buckets = new Map<string, { count: number; resetAt: number }>()

// ─── Types ────────────────────────────────────────────────────────

export interface RateLimitOptions {
  /** Maximum number of requests allowed in the window */
  limit: number
  /** Time window in milliseconds */
  windowMs: number
  /** Key prefix for bucket isolation (e.g. 'api', 'auth', 'ai') */
  keyPrefix?: string
}

export interface RateLimitResult {
  /** Whether the request is allowed */
  success: boolean
  /** Maximum requests allowed in the window */
  limit: number
  /** Remaining requests in the current window */
  remaining: number
  /** Timestamp (ms) when the window resets */
  resetAt: number
}

// ─── Trusted Proxy Support ────────────────────────────────────────

const TRUSTED_PROXY_IPS = new Set(
  process.env.TRUSTED_PROXY_IPS?.split(',').map((ip) => ip.trim()) || []
)

/**
 * Extract the client IP from a request, respecting trusted proxy headers.
 *
 * Only trusts X-Forwarded-For when the direct connection comes from a
 * trusted proxy IP (configured via TRUSTED_PROXY_IPS env var).
 */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')

  // Determine the direct connection IP
  const directIp =
    request.headers.get('x-forwarded-client-ip') ||
    request.headers.get('x-vercel-forwarded-for') ||
    realIp

  // Only trust forwarded headers if direct connection is from a trusted proxy
  if (TRUSTED_PROXY_IPS.size > 0 && directIp && TRUSTED_PROXY_IPS.has(directIp)) {
    if (forwardedFor) {
      return forwardedFor.split(',')[0].trim()
    }
  }

  // Fallback: use real IP or unknown
  return realIp || 'unknown'
}

// ─── Internal Helpers ─────────────────────────────────────────────

/**
 * Remove expired buckets to prevent memory leaks.
 */
function pruneBuckets(now: number): void {
  for (const [key, value] of buckets.entries()) {
    if (value.resetAt <= now) {
      buckets.delete(key)
    }
  }
}

// ─── Public API ───────────────────────────────────────────────────

/**
 * Check rate limit for a request.
 *
 * @example
 * ```ts
 * const result = rateLimit(request, { limit: 100, windowMs: 60_000, keyPrefix: 'api' })
 * if (!result.success) {
 *   return Response.json({ error: 'Too many requests' }, { status: 429, headers: buildRateLimitHeaders(result) })
 * }
 * ```
 */
export function rateLimit(
  request: Request,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now()
  pruneBuckets(now)

  const key = `${options.keyPrefix || 'default'}:${getClientIp(request)}`
  const current = buckets.get(key)

  // New bucket or expired bucket
  if (!current || current.resetAt <= now) {
    const resetAt = now + options.windowMs
    buckets.set(key, { count: 1, resetAt })

    return {
      success: true,
      limit: options.limit,
      remaining: Math.max(options.limit - 1, 0),
      resetAt,
    }
  }

  // Existing bucket — increment count
  current.count += 1
  buckets.set(key, current)

  const remaining = Math.max(options.limit - current.count, 0)

  return {
    success: current.count <= options.limit,
    limit: options.limit,
    remaining,
    resetAt: current.resetAt,
  }
}

/**
 * Build standard X-RateLimit-* response headers from a rate limit result.
 *
 * Returns headers:
 * - X-RateLimit-Limit: Maximum requests allowed
 * - X-RateLimit-Remaining: Remaining requests in current window
 * - X-RateLimit-Reset: Unix timestamp when the window resets
 */
export function buildRateLimitHeaders(result: RateLimitResult): HeadersInit {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(Math.ceil(result.resetAt / 1000)),
  }
}

// ─── Pre-configured Rate Limiters ─────────────────────────────────

/** General API rate limit: 100 requests per minute */
export const API_RATE_LIMIT: RateLimitOptions = {
  limit: 100,
  windowMs: 60_000,
  keyPrefix: 'api',
}

/** AI chat rate limit: 20 requests per minute */
export const AI_RATE_LIMIT: RateLimitOptions = {
  limit: 20,
  windowMs: 60_000,
  keyPrefix: 'ai',
}

/** Auth rate limit: 5 requests per minute (prevents brute force) */
export const AUTH_RATE_LIMIT: RateLimitOptions = {
  limit: 5,
  windowMs: 60_000,
  keyPrefix: 'auth',
}

/** Donation submission rate limit: 10 requests per minute */
export const DONATION_RATE_LIMIT: RateLimitOptions = {
  limit: 10,
  windowMs: 60_000,
  keyPrefix: 'donation',
}
