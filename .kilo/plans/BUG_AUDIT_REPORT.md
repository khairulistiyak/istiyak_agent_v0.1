# BUG_AUDIT_REPORT.md — Istiyak AI Companion

## Exhaustive Bug & Error Audit

**Generated:** 2026-07-02  
**Scope:** All 530 source files across 4 apps + 8 packages

---

## 🔴 CRITICAL (Must Fix Immediately)

### CRIT-01: Private Tauri Updater Signing Key Exposed in Git History

| Field | Value |
|-------|-------|
| **File** | `apps/desktop/src-tauri/dev_updater.key` |
| **Type** | Security — Cryptographic key disclosure |
| **Symptom** | Anyone who cloned the repo can sign malicious updates accepted by any release built with this key |
| **Fix** | 1. `git filter-repo` to purge key from history. 2. Generate new key pair via `npm run tauri signer generate`. 3. Update `tauri.conf.json` with new pubkey. 4. Distribute revoking update signed with new key. |
| **Code** | Base64 RSA-encrypted secret key. Recoverable via `git show <old_commit>:apps/desktop/src-tauri/dev_updater.key` |

### CRIT-02: No Content Security Policy (CSP = null)

| Field | Value |
|-------|-------|
| **File** | `apps/desktop/src-tauri/tauri.conf.json:27` |
| **Type** | Security — No script restriction |
| **Symptom** | Any injected script (XSS) runs unrestricted and can invoke Tauri commands including `read_file`/`write_file` which have NO path restrictions |
| **Fix** | Set CSP: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'` |

### CRIT-03: read_file/write_file Tauri Commands Accept Arbitrary Paths

| Field | Value |
|-------|-------|
| **File** | `apps/desktop/src-tauri/src/lib.rs:101-113` |
| **Type** | Security — Path traversal |
| **Symptom** | Frontend can call `invoke('read_file', {path:'/etc/passwd'})` or `invoke('write_file', {path:'~/.ssh/authorized_keys', content:'...'})` — NO validation, NO sandboxing |
| **Fix** | Add path validation: canonicalize path, verify it's under workspace directory or home directory. Reject paths outside workspace. |

### CRIT-04: Arbitrary Command Injection via Sandbox Service

| Field | Value |
|-------|-------|
| **File** | `apps/saas-backend/src/services/sandboxService.ts:53` |
| **Type** | Security — Command injection |
| **Symptom** | `execSync(\`/bin/sh -c "${command}"\`, {cwd: sandboxDir, env: process.env})` — user-supplied command string executed without sanitization. Full `process.env` leaked. |
| **Fix** | Replace `execSync` with `execFile` using a safe argument list. Use a whitelist of allowed commands. Never pass full `process.env`. |

### CRIT-05: Admin Routes Have No Authentication

| Field | Value |
|-------|-------|
| **File** | `apps/saas-backend/src/routes/admin.ts:6` |
| **Type** | Security — Missing auth middleware |
| **Symptom** | `GET /api/admin/users` — anyone can access. No JWT, no API key, no IP restriction. |
| **Fix** | Add `authenticateToken` middleware to admin routes. Add admin role check. |

### CRIT-06: XSS in OAuth Success Page

| Field | Value |
|-------|-------|
| **File** | `apps/saas-backend/src/routes/auth.ts:100` |
| **Type** | Security — Cross-site scripting |
| **Symptom** | Token and email directly interpolated into inline `<script>` block without escaping. `attacker@email.com</script><script>alert(1)</script>` would execute arbitrary JS. |
| **Fix** | Use `encodeURIComponent` for JavaScript string values. Or use a nonce-based CSP. |

### CRIT-07: fetchWithTimeout Recursive Infinite Loop

| Field | Value |
|-------|-------|
| **File** | `apps/desktop/src/hooks/usePolling.ts:26-30` |
| **Type** | Runtime crash — Stack overflow |
| **Symptom** | `fetchWithTimeout` calls `const res = await fetchWithTimeout(url, ...)` — calls ITSELF instead of calling native `fetch()`. Every HTTP request causes infinite recursion → stack overflow crash. |
| **Fix** | Replace `const res = await fetchWithTimeout(url, ...)` → `const res = await fetch(url, { ...options, signal: controller.signal })` |

---

## 🔴 HIGH (Should Fix Before Deployment)

### HIGH-01: Blank CSP + Unrestricted File Access → Complete Sandbox Escape

| Field | Value |
|-------|-------|
| **File** | `apps/desktop/src-tauri/tauri.conf.json:27` + `lib.rs:101` |
| **Description** | CSP null + read_file/write_file without path restrictions + window manipulation permissions. Any XSS in the app (even from markdown rendering) allows reading/writing ANY user file without permission. |

### HIGH-02: Stripe Billing Is a Complete Stub

| Field | Value |
|-------|-------|
| **File** | `apps/saas-backend/src/services/stripeService.ts:2` |
| **Description** | Returns hardcoded `cs_test_session_id` — no Stripe API call. Production deployment will not process payments. |

### HIGH-03: Sandbox Create/Delete Routes Have No Authentication

| Field | Value |
|-------|-------|
| **File** | `apps/saas-backend/src/routes/sandbox.ts:7` |
| **Description** | `POST /sandbox/create` and `POST /sandbox/:id/delete` have NO `authenticateToken` middleware. The sandboxService is a stub, but the execute endpoint (which has auth) has command injection (CRIT-04). |

### HIGH-04: Billing Checkout Route Has No Authentication

| Field | Value |
|-------|-------|
| **File** | `apps/saas-backend/src/routes/billing.ts:6` |
| **Description** | Anyone can initiate checkout sessions (though Stripe service is a stub). |

### HIGH-05: write_file and precise_edit Are Auto-Approved

| Field | Value |
|-------|-------|
| **File** | `packages/agent-core/src/agent/ApprovalManager.ts:47` |
| **Description** | Only `delete_file` and `run_command` are checked. The agent can overwrite ANY file in the workspace without asking. `getApprovalReason()` has messages for write_file (line 97) but `requiresApproval` never returns true for it. |
| **Fix** | Add `write_file` and `precise_edit` to `dangerousFileActions` or add a config option to require approval for all writes. |

### HIGH-06: Admin Block/Unblock Calls Nonexistent Routes

| Field | Value |
|-------|-------|
| **File** | `apps/landing/app/admin/page.tsx:57` |
| **Description** | Calls `PUT /api/admin/user/block` and `PUT /api/admin/user/unblock` — but backend only has `GET /api/admin/users`. These routes return 404. |
| **Fix** | Implement block/unblock routes in backend `routes/admin.ts` with proper auth middleware. |

### HIGH-07: Admin Page Data Type Mismatch

| Field | Value |
|-------|-------|
| **File** | `apps/landing/app/admin/page.tsx:33` |
| **Description** | `setUsers(data)` — `getStats()` returns `{status, activeAgents, totalUsers, uptimeSec}` (object), but `useState<typeof UserType[]>` expects array. Runtime error. |
| **Fix** | Either change backend to return array, or change frontend to handle object response. |

### HIGH-08: CostTracker Double-Counts Session Cost

| Field | Value |
|-------|-------|
| **File** | `packages/agent-core/src/llm/CostTracker.ts:37` + `AgentRunner.ts:330-351` |
| **Description** | `calculateCost()` mutates global `sessionTotalCost += totalCost` on each call. AgentRunner calls it at line 330 (step cost) AND line 346 (total cost check). Line 346 calls `calculateCost()` which ADDS to sessionTotalCost again — step cost is DOUBLE-COUNTED in the global session tracker. |
| **Fix** | Create a non-mutating `calculateStepCost()` variant, or pass `updateGlobal=false` flag. Only update global once per step. |

### HIGH-09: Model Pricing Missing Several Models

| Field | Value |
|-------|-------|
| **File** | `packages/agent-core/src/llm/CostTracker.ts:3` |
| **Description** | `gpt-4o-mini` pricing missing (uses OpenAI fallback `$2.50/$10.00` instead of actual `$0.15/$0.60`). `o3-mini`, `o1-preview`, `o1-mini` not listed. Users overcharged for cheap models. |
| **Fix** | Add exact pricing for all shipped models. |

### HIGH-10: GitHub OAuth Email Fallback Creates Mock Accounts

| Field | Value |
|-------|-------|
| **File** | `apps/saas-backend/src/config/passport.ts:62` |
| **Description** | Fallback email: `${profile.username}@github.mock.com` — unsanitized username could contain injection chars. Mock domain accounts could be hijacked if attacker registers same mock email. |
| **Fix** | Require email from GitHub profile. If unavailable, create random unique email. Never use mock domain. |

### HIGH-11: Agent Settings maxSteps=40 Conflicts with LIMITS.MAX_STEPS=15

| Field | Value |
|-------|-------|
| **File** | `packages/agent-core/src/config/Settings.ts` (maxSteps=40) vs `Limits.ts` (MAX_STEPS=15) |
| **Description** | DEFAULT_SETTINGS.maxSteps = 40, but LIMITS.MAX_STEPS = 15. AgentRunner uses LIMITS.MAX_STEPS. Settings says 40 but runtime uses 15 — misleading. |
| **Fix** | Align both to same value, or make AgentRunner read from settings. |

### HIGH-12: OAuth Password Generated with Math.random()

| Field | Value |
|-------|-------|
| **File** | `apps/saas-backend/src/config/passport.ts:33` |
| **Description** | `Math.random().toString(36).slice(-12)` for OAuth user passwords — not cryptographically secure. |
| **Fix** | Use `crypto.randomBytes(24).toString('hex')` from Node's crypto module. |

---

## 🟡 MEDIUM (Should Fix for Reliability)

### MED-01: OAuth Callback Writes Token to Plaintext File

| Field | Value |
|-------|-------|
| **File** | `apps/local-daemon/src/routes/watcher.js:68` |
| **Type** | Security |
| **Fix** | Use OS keychain (macOS Keychain, Windows Credential Manager) via Tauri plugin. |

### MED-02: Config File Plaintext Secrets

| Field | Value |
|-------|-------|
| **File** | `apps/desktop/src-tauri/src/lib.rs:39,78` |
| **Type** | Security |
| **Fix** | Encrypt `~/.istiyak_agent_config.json` with AES-256-GCM using a key derived from OS keychain. |

### MED-03: In-Memory Rate Limiter Not Horizontally Scalable

| Field | Value |
|-------|-------|
| **File** | `apps/saas-backend/src/middleware/rateLimiter.ts` |
| **Type** | Architecture |
| **Fix** | Use Redis or MongoDB-backed rate limiter. |

### MED-04: No Auth on OAuth Callback Endpoint

| Field | Value |
|-------|-------|
| **File** | `apps/local-daemon/src/routes/watcher.js:67` |
| **Type** | Security |
| **Description** | `POST /api/oauth-callback` writes TOKEN to config file with NO authentication. Anyone on localhost can inject a JWT. |
| **Fix** | Add one-time secret/token validation, or bind to localhost only and add request origin check. |

### MED-05: Sandbox Service Still Uses Sync I/O

| Field | Value |
|-------|-------|
| **File** | `apps/saas-backend/src/services/sandboxService.ts:30,53` |
| **Type** | Performance |
| **Description** | `fs.writeFileSync` and `execSync` block the event loop. |
| **Fix** | Use async `fs.promises` and `exec` from `child_process`. |

### MED-06: Auto-Pilot Auto-Approves All Agent Actions

| Field | Value |
|-------|-------|
| **File** | `apps/local-daemon/src/daemon.js:95` |
| **Type** | Security |
| **Description** | `requestPermission: () => Promise.resolve(true)` — if agent is compromised or misbehaves, destructive file operations execute without user consent. |
| **Fix** | Add configurable approval level. For dangerous commands, still require approval even in auto-pilot. |

### MED-07: ESLint Config Uses ESM Imports in .js File

| Field | Value |
|-------|-------|
| **File** | `eslint.config.js:1` |
| **Type** | Runtime error |
| **Description** | Uses `import` syntax but root `package.json` has no `"type": "module"`. `.js` files are CommonJS by default. Will throw `SyntaxError: Cannot use import statement outside a module`. |
| **Fix** | Rename to `eslint.config.mjs` or add `"type": "module"` to root `package.json`. |

### MED-08: getMessageText Triplicated Across Three Files

| Field | Value |
|-------|-------|
| **File** | `ChatUI.tsx:71`, `MessageBubble.tsx:9`, `MessageList.tsx:17` |
| **Type** | Code quality — DRY violation |
| **Description** | Identical `getMessageText` function defined 3 times. If Vercel AI SDK's UIMessage shape changes, only one will be updated. |
| **Fix** | Extract to shared utility file (e.g., `utils/message.ts`). |

### MED-09: IndexedDB Opens New Connection on Every Operation

| Field | Value |
|-------|-------|
| **File** | `apps/desktop/src/store/index.ts:13-86` |
| **Type** | Performance — Connection leak |
| **Description** | `indexedDB.open("istiyak-db", 1)` called in every `getItem`/`setItem`/`removeItem`. Can hit browser's "maximum number of IDB transactions" limit. |
| **Fix** | Use singleton connection: open once on module init, reuse. |

### MED-10: Full process.env Leaked to Sandbox

| Field | Value |
|-------|-------|
| **File** | `apps/saas-backend/src/services/sandboxService.ts:54` |
| **Type** | Security |
| **Description** | `env: process.env` passes all environment variables (including JWT_SECRET, API keys) to forked sandbox process. |
| **Fix** | Pass only whitelisted env vars (PATH, HOME, NODE_ENV). |

### MED-11: Tool Result JSON.stringify Can Throw

| Field | Value |
|-------|-------|
| **File** | `packages/agent-core/src/agent/AgentRunner.ts:539` |
| **Type** | Runtime error |
| **Description** | `JSON.stringify(rawResult, null, 2)` on cyclic or BigInt objects throws. While unusual for tool results, circular references in objects would crash the agent mid-loop. |
| **Fix** | Wrap in try/catch with safe stringify fallback. |

### MED-12: Missing Tools List in Config But Not Registered

| Field | Value |
|-------|-------|
| **File** | `packages/agent-core/src/config/Tools.ts` vs `src/tools/registry/ToolLoader.ts` |
| **Type** | Functional gap |
| **Description** | Tools.ts lists 40 names but only 32 are registered in ToolLoader. Missing: copy_file, list_directory, search_files, web_search, web_screenshot, git_create_branch. LLM invoking these gets "Tool not found". |
| **Fix** | Either implement and register all 40, or remove unregistered tools from Tools.ts. |

### MED-13: Module-Level CostTracker State Not Thread-Safe

| Field | Value |
|-------|-------|
| **File** | `packages/agent-core/src/llm/CostTracker.ts:3` |
| **Type** | Concurrency |
| **Description** | `sessionTotalCost`, `sessionTotalInput`, `sessionTotalOutput` are module-level vars. Concurrent agent runs in the same process will mix costs. |
| **Fix** | Use instance-based tracking or pass session ID to CostTracker. |

### MED-14: Hex Token Pattern Masks Git SHAs

| Field | Value |
|-------|-------|
| **File** | `packages/agent-core/src/security/SecretMasker.ts:25` |
| **Type** | Functional bug |
| **Description** | Pattern `/\b[a-f0-9]{40,}\b/gi` masks ANY 40+ char hex string including git commit SHAs, UUIDs. Legitimate code content gets masked. |
| **Fix** | Use context-aware detection (check if preceded by common API key env var names, or GitHub token format `ghp_*`). |

### MED-15: SandboxController Has Explicit Transfer-Encoding: chunked

| Field | Value |
|-------|-------|
| **File** | `apps/saas-backend/src/controllers/sandboxController.ts:50` |
| **Type** | HTTP/2 incompatibility |
| **Description** | HTTP/2 forbids `Transfer-Encoding: chunked`. Node's HTTP/2 server will strip this header but it may cause issues with proxies. |
| **Fix** | Remove manual Transfer-Encoding header. Node handles chunked encoding automatically for streaming responses. |

---

## 🟢 LOW (Monitor and Fix When Convenient)

### LOW-01: Deprecated lucide-react Folder Icon Import

| File | `apps/landing/components/Features.tsx:3` |
| Description | Imports `Folder` from lucide-react (deprecated, renamed to `FolderIcon`). |
| Fix | Use `FolderIcon` or `FolderOpenIcon` as appropriate. |

### LOW-02: Workspace List Unused mtime Variable

| File | `apps/desktop/src-tauri/src/lib.rs:304` |
| Description | `mtime` captured in for loop but never used (only folder modification time from directory matters). |

### LOW-03: Enter Key During IME Composition

| File | `apps/desktop/src/components/chat/ChatInput.tsx:58` |
| Description | Enter key sends message even during IME composition (e.g., Chinese/Japanese input). User presses Enter to confirm composition but message sends with partial text. |
| Fix | Add `e.nativeEvent.isComposing` check. |

### LOW-04: Auto-Select Race Condition

| File | `apps/desktop/src/hooks/useWorkspaceDetect.ts:49` |
| Description | `useEffect` runs `detect()` immediately on mount. If `currentPath` is `""` (not yet loaded from settings), it auto-selects first workspace. Then `loadSettings()` resolves and overwrites with `""` (empty). User loses auto-detected path. |
| Fix | Already partially fixed with `hasAutoSelected` ref. Additional guard: wait for settings load before running initial detect. |

### LOW-05: IndexedDB Migration Leaves Old localStorage Entries

| File | `apps/desktop/src/store/index.ts:35-42` |
| Description | Migration removes `localStorage.getItem(name)` entry after copying to IndexedDB. But the Zustand persist key is `"istiyak-companion-global-store"` while settings also use `"companion_config"` — the migration only handles the Zustand key. Old `companion_config` localStorage entries from earlier versions remain orphaned. |

### LOW-06: Tailwind h-4.5 Not a Valid Class

| File | `apps/desktop/src/components/chat/AgentStepList.tsx:13` |
| Description | Tailwind CSS has `h-4` (16px) and `h-5` (20px) but not `h-4.5`. Class does nothing. |
| Fix | Use `h-[18px]` or adjust design to use `h-4` or `h-5`. |

### LOW-07: SummaryEngine.summarize Ignores maxLength Parameter

| File | `packages/agent-core/src/memory/SummaryEngine.ts:21` |
| Description | `summarize(text, maxLength)` accepts maxLength parameter but calls `summarizeAdvanced(text, 5)` which always produces 5 sentences regardless of maxLength. Callers expecting token-aware truncation get overly long summaries. |
| Fix | Either implement maxLength-aware truncation, or remove the parameter to avoid misleading callers. |

### LOW-08: PermissionAlert vs PermissionCard — Both Exist

| File | `apps/desktop/src/components/chat/*` |
| Description | Two permission UI implementations: `PermissionAlert.tsx` (old, full-screen overlay) and `PermissionCard.tsx` (new, in-card). Both are imported and functional. The Alert may still be rendered if uiSlice sets `isPermissionAlertOpen`. |
| Fix | Remove PermissionAlert and clean up uiSlice references to it. |

### LOW-09: ProviderForm Unused

| File | `apps/desktop/src/components/settings/ProviderForm.tsx` |
| Description | Provider configuration form. SettingsDrawer.jsx has the same functionality inline. ProviderForm is imported by SettingsModal.tsx which is a legacy component. Probably dead code. |

### LOW-10: SettingsModal Unused

| File | `apps/desktop/src/components/settings/SettingsModal.tsx` |
| Description | Legacy settings modal, superseded by SettingsDrawer.tsx. No imports found in active components. |

### LOW-11: useTelemetry Hook Generates Fake Random Data

| File | `apps/desktop/src/hooks/useTelemetry.ts` |
| Description | Polls every 5 seconds generating random fake values for latency/speed. Real telemetry data is fetched from daemon in usePolling.ts. This hook appears unused but generates state updates if mounted. |

### LOW-12: useGitStatus Stub Always Returns 'main'

| File | `apps/desktop/src/hooks/useGitStatus.ts` |
| Description | Always returns `branch: 'main'` and `changes: 0`. The real git status is fetched in usePolling.ts via the daemon API. This hook is unused. |

### LOW-13: SVG Marked as Binary File

| File | `packages/agent-core/src/tools/filesystem/ReadFileTool.ts:37` |
| Description | SVGs are in the BINARY_EXTENSIONS list but are actually XML text files. Agent can't read SVG files. Some SVGs contain metadata or inline JS (security concern), but blocking all SVGs is over-broad. |

### LOW-14: initSessionSessionMemory and recallSession Have No Await Guard

| File | `packages/agent-memory/src/index.ts` |
| Description | Session memory initialization and recall return Promises. If these are called without `await` in multiple places, the session state may be loaded after the first message is processed. |

### LOW-15: Webpack chunk size warning at 514KB

| File | `apps/desktop/vite.config.ts` |
| Description | Desktop bundle is 514KB after minification (above 500KB warning threshold). This affects initial load time, especially on slow connections. |
| Fix | Use code splitting with dynamic imports for heavy components (Monaco was 200KB — already removed, remaining weight is React + Zustand + AI SDK + lucide). |

---

## 📊 Summary

| Severity | Count | Key Areas |
|----------|-------|-----------|
| 🔴 CRITICAL | 7 | Security (CSP, file access, signing key, command injection, XSS, auth, infinite recursion) |
| 🔴 HIGH | 12 | Auth gaps, overrides, stubs, cost double-count, model pricing |
| 🟡 MEDIUM | 15 | Security hardening, performance, type safety, missing features |
| 🟢 LOW | 15 | Code quality, dead code, UI polish, edge cases |

**Total: 49 issues identified across 530 source files.**

### Top 5 Fixes by Impact

1. **CRIT-02 + CRIT-03** — Set CSP + restrict file read/write paths (eliminates entire sandbox escape class)
2. **CRIT-07** — Fix `fetchWithTimeout` recursive call (app currently crashes on any HTTP request)
3. **CRIT-04** — Fix sandbox command injection (prevent RCE in production)
4. **CRIT-05** — Add auth to admin routes (stop data exposure)
5. **HIGH-05** — Add write_file/precise_edit to approval gate (prevent accidental file corruption)
