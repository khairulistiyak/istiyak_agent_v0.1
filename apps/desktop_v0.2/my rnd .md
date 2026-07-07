# 🎯 ROLE & OBJECTIVE
You are an Expert Frontend Developer (Next.js, TypeScript, Tailwind CSS, Shadcn UI, Lucide Icons). 
Your task is to build a premium, dark-themed, glassmorphism UI for an AI Agent application. The application has two main views: the **Main Chat UI** and the **Settings Page**.

---

# 📐 1. MAIN UI LAYOUT (Full Screen)
The layout consists of a collapsible Left Sidebar and a Main Workspace.

## 🟢 Component A: Left Navigation (Sidebar)
- **Behavior:** Needs a hide/open toggle icon button.
- **Top Section:** "New Session" button with a plus icon.
- **Middle Section:** A scrollable, responsive list of past chat sessions.
- **Bottom Section:** **Profile & Settings:** A rounded profile image placed next to a Settings icon. *(Keep it minimal and clean)*.

## 🟢 Component B: Main Workspace & Chat Area (flex-1)
- **Chat Display Space:** Full size. Use a clean, floating design.
- **Chat Bubbles:** Distinct styles for User (right-aligned) and Agent (left-aligned) messages. MUST include timestamps for both.
- **Input Box Container (Bottom fixed/floating):**
  - **Mode Selector:** A dropdown with "Plan Mode" and "Agent Mode" (Set "Agent Mode" as default). *Rule: DO NOT include multitasking or voice icons.*
  - **Model Selector:** A dropdown to select the active AI model.
  - **Text Input & Submit:** Clean input area with a send button.

---

# ⚙️ 2. SETTINGS PAGE UI
This page manages the LLM engine, models, and custom providers. Divide this into logical sections using cards or tabs.

## 🟢 Section A: Add / Manage Models (CRUD)
A management table or list with the following fields and actions:
- **Fields:** Name, Base URL, API Key, Model ID, Status (Active/Inactive Toggle).
- **Actions:** Add Model button, Edit button, Delete button.

## 🟢 Section B: Model Engine Config
A configuration form for the underlying LLM connections.
- **AI Provider:** Dropdown (`Google Gemini`, `OpenAI`, `Anthropic Claude`, `Ollama`, `Custom Provider`).
- **Selected Model:** Dynamic dropdown based on the selected provider.
  - *Gemini:* 2.5 Flash, 2.5 Pro, 3.5 Pro, 2.0 Flash, Custom Model
  - *OpenAI:* GPT-4o, GPT-4 Turbo, Custom Model
  - *Claude:* 3.5 Sonnet, Custom Model
  - *Ollama:* Llama 3, Mistral, Custom Model
- **Custom Model Name:** Text input (Visible only if "Custom Model" is selected).
- **Authentication (Gemini Only):** Dropdown (`API Key`, `Service Account JSON`).
- **API Key Value:** Password input field.
- **Service Account JSON Path:** Filepath input with a "Browse" button.
- **GCP Project ID:** Text input for Vertex AI.
- **Vertex Region:** Dropdown (`global`, `us-central1`, `us-east4`, `europe-west4`, `asia-southeast1`).

## 🟢 Section C: Custom Provider Configuration
A dedicated form for setting up a custom AI API provider (e.g., Bynara, OpenRouter).
- **Provider ID:** Text input (Lowercase letters, numbers, hyphens, or underscores).
- **Display Name:** Text input.
- **Provider API (Base URL):** URL input.
- **API Key:** Password input (Optional; leave empty if auth is via headers).
- **Supported Models List:** A dynamic list/table where users can add model capabilities:
  - Model ID (e.g., glm-5.2-plan)
  - Name (Display Name)
  - Reasoning (Boolean Toggle)
- **Custom Headers (Optional):** A dynamic key-value input section for HTTP headers:
  - Header Key (e.g., `Authorization`, `Content-Type`)
  - Value (e.g., `Bearer YOUR_TOKEN`, `application/json`)
  - Action: "Add Header" button.

---
# 🎨 DESIGN RULES
- Use `bg-[#09090b]` for the main background.
- Use `backdrop-blur` and thin borders (`border-white/10`) for a glassmorphism effect.
- Keep inputs pill-shaped or smoothly rounded (`rounded-xl` or `rounded-full`).
- Ensure all dropdowns and inputs have a subtle hover and focus glow/ring.