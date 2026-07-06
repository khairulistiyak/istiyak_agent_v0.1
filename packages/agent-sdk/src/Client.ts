import { Connection } from "./Connection.js";
import type { Message, AgentStats, HealthResponse, AgentStatus, GitStatus, CommandResult, ReindexResult } from "./types.js";

export interface ChatOptions {
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

export class Client {
  private connection: Connection;

  constructor(endpoint: string = "http://localhost:3001") {
    this.connection = new Connection(endpoint);
  }

  /**
   * Connect to the WebSocket server explicitly.
   */
  async connect(): Promise<void> {
    await this.connection.connectWs();
  }

  /**
   * Disconnect from the WebSocket server.
   */
  disconnect(): void {
    this.connection.disconnectWs();
  }

  /**
   * Sends a chat request to the agent daemon with WebSocket streaming support.
   */
  async chat(options: ChatOptions): Promise<string> {
    const payload = {
      messages: options.messages,
      provider: options.provider || "gemini",
      model: options.model || "gemini-2.5-flash",
      authMethod: options.authMethod || "apiKey",
      apiKey: options.apiKey || "",
      serviceAccountPath: options.serviceAccountPath || "",
      projectId: options.projectId || "",
      location: options.location || "global",
      workspacePath: options.workspacePath || "",
      googleSearchEnabled: options.googleSearchEnabled || false,
    };

    // If using fallback stream
    if (!options.onPermissionRequest && options.onChunk) {
      return await this.connection.stream("chat", payload, options.onChunk);
    }

    if (!options.onChunk && !options.onPermissionRequest) {
      return await this.connection.send("chat", payload);
    }

    // Connect WS if not already connected
    await this.connection.connectWs();

    return new Promise((resolve, reject) => {
      let fullText = "";
      
      const messageHandler = async (msg: any) => {
        if (msg.type === "chunk") {
          fullText += msg.payload;
          if (options.onChunk) {
            options.onChunk(msg.payload);
          }
        } else if (msg.type === "permission_request") {
          if (options.onPermissionRequest) {
            try {
              const approved = await options.onPermissionRequest(msg.reqId, msg.command);
              this.connection.sendWs({
                type: "permission_response",
                reqId: msg.reqId,
                approved
              });
            } catch (err) {
              console.error("[SDK] Error in onPermissionRequest", err);
              this.connection.sendWs({
                type: "permission_response",
                reqId: msg.reqId,
                approved: false
              });
            }
          } else {
            // Auto reject if no handler
            this.connection.sendWs({
              type: "permission_response",
              reqId: msg.reqId,
              approved: false
            });
          }
        } else if (msg.type === "done") {
          this.connection.removeWsHandler(messageHandler);
          resolve(fullText);
        } else if (msg.type === "error") {
          this.connection.removeWsHandler(messageHandler);
          reject(new Error(msg.payload));
        }
      };

      this.connection.addWsHandler(messageHandler);

      this.connection.sendWs({
        type: "chat",
        payload
      });
    });
  }

  /**
   * Sends a simple task string to the agent.
   */
  async sendTask(task: string, onChunk?: (chunk: string) => void): Promise<string> {
    return await this.chat({
      messages: [{ role: "user", content: task }],
      onChunk,
    });
  }

  /**
   * Checks if the daemon is healthy and running.
   */
  async isHealthy(): Promise<boolean> {
    try {
      const health = await this.connection.health();
      return health.status === "ok";
    } catch {
      return false;
    }
  }

  /**
   * Gets telemetry stats from the daemon.
   */
  async getStats(): Promise<AgentStats> {
    return await this.connection.send("telemetry/stats", {});
  }

  /**
   * Aborts the currently running agent execution loop.
   */
  async abort(): Promise<{ success: boolean; message: string }> {
    return await this.connection.send("agent/abort", {});
  }

  /**
   * Gets the current status of the agent (whether running or idle).
   */
  async getStatus(): Promise<AgentStatus> {
    return await this.connection.send("agent/status", {}, "GET");
  }

  /**
   * Runs a shell command on the local daemon inside the workspace path.
   */
  async runCommand(workspacePath: string, command: string): Promise<CommandResult> {
    return await this.connection.send("run-command", { workspacePath, command });
  }

  /**
   * Reindexes the workspace codebase for memory/RAG lookup.
   */
  async reindex(workspacePath: string): Promise<ReindexResult> {
    return await this.connection.send("reindex", { workspacePath });
  }

  /**
   * Gets the Git status of the workspace repo.
   */
  async getGitStatus(workspacePath: string): Promise<GitStatus> {
    return await this.connection.send("git/status", { workspacePath }, "GET");
  }

  /**
   * Gets the recent Git log of the workspace repo.
   */
  async getGitLog(workspacePath: string, count: number = 10): Promise<{ log: string }> {
    return await this.connection.send("git/log", { workspacePath, count }, "GET");
  }

  /**
   * Gets the Git diff of uncommitted changes in the workspace repo.
   */
  async getGitDiff(workspacePath: string): Promise<{ diff: string }> {
    return await this.connection.send("git/diff", { workspacePath }, "GET");
  }
}
