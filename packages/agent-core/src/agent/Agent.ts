import { AgentState } from "./AgentState.js";
import { MemoryManager } from "./MemoryManager.js";
import { ToolRegistry } from "../tools/registry/ToolRegistry.js";
import { ProviderManager } from "../llm/ProviderManager.js";
import { PermissionManager } from "../security/PermissionManager.js";
import { ApprovalManager } from "./ApprovalManager.js";
import { ToolLoader } from "../tools/registry/ToolLoader.js";

// Providers
import { GeminiProvider } from "../llm/providers/gemini/GeminiProvider.js";
import { VertexProvider } from "../llm/providers/vertex/VertexProvider.js";
import { OpenAIProvider } from "../llm/providers/openai/OpenAIProvider.js";
import { ClaudeProvider } from "../llm/providers/claude/ClaudeProvider.js";
import { OllamaProvider } from "../llm/providers/ollama/OllamaProvider.js";

export class Agent {
  public state: AgentState;
  public memory: MemoryManager;
  public registry: ToolRegistry;
  public providers: ProviderManager;
  public permissions: PermissionManager;
  public approvals: ApprovalManager;
  public workspacePath: string;

  constructor(workspacePath: string) {
    this.workspacePath = workspacePath;
    this.state = new AgentState();
    this.memory = new MemoryManager(workspacePath);
    this.registry = new ToolRegistry();
    this.providers = new ProviderManager();
    this.approvals = new ApprovalManager();
    this.permissions = new PermissionManager(this.approvals);

    // Register all default tools
    ToolLoader.loadAll(this.registry);

    // Register LLM providers
    this.providers.register(new GeminiProvider());
    this.providers.register(new VertexProvider());
    this.providers.register(new OpenAIProvider());
    this.providers.register(new ClaudeProvider());
    this.providers.register(new OllamaProvider());
  }
}

export default Agent;
