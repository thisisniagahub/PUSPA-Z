// PUSPA V4 — Hermes AI Memory Layer
// Persists conversation history via the AIMemory Prisma model

import { db } from '@/lib/db'

const MAX_HISTORY = 50 // Keep last N messages per user to avoid token overflow

/**
 * Fetch conversation history for a given user, ordered chronologically.
 * Returns the most recent `MAX_HISTORY` messages.
 */
export async function getConversationHistory(userId: string) {
  const memories = await db.aIMemory.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    take: MAX_HISTORY,
  })

  return memories.map((m) => ({
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
  await db.aIMemory.create({
    data: { userId, role, content },
  })
}

/**
 * Clear all conversation memory for a given user (e.g. on "Reset" action).
 */
export async function clearConversationHistory(userId: string) {
  await db.aIMemory.deleteMany({ where: { userId } })
}
