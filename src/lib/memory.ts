// PUSPA V5 — Maria Puspa AI Memory Layer
// Persists conversation history via the AIMemory Prisma model
// Falls back to in-memory storage if database is unavailable (e.g. Vercel serverless)

import { db } from '@/lib/db'

const MAX_HISTORY = 50 // Keep last N messages per user to avoid token overflow

// ─── In-Memory Fallback ──────────────────────────────────────
// Used when database is unavailable (Vercel serverless, no DATABASE_URL, etc.)

interface MemoryMessage {
  userId: string
  role: string
  content: string
  createdAt: Date
}

const inMemoryStore = new Map<string, MemoryMessage[]>()

let dbAvailable: boolean | null = null

async function checkDbAvailable(): Promise<boolean> {
  if (dbAvailable !== null) return dbAvailable
  try {
    await db.aIMemory.findMany({ take: 1 })
    dbAvailable = true
    return true
  } catch {
    console.warn('[Memory] Database unavailable, using in-memory fallback')
    dbAvailable = false
    return false
  }
}

/**
 * Fetch conversation history for a given user, ordered chronologically.
 * Returns the most recent `MAX_HISTORY` messages.
 */
export async function getConversationHistory(userId: string) {
  const useDb = await checkDbAvailable()

  if (useDb) {
    try {
      const memories = await db.aIMemory.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
        take: MAX_HISTORY,
      })

      return memories.map((m) => ({
        role: m.role as 'user' | 'assistant' | 'system' | 'tool',
        content: m.content,
      }))
    } catch {
      // DB failed mid-query, fall back to memory
      console.warn('[Memory] DB query failed, using in-memory fallback')
    }
  }

  // In-memory fallback
  const messages = inMemoryStore.get(userId) || []
  return messages.slice(-MAX_HISTORY).map((m) => ({
    role: m.role as 'user' | 'assistant' | 'system' | 'tool',
    content: m.content,
  }))
}

/**
 * Persist a single message to the AI memory store.
 */
export async function saveMessage(
  userId: string,
  role: string,
  content: string
) {
  const useDb = await checkDbAvailable()

  if (useDb) {
    try {
      await db.aIMemory.create({
        data: { userId, role, content },
      })
      return
    } catch {
      console.warn('[Memory] DB write failed, using in-memory fallback')
    }
  }

  // In-memory fallback
  const messages = inMemoryStore.get(userId) || []
  messages.push({ userId, role, content, createdAt: new Date() })
  // Keep only last MAX_HISTORY messages in memory
  if (messages.length > MAX_HISTORY * 2) {
    inMemoryStore.set(userId, messages.slice(-MAX_HISTORY))
  } else {
    inMemoryStore.set(userId, messages)
  }
}

/**
 * Clear all conversation memory for a given user (e.g. on "Reset" action).
 */
export async function clearConversationHistory(userId: string) {
  const useDb = await checkDbAvailable()

  if (useDb) {
    try {
      await db.aIMemory.deleteMany({ where: { userId } })
    } catch {
      console.warn('[Memory] DB clear failed')
    }
  }

  // Always clear in-memory too
  inMemoryStore.delete(userId)
}
