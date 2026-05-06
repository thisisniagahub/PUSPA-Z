<p align="center">
  <img src="public/puspa-logo-official.png" alt="PUSPA Logo" width="120" />
</p>

<h1 align="center">PUSPA-Z</h1>

<p align="center">
  <strong>Pertubuhan Urus Peduli Asnaf</strong><br/>
  <em>NGO Management Platform for Asnaf Welfare</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma" alt="Prisma 6" />
  <img src="https://img.shields.io/badge/Bun-Runtime-000?logo=bun" alt="Bun" />
  <img src="https://img.shields.io/badge/OpenRouter-AI-6366F1" alt="OpenRouter AI" />
  <img src="https://img.shields.io/badge/License-Proprietary-red" alt="Proprietary License" />
</p>

<p align="center">
  <a href="#-quick-start">Quick Start</a> &bull;
  <a href="#-modules">Modules</a> &bull;
  <a href="#-maria-puspa-ai">Maria Puspa AI</a> &bull;
  <a href="#-api-reference">API</a> &bull;
  <a href="#-database-schema">Database</a>
</p>

---

## Overview / Tentang Projek

**PUSPA V5** is a full-stack NGO management platform built for **Pertubuhan Urus Peduli Asnaf** (PPM-024-10-05012022), a Malaysian charitable organization serving asnaf (needy) communities in Kuala Lumpur and Selangor. The platform manages the entire lifecycle of asnaf welfare operations — from member registration and eKYC verification, through case management and disbursement, to donation tracking, compliance monitoring, and volunteer coordination.

PUSPA V5 ialah platform pengurusan NGO sepenuhnya yang dibina untuk Pertubuhan Urus Peduli Asnaf, menguruskan operasi kebajikan asnaf dari pendaftaran ahli sehingga agihan dan pematuhan.

### Key Highlights

- **17 integrated modules** covering the full NGO operational workflow
- **Maria Puspa AI** — an AI assistant with 18 tools, RAG-powered responses, and SSE streaming
- **Live Maria Character Layer** — global floating widget, dynamic emotion state, TTS + lip-sync
- **Telegram Bot** (@MariaPuspaBot) for mobile access to Maria Puspa
- **Role-Based Access Control** (Staff, Admin, Developer) across all modules and AI tools
- **eKYC Verification** pipeline with risk assessment
- **Compliance Tracking** for ROSM, LHDN, PDPA, and internal audits
- **22 Prisma models** with full relational data integrity
- **Key rotation** for OpenRouter API with automatic failover

---

## Screenshots

> **Placeholder** — Add screenshots here once available.
>
> ```
> 📸 Dashboard View
> 📸 Member Management
> 📸 Maria Puspa AI Chat
> 📸 Case Workflow
> 📸 Telegram Bot
> ```

---

## Tech Stack / Teknologi

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | [Next.js](https://nextjs.org/) (App Router + Turbopack) | 16 |
| Language | [TypeScript](https://www.typescriptlang.org/) | 5 |
| Styling | [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (New York) | 4 |
| Database | [Prisma ORM](https://www.prisma.io/) with managed Postgres (production) | 6 |
| State | [Zustand](https://zustand.docs.pmnd.rs/) with persist middleware | 5 |
| AI | [OpenRouter](https://openrouter.ai/) (OpenAI-compatible) | — |
| Data Grid | [TanStack Table](https://tanstack.com/table) + [React Query](https://tanstack.com/query) | 8 / 5 |
| Charts | [Recharts](https://recharts.org/) | 2 |
| Runtime | [Bun](https://bun.sh/) | latest |
| Deployment | [Vercel](https://vercel.com/) (serverless) | — |
| Telegram | Long-polling bot | — |

---

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) >= 1.0
- Node.js >= 18 (for compatibility)

### Installation / Pemasangan

```bash
# Clone the repository
git clone https://github.com/thisisniagahub/PUSPA-Z.git
cd PUSPA-Z

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your API keys (see Environment Variables below)

# Initialize the database
bun run db:push

# Start the development server
bun run dev
```

The app will be running at **http://localhost:3000**.

### Telegram Bot (Separate Terminal)

```bash
cd mini-services/telegram-bot
bun run dev
```

Send `/start` to **@MariaPuspaBot** on Telegram to begin.

---

## Environment Variables / Pembolehubah Persekitaran

Create a `.env.local` file in the project root (recommended for Next.js local development):

```env
# ─── Database ───────────────────────────────────────
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB_NAME?sslmode=require"

# ─── OpenRouter AI ──────────────────────────────────
# Supports up to 4 API keys for automatic rotation
OPENROUTER_API_KEY_1=sk-or-v1-xxx
OPENROUTER_API_KEY_2=
OPENROUTER_API_KEY_3=
OPENROUTER_API_KEY_4=
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=openai/gpt-4o-mini
OPENROUTER_APP_NAME=PUSPA V5
OPENROUTER_APP_URL=https://puspa-v5.space-z.ai

# ─── Telegram Bot ───────────────────────────────────
TELEGRAM_BOT_TOKEN=xxx
ALLOWED_CHAT_IDS=6798585537
TELEGRAM_ADMIN_CHAT_IDS=6798585537
PUSPA_INTERNAL_API_TOKEN=replace-with-strong-shared-secret

# ─── Supabase (SSR + Browser Client) ────────────────
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx

# ─── Maria Character Flags (optional) ───────────────
# Default behavior is enabled when unset.
NEXT_PUBLIC_MARIA_WIDGET_ENABLED=true
NEXT_PUBLIC_MARIA_TTS_ENABLED=true
NEXT_PUBLIC_MARIA_LIPSYNC_ENABLED=true

# ─── Hermes-Agent Runtime Mode (optional) ────────────
# Set to "cli" to route API responses through Hermes CLI directly.
HERMES_RUNTIME_MODE=cli
HERMES_CLI_TIMEOUT_MS=45000
```

> **Note:** At least one `OPENROUTER_API_KEY` is required for Maria Puspa AI. The Telegram bot requires a valid `TELEGRAM_BOT_TOKEN` from [@BotFather](https://t.me/BotFather).

Run a quick Maria character smoke check:

```bash
npm run smoke:maria
```

---

## Modules / Modul

PUSPA V5 consists of **17 lazy-loaded modules**, each with its own view page and API routes:

| # | Module | Malay | Access | Description |
|---|--------|-------|--------|-------------|
| 1 | **Dashboard** | Papan Pemuka | Staff | Operational metrics and KPIs |
| 2 | **Members** | Ahli Asnaf | Staff | Asnaf member registration and profiles |
| 3 | **Cases** | Kes | Staff | Case management with 9-stage workflow |
| 4 | **Donations** | Derma | Staff | Donation tracking (zakat, sadaqah, waqf, infaq) |
| 5 | **Donors** | Penderma | Staff | Donor relationship management |
| 6 | **Disbursements** | Agihan | Staff | Fund disbursement with approval pipeline |
| 7 | **Programmes** | Program | Staff | Programme planning and beneficiary tracking |
| 8 | **Volunteers** | Sukarelawan | Staff | Volunteer coordination and hours tracking |
| 9 | **Compliance** | Pematuhan | Admin | ROSM, LHDN, PDPA compliance monitoring |
| 10 | **eKYC** | Pengesahan eKYC | Admin | Identity verification with risk assessment |
| 11 | **Documents** | Dokumen | Staff | Document management with versioning |
| 12 | **Activities** | Aktiviti | Staff | Activity log and audit trail |
| 13 | **Reports** | Laporan | Admin | Report generation and analytics |
| 14 | **AI** | Maria Puspa | Developer | AI assistant with tool-calling |
| 15 | **Admin** | Pentadbiran | Admin | System administration panel |
| 16 | **Settings** | Tetapan | Staff | Platform configuration |
| 17 | **TapSecure** | TapSecure | Admin | Secure access control management |

---

## Maria Puspa AI

### Hermes Native Feature Mode

If you want full Hermes features without custom reimplementation, use the native Hermes commands directly from this repo:

```bash
npm run hermes:setup         # one-time setup wizard
npm run hermes:chat          # Hermes interactive chat
npm run hermes:gateway:setup # configure Telegram/Discord/etc
npm run hermes:gateway       # run messaging gateway
npm run hermes:dashboard     # web dashboard (TUI enabled)
npm run hermes:cron:list     # list scheduled jobs
npm run hermes:skills        # list installed skills
npm run hermes:mcp           # list MCP servers
```

Set this in `.env.local` to make app API use Hermes CLI directly:

```env
HERMES_RUNTIME_MODE=cli
HERMES_CLI_TIMEOUT_MS=45000
```

**Maria Puspa** is the built-in AI assistant powered by [OpenRouter](https://openrouter.ai/) with OpenAI-compatible tool calling. She speaks Bahasa Melayu (primary) and English, and is designed for direct, data-grounded responses.

### Character Runtime (Level 3)

- **Global Widget**: floating Maria assistant is available across the app shell
- **Official Avatar**: Maria surfaces use `public/maria-puspa-reference.png`
- **Voice**: browser TTS with female-voice prioritization (BM/EN fallback)
- **Lip-sync**: amplitude-driven mouth animation connected to speech playback
- **Feature Flags**: `NEXT_PUBLIC_MARIA_WIDGET_ENABLED`, `NEXT_PUBLIC_MARIA_TTS_ENABLED`, `NEXT_PUBLIC_MARIA_LIPSYNC_ENABLED`

### Personality / Personaliti

> *Cerdas, Mesra, Profesional, Empati, Boleh Dipercayai*
> (Intelligent, Friendly, Professional, Empathetic, Trustworthy)

### Architecture

```
User Prompt
    │
    ▼
┌─────────────────────────────┐
│  Maria Puspa Runtime        │  (hermes.runtime.ts)
│  ┌───────────────────────┐  │
│  │ System Prompt +       │  │
│  │ PUSPA Knowledge Base  │  │
│  │ + Conversation Memory │  │
│  └───────────────────────┘  │
│           │                  │
│           ▼                  │
│  ┌───────────────────────┐  │
│  │ Tool Registry (RBAC)  │  │  18 tools filtered by role
│  └───────────────────────┘  │
│           │                  │
│           ▼                  │
│  ┌───────────────────────┐  │
│  │ OpenRouter API        │  │  Key rotation + SSE streaming
│  │ (OpenAI-compatible)   │  │
│  └───────────────────────┘  │
│           │                  │
│           ▼                  │
│  Tool Execution → Response  │
└─────────────────────────────┘
```

### 18 AI Tools

#### Core / Teras (Staff+)

| Tool | Description |
|------|-------------|
| `ping_system` | Check system online status and database connectivity |
| `get_recent_donations` | Fetch latest donations with amounts and categories |
| `get_donation_stats` | Monthly donation statistics by category (zakat/sadaqah/waqf/infaq) |
| `get_active_cases` | List active cases with optional status filter |
| `get_case_summary` | Detailed case info with masked IC and notes |
| `get_member_list` | Asnaf member directory with category filter |
| `get_member_stats` | Member statistics by asnaf category and eKYC status |
| `get_active_programmes` | Currently running programmes with dates |
| `get_volunteer_stats` | Volunteer count, active/inactive breakdown |
| `get_compliance_status` | Compliance overview (ROSM, LHDN, PDPA) with overdue tracking |
| `get_disbursement_summary` | Disbursement totals by status |
| `get_dashboard_overview` | Cross-module operational summary |

#### Web / Capability (Staff+)

| Tool | Description |
|------|-------------|
| `web_search` | Search the web for real-time information (via z-ai-web-dev-sdk) |
| `web_read` | Extract content from web pages for RAG |
| `delegate_task` | Delegate complex tasks to sub-agents |
| `system_health` | Comprehensive system health check |

#### Admin / Pentadbiran (Admin+)

| Tool | Description |
|------|-------------|
| `approve_disbursement` | Approve a pending disbursement |
| `delete_case` | Delete a case with audit reason |

### Mandatory RAG Rules

Maria Puspa follows strict RAG (Retrieval-Augmented Generation) rules:

1. **MUST** use tools before answering operational questions — never fabricate data
2. **MUST** use `web_search` + `web_read` for external information
3. **MUST** cite the tool/source used in every response
4. **MUST** mask IC numbers (format: `****XXXX`)
5. **MUST** format currency as RM/MYR
6. **NEVER** claim capabilities she does not have

---

## API Reference / Rujukan API

### Health Check

```
GET /api → { status: "ok", version: "5.0" }
```

### AI Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/ai` | Maria Puspa AI streaming (SSE) |
| `POST` | `/api/v1/ai/telegram` | Maria Puspa for Telegram bot |

### Module Endpoints

All module endpoints support `GET` (list/detail) and `POST` (create) operations:

| Endpoint | Module |
|----------|--------|
| `/api/v1/members` | Asnaf member management |
| `/api/v1/cases` | Case management |
| `/api/v1/donations` | Donation tracking |
| `/api/v1/donors` | Donor management |
| `/api/v1/disbursements` | Fund disbursements |
| `/api/v1/programmes` | Programme management |
| `/api/v1/volunteers` | Volunteer management |
| `/api/v1/compliance` | Compliance records |
| `/api/v1/ekyc` | eKYC verification |
| `/api/v1/documents` | Document management |
| `/api/v1/activities` | Activity audit log |

### Analytics Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/dashboard` | Dashboard metrics and KPIs |
| `GET` | `/api/v1/reports` | Report generation |

---

## Role-Based Access Control / Kawalan Akses

PUSPA V5 implements a three-tier role hierarchy:

```
┌──────────────────────────────────────────────────┐
│  Level 3 — Developer                             │
│  All Staff + Admin access, plus:                 │
│  • AI Module (Maria Puspa chat interface)        │
│  • Admin tools (approve_disbursement,            │
│    delete_case)                                  │
│  • System health diagnostics                     │
├──────────────────────────────────────────────────┤
│  Level 2 — Admin                                 │
│  All Staff access, plus:                         │
│  • Compliance module                             │
│  • Reports module                                │
│  • eKYC verification                             │
│  • TapSecure                                     │
│  • Admin panel                                   │
├──────────────────────────────────────────────────┤
│  Level 1 — Staff                                 │
│  • Dashboard, Members, Cases, Donations,         │
│    Donors, Disbursements, Programmes,            │
│    Volunteers, Documents, Activities,             │
│    Settings                                      │
│  • Core AI tools (read-only queries)             │
└──────────────────────────────────────────────────┘
```

Higher roles inherit all permissions of lower roles. AI tools are also filtered by role — staff can only use read-only tools, while admin and developer roles gain access to write operations.

---

## Database Schema / Skema Pangkalan Data

PUSPA V5 uses **22 Prisma models** with full relational integrity:

### Entity Overview

```
┌──────────────────────────────────────────────────────────────┐
│  Users & Auth                                                │
│  User ─┬─ Activity ── Programme                              │
│        └─ CaseNote ── Case                                   │
│        └─ AiConversation ── AiMessage                        │
├──────────────────────────────────────────────────────────────┤
│  Asnaf Members                                               │
│  Member ─┬─ HouseholdMember                                  │
│           ├─ Case ─┬─ CaseNote                               │
│           │        ├─ CaseProgramme ── Programme              │
│           │        └─ Disbursement                           │
│           ├─ Disbursement                                    │
│           ├─ ProgrammeBeneficiary ── Programme               │
│           ├─ Document                                        │
│           └─ EKYCVerification                                │
├──────────────────────────────────────────────────────────────┤
│  Donations & Donors                                          │
│  Donor ── Donation                                           │
├──────────────────────────────────────────────────────────────┤
│  Programmes & Volunteers                                     │
│  Programme ─┬─ ProgrammeBeneficiary                          │
│             ├─ Disbursement                                  │
│             ├─ CaseProgramme                                 │
│             ├─ Document                                      │
│             └─ Activity                                      │
│  Volunteer ─┬─ VolunteerActivity                             │
│             └─ VolunteerCertificate                          │
├──────────────────────────────────────────────────────────────┤
│  Compliance & Documents                                      │
│  ComplianceRecord                                            │
│  Document ── (Member | Case | Programme)                     │
├──────────────────────────────────────────────────────────────┤
│  AI & Ops                                                    │
│  AIMemory                                                    │
│  AiConversation ── AiMessage                                 │
│  OpsWorkItem                                                 │
│  AutomationJob                                               │
├──────────────────────────────────────────────────────────────┤
│  Asnafpreneur                                                │
│  Entrepreneur (name, category, initialCapital, status)        │
└──────────────────────────────────────────────────────────────┘
```

### Key Enums / Status Values

| Entity | Status Fields |
|--------|--------------|
| **Member** | `asnafCategory`: fakir, miskin, amil, muallaf, gharimin, riqab, ibnu_sabil, fisabilillah |
| **Member** | `ekycStatus`: pending, verified, rejected |
| **Case** | `status`: draft → intake → verification → assessment → approval → disbursement → follow_up → closed/rejected |
| **Case** | `priority`: low, medium, high, urgent |
| **Donation** | `category`: zakat, sadaqah, waqf, infaq, general |
| **Disbursement** | `status`: pending → approved → disbursed → verified → cancelled |
| **Compliance** | `category`: rosm, lhdn, pdpa, internal, audit |
| **EKYC** | `status`: pending → submitted → under_review → verified → rejected |

---

## Project Structure / Struktur Projek

```
PUSPA-Z/
├── prisma/
│   └── schema.prisma           # Database schema (22 models)
├── src/
│   ├── agents/
│   │   └── runtime/
│   │       └── hermes.runtime.ts  # Maria Puspa AI runtime engine
│   ├── app/
│   │   ├── api/
│   │   │   ├── route.ts        # Health check endpoint
│   │   │   └── v1/
│   │   │       ├── ai/
│   │   │       │   ├── route.ts       # AI streaming (SSE)
│   │   │       │   └── telegram/
│   │   │       │       └── route.ts   # Telegram AI endpoint
│   │   │       ├── members/
│   │   │       ├── cases/
│   │   │       ├── donations/
│   │   │       ├── donors/
│   │   │       ├── disbursements/
│   │   │       ├── programmes/
│   │   │       ├── volunteers/
│   │   │       ├── compliance/
│   │   │       ├── ekyc/
│   │   │       ├── documents/
│   │   │       ├── activities/
│   │   │       ├── dashboard/
│   │   │       └── reports/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components (New York style)
│   │   ├── app-sidebar.tsx     # Main navigation sidebar
│   │   ├── app-header.tsx      # Top header bar
│   │   ├── ai-chat-panel.tsx   # Maria Puspa chat interface
│   │   ├── puspa-logo.tsx      # Logo component
│   │   ├── puspa-loading-spinner.tsx
│   │   ├── view-renderer.tsx   # Lazy module renderer
│   │   └── theme-provider.tsx
│   ├── hooks/
│   │   ├── use-toast.ts
│   │   └── use-mobile.ts
│   ├── lib/
│   │   ├── openrouter.ts       # OpenRouter client with key rotation
│   │   ├── access-control.ts   # RBAC view-level permissions
│   │   ├── db.ts               # Prisma client singleton
│   │   ├── memory.ts           # AI conversation memory
│   │   ├── maria-avatar.ts     # Avatar asset helpers
│   │   ├── puspa-brand-assets.ts
│   │   ├── puspa-knowledge.ts  # PUSPA knowledge base for RAG
│   │   ├── store.ts            # App state (current view, role)
│   │   └── utils.ts            # Utility functions
│   ├── modules/                # 17 lazy-loaded view pages
│   │   ├── dashboard/page.tsx
│   │   ├── members/page.tsx
│   │   ├── cases/page.tsx
│   │   ├── donations/page.tsx
│   │   ├── donors/page.tsx
│   │   ├── disbursements/page.tsx
│   │   ├── programmes/page.tsx
│   │   ├── volunteers/page.tsx
│   │   ├── compliance/page.tsx
│   │   ├── ekyc/page.tsx
│   │   ├── documents/page.tsx
│   │   ├── activities/page.tsx
│   │   ├── reports/page.tsx
│   │   ├── ai/page.tsx
│   │   ├── admin/page.tsx
│   │   ├── settings/page.tsx
│   │   └── tapsecure/page.tsx
│   ├── stores/
│   │   └── hermes-store.ts     # Zustand AI chat state
│   ├── tools/
│   │   ├── index.ts            # Central tool registry with RBAC
│   │   ├── donations.ts        # Donation-specific tools
│   │   ├── cases.ts            # Case-specific tools
│   │   └── web-tools.ts        # Web search, read, delegate, health
│   └── types/
│       └── index.ts            # TypeScript interfaces
├── mini-services/
│   └── telegram-bot/
│       ├── index.ts            # Long-polling Telegram bot
│       ├── package.json
│       └── maria-puspa-*.png   # Bot profile images
├── public/                     # Static assets (logos, avatars)
├── components.json             # shadcn/ui configuration
├── tailwind.config.ts
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── bun.lock
└── package.json
```

---

## Scripts / Skrip

| Command | Description |
|---------|-------------|
| `bun run dev` | Start Next.js dev server on port 3000 |
| `bun run build` | Production build with standalone output |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |
| `bun run typecheck` | Run TypeScript type checks |
| `bun run verify:release` | Run release quality gate (lint + typecheck + build) |
| `npm run smoke:maria` | Smoke-check Maria widget, TTS, and lip-sync wiring |
| `bun run db:push` | Push Prisma schema to database |
| `bun run db:generate` | Generate Prisma client |
| `bun run db:migrate` | Run Prisma migrations |
| `bun run db:reset` | Reset database (development only) |

---

## Telegram Bot / Bot Telegram

The PUSPA Telegram bot (@MariaPuspaBot) provides mobile access to Maria Puspa AI through a long-polling architecture.

### Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Welcome message and capabilities overview |
| `/help` | List of available commands |
| `/reset` | Reset conversation history |
| `/role [staff\|admin\|developer]` | Switch access role (admin list required for elevated roles) |
| `/status` | Show session status and system info |

### Bot Architecture

- **Long polling** (no webhook required)
- **Allowlist-based** access control via `ALLOWED_CHAT_IDS`
- **Admin role guard** via `TELEGRAM_ADMIN_CHAT_IDS` for `/role admin|developer`
- **Internal API auth** via `x-puspa-internal-token` + `PUSPA_INTERNAL_API_TOKEN`
- **Session tracking** per chat ID with role management
- **SSE stream parsing** for real-time AI responses
- **Auto-split** long messages for Telegram's 4096 char limit
- **Typing indicators** while waiting for AI response
- **Health monitoring** with 5-minute interval logging

---

## Deployment / Penggunaan

### Zero-VPS Deployment (Recommended)

PUSPA V5 is production-ready with a **no-VPS architecture**:

- **Web + API**: [Vercel](https://vercel.com/) (serverless)
- **Database**: managed Postgres (Neon, Supabase, or equivalent)
- **Telegram bot worker**: serverless/container worker (Render/Railway/Fly.io) with auto-restart

You do **not** need to provision or maintain your own VPS.

### Step-by-Step (No VPS)

1. Push project to GitHub.
2. Import repository into Vercel.
3. Configure env vars in Vercel project settings.
4. Point `DATABASE_URL` to managed Postgres (recommended for production).
5. Deploy.
6. Deploy `mini-services/telegram-bot` on a hosted worker platform.
7. Set bot env vars:
   - `TELEGRAM_BOT_TOKEN`
   - `PUSPA_API_URL` (your Vercel URL)
   - `ALLOWED_CHAT_IDS`
   - `TELEGRAM_ADMIN_CHAT_IDS`
   - `PUSPA_INTERNAL_API_TOKEN` (must match app env)

### Notes

- Vercel handles scaling and HTTPS automatically.
- Telegram endpoint `/api/v1/ai/telegram` now requires `x-puspa-internal-token`.
- For production reliability, avoid local SQLite and use managed Postgres.
- DB fallback still protects user experience when transient DB outages happen.

### Deployment Checklist (No VPS)

- [ ] Vercel project connected to main branch and production domain verified.
- [ ] Managed Postgres provisioned and `DATABASE_URL` set in Vercel.
- [ ] `OPENROUTER_API_KEY_1` (and optional key rotation vars) set in Vercel.
- [ ] `PUSPA_INTERNAL_API_TOKEN` set in Vercel with strong random value.
- [ ] Telegram worker deployed on Render/Railway/Fly.io (no VPS).
- [ ] Worker env configured: `TELEGRAM_BOT_TOKEN`, `PUSPA_API_URL`, `ALLOWED_CHAT_IDS`, `TELEGRAM_ADMIN_CHAT_IDS`, `PUSPA_INTERNAL_API_TOKEN`.
- [ ] `PUSPA_INTERNAL_API_TOKEN` value matches exactly between Vercel and worker.
- [ ] Smoke test passed:
  - unauthorized call to `/api/v1/ai/telegram` returns `401`
  - allowlisted non-admin cannot set `/role admin`
  - admin chat ID can set `/role admin` or `/role developer`
  - normal Telegram query receives AI response.

### First-Run Onboarding (Operator Friendly)

- [ ] Admin confirms role mapping (`staff`, `admin`, `developer`) before onboarding team.
- [ ] Staff is given quick guide for 3 common actions: create case, check disbursement, check compliance due items.
- [ ] Telegram users test `/start`, `/help`, `/status` and understand role restrictions for `/role`.
- [ ] Team verifies fallback messages are understandable in Bahasa Melayu when AI or DB is unavailable.

---

## Security / Keselamatan

- **IC Number Masking**: All AI responses mask IC numbers as `****XXXX`
- **RBAC**: Three-tier access control across UI views and AI tools
- **API Key Rotation**: Automatic OpenRouter key rotation on 429/5xx errors
- **Telegram Allowlist**: Only authorized chat IDs can interact with the bot
- **Audit Trail**: All privileged operations are logged via the Activity model
- **eKYC Risk Assessment**: Members are classified with risk levels (low/medium/high)
- **Database Fallback**: Graceful degradation when database is unavailable

---

## Contributing / Penyumbangan

This is a proprietary project for PUSPA organization. Contributions are by invitation only.

---

## Organization / Pertubuhan

**Pertubuhan Urus Peduli Asnaf (PUSPA)**

| | |
|---|---|
| Registration | PPM-024-10-05012022 |
| Focus | Asnaf welfare in Kuala Lumpur & Selangor |
| Address | 2253, Jalan Permata 22, Taman Permata, 53300 Gombak, Selangor |
| Email | salam.puspaKL@gmail.com |
| Phone | +6012-3183369 |

| Donation Account | Maybank 562209677503 |
| Facebook | Pertubuhan Urus Peduli Asnaf KL & Selangor |

---

## License / Lesen

This is **proprietary software** developed exclusively for Pertubuhan Urus Peduli Asnaf (PPM-024-10-05012022). All rights reserved. Unauthorized copying, distribution, or modification is strictly prohibited.

---

<p align="center">
  <img src="public/puspa-logo-official.png" alt="PUSPA" width="48" />
  <br/>
  <em>Dibina dengan kasih sayang untuk komuniti asnaf.</em><br/>
  <em>Built with care for the asnaf community.</em>
</p>
