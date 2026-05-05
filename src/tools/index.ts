// PUSPA V5 — Maria Puspa Tool Registry
// Central registry for all domain tools with RBAC metadata
// Compatible with OpenAI function calling schema format
// Gracefully falls back when database is unavailable (e.g. Vercel serverless)

import { z } from 'zod'
import { getRecentDonations, getDonationStats } from './donations'
import { getActiveCases, getCaseSummary } from './cases'
import { extendedTools } from './web-tools'
import { db } from '@/lib/db'

// ─── DB Availability Check ───────────────────────────────────

let dbChecked = false
let dbOk = false

async function isDbReady(): Promise<boolean> {
  if (dbChecked) return dbOk
  try {
    await db.$queryRaw`SELECT 1`
    dbOk = true
  } catch {
    console.warn('[Tools] Database unavailable — tool results will show fallback data')
    dbOk = false
  }
  dbChecked = true
  return dbOk
}

function dbFallback(toolName: string) {
  return {
    status: 'database_unavailable',
    message: `Pangkalan data tidak tersedia sekarang. Data untuk "${toolName}" tidak boleh dimuat. Sila cuba lagi nanti atau hubungi admin.`,
    hint: 'Feature ini memerlukan sambungan database yang aktif.',
  }
}

// ─── Tool Definition Types ───────────────────────────────────

export interface MariaPuspaTool {
  /** Unique tool name (snake_case) */
  name: string
  /** Human-readable description for the AI */
  description: string
  /** JSON Schema parameters (OpenAI function calling format) */
  parameters: {
    type: 'object'
    properties: Record<string, unknown>
    required?: string[]
  }
  /** Execution function — runs server-side only */
  execute: (params: Record<string, unknown>) => Promise<unknown>
  /** Minimum role required to use this tool */
  requiredRole: ('staff' | 'admin' | 'developer')[]
}

// ─── Tool Definitions ────────────────────────────────────────

const ping_system: MariaPuspaTool = {
  name: 'ping_system',
  description: 'Check if the PUSPA system is online and operational. Returns system status.',
  parameters: {
    type: 'object',
    properties: {},
  },
  execute: async () => {
    const dbReady = await isDbReady()
    return {
      status: 'System is online',
      database: dbReady ? 'connected' : 'unavailable (running in memory-only mode)',
      timestamp: new Date().toISOString(),
    }
  },
  requiredRole: ['staff', 'admin', 'developer'],
}

const get_recent_donations: MariaPuspaTool = {
  name: 'get_recent_donations',
  description:
    'Fetch the most recent donations in the system. Returns amount, category, donor name, and date. Use this to answer questions about recent donation activity.',
  parameters: {
    type: 'object',
    properties: {
      limit: {
        type: 'number',
        description: 'Number of recent donations to fetch (default 10, max 50)',
      },
    },
  },
  execute: async (params) => {
    if (!(await isDbReady())) return dbFallback('get_recent_donations')
    const limit = typeof params.limit === 'number' ? params.limit : 10
    return getRecentDonations(limit)
  },
  requiredRole: ['staff', 'admin', 'developer'],
}

const get_donation_stats: MariaPuspaTool = {
  name: 'get_donation_stats',
  description:
    'Get donation statistics for the current month, including total amount, count, and breakdown by category (zakat, sadaqah, waqf, infaq, general).',
  parameters: {
    type: 'object',
    properties: {},
  },
  execute: async () => {
    if (!(await isDbReady())) return dbFallback('get_donation_stats')
    return getDonationStats()
  },
  requiredRole: ['staff', 'admin', 'developer'],
}

const get_active_cases: MariaPuspaTool = {
  name: 'get_active_cases',
  description:
    'Fetch cases that are currently active (not closed or rejected). Returns case number, type, priority, status, and masked member info. Optionally filter by specific status.',
  parameters: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        description:
          'Filter by case status: draft, intake, verification, assessment, approval, disbursement, follow_up',
      },
    },
  },
  execute: async (params) => {
    if (!(await isDbReady())) return dbFallback('get_active_cases')
    const status = typeof params.status === 'string' ? params.status : undefined
    return getActiveCases(status)
  },
  requiredRole: ['staff', 'admin', 'developer'],
}

const get_case_summary: MariaPuspaTool = {
  name: 'get_case_summary',
  description:
    'Fetch detailed information about a specific case by its ID, including member details (with masked IC), recent notes, and disbursement history.',
  parameters: {
    type: 'object',
    properties: {
      caseId: {
        type: 'string',
        description: 'The unique ID of the case to look up',
      },
    },
    required: ['caseId'],
  },
  execute: async (params) => {
    if (!(await isDbReady())) return dbFallback('get_case_summary')
    const caseId = params.caseId
    if (typeof caseId !== 'string') return { error: 'caseId must be a string' }
    const result = await getCaseSummary(caseId)
    if (!result) return { error: 'Case not found' }
    return result
  },
  requiredRole: ['staff', 'admin', 'developer'],
}

// ─── Member Tools ──────────────────────────────────────────────

const get_member_list: MariaPuspaTool = {
  name: 'get_member_list',
  description:
    'Fetch a list of asnaf members. Returns name, asnaf category, eKYC status, and join date. Optionally filter by asnaf category.',
  parameters: {
    type: 'object',
    properties: {
      category: {
        type: 'string',
        description: 'Filter by asnaf category: fakir, miskin, amil, muallaf, gharimin, riqab, ibnu_sabil, fisabilillah',
      },
      limit: {
        type: 'number',
        description: 'Number of members to return (default 20, max 100)',
      },
    },
  },
  execute: async (params) => {
    if (!(await isDbReady())) return dbFallback('get_member_list')
    const category = typeof params.category === 'string' ? params.category : undefined
    const limit = typeof params.limit === 'number' ? Math.min(params.limit, 100) : 20

    const where = category ? { asnafCategory: category } : {}
    const members = await db.member.findMany({
      where,
      select: {
        id: true,
        name: true,
        asnafCategory: true,
        ekycStatus: true,
        createdAt: true,
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
    })

    return members.map((m) => ({
      id: m.id,
      name: m.name,
      category: m.asnafCategory,
      ekyc: m.ekycStatus,
      joined: m.createdAt.toISOString().split('T')[0],
    }))
  },
  requiredRole: ['staff', 'admin', 'developer'],
}

const get_member_stats: MariaPuspaTool = {
  name: 'get_member_stats',
  description:
    'Get member statistics: total count, breakdown by asnaf category, eKYC verification status, and recent registrations.',
  parameters: {
    type: 'object',
    properties: {},
  },
  execute: async () => {
    if (!(await isDbReady())) return dbFallback('get_member_stats')
    const [total, byCategory, ekycPending, ekycVerified] = await Promise.all([
      db.member.count(),
      db.member.groupBy({ by: ['asnafCategory'], _count: { asnafCategory: true } }),
      db.member.count({ where: { ekycStatus: 'pending' } }),
      db.member.count({ where: { ekycStatus: 'verified' } }),
    ])

    return {
      total,
      byCategory: Object.fromEntries(byCategory.map((r) => [r.asnafCategory, r._count.asnafCategory])),
      ekycPending,
      ekycVerified,
    }
  },
  requiredRole: ['staff', 'admin', 'developer'],
}

// ─── Programme Tools ────────────────────────────────────────────

const get_active_programmes: MariaPuspaTool = {
  name: 'get_active_programmes',
  description:
    'Fetch programmes that are currently active. Returns programme name, type, start/end dates, and status.',
  parameters: {
    type: 'object',
    properties: {
      limit: {
        type: 'number',
        description: 'Number of programmes to return (default 10)',
      },
    },
  },
  execute: async (params) => {
    if (!(await isDbReady())) return dbFallback('get_active_programmes')
    const limit = typeof params.limit === 'number' ? params.limit : 10
    const programmes = await db.programme.findMany({
      where: { status: 'active' },
      select: {
        id: true,
        name: true,
        type: true,
        startDate: true,
        endDate: true,
        status: true,
      },
      take: limit,
      orderBy: { startDate: 'desc' },
    })

    return programmes.map((p) => ({
      id: p.id,
      name: p.name,
      type: p.type,
      start: p.startDate.toISOString().split('T')[0],
      end: p.endDate?.toISOString().split('T')[0] || 'Ongoing',
      status: p.status,
    }))
  },
  requiredRole: ['staff', 'admin', 'developer'],
}

// ─── Volunteer Tools ────────────────────────────────────────────

const get_volunteer_stats: MariaPuspaTool = {
  name: 'get_volunteer_stats',
  description:
    'Get volunteer statistics: total count, active volunteers, and skills breakdown.',
  parameters: {
    type: 'object',
    properties: {},
  },
  execute: async () => {
    if (!(await isDbReady())) return dbFallback('get_volunteer_stats')
    const [total, active] = await Promise.all([
      db.volunteer.count(),
      db.volunteer.count({ where: { status: 'active' } }),
    ])

    return { total, active, inactive: total - active }
  },
  requiredRole: ['staff', 'admin', 'developer'],
}

// ─── Compliance Tools ──────────────────────────────────────────

const get_compliance_status: MariaPuspaTool = {
  name: 'get_compliance_status',
  description:
    'Get compliance status overview: total records, completed, pending, and overdue items by category (ROSM, LHDN, PDPA).',
  parameters: {
    type: 'object',
    properties: {},
  },
  execute: async () => {
    if (!(await isDbReady())) return dbFallback('get_compliance_status')
    const [total, completed, pending, overdue] = await Promise.all([
      db.complianceRecord.count(),
      db.complianceRecord.count({ where: { status: 'completed' } }),
      db.complianceRecord.count({ where: { status: 'pending' } }),
      db.complianceRecord.count({
        where: {
          status: 'pending',
          dueDate: { lt: new Date() },
        },
      }),
    ])

    const byCategory = await db.complianceRecord.groupBy({
      by: ['category'],
      _count: { category: true },
    })

    return {
      total,
      completed,
      pending,
      overdue,
      byCategory: Object.fromEntries(byCategory.map((r) => [r.category, r._count.category])),
    }
  },
  requiredRole: ['staff', 'admin', 'developer'],
}

// ─── Disbursement Tools ────────────────────────────────────────

const get_disbursement_summary: MariaPuspaTool = {
  name: 'get_disbursement_summary',
  description:
    'Get disbursement summary: total amount disbursed, count, and breakdown by status (pending, approved, disbursed).',
  parameters: {
    type: 'object',
    properties: {},
  },
  execute: async () => {
    if (!(await isDbReady())) return dbFallback('get_disbursement_summary')
    const [total, totalAmount, byStatus] = await Promise.all([
      db.disbursement.count(),
      db.disbursement.aggregate({ _sum: { amount: true } }),
      db.disbursement.groupBy({
        by: ['status'],
        _count: { status: true },
        _sum: { amount: true },
      }),
    ])

    return {
      total,
      totalAmount: totalAmount._sum.amount || 0,
      byStatus: Object.fromEntries(
        byStatus.map((r) => [r.status, { count: r._count.status, amount: r._sum.amount || 0 }])
      ),
    }
  },
  requiredRole: ['staff', 'admin', 'developer'],
}

// ─── Dashboard Overview Tool ──────────────────────────────────

const get_dashboard_overview: MariaPuspaTool = {
  name: 'get_dashboard_overview',
  description:
    'Get a comprehensive dashboard overview: key metrics across all modules — members, cases, donations, disbursements, programmes, volunteers, and compliance. Use this for general operational summaries.',
  parameters: {
    type: 'object',
    properties: {},
  },
  execute: async () => {
    if (!(await isDbReady())) return dbFallback('get_dashboard_overview')
    const [
      memberCount,
      activeCases,
      donationTotal,
      donationCount,
      disbursementTotal,
      activeProgrammes,
      volunteerActive,
      compliancePending,
      complianceOverdue,
    ] = await Promise.all([
      db.member.count(),
      db.case.count({ where: { status: { notIn: ['closed', 'rejected'] } } }),
      db.donation.aggregate({ _sum: { amount: true }, _count: true }),
      db.donation.count(),
      db.disbursement.aggregate({ _sum: { amount: true } }),
      db.programme.count({ where: { status: 'active' } }),
      db.volunteer.count({ where: { status: 'active' } }),
      db.complianceRecord.count({ where: { status: 'pending' } }),
      db.complianceRecord.count({ where: { status: 'pending', dueDate: { lt: new Date() } } }),
    ])

    return {
      members: memberCount,
      activeCases,
      donations: { total: donationTotal._sum.amount || 0, count: donationCount },
      disbursements: { total: disbursementTotal._sum.amount || 0 },
      activeProgrammes,
      activeVolunteers: volunteerActive,
      compliance: { pending: compliancePending, overdue: complianceOverdue },
    }
  },
  requiredRole: ['staff', 'admin', 'developer'],
}

// ─── Admin-Only Tools ────────────────────────────────────────

const approve_disbursement: MariaPuspaTool = {
  name: 'approve_disbursement',
  description:
    'Approve a pending disbursement. This is a restricted action — only admin and developer roles can execute it.',
  parameters: {
    type: 'object',
    properties: {
      disbursementId: {
        type: 'string',
        description: 'The ID of the disbursement to approve',
      },
    },
    required: ['disbursementId'],
  },
  execute: async (params) => {
    const disbursementId = params.disbursementId
    if (typeof disbursementId !== 'string')
      return { error: 'disbursementId must be a string' }
    // Simulated — in production this would update the DB
    return {
      action: 'approve_disbursement',
      disbursementId,
      status: 'approved',
      message: `Disbursement ${disbursementId} has been approved (simulated).`,
    }
  },
  requiredRole: ['admin', 'developer'],
}

const delete_case: MariaPuspaTool = {
  name: 'delete_case',
  description:
    'Delete a case from the system. This is a highly restricted action — only admin and developer roles can execute it.',
  parameters: {
    type: 'object',
    properties: {
      caseId: {
        type: 'string',
        description: 'The ID of the case to delete',
      },
      reason: {
        type: 'string',
        description: 'Reason for deletion (audit log)',
      },
    },
    required: ['caseId', 'reason'],
  },
  execute: async (params) => {
    const caseId = params.caseId
    const reason = params.reason
    if (typeof caseId !== 'string' || typeof reason !== 'string')
      return { error: 'caseId and reason must be strings' }
    // Simulated — in production this would soft-delete in the DB
    return {
      action: 'delete_case',
      caseId,
      reason,
      status: 'deleted',
      message: `Case ${caseId} has been deleted (simulated). Reason: ${reason}`,
    }
  },
  requiredRole: ['admin', 'developer'],
}

// ─── Complete Registry ───────────────────────────────────────

const ALL_TOOLS: MariaPuspaTool[] = [
  ping_system,
  get_recent_donations,
  get_donation_stats,
  get_active_cases,
  get_case_summary,
  get_member_list,
  get_member_stats,
  get_active_programmes,
  get_volunteer_stats,
  get_compliance_status,
  get_disbursement_summary,
  get_dashboard_overview,
  approve_disbursement,
  delete_case,
  ...extendedTools,
]

// ─── Role-Based Filtering ────────────────────────────────────

/**
 * Filter the tool registry based on the user's role.
 * Only tools whose `requiredRole` includes the user's role are returned.
 */
export function getToolsForRole(userRole: string): MariaPuspaTool[] {
  return ALL_TOOLS.filter((tool) => tool.requiredRole.includes(userRole as 'staff' | 'admin' | 'developer'))
}

/**
 * Get the full tool registry (for developer role or debugging).
 */
export function getAllTools(): MariaPuspaTool[] {
  return ALL_TOOLS
}

/**
 * Convert MariaPuspaTool[] to OpenAI function calling format.
 * This is the format sent to the AI model in the `tools` parameter.
 */
export function toOpenAITools(tools: MariaPuspaTool[]) {
  return tools.map((tool) => ({
    type: 'function' as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: tool.parameters,
    },
  }))
}

/**
 * Execute a tool by name with the given parameters.
 * Returns null if the tool is not found.
 */
export async function executeTool(
  name: string,
  params: Record<string, unknown>,
  userRole: string
): Promise<{ result: unknown; error?: string }> {
  const tool = ALL_TOOLS.find((t) => t.name === name)
  if (!tool) return { result: null, error: `Tool "${name}" not found` }

  // RBAC check
  if (!tool.requiredRole.includes(userRole as 'staff' | 'admin' | 'developer')) {
    return {
      result: null,
      error: `Access denied: Role "${userRole}" cannot execute tool "${name}"`,
    }
  }

  try {
    const result = await tool.execute(params)
    return { result }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { result: null, error: `Tool execution failed: ${message}` }
  }
}

export { ALL_TOOLS as mariaPuspaTools }
