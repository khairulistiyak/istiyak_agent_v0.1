# ISTIYAK AI COMPANION 

## Context Handoff & Technical Blueprint (MVP Edition)

### Part 2 (Sections 4-6)

------------------------------------------------------------------------

# Section 4. The Main Engine (`runner.js`)

## Execution Loop
The core of ISTIYAK AGENT relies on a step-by-step self-correction loop.
- **MAX_STEPS:** The agent can execute a continuous loop of up to 40 steps to complete a task.
- **Thought & Action Flow:** 
  1. Inject settings and prompt.
  2. Send history to LLM.
  3. Parse JSON response (`thought`, `action`, `params`).
  4. Execute Action (Tool layer).
  5. Append result to history and loop until action is `done`.

## Memory Management
- **Dynamic Compression:** As the chat history expands, `runner.js` dynamically compresses the payload to preserve token limits and maintain context efficiency.

------------------------------------------------------------------------

# Section 5. LLM Gateway & Analytics

## Dynamic Routing (`llm.js`)
The gateway abstracts the provider APIs and routes requests based on user configuration[cite: 7]:
- Supported: Gemini / Vertex AI, OpenAI (GPT-4o), Claude (Sonnet)[cite: 7, 8].
- **Resilience:** Automatically handles rate limits (e.g., HTTP 429 / Resource Exhausted) by waiting and retrying the request.

## Analytics Tracker (`costTracker.js`)
Monitors agent efficiency in real-time.
- Tracks exact token usage per API call.
- Calculates cost based on the specific provider's pricing model.
- Logs total session duration and outputs analytics to the console.

------------------------------------------------------------------------

# Section 6. Background Watcher & Tools Layer

## Watcher Mode (`watcher.js`)
- **Target:** Monitors JS, TS, Python, C++, and .NET files in the active workspace.
- **Trigger:** Auto-detects `// TODO: <instruction>` comments.
- **Execution:** Generates code via the AI engine and performs in-place replacement of the comment.
- **Safety:** Utilizes dynamic file-locking mechanisms to prevent infinite code-writing loops during save operations.

## Tools Layer (`tools/index.js`)
The agent routes its decisions to specialized tools:
- File Edits (AST/Precise)[cite: 9]
- Command Execution[cite: 9]
- Search & Git operations[cite: 9]