# 🔄 Istiyak Agent — Updateable R&D & Change Tracker

> **Purpose:** এই ডকুমেন্টটি একটি **living document** — নতুন ফিচার যোগ করলে, বাগ ফিক্স করলে, বা কোনো কিছু পরিবর্তন করলে শুধু এখানে আপডেট দিন। আর আলাদা R&D করতে হবে না!
>
> **Full R&D:** [istiyak_agent_complete_rnd.md](file:///Users/khairulistiyak/.gemini/antigravity-ide/brain/df1d2183-6c0c-4e98-826b-a7592fb48e78/istiyak_agent_complete_rnd.md)
>
> **Last Sync:** 2026-07-02 | **Version:** 0.1.0

---

## 📊 Quick Architecture Reference

```
istiyak-companion-monorepo/
├── apps/
│   ├── desktop/          → Tauri v2 + React + Vite (port 1420)
│   ├── local-daemon/     → Express API (port 3001) — agent runner
│   ├── saas-backend/     → Express + MongoDB + Stripe (port 3002)
│   └── landing/          → Next.js marketing site
├── packages/
│   ├── agent-core/       → 🧠 Brain (execution, LLM, security, memory)
│   ├── agent-memory/     → 📚 RAG + vector search
│   ├── agent-prompts/    → 📝 System prompts
│   ├── agent-sdk/        → 🔌 Client SDK (WIP)
│   ├── agent-tools/      → 🔧 Tool interfaces
│   ├── database/         → 💾 MongoDB models
│   ├── shared-types/     → 📋 TypeScript interfaces
│   └── shared-utils/     → 🛠️ Crypto, Logger, Mask
└── Config: turbo.json, eslint.config.mjs
```

---

## 📁 File Registry

> **নিয়ম:** নতুন ফাইল যোগ হলে এই টেবিলে entry দিন। ফাইল মডিফাই হলে "Last Modified" কলামে তারিখ আপডেট করুন।

### apps/desktop/

| File | Lines | Purpose | Last Modified |
|------|-------|---------|---------------|
| `src-tauri/src/lib.rs` | 430 | Tauri IPC commands (10 cmds) | 2026-07-02 |
| `src/App.tsx` | 12 | Root component → ChatUI | 2026-07-02 |
| `src/components/ChatUI.tsx` | ~800+ | Main chat interface | 2026-07-02 |
| `src/hooks/usePolling.ts` | ~250 | Daemon status polling | 2026-07-02 |
| `src/hooks/usePermissions.ts` | — | Permission handling | 2026-07-02 |
| `src/hooks/useTelemetry.ts` | — | Telemetry hook | 2026-07-02 |
| `src/hooks/useWorkspaceDetect.ts` | — | IDE workspace detection | 2026-07-02 |
| `src/store/index.ts` | ~130 | Zustand store | 2026-07-02 |
| `src/utils/parser.ts` | ~200 | Agent response parser | 2026-07-02 |
| `src/utils/theme.ts` | ~100 | Theme utils | 2026-07-02 |

### apps/local-daemon/

| File | Lines | Purpose | Last Modified |
|------|-------|---------|---------------|
| `src/index.js` | 95 | Entry (UI/Terminal mode) | 2026-07-02 |
| `src/daemon.js` | 298 | Express server + chat endpoint | 2026-07-02 |
| `src/routes/command.js` | — | Command execution routes | 2026-07-02 |
| `src/routes/agent.js` | — | Agent management routes | 2026-07-02 |
| `src/routes/rag.js` | — | RAG indexing/search routes | 2026-07-02 |
| `src/routes/watcher.js` | — | File watcher routes | 2026-07-02 |
| `src/routes/git.js` | — | Git operation routes | 2026-07-02 |
| `src/watcher/watcher.js` | — | TODO file watcher | 2026-07-02 |

### apps/saas-backend/

| File | Lines | Purpose | Last Modified |
|------|-------|---------|---------------|
| `src/server.ts` | 90 | Express + CORS + Sentry | 2026-07-02 |
| `src/routes/auth.ts` | ~230 | Auth routes (OAuth, JWT) | 2026-07-02 |
| `src/routes/admin.ts` | — | Admin routes | 2026-07-02 |
| `src/routes/billing.ts` | — | Stripe billing routes | 2026-07-02 |
| `src/routes/sandbox.ts` | — | Sandbox execution routes | 2026-07-02 |
| `src/routes/update.ts` | — | App update routes | 2026-07-02 |

### packages/agent-core/

| File | Lines | Purpose | Last Modified |
|------|-------|---------|---------------|
| `src/agent/AgentRunner.ts` | 582 | Core execution loop | 2026-07-02 |
| `src/agent/Agent.ts` | — | High-level agent class | 2026-07-02 |
| `src/agent/AgentWorkflow.ts` | — | Lifecycle management | 2026-07-02 |
| `src/agent/ApprovalManager.ts` | — | Command approval gate | 2026-07-02 |
| `src/agent/ContextBuilder.ts` | — | Context optimization | 2026-07-02 |
| `src/agent/ExceptionHandler.ts` | — | Error classification | 2026-07-02 |
| `src/agent/MemoryManager.ts` | — | Memory orchestrator | 2026-07-02 |
| `src/agent/Planner.ts` | — | Task planning | 2026-07-02 |
| `src/agent/PromptBuilder.ts` | — | System prompt builder | 2026-07-02 |
| `src/agent/Reflection.ts` | — | Self-correction engine | 2026-07-02 |
| `src/agent/TaskClassifier.ts` | — | Quick/complex classifier | 2026-07-02 |
| `src/llm/ProviderManager.ts` | — | Multi-provider router | 2026-07-02 |
| `src/llm/ModelManager.ts` | — | Auto model routing | 2026-07-02 |
| `src/llm/TokenCounter.ts` | — | Token estimation | 2026-07-02 |
| `src/llm/CostTracker.ts` | — | Cost calculation | 2026-07-02 |
| `src/llm/StreamManager.ts` | — | Stream buffering | 2026-07-02 |
| `src/llm/ResponseParser.ts` | — | JSON parser (4 strategies) | 2026-07-02 |
| `src/security/PermissionManager.ts` | — | Command validation | 2026-07-02 |
| `src/security/SecretMasker.ts` | — | API key masking | 2026-07-02 |
| `src/security/SandboxPolicy.ts` | — | Sandbox constraints | 2026-07-02 |
| `src/security/WorkspaceGuard.ts` | — | Path traversal prevention | 2026-07-02 |
| `src/memory/SessionMemory.ts` | 158 | Session memory + auto-compress | 2026-07-02 |
| `src/memory/SummaryEngine.ts` | 147 | TF-IDF extractive summarizer | 2026-07-02 |
| `src/events/EventBus.ts` | 92 | Central event bus | 2026-07-02 |
| `src/telemetry/UsageTracker.ts` | 168 | Usage aggregation | 2026-07-02 |
| `src/telemetry/CrashReporter.ts` | 185 | Crash log persistence | 2026-07-02 |
| `src/config/Limits.ts` | — | Resource limits | 2026-07-02 |
| `src/config/Models.ts` | — | Model catalog | 2026-07-02 |
| `src/config/Providers.ts` | — | Provider registry | 2026-07-02 |

### packages/agent-memory/

| File | Lines | Purpose | Last Modified |
|------|-------|---------|---------------|
| `src/VectorClient.ts` | 365 | RAG engine (TF-IDF + cosine) | 2026-07-02 |
| `src/EmbeddingClient.ts` | ~100 | Gemini embedding client | 2026-07-02 |

### packages/agent-prompts/

| File | Lines | Purpose | Last Modified |
|------|-------|---------|---------------|
| `src/SystemTemplates.ts` | 162 | Main system prompt | 2026-07-02 |
| `src/PlanningTemplates.ts` | ~50 | Planning prompt | 2026-07-02 |
| `src/CorrectionTemplates.ts` | ~60 | Error correction prompt | 2026-07-02 |

### packages/shared-types/

| File | Lines | Purpose | Last Modified |
|------|-------|---------|---------------|
| `src/api.ts` | 44 | Message, AgentResponse, LocalConfig | 2026-07-02 |
| `src/state.ts` | 24 | ChatStoreState, SettingsStoreState | 2026-07-02 |

### packages/shared-utils/

| File | Lines | Purpose | Last Modified |
|------|-------|---------|---------------|
| `src/crypto.ts` | 26 | sha256, encrypt, decrypt (AES-256) | 2026-07-02 |
| `src/logger.ts` | 20 | Logger class with prefix | 2026-07-02 |
| `src/mask.ts` | 12 | maskSecrets utility | 2026-07-02 |

---

## 🔧 Current Configuration Snapshot

| Config Key | Current Value | File |
|------------|---------------|------|
| MAX_STEPS | 15 | `Limits.ts` |
| MAX_SESSION_COST_USD | $2.00 | `Limits.ts` |
| MAX_CONTEXT_TOKENS | 100,000 | `Limits.ts` |
| MAX_FILE_SIZE | 10 MB | `Limits.ts` |
| MAX_COMMAND_TIMEOUT | 120,000ms | `Limits.ts` |
| REFLECTION_INTERVAL | 8 steps | `Limits.ts` |
| RAG_MAX_FILES | 3,000 | `VectorClient.ts` |
| RAG_CHUNK_SIZE | 15 lines | `VectorClient.ts` |
| MAX_CRASH_LOGS | 50 | `CrashReporter.ts` |
| MAX_USAGE_RECORDS | 10,000 | `UsageTracker.ts` |
| Pro Price | $19/month | `landing/page.tsx` |
| Daemon Port | 3001 | `daemon.js` |
| SaaS Port | 3002 | `server.ts` |
| Config File | `~/.istiyak_agent_config.json` | `lib.rs` |

---

## 📝 Change Log

> **নিয়ম:** প্রতিটি পরিবর্তনের জন্য নিচের format-এ entry যোগ করুন। সাম্প্রতিক পরিবর্তন উপরে রাখুন।

### Template:
```markdown
### [DATE] — [VERSION] — [CHANGE TITLE]

**Category:** Feature / Bugfix / Refactor / Config / Dependency / Security / UI
**Files Modified:**
- `path/to/file.ts` — What changed
- `path/to/file2.ts` — What changed

**Impact:**
- [ ] Changes agent execution flow
- [ ] Changes API endpoints
- [ ] Changes database schema
- [ ] Changes security rules
- [ ] Changes UI layout/behavior
- [ ] Changes configuration/limits
- [ ] Changes pricing/billing
- [ ] Needs dependency install (`npm install`)
- [ ] Needs rebuild (`turbo build`)
- [ ] Needs migration

**Details:**
Brief description of what, why, and how.

**Testing Done:**
What tests were run or manual verification done.

---
```

### 2026-07-02 — v0.1.0 — Landing + SaaS Web App R&D

**Category:** Documentation / Planning
**Files Modified:** None (analysis only)
**Details:** Complete audit of Landing page (4 pages, 3 components) and SaaS Backend (5 routes, 5 controllers, 4 services). Identified 23+ missing features, 8 security gaps, 6 new DB models needed, and 17 new routes. Full R&D: [landing_saas_rnd.md](file:///Users/khairulistiyak/.gemini/antigravity-ide/brain/df1d2183-6c0c-4e98-826b-a7592fb48e78/landing_saas_rnd.md)

**Impact:**
- [x] Stripe service is a MOCK — needs real implementation
- [x] Admin panel has NO authentication
- [x] Web application dashboard/billing/settings not built
- [x] 6 new database models needed
- [x] 17 new routes planned

---

### 2026-07-02 — v0.1.0 — Initial R&D Baseline

**Category:** Documentation
**Files Modified:** None (analysis only)
**Details:** Complete A-to-Z codebase analysis completed. All modules mapped.

---

## 🎯 Module Status Dashboard

| Module | Status | Health | Notes |
|--------|--------|--------|-------|
| **Desktop (Tauri)** | ✅ Active | 🟢 Good | 10 IPC commands working |
| **Desktop (React)** | ✅ Active | 🟢 Good | Chat UI functional |
| **Local Daemon** | ✅ Active | 🟢 Good | Streaming works |
| **SaaS Backend** | ✅ Active | 🔴 Critical Gaps | Stripe is MOCK, admin unprotected, 17 APIs missing |
| **Landing Page** | ✅ Active | 🟡 Incomplete | 4 pages done, 10+ sections/pages missing |
| **Web Application** | ❌ Not Started | 🔴 Missing | Dashboard, billing portal, settings — 0% done |
| **Agent Core** | ✅ Active | 🟢 Good | 582-line loop, 7 providers |
| **Agent Memory** | ✅ Active | 🟢 Good | Hybrid search works |
| **Agent Prompts** | ✅ Active | 🟢 Good | System prompt optimized |
| **Agent SDK** | ⚠️ WIP | 🟡 Minimal | Skeleton only |
| **Agent Tools** | ✅ Active | 🟢 Good | 25+ tools |
| **Database** | ✅ Active | 🟡 Minimal | 2 models only, 6 more needed |
| **Shared Types** | ✅ Active | 🟢 Good | Clean interfaces |
| **Shared Utils** | ✅ Active | 🟢 Good | Crypto, Logger, Mask |

### 📎 Related R&D Documents

| Document | Content |
|----------|---------|
| [Complete A-to-Z R&D](file:///Users/khairulistiyak/.gemini/antigravity-ide/brain/df1d2183-6c0c-4e98-826b-a7592fb48e78/istiyak_agent_complete_rnd.md) | পুরো প্রজেক্টের বিস্তারিত architecture, code, data flow |
| [Landing + SaaS R&D](file:///Users/khairulistiyak/.gemini/antigravity-ide/brain/df1d2183-6c0c-4e98-826b-a7592fb48e78/landing_saas_rnd.md) | Landing, SaaS, Web App — কী বাকি, কেমন design, implementation plan |

---

## 🔑 Key Patterns Quick Reference

### Adding a New LLM Provider
1. Create `packages/agent-core/src/llm/providers/newprovider/`
2. Implement provider class with `streamLLM()` method
3. Add to `ProviderManager.ts` switch statement
4. Add cost rates to `CostTracker.ts`
5. Add model entries to `Models.ts`
6. Add provider entry to `Providers.ts`
7. Update `shared-types/api.ts` if new config fields needed

### Adding a New Tool
1. Create tool file in `packages/agent-core/src/tools/category/`
2. Register in `ToolRegistry.ts`
3. Add tool declaration in `PromptBuilder.ts` (buildToolDeclarations)
4. Handle in `AgentRunner.ts` executeAction switch
5. If dangerous, add to `ApprovalManager.ts` approval list

### Adding a New API Endpoint
1. Create route in `apps/local-daemon/src/routes/` or `apps/saas-backend/src/routes/`
2. Mount in `daemon.js` or `server.ts`
3. Update CORS if new origins needed
4. Add auth middleware if needed (SaaS only)

### Adding a New Desktop UI Component
1. Create in `apps/desktop/src/components/`
2. Use `lucide-react` for icons (project rule!)
3. Use Zustand store for state
4. Call Tauri commands via `invoke()`

### Changing Configuration/Limits
1. Update `packages/agent-core/src/config/Limits.ts`
2. Update this document's "Configuration Snapshot" section
3. Test with `npm run test` (if tests exist)

### Updating Pricing
1. `apps/landing/app/page.tsx` — Pricing cards
2. `apps/saas-backend/src/services/stripeService.ts` — Stripe price ID
3. Update this document

---

## 📌 Environment Variables Reference

| Variable | Used In | Required | Default |
|----------|---------|----------|---------|
| `GEMINI_API_KEY` | daemon, core | ✅ (if Gemini) | — |
| `OPENAI_API_KEY` | daemon, core | ✅ (if OpenAI) | — |
| `ANTHROPIC_API_KEY` | core | ✅ (if Claude) | — |
| `DEEPSEEK_API_KEY` | core | ✅ (if Deepseek) | — |
| `MONGODB_URI` | saas-backend | ✅ | `mongodb://127.0.0.1:27017/istiyak_saas` |
| `PORT` | daemon, saas | ❌ | 3001 / 3002 |
| `SENTRY_DSN` | saas-backend, desktop | ❌ | — |
| `STRIPE_SECRET_KEY` | saas-backend | ✅ (if billing) | — |
| `JWT_SECRET` | saas-backend | ✅ | — |
| `GOOGLE_CLIENT_ID` | saas-backend | ✅ (if OAuth) | — |
| `GOOGLE_CLIENT_SECRET` | saas-backend | ✅ (if OAuth) | — |
| `GITHUB_CLIENT_ID` | saas-backend | ✅ (if OAuth) | — |
| `GITHUB_CLIENT_SECRET` | saas-backend | ✅ (if OAuth) | — |
| `ALLOWED_ORIGINS` | saas-backend | ❌ | tauri/localhost |
| `AI_PROVIDER` | daemon (terminal) | ❌ | `gemini` |
| `AI_MODEL` | daemon (terminal) | ❌ | `gemini-2.5-flash` |

---

## 🚀 Build & Run Commands

```bash
# Development
npm run dev              # Start all workspaces in dev mode
npm run build            # Build all packages
npm run lint             # Lint all packages
npm run test             # Run tests

# Individual apps
cd apps/desktop && npm run tauri dev    # Desktop app
cd apps/local-daemon && npm run dev     # Local daemon
cd apps/saas-backend && npm run dev     # SaaS backend
cd apps/landing && npm run dev          # Landing page

# Terminal mode
cd apps/local-daemon && node dist/index.js --terminal
```

---

> [!IMPORTANT]
> **এই ডকুমেন্টটি সবসময় আপডেট রাখুন!** কোনো পরিবর্তন করলে Change Log সেকশনে entry যোগ করুন এবং File Registry তে Last Modified আপডেট করুন। তাহলে আর কখনো নতুন করে R&D করতে হবে না!
