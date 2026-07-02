import OpenAI from "openai";
import { Message } from "@istiyak/shared-types";

export class OpenAIProvider {
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
      throw new Error("OpenAI API key is missing");
    }
    const openai = new OpenAI({ apiKey: this.apiKey });
    const targetModel = model || "gpt-4o";

    const apiMessages = messages
      .filter((m) => m.role === "user" || m.role === "assistant" || m.role === "system")
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    try {
      const stream = await openai.chat.completions.create({
        model: targetModel,
        messages: apiMessages,
        stream: true,
      });

      let accumulatedText = "";
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || "";
        if (text) {
          accumulatedText += text;
          if (onChunk) onChunk(text);
        }
      }
      return accumulatedText;
    } catch (error: unknown) {
      const httpErr = error as { status?: number; message?: string };
      if (httpErr.status === 429) {
        if (retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 1000;
          console.warn(`OpenAI Rate limit hit. Retrying in ${delay / 1000} seconds...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          return this.streamChat(messages, model, onChunk, retryCount + 1);
        } else {
          // Max retries exhausted — throw so AgentRunner surfaces the error properly
          // instead of silently returning undefined and causing a ghost response.
          throw new Error("OpenAI rate limit (429) exceeded after 3 retries. Please wait a moment and try again.");
        }
      }
      throw error;
    }
  }
}
