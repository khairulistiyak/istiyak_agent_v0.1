# 🏗️ Companion Chat UI — Full Implementation Plan

<!--
╔══════════════════════════════════════════════════════════════════╗
║  ⚠️ এই file এ DETAILED step instructions আছে।                 ║
║                                                                  ║
║  📌 পড়ার আগে:                                                  ║
║  1. plan/PROGRESS.md পড়ো → কোথায় আছে project বুঝো             ║
║  2. plan/RULES.md পড়ো → coding conventions বুঝো                ║
║  3. তারপর এখানে next pending step এর section পড়ো               ║
║                                                                  ║
║  💡 পুরো file পড়ার দরকার নেই — শুধু current phase section পড়ো  ║
╚══════════════════════════════════════════════════════════════════╝
-->

---

## 📋 Plan Metadata

| Key | Value |
|-----|-------|
| **Plan Version** | v1.0 |
| **Plan File** | `plan/plan_01.md` (this file) |
| **Total Phases** | 9 |
| **Total Steps** | 46 |
| **Estimated Time** | ~4-6 hours (with AI) |
| **Progress Tracker** | `plan/PROGRESS.md` ← **প্রতিটা step শেষে UPDATE করো** |
| **Code Rules** | `plan/RULES.md` ← coding conventions |

---

## 📁 Project Context

| Item | Value |
|------|-------|
| **Framework** | React + TypeScript + Vite |
| **Styling** | Tailwind CSS v3 |
| **State** | Zustand |
| **Desktop** | Tauri v2 |
| **Root Path** | `/Volumes/SSD/0.1/istiyak_agent_v0.1/apps/desktop_v0.2` |
| **Source Path** | `<root>/src` |

### File Tree
```
src/
├── App.tsx
├── main.tsx
├── index.css
├── types/index.ts
├── store/useChatStore.ts
├── components/
│   ├── ui/         → GlassButton, Dropdown, InputField, Avatar
│   ├── sidebar/    → SidebarContainer, SessionList, SessionItem, ProfileFooter
│   ├── chat/       → ChatWorkspace, MessageArea, ChatBubble, InputContainer
│   ├── settings/   → SettingsDrawer, EngineConfigForm, CustomProviderForm, ModelTable
│   └── library/    → 18 Rich UI Components + ComponentLibrary + index.ts + AgentActions
```

---

## ⚠️ Quick Rules (Detail → `plan/RULES.md`)

1. **`plan/PROGRESS.md` আগে পড়ো** — কি complete আর কি বাকি check করো
2. **একটা file শেষ করো → `PROGRESS.md` update করো → তারপর পরের file**
3. **Coding conventions** → `plan/RULES.md` পড়ো (import, styling, naming — সব ওখানে)
4. **কোনো existing code delete করো না** — replace only when told
5. **Phase শেষে `npm run dev` চালাও** — error check

---

## 🔷 PHASE 1: Foundation Layer (Types + Store)

> কোনো UI file touch করবে না। শুধু data structure আর state।

---

### Step 1.1 — TypeScript Interfaces

**File**: `src/types/index.ts`
**Action**: Create/overwrite this file with all interfaces.

**Interfaces (15টি, exact এই order):**

```typescript
// ---- Group 1: File & Tool Monitoring ----
export interface FileStatus {
  filePath: string;
  linesRead?: string;
  status: "idle" | "reading" | "completed";
}

export interface DiffStatus {
  filePath: string;
  diffSummary: string;
  progress: number;
  additions?: number;
  deletions?: number;
}

export interface ToolStatus {
  toolName: string;
  status: "calling" | "completed" | "denied";
}

// ---- Group 2: Plan System ----
export interface ProposedChange {
  type: "modify" | "new" | "delete";
  fileName: string;
  path: string;
  description?: string;
}

export interface PlanQuestion {
  id: string;
  text: string;
  placeholder?: string;
  options?: string[];
}

export interface ProposedPlan {
  planTitle: string;
  description: string;
  risks?: string[];
  proposedChanges: ProposedChange[];
  openQuestions?: PlanQuestion[];
}

// ---- Group 3: Task & Step Tracking ----
export interface StagedTask {
  id: string;
  label: string;
  status: "done" | "running" | "pending" | "failed";
}

export interface StepperStep {
  label: string;
  status: "done" | "current" | "pending";
}

export interface AgentEditorTab {
  id: string;
  name: string;
  isModified?: boolean;
}

// ---- Group 4: Main Message ----
export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  fileMonitor?: {
    files?: FileStatus[];
    diffs?: DiffStatus[];
    tools?: ToolStatus[];
  };
  proposedPlan?: ProposedPlan;
  planReviewState?: "approved" | "rejected" | null;
  thinkingBlock?: { thoughts: string; durationSec?: number };
  permissionRequest?: { action: string; target: string; reason: string; answered?: "granted" | "denied" };
  questionCard?: { question: string; options: string[]; answered?: string };
  stagedTasks?: StagedTask[];
  stepperSteps?: StepperStep[];
  subagentDelegation?: { agentName: string; task: string; status: "running" | "completed" | "failed"; model?: string };
  notification?: { type: "success" | "warning" | "error" | "info"; message: string };
  editorTabs?: AgentEditorTab[];
  diffLines?: Array<{ type: "addition" | "deletion" | "normal"; content: string }>;
  searchStatus?: { query: string; status: "searching" | "completed" | "failed" };
  commandExecution?: { command: string; status: "running" | "success" | "failed"; output?: string[] };
  codeBlock?: { code: string; language: string; fileName?: string; fileSize?: string };
  tokenUsage?: { inputTokens: number; outputTokens: number; cachedTokens?: number; costUSD?: number };
  apiHealth?: { services: Array<{ name: string; latencyMs: number; status: "online" | "offline" | "degraded" }> };
  performanceStats?: { tokensUsed: number; latencySec: number; speedTps: number };
  budgetGauge?: { spent: number; limit: number };
  timerStatus?: { durationSeconds: number; prompt: string };
}

// ---- Group 5: Session & Config ----
export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  activeModel: string;
  activeMode: "Plan Mode" | "Agent Mode";
  targetIDE: string;
  workspacePath?: string;
}

export interface ModelConfig {
  id: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  modelId: string;
  status: boolean;
}

export interface CustomHeader { id: string; key: string; value: string; }

export interface CustomProviderConfig {
  providerId: string;
  displayName: string;
  baseUrl: string;
  apiKey?: string;
  models: { id: string; modelId: string; name: string; reasoning: boolean }[];
  headers: CustomHeader[];
}

export interface EngineConfig {
  provider: "Google Gemini" | "OpenAI" | "Anthropic Claude" | "Ollama" | "Custom Provider";
  selectedModel: string;
  customModelName: string;
  authentication: "API Key" | "Service Account JSON";
  apiKey: string;
  serviceAccountPath: string;
  gcpProjectId: string;
  vertexRegion: string;
}

export interface ApprovalRequest {
  id: string;
  type: "file_edit" | "command_run" | "plan_proposal";
  target: string;
  description: string;
  planId?: string;
}
```

**✅ Done**: File save, no red underlines. → **Update `PROGRESS.md` Step 1.1 = [x]**

---

### Step 1.2 — Zustand Store

**File**: `src/store/useChatStore.ts`
**Action**: Create the full Zustand store.

**Structure (4 sections):**

**Section A — State Interface (L1-L51)**:
```typescript
import { create } from "zustand";
import { ChatSession, Message, ModelConfig, CustomProviderConfig, EngineConfig, ApprovalRequest } from "../types/index.js";

interface ChatState {
  // State fields
  sessions: ChatSession[];
  activeSessionId: string | null;
  models: ModelConfig[];
  customProviders: CustomProviderConfig[];
  engineConfig: EngineConfig;
  isSidebarOpen: boolean;
  isSettingsOpen: boolean;
  viewMode: "chat" | "library";
  pendingApproval: ApprovalRequest | null;
  activePlanAnswers: Record<string, string>;
  activePlanFiles: string[];
  activePlanCustomInstructions: string;

  // Action signatures
  toggleSidebar: () => void;
  setSettingsOpen: (open: boolean) => void;
  setViewMode: (mode: "chat" | "library") => void;
  respondToApproval: (approved: boolean) => void;
  updatePlanAnswer: (qId: string, val: string) => void;
  setPlanFiles: (files: string[]) => void;
  togglePlanFile: (path: string) => void;
  updatePlanCustomInstructions: (val: string) => void;
  addSession: () => void;
  selectSession: (id: string) => void;
  deleteSession: (id: string) => void;
  sendMessage: (content: string) => void;
  clearMessages: (sessionId: string) => void;
  addModel: (model: Omit<ModelConfig, "id">) => void;
  updateModel: (id: string, updated: Partial<ModelConfig>) => void;
  deleteModel: (id: string) => void;
  toggleModelStatus: (id: string) => void;
  saveCustomProvider: (provider: CustomProviderConfig) => void;
  deleteCustomProvider: (providerId: string) => void;
  updateEngineConfig: (config: Partial<EngineConfig>) => void;
}
```

**Section B — Mock Data (L53-L216)**:
- `mockSessions`: 2 sessions with sample messages showing various rich UI fields
- `mockModels`: 3 models (Gemini Pro Plan, GPT-4o Speed, DeepSeek Reasoner)
- `defaultEngineConfig`: Google Gemini, Gemini 2.5 Flash, API Key auth

**Section C — Store Actions (L218-L395)**:
- Simple state toggles: `toggleSidebar`, `setSettingsOpen`, `setViewMode`
- Plan answer/file management: `updatePlanAnswer`, `setPlanFiles`, `togglePlanFile`, `updatePlanCustomInstructions`
- Approval handler: `respondToApproval` — creates approval/rejection message, resets plan state
- Session CRUD: `addSession`, `selectSession`, `deleteSession`, `clearMessages`
- Model CRUD: `addModel`, `updateModel`, `deleteModel`, `toggleModelStatus`
- Provider CRUD: `saveCustomProvider`, `deleteCustomProvider`
- Engine config: `updateEngineConfig` — also updates active session's model

**Section D — sendMessage Keyword Logic (L398-L688)**:

**Priority order** (check in this order, first match wins):

| Priority | Check | Action | Delay |
|----------|-------|--------|-------|
| 1 | `lowerContent.includes("plan")` | Create `proposedPlan` message + set `pendingApproval` type `"plan_proposal"` | 1000ms |
| 2 | `includes("edit") \|\| includes("update") \|\| includes("modify")` | Set `pendingApproval` type `"file_edit"` | 800ms |
| 3 | `includes("run") \|\| includes("execute")` | Set `pendingApproval` type `"command_run"` | 800ms |
| 4+ | All others (generic path) | Build response with keyword-matched rich UI fields | 1000ms |

**Generic path keyword → field mapping**:

| Keyword | Sets field | Mock data |
|---------|-----------|-----------|
| `"think"` | `thinkingBlock` | `{ thoughts: "Step 1: Reading user intent...\nStep 2: ...", durationSec: 3.7 }` |
| `"permission"` | `permissionRequest` | `{ action: "write_file", target: "src/store/useChatStore.ts", reason: "Need to persist..." }` |
| `"question"` | `questionCard` | `{ question: "Which mode should I use...?", options: ["Zustand Persist", "localStorage", "In-memory"] }` |
| `"tasks"` | `stagedTasks` | 4 tasks with mixed done/running/pending/pending statuses |
| `"step"` | `stepperSteps` | 5 steps with mixed done/done/current/pending/pending |
| `"delegate"` | `subagentDelegation` | `{ agentName: "FileOps Subagent", task: "Scan and patch...", status: "running", model: "Gemini 2.5 Flash" }` |
| `"notify"` | `notification` | `{ type: "success", message: "All library components integrated..." }` |
| `"diff"` | `diffLines` + `editorTabs` | 7 diff lines + 3 editor tabs |
| `"hello"/"hi"` | `fileMonitor` (basic) | files: App.tsx, tools: view_file |
| `"monitor"/"file"/"show"/"activity"` | `fileMonitor` (with diffs) | files + diffs + tools |
| `"search"/"find"/"grep"` | `fileMonitor` (grep) | files: ComponentLibrary.tsx, tools: grep_search |
| *(default)* | `fileMonitor` (basic) | files: types/index.ts |

**✅ Done**: `npm run dev` — no errors. → **Update `PROGRESS.md` Step 1.2 = [x], Phase 1 = ✅ COMPLETE**

---

## 🔷 PHASE 2: UI Primitives

> `src/components/ui/` folder — 4 base components. বাকি সবকিছু এগুলো ব্যবহার করবে।

---

### Step 2.1 — GlassButton

**File**: `src/components/ui/GlassButton.tsx`

**Props Interface**:
```typescript
interface GlassButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  size?: "xs" | "sm" | "md";
  active?: boolean;
  disabled?: boolean;
  className?: string;
  title?: string;
}
```

**Variant styles**:
- `primary` → `bg-white text-black font-bold hover:bg-gray-100`
- `secondary` → `bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10`
- `ghost` → `bg-transparent text-gray-400 hover:bg-white/5 hover:text-white`

**Size styles**:
- `xs` → `text-[10px] px-2 py-1 gap-1`
- `sm` → `text-xs px-3 py-1.5 gap-1.5`
- `md` → `text-sm px-4 py-2 gap-2`

**Active state**: Brighter background + white text
**Disabled state**: `opacity-40 cursor-not-allowed pointer-events-none`
**Base classes**: `inline-flex items-center rounded-lg transition-all duration-200`

**✅ Done**: → **Update `PROGRESS.md` Step 2.1 = [x]**

---

### Step 2.2 — Dropdown

**File**: `src/components/ui/Dropdown.tsx`

**Props**: `label: string`, `value: string`, `options: string[]`, `onChange: (val: string) => void`, `className?: string`

**Structure**:
```tsx
<div>
  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{label}</label>
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full bg-black/30 border border-white/10 text-gray-300 text-xs py-2 px-3 rounded-lg focus:outline-none focus:border-white/20"
  >
    {options.map(opt => <option key={opt} value={opt} className="bg-[#121214]">{opt}</option>)}
  </select>
</div>
```

**✅ Done**: → **Update `PROGRESS.md` Step 2.2 = [x]**

---

### Step 2.3 — InputField

**File**: `src/components/ui/InputField.tsx`

**Props**: `label: string`, `value: string`, `onChange: (val: string) => void`, `type?: "text" | "password" | "url"`, `placeholder?: string`, `className?: string`

**Structure**:
```tsx
<div>
  <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{label}</label>
  <input
    type={type || "text"}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    className="w-full bg-black/30 border border-white/10 text-gray-300 text-xs py-2 px-3 rounded-lg focus:outline-none focus:border-white/20 focus:ring-1 focus:ring-white/10"
  />
</div>
```

**✅ Done**: → **Update `PROGRESS.md` Step 2.3 = [x]**

---

### Step 2.4 — Avatar

**File**: `src/components/ui/Avatar.tsx`

**Props**: `src?: string`, `fallback: string`, `size?: "sm" | "md"`

**Behavior**:
- Has image → show `<img>` in circle
- No image → show first letter of `fallback` in colored circle
- `sm` → `w-7 h-7 text-[10px]`, `md` → `w-9 h-9 text-xs`
- Base: `rounded-full bg-white/10 flex items-center justify-center font-bold text-gray-400`

**✅ Done**: → **Update `PROGRESS.md` Step 2.4 = [x], Phase 2 = ✅ COMPLETE**

---

## 🔷 PHASE 3: Global Styles + Tailwind Config

---

### Step 3.1 — index.css

**File**: `src/index.css`

**Exact content needed** (5 sections in order):
1. Tailwind directives: `@tailwind base; @tailwind components; @tailwind utilities;`
2. Scrollbar: `::-webkit-scrollbar` width 5px, track transparent, thumb `rgba(255,255,255,0.06)` rounded
3. Glass capsule: `.glass-capsule` — `bg: rgba(255,255,255,0.02)`, `border: 0.75px solid rgba(255,255,255,0.05)`, `backdrop-filter: blur(8px)`
4. Zenglow: `@keyframes zenglow` opacity 0.45→0.85→0.45, box-shadow pulse. `.animate-zenglow` 3s infinite
5. Scrollbar none: `.scrollbar-none::-webkit-scrollbar { display: none }` + `-ms-overflow-style: none; scrollbar-width: none`

**✅ Done**: → **Update `PROGRESS.md` Step 3.1 = [x]**

---

### Step 3.2 — tailwind.config.js

**File**: `tailwind.config.js`

**Custom tokens**:
```javascript
colors: {
  cyber: {
    dark: "#08090a",
    card: "#0d0e12",
    "card-border": "rgba(255, 255, 255, 0.05)",
    primary: "rgba(255, 255, 255, 0.95)",
    secondary: "rgba(255, 255, 255, 0.4)",
    accent: "rgba(255, 255, 255, 0.2)",
    "text-primary": "#f3f4f6",
    "text-secondary": "#a1a1aa",
    "text-muted": "#52525b",
  }
},
fontFamily: { outfit: ["Outfit", "Inter", "sans-serif"] },
backdropBlur: { xs: "2px" }
```

**✅ Done**: → **Update `PROGRESS.md` Step 3.2 = [x], Phase 3 = ✅ COMPLETE**

---

## 🔷 PHASE 4: Sidebar System

> Build order: 4.1 → 4.2 → 4.3 → 4.4 (dependency bottom-up)

---

### Step 4.1 — ProfileFooter

**File**: `src/components/sidebar/ProfileFooter.tsx`

**Imports**: `useChatStore`, `Avatar`, `GlassButton`, `Settings` icon from lucide-react

**Renders**:
- Avatar (fallback="U") + "User Name" text
- Settings gear icon → `onClick={() => setSettingsOpen(true)}`
- Small text showing current viewMode

**Layout**: `flex items-center justify-between px-4 py-3 border-t border-cyber-card-border`

**✅ Done**: → **Update `PROGRESS.md` Step 4.1 = [x]**

---

### Step 4.2 — SessionItem

**File**: `src/components/sidebar/SessionItem.tsx`

**Props**: `session: ChatSession`, `isActive: boolean`

**Renders**:
- Session title (truncated, `text-xs`)
- Model badge (tiny, `text-[9px]`, gray)
- Delete button — **only visible on hover** (`opacity-0 group-hover:opacity-100`)
- Active → brighter bg (`bg-white/5 border-l-2 border-white/20`)

**Clicks**: 
- Container click → `selectSession(session.id)`
- Delete icon click → `deleteSession(session.id)` (with `e.stopPropagation()`)

**✅ Done**: → **Update `PROGRESS.md` Step 4.2 = [x]**

---

### Step 4.3 — SessionList

**File**: `src/components/sidebar/SessionList.tsx`

**Imports**: `useChatStore`, `SessionItem`

**Renders**: `sessions.map(s => <SessionItem key={s.id} session={s} isActive={s.id === activeSessionId} />)`

**✅ Done**: → **Update `PROGRESS.md` Step 4.3 = [x]**

---

### Step 4.4 — SidebarContainer

**File**: `src/components/sidebar/SidebarContainer.tsx`

**Imports**: `useChatStore`, `Plus`, `PanelLeftClose` from lucide-react, `SessionList`, `ProfileFooter`, `GlassButton`

**Layout**:
```
┌──────────────────┐
│ COMPANION v0.2  ✕│  ← Header: title + PanelLeftClose toggle
│                  │
│ [+ New Session]  │  ← GlassButton + addSession
│                  │
│ Session 1  ✓     │  ← SessionList (flex-1 overflow-y-auto)
│ Session 2        │
│                  │
│ 👤 Profile  ⚙️   │  ← ProfileFooter
└──────────────────┘
```

**Collapsing logic**:
- `isSidebarOpen = true` → `w-64`
- `isSidebarOpen = false` → `w-0 overflow-hidden border-r-0`
- `className` includes `absolute z-30 md:relative` for mobile/desktop

**✅ Done**: → **Update `PROGRESS.md` Step 4.4 = [x], Phase 4 = ✅ COMPLETE**

---

## 🔷 PHASE 5: 18 Rich UI Components

> সব file `src/components/library/` folder এ। প্রতিটা self-contained — শুধু props নিবে।

---

### Step 5.1 — AgentToolBadge

**File**: `src/components/library/AgentToolBadge.tsx`

**Props**: `{ toolName: string; status: "calling" | "completed" | "denied" }`

**Renders**: Small inline pill `<span>`:
- Icon (🔧) + `toolName` text + status dot
- `completed` → green dot (`bg-emerald-400`)
- `calling` → yellow pulsing dot (`bg-yellow-400 animate-pulse`)
- `denied` → red dot (`bg-red-400`)
- Base: `inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[9px] text-gray-400`

---

### Step 5.2 — AgentReadingFile

**File**: `src/components/library/AgentReadingFile.tsx`

**Props**: `{ files: FileStatus[] }`

**Renders**: Vertical list of file entries:
```
📄 src/components/chat/ChatBubble.tsx  L15-L48  ⟳ reading
📄 src/App.tsx                         L1-L43   ✓ completed
```
- `completed` → `text-emerald-400` + ✓
- `reading` → `text-yellow-400` + spinning icon
- `idle` → `text-gray-500` + ○
- File path in `font-mono text-[10px]`, line range in `text-gray-500`

---

### Step 5.3 — AgentWritingDiff

**File**: `src/components/library/AgentWritingDiff.tsx`

**Props**: `{ diffs: DiffStatus[] }`

**Renders**: Cards with progress bars:
```
📝 ChatBubble.tsx — "Add glassmorphic file monitor block"
[████████░░░░░] 45%   +18  -1
```
- Progress bar: colored fill based on percentage
- `+additions` in green, `-deletions` in red

---

### Step 5.4 — AgentSearchStatus

**File**: `src/components/library/AgentSearchStatus.tsx`

**Props**: `{ query: string; status: "searching" | "completed" | "failed" }`

**Renders**: One-line status:
- 🔍 `query` text + status badge
- `searching` → yellow pulse, `completed` → green, `failed` → red

---

### Step 5.5 — AgentPerformanceStats

**File**: `src/components/library/AgentPerformanceStats.tsx`

**Props**: `{ tokensUsed: number; latencySec: number; speedTps: number }`

**Renders**: 3 stat boxes inline:
```
⚡ 15,650 tokens  |  ⏱️ 2.34s  |  🚀 92 tps
```

---

### Step 5.6 — BudgetGauge

**File**: `src/components/library/BudgetGauge.tsx`

**Props**: `{ spent: number; limit: number }`

**Renders**: Horizontal bar:
```
💰 $1.24 / $5.00  [█████████░░░░░░] 24.8%
```
- Green when < 50%, yellow 50-80%, red > 80%

---

### Step 5.7 — APIHealthMonitor

**File**: `src/components/library/APIHealthMonitor.tsx`

**Props**: `{ services: Array<{ name: string; latencyMs: number; status: "online" | "offline" | "degraded" }> }`

**Renders**: Rows:
```
● gemini-2.5-flash   240ms   🟢 online
● claude-3.5-sonnet  380ms   🟢 online
● local-cache         15ms   🟢 online
```
- `online` → green, `offline` → red, `degraded` → yellow

---

### Step 5.8 — AgentTimerStatus

**File**: `src/components/library/AgentTimerStatus.tsx`

**Props**: `{ durationSeconds: number; prompt: string }`

**Renders**: `⏲️ Timer set: 60s — "Check if build completed"`

---

### Step 5.9 — AgentThinkingBlock

**File**: `src/components/library/AgentThinkingBlock.tsx`

**Props**: `{ thoughts: string; durationSec?: number }`

**State**: `const [isExpanded, setIsExpanded] = useState(false)`

**Renders**:
- **Collapsed** (default): `🧠 Thinking... (3.7s)` — click to expand
- **Expanded**: Full thoughts text in `font-mono text-[10px]` whitespace-pre-wrap block
- Toggle: click header toggles `isExpanded`
- Style: `bg-white/[0.02] border border-white/5 rounded-lg`

---

### Step 5.10 — InlineNotification

**File**: `src/components/library/InlineNotification.tsx`

**Props**: `{ type: "success" | "warning" | "error" | "info"; message: string }`

**Renders**: Banner with icon + message:
- `success` → green-tinted bg + ✅ icon
- `warning` → yellow-tinted bg + ⚠️ icon
- `error` → red-tinted bg + ❌ icon
- `info` → blue-tinted bg + ℹ️ icon
- Rounded-lg, subtle background tint

---

### Step 5.11 — StagedTaskList

**File**: `src/components/library/StagedTaskList.tsx`

**Props**: `{ tasks: StagedTask[] }`

**Renders**: Vertical checklist:
```
✓ Scan project for affected files        (done - green, strikethrough optional)
⟳ Apply diff to ChatBubble.tsx           (running - yellow, bold)
○ Run TypeScript compile check           (pending - gray)
○ Verify in browser at port 1421         (pending - gray)
```

---

### Step 5.12 — AgentStepper

**File**: `src/components/library/AgentStepper.tsx`

**Props**: `{ steps: StepperStep[] }`

**Renders**: Horizontal/vertical timeline:
```
(●)——(●)——(◉)——(○)——(○)
Done  Done  Now  Wait  Wait
```
- `done` → filled green circle + line
- `current` → pulsing white/cyan circle
- `pending` → empty gray circle

---

### Step 5.13 — SubagentDelegationCard

**File**: `src/components/library/SubagentDelegationCard.tsx`

**Props**: `{ agentName: string; task: string; status: "running" | "completed" | "failed"; model?: string }`

**Renders**: Glass card:
```
🤖 FileOps Subagent              [Gemini 2.5 Flash]
   Task: Scan and patch all responsive breakpoints...
   Status: ⟳ Running
```

---

### Step 5.14 — AgentDiffViewer

**File**: `src/components/library/AgentDiffViewer.tsx`

**Props**: `{ diffLines: Array<{ type: "addition" | "deletion" | "normal"; content: string }> }`

**Renders**: Code block with colored lines:
```
  import React from 'react';
- const MAX_MESSAGES = 50;
+ const MAX_MESSAGES = 200;
  
-   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
+   const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('chat');
```
- `addition` → `bg-emerald-500/10 text-emerald-300`, prefix `+`
- `deletion` → `bg-red-500/10 text-red-300`, prefix `-`
- `normal` → no bg, prefix ` `
- `font-mono text-[11px]`, rounded container

---

### Step 5.15 — AgentPermissionRequestCard

**File**: `src/components/library/AgentPermissionRequestCard.tsx`

**Props**: `{ action: string; target: string; reason: string; answered?: "granted" | "denied" }`

**State**: `const [localAnswered, setLocalAnswered] = useState(answered)`

**Renders**:
- **Unanswered**: Card with action/target/reason + Grant (green) / Deny (red) buttons
- **Answered**: Confirmed status with checkmark or cross

---

### Step 5.16 — AgentQuestionCard

**File**: `src/components/library/AgentQuestionCard.tsx`

**Props**: `{ question: string; options: string[]; answered?: string }`

**State**: `selectedOption`, `isAnswered`

**Renders**:
- **Unanswered**: Question text + radio/pill options + Submit button
- **Answered**: "Answered: [selected option]" confirmation

---

### Step 5.17 — CodeBlockPreview

**File**: `src/components/library/CodeBlockPreview.tsx`

**Props**: `{ code: string; language: string; fileName?: string; fileSize?: string }`

**State**: `const [copied, setCopied] = useState(false)`

**Renders**:
- Header: fileName + language badge + fileSize + Copy button
- Body: `<pre><code>` with basic syntax highlighting (keywords bold, strings colored)
- Copy: `navigator.clipboard.writeText(code)` → show "Copied!" 2s

---

### Step 5.18 — TokenCostBreakdown

**File**: `src/components/library/TokenCostBreakdown.tsx`

**Props**: `{ inputTokens: number; outputTokens: number; cachedTokens?: number; costUSD?: number }`

**Renders**: 4 stat cards inline:
```
📥 Input: 12,450  |  📤 Output: 3,200  |  💾 Cached: 45,000  |  💲 $0.08
```
- Numbers formatted with comma separators

---

### Step 5.19 — AgentImplementationPlanCard

**File**: `src/components/library/AgentImplementationPlanCard.tsx`

**Props**: `{ proposedPlan: ProposedPlan; planReviewState?: "approved" | "rejected" | null; planId: string }`

**Store access**: `activePlanAnswers`, `activePlanFiles`, `activePlanCustomInstructions`, `togglePlanFile`, `updatePlanAnswer`, `updatePlanCustomInstructions`

**Renders (sections in order)**:
1. **Title bar**: `planTitle` + description
2. **Risks**: Warning-styled list items
3. **Proposed Changes**: Table — type badge (new/modify/delete) + fileName + description + checkbox (connected to `activePlanFiles`)
4. **Open Questions**: For each → radio options or text input (connected to `activePlanAnswers`)
5. **Custom Instructions**: Textarea (connected to `activePlanCustomInstructions`)
6. **Review overlay**: If `"approved"` → green border/overlay. If `"rejected"` → red border/overlay.

---

### Step 5.20 — Barrel Export

**File**: `src/components/library/index.ts`

**Content**: Re-export all 18 components + AgentActions:
```typescript
export { AgentToolBadge } from "./AgentToolBadge.js";
export { AgentReadingFile } from "./AgentReadingFile.js";
export { AgentWritingDiff } from "./AgentWritingDiff.js";
export { AgentSearchStatus } from "./AgentSearchStatus.js";
export { AgentPerformanceStats } from "./AgentPerformanceStats.js";
export { BudgetGauge } from "./BudgetGauge.js";
export { APIHealthMonitor } from "./APIHealthMonitor.js";
export { AgentTimerStatus } from "./AgentTimerStatus.js";
export { AgentThinkingBlock } from "./AgentThinkingBlock.js";
export { InlineNotification } from "./InlineNotification.js";
export { StagedTaskList } from "./StagedTaskList.js";
export { AgentStepper } from "./AgentStepper.js";
export { SubagentDelegationCard } from "./SubagentDelegationCard.js";
export { AgentDiffViewer } from "./AgentDiffViewer.js";
export { AgentPermissionRequestCard } from "./AgentPermissionRequestCard.js";
export { AgentQuestionCard } from "./AgentQuestionCard.js";
export { CodeBlockPreview } from "./CodeBlockPreview.js";
export { TokenCostBreakdown } from "./TokenCostBreakdown.js";
export { AgentImplementationPlanCard } from "./AgentImplementationPlanCard.js";
export { AcceptRejectPills, EditorTabs } from "./AgentActions.js";
```

---

### Step 5.21 — AgentActions (EditorTabs + AcceptRejectPills)

**File**: `src/components/library/AgentActions.tsx`

**Exports 2 components**:

**EditorTabs**:
- Props: `tabs: AgentEditorTab[]`, `activeTabId: string`, `onSelectTab: (id: string) => void`, `onCloseTab: (id: string) => void`
- Renders: Horizontal scrollable tab bar. Each tab: file name + modified dot (blue) + close X button
- Active tab: brighter bg

**AcceptRejectPills**:
- Props: `onAccept: () => void`, `onReject: () => void`, `acceptLabel?: string`, `rejectLabel?: string`
- Renders: Two pill buttons — Accept (green tint) + Reject (red tint)
- Default labels: "Approve" / "Reject"

**✅ Phase 5 Done**: All 21 steps complete → **Update `PROGRESS.md` Phase 5 = ✅ COMPLETE**

---

## 🔷 PHASE 6: Chat System

---

### Step 6.1 — MessageArea

**File**: `src/components/chat/MessageArea.tsx`

**Props**: `{ messages: Message[] }`

**Behavior**:
- `messages.map(msg => <ChatBubble key={msg.id} message={msg} />)`
- Auto-scroll: `useRef<HTMLDivElement>` on container end + `useEffect` scrolls on messages change
- Style: `flex-1 overflow-y-auto px-4 py-6 space-y-4`

---

### Step 6.2 — ChatBubble ⭐ (Most Important)

**File**: `src/components/chat/ChatBubble.tsx`

**Props**: `{ message: Message }`

**Imports**: ALL 18 components from `../library/index.js`

**Rendering Order** (exact):
1. Wrapper — user: right-aligned, assistant: left-aligned
2. Avatar/icon for assistant
3. Message content text (`<p>`)
4. Timestamp (`text-[9px] text-gray-500`)
5. Rich components (ONLY for assistant, in this order):
   - `thinkingBlock` → `<AgentThinkingBlock />`
   - `searchStatus` → `<AgentSearchStatus />`
   - `fileMonitor.files` → `<AgentReadingFile />`
   - `fileMonitor.diffs` → `<AgentWritingDiff />`
   - `fileMonitor.tools` → `<AgentToolBadge />` (mapped)
   - `commandExecution` → `<AgentCommandExecution />`
   - `codeBlock` → `<CodeBlockPreview />`
   - `diffLines` → `<AgentDiffViewer />`
   - `permissionRequest` → `<AgentPermissionRequestCard />`
   - `questionCard` → `<AgentQuestionCard />`
   - `stagedTasks` → `<StagedTaskList />`
   - `stepperSteps` → `<AgentStepper />`
   - `subagentDelegation` → `<SubagentDelegationCard />`
   - `notification` → `<InlineNotification />`
   - `proposedPlan` → `<AgentImplementationPlanCard />`
   - Stats group: `tokenUsage` + `performanceStats` + `budgetGauge`
   - `apiHealth` → `<APIHealthMonitor />`

**User bubble style**: `bg-white/[0.03] border border-white/5 rounded-2xl rounded-br-md`
**Assistant bubble style**: `bg-transparent` or `bg-white/[0.02] rounded-2xl rounded-bl-md`

---

### Step 6.3 — InputContainer

**File**: `src/components/chat/InputContainer.tsx`

**Layout**:
```
┌────────────────────────────────────────────────┐
│ [Agent Mode][Plan Mode] Target: IDE ▾  🔧 M ▾  │ ← top row
│────────────────────────────────────────────────│
│ Ask a question...                          [↑] │ ← bottom row
└────────────────────────────────────────────────┘
```

**Features**:
1. Mode selector — 2 GlassButton toggles (Agent/Plan)
2. Target IDE — dropdown with click-outside-close: Antigravity IDE, VS Code, Cursor, WebStorm, Directory
3. Model selector — `<select>` with active models
4. Textarea — auto-grow, Enter=send, Shift+Enter=newline
5. Send button — disabled when empty

**Store**: `sendMessage`, `sessions`, `activeSessionId`, `models`, `updateEngineConfig`

---

### Step 6.4 — ChatWorkspace

**File**: `src/components/chat/ChatWorkspace.tsx`

**Layout**:
```
┌────────────────────────────────────────────┐
│ [EditorTabs row]                            │ ← conditional
│────────────────────────────────────────────│
│                                            │
│            MessageArea                     │ ← flex-1
│                                            │
│────────────────────────────────────────────│
│ [ApprovalBar: target + Accept/Reject]      │ ← conditional
│ [InputContainer]                           │
└────────────────────────────────────────────┘
```

**EditorTabs** (top): Shows when latest message has `editorTabs` field
**ApprovalBar** (above input): Shows when `pendingApproval !== null`
- Shows type label + target + `<AcceptRejectPills />`

**Empty state**: When no active session → show "Create or select a session to get started."

**✅ Phase 6 Done**: → **Update `PROGRESS.md` Phase 6 = ✅ COMPLETE**

---

## 🔷 PHASE 7: Settings Drawer

---

### Step 7.1 — EngineConfigForm

**File**: `src/components/settings/EngineConfigForm.tsx`

**Provider → Model mapping**:
```
Google Gemini     → Gemini 2.5 Flash, Gemini 2.5 Pro, Gemini 3.5 Pro, Gemini 2.0 Flash, Custom Model
OpenAI            → GPT-4o, GPT-4 Turbo, Custom Model
Anthropic Claude  → Claude 3.5 Sonnet, Custom Model
Ollama            → Llama 3, Mistral, Custom Model
Custom Provider   → Custom Model
```

**Conditional fields**:
| Field | When visible |
|-------|-------------|
| Custom Model Name | selectedModel === "Custom Model" |
| Authentication dropdown | provider === "Google Gemini" |
| Service Account Path | auth === "Service Account JSON" |
| GCP Project ID | provider === "Google Gemini" |
| Vertex Region | provider === "Google Gemini" |

---

### Step 7.2 — ModelTable

**File**: `src/components/settings/ModelTable.tsx`

**CRUD operations**: `addModel`, `updateModel`, `deleteModel`, `toggleModelStatus`

**Layout**: Table/list with columns: Name, Base URL, API Key (masked), Model ID, Status toggle, Edit/Delete buttons

---

### Step 7.3 — CustomProviderForm

**File**: `src/components/settings/CustomProviderForm.tsx`

**Dynamic sections**:
1. Static fields: Provider ID, Display Name, Base URL, API Key
2. **Models list**: Add/remove rows — Model ID + Name + Reasoning toggle
3. **Headers list**: Add/remove rows — Key + Value
4. Save button → `saveCustomProvider()`

---

### Step 7.4 — SettingsDrawer

**File**: `src/components/settings/SettingsDrawer.tsx`

**Visibility**: `if (!isSettingsOpen) return null`

**Structure**:
- Backdrop overlay → click closes
- Right-side drawer (`max-w-xl`)
- Header: title + Library toggle button + close X
- Tab bar: Engine Config | Custom Providers | Manage Models
- Scrollable content: renders active tab's form

**✅ Phase 7 Done**: → **Update `PROGRESS.md` Phase 7 = ✅ COMPLETE**

---

## 🔷 PHASE 8: App Root + Library Playground

---

### Step 8.1 — App.tsx

**File**: `src/App.tsx`

**Structure**:
```tsx
export default function App() {
  const { isSidebarOpen, toggleSidebar, viewMode } = useChatStore();
  return (
    <div className="w-screen h-screen overflow-hidden flex bg-cyber-dark font-outfit text-gray-200 relative select-none">
      <SidebarContainer />
      {isSidebarOpen && <div onClick={toggleSidebar} className="md:hidden fixed inset-0 bg-black/60 z-20 backdrop-blur-sm" />}
      {viewMode === "chat" ? <ChatWorkspace /> : <ComponentLibrary />}
      <SettingsDrawer />
      {!isSidebarOpen && viewMode !== "chat" && <FloatingSidebarToggle />}
    </div>
  );
}
```

---

### Step 8.2 — ComponentLibrary

**File**: `src/components/library/ComponentLibrary.tsx`

**Purpose**: Playground view — all 18 components rendered with mock data for preview/testing.

**✅ Phase 8 Done**: → **Update `PROGRESS.md` Phase 8 = ✅ COMPLETE**

---

## 🔷 PHASE 9: Verification

---

### Step 9.1 — Build Check
```bash
npm run build
```
Expected: Zero TypeScript errors, zero build failures.

### Step 9.2 — Dev Server Check
```bash
npm run dev
```
Expected: App loads, all features accessible.

### Step 9.3 — 25-Point Feature Checklist

| # | Test | ✓ |
|---|------|---|
| 1 | Sidebar opens/closes | |
| 2 | New session creates | |
| 3 | Sessions switch on click | |
| 4 | Session deletes | |
| 5 | Messages send (Enter) | |
| 6 | `think` → ThinkingBlock | |
| 7 | `permission` → PermissionCard | |
| 8 | `question` → QuestionCard | |
| 9 | `tasks` → TaskList | |
| 10 | `step` → Stepper | |
| 11 | `delegate` → DelegationCard | |
| 12 | `notify` → Notification | |
| 13 | `diff` → DiffViewer + EditorTabs | |
| 14 | `plan` → PlanCard + ApprovalBar | |
| 15 | `edit` → File edit approval | |
| 16 | `run` → Command approval | |
| 17 | Accept/Reject pills work | |
| 18 | Settings opens via ⚙️ | |
| 19 | Engine config saves | |
| 20 | Model CRUD works | |
| 21 | Custom provider saves | |
| 22 | Library Playground shows all components | |
| 23 | Mode selector toggles Agent/Plan | |
| 24 | Model dropdown changes model | |
| 25 | Target IDE selector works | |

**✅ Phase 9 Done**: → **Update `PROGRESS.md` all phases ✅, header = "# ✅ TASK COMPLETE ALL"**
