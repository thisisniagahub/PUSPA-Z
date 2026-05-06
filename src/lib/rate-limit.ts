// PUSPA V5 — Rate Limiting
// Per-user and per-IP rate limiting for API endpoints

interface RateLimitEntry {
  count: number
  resetTime: number
}

const RATE_LIMITS = new Map<string, RateLimitEntry>()

// Different limits for different contexts
const LIMITS = {
  'ai': { max: 30, window: 60 * 1000 },      // 30 requests/minute for AI
  'api': { max: 100, window: 60 * 1000 },     // 100 requests/minute for API
  'auth': { max: 5, window: 60 * 1000 },      // 5 requests/minute for auth
}

export function checkRateLimit(
  identifier: string, 
  type: 'ai' | 'api' | 'auth' = 'api'
): { allowed: boolean; remaining: number; resetIn: number } {
  const limit = LIMITS[type]
  const now = Date.now()
  const key = `${type}:${identifier}`
  
  let entry = RATE_LIMITS.get(key)
  
  if (!entry || now > entry.resetTime) {
    // Reset window
    entry = {
      count: 1,
      resetTime: now + limit.window
    }
    RATE_LIMITS.set(key, entry)
    return { 
      allowed: true, 
      remaining: limit.max - 1,
      resetIn: limit.window
    }
  }
  
  entry.count++
  
  if (entry.count > limit.max) {
    return { 
      allowed: false, 
      remaining: 0,
      resetIn: entry.resetTime - now
    }
  }
  
  return { 
    allowed: true, 
    remaining: limit.max - entry.count,
    resetIn: entry.resetTime - now
  }
}

export function getRateLimitHeaders(limitInfo: ReturnType<typeof checkRateLimit>) {
  return {
    'X-RateLimit-Limit': String(LIMITS['api'].max),
    'X-RateLimit-Remaining': String(limitInfo.remaining),
    'X-RateLimit-Reset': String(Math.ceil(limitInfo.resetIn / 1000)),
  }
}
