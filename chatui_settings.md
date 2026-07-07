# Chat UI Settings Reference

This document summarizes all the settings options available in the Companion Chat UI settings panel (Settings Drawer and Settings Modal).

---

## 🛠️ 1. Model Engine Config

This section controls the underlying Large Language Model (LLM) configuration, api keys, and provider connections.

| Option Name | Target/Supported Value(s) | Description |
| :--- | :--- | :--- |
| **AI Provider** | `Google Gemini`, `OpenAI`, `Anthropic Claude`, `Ollama`, `Custom Provider` | Selects which AI API service provider is used for generation. |
| **Selected Model** | *Based on Provider:*<br>- **Gemini**: `Gemini 2.5 Flash`, `Gemini 2.5 Pro`, `Gemini 2.0 Flash`, `Gemini 1.5 Pro`, `Custom Model`<br>- **OpenAI**: `GPT-4o`, `GPT-4 Turbo`, `Custom Model`<br>- **Claude**: `Claude 3.5 Sonnet`, `Custom Model`<br>- **Ollama**: `Llama 3`, `Mistral`, `Custom Model` | The specific model version to use for completions and reasoning. |
| **Custom Model Name** | *Text Input* | Visible only if "Custom Model" is selected. Enter the model identifier manually. |
| **Authentication** | `API Key`, `Service Account JSON` | Only for Gemini provider. Choose how to authenticate to Google Cloud/Vertex AI. |
| **API Key Value** | *Password field* | The secret API key/token for the selected provider (except Ollama). |
| **Service Account JSON Path** | *Filepath input + Browse Button* | Path to your local GCP service account credentials file (Gemini only). |
| **GCP Project ID** | *Text Input* | Google Cloud Project ID needed for Vertex AI integration. |
| **Vertex Region** | `global`, `us-central1`, `us-east4`, `europe-west4`, `asia-southeast1` | Google Vertex AI service location/region. |

---

## ⚙️ 2. System Preferences & Utilities

This section toggles platform features, sandboxing environment, billing tools, and workspace diagnostics.

* **Enable Google Search:** Toggle switch to activate Google Search web-grounding/search tools during chat.
* **CLI Docker Sandbox:** Toggles whether command executions run inside an isolated local container for safety.
* **Sandbox Container Image:** Specifies the Docker image tag (e.g., `node:20-alpine`) used for local CLI execution.
* **SaaS Cloud Sandbox (Pro):** Toggles a hosted remote sandbox environment (requires active pro license).
* **Telemetry & Cost Dashboard:** Clicking the **OPEN CHART** button launches the dashboard to view metrics and API costs.
* **Marketplace & Plugins:** Clicking the **BROWSE** button opens the panel to browse/install extensions and custom tools.
* **Active Workspace Directory:** Shows the absolute path of the currently open project.
* **Git Branch:** Displays the current active branch name (or `No Repo` if git is not initialized).
* **Session Cost Budget Guard:** Keeps track of API expenditures. Defaults to `$10.00 max` budget warning limit.
* **Reindex Workspace Codebase:** Manual trigger button to re-scan files and rebuild embeddings for code search.
* **Active Account & Logout:** Displays the logged-in email and provides a **LOGOUT** button.
* **Workspace TODO Comments:** Scans and lists all `TODO` comments inside the codebase workspace, allowing you to click them to auto-populate prompt queries.
