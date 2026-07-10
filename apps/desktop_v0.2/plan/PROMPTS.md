# 🎯 Ready-Made Prompts — Copy-Paste করো, বারবার লিখতে হবে না

---

## 📋 Prompt 1: কাজ শুরু করার Prompt (FIRST TIME)

> প্রথমবার কোনো model কে কাজ দেওয়ার সময় এটা paste করো:

```
তুমি এখন এই project এ কাজ করবে। নিচের steps exact follow করো:

1. FIRST → Read `plan/PROGRESS.md` — understand what's done vs pending
2. THEN → Read `plan/plan_01.md` — find the NEXT incomplete step (marked [ ])
3. Start working on that step. Follow the exact instructions in plan_01.md
4. After completing the step:
   - Update `plan/PROGRESS.md` → mark that step as [x]
   - Update the phase percentage
   - Add entry to UPDATE LOG at bottom
5. Move to the next step. Continue until the current phase is fully complete.
6. After completing a phase → update its header to ✅ COMPLETE
7. When ALL phases are done → change top header to: # ✅ TASK COMPLETE ALL

IMPORTANT RULES:
- Work on ONE step at a time
- DO NOT skip steps
- DO NOT modify steps already marked [x]
- Follow existing code patterns and naming conventions
- Run `npm run dev` after each phase to verify no errors

Start now. Report what you completed.
```

---

## 🔄 Prompt 2: Resume / Continue করার Prompt (MODEL SWAP বা NEW SESSION)

> Model change হলে, context হারালে, বা নতুন chat session শুরু করলে এটা paste করো:

```
তুমি একটা ongoing project এ কাজ continue করবে।

1. Read `plan/PROGRESS.md` — see what's already completed and what's next
2. Read `plan/plan_01.md` — get details for the next pending step
3. Continue from where the last model stopped
4. After each step → update PROGRESS.md (mark [x], update %, add log entry)
5. Continue until current phase is complete

DO NOT redo completed steps. Start from the next [ ] step.
```

---

## ⚡ Prompt 3: Specific Phase কাজ করার Prompt

> যদি specific phase কাজ করাতে চাও (e.g., Phase 5):

```
তুমি এখন এই project এর **Phase [NUMBER]** এ কাজ করবে।

1. Read `plan/PROGRESS.md` — check Phase [NUMBER] status
2. Read `plan/plan_01.md` — find Phase [NUMBER] section
3. Complete ALL pending steps in Phase [NUMBER] (marked [ ])
4. After each step → update PROGRESS.md
5. When Phase [NUMBER] is fully done → mark it ✅ COMPLETE in PROGRESS.md

Follow exact instructions from plan_01.md. One step at a time.
```

**Example**: "Phase 5" → replace `[NUMBER]` with `5`

---

## 🔧 Prompt 4: Specific Step কাজ করার Prompt

> শুধু একটা specific step করাতে চাইলে:

```
তুমি এখন এই project এর **Step [X.Y]** complete করবে।

1. Read `plan/plan_01.md` — find Step [X.Y]
2. Follow the exact instructions for that step
3. After completing → update `plan/PROGRESS.md`:
   - Mark Step [X.Y] as [x]
   - Update phase percentage
   - Add log entry

Only do this ONE step. Nothing else.
```

**Example**: "Step 5.9" → replace `[X.Y]` with `5.9`

---

## ✅ Prompt 5: Verification করার Prompt

> সব কাজ শেষে verify করাতে:

```
তুমি এই project এর final verification করবে।

1. Read `plan/PROGRESS.md` — confirm ALL steps are [x]
2. Run `npm run build` — check for TypeScript/build errors
3. Run `npm run dev` — check app loads correctly
4. Go through the Feature Checklist in plan_01.md Phase 9
5. If everything passes → update PROGRESS.md top header to: # ✅ TASK COMPLETE ALL
6. Report any failures or issues found.
```

---

## 🐛 Prompt 6: Bug Fix / Error Fix করার Prompt

> কোনো step এ error আসলে:

```
Step [X.Y] এ error আসছে। Fix করো।

Error details:
[paste error message here]

Rules:
1. Read `plan/plan_01.md` Step [X.Y] for context
2. Fix the error in the specified file
3. DO NOT change other files
4. After fixing → verify with `npm run dev`
5. Update PROGRESS.md log with fix note
```

---

## 📐 Prompt 7: নতুন Project এর Plan বানানোর Prompt

> যেকোনো নতুন project এ plan বানাতে চাইলে:

```
আমি একটা নতুন project করতে চাই। Requirements:

[তোমার project requirement এখানে লেখো]

এটাকে আমার "Checkpoint-Based Task Ledger" system এ convert করো। 
3টা file বানাও `plan/` folder এ:

1. `plan/PROGRESS.md` — Progress tracker file:
   - Top এ status header (🔴 IN PROGRESS)
   - Overall progress table (Phase | Name | Steps | Status)
   - প্রতিটা phase এর under এ steps checkbox list
   - নিচে UPDATE LOG section
   
2. `plan/plan_01.md` — Detailed plan:
   - প্রতিটা step এ: File path, Action, কি করবে, Exact code/props, Done check
   - Steps atomic রাখো (1 step = 1 file)
   - Dependency order maintain করো
   - Phase শেষে verification step রাখো

3. `plan/RULES.md` — Project-specific rules:
   - Coding conventions
   - Import patterns
   - Styling approach
   - File naming rules

Plan এমনভাবে লেখো যে যেকোনো ছোট AI model ও সহজে follow করতে পারে।
```

---

## 🔁 Prompt 8: Multi-Step Batch Prompt (একসাথে অনেক step)

> যদি চাও model একটু বেশি কাজ করুক এক prompt এ:

```
তুমি এখন এই project এ Step [X.Y] থেকে Step [X.Z] পর্যন্ত কাজ করবে।

1. Read `plan/PROGRESS.md` → verify these steps are pending
2. Read `plan/plan_01.md` → get details for Steps [X.Y] through [X.Z]
3. Complete them in ORDER — one by one
4. After EACH step → update PROGRESS.md
5. Report all completed steps at the end

Do not skip any step. Do not go beyond Step [X.Z].
```

---

## 🔀 Prompt 9: Raw/Unformatted Plan কে Task Ledger Format এ Convert করো

> তোমার কাছে একটা plan আছে (নিজে লেখা / ChatGPT / Claude / কোথাও থেকে কপি করা) কিন্তু সেটা proper format এ নেই। এটা paste করো:

```
নিচে একটা raw/unformatted plan দিচ্ছি। এটাকে আমার "Checkpoint-Based Task Ledger" format এ convert করো।

Convert Rules:
1. Plan analyze করো — সব tasks/features identify করো
2. Logical phases এ ভাগ করো (dependency order অনুযায়ী)
3. প্রতিটা phase এর tasks কে atomic steps এ ভাঙো (1 step = 1 file)
4. প্রতিটা step এ 5টা element রাখো:
   - File: exact file path
   - Action: Create / Modify / Delete
   - কি করবে: plain description
   - Exact Details: code/props/interface/layout
   - Done check: verification method

3টা file generate করো `plan/` folder এ:

FILE 1 → `plan/PROGRESS.md`:
- Top: `# 🔴 STATUS: IN PROGRESS — NOT COMPLETE`
- Overall progress table
- প্রতিটা phase with checkbox steps
- Bottom: UPDATE LOG section

FILE 2 → `plan/plan_01.md`:
- Full detailed instructions per step
- Exact code, props, layouts, mock data
- Phase verification steps

FILE 3 → `plan/RULES.md`:
- Project coding conventions extracted from the plan
- Import patterns, naming rules, styling approach

--- RAW PLAN START ---
[এখানে তোমার raw plan paste করো]
--- RAW PLAN END ---
```

---

## 📄 Prompt 10: Existing File/Doc থেকে Plan বানাও

> তোমার কাছে একটা requirement doc, README, বা feature list আছে — সেটা থেকে plan বানাতে:

```
নিচের document/file টা পড়ো এবং এটা থেকে একটা complete implementation plan বানাও 
"Checkpoint-Based Task Ledger" format এ।

Document path: [FILE PATH or paste content]

Steps:
1. Document টা fully analyze করো
2. সব features/requirements extract করো
3. Dependency tree বানাও (কোনটা আগে, কোনটা পরে)
4. Phases এ ভাগ করো (3-8 steps per phase)
5. প্রতিটা step atomic রাখো (1 step = 1 file)
6. 3টা file generate করো:
   - plan/PROGRESS.md (tracker)
   - plan/plan_01.md (detailed steps with exact code)
   - plan/RULES.md (coding rules)

IMPORTANT:
- Steps এ exact file paths দাও
- Props/interfaces exact লেখো (guessing নয়)
- Mock data দাও where needed
- Visual ASCII layouts দাও complex components এ
- শেষে Verification phase রাখো
```

---

## 🧹 Prompt 11: Existing Plan কে Improve/Reformat করো

> তোমার plan/ folder এ already plan আছে কিন্তু ঠিকমতো structured না, বা update দরকার:

```
আমার project এ `plan/` folder এ files আছে কিন্তু properly formatted না।

1. Read ALL files in `plan/` folder
2. Analyze the current plan structure
3. Reformat and improve to proper Task Ledger format:

   PROGRESS.md fixes:
   - Top header: status indicator (🔴/🟡/✅)
   - Overall progress table with percentages
   - Checkbox list for every step
   - UPDATE LOG section at bottom

   plan_01.md fixes:
   - Every step must have: File path, Action, Description, Exact Details, Done check
   - Steps must be atomic (1 step = 1 file)
   - Dependency order must be correct
   - Add missing code snippets/props/interfaces
   - Add verification phase at end

   RULES.md:
   - Create if missing
   - Extract coding conventions from existing code

4. Keep all existing content — just restructure and fill gaps
5. Sync PROGRESS.md checkboxes with plan_01.md steps (match 1:1)

DO NOT change any actual project source code. Only fix plan/ files.
```

---

## 📊 Quick Reference Card

| Situation | Use Prompt # |
|-----------|-------------|
| প্রথমবার কাজ শুরু | **Prompt 1** |
| Model change / new session | **Prompt 2** |
| Specific phase করাতে | **Prompt 3** |
| শুধু 1টা step করাতে | **Prompt 4** |
| Final verification | **Prompt 5** |
| Error fix | **Prompt 6** |
| নতুন project এর plan বানাতে | **Prompt 7** |
| একসাথে অনেক step | **Prompt 8** |
| ⭐ Raw plan → Task Ledger format | **Prompt 9** |
| ⭐ Document/file থেকে plan | **Prompt 10** |
| ⭐ Existing plan reformat/improve | **Prompt 11** |
