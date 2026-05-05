/**
 * PUSPA V5 — Case Intelligence Engine
 * Ported from PUSPA-V4/src/lib/case-intelligence.ts
 * Adapted for V5 Prisma schema (import { db } from '@/lib/db')
 *
 * Provides:
 * - computeEligibility()      — 100-point scoring system for case eligibility
 * - computeRecommendation()   — Programme and amount suggestions
 * - computeRiskFlags()        — Duplicate IC, missing info, inconsistencies
 * - computeBeneficiary360()   — Full beneficiary profile aggregation
 * - computeNextAction()       — Workflow step suggestions
 * - computeDisbursementReconciliation() — Gap detection
 */

import { db } from '@/lib/db'

// ─── Input Types (mapped to V5 Prisma models) ─────────────────────

type CaseData = {
  id: string
  caseNumber?: string
  status?: string
  type?: string
  priority?: string
  amountRequested?: number | null
  approvedAmount?: number | null
  riskIndicator?: string | null
  welfareScore?: number | null
}

type HouseholdMember = {
  isStudent?: boolean
  relationship?: string
  occupation?: string | null
  dateOfBirth?: string | null
}

type Member = {
  id: string
  status?: string
  icNumber?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
  monthlyIncome?: number | null
  householdSize?: number | null
  householdMembers?: HouseholdMember[]
  ekycStatus?: string | null
  ekycRiskLevel?: string | null
  asnafCategory?: string | null
}

type Disbursement = {
  id: string
  amount?: number | null
  paymentMethod?: string | null
  paymentRef?: string | null
  scheduledDate?: string | null
  disbursedDate?: string | null
  status?: string | null
  category?: string | null
}

type Programme = {
  id: string
  category?: string | null
  status?: string | null
}

// ─── Output Types ─────────────────────────────────────────────────

export interface EligibilityResult {
  eligible: boolean
  score: number // 0-100
  reasons: string[]
}

export interface RecommendationResult {
  recommendedProgrammeId: string | null
  recommendedAmount: number | null
  reasons: string[]
}

export interface RiskFlag {
  type: 'duplicate' | 'high-risk' | 'missing-info' | 'inconsistency'
  message: string
  severity: 'low' | 'medium' | 'high'
}

export interface Beneficiary360 {
  member: Member
  household: HouseholdMember[]
  pastCases: CaseData[]
  totalDisbursed: number
  disbursements: Disbursement[]
  avgCaseAmount: number
}

export interface NextAction {
  action: string
  description: string
  priority: 'low' | 'medium' | 'high'
}

export interface DisbursementReconciliation {
  gaps: string[]
  missingBankInfo: boolean
  missingContact: boolean
  scheduleGaps: string[]
}

// ─── Eligibility Scoring (100-point system) ───────────────────────

/**
 * Compute eligibility for a case based on member and programme rules.
 *
 * Scoring breakdown (100 points max):
 *  - Active member status:       20 pts
 *  - Income within threshold:    20 pts
 *  - Valid IC (icNumber):        15 pts
 *  - Has phone:                  10 pts
 *  - Has address:                10 pts
 *  - Requested amount ≤ 3× income: 15 pts
 *  - Programme-specific match:    10 pts
 *
 * Eligibility threshold: ≥ 60 points
 */
export function computeEligibility(
  casedata: CaseData,
  member: Member | null,
  programme: Programme | null
): EligibilityResult {
  const reasons: string[] = []
  let score = 0

  if (!member) {
    reasons.push('No member linked to case')
    return { eligible: false, score: 0, reasons }
  }

  // 1. Member must be active (+20)
  if (member.status !== 'active') {
    reasons.push(`Member status is "${member.status ?? 'unknown'}", expected "active"`)
  } else {
    score += 20
  }

  // 2. Income threshold — above RM 5,000 generally not eligible for assistance (+20)
  if (member.monthlyIncome != null && member.monthlyIncome > 5000) {
    reasons.push('Income exceeds typical assistance threshold (RM 5,000)')
  } else {
    score += 20
  }

  // 3. Valid IC number (+15)
  if (!member.icNumber || member.icNumber.length < 8) {
    reasons.push('Missing or invalid IC number')
  } else {
    score += 15
  }

  // 4. Has phone (+10)
  if (!member.phone || member.phone.length < 8) {
    reasons.push('Missing phone number')
  } else {
    score += 10
  }

  // 5. Has address (+10)
  if (!member.address || member.address.trim().length < 5) {
    reasons.push('Missing or incomplete address')
  } else {
    score += 10
  }

  // 6. Requested amount ≤ 3× monthly income (+15)
  if (
    casedata.amountRequested != null &&
    member.monthlyIncome != null &&
    member.monthlyIncome > 0 &&
    casedata.amountRequested > member.monthlyIncome * 3
  ) {
    reasons.push(
      `Requested amount (RM ${casedata.amountRequested.toLocaleString()}) exceeds 3× monthly income (RM ${member.monthlyIncome.toLocaleString()})`
    )
  } else if (casedata.amountRequested != null) {
    score += 15
  } else {
    score += 5 // No amount requested yet — partial credit
    reasons.push('No requested amount set')
  }

  // 7. Programme-specific rules (+10)
  if (programme) {
    if (programme.category === 'education') {
      const hasStudent = member.householdMembers?.some(
        (hm) => hm.isStudent === true || hm.occupation?.toLowerCase().includes('student')
      )
      if (!hasStudent) {
        reasons.push('No student in household for education programme')
      } else {
        score += 10
      }
    } else if (programme.category === 'health' || programme.category === 'healthcare') {
      // Health programmes typically always eligible for low-income members
      if (member.monthlyIncome != null && member.monthlyIncome <= 3000) {
        score += 10
      } else {
        score += 5
        reasons.push('Income above typical range for healthcare programme')
      }
    } else {
      score += 10 // Default: programme category matches
    }
  }

  // 8. eKYC verified bonus (up to 5 bonus points, not in main 100)
  if (member.ekycStatus === 'verified') {
    score += 5
  } else if (member.ekycStatus === 'rejected') {
    reasons.push('eKYC verification was rejected')
  }

  const eligible = score >= 60
  return { eligible, score: Math.min(score, 100), reasons }
}

// ─── Recommendation Engine ────────────────────────────────────────

/**
 * Compute programme and amount recommendation for a case.
 */
export function computeRecommendation(
  casedata: CaseData,
  member: Member | null,
  programme: Programme | null
): RecommendationResult {
  const reasons: string[] = []
  let recommendedProgrammeId: string | null = programme?.id ?? null
  let recommendedAmount: number | null = null

  if (!member) {
    reasons.push('Cannot recommend without member data')
    return { recommendedProgrammeId: null, recommendedAmount: null, reasons }
  }

  // If no programme linked, suggest based on case type
  if (!programme) {
    const typeToCategoryMap: Record<string, string> = {
      welfare: 'welfare',
      medical: 'health',
      education: 'education',
      housing: 'social',
      emergency: 'welfare',
      financial: 'economic',
    }
    const mapped = casedata.type ? typeToCategoryMap[casedata.type] : undefined
    if (mapped) {
      reasons.push(`No programme linked; suggested category: ${mapped}`)
    } else {
      reasons.push('Cannot determine recommended programme from case type')
    }
  }

  // Recommend amount based on income and household size
  const baseAmount = member.monthlyIncome != null && member.monthlyIncome > 0
    ? member.monthlyIncome * 0.5
    : 500 // Default RM 500 if no income data
  const householdSize = member.householdSize ?? 1
  const adjusted = baseAmount * Math.min(householdSize, 4) // Cap multiplier at 4×
  recommendedAmount = Math.round(adjusted / 100) * 100 // Round to nearest RM 100

  reasons.push(
    `Based on monthly income of RM ${(member.monthlyIncome ?? 0).toLocaleString()} and household size of ${householdSize}`
  )

  return { recommendedProgrammeId, recommendedAmount, reasons }
}

// ─── Risk Flag Detection ──────────────────────────────────────────

/**
 * Compute risk flags for a case and member, including:
 * - Duplicate IC across members
 * - High eKYC risk level
 * - Missing critical information
 * - Inconsistencies between requested amount and income
 */
export function computeRiskFlags(
  casedata: CaseData,
  member: Member | null,
  allMembers: Member[] = []
): RiskFlag[] {
  const flags: RiskFlag[] = []

  if (!member) {
    flags.push({
      type: 'missing-info',
      message: 'No member linked to case',
      severity: 'high',
    })
    return flags
  }

  // 1. Duplicate IC check
  if (member.icNumber) {
    const duplicateMembers = allMembers.filter(
      (m) => m.id !== member.id && m.icNumber === member.icNumber
    )
    if (duplicateMembers.length > 0) {
      flags.push({
        type: 'duplicate',
        message: `IC number duplicates found in ${duplicateMembers.length} other member(s)`,
        severity: 'high',
      })
    }
  }

  // 2. High eKYC risk level
  if (member.ekycRiskLevel === 'high') {
    flags.push({
      type: 'high-risk',
      message: 'eKYC risk level is high',
      severity: 'high',
    })
  } else if (member.ekycRiskLevel === 'medium') {
    flags.push({
      type: 'high-risk',
      message: 'eKYC risk level is medium',
      severity: 'medium',
    })
  }

  // 3. Missing critical info
  if (!member.icNumber || member.icNumber.length < 8) {
    flags.push({
      type: 'missing-info',
      message: 'Missing or invalid IC number',
      severity: 'high',
    })
  }
  if (!member.phone || member.phone.length < 8) {
    flags.push({
      type: 'missing-info',
      message: 'Missing phone number',
      severity: 'medium',
    })
  }
  if (!member.address || member.address.trim().length < 5) {
    flags.push({
      type: 'missing-info',
      message: 'Missing or incomplete address',
      severity: 'medium',
    })
  }

  // 4. Inconsistency: requested amount far exceeds income
  if (
    member.monthlyIncome != null &&
    member.monthlyIncome > 0 &&
    casedata.amountRequested != null &&
    casedata.amountRequested > member.monthlyIncome * 5
  ) {
    flags.push({
      type: 'inconsistency',
      message: `Requested amount (RM ${casedata.amountRequested.toLocaleString()}) exceeds 5× monthly income (RM ${member.monthlyIncome.toLocaleString()})`,
      severity: 'medium',
    })
  }

  // 5. Inconsistency: case marked high priority but member income is high
  if (
    casedata.priority === 'urgent' &&
    member.monthlyIncome != null &&
    member.monthlyIncome > 3000
  ) {
    flags.push({
      type: 'inconsistency',
      message: 'Case marked urgent but member income is above RM 3,000',
      severity: 'low',
    })
  }

  return flags
}

// ─── Beneficiary 360 Profile ──────────────────────────────────────

/**
 * Compute full beneficiary 360° profile aggregation.
 * Combines member, household, past cases, disbursements, and totals.
 */
export function computeBeneficiary360(
  member: Member | null,
  pastCases: CaseData[] = [],
  disbursements: Disbursement[] = []
): Beneficiary360 {
  if (!member) {
    return {
      member: {} as Member,
      household: [],
      pastCases: [],
      totalDisbursed: 0,
      disbursements: [],
      avgCaseAmount: 0,
    }
  }

  const totalDisbursed = disbursements.reduce(
    (sum, d) => sum + (d.amount ?? 0),
    0
  )
  const avgCaseAmount =
    pastCases.length > 0
      ? pastCases.reduce((sum, c) => sum + (c.amountRequested ?? 0), 0) /
        pastCases.length
      : 0

  return {
    member,
    household: member.householdMembers ?? [],
    pastCases,
    totalDisbursed,
    disbursements,
    avgCaseAmount: Math.round(avgCaseAmount),
  }
}

// ─── Next Action Suggestions ──────────────────────────────────────

/**
 * Compute next suggested action based on case status and PUSPA workflow.
 * Maps V5 case statuses to appropriate next steps.
 */
export function computeNextAction(casedata: CaseData): NextAction {
  const status = casedata.status ?? 'draft'

  const nextActions: Record<string, NextAction> = {
    draft: {
      action: 'Submit for intake',
      description: 'Complete case details and submit to begin intake process',
      priority: 'medium',
    },
    intake: {
      action: 'Start verification',
      description: 'Assign verifier and begin document and identity checks',
      priority: 'high',
    },
    verification: {
      action: 'Complete verification',
      description: 'Finish verification and move to assessment',
      priority: 'high',
    },
    assessment: {
      action: 'Begin scoring',
      description: 'Assign assessor to evaluate case against welfare criteria',
      priority: 'high',
    },
    approval: {
      action: 'Request approval',
      description: 'Submit assessed case for approval by authorised officer',
      priority: 'medium',
    },
    disbursement: {
      action: 'Prepare disbursement',
      description: 'Set up disbursement details and schedule payment',
      priority: 'high',
    },
    follow_up: {
      action: 'Complete follow-up',
      description: 'Conduct follow-up visit or check-in after disbursement',
      priority: 'medium',
    },
    closed: {
      action: 'Case closed',
      description: 'No further action required',
      priority: 'low',
    },
    rejected: {
      action: 'Review rejection',
      description: 'Review rejection reasons and consider appeal or resubmission',
      priority: 'medium',
    },
  }

  return (
    nextActions[status] || {
      action: 'Review case',
      description: 'Check case status and determine next steps',
      priority: 'low',
    }
  )
}

// ─── Disbursement Reconciliation ──────────────────────────────────

/**
 * Compute disbursement reconciliation signals:
 * - Missing bank/payment information
 * - Overdue scheduled disbursements
 * - Missing contact info for payee
 */
export function computeDisbursementReconciliation(
  disbursements: Disbursement[],
  member: Member | null = null
): DisbursementReconciliation {
  const gaps: string[] = []
  let missingBankInfo = false
  let missingContact = false
  const scheduleGaps: string[] = []

  for (const d of disbursements) {
    const label = `Disbursement ${d.paymentRef || d.id}`

    // Check for missing bank/payment info
    if (d.paymentMethod === 'bank_transfer' && !d.paymentRef) {
      missingBankInfo = true
      gaps.push(`${label}: bank transfer with no payment reference`)
    }
    if (!d.paymentMethod) {
      missingBankInfo = true
      gaps.push(`${label}: missing payment method`)
    }

    // Check schedule gaps: scheduled date in the past but not yet disbursed
    if (
      d.scheduledDate &&
      new Date(d.scheduledDate) < new Date() &&
      d.status !== 'disbursed' &&
      d.status !== 'verified'
    ) {
      scheduleGaps.push(
        `${label}: scheduled ${d.scheduledDate} but status is "${d.status ?? 'unknown'}"`
      )
    }
  }

  // Check member contact info
  if (member) {
    if (!member.phone && !member.email) {
      missingContact = true
      gaps.push('Member has no phone or email for disbursement notification')
    }
  }

  return {
    gaps,
    missingBankInfo,
    missingContact,
    scheduleGaps,
  }
}

// ─── DB-Backed Intelligence Functions ─────────────────────────────

/**
 * Fetch member with household members from DB, then compute eligibility.
 */
export async function computeEligibilityFromDB(
  caseId: string
): Promise<EligibilityResult | null> {
  const caseRow = await db.case.findUnique({
    where: { id: caseId },
    include: {
      member: { include: { householdMembers: true } },
      programmes: { include: { programme: true } },
    },
  })

  if (!caseRow) return null

  const programme = caseRow.programmes[0]?.programme ?? null
  const member: Member = {
    id: caseRow.member.id,
    status: caseRow.member.status,
    icNumber: caseRow.member.icNumber,
    phone: caseRow.member.phone,
    email: caseRow.member.email,
    address: caseRow.member.address,
    monthlyIncome: caseRow.member.monthlyIncome,
    householdSize: caseRow.member.householdSize,
    householdMembers: caseRow.member.householdMembers.map((hm) => ({
      relationship: hm.relationship,
      occupation: hm.occupation,
      dateOfBirth: hm.dateOfBirth,
      isStudent: hm.occupation?.toLowerCase().includes('student'),
    })),
    ekycStatus: caseRow.member.ekycStatus,
    ekycRiskLevel: caseRow.member.ekycRiskLevel,
    asnafCategory: caseRow.member.asnafCategory,
  }

  return computeEligibility(
    {
      id: caseRow.id,
      caseNumber: caseRow.caseNumber,
      status: caseRow.status,
      type: caseRow.type,
      priority: caseRow.priority,
      amountRequested: caseRow.requestedAmount,
      approvedAmount: caseRow.approvedAmount,
      riskIndicator: caseRow.riskIndicator,
      welfareScore: caseRow.welfareScore,
    },
    member,
    programme ? { id: programme.id, category: programme.category, status: programme.status } : null
  )
}

/**
 * Fetch beneficiary 360 profile from DB.
 */
export async function computeBeneficiary360FromDB(
  memberId: string
): Promise<Beneficiary360 | null> {
  const memberRow = await db.member.findUnique({
    where: { id: memberId },
    include: { householdMembers: true },
  })
  if (!memberRow) return null

  const [pastCases, disbursements] = await Promise.all([
    db.case.findMany({
      where: { memberId },
      orderBy: { createdAt: 'desc' },
    }),
    db.disbursement.findMany({
      where: { memberId },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const member: Member = {
    id: memberRow.id,
    status: memberRow.status,
    icNumber: memberRow.icNumber,
    phone: memberRow.phone,
    email: memberRow.email,
    address: memberRow.address,
    monthlyIncome: memberRow.monthlyIncome,
    householdSize: memberRow.householdSize,
    householdMembers: memberRow.householdMembers.map((hm) => ({
      relationship: hm.relationship,
      occupation: hm.occupation,
      dateOfBirth: hm.dateOfBirth,
      isStudent: hm.occupation?.toLowerCase().includes('student'),
    })),
    ekycStatus: memberRow.ekycStatus,
    ekycRiskLevel: memberRow.ekycRiskLevel,
    asnafCategory: memberRow.asnafCategory,
  }

  return computeBeneficiary360(
    member,
    pastCases.map((c) => ({
      id: c.id,
      caseNumber: c.caseNumber,
      status: c.status,
      type: c.type,
      priority: c.priority,
      amountRequested: c.requestedAmount,
    })),
    disbursements.map((d) => ({
      id: d.id,
      amount: d.amount,
      paymentMethod: d.paymentMethod,
      paymentRef: d.paymentRef,
      scheduledDate: d.scheduledDate,
      disbursedDate: d.disbursedDate,
      status: d.status,
      category: d.category,
    }))
  )
}
