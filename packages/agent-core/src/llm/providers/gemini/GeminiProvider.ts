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
    retryCount = 0,
    jsonMode = true
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error("Gemini API key is missing");
    }
    const genAI = new GoogleGenerativeAI(this.apiKey);
    const targetModel = model || "gemini-2.5-flash";
    const systemMessage = messages.find((m) => m.role === "system");

    // Only use JSON mode for agent loop structured output.
    // Chat and Plan modes must respond with plain text so the user sees
    // natural language instead of raw JSON objects.
    if (jsonMode) {
      const jsonModel = genAI.getGenerativeModel({
        model: targetModel,
        systemInstruction: systemMessage?.content,
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.3,
          maxOutputTokens: 65536,
        },
      });
      return await this.doStream(jsonModel, messages, targetModel, onChunk, retryCount, true);
    } else {
      const textModel = genAI.getGenerativeModel({
        model: targetModel,
        systemInstruction: systemMessage?.content,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 65536,
        },
      });
      return await this.doStream(textModel, messages, targetModel, onChunk, retryCount, false);
    }
  }

  private async doStream(
    modelInstance: any,
    messages: Message[],
    targetModel: string,
    onChunk?: (text: string) => void,
    retryCount = 0,
    jsonMode = true
  ): Promise<string> {
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
          const delay = 10000 * Math.pow(2, retryCount); // 10s, 20s, 40s
          console.warn(
            `[GeminiProvider] Rate limit hit. Retry ${retryCount + 1}/3 — waiting ${delay / 1000}s...`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          return this.streamGenerateContent(
            messages,
            targetModel,
            onChunk,
            retryCount + 1,
            jsonMode
          );
        } else {
          // Max retries exhausted — throw so AgentRunner can surface the error properly
          // instead of silently returning undefined and causing a ghost response.
          throw new Error(
            `Gemini rate limit (429) exceeded after 3 retries. Please wait a moment and try again.`
          );
        }
      }
      throw error;
    }
  }
}
