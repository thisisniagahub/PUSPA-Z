// PUSPA V5 — OpenRouter Client
// Handles API calls to OpenRouter with automatic key rotation
// Docs: https://openrouter.ai/docs/quickstart
// OpenRouter is fully OpenAI-compatible (chat completions + tool calling + streaming)

const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1'
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini'
const OPENROUTER_APP_NAME = process.env.OPENROUTER_APP_NAME || 'PUSPA V5'
const OPENROUTER_APP_URL = process.env.OPENROUTER_APP_URL || 'http://localhost:3000'

// ─── Key Rotation ────────────────────────────────────────────

// Support multiple key formats: OPENROUTER_API_KEY or OPENROUTER_API_KEY_1, _2, etc.
const API_KEYS = [
  process.env.OPENROUTER_API_KEY,  // Single key (preferred)
  process.env.OPENROUTER_API_KEY_1,
  process.env.OPENROUTER_API_KEY_2,
  process.env.OPENROUTER_API_KEY_3,
  process.env.OPENROUTER_API_KEY_4,
].filter(Boolean) as string[]

if (API_KEYS.length === 0) {
  console.warn('[OpenRouter] WARNING: No API keys configured in .env')
} else {
  console.log(`[OpenRouter] ${API_KEYS.length} API key(s) loaded`)
}

// Advanced: Model fallback chain for reliability
const MODEL_FALLBACK_CHAIN = [
  process.env.OPENROUTER_MODEL || 'tencent/hy3-preview:free',
  'openai/gpt-4o-mini',
  'openai/gpt-3.5-turbo',
]

let currentModelIndex = 0

function getNextModel(): string {
  const model = MODEL_FALLBACK_CHAIN[currentModelIndex % MODEL_FALLBACK_CHAIN.length]
  return model
}

function rotateModel(): void {
  if (MODEL_FALLBACK_CHAIN.length > 1) {
    currentModelIndex = (currentModelIndex + 1) % MODEL_FALLBACK_CHAIN.length
    console.log(`[OpenRouter] Rotated to model: ${MODEL_FALLBACK_CHAIN[currentModelIndex]}`)
  }
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

// ─── Build Headers (per OpenRouter docs) ─────────────────────
// Authorization: Bearer <KEY>
// HTTP-Referer: <YOUR_SITE_URL> (optional, for rankings)
// X-OpenRouter-Title: <YOUR_SITE_NAME> (optional, for rankings)

function buildHeaders(apiKey: string): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  }

  // Optional headers per OpenRouter docs — for app attribution/rankings
  if (OPENROUTER_APP_URL) {
    headers['HTTP-Referer'] = OPENROUTER_APP_URL
  }
  if (OPENROUTER_APP_NAME) {
    headers['X-OpenRouter-Title'] = OPENROUTER_APP_NAME
  }

  return headers
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

// ─── Retry Logic ─────────────────────────────────────────────

const MAX_RETRIES = 2

// ─── Chat Completion (Non-Streaming) ─────────────────────────

export async function createChatCompletion(options: OpenRouterChatOptions, retryCount = 0) {
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
      headers: buildHeaders(apiKey),
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[OpenRouter] API error ${response.status}: ${errorText}`)

      // If rate limited or server error, rotate key and retry
      if (response.status === 429 || response.status >= 500) {
        rotateKey()
        if (retryCount < MAX_RETRIES) {
          console.log(`[OpenRouter] Retrying (${retryCount + 1}/${MAX_RETRIES})...`)
          return createChatCompletion(options, retryCount + 1)
        }
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
// Per OpenRouter docs: Set stream: true for SSE responses

export async function createChatCompletionStream(options: OpenRouterChatOptions, retryCount = 0) {
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
      headers: buildHeaders(apiKey),
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[OpenRouter] Stream error ${response.status}: ${errorText}`)

      // If rate limited or server error, rotate key and retry
      if (response.status === 429 || response.status >= 500) {
        rotateKey()
        if (retryCount < MAX_RETRIES) {
          console.log(`[OpenRouter] Retrying stream (${retryCount + 1}/${MAX_RETRIES})...`)
          return createChatCompletionStream(options, retryCount + 1)
        }
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
