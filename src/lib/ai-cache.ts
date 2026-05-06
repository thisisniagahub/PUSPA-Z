// PUSPA V5 — AI Response Cache
// In-memory cache for frequent AI queries (TTL: 5 minutes)
interface CacheEntry {
  response: string
  timestamp: number
  userId: string
}

const AI_CACHE = new Map<string, CacheEntry>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export function getCachedResponse(query: string, userId: string): string | null {
  const key = `${userId}:${query}`
  const entry = AI_CACHE.get(key)
  
  if (!entry) return null
  
  const now = Date.now()
  if (now - entry.timestamp > CACHE_TTL) {
    AI_CACHE.delete(key)
    return null
  }
  
  console.log('[Cache] Hit for query:', query.slice(0, 50))
  return entry.response
}

export function setCachedResponse(query: string, userId: string, response: string): void {
  const key = `${userId}:${query}`
  AI_CACHE.set(key, {
    response,
    timestamp: Date.now(),
    userId
  })
  
  // Cleanup old entries periodically
  if (AI_CACHE.size > 1000) {
    const now = Date.now()
    for (const [k, v] of AI_CACHE.entries()) {
      if (now - v.timestamp > CACHE_TTL) {
        AI_CACHE.delete(k)
      }
    }
  }
}
