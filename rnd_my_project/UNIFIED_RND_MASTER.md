# 🧬 Istiyak Agent v0.1 — UNIFIED MASTER R&D

> **Version:** 0.1.0 | **Date:** 2026-07-03 | **Status:** Single Source of Truth
>
> **এই একটি মাত্র ডকুমেন্ট দিয়ে পুরো প্রজেক্ট বোঝা, কাজ করা, টেস্ট করা, বাগ ফিক্স করা — সব সম্ভব।**
> **যেকোনো AI Agent Model (free/paid) এই ডকুমেন্ট পড়ে পুরো কাজ নিখুঁতভাবে করতে পারবে।**
>
> ⚠️ **Previous RnD Files (DEPRECATED — use THIS document only):**
> - ~~istiyak_agent_complete_rnd.md~~
> - ~~istiyak_agent_update_tracker.md~~
> - ~~landing_saas_rnd.md~~

---

## 📋 Table of Contents

| # | Section | Page Jump |
|---|---------|-----------|
| 1 | [Project Overview](#1-project-overview) | Vision, Business Model |
| 2 | [Architecture Map](#2-architecture-map) | Monorepo, Dependency Graph |
| 3 | [Tech Stack](#3-tech-stack) | All technologies used |
| 4 | [Apps (4 Apps)](#4-apps) | Desktop, Daemon, SaaS, Landing |
| 5 | [Packages (8 Packages)](#5-packages) | Core, Memory, Prompts, SDK, Tools, DB, Types, Utils |
| 6 | [Agent Core Deep Dive](#6-agent-core-deep-dive) | Execution Loop, LLM, Security, Memory, Telemetry |
| 7 | [Data Flow](#7-data-flow-end-to-end) | Request → Response path |
| 8 | [Agent Modes & Tools](#8-agent-modes--tools) | 4 modes, 25+ tools |
| 9 | [Configuration Reference](#9-configuration-reference) | All limits, env vars, ports |
| 10 | [Key Patterns (How To)](#10-key-patterns--how-to-guides) | Add provider, tool, endpoint, component |
| 11 | [What's Missing (TODO)](#11-whats-missing--todo-tracker) | All missing features, security gaps |
| 12 | [Implementation Roadmap](#12-implementation-roadmap) | Phase 1-3 with timeline |
| 13 | [⭐ TESTING GUIDE](#13-testing-guide) | Full test plan, commands, workflows |
| 14 | [⭐ BUG → ERROR → FIX Workflow](#14-bug--error--fix-workflow) | Step-by-step debug guide |
| 15 | [⭐ Agent Task Instructions](#15-agent-task-instructions) | How ANY AI model should work |
| 16 | [Known Issues](#16-known-issues) | Current bugs & limitations |
| 17 | [Change Log](#17-change-log) | Version history |

---

## 1. Project Overview

**Istiyak Agent** = Autonomous AI Coding Companion

| Feature | Details |
|---------|---------|
| **Type** | Desktop app (Tauri) + Cloud SaaS + Landing Page |
| **Platforms** | macOS, Windows, Linux |
| **LLM Support** | Gemini, OpenAI, Claude, Deepseek, Ollama, Vertex AI, Custom |
| **Core Features** | Code read/write/edit, terminal commands, RAG search, self-reflection, security |
| **Business Model** | Free tier + Pro ($19/month via Stripe) |
| **Language** | Bangla/Banglish/English support |
| **Monorepo** | Turborepo + npm workspaces |

---

## 2. Architecture Map

```
istiyak-companion-monorepo/
├── apps/
│   ├── desktop/          → Tauri v2 + React + Vite (port 1420)
│   ├── local-daemon/     → Express API (port 3001) — agent runner
│   ├── saas-backend/     → Express + MongoDB + Stripe (port 3002)
│   └── landing/          → Next.js marketing site
├── packages/
│   ├── agent-core/       → 🧠 Brain (execution loop, LLM, security, memory)
│   ├── agent-memory/     → 📚 RAG + vector search + embeddings
│   ├── agent-prompts/    → 📝 System prompts & templates
│   ├── agent-sdk/        → 🔌 Client SDK (WIP/skeleton)
│   ├── agent-tools/      → 🔧 Tool interfaces & schemas
│   ├── database/         → 💾 MongoDB/Mongoose models
│   ├── shared-types/     → 📋 TypeScript interfaces
│   └── shared-utils/     → 🛠️ Crypto, Logger, Mask
├── package.json          → Monorepo root (workspaces: apps/*, packages/*)
├── turbo.json            → Turborepo pipeline
└── eslint.config.mjs     → ESLint 9 flat config
```

### Dependency Graph

```
apps/desktop         → @istiyak/shared-types
apps/local-daemon    → @istiyak/agent-core, @istiyak/agent-memory
apps/saas-backend    → @istiyak/database
apps/landing         → standalone (no internal deps)

@istiyak/agent-core  → @istiyak/shared-types, @istiyak/agent-memory,
                       @istiyak/shared-utils, @istiyak/agent-prompts,
                       @istiyak/agent-tools
```

---

## 3. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Desktop Shell** | Tauri v2 (Rust) | v2 |
| **Desktop UI** | React 18 + Vite 7 + TailwindCSS 3 | 18.3.1 / 7.0.4 / 3.4.19 |
| **State** | Zustand 5 | 5.0.14 |
| **Icons** | lucide-react (**REQUIRED by project rules**) | 1.21.0 |
| **Local Backend** | Node.js + Express 4 | 4.21.2 |
| **Cloud Backend** | Express 4 + MongoDB + Passport | 4.21.2 |
| **Landing** | Next.js 14 (App Router) | 14.2.16 |
| **Auth** | Passport.js (Google + GitHub OAuth) + JWT | 0.7.0 |
| **Payments** | Stripe | 22.2.3 |
| **Monitoring** | Sentry | 10.60.0 |
| **LLM** | @google/generative-ai + openai | 0.24.1 / 4.76.0 |
| **Build** | Turborepo | 1.10.16 |
| **Lint** | ESLint 9 | 9.39.4 |
| **TypeScript** | 5.4-5.8 | mixed |
| **Test** | Vitest | 2.1.8 |

---

## 4. Apps

### 4.1 Desktop (Tauri + React)

**Path:** `apps/desktop/`

**Tauri Backend (Rust):** `src-tauri/src/lib.rs` (430 lines)

| Tauri IPC Command | Purpose |
|-------------------|---------|
| `greet(name)` | Hello world test |
| `load_config()` | Read `~/.istiyak_agent_config.json` |
| `save_config(config)` | Write config to home dir |
| `get_env_var(name)` | Config → env var fallback |
| `read_file(path)` | Read file from disk |
| `write_file(path, content)` | Write file, create parent dirs |
| `scan_project(path)` | Walk dir tree, skip node_modules/.git/dist/target |
| `select_directory()` | Native folder picker |
| `select_file()` | Native file picker |
| `detect_ide_workspaces()` | Scan VS Code/Cursor workspace storage |

**React Frontend Structure:**

```
src/
├── App.tsx                    # Root → <ChatUI />
├── main.tsx                   # React DOM render
├── components/
│   ├── ChatUI.tsx             # Main chat UI (~800+ lines)
│   ├── chat/                  # Chat sub-components
│   ├── layout/                # Layout components
│   ├── settings/              # Settings panel
│   └── ui/                    # Reusable UI primitives
├── hooks/
│   ├── usePolling.ts          # Poll daemon status
│   ├── usePermissions.ts      # Permission request handling
│   ├── useTelemetry.ts        # Telemetry hook
│   └── useWorkspaceDetect.ts  # IDE workspace auto-detection
├── store/
│   ├── index.ts               # Zustand store
│   ├── chatStore.ts
│   ├── settingsStore.ts
│   └── slices/chatSlice.ts
├── types/chat.ts
└── utils/
    ├── config.ts              # Config helper
    ├── parser.ts              # Agent response parser
    ├── theme.ts               # Theme utilities
    └── theme.test.ts          # Theme tests (vitest)
```

**Key Features:** Streaming chat, `<agent_step>` tag parsing, `<permission_request>` approval dialog, agent mode selector, workspace picker, provider/model selector, cost display, Sentry tracking

---

### 4.2 Local Daemon (Node.js Express)

**Path:** `apps/local-daemon/`

**Two Modes:**
1. `node src/index.js --ui` → Express server on port 3001
2. `node src/index.js --terminal` → Interactive CLI REPL

**API Routes:**

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/health` | GET | Health check |
| `/api/chat` | POST | Main chat (streaming SSE) |
| `/api/agent/abort` | POST | Cancel running agent |
| `/api/agent/status` | GET | Agent running state |
| `/api/telemetry/stats` | GET | Telemetry stats |
| `/api/rag/*` | — | RAG indexing/search |
| `/api/watcher/*` | — | File watcher |
| `/api/git/*` | — | Git operations |

**Chat Flow:** POST → validate mode → streaming headers → AbortController → reset cost → `runAgent()` → stream chunks → append cost → `res.end()`

**Permission System:** `requestPermission(reqId, command)` → Promise → UI approve/reject → 5-min timeout auto-reject

---

### 4.3 SaaS Backend (Express + MongoDB)

**Path:** `apps/saas-backend/`

```
src/
├── server.ts           # Express + CORS + Sentry
├── config/passport.js  # OAuth strategies
├── controllers/        # authController, adminController, billingController, sandboxController, updateController
├── middleware/          # auth (JWT), errorHandler, rateLimiter (30 req/min)
├── repositories/       # userRepository, ipLogRepository
├── routes/             # auth, admin, billing, sandbox, update
└── services/           # authService, sandboxService, stripeService (MOCK!), updateService
```

**Key Issues:**
- ⚠️ `stripeService.ts` is a **MOCK** — returns fake session ID
- ⚠️ Admin page has **NO authentication**
- ⚠️ Admin API is **open** — no JWT guard

---

### 4.4 Landing Page (Next.js)

**Path:** `apps/landing/`

**Existing Pages:**

| Route | Status | Component |
|-------|--------|-----------|
| `/` | ✅ Done | Nav, Hero, Features, Pricing, Download, Footer, Modal |
| `/admin` | ✅ Done | User list, stats, block/unban |
| `/success` | ✅ Done | Payment success page |
| `/cancel` | ✅ Done | Payment cancel page |

**Design:** Dark theme (`#07080d`), cyan accent (`#06b6d4`), glassmorphism, Outfit/Inter/JetBrains Mono fonts

---

## 5. Packages

### 5.1 agent-core (🧠 Brain)

**Path:** `packages/agent-core/` | **Exports:** 61 | **Main:** `dist/index.js`

```
src/
├── index.ts                    # 61 exports
├── agent/                      # Agent execution engine
│   ├── Agent.ts, AgentRunner.ts (582 lines), AgentState.ts
│   ├── AgentWorkflow.ts, ApprovalManager.ts, ContextBuilder.ts
│   ├── ExceptionHandler.ts, MemoryManager.ts, Planner.ts
│   ├── PromptBuilder.ts, Reflection.ts, TaskClassifier.ts
│   └── Reflection.test.ts
├── config/                     # Limits.ts, Models.ts, Providers.ts, Settings.ts, Tools.ts, Limits.test.ts
├── events/                     # EventBus.ts, AgentEvents.ts, ToolEvents.ts, WorkspaceEvents.ts
├── llm/                        # ProviderManager.ts, ModelManager.ts, TokenCounter.ts
│   ├── CostTracker.ts, StreamManager.ts, ResponseParser.ts, CostTracker.test.ts
│   ├── prompts/                # Prompt templates
│   └── providers/              # gemini/, openai/, claude/, ollama/, vertex/, deepseek/, custom/
├── memory/                     # SessionMemory.ts, WorkspaceMemory.ts, ContextCompressor.ts, SummaryEngine.ts, VectorMemory.ts
├── security/                   # PermissionManager.ts, ApprovalManager.ts, SecretMasker.ts, SandboxPolicy.ts, WorkspaceGuard.ts
├── shared/                     # constants/, helpers/, interfaces/, schemas/, types/
├── telemetry/                  # Logger.ts, Metrics.ts, Tracing.ts, UsageTracker.ts, CrashReporter.ts
└── tools/                      # agent/, filesystem/, git/, memory/, planning/, registry/, terminal/, web/
```

**Dependencies:** `@google/generative-ai`, `openai`, `headroom-ai`, + all `@istiyak/*` packages

---

### 5.2 agent-memory (📚 RAG)

**Path:** `packages/agent-memory/`

| File | Purpose |
|------|---------|
| `VectorClient.ts` (365 lines) | RAG engine — workspace indexing + hybrid TF-IDF + cosine search |
| `EmbeddingClient.ts` | Gemini embedding API + cosine similarity |
| `SQLiteMemoryStore.ts` | SQLite-backed persistent memory |
| `WorkspaceMemoryStore.ts` | Workspace context store |

**RAG Config:** Max 3000 files, max 1MB/file, max depth 8, chunk 15 lines, overlap 5 lines, cache v2

**Search:** `finalScore = 0.3 * tfidf + 0.7 * cosine`

---

### 5.3 agent-prompts (📝 Templates)

| File | Purpose |
|------|---------|
| `SystemTemplates.ts` | Main system prompt (10 core rules) |
| `PlanningTemplates.ts` | Planning mode prompt |
| `CorrectionTemplates.ts` | Self-correction prompt |

---

### 5.4 agent-sdk (🔌 WIP)

Skeleton only — `Client.ts`, `Connection.ts`

### 5.5 agent-tools (🔧 Interfaces)

`BaseTool.ts`, `ToolContext.ts`, `ToolSchema.ts`

### 5.6 database (💾 MongoDB)

`connectDatabase()` + Mongoose models (User, IpLog)

### 5.7 shared-types (📋 TypeScript)

`Message`, `AgentResponse`, `LocalConfig`, `ChatStoreState`, `SettingsStoreState`

### 5.8 shared-utils (🛠️ Utilities)

`sha256()`, `encrypt()`/`decrypt()` (AES-256-CTR), `Logger`, `maskSecrets()`

---

## 6. Agent Core Deep Dive

### 6.1 Execution Loop (AgentRunner.ts — 582 lines)

```
User Message → Mode Check
  → chat/plan → Direct LLM (plain text, no tools)
  → assist/agent → RAG Lookup → System Prompt → Agent Loop (max 15 steps)
    → Abort? → Reflect? (every 8 steps) → Call LLM (streaming)
    → SecretMasker → Parse JSON
      → Parse Error → 2+ failures → wrap as "done"
      → Success → action="done" → Complete
                → action=tool → Approval? → Execute → Telemetry → Budget Check ($2)
```

**Key Rules:**
- Short messages (<25 chars) matching greetings → auto "chat" mode
- Rate limit 429 → wait 30s → retry once
- Budget guard: $2.00 max session cost
- Loop detection: same tool 3x → trigger reflection
- Parse error: 2+ consecutive → wrap as "done"

### 6.2 LLM Provider System

| Provider | Simple Model | Complex Model | API Key Required |
|----------|-------------|---------------|:---:|
| Gemini | gemini-2.5-flash | gemini-2.5-pro | ✅ |
| OpenAI | gpt-4o-mini | gpt-4o | ✅ |
| Claude | claude-3-5-haiku | claude-3-5-sonnet | ✅ |
| DeepSeek | deepseek-chat | deepseek-coder | ✅ |
| Ollama | llama3.1 | codellama | ❌ (local) |
| Vertex AI | gemini-2.5-flash | gemini-2.5-pro | ❌ (Service Account) |
| Custom | — | — | ❌ |

**Auto-routing keywords (complex):** refactor, optimize, debug, error, write tests, implement, fix bug, architecture, race condition, memory leak, performance, class, database

**Cost ($/1M tokens):**

| Model | Input | Output |
|-------|-------|--------|
| gemini-2.5-flash | $0.15 | $0.60 |
| gemini-2.5-pro | $1.25 | $5.00 |
| gpt-4o | $2.50 | $10.00 |
| gpt-4o-mini | $0.15 | $0.60 |
| claude-sonnet-4 | $3.00 | $15.00 |
| deepseek-chat | $0.14 | $0.28 |
| ollama/* | $0.00 | $0.00 |

**Response Parser:** 4 strategies: JSON.parse → strip markdown → state machine → fix trailing commas

**Token Counter:** Word-based (~85% accuracy), 1 word ≈ 1.3 tokens

### 6.3 Security (4 Layers)

| Layer | Component | What It Does |
|-------|-----------|-------------|
| 1 | ApprovalManager | Dangerous commands need user approval (rm -rf, sudo, kill, etc.) |
| 2 | PermissionManager | Blocked commands (fork bombs, mkfs), safe commands (ls, cat), approval commands (rm, sudo, docker) |
| 3 | WorkspaceGuard | Path traversal detection, blocked reads (/etc/passwd, .ssh, .aws, .env), symlink escape |
| 4 | SecretMasker | Auto-detect & mask API keys (sk-*, AIza*, ghp_*, AKIA*, etc.) → keep first 4 + last 4 |

**SandboxPolicy:** 120s timeout, 5MB output, 5 max processes, 512MB RAM, 0.5 CPU (Docker)

### 6.4 Memory (3 Tiers)

| Tier | Class | Scope | Auto-compress |
|------|-------|-------|:---:|
| Session | SessionMemory | Per-conversation | ✅ (>100 msgs or >50K tokens) |
| Workspace | WorkspaceMemory | Per-workspace | ❌ |
| Vector | VectorClient | Per-workspace | ❌ |

**ContextBuilder:** Max 100K tokens, truncate tool results >12K chars, preserve system + last 10 messages

**SummaryEngine:** Extractive (TF-IDF), not LLM-based

### 6.5 Telemetry

| Component | File | Persistence |
|-----------|------|-------------|
| Metrics | Metrics.ts | In-memory |
| Tracing | Tracing.ts | In-memory spans |
| UsageTracker | UsageTracker.ts | `~/.istiyak_usage.json` (max 10K records) |
| CrashReporter | CrashReporter.ts | `~/.istiyak_crash_logs/` (max 50 logs) |
| Logger | Logger.ts | Console |

### 6.6 Event System

EventBus extends EventEmitter — auto-timestamp, history (100 events), wildcard `*`, max 50 listeners

Events: AGENT_STARTED/STEP/FINISHED/ERROR, TOOL_EXECUTED/FAILED, WORKSPACE_FILE_CHANGED

---

## 7. Data Flow (End-to-End)

```
User (Desktop) → React UI → POST /api/chat (streaming) → Daemon
→ runAgent(options) → Detect mode → RAG lookup → Build system prompt
→ Agent Loop (max 15 steps):
    SecretMasker.mask(history) → streamLLM(messages) → parseResponse(json)
    → action="done" → stream summary → end
    → action=tool:
        → needs approval? → permission_request → UI approve/reject
        → execute tool → record telemetry → check budget
→ Stream complete + cost → React → User
```

---

## 8. Agent Modes & Tools

### Modes

| Mode | LLM Output | Tools | Writes | Use Case |
|------|-----------|-------|--------|----------|
| **Chat** | Plain text | ❌ | ❌ | Conversational Q&A |
| **Plan** | Plain text | ❌ | ❌ | Analysis & planning |
| **Assist** | JSON | 📖 Read-only | ❌ | Code review, exploration |
| **Agent** | JSON | ✅ All | ✅ | Full autonomous coding |

### Tools (25+)

| Tool | Category | Description |
|------|----------|-------------|
| `scan_project` | Filesystem | Walk directory tree |
| `list_files` | Filesystem | List directory |
| `read_file` | Filesystem | Read file content |
| `write_file` | Filesystem | Create/overwrite file |
| `precise_edit` | Filesystem | Targeted text replacement |
| `delete_file` | Filesystem | Delete file (approval needed) |
| `create_directory` | Filesystem | Create folder |
| `move_file` | Filesystem | Move file/dir |
| `rename_file` | Filesystem | Rename file/dir |
| `search_workspace` | Memory | RAG semantic search |
| `run_command` | Terminal | Execute shell command |
| `create_plan` | Planning | Write workspace_plan.md |
| `update_plan` | Planning | Mark plan steps complete |
| `walkthrough` | Planning | Document changes |
| `reflect` | Agent | Self-reflection |
| `git_status` | Git | Git status |
| `git_diff` | Git | Git diff |
| `git_commit_changes` | Git | Git commit |
| `git_log` | Git | Git log |
| `google_search` | Web | Web search |
| `fetch_url` | Web | HTTP GET |
| `url_context` | Web | Extract page context |
| `crawl_website` | Web | Multi-page crawl |
| `ast_edit` | Code | AST-based code edit |
| `delegate_task` | Agent | Delegate sub-task |
| `spawn_sub_agent` | Agent | Spawn child agent |

---

## 9. Configuration Reference

### Limits (agent-core/src/config/Limits.ts)

| Key | Value | Description |
|-----|-------|-------------|
| MAX_STEPS | 15 | Agent loop iterations |
| MAX_SESSION_COST_USD | $2.00 | Budget guard |
| MAX_CONTEXT_TOKENS | 100,000 | LLM context window |
| MAX_HISTORY_TOKENS | 30,000 | Compressed history |
| MAX_FILE_SIZE | 10 MB | File read/write limit |
| MAX_COMMAND_OUTPUT | 5 MB | Terminal output |
| MAX_COMMAND_TIMEOUT | 120,000ms | Command timeout (2 min) |
| MAX_SCAN_FILES | 5,000 | Project scan limit |
| MAX_CONCURRENT_TOOLS | 3 | Parallel tools |
| MAX_SESSION_MESSAGES | 100 | Before auto-compress |
| REFLECTION_INTERVAL | 8 | Steps between reflections |
| RAG_MAX_FILES | 3,000 | VectorClient limit |
| RAG_CHUNK_SIZE | 15 lines | Chunk size |

### Ports

| Service | Port |
|---------|------|
| Desktop (Vite) | 1420 |
| Local Daemon | 3001 |
| SaaS Backend | 3002 |
| Landing (Next.js) | 3000 |

### Environment Variables

| Variable | Used In | Required |
|----------|---------|----------|
| `GEMINI_API_KEY` | daemon, core | ✅ (if Gemini) |
| `OPENAI_API_KEY` | daemon, core | ✅ (if OpenAI) |
| `ANTHROPIC_API_KEY` | core | ✅ (if Claude) |
| `DEEPSEEK_API_KEY` | core | ✅ (if Deepseek) |
| `MONGODB_URI` | saas-backend | ✅ (default: `mongodb://127.0.0.1:27017/istiyak_saas`) |
| `PORT` | daemon, saas | ❌ (3001/3002) |
| `SENTRY_DSN` | saas, desktop | ❌ |
| `STRIPE_SECRET_KEY` | saas-backend | ✅ (if billing) |
| `JWT_SECRET` | saas-backend | ✅ |
| `GOOGLE_CLIENT_ID` | saas-backend | ✅ (if OAuth) |
| `GOOGLE_CLIENT_SECRET` | saas-backend | ✅ (if OAuth) |
| `GITHUB_CLIENT_ID` | saas-backend | ✅ (if OAuth) |
| `GITHUB_CLIENT_SECRET` | saas-backend | ✅ (if OAuth) |
| `ALLOWED_ORIGINS` | saas-backend | ❌ |
| `AI_PROVIDER` | daemon (terminal) | ❌ (default: gemini) |
| `AI_MODEL` | daemon (terminal) | ❌ (default: gemini-2.5-flash) |

### Build & Run Commands

```bash
# ====== Full Monorepo ======
npm run dev              # All workspaces in dev mode
npm run build            # Build all packages
npm run lint             # Lint all
npm run test             # Test all

# ====== Individual Apps ======
cd apps/desktop && npm run tauri dev        # Desktop app
cd apps/local-daemon && npm run dev         # Daemon (port 3001)
cd apps/saas-backend && npm run dev         # SaaS (port 3002)
cd apps/landing && npm run dev              # Landing (port 3000)

# ====== Terminal Mode ======
cd apps/local-daemon && node src/index.js --terminal
```

---

## 10. Key Patterns & How-To Guides

### ➕ Adding a New LLM Provider

1. Create dir: `packages/agent-core/src/llm/providers/newprovider/`
2. Implement provider class with `streamLLM()` method
3. Add to `ProviderManager.ts` switch statement
4. Add cost rates to `CostTracker.ts`
5. Add model entries to `Models.ts`
6. Add provider entry to `Providers.ts`
7. Update `shared-types/api.ts` if new config fields needed

### ➕ Adding a New Tool

1. Create tool file in `packages/agent-core/src/tools/<category>/`
2. Register in `ToolRegistry.ts`
3. Add tool declaration in `PromptBuilder.ts` (buildToolDeclarations)
4. Handle in `AgentRunner.ts` executeAction switch
5. If dangerous, add to `ApprovalManager.ts` approval list

### ➕ Adding a New API Endpoint

1. Create route in `apps/local-daemon/src/routes/` or `apps/saas-backend/src/routes/`
2. Mount in `daemon.js` or `server.ts`
3. Update CORS if new origins needed
4. Add auth middleware if needed (SaaS only)

### ➕ Adding a New Desktop UI Component

1. Create in `apps/desktop/src/components/`
2. **Use `lucide-react` for icons** (project rule!)
3. Use Zustand store for state
4. Call Tauri commands via `invoke()`

### 🔄 Changing Configuration/Limits

1. Update `packages/agent-core/src/config/Limits.ts`
2. Update this RnD document
3. Test with `npm run test`

---

## 11. What's Missing — TODO Tracker

### 🔴 CRITICAL (Security + Core)

| # | Feature | Location | Details |
|---|---------|----------|---------|
| 1 | **Admin auth guard** | saas-backend | Admin page + API has NO authentication |
| 2 | **Real Stripe integration** | saas-backend | `stripeService.ts` is a MOCK |
| 3 | **Stripe webhook handler** | saas-backend | checkout.session.completed, invoice.paid, etc. |
| 4 | **License verification API** | saas-backend | Desktop app needs to check Pro status |
| 5 | **Billing API auth** | saas-backend | POST /api/billing/checkout — no JWT guard |
| 6 | **Sandbox API auth** | saas-backend | POST /api/sandbox/create — open endpoint |

### 🟡 IMPORTANT (Features)

| # | Feature | Location |
|---|---------|----------|
| 7 | Login/Register web pages | landing `/login`, `/register` |
| 8 | User Dashboard | landing `/dashboard` |
| 9 | User Settings | landing `/settings` |
| 10 | Billing Portal | landing `/billing` |
| 11 | Privacy Policy | landing `/privacy` |
| 12 | Terms of Service | landing `/terms` |
| 13 | Mobile responsive landing | landing (missing breakpoints) |
| 14 | CheckoutButton → Stripe | landing (currently stub) |
| 15 | User profile API | saas-backend GET/PUT /api/auth/profile |
| 16 | Password reset flow | saas-backend forgot/reset endpoints |
| 17 | Email verification | saas-backend verify endpoints |
| 18 | Subscription management | saas-backend upgrade/downgrade/cancel |
| 19 | API key management | saas-backend generate/revoke keys |

### 🟢 NICE-TO-HAVE

| # | Feature |
|---|---------|
| 20 | Testimonials section |
| 21 | Product demo section |
| 22 | How it works section |
| 23 | Comparison table |
| 24 | FAQ section |
| 25 | Blog/changelog |
| 26 | Documentation site |
| 27 | Contact/support page |
| 28 | SEO (sitemap, og:image) |
| 29 | Cookie consent |
| 30 | Animated hero |

### Missing Database Models

Current: User, IpLog (only 2)

**Needed:** Subscription, ApiKey, UsageLog, Session, PasswordReset, Team

### Missing API Endpoints

| Endpoint | Method | Status |
|----------|--------|--------|
| `POST /api/billing/webhook` | POST | ❌ |
| `POST /api/billing/portal` | POST | ❌ |
| `GET /api/billing/status` | GET | ❌ |
| `GET /api/auth/profile` | GET | ❌ |
| `PUT /api/auth/profile` | PUT | ❌ |
| `POST /api/auth/forgot-password` | POST | ❌ |
| `POST /api/auth/reset-password` | POST | ❌ |
| `POST /api/auth/verify-email` | POST | ❌ |
| `GET /api/license/check` | GET | ❌ |
| `POST /api/keys/generate` | POST | ❌ |
| `DELETE /api/keys/:keyId` | DELETE | ❌ |
| `GET /api/usage/daily` | GET | ❌ |
| `GET /api/admin/metrics` | GET | ❌ |

---

## 12. Implementation Roadmap

### Phase 1: Foundation (Week 1-2) — ~37 hours

| Task | Est. | Files |
|------|------|-------|
| Real Stripe integration | 8h | `stripeService.ts`, new `webhook.ts` |
| Auth guards (admin + billing) | 4h | `admin.ts`, `billing.ts`, `auth.ts` middleware |
| License verification API | 4h | new `license.ts` route |
| Login/Register pages | 6h | new `/login`, `/register` |
| User profile API | 4h | new profile controller |
| Mobile responsive landing | 8h | `page.tsx`, `globals.css`, components |
| Privacy + Terms pages | 3h | new `/privacy`, `/terms` |

### Phase 2: Web Application (Week 3-4) — ~58 hours

| Task | Est. |
|------|------|
| Dashboard layout + sidebar | 6h |
| Usage stats page | 8h |
| Billing portal page | 6h |
| Settings page | 6h |
| API key management | 6h |
| Password reset flow | 6h |
| Email verification | 4h |
| Database schema expansion | 4h |
| New landing sections | 12h |

### Phase 3: Polish & Scale (Week 5-6) — ~58 hours

| Task | Est. |
|------|------|
| Comparison table | 4h |
| Documentation site | 12h |
| Blog/changelog | 8h |
| SEO optimization | 4h |
| Animated hero | 6h |
| Cookie consent | 2h |
| Admin panel enhancement | 8h |
| Contact/support page | 3h |
| Status page | 3h |
| E2E testing (Playwright) | 8h |

**Total: ~153 hours (4-6 weeks)**

---

## 13. ⭐ TESTING GUIDE

> **এই সেকশন পুরো প্রজেক্টের সব টেস্টিং — কোথায় টেস্ট করবে, কীভাবে করবে, কী কী টেস্ট করবে — সব আছে।**

### 13.1 Test Framework & Setup

| App/Package | Test Framework | Config | Command |
|------------|----------------|--------|---------|
| `apps/desktop` | **Vitest** | package.json (`vitest run`) | `cd apps/desktop && npx vitest run` |
| `apps/local-daemon` | **Vitest** | package.json (`vitest run`) | `cd apps/local-daemon && npx vitest run` |
| `apps/saas-backend` | **None yet** | ❌ Needs setup | Need to add vitest |
| `apps/landing` | **None yet** | ❌ Needs setup | Need to add vitest |
| `packages/agent-core` | **Vitest** (via dist) | ❌ No test script | Need to add vitest |
| Other packages | **None** | ❌ | Need to add |

### 13.2 Existing Test Files (5 total — VERY LOW coverage)

| File | Tests | Status |
|------|-------|--------|
| `apps/desktop/src/utils/theme.test.ts` | Theme utility tests | ✅ Working |
| `apps/local-daemon/src/dummy.test.js` | Dummy placeholder | ⚠️ Placeholder |
| `packages/agent-core/src/agent/Reflection.test.ts` | Reflection engine | ✅ Working |
| `packages/agent-core/src/config/Limits.test.ts` | Config limits | ✅ Working |
| `packages/agent-core/src/llm/CostTracker.test.ts` | Cost calculation | ✅ Working |

### 13.3 FULL TEST PLAN — Module by Module

---

#### 🧪 TEST LAYER 1: Unit Tests (No External Dependencies)

**Target: Packages that have NO external API calls**

---

##### packages/shared-utils

```
Test File: packages/shared-utils/src/__tests__/crypto.test.ts
- ✅ sha256() returns consistent hash for same input
- ✅ sha256() returns different hash for different input
- ✅ encrypt() + decrypt() roundtrip works
- ✅ encrypt() produces different ciphertext each time (CTR mode)
- ✅ decrypt() with wrong key fails gracefully

Test File: packages/shared-utils/src/__tests__/logger.test.ts
- ✅ Logger.info() outputs with prefix
- ✅ Logger.warn() outputs with prefix
- ✅ Logger.error() outputs with prefix

Test File: packages/shared-utils/src/__tests__/mask.test.ts
- ✅ maskSecrets() masks single secret
- ✅ maskSecrets() masks multiple secrets
- ✅ maskSecrets() handles empty secrets array
- ✅ maskSecrets() handles no match in text
```

**Command:** `cd packages/shared-utils && npx vitest run`

---

##### packages/shared-types

```
Test File: packages/shared-types/src/__tests__/types.test.ts
- ✅ Message interface accepts valid object
- ✅ AgentResponse interface matches schema
- ✅ LocalConfig has required fields
```

**Command:** `cd packages/shared-types && npx vitest run`

---

##### packages/agent-prompts

```
Test File: packages/agent-prompts/src/__tests__/SystemTemplates.test.ts
- ✅ getSystemPrompt() returns non-empty string
- ✅ getSystemPrompt() includes JSON schema instruction
- ✅ getSystemPrompt() includes all 10 core rules
- ✅ getSystemPrompt() includes Bangla support text

Test File: packages/agent-prompts/src/__tests__/PlanningTemplates.test.ts
- ✅ getPlanningPrompt() returns valid prompt
- ✅ getPlanningPrompt() includes workspace context

Test File: packages/agent-prompts/src/__tests__/CorrectionTemplates.test.ts
- ✅ getCorrectionPrompt() includes error context
- ✅ getCorrectionPrompt() includes retry instruction
```

**Command:** `cd packages/agent-prompts && npx vitest run`

---

##### packages/agent-core — Config Module

```
Test File: packages/agent-core/src/config/Limits.test.ts (EXISTS ✅)
- ✅ All limits have valid numeric values
- ✅ MAX_STEPS > 0
- ✅ MAX_SESSION_COST_USD > 0
- ✅ MAX_CONTEXT_TOKENS > MAX_HISTORY_TOKENS

Test File: packages/agent-core/src/config/Models.test.ts (NEEDS CREATION)
- ✅ All models have provider field
- ✅ All models have maxInputTokens > 0
- ✅ getModelsForProvider() returns correct models
- ✅ getDefaultModel() returns valid model

Test File: packages/agent-core/src/config/Providers.test.ts (NEEDS CREATION)
- ✅ All providers have id, name, requiresApiKey fields
- ✅ getProvider() returns correct provider object
- ✅ getAllProviders() returns 7 providers
```

---

##### packages/agent-core — Security Module

```
Test File: packages/agent-core/src/security/SecretMasker.test.ts (NEEDS CREATION)
- ✅ masks OpenAI key (sk-*)
- ✅ masks Google key (AIza*)
- ✅ masks Anthropic key (sk-ant-*)
- ✅ masks GitHub token (ghp_*)
- ✅ masks AWS key (AKIA*)
- ✅ masks Bearer token
- ✅ masks long hex strings (40+ chars)
- ✅ masks env var assignments (API_KEY=xxx)
- ✅ keeps first 4 + last 4 chars
- ✅ handles text with no secrets (no change)
- ✅ handles empty string

Test File: packages/agent-core/src/security/WorkspaceGuard.test.ts (NEEDS CREATION)
- ✅ allows path inside workspace
- ✅ blocks path outside workspace
- ✅ blocks path traversal (..)
- ✅ blocks /etc/passwd
- ✅ blocks ~/.ssh
- ✅ blocks .env file read
- ✅ resolveSafe() returns resolved path inside workspace
- ✅ resolveSafe() throws for path outside workspace

Test File: packages/agent-core/src/security/PermissionManager.test.ts (NEEDS CREATION)
- ✅ blocks "rm -rf /"
- ✅ blocks fork bombs
- ✅ allows "ls", "cat", "echo"
- ✅ requires approval for "sudo"
- ✅ requires approval for "docker"
- ✅ detects outside-workspace paths in commands

Test File: packages/agent-core/src/security/ApprovalManager.test.ts (NEEDS CREATION)
- ✅ classifies "rm -rf" as dangerous
- ✅ classifies "ls" as safe
- ✅ classifies "write_file" inside workspace as auto-approved
- ✅ classifies "delete_file" as needs-approval
```

**Command:** `cd packages/agent-core && npx vitest run`

---

##### packages/agent-core — LLM Module

```
Test File: packages/agent-core/src/llm/CostTracker.test.ts (EXISTS ✅)
- ✅ Calculates correct cost for gemini-2.5-flash
- ✅ Calculates correct cost for gpt-4o
- ✅ Returns $0 for ollama models
- ✅ Accumulates session cost
- ✅ Resets session cost

Test File: packages/agent-core/src/llm/TokenCounter.test.ts (NEEDS CREATION)
- ✅ Counts tokens for simple sentence
- ✅ Counts tokens for code with special chars
- ✅ Counts message framing overhead
- ✅ Empty string returns 0

Test File: packages/agent-core/src/llm/ResponseParser.test.ts (NEEDS CREATION)
- ✅ Parses valid JSON directly
- ✅ Parses JSON wrapped in markdown fences
- ✅ Parses JSON embedded in text (state machine)
- ✅ Handles trailing commas
- ✅ Returns null for unparseable garbage
- ✅ Extracts "action" field correctly

Test File: packages/agent-core/src/llm/ModelManager.test.ts (NEEDS CREATION)
- ✅ Routes simple task to flash/mini model
- ✅ Routes complex task (with keywords) to pro model
- ✅ Returns correct model for each provider
```

---

##### packages/agent-core — Memory Module

```
Test File: packages/agent-core/src/memory/SessionMemory.test.ts (NEEDS CREATION)
- ✅ Adds and retrieves messages
- ✅ Auto-compresses at >100 messages
- ✅ Keeps system + last 8 messages on compress
- ✅ Serializes to JSON
- ✅ Deserializes from JSON

Test File: packages/agent-core/src/memory/SummaryEngine.test.ts (NEEDS CREATION)
- ✅ Summarizes multi-sentence text
- ✅ Extracts key sentences (TF-IDF scoring)
- ✅ Handles empty text
- ✅ Boosts first/last sentences
- ✅ Boosts keyword sentences (error, success)
```

---

##### packages/agent-core — Agent Module

```
Test File: packages/agent-core/src/agent/Reflection.test.ts (EXISTS ✅)
- ✅ Triggers reflection at interval (every 8 steps)
- ✅ Triggers reflection on error
- ✅ Triggers reflection on loop (same tool 3x)
- ✅ Returns valid reflection prompt

Test File: packages/agent-core/src/agent/TaskClassifier.test.ts (NEEDS CREATION)
- ✅ Classifies short greetings as "chat"
- ✅ Classifies "hello" as chat
- ✅ Classifies "refactor the auth module" as complex
- ✅ Classifies "what is X?" as simple

Test File: packages/agent-core/src/agent/ContextBuilder.test.ts (NEEDS CREATION)
- ✅ Limits context to 100K tokens
- ✅ Truncates tool results >12K chars
- ✅ Preserves system + last 10 messages
```

---

##### packages/agent-core — Events Module

```
Test File: packages/agent-core/src/events/EventBus.test.ts (NEEDS CREATION)
- ✅ Emits and receives events
- ✅ Auto-adds timestamp
- ✅ Stores event history (max 100)
- ✅ Wildcard * listener receives all events
- ✅ removeListener works correctly
```

---

##### packages/agent-core — Telemetry Module

```
Test File: packages/agent-core/src/telemetry/UsageTracker.test.ts (NEEDS CREATION)
- ✅ Records usage entry
- ✅ getDailyUsage() returns correct aggregation
- ✅ getUsageByProvider() groups correctly
- ✅ Max 10K records enforced
- ✅ save() and load() roundtrip (mock fs)

Test File: packages/agent-core/src/telemetry/CrashReporter.test.ts (NEEDS CREATION)
- ✅ Creates crash report with stack trace
- ✅ Parses stack frames correctly
- ✅ Includes system info (platform, arch, node version)
- ✅ Auto-prunes at 50 logs
```

---

##### packages/agent-memory

```
Test File: packages/agent-memory/src/__tests__/VectorClient.test.ts (NEEDS CREATION)
- ✅ Indexes files correctly (respects file type filter)
- ✅ Skips ignored directories (node_modules, .git, .next)
- ✅ Chunks files at 15 lines with 5-line overlap
- ✅ Respects MAX_FILES (3000) and MAX_FILE_SIZE (1MB)
- ✅ Hybrid search scoring (0.3*tfidf + 0.7*cosine)
- ✅ Cache save/load roundtrip
- ✅ Handles empty workspace

Test File: packages/agent-memory/src/__tests__/EmbeddingClient.test.ts (NEEDS CREATION)
- ✅ Calculates cosine similarity correctly
- ✅ Returns 1.0 for identical vectors
- ✅ Returns 0.0 for orthogonal vectors
```

---

#### 🧪 TEST LAYER 2: Integration Tests (API Endpoints)

**Target: Daemon + SaaS Backend APIs**

---

##### apps/local-daemon

```
Test File: apps/local-daemon/src/__tests__/health.test.js
- ✅ GET /api/health returns 200
- ✅ Response has status: "ok"

Test File: apps/local-daemon/src/__tests__/chat.test.js
- ✅ POST /api/chat with valid body returns streaming response
- ✅ POST /api/chat with missing workspacePath returns 400
- ✅ POST /api/chat with invalid agentMode returns 400
- ✅ Response headers have text/plain content-type

Test File: apps/local-daemon/src/__tests__/agent.test.js
- ✅ GET /api/agent/status returns running state
- ✅ POST /api/agent/abort cancels running agent
```

**Command:** `cd apps/local-daemon && npx vitest run`

---

##### apps/saas-backend

```
Test File: apps/saas-backend/src/__tests__/auth.test.ts
- ✅ POST /api/auth/register creates new user
- ✅ POST /api/auth/register rejects duplicate email
- ✅ POST /api/auth/login returns JWT for valid credentials
- ✅ POST /api/auth/login rejects wrong password
- ✅ JWT middleware protects routes
- ✅ Invalid token returns 401

Test File: apps/saas-backend/src/__tests__/admin.test.ts
- ✅ GET /api/admin/users requires admin auth
- ✅ Unauthorized access returns 401/403

Test File: apps/saas-backend/src/__tests__/rateLimiter.test.ts
- ✅ Allows up to 30 requests per minute
- ✅ Returns 429 after limit exceeded
```

**Command:** `cd apps/saas-backend && npx vitest run` (after adding vitest)

---

#### 🧪 TEST LAYER 3: E2E Tests (Full User Flows)

**Framework:** Playwright (needs installation)

```
Test File: tests/e2e/landing.spec.ts
- ✅ Landing page loads and displays hero
- ✅ Navigation links work (Features, Pricing, Download)
- ✅ Pricing cards display correct prices ($0 and $19)
- ✅ Download buttons are present

Test File: tests/e2e/desktop-daemon-flow.spec.ts
- ✅ Daemon starts on port 3001
- ✅ Health endpoint responds
- ✅ Chat endpoint streams response
- ✅ Agent abort works
```

**Command:** `npx playwright test`

---

### 13.4 HOW TO RUN ALL TESTS

```bash
# ====== Step 1: Run all monorepo tests ======
npm run test

# ====== Step 2: Run specific package tests ======
cd packages/agent-core && npx vitest run
cd packages/shared-utils && npx vitest run
cd packages/agent-memory && npx vitest run
cd packages/agent-prompts && npx vitest run

# ====== Step 3: Run app tests ======
cd apps/desktop && npx vitest run
cd apps/local-daemon && npx vitest run
cd apps/saas-backend && npx vitest run    # after adding vitest

# ====== Step 4: Run with coverage ======
cd packages/agent-core && npx vitest run --coverage

# ====== Step 5: Run in watch mode (development) ======
cd packages/agent-core && npx vitest --watch

# ====== Step 6: Run single test file ======
cd packages/agent-core && npx vitest run src/llm/CostTracker.test.ts
```

### 13.5 TEST SETUP NEEDED (Before Tests Can Run)

For packages that don't have vitest configured yet:

```bash
# For each package that needs test support:
cd packages/<package-name>

# 1. Add vitest to devDependencies
# In package.json add: "vitest": "^2.1.8" to devDependencies
# And "test": "vitest run" to scripts

# 2. Create vitest config (optional, works without it for simple cases)
# vitest.config.ts:
# import { defineConfig } from 'vitest/config';
# export default defineConfig({ test: { globals: true } });

# 3. Install
cd /path/to/monorepo-root && npm install
```

---

## 14. ⭐ BUG → ERROR → FIX Workflow

> **বাগ ধরা থেকে ফিক্স করা পর্যন্ত — step-by-step guide**

### 14.1 Bug Discovery Methods

| # | Method | Command/Tool |
|---|--------|-------------|
| 1 | 🧪 Run tests | `npx vitest run` |
| 2 | 📝 TypeScript check | `npx tsc --noEmit` |
| 3 | 🔍 Lint | `npx eslint .` |
| 4 | 🖥️ Manual test | Run app, click around |
| 5 | 📊 Crash logs | `~/.istiyak_crash_logs/` |
| 6 | 🌐 Sentry | Check Sentry dashboard |
| 7 | 📋 Console | Browser DevTools console |
| 8 | 🔄 Build | `npm run build` |

### 14.2 Bug Classification

| Severity | Icon | Action |
|----------|------|--------|
| 🔴 **CRITICAL** | Security breach, data loss, crash | Fix IMMEDIATELY |
| 🟠 **HIGH** | Feature broken, blocking users | Fix within 24h |
| 🟡 **MEDIUM** | UI glitch, edge case, performance | Fix this sprint |
| 🟢 **LOW** | Cosmetic, typo, improvement | Backlog |

### 14.3 Debug Workflow (Step by Step)

```
STEP 1: REPRODUCE THE BUG
─────────────────────────
• What input causes the bug?
• What is the expected behavior?
• What is the actual behavior?
• Is it consistent or intermittent?
• Which app/package is affected?

STEP 2: LOCATE THE ERROR
─────────────────────────
• Check terminal/console for error messages
• Read the stack trace — which file & line?
• Is it a runtime error or compile-time?
• Check crash logs: ~/.istiyak_crash_logs/

Key locations by symptom:
  ┌─────────────────────────────────────────┐
  │ Symptom          → Check File            │
  │ Chat not working → daemon.js, AgentRunner│
  │ LLM error        → ProviderManager.ts    │
  │ Tool failure     → tools/<category>/     │
  │ Permission deny  → ApprovalManager.ts    │
  │ Auth failure     → authService.ts, auth.ts│
  │ UI broken        → ChatUI.tsx, parser.ts │
  │ Build error      → tsconfig.json, deps   │
  │ Cost wrong       → CostTracker.ts        │
  │ RAG not working  → VectorClient.ts       │
  │ Config issue     → Limits.ts, Settings.ts│
  └─────────────────────────────────────────┘

STEP 3: UNDERSTAND THE ROOT CAUSE
──────────────────────────────────
• Read the code around the error line
• Check recent changes (git log, git diff)
• Check dependencies (npm ls <package>)
• Is it a logic error, type error, or runtime?

STEP 4: WRITE A FAILING TEST
─────────────────────────────
• Create test that reproduces the bug
• Run it → confirm it FAILS
• This test will verify the fix later

  Example:
  test('should not crash on empty input', () => {
    expect(() => myFunction('')).not.toThrow();
  });

STEP 5: FIX THE BUG
────────────────────
• Make the minimal change needed
• Don't refactor unrelated code
• Add defensive checks if needed
• Add error handling if missing

STEP 6: VERIFY THE FIX
───────────────────────
• Run the failing test → now PASSES ✅
• Run ALL tests → no regressions ✅
• TypeScript compile → npx tsc --noEmit ✅
• Lint → npx eslint . ✅
• Manual test → works as expected ✅

STEP 7: DOCUMENT
────────────────
• Update Change Log (Section 17)
• Update test coverage if new tests added
• Git commit with clear message
```

### 14.4 Common Error Patterns & Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `Cannot find module '@istiyak/...'` | Package not built | `npm run build` from root |
| `ECONNREFUSED 127.0.0.1:3001` | Daemon not running | `cd apps/local-daemon && npm run dev` |
| `429 Too Many Requests` | LLM rate limit | Wait 30s, auto-retry built in |
| `JSON parse error in agent response` | LLM returned bad JSON | ResponseParser handles 4 strategies; if still fails, 2 consecutive → wrap as "done" |
| `BUDGET_EXCEEDED` | Session cost >$2 | Reset session, or increase MAX_SESSION_COST_USD |
| `Workspace guard: path outside workspace` | Tool tried to access forbidden path | Ensure all paths are relative to workspace |
| `MongoDB connection failed` | MongoDB not running or wrong URI | Check `MONGODB_URI`, ensure `mongod` is running |
| `Stripe: Invalid API Key` | Wrong or missing STRIPE_SECRET_KEY | Check `.env` file |
| `TypeError: Cannot read property 'X' of undefined` | Missing null check | Add optional chaining (`?.`) |
| `ERR_MODULE_NOT_FOUND` | ESM import without .js extension | Add `.js` extension to imports |

### 14.5 Debug Commands

```bash
# ====== TypeScript Check ======
cd packages/agent-core && npx tsc --noEmit
cd apps/saas-backend && npx tsc --noEmit
cd apps/desktop && npx tsc --noEmit

# ====== Lint Check ======
npm run lint

# ====== Test Single File ======
cd packages/agent-core && npx vitest run src/llm/CostTracker.test.ts

# ====== Check Dependencies ======
npm ls @istiyak/agent-core
npm ls --all | grep -i error

# ====== Check Build ======
npm run build 2>&1 | head -50

# ====== Check Port Usage ======
lsof -i :3001    # Daemon
lsof -i :3002    # SaaS
lsof -i :1420    # Desktop

# ====== Check Crash Logs ======
ls -la ~/.istiyak_crash_logs/
cat ~/.istiyak_crash_logs/latest.json

# ====== Check Usage Logs ======
cat ~/.istiyak_usage.json | head -20

# ====== Git Recent Changes ======
git log --oneline -10
git diff --stat HEAD~1
```

---

## 15. ⭐ Agent Task Instructions

> **এই সেকশন যেকোনো AI Agent Model (free/paid) এর জন্য — যেন পুরো কাজ নিখুঁতভাবে করতে পারে।**

### 15.1 For ANY AI Model — Before Starting Work

```
📋 PRE-FLIGHT CHECKLIST:

1. ✅ Read this UNIFIED_RND_MASTER.md completely
2. ✅ Understand the monorepo structure (Section 2)
3. ✅ Know which app/package you're modifying (Section 4-5)
4. ✅ Know the dependencies (Section 2 → Dependency Graph)
5. ✅ Know the test framework (Section 13 → Vitest)
6. ✅ Know the icon rule: ALWAYS use lucide-react
7. ✅ Know the button style: translucent glass-pill (project rule)
8. ✅ Know the security rules (Section 6.3)
```

### 15.2 Task Execution Protocol

```
STEP 1: UNDERSTAND
  → Read the user's request carefully
  → Identify which module/file is involved
  → Check this RnD for relevant info

STEP 2: PLAN
  → List the files to modify/create
  → List the dependencies
  → List potential risks

STEP 3: IMPLEMENT
  → Read existing code BEFORE writing
  → Follow existing patterns (code style, naming, structure)
  → Use TypeScript where the module uses TypeScript
  → Use JavaScript where the module uses JavaScript
  → Add proper error handling
  → Add defensive null checks

STEP 4: TEST
  → Write tests for new code (see Section 13)
  → Run: npx vitest run
  → Run: npx tsc --noEmit
  → Manual verification if UI changes

STEP 5: VERIFY
  → No TypeScript errors
  → No lint errors
  → All existing tests still pass
  → New tests pass
  → Build succeeds: npm run build

STEP 6: DOCUMENT
  → Update this RnD if architecture changed
  → Update Change Log (Section 17)
```

### 15.3 Critical Rules for AI Agents

```
🔴 NEVER:
  - Use custom SVG paths for icons → use lucide-react
  - Skip reading a file before modifying it
  - Remove existing comments/docstrings
  - Modify security layers without explicit approval
  - Hardcode API keys in source code
  - Use require() in ESM modules (use import)
  - Create files outside the workspace

🟢 ALWAYS:
  - Use lucide-react for ALL icons
  - Use translucent glass-pill buttons (project design)
  - Follow existing code patterns
  - Handle errors gracefully (try/catch)
  - Check null/undefined before accessing properties
  - Use TypeScript strict types where possible
  - Add JSDoc comments for public functions
  - Test your changes
```

### 15.4 File Modification Checklist

```
Before modifying any file:
  [ ] Read the current file content
  [ ] Understand what it does
  [ ] Check imports/exports
  [ ] Check if it's TypeScript (.ts/.tsx) or JavaScript (.js)
  [ ] Check if it uses ESM (import/export) or CJS (require)

After modifying:
  [ ] Verify TypeScript compiles: npx tsc --noEmit
  [ ] Verify existing tests pass: npx vitest run
  [ ] Verify no circular dependencies
  [ ] Verify exports are correct
  [ ] Verify the build works: npm run build
```

### 15.5 Free AI Model Compatibility Notes

> **Free models (Gemini Flash, GPT-4o-mini, DeepSeek Chat, Ollama/Llama) এই ডকুমেন্ট পড়ে কাজ করতে পারবে কারণ:**

1. **Self-contained:** সব info এই একটি file-এ আছে — আলাদা context দিতে হবে না
2. **Structured:** Clear headings, tables, code blocks — যেকোনো model parse করতে পারবে
3. **Step-by-step:** প্রতিটি task-এ clear steps আছে — follow করলেই হবে
4. **Pattern-based:** Existing code patterns documented — copy-paste-modify approach কাজ করবে
5. **Test-first:** Test plan আছে — verification automated
6. **Error recovery:** Common errors ও fixes documented (Section 14.4)

**Model-Specific Tips:**
- **Gemini Flash:** Fast, good for simple tasks. Use for config changes, small fixes.
- **GPT-4o-mini:** Good general coding. Use for feature implementation.
- **DeepSeek Chat:** Very cheap. Use for bulk code generation.
- **Ollama/Llama:** Free, local. Use for sensitive code (no data leaves machine).
- **Any other model:** Read Sections 2, 10, 15 first. Follow the protocol.

---

## 16. Known Issues

| # | Issue | Severity | Location |
|---|-------|----------|----------|
| 1 | Agent-SDK incomplete (skeleton only) | 🟡 | `packages/agent-sdk/` |
| 2 | Database package minimal (no migrations) | 🟡 | `packages/database/` |
| 3 | Very low test coverage (5 test files total) | 🔴 | Everywhere |
| 4 | Hardcoded costs in CostTracker | 🟡 | `CostTracker.ts` |
| 5 | TokenCounter accuracy ~85% | 🟡 | `TokenCounter.ts` |
| 6 | SummaryEngine is extractive (not LLM-based) | 🟢 | `SummaryEngine.ts` |
| 7 | No WebSocket (uses HTTP streaming) | 🟢 | `daemon.js` |
| 8 | SaaS Auth routes 7.7KB (should split) | 🟡 | `routes/auth.ts` |
| 9 | Landing page uses inline styles | 🟡 | `page.tsx` |
| 10 | No CI/CD config | 🟡 | `.github/` |
| 11 | Tauri `select_directory()` fails on Linux | 🟡 | `lib.rs` |
| 12 | Custom provider URL detection fragile | 🟡 | Custom provider |
| 13 | stripeService.ts is a MOCK | 🔴 | `services/stripeService.ts` |
| 14 | Admin page has NO auth | 🔴 | `/admin` route |
| 15 | Admin API has NO auth | 🔴 | `GET /api/admin/users` |
| 16 | Billing POST has NO auth | 🔴 | `POST /api/billing/checkout` |
| 17 | Sandbox create has NO auth | 🔴 | `POST /api/sandbox/create` |
| 18 | No CSRF protection | 🟡 | SaaS backend |
| 19 | Hardcoded `localhost:3002` in admin | 🟡 | Admin page |

---

## 17. Change Log

### Template

```markdown
### [DATE] — [VERSION] — [TITLE]

**Category:** Feature / Bugfix / Refactor / Config / Security / UI / Test
**Files Modified:**
- `path/to/file` — What changed

**Impact:**
- [ ] Changes agent execution flow
- [ ] Changes API endpoints
- [ ] Changes security rules
- [ ] Changes UI
- [ ] Needs `npm install`
- [ ] Needs `npm run build`

**Testing Done:**
What tests were run or manual verification done.
```

---

### 2026-07-03 — v0.1.0 — Unified R&D Created

**Category:** Documentation
**Files Modified:**
- `rnd_my_project/UNIFIED_RND_MASTER.md` — Created unified R&D from 3 separate documents

**Details:** Combined `istiyak_agent_complete_rnd.md`, `istiyak_agent_update_tracker.md`, and `landing_saas_rnd.md` into a single master document with full testing guide, bug fix workflow, and agent task instructions.

---

> **এই ডকুমেন্টটিই SINGLE SOURCE OF TRUTH।**
> পুরানো 3টি RnD file আর use করবেন না।
> নতুন কোনো কিছু করলে এই ডকুমেন্টের Change Log (Section 17) এ entry দিন।
> Test লিখলে Section 13 এ add করুন।

> **যেকোনো AI Agent কে এই ফাইলটি দিন — সে পুরো প্রজেক্ট বুঝে নিখুঁতভাবে কাজ করতে পারবে।**
> **Free models (Gemini Flash, DeepSeek, Ollama) ও কাজ করতে পারবে — Section 15 পড়ুন।**
