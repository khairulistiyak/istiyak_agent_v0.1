import { Message } from "@istiyak/shared-types";
import { GeminiProvider } from "./providers/gemini/GeminiProvider.js";
import { OpenAIProvider } from "./providers/openai/OpenAIProvider.js";
import { ClaudeProvider } from "./providers/claude/ClaudeProvider.js";
import { OllamaProvider } from "./providers/ollama/OllamaProvider.js";
import { VertexProvider } from "./providers/vertex/VertexProvider.js";
import { classifyAndRoute } from "./ModelManager.js";

export let mockStreamLLMFn: any = null;

export function setMockStreamLLM(mockFn: any) {
  mockStreamLLMFn = mockFn;
}

export async function streamLLM(
  messages: Message[],
  provider: string,
  model: string,
  authMethod: string,
  apiKey: string,
  serviceAccountPath: string,
  projectId: string,
  location: string,
  onChunk?: (text: string) => void
): Promise<string> {
  if (mockStreamLLMFn) {
    return await mockStreamLLMFn(messages, provider, model, authMethod, apiKey, serviceAccountPath, projectId, location, onChunk);
  }

  let targetModel = model;
  if (model === "auto" || model === "auto-route") {
    const lastUserMsg = messages.filter(m => m.role === "user").slice(-1)[0];
    const content = lastUserMsg ? lastUserMsg.content : "";
    targetModel = classifyAndRoute(content, provider);
    console.log(`[Router] Dynamically routed to model: ${targetModel}`);
  }

  const p = provider.toLowerCase();

  if (p === "gemini") {
    if (authMethod === "serviceAccount") {
      const vertex = new VertexProvider(serviceAccountPath, projectId, location);
      return await vertex.streamGenerate(messages, targetModel, onChunk);
    } else {
      const gemini = new GeminiProvider(apiKey);
      return await gemini.streamGenerateContent(messages, targetModel, onChunk);
    }
  } else if (p === "openai") {
    const openai = new OpenAIProvider(apiKey);
    return await openai.streamChat(messages, targetModel, onChunk);
  } else if (p === "claude" || p === "anthropic") {
    const claude = new ClaudeProvider(apiKey);
    return await claude.streamChat(messages, targetModel, onChunk);
  } else if (p === "ollama") {
    const ollama = new OllamaProvider();
    return await ollama.streamChat(messages, targetModel, onChunk);
  } else {
    throw new Error(`Unsupported provider: ${provider}`);
  }
}
