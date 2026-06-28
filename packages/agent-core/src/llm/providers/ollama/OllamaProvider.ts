import { Message } from "@istiyak/shared-types";

export class OllamaProvider {
  async streamChat(messages: Message[], model: string, onChunk?: (text: string) => void): Promise<string> {
    const targetModel = model || "llama3";
    const apiMessages = messages
      .filter((m) => m.role === "system" || m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: targetModel,
        messages: apiMessages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Ollama API error: ${response.status} ${errText}`);
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
        if (!cleanLine) continue;

        try {
          const parsed = JSON.parse(cleanLine);
          const text = parsed.message?.content || "";
          if (text) {
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
