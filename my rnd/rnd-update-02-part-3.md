# ISTIYAK AI COMPANION 

## Context Handoff & Technical Blueprint (MVP Edition)

### Part 3 (Sections 7-10)

------------------------------------------------------------------------

# Section 7. The Lean MVP Phases (Overview)

The startup roadmap is simplified into 6 executable phases[cite: 7]:
1. Foundation & Floating UI Setup[cite: 7]
2. Dynamic AI Integration[cite: 7]
3. File System Service & Tools[cite: 7]
4. Agent Core (Autonomous Loop)[cite: 7]
5. Basic Authentication & Usage Limits[cite: 7]
6. Web Landing Page & Admin Panel[cite: 7]

------------------------------------------------------------------------

# Section 8. Phase 1 - Foundation & Floating UI Setup

## Goals
Initialize the monorepo and create the floating chat interface[cite: 7].

## Execution Checklist
- Initialize Tauri project with React and TypeScript[cite: 7].
- Configure Tailwind CSS with a Dark Cinematic Theme[cite: 7].
- Set Tauri window settings: `alwaysOnTop: true`, `decorations: false`, `transparent: true`[cite: 7].
- Build the Chat UI component (input area, message list)[cite: 7].

------------------------------------------------------------------------

# Section 9. Phase 2 - Dynamic AI Integration

## Goals
Connect the AI brain to the frontend with dynamic configuration[cite: 7].

## Execution Checklist
- Create Rust `load_config` and `save_config` commands[cite: 7].
- Implement `settingsStore` (Zustand) for Provider, Model, and API Key[cite: 7].
- Build a dynamic Settings Modal with relational dropdowns[cite: 7].
- Implement `buildSystemPrompt()`[cite: 7].
- Integrate Vercel AI SDK to handle streaming responses based on the active provider[cite: 7].

------------------------------------------------------------------------

# Section 10. Phase 3 - File System Service & Tools

## Goals
Give the AI the ability to read and write to the local directory[cite: 7].

## Execution Checklist
- Create Rust backend commands for native filesystem access[cite: 7].
- Implement `scan_project`[cite: 7].
- Implement `read_file`[cite: 7].
- Implement `write_file` (overwrites entire file content)[cite: 7].
- Implement `create_directory`[cite: 7].
- Bind these tools to the Vercel AI SDK[cite: 7].