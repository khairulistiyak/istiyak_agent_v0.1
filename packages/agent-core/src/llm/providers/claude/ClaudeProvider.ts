import { Message } from "@istiyak/shared-types";

export class ClaudeProvider {
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
      throw new Error("Claude API key is missing");
    }
    const targetModel = model || "claude-3-5-sonnet-20241022";
    const apiMessages = messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    const systemMessages = messages.filter((m) => m.role === "system");
    const systemPrompt = systemMessages.map((m) => m.content).join("\n\n");

    const requestBody: any = {
      model: targetModel,
      messages: apiMessages,
      max_tokens: 4096,
      stream: true,
    };

    if (systemPrompt) {
      requestBody.system = systemPrompt;
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      if (response.status === 429 && retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000;
        console.warn(`Claude Rate limit hit. Retrying in ${delay / 1000} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.streamChat(messages, model, onChunk, retryCount + 1);
      }
      const errText = await response.text();
      throw new Error(`Claude API error: ${response.status} ${errText}`);
    }

    if (!response.body) return "";

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let accumulatedText = "";
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      const lastLine = lines.pop();
      buffer = lastLine !== undefined ? lastLine : "";

      for (const line of lines) {
        const cleanLine = line.trim();
        if (!cleanLine.startsWith("data:")) continue;

        const dataStr = cleanLine.substring(5).trim();
        if (dataStr === "[DONE]") continue;

        try {
          const parsed = JSON.parse(dataStr);
          if (parsed.type === "content_block_delta" && parsed.delta?.text) {
            const text = parsed.delta.text;
            accumulatedText += text;
            if (onChunk) onChunk(text);
          }
        } catch (e) {
          // ignore
        }
      }
    }
    return accumulatedText;
  }
}
