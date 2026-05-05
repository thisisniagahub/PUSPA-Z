// PUSPA V4 — Maria Puspa AI Streaming API Endpoint
// POST /api/v1/ai → OpenRouter (OpenAI-compatible) with streaming + tool calling

import { NextRequest, NextResponse } from 'next/server'
import {
  runMariaPuspa,
  executeToolCalls,
  saveAssistantMessage,
  isMariaPuspaConfigured,
} from '@/agents/runtime/hermes.runtime'
import { createChatCompletionStream } from '@/lib/openrouter'
import type { ToolCall } from '@/agents/runtime/hermes.runtime'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { messages: clientMessages, currentView, userId, userRole } = body

    // ─── Check OpenRouter Configuration ─────────────────────
    if (!isMariaPuspaConfigured()) {
      return NextResponse.json(
        {
          content: 'Maaf, Maria Puspa tidak dikonfigurasi. OpenRouter API keys belum disetup. Sila tambah OPENROUTER_API_KEY_1 dalam .env',
          model: 'fallback',
          success: false,
          error: 'OpenRouter not configured',
        },
        { status: 503 }
      )
    }

    // ─── Authentication ─────────────────────────────────────
    const effectiveUserId = userId || 'anonymous'
    const effectiveRole = userRole || 'staff'

    // ─── Get the last user message ──────────────────────────
    const lastUserMessage = clientMessages?.[clientMessages.length - 1]?.content
    if (!lastUserMessage || typeof lastUserMessage !== 'string') {
      return NextResponse.json(
        { error: 'No valid user message provided' },
        { status: 400 }
      )
    }

    // ─── Run Maria Puspa Runtime ────────────────────────────
    const payload = await runMariaPuspa(
      lastUserMessage,
      effectiveUserId,
      effectiveRole,
      currentView || 'dashboard'
    )

    // ─── Call OpenRouter with Streaming ──────────────────────
    const streamOptions = {
      messages: payload.messages,
      tools: payload.tools.length > 0 ? payload.tools : undefined,
      tool_choice: payload.tools.length > 0 ? 'auto' as const : undefined,
      model: payload.model,
    }

    const stream = await createChatCompletionStream(streamOptions)

    // ─── Process SSE Stream ─────────────────────────────────
    return handleSSEStream(
      stream,
      effectiveUserId,
      effectiveRole,
      payload.messages,
      payload.tools,
      payload.model
    )
  } catch (error: unknown) {
    console.error('[Maria Puspa API] Runtime error:', error)
    const message =
      error instanceof Error ? error.message : 'AI service unavailable'

    return NextResponse.json(
      {
        content: `Maaf, Maria Puspa mengalami masalah: ${message}. Sila cuba lagi nanti.`,
        model: 'fallback',
        success: false,
        error: message,
      },
      { status: 500 }
    )
  }
}

// ─── SSE Stream Handler ──────────────────────────────────────

function handleSSEStream(
  stream: ReadableStream<Uint8Array>,
  userId: string,
  userRole: string,
  originalMessages: Array<{ role: string; content: string; tool_call_id?: string; name?: string; tool_calls?: unknown }>,
  tools: Array<{ type: string; function: { name: string; description: string; parameters: unknown } }>,
  model: string
) {
  const encoder = new TextEncoder()
  let fullContent = ''
  let toolCallsBuffer: ToolCall[] = []
  let currentToolCall: { id?: string; functionName: string; functionArgs: string } | null = null

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
            if (!data) continue

            try {
              const parsed = JSON.parse(data)
              const delta = parsed.choices?.[0]?.delta

              if (delta) {
                // ─── Content Streaming ────────────────────────
                if (delta.content) {
                  fullContent += delta.content
                  controller.enqueue(
                    encoder.encode(
                      `data: ${JSON.stringify({ type: 'content', content: delta.content })}\n\n`
                    )
                  )
                }

                // ─── Tool Calls Streaming ─────────────────────
                if (delta.tool_calls) {
                  for (const tc of delta.tool_calls) {
                    if (tc.id) {
                      // Save previous tool call if any
                      if (currentToolCall?.id) {
                        toolCallsBuffer.push({
                          id: currentToolCall.id,
                          type: 'function',
                          function: {
                            name: currentToolCall.functionName,
                            arguments: currentToolCall.functionArgs,
                          },
                        })
                      }
                      // Start new tool call
                      currentToolCall = {
                        id: tc.id,
                        functionName: tc.function?.name || '',
                        functionArgs: '',
                      }
                    }
                    if (tc.function?.arguments) {
                      if (currentToolCall) {
                        currentToolCall.functionArgs += tc.function.arguments
                      }
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
        if (currentToolCall?.id) {
          toolCallsBuffer.push({
            id: currentToolCall.id,
            type: 'function',
            function: {
              name: currentToolCall.functionName,
              arguments: currentToolCall.functionArgs,
            },
          })
        }

        // ─── Execute Tool Calls ─────────────────────────────
        if (toolCallsBuffer.length > 0) {
          // Notify frontend about tool calls being executed
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

          // ─── Second AI call with tool results ──────────────
          const secondMessages = [
            ...originalMessages,
            {
              role: 'assistant' as const,
              content: fullContent,
              tool_calls: toolCallsBuffer,
            },
            ...toolResults,
          ]

          const secondStream = await createChatCompletionStream({
            messages: secondMessages,
            model,
          })

          // Stream the second response
          const secondReader = secondStream.getReader()
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
              if (!data2) continue

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

        // Save assistant message to memory
        await saveAssistantMessage(userId, fullContent)

        // Send completion signal — hide model name from user
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: 'done',
              model: 'maria-puspa',
              toolCalls: toolCallsBuffer.map((tc) => tc.function.name),
            })}\n\n`
          )
        )
      } catch (err) {
        console.error('[Maria Puspa SSE] Stream processing error:', err)
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
