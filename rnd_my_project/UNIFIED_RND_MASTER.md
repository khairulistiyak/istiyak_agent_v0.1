# 🧬 Istiyak Agent v0.1 — UNIFIED MASTER R&D

> **Version:** 0.1.2 | **Date:** 2026-07-04 | **Status:** Single Source of Truth
> 
> **Last Audit:** 2026-07-04 15:46 — 15/15 original tasks COMPLETED ✅ | Only testing gaps remain
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
│   ├── local-daemon/     → Express API (port 3001) — agent runner + WebSocket
│   ├── saas-backend/     → Express + MongoDB + Stripe (port 3002) + CSRF + JWT
│   └── landing/          → Next.js marketing site + SEO + Playwright E2E
├── packages/
│   ├── agent-core/       → 🧠 Brain (execution loop, LLM, security, memory) [16 test files, 71+ tests]
│   ├── agent-memory/     → 📚 RAG + vector search + embeddings
│   ├── agent-prompts/    → 📝 System prompts & templates
│   ├── agent-sdk/        → 🔌 Client SDK ✅ COMPLETE (490 lines, WS + HTTP)
│   ├── agent-tools/      → 🔧 Tool interfaces & schemas
│   ├── database/         → 💾 MongoDB/Mongoose models (7 models: User, IpLog, Subscription, ApiKey, UsageLog, Session, PasswordReset, Team)
│   ├── shared-types/     → 📋 TypeScript interfaces
│   └── shared-utils/     → 🛠️ Crypto, Logger, Mask
├── .github/workflows/    → CI/CD (ci.yml + tauri-build.yml)
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
├── server.ts           # Express + CORS + CSRF + Sentry
├── config/passport.js  # OAuth strategies
├── controllers/        # authController, adminController, billingController, sandboxController, updateController
├── middleware/          # auth (JWT), csrf, errorHandler, rateLimiter (30 req/min)
├── repositories/       # userRepository, ipLogRepository
├── routes/             # auth, profile, password, verification, admin, billing, sandbox, update
└── services/           # authService, sandboxService, stripeService (✅ Real SDK), updateService
```

**Completed Features (since v0.1.0):**
- ✅ Real Stripe SDK integration (checkout, portal, cancel, webhooks)
- ✅ CSRF protection middleware (`csrf.ts`)
- ✅ JWT auth on ALL sandbox routes (`router.use(authenticateToken)`)
- ✅ Auth routes split into 4 files (auth, profile, password, verification)
- ✅ Admin metrics endpoint (`getStats()` — totalUsers, proUsers, totalApiKeys)
- ✅ Billing portal (`POST /api/billing/portal`) + cancel (`POST /api/billing/cancel`)
- ✅ Vitest test framework configured (2 test files, 6 tests passing)

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

### 5.4 agent-sdk (🔌 ✅ COMPLETE)

**Path:** `packages/agent-sdk/` | **Lines:** 490 | **Main:** `dist/index.js`

| File | Lines | Purpose |
|------|-------|---------|
| `Client.ts` | 198 | Full SDK client — chat, task, abort, git, RAG, health |
| `Connection.ts` | 176 | WebSocket + HTTP connection layer |
| `types.ts` | 78 | Complete TypeScript type definitions |
| `index.ts` | 3 | Public API exports |
| `test-ws.ts` | 35 | Working test example |

**SDK Methods:** `connect()`, `disconnect()`, `chat()`, `sendTask()`, `isHealthy()`, `getStats()`, `abort()`, `getStatus()`, `runCommand()`, `reindex()`, `getGitStatus()`, `getGitLog()`, `getGitDiff()`

### 5.5 agent-tools (🔧 Interfaces)

`BaseTool.ts`, `ToolContext.ts`, `ToolSchema.ts`

### 5.6 database (💾 MongoDB)

`connectDatabase()` + Mongoose models (8 total):

| Model | File | Purpose |
|-------|------|---------|
| User | `User.js` | User accounts |
| IpLog | `IpLog.js` | Login IP tracking |
| Subscription | `Subscription.js` | Stripe subscription data |
| ApiKey | `ApiKey.js` | API key management |
| UsageLog | `UsageLog.js` | Usage tracking |
| Session | `Session.js` | User sessions |
| PasswordReset | `PasswordReset.js` | Password reset tokens |
| Team | `Team.js` | Team/organization support |

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

## 11. What's Missing — TODO Tracker (Updated 2026-07-04)

> **⚠️ Last Verified:** 2026-07-04 15:46 — All original feature tasks COMPLETED ✅
> **Only testing gaps and CI/CD enhancements remain.**

### ✅ ALL ORIGINAL FEATURES — COMPLETED

| # | Feature | Status | Verified |
|---|---------|:------:|----------|
| 1 | Admin auth guard | ✅ | `requireAdmin` middleware applied |
| 2 | Real Stripe integration | ✅ | `stripeService.ts` uses real Stripe SDK |
| 3 | Stripe webhook handler | ✅ | `webhookController.ts` handles events |
| 4 | License verification API | ✅ | `GET /api/license/check` |
| 5 | Billing API auth | ✅ | JWT protected |
| 6 | Sandbox API auth | ✅ | `router.use(authenticateToken)` on all routes |
| 7 | Login/Register pages | ✅ | `/login`, `/register` |
| 8 | User Dashboard | ✅ | `/dashboard` with stats + charts |
| 9 | User Settings | ✅ | `/settings` |
| 10 | Billing Portal | ✅ | `/billing` + `POST /api/billing/portal` |
| 11 | Privacy Policy | ✅ | `/privacy` |
| 12 | Terms of Service | ✅ | `/terms` |
| 13 | Mobile responsive | ✅ | `globals.css` breakpoints + burger menu |
| 14 | CheckoutButton → Stripe | ✅ | Real Stripe checkout flow |
| 15 | User profile API | ✅ | `userController.ts` |
| 16 | Password reset flow | ✅ | `/reset-password` + `routes/password.ts` |
| 17 | Email verification | ✅ | `/verify-email` + `routes/verification.ts` |
| 18 | Subscription management | ✅ | Upgrade/downgrade/cancel logic |
| 19 | API key management | ✅ | `apiKeyController.ts` + `/api-keys` |
| 20 | Testimonials section | ✅ | In `page.tsx` |
| 21 | Product demo section | ✅ | In `page.tsx` |
| 22 | Comparison table | ✅ | In `page.tsx` |
| 23 | Documentation site | ✅ | `/docs` |
| 24 | Blog/changelog | ✅ | `/blog`, `/changelog` |
| 25 | Contact/support page | ✅ | `/support` |
| 26 | SEO (sitemap, robots, OG) | ✅ | `sitemap.ts`, `robots.txt`, OG tags in `layout.tsx` |
| 27 | Cookie consent | ✅ | `CookieConsent.tsx` |
| 28 | Animated hero | ✅ | `globals.css` keyframes |
| 29 | CSRF protection | ✅ | `middleware/csrf.ts` |
| 30 | Hardcoded localhost fix | ✅ | No `localhost:3002` found in landing |
| 31 | Auth routes split | ✅ | Split into `auth.ts`, `profile.ts`, `password.ts`, `verification.ts` |
| 32 | Team model | ✅ | `packages/database/src/models/Team.js` |
| 33 | Admin metrics endpoint | ✅ | `getStats()` in `adminController.ts` |
| 34 | Agent-SDK completion | ✅ | 490 lines, WS + HTTP, full TypeScript |
| 35 | Status page | ✅ | `/status` |
| 36 | CI/CD pipeline | ✅ | `ci.yml` + `tauri-build.yml` |
| 37 | Database schema (8 models) | ✅ | User, IpLog, Subscription, ApiKey, UsageLog, Session, PasswordReset, Team |

### ❌ REMAINING WORK — Testing Gaps Only

| # | Missing Test File | Location | Priority | Est. |
|---|-------------------|----------|:--------:|------|
| 1 | ApprovalManager.test.ts | `agent-core/src/security/` | 🟡 | 1-2h |
| 2 | ModelManager.test.ts | `agent-core/src/llm/` | 🟡 | 1h |
| 3 | StreamManager.test.ts | `agent-core/src/llm/` | 🟡 | 1h |
| 4 | ProviderManager.test.ts | `agent-core/src/llm/` | 🟡 | 1h |
| 5 | CrashReporter.test.ts | `agent-core/src/telemetry/` | 🟡 | 1h |
| 6 | Logger.test.ts | `agent-core/src/telemetry/` | 🟡 | 30m |
| 7 | Metrics.test.ts | `agent-core/src/telemetry/` | 🟡 | 30m |
| 8 | Tracing.test.ts | `agent-core/src/telemetry/` | 🟡 | 30m |
| 9 | VectorClient.test.ts | `agent-memory/src/__tests__/` | 🟡 | 2h |
| 10 | EmbeddingClient.test.ts | `agent-memory/src/__tests__/` | 🟡 | 1h |
| 11 | SQLiteMemoryStore.test.ts | `agent-memory/src/__tests__/` | 🟡 | 1h |
| 12 | WorkspaceMemoryStore.test.ts | `agent-memory/src/__tests__/` | 🟡 | 1h |
| 13 | billing.test.ts | `saas-backend/src/__tests__/` | 🟡 | 2h |
| 14 | sandbox.test.ts | `saas-backend/src/__tests__/` | 🟡 | 2h |
| 15 | E2E in CI (e2e.yml) | `.github/workflows/` | 🟢 | 1h |
| 16 | Deploy workflows | `.github/workflows/` | 🟢 | 2h |

### 📊 Current Test Coverage (Verified)

```
✅ packages/agent-core/     16 test files, 71+ tests passing
✅ apps/saas-backend/        2 test files, 6 tests passing
✅ apps/landing/             4 Playwright E2E spec files
✅ .github/workflows/        2 CI configs (ci.yml, tauri-build.yml)
❌ packages/agent-memory/    0 test files (needs 4)

TOTAL: 22+ test files, 106+ tests
Coverage: ~75% → Goal: 90%+
```

### ⏱️ Remaining: ~14-21 hours (all testing/CI)

---

## 12. Implementation Roadmap — REMAINING WORK (Updated 2026-07-03)

> **⚠️ এই সেকশনটি আপডেটেড। নিচে শুধু বাকি কাজগুলো আছে — প্রতিটি টাস্কে exact file path, code pattern, এবং verification command দেওয়া আছে।**
> **যেকোনো AI Agent Model (Gemini Flash, GPT-4o-mini, DeepSeek, Claude, Ollama) এই সেকশন পড়ে কাজ করতে পারবে।**

### ✅ ALREADY COMPLETED (Reference Only — DO NOT REDO)

```
Phase 1 (100% Done):
  ✅ Real Stripe SDK integration (stripeService.ts)
  ✅ Stripe webhook handler (webhookController.ts)
  ✅ Admin auth guard (requireAdmin middleware)
  ✅ Billing API auth (JWT protected)
  ✅ License verification API (/api/license/check)
  ✅ Login/Register pages (/login, /register)
  ✅ User profile API (userController.ts)
  ✅ Mobile responsive landing (globals.css breakpoints + burger menu)
  ✅ Privacy + Terms pages (/privacy, /terms)

Phase 2 (78% Done):
  ✅ Dashboard page (/dashboard) with stats + charts
  ✅ Billing portal page (/billing)
  ✅ Settings page (/settings)
  ✅ API key management (apiKeyController.ts + /api-keys page)
  ✅ Password reset flow (/reset-password + auth routes)
  ✅ Email verification (/verify-email + auth routes)
  ✅ Database schema expansion (7 models: User, IpLog, Subscription, ApiKey, UsageLog, Session, PasswordReset)

Phase 3 (70% Done):
  ✅ Comparison table (in page.tsx)
  ✅ Documentation site (/docs)
  ✅ Blog/changelog (/blog, /changelog)
  ✅ Animated hero (globals.css keyframes)
  ✅ Cookie consent (CookieConsent.tsx)
  ✅ Admin panel JWT auth fix
  ✅ Contact/support page (/support)
  ✅ Status page (/status)
```

---

### 🔴 TASK 1: Sandbox API Auth Guard (Priority: CRITICAL | Est: 15 min)

**Problem:** `POST /api/sandbox/create` and `POST /api/sandbox/delete` have NO authentication. Anyone can create/delete sandboxes.

**File:** `apps/saas-backend/src/routes/sandbox.ts` (13 lines)

**Current Code (BROKEN):**
```typescript
router.post("/create", createSandbox);           // ❌ NO AUTH
router.post("/delete", deleteSandbox);            // ❌ NO AUTH
router.post("/execute", authenticateToken, executeSandboxCommand); // ✅ Has auth
```

**Fix — Replace file content with:**
```typescript
import express from "express";
import { createSandbox, deleteSandbox, executeSandboxCommand } from "../controllers/sandboxController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// Apply JWT authentication to ALL sandbox routes
router.use(authenticateToken);

router.post("/create", createSandbox);
router.post("/delete", deleteSandbox);
router.post("/execute", executeSandboxCommand);

export default router;
```

**Verify:**
```bash
cd apps/saas-backend && npx tsc --noEmit
```

---

### 🔴 TASK 2: Stripe Customer Portal API (Priority: HIGH | Est: 30 min)

**Problem:** Users cannot manage their subscription (cancel, update payment method) via Stripe Customer Portal. The `/api/billing/portal` endpoint is missing.

**File to MODIFY:** `apps/saas-backend/src/routes/billing.ts`

**Pattern to follow — look at existing `createCheckout` function in `billingController.ts`.**

**Step 1:** Add to `apps/saas-backend/src/services/stripeService.ts` (APPEND after the `createStripeCheckoutSession` function, BEFORE `export { stripe }`):

```typescript
export async function createStripePortalSession(userId: string, returnUrl?: string) {
  if (!STRIPE_SECRET_KEY) {
    throw new Error("Stripe integration is not configured on the server.");
  }

  const user = await User.findById(userId);
  if (!user || !user.stripeCustomerId) {
    throw new Error("No Stripe customer found for this user. Subscribe first.");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: returnUrl || "http://localhost:3000/billing",
  });

  return { url: session.url };
}
```

**Step 2:** Add route to `apps/saas-backend/src/routes/billing.ts` (APPEND after `router.post("/checkout", createCheckout);`):

```typescript
import { createStripePortalSession } from "../services/stripeService.js";

router.post("/portal", async (req: any, res, next) => {
  try {
    const userId = req.user._id.toString();
    const { returnUrl } = req.body;
    const session = await createStripePortalSession(userId, returnUrl);
    return res.status(200).json({ url: session.url });
  } catch (err) {
    next(err);
  }
});
```

**Verify:**
```bash
cd apps/saas-backend && npx tsc --noEmit
```

---

### 🔴 TASK 3: Subscription Cancel API (Priority: HIGH | Est: 20 min)

**Problem:** Users cannot cancel their subscription from the dashboard. Need a `/api/billing/cancel` endpoint.

**File to MODIFY:** `apps/saas-backend/src/routes/billing.ts`

**APPEND this route:**

```typescript
router.post("/cancel", async (req: any, res, next) => {
  try {
    const userId = req.user._id;
    const subscription = await Subscription.findOne({ userId, status: "active", plan: "pro" });

    if (!subscription || !subscription.stripeSubscriptionId) {
      return res.status(400).json({ error: "No active Pro subscription found." });
    }

    // Cancel at period end (user keeps access until current period ends)
    const { stripe } = await import("../services/stripeService.js");
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    subscription.status = "canceling";
    await subscription.save();

    return res.status(200).json({
      status: "success",
      message: "Subscription will be cancelled at the end of the current billing period.",
    });
  } catch (err) {
    next(err);
  }
});
```

**Verify:**
```bash
cd apps/saas-backend && npx tsc --noEmit
```

---

### 🟡 TASK 4: Admin Metrics Endpoint (Priority: MEDIUM | Est: 30 min)

**Problem:** `GET /api/admin/metrics` is missing. The admin page needs server-side aggregated metrics.

**File to MODIFY:** `apps/saas-backend/src/controllers/adminController.ts`

**Replace entire file with (keeping existing pattern):**

```typescript
import { Request, Response, NextFunction } from "express";
import { User, Subscription, UsageLog, ApiKey } from "@istiyak/database";

export async function getStats(req: Request, res: Response, next: NextFunction) {
  try {
    const totalUsers = await User.countDocuments();
    const proUsers = await Subscription.countDocuments({ plan: "pro", status: "active" });
    const totalApiKeys = await ApiKey.countDocuments();

    return res.status(200).json({
      status: "success",
      totalUsers,
      proUsers,
      freeUsers: totalUsers - proUsers,
      totalApiKeys,
      uptimeSec: Math.floor(process.uptime()),
    });
  } catch (err) {
    next(err);
  }
}
```

**IMPORTANT:** Make sure `@istiyak/database` exports `Subscription`, `UsageLog`, `ApiKey`. Check `packages/database/src/index.js` — if these models are NOT exported, add them:

```javascript
// In packages/database/src/index.js — ADD these exports if missing:
export { default as Subscription } from "./models/Subscription.js";
export { default as UsageLog } from "./models/UsageLog.js";
export { default as ApiKey } from "./models/ApiKey.js";
```

**Verify:**
```bash
cd packages/database && npm run build
cd apps/saas-backend && npx tsc --noEmit
```

---

### 🟡 TASK 5: SEO — sitemap.xml + robots.txt + OG Tags (Priority: MEDIUM | Est: 45 min)

**Problem:** No SEO files exist. Google cannot crawl or index the site properly.

**Step 1:** Create `apps/landing/public/robots.txt`:
```
User-agent: *
Allow: /
Sitemap: https://istiyak.ai/sitemap.xml

Disallow: /admin
Disallow: /dashboard
Disallow: /settings
Disallow: /api-keys
Disallow: /billing
```

**Step 2:** Create `apps/landing/app/sitemap.ts` (Next.js App Router auto-generates sitemap.xml):
```typescript
import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://istiyak.ai";
  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/docs`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/changelog`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/support`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/status`, lastModified: new Date(), changeFrequency: "always", priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${baseUrl}/register`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
  ];
}
```

**Step 3:** Update `apps/landing/app/layout.tsx` — add Open Graph meta tags in the `metadata` export:
```typescript
export const metadata = {
  title: "ISTIYAK AI Companion — Floating Autonomous AI Software Engineer",
  description: "A lightning-fast, floating desktop AI software engineer that lives alongside your editor and writes, debugs, and runs code autonomously.",
  openGraph: {
    title: "ISTIYAK AI Companion",
    description: "Autonomous AI coding assistant for developers. Free tier + Pro plan.",
    url: "https://istiyak.ai",
    siteName: "ISTIYAK AI Companion",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "ISTIYAK AI Companion",
    description: "Autonomous AI coding assistant for developers.",
  },
  robots: {
    index: true,
    follow: true,
  },
};
```

**Verify:**
```bash
cd apps/landing && npx next build
# Check output: sitemap route should appear in route list
```

---

### 🟡 TASK 6: Hardcoded localhost:3002 → Environment Variable (Priority: MEDIUM | Est: 30 min)

**Problem:** All frontend pages use hardcoded `http://localhost:3002` for API calls. This breaks in production.

**Fix:** Create a shared config constant.

**Step 1:** Create `apps/landing/lib/config.ts`:
```typescript
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";
```

**Step 2:** In EVERY page that uses `fetch("http://localhost:3002/...")`, replace with:
```typescript
import { API_BASE_URL } from "../../lib/config"; // adjust relative path

// Before:
fetch("http://localhost:3002/api/auth/login", ...)
// After:
fetch(`${API_BASE_URL}/api/auth/login`, ...)
```

**Files to update (grep for `localhost:3002`):**
```bash
grep -r "localhost:3002" apps/landing/app/ --include="*.tsx" -l
```
Likely files: `login/page.tsx`, `register/page.tsx`, `dashboard/page.tsx`, `admin/page.tsx`, `settings/page.tsx`, `billing/page.tsx`, `api-keys/page.tsx`, `status/page.tsx`

**Step 3:** Add to `apps/landing/.env.local` (for development):
```
NEXT_PUBLIC_API_URL=http://localhost:3002
```

**Verify:**
```bash
cd apps/landing && npx next build
```

---

### 🟡 TASK 7: Team Model (Priority: LOW | Est: 20 min)

**Problem:** RnD specifies a `Team` model for future organization support. Not yet created.

**File to CREATE:** `packages/database/src/models/Team.js`

**Follow existing pattern (look at `User.js`):**
```javascript
import mongoose from "mongoose";

const TeamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  members: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    role: { type: String, enum: ["owner", "admin", "member"], default: "member" },
    joinedAt: { type: Date, default: Date.now },
  }],
  plan: { type: String, enum: ["free", "team_pro"], default: "free" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Team", TeamSchema);
```

**Then export from `packages/database/src/index.js`:**
```javascript
export { default as Team } from "./models/Team.js";
```

**Verify:**
```bash
cd packages/database && npm run build
```

---

### 🟡 TASK 8: Landing Page — Testimonials + Demo Sections (Priority: LOW | Est: 2h)

**Problem:** RnD specifies testimonials and product demo sections. Not yet created.

**File to MODIFY:** `apps/landing/app/page.tsx`

**Pattern:** Follow the existing section structure in `page.tsx`. Each section is a `<section>` with:
- Background: `rgba(18, 20, 28, 0.6)` with `backdropFilter: "blur(16px)"`
- Border: `1px solid rgba(255, 255, 255, 0.05)`
- Border radius: `20px`
- Font: `Outfit` for headings, `Inter` for body
- Accent color: `#06b6d4` (cyan)
- Icons: MUST use `lucide-react`

**Add AFTER the features section, BEFORE the pricing section.**

**Verify:**
```bash
cd apps/landing && npx next build
```

---

### 🟡 TASK 9: Auth Routes Split (Priority: LOW | Est: 30 min)

**Problem:** `apps/saas-backend/src/routes/auth.ts` is 11.8KB / ~300+ lines. Should be split for maintainability.

**Split into:**
1. `routes/auth.ts` — login, register, logout (core auth)
2. `routes/profile.ts` — GET/PUT profile, change password
3. `routes/password.ts` — forgot-password, reset-password
4. `routes/verification.ts` — verify-email, resend-verification

**Then mount each in `server.ts`:**
```typescript
app.use("/api/auth", authRoutes);
app.use("/api/auth", profileRoutes);
app.use("/api/auth", passwordRoutes);
app.use("/api/auth", verificationRoutes);
```

**Verify:**
```bash
cd apps/saas-backend && npx tsc --noEmit
```

---

### 🔴 TASK 10: Unit Tests — Security Module (Priority: HIGH | Est: 3h)

> **⚠️ সবচেয়ে বড় ব্যাকলগ। প্রোডাকশনে যাওয়ার আগে এই টেস্টগুলো MUST।**

**Test Framework:** Vitest (already installed in agent-core)

**Files to CREATE:**

#### 10a: `packages/agent-core/src/security/SecretMasker.test.ts`
```typescript
import { describe, it, expect } from "vitest";
import { SecretMasker } from "./SecretMasker.js";

describe("SecretMasker", () => {
  it("masks OpenAI key (sk-*)", () => {
    const text = "key is sk-1234567890abcdefghij1234567890abcdefghij1234";
    const masked = SecretMasker.mask(text);
    expect(masked).not.toContain("sk-1234567890abcdefghij1234567890abcdefghij1234");
    expect(masked).toContain("sk-1");  // first 4 kept
  });

  it("masks Google key (AIza*)", () => {
    const text = "AIzaSyABCDEF1234567890abcdef_GHIJ";
    const masked = SecretMasker.mask(text);
    expect(masked).not.toContain("AIzaSyABCDEF1234567890abcdef_GHIJ");
  });

  it("handles text with no secrets", () => {
    const text = "Hello world, no secrets here.";
    const masked = SecretMasker.mask(text);
    expect(masked).toBe(text);
  });

  it("handles empty string", () => {
    expect(SecretMasker.mask("")).toBe("");
  });
});
```

**⚠️ BEFORE writing the test:** Read the actual `SecretMasker.ts` file first to check the exact method names and signatures:
```bash
cat packages/agent-core/src/security/SecretMasker.ts | head -30
```

#### 10b: `packages/agent-core/src/security/WorkspaceGuard.test.ts`
```
Pattern: Test that paths inside workspace are allowed, paths outside are blocked.
Read WorkspaceGuard.ts first to check method signatures.
```

#### 10c: `packages/agent-core/src/security/PermissionManager.test.ts`
```
Pattern: Test that dangerous commands (rm -rf, sudo, fork bombs) are blocked.
Read PermissionManager.ts first to check method signatures.
```

**Run command:**
```bash
cd packages/agent-core && npx vitest run src/security/
```

---

### 🟡 TASK 11: Unit Tests — LLM Module (Priority: MEDIUM | Est: 2h)

**Files to CREATE:**

#### 11a: `packages/agent-core/src/llm/TokenCounter.test.ts`
```
Read TokenCounter.ts first. Test:
- countTokens("hello world") returns positive number
- countTokens("") returns 0
- countTokens(code with special chars) returns reasonable count
```

#### 11b: `packages/agent-core/src/llm/ResponseParser.test.ts`
```
Read ResponseParser.ts first. Test:
- Valid JSON parses correctly
- JSON wrapped in ```json ``` fences parses correctly
- Returns null for garbage input
- Handles trailing commas
```

**Run command:**
```bash
cd packages/agent-core && npx vitest run src/llm/
```

---

### 🟡 TASK 12: Unit Tests — Remaining Modules (Priority: MEDIUM | Est: 6h)

**Modules that need test files (read each .ts file BEFORE writing tests):**

| Test File to Create | Source File to Read First | Key Tests |
|---------------------|--------------------------|-----------|
| `src/agent/TaskClassifier.test.ts` | `src/agent/TaskClassifier.ts` | "hello" → chat, "refactor auth" → complex |
| `src/agent/ContextBuilder.test.ts` | `src/agent/ContextBuilder.ts` | Token limits, truncation, message preservation |
| `src/memory/SessionMemory.test.ts` | `src/memory/SessionMemory.ts` | Add/retrieve messages, auto-compress |
| `src/memory/SummaryEngine.test.ts` | `src/memory/SummaryEngine.ts` | Summarize text, empty input |
| `src/events/EventBus.test.ts` | `src/events/EventBus.ts` | Emit/receive, wildcard, history |
| `src/telemetry/UsageTracker.test.ts` | `src/telemetry/UsageTracker.ts` | Record usage, daily aggregation |
| `src/config/Models.test.ts` | `src/config/Models.ts` | All models have provider, getModelsForProvider |
| `src/config/Providers.test.ts` | `src/config/Providers.ts` | All 7 providers, getProvider() |

**Run command:**
```bash
cd packages/agent-core && npx vitest run
```

---

### 🟢 TASK 13: Integration Tests — SaaS Backend (Priority: LOW | Est: 4h)

**Setup needed first:**
```bash
cd apps/saas-backend
# Add vitest to package.json devDependencies: "vitest": "^2.1.8"
# Add "test": "vitest run" to scripts
npm install
```

**Files to CREATE:**

#### 13a: `apps/saas-backend/src/__tests__/auth.test.ts`
```
Use supertest to test:
- POST /api/auth/register → 201
- POST /api/auth/register duplicate → 409
- POST /api/auth/login valid → 200 + JWT
- POST /api/auth/login wrong password → 401
```

#### 13b: `apps/saas-backend/src/__tests__/admin.test.ts`
```
- GET /api/admin/users without token → 401
- GET /api/admin/users with non-admin token → 403
```

**Run command:**
```bash
cd apps/saas-backend && npx vitest run
```

---

### 🟢 TASK 14: E2E Tests — Playwright (Priority: LOW | Est: 8h)

**Setup:**
```bash
cd /path/to/monorepo-root
npm install -D @playwright/test
npx playwright install
```

**Create `tests/e2e/landing.spec.ts`:**
```typescript
import { test, expect } from "@playwright/test";

test("landing page loads", async ({ page }) => {
  await page.goto("http://localhost:3000");
  await expect(page.locator("h1")).toContainText("ISTIYAK");
});

test("pricing shows correct prices", async ({ page }) => {
  await page.goto("http://localhost:3000");
  await expect(page.getByText("$0")).toBeVisible();
  await expect(page.getByText("$19")).toBeVisible();
});
```

**Run:** `npx playwright test`

---

### ✅ TASK 15: Agent-SDK Completion (Priority: LOW | Est: 8-12h) — **COMPLETED**

**Status:** ✅ Completed on 2026-07-04

**Implementation Summary:**
1. ✅ WebSocket client connection to daemon (port 3001) — `Connection.ts`
2. ✅ Chat message sending/receiving via WebSocket — `Client.ts:chat()`
3. ✅ Permission request handling with callbacks — `onPermissionRequest` handler
4. ✅ Session management (connect/disconnect) — `Client.ts:connect()/disconnect()`
5. ✅ TypeScript types for all SDK methods — `types.ts` + full type safety

**Files Implemented:**
- `packages/agent-sdk/src/Client.ts` (197 lines) — Main SDK client with all methods
- `packages/agent-sdk/src/Connection.ts` (175 lines) — WebSocket + HTTP connection layer
- `packages/agent-sdk/src/types.ts` (75 lines) — Complete TypeScript type definitions
- `packages/agent-sdk/src/index.ts` — Exports Client, Connection, and all types
- `packages/agent-sdk/src/test-ws.ts` — Working test example
- `packages/agent-sdk/README.md` — Comprehensive documentation with examples

**SDK Methods Available:**
- `connect()` / `disconnect()` — WebSocket lifecycle
- `chat(options)` — Stream chat with permission handling
- `sendTask(task)` — Simple task execution
- `isHealthy()` — Health check
- `getStats()` — Telemetry stats
- `abort()` / `getStatus()` — Agent control
- `runCommand()` — Shell execution
- `reindex()` — RAG reindexing
- `getGitStatus()` / `getGitLog()` / `getGitDiff()` — Git operations

**Build Status:** ✅ Compiles successfully with TypeScript strict mode

**Pattern:** Follows daemon API routes (Section 4.2) and WebSocket protocol from `apps/local-daemon/src/daemon.js:300-460`

---

### 📋 PRIORITY EXECUTION ORDER

```
🔴 IMMEDIATE (do first):
  1. TASK 1  — Sandbox auth guard (15 min)
  2. TASK 2  — Stripe Customer Portal (30 min)
  3. TASK 3  — Subscription Cancel API (20 min)

🟡 NEXT (do second):
  4. TASK 5  — SEO sitemap + robots + OG (45 min)
  5. TASK 6  — Hardcoded localhost fix (30 min)
  6. TASK 4  — Admin metrics endpoint (30 min)
  7. TASK 10 — Security unit tests (3h)

🟢 LATER (do when time allows):
  8. TASK 11 — LLM unit tests (2h)
  9. TASK 12 — Remaining unit tests (6h)
  10. TASK 7  — Team model (20 min)
  11. TASK 8  — Testimonials + demo (2h)
  12. TASK 9  — Auth routes split (30 min)
  13. TASK 13 — Integration tests (4h)
  14. TASK 14 — E2E Playwright (8h)
  15. TASK 15 — Agent-SDK (8-12h)
```

### ⏱️ TOTAL REMAINING: ~35-45 hours (excluding Agent-SDK)

### 🔧 VERIFICATION AFTER ALL TASKS

```bash
# 1. TypeScript compile check (all apps)
cd apps/saas-backend && npx tsc --noEmit
cd apps/landing && npx tsc --noEmit

# 2. Build check
npm run build

# 3. Test check
npm run test

# 4. Landing build (includes sitemap generation)
cd apps/landing && npx next build

# 5. Lint check
npm run lint
```



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
| 1 | ~~Agent-SDK incomplete (skeleton only)~~ **FIXED** | ✅ | `packages/agent-sdk/` |
| 2 | Database package minimal (no migrations) | 🟡 | `packages/database/` |
| 3 | Very low test coverage (5 test files total) | 🔴 | Everywhere |
| 4 | Hardcoded costs in CostTracker | 🟡 | `CostTracker.ts` |
| 5 | TokenCounter accuracy ~85% | 🟡 | `TokenCounter.ts` |
| 6 | SummaryEngine is extractive (not LLM-based) | 🟢 | `SummaryEngine.ts` |
| 7 | ~~No WebSocket (uses HTTP streaming)~~ **FIXED** | ✅ | `daemon.js:300-460` |
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

### 2026-07-04 — v0.1.1 — Agent-SDK Implementation Complete

**Category:** Feature
**Files Modified:**
- `packages/agent-sdk/src/Client.ts` — Implemented full SDK client (197 lines)
- `packages/agent-sdk/src/Connection.ts` — WebSocket + HTTP connection layer (175 lines)
- `packages/agent-sdk/src/types.ts` — Complete TypeScript type definitions (75 lines)
- `packages/agent-sdk/src/index.ts` — Export all public APIs
- `packages/agent-sdk/src/test-ws.ts` — Fixed TypeScript errors, added proper types
- `packages/agent-sdk/README.md` — Comprehensive documentation with examples

**Impact:**
- [x] Completes TASK 15 (Agent-SDK)
- [x] WebSocket bidirectional communication with daemon
- [x] Permission request handling via callbacks
- [x] Session management (connect/disconnect)
- [x] Full TypeScript type safety
- [x] Needs `npm run build` (already verified)

**Testing Done:**
- TypeScript compilation: ✅ `npx tsc` passes
- Build output verified: ✅ dist/ contains all .js/.d.ts files
- Test script compiles: ✅ `test-ws.ts` has proper types

**SDK Methods Implemented:**
- `connect()` / `disconnect()` — WebSocket lifecycle
- `chat(options)` — Stream chat with permission handling
- `sendTask(task)` — Simple task execution
- `isHealthy()` — Health check
- `getStats()` — Telemetry stats
- `abort()` / `getStatus()` — Agent control
- `runCommand()` — Shell execution
- `reindex()` — RAG reindexing
- `getGitStatus()` / `getGitLog()` / `getGitDiff()` — Git operations

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
