// PUSPA V4 — Maria Puspa Runtime Engine
// Core AI orchestration: memory → tools → streaming response
// Uses OpenRouter API (OpenAI-compatible) with key rotation

import { getConversationHistory, saveMessage } from '@/lib/memory'
import { getToolsForRole, toOpenAITools, executeTool } from '@/tools'
import {
  getConfiguredModel,
  isConfigured,
} from '@/lib/openrouter'
import type { OpenRouterMessage, OpenRouterToolCall } from '@/lib/openrouter'
import { getPuspaKnowledgeContext } from '@/lib/puspa-knowledge'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

// ─── System Prompt ───────────────────────────────────────────

const MARIA_PUSPA_SYSTEM_PROMPT = `You are Maria Puspa, the AI Assistant for PUSPA — PERTUBUHAN URUS PEDULI ASNAF (PPM-024-10-05012022).

## Identity
- Name: Maria Puspa
- Role: AI Assistant & Project Operator (inspired by Hermes Agent architecture)
- Personality: Cerdas, Mesra, Profesional, Empati, Boleh Dipercayai
- Communication Style: Jelas, Ringkas, Sopan, Berorientasikan Penyelesaian
- Languages: Bahasa Melayu (primary), English
- Availability: 24/7

## Core Rules — MANDATORY RAG
- You MUST use tools to retrieve real data before answering ANY operational question
- NEVER fabricate or assume data — only report what tools return
- If no tool matches the question, use web_search to find real information
- If a web source is found, use web_read to extract detailed content
- Always cite the tool/source used (e.g., "Berdasarkan data derma terkini...", "Menurut sumber web...")
- For numerical data, format with RM/MYR currency
- If tools return empty results, state clearly: "Tiada data ditemui untuk pertanyaan ini"

## Response Format — SHORT & SHARP (MANDATORY)
- MAXIMUM 2-3 sentences per response unless listing data
- Use bullet points for lists, tables for structured data
- NO filler words, NO emojis, NO excessive pleasantries
- One clear answer per question — be direct
- If multiple items, use numbered list
- When uncertain, ask for clarification — do NOT guess
- Start with the answer, then add context if needed
- NEVER say "Saya harap ini membantu" or similar filler

## Project Editing Capabilities
You have full access to edit the entire PUSPA project:
- Database operations via Prisma tools (members, cases, donations, disbursements, etc.)
- System configuration and health monitoring via system_health tool
- Web research via web_search and web_read tools for RAG
- Task delegation via delegate_task tool for complex operations
- All 18+ tools with role-based access control

## Available Modules Context
PUSPA V4 (PERTUBUHAN URUS PEDULI ASNAF, PPM-024-10-05012022) manages: Asnaf Members, Cases (welfare/medical/education/housing/emergency/financial), Donations (zakat/sadaqah/waqf/infaq/general), Disbursements, Programmes, Volunteers, Compliance (ROSM/LHDN/PDPA), eKYC verification, and Documents.

## Tool Usage Priority
1. Database tools (get_*) for PUSPA operational data
2. web_search + web_read for external information (RAG)
3. system_health for system diagnostics
4. delegate_task for complex multi-step operations
5. Admin tools (approve_disbursement, delete_case) for privileged actions

## Security Rules
- Never reveal full IC numbers — always masked (****XXXX)
- Never share sensitive personal data beyond query scope
- If user lacks access, inform politely
- Never claim capabilities you do not have
- Log all privileged operations`

// ─── Types ───────────────────────────────────────────────────

export type MariaPuspaMessage = OpenRouterMessage

export type ToolCall = OpenRouterToolCall

export interface MariaPuspaPayload {
  messages: MariaPuspaMessage[]
  tools: ReturnType<typeof toOpenAITools>
  userId: string
  userRole: string
  model: string
}

export interface HermesCliResult {
  enabled: boolean
  model: string
  content: string
}

// ─── Main Runtime ────────────────────────────────────────────

/**
 * Run the Maria Puspa AI runtime.
 *
 * Flow:
 * 1. Fetch conversation memory for the user
 * 2. Append the new user prompt
 * 3. Save the user message to memory
 * 4. Prepare tool registry (filtered by user role)
 * 5. Return the payload ready for OpenRouter API call
 */
export async function runMariaPuspa(
  prompt: string,
  userId: string,
  userRole: string = 'staff',
  currentView: string = 'dashboard'
): Promise<MariaPuspaPayload> {
  // 1. Fetch conversation history
  const history = await getConversationHistory(userId)

  // 2. Build the message array with PUSPA knowledge base
  const puspaKnowledge = getPuspaKnowledgeContext()
  const contextPrompt = `${MARIA_PUSPA_SYSTEM_PROMPT}\n\n${puspaKnowledge}\n\n## Current Module\nThe user is currently viewing: **${currentView}** module.`

  const messages: MariaPuspaMessage[] = [
    { role: 'system', content: contextPrompt },
    ...history.map((m) => ({
      role: m.role as MariaPuspaMessage['role'],
      content: m.content,
    })),
    { role: 'user', content: prompt },
  ]

  // 3. Save user message to memory
  await saveMessage(userId, 'user', prompt)

  // 4. Prepare tool registry based on role
  const allowedTools = getToolsForRole(userRole)
  const tools = toOpenAITools(allowedTools)

  // 5. Determine model
  const model = getConfiguredModel()

  return {
    messages,
    tools,
    userId,
    userRole,
    model,
  }
}

/**
 * Execute tool calls from the AI response.
 * Returns tool result messages to be appended to the conversation.
 */
export async function executeToolCalls(
  toolCalls: ToolCall[],
  userRole: string
): Promise<MariaPuspaMessage[]> {
  const results: MariaPuspaMessage[] = []

  for (const call of toolCalls) {
    let args: Record<string, unknown> = {}
    try {
      args = JSON.parse(call.function.arguments)
    } catch {
      args = {}
    }

    const { result, error } = await executeTool(call.function.name, args, userRole, 'system')

    results.push({
      role: 'tool',
      content: JSON.stringify(error ? { error } : result),
      tool_call_id: call.id,
      name: call.function.name,
    })
  }

  return results
}

/**
 * Save the assistant response to memory.
 */
export async function saveAssistantMessage(
  userId: string,
  content: string
) {
  await saveMessage(userId, 'assistant', content)
}

/**
 * Check if OpenRouter is configured.
 */
export function isMariaPuspaConfigured(): boolean {
  return isConfigured()
}

function isHermesCliModeEnabled(): boolean {
  return process.env.HERMES_RUNTIME_MODE === 'cli'
}

function getHermesCommand(): { file: string; argsPrefix: string[] } {
  const custom = process.env.HERMES_CLI_COMMAND?.trim()
  if (custom) {
    return { file: custom, argsPrefix: [] }
  }
  if (process.platform === 'win32') {
    return {
      file: 'powershell',
      argsPrefix: [
        '-ExecutionPolicy',
        'Bypass',
        '-File',
        'scripts/hermes-agent.ps1',
      ],
    }
  }
  return { file: 'python', argsPrefix: ['scripts/hermes-agent.py'] }
}

export async function runHermesCliReply(
  prompt: string,
  currentView: string = 'dashboard'
): Promise<HermesCliResult> {
  if (!isHermesCliModeEnabled()) {
    return { enabled: false, model: 'hermes-agent', content: '' }
  }

  const { file, argsPrefix } = getHermesCommand()
  const instruction = `Current module: ${currentView}\nUser prompt: ${prompt}`
  const args = [...argsPrefix, '--oneshot', instruction]

  const { stdout } = await execFileAsync(file, args, {
    cwd: process.cwd(),
    timeout: Number(process.env.HERMES_CLI_TIMEOUT_MS || 45000),
    maxBuffer: 1024 * 1024 * 8,
  })

  const content = stdout?.trim()
  if (!content) {
    throw new Error('Hermes CLI returned empty response')
  }

  return { enabled: true, model: 'hermes-agent-cli', content }
}

// Keep backward-compatible aliases
export const runHermes = runMariaPuspa
export const isHermesConfigured = isMariaPuspaConfigured
export type HermesMessage = MariaPuspaMessage
export type HermesPayload = MariaPuspaPayload

export { OpenRouterMessage, OpenRouterToolCall }
