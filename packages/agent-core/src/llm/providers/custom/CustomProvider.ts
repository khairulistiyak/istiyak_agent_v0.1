import { Message } from "@istiyak/shared-types";

export interface CustomProviderConfig {
  baseUrl: string;
  apiKey?: string;
  defaultModel?: string;
  headers?: Record<string, string>;
}

/**
 * Custom LLM provider that supports any OpenAI-compatible API endpoint.
 * Users can configure the base URL, API key, and custom headers.
 */
export class CustomProvider {
  private config: CustomProviderConfig;

  constructor(config: CustomProviderConfig) {
    this.config = config;
    // Normalize base URL
    if (this.config.baseUrl.endsWith("/")) {
      this.config.baseUrl = this.config.baseUrl.slice(0, -1);
    }
  }

  async streamChat(
    messages: Message[],
    model: string,
    onChunk?: (text: string) => void,
    retryCount = 0
  ): Promise<string> {
    if (!this.config.baseUrl) {
      throw new Error("Custom provider base URL is not configured. Set the endpoint URL in settings.");
    }

    const targetModel = model || this.config.defaultModel || "default";

    const apiMessages = messages
      .filter(m => m.role === "user" || m.role === "assistant" || m.role === "system")
      .map(m => ({
        role: m.role,
        content: m.content,
      }));

    const body = JSON.stringify({
      model: targetModel,
      messages: apiMessages,
      stream: true,
    });

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...this.config.headers,
    };

    if (this.config.apiKey) {
      headers["Authorization"] = `Bearer ${this.config.apiKey}`;
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
        method: "POST",
        headers,
        body,
      });

      if (!response.ok) {
        if (response.status === 429 && retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 1000;
          console.warn(`[CustomProvider] Rate limit. Retrying in ${delay / 1000}s...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.streamChat(messages, model, onChunk, retryCount + 1);
        }

        const errorBody = await response.text().catch(() => "Unknown error");
        throw new Error(`Custom provider API error ${response.status}: ${errorBody}`);
      }

      if (!response.body) {
        throw new Error("Custom provider returned no response body");
      }

      let accumulatedText = "";
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith("data:")) continue;

          const data = trimmed.slice(5).trim();
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content || "";
            if (content) {
              accumulatedText += content;
              if (onChunk) onChunk(content);
            }
          } catch {
            // Non-streaming fallback: try to read full response
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.message?.content || "";
              if (content) {
                accumulatedText += content;
                if (onChunk) onChunk(content);
              }
            } catch {
              // Skip malformed chunks
            }
          }
        }
      }

      return accumulatedText;
    } catch (error: any) {
      if (retryCount < 3 && (error.message?.includes("ECONNREFUSED") || error.message?.includes("fetch failed"))) {
        const delay = Math.pow(2, retryCount) * 1000;
        console.warn(`[CustomProvider] Connection error. Retrying in ${delay / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.streamChat(messages, model, onChunk, retryCount + 1);
      }
      throw error;
    }
  }
}
