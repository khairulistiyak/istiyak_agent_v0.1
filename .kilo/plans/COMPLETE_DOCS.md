# COMPLETE_DOCS.md — Istiyak AI Companion

## Full Architecture Documentation

**Generated:** 2026-07-02  
**Scope:** Complete monorepo (530 source files, 12 apps+packages)

---

## 1. Project Overview

Istiyak AI Companion is a multi-architecture monorepo delivering an autonomous AI software engineering agent via a Tauri desktop app. The system comprises 4 deployable applications and 8 shared packages orchestrated by Turborepo.

**Tech Stack:** TypeScript (primary), Rust (Tauri bridge), React 18 + Vite (desktop UI), Express.js (backend), Next.js 14 (landing), MongoDB (data), Monaco Editor (IDE view, removed in latest build).

---

## 2. Monorepo Topology

```
istiyak_agent_v0.1/
├── apps/
│   ├── desktop/          [Tauri 2 + React 18 + Vite 7 + Tailwind CSS]
│   ├── landing/          [Next.js 14 + App Router + lucide-react]
│   ├── local-daemon/     [Express.js + Agent Core (plain JS)]
│   └── saas-backend/     [Express.js + Mongoose + Passport]
├── packages/
│   ├── agent-core/       [Event-driven agent loop: LLM, memory, tools, security, telemetry]
│   ├── agent-memory/     [RAG vector search (TF-IDF/cosine), session memory, workspace memory]
│   ├── agent-prompts/    [Template library for System/Planning/Reflection/Summary prompts]
│   ├── agent-sdk/        [HTTP client SDK to programmatically control the agent]
│   ├── agent-tools/      [Plugin-based tool system: BaseTool, ToolRegistry, schema validation]
│   ├── database/         [Mongoose User/IpLog models]
│   ├── shared-types/     [Message, AgentResponse, LocalConfig interfaces]
│   └── shared-utils/     [Logger, SecretMasker, encrypt/decrypt, helpers]
├── turbo.json            [Turborepo pipeline: build/lint/test/dev]
└── package.json          [Workspace root — npm workspaces, turbo scripts]
```

---

## 3. Application Layer Breakdown

### 3.1 Desktop App (`apps/desktop`)

**Purpose:** Tauri 2 desktop window (floating, transparent, always-on-top) providing Chat-first Agent UI.

**Entry Point:** `main.tsx` → `App.tsx` → `ChatUI.tsx`

**State Management (Zustand):**
- `store/index.ts` — Global combined store with IndexedDB persistence via custom storage backend
- `store/chatSlice.ts` — Conversations array, activeId, CRUD operations, auto-title generation
- `store/settingsSlice.ts` — Provider config (LLM provider, API key, model), workspace path, extensions. Debounced save via Rust JSON config file or localStorage/sessionStorage split.
- `store/uiSlice.ts` — Sidebar toggle, permission/telemetry/marketplace modal toggles

**Component Hierarchy:**
```
App
└── ChatUI [orchestrator: polls daemon, manages chat, workspace, permissions, modals]
    ├── TitleBar [traffic lights, status indicator, auth/settings/history buttons]
    ├── [WorkspaceBar] [compact bar: IDE name + folder + change dropdown]
    ├── [3-column layout]
    │   ├── Left sidebar [mode selector (chat/plan/assist/agent), workspace display]
    │   ├── Main [ChatPanel]
    │   │   ├── MessageList [WelcomeScreen → messages, auto-scroll, parse cache]
    │   │   │   ├── UserMessage [MessageBubble — markdown rendered]
    │   │   │   └── AssistantMessage [step cards + permission cards + markdown + cost]
    │   │   │       ├── FileSearchCard, FileReadCard, DiffCard, CommandCard
    │   │   │       ├── GitStatusCard, WebSearchCard, MemoryCard, SessionWalkthroughCard
    │   │   │       ├── PlanningCard [JSON-structured plans]
    │   │   │       ├── PermissionCard [approve/reject/timed_out states]
    │   │   │       └── CostBadge [$cost, tokens in/out]
    │   │   └── ChatInputBar [textarea, send/abort, mode-based placeholder, prompt selector]
    │   └── Right sidebar [permission policy per mode]
    ├── HistoryDrawer [conversation list, new/delete]
    ├── SettingsDrawer [provider config, sandbox, telemetry, marketplace, workspace TODOs]
    ├── AuthModal [login/register, OAuth polling, Stripe checkout]
    ├── MarketplaceModal [themes, prompts, extensions]
    └── TelemetryModal [call count, latency, cost, provider rates]
```

**Chat/Settings Stores (Aliases):**
- `chatStore.ts` → exports `useGlobalStore as useChatStore` + `Message, Conversation` types
- `settingsStore.ts` → exports `useGlobalStore as useSettingsStore`

**Custom Hooks:**
| Hook | Description |
|------|-------------|
| `usePolling` | 8s health check + git/todo/telemetry polling with AbortController timeout |
| `usePermissions` | Permission state tracking, API approval submission, 5-min timeout |
| `useWorkspaceDetect` | IDE workspace auto-detection via Tauri IPC, 120s polling, manual folder fallback |
| `useIdeMode` | DELETED — IDE mode hook |
| `useGitStatus` | Stub — always returns 'main' |
| `useTelemetry` | Mock — fake random telemetry values, unused |
| `useTauriWindow` | Stub — logs initialization |

**UI Components (`components/ui/`):**
- `Button`, `Input`, `Modal`, `Dropdown`, `Toggle`, `Tooltip` — reusable cyber-themed UI kit
- `ErrorBoundary` — class-based React error boundary
- `FileCapsule` — file path badge with 30+ extension colors
- `FileIcon` — DELETED (was used by FileTree)

**Rust Backend (`src-tauri/src/lib.rs`):**
- **Tauri Commands (11):** `greet`, `load_config`, `save_config`, `get_env_var`, `read_file`, `write_file`, `scan_project`, `select_directory`, `select_file`, `detect_ide_workspaces`
- **Config:** `load_config/save_config` read/write `~/.istiyak_agent_config.json` (plaintext JSON, no encryption). Migrates from `.env` on first run.
- **Filesystem:** `read_file/write_file` — **NO PATH RESTRICTIONS** — any file accessible by user can be read/written. `scan_project` walks directories ignoring `node_modules/.git/dist/target/.next/build`.
- **Dialogs:** `select_directory` (osascript/powershell), `select_file` (macOS/windows).
- **IDE Detection:** `detect_ide_workspaces` — reads `workspaceStorage/*/workspace.json` for VS Code/Cursor across macOS/Windows/Linux. Detects running IDEs via `pgrep -f` (macOS/Linux).
- **Security:** `csp: null` (no Content Security Policy), `alwaysOnTop: true`, `transparent: true`, `decorations: false`.

---

### 3.2 Local Daemon (`apps/local-daemon`)

**Purpose:** Local Express server (port 3001) that executes agent tasks, manages file watcher, handles permissions.

**Language:** Plain JavaScript (no TypeScript config — inconsistent with rest of monorepo).

**Entry Point:** `src/index.js` → `startDaemon()` or `startTerminalMode()`

**Routes:**

| Route | Method | Handler | Description |
|-------|--------|---------|-------------|
| `/api/health` | GET | inline | Returns `{status:"ok"}` |
| `/api/chat` | POST | inline | Stream agent response. Aborts previous run. Propagates `agentMode` mode enforcement. 5-min permission timeout. |
| `/api/agent/approve` | POST | `routes/agent.js` | Resolves pending permission by requestId |
| `/api/agent/abort` | POST | inline | Aborts current agent execution |
| `/api/agent/status` | GET | inline | Returns `{running: bool}` |
| `/api/run-command` | POST | `routes/command.js` | Executes shell command via `ToolRegistry.execute` |
| `/api/git/status` | GET | `routes/git.js` | Branch name extraction |
| `/api/git/log` | GET | `routes/git.js` | Commit log with count param |
| `/api/git/diff` | GET | `routes/git.js` | Unstaged diff |
| `/api/rag/reindex` | POST | `routes/rag.js` | Triggers workspace reindex |
| `/api/watcher/start` | POST | `routes/watcher.js` | Start file watcher |
| `/api/watcher/stop` | POST | `routes/watcher.js` | Stop file watcher |
| `/api/watcher/todos` | GET | `routes/watcher.js` | Get all TODO items |
| `/api/watcher/locks` | GET | `routes/watcher.js` | Get current file locks |
| `/api/oauth-callback` | POST | `routes/watcher.js` | Writes OAuth token to config file |
| `/api/telemetry/stats` | GET | inline | Calls `getStats()` from agent-core |

**File Watcher (`src/watcher/watcher.js`):**
- Recursive directory scan (max 5000 files, 1MB per file)
- TODO regex: `// TODO: text`, `# TODO: text`, `/* TODO: text */`
- Debounced (3s) callback on new TODO detection
- File locking system (owner-based) for agent operations
- Auto `.gitignore` security guard (appends `credentials/`, `*.json`, `.env` entries)
- Platform-dependent `fs.watch` with `{recursive: true}`

**Auto-Pilot:** `daemon.js:onTodoFound` — When a TODO is detected, runs the agent in background with `requestPermission: () => Promise.resolve(true)` (auto-approves ALL actions).

---

### 3.3 SaaS Backend (`apps/saas-backend`)

**Purpose:** Cloud Express API (port 3002) for auth, billing, admin, updates.

**Entry Point:** `src/server.ts` → connect MongoDB → initPassport → mount routes → listen

**Middlewares:** CORS (allows all localhost origins), JSON body (50mb limit), Sentry (conditional)

**Routes:**

| Route | Auth | Handler | Description |
|-------|------|---------|-------------|
| POST `/auth/register` | None | `authController.handleRegister` | Email+password registration, IP logging, JWT |
| POST `/auth/login` | None | `authController.handleLogin` | Password verification, JWT |
| GET `/auth/provider` | None | inline | Returns OAuth provider status |
| GET `/auth/google` | None | Passport | Google OAuth redirect |
| GET `/auth/google/callback` | None | Passport + inline | OAuth callback → render JS forwarding token to daemon |
| GET `/auth/github` | None | Passport | GitHub OAuth redirect |
| GET `/auth/github/callback` | None | Passport + inline | OAuth callback |
| POST `/auth/google/callback` | None | inline | (Duplicate — also GET) |
| GET `/admin/users` | NONE | `adminController.getStats` | **NO AUTH — Anyone can access** |
| POST `/billing/checkout` | NONE | `billingController.createCheckout` | **NO AUTH — Stripe stub** |
| POST `/sandbox/create` | NONE | `sandboxController.createSandbox` | **NO AUTH — Docker stub** |
| POST `/sandbox/:id/delete` | NONE | `sandboxController.deleteSandbox` | **NO AUTH** |
| POST `/sandbox/:id/execute` | JWT | `sandboxController.executeSandboxCommand` | **Command injection risk** |
| GET `/update/check/:target/:currentVersion` | None | `updateController.checkUpdate` | Hardcoded version check |

**Controllers → Services → Repositories Pattern:**

```
authController → authService (JWT, bcrypt, IP limit) → userRepository + ipLogRepository (Mongoose)
billingController → stripeService (STUB — hardcoded 'cs_test_session_id')
sandboxController → sandboxService (STUB — no actual Docker; has command injection)
updateController → updateService (STUB — hardcoded version map)
adminController → (STUB — hardcoded stats)
```

**AuthService Flow:**
1. `registerUser`: Find existing → check IP limit (3 per IP) → bcrypt hash → create user → log IP → sign JWT (7d expiry) → return
2. `loginUser`: Find user → bcrypt.compare → check isBlocked → log IP → sign JWT → return

**OAuth Flow (Google/GitHub):**
1. User clicks OAuth button → redirects to provider
2. Callback hits Passport strategy → creates user if new (random password via Math.random!)
3. Renders success HTML page with inline `<script>` that `fetch`es token to `localhost:3001/api/oauth-callback`
4. Daemon writes token to `~/.istiyak_agent_config.json`

**CRITICAL SECURITY:** The admin endpoint at `/api/admin/users` has NO authentication middleware. Any request gets hardcoded stats. The Stripe, sandbox create/delete endpoints also lack auth.

---

### 3.4 Landing Page (`apps/landing`)

**Purpose:** Next.js 14 App Router marketing site with pricing, download, admin panel.

**Pages:** `/` (home), `/admin` (dashboard), `/cancel` (Stripe cancel), `/success` (payment success)

**Components:** `Hero`, `Features` (4-column grid), `CheckoutButton` (no onClick — does nothing)

**Admin Page Issues:**
- Fetches `http://localhost:3002/api/admin/users` (no auth)
- Block/unblock calls to **NONEXISTENT** backend routes (`/api/admin/user/block` — only `/api/admin/users` exists)
- `getStats()` returns `{status, activeAgents, totalUsers, uptimeSec}` — but frontend stores it as array (`setUsers(data)`)

---

## 4. Package Layer Breakdown

### 4.1 `@istiyak/agent-core` (Main Agent Engine)

**Entry:** `src/index.ts` — barrel re-exports all modules.

**Agent Lifecycle (`src/agent/`):**

```
User Input → Agent.execute() → AgentRunner.runAgent()
├── 1. ContextBuilder.buildOptimizedContext() (auto-RAG via searchWorkspace)
├── 2. System prompt injection via PromptBuilder (with ToolRegistry tool schemas)
├── 3. Mode enforcement (chat/plan/assist/agent)
├── 4. AGENT LOOP (max 15 steps):
│   ├── a. streamLLM() → provider routing
│   ├── b. parseResponse() → JSON {thought, action, params}
│   ├── c. ApprovalManager security gate
│   ├── d. ToolRegistry.execute() → tool result
│   ├── e. Cost check, telemetry record, reflection check (every 8 steps)
│   └── f. Append result to agentHistory
├── 5. Budget guard: $2 max session cost
└── 6. Return {content, inputTokens, outputTokens, messagesUsed}
```

**Agent State Machine:** `idle → planning → running → reflecting → completed/error/aborted`

**LLM Provider Architecture (`src/llm/`):**

```
ProviderManager.streamLLM()
├── Provider: "gemini"  → GeminiProvider or VertexProvider (if serviceAccount)
├── Provider: "openai"  → OpenAIProvider
├── Provider: "claude"  → ClaudeProvider
├── Provider: "deepseek"→ DeepseekProvider
├── Provider: "ollama"  → OllamaProvider
├── Provider: "custom"  → CustomProvider (apiKey as baseUrl if contains '://')
└── Model: "auto" → classifyAndRoute() → selects pro/sonnet for complex, flash/haiku for simple
```

**Tool System (`src/tools/`):**
- 32 registered tools in ToolRegistry (ToolLoader.ts)
- Categories: Filesystem (10), Terminal (3), Git (8), Web (3), Memory (3), Planning (1), Agent (4)
- Missing from registration (exist in config/Tools.ts but not loaded): `copy_file`, `list_directory`, `search_files`, `web_search`, `web_screenshot`, `git_create_branch`
- `ToolRegistry.execute(name, params, context)` → validates params → calls tool.execute()
- `ToolValidator`: JSON schema validation (required fields, types, enums, min/max, minLength/maxLength)

**Memory System (`src/memory/`):**
- `SessionMemory`: Message storage with auto-compression (>100 msgs or >50K tokens → summarize older + keep last 8)
- `WorkspaceMemory`: Rule storage (9 keys: coding_style, language_preference, framework_preference, etc.)
- `ContextCompressor`: Truncate tool results >4K chars (preserve head 70% + tail 20%), summarize older messages
- `VectorMemory`: Static wrapper around `@istiyak/agent-memory` search/index functions
- `SummaryEngine`: Extractive summarization (TF-IDF keyword scoring + sentence position boosting), maxLength parameter ignored

**Security System (`src/security/`):**
- `PermissionManager`: 3 tiers — BLOCKED (sudo, rm -rf, eval), SAFE (ls, cat, echo), REQUIRES_APPROVAL (write, >, npm install)
- `SecretMasker`: Auto-detects 11 API key patterns (OpenAI `sk-*`, Google `AIza*`, AWS, GitHub tokens, etc.), shows first 4 + last 4 chars
- `WorkspaceGuard`: Path traversal prevention, blocks sensitive system paths
- `SandboxPolicy`: Docker isolation config (restrictive/default), network access control, domain whitelist

**Telemetry (`src/telemetry/`):**
- `Metrics`: 50-entry ring buffer of provider calls with latency/tokens
- `Tracing`: Nested span support, 200 max completed spans
- `UsageTracker`: In-memory + disk (max 10K records in `~/.istiyak_usage.json`)
- `CrashReporter`: JSON crash logs in `~/.istiyak_crash_logs/`, max 50 files

**Configuration (`src/config/`):**
- `LIMITS`: MAX_STEPS=15, MAX_SESSION_COST=$2, MAX_FILE_SIZE=10MB, MAX_COMMAND_TIMEOUT=120s
- `Providers`: 7 providers with metadata (cost mode, env vars, local cloud flag)
- `Models`: Per-provider model catalogs with pricing tiers
- `Settings`: DEFAULT_SETTINGS (gemini/gemini-2.5-flash, apiKey, maxSteps=40 — **conflicts with LIMITS.MAX_STEPS=15**)
- `Tools`: 40 tool names across 7 categories (only 32 actually registered)

---

### 4.2 `@istiyak/agent-memory`

**Purpose:** RAG vector search, session persistence, workspace memory.

**Key Functions:**
- `indexWorkspace(workspacePath, embeddingKey)` — Reads all text files (<100KB each), computes TF-IDF vectors with bigram support, stores in `~/.istiyak_codebase_index.json`
- `searchWorkspace(query, limit, workspacePath, embeddingKey)` — Cosine similarity scoring with size/text ratio bonus, returns sorted matches with file/line context
- `initSessionMemory()`, `storeMessage()`, `recallSession()` — JSON-file-backed session persistence (5 files max)
- `getWorkspaceRule` / `setWorkspaceRule` / `deleteRule` — Rules stored in `~/.istiyak_workspace_rules.json`

**Limitations:** TF-IDF on single text field (no embeddings API integration — embeddingKey param is accepted but unused), max 1000 documents per index.

---

### 4.3 `@istiyak/agent-tools`

**Purpose:** Plugin-based tool system with BaseTool abstract class, ToolContext, schema validation.

**Tool Schema:**
```typescript
abstract class BaseTool {
  abstract name: string;
  abstract description: string;
  abstract parameterSchema: ToolParamSchema;
  abstract execute(params: any, context: ToolContext): Promise<string>;
}
```

**ToolContext:** `{ workspacePath, cloudSandboxEnabled, dockerSandboxEnabled, sandboxImage, googleSearchEnabled, token, _agentConfig }`

**ToolParamSchema:** `{ type:"object", properties: { ... }, required: [...] }` — standard JSON Schema subset.

---

### 4.4 `@istiyak/agent-prompts`

**Purpose:** Template library for agent prompts.

**Exports:**
- `AGENT_SYSTEM_PROMPT` — Full agent system prompt with JSON schema for `{thought, action, params}`, tool rules, output format
- `PLANNING_PROMPT_TEMPLATE` — Plan generation prompt
- `SELF_CORRECTION_TEMPLATE` — Error recovery coroutine prompt
- `SUMMARY_PROMPT_TEMPLATE` — Context summarization prompt

---

### 4.5 `@istiyak/agent-sdk`

**Purpose:** HTTP client SDK for programmatic agent control.

**Exports:**
- `AgentSDK(baseUrl)` class with `chat(messages, config)`, `abort()`, `getStatus()`, `approvePermission(reqId, approved)`
- Uses Server-Sent Events (EventSource) for streaming

---

### 4.6 `@istiyak/database`

**Purpose:** Mongoose models only (no connection logic in package — `apps/saas-backend/src/server.ts` handles connection).

**Models:**
- `User`: `{ email (unique, lowercase), password, name, registeredIp, isBlocked (default false), createdAt, updatedAt }`
- `IpLog`: `{ ip, count, userId }`

---

### 4.7 `@istiyak/shared-types`

**Core Interfaces:**
- `Message`: `{ role: 'user'|'assistant'|'system', content: string, id?: string, metadata?: Record<string,any> }`
- `AgentResponse`: `{ thought: string, action: string, params: { relPath?, content?, command?, query?, summary? } }`
- `LocalConfig`: Record of known config keys
- `ProviderConfig`: Auth method, model, workspace path

---

### 4.8 `@istiyak/shared-utils`

**Exports:**
- `Logger(prefix)` class — Console logger with prefix
- `maskSecrets(text)` — Regex-based API key masking (12 patterns)
- `encrypt(text, key)` / `decrypt(ciphertext, key)` — AES-256-GCM with SHA-256 key derivation, random IV
- `sleep(ms)`, `retry(fn, options)`, `debounce(fn, ms)` — Async utilities

---

## 5. Data Flow Diagrams

### 5.1 Main Chat Flow

```
User (ChatUI textarea) → sendMessage()
  → Vercel AI SDK useChat() → TextStreamChatTransport.fetch()
    → POST /api/chat → daemon.js /api/chat handler
      → runAgent() [AgentRunner.ts]
        → streamLLM() [ProviderManager.ts → Gemini/OpenAI/etc.]
        → parseResponse() → {thought, action, params}
        → ToolRegistry.execute() → filesystem/git/shell/...
        → loop up to 15 steps
      → res.write(chunk) [SSE-like plain text stream]
    → Response body ReadableStream → controller.enqueue(value)
  → Ai SDK message update → ChatUI re-render
```

### 5.2 Permission Approval Flow

```
Agent → ApprovalManager.requiresApproval("run_command", {command:"npm install"})
  → true (npm install matches DANGEROUS_COMMANDS pattern)
→ daemon.js requestPermission callback → onChunk(<permission_request>)
  → ChatUI.parseAgentMessage() → extracts reqId
  → usePermissions.addPermissionTimeout(reqId) [5-min timeout]
  → PermissionCard renders [APPROVE] [REJECT] [Run in Sandbox]
  → User clicks [APPROVE] → handlePermissionResponse()
    → POST /api/agent/approve { requestId, approved: true }
    → AgentRunner resolves pending promise
    → ToolRegistry.execute("run_command", ...) executes
```

### 5.3 OAuth Login Flow

```
User clicks [Login with Google]
  → Browser opens popup → saas-backend:3002/auth/google
    → Redirects to Google OAuth
    → User grants access → Google redirects to callback
    → Passport verifies token → finds/creates user
    → Renders success HTML with inline <script>
      → script reads token from URL hash
      → fetch() to localhost:3001/api/oauth-callback
        → daemon writes TOKEN + USER_EMAIL to ~/.istiyak_agent_config.json
      → Script sends 'token received' message to opener via postMessage
    → Desktop app reads token from popup message
    → updateSettings({ token, userEmail }) → saveToRustConfig()
```

---

## 6. Configuration Reference

| File | Format | Purpose |
|------|--------|---------|
| `~/.istiyak_agent_config.json` | JSON | User settings: provider, API keys, workspace path, token, preferences |
| `~/.istiyak_codebase_index.json` | JSON | RAG vector index with TF-IDF weights and document metadata |
| `~/.istiyak_usage.json` | JSON | Telemetry usage records (max 10K entries) |
| `~/.istiyak_crash_logs/*.json` | JSON | Crash reports (max 50 files) |
| `~/.istiyak_workspace_rules.json` | JSON | Workspace-specific agent rules (9 known keys) |
| `apps/desktop/.env` | .env | Desktop dev environment variables |
| `apps/saas-backend/.env` | .env | Backend secrets: JWT_SECRET, MongoDB URI, Stripe key, OAuth credentials |

---

## 7. Environment Variables Reference

| Variable | Used In | Purpose |
|----------|---------|---------|
| `VITE_API_BASE` | desktop | Local daemon URL (default: `http://localhost:3001`) |
| `VITE_SAAS_BASE` | desktop | SaaS backend URL (default: `http://localhost:3002`) |
| `JWT_SECRET` | saas-backend | JWT signing secret (FATAL if missing — crashes server on import) |
| `MONGODB_URI` | saas-backend | MongoDB connection string |
| `SENTRY_DSN` | desktop, saas-backend | Sentry error reporting DSN |
| `STRIPE_SECRET_KEY` | saas-backend | Stripe API secret key |
| `GOOGLE_CLIENT_ID/SECRET` | saas-backend | Google OAuth credentials |
| `GITHUB_CLIENT_ID/SECRET` | saas-backend | GitHub OAuth credentials |
| `AI_PROVIDER`, `AI_MODEL`, `GEMINI_API_KEY`, `OPENAI_API_KEY` | local-daemon | Default LLM configuration for terminal mode |
