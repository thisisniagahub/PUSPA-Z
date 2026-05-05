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
- Replaced ALL "Hermes" references with "Maria Puspa" across 11 files:
  - src/agents/runtime/hermes.runtime.ts (system prompt + function names + types)
  - src/app/api/v1/ai/route.ts (comments, error messages, SSE handler)
  - src/stores/hermes-store.ts (welcome message, store name, model defaults)
  - src/components/ai-chat-panel.tsx (header, placeholders, footer text)
  - src/modules/ai/page.tsx (title, character card, badges, placeholders)
  - src/components/app-header.tsx (AI view title)
  - src/modules/admin/page.tsx (system health, user names, audit log)
  - src/modules/settings/page.tsx (AI Engine name)
  - src/lib/memory.ts (comments)
  - src/tools/index.ts (type names, comments, export alias)
  - src/tools/donations.ts + src/tools/cases.ts (comments)
- Removed ALL 🦞 emojis from: system prompt, welcome message, error messages, footer text
- Removed model name (tencent/hy3-preview:free) from UI display — now shows "Maria Puspa" only
- Rewrote MARIA_PUSPA_SYSTEM_PROMPT with:
  - Identity: Maria Puspa, AI Assistant Pelanggan
  - Personality: Cerdas, Mesra, Profesional, Empati, Boleh Dipercayai
  - Communication: Jelas, Ringkas, Sopan, Berorientasikan Penyelesaian
  - RAG rules: MUST use tools before answering, NEVER fabricate data, cite sources
  - Response format: SHORT & SHARP (max 3-4 sentences), bullet points, no filler, no emojis
  - Security: IC masking, PII protection, access control
- Expanded tool registry from 7 → 14 tools:
  - Added: get_member_list, get_member_stats, get_active_programmes, get_volunteer_stats, get_compliance_status, get_disbursement_summary, get_dashboard_overview
  - All new tools query Prisma database directly for real RAG data
- SSE stream now returns model: 'maria-puspa' instead of raw model ID
- Backward-compatible aliases preserved (runHermes→runMariaPuspa, isHermesConfigured→isMariaPuspaConfigured)

Stage Summary:
- PUSPA logo updated to official logo from uploaded brand assets
- All "Hermes AI" branding replaced with "Maria Puspa"
- All 🦞 emojis removed
- Model name hidden from UI (shows "Maria Puspa" instead of tencent/hy3-preview:free)
- AI system prompt completely rewritten for Short, Sharp, RAG-based responses
- Tool registry expanded from 7 → 14 tools covering all PUSPA modules
- Maria Puspa character matches brand guide: Cerdas. Mesra. Sentiasa di sisi anda.
- Lint passes, dev server running, all modules operational
