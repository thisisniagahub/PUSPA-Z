// PUSPA V4 — Maria Puspa AI Store (Zustand)
// Manages AI chat state, streaming, and tool call tracking
// Replaces the old inline chat state in components

import { create } from 'zustand'

// ─── Types ───────────────────────────────────────────────────

export interface MariaPuspaMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  model?: string
  toolCalls?: string[]
  isStreaming?: boolean
}

export interface ToolCallLog {
  id: string
  tool: string
  status: 'success' | 'error' | 'pending'
  timestamp: Date
  result?: string
}

interface MariaPuspaState {
  // Messages
  messages: MariaPuspaMessage[]
  addMessage: (msg: MariaPuspaMessage) => void
  updateLastAssistantMessage: (content: string) => void
  finalizeLastAssistantMessage: (model?: string, toolCalls?: string[]) => void
  clearMessages: () => void

  // Streaming state
  isStreaming: boolean
  setIsStreaming: (streaming: boolean) => void

  // Model info
  modelName: string
  setModelName: (name: string) => void

  // Tool calls log
  toolCalls: ToolCallLog[]
  addToolCall: (tc: ToolCallLog) => void
  updateToolCall: (id: string, status: ToolCallLog['status'], result?: string) => void
  clearToolCalls: () => void

  // Error state
  lastError: string | null
  setLastError: (error: string | null) => void

  // Send message function (streaming)
  sendMessage: (text: string, currentView: string, userId: string, userRole: string) => Promise<void>
}

// ─── Store ───────────────────────────────────────────────────

const WELCOME_MESSAGE: MariaPuspaMessage = {
  id: 'welcome',
  role: 'assistant',
  content:
    'Hai, saya Maria Puspa. AI Assistant PUSPA. Apa yang boleh saya bantu?',
  timestamp: new Date(),
  model: 'hermes-agent',
}

// Keep backward-compatible type alias
export type HermesMessage = MariaPuspaMessage

// Primary export name
export const useMariaPuspaStore = create<MariaPuspaState>()((set, get) => ({
  // ─── Messages ────────────────────────────────────────────
  messages: [WELCOME_MESSAGE],

  addMessage: (msg) =>
    set((state) => ({ messages: [...state.messages, msg] })),

  updateLastAssistantMessage: (content) =>
    set((state) => {
      const messages = [...state.messages]
      const lastIdx = messages.findLastIndex((m) => m.role === 'assistant')
      if (lastIdx >= 0) {
        messages[lastIdx] = {
          ...messages[lastIdx],
          content: messages[lastIdx].content + content,
          isStreaming: true,
        }
      }
      return { messages }
    }),

  finalizeLastAssistantMessage: (model, toolCalls) =>
    set((state) => {
      const messages = [...state.messages]
      const lastIdx = messages.findLastIndex((m) => m.role === 'assistant')
      if (lastIdx >= 0) {
        messages[lastIdx] = {
          ...messages[lastIdx],
          isStreaming: false,
          model: model || messages[lastIdx].model,
          toolCalls: toolCalls || messages[lastIdx].toolCalls,
        }
      }
      return { messages }
    }),

  clearMessages: () =>
    set({ messages: [WELCOME_MESSAGE], toolCalls: [], lastError: null }),

  // ─── Streaming ───────────────────────────────────────────
  isStreaming: false,
  setIsStreaming: (streaming) => set({ isStreaming: streaming }),

  // ─── Model ───────────────────────────────────────────────
  modelName: 'hermes-agent',
  setModelName: (name) => set({ modelName: name }),

  // ─── Tool Calls ──────────────────────────────────────────
  toolCalls: [],

  addToolCall: (tc) =>
    set((state) => ({ toolCalls: [...state.toolCalls, tc] })),

  updateToolCall: (id, status, result) =>
    set((state) => ({
      toolCalls: state.toolCalls.map((tc) =>
        tc.id === id ? { ...tc, status, result } : tc
      ),
    })),

  clearToolCalls: () => set({ toolCalls: [] }),

  // ─── Error ───────────────────────────────────────────────
  lastError: null,
  setLastError: (error) => set({ lastError: error }),

  // ─── Send Message (Streaming) ────────────────────────────
  sendMessage: async (text, currentView, userId, userRole) => {
    const { isStreaming } = get()
    if (isStreaming || !text.trim()) return

    // Add user message
    const userMsg: MariaPuspaMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    }
    set((state) => ({ messages: [...state.messages, userMsg], lastError: null }))

    // Add placeholder assistant message for streaming
    const assistantId = `assistant-${Date.now()}`
    const assistantMsg: MariaPuspaMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      model: 'hermes-agent',
      isStreaming: true,
    }
    set((state) => ({
      messages: [...state.messages, assistantMsg],
      isStreaming: true,
    }))

    try {
      const res = await fetch('/api/v1/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...get().messages.filter((m) => m.id !== assistantId)].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          currentView,
          userId,
          userRole,
        }),
      })

      if (!res.ok) {
        throw new Error(`AI request failed: ${res.status}`)
      }

      // Check if response is SSE stream
      const contentType = res.headers.get('content-type') || ''
      if (contentType.includes('text/event-stream')) {
        // ─── SSE Streaming ─────────────────────────────────
        const reader = res.body?.getReader()
        if (!reader) throw new Error('No stream reader available')

        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || '' // Keep incomplete line in buffer

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const data = line.slice(6).trim()
            if (!data) continue

            try {
              const parsed = JSON.parse(data)

              switch (parsed.type) {
                case 'content':
                  get().updateLastAssistantMessage(parsed.content)
                  break

                case 'tool_calls':
                  // Log tool calls
                  for (const toolName of parsed.tools || []) {
                    get().addToolCall({
                      id: `tc-${Date.now()}-${toolName}`,
                      tool: toolName,
                      status: 'pending',
                      timestamp: new Date(),
                    })
                  }
                  break

                case 'tool_result': {
                  // Update tool call status
                  const tcList = get().toolCalls
                  const lastTc = tcList.findLast((tc) => tc.tool === parsed.name)
                  if (lastTc) {
                    const resultData = JSON.parse(parsed.content)
                    get().updateToolCall(
                      lastTc.id,
                      resultData.error ? 'error' : 'success',
                      parsed.content
                    )
                  }
                  break
                }

                case 'done':
                  get().finalizeLastAssistantMessage(
                    parsed.model,
                    parsed.toolCalls
                  )
                  get().setModelName(parsed.model || 'hermes-agent')
                  break

                case 'error':
                  get().setLastError(parsed.content)
                  get().finalizeLastAssistantMessage()
                  break
              }
            } catch {
              // Skip malformed JSON
            }
          }
        }
      } else {
        // ─── JSON Response (fallback) ──────────────────────
        const data = await res.json()
        set((state) => {
          const messages = [...state.messages]
          const lastIdx = messages.findLastIndex((m) => m.role === 'assistant')
          if (lastIdx >= 0) {
            messages[lastIdx] = {
              ...messages[lastIdx],
              content: data.content || 'Maaf, saya tidak dapat memproses permintaan anda.',
              isStreaming: false,
              model: data.model || 'hermes-agent',
              toolCalls: data.toolCalls,
            }
          }
          return { messages, modelName: data.model || 'hermes-agent' }
        })

        // Log tool calls from non-streaming response
        if (data.toolCalls) {
          for (const toolName of data.toolCalls) {
            get().addToolCall({
              id: `tc-${Date.now()}-${toolName}`,
              tool: toolName,
              status: 'success',
              timestamp: new Date(),
            })
          }
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown error'

      // Update the assistant message with error
      set((state) => {
        const messages = [...state.messages]
        const lastIdx = messages.findLastIndex((m) => m.role === 'assistant')
        if (lastIdx >= 0) {
          messages[lastIdx] = {
            ...messages[lastIdx],
            content:
              state.messages[lastIdx].content ||
              `Maaf, terdapat ralat: ${errorMessage}. Sila cuba lagi.`,
            isStreaming: false,
            model: 'fallback',
          }
        }
        return { messages, lastError: errorMessage }
      })
    } finally {
      set({ isStreaming: false })
    }
  },
}))

// Backward-compatible alias
export const useHermesStore = useMariaPuspaStore
