import { Message } from "@istiyak/shared-types";
import { compressHistory } from "../agent/AgentRunner.js";

export class ContextCompressor {
  static compress(messages: Message[]): Message[] {
    return compressHistory(messages);
  }
}
