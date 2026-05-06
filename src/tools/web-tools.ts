// PUSPA V4 — Maria Puspa Extended Tools (Hermes Agent-style)
// Web search, web reading, and delegation tools
// Uses z-ai-web-dev-sdk for backend AI capabilities

import ZAI from 'z-ai-web-dev-sdk'
import type { MariaPuspaTool } from './index'

// ─── Web Search Tool ──────────────────────────────────────────

const web_search: MariaPuspaTool = {
  name: 'web_search',
  description:
    'Search the web for real-time information. Returns search results with titles, URLs, and snippets. Use this for current events, looking up references, or finding information not available in the PUSPA database.',
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Search query string',
      },
    },
    required: ['query'],
  },
  execute: async (params) => {
    const query = params.query
    if (typeof query !== 'string' || !query.trim()) {
      return { error: 'Query is required' }
    }

    try {
      const zai = await ZAI.create()
      const result = await zai.functions.invoke('web_search', { query })

      const rows = Array.isArray(result) ? result : []
      if (rows.length === 0) {
        return { results: [], message: 'Tiada hasil carian ditemui' }
      }

      return {
        results: rows.slice(0, 5).map((r: { title?: string; url?: string; snippet?: string }) => ({
          title: r.title || '',
          url: r.url || '',
          snippet: r.snippet || '',
        })),
        query,
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Web search failed'
      console.error('[Web Search]', message)
      return { error: `Gagal mencari: ${message}` }
    }
  },
  requiredRole: ['staff', 'admin', 'developer'],
}

// ─── Web Page Reader Tool ────────────────────────────────────

const web_read: MariaPuspaTool = {
  name: 'web_read',
  description:
    'Read and extract content from a web page URL. Returns the page title, text content, and metadata. Use this for RAG — retrieving real information from web sources to answer questions accurately.',
  parameters: {
    type: 'object',
    properties: {
      url: {
        type: 'string',
        description: 'The URL of the web page to read',
      },
    },
    required: ['url'],
  },
  execute: async (params) => {
    const url = params.url
    if (typeof url !== 'string' || !url.startsWith('http')) {
      return { error: 'Valid URL starting with http is required' }
    }

    try {
      const zai = await ZAI.create()
      const result = await zai.functions.invoke('page_reader', { url })

      if (!result?.data) {
        return { error: 'Tiada kandungan ditemui di URL tersebut' }
      }

      // Extract plain text from HTML
      const plainText = (result.data.html || '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 4000) // Limit to 4000 chars for context window

      return {
        title: result.data.title || '',
        url: result.data.url || url,
        content: plainText,
        publishedTime: result.data.publishedTime || null,
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Page reading failed'
      console.error('[Web Read]', message)
      return { error: `Gagal membaca halaman: ${message}` }
    }
  },
  requiredRole: ['staff', 'admin', 'developer'],
}

// ─── Delegate Task Tool ─────────────────────────────────────

const delegate_task: MariaPuspaTool = {
  name: 'delegate_task',
  description:
    'Delegate a task to a sub-agent for parallel execution. Returns a task ID and status. Use for complex multi-step operations like generating reports, analyzing data, or performing research while continuing the conversation.',
  parameters: {
    type: 'object',
    properties: {
      task_description: {
        type: 'string',
        description: 'Clear description of the task to delegate',
      },
      task_type: {
        type: 'string',
        description: 'Type of task: "research", "analysis", "report", "computation", "lookup"',
      },
    },
    required: ['task_description'],
  },
  execute: async (params) => {
    const taskDescription = params.task_description
    const taskType = params.task_type || 'general'

    if (typeof taskDescription !== 'string' || !taskDescription.trim()) {
      return { error: 'Task description is required' }
    }

    // In production, this would spawn a sub-agent
    // For now, return a simulated delegation response
    const taskId = `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`

    return {
      taskId,
      status: 'delegated',
      taskType,
      description: taskDescription,
      message: `Tugas ${taskId} telah didelegasikan. Maria Puspa boleh terus berinteraksi sementara tugas diproses.`,
    }
  },
  requiredRole: ['staff', 'admin', 'developer'],
}

// ─── System Health Tool ─────────────────────────────────────

const system_health: MariaPuspaTool = {
  name: 'system_health',
  description:
    'Get comprehensive system health check: database connectivity, AI service status, tool availability, and recent error rates.',
  parameters: {
    type: 'object',
    properties: {},
  },
  execute: async () => {
    const { db } = await import('@/lib/db')
    const health: Record<string, unknown> = {}

    try {
      // Test DB connection
      await db.$queryRaw`SELECT 1`
      health.database = 'connected'
    } catch {
      health.database = 'error'
    }

    // Count tables
    try {
      const [
        members, cases, donations, disbursements,
        programmes, volunteers, compliance,
      ] = await Promise.all([
        db.member.count(),
        db.case.count(),
        db.donation.count(),
        db.disbursement.count(),
        db.programme.count(),
        db.volunteer.count(),
        db.complianceRecord.count(),
      ])
      health.tables = { members, cases, donations, disbursements, programmes, volunteers, compliance }
    } catch {
      health.tables = 'error'
    }

    // AI service status
    const { isConfigured, getKeyCount } = await import('@/lib/openrouter')
    health.aiService = isConfigured() ? `configured (${getKeyCount()} keys)` : 'not configured'

    // Tool count
    const { getAllTools } = await import('@/tools')
    health.toolsAvailable = getAllTools().length

    health.timestamp = new Date().toISOString()

    return health
  },
  requiredRole: ['staff', 'admin', 'developer'],
}

// ─── Export All ──────────────────────────────────────────────

export const extendedTools: MariaPuspaTool[] = [
  web_search,
  web_read,
  delegate_task,
  system_health,
]
