// PUSPA V4 — Maria Puspa Telegram API Endpoint
// POST /api/v1/ai/telegram — Dedicated endpoint for Telegram bot
// Handles single text messages and returns full AI response (non-streaming for Telegram)

import { NextRequest, NextResponse } from 'next/server'
import {
  runHermes,
  executeToolCalls,
  saveAssistantMessage,
  isHermesConfigured,
  runHermesCliReply,
} from '@/agents/runtime/hermes.runtime'
import { createChatCompletion } from '@/lib/openrouter'
import type { ToolCall } from '@/agents/runtime/hermes.runtime'

export async function POST(request: NextRequest) {
  try {
    const internalToken = process.env.PUSPA_INTERNAL_API_TOKEN
    const requestToken = request.headers.get('x-puspa-internal-token')

    if (!internalToken || requestToken !== internalToken) {
      return NextResponse.json(
        { error: 'Unauthorized internal request' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { message, userId, userRole, currentView } = body
    const effectiveRole =
      userRole === 'admin' || userRole === 'developer' ? userRole : 'staff'

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'No valid message provided' },
        { status: 400 }
      )
    }

    const hermesCli = await runHermesCliReply(
      message,
      currentView || 'dashboard'
    )
    if (hermesCli.enabled) {
      await saveAssistantMessage(userId || 'telegram-anonymous', hermesCli.content)
      return NextResponse.json({
        content: hermesCli.content,
        model: hermesCli.model,
        toolCalls: [],
        success: true,
      })
    }

    // ─── Check OpenRouter Configuration (fallback runtime) ──
    if (!isHermesConfigured()) {
      return NextResponse.json({
        content: 'Maaf, Maria Puspa tidak dikonfigurasi. Sila hubungi pentadbir.',
        model: 'fallback',
        success: false,
      })
    }

    // ─── Run Maria Puspa Runtime ────────────────────────────
    const payload = await runHermes(
      message,
      userId || 'telegram-anonymous',
      effectiveRole,
      currentView || 'dashboard'
    )

    // ─── Call OpenRouter (Non-streaming for Telegram) ───────
    const completion = await createChatCompletion({
      messages: payload.messages,
      tools: payload.tools.length > 0 ? payload.tools : undefined,
      tool_choice: payload.tools.length > 0 ? 'auto' : undefined,
      model: payload.model,
    })

    // ─── Process Response ───────────────────────────────────
    const choice = completion.choices?.[0]
    if (!choice) {
      return NextResponse.json({
        content: 'Maaf, tiada respons diterima.',
        model: 'hermes-agent',
      })
    }

    let fullContent = choice.message?.content || ''
    let toolCallsBuffer: ToolCall[] = []

    // ─── Handle Tool Calls ─────────────────────────────────
    if (choice.message?.tool_calls && choice.message.tool_calls.length > 0) {
      toolCallsBuffer = choice.message.tool_calls

      // Execute tool calls
      const toolResults = await executeToolCalls(toolCallsBuffer, effectiveRole)

      // Second AI call with tool results
      const secondMessages = [
        ...payload.messages,
        {
          role: 'assistant' as const,
          content: fullContent,
          tool_calls: toolCallsBuffer,
        },
        ...toolResults,
      ]

      const secondCompletion = await createChatCompletion({
        messages: secondMessages,
        model: payload.model,
      })

      const secondChoice = secondCompletion.choices?.[0]
      if (secondChoice?.message?.content) {
        fullContent = secondChoice.message.content
      }
    }

    // Save to memory
    await saveAssistantMessage(userId || 'telegram-anonymous', fullContent)

    return NextResponse.json({
      content: fullContent,
      model: 'hermes-agent',
      toolCalls: toolCallsBuffer.map((tc) => tc.function.name),
      success: true,
    })
  } catch (error: unknown) {
    console.error('[Maria Puspa Telegram API] Error:', error)
    const message =
      error instanceof Error ? error.message : 'AI service unavailable'

    return NextResponse.json({
      content: `Maaf, Maria Puspa mengalami masalah: ${message}. Sila cuba lagi.`,
      model: 'fallback',
      success: false,
    })
  }
}
