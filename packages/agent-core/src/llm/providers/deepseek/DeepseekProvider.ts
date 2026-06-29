import { Message } from "@istiyak/shared-types";

const DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1";

/**
 * Deepseek LLM provider using the OpenAI-compatible API.
 * Supports SSE streaming and exponential backoff retry.
 */
export class DeepseekProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async streamChat(
    messages: Message[],
    model: string,
    onChunk?: (text: string) => void,
    retryCount = 0
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error("Deepseek API key is missing. Set DEEPSEEK_API_KEY in settings.");
    }

    const targetModel = model || "deepseek-chat";

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
      max_tokens: 8192,
    });

    try {
      const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`,
        },
        body,
      });

      if (!response.ok) {
        if (response.status === 429 && retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 1000;
          console.warn(`[Deepseek] Rate limit hit. Retrying in ${delay / 1000}s...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return this.streamChat(messages, model, onChunk, retryCount + 1);
        }

        const errorBody = await response.text().catch(() => "Unknown error");
        throw new Error(`Deepseek API error ${response.status}: ${errorBody}`);
      }

      if (!response.body) {
        throw new Error("Deepseek returned no response body");
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
            // Skip malformed SSE chunks
          }
        }
      }

      return accumulatedText;
    } catch (error: any) {
      if (error.message?.includes("rate limit") && retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000;
        console.warn(`[Deepseek] Rate limit. Retrying in ${delay / 1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.streamChat(messages, model, onChunk, retryCount + 1);
      }
      throw error;
    }
  }
}
