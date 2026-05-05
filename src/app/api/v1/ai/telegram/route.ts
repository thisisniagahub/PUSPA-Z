// PUSPA V4 — Maria Puspa Telegram API Endpoint
// POST /api/v1/ai/telegram — Dedicated endpoint for Telegram bot
// Handles single text messages and returns full AI response (non-streaming for Telegram)

import { NextRequest, NextResponse } from 'next/server'
import {
  runMariaPuspa,
  executeToolCalls,
  saveAssistantMessage,
  isMariaPuspaConfigured,
} from '@/agents/runtime/hermes.runtime'
import { createChatCompletion } from '@/lib/openrouter'
import type { ToolCall } from '@/agents/runtime/hermes.runtime'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, userId, userRole, currentView } = body

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'No valid message provided' },
        { status: 400 }
      )
    }

    // ─── Check OpenRouter Configuration ─────────────────────
    if (!isMariaPuspaConfigured()) {
      return NextResponse.json({
        content: 'Maaf, Maria Puspa tidak dikonfigurasi. Sila hubungi pentadbir.',
        model: 'fallback',
        success: false,
      })
    }

    // ─── Run Maria Puspa Runtime ────────────────────────────
    const payload = await runMariaPuspa(
      message,
      userId || 'telegram-anonymous',
      userRole || 'staff',
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
        model: 'maria-puspa',
      })
    }

    let fullContent = choice.message?.content || ''
    let toolCallsBuffer: ToolCall[] = []

    // ─── Handle Tool Calls ─────────────────────────────────
    if (choice.message?.tool_calls && choice.message.tool_calls.length > 0) {
      toolCallsBuffer = choice.message.tool_calls

      // Execute tool calls
      const toolResults = await executeToolCalls(toolCallsBuffer, userRole || 'staff')

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
      model: 'maria-puspa',
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
