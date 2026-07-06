# @istiyak/agent-sdk

TypeScript SDK for interacting with the Istiyak Agent Daemon. Provides WebSocket-based real-time communication with the local agent daemon, including chat streaming, permission handling, and session management.

## Features

- ✅ **WebSocket Connection**: Real-time bidirectional communication with the agent daemon
- ✅ **Chat Message Streaming**: Stream agent responses chunk-by-chunk
- ✅ **Permission Request Handling**: Handle runtime permission requests from the agent
- ✅ **Session Management**: Manage agent execution sessions
- ✅ **TypeScript Support**: Fully typed API with comprehensive type definitions
- ✅ **Git Integration**: Query git status, logs, and diffs
- ✅ **Command Execution**: Run shell commands in the workspace
- ✅ **Health Checks**: Monitor daemon status and availability

## Installation

```bash
npm install @istiyak/agent-sdk
```

## Quick Start

```typescript
import { Client } from "@istiyak/agent-sdk";

const client = new Client("http://localhost:3001");

// Connect to the daemon
await client.connect();

// Send a chat message with streaming
const response = await client.chat({
  messages: [{ role: "user", content: "Hello, agent!" }],
  onChunk: (chunk) => {
    process.stdout.write(chunk);
  },
  onPermissionRequest: async (reqId, command) => {
    console.log(`Agent requests permission to run: ${command}`);
    return true; // approve or false to deny
  }
});

console.log("\nFull response:", response);

// Disconnect when done
client.disconnect();
```

## API Reference

### Client

The main SDK client for interacting with the agent daemon.

#### Constructor

```typescript
new Client(endpoint?: string)
```

- `endpoint` (optional): Base URL of the daemon. Default: `"http://localhost:3001"`

#### Methods

##### `connect(): Promise<void>`

Explicitly connect to the WebSocket server. Required before using WebSocket-based features.

```typescript
await client.connect();
```

##### `disconnect(): void`

Close the WebSocket connection.

```typescript
client.disconnect();
```

##### `chat(options: ChatOptions): Promise<string>`

Send a chat request to the agent with optional streaming and permission handling.

```typescript
const response = await client.chat({
  messages: [
    { role: "user", content: "Write a function to calculate fibonacci" }
  ],
  provider: "gemini",
  model: "gemini-2.5-flash",
  workspacePath: "/path/to/workspace",
  onChunk: (chunk: string) => {
    console.log(chunk);
  },
  onPermissionRequest: async (reqId: string, command: string) => {
    // Return true to approve, false to deny
    return confirm(`Allow: ${command}?`);
  }
});
```

**ChatOptions:**

```typescript
interface ChatOptions {
  messages: Message[];
  provider?: string;
  model?: string;
  authMethod?: string;
  apiKey?: string;
  serviceAccountPath?: string;
  projectId?: string;
  location?: string;
  workspacePath?: string;
  googleSearchEnabled?: boolean;
  onChunk?: (chunk: string) => void;
  onPermissionRequest?: (reqId: string, command: string) => Promise<boolean>;
}
```

##### `sendTask(task: string, onChunk?: (chunk: string) => void): Promise<string>`

Simplified method to send a single task string to the agent.

```typescript
const response = await client.sendTask("Refactor the auth module", (chunk) => {
  process.stdout.write(chunk);
});
```

##### `isHealthy(): Promise<boolean>`

Check if the daemon is running and healthy.

```typescript
const healthy = await client.isHealthy();
console.log(healthy ? "Daemon is running" : "Daemon is not available");
```

##### `getStats(): Promise<AgentStats>`

Get telemetry stats from the daemon (token usage, costs, etc.).

```typescript
const stats = await client.getStats();
console.log(`Total tokens: ${stats.totalTokens}, Cost: $${stats.cost}`);
```

##### `abort(): Promise<{ success: boolean; message: string }>`

Abort the currently running agent execution.

```typescript
const result = await client.abort();
console.log(result.message);
```

##### `getStatus(): Promise<AgentStatus>`

Check if the agent is currently executing a task.

```typescript
const status = await client.getStatus();
console.log(status.running ? "Agent is busy" : "Agent is idle");
```

##### `runCommand(workspacePath: string, command: string): Promise<CommandResult>`

Execute a shell command in the workspace.

```typescript
const result = await client.runCommand("/path/to/workspace", "npm test");
console.log(result.output);
```

##### `reindex(workspacePath: string): Promise<ReindexResult>`

Reindex the workspace codebase for RAG/memory lookup.

```typescript
const result = await client.reindex("/path/to/workspace");
console.log(result.message);
```

##### `getGitStatus(workspacePath: string): Promise<GitStatus>`

Get the Git status of the workspace repository.

```typescript
const status = await client.getGitStatus("/path/to/workspace");
console.log(`Branch: ${status.branch}`);
console.log(status.raw);
```

##### `getGitLog(workspacePath: string, count?: number): Promise<{ log: string }>`

Get recent Git commit history.

```typescript
const log = await client.getGitLog("/path/to/workspace", 10);
console.log(log.log);
```

##### `getGitDiff(workspacePath: string): Promise<{ diff: string }>`

Get the Git diff of uncommitted changes.

```typescript
const diff = await client.getGitDiff("/path/to/workspace");
console.log(diff.diff);
```

## Type Definitions

### Message

```typescript
interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}
```

### AgentStats

```typescript
interface AgentStats {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
  duration: number;
}
```

### AgentStatus

```typescript
interface AgentStatus {
  running: boolean;
  message: string;
}
```

### GitStatus

```typescript
interface GitStatus {
  initialized: boolean;
  branch: string;
  raw: string;
}
```

### CommandResult

```typescript
interface CommandResult {
  output: string;
  exitCode?: number;
}
```

### ReindexResult

```typescript
interface ReindexResult {
  success: boolean;
  message: string;
}
```

## Advanced Usage

### Custom Permission Handler

```typescript
const client = new Client("http://localhost:3001");
await client.connect();

// Create a sophisticated permission handler
const permissionHandler = async (reqId: string, command: string) => {
  // Auto-approve safe read-only commands
  if (command.startsWith("cat ") || command.startsWith("ls ")) {
    return true;
  }
  
  // Always deny destructive commands
  if (command.includes("rm -rf") || command.includes("sudo")) {
    console.warn(`Denied dangerous command: ${command}`);
    return false;
  }
  
  // Prompt user for everything else
  return await promptUser(`Allow command: ${command}?`);
};

await client.chat({
  messages: [{ role: "user", content: "Analyze the codebase" }],
  onPermissionRequest: permissionHandler
});
```

### Session Management

```typescript
const client = new Client("http://localhost:3001");

// Check daemon health before starting
if (!(await client.isHealthy())) {
  throw new Error("Daemon is not running");
}

// Start a chat session
await client.connect();

const response = await client.chat({
  messages: [{ role: "user", content: "Start a new feature" }],
  onChunk: (chunk) => console.log(chunk)
});

// Check if agent is still running
const status = await client.getStatus();
if (status.running) {
  console.log("Agent is processing...");
}

// Abort if needed
if (userWantsToCancel) {
  await client.abort();
}

// Clean up
client.disconnect();
```

## Examples

### Example 1: Simple Chat

```typescript
import { Client } from "@istiyak/agent-sdk";

async function simpleChat() {
  const client = new Client();
  await client.connect();
  
  const response = await client.chat({
    messages: [{ role: "user", content: "What is TypeScript?" }]
  });
  
  console.log(response);
  client.disconnect();
}

simpleChat();
```

### Example 2: Streaming with Progress

```typescript
import { Client } from "@istiyak/agent-sdk";

async function streamingChat() {
  const client = new Client();
  await client.connect();
  
  console.log("Agent is thinking...\n");
  
  const response = await client.chat({
    messages: [{ role: "user", content: "Explain async/await" }],
    onChunk: (chunk) => {
      process.stdout.write(chunk);
    }
  });
  
  console.log("\n\n--- Stream complete ---");
  client.disconnect();
}

streamingChat();
```

### Example 3: Interactive Permission Handling

```typescript
import { Client } from "@istiyak/agent-sdk";
import readline from "readline";

async function interactiveChat() {
  const client = new Client();
  await client.connect();
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  const askUser = (question: string): Promise<boolean> => {
    return new Promise((resolve) => {
      rl.question(`${question} (y/n): `, (answer) => {
        resolve(answer.toLowerCase() === 'y');
      });
    });
  };
  
  await client.chat({
    messages: [{ role: "user", content: "Set up a new project" }],
    onChunk: (chunk) => process.stdout.write(chunk),
    onPermissionRequest: async (reqId, command) => {
      const approved = await askUser(`Allow command: ${command}?`);
      return approved;
    }
  });
  
  rl.close();
  client.disconnect();
}

interactiveChat();
```

### Example 4: Git Operations

```typescript
import { Client } from "@istiyak/agent-sdk";

async function gitOperations() {
  const client = new Client();
  const workspace = "/path/to/your/repo";
  
  // Get git status
  const status = await client.getGitStatus(workspace);
  console.log(`Current branch: ${status.branch}`);
  console.log(`Git initialized: ${status.initialized}`);
  
  // Get recent commits
  const log = await client.getGitLog(workspace, 5);
  console.log("Recent commits:\n", log.log);
  
  // Get uncommitted changes
  const diff = await client.getGitDiff(workspace);
  console.log("Uncommitted changes:\n", diff.diff);
}

gitOperations();
```

## Requirements

- Node.js >= 18.0.0
- Running Istiyak Agent Daemon on `http://localhost:3001` (or custom endpoint)

## License

MIT

## Related Packages

- `@istiyak/agent-core` - Core agent execution engine
- `@istiyak/database` - Database models and utilities
- `@istiyak/agent-memory` - Vector storage and RAG capabilities
