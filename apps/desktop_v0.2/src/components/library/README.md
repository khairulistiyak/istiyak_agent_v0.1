# Staged UI Component Library & Playground

This folder (`src/components/library`) is designed as a staging ground / UI playground for developers and agents working on the Companion UI app.

## ⚠️ Important Rules for Agents & Developers
1. **DO NOT import these components directly into the main Chat UI (`ChatWorkspace`, `InputContainer`, `SidebarContainer`, etc.) unless explicitly commanded by the USER.**
2. This is a testing playground. Keep all staging work localized in `src/components/library` so we can preview variations of the UX without breaking the main workspace.
3. Every UI element in this library follows the strict monochrome minimal rule, using only neutral shades of white, black, and transparent gray, completely avoiding color glows.

## 📦 What is inside:
- **`AgentActions.tsx`**: Features micro-components tailored for future agent iterations:
  - `<AcceptRejectPills>`: Micro-compact pill action button layout (Accept / Reject) matching `07-accept-reject-zen.svg` specifications.
  - `<AgentReadingFile>`: Compact file-reading progress indicator showing filepath and lines.
  - `<AgentWritingDiff>`: Line replacement progress gauge with additions/deletions counts.
  - `<AgentCommandExecution>`: Output buffer display for terminal shell runs.
  - `<Kbd>`: Sleek keycap display for keyboard hotkey shortcuts.
  - `<AgentStepper>`: Timelines to track multi-phase execution (Analyzing -> Planning -> Coding -> Testing).
  - `<AgentDiffViewer>`: Subtle monochrome file difference (+/- additions and deletions) overview with green/red semantic tints.
  - `<FileTreeItem>`: Staging folder/file directories tree item.
  - `<InlineNotification>`: Status banner alert indicators with semantic color accents (Info / Warning / Error).
  - `<AgentSearchStatus>`: Status bar displaying web search and semantic index retrieval.
  - `<AgentToolBadge>`: Sleek indicator displaying which local tool is currently executing.
  - `<StagedTaskList>`: Checkable execution plan task list to monitor agenda items.
  - `<AgentPerformanceStats>`: Speed, latency, and token counters.
  - `<CustomSlider>`: Minimalist monochrome slider control for temperature settings.
  - `<AgentThinkingBlock>`: Collapsible thought process (DeepSeek/Gemini Reasoning style) with a duration timer.
  - `<EditorTabs>`: Tab bar selector showing open/staged files with modified state dots.
  - `<PerformanceBarChart>`: CSS/Tailwind-based bar chart to display cost and token consumption trends.
  - `<ModelSelectorBadge>`: Compact pill selector to toggle target model LLMs (Gemini, Claude) with pulsing status dots.
  - `<TerminalToolbar>`: Action toolbar button group (Play, Pause, Terminate, Clear) to orchestrate running tasks.
  - `<BudgetGauge>`: API usage cost progress bar to alert when approaching monthly budgets.
- **`ComponentLibrary.tsx`**: Staging UI dashboard providing live previews and codebase syntax guides.
