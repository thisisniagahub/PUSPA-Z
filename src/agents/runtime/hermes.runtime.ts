// PUSPA V4 — Hermes Runtime Engine
// Core AI orchestration: memory → tools → streaming response
// Phase 1 + Phase 4: Includes system prompt, RBAC, tool execution loop

import { getConversationHistory, saveMessage } from '@/lib/memory'
import { getToolsForRole, toOpenAITools, executeTool } from '@/tools'

// ─── System Prompt (Phase 4) ─────────────────────────────────

const HERMES_SYSTEM_PROMPT = `You are Hermes, the AI operator for PUSPA (Pertubuhan Urus Peduli Asnaf). You are professional, concise, and communicate in bilingual Bahasa Melayu/English based on the user's language preference.

## Your Capabilities
- You have access to tools that can query the PUSPA database in real-time
- You rely ONLY on the tools provided to answer operational questions
- If you don't know something and have no tool to find out, say you don't know
- Do NOT hallucinate data — if a tool returns no results, report that honestly

## Your Personality
- Professional yet approachable
- Use light 🦞 personality occasionally
- Default to Bahasa Melayu for Malaysian users, but switch to English if they prefer
- Be concise — prefer bullet points and summaries over walls of text

## Available Modules Context
PUSPA V4 manages: Asnaf Members, Cases (welfare/medical/education/housing/emergency/financial), Donations (zakat/sadaqah/waqf/infaq/general), Disbursements, Programmes, Volunteers, Compliance (ROSM/LHDN/PDPA), eKYC verification, and Documents.

## Security Rules
- Never reveal full IC numbers — they are always masked (****XXXX)
- Never share sensitive personal data beyond what's needed for the query
- Never claim to have data you don't have
- If a user asks to perform an action they don't have access to, inform them politely

## Response Format
- Use structured format for data: tables, bullet points, or numbered lists
- Always include the source (e.g., "Based on recent donation data...")
- For numerical data, format with proper currency (RM / MYR)
- When uncertain, ask for clarification rather than guessing`

// ─── Types ───────────────────────────────────────────────────

interface HermesMessage {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
  tool_call_id?: string
  name?: string
}

interface ToolCall {
  id: string
  type: 'function'
  function: {
    name: string
    arguments: string
  }
}

// ─── Main Runtime ────────────────────────────────────────────

/**
 * Run the Hermes AI runtime.
 *
 * Flow:
 * 1. Fetch conversation memory for the user
 * 2. Append the new user prompt
 * 3. Save the user message to memory
 * 4. Prepare tool registry (filtered by user role)
 * 5. Call the AI with streaming enabled
 * 6. If tool calls are detected, execute them and continue
 * 7. Save the assistant response to memory
 * 8. Return the streaming response
 */
export async function runHermes(
  prompt: string,
  userId: string,
  userRole: string = 'staff',
  currentView: string = 'dashboard'
) {
  // 1. Fetch conversation history
  const history = await getConversationHistory(userId)

  // 2. Build the message array
  const contextPrompt = `${HERMES_SYSTEM_PROMPT}\n\n## Current Module\nThe user is currently viewing: **${currentView}** module.`

  const messages: HermesMessage[] = [
    { role: 'system', content: contextPrompt },
    ...history.map((m) => ({
      role: m.role as HermesMessage['role'],
      content: m.content,
    })),
    { role: 'user', content: prompt },
  ]

  // 3. Save user message to memory
  await saveMessage(userId, 'user', prompt)

  // 4. Prepare tool registry based on role
  const allowedTools = getToolsForRole(userRole)
  const openaiTools = toOpenAITools(allowedTools)

  return {
    messages,
    tools: openaiTools,
    userId,
    userRole,
    allowedTools,
  }
}

/**
 * Execute tool calls from the AI response.
 * Returns tool result messages to be appended to the conversation.
 */
export async function executeToolCalls(
  toolCalls: ToolCall[],
  userRole: string
): Promise<HermesMessage[]> {
  const results: HermesMessage[] = []

  for (const call of toolCalls) {
    let args: Record<string, unknown> = {}
    try {
      args = JSON.parse(call.function.arguments)
    } catch {
      args = {}
    }

    const { result, error } = await executeTool(call.function.name, args, userRole)

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

export type { HermesMessage, ToolCall }
