# 🧠 Checkpoint-Based Task Ledger — Master Guide v2.0

## যেকোনো Project এ যেকোনো AI Model দিয়ে Best Output পাওয়ার System

---

## 📌 এটা কি?

একটা **structured execution system** যেটা যেকোনো AI model কে (ছোট বা বড়) সঠিকভাবে guide করে project complete করতে সাহায্য করে — কোনো confusion, skip, বা duplicate ছাড়াই।

### Core Concept
```
Agent আসে → PROGRESS.md পড়ে → বুঝে কোথায় আছে → কাজ করে → update করে → চলে যায়
পরের Agent আসে → PROGRESS.md পড়ে → resume করে → কোনো context loss নেই
```

---

## 📁 System Architecture

```
your-project/
├── .agents/
│   └── AGENTS.md           ← 🤖 Auto-loaded workflow rules (HOW to work)
├── plan/
│   ├── PROGRESS.md         ← 🔴 Progress tracker (WHERE we are) — READ FIRST
│   ├── RULES.md            ← ⚠️ Code rules (WHAT conventions to follow)
│   ├── plan_01.md          ← 📋 Detailed plan (WHAT to do — step by step)
│   ├── SYSTEM_GUIDE.md     ← 📖 This guide (WHY this system works)
│   └── PROMPTS.md          ← 💬 Manual prompts (for non-auto-loading tools)
├── src/
│   └── ...
```

### V2 Architecture — 4-File Separation

| File | Role | Contents | কখন পড়বে |
|------|------|----------|-----------|
| **AGENTS.md** | HOW to work | Workflow rules, error recovery, reading order | Auto-loaded প্রতি session |
| **RULES.md** | WHAT rules | Import, styling, naming, verification | কাজ শুরুর আগে |
| **PROGRESS.md** | WHERE we are | Checkboxes, %, metadata, blockers, log | **সবার আগে, প্রতিবার** |
| **plan_01.md** | WHAT to do | Step-by-step details, code, props, layouts | Step execute করার সময় |

> **V1 তে** code rules AGENTS.md তে hardcoded ছিল। **V2 তে** আলাদা RULES.md — dynamic, project-specific।

---

## 🚀 কিভাবে Use করবে

### Phase A: Setup (তুমি একবার করবে)

#### নতুন Project এ System Setup:

```
1. plan/ folder বানাও
2. .agents/AGENTS.md বানাও (workflow rules — copy from template)
3. plan/RULES.md বানাও (project-specific code rules)
4. AI কে বলো: "আমার requirement এটা — plan বানাও"
5. AI plan/PROGRESS.md + plan/plan_01.md বানাবে
6. Review করো, approve করো
7. কাজ শুরু!
```

#### Existing Project এ System যোগ করতে:
```
1. plan/ folder বানাও
2. .agents/AGENTS.md copy করো (from any previous project)
3. AI কে বলো: "এই project analyze করো + plan বানাও"
4. AI সব files generate করবে
```

---

### Phase B: Execution (AI Model করবে — Automatic!)

#### Antigravity IDE তে (Auto-loaded):
```
শুধু নতুন chat খোলো — AGENTS.md auto-load হবে
Agent নিজেই PROGRESS.md → RULES.md → plan_01.md পড়বে
কাজ শুরু করবে, update করবে
```

#### অন্য AI Tools এ (Manual prompt needed):
```
PROMPTS.md থেকে appropriate prompt copy করো
ChatGPT / Claude / other AI তে paste করো
```

---

### Phase C: Resume / Model Swap

```
নতুন session বা model swap হলে:
→ Agent PROGRESS.md পড়ে → বুঝে কোথায় আছে → continue করে
→ কোনো manual briefing দরকার নেই
→ PROGRESS.md = automatic checkpoint system
```

---

## 📝 Template: PROGRESS.md

```markdown
# 🔴 STATUS: IN PROGRESS — NOT COMPLETE

## 🎯 Project Metadata
| Key | Value |
|-----|-------|
| **Project** | [name] |
| **Framework** | [tech stack] |
| **Started** | [date] |
| **Last Updated** | — |
| **Last Agent** | — |
| **Active Plan** | plan/plan_01.md |

## 📊 Overall Progress
[░░░░░░░░░░░░░░░░░░░░] 0% (0/N steps)

👉 **NEXT**: Step 1.1 — [title] (`file/path`)

## 🚧 BLOCKERS
> কোনো blocker নেই। ✅

## 🔷 Phase 1: [Name] — 🔴 0% PENDING
> ⚠️ Depends on: [dependencies]
- [ ] **Step 1.1** — [Title] (`file/path`)
  - [1-line summary]

<!--
UPDATE LOG:
[DATE TIME] Step X.X — note | Agent: [model]
-->
```

---

## 📝 Template: RULES.md

```markdown
# ⚠️ CODE RULES — এই Project এর Coding Conventions

## Project Info
| Key | Value |
|-----|-------|
| Framework | [React/Vue/etc.] |
| Styling | [Tailwind/CSS/etc.] |
| State | [Zustand/Redux/etc.] |

## Import Convention
- [extension rule]
- [import order]

## Styling
- [color tokens]
- [font]

## Component Pattern
- [export pattern]
- [safety rules]

## Verification
- [dev command]
- [build command]
```

---

## 📝 Template: plan_01.md Step

```markdown
### Step X.X — [Clear Title]

**File**: `exact/file/path.tsx`
**Action**: Create / Modify / Delete

**কি করবে**: [Plain language description]

**Exact Details**: [Code snippet / prop interface / layout diagram]

**✅ Done check**: [How to verify → Update PROGRESS.md Step X.X = [x]]
```

---

## 💡 Best Practices

### 1. Plan Quality Rules
| ❌ Bad | ✅ Good |
|--------|---------|
| "Build the entire sidebar" | "Step 4.1: Create ProfileFooter component with avatar + settings icon" |
| "Add all components" | "Step 5.1: Create AgentToolBadge — props: toolName, status → renders pill badge" |
| "Fix the UI" | "Step 3.1: Add scrollbar CSS to index.css — 5 sections in exact order" |

### 2. Phase Size
- **3-8 steps per phase** — sweet spot
- Too many → agent confused
- Too few → overhead of phase tracking

### 3. Step Atomicity
- **1 step = 1 file** — always
- Multiple files per step → model confused হয়

### 4. Explicit Details
- Props/interfaces exact দাও — guessing হলে bug হয়
- Mock data দাও — AI guess করলে inconsistent হয়
- Visual layouts দাও — ASCII diagrams help

### 5. Dependency Order
- যেটা depend করে সেটা পরে আসবে
- `> Build order: 4.1 → 4.2 → 4.3 → 4.4 (bottom-up)`

---

## 📊 Results Comparison

| Without This System | With This System V2 |
|---------------------|---------------------|
| Model forgets context | PROGRESS.md = automatic checkpoint |
| Steps get skipped/duplicated | Checkboxes + log track everything |
| Different models conflict | RULES.md enforces consistency |
| No resume capability | 👉 NEXT pointer = instant resume |
| No error tracking | 🚧 BLOCKERS section |
| No dependency awareness | Depends on: metadata per phase |
| Manual prompt every time | AGENTS.md auto-loads |
| Code rules scattered | RULES.md = single source of truth |

---

## 📊 Progress Markers

| State | Marker |
|-------|--------|
| Step pending | `- [ ] Step X.X` |
| Step complete | `- [x] Step X.X` |
| Step blocked | `- [!] Step X.X — BLOCKED: reason` |
| Phase pending | `🔴 0% PENDING` |
| Phase in progress | `🟡 60% IN PROGRESS` |
| Phase complete | `✅ 100% COMPLETE` |
| All done | `# ✅ TASK COMPLETE ALL` |

---

*এই system V2 — আরো dynamic, clear, আর advanced। যেকোনো project এ reuse করতে পারো।* ✅
