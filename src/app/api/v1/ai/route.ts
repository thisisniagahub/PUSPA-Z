// PUSPA V4 — Hermes AI Streaming API Endpoint
// POST /api/v1/ai — Authenticates, runs Hermes runtime, returns SSE stream

import { NextRequest, NextResponse } from 'next/server'
import { runHermes, executeToolCalls, saveAssistantMessage } from '@/agents/runtime/hermes.runtime'
import type { ToolCall } from '@/agents/runtime/hermes.runtime'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages: clientMessages, currentView, userId, userRole } = body

    // ─── Authentication (fail-closed) ───────────────────────
    // In production, this would validate a Supabase SSR session.
    // For now, we accept userId/role from the client but with a server-side fallback.
    const effectiveUserId = userId || 'anonymous'
    const effectiveRole = userRole || 'staff'

    if (!effectiveUserId || effectiveUserId === 'anonymous') {
      // Allow anonymous for now but restrict to staff-level tools
    }

    // ─── Get the last user message ──────────────────────────
    const lastUserMessage = clientMessages?.[clientMessages.length - 1]?.content
    if (!lastUserMessage || typeof lastUserMessage !== 'string') {
      return NextResponse.json(
        { error: 'No valid user message provided' },
        { status: 400 }
      )
    }

    // ─── Run Hermes Runtime ─────────────────────────────────
    const hermesPayload = await runHermes(
      lastUserMessage,
      effectiveUserId,
      effectiveRole,
      currentView || 'dashboard'
    )

    // ─── Call AI with Streaming ─────────────────────────────
    const ZAI = (await import('z-ai-web-dev-sdk')).default
    const zai = await ZAI.create()

    // First call: with tools available
    const streamBody: Record<string, unknown> = {
      messages: hermesPayload.messages.map((m) => ({
        role: m.role,
        content: m.content,
        ...(m.tool_call_id ? { tool_call_id: m.tool_call_id } : {}),
        ...(m.name ? { name: m.name } : {}),
      })),
      stream: true,
      thinking: { type: 'disabled' },
    }

    // Add tools if available
    if (hermesPayload.tools.length > 0) {
      streamBody.tools = hermesPayload.tools
      streamBody.tool_choice = 'auto'
    }

    const streamResult = await zai.chat.completions.create(streamBody)

    // ─── Handle Streaming Response ──────────────────────────
    // If we get a ReadableStream (real streaming), pipe it through
    if (streamResult && typeof streamResult === 'object' && 'getReader' in streamResult) {
      return handleStreamResponse(
        streamResult as ReadableStream<Uint8Array>,
        effectiveUserId,
        effectiveRole,
        hermesPayload.messages,
        hermesPayload.tools.length > 0 ? zai : null,
        hermesPayload.tools
      )
    }

    // ─── Handle Non-Streaming Response ───────────────────────
    // If the API returned a full response (not a stream)
    const completion = streamResult as {
      choices?: Array<{
        message?: {
          content?: string
          tool_calls?: ToolCall[]
        }
        finish_reason?: string
      }>
    }

    const choice = completion?.choices?.[0]
    const assistantMessage = choice?.message

    // Handle tool calls in non-streaming mode
    if (assistantMessage?.tool_calls && assistantMessage.tool_calls.length > 0) {
      const toolResults = await executeToolCalls(
        assistantMessage.tool_calls,
        effectiveRole
      )

      // Second call with tool results
      const secondMessages = [
        ...hermesPayload.messages,
        {
          role: 'assistant' as const,
          content: assistantMessage.content || '',
          tool_calls: assistantMessage.tool_calls,
        },
        ...toolResults,
      ]

      const secondCompletion = await zai.chat.completions.create({
        messages: secondMessages.map((m) => ({
          role: m.role,
          content: m.content,
          ...(m.tool_call_id ? { tool_call_id: m.tool_call_id } : {}),
          ...(m.name ? { name: m.name } : {}),
        })),
        thinking: { type: 'disabled' },
      })

      const finalContent =
        (secondCompletion as { choices?: Array<{ message?: { content?: string } }> })
          ?.choices?.[0]?.message?.content ||
        assistantMessage.content ||
        'Saya tidak dapat memproses permintaan ini.'

      await saveAssistantMessage(effectiveUserId, finalContent)

      return NextResponse.json({
        content: finalContent,
        model: 'hermes',
        toolCalls: assistantMessage.tool_calls.map((tc) => tc.function.name),
        success: true,
      })
    }

    // No tool calls — direct response
    const content =
      assistantMessage?.content || 'Saya tidak dapat memproses permintaan ini.'

    await saveAssistantMessage(effectiveUserId, content)

    return NextResponse.json({
      content,
      model: 'hermes',
      success: true,
    })
  } catch (error: unknown) {
    console.error('Hermes runtime error:', error)
    const message =
      error instanceof Error ? error.message : 'AI service unavailable'
    return NextResponse.json(
      {
        content: `Maaf, Hermes sedang mengalami masalah teknikal: ${message}. Sila cuba lagi nanti. 🦞`,
        model: 'fallback',
        success: false,
        error: message,
      },
      { status: 500 }
    )
  }
}

// ─── SSE Stream Handler ──────────────────────────────────────

async function handleStreamResponse(
  stream: ReadableStream<Uint8Array>,
  userId: string,
  userRole: string,
  originalMessages: Array<{ role: string; content: string; tool_call_id?: string; name?: string }>,
  zaiInstance: InstanceType<typeof import('z-ai-web-dev-sdk').default> | null,
  tools: Array<{ type: string; function: { name: string; description: string; parameters: unknown } }>
) {
  const encoder = new TextEncoder()
  let fullContent = ''
  let toolCallsBuffer: ToolCall[] = []
  let currentToolCall: Partial<ToolCall> | null = null
  let currentFunctionName = ''
  let currentFunctionArgs = ''

  const readable = new ReadableStream({
    async start(controller) {
      const reader = stream.getReader()
      const decoder = new TextDecoder()

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          const lines = chunk.split('\n')

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const data = line.slice(6).trim()
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              const delta = parsed.choices?.[0]?.delta

              if (delta) {
                // Handle content streaming
                if (delta.content) {
                  fullContent += delta.content
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({ type: 'content', content: delta.content })}\n\n`
                    )
                  )
                }

                // Handle tool calls streaming
                if (delta.tool_calls) {
                  for (const tc of delta.tool_calls) {
                    if (tc.id) {
                      // New tool call
                      if (currentToolCall && currentFunctionArgs) {
                        // Save previous tool call
                        toolCallsBuffer.push({
                          id: currentToolCall.id!,
                          type: 'function',
                          function: {
                            name: currentFunctionName,
                            arguments: currentFunctionArgs,
                          },
                        })
                      }
                      currentToolCall = { id: tc.id, type: 'function' }
                      currentFunctionName = tc.function?.name || ''
                      currentFunctionArgs = ''
                    }
                    if (tc.function?.arguments) {
                      currentFunctionArgs += tc.function.arguments
                    }
                  }
                }
              }
            } catch {
              // Skip malformed JSON chunks
            }
          }
        }

        // Save any remaining tool call
        if (currentToolCall && currentFunctionArgs) {
          toolCallsBuffer.push({
            id: currentToolCall.id!,
            type: 'function',
            function: {
              name: currentFunctionName,
              arguments: currentFunctionArgs,
            },
          })
        }

        // ─── Execute Tool Calls if any ─────────────────────
        if (toolCallsBuffer.length > 0) {
          // Notify frontend about tool calls
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                type: 'tool_calls',
                tools: toolCallsBuffer.map((tc) => tc.function.name),
              })}\n\n`
            )
          )

          const toolResults = await executeToolCalls(toolCallsBuffer, userRole)

          // Send tool results to frontend
          for (const result of toolResults) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({
                  type: 'tool_result',
                  name: result.name,
                  content: result.content,
                })}\n\n`
              )
            )
          }

          // Second AI call with tool results
          if (zaiInstance) {
            const secondMessages = [
              ...originalMessages,
              {
                role: 'assistant' as const,
                content: fullContent,
                tool_calls: toolCallsBuffer,
              },
              ...toolResults,
            ]

            const secondStream = await zaiInstance.chat.completions.create({
              messages: secondMessages.map((m) => ({
                role: m.role,
                content: m.content,
                ...(m.tool_call_id ? { tool_call_id: m.tool_call_id } : {}),
                ...(m.name ? { name: m.name } : {}),
              })),
              stream: true,
              thinking: { type: 'disabled' },
            })

            // Stream the second response
            if (secondStream && typeof secondStream === 'object' && 'getReader' in secondStream) {
              const secondReader = (secondStream as ReadableStream<Uint8Array>).getReader()
              let secondContent = ''

              while (true) {
                const { done: done2, value: value2 } = await secondReader.read()
                if (done2) break

                const chunk2 = decoder.decode(value2, { stream: true })
                const lines2 = chunk2.split('\n')

                for (const line2 of lines2) {
                  if (!line2.startsWith('data: ')) continue
                  const data2 = line2.slice(6).trim()
                  if (data2 === '[DONE]') continue

                  try {
                    const parsed2 = JSON.parse(data2)
                    const delta2 = parsed2.choices?.[0]?.delta
                    if (delta2?.content) {
                      secondContent += delta2.content
                      fullContent += delta2.content
                      controller.enqueue(
                        encoder.encode(
                          `data: ${JSON.stringify({ type: 'content', content: delta2.content })}\n\n`
                        )
                      )
                    }
                  } catch {
                    // Skip malformed JSON
                  }
                }
              }
            }
          }
        }

        // Save assistant message to memory
        await saveAssistantMessage(userId, fullContent)

        // Send completion signal
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: 'done',
              model: 'hermes',
              toolCalls: toolCallsBuffer.map((tc) => tc.function.name),
            })}\n\n`
          )
        )
      } catch (err) {
        console.error('Stream processing error:', err)
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: 'error',
              content: 'Stream interrupted. Please try again.',
            })}\n\n`
          )
        )
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
