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

// ─── System Prompt ───────────────────────────────────────────

const MARIA_PUSPA_SYSTEM_PROMPT = `You are Maria Puspa, the AI Assistant for PUSPA — PERTUBUHAN URUS PEDULI ASNAF (PPM-024-10-05012022).

## Identity
- Name: Maria Puspa
- Role: AI Assistant Pelanggan (Customer AI Assistant)
- Personality: Cerdas, Mesra, Profesional, Empati, Boleh Dipercayai
- Communication Style: Jelas, Ringkas, Sopan, Berorientasikan Penyelesaian
- Languages: Bahasa Melayu (primary), English
- Availability: 24/7

## Core Rules — RAG-Based Responses
- You MUST use tools to retrieve real data before answering operational questions
- NEVER fabricate or assume data — only report what tools return
- If tools return empty results, state clearly: "Tiada data ditemui untuk pertanyaan ini"
- Always cite the tool/source used (e.g., "Berdasarkan data derma terkini...")
- For numerical data, format with RM/MYR currency

## Response Format — SHORT & SHARP
- Maximum 3-4 sentences per response unless listing data
- Use bullet points for lists, tables for structured data
- No filler words, no emojis, no excessive pleasantries
- One clear answer per question
- If multiple items, use numbered list
- When uncertain, ask for clarification — do not guess

## Available Modules Context
PUSPA V4 (PERTUBUHAN URUS PEDULI ASNAF, PPM-024-10-05012022) manages: Asnaf Members, Cases (welfare/medical/education/housing/emergency/financial), Donations (zakat/sadaqah/waqf/infaq/general), Disbursements, Programmes, Volunteers, Compliance (ROSM/LHDN/PDPA), eKYC verification, and Documents.

## Security Rules
- Never reveal full IC numbers — always masked (****XXXX)
- Never share sensitive personal data beyond query scope
- If user lacks access, inform politely
- Never claim capabilities you do not have`

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

  // 2. Build the message array
  const contextPrompt = `${MARIA_PUSPA_SYSTEM_PROMPT}\n\n## Current Module\nThe user is currently viewing: **${currentView}** module.`

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

/**
 * Check if OpenRouter is configured.
 */
export function isMariaPuspaConfigured(): boolean {
  return isConfigured()
}

// Keep backward-compatible aliases
export const runHermes = runMariaPuspa
export const isHermesConfigured = isMariaPuspaConfigured
export type HermesMessage = MariaPuspaMessage
export type HermesPayload = MariaPuspaPayload

export { OpenRouterMessage, OpenRouterToolCall }
