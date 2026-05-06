import type { NextRequest } from 'next/server'

/** Fixed-window in-memory limits (best-effort per server instance; not durable across replicas). */
type Bucket = { count: number; windowStart: number }

const buckets = new Map<string, Bucket>()

function envInt(key: string, fallback: number): number {
  const raw = process.env[key]
  if (raw === undefined || raw === '') return fallback
  const n = Number.parseInt(raw, 10)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

export function aiRateLimitConfig() {
  return {
    windowMs: envInt('PUSPA_AI_RATE_WINDOW_MS', 60_000),
    anonymousMax: envInt('PUSPA_AI_RATE_ANONYMOUS_MAX', 15),
    authMax: envInt('PUSPA_AI_RATE_AUTH_MAX', 45),
  }
}

export function aiRateLimitKey(request: NextRequest, userId: string | undefined | null): string {
  if (userId && userId !== 'anonymous') return `u:${userId}`
  const forwarded = request.headers.get('x-forwarded-for')
  const ip =
    forwarded?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  return `ip:${ip}`
}

export type MariaAiRateResult =
  | { ok: true; limit: number; remaining: number }
  | { ok: false; retryAfterSec: number; limit: number; remaining: number }

/** Returns allowed with remaining quota, or blocked until window resets. */
export function checkMariaAiRateLimit(
  request: NextRequest,
  userId: string | undefined | null
): MariaAiRateResult {
  const { windowMs, anonymousMax, authMax } = aiRateLimitConfig()
  const limit =
    userId && userId !== 'anonymous' ? authMax : anonymousMax
  const key = aiRateLimitKey(request, userId)
  const now = Date.now()
  let b = buckets.get(key)

  if (!b || now - b.windowStart >= windowMs) {
    b = { count: 0, windowStart: now }
    buckets.set(key, b)
  }

  const windowEndsAt = b.windowStart + windowMs
  const retryAfterSec = Math.max(1, Math.ceil((windowEndsAt - now) / 1000))

  if (b.count >= limit) {
    return { ok: false, retryAfterSec, limit, remaining: 0 }
  }

  b.count += 1
  return {
    ok: true,
    limit,
    remaining: Math.max(0, limit - b.count),
  }
}
