import { Message } from "@istiyak/shared-types";

export class CustomProvider {
  async streamChat(messages: Message[], model: string, onChunk?: (text: string) => void): Promise<string> {
    console.log("[CustomProvider stub] Called Custom streamChat");
    return "";
  }
}
