---
Task ID: 1
Agent: Main
Task: Implement Phase 1 - Hermes Zero-Server Engine Backend Infrastructure

Work Log:
- Added AIMemory model to prisma/schema.prisma (id, userId, role, content, createdAt + index)
- Ran `bun run db:push` to sync database
- Created src/lib/memory.ts with getConversationHistory(), saveMessage(), clearConversationHistory()
- Created src/tools/index.ts with HermesTool interface, ping_system tool, role-based filtering (getToolsForRole), OpenAI format converter (toOpenAITools), tool executor (executeTool)
- Created src/agents/runtime/hermes.runtime.ts with runHermes() function: fetches memory, builds messages, prepares tool registry, returns payload for AI
- Created src/app/api/v1/ai/route.ts with streaming POST handler using z-ai-web-dev-sdk (stream: true returns ReadableStream)

Stage Summary:
- Full backend infrastructure for Hermes AI engine
- Streaming SSE support via z-ai-web-dev-sdk
- Tool calling with OpenAI function calling format
- Conversation persistence to AIMemory table

---
Task ID: 2
Agent: Main
Task: Implement Phase 2 - Frontend Connection with Streaming

Work Log:
- Created src/stores/hermes-store.ts (Zustand) with full streaming state management
- Updated src/modules/ai/page.tsx to use HermesStore with streaming UI (progressive rendering, cursor animation, tool call badges)
- Updated src/components/ai-chat-panel.tsx to use HermesStore with streaming support

Stage Summary:
- Zustand store manages: messages, streaming state, tool calls, errors, model name
- sendMessage() handles both SSE streaming and JSON fallback responses
- UI shows streaming cursor, tool call indicators, error banners
- Both AI page and floating chat panel use the shared HermesStore

---
Task ID: 3
Agent: Main
Task: Implement Phase 3 - Real Domain Tools

Work Log:
- Created src/tools/donations.ts with getRecentDonations(limit) and getDonationStats()
- Created src/tools/cases.ts with getActiveCases(status?) and getCaseSummary(caseId)
- IC numbers are masked (****XXXX) for PII protection
- Updated src/tools/index.ts with all tools: ping_system, get_recent_donations, get_donation_stats, get_active_cases, get_case_summary, approve_disbursement (admin-only), delete_case (admin-only)

Stage Summary:
- 7 tools in the registry with RBAC metadata
- PII masking applied (IC numbers, sensitive data)
- Admin-only tools: approve_disbursement, delete_case
- All tools have OpenAI function calling format parameters

---
Task ID: 4
Agent: Main
Task: Implement Phase 4 - Security & RBAC

Work Log:
- Added robust HERMES_SYSTEM_PROMPT to hermes.runtime.ts with persona, capabilities, security rules, response format
- Implemented getToolsForRole(userRole) that filters tools based on user role
- API route passes userRole from request body to runHermes
- executeTool() performs runtime RBAC check before executing any tool
- Staff cannot access approve_disbursement or delete_case tools

Stage Summary:
- System prompt: Hermes persona, bilingual BM/English, no hallucination rule
- Role-based tool filtering: staff (5 tools), admin (7 tools), developer (7 tools)
- Runtime RBAC check in executeTool() as defense-in-depth
- API route accepts userId and userRole from client (production would use Supabase SSR)

---
Task ID: 5
Agent: Main
Task: Integrate OpenRouter API with 4 keys, review docs, fix streaming

Work Log:
- Fetched OpenRouter docs from https://openrouter.ai/docs/quickstart.md
- Key findings: endpoint is /api/v1/chat/completions, headers are Authorization + HTTP-Referer + X-OpenRouter-Title, streaming via SSE with stream: true
- Created src/lib/openrouter.ts — dedicated OpenRouter client with 4-key rotation
- Updated .env with 4 API keys (KEY_1 through KEY_4)
- Updated hermes.runtime.ts to use OpenRouter client instead of z-ai-web-dev-sdk
- Updated API route to use createChatCompletionStream() from openrouter.ts
- Tested with openai/gpt-4o-mini → 403 (not available in region)
- Tested with google/gemma-4-31b-it:free → 429 (rate-limited upstream)
- Tested with qwen/qwen3.6-flash → 200 SUCCESS with streaming SSE
- Set default model to qwen/qwen3.6-flash (cheap, fast, tool-calling support)
- Headers per OpenRouter docs: Authorization, HTTP-Referer, X-OpenRouter-Title
- Key rotation works: auto-rotates on 429/5xx errors

Stage Summary:
- OpenRouter fully integrated and working with real streaming
- 4 API keys with automatic rotation on rate limits
- SSE streaming confirmed working end-to-end
- Hermes responds in bilingual BM/English as designed
- Memory persistence working (Prisma queries confirmed)
- Default model: qwen/qwen3.6-flash (supports tool calling)

---
Task ID: 6
Agent: Main
Task: Switch Hermes AI model to Tencent Hy3 Preview (free) on OpenRouter

Work Log:
- Searched OpenRouter for "Hy3 preview (free)" model ID → found `tencent/hy3-preview:free`
- Updated `.env` file: changed OPENROUTER_MODEL from `qwen/qwen3.6-flash` to `tencent/hy3-preview:free`
- Restarted dev server to pick up env change
- Verified lint passes (no errors)
- Confirmed server is running and ready

Stage Summary:
- Model switched to tencent/hy3-preview:free (Tencent's MoE model, free tier on OpenRouter)
- All 4 OpenRouter API keys remain configured with rotation support
- Hermes runtime picks up model from env automatically via getConfiguredModel()
- Server restarted and running successfully

---
Task ID: 7
Agent: Main
Task: Review uploaded images, merge PUSPA brand into project, rename Hermes→Maria Puspa, remove 🦞 emoji, remove model name from UI, improve AI responses (short/sharp/RAG)

Work Log:
- Analyzed 3 uploaded images with VLM:
  - Image 1: PUSPA AI Assistant brand guide (purple theme, hijab character, tagline "Cerdas. Mesra. Sentiasa di sisi anda.")
  - Image 2: Character reference sheet (multiple views/expressions of PUSPA AI character)
  - Image 3: Official PUSPA logo (geometric floral/mandala in deep purple + "PUSPA" + "Pertubuhan Urus Peduli Asnaf")
- Converted official PUSPA logo (upload/puspa-logo-official.png) to base64 and updated src/lib/puspa-logo-data.ts
- Replaced ALL "Hermes" references with "Maria Puspa" across 11 files
- Removed ALL 🦞 emojis from: system prompt, welcome message, error messages, footer text
- Removed model name (tencent/hy3-preview:free) from UI display — now shows "Maria Puspa" only
- Rewrote MARIA_PUSPA_SYSTEM_PROMPT with RAG rules, SHORT & SHARP format, security rules
- Expanded tool registry from 7 → 14 tools

Stage Summary:
- PUSPA logo updated to official logo from uploaded brand assets
- All "Hermes AI" branding replaced with "Maria Puspa"
- All 🦞 emojis removed
- Model name hidden from UI (shows "Maria Puspa" instead of tencent/hy3-preview:free)
- AI system prompt completely rewritten for Short, Sharp, RAG-based responses
- Tool registry expanded from 7 → 14 tools covering all PUSPA modules

---
Task ID: 8
Agent: Main
Task: Fix logo visibility (remove background color), add Hermes Agent features to Maria Puspa, improve mobile chat UX

Work Log:
- Rewrote `puspa-logo.tsx` with 4 variants: auto (currentColor), light (dark green), dark (light emerald), colorful (gradient gold/crimson/green)
- Changed ALL PuspaLogo usages to `variant="colorful"` for visibility on ANY background
- Fetched Hermes Agent docs from https://hermes-agent.nousresearch.com/docs — key features: tools, skills, memory, delegation, web control, MCP
- Created `src/tools/web-tools.ts` with 4 new Hermes Agent-style tools:
  - `web_search` — search the web for real-time information (z-ai-web-dev-sdk)
  - `web_read` — read and extract web page content for RAG (z-ai-web-dev-sdk)
  - `delegate_task` — delegate tasks to sub-agents for parallel execution
  - `system_health` — comprehensive system health check (DB, AI service, tool count)
- Updated `src/tools/index.ts` to include extendedTools (14 → 18 tools total)
- Rewrote MARIA_PUSPA_SYSTEM_PROMPT with stronger enforcement:
  - MANDATORY RAG — must use tools/web_search before answering
  - SHORT & SHARP — max 2-3 sentences, no filler, no emojis
  - Project Editing Capabilities section
  - Tool Usage Priority (database → web → system → delegation → admin)
- Improved mobile chat in `ai-chat-panel.tsx`:
  - Expand/collapse toggle (85vh ↔ 95vh)
  - Round input fields (44px touch targets)
  - Compact horizontal scrollable quick prompts
  - Smaller avatar sizes for more message space
  - Round send/mic buttons
- Improved mobile chat in `ai/page.tsx`:
  - Round input fields with 44px touch targets
  - Horizontal scrollable suggested prompts
  - Round send/mic buttons
- Renamed store: `useMariaPuspaStore` (primary), `useHermesStore` (backward compat alias)
- Updated welcome message: shorter "Hai, saya Maria Puspa. AI Assistant PUSPA. Apa yang boleh saya bantu?"

Stage Summary:
- Logo now uses colorful gradient variant — visible on ANY background (no more "same color" issue)
- Maria Puspa has 18 tools (14 DB + 4 Hermes Agent-style: web_search, web_read, delegate_task, system_health)
- System prompt enforces MANDATORY RAG with web_search/web_read fallback
- Mobile chat significantly improved: expand/collapse, 44px touch targets, round inputs, scrollable pills
- All lint checks pass, page compiles and serves 200 OK

---
Task ID: 9
Agent: Main
Task: Add Telegram Bot integration for Maria Puspa + PUSPA Knowledge Base from organizational data

Work Log:
- Created `mini-services/telegram-bot/` — standalone Bun service for Telegram long-polling bot
  - Handles /start, /help, /reset, /role, /status commands
  - Long polling to receive Telegram messages
  - Forwards messages to Maria Puspa AI API endpoint
  - SSE stream parsing for progressive response collection
  - Session tracking per Telegram chat with role management
  - Auto-splits long messages (Telegram 4096 char limit)
  - Markdown formatting with fallback
- Created `src/app/api/v1/ai/telegram/route.ts` — dedicated Telegram API endpoint
  - Non-streaming (full response) for Telegram compatibility
  - Supports tool calling (same as web endpoint)
  - Saves conversation to AI memory
- Created `src/lib/puspa-knowledge.ts` — comprehensive PUSPA knowledge base
  - All organizational data from user's research document
  - Leadership, partners, verified programmes, transparency assessment
  - Self-reported vs verified data clearly distinguished
  - Contact details, address, donation account
- Updated `src/agents/runtime/hermes.runtime.ts` to inject PUSPA knowledge base into system prompt
  - `getPuspaKnowledgeContext()` appended to context prompt for RAG
- Added `TELEGRAM_BOT_TOKEN` to `.env`
- Added Telegram Integration section to Settings page with step-by-step setup guide
- All lint checks pass, page compiles and serves 200 OK

Stage Summary:
- Telegram Bot service created: mini-services/telegram-bot/
- Dedicated API endpoint: /api/v1/ai/telegram
- PUSPA Knowledge Base created with full organizational data (leadership, partners, programmes, verified vs self-reported data)
- System prompt now includes PUSPA knowledge for grounded RAG responses
- Settings page shows Telegram setup instructions
- User needs to: 1) Create bot via @BotFather, 2) Add token to .env, 3) Start telegram-bot service

---
Task ID: 10
Agent: Main
Task: Add Maria Puspa profile photo from uploaded images + Start Telegram bot with user's token

Work Log:
- Analyzed 3 uploaded images with VLM:
  - Image 1 (Apr 29): PUSPA brand guide with character avatar — CHOSEN as profile photo
  - Image 2 (Apr 30, 01:37): Character reference sheet (multiple views/expressions)
  - Image 3 (Apr 30, 01:50): PUSPA official logo
- Copied images to public/: maria-puspa-avatar.png, maria-puspa-reference.png, maria-puspa-logo-official.png
- Created 128x128 thumbnail (maria-puspa-thumb.png) using ffmpeg
- Created base64 data URI module (`src/lib/maria-avatar.ts`) for inline avatar (avoids 403 on serverless)
- Updated `ai-chat-panel.tsx` — replaced PuspaLogo AI avatars with Maria Puspa character photo
- Updated `ai/page.tsx` — replaced all PuspaLogo AI avatars with Maria Puspa character photo
- Set Telegram bot token in `.env`: 8616908398:AAFBzL-r_Y9ZiAhPSMrhi50PSdzBICGGqHE
- Created `.env` for mini-services/telegram-bot/ with token
- Verified bot connection: @MariaPuspaBot (MariaPuspaBot) — OK
- Created 256x256 Telegram profile photo (maria-puspa-telegram-profile.png)
- Started Telegram bot service — polling active

Stage Summary:
- Maria Puspa now uses her actual character photo (hijab, purple/navy business suit) as profile avatar
- Avatar is inline base64 (works on serverless without 403)
- Telegram bot connected as @MariaPuspaBot
- Bot is running and polling for messages
- Profile photo on Telegram needs to be set manually via @BotFather (API doesn't support bot profile photo upload)

---
Task ID: 11
Agent: Main
Task: Fix Telegram bot not responding — add allowlist chat ID 6798585537, fix logo background color

Work Log:
- Diagnosed: Telegram bot process was NOT running (bot died between sandbox sessions)
- Updated `mini-services/telegram-bot/index.ts` with major improvements:
  - Added ALLOWED_CHAT_IDS allowlist (env: comma-separated chat IDs)
  - Chat ID 6798585537 added to allowlist — only authorized users can interact
  - Allowlist check in handleMessage() — unauthorized chats get rejection message
  - Added message counter per session
  - Added typing indicator interval (sends typing every 4s while AI processes)
  - Added health check logging every 5 minutes
  - Skip pending updates on startup (avoid processing old messages)
  - Better error logging and polling resilience
- Updated `mini-services/telegram-bot/.env` with ALLOWED_CHAT_IDS=6798585537
- Fixed PUSPA logo (again) — user still complained colors blend with background:
  - Removed `colorful` variant entirely (gradients were the problem)
  - Added `outline` variant — stroke-only, NO fill, works on ANY background
  - Default `auto` variant uses `currentColor` — adapts to parent text color
  - Removed `bg-sidebar-primary/10` background wrapper from sidebar logo container
  - Sidebar now uses `variant="auto"` — inherits sidebar text color automatically
- Verified Next.js compiles successfully (HTTP 200, lint passes)
- Verified Telegram API endpoint works (returns Maria Puspa response)
- Started both Next.js and Telegram bot services

Stage Summary:
- Telegram bot now has allowlist security (Chat ID 6798585537 authorized)
- Bot includes typing indicators, message counting, health logging
- PUSPA logo fixed: no more gradient fills, uses currentColor for auto theme adaptation
- Both services verified working (Next.js HTTP 200, Telegram API returns response)
- Note: Background processes in sandbox are killed between Bash sessions — need manual restart

---
Task ID: 3
Agent: Bugfix
Task: Fix 8 critical bugs — runtime crashes, PII breach, version inconsistency, production logging

Work Log:
- Fixed `getActiveProgrammes` in `src/tools/index.ts`:
  - Changed `type: true` → `category: true` in Prisma select (Programme model has `category`, not `type`)
  - Changed `type: p.type` → `category: p.category` in mapping
  - Changed `p.startDate.toISOString().split('T')[0]` → `p.startDate || 'N/A'` (startDate is String, not DateTime)
  - Changed `p.endDate?.toISOString().split('T')[0] || 'Ongoing'` → `p.endDate || 'Ongoing'` (endDate is String, not DateTime)
  - Updated tool description to say "category" instead of "type"
- Masked IC numbers in `src/app/api/v1/members/route.ts`:
  - GET: Applied `'****' + m.icNumber.slice(-4)` to member IC numbers and household member IC numbers
- Masked IC numbers in `src/app/api/v1/cases/route.ts`:
  - GET: Applied `'****' + c.member.icNumber.slice(-4)` to case member IC numbers
  - POST: Applied same masking to newly created case record member IC number
- Fixed version V4 → V5 in `src/app/layout.tsx`:
  - Changed title from "PUSPA V4" to "PUSPA V5"
- Fixed version V4 → V5 in `src/lib/openrouter.ts`:
  - Changed comment from "PUSPA V4" to "PUSPA V5"
  - Changed OPENROUTER_APP_NAME default from "PUSPA V4" to "PUSPA V5"
- Fixed Prisma query logging in `src/lib/db.ts`:
  - Changed `log: ['query']` to `log: process.env.NODE_ENV === 'development' ? ['query'] : ['error']`
- Verified `src/tools/cases.ts`: No fix needed — Case model has `type` field (correct usage)
- Verified `src/app/api/v1/dashboard/route.ts`: No Programme date `.toISOString()` calls found
- Verified `src/app/api/v1/programmes/route.ts`: No `.toISOString()` on Programme dates (startDate/endDate returned as raw Strings via spread)

Stage Summary:
- 6 files edited with 8 bug fixes applied
- Runtime crash: `getActiveProgrammes` type→category + String date handling fixed
- PII breach: IC numbers masked in members and cases API responses (GET and POST)
- Version consistency: V4 → V5 in layout metadata and OpenRouter app name
- Production logging: Prisma now only logs queries in development, errors in production
- Lint passes, dev server compiles successfully

---
Task ID: 5
Agent: Business Logic Port
Task: Port critical business logic libraries from PUSPA-V4 to V5

Work Log:
- Updated Prisma schema (prisma/schema.prisma) with missing fields:
  - Donor: added `donorNumber` (unique), `ic`, `isAnonymous`, `preferredContact`, `status`, `totalDonated`, `donationCount`, `firstDonationAt`, `lastDonationAt`
  - Donation: added `donorIC`, `donorEmail`, `donorPhone`, `isAnonymous`, `status`, `donatedAt`
  - Ran `bun run db:push` successfully
- Created `src/lib/case-intelligence.ts` — Case Intelligence Engine:
  - computeEligibility() — 100-point scoring system (active member +20, income threshold +20, IC +15, phone +10, address +10, amount vs income +15, programme match +10, eKYC bonus +5)
  - computeRecommendation() — Programme and amount suggestions based on income/household
  - computeRiskFlags() — Duplicate IC, eKYC high risk, missing info, amount/income inconsistencies
  - computeBeneficiary360() — Full beneficiary profile aggregation (household, cases, disbursements, totals)
  - computeNextAction() — Workflow step suggestions mapped to V5 case statuses (draft→intake→verification→assessment→approval→disbursement→follow_up→closed)
  - computeDisbursementReconciliation() — Missing bank info, overdue schedules, missing contact
  - DB-backed wrappers: computeEligibilityFromDB(), computeBeneficiary360FromDB()
- Created `src/lib/donor-sync.ts` — Donor Sync Engine:
  - findOrCreateDonorForDonation() — Auto-matches by IC/email/phone, creates with collision-safe donor number
  - findMatchingDonorIdsForDonation() — Find donor IDs without creating
  - syncDonorTotals() — Aggregates totalDonated, donationCount, firstDonationAt, lastDonationAt
  - backfillDonorsFromDonations() — One-time migration from donation snapshots
  - Convenience wrappers: findOrCreateDonor(), syncDonor(), backfillDonors()
- Created `src/lib/domain.ts` — Domain Normalization (Bilingual):
  - Member status aliases (aktif→active, tidak_aktif→inactive, senarai_hitam→blacklisted, menunggu→pending)
  - Case type aliases (kebajikan→welfare, perubatan→medical, pendidikan→education, etc.)
  - Case status aliases (draf→draft, penerimaan→intake, pengesahan→verification, etc.)
  - Asnaf category aliases (mualaf→muallaf, ibnu_sabil→ibn_sabil, fi_sabilillah→fisabilillah)
  - Donation category aliases (sedekah→sadaqah, wakaf→waqf, infak→infaq, umum→general)
  - Compliance category aliases (dalaman→internal)
  - Programme category/status aliases with full bilingual mapping
  - Disbursement status aliases (menunggu→pending, diluluskan→approved, dibayar→disbursed, etc.)
  - Label functions for all domains: getMemberStatusLabel, getCaseTypeLabel, getAsnafCategoryLabel, etc.
- Created `src/lib/sequence.ts` — Sequence Generator (Collision-Safe):
  - createWithGeneratedUniqueValue() — Retry on P2002 with configurable max attempts
  - generateCaseNumber() — Format: CAS-YYYYMMDD-XXXX
  - generateReceiptNumber() — Format: RCP-YYYYMMDD-XXXX
  - generateDonorNumber() — Format: DNR-XXXX
- Created `src/lib/rate-limit.ts` — Rate Limiter:
  - rateLimit() — Token bucket with configurable window/max
  - getClientIp() — IP extraction with trusted proxy support (TRUSTED_PROXY_IPS env)
  - buildRateLimitHeaders() — X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
  - Pre-configured limiters: API_RATE_LIMIT (100/min), AI_RATE_LIMIT (20/min), AUTH_RATE_LIMIT (5/min), DONATION_RATE_LIMIT (10/min)
  - Automatic bucket pruning to prevent memory leaks
- Created `src/lib/api-utils.ts` — API Input Validation Utility:
  - parsePagination() — Handles NaN, negative, too large; returns page/pageSize/skip/take
  - buildPaginationMeta() — totalPages, hasNextPage, hasPreviousPage
  - sanitizeSearch() — Trim, length limit, empty→undefined
  - parseSort() — Whitelisted fields, validated direction
  - Error responses: errorResponse(), badRequestError(), unauthorizedError(), forbiddenError(), notFoundError(), rateLimitError(), internalServerError()
  - Success responses: successResponse(), createdResponse()
  - Body parsing: safeParseBody(), requireBody()

Stage Summary:
- 6 library files ported/created with production-quality TypeScript
- Prisma schema enhanced with donor/donation fields for full business logic support
- All V5 model differences gracefully handled (ic→icNumber, Programme category mapping, eKYC fields)
- Bilingual normalization covers 10+ domain categories with Malay/English aliases
- Sequence generator includes 3 format generators (case, receipt, donor numbers)
- Rate limiter includes 4 pre-configured presets and proxy support
- API utils provide complete request/response standardization
- Lint passes cleanly, dev server compiles successfully

---
Task ID: Auth-System
Agent: Main
Task: Create complete Supabase authentication system for PUSPA V5

Work Log:
- Read worklog.md and analyzed existing project structure (Zustand store with simulated auth, PuspaLogo component, ThemeProvider, etc.)
- Created `src/lib/supabase/client.ts` — Browser-side Supabase client using @supabase/ssr createBrowserClient
- Created `src/lib/supabase/server.ts` — Server-side Supabase client with cookie-based session management (getAll/setAll pattern)
- Created `src/lib/supabase/middleware.ts` — Auth middleware client with session refresh, protected route redirect, and login page redirect for authenticated users
- Created `src/middleware.ts` — Next.js middleware entry point with matcher excluding static assets
- Created `src/lib/auth.ts` — Auth helper functions: getCurrentUser(), requireAuth(), requireRole() with Bahasa Melayu error messages
- Created `src/components/auth-provider.tsx` — React context provider with: user state, loading, signIn, signUp, signOut functions, onAuthStateChange listener
- Created `src/app/login/page.tsx` — Professional login page with:
  - PUSPA purple theme (#6A0DAD) and branding
  - Centered card with PuspaLogo, organization name, tagline
  - Email/password form with validation and toggle to sign-up mode
  - Error messages translated to Bahasa Melayu (8 common Supabase errors translated)
  - Password show/hide toggle
  - Loading states with spinner
  - Dark mode support
  - Responsive design
  - Background decoration with gradient blobs
- Updated `src/app/layout.tsx` — Wrapped children with AuthProvider inside ThemeProvider
- Updated `src/app/page.tsx` — Added auth gate:
  - Checks if Supabase is configured (env vars present)
  - If configured + not authenticated: shows loading screen then redirects to /login
  - If configured + authenticated: syncs Supabase user with Zustand app store
  - If not configured: falls back to simulated auth (existing behavior)
- Created `.env.local` with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
- Added both env vars to Vercel production environment
- Lint passes cleanly, production build compiles successfully (20 routes including /login)
- Middleware confirmed active in build output (ƒ Proxy)

Stage Summary:
- Complete Supabase authentication system with 9 new/modified files
- Three client types: browser (client.ts), server (server.ts), middleware (middleware.ts)
- Auth middleware protects all routes except /login, /api/*, and root /
- AuthProvider wraps entire app with real-time auth state management
- Professional login page with PUSPA branding, Bahasa Melayu error messages, dark mode
- Graceful fallback: if Supabase env vars missing, uses simulated auth (no breaking changes)
- Server-side auth helpers: getCurrentUser(), requireAuth(), requireRole(minRole) for API routes
- Role hierarchy: staff < admin < developer with Bahasa Melayu access denied messages
- Vercel production env vars configured for deployment
