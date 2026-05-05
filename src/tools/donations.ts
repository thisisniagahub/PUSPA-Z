// PUSPA V4 — Hermes Domain Tool: Donations
// Allows the AI to query donation data securely (no raw PII exposed)

import { db } from '@/lib/db'

/**
 * Fetch the most recent donations with amount, category, and date.
 * Sensitive donor info (full IC, etc.) is never returned.
 */
export async function getRecentDonations(limit: number = 10) {
  const donations = await db.donation.findMany({
    take: Math.min(limit, 50),
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      category: true,
      amount: true,
      currency: true,
      method: true,
      donorName: true,
      shariahCompliant: true,
      receiptIssued: true,
      createdAt: true,
    },
  })

  return donations.map((d) => ({
    id: d.id,
    category: d.category,
    amount: d.amount,
    currency: d.currency,
    method: d.method,
    donorName: d.donorName ?? 'Anonymous',
    shariahCompliant: d.shariahCompliant,
    receiptIssued: d.receiptIssued,
    date: d.createdAt.toISOString(),
  }))
}

/**
 * Return total donations grouped by category for the current month.
 */
export async function getDonationStats() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const donations = await db.donation.findMany({
    where: { createdAt: { gte: startOfMonth } },
    select: { category: true, amount: true },
  })

  const byCategory: Record<string, number> = {}
  let total = 0

  for (const d of donations) {
    byCategory[d.category] = (byCategory[d.category] || 0) + d.amount
    total += d.amount
  }

  return {
    period: `${startOfMonth.toISOString().slice(0, 10)} to ${now.toISOString().slice(0, 10)}`,
    totalDonations: total,
    count: donations.length,
    byCategory,
  }
}
