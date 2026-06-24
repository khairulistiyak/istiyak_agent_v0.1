# ISTIYAK AI COMPANION 

## Context Handoff & Technical Blueprint (MVP Edition)

### Part 1 (Sections 1-3)

------------------------------------------------------------------------

# Section 1. Project Overview & Vision

## Product Name
ISTIYAK AI Companion[cite: 7]

## Version
0.1.0-MVP[cite: 7]

## Core Vision
A standalone, floating desktop chat application that acts as an autonomous AI software engineer. It works alongside existing IDEs without requiring its own heavy code editor UI[cite: 7]. 

### Primary Goals
- Autonomous software engineering via a background execution engine.
- Floating widget UI (`alwaysOnTop: true`, `decorations: false`, `transparent: true`)[cite: 7].
- Rapid Go-To-Market (MVP approach) focusing on core agent functionality[cite: 7].

------------------------------------------------------------------------

# Section 2. Core Technology Stack

## Desktop Shell
- Tauri (Rust backend bridge)[cite: 7]
- Native filesystem access via Rust[cite: 7]

## Frontend
- React 18[cite: 7]
- Tailwind CSS v3 (Dark Cinematic Theme)[cite: 7]
- Zustand for state management (`settingsStore`, `chatStore`)[cite: 7]
- *Excluded:* Monaco Editor, File Explorer, Terminal panels (to keep it lightweight)[cite: 7].

## Backend Engine
- Node.js v20+[cite: 7]
- Vercel AI SDK[cite: 7]

## Configuration Management
- API keys and provider settings are securely managed dynamically via Tauri Rust local storage (`.istiyak_agent_config.json`)[cite: 7].
- Replaces static `.env` dependencies for user-side configuration[cite: 7].

------------------------------------------------------------------------

# Section 3. Core Architecture (The 3 Modes)

## 1. Entry Point (`agent2.js`)
The gateway for the AI agent supporting three execution modes:
- **UI Mode (`server.js`):** Bootstraps the local API server and Tauri desktop application.
- **Watcher Mode (`watcher.js`):** Runs continuously in the background monitoring the workspace.
- **Terminal Chat (`runner.js`):** Initiates an interactive CLI loop directly in the terminal.