# ⚠️ MANDATORY RULES — যেকোনো Agent/Model এই Rules মানবে

<!--
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║  🧠 এই file টা AUTOMATICALLY load হয় প্রতিটা নতুন session এ।       ║
║  কোনো manual prompt paste করতে হবে না।                               ║
║                                                                      ║
║  এই project এ "Checkpoint-Based Task Ledger" system ব্যবহার হয়।     ║
║  plan/ folder এ সব plan, progress, আর rules tracked আছে।            ║
║                                                                      ║
║  ARCHITECTURE:                                                       ║
║  ┌────────────────────────────────────────────────────────┐          ║
║  │ .agents/AGENTS.md         = WORKFLOW rules (HOW)       │ ← এই file║
║  │ .agents/scripts/ledger.cjs = AUTOMATION CLI (TRACK)     │ ← tool   ║
║  │ plan/RULES.md             = CODE rules (WHAT)          │ ← project║
║  │ plan/PROGRESS.md          = TRACKER (WHERE)            │ ← tracker║
║  │ plan/steps/plan_XX.md     = PLAN (DETAILS)             │ ← detail ║
║  └────────────────────────────────────────────────────────┘          ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
-->

---

## 🔴 STEP 0: কাজ শুরুর আগে — MANDATORY Reading Order

**যেকোনো কাজ করার আগে, নিচের files এই exact order এ পড়ো:**

1. **FIRST** → `plan/PROGRESS.md` পড়ো
   - বুঝো কোন steps DONE ✅ আর কোনটা PENDING 🔴
   - কোন Phase এ আছে project — percentage check করো
   - `👉 NEXT:` marker দেখো — সেটাই তোমার next কাজ
   - যেটা `[ ]` (pending) সেটাই next কাজ

2. **THEN** → `plan/RULES.md` পড়ো
   - Project-specific coding conventions বুঝো
   - Import pattern, styling tokens, component export pattern
   - এই rules হুবহু follow করো — deviation নেই

3. **THEN** → `plan/steps/plan_01.md` পড়ো (শুধু relevant section)
   - Next pending step এর **exact details** পাবে
   - File path, Action, কি করতে হবে, Exact code/props — সব আছে
   - **পুরো file পড়ার দরকার নেই** — শুধু current phase/step section পড়ো

4. **তারপর** কাজ শুরু করো — next incomplete step থেকে

> ⚠️ **NEVER** skip এই reading step। আগে পড়ো, তারপর কাজ।

---

## 📋 কাজ করার Rules

### Rule 1: একটা Step এ একটা কাজ
- **1 step = 1 file** — একটা step শেষ করো, তারপর পরের step
- একসাথে অনেক step করতে যেও না
- Step এর order maintain করো (dependency আছে)
- Dependency hint দেখো: `⚠️ Depends on: Step X.X`

### Rule 2: [AUTOMATED] Start Command দিয়ে কাজ শুরু করো
নতুন স্টেপে কাজ শুরু করার **আগে** CLI start কমান্ড রান করো:
```bash
./l start <step_number>
```
**উদাহরণ:**
```bash
./l start 2.2
```
এই কমান্ডটি রান করলে স্ক্রিপ্ট অটোমেটিক্যালি:
- `plan_01.md` থেকে ফাইল পাথ ও টাইপ রিড করবে।
- অটোমেটিক্যালি ফোল্ডার স্ট্রাকচার এবং ফাইলটি ক্রিয়েট করবে (boilerplate সহ)।
- `PROGRESS.md` ফাইলে স্টেপটিকে `[~]` (In Progress) এ আপডেট করবে।

### Rule 3: [AUTOMATED] PROGRESS.md Update করো CLI দিয়ে
প্রতিটা step complete করার পর **ম্যানুয়ালি PROGRESS.md এডিট করবে না**! আমাদের তৈরি করা অটোমেটেড CLI স্ক্রিপ্টটি রান করো:
```bash
./l c <step_number> "<completion_comment>"
```
**উদাহরণ:**
```bash
./l c 1.1 "TypeScript interfaces created in types/index.ts"
```
এই কমান্ডটি রান করলে স্ক্রিপ্ট অটোমেটিক্যালি:
- **🔒 Auto-Verification Gate**: টার্গেট ফাইলটি exist করে কিনা এবং empty নয় কিনা চেক করবে। ফাইল না থাকলে বা খালি থাকলে ❌ এরর দেখাবে এবং PROGRESS.md এডিট হবে না।
- `plan/PROGRESS.md` ফাইলে স্টেপটি `[x]` মার্ক করবে।
- ফেজ এবং ওভারঅল পার্সেন্টেজ নির্ভুলভাবে ক্যালকুলেট করে আপডেট করবে।
- সঠিক সময় ও এজেন্ট নাম সহ UPDATE LOG যুক্ত করবে।
- `👉 NEXT:` প্রগ্রেসিভ পয়েন্টারটি আপডেট করবে।

### Rule 4: Phase Complete হলে
- Phase এর সব steps `[x]` হলে CLI অটোমেটিক্যালি সেটি ডিটেক্ট করে উইন্ডোতে কনগ্র্যাচুলেশন জানাবে।
- Phase শেষে `npm run dev` বা `npm run build` রান করে নিশ্চিত হও কোনো এরর নেই।

### Rule 5: সব কাজ শেষ হলে
- সব Phase complete হলে → PROGRESS.md এর top header কে change করো:
  ```
  # ✅ TASK COMPLETE ALL
  ```

### Rule 6: Skip/Redo করো না
- ❌ কোনো step skip করো না
- ❌ Already `[x]` marked step আবার করো না
- ❌ Step এর order ভাঙো না
- ✅ শুধু next `[ ]` step থেকে শুরু করো

---

## 🚨 Error Recovery Protocol

### Step Fail হলে কি করবে:

1. **Build/Compile Error** →
   - Error message পড়ো
   - Same step এ fix করো — নতুন step বানিও না
   - Fix হলে এবং ভেরিফাই হলে CLI complete কমান্ড রান করো।

2. **Dependency Missing** →
   - PROGRESS.md check করো — dependency step কি complete?
   - Complete না হলে → আগে dependency step করো।

3. **Unclear Instructions** →
   - plan_01.md তে step details পড়ো — বেশিরভাগ answer সেখানেই আছে
   - তারপরও unclear → user কে জিজ্ঞেস করো, guess করো না

4. **File Already Exists** →
   - Plan এ "Create" বলা কিন্তু file already আছে? → Existing content check করো
   - Content match করলে → CLI complete কমান্ড দিয়ে `[x]` মার্ক করো with note "already exists"
   - Content different → plan এর version দিয়ে overwrite করো

---

## 🧠 Smart Context Management

### Large Plan Handling
- Plan files 500+ lines হলে → **পুরোটা একবারে পড়ো না**
- PROGRESS.md থেকে current phase বুঝে নাও
- plan_01.md থেকে শুধু **সেই phase এর section** পড়ো
- Phase change হলে → নতুন phase section পড়ো

---

## 📊 Communication Protocol

### প্রতিটা step শেষে user কে report করো:

```
✅ Step X.X Complete — [title]
📁 File: [file path]
📝 Action: [what was done]
📊 Progress: [X/total] steps | Phase X: [Y%]
👉 Next: Step X.X — [title]
```

---

## 📁 Plan Files Reference

| File | Role | কখন পড়বে |
|------|------|-----------|
| `plan/PROGRESS.md` | 🔴 Tracker — কি done, কি pending, কোথায় আছি | **সবার আগে, প্রতিবার** |
| `plan/RULES.md` | ⚠️ Code rules — import, styling, naming | **কাজ শুরুর আগে একবার** |
| `plan/steps/plan_01.md` | 📋 Detailed step instructions | **Step এর details জানতে** |
| `plan/SYSTEM_GUIDE.md` | 📖 System guide/documentation | System বুঝতে চাইলে |
| `plan/PROMPTS.md` | 💬 Manual prompt templates | Non-Antigravity tools এ |

---

## ⚡ Quick Decision Table

| Situation | Action |
|-----------|--------|
| নতুন session শুরু | STEP 0 follow করো |
| নতুন Step শুরু করতে চাও | `./l start X.Y` রান করো (boilerplate + [~]) |
| Step শেষ হলো | `./l c X.Y "note"` রান করো (auto-verify + [x]) |
| Phase শেষ হলো | `npm run dev` বা `npm run build` দিয়ে টেস্ট করো |
| Error পেলে | Same step এ fix → validation command রান করো |
| Unclear instruction | plan detail পড়ো → still unclear → user কে জিজ্ঞেস করো |
| সব শেষ | `# ✅ TASK COMPLETE ALL` → `npm run build` final check |

---

*এই rules automatically enforce হবে। কোনো manual prompt দরকার নেই।* ✅
