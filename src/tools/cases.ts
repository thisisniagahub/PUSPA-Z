// PUSPA V4 — Maria Puspa Domain Tool: Cases
// Allows the AI to query case data securely (PII masked)

import { db } from '@/lib/db'

/**
 * Fetch cases that are currently pending or in-progress.
 * IC numbers are masked for privacy.
 */
export async function getActiveCases(status?: string) {
  const where: Record<string, unknown> = {}
  if (status) {
    where.status = status
  } else {
    // Default: fetch cases that are NOT closed or rejected
    where.status = { notIn: ['closed', 'rejected'] }
  }

  const cases = await db.case.findMany({
    where,
    take: 20,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      caseNumber: true,
      type: true,
      priority: true,
      status: true,
      description: true,
      requestedAmount: true,
      approvedAmount: true,
      riskIndicator: true,
      welfareScore: true,
      createdAt: true,
      member: {
        select: {
          id: true,
          name: true,
          asnafCategory: true,
          icNumber: true,
        },
      },
    },
  })

  return cases.map((c) => ({
    id: c.id,
    caseNumber: c.caseNumber,
    type: c.type,
    priority: c.priority,
    status: c.status,
    description: c.description,
    requestedAmount: c.requestedAmount,
    approvedAmount: c.approvedAmount,
    riskIndicator: c.riskIndicator,
    welfareScore: c.welfareScore,
    createdAt: c.createdAt.toISOString(),
    member: {
      id: c.member.id,
      name: c.member.name,
      asnafCategory: c.member.asnafCategory,
      // Mask IC: show only last 4 digits
      icMasked: c.member.icNumber
        ? `****${c.member.icNumber.slice(-4)}`
        : null,
    },
  }))
}

/**
 * Fetch specific case details including related member info.
 * Sensitive PII is masked.
 */
export async function getCaseSummary(caseId: string) {
  const caseData = await db.case.findUnique({
    where: { id: caseId },
    include: {
      member: {
        select: {
          id: true,
          name: true,
          asnafCategory: true,
          icNumber: true,
          monthlyIncome: true,
          householdSize: true,
          status: true,
        },
      },
      notes: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          type: true,
          content: true,
          createdAt: true,
        },
      },
      disbursements: {
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          amount: true,
          category: true,
          status: true,
          createdAt: true,
        },
      },
    },
  })

  if (!caseData) return null

  return {
    id: caseData.id,
    caseNumber: caseData.caseNumber,
    type: caseData.type,
    priority: caseData.priority,
    status: caseData.status,
    description: caseData.description,
    requestedAmount: caseData.requestedAmount,
    approvedAmount: caseData.approvedAmount,
    riskIndicator: caseData.riskIndicator,
    welfareScore: caseData.welfareScore,
    nextAction: caseData.nextAction,
    createdAt: caseData.createdAt.toISOString(),
    member: {
      id: caseData.member.id,
      name: caseData.member.name,
      asnafCategory: caseData.member.asnafCategory,
      icMasked: caseData.member.icNumber
        ? `****${caseData.member.icNumber.slice(-4)}`
        : null,
      monthlyIncome: caseData.member.monthlyIncome,
      householdSize: caseData.member.householdSize,
      status: caseData.member.status,
    },
    recentNotes: caseData.notes.map((n) => ({
      id: n.id,
      type: n.type,
      content: n.content,
      date: n.createdAt.toISOString(),
    })),
    recentDisbursements: caseData.disbursements.map((d) => ({
      id: d.id,
      amount: d.amount,
      category: d.category,
      status: d.status,
      date: d.createdAt.toISOString(),
    })),
  }
}
