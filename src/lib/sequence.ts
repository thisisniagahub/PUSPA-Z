/**
 * PUSPA V5 — Sequence Generator (Collision-Safe)
 * Ported from PUSPA-V4/src/lib/sequence.ts
 *
 * Generates unique values (case numbers, receipt numbers, donor numbers, etc.)
 * with automatic retry on P2002 unique constraint violations.
 * Configurable max attempts and unique field matching.
 */

import { Prisma } from '@prisma/client'

// ─── Types ────────────────────────────────────────────────────────

type CreateWithGeneratedValueOptions<TValue, TResult> = {
  /** Function that generates the candidate value (e.g. case number) */
  generateValue: () => Promise<TValue>
  /** Function that creates the DB record using the generated value */
  create: (value: TValue) => Promise<TResult>
  /** Which unique fields to match against P2002 error meta.target */
  uniqueFields?: string[]
  /** Maximum retry attempts on collision (default: 5) */
  maxAttempts?: number
}

// ─── Helpers ──────────────────────────────────────────────────────

/**
 * Check if an error is a Prisma P2002 unique constraint violation,
 * optionally filtered by specific unique field names.
 */
function isUniqueConstraintError(
  error: unknown,
  uniqueFields?: string[]
): boolean {
  if (
    !(error instanceof Prisma.PrismaClientKnownRequestError) ||
    error.code !== 'P2002'
  ) {
    return false
  }

  if (!uniqueFields || uniqueFields.length === 0) {
    return true
  }

  const rawTarget = error.meta?.target
  const target = Array.isArray(rawTarget)
    ? rawTarget.map(String)
    : typeof rawTarget === 'string'
      ? [rawTarget]
      : []

  return uniqueFields.some((field) => target.includes(field))
}

// ─── Public API ───────────────────────────────────────────────────

/**
 * Create a database record with a generated unique value, automatically
 * retrying on P2002 unique constraint collisions.
 *
 * @example
 * ```ts
 * const case = await createWithGeneratedUniqueValue({
 *   generateValue: () => generateCaseNumber(db),
 *   uniqueFields: ['caseNumber'],
 *   create: (caseNumber) => db.case.create({ data: { caseNumber, ... } }),
 *   maxAttempts: 5,
 * })
 * ```
 */
export async function createWithGeneratedUniqueValue<TValue, TResult>({
  generateValue,
  create,
  uniqueFields,
  maxAttempts = 5,
}: CreateWithGeneratedValueOptions<TValue, TResult>): Promise<TResult> {
  let lastError: unknown

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const value = await generateValue()

    try {
      return await create(value)
    } catch (error) {
      if (!isUniqueConstraintError(error, uniqueFields)) {
        throw error
      }

      lastError = error
    }
  }

  throw lastError ?? new Error('Gagal menjana nombor unik selepas beberapa percubaan')
}

// ─── Sequence Generators ──────────────────────────────────────────

/**
 * Generate a case number in format CAS-YYYYMMDD-XXXX
 */
export async function generateCaseNumber(): Promise<string> {
  const { db } = await import('@/lib/db')
  const today = new Date()
  const datePart = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`
  const prefix = `CAS-${datePart}-`

  const lastCase = await db.case.findFirst({
    where: { caseNumber: { startsWith: prefix } },
    orderBy: { caseNumber: 'desc' },
    select: { caseNumber: true },
  })

  let nextNum = 1
  if (lastCase?.caseNumber) {
    const match = lastCase.caseNumber.match(/CAS-\d{8}-(\d+)/)
    if (match) nextNum = parseInt(match[1], 10) + 1
  }

  return `${prefix}${String(nextNum).padStart(4, '0')}`
}

/**
 * Generate a receipt number in format RCP-YYYYMMDD-XXXX
 */
export async function generateReceiptNumber(): Promise<string> {
  const { db } = await import('@/lib/db')
  const today = new Date()
  const datePart = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`
  const prefix = `RCP-${datePart}-`

  const lastDonation = await db.donation.findFirst({
    where: { receiptNumber: { startsWith: prefix } },
    orderBy: { receiptNumber: 'desc' },
    select: { receiptNumber: true },
  })

  let nextNum = 1
  if (lastDonation?.receiptNumber) {
    const match = lastDonation.receiptNumber.match(/RCP-\d{8}-(\d+)/)
    if (match) nextNum = parseInt(match[1], 10) + 1
  }

  return `${prefix}${String(nextNum).padStart(4, '0')}`
}

/**
 * Generate a donor number in format DNR-XXXX
 */
export async function generateDonorNumber(): Promise<string> {
  const { db } = await import('@/lib/db')

  const lastDonor = await db.donor.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { donorNumber: true },
  })

  let nextNum = 1
  if (lastDonor?.donorNumber) {
    const match = lastDonor.donorNumber.match(/DNR-(\d+)/)
    if (match) nextNum = parseInt(match[1], 10) + 1
  }

  return `DNR-${String(nextNum).padStart(4, '0')}`
}
