// PUSPA V4 — Hermes Tool Registry
// Central registry for all domain tools with RBAC metadata
// Compatible with OpenAI function calling schema format

import { z } from 'zod'
import { getRecentDonations, getDonationStats } from './donations'
import { getActiveCases, getCaseSummary } from './cases'

// ─── Tool Definition Types ───────────────────────────────────

export interface HermesTool {
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

const ping_system: HermesTool = {
  name: 'ping_system',
  description: 'Check if the PUSPA system is online and operational. Returns system status.',
  parameters: {
    type: 'object',
    properties: {},
  },
  execute: async () => ({ status: 'System is online', timestamp: new Date().toISOString() }),
  requiredRole: ['staff', 'admin', 'developer'],
}

const get_recent_donations: HermesTool = {
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
    const limit = typeof params.limit === 'number' ? params.limit : 10
    return getRecentDonations(limit)
  },
  requiredRole: ['staff', 'admin', 'developer'],
}

const get_donation_stats: HermesTool = {
  name: 'get_donation_stats',
  description:
    'Get donation statistics for the current month, including total amount, count, and breakdown by category (zakat, sadaqah, waqf, infaq, general).',
  parameters: {
    type: 'object',
    properties: {},
  },
  execute: async () => getDonationStats(),
  requiredRole: ['staff', 'admin', 'developer'],
}

const get_active_cases: HermesTool = {
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
    const status = typeof params.status === 'string' ? params.status : undefined
    return getActiveCases(status)
  },
  requiredRole: ['staff', 'admin', 'developer'],
}

const get_case_summary: HermesTool = {
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
    const caseId = params.caseId
    if (typeof caseId !== 'string') return { error: 'caseId must be a string' }
    const result = await getCaseSummary(caseId)
    if (!result) return { error: 'Case not found' }
    return result
  },
  requiredRole: ['staff', 'admin', 'developer'],
}

// ─── Admin-Only Tools ────────────────────────────────────────

const approve_disbursement: HermesTool = {
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

const delete_case: HermesTool = {
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

const ALL_TOOLS: HermesTool[] = [
  ping_system,
  get_recent_donations,
  get_donation_stats,
  get_active_cases,
  get_case_summary,
  approve_disbursement,
  delete_case,
]

// ─── Role-Based Filtering ────────────────────────────────────

const ROLE_HIERARCHY: Record<string, number> = {
  staff: 1,
  admin: 2,
  developer: 3,
}

/**
 * Filter the tool registry based on the user's role.
 * Only tools whose `requiredRole` includes the user's role are returned.
 */
export function getToolsForRole(userRole: string): HermesTool[] {
  return ALL_TOOLS.filter((tool) => tool.requiredRole.includes(userRole as 'staff' | 'admin' | 'developer'))
}

/**
 * Get the full tool registry (for developer role or debugging).
 */
export function getAllTools(): HermesTool[] {
  return ALL_TOOLS
}

/**
 * Convert HermesTool[] to OpenAI function calling format.
 * This is the format sent to the AI model in the `tools` parameter.
 */
export function toOpenAITools(tools: HermesTool[]) {
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

export { ALL_TOOLS as hermesTools }
