import { GoogleGenerativeAI } from "@google/generative-ai";
import { Message } from "@istiyak/shared-types";

export class GeminiProvider {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async streamGenerateContent(
    messages: Message[],
    model: string,
    onChunk?: (text: string) => void,
    retryCount = 0
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error("Gemini API key is missing");
    }
    const genAI = new GoogleGenerativeAI(this.apiKey);
    const targetModel = model || "gemini-2.5-flash";
    const systemMessage = messages.find((m) => m.role === "system");
    const modelInstance = genAI.getGenerativeModel({ 
      model: targetModel,
      systemInstruction: systemMessage?.content 
    });

    const contents = messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => {
        const role = m.role === "assistant" ? "model" : m.role;
        return {
          role,
          parts: [{ text: m.content }],
        };
      });

    try {
      const result = await modelInstance.generateContentStream({ contents });
      let accumulatedText = "";
      for await (const chunk of result.stream) {
        const text = chunk.text();
        accumulatedText += text;
        if (onChunk) onChunk(text);
      }
      return accumulatedText;
    } catch (error: any) {
      if (error.status === 429) {
        if (retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 1000;
          console.warn(`Gemini Rate limit hit. Retrying in ${delay / 1000} seconds...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
          return this.streamGenerateContent(messages, model, onChunk, retryCount + 1);
        } else {
          // Max retries exhausted — throw so AgentRunner can surface the error properly
          // instead of silently returning undefined and causing a ghost response.
          throw new Error(`Gemini rate limit (429) exceeded after 3 retries. Please wait a moment and try again.`);
        }
      }
      throw error;
    }
  }
}
