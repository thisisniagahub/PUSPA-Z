// PUSPA V4 — OpenRouter Client
// Handles API calls to OpenRouter with automatic key rotation
// OpenRouter is fully OpenAI-compatible (chat completions + tool calling + streaming)

const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1'
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini'
const OPENROUTER_APP_NAME = process.env.OPENROUTER_APP_NAME || 'PUSPA V4'
const OPENROUTER_APP_URL = process.env.OPENROUTER_APP_URL || 'http://localhost:3000'

// ─── Key Rotation ────────────────────────────────────────────

const API_KEYS = [
  process.env.OPENROUTER_API_KEY_1,
  process.env.OPENROUTER_API_KEY_2,
].filter(Boolean) as string[]

if (API_KEYS.length === 0) {
  console.warn('[OpenRouter] WARNING: No API keys configured in .env')
}

let currentKeyIndex = 0

function getNextKey(): string {
  if (API_KEYS.length === 0) {
    throw new Error('No OpenRouter API keys configured')
  }
  const key = API_KEYS[currentKeyIndex % API_KEYS.length]
  return key
}

function rotateKey(): void {
  if (API_KEYS.length > 1) {
    currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length
    console.log(`[OpenRouter] Rotated to key index ${currentKeyIndex}`)
  }
}

// ─── Types ───────────────────────────────────────────────────

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
  tool_call_id?: string
  name?: string
  tool_calls?: OpenRouterToolCall[]
}

export interface OpenRouterToolCall {
  id: string
  type: 'function'
  function: {
    name: string
    arguments: string
  }
}

export interface OpenRouterTool {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: Record<string, unknown>
  }
}

export interface OpenRouterChatOptions {
  messages: OpenRouterMessage[]
  tools?: OpenRouterTool[]
  tool_choice?: 'auto' | 'none' | { type: 'function'; function: { name: string } }
  stream?: boolean
  model?: string
  temperature?: number
  max_tokens?: number
}

// ─── Chat Completion (Non-Streaming) ─────────────────────────

export async function createChatCompletion(options: OpenRouterChatOptions) {
  const apiKey = getNextKey()
  const model = options.model || OPENROUTER_MODEL

  const body: Record<string, unknown> = {
    model,
    messages: options.messages,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.max_tokens ?? 2048,
  }

  if (options.tools && options.tools.length > 0) {
    body.tools = options.tools
    body.tool_choice = options.tool_choice || 'auto'
  }

  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': OPENROUTER_APP_URL,
        'X-Title': OPENROUTER_APP_NAME,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[OpenRouter] API error ${response.status}: ${errorText}`)

      // If rate limited or server error, try rotating key
      if (response.status === 429 || response.status >= 500) {
        rotateKey()
      }

      throw new Error(`OpenRouter API error ${response.status}: ${errorText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('[OpenRouter] Request failed:', error)
    throw error
  }
}

// ─── Chat Completion (Streaming) ─────────────────────────────

export async function createChatCompletionStream(options: OpenRouterChatOptions) {
  const apiKey = getNextKey()
  const model = options.model || OPENROUTER_MODEL

  const body: Record<string, unknown> = {
    model,
    messages: options.messages,
    stream: true,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.max_tokens ?? 2048,
  }

  if (options.tools && options.tools.length > 0) {
    body.tools = options.tools
    body.tool_choice = options.tool_choice || 'auto'
  }

  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': OPENROUTER_APP_URL,
        'X-Title': OPENROUTER_APP_NAME,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[OpenRouter] Stream error ${response.status}: ${errorText}`)

      // If rate limited or server error, try rotating key
      if (response.status === 429 || response.status >= 500) {
        rotateKey()
      }

      throw new Error(`OpenRouter stream error ${response.status}: ${errorText}`)
    }

    return response.body as ReadableStream<Uint8Array>
  } catch (error) {
    console.error('[OpenRouter] Stream request failed:', error)
    throw error
  }
}

// ─── Utility ─────────────────────────────────────────────────

export function getConfiguredModel(): string {
  return OPENROUTER_MODEL
}

export function getKeyCount(): number {
  return API_KEYS.length
}

export function isConfigured(): boolean {
  return API_KEYS.length > 0
}
