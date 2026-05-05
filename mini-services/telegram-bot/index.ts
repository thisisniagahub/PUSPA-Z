// PUSPA V4 — Maria Puspa Telegram Bot
// Bridges Telegram messages to the Maria Puspa AI backend
// Uses long polling (no webhook needed)
// Allowlist-based access control

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''
const PUSPA_API_URL = process.env.PUSPA_API_URL || 'http://localhost:3000'
const PUSPA_AI_ENDPOINT = `${PUSPA_API_URL}/api/v1/ai/telegram`

// ─── Allowlist Configuration ──────────────────────────────
// Comma-separated chat IDs that are allowed to interact with the bot
const ALLOWED_CHAT_IDS = (process.env.ALLOWED_CHAT_IDS || '')
  .split(',')
  .map(id => Number(id.trim()))
  .filter(id => !isNaN(id))

// If no allowlist configured, allow all (open mode)
const ALLOWLIST_ENABLED = ALLOWED_CHAT_IDS.length > 0

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
  messageCount: number
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
    role: 'staff',
    lastActivity: new Date(),
    messageCount: 0,
  }
  sessions.set(chatId, session)
  return session
}

// ─── Access Control ───────────────────────────────────────

function isChatAllowed(chatId: number): boolean {
  if (!ALLOWLIST_ENABLED) return true
  return ALLOWED_CHAT_IDS.includes(chatId)
}

// ─── Telegram API helpers ─────────────────────────────────

async function sendMessage(chatId: number, text: string, parseMode: string = 'Markdown') {
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
        const errorData = await res.json().catch(() => ({}))
        if (errorData.description?.includes('can\'t parse')) {
          // Fallback: send without markdown
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
          console.error('[Telegram] Send error:', JSON.stringify(errorData))
        }
      }
      
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
    console.log(`[Maria Puspa] Calling API for ${userId} (role: ${userRole}): "${text.substring(0, 80)}..."`)
    
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

    // JSON response
    const data = await res.json()
    console.log(`[Maria Puspa] Got response, length: ${(data.content || '').length}`)
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

  // ─── Allowlist Check ─────────────────────────────
  if (!isChatAllowed(chatId)) {
    console.log(`[Telegram] Blocked chat ID: ${chatId} (not in allowlist)`)
    // Silently ignore or send a brief message
    await sendMessage(chatId, 
      'Maaf, anda tidak mempunyai akses kepada Maria Puspa. Hubungi pentadbir untuk kebenaran.',
      undefined // no parse mode to avoid errors
    )
    return
  }

  // Get or create session
  let session = getSession(chatId)
  if (!session) {
    session = createSession(msg)
    console.log(`[Telegram] New session: ${session.userId} (${session.firstName}) chatId=${chatId}`)
  }
  session.lastActivity = new Date()
  session.messageCount++

  // ─── Command handlers ────────────────────────────
  if (text === '/start') {
    await sendMessage(chatId,
      `🪷 *Selamat Datang ke Maria Puspa\\!*\n\n` +
      `Saya Maria Puspa, AI Assistant PUSPA — Pertubuhan Urus Peduli Asnaf\\.\n\n` +
      `Saya boleh bantu anda:\n` +
      `• Semak data ahli asnaf & kes\n` +
      `• Ringkasan derma & agihan\n` +
      `• Status program & sukarelawan\n` +
      `• Carian web untuk maklumat terkini\n` +
      `• Laporan pematuhan & kesihatan sistem\n\n` +
      `Taip apa\\-apa soalan untuk mula\\!`
    )
    return
  }

  if (text === '/help') {
    await sendMessage(chatId,
      `*Maria Puspa — Arahan*\n\n` +
      `/start — Mesej aluan\n` +
      `/help — Senarai arahan\n` +
      `/reset — Reset perbualan\n` +
      `/role \\[staff\\|admin\\|developer\\] — Tukar peranan akses\n` +
      `/status — Status sistem\n\n` +
      `Atau taip soalan dalam BM/English\\.`
    )
    return
  }

  if (text === '/reset') {
    sessions.delete(chatId)
    session = createSession(msg)
    await sendMessage(chatId, 'Perbualan telah direset. Sedia membantu!')
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
      `🆔 Chat ID: ${chatId}\n` +
      `🔑 Peranan: ${session.role}\n` +
      `💬 Mesej: ${session.messageCount}\n` +
      `⏰ Aktif: ${session.lastActivity.toLocaleString('ms-MY')}\n` +
      `📊 Sesi aktif: ${sessions.size}\n` +
      `🔒 Allowlist: ${ALLOWLIST_ENABLED ? 'Aktif' : 'Terbuka'}`
    await sendMessage(chatId, statusText)
    return
  }

  // ─── AI Query ────────────────────────────────────
  console.log(`[Telegram] Processing message from ${session.firstName} (${chatId}): "${text.substring(0, 60)}..."`)
  
  // Show typing indicator
  await sendTypingAction(chatId)

  // Keep sending typing action while waiting for AI response
  const typingInterval = setInterval(() => sendTypingAction(chatId), 4000)

  try {
    // Call Maria Puspa AI
    const response = await callMariaPuspa(text, session.userId, session.role)

    // Send response
    await sendMessage(chatId, response)
  } catch (err) {
    console.error('[Telegram] Error processing message:', err)
    await sendMessage(chatId, 'Maaf, ralat berlaku semasa memproses mesej anda. Sila cuba lagi.')
  } finally {
    clearInterval(typingInterval)
  }
}

// ─── Long Polling ─────────────────────────────────────────

let lastUpdateId = 0
let isPolling = false
let pollErrors = 0
const MAX_POLL_ERRORS = 10

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
      pollErrors++
      if (pollErrors >= MAX_POLL_ERRORS) {
        console.error('[Telegram] Too many poll errors, restarting...')
        pollErrors = 0
      }
      return
    }

    // Reset error counter on success
    pollErrors = 0

    const data = await res.json()

    if (data.ok && data.result?.length > 0) {
      for (const update of data.result) {
        lastUpdateId = update.update_id

        if (update.message) {
          // Process in background — don't block next poll
          handleMessage(update.message).catch(err => {
            console.error('[Telegram] Message handler error:', err)
          })
        }
      }
    }
  } catch (err) {
    console.error('[Telegram] Poll failed:', err)
    pollErrors++
  } finally {
    isPolling = false
  }
}

// ─── Health Check ─────────────────────────────────────────

function logHealthStatus() {
  const uptime = process.uptime()
  const hours = Math.floor(uptime / 3600)
  const minutes = Math.floor((uptime % 3600) / 60)
  console.log(
    `[Health] Uptime: ${hours}h ${minutes}m | Sessions: ${sessions.size} | ` +
    `Allowlist: ${ALLOWLIST_ENABLED ? `${ALLOWED_CHAT_IDS.length} IDs` : 'Open'} | ` +
    `Poll errors: ${pollErrors}`
  )
}

// ─── Main Loop ────────────────────────────────────────────

async function main() {
  console.log('🪷 Maria Puspa Telegram Bot starting...')
  console.log(`📅 ${new Date().toISOString()}`)

  if (!TELEGRAM_BOT_TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN not set!')
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

  // Log allowlist status
  if (ALLOWLIST_ENABLED) {
    console.log(`🔒 Allowlist ENABLED: ${ALLOWED_CHAT_IDS.length} chat IDs authorized`)
    ALLOWED_CHAT_IDS.forEach(id => console.log(`   ✅ Chat ID: ${id}`))
  } else {
    console.log('⚠️  Allowlist DISABLED — all chats allowed')
  }

  // Get pending updates and skip them (to avoid processing old messages)
  try {
    const pendingRes = await fetch(`${TELEGRAM_API}/getUpdates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offset: -1, timeout: 0 }),
    })
    const pendingData = await pendingRes.json()
    if (pendingData.ok && pendingData.result?.length > 0) {
      const maxUpdateId = Math.max(...pendingData.result.map((u: any) => u.update_id))
      lastUpdateId = maxUpdateId
      console.log(`⏭️  Skipped ${pendingData.result.length} pending updates (lastUpdateId: ${lastUpdateId})`)
    }
  } catch {}

  console.log('🔄 Starting long poll...')
  console.log('📱 Send /start to @MariaPuspaBot on Telegram to begin!')

  // Health check every 5 minutes
  setInterval(logHealthStatus, 5 * 60 * 1000)

  // Poll loop
  while (true) {
    await poll()
    await new Promise(r => setTimeout(r, 100))
  }
}

main().catch(console.error)
