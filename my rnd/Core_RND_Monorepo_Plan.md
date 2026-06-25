# 🚀 ISTIYAK AI COMPANION — ULTRA-STRUCTURED MONOREPO ARCHITECTURE BLUEPRINT

This document serves as the master blueprint for restructuring the codebase into a production-grade, enterprise-ready Monorepo. It introduces clear architectural design patterns, strict separation of concerns, plugin-based configurations, and standard DevOps workflows.

---

## 🏗️ Monorepo Package Topology

```
istiyak_agent_v0.1/
├── apps/                               # Executable Applications
│   ├── desktop/                        # Tauri Desktop Widget UI
│   ├── landing/                        # Next.js Marketing & Billing checkout
│   ├── local-daemon/                   # Node.js local agent service listener (localhost:3001)
│   └── saas-backend/                   # Express.js Cloud SaaS Authentication & Billing
├── packages/                           # Shared Packages & Logic
│   ├── agent-core/                     # 🧠 Main Agent Loop and Orchestrator (TypeScript)
│   ├── agent-tools/                    # 🛠️ Independent Agent Tools base and schema registry
│   ├── agent-memory/                   # 💾 Agent Session, Vector, and Context memory engine
│   ├── agent-prompts/                  # 📝 System, Planning, and Summarization prompts library
│   ├── agent-sdk/                      # 🔌 Public JS/TS SDK to control the agent programmatically
│   ├── shared-types/                   # 🏷️ Unified TS definitions across Apps & Packages
│   ├── shared-utils/                   # ⚙️ Logging, Telemetry, and Security utilities
│   └── config/                         # 🛠️ Shared Tooling configuration rules (TS, ESLint, Tailwind)
└── turbo.json                          # Turborepo caching compilation pipelines
```

---

## 🏗️ Core Architectural Design Patterns

### 1. Backend: Controller-Service-Repository Pattern
Instead of putting Stripe or Docker logic directly inside controllers or routes, we decouple them into three layers:
1. **Controllers**: Parse input requests, validate schema parameters, and return HTTP responses.
2. **Services**: Contain the core business logic (e.g. interfacing with Stripe SDK, orchestrating Docker-in-Docker sandbox lifecycles).
3. **Repositories**: Query Mongoose schemas.
*Benefit: Easy to swap databases (e.g. MongoDB to PostgreSQL) or payment gateways without rewriting controllers.*

### 2. Agent Core: Plugin-Based Tool System
Instead of importing multiple functions in a flat file, the agent uses a **BaseTool Class**. Every tool extends this base class, supplying:
- A `name` and `description` (automatically parsed for LLM function declarations).
- A JSON schema for `parameters` validation.
- An `execute()` callback function.
- An `approveRequired` flag (to intercept terminal commands for user confirmation).

### 3. Frontend: Zustand Slices Pattern
Instead of writing a single huge Zustand store file, we break state management into modular slices (`createChatSlice`, `createSettingsSlice`, `createUiSlice`) and combine them into a single global state hooks controller.

---

## 📂 Detailed File-Level Monorepo Blueprint

### 📦 1. `apps/` (Applications Layer)

#### 📂 [apps/desktop](file:///Volumes/SSD/0.1/istiyak_agent_v0.1/desktop) (Tauri React UI)
*Configured with TypeScript path aliases (`@/`) to avoid relative path nesting (`../../`)*
```
apps/desktop/
├── src-tauri/                    # Rust Native Bridge
│   ├── src/
│   │   ├── cmd.rs                # Rust file system bridge functions
│   │   └── main.rs               # Window decorations, transparent setting, always-on-top setup
│   └── tauri.conf.json
├── src/
│   ├── assets/                   # Vector graphics and UI audio alerts
│   ├── components/               # UI Design Modules
│   │   ├── chat/                 # Chat interface widgets
│   │   │   ├── ChatInput.tsx     # Rich editor textarea
│   │   │   ├── MessageList.tsx   # Chat container with auto scroll
│   │   │   ├── MessageBubble.tsx # Markdown syntax renderer
│   │   │   ├── AgentStepList.tsx # Collapsible step indicators
│   │   │   ├── PermissionAlert.tsx # Shell permission request modal
│   │   │   └── CostTracker.tsx   # Live cash counter
│   │   ├── ide/                  # Editor panel widgets
│   │   │   ├── FileTree.tsx      # Recursive repository folder crawler
│   │   │   ├── MonorepoEditor.tsx # Monaco editor instance
│   │   │   └── TerminalPanel.tsx # Console logs compiler
│   │   ├── settings/             # Settings form overlays
│   │   │   ├── SettingsModal.tsx
│   │   │   ├── ProviderForm.tsx  # Relational model inputs
│   │   │   ├── AuthModal.tsx     # Register/Login screens & checkout
│   │   │   └── Marketplace.tsx   # Extensions store popup
│   │   └── ui/                   # Reusable glassmorphic UI components
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       ├── Dropdown.tsx
│   │       ├── Tooltip.tsx
│   │       └── ErrorBoundary.tsx # React error boundaries catcher
│   ├── hooks/                    # Custom React state controllers
│   │   ├── useGitStatus.ts       # Polls git branch state
│   │   ├── useTelemetry.ts       # Polls API speed, cost, token logs
│   │   ├── useWatcher.ts         # Monitors files and file locks
│   │   └── useTauriWindow.ts     # Resizes Tauri frame
│   ├── store/                    # Modular Zustand Slices
│   │   ├── slices/
│   │   │   ├── chatSlice.ts      # Active chats state
│   │   │   ├── settingsSlice.ts  # API Keys state
│   │   │   └── uiSlice.ts        # Sidebar/Modal open states
│   │   └── index.ts              # Bundles slices into unified store
│   ├── App.tsx                   # Main frame component
│   ├── index.css
│   └── main.tsx
├── tailwind.config.js
├── tsconfig.json                 # Path aliases: "@/*" -> ["src/*"]
└── vite.config.ts
```

#### 📂 [apps/saas-backend](file:///Volumes/SSD/0.1/istiyak_agent_v0.1/backend) (SaaS Cloud Server)
```
apps/saas-backend/
├── src/
│   ├── config/                   # Global clients initializers
│   │   ├── db.js
│   │   └── sentry.js
│   ├── controllers/              # Handles request inputs & output responses
│   │   ├── authController.js
│   │   ├── adminController.js
│   │   ├── billingController.js
│   │   ├── sandboxController.js
│   │   └── updateController.js
│   ├── services/                 # Business logic abstraction layers
│   │   ├── authService.js        # Argon2 hashing & signups validator
│   │   ├── stripeService.js      # Direct communication with Stripe checkout SDK
│   │   ├── sandboxService.js     # Orchestrates Docker SDK containers
│   │   └── updateService.js      # Direct access to OTA storage releases
│   ├── repositories/             # Database access layers
│   │   ├── userRepository.js     # User status queries
│   │   └── ipLogRepository.js    # Device identification logs
│   ├── middleware/               # Endpoint interceptors
│   │   ├── auth.js
│   │   ├── rateLimiter.js
│   │   └── errorHandler.js       # Global Express catch-all error format handler
│   ├── routes/
│   │   ├── index.js              # Bundled routes aggregator
│   │   ├── auth.js
│   │   ├── admin.js
│   │   ├── billing.js
│   │   ├── sandbox.js
│   │   └── update.js
│   └── server.js                 # Express bootstrapper
├── package.json
└── tsconfig.json
```

#### 📂 [apps/local-daemon](file:///Volumes/SSD/0.1/istiyak_agent_v0.1/engine) (Local Engine Client)
```
apps/local-daemon/
├── src/
│   ├── routes/
│   │   ├── command.js            # Run local CLI commands
│   │   ├── agent.js              # Intercepts agent permissions
│   │   ├── rag.js                # RAG embedding router
│   │   └── watcher.js            # TODOs locks registry
│   ├── daemon.js                 # Express server launcher (localhost:3001)
│   └── index.js                  # Engine CLI mode selector
├── package.json
└── tsconfig.json
```

#### 📂 [apps/landing](file:///Volumes/SSD/0.1/istiyak_agent_v0.1/landing) (Next.js Marketing Website)
```
apps/landing/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── pricing/
│   └── download/
├── components/
│   ├── Hero.tsx
│   ├── Features.tsx
│   └── CheckoutButton.tsx        # Stripe checkout modal triggers
├── public/                       # Images, icons, static assets
├── package.json
└── tailwind.config.js
```

---

### 📦 2. `packages/` (Shared Modules Layer)

#### 📂 packages/agent-core (Autonomous Agent Package)
```
packages/agent-core/
├── src/
│   ├── agent/                          # 🧠 Main Agent Core Loop
│   │   ├── Agent.ts                    # Agent instantiation and run loops
│   │   ├── AgentRunner.ts              # Implements the 40-step runner engine
│   │   ├── AgentWorkflow.ts            # Defines execution workflows and lifecycles
│   │   ├── AgentState.ts               # Tracks agent status, logs, current active step
│   │   ├── Planner.ts                  # Generates step-by-step task lists (workspace_plan.md)
│   │   ├── Reflection.ts               # Self-correction check handler
│   │   ├── MemoryManager.ts            # Interfaces with agent-memory package
│   │   ├── PromptBuilder.ts            # Dynamic prompt generator
│   │   ├── ContextBuilder.ts           # Compresses and builds chat historical context
│   │   ├── TaskClassifier.ts           # Classifies tasks (Quick vs Complex)
│   │   ├── ApprovalManager.ts          # Terminal execution permissions controller
│   │   └── ExceptionHandler.ts         # Handles tool errors, api errors, recovery
│   │
│   ├── llm/                            # 🔗 LLM Gateway and Connectors
│   │   ├── ProviderManager.ts          # Dynamically switches model providers
│   │   ├── ModelManager.ts             # Contains active models metadata
│   │   ├── TokenCounter.ts             # Measures inputs and outputs
│   │   ├── CostTracker.ts              # Session pricing counter
│   │   ├── StreamManager.ts            # Handles chat output chunks stream to frontend
│   │   ├── ResponseParser.ts           # Parses JSON/XML outputs
│   │   ├── providers/
│   │   │   ├── gemini/
│   │   │   │   ├── GeminiProvider.ts   # Google Studio API connector
│   │   │   │   ├── GeminiModels.ts     # Models schema lists
│   │   │   │   └── GeminiConfig.ts     # Region and GCP settings
│   │   │   ├── vertex/                 # Google Cloud Vertex AI integrations
│   │   │   ├── openai/                 # OpenAI API connector
│   │   │   ├── claude/                 # Anthropic Claude connector
│   │   │   ├── deepseek/               # Deepseek API connector
│   │   │   ├── ollama/                 # Local Ollama client
│   │   │   └── custom/                 # Custom proxy settings
│   │   └── prompts/                    # Local prompts maps (extends agent-prompts)
│   │       ├── SystemPrompt.ts
│   │       ├── PlanningPrompt.ts
│   │       ├── ReflectionPrompt.ts
│   │       ├── MemoryPrompt.ts
│   │       └── SummaryPrompt.ts
│   │
│   ├── tools/                          # 🛠️ System Tools
│   │   ├── registry/
│   │   │   ├── ToolRegistry.ts         # Registers available agent tools
│   │   │   ├── ToolLoader.ts           # Dynamic import of tool modules
│   │   │   └── ToolValidator.ts        # Validates tool parameters schema
│   │   ├── filesystem/
│   │   │   ├── ScanProjectTool.ts      # Index directories layout
│   │   │   ├── ListFilesTool.ts        # Flat files viewer
│   │   │   ├── ReadFileTool.ts         # Reads file content
│   │   │   ├── WriteFileTool.ts        # Overwrites target file
│   │   │   ├── PreciseEditTool.ts      # Performs string exact changes replacements
│   │   │   ├── ASTEditTool.ts          # Syntactical code modifications parser
│   │   │   ├── SearchTool.ts           # Code grep regex matches finder
│   │   │   ├── RenameTool.ts           # Renames file
│   │   │   ├── MoveTool.ts             # Moves file
│   │   │   ├── DeleteTool.ts           # Deletes target file
│   │   │   └── CreateDirectoryTool.ts  # Creates folder hierarchies
│   │   ├── terminal/
│   │   │   ├── RunCommandTool.ts       # Executes shell commands
│   │   │   ├── Sandbox.ts              # Spawns sandbox runtime instances
│   │   │   └── ProcessManager.ts       # Kills/tracks active processes
│   │   ├── git/
│   │   │   ├── StatusTool.ts           # Git status wrapper
│   │   │   ├── DiffTool.ts             # Diff parser
│   │   │   ├── CommitTool.ts           # Commits code modifications
│   │   │   ├── BranchTool.ts           # Branch checkout and queries
│   │   │   ├── CheckoutTool.ts         # Discards changes or switch branches
│   │   │   ├── StashTool.ts            # Stash managers
│   │   │   └── LogTool.ts              # Retrieve history logs
│   │   ├── web/
│   │   │   ├── GoogleSearchTool.ts     # Google CSE query runner
│   │   │   ├── UrlContextTool.ts       # Retrives context from urls
│   │   │   ├── FetchUrlTool.ts         # Fetches webpage html
│   │   │   └── CrawlWebsiteTool.ts     # Recursively crawls sites
│   │   ├── memory/
│   │   │   ├── ReadMemoryTool.ts
│   │   │   ├── WriteMemoryTool.ts
│   │   │   ├── CompressMemoryTool.ts
│   │   │   └── SummarizeMemoryTool.ts
│   │   ├── planning/
│   │   │   ├── CreatePlanTool.ts
│   │   │   ├── UpdatePlanTool.ts
│   │   │   ├── ReflectTool.ts
│   │   │   └── WalkthroughTool.ts
│   │   └── agent/
│   │       ├── DelegateAgentTool.ts    # Delegates task to helper agent
│   │       ├── SpawnSubAgentTool.ts    # Spawns sub-agent instance
│   │       └── MergeResultTool.ts      # Recombines results
│   │
│   ├── memory/                         # 💾 Memory storage managers
│   │   ├── SessionMemory.ts            # Active chat history memory
│   │   ├── WorkspaceMemory.ts          # Monitored code guidelines and logs
│   │   ├── ContextCompressor.ts        # Truncates old steps histories
│   │   ├── SummaryEngine.ts            # Generates rolling chat summaries
│   │   └── VectorMemory.ts             # RAG embeddings vector storage
│   │
│   ├── config/                         # ⚙️ App limitations configs
│   │   ├── Providers.ts
│   │   ├── Models.ts
│   │   ├── Tools.ts
│   │   ├── Settings.ts
│   │   └── Limits.ts
│   │
│   ├── events/                         # 🔔 Event Bus system
│   │   ├── EventBus.ts                 # Main event emitter
│   │   ├── AgentEvents.ts              # Agent state trigger rules
│   │   ├── ToolEvents.ts               # Tools execute event listeners
│   │   └── WorkspaceEvents.ts          # Watcher update event listeners
│   │
│   ├── telemetry/                      # 📊 Analytics tracking
│   │   ├── Logger.ts
│   │   ├── Metrics.ts
│   │   ├── Tracing.ts
│   │   ├── UsageTracker.ts
│   │   └── CrashReporter.ts
│   │
│   ├── security/                       # 🔒 Security guardrails
│   │   ├── SecretMasker.ts             # Masks keys in logs & prompts
│   │   ├── PermissionManager.ts        # Terminal command permission gate
│   │   ├── WorkspaceGuard.ts           # Keeps modifications inside the workspace
│   │   └── SandboxPolicy.ts            # Enforces sandboxing policies
│   │
│   ├── shared/                         # 🗃️ Internal shared helpers
│   │   ├── constants/
│   │   ├── types/
│   │   ├── interfaces/
│   │   ├── schemas/
│   │   └── helpers/
│   │
│   └── index.ts                        # Main package entrypoint
├── package.json
└── tsconfig.json
```

#### 📂 [packages/agent-tools](file:///Volumes/SSD/0.1/istiyak_agent_v0.1/packages/agent-tools)
*Defines BaseTool schema and serialization primitives shared by all agent layers*
```
packages/agent-tools/
├── src/
│   ├── BaseTool.ts                     # Abstract class for all agent tools
│   ├── ToolContext.ts                  # Context object passed to tools during execution
│   ├── ToolSchema.ts                   # JSON schema generation and validation helpers
│   └── index.ts
├── package.json
└── tsconfig.json
```

#### 📂 [packages/agent-memory](file:///Volumes/SSD/0.1/istiyak_agent_v0.1/packages/agent-memory)
*Vector database client integration and workspace memory store logic*
```
packages/agent-memory/
├── src/
│   ├── VectorClient.ts                 # Embedding generator client wrapper
│   ├── SQLiteMemoryStore.ts            # Local SQLite client for long-term memory
│   ├── WorkspaceMemoryStore.ts         # Persistent memory registry per workspace path
│   └── index.ts
├── package.json
└── tsconfig.json
```

#### 📂 [packages/agent-prompts](file:///Volumes/SSD/0.1/istiyak_agent_v0.1/packages/agent-prompts)
*The library of prompt templates (System prompts, task classification, summary formats)*
```
packages/agent-prompts/
├── src/
│   ├── SystemTemplates.ts              # General agent persona template
│   ├── PlanningTemplates.ts            # Planning instructions
│   ├── CorrectionTemplates.ts          # Self-correction guidelines
│   └── index.ts
├── package.json
└── tsconfig.json
```

#### 📂 [packages/agent-sdk](file:///Volumes/SSD/0.1/istiyak_agent_v0.1/packages/agent-sdk)
*External programmatic interface (SDK) to spin up the agent*
```
packages/agent-sdk/
├── src/
│   ├── Client.ts                       # The main SDK class
│   ├── Connection.ts                   # WebSocket/HTTP connection controller
│   └── index.ts
├── package.json
└── tsconfig.json
```

#### 📂 [packages/shared-types](file:///Volumes/SSD/0.1/istiyak_agent_v0.1/packages/shared-types)
*Common type definitions (User, Project, Settings, Session)*
```
packages/shared-types/
├── src/
│   ├── api.ts                          # API Request/Response shapes
│   ├── state.ts                        # Zustand states interfaces
│   └── index.ts
├── package.json
└── tsconfig.json
```

#### 📂 [packages/shared-utils](file:///Volumes/SSD/0.1/istiyak_agent_v0.1/packages/shared-utils)
*Utility tools (Argon2 hashing, Secret maskers, HSL theme managers)*
```
packages/shared-utils/
├── src/
│   ├── crypto.ts
│   ├── mask.ts
│   ├── logger.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```

#### 📂 packages/config (Global Rules)
- **`eslint/`**: Shared ESLint settings (`eslint-config-custom`).
- **`tsconfig/`**: Shared tsconfig definitions.
- **`tailwind/`**: Core theme extensions (colors, glassmorphism filters, base font rules).

---

### 🐳 3. `docker/` (Containerization & Sandboxes)
- **`local-daemon.Dockerfile`**: Multi-stage docker compilation file for dev daemon.
- **`saas-backend.Dockerfile`**: Optimized production Dockerfile for backend server deployment.
- **`sandbox-runner/`**: Contains files to configure cloud DinD (Docker-in-Docker) containers to run Agent core tools isolated.

---

### 🤖 4. `.github/workflows/` (GitHub CI/CD Actions)
- **`tauri-builder.yml`**: Compiles cross-platform installers (`.dmg`, `.exe`, `.deb`) on tag release and uploads them to OTA server.
- **`backend-deploy.yml`**: Automatically builds Docker images and deploys them to server.
