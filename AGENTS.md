# AGENTS.md — PUSPA-Z V5 (Maria Puspa AI Agent System)

> **PUSPA V5** — Pertubuhan Urus Peduli Asnaf (PPM-024-10-05012022)
> **Updated**: 2026-05-06 (AI Cache, Rate Limit, Audit, PWA, Realtime)
> **Location**: `/mnt/g/PUSPA-Z/PUSPA-Z`

---

## Table of Contents

1. [Overview](#1-overview)
2. [Identity & Persona](#2-identity--persona)
3. [Architecture Diagram](#3-architecture-diagram)
4. [Runtime Engine](#4-runtime-engine)
5. [System Prompt](#5-system-prompt)
6. [Tool System](#6-tool-system)
7. [Memory System](#7-memory-system)
8. [OpenRouter Client](#8-openrouter-client)
9. [Knowledge Base](#9-knowledge-base)
10. [PII Protection](#10-pii-protection)
11. [API Endpoints](#11-api-endpoints)
12. [SSE Stream Protocol](#12-sse-stream-protocol)
13. [Frontend: Chat Panel & Store](#13-frontend-chat-panel--store)
14. [Telegram Bot](#14-telegram-bot)
15. [Role-Based Access Control](#15-role-based-access-control)
16. [Configuration & Environment](#16-configuration--environment)
17. [File Map](#17-file-map)
18. [Advanced Features (NEW)](#18-advanced-features)
19. [Improvements (2026-05-06)](#19-improvements-2026-05-06)

---

## 1. Overview

Maria Puspa is the AI assistant embedded in the PUSPA NGO management platform. She follows the **Hermes Agent architecture** — a design pattern that enforces **mandatory RAG (Retrieval-Augmented Generation)**, **tool-calling with RBAC**, and **streaming responses** through OpenRouter (OpenAI-compatible API).

### Design Principles

| Principle | Implementation |
|---|---|
| **Mandatory RAG** | AI must call tools before answering any operational data question — never fabricate |
| **Role-Based Access** | Tools are filtered by user role (staff / admin / developer) at multiple layers |
| **PII Protection** | IC numbers always masked to `****XXXX` in tool responses |
| **Short & Sharp** | Responses capped at 2–3 sentences; no filler, no emojis |
| **Dual Interface** | SSE streaming for web app; non-streaming JSON for Telegram |
| **Graceful Degradation** | In-memory fallback when database is unavailable (Vercel serverless) |
| **Key Rotation** | Up to 4 OpenRouter API keys with automatic rotation on 429/5xx errors |
| **Model Fallback** | Auto-switch between tencent/hy3-preview:free, gpt-4o-mini, gpt-3.5-turbo |
| **Response Caching** | AI responses cached (5min TTL, 1000 entry limit) |
| **Rate Limiting** | Per-user/IP limits (AI: 30/min, API: 100/min, auth: 5/min) |
| **Audit Logging** | All tool executions & user actions logged |
| **PWA Support** | Offline-capable with service worker + manifest |
| **Realtime** | Supabase Realtime hook for live data updates |

---

## 18. Advanced Features (NEW — 2026-05-06)

### 18.1 AI Response Caching
**File**: `src/lib/ai-cache.ts`
- In-memory cache for frequent AI queries
- TTL: 5 minutes
- Max entries: 1000
- Cache key: `{userId}:{query}`

### 18.2 Rate Limiting
**File**: `src/lib/rate-limit.ts`
- Per-user and per-IP rate limiting
- Different limits for AI, API, and auth endpoints
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### 18.3 Audit Logging System
**File**: `src/lib/audit.ts`
- Tracks: tool_execution, user_login, data_create/update/delete, config_change, ai_request/response
- Stores: userId, action, resource, details, ipAddress, userAgent
- In-memory store (serverless-compatible), ready for Sentry/LogRocket integration

### 18.4 React Query Optimizations
**File**: `src/components/query-provider.tsx`
- Stale time: 5 minutes
- Cache time (gcTime): 10 minutes
- Retry: 3 attempts with exponential backoff
- Refetch on window focus: disabled (for fresh data only)

### 18.5 Validation Schemas
**File**: `src/lib/validation.ts`
- Zod schemas for AI requests, donations, cases
- `validateRequest()` helper with error formatting

### 18.6 Sentry Error Tracking (Ready)
**File**: `src/lib/sentry.ts`
- PII sanitization (IC numbers masked before sending)
- Configured for production only
- Session replay & performance monitoring ready

### 18.7 PWA Support
**Files**: `public/manifest.json`, `public/sw.js`
- App shell caching
- Offline fallback
- Install prompt for mobile

### 18.8 Supabase Realtime Hook
**File**: `src/hooks/use-realtime.ts`
- Subscribe to INSERT/UPDATE/DELETE on any table
- Client-side realtime updates
- Automatic cleanup on unmount

---

## 19. Improvements (2026-05-06)

### Implemented by: Hermes Agent (Tencent/hy3-preview:free via OpenRouter)

| Improvement | File(s) | Status |
|---|---|---|
| OpenRouter model fallback chain | `src/lib/openrouter.ts` | ✅ |
| AI response caching (5min TTL) | `src/lib/ai-cache.ts` | ✅ |
| Rate limiting (AI/API/auth) | `src/lib/rate-limit.ts` | ✅ |
| Enhanced health check | `src/app/api/health/route.ts` | ✅ |
| Zod validation schemas | `src/lib/validation.ts` | ✅ |
| Sentry error tracking | `src/lib/sentry.ts` | ✅ |
| Audit logging system | `src/lib/audit.ts` | ✅ |
| React Query optimizations | `src/components/query-provider.tsx` | ✅ |
| PWA support | `public/manifest.json`, `public/sw.js` | ✅ |
| Supabase Realtime hook | `src/hooks/use-realtime.ts` | ✅ |
| Layout with QueryProvider | `src/app/layout.tsx` | ✅ |
| OpenRouter key format fix | `src/lib/openrouter.ts` | ✅ |

### Environment Variables Configured
- ✅ `OPENROUTER_API_KEY` (tencent/hy3-preview:free)
- ✅ `DATABASE_URL` (Supabase pooler for WSL IPv6)
- ✅ `NEXT_PUBLIC_SUPABASE_URL` + `PUBLISHABLE_KEY`
- ⚠️ `SUPABASE_SERVICE_ROLE_KEY` (still placeholder)

---

## 17. File Map

### Core AI System
```
src/agents/runtime/hermes.runtime.ts    — Main AI orchestration
src/lib/openrouter.ts                   — OpenRouter client (key rotation, model fallback)
src/tools/index.ts                       — Tool registry (18+ tools with RBAC)
src/lib/memory.ts                        — Conversation history & message storage
src/lib/ai-cache.ts                      — NEW: AI response caching
src/lib/rate-limit.ts                    — NEW: Rate limiting
src/lib/audit.ts                          — NEW: Audit logging
src/lib/validation.ts                     — NEW: Zod validation schemas
src/lib/sentry.ts                         — NEW: Sentry error tracking (ready)
```

### Frontend
```
src/app/layout.tsx                        — Root layout (Theme, Auth, QueryProvider)
src/components/query-provider.tsx          — NEW: React Query provider
src/components/ai-chat-panel.tsx          — Maria Puspa chat UI
src/hooks/use-realtime.ts                 — NEW: Supabase Realtime hook
src/stores/hermes-store.ts                — Zustand store
```

### PWA & Static
```
public/manifest.json                       — NEW: PWA manifest
public/sw.js                               — NEW: Service worker
```

### API Routes
```
src/app/api/v1/ai/route.ts               — Main AI endpoint (SSE streaming)
src/app/api/health/route.ts              — NEW: Enhanced health check
src/app/api/v1/*/route.ts               — Domain APIs (donations, cases, etc.)
```

---

## 16. Configuration & Environment

### Required Variables (.env.local)
```env
# OpenRouter
OPENROUTER_API_KEY="sk-or-v1-..."
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL="tencent/hy3-preview:free"

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://uesfjliuabjvtjuexdel.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...  # REPLACE WITH ACTUAL KEY
DATABASE_URL="postgresql://postgres.xzhtncnqdcjbdlnomawx:PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"
DIRECT_URL="postgresql://postgres.xzhtncnqdcjbdlnomawx:PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"

# Telegram
TELEGRAM_BOT_TOKEN=8616908398:AAFBzL-r_Y9ZiAhPSMrhi50PSdzBICGGqHE
TELEGRAM_ALLOWED_USERS=6798585537
TELEGRAM_HOME_CHANNEL=6798585537
```

**Note**: `.env*` is in `.gitignore`. Never commit real credentials.

---

*End of AGENTS.md v5.2 (2026-05-06)*
