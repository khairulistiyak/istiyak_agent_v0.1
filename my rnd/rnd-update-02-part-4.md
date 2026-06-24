# ISTIYAK AI COMPANION 

## Context Handoff & Technical Blueprint (MVP Edition)

### Part 4 (Sections 11-12)

------------------------------------------------------------------------

# Section 11. Phase 4 - Agent Core (Autonomous Loop)

## Goals
Enable the AI to plan, execute, and verify multi-step modifications automatically in the background using `runner.js`.

## The 40-Step Engine
- **Task Classification:** - *Quick Edit:* Directly modify the file using `ast_edit` or `precise_edit`.
  - *Medium/Large:* Generate a `workspace_plan.md` first, await user approval, and then execute.
- **The Execution Flow:**
  `Analyze Workspace -> Create Plan -> Execute Tool (Write/Edit Files) -> Read Terminal Output -> Fix Errors (Self-Correction) -> Return Done`
- **Memory Compression:** If the task takes too many steps and the history grows too large, the engine automatically compresses the context to save token costs and prevent limits.

------------------------------------------------------------------------

# Section 12. Phase 5 - Basic Authentication & Usage Limits

## Goals
Implement basic user identity, secure backend integration, and cost tracking.

## Backend Architecture
- **Tech Stack:** Node.js v20+, Express, MongoDB.
- **Authentication:** Email + Password login. (OAuth like Google/GitHub can be added later).
- **Security:** JWT (JSON Web Tokens) for secure communication between the Tauri desktop app and the Express backend.

## Usage Tracking
- Connected to `costTracker.js` in the agent core.
- The backend tracks the number of tokens consumed by the user based on the selected AI provider (Gemini, Claude, GPT).
- Implements strict rate limiting to prevent API spamming from the desktop client.