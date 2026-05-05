// PUSPA V4 — Maria Puspa Telegram Bot
// Bridges Telegram messages to the Maria Puspa AI backend
// Uses long polling (no webhook needed)

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''
const PUSPA_API_URL = process.env.PUSPA_API_URL || 'http://localhost:3000'
const PUSPA_AI_ENDPOINT = `${PUSPA_API_URL}/api/v1/ai/telegram`

const TELEGRAM_API = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`

// ─── User session tracking ────────────────────────────────
interface UserSession {
  chatId: number
  userId: string
  firstName?: string
  lastName?: string
  username?: string
  role: string
  lastActivity: Date
}

const sessions = new Map<number, UserSession>()

function getSession(chatId: number): UserSession | undefined {
  return sessions.get(chatId)
}

function createSession(msg: any): UserSession {
  const session: UserSession = {
    chatId: msg.chat.id,
    userId: `telegram-${msg.from.id}`,
    firstName: msg.from.first_name,
    lastName: msg.from.last_name,
    username: msg.from.username,
    role: 'staff', // Default role — can be upgraded
    lastActivity: new Date(),
  }
  sessions.set(chatId, session)
  return session
}

// ─── Telegram API helpers ─────────────────────────────────

async function sendMessage(chatId: number, text: string, parseMode: string = 'Markdown') {
  // Split long messages (Telegram limit: 4096 chars)
  const chunks = splitMessage(text, 4000)
  
  for (const chunk of chunks) {
    try {
      const res = await fetch(`${TELEGRAM_API}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: chunk,
          parse_mode: parseMode,
          disable_web_page_preview: true,
        }),
      })
      
      if (!res.ok) {
        // Fallback: send without markdown if parsing fails
        const errorData = await res.json().catch(() => ({}))
        if (errorData.description?.includes('can\'t parse')) {
          await fetch(`${TELEGRAM_API}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: chatId,
              text: chunk,
              disable_web_page_preview: true,
            }),
          })
        } else {
          console.error('[Telegram] Send error:', errorData)
        }
      }
      
      // Rate limiting: wait between messages
      if (chunks.length > 1) {
        await new Promise(r => setTimeout(r, 500))
      }
    } catch (err) {
      console.error('[Telegram] Failed to send message:', err)
    }
  }
}

async function sendTypingAction(chatId: number) {
  try {
    await fetch(`${TELEGRAM_API}/sendChatAction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        action: 'typing',
      }),
    })
  } catch {}
}

function splitMessage(text: string, maxLength: number): string[] {
  if (text.length <= maxLength) return [text]
  
  const chunks: string[] = []
  let remaining = text
  
  while (remaining.length > 0) {
    if (remaining.length <= maxLength) {
      chunks.push(remaining)
      break
    }
    
    // Find a natural break point
    let breakPoint = remaining.lastIndexOf('\n', maxLength)
    if (breakPoint < maxLength / 2) {
      breakPoint = remaining.lastIndexOf('. ', maxLength)
    }
    if (breakPoint < maxLength / 2) {
      breakPoint = maxLength
    }
    
    chunks.push(remaining.substring(0, breakPoint + 1))
    remaining = remaining.substring(breakPoint + 1)
  }
  
  return chunks
}

// ─── Maria Puspa AI API call ──────────────────────────────

async function callMariaPuspa(text: string, userId: string, userRole: string, currentView: string = 'dashboard'): Promise<string> {
  try {
    const res = await fetch(PUSPA_AI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        userId,
        userRole,
        currentView,
        source: 'telegram',
      }),
    })

    if (!res.ok) {
      const errorText = await res.text()
      console.error('[Maria Puspa API] Error:', res.status, errorText)
      return 'Maaf, Maria Puspa sedang mengalami masalah teknikal. Sila cuba lagi sebentar.'
    }

    // Check if response is SSE stream
    const contentType = res.headers.get('content-type') || ''
    if (contentType.includes('text/event-stream')) {
      return await parseSSEStream(res)
    }

    // JSON fallback
    const data = await res.json()
    return data.content || 'Maaf, tiada respons diterima.'
  } catch (err) {
    console.error('[Maria Puspa API] Connection failed:', err)
    return 'Maaf, Maria Puspa tidak dapat dihubungi sekarang. Sila cuba lagi nanti.'
  }
}

async function parseSSEStream(res: Response): Promise<string> {
  const reader = res.body?.getReader()
  if (!reader) return 'Maaf, stream tidak tersedia.'

  const decoder = new TextDecoder()
  let fullContent = ''
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() || ''

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue
      const data = line.slice(6).trim()
      if (!data) continue

      try {
        const parsed = JSON.parse(data)
        if (parsed.type === 'content' && parsed.content) {
          fullContent += parsed.content
        }
      } catch {
        // Skip malformed JSON
      }
    }
  }

  return fullContent || 'Maaf, tiada respons diterima daripada Maria Puspa.'
}

// ─── Message Handler ──────────────────────────────────────

async function handleMessage(msg: any) {
  const chatId = msg.chat.id
  const text = msg.text?.trim()

  if (!text) return

  // Get or create session
  let session = getSession(chatId)
  if (!session) {
    session = createSession(msg)
    console.log(`[Telegram] New session: ${session.userId} (${session.firstName})`)
  }
  session.lastActivity = new Date()

  // ─── Command handlers ────────────────────────────
  if (text === '/start') {
    await sendMessage(chatId,
      `🪷 *Selamat Datang ke Maria Puspa!*\n\n` +
      `Saya Maria Puspa, AI Assistant PUSPA — Pertubuhan Urus Peduli Asnaf.\n\n` +
      `Saya boleh bantu anda:\n` +
      `• Semak data ahli asnaf & kes\n` +
      `• Ringkasan derma & agihan\n` +
      `• Status program & sukarelawan\n` +
      `• Carian web untuk maklumat terkini\n` +
      `• Laporan pematuhan & kesihatan sistem\n\n` +
      `Taip apa-apa soalan untuk mula!`
    )
    return
  }

  if (text === '/help') {
    await sendMessage(chatId,
      `*Maria Puspa — Arahan*\n\n` +
      `/start — Mesej aluan\n` +
      `/help — Senarai arahan\n` +
      `/reset — Reset perbualan\n` +
      `/role [staff|admin] — Tukar peranan akses\n` +
      `/status — Status sistem\n\n` +
      `Atau taip soalan dalam BM/English.`
    )
    return
  }

  if (text === '/reset') {
    sessions.delete(chatId)
    session = createSession(msg)
    await sendMessage(chatId, 'Perbualan telah direset. Saya sedia membantu!')
    return
  }

  if (text.startsWith('/role ')) {
    const role = text.split(' ')[1]
    if (['staff', 'admin', 'developer'].includes(role)) {
      session.role = role
      await sendMessage(chatId, `Peranan ditukar ke: *${role}*. Akses tools dikemaskini.`)
    } else {
      await sendMessage(chatId, 'Peranan tidak sah. Pilihan: staff, admin, developer')
    }
    return
  }

  if (text === '/status') {
    await sendTypingAction(chatId)
    const statusText = `*Status Maria Puspa*\n\n` +
      `👤 Pengguna: ${session.firstName || 'Unknown'}\n` +
      `🆔 ID: ${session.userId}\n` +
      `🔑 Peranan: ${session.role}\n` +
      `⏰ Aktif: ${session.lastActivity.toLocaleString('ms-MY')}\n` +
      `📊 Sesi aktif: ${sessions.size}`
    await sendMessage(chatId, statusText)
    return
  }

  // ─── AI Query ────────────────────────────────────
  // Show typing indicator
  await sendTypingAction(chatId)

  // Call Maria Puspa AI
  const response = await callMariaPuspa(text, session.userId, session.role)

  // Send response
  await sendMessage(chatId, response)
}

// ─── Long Polling ─────────────────────────────────────────

let lastUpdateId = 0
let isPolling = false

async function poll() {
  if (isPolling) return
  isPolling = true

  try {
    const res = await fetch(`${TELEGRAM_API}/getUpdates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        offset: lastUpdateId + 1,
        timeout: 30,
        allowed_updates: ['message'],
      }),
    })

    if (!res.ok) {
      console.error('[Telegram] Poll error:', res.status)
      return
    }

    const data = await res.json()

    if (data.ok && data.result?.length > 0) {
      for (const update of data.result) {
        lastUpdateId = update.update_id

        if (update.message) {
          // Process in background
          handleMessage(update.message).catch(err => {
            console.error('[Telegram] Message handler error:', err)
          })
        }
      }
    }
  } catch (err) {
    console.error('[Telegram] Poll failed:', err)
  } finally {
    isPolling = false
  }
}

// ─── Main Loop ────────────────────────────────────────────

async function main() {
  console.log('🪷 Maria Puspa Telegram Bot starting...')

  if (!TELEGRAM_BOT_TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN not set!')
    console.log('📋 Setup instructions:')
    console.log('1. Open Telegram, search @BotFather')
    console.log('2. Send /newbot')
    console.log('3. Choose a name: "Maria Puspa AI"')
    console.log('4. Choose username: "MariaPuspaAI_bot"')
    console.log('5. Copy the bot token')
    console.log('6. Add to .env: TELEGRAM_BOT_TOKEN=your-token-here')
    console.log('7. Restart this service')
    process.exit(1)
  }

  // Verify bot token
  try {
    const meRes = await fetch(`${TELEGRAM_API}/getMe`)
    const meData = await meRes.json()
    
    if (!meData.ok) {
      console.error('❌ Invalid bot token:', meData.description)
      process.exit(1)
    }

    console.log(`✅ Connected as: @${meData.result.username} (${meData.result.first_name})`)
  } catch (err) {
    console.error('❌ Failed to verify bot token:', err)
    process.exit(1)
  }

  // Delete webhook if any (we use polling)
  await fetch(`${TELEGRAM_API}/deleteWebhook`)

  console.log('🔄 Starting long poll...')
  console.log('📱 Send /start to your bot on Telegram to begin!')

  // Poll loop
  while (true) {
    await poll()
    // Small delay to prevent tight loop on errors
    await new Promise(r => setTimeout(r, 100))
  }
}

main().catch(console.error)
