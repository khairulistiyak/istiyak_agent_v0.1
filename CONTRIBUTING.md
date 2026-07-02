# Contributing

## Prerequisites

- Node.js 20+
- npm

## Setup

```bash
git clone <repo>
npm ci
```

## Development

```bash
# Build all packages
npm run build -w packages/agent-core -w packages/agent-memory -w packages/agent-tools

# Desktop app
npm run tauri dev -w apps/desktop

# SaaS backend
npm run dev -w apps/saas-backend

# Local daemon
npm run start -w apps/local-daemon
```

## Code style

- TypeScript strict mode
- ESLint + Prettier
- No `any` types unless absolutely necessary

## Pull requests

1. Create a feature branch from `main`
2. Make your changes
3. Ensure `npx tsc --noEmit` passes in all packages
4. Open a PR with a clear description

## Project structure

```
packages/
  agent-core/     — Core agent logic, tools, LLM integration
  agent-memory/   — Vector search, embedding, workspace memory
  agent-tools/    — Base tool abstractions
  database/       — Prisma schema
  shared-types/   — Shared TypeScript types

apps/
  desktop/        — Tauri desktop app (React + Vite)
  saas-backend/   — Express SaaS API
  landing/        — Marketing landing page
  local-daemon/   — Background file watcher daemon
```
