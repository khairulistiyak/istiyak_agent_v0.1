# ⚠️ CODE RULES — এই Project এর Coding Conventions

<!--
╔════════════════════════════════════════════════════════════════╗
║  এই file এ project-specific code rules আছে।                  ║
║  AGENTS.md (workflow rules) আর RULES.md (code rules) আলাদা। ║
║  AGENTS.md = কিভাবে কাজ করবে (process)                       ║
║  RULES.md = কিভাবে code লিখবে (conventions)                  ║
╚════════════════════════════════════════════════════════════════╝
-->

---

## 🎯 Project Identity

| Key | Value |
|-----|-------|
| **Project Name** | Companion Chat UI v0.2 |
| **Framework** | React 18 + TypeScript + Vite |
| **Styling** | Tailwind CSS v3 |
| **State Management** | Zustand |
| **Desktop Runtime** | Tauri v2 |
| **Root Path** | `/Volumes/SSD/0.1/istiyak_agent_v0.1/apps/desktop_v0.2` |
| **Source Path** | `<root>/src` |
| **Node Version** | 18+ recommended |

---

## 📦 Import Conventions

### Order (top → bottom)
```typescript
// 1. React / React DOM
import React, { useState, useEffect } from "react";

// 2. External Libraries
import { create } from "zustand";
import { Settings, Plus } from "lucide-react";

// 3. Internal — Types
import { Message, ChatSession } from "../types/index.js";

// 4. Internal — Store
import { useChatStore } from "../store/useChatStore.js";

// 5. Internal — Components
import { GlassButton } from "../components/ui/GlassButton.js";
import { AgentToolBadge } from "../components/library/index.js";
```

### Rules
- ✅ সবসময় **`.js` extension** দাও: `from "./Component.js"`
- ❌ Extension ছাড়া import করো না: ~~`from "./Component"`~~
- ❌ `@/` alias ব্যবহার করো না: ~~`from "@/components/..."`~~

---

## 🎨 Styling Conventions

### Tailwind Custom Tokens
```
bg-cyber-dark          → #08090a (main background)
bg-cyber-card          → #0d0e12 (card background)
border-cyber-card-border → rgba(255,255,255,0.05) (subtle borders)
text-cyber-primary     → rgba(255,255,255,0.95) (bright text)
text-cyber-secondary   → rgba(255,255,255,0.4) (muted text)
text-cyber-text-muted  → #52525b (very muted)
```

### Typography
- Font family: `font-outfit` (primary), fallback: Inter, sans-serif
- Sizes: `text-[9px]`, `text-[10px]`, `text-[11px]`, `text-xs`, `text-sm`
- Labels/badges: `text-[10px] font-bold uppercase tracking-wider`

### Glass Morphism Pattern
```css
/* Glass effect */
bg-white/[0.02]
border border-white/5
backdrop-blur-sm
rounded-lg

/* Glass capsule (custom class) */
.glass-capsule {
  background: rgba(255,255,255,0.02);
  border: 0.75px solid rgba(255,255,255,0.05);
  backdrop-filter: blur(8px);
}
```

### Color Usage
| Element | Color Pattern |
|---------|--------------|
| Background | `bg-cyber-dark` |
| Cards | `bg-cyber-card` or `bg-white/[0.02]` |
| Borders | `border-white/5` or `border-cyber-card-border` |
| Primary text | `text-gray-200` |
| Secondary text | `text-gray-400` |
| Muted text | `text-gray-500` or `text-gray-600` |
| Success | `text-emerald-400`, `bg-emerald-500/10` |
| Warning | `text-yellow-400`, `bg-yellow-500/10` |
| Error | `text-red-400`, `bg-red-500/10` |
| Info | `text-blue-400`, `bg-blue-500/10` |

---

## 🧱 Component Patterns

### Export Pattern
```typescript
// ✅ Named export with React.FC
export const ComponentName: React.FC = () => {
  return <div>...</div>;
};

// ✅ Named export with Props
interface ComponentNameProps {
  title: string;
  status: "active" | "inactive";
}

export const ComponentName: React.FC<ComponentNameProps> = ({ title, status }) => {
  return <div>...</div>;
};
```

### ❌ করো না
```typescript
// ❌ Default export করো না
export default function ComponentName() {}

// ❌ Class components ব্যবহার করো না
class ComponentName extends React.Component {}
```

### File Naming
| Type | Pattern | Example |
|------|---------|---------|
| Component | PascalCase.tsx | `GlassButton.tsx` |
| Store | camelCase.ts | `useChatStore.ts` |
| Types | camelCase.ts | `index.ts` (in types/) |
| Styles | camelCase.css | `index.css` |
| Config | camelCase.js | `tailwind.config.js` |

### Folder Structure
```
src/
├── types/          → TypeScript interfaces only
├── store/          → Zustand stores only
├── components/
│   ├── ui/         → Reusable primitives (Button, Input, Avatar)
│   ├── sidebar/    → Sidebar-related components
│   ├── chat/       → Chat system components
│   ├── settings/   → Settings drawer components
│   └── library/    → Rich UI display components (18 components)
```

---

## 🔒 Safety Rules

1. **কোনো existing code DELETE করো না** — শুধু replace/modify when told
2. **কোনো file rename করো না** — unless explicitly asked
3. **নতুন dependency add করো না** — unless specified in plan
4. **Console.log রাখো না** — production code এ
5. **Any type ব্যবহার করো না** — proper typing করো

---

## ✅ Verification Commands

| When | Command | Expected |
|------|---------|----------|
| Phase শেষে | `npm run dev` | No errors, app loads |
| সব শেষে | `npm run build` | Zero TypeScript/build errors |
| Quick check | `npx tsc --noEmit` | Zero type errors |

---

*এই rules পুরো project জুড়ে maintain করো। কোনো deviation নেই।*
