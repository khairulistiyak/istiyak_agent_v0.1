import { Message } from "@istiyak/shared-types";

export class DeepseekProvider {
  async streamChat(messages: Message[], model: string, onChunk?: (text: string) => void): Promise<string> {
    console.log("[DeepseekProvider stub] Called Deepseek streamChat");
    return "";
  }
}
